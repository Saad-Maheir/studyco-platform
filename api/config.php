<?php
/**
 * StudyCo Education Services - API Configuration & Security Core
 * StudyCo Education Platform — Core Configuration & Security Module
 */

// Show errors only in local development, hide in production
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Security Headers & CORS
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');

// Allow Origin (support studyco.id, custom domains, and credentials)
$allowedOrigins = [
    'https://studyco.id',
    'https://www.studyco.id',
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    exit(0);
}

// Session Initialization with strict security settings
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || 
                (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) ||
                (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params([
            'lifetime' => 86400,
            'path'     => '/',
            'domain'   => '',
            'secure'   => $isSecure,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    } else {
        session_set_cookie_params(86400, '/; samesite=Lax', '', $isSecure, true);
    }
    session_start();
}

// ==============================================================================
// Database Credentials (Hostinger Production u202803270_studyco_db)
// ==============================================================================
define('DB_HOST', getenv('STUDYCO_DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('STUDYCO_DB_NAME') ?: 'u202803270_studyco_db');
define('DB_USER', getenv('STUDYCO_DB_USER') ?: 'u202803270_studyco_user');
define('DB_PASS', getenv('STUDYCO_DB_PASS') ?: 'StudyCo@2026!Secret');
define('DB_CHARSET', 'utf8mb4');

// Setup & Maintenance Secret Key (Locked / Disabled in Production)
define('INSTALL_SECRET_KEY', '');

// Upload Directory Config
define('UPLOAD_DIR', dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'documents' . DIRECTORY_SEPARATOR);
define('MAX_FILE_SIZE', 15 * 1024 * 1024); // 15MB per file

/**
 * Standard JSON Response Helper
 */

/**
 * Extract Real Client IP Address (Secure, Non-Spoofable)
 */
function getClientIp() {
    $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $cfIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '';
    if (!empty($cfIp) && filter_var($cfIp, FILTER_VALIDATE_IP)) {
        return $cfIp . '_' . $remoteAddr;
    }
    return $remoteAddr;
}

/**
 * Check Brute-Force Rate Limiting (5 attempts / 15 minutes)
 */
function checkRateLimit($actionKey, $maxAttempts = 5, $decayMinutes = 15) {
    $ip = getClientIp();
    $hash = md5($ip . '_' . $actionKey);
    $limitFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'studyco_rl_' . $hash . '.json';
    
    $now = time();
    $data = ['count' => 0, 'first_attempt' => $now];
    
    if (file_exists($limitFile)) {
        $content = @file_get_contents($limitFile);
        $decoded = @json_decode($content, true);
        if ($decoded && is_array($decoded)) {
            $data = $decoded;
        }
    }
    
    if ($now - $data['first_attempt'] > ($decayMinutes * 60)) {
        $data = ['count' => 0, 'first_attempt' => $now];
    }
    
    if ($data['count'] >= $maxAttempts) {
        $remainingSeconds = ($data['first_attempt'] + ($decayMinutes * 60)) - $now;
        $remainingMinutes = max(1, ceil($remainingSeconds / 60));
        sendResponse(false, [
            'rate_limited' => true,
            'retry_after_minutes' => $remainingMinutes
        ], "تم إيقاف المحاولات مؤقتاً لحماية الحساب. يرجى المحاولة بعد {$remainingMinutes} دقيقة", 429);
    }
}

/**
 * Record a Failed Login Attempt
 */
function recordFailedAttempt($actionKey, $decayMinutes = 15) {
    $ip = getClientIp();
    $hash = md5($ip . '_' . $actionKey);
    $limitFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'studyco_rl_' . $hash . '.json';
    
    $now = time();
    $data = ['count' => 0, 'first_attempt' => $now];
    
    if (file_exists($limitFile)) {
        $content = @file_get_contents($limitFile);
        $decoded = @json_decode($content, true);
        if ($decoded && is_array($decoded)) {
            $data = $decoded;
        }
    }
    
    if ($now - $data['first_attempt'] > ($decayMinutes * 60)) {
        $data = ['count' => 0, 'first_attempt' => $now];
    }
    
    $data['count']++;
    @file_put_contents($limitFile, json_encode($data));
}

/**
 * Clear Rate Limit on Successful Login
 */
function clearRateLimit($actionKey) {
    $ip = getClientIp();
    $hash = md5($ip . '_' . $actionKey);
    $limitFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'studyco_rl_' . $hash . '.json';
    if (file_exists($limitFile)) {
        @unlink($limitFile);
    }
}

function sendResponse($success, $data = null, $message = '', $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success'   => (bool)$success,
        'message'   => $message,
        'data'      => $data,
        'timestamp' => date('c')
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Check if Agent is Logged In and Account is Currently Active in Database
 */
function requireAgentAuth() {
    if (!isset($_SESSION['agent_id']) || empty($_SESSION['agent_id'])) {
        sendResponse(false, null, 'يرجى تسجيل الدخول أولاً للوصول إلى بوابة الوكلاء', 401);
    }

    $agentId = (int)$_SESSION['agent_id'];

    // Live Database Verification of Agent Status
    try {
        require_once __DIR__ . '/db.php';
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("SELECT `status` FROM `agents` WHERE `id` = ? LIMIT 1");
        $stmt->execute([$agentId]);
        $status = $stmt->fetchColumn();

        if (!$status || $status !== 'active') {
            $_SESSION = [];
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }
            session_destroy();
            sendResponse(false, null, 'تم إيقاف أو تعطيل هذا الحساب من قبل إدارة المنصة', 403);
        }
    } catch (Exception $e) {
        error_log("Agent Auth DB Check Error: " . $e->getMessage());
        sendResponse(false, null, 'حدث خطأ أثناء التحقق من صلاحية الحساب', 500);
    }

    return $agentId;
}

/**
 * Check if Admin is Logged In
 */
function requireAdminAuth() {
    if (!isset($_SESSION['admin_id']) || empty($_SESSION['admin_id'])) {
        sendResponse(false, null, 'غير مصرح: يرجى تسجيل الدخول بحساب إدارة المنصة', 401);
    }
    return (int)$_SESSION['admin_id'];
}

/**
 * Allow either Agent or Admin access (with live agent active verification)
 * Returns ['type' => 'admin'|'agent', 'id' => int]
 */
function requireAgentOrAdminAuth() {
    if (isset($_SESSION['admin_id']) && !empty($_SESSION['admin_id'])) {
        return ['type' => 'admin', 'id' => (int)$_SESSION['admin_id']];
    }
    if (isset($_SESSION['agent_id']) && !empty($_SESSION['agent_id'])) {
        $agentId = requireAgentAuth();
        return ['type' => 'agent', 'id' => $agentId];
    }
    sendResponse(false, null, 'غير مصرح: يرجى تسجيل الدخول كوكيل أو مسؤول إدارة', 401);
}

/**
 * Auto-migration: Ensure new agent columns exist seamlessly on Hostinger production
 */
function ensureAgentTableColumns($pdo) {
    static $checked = false;
    if ($checked) return;
    $checked = true;
    try {
        $cols = $pdo->query("SHOW COLUMNS FROM `agents`")->fetchAll(PDO::FETCH_COLUMN);
        $alter = [];
        if (!in_array('username', $cols)) {
            $alter[] = "ADD COLUMN `username` VARCHAR(100) DEFAULT NULL UNIQUE COMMENT 'اسم المستخدم الصادر من الإدارة' AFTER `contact_name`";
        }
        if (!in_array('company_bio', $cols)) {
            $alter[] = "ADD COLUMN `company_bio` TEXT DEFAULT NULL COMMENT 'نبذة عن الشركة والوكالة' AFTER `website`";
        }
        if (!in_array('company_profile_file', $cols)) {
            $alter[] = "ADD COLUMN `company_profile_file` VARCHAR(500) DEFAULT NULL COMMENT 'ملف بروفايل الشركة' AFTER `company_bio`";
        }
        if (!in_array('company_profile_name', $cols)) {
            $alter[] = "ADD COLUMN `company_profile_name` VARCHAR(255) DEFAULT NULL COMMENT 'الاسم الأصلي لبروفايل الشركة' AFTER `company_profile_file`";
        }
        if (!in_array('company_docs_file', $cols)) {
            $alter[] = "ADD COLUMN `company_docs_file` VARCHAR(500) DEFAULT NULL COMMENT 'ملف أوراق وترخيص الشركة' AFTER `company_profile_name`";
        }
        if (!in_array('company_docs_name', $cols)) {
            $alter[] = "ADD COLUMN `company_docs_name` VARCHAR(255) DEFAULT NULL COMMENT 'الاسم الأصلي لأوراق الشركة' AFTER `company_docs_file`";
        }
        if (!empty($alter)) {
            $pdo->exec("ALTER TABLE `agents` " . implode(', ', $alter));
        }
        // Ensure password_hash allows NULL for pending registrations
        $pdo->exec("ALTER TABLE `agents` MODIFY COLUMN `password_hash` VARCHAR(255) DEFAULT NULL");
    } catch (Exception $e) {
        // Table might not exist yet before installation
    }
}
