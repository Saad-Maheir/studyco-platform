<?php
/**
 * StudyCo Education Services - Secure Document Uploader & Management API
 * StudyCo Education Platform — Document Ingestion & Verification Engine
 * Supports Agent & Admin uploads, multi-file batch, and safe deletion.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$auth = requireAgentOrAdminAuth();
$pdo  = getDbConnection();

$action = isset($_GET['action']) ? trim($_GET['action']) : 'upload';

try {
    // ==========================================================================
    // Action: Delete Document (حذف مستند)
    // ==========================================================================
    if ($action === 'delete') {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $docId = isset($input['doc_id']) ? (int)$input['doc_id'] : (isset($_GET['doc_id']) ? (int)$_GET['doc_id'] : 0);

        if ($docId <= 0) {
            sendResponse(false, null, 'معرف المستند غير صالح', 400);
        }

        // Fetch document and student info
        $stmt = $pdo->prepare("
            SELECT d.*, s.agent_id, s.status AS student_status 
            FROM `student_documents` d
            JOIN `students` s ON s.id = d.student_id
            WHERE d.id = ? 
            LIMIT 1
        ");
        $stmt->execute([$docId]);
        $doc = $stmt->fetch();

        if (!$doc) {
            sendResponse(false, null, 'المستند غير موجود', 404);
        }

        // RBAC Permissions check:
        if ($auth['type'] === 'agent') {
            // Must belong to this agent
            if ((int)$doc['agent_id'] !== $auth['id']) {
                sendResponse(false, null, 'غير مصرح لك بحذف هذا المستند', 403);
            }
            // Agent can only delete if status is submitted or under_review
            if (!in_array($doc['student_status'], ['submitted', 'under_review'])) {
                sendResponse(false, null, 'لا يمكن حذف المستند بعد انتقال الطلب للمراحل المتقدمة', 403);
            }
        }

        // 1. Delete physical file
        $filePath = UPLOAD_DIR . $doc['file_name'];
        if (file_exists($filePath)) {
            @unlink($filePath);
        }

        // 2. Delete database record
        $delStmt = $pdo->prepare("DELETE FROM `student_documents` WHERE `id` = ?");
        $delStmt->execute([$docId]);

        sendResponse(true, ['doc_id' => $docId], 'تم حذف المستند بنجاح');
    }

    // ==========================================================================
    // Action: Upload Document(s) (رفع مستند واحد أو متعدد)
    // ==========================================================================
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
    }

    $studentId = isset($_POST['student_id']) ? (int)$_POST['student_id'] : 0;
    $docType   = isset($_POST['doc_type']) ? trim($_POST['doc_type']) : 'other';
    $title     = isset($_POST['title']) ? trim($_POST['title']) : '';

    if ($studentId <= 0) {
        sendResponse(false, null, 'معرف الطالب غير صالح', 400);
    }

    // Allowed Document Types
    $allowedDocTypes = [
        'passport',
        'transcript',
        'high_school_cert',
        'bachelor_cert',
        'english_cert',
        'personal_photo',
        'recommendation_letter',
        'other'
    ];

    if (!in_array($docType, $allowedDocTypes)) {
        $docType = 'other';
    }

    // Verify student exists & agent authorization
    $chkStudent = $pdo->prepare("SELECT `id`, `agent_id` FROM `students` WHERE `id` = ? LIMIT 1");
    $chkStudent->execute([$studentId]);
    $student = $chkStudent->fetch();

    if (!$student) {
        sendResponse(false, null, 'سجل الطالب غير موجود', 404);
    }

    if ($auth['type'] === 'agent' && (int)$student['agent_id'] !== $auth['id']) {
        sendResponse(false, null, 'غير مصرح لك برفع مستندات لهذا الطالب', 403);
    }

    $agentIdForDoc = ($auth['type'] === 'agent') ? $auth['id'] : (int)$student['agent_id'];

    // Normalize $_FILES into a list
    $filesToProcess = [];
    if (isset($_FILES['document'])) {
        $filesToProcess[] = $_FILES['document'];
    } elseif (isset($_FILES['documents'])) {
        // Multi-file input
        if (is_array($_FILES['documents']['name'])) {
            $count = count($_FILES['documents']['name']);
            for ($i = 0; $i < $count; $i++) {
                if ($_FILES['documents']['error'][$i] === UPLOAD_ERR_OK) {
                    $filesToProcess[] = [
                        'name'     => $_FILES['documents']['name'][$i],
                        'type'     => $_FILES['documents']['type'][$i],
                        'tmp_name' => $_FILES['documents']['tmp_name'][$i],
                        'error'    => $_FILES['documents']['error'][$i],
                        'size'     => $_FILES['documents']['size'][$i]
                    ];
                }
            }
        } else {
            $filesToProcess[] = $_FILES['documents'];
        }
    }

    if (empty($filesToProcess)) {
        sendResponse(false, null, 'لم يتم إرفاق أي ملف أو حدث خطأ أثناء الاستلام', 400);
    }

    // Ensure Upload Directory Exists
    if (!is_dir(UPLOAD_DIR)) {
        @mkdir(UPLOAD_DIR, 0755, true);
    }

    $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
    $allowedMimes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

    $uploadedResults = [];

    foreach ($filesToProcess as $file) {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            continue;
        }

        // 1. File Size check
        if ($file['size'] > MAX_FILE_SIZE) {
            sendResponse(false, null, 'حجم الملف ' . htmlspecialchars($file['name']) . ' يتجاوز الحد الأقصى (15MB)', 400);
        }

        // 2. Extension & dangerous payload checks
        $originalName = basename($file['name']);

        // Prevent double extensions or executable scripts disguised as documents
        if (preg_match('/\.(php|phtml|phar|cgi|pl|py|sh|exe|asp|aspx|js|html|htm)\b/i', $originalName)) {
            sendResponse(false, null, 'اسم الملف يحتوي على امتداد محظور لأسباب أمنية', 400);
        }

        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        if (!in_array($extension, $allowedExtensions)) {
            sendResponse(false, null, 'صيغة الملف ' . htmlspecialchars($originalName) . ' غير مقبولة. المسموح: PDF, JPG, PNG, WEBP', 400);
        }

        // 3. MIME type validation via finfo
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedMimes)) {
            sendResponse(false, null, 'محتوى الملف ' . htmlspecialchars($originalName) . ' غير مطابق للصيغ المسموحة', 400);
        }

        // 4. Secure Storage File Name
        $secureName = 'doc_' . $studentId . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
        $destinationPath = UPLOAD_DIR . $secureName;
        $relativeDbPath  = 'uploads/documents/' . $secureName;

        if (!move_uploaded_file($file['tmp_name'], $destinationPath)) {
            sendResponse(false, null, 'فشل في حفظ الملف على الخادم', 500);
        }
        @chmod($destinationPath, 0644);

        // 5. Insert Database Record
        $stmt = $pdo->prepare("
            INSERT INTO `student_documents` 
            (`student_id`, `agent_id`, `doc_type`, `title`, `original_name`, `file_name`, `file_path`, `file_size`, `mime_type`, `uploaded_at`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $studentId,
            $agentIdForDoc,
            $docType,
            $title ?: $originalName,
            $originalName,
            $secureName,
            $relativeDbPath,
            $file['size'],
            $mimeType
        ]);

        $docId = (int)$pdo->lastInsertId();

        $uploadedResults[] = [
            'document_id'   => $docId,
            'student_id'    => $studentId,
            'doc_type'      => $docType,
            'original_name' => $originalName,
            'file_size'     => $file['size'],
            'download_url'  => 'api/download.php?id=' . $docId,
            'preview_url'   => 'api/download.php?id=' . $docId . '&mode=inline'
        ];
    }

    sendResponse(true, [
        'count'     => count($uploadedResults),
        'documents' => $uploadedResults
    ], 'تم رفع واعتماد المستندات بنجاح!');

} catch (Exception $e) {
    error_log("Upload API Error: " . $e->getMessage());
    sendResponse(false, null, 'حدث خطأ في معالجة المستندات المرفوعة', 500);
}
