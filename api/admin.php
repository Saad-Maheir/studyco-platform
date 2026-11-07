<?php
/**
 * StudyCo Education Services - Central Administration API (Super Admin)
 * StudyCo Education Platform — Central Administration API
 * Complete backend endpoints for managing agents, approving accounts, updating student pipelines, and review logs.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$action = isset($_GET['action']) ? trim($_GET['action']) : '';
$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents('php://input'), true) ?: $_POST;

try {
    $pdo = getDbConnection();

    switch ($action) {
        // ======================================================================
        // Action: Admin Login (تسجيل دخول الإدارة)
        // ======================================================================
        case 'login':
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            // Brute-force protection: Max 5 attempts per 15 minutes
            checkRateLimit('admin_login', 5, 15);

            $email    = isset($input['email']) ? trim(strtolower($input['email'])) : '';
            $password = isset($input['password']) ? trim($input['password']) : '';

            if (empty($email) || empty($password)) {
                sendResponse(false, null, 'يرجى إدخال البريد الإلكتروني وكلمة المرور', 400);
            }

            $stmt = $pdo->prepare("SELECT * FROM `admins` WHERE `email` = ? LIMIT 1");
            $stmt->execute([$email]);
            $admin = $stmt->fetch();

            if (!$admin || !password_verify($password, $admin['password_hash'])) {
                recordFailedAttempt('admin_login', 15);
                sendResponse(false, null, 'بيانات الدخول غير صحيحة', 401);
            }

            // Successful password: Clear rate limit & regenerate session to prevent session fixation
            clearRateLimit('admin_login');
            session_regenerate_id(true);

            // Set Admin Session
            $_SESSION['admin_id']    = (int)$admin['id'];
            $_SESSION['admin_name']  = $admin['full_name'];
            $_SESSION['admin_email'] = $admin['email'];
            $_SESSION['admin_role']  = $admin['role'];

            // Update Last Login
            $upd = $pdo->prepare("UPDATE `admins` SET `last_login` = NOW() WHERE `id` = ?");
            $upd->execute([$admin['id']]);

            unset($admin['password_hash']);
            sendResponse(true, $admin, 'تم تسجيل دخول الإدارة بنجاح');
            break;

        // ======================================================================
        // Action: Current Admin Session Info (التحقق من جلسة الأدمن)
        // ======================================================================
        case 'me':
            $adminId = requireAdminAuth();
            $stmt = $pdo->prepare("SELECT `id`, `full_name`, `email`, `role`, `last_login`, `created_at` FROM `admins` WHERE `id` = ? LIMIT 1");
            $stmt->execute([$adminId]);
            $admin = $stmt->fetch();

            if (!$admin) {
                unset($_SESSION['admin_id']);
                sendResponse(false, null, 'الحساب غير موجود', 404);
            }

            sendResponse(true, $admin, 'بيانات جلسة الإدارة الحالية');
            break;

        // ======================================================================
        // Action: Admin Logout (تسجيل خروج الإدارة وتدمير الجلسة بالكامل)
        // ======================================================================
        case 'logout':
            $_SESSION = [];
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }
            session_destroy();
            sendResponse(true, null, 'تم تسجيل خروج الإدارة بنجاح');
            break;

        // ======================================================================
        // Action: Change Admin Password (تغيير كلمة مرور الإدارة وتحديث التشفير)
        // ======================================================================
        case 'change_password':
            $adminId = requireAdminAuth();
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $currentPass = isset($input['current_password']) ? trim($input['current_password']) : '';
            $newPass     = isset($input['new_password']) ? trim($input['new_password']) : '';

            if (empty($currentPass) || empty($newPass)) {
                sendResponse(false, null, 'يرجى إدخال كلمة المرور الحالية وكلمة المرور الجديدة', 400);
            }

            if (strlen($newPass) < 8) {
                sendResponse(false, null, 'كلمة المرور الجديدة يجب أن لا تقل عن 8 خانات', 400);
            }

            $stmt = $pdo->prepare("SELECT `password_hash` FROM `admins` WHERE `id` = ? LIMIT 1");
            $stmt->execute([$adminId]);
            $admin = $stmt->fetch();

            if (!$admin || !password_verify($currentPass, $admin['password_hash'])) {
                sendResponse(false, null, 'كلمة المرور الحالية غير صحيحة', 401);
            }

            $newHash = password_hash($newPass, PASSWORD_BCRYPT);
            $upd = $pdo->prepare("UPDATE `admins` SET `password_hash` = ?, `updated_at` = NOW() WHERE `id` = ?");
            $upd->execute([$newHash, $adminId]);

            sendResponse(true, null, 'تم تغيير كلمة مرور الإدارة وتحديثها بنجاح!');
            break;

        // ======================================================================
        // Action: Dashboard Overview Statistics (إحصائيات المنصة المركزية)
        // ======================================================================
        case 'dashboard_stats':
            requireAdminAuth();

            // Agents stats
            $agentStats = $pdo->query("
                SELECT 
                    COUNT(*) AS total_agents,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_agents,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_agents,
                    SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) AS suspended_agents,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_agents
                FROM `agents`
            ")->fetch() ?: [];

            // Students stats
            $studentStats = $pdo->query("
                SELECT 
                    COUNT(*) AS total_students,
                    SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) AS submitted_students,
                    SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) AS review_students,
                    SUM(CASE WHEN status IN ('conditional_offer', 'unconditional_offer') THEN 1 ELSE 0 END) AS accepted_students,
                    SUM(CASE WHEN status = 'visa_processing' THEN 1 ELSE 0 END) AS visa_students,
                    SUM(CASE WHEN status = 'enrolled' THEN 1 ELSE 0 END) AS enrolled_students,
                    SUM(CASE WHEN status = 'awaiting_payment' THEN 1 ELSE 0 END) AS awaiting_payment_students
                FROM `students`
            ")->fetch() ?: [];

            // Total documents uploaded
            $docsCount = (int)$pdo->query("SELECT COUNT(*) FROM `student_documents`")->fetchColumn();

            sendResponse(true, [
                'agents'    => $agentStats,
                'students'  => $studentStats,
                'documents' => ['total' => $docsCount]
            ], 'إحصائيات لوحة الإدارة المركزية');
            break;

        // ======================================================================
        // Action: List Agents with Filters & Search (إدارة الوكلاء والشركاء)
        // ======================================================================
        case 'list_agents':
            requireAdminAuth();

            $status = isset($_GET['status']) ? trim($_GET['status']) : '';
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';

            $sql = "
                SELECT a.`id`, a.`agency_name`, a.`contact_name`, a.`username`, a.`email`, a.`phone`, a.`whatsapp`, 
                       a.`country`, a.`city`, a.`website`, a.`company_bio`,
                       a.`company_profile_file`, a.`company_profile_name`,
                       a.`company_docs_file`, a.`company_docs_name`,
                       a.`experience_years`, a.`annual_students_est`, 
                       a.`status`, a.`admin_notes`, a.`last_login`, a.`created_at`, a.`updated_at`,
                       (SELECT COUNT(*) FROM `students` s WHERE s.agent_id = a.id) AS students_count
                FROM `agents` a
                WHERE 1=1
            ";
            $params = [];

            if (!empty($status) && $status !== 'all') {
                $sql .= " AND a.`status` = ?";
                $params[] = $status;
            }

            if (!empty($search)) {
                $sql .= " AND (a.`agency_name` LIKE ? OR a.`contact_name` LIKE ? OR a.`username` LIKE ? OR a.`email` LIKE ? OR a.`whatsapp` LIKE ? OR a.`country` LIKE ?)";
                $like = "%{$search}%";
                $params = array_merge($params, [$like, $like, $like, $like, $like, $like]);
            }

            $sql .= " ORDER BY (a.`status` = 'pending') DESC, a.`created_at` DESC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $rawAgents = $stmt->fetchAll();

            $agents = array_map(function ($ag) {
                $ag['profile_download_url'] = !empty($ag['company_profile_file']) ? 'api/download.php?type=agent_profile&agent_id=' . $ag['id'] : null;
                $ag['profile_preview_url']  = !empty($ag['company_profile_file']) ? 'api/download.php?type=agent_profile&mode=inline&agent_id=' . $ag['id'] : null;
                $ag['docs_download_url']    = !empty($ag['company_docs_file']) ? 'api/download.php?type=agent_docs&agent_id=' . $ag['id'] : null;
                $ag['docs_preview_url']     = !empty($ag['company_docs_file']) ? 'api/download.php?type=agent_docs&mode=inline&agent_id=' . $ag['id'] : null;
                return $ag;
            }, $rawAgents);

            sendResponse(true, [
                'total'  => count($agents),
                'agents' => $agents
            ], 'قائمة وكلاء المنصة');
            break;

        // ======================================================================
        // Action: Get Single Agent Full Details
        // ======================================================================
        case 'get_agent':
            requireAdminAuth();
            $agentId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            if ($agentId <= 0) {
                sendResponse(false, null, 'معرف الوكيل غير صالح', 400);
            }

            $stmt = $pdo->prepare("
                SELECT a.`id`, a.`agency_name`, a.`contact_name`, a.`username`, a.`email`, a.`phone`, a.`whatsapp`, 
                       a.`country`, a.`city`, a.`website`, a.`company_bio`,
                       a.`company_profile_file`, a.`company_profile_name`,
                       a.`company_docs_file`, a.`company_docs_name`,
                       a.`experience_years`, a.`annual_students_est`, 
                       a.`status`, a.`admin_notes`, a.`last_login`, a.`created_at`, a.`updated_at`,
                       (SELECT COUNT(*) FROM `students` s WHERE s.agent_id = a.id) AS students_count
                FROM `agents` a
                WHERE a.id = ? LIMIT 1
            ");
            $stmt->execute([$agentId]);
            $agent = $stmt->fetch();

            if (!$agent) {
                sendResponse(false, null, 'الوكيل غير موجود', 404);
            }

            $agent['profile_download_url'] = !empty($agent['company_profile_file']) ? 'api/download.php?type=agent_profile&agent_id=' . $agent['id'] : null;
            $agent['profile_preview_url']  = !empty($agent['company_profile_file']) ? 'api/download.php?type=agent_profile&mode=inline&agent_id=' . $agent['id'] : null;
            $agent['docs_download_url']    = !empty($agent['company_docs_file']) ? 'api/download.php?type=agent_docs&agent_id=' . $agent['id'] : null;
            $agent['docs_preview_url']     = !empty($agent['company_docs_file']) ? 'api/download.php?type=agent_docs&mode=inline&agent_id=' . $agent['id'] : null;

            sendResponse(true, $agent, 'بيانات الوكيل الكاملة');
            break;

        // ======================================================================
        // Action: Update Agent Status, Issue Username & Password Upon Approval
        // ======================================================================
        case 'update_agent_status':
            requireAdminAuth();
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $agentId          = isset($input['agent_id']) ? (int)$input['agent_id'] : 0;
            $newStatus        = isset($input['status']) ? trim($input['status']) : '';
            $adminNotes       = isset($input['admin_notes']) ? trim($input['admin_notes']) : null;
            $assignedUsername = isset($input['username']) ? trim($input['username']) : null;
            $assignedPassword = isset($input['assigned_password']) ? trim($input['assigned_password']) : null;

            $allowedStatuses = ['pending', 'active', 'suspended', 'rejected'];
            if ($agentId <= 0 || !in_array($newStatus, $allowedStatuses)) {
                sendResponse(false, null, 'بيانات تحديث الوكيل غير صالحة', 400);
            }

            $stmt = $pdo->prepare("SELECT `id`, `agency_name`, `contact_name`, `email`, `whatsapp`, `username`, `status` FROM `agents` WHERE `id` = ? LIMIT 1");
            $stmt->execute([$agentId]);
            $agent = $stmt->fetch();

            if (!$agent) {
                sendResponse(false, null, 'الوكيل غير موجود', 404);
            }

            // Check username uniqueness if provided and changed
            if (!empty($assignedUsername) && $assignedUsername !== $agent['username']) {
                $chkUser = $pdo->prepare("SELECT `id` FROM `agents` WHERE (`username` = ? OR `email` = ?) AND `id` != ? LIMIT 1");
                $chkUser->execute([$assignedUsername, $assignedUsername, $agentId]);
                if ($chkUser->fetch()) {
                    sendResponse(false, null, 'اسم المستخدم المختار مستخدم بالفعل لوكيل آخر', 409);
                }
            }

            // Build dynamic update query
            $fields = ["`status` = ?"];
            $params = [$newStatus];

            if ($adminNotes !== null) {
                $fields[] = "`admin_notes` = ?";
                $params[] = $adminNotes;
            }

            if (!empty($assignedUsername)) {
                $fields[] = "`username` = ?";
                $params[] = $assignedUsername;
            }

            if (!empty($assignedPassword)) {
                $newHash = password_hash($assignedPassword, PASSWORD_BCRYPT);
                $fields[] = "`password_hash` = ?";
                $params[] = $newHash;
            }

            $params[] = $agentId;
            $updSql = "UPDATE `agents` SET " . implode(', ', $fields) . ", `updated_at` = NOW() WHERE `id` = ?";
            $upd = $pdo->prepare($updSql);
            $upd->execute($params);

            $finalUsername = !empty($assignedUsername) ? $assignedUsername : ($agent['username'] ?: $agent['email']);

            sendResponse(true, [
                'agent_id'          => $agentId,
                'agency_name'       => $agent['agency_name'],
                'contact_name'      => $agent['contact_name'],
                'email'             => $agent['email'],
                'whatsapp'          => $agent['whatsapp'],
                'username'          => $finalUsername,
                'assigned_password' => $assignedPassword,
                'old_status'        => $agent['status'],
                'new_status'        => $newStatus
            ], "تم تحديث حالة حساب الوكيل ({$agent['agency_name']}) وتعيين بيانات الدخول بنجاح!");
            break;

        // ======================================================================
        // Action: Create Agent Directly from Admin Console
        // ======================================================================
        case 'create_agent':
            requireAdminAuth();
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $agencyName  = isset($input['agency_name']) ? trim($input['agency_name']) : '';
            $contactName = isset($input['contact_name']) ? trim($input['contact_name']) : '';
            $username    = isset($input['username']) ? trim($input['username']) : '';
            $email       = isset($input['email']) ? trim(strtolower($input['email'])) : '';
            $password    = isset($input['password']) ? trim($input['password']) : '';
            $whatsapp    = isset($input['whatsapp']) ? trim($input['whatsapp']) : '';
            $country     = isset($input['country']) ? trim($input['country']) : '';
            $city        = isset($input['city']) ? trim($input['city']) : '';
            $website     = isset($input['website']) ? trim($input['website']) : '';
            $companyBio  = isset($input['company_bio']) ? trim($input['company_bio']) : '';
            $experience  = isset($input['experience_years']) ? trim($input['experience_years']) : '3-5 years';
            $estStudents = isset($input['annual_students_est']) ? trim($input['annual_students_est']) : '25-50';

            if (empty($agencyName) || empty($contactName) || empty($email) || empty($password) || empty($whatsapp) || empty($country)) {
                sendResponse(false, null, 'يرجى ملء جميع الحقول الإلزامية لإنشاء حساب الوكيل', 400);
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                sendResponse(false, null, 'صيغة البريد الإلكتروني غير صالحة', 400);
            }

            // Check email or username uniqueness
            $chk = $pdo->prepare("SELECT `id` FROM `agents` WHERE `email` = ? OR (`username` IS NOT NULL AND `username` = ?) LIMIT 1");
            $chk->execute([$email, $username]);
            if ($chk->fetch()) {
                sendResponse(false, null, 'البريد الإلكتروني أو اسم المستخدم مسجل بالفعل', 409);
            }

            $passHash = password_hash($password, PASSWORD_BCRYPT);

            $ins = $pdo->prepare("
                INSERT INTO `agents` 
                (`agency_name`, `contact_name`, `username`, `email`, `password_hash`, `phone`, `whatsapp`, `country`, `city`, `website`, `company_bio`, `experience_years`, `annual_students_est`, `status`, `created_at`)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
            ");
            $ins->execute([
                $agencyName,
                $contactName,
                !empty($username) ? $username : null,
                $email,
                $passHash,
                $whatsapp,
                $whatsapp,
                $country,
                $city,
                $website,
                $companyBio,
                $experience,
                $estStudents
            ]);

            $newAgentId = (int)$pdo->lastInsertId();

            sendResponse(true, [
                'id'          => $newAgentId,
                'agency_name' => $agencyName,
                'username'    => $username ?: $email,
                'email'       => $email,
                'status'      => 'active'
            ], 'تم إنشاء وتفعيل حساب الوكيل بنجاح من قبل الإدارة!');
            break;

        // ======================================================================
        // Action: List All Students across All Agents (إدارة جميع الطلاب)
        // ======================================================================
        case 'list_students':
            requireAdminAuth();

            $statusFilter = isset($_GET['status']) ? trim($_GET['status']) : '';
            $agentFilter  = isset($_GET['agent_id']) ? (int)$_GET['agent_id'] : 0;
            $country      = isset($_GET['destination']) ? trim($_GET['destination']) : '';
            $search       = isset($_GET['search']) ? trim($_GET['search']) : '';

            $sql = "
                SELECT s.*, 
                       a.`agency_name`, a.`contact_name` AS `agent_name`, a.`whatsapp` AS `agent_whatsapp`, a.`email` AS `agent_email`,
                       (SELECT COUNT(*) FROM `student_documents` d WHERE d.student_id = s.id) AS `documents_count`
                FROM `students` s
                JOIN `agents` a ON a.id = s.agent_id
                WHERE 1=1
            ";
            $params = [];

            if (!empty($statusFilter) && $statusFilter !== 'all') {
                $sql .= " AND s.status = ?";
                $params[] = $statusFilter;
            }

            if ($agentFilter > 0) {
                $sql .= " AND s.agent_id = ?";
                $params[] = $agentFilter;
            }

            if (!empty($country)) {
                $sql .= " AND s.destination_country = ?";
                $params[] = $country;
            }

            if (!empty($search)) {
                $sql .= " AND (s.full_name LIKE ? OR s.passport_number LIKE ? OR s.reference_code LIKE ? OR s.target_university LIKE ? OR a.agency_name LIKE ?)";
                $like = "%{$search}%";
                $params = array_merge($params, [$like, $like, $like, $like, $like]);
            }

            $sql .= " ORDER BY s.created_at DESC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $students = $stmt->fetchAll();

            sendResponse(true, [
                'total'    => count($students),
                'students' => $students
            ], 'قائمة الطلاب المركزية');
            break;

        // ======================================================================
        // Action: Get Single Student with Full Details, Documents, Timeline
        // ======================================================================
        case 'get_student':
            requireAdminAuth();

            $studentId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            if ($studentId <= 0) {
                sendResponse(false, null, 'معرف الطالب غير صالح', 400);
            }

            // Student + Agent info
            $stmt = $pdo->prepare("
                SELECT s.*, 
                       a.`agency_name`, a.`contact_name` AS `agent_name`, a.`email` AS `agent_email`, a.`whatsapp` AS `agent_whatsapp`, a.`country` AS `agent_country`
                FROM `students` s
                JOIN `agents` a ON a.id = s.agent_id
                WHERE s.id = ? 
                LIMIT 1
            ");
            $stmt->execute([$studentId]);
            $student = $stmt->fetch();

            if (!$student) {
                sendResponse(false, null, 'سجل الطالب غير موجود', 404);
            }

            // Attached documents with download/preview links
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

            // Audit Timeline History
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
            ], 'تفاصيل ملف الطالب الكاملة للإدارة');
            break;

        // ======================================================================
        // Action: Update Student Status, Feedback, & Append Audit Timeline
        // ======================================================================
        case 'update_student_status':
            requireAdminAuth();
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $studentId     = isset($input['student_id']) ? (int)$input['student_id'] : 0;
            $newStatus     = isset($input['status']) ? trim($input['status']) : '';
            $adminFeedback = isset($input['admin_feedback']) ? trim($input['admin_feedback']) : null;
            $comment       = isset($input['comment']) ? trim($input['comment']) : '';

            $allowedStatuses = [
                'submitted',
                'under_review',
                'conditional_offer',
                'unconditional_offer',
                'awaiting_payment',
                'visa_processing',
                'enrolled',
                'rejected',
                'cancelled'
            ];

            if ($studentId <= 0 || !in_array($newStatus, $allowedStatuses)) {
                sendResponse(false, null, 'بيانات تحديث حالة الطالب غير صالحة', 400);
            }

            $stmt = $pdo->prepare("SELECT `id`, `reference_code`, `full_name`, `status` FROM `students` WHERE `id` = ? LIMIT 1");
            $stmt->execute([$studentId]);
            $student = $stmt->fetch();

            if (!$student) {
                sendResponse(false, null, 'سجل الطالب غير موجود', 404);
            }

            $oldStatus = $student['status'];

            // Update student record
            if ($adminFeedback !== null) {
                $upd = $pdo->prepare("UPDATE `students` SET `status` = ?, `admin_feedback` = ? WHERE `id` = ?");
                $upd->execute([$newStatus, $adminFeedback, $studentId]);
            } else {
                $upd = $pdo->prepare("UPDATE `students` SET `status` = ? WHERE `id` = ?");
                $upd->execute([$newStatus, $studentId]);
            }

            // Always insert audit log if status changed or a comment is provided
            if ($oldStatus !== $newStatus || !empty($comment)) {
                $logComment = !empty($comment) ? $comment : ("تم تحديث حالة الملف من " . $oldStatus . " إلى " . $newStatus);
                $logStmt = $pdo->prepare("
                    INSERT INTO `status_logs` (`student_id`, `old_status`, `new_status`, `comment`, `changed_by`, `created_at`)
                    VALUES (?, ?, ?, ?, 'admin', NOW())
                ");
                $logStmt->execute([$studentId, $oldStatus, $newStatus, $logComment]);
            }

            sendResponse(true, [
                'student_id'     => $studentId,
                'reference_code' => $student['reference_code'],
                'old_status'     => $oldStatus,
                'new_status'     => $newStatus,
                'admin_feedback' => $adminFeedback
            ], "تم تحديث حالة ملف الطالب ({$student['full_name']}) وتوثيقها في السجل الزمني بنجاح!");
            break;

        default:
            sendResponse(false, null, 'إجراء غير معروف للإدارة', 400);
            break;
    }
} catch (Exception $e) {
    error_log("Admin API Error: " . $e->getMessage());
    sendResponse(false, null, 'حدث خطأ في معالجة طلب الإدارة. يرجى مراجعة سجلات النظام.', 500);
}

