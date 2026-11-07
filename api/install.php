<?php
/**
 * StudyCo Education Services - Database Automated Secure Installer
 * StudyCo Education Platform — Database Automated Installation & Verification Module
 * Executes schema.sql and programmatically provisions production schemas and verified institutional accounts.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

// Security Gate & Production Lock: Installer disabled permanently after verified deployment
sendResponse(false, null, 'معالج التثبيت معطل لأسباب أمنية: تم تثبيت منظومة قاعدة البيانات وتهيئتها بنجاح مسبقاً في بيئة الإنتاج.', 403);
exit(0);

try {
    $pdo = getDbConnection();
    
    $action = isset($_GET['action']) ? trim($_GET['action']) : 'install';
    
    // ==========================================
    // ACTION: GET CURRENT ACCOUNTS (ADMINS & AGENTS)
    // ==========================================
    if ($action === 'get_accounts') {
        $admins = $pdo->query("SELECT `id`, `full_name`, `email`, `password_hash`, `role` FROM `admins`")->fetchAll(PDO::FETCH_ASSOC);
        $agents = $pdo->query("SELECT `id`, `agency_name`, `contact_name`, `username`, `email`, `password_hash`, `status` FROM `agents`")->fetchAll(PDO::FETCH_ASSOC);
        
        $testPasswords = [
            'Admin@StudyCo2026!',
            'Password123!',
            'admin',
            'Admin',
            '123456',
            '12345678',
            '123456789',
            '1234',
            'studyco',
            'Studyco',
            'StudyCo',
            'stadyco',
            'Stadyco',
            'saad',
            'Saad',
            'saadmaher',
            'SaadMaher',
            'saad123',
            'admin123',
            'Admin123',
            'Admin@123',
            'admin@123',
            'root',
            'password',
            'Password',
            'StudyCo2026',
            'StudyCo@2026!Secret'
        ];
        
        foreach ($admins as &$adm) {
            $adm['matched_password'] = null;
            foreach ($testPasswords as $p) {
                if (password_verify($p, $adm['password_hash']) || $adm['password_hash'] === $p) {
                    $adm['matched_password'] = $p;
                    break;
                }
            }
        }
        
        foreach ($agents as &$ag) {
            $ag['matched_password'] = null;
            foreach ($testPasswords as $p) {
                if (password_verify($p, $ag['password_hash']) || $ag['password_hash'] === $p) {
                    $ag['matched_password'] = $p;
                    break;
                }
            }
        }
        
        sendResponse(true, [
            'admins' => $admins,
            'agents' => $agents
        ], 'تم استرجاع الحسابات وفحص كلمات المرور بنجاح.');
    }
    
    // ==========================================
    // ACTION: SET PASSWORD FOR ADMIN OR AGENT
    // ==========================================
    if ($action === 'set_password') {
        $type = isset($_GET['type']) ? trim($_GET['type']) : 'admin';
        $email = isset($_GET['email']) ? trim(strtolower($_GET['email'])) : '';
        $newPass = isset($_GET['new_pass']) ? trim($_GET['new_pass']) : '';
        
        if (empty($email) || empty($newPass)) {
            sendResponse(false, null, 'يرجى تزويد البريد الإلكتروني وكلمة المرور الجديدة', 400);
        }
        
        $hash = password_hash($newPass, PASSWORD_BCRYPT);
        if ($type === 'admin') {
            $stmt = $pdo->prepare("UPDATE `admins` SET `password_hash` = ?, `updated_at` = NOW() WHERE `email` = ?");
            $stmt->execute([$hash, $email]);
            $affected = $stmt->rowCount();
        } else {
            $stmt = $pdo->prepare("UPDATE `agents` SET `password_hash` = ? WHERE `email` = ? OR `username` = ?");
            $stmt->execute([$hash, $email, $email]);
            $affected = $stmt->rowCount();
        }
        
        sendResponse(true, [
            'type' => $type,
            'email' => $email,
            'new_password' => $newPass,
            'updated' => ($affected > 0)
        ], 'تم تحديث وتعيين كلمة المرور بنجاح!');
    }
    if ($action === 'clean' || $action === 'purge') {
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
        $pdo->exec("TRUNCATE TABLE `student_documents`;");
        $pdo->exec("TRUNCATE TABLE `status_logs`;");
        $pdo->exec("TRUNCATE TABLE `students`;");
        
        $agentsPurged = false;
        if (isset($_GET['include_agents']) && $_GET['include_agents'] === '1') {
            $pdo->exec("TRUNCATE TABLE `agents`;");
            $agentsPurged = true;
        }
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
        
        $studentCount = (int)$pdo->query("SELECT COUNT(*) FROM `students`")->fetchColumn();
        $agentCount   = (int)$pdo->query("SELECT COUNT(*) FROM `agents`")->fetchColumn();
        $adminCount   = (int)$pdo->query("SELECT COUNT(*) FROM `admins`")->fetchColumn();
        
        sendResponse(true, [
            'database'       => DB_NAME,
            'action'         => 'clean_success',
            'students_count' => $studentCount,
            'agents_count'   => $agentCount,
            'admins_count'   => $adminCount,
            'agents_purged'  => $agentsPurged
        ], 'تم تفريغ وتنظيف قاعدة البيانات بنجاح تام! تم مسح كافة بيانات الطلاب وسجلات التتبع، والقاعدة الآن نظيفة وجاهزة للاستخدام الحقيقي.');
    }
    
    $sqlFile = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'schema.sql';
    if (!file_exists($sqlFile)) {
        sendResponse(false, null, 'ملف schema.sql غير موجود في المجلد database/', 404);
    }
    
    $sqlContent = file_get_contents($sqlFile);
    
    // 1. Execute Schema Creation
    $pdo->exec($sqlContent);
    
    // 2. Verify all 5 required tables exist
    $requiredTables = ['admins', 'agents', 'students', 'student_documents', 'status_logs'];
    $existingTables = [];
    
    foreach ($requiredTables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '{$table}'");
        if ($stmt->rowCount() > 0) {
            $existingTables[] = $table;
        }
    }
    
    if (count($existingTables) !== count($requiredTables)) {
        sendResponse(false, [
            'expected' => $requiredTables,
            'found'    => $existingTables
        ], 'حدث خطأ: بعض الجداول لم يتم إنشاؤها بنجاح.', 500);
    }
    
    // 3. Seed / Update Super Admin Account (Real BCRYPT Hash)
    $adminEmail = 'admin@studyco.com';
    $adminPass  = 'Admin@StudyCo2026!';
    $adminHash  = password_hash($adminPass, PASSWORD_BCRYPT);
    $adminName  = 'StudyCo Central Administration';
    
    $adminStmt = $pdo->prepare("
        INSERT INTO `admins` (`full_name`, `email`, `password_hash`, `role`, `created_at`)
        VALUES (?, ?, ?, 'super_admin', NOW())
        ON DUPLICATE KEY UPDATE 
            `password_hash` = VALUES(`password_hash`),
            `full_name`     = VALUES(`full_name`),
            `role`          = 'super_admin'
    ");
    $adminStmt->execute([$adminName, $adminEmail, $adminHash]);
    
    // 4. Seed / Update Active Default Partner Account (BCRYPT Hash)
    ensureAgentTableColumns($pdo);
    $agentEmail    = 'partner@studyco.com';
    $agentUsername = 'partner_riyadh';
    $agentPass     = 'Password123!';
    $agentHash     = password_hash($agentPass, PASSWORD_BCRYPT);
    $agentBio      = 'وكالة تعليمية واستشارات جامعية دولية معتمدة تمثل StudyCo في جنوب شرق آسيا والشرق الأوسط.';
    
    $agentStmt = $pdo->prepare("
        INSERT INTO `agents` 
        (`id`, `agency_name`, `contact_name`, `username`, `email`, `password_hash`, `phone`, `whatsapp`, `country`, `city`, `company_bio`, `experience_years`, `annual_students_est`, `status`, `created_at`)
        VALUES 
        (1, 'StudyCo Global Partners', 'Ahmad Al-Mansoor', ?, ?, ?, '+6281252223732', '+6281252223732', 'Indonesia', 'Jakarta', ?, '5+ years', '30-50', 'active', NOW())
        ON DUPLICATE KEY UPDATE 
            `username`      = VALUES(`username`),
            `password_hash` = VALUES(`password_hash`),
            `company_bio`   = VALUES(`company_bio`),
            `status`        = 'active',
            `agency_name`   = VALUES(`agency_name`),
            `contact_name`  = VALUES(`contact_name`)
    ");
    $agentStmt->execute([$agentUsername, $agentEmail, $agentHash, $agentBio]);
    
    // Fetch Agent ID (usually 1)
    $agentRowStmt = $pdo->prepare("SELECT `id` FROM `agents` WHERE `email` = ? LIMIT 1");
    $agentRowStmt->execute([$agentEmail]);
    $agentId = (int)$agentRowStmt->fetchColumn();
    
    // 5. Seed Initial Student Records with Status Logs (Only when ?seed_demo=1 is specified)
    $seedDemo = isset($_GET['seed_demo']) && $_GET['seed_demo'] === '1';
    $seededStudents = [];
    
    if ($seedDemo) {
        $student1Ref = 'STU-202611-1001';
        $chkStudent1 = $pdo->prepare("SELECT `id` FROM `students` WHERE `reference_code` = ? LIMIT 1");
        $chkStudent1->execute([$student1Ref]);
        $s1Id = $chkStudent1->fetchColumn();
        
        if (!$s1Id) {
            $insS1 = $pdo->prepare("
                INSERT INTO `students` 
                (`agent_id`, `reference_code`, `full_name`, `full_name_ar`, `gender`, `birth_date`, `nationality`, `passport_number`, `email`, `phone`, `whatsapp`, `destination_country`, `target_university`, `target_program`, `degree_level`, `intake_date`, `status`, `agent_notes`, `admin_feedback`, `created_at`)
                VALUES 
                (?, ?, 'Zaid Al-Hashemi', 'زيد الهاشمي', 'male', '2004-05-14', 'Iraq', 'N8892100', 'zaid.hashemi@gmail.com', '+9647801234567', '+9647801234567', 'ماليزيا', 'جامعة مالايا (Universiti Malaya)', 'بكالوريوس علوم الحاسوب والذكاء الاصطناعي', 'Bachelor', 'أكتوبر 2026', 'conditional_offer', 'طالب متفوق حاصل على معدل 94% في الثانوية العامة.', 'تم استلام القبول المشروط بنجاح، بانتظار استكمال شهادة كفاءة اللغة الإنجليزية (IELTS 6.0).', NOW())
            ");
            $insS1->execute([$agentId, $student1Ref]);
            $s1Id = (int)$pdo->lastInsertId();
            
            // Logs for Student 1
            $logS1 = $pdo->prepare("INSERT INTO `status_logs` (`student_id`, `old_status`, `new_status`, `comment`, `changed_by`, `created_at`) VALUES (?, ?, ?, ?, ?, ?)");
            $logS1->execute([$s1Id, null, 'submitted', 'تم رفع ملف الطالب ووثائقه الأولية عبر الوكيل', 'agent', date('Y-m-d H:i:s', strtotime('-5 days'))]);
            $logS1->execute([$s1Id, 'submitted', 'under_review', 'مراجعة أوراق الطالب وتدقيق المعدل بواسطة إدارة المنصة', 'admin', date('Y-m-d H:i:s', strtotime('-3 days'))]);
            $logS1->execute([$s1Id, 'under_review', 'conditional_offer', 'صدور القبول المشروط رسمياً من عمادة القبول بالجامعة', 'admin', date('Y-m-d H:i:s', strtotime('-1 days'))]);
        }
        $seededStudents[$student1Ref] = 'Zaid Al-Hashemi (conditional_offer)';
        
        $student2Ref = 'STU-202611-1002';
        $chkStudent2 = $pdo->prepare("SELECT `id` FROM `students` WHERE `reference_code` = ? LIMIT 1");
        $chkStudent2->execute([$student2Ref]);
        $s2Id = $chkStudent2->fetchColumn();
        
        if (!$s2Id) {
            $insS2 = $pdo->prepare("
                INSERT INTO `students` 
                (`agent_id`, `reference_code`, `full_name`, `full_name_ar`, `gender`, `birth_date`, `nationality`, `passport_number`, `email`, `phone`, `whatsapp`, `destination_country`, `target_university`, `target_program`, `degree_level`, `intake_date`, `status`, `agent_notes`, `admin_feedback`, `created_at`)
                VALUES 
                (?, ?, 'Maryam Huda Al-Nuaimi', 'مريم هدى النعيمي', 'female', '2001-09-22', 'Jordan', 'A5519283', 'maryam.nuaimi@yahoo.com', '+962791234567', '+962791234567', 'بريطانيا', 'University of Manchester', 'ماجستير إدارة الأعمال الدولية (MSc International Business)', 'Master', 'سبتمبر 2026', 'under_review', 'خريجة الجامعة الأردنية بتقدير جيد جداً وتوصيات أكاديمية قوية.', 'الملف قيد التدقيق لدى مكتب القبول الأكاديمي الدولي في الجامعة.', NOW())
            ");
            $insS2->execute([$agentId, $student2Ref]);
            $s2Id = (int)$pdo->lastInsertId();
            
            // Logs for Student 2
            $logS2 = $pdo->prepare("INSERT INTO `status_logs` (`student_id`, `old_status`, `new_status`, `comment`, `changed_by`, `created_at`) VALUES (?, ?, ?, ?, ?, ?)");
            $logS2->execute([$s2Id, null, 'submitted', 'تم تسجيل الطالب ورفع المستندات', 'agent', date('Y-m-d H:i:s', strtotime('-2 days'))]);
            $logS2->execute([$s2Id, 'submitted', 'under_review', 'بدء فحص معادلة المواد والسجل الأكاديمي', 'admin', date('Y-m-d H:i:s', strtotime('-1 days'))]);
        }
        $seededStudents[$student2Ref] = 'Maryam Huda (under_review)';
    }
    
    sendResponse(true, [
        'database' => DB_NAME,
        'tables_created' => $existingTables,
        'super_admin' => [
            'email' => $adminEmail,
            'password' => '[ENCRYPTED_BCRYPT_HASH]',
            'role' => 'super_admin'
        ],
        'default_partner' => [
            'email' => $agentEmail,
            'password' => '[ENCRYPTED_BCRYPT_HASH]',
            'status' => 'active'
        ],
        'seeded_students' => $seededStudents
    ], 'تمت تهيئة وتأكيد قاعدة البيانات بنجاح تام!');
    
} catch (Exception $e) {
    error_log("Installer Error: " . $e->getMessage());
    sendResponse(false, null, 'فشل في تثبيت وتهيئة قاعدة البيانات: ' . $e->getMessage(), 500);
}
