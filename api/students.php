<?php
/**
 * StudyCo Education Services - Students Management API
 * StudyCo Education Platform — Student Application Management API
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$agentId = requireAgentAuth();
$pdo = getDbConnection();

$action = isset($_GET['action']) ? trim($_GET['action']) : 'list';
$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents('php://input'), true) ?: $_POST;

try {
    switch ($action) {
        // ======================================================================
        // Action: List Students for Logged-In Agent
        // ======================================================================
        case 'list':
            $statusFilter = isset($_GET['status']) ? trim($_GET['status']) : '';
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';

            $sql = "SELECT s.*, 
                           (SELECT COUNT(*) FROM `student_documents` d WHERE d.student_id = s.id) AS `documents_count`
                    FROM `students` s 
                    WHERE s.agent_id = ?";
            $params = [$agentId];

            if (!empty($statusFilter) && $statusFilter !== 'all') {
                $sql .= " AND s.status = ?";
                $params[] = $statusFilter;
            }

            if (!empty($search)) {
                $sql .= " AND (s.full_name LIKE ? OR s.passport_number LIKE ? OR s.reference_code LIKE ? OR s.target_university LIKE ?)";
                $like = "%{$search}%";
                $params[] = $like;
                $params[] = $like;
                $params[] = $like;
                $params[] = $like;
            }

            $sql .= " ORDER BY s.created_at DESC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $students = $stmt->fetchAll();

            // Calculate Agent Dashboard Statistics
            $statsStmt = $pdo->prepare("
                SELECT 
                    COUNT(*) AS total_students,
                    SUM(CASE WHEN status IN ('submitted', 'under_review') THEN 1 ELSE 0 END) AS in_review,
                    SUM(CASE WHEN status IN ('conditional_offer', 'unconditional_offer') THEN 1 ELSE 0 END) AS accepted,
                    SUM(CASE WHEN status = 'enrolled' THEN 1 ELSE 0 END) AS enrolled,
                    SUM(CASE WHEN status = 'awaiting_payment' THEN 1 ELSE 0 END) AS awaiting_payment
                FROM `students` 
                WHERE agent_id = ?
            ");
            $statsStmt->execute([$agentId]);
            $stats = $statsStmt->fetch() ?: [
                'total_students'   => 0,
                'in_review'        => 0,
                'accepted'         => 0,
                'enrolled'         => 0,
                'awaiting_payment' => 0
            ];

            sendResponse(true, [
                'students' => $students,
                'stats'    => $stats
            ], 'قائمة الطلاب وإحصائيات الوكيل');
            break;

        // ======================================================================
        // Action: Create New Student Record
        // ======================================================================
        case 'create':
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $fullName           = isset($input['full_name']) ? trim($input['full_name']) : '';
            $fullNameAr         = isset($input['full_name_ar']) ? trim($input['full_name_ar']) : '';
            $gender             = isset($input['gender']) && in_array($input['gender'], ['male', 'female']) ? $input['gender'] : 'male';
            $birthDate          = !empty($input['birth_date']) ? trim($input['birth_date']) : null;
            $nationality        = isset($input['nationality']) ? trim($input['nationality']) : '';
            $passportNumber     = isset($input['passport_number']) ? trim(strtoupper($input['passport_number'])) : '';
            $email              = isset($input['email']) ? trim($input['email']) : '';
            $phone              = isset($input['phone']) ? trim($input['phone']) : '';
            $whatsapp           = isset($input['whatsapp']) ? trim($input['whatsapp']) : $phone;
            $destinationCountry = isset($input['destination_country']) ? trim($input['destination_country']) : '';
            $targetUniversity   = isset($input['target_university']) ? trim($input['target_university']) : '';
            $targetProgram      = isset($input['target_program']) ? trim($input['target_program']) : '';
            $degreeLevel        = isset($input['degree_level']) ? trim($input['degree_level']) : '';
            $intakeDate         = isset($input['intake_date']) ? trim($input['intake_date']) : '';
            $agentNotes         = isset($input['agent_notes']) ? trim($input['agent_notes']) : '';

            if (empty($fullName) || empty($passportNumber) || empty($destinationCountry) || empty($targetUniversity) || empty($targetProgram) || empty($degreeLevel)) {
                sendResponse(false, null, 'يرجى استكمال جميع البيانات الأساسية للطالب والجامعة المستهدفة', 400);
            }

            // Generate Unique Reference Code (STU-YYYYMM-XXXX)
            $randomDigits = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
            $referenceCode = 'STU-' . date('Ym') . '-' . $randomDigits;

            $insertSql = "INSERT INTO `students`
                (`agent_id`, `reference_code`, `full_name`, `full_name_ar`, `gender`, `birth_date`, `nationality`, `passport_number`, `email`, `phone`, `whatsapp`, `destination_country`, `target_university`, `target_program`, `degree_level`, `intake_date`, `status`, `agent_notes`, `created_at`)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, NOW())";
            
            $stmt = $pdo->prepare($insertSql);
            $stmt->execute([
                $agentId,
                $referenceCode,
                $fullName,
                $fullNameAr,
                $gender,
                $birthDate,
                $nationality,
                $passportNumber,
                $email,
                $phone,
                $whatsapp,
                $destinationCountry,
                $targetUniversity,
                $targetProgram,
                $degreeLevel,
                $intakeDate,
                $agentNotes
            ]);

            $studentId = (int)$pdo->lastInsertId();

            // Insert initial timeline entry in status_logs
            $logSql = "INSERT INTO `status_logs` (`student_id`, `old_status`, `new_status`, `comment`, `changed_by`, `created_at`)
                       VALUES (?, NULL, 'submitted', 'تم رفع ملف الطالب مبدئياً بانتظار استكمال فحص الأوراق والوثائق', 'agent', NOW())";
            $logStmt = $pdo->prepare($logSql);
            $logStmt->execute([$studentId]);

            sendResponse(true, [
                'student_id'     => $studentId,
                'reference_code' => $referenceCode
            ], 'تم تسجيل الطالب بنجاح! يمكنك الآن إرفاق مستندات الطالب وأوراقه الرسمية.');
            break;

        // ======================================================================
        // Action: Get Single Student with Documents & Pipeline History
        // ======================================================================
        case 'get':
            $studentId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            if ($studentId <= 0) {
                sendResponse(false, null, 'معرف الطالب غير صالح', 400);
            }

            // Ensure student belongs to logged in agent
            $stmt = $pdo->prepare("SELECT * FROM `students` WHERE `id` = ? AND `agent_id` = ? LIMIT 1");
            $stmt->execute([$studentId, $agentId]);
            $student = $stmt->fetch();

            if (!$student) {
                sendResponse(false, null, 'ملف الطالب غير موجود أو غير مصرح لك بالوصول إليه', 404);
            }

            // Fetch attached documents with secure download & preview URLs
            $docStmt = $pdo->prepare("
                SELECT `id`, `doc_type`, `title`, `original_name`, `file_name`, `file_size`, `mime_type`, `uploaded_at` 
                FROM `student_documents` 
                WHERE `student_id` = ? 
                ORDER BY `uploaded_at` ASC
            ");
            $docStmt->execute([$studentId]);
            $rawDocs = $docStmt->fetchAll();

            $documents = array_map(function ($doc) {
                $doc['download_url'] = 'api/download.php?id=' . $doc['id'];
                $doc['preview_url']  = 'api/download.php?id=' . $doc['id'] . '&mode=inline';
                return $doc;
            }, $rawDocs);

            // Fetch pipeline status history
            $logStmt = $pdo->prepare("
                SELECT `id`, `old_status`, `new_status`, `comment`, `changed_by`, `created_at` 
                FROM `status_logs` 
                WHERE `student_id` = ? 
                ORDER BY `created_at` ASC
            ");
            $logStmt->execute([$studentId]);
            $timeline = $logStmt->fetchAll();

            sendResponse(true, [
                'student'   => $student,
                'documents' => $documents,
                'timeline'  => $timeline
            ], 'تفاصيل ملف الطالب');
            break;

        default:
            sendResponse(false, null, 'إجراء غير معروف', 400);
            break;
    }
} catch (Exception $e) {
    error_log("Students API Error: " . $e->getMessage());
    sendResponse(false, null, 'حدث خطأ أثناء معالجة بيانات الطلاب', 500);
}
