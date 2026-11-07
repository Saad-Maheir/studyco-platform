<?php
/**
 * StudyCo Education Services - Secure Document Delivery Gateway
 * StudyCo Education Platform — Secure File Transfer & Storage Service
 * Enforces strict role-based access control (RBAC) before streaming files.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$auth = requireAgentOrAdminAuth();
$pdo  = getDbConnection();

$docTypeReq = isset($_GET['type']) ? trim($_GET['type']) : '';
$mode       = (isset($_GET['mode']) && $_GET['mode'] === 'inline') ? 'inline' : 'attachment';

try {
    // -------------------------------------------------------------------------
    // Branch 1: Agent Company Files (بروفايل الشركة أو أوراق الترخيص والسجل)
    // -------------------------------------------------------------------------
    if (in_array($docTypeReq, ['agent_profile', 'agent_docs'])) {
        $targetAgentId = isset($_GET['agent_id']) ? (int)$_GET['agent_id'] : 0;
        if ($targetAgentId <= 0) {
            sendResponse(false, null, 'معرف الوكيل غير صالح', 400);
        }

        // Authorization: Admin or the agent owning the profile
        if ($auth['type'] !== 'admin' && ($auth['type'] === 'agent' && $auth['id'] !== $targetAgentId)) {
            sendResponse(false, null, 'غير مصرح لك بتحميل وثائق هذه الشركة', 403);
        }

        $stmt = $pdo->prepare("SELECT `id`, `agency_name`, `company_profile_file`, `company_profile_name`, `company_docs_file`, `company_docs_name` FROM `agents` WHERE `id` = ? LIMIT 1");
        $stmt->execute([$targetAgentId]);
        $agent = $stmt->fetch();

        if (!$agent) {
            sendResponse(false, null, 'سجل الوكيل غير موجود', 404);
        }

        $isProfile = ($docTypeReq === 'agent_profile');
        $fileName  = $isProfile ? $agent['company_profile_file'] : $agent['company_docs_file'];
        $origName  = $isProfile ? ($agent['company_profile_name'] ?: 'Company_Profile.pdf') : ($agent['company_docs_name'] ?: 'Company_Registration_Docs.pdf');

        if (empty($fileName)) {
            sendResponse(false, null, 'لم يتم إرفاق هذا المستند للوكيل', 404);
        }

        $filePath = UPLOAD_DIR . $fileName;
        if (!file_exists($filePath)) {
            sendResponse(false, null, 'الملف المطلوب غير موجود على الخادم', 404);
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $filePath) ?: 'application/octet-stream';
        finfo_close($finfo);

        while (ob_get_level()) { ob_end_clean(); }

        header('X-Content-Type-Options: nosniff');
        header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox;");
        header('Content-Description: File Transfer');
        header('Content-Type: ' . $mimeType);
        header('Content-Disposition: ' . $mode . '; filename="' . rawurlencode($origName) . '"; filename*=UTF-8\'\'' . rawurlencode($origName));
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: private, must-revalidate');
        header('Pragma: private');
        header('Content-Length: ' . filesize($filePath));

        readfile($filePath);
        exit;
    }

    // -------------------------------------------------------------------------
    // Branch 2: Student Documents (المستندات الأكاديمية وجوازات سفر الطلاب)
    // -------------------------------------------------------------------------
    $docId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($docId <= 0) {
        sendResponse(false, null, 'معرف المستند غير صالح', 400);
    }

    // Role-based retrieval query
    if ($auth['type'] === 'admin') {
        // Admins can access documents for any student
        $stmt = $pdo->prepare("
            SELECT d.*, s.full_name AS student_name, s.agent_id 
            FROM `student_documents` d
            JOIN `students` s ON s.id = d.student_id
            WHERE d.id = ? 
            LIMIT 1
        ");
        $stmt->execute([$docId]);
    } else {
        // Agents can ONLY access documents of their own registered students
        $stmt = $pdo->prepare("
            SELECT d.*, s.full_name AS student_name, s.agent_id 
            FROM `student_documents` d
            JOIN `students` s ON s.id = d.student_id
            WHERE d.id = ? AND s.agent_id = ?
            LIMIT 1
        ");
        $stmt->execute([$docId, $auth['id']]);
    }

    $doc = $stmt->fetch();

    if (!$doc) {
        sendResponse(false, null, 'المستند غير موجود أو غير مصرح لك بالوصول إليه', 404);
    }

    // Determine absolute storage path
    $filePath = UPLOAD_DIR . $doc['file_name'];
    if (!file_exists($filePath)) {
        // Fallback check against relative path
        $altPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $doc['file_path']);
        if (file_exists($altPath)) {
            $filePath = $altPath;
        } else {
            sendResponse(false, null, 'الملف المطلوب غير موجود على الخادم', 404);
        }
    }

    // Sanitize downloaded file name for HTTP Header
    $fileName = preg_replace('/[^\w\.\-\s\x{0600}-\x{06FF}]/u', '_', $doc['original_name']);
    if (empty($fileName)) {
        $fileName = 'document_' . $doc['id'] . '.' . pathinfo($doc['file_name'], PATHINFO_EXTENSION);
    }

    // Clear output buffers
    while (ob_get_level()) {
        ob_end_clean();
    }

    // Safe File Delivery Headers
    header('X-Content-Type-Options: nosniff');
    header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox;");
    header('Content-Description: File Transfer');
    header('Content-Type: ' . ($doc['mime_type'] ?: 'application/octet-stream'));
    header('Content-Disposition: ' . $mode . '; filename="' . rawurlencode($fileName) . '"; filename*=UTF-8\'\'' . rawurlencode($fileName));
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: private, must-revalidate, post-check=0, pre-check=0');
    header('Pragma: private');
    header('Content-Length: ' . filesize($filePath));

    readfile($filePath);
    exit;

} catch (Exception $e) {
    error_log("Document Download Error: " . $e->getMessage());
    sendResponse(false, null, 'حدث خطأ أثناء تحميل المستند', 500);
}

