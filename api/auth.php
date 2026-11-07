<?php
/**
 * StudyCo Education Services - Agent Authentication API
 * StudyCo Education Platform — B2B Partner Authentication API
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$action = isset($_GET['action']) ? trim($_GET['action']) : '';
$method = $_SERVER['REQUEST_METHOD'];

// Read JSON input payload if available
$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

try {
    $pdo = getDbConnection();

    switch ($action) {
        // ======================================================================
        // Action: Login (تسجيل دخول الوكيل بالبريد أو اسم المستخدم)
        // ======================================================================
        case 'login':
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            // Brute-force protection: Max 5 attempts per 15 minutes
            checkRateLimit('agent_login', 5, 15);

            $loginId  = isset($input['email']) ? trim($input['email']) : (isset($input['username']) ? trim($input['username']) : '');
            $password = isset($input['password']) ? trim($input['password']) : '';

            if (empty($loginId) || empty($password)) {
                sendResponse(false, null, 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور', 400);
            }

            $stmt = $pdo->prepare("SELECT * FROM `agents` WHERE `email` = ? OR `username` = ? LIMIT 1");
            $stmt->execute([$loginId, $loginId]);
            $agent = $stmt->fetch();

            $isPasswordValid = false;
            if ($agent && !empty($agent['password_hash'])) {
                if (password_verify($password, $agent['password_hash'])) {
                    $isPasswordValid = true;
                } elseif ($agent['password_hash'] === $password || $agent['password_hash'] === hash('sha256', $password)) {
                    // Manual phpMyAdmin input detected - accept and auto-upgrade to strong BCRYPT
                    $isPasswordValid = true;
                    try {
                        $upd = $pdo->prepare("UPDATE `agents` SET `password_hash` = ?, `updated_at` = NOW() WHERE `id` = ?");
                        $upd->execute([password_hash($password, PASSWORD_BCRYPT), $agent['id']]);
                    } catch (Exception $e) {}
                }
            }

            if (!$agent || !$isPasswordValid) {
                recordFailedAttempt('agent_login', 15);
                sendResponse(false, null, 'بيانات الدخول أو كلمة المرور غير صحيحة', 401);
            }

            // Successful password: Clear rate limit & regenerate session to prevent session fixation
            clearRateLimit('agent_login');
            session_regenerate_id(true);

            // Check Account Status
            if ($agent['status'] === 'pending') {
                sendResponse(false, [
                    'status' => 'pending'
                ], 'حسابك ما زال قيد المراجعة والاعتماد من إدارة StudyCo. سيتم إرسال بيانات الدخول المعتمدة فور التفعيل.', 403);
            }

            if ($agent['status'] === 'suspended') {
                sendResponse(false, [
                    'status' => 'suspended'
                ], 'هذا الحساب موقوف مؤقتاً. يرجى التواصل مع إدارة StudyCo.', 403);
            }

            if ($agent['status'] === 'rejected') {
                sendResponse(false, [
                    'status' => 'rejected'
                ], 'تم رفض طلب الانضمام. يرجى التواصل مع الإدارة للاستفسار.', 403);
            }

            // Set Session
            $_SESSION['agent_id'] = (int)$agent['id'];
            $_SESSION['agent_name'] = $agent['contact_name'];
            $_SESSION['agency_name'] = $agent['agency_name'];
            $_SESSION['agent_email'] = $agent['email'];

            // Update Last Login
            $update = $pdo->prepare("UPDATE `agents` SET `last_login` = NOW() WHERE `id` = ?");
            $update->execute([$agent['id']]);

            unset($agent['password_hash']);
            sendResponse(true, $agent, 'تم تسجيل الدخول بنجاح! مرحباً بك في بوابة الوكلاء');
            break;

        // ======================================================================
        // Action: Register / Partner Application (طلب انضمام وكيل مع رفع أوراق الشركة)
        // ======================================================================
        case 'register':
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            // Supports both JSON and multipart/form-data ($_POST + $_FILES)
            $source = !empty($_POST) ? $_POST : $input;

            $agencyName   = isset($source['agency_name']) ? trim($source['agency_name']) : '';
            $contactName  = isset($source['contact_name']) ? trim($source['contact_name']) : '';
            $email        = isset($source['email']) ? trim(strtolower($source['email'])) : '';
            $whatsapp     = isset($source['whatsapp']) ? trim($source['whatsapp']) : '';
            $country      = isset($source['country']) ? trim($source['country']) : '';
            $city         = isset($source['city']) ? trim($source['city']) : '';
            $website      = isset($source['website']) ? trim($source['website']) : '';
            $companyBio   = isset($source['company_bio']) ? trim($source['company_bio']) : '';
            $experience   = isset($source['experience_years']) ? trim($source['experience_years']) : '';
            $estStudents  = isset($source['annual_students_est']) ? trim($source['annual_students_est']) : '';

            if (empty($agencyName) || empty($contactName) || empty($email) || empty($whatsapp) || empty($country) || empty($companyBio)) {
                sendResponse(false, null, 'يرجى ملء جميع الحقول الإلزامية المميزة بنجمة بما فيها نبذة عن الشركة', 400);
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                sendResponse(false, null, 'صيغة البريد الإلكتروني غير صالحة', 400);
            }

            // Check if email already registered
            $check = $pdo->prepare("SELECT `id` FROM `agents` WHERE `email` = ? LIMIT 1");
            $check->execute([$email]);
            if ($check->fetch()) {
                sendResponse(false, null, 'هذا البريد الإلكتروني مسجل بالفعل لدى المنصة', 409);
            }

            // Secure File Upload Processor Helper
            $uploadHelper = function ($fieldKey, $prefix) {
                if (!isset($_FILES[$fieldKey]) || $_FILES[$fieldKey]['error'] !== UPLOAD_ERR_OK) {
                    return ['file_name' => null, 'original_name' => null];
                }
                $file = $_FILES[$fieldKey];
                if ($file['size'] > MAX_FILE_SIZE) {
                    sendResponse(false, null, 'حجم الملف يتجاوز الحد الأقصى (15MB)', 400);
                }
                $origName = basename($file['name']);
                if (preg_match('/\.(php|phtml|phar|cgi|pl|py|sh|exe|asp|aspx|js|html|htm)\b/i', $origName)) {
                    sendResponse(false, null, 'اسم الملف يحتوي على امتداد محظور لأسباب أمنية', 400);
                }
                $allowedExts  = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
                $allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
                $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
                if (!in_array($ext, $allowedExts)) {
                    sendResponse(false, null, 'صيغة الملف ' . htmlspecialchars($origName) . ' غير مقبولة (المسموح: PDF, JPG, PNG, WEBP)', 400);
                }
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_file($finfo, $file['tmp_name']);
                finfo_close($finfo);
                if (!in_array($mimeType, $allowedMimes)) {
                    sendResponse(false, null, 'محتوى الملف ' . htmlspecialchars($origName) . ' غير مطابق للصيغ المسموحة', 400);
                }
                if (!is_dir(UPLOAD_DIR)) {
                    @mkdir(UPLOAD_DIR, 0755, true);
                }
                $secName = $prefix . '_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
                $dest = UPLOAD_DIR . $secName;
                if (!move_uploaded_file($file['tmp_name'], $dest)) {
                    sendResponse(false, null, 'فشل في حفظ الملف على الخادم', 500);
                }
                @chmod($dest, 0644);
                return ['file_name' => $secName, 'original_name' => $origName];
            };

            $profileUpload = $uploadHelper('company_profile', 'agent_profile');
            $docsUpload    = $uploadHelper('company_docs', 'agent_docs');

            // Insert new pending agent (password is NULL, username is NULL, waiting for admin approval)
            $sql = "INSERT INTO `agents` 
                    (`agency_name`, `contact_name`, `username`, `email`, `password_hash`, `phone`, `whatsapp`, `country`, `city`, `website`, `company_bio`, `company_profile_file`, `company_profile_name`, `company_docs_file`, `company_docs_name`, `experience_years`, `annual_students_est`, `status`, `created_at`) 
                    VALUES (?, ?, NULL, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $agencyName,
                $contactName,
                $email,
                $whatsapp,
                $whatsapp,
                $country,
                $city,
                $website,
                $companyBio,
                $profileUpload['file_name'],
                $profileUpload['original_name'],
                $docsUpload['file_name'],
                $docsUpload['original_name'],
                $experience,
                $estStudents
            ]);

            $newId = $pdo->lastInsertId();

            sendResponse(true, [
                'id' => (int)$newId,
                'email' => $email,
                'status' => 'pending'
            ], 'تم إرسال طلب الشراكة وأوراق الشركة بنجاح! ستقوم إدارة StudyCo بمراجعة الطلب وإصدار اسم المستخدم وكلمة المرور الخاصة بكم وتزويدكم بها عبر واتساب فور الاعتماد.');
            break;

        // ======================================================================
        // Action: Me / Verify Session (التحقق من حالة الجلسة الحالية)
        // ======================================================================
        case 'me':
            $agentId = requireAgentAuth();
            $stmt = $pdo->prepare("SELECT `id`, `agency_name`, `contact_name`, `email`, `phone`, `whatsapp`, `country`, `city`, `website`, `experience_years`, `status`, `created_at` FROM `agents` WHERE `id` = ? LIMIT 1");
            $stmt->execute([$agentId]);
            $agent = $stmt->fetch();

            if (!$agent) {
                unset($_SESSION['agent_id']);
                sendResponse(false, null, 'الحساب غير موجود', 404);
            }

            sendResponse(true, $agent, 'بيانات الحساب الحالي');
            break;

        // ======================================================================
        // Action: Logout (تسجيل الخروج)
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
            sendResponse(true, null, 'تم تسجيل الخروج بنجاح');
            break;

        default:
            sendResponse(false, null, 'إجراء غير معروف', 400);
            break;
    }
} catch (Exception $e) {
    error_log("Auth API Error: " . $e->getMessage());
    sendResponse(false, null, 'حدث خطأ في معالجة طلب المصادقة', 500);
}

