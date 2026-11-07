<?php
/**
 * StudyCo Education Services - Database Connection (PDO)
 * StudyCo Education Platform — Database Connection Module
 */

require_once __DIR__ . '/config.php';

function getDbConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            ensureAgentTableColumns($pdo);
        } catch (PDOException $e) {
            // Log real error on server, send user-friendly message
            error_log("Database Connection Failed: " . $e->getMessage());
            sendResponse(false, null, 'تعذر الاتصال بقاعدة البيانات. يرجى التحقق من بيانات الاتصال.', 500);
        }
    }
    
    return $pdo;
}

