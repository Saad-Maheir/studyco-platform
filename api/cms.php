<?php
/**
 * StudyCo Education Services - Central CMS Backend API
 * StudyCo Education Platform — Content Management System & Live JSON Synchronizer
 * Handles Universities, Study Programs, Online Degrees, Language Centers, Scholarships, and Exchange Rates.
 * Supports Bidirectional Sync: MySQL Database (Hostinger) <-> data/*.json Files
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

// Security: Only logged in Platform Administrators can access CMS API
$adminId = requireAdminAuth();

$action = isset($_GET['action']) ? trim($_GET['action']) : (isset($_POST['action']) ? trim($_POST['action']) : '');
$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents('php://input'), true) ?: $_POST;

// Directory Constants
define('CMS_DATA_DIR', dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR);
define('CMS_UNI_DETAILS_DIR', CMS_DATA_DIR . 'university-details' . DIRECTORY_SEPARATOR);
define('CMS_PHOTO_DIR', dirname(__DIR__) . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'photo' . DIRECTORY_SEPARATOR);
define('CMS_LC_PHOTO_DIR', CMS_PHOTO_DIR . 'lc' . DIRECTORY_SEPARATOR);

/**
 * Auto-migration: Ensure CMS Tables Exist Automatically in MySQL
 */
function ensureCmsTablesExist($pdo) {
    static $checked = false;
    if ($checked) return;
    $checked = true;

    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `cms_universities` (
              `id` VARCHAR(100) NOT NULL COMMENT 'معرف الجامعة الفريد',
              `name` VARCHAR(255) NOT NULL COMMENT 'اسم الجامعة بالإنجليزية',
              `arabic_name` VARCHAR(255) DEFAULT NULL COMMENT 'اسم الجامعة بالعربية',
              `country` VARCHAR(100) NOT NULL COMMENT 'دولة الجامعة',
              `city` VARCHAR(100) DEFAULT NULL COMMENT 'المدينة والموقع',
              `ranking` VARCHAR(255) DEFAULT NULL COMMENT 'تصنيف QS أو الترتيب العالمي',
              `established` VARCHAR(50) DEFAULT NULL COMMENT 'سنة التأسيس',
              `campus_name` VARCHAR(255) DEFAULT NULL COMMENT 'اسم الحرم الجامعي',
              `student_count` VARCHAR(100) DEFAULT NULL COMMENT 'عدد الطلاب وتنوع الجنسيات',
              `intakes` VARCHAR(255) DEFAULT NULL COMMENT 'مواعيد فصول الالتحاق السنوية',
              `fee_range_min` DECIMAL(12,2) DEFAULT 0 COMMENT 'الحد الأدنى للرسوم السنوية',
              `fee_range_max` DECIMAL(12,2) DEFAULT 0 COMMENT 'الحد الأقصى للرسوم السنوية',
              `currency` VARCHAR(20) DEFAULT 'MYR' COMMENT 'عملة المصاريف الأصلية',
              `logo` VARCHAR(500) DEFAULT NULL COMMENT 'مسار شعار الجامعة',
              `image` VARCHAR(500) DEFAULT NULL COMMENT 'مسار صورة الحرم الجامعي',
              `website` VARCHAR(500) DEFAULT NULL COMMENT 'الموقع الرسمي للجامعة',
              `video_url` VARCHAR(500) DEFAULT NULL COMMENT 'رابط جولة الفيديو / يوتيوب',
              `description` TEXT DEFAULT NULL COMMENT 'نبذة عن الجامعة بالإنجليزية',
              `description_ar` TEXT DEFAULT NULL COMMENT 'نبذة عن الجامعة بالعربية',
              `full_json` LONGTEXT DEFAULT NULL COMMENT 'النسخة الكاملة للبيانات بصيغة JSON لكافة التفاصيل',
              `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (`id`),
              INDEX `idx_cms_uni_country` (`country`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS `cms_programs` (
              `id` VARCHAR(191) NOT NULL COMMENT 'معرف البرنامج الفريد',
              `university_id` VARCHAR(100) NOT NULL COMMENT 'معرف الجامعة',
              `name` VARCHAR(255) NOT NULL COMMENT 'اسم التخصص أو البرنامج بالإنجليزية',
              `name_ar` VARCHAR(255) DEFAULT NULL COMMENT 'اسم التخصص أو البرنامج بالعربية',
              `field` VARCHAR(100) DEFAULT NULL COMMENT 'المجال الأكاديمي',
              `level` VARCHAR(50) DEFAULT NULL COMMENT 'المرحلة: bachelor, master, phd...',
              `duration` VARCHAR(50) DEFAULT NULL COMMENT 'مدة الدراسة بالسنوات',
              `annual_fee` DECIMAL(12,2) DEFAULT 0 COMMENT 'الرسوم السنوية التقديرية',
              `currency` VARCHAR(20) DEFAULT 'MYR' COMMENT 'العملة',
              `ielts` VARCHAR(50) DEFAULT NULL COMMENT 'متطلب اللغة الإنجليزية',
              `intakes` VARCHAR(255) DEFAULT NULL COMMENT 'فصول بدء الدراسة',
              `study_mode` VARCHAR(50) DEFAULT 'on-campus' COMMENT 'نمط الدراسة: on-campus أو online',
              `full_json` LONGTEXT DEFAULT NULL COMMENT 'البيانات التفصيلية بما فيها المساقات',
              `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (`id`),
              INDEX `idx_cms_prog_uni` (`university_id`),
              INDEX `idx_cms_prog_field` (`field`),
              INDEX `idx_cms_prog_level` (`level`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS `cms_online_programs` (
              `id` VARCHAR(191) NOT NULL COMMENT 'معرف برنامج الأونلاين',
              `university_id` VARCHAR(100) NOT NULL COMMENT 'معرف الجامعة المانحة',
              `name` VARCHAR(255) NOT NULL COMMENT 'اسم البرنامج أونلاين بالإنجليزية',
              `name_ar` VARCHAR(255) DEFAULT NULL COMMENT 'اسم البرنامج بالعربية',
              `field` VARCHAR(100) DEFAULT NULL COMMENT 'المجال: cs, business...',
              `level` VARCHAR(50) DEFAULT NULL COMMENT 'المرحلة: master, bachelor...',
              `duration` VARCHAR(50) DEFAULT NULL COMMENT 'المدة بالسنوات',
              `annual_fee` DECIMAL(12,2) DEFAULT 0 COMMENT 'الرسوم السنوية',
              `currency` VARCHAR(20) DEFAULT 'MYR' COMMENT 'العملة',
              `ielts` VARCHAR(50) DEFAULT NULL COMMENT 'شرط الآيلتس',
              `intakes` VARCHAR(255) DEFAULT NULL COMMENT 'فصول الالتحاق',
              `image` VARCHAR(500) DEFAULT NULL COMMENT 'صورة معبرة عن التخصص',
              `full_json` LONGTEXT DEFAULT NULL COMMENT 'البيانات التفصيلية للبرنامج بصيغة JSON',
              `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (`id`),
              INDEX `idx_cms_online_uni` (`university_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS `cms_language_centers` (
              `id` VARCHAR(100) NOT NULL COMMENT 'معرف معهد اللغة',
              `name` VARCHAR(255) NOT NULL COMMENT 'اسم المعهد بالإنجليزية',
              `name_ar` VARCHAR(255) DEFAULT NULL COMMENT 'اسم المعهد بالعربية',
              `country` VARCHAR(100) NOT NULL DEFAULT 'malaysia' COMMENT 'الدولة',
              `city` VARCHAR(100) DEFAULT NULL COMMENT 'المدينة بالإنجليزية',
              `city_ar` VARCHAR(100) DEFAULT NULL COMMENT 'المدينة بالعربية',
              `image` VARCHAR(500) DEFAULT NULL COMMENT 'مسار صورة المعهد',
              `min_fee_myr` DECIMAL(12,2) DEFAULT 0 COMMENT 'أقل باقة شهرية',
              `max_fee_myr` DECIMAL(12,2) DEFAULT 0 COMMENT 'أعلى باقة',
              `packages_count` INT UNSIGNED DEFAULT 0 COMMENT 'عدد الباقات المتاحة',
              `packages_json` LONGTEXT DEFAULT NULL COMMENT 'قائمة الباقات الشهرية والتأشيرات JSON',
              `features_json` LONGTEXT DEFAULT NULL COMMENT 'مميزات المعهد JSON',
              `about` TEXT DEFAULT NULL COMMENT 'نبذة عن المعهد بالإنجليزية',
              `about_ar` TEXT DEFAULT NULL COMMENT 'نبذة عن المعهد بالعربية',
              `full_json` LONGTEXT DEFAULT NULL COMMENT 'كافة بيانات المعهد وترجمات اللغات التسع',
              `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (`id`),
              INDEX `idx_cms_lc_country` (`country`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS `cms_scholarships` (
              `id` VARCHAR(100) NOT NULL COMMENT 'معرف المنحة الفريد',
              `university_id` VARCHAR(100) NOT NULL COMMENT 'معرف الجامعة المقدمة للمنحة',
              `name` VARCHAR(255) NOT NULL COMMENT 'اسم المنحة بالإنجليزية',
              `name_ar` VARCHAR(255) DEFAULT NULL COMMENT 'اسم المنحة بالعربية',
              `country` VARCHAR(100) NOT NULL COMMENT 'الدولة',
              `level` VARCHAR(50) DEFAULT NULL COMMENT 'المرحلة المؤهلة: bachelor, master...',
              `type` VARCHAR(50) DEFAULT 'full' COMMENT 'نوع المنحة: full أو partial',
              `coverage` VARCHAR(255) DEFAULT NULL COMMENT 'نسبة التغطية بالإنجليزية',
              `coverage_ar` VARCHAR(255) DEFAULT NULL COMMENT 'نسبة التغطية بالعربية',
              `deadline` VARCHAR(255) DEFAULT NULL COMMENT 'الموعد النهائي للتقديم',
              `deadline_ar` VARCHAR(255) DEFAULT NULL COMMENT 'الموعد النهائي بالعربية',
              `criteria` TEXT DEFAULT NULL COMMENT 'شروط ومعايير القبول بالإنجليزية',
              `criteria_ar` TEXT DEFAULT NULL COMMENT 'شروط ومعايير القبول بالعربية',
              `applicable_fields_json` TEXT DEFAULT NULL COMMENT 'التخصصات المشمولة بالمنحة JSON',
              `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (`id`),
              INDEX `idx_cms_sch_uni` (`university_id`),
              INDEX `idx_cms_sch_country` (`country`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (Exception $e) {
        error_log("CMS Auto-Migration Error: " . $e->getMessage());
    }
}

/**
 * Safely Sanitize File Path IDs to prevent directory traversal
 */
function sanitizePathId($id) {
    return preg_replace('/[^a-zA-Z0-9_-]/', '', trim((string)$id));
}

/**
 * Safely Write JSON File with Atomic Replacement
 */
function safeWriteJson($filePath, $data, $pretty = true) {
    $tempFile = $filePath . '.tmp.' . uniqid('', true);
    $flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
    if ($pretty) {
        $flags |= JSON_PRETTY_PRINT;
    }
    $json = json_encode($data, $flags);
    if ($json === false) {
        throw new Exception("فشل في تشفير بيانات JSON: " . json_last_error_msg());
    }
    if (file_put_contents($tempFile, $json) === false) {
        throw new Exception("تعذر حفظ الملف المؤقت: " . $tempFile);
    }
    if (!@rename($tempFile, $filePath)) {
        @unlink($filePath);
        if (!@rename($tempFile, $filePath)) {
            @unlink($tempFile);
            throw new Exception("تعذر تحديث ملف البيانات: " . $filePath);
        }
    }
    return true;
}

/**
 * Helper to Generate Clean URL Slug
 */
function makeSlug($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return empty($text) ? 'item-' . time() : $text;
}

/**
 * Lightweight CMS Overrides Recorder (Sub-millisecond frontend live update)
 */
function recordCmsOverride($section, $id, $recordData = null, $isDelete = false) {
    $overridesFile = CMS_DATA_DIR . 'cms-overrides.json';
    $data = [
        'lastUpdated'     => time(),
        'programs'        => ['modified' => (object)[], 'deleted' => []],
        'universities'    => ['modified' => (object)[], 'deleted' => []],
        'scholarships'    => ['modified' => (object)[], 'deleted' => []],
        'languageCenters' => ['modified' => (object)[], 'deleted' => []],
        'language_centers'=> ['modified' => (object)[], 'deleted' => []],
        'online_degrees'  => ['modified' => (object)[], 'deleted' => []]
    ];

    if (file_exists($overridesFile)) {
        $loaded = json_decode(file_get_contents($overridesFile), true);
        if ($loaded && is_array($loaded)) {
            $data = array_replace_recursive($data, $loaded);
        }
    }
    $data['lastUpdated'] = time();

    if (!isset($data[$section])) {
        $data[$section] = ['modified' => [], 'deleted' => []];
    }
    if (!isset($data[$section]['modified']) || !is_array($data[$section]['modified'])) {
        $data[$section]['modified'] = [];
    }
    if (!isset($data[$section]['deleted']) || !is_array($data[$section]['deleted'])) {
        $data[$section]['deleted'] = [];
    }

    if ($isDelete) {
        unset($data[$section]['modified'][$id]);
        if (!in_array($id, $data[$section]['deleted'])) {
            $data[$section]['deleted'][] = $id;
        }
    } else {
        $data[$section]['deleted'] = array_values(array_filter($data[$section]['deleted'], function($d) use ($id) {
            return $d !== $id;
        }));
        $data[$section]['modified'][$id] = $recordData;
    }

    safeWriteJson($overridesFile, $data, true);
}

/**
 * Memory-Conscious Regex/Stream Sync for data/programs.json (50MB)
 */
function syncMasterProgramsJson($progData, $isDelete = false) {
    $progId = sanitizePathId($progData['id'] ?? '');
    if (empty($progId)) return;

    // 1. Record in lightweight overrides file
    recordCmsOverride('programs', $progId, $progData, $isDelete);

    // 2. Perform memory-efficient regex/block update on data/programs.json
    $masterFile = CMS_DATA_DIR . 'programs.json';
    if (!file_exists($masterFile)) return;

    $content = file_get_contents($masterFile);
    if (!$content) return;

    $compactRecord = [
        'id'           => $progId,
        'universityId' => $progData['universityId'] ?? ($progData['university_id'] ?? ''),
        'name'         => $progData['name'] ?? '',
        'nameAr'       => $progData['nameAr'] ?? ($progData['name_ar'] ?? ''),
        'field'        => $progData['field'] ?? '',
        'level'        => $progData['level'] ?? '',
        'duration'     => (int)($progData['duration'] ?? 3),
        'annualFee'    => (float)($progData['annualFee'] ?? ($progData['annual_fee'] ?? 0)),
        'currency'     => $progData['currency'] ?? 'MYR',
        'ielts'        => (string)($progData['ielts'] ?? ''),
        'intakes'      => (string)($progData['intakes'] ?? ''),
        'overview'     => (string)($progData['overview'] ?? ''),
        'overviewAr'   => (string)($progData['overviewAr'] ?? ($progData['overview_ar'] ?? '')),
        'studyMode'    => (string)($progData['studyMode'] ?? ($progData['study_mode'] ?? 'on-campus'))
    ];
    $jsonFrag = json_encode($compactRecord, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $quotedId = preg_quote($progId, '/');
    $pattern = '/\{[^{}]*?"id"\s*:\s*"' . $quotedId . '"[^{}]*?\}(,)?/s';

    if ($isDelete) {
        $newContent = preg_replace($pattern, '', $content);
        $newContent = preg_replace('/,\s*\]/s', "\n  ]", $newContent);
    } else {
        if (preg_match($pattern, $content)) {
            $newContent = preg_replace($pattern, $jsonFrag . '$1', $content);
        } else {
            $pos = strrpos($content, ']');
            if ($pos !== false) {
                $before = substr($content, 0, $pos);
                $after = substr($content, $pos);
                $trimBefore = rtrim($before);
                $hasComma = substr($trimBefore, -1) === ',' || substr($trimBefore, -1) === '[';
                $commaPrefix = $hasComma ? '' : ",\n    ";
                $newContent = $before . $commaPrefix . $jsonFrag . "\n  " . $after;
            } else {
                $newContent = $content;
            }
        }
    }

    if ($newContent && $newContent !== $content) {
        $tempFile = $masterFile . '.tmp.' . uniqid('', true);
        if (file_put_contents($tempFile, $newContent) !== false) {
            @unlink($masterFile);
            rename($tempFile, $masterFile);
        }
    }
    unset($content, $newContent);
}

try {
    $pdo = getDbConnection();
    ensureCmsTablesExist($pdo);

    switch ($action) {

        // ======================================================================
        // 1. UNIVERSITIES (الجامعات والشراكات الأكاديمية)
        // ======================================================================
        case 'list_universities': {
            $country = isset($_GET['country']) ? trim(strtolower($_GET['country'])) : '';
            $q       = isset($_GET['q']) ? trim(strtolower($_GET['q'])) : '';

            $filePath = CMS_DATA_DIR . 'universities.json';
            if (!file_exists($filePath)) {
                sendResponse(true, ['universities' => [], 'total' => 0]);
            }

            $jsonRaw = json_decode(file_get_contents($filePath), true);
            $universities = $jsonRaw['universities'] ?? [];

            if (!empty($country) && $country !== 'all') {
                $universities = array_values(array_filter($universities, function($u) use ($country) {
                    return isset($u['country']) && strtolower($u['country']) === $country;
                }));
            }

            if (!empty($q)) {
                $universities = array_values(array_filter($universities, function($u) use ($q) {
                    $name   = strtolower($u['name'] ?? '');
                    $nameAr = strtolower($u['arabicName'] ?? '');
                    $city   = strtolower($u['city'] ?? '');
                    $id     = strtolower($u['id'] ?? '');
                    return strpos($name, $q) !== false || strpos($nameAr, $q) !== false || strpos($city, $q) !== false || strpos($id, $q) !== false;
                }));
            }

            sendResponse(true, [
                'universities' => $universities,
                'total'        => count($universities)
            ]);
            break;
        }

        case 'get_university': {
            $id = sanitizePathId($_GET['id'] ?? '');
            if (empty($id)) {
                sendResponse(false, null, 'يرجى تحديد معرف الجامعة (id) صالح', 400);
            }

            $detailPath = CMS_UNI_DETAILS_DIR . $id . '.json';
            $masterPath = CMS_DATA_DIR . 'universities.json';

            $basic = null;
            if (file_exists($masterPath)) {
                $raw = json_decode(file_get_contents($masterPath), true);
                foreach ($raw['universities'] ?? [] as $u) {
                    if ($u['id'] === $id) {
                        $basic = $u;
                        break;
                    }
                }
            }

            $details = null;
            if (file_exists($detailPath)) {
                $details = json_decode(file_get_contents($detailPath), true);
            }

            if (!$basic && !$details) {
                sendResponse(false, null, 'الجامعة المطلوبة غير موجودة', 404);
            }

            $combined = array_merge($basic ?: [], $details ?: []);
            sendResponse(true, [
                'university' => $combined,
                'programs'   => $combined['programs'] ?? []
            ]);
            break;
        }

        case 'save_university': {
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $name = isset($input['name']) ? trim($input['name']) : '';
            if (empty($name)) {
                sendResponse(false, null, 'اسم الجامعة بالإنجليزية مطلوب', 400);
            }

            $id = sanitizePathId($input['id'] ?? '');
            if (empty($id)) {
                $id = sanitizePathId(makeSlug($name));
            }

            $arabicName      = trim($input['arabicName'] ?? ($input['arabic_name'] ?? ''));
            $country         = trim(strtolower($input['country'] ?? 'malaysia'));
            $city            = trim($input['city'] ?? '');
            $cityKey         = trim($input['cityKey'] ?? ($input['city_key'] ?? ('city_' . makeSlug($city))));
            $ranking         = trim((string)($input['ranking'] ?? ''));
            $rankingBadgeKey = trim($input['rankingBadgeKey'] ?? ($input['ranking_badge_key'] ?? ($id . '_rank_badge')));
            $established     = trim((string)($input['established'] ?? ''));
            $campusName      = trim($input['campusName'] ?? ($input['campus_name'] ?? ''));
            $studentCount    = trim($input['studentCount'] ?? ($input['student_count'] ?? ''));
            $rawIntakes      = $input['intakes'] ?? '';
            $intakes         = is_array($rawIntakes) ? implode(', ', $rawIntakes) : trim((string)$rawIntakes);
            $feeRangeMin     = (float)($input['feeRangeMin'] ?? ($input['fee_range_min'] ?? 0));
            $feeRangeMax     = (float)($input['feeRangeMax'] ?? ($input['fee_range_max'] ?? 0));
            $currency        = trim($input['currency'] ?? 'MYR');
            $logo            = trim($input['logo'] ?? '');
            $image           = trim($input['image'] ?? '');
            $website         = trim($input['website'] ?? '');
            $videoUrl        = trim($input['videoUrl'] ?? ($input['video_url'] ?? ''));
            $description     = trim($input['description'] ?? '');
            $descriptionAr   = trim($input['descriptionAr'] ?? ($input['description_ar'] ?? ''));
            $majors          = is_array($input['majors'] ?? null) ? $input['majors'] : ['business', 'cs', 'engineering'];

            // 1. Sync to MySQL cms_universities
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO `cms_universities` (
                        `id`, `name`, `arabic_name`, `country`, `city`, `ranking`, `established`,
                        `campus_name`, `student_count`, `intakes`, `fee_range_min`, `fee_range_max`,
                        `currency`, `logo`, `image`, `website`, `video_url`, `description`, `description_ar`,
                        `full_json`, `updated_at`
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                    ON DUPLICATE KEY UPDATE
                        `name` = VALUES(`name`),
                        `arabic_name` = VALUES(`arabic_name`),
                        `country` = VALUES(`country`),
                        `city` = VALUES(`city`),
                        `ranking` = VALUES(`ranking`),
                        `established` = VALUES(`established`),
                        `campus_name` = VALUES(`campus_name`),
                        `student_count` = VALUES(`student_count`),
                        `intakes` = VALUES(`intakes`),
                        `fee_range_min` = VALUES(`fee_range_min`),
                        `fee_range_max` = VALUES(`fee_range_max`),
                        `currency` = VALUES(`currency`),
                        `logo` = VALUES(`logo`),
                        `image` = VALUES(`image`),
                        `website` = VALUES(`website`),
                        `video_url` = VALUES(`video_url`),
                        `description` = VALUES(`description`),
                        `description_ar` = VALUES(`description_ar`),
                        `full_json` = VALUES(`full_json`),
                        `updated_at` = NOW()
                ");
                $stmt->execute([
                    $id, $name, $arabicName, $country, $city, $ranking, $established,
                    $campusName, $studentCount, $intakes, $feeRangeMin, $feeRangeMax,
                    $currency, $logo, $image, $website, $videoUrl, $description, $descriptionAr,
                    json_encode($input, JSON_UNESCAPED_UNICODE)
                ]);
            } catch (Exception $e) {
                error_log("DB Error in save_university: " . $e->getMessage());
            }

            // 2. Sync to data/universities.json (Summary List)
            $masterPath = CMS_DATA_DIR . 'universities.json';
            $masterData = file_exists($masterPath) ? json_decode(file_get_contents($masterPath), true) : ['universities' => []];
            $unis = $masterData['universities'] ?? [];

            $foundIndex = -1;
            $existingProgramsCount = 0;
            foreach ($unis as $idx => $u) {
                if ($u['id'] === $id) {
                    $foundIndex = $idx;
                    $existingProgramsCount = $u['programsCount'] ?? 0;
                    break;
                }
            }

            $summaryRecord = [
                'id'              => $id,
                'name'            => $name,
                'arabicName'      => $arabicName,
                'city'            => $city,
                'cityKey'         => $cityKey,
                'country'         => $country,
                'ranking'         => $ranking,
                'rankingBadgeKey' => $rankingBadgeKey,
                'established'     => $established,
                'campusName'      => $campusName,
                'studentCount'    => $studentCount,
                'intakes'         => $intakes,
                'feeRangeMin'     => $feeRangeMin,
                'feeRangeMax'     => $feeRangeMax,
                'currency'        => $currency,
                'majors'          => $majors,
                'logo'            => $logo,
                'image'           => $image,
                'website'         => $website,
                'videoUrl'        => $videoUrl,
                'programsCount'   => isset($input['programsCount']) ? (int)$input['programsCount'] : $existingProgramsCount
            ];

            if ($foundIndex >= 0) {
                $unis[$foundIndex] = array_merge($unis[$foundIndex], $summaryRecord);
            } else {
                $unis[] = $summaryRecord;
            }
            $masterData['universities'] = $unis;
            safeWriteJson($masterPath, $masterData);

            // 3. Sync to data/university-details/{id}.json (Complete Detail File)
            if (!is_dir(CMS_UNI_DETAILS_DIR)) {
                @mkdir(CMS_UNI_DETAILS_DIR, 0755, true);
            }
            $detailPath = CMS_UNI_DETAILS_DIR . $id . '.json';
            $detailData = file_exists($detailPath) ? json_decode(file_get_contents($detailPath), true) : [];

            $programs = $input['programs'] ?? ($detailData['programs'] ?? []);
            $facilities = $input['facilities'] ?? ($detailData['facilities'] ?? []);
            $residences = $input['residences'] ?? ($detailData['residences'] ?? []);
            $livingExpenses = $input['livingExpenses'] ?? ($detailData['livingExpenses'] ?? []);
            $summaryFeeTable = $input['summaryFeeTable'] ?? ($detailData['summaryFeeTable'] ?? []);
            $highlights = $input['highlights'] ?? ($detailData['highlights'] ?? []);
            $stats = $input['stats'] ?? ($detailData['stats'] ?? [
                'qsRanking'             => $ranking,
                'establishedYear'       => $established,
                'campusLocation'        => $campusName,
                'internationalStudents' => $studentCount,
                'totalProgramsCount'    => count($programs) . ' Programs',
                'intakesSchedule'       => $intakes
            ]);

            $updatedDetail = array_merge($detailData, [
                'id'                 => $id,
                'slug'               => $input['slug'] ?? ($detailData['slug'] ?? makeSlug($name)),
                'name'               => $name,
                'arabicName'         => $arabicName,
                'city'               => $city,
                'cityKey'            => $cityKey,
                'country'            => $country,
                'countryKey'         => 'dest_' . $country,
                'logo'               => $logo,
                'image'              => $image,
                'videoUrl'           => $videoUrl,
                'directWatchUrl'     => $input['directWatchUrl'] ?? ($videoUrl ? str_replace('embed/', 'watch?v=', $videoUrl) : ''),
                'website'            => $website,
                'ranking'            => $ranking,
                'rankingBadgeKey'    => $rankingBadgeKey,
                'established'        => $established,
                'campusName'         => $campusName,
                'studentCount'       => $studentCount,
                'intakes'            => $intakes,
                'feeRangeMin'        => $feeRangeMin,
                'feeRangeMax'        => $feeRangeMax,
                'currency'           => $currency,
                'majors'             => $majors,
                'totalProgramsCount' => count($programs),
                'programsCount'      => count($programs),
                'description'        => $description,
                'descriptionAr'      => $descriptionAr,
                'stats'              => $stats,
                'summaryFeeTable'    => $summaryFeeTable,
                'facilities'         => $facilities,
                'residences'         => $residences,
                'livingExpenses'     => $livingExpenses,
                'highlights'         => $highlights,
                'programs'           => $programs
            ]);

            safeWriteJson($detailPath, $updatedDetail);
            recordCmsOverride('universities', $id, $summaryRecord, false);

            sendResponse(true, [
                'id'         => $id,
                'university' => $updatedDetail
            ], 'تم حفظ بيانات الجامعة بنجاح وتحديث ملفات الموقع');
            break;
        }

        case 'delete_university': {
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $id = sanitizePathId($input['id'] ?? '');
            if (empty($id)) {
                sendResponse(false, null, 'يرجى تحديد معرف الجامعة (id) صالح', 400);
            }

            // 1. Delete from MySQL
            try {
                $stmt = $pdo->prepare("DELETE FROM `cms_universities` WHERE `id` = ?");
                $stmt->execute([$id]);
            } catch (Exception $e) {}

            // 2. Remove from universities.json
            $masterPath = CMS_DATA_DIR . 'universities.json';
            if (file_exists($masterPath)) {
                $masterData = json_decode(file_get_contents($masterPath), true);
                if (isset($masterData['universities'])) {
                    $masterData['universities'] = array_values(array_filter($masterData['universities'], function($u) use ($id) {
                        return $u['id'] !== $id;
                    }));
                    safeWriteJson($masterPath, $masterData);
                }
            }

            // 3. Delete or archive university-details/{id}.json
            $detailPath = CMS_UNI_DETAILS_DIR . $id . '.json';
            if (file_exists($detailPath)) {
                @rename($detailPath, $detailPath . '.bak.' . time());
            }

            recordCmsOverride('universities', $id, null, true);

            sendResponse(true, null, 'تم حذف الجامعة بنجاح من قاعدة البيانات والملفات');
            break;
        }

        // ======================================================================
        // 2. MEDIA UPLOAD (رفع صور وشعارات الجامعات والمعاهد والبرامج)
        // ======================================================================
        case 'upload_media': {
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                sendResponse(false, null, 'لم يتم استلام أي ملف أو حدث خطأ أثناء الرفع', 400);
            }

            $file     = $_FILES['file'];
            $fileSize = $file['size'];
            $fileTmp  = $file['tmp_name'];
            $fileOrig = $file['name'];
            $type     = isset($_POST['type']) ? trim($_POST['type']) : 'general';

            if ($fileSize > 10 * 1024 * 1024) {
                sendResponse(false, null, 'حجم الملف يتجاوز الحد المسموح به (10 ميجابايت)', 400);
            }

            // Prevent Double Extension Attacks (e.g. test.php.png)
            if (preg_match('/\.(php|phtml|phar|cgi|pl|py|sh|exe|asp|aspx|js|html|htm)\b/i', $fileOrig)) {
                sendResponse(false, null, 'اسم الملف يحتوي على امتداد محظور لأسباب أمنية', 400);
            }

            $ext = strtolower(pathinfo($fileOrig, PATHINFO_EXTENSION));
            $allowedExts = ['webp', 'png', 'jpg', 'jpeg', 'svg'];
            if (!in_array($ext, $allowedExts)) {
                sendResponse(false, null, 'نوع الملف غير مدعوم. الصيغ المدعومة: webp, png, jpg, jpeg, svg', 400);
            }

            // Real MIME Inspection
            if (function_exists('finfo_open')) {
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $realMime = finfo_file($finfo, $fileTmp);
                finfo_close($finfo);
                $allowedMimes = ['image/webp', 'image/png', 'image/jpeg', 'image/svg+xml'];
                if (!in_array($realMime, $allowedMimes) && $ext !== 'svg') {
                    sendResponse(false, null, 'محتوى الملف لا يتطابق مع امتداد الصورة المرفوعة', 400);
                }
            }

            // Destination directory
            $targetDir = ($type === 'lc') ? CMS_LC_PHOTO_DIR : CMS_PHOTO_DIR;
            if (!is_dir($targetDir)) {
                @mkdir($targetDir, 0755, true);
            }

            $prefix = ($type === 'lc') ? 'lc_' : ($type === 'logo' ? 'uni_logo_' : 'campus_');
            $cleanName = $prefix . preg_replace('/[^a-zA-Z0-9_-]/', '', pathinfo($fileOrig, PATHINFO_FILENAME)) . '_' . time() . '.' . $ext;
            $targetPath = $targetDir . $cleanName;

            if (!move_uploaded_file($fileTmp, $targetPath)) {
                sendResponse(false, null, 'فشل نقل الملف إلى مجلد الصور', 500);
            }

            @chmod($targetPath, 0644);

            $relativePath = ($type === 'lc') ? 'assets/photo/lc/' . $cleanName : 'assets/photo/' . $cleanName;

            sendResponse(true, [
                'path'      => $relativePath,
                'file_name' => $cleanName,
                'size'      => $fileSize
            ], 'تم رفع الصورة بنجاح');
            break;
        }

        // ======================================================================
        // 3. UNIVERSITY PROGRAMS (البرامج والتخصصات الدراسية)
        // ======================================================================
        case 'list_university_programs': {
            $uniId = sanitizePathId($_GET['university_id'] ?? '');
            if (empty($uniId)) {
                sendResponse(false, null, 'يرجى تحديد معرف الجامعة (university_id) صالح', 400);
            }

            $detailPath = CMS_UNI_DETAILS_DIR . $uniId . '.json';
            if (!file_exists($detailPath)) {
                sendResponse(true, ['programs' => [], 'total' => 0]);
            }

            $detail = json_decode(file_get_contents($detailPath), true);
            $programs = $detail['programs'] ?? [];

            sendResponse(true, [
                'university_id' => $uniId,
                'programs'      => $programs,
                'total'         => count($programs)
            ]);
            break;
        }

        case 'save_program': {
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $uniId = sanitizePathId($input['university_id'] ?? ($input['universityId'] ?? ''));
            $name  = isset($input['name']) ? trim($input['name']) : '';
            if (empty($uniId) || empty($name)) {
                sendResponse(false, null, 'معرف الجامعة واسم البرنامج مطلوبان', 400);
            }

            $id = sanitizePathId($input['id'] ?? '');
            if (empty($id)) {
                $id = sanitizePathId($uniId . '-' . makeSlug($name));
            }

            $nameAr      = trim($input['nameAr'] ?? ($input['name_ar'] ?? ''));
            $field       = trim($input['field'] ?? 'cs');
            $level       = trim($input['level'] ?? 'bachelor');
            $duration    = (float)($input['duration'] ?? 3);
            $annualFee   = (float)($input['annualFee'] ?? ($input['annual_fee'] ?? 0));
            $currency    = trim($input['currency'] ?? 'MYR');
            $ielts       = trim((string)($input['ielts'] ?? ''));
            $rawIntakes  = $input['intakes'] ?? '';
            $intakes     = is_array($rawIntakes) ? implode(', ', $rawIntakes) : trim((string)$rawIntakes);
            $studyMode   = trim($input['studyMode'] ?? ($input['study_mode'] ?? 'on-campus'));
            $overview    = trim($input['overview'] ?? '');
            $overviewAr  = trim($input['overviewAr'] ?? ($input['overview_ar'] ?? ''));
            $yearlyFees  = $input['yearlyFees'] ?? [];
            $otherExpenses = $input['otherExpenses'] ?? null;

            // 1. Sync to MySQL cms_programs
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO `cms_programs` (
                        `id`, `university_id`, `name`, `name_ar`, `field`, `level`,
                        `duration`, `annual_fee`, `currency`, `ielts`, `intakes`,
                        `study_mode`, `full_json`, `updated_at`
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                    ON DUPLICATE KEY UPDATE
                        `university_id` = VALUES(`university_id`),
                        `name` = VALUES(`name`),
                        `name_ar` = VALUES(`name_ar`),
                        `field` = VALUES(`field`),
                        `level` = VALUES(`level`),
                        `duration` = VALUES(`duration`),
                        `annual_fee` = VALUES(`annual_fee`),
                        `currency` = VALUES(`currency`),
                        `ielts` = VALUES(`ielts`),
                        `intakes` = VALUES(`intakes`),
                        `study_mode` = VALUES(`study_mode`),
                        `full_json` = VALUES(`full_json`),
                        `updated_at` = NOW()
                ");
                $stmt->execute([
                    $id, $uniId, $name, $nameAr, $field, $level,
                    (string)$duration, $annualFee, $currency, $ielts, $intakes,
                    $studyMode, json_encode($input, JSON_UNESCAPED_UNICODE)
                ]);
            } catch (Exception $e) {
                error_log("DB Error in save_program: " . $e->getMessage());
            }

            // 2. Update data/university-details/{uniId}.json
            $detailPath = CMS_UNI_DETAILS_DIR . $uniId . '.json';
            $detailData = file_exists($detailPath) ? json_decode(file_get_contents($detailPath), true) : ['id' => $uniId, 'programs' => []];
            $progs = $detailData['programs'] ?? [];

            $fullProgRecord = [
                'id'           => $id,
                'universityId' => $uniId,
                'name'         => $name,
                'nameAr'       => $nameAr,
                'field'        => $field,
                'level'        => $level,
                'duration'     => $duration,
                'annualFee'    => $annualFee,
                'currency'     => $currency,
                'ielts'        => $ielts,
                'intakes'      => $intakes,
                'studyMode'    => $studyMode,
                'overview'     => $overview,
                'overviewAr'   => $overviewAr
            ];
            if (!empty($yearlyFees)) $fullProgRecord['yearlyFees'] = $yearlyFees;
            if (!empty($otherExpenses)) $fullProgRecord['otherExpenses'] = $otherExpenses;

            $foundIdx = -1;
            foreach ($progs as $idx => $p) {
                if ($p['id'] === $id) {
                    $foundIdx = $idx;
                    break;
                }
            }
            if ($foundIdx >= 0) {
                $progs[$foundIdx] = array_merge($progs[$foundIdx], $fullProgRecord);
            } else {
                $progs[] = $fullProgRecord;
            }
            $detailData['programs'] = $progs;
            $detailData['programsCount'] = count($progs);
            $detailData['totalProgramsCount'] = count($progs);
            safeWriteJson($detailPath, $detailData);

            // 3. Update programsCount in data/universities.json
            $masterUniPath = CMS_DATA_DIR . 'universities.json';
            if (file_exists($masterUniPath)) {
                $masterUniData = json_decode(file_get_contents($masterUniPath), true);
                if (isset($masterUniData['universities'])) {
                    foreach ($masterUniData['universities'] as &$u) {
                        if ($u['id'] === $uniId) {
                            $u['programsCount'] = count($progs);
                            break;
                        }
                    }
                    unset($u);
                    safeWriteJson($masterUniPath, $masterUniData);
                }
            }

            // 4. Memory-safe update in master data/programs.json & cms-overrides.json
            syncMasterProgramsJson($fullProgRecord, false);

            sendResponse(true, ['program' => $fullProgRecord], 'تم حفظ البرنامج بنجاح والتسميع الفوري في ملفات الموقع');
            break;
        }

        case 'delete_program': {
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $uniId = sanitizePathId($input['university_id'] ?? ($input['universityId'] ?? ''));
            $id    = sanitizePathId($input['id'] ?? '');
            if (empty($uniId) || empty($id)) {
                sendResponse(false, null, 'معرف الجامعة ومعرف البرنامج مطلوبان', 400);
            }

            // 1. Delete from MySQL
            try {
                $stmt = $pdo->prepare("DELETE FROM `cms_programs` WHERE `id` = ?");
                $stmt->execute([$id]);
            } catch (Exception $e) {}

            // 2. Remove from university-details/{uniId}.json
            $detailPath = CMS_UNI_DETAILS_DIR . $uniId . '.json';
            if (file_exists($detailPath)) {
                $detailData = json_decode(file_get_contents($detailPath), true);
                $progs = $detailData['programs'] ?? [];
                $progs = array_values(array_filter($progs, function($p) use ($id) {
                    return $p['id'] !== $id;
                }));
                $detailData['programs'] = $progs;
                $detailData['programsCount'] = count($progs);
                $detailData['totalProgramsCount'] = count($progs);
                safeWriteJson($detailPath, $detailData);

                // Update count in universities.json
                $masterUniPath = CMS_DATA_DIR . 'universities.json';
                if (file_exists($masterUniPath)) {
                    $masterUniData = json_decode(file_get_contents($masterUniPath), true);
                    foreach ($masterUniData['universities'] ?? [] as &$u) {
                        if ($u['id'] === $uniId) {
                            $u['programsCount'] = count($progs);
                            break;
                        }
                    }
                    unset($u);
                    safeWriteJson($masterUniPath, $masterUniData);
                }
            }

            // 3. Remove from master programs.json & record in overrides
            syncMasterProgramsJson(['id' => $id], true);

            sendResponse(true, null, 'تم حذف البرنامج بنجاح وتحديث السجلات');
            break;
        }

        // ======================================================================
        // 4. ONLINE PROGRAMS (الدرجات الجامعية أونلاين - 327 برنامجاً)
        // ======================================================================
        case 'list_online_programs': {
            $filePath = CMS_DATA_DIR . 'online-programs.json';
            if (!file_exists($filePath)) {
                sendResponse(true, ['programs' => [], 'total' => 0]);
            }
            $raw = json_decode(file_get_contents($filePath), true);
            $programs = $raw['programs'] ?? [];
            sendResponse(true, ['programs' => $programs, 'total' => count($programs)]);
            break;
        }

        case 'save_online_program': {
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $uniId = sanitizePathId($input['universityId'] ?? ($input['university_id'] ?? ''));
            $name  = isset($input['name']) ? trim($input['name']) : '';
            if (empty($uniId) || empty($name)) {
                sendResponse(false, null, 'معرف الجامعة واسم البرنامج مطلوبان', 400);
            }

            $id = sanitizePathId($input['id'] ?? '');
            if (empty($id)) {
                $id = sanitizePathId($uniId . '-' . makeSlug($name) . '-online-degree');
            }

            $nameAr    = trim($input['nameAr'] ?? ($input['name_ar'] ?? ''));
            $field     = trim($input['field'] ?? 'cs');
            $level     = trim($input['level'] ?? 'master');
            $duration  = (float)($input['duration'] ?? 2);
            $annualFee = (float)($input['annualFee'] ?? ($input['annual_fee'] ?? 0));
            $currency  = trim($input['currency'] ?? 'MYR');
            $ielts     = trim((string)($input['ielts'] ?? ''));
            $rawIntakes= $input['intakes'] ?? '';
            $intakes   = is_array($rawIntakes) ? implode(', ', $rawIntakes) : trim((string)$rawIntakes);
            $image     = trim($input['image'] ?? 'assets/photo/programs/health_general.webp');
            $overview  = trim($input['overview'] ?? '');
            $overviewAr = trim($input['overviewAr'] ?? ($input['overview_ar'] ?? ''));

            // 1. Sync to MySQL cms_online_programs
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO `cms_online_programs` (
                        `id`, `university_id`, `name`, `name_ar`, `field`, `level`,
                        `duration`, `annual_fee`, `currency`, `ielts`, `intakes`,
                        `image`, `full_json`, `updated_at`
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                    ON DUPLICATE KEY UPDATE
                        `university_id` = VALUES(`university_id`),
                        `name` = VALUES(`name`),
                        `name_ar` = VALUES(`name_ar`),
                        `field` = VALUES(`field`),
                        `level` = VALUES(`level`),
                        `duration` = VALUES(`duration`),
                        `annual_fee` = VALUES(`annual_fee`),
                        `currency` = VALUES(`currency`),
                        `ielts` = VALUES(`ielts`),
                        `intakes` = VALUES(`intakes`),
                        `image` = VALUES(`image`),
                        `full_json` = VALUES(`full_json`),
                        `updated_at` = NOW()
                ");
                $stmt->execute([
                    $id, $uniId, $name, $nameAr, $field, $level,
                    (string)$duration, $annualFee, $currency, $ielts, $intakes,
                    $image, json_encode($input, JSON_UNESCAPED_UNICODE)
                ]);
            } catch (Exception $e) {
                error_log("DB Error in save_online_program: " . $e->getMessage());
            }

            // 2. Sync to data/online-programs.json
            $filePath = CMS_DATA_DIR . 'online-programs.json';
            $data = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : ['programs' => []];
            $programs = $data['programs'] ?? [];

            $record = [
                'id'           => $id,
                'universityId' => $uniId,
                'name'         => $name,
                'nameAr'       => $nameAr,
                'field'        => $field,
                'level'        => $level,
                'duration'     => $duration,
                'annualFee'    => $annualFee,
                'currency'     => $currency,
                'ielts'        => $ielts,
                'intakes'      => $intakes,
                'overview'     => $overview,
                'overviewAr'   => $overviewAr,
                'studyMode'    => 'online',
                'image'        => $image
            ];

            $foundIdx = -1;
            foreach ($programs as $idx => $p) {
                if ($p['id'] === $id) {
                    $foundIdx = $idx;
                    break;
                }
            }
            if ($foundIdx >= 0) {
                $programs[$foundIdx] = array_merge($programs[$foundIdx], $record);
            } else {
                $programs[] = $record;
            }
            $data['programs'] = $programs;
            safeWriteJson($filePath, $data);
            recordCmsOverride('online_degrees', $id, $record, false);

            sendResponse(true, ['program' => $record], 'تم حفظ برنامج الأونلاين وتحديث الموقع بنجاح');
            break;
        }

        case 'delete_online_program': {
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $id = sanitizePathId($input['id'] ?? '');
            if (empty($id)) {
                sendResponse(false, null, 'يرجى تحديد معرف البرنامج (id) صالح', 400);
            }

            // 1. Delete from MySQL
            try {
                $stmt = $pdo->prepare("DELETE FROM `cms_online_programs` WHERE `id` = ?");
                $stmt->execute([$id]);
            } catch (Exception $e) {}

            // 2. Delete from data/online-programs.json
            $filePath = CMS_DATA_DIR . 'online-programs.json';
            if (file_exists($filePath)) {
                $data = json_decode(file_get_contents($filePath), true);
                $programs = $data['programs'] ?? [];
                $data['programs'] = array_values(array_filter($programs, function($p) use ($id) {
                    return $p['id'] !== $id;
                }));
                safeWriteJson($filePath, $data);
            }

            recordCmsOverride('online_degrees', $id, null, true);

            sendResponse(true, null, 'تم حذف برنامج الأونلاين بنجاح');
            break;
        }

        // ======================================================================
        // 5. LANGUAGE CENTERS (معاهد ومراكز اللغة الإنجليزية)
        // ======================================================================
        case 'list_language_centers': {
            $filePath = CMS_DATA_DIR . 'language-centers.json';
            if (!file_exists($filePath)) {
                sendResponse(true, ['centers' => [], 'total' => 0]);
            }
            $data = json_decode(file_get_contents($filePath), true);
            $centers = $data['centers'] ?? ($data['languageCenters'] ?? []);
            sendResponse(true, ['centers' => $centers, 'total' => count($centers)]);
            break;
        }

        case 'save_language_center': {
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $name = isset($input['name']) ? trim($input['name']) : '';
            if (empty($name)) {
                sendResponse(false, null, 'اسم معهد اللغة بالإنجليزية مطلوب', 400);
            }

            $id = sanitizePathId($input['id'] ?? '');
            if (empty($id)) {
                $id = sanitizePathId(makeSlug($name));
            }

            $nameAr        = trim($input['nameAr'] ?? ($input['name_ar'] ?? ''));
            $country       = trim(strtolower($input['country'] ?? 'malaysia'));
            $countryAr     = trim($input['countryAr'] ?? ($input['country_ar'] ?? 'ماليزيا'));
            $city          = trim($input['city'] ?? 'Kuala Lumpur');
            $cityAr        = trim($input['cityAr'] ?? ($input['city_ar'] ?? 'كوالالمبور'));
            $image         = trim($input['image'] ?? 'assets/photo/lc/lc_' . $id . '.webp');
            $minFeeMYR     = (float)($input['minFeeMYR'] ?? ($input['min_fee_myr'] ?? 2500));
            $maxFeeMYR     = (float)($input['maxFeeMYR'] ?? ($input['max_fee_myr'] ?? 18000));
            $packages      = is_array($input['packages'] ?? null) ? $input['packages'] : [];
            $packagesCount = count($packages) ?: (int)($input['packagesCount'] ?? 8);
            $features      = is_array($input['features'] ?? null) ? $input['features'] : [];
            $coursesAr     = trim($input['coursesAr'] ?? ($input['courses_ar'] ?? 'برنامج اللغة الإنجليزية المكثف، التحضير لاختبار آيلتس'));
            $about         = trim($input['about'] ?? '');
            $aboutAr       = trim($input['aboutAr'] ?? ($input['about_ar'] ?? ''));
            $nameMulti     = is_array($input['nameMulti'] ?? null) ? $input['nameMulti'] : ['ar' => $nameAr, 'en' => $name];
            $cityMulti     = is_array($input['cityMulti'] ?? null) ? $input['cityMulti'] : ['ar' => $cityAr, 'en' => $city];
            $featuresMulti = is_array($input['featuresMulti'] ?? null) ? $input['featuresMulti'] : ['ar' => $features];
            $aboutMulti    = is_array($input['aboutMulti'] ?? null) ? $input['aboutMulti'] : ['ar' => $aboutAr, 'en' => $about];

            // 1. Sync to MySQL cms_language_centers
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO `cms_language_centers` (
                        `id`, `name`, `name_ar`, `country`, `city`, `city_ar`,
                        `image`, `min_fee_myr`, `max_fee_myr`, `packages_count`,
                        `packages_json`, `features_json`, `about`, `about_ar`,
                        `full_json`, `updated_at`
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                    ON DUPLICATE KEY UPDATE
                        `name` = VALUES(`name`),
                        `name_ar` = VALUES(`name_ar`),
                        `country` = VALUES(`country`),
                        `city` = VALUES(`city`),
                        `city_ar` = VALUES(`city_ar`),
                        `image` = VALUES(`image`),
                        `min_fee_myr` = VALUES(`min_fee_myr`),
                        `max_fee_myr` = VALUES(`max_fee_myr`),
                        `packages_count` = VALUES(`packages_count`),
                        `packages_json` = VALUES(`packages_json`),
                        `features_json` = VALUES(`features_json`),
                        `about` = VALUES(`about`),
                        `about_ar` = VALUES(`about_ar`),
                        `full_json` = VALUES(`full_json`),
                        `updated_at` = NOW()
                ");
                $stmt->execute([
                    $id, $name, $nameAr, $country, $city, $cityAr,
                    $image, $minFeeMYR, $maxFeeMYR, $packagesCount,
                    json_encode($packages, JSON_UNESCAPED_UNICODE),
                    json_encode($features, JSON_UNESCAPED_UNICODE),
                    $about, $aboutAr,
                    json_encode($input, JSON_UNESCAPED_UNICODE)
                ]);
            } catch (Exception $e) {
                error_log("DB Error in save_language_center: " . $e->getMessage());
            }

            // 2. Sync to data/language-centers.json
            $filePath = CMS_DATA_DIR . 'language-centers.json';
            $data = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : ['centers' => [], 'languageCenters' => []];
            $centers = $data['centers'] ?? [];
            $lcLegacy = $data['languageCenters'] ?? [];

            $centerRecord = [
                'id'            => $id,
                'name'          => $name,
                'nameAr'        => $nameAr,
                'country'       => $country,
                'countryAr'     => $countryAr,
                'city'          => $city,
                'cityAr'        => $cityAr,
                'image'         => $image,
                'minFeeMYR'     => $minFeeMYR,
                'maxFeeMYR'     => $maxFeeMYR,
                'packagesCount' => $packagesCount,
                'packages'      => $packages,
                'features'      => $features,
                'coursesAr'     => $coursesAr,
                'about'         => $about,
                'aboutAr'       => $aboutAr,
                'nameMulti'     => $nameMulti,
                'cityMulti'     => $cityMulti,
                'featuresMulti' => $featuresMulti,
                'aboutMulti'    => $aboutMulti
            ];

            $foundInCenters = -1;
            foreach ($centers as $idx => $c) {
                if ($c['id'] === $id) {
                    $foundInCenters = $idx;
                    break;
                }
            }
            if ($foundInCenters >= 0) {
                $centers[$foundInCenters] = array_merge($centers[$foundInCenters], $centerRecord);
            } else {
                $centers[] = $centerRecord;
            }

            foreach ($lcLegacy as $idx => $c) {
                if ($c['id'] === $id) {
                    $lcLegacy[$idx] = array_merge($lcLegacy[$idx], $centerRecord);
                    break;
                }
            }

            $data['centers'] = $centers;
            $data['languageCenters'] = $lcLegacy;
            safeWriteJson($filePath, $data);
            recordCmsOverride('languageCenters', $id, $centerRecord, false);
            recordCmsOverride('language_centers', $id, $centerRecord, false);

            sendResponse(true, ['center' => $centerRecord], 'تم حفظ معهد اللغة بنجاح والتسميع في ملفات المنصة');
            break;
        }

        case 'delete_language_center': {
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $id = sanitizePathId($input['id'] ?? '');
            if (empty($id)) {
                sendResponse(false, null, 'يرجى تحديد معرف المعهد (id) صالح', 400);
            }

            // 1. Delete from MySQL
            try {
                $stmt = $pdo->prepare("DELETE FROM `cms_language_centers` WHERE `id` = ?");
                $stmt->execute([$id]);
            } catch (Exception $e) {}

            // 2. Delete from data/language-centers.json
            $filePath = CMS_DATA_DIR . 'language-centers.json';
            if (file_exists($filePath)) {
                $data = json_decode(file_get_contents($filePath), true);
                if (isset($data['centers'])) {
                    $data['centers'] = array_values(array_filter($data['centers'], function($c) use ($id) {
                        return $c['id'] !== $id;
                    }));
                }
                if (isset($data['languageCenters'])) {
                    $data['languageCenters'] = array_values(array_filter($data['languageCenters'], function($c) use ($id) {
                        return $c['id'] !== $id;
                    }));
                }
                safeWriteJson($filePath, $data);
            }

            recordCmsOverride('languageCenters', $id, null, true);
            recordCmsOverride('language_centers', $id, null, true);

            sendResponse(true, null, 'تم حذف معهد اللغة بنجاح');
            break;
        }

        // ======================================================================
        // 6. SCHOLARSHIPS (المنح والخصومات الدراسية)
        // ======================================================================
        case 'list_scholarships': {
            $filePath = CMS_DATA_DIR . 'scholarships.json';
            if (!file_exists($filePath)) {
                sendResponse(true, ['scholarships' => [], 'total' => 0]);
            }
            $data = json_decode(file_get_contents($filePath), true);
            $scholarships = $data['scholarships'] ?? [];
            sendResponse(true, ['scholarships' => $scholarships, 'total' => count($scholarships)]);
            break;
        }

        case 'save_scholarship': {
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $uniId = sanitizePathId($input['universityId'] ?? ($input['university_id'] ?? ''));
            $name  = isset($input['name']) ? trim($input['name']) : '';
            if (empty($uniId) || empty($name)) {
                sendResponse(false, null, 'معرف الجامعة واسم المنحة مطلوبان', 400);
            }

            $id = sanitizePathId($input['id'] ?? '');
            if (empty($id)) {
                $id = sanitizePathId($uniId . '-' . makeSlug($name));
            }

            $nameAr           = trim($input['nameAr'] ?? ($input['name_ar'] ?? ''));
            $country          = trim(strtolower($input['country'] ?? 'malaysia'));
            $level            = trim($input['level'] ?? 'bachelor');
            $type             = trim($input['type'] ?? 'full');
            $coverage         = trim($input['coverage'] ?? '100% Tuition Fee Waiver');
            $coverageAr       = trim($input['coverageAr'] ?? ($input['coverage_ar'] ?? 'إعفاء 100% من الرسوم الدراسية'));
            $deadline         = trim($input['deadline'] ?? 'Annual');
            $deadlineAr       = trim($input['deadlineAr'] ?? ($input['deadline_ar'] ?? 'سنوياً'));
            $criteria         = trim($input['criteria'] ?? '');
            $criteriaAr       = trim($input['criteriaAr'] ?? ($input['criteria_ar'] ?? ''));
            $applicableFields = is_array($input['applicableFields'] ?? null) ? $input['applicableFields'] : ['cs', 'business', 'engineering'];

            // 1. Sync to MySQL cms_scholarships
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO `cms_scholarships` (
                        `id`, `university_id`, `name`, `name_ar`, `country`, `level`,
                        `type`, `coverage`, `coverage_ar`, `deadline`, `deadline_ar`,
                        `criteria`, `criteria_ar`, `applicable_fields_json`, `updated_at`
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                    ON DUPLICATE KEY UPDATE
                        `university_id` = VALUES(`university_id`),
                        `name` = VALUES(`name`),
                        `name_ar` = VALUES(`name_ar`),
                        `country` = VALUES(`country`),
                        `level` = VALUES(`level`),
                        `type` = VALUES(`type`),
                        `coverage` = VALUES(`coverage`),
                        `coverage_ar` = VALUES(`coverage_ar`),
                        `deadline` = VALUES(`deadline`),
                        `deadline_ar` = VALUES(`deadline_ar`),
                        `criteria` = VALUES(`criteria`),
                        `criteria_ar` = VALUES(`criteria_ar`),
                        `applicable_fields_json` = VALUES(`applicable_fields_json`),
                        `updated_at` = NOW()
                ");
                $stmt->execute([
                    $id, $uniId, $name, $nameAr, $country, $level,
                    $type, $coverage, $coverageAr, $deadline, $deadlineAr,
                    $criteria, $criteriaAr, json_encode($applicableFields, JSON_UNESCAPED_UNICODE)
                ]);
            } catch (Exception $e) {
                error_log("DB Error in save_scholarship: " . $e->getMessage());
            }

            // 2. Sync to data/scholarships.json
            $filePath = CMS_DATA_DIR . 'scholarships.json';
            $data = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : ['scholarships' => []];
            $scholarships = $data['scholarships'] ?? [];

            $record = [
                'id'               => $id,
                'universityId'     => $uniId,
                'name'             => $name,
                'nameAr'           => $nameAr,
                'country'          => $country,
                'level'            => $level,
                'type'             => $type,
                'coverage'         => $coverage,
                'coverageAr'       => $coverageAr,
                'deadline'         => $deadline,
                'deadlineAr'       => $deadlineAr,
                'criteria'         => $criteria,
                'criteriaAr'       => $criteriaAr,
                'applicableFields' => $applicableFields
            ];

            $foundIdx = -1;
            foreach ($scholarships as $idx => $s) {
                if ($s['id'] === $id) {
                    $foundIdx = $idx;
                    break;
                }
            }
            if ($foundIdx >= 0) {
                $scholarships[$foundIdx] = array_merge($scholarships[$foundIdx], $record);
            } else {
                $scholarships[] = $record;
            }
            $data['scholarships'] = $scholarships;
            safeWriteJson($filePath, $data);
            recordCmsOverride('scholarships', $id, $record, false);

            sendResponse(true, ['scholarship' => $record], 'تم حفظ المنحة الدراسية وتحديث بيانات الموقع بنجاح');
            break;
        }

        case 'delete_scholarship': {
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $id = sanitizePathId($input['id'] ?? '');
            if (empty($id)) {
                sendResponse(false, null, 'يرجى تحديد معرف المنحة (id) صالح', 400);
            }

            // 1. Delete from MySQL
            try {
                $stmt = $pdo->prepare("DELETE FROM `cms_scholarships` WHERE `id` = ?");
                $stmt->execute([$id]);
            } catch (Exception $e) {}

            // 2. Delete from data/scholarships.json
            $filePath = CMS_DATA_DIR . 'scholarships.json';
            if (file_exists($filePath)) {
                $data = json_decode(file_get_contents($filePath), true);
                $scholarships = $data['scholarships'] ?? [];
                $data['scholarships'] = array_values(array_filter($scholarships, function($s) use ($id) {
                    return $s['id'] !== $id;
                }));
                safeWriteJson($filePath, $data);
            }

            recordCmsOverride('scholarships', $id, null, true);

            sendResponse(true, null, 'تم حذف المنحة الدراسية بنجاح');
            break;
        }

        // ======================================================================
        // 7. EXCHANGE RATES (أسعار صرف العملات العالمية)
        // ======================================================================
        case 'get_exchange_rates': {
            $filePath = CMS_DATA_DIR . 'exchange-rates.json';
            if (!file_exists($filePath)) {
                sendResponse(true, ['rates' => [], 'baseCurrency' => 'USD']);
            }
            $data = json_decode(file_get_contents($filePath), true);
            sendResponse(true, $data);
            break;
        }

        case 'save_exchange_rates': {
            if ($method !== 'POST') {
                sendResponse(false, null, 'طريقة الطلب غير مسموح بها', 405);
            }

            $inputRates = $input['rates'] ?? [];
            if (!is_array($inputRates) || empty($inputRates)) {
                sendResponse(false, null, 'قائمة أسعار الصرف مطلوبة', 400);
            }

            $filePath = CMS_DATA_DIR . 'exchange-rates.json';
            $existingData = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : ['baseCurrency' => 'USD', 'rates' => []];
            $existingRates = $existingData['rates'] ?? [];

            // Determine if incoming rates is key-value map or array of objects
            $isAssoc = array_keys($inputRates) !== range(0, count($inputRates) - 1);

            $ratesMap = [];
            if ($isAssoc) {
                $ratesMap = $inputRates;
            } else {
                foreach ($inputRates as $item) {
                    if (is_array($item) && isset($item['code'])) {
                        $ratesMap[$item['code']] = (float)($item['rateFromUSD'] ?? ($item['rate'] ?? 1));
                    }
                }
            }

            // Defaults dictionary for rich metadata
            $defaults = [
                'USD' => ['symbol' => '$', 'nameKey' => 'curr_usd', 'decimals' => 0],
                'AUD' => ['symbol' => 'A$', 'nameKey' => 'curr_aud', 'decimals' => 0],
                'GBP' => ['symbol' => '£', 'nameKey' => 'curr_gbp', 'decimals' => 0],
                'CAD' => ['symbol' => 'C$', 'nameKey' => 'curr_cad', 'decimals' => 0],
                'NZD' => ['symbol' => 'NZ$', 'nameKey' => 'curr_nzd', 'decimals' => 0],
                'SGD' => ['symbol' => 'S$', 'nameKey' => 'curr_sgd', 'decimals' => 0],
                'MYR' => ['symbol' => 'RM', 'nameKey' => 'curr_myr', 'decimals' => 0],
                'SAR' => ['symbol' => 'SAR', 'nameKey' => 'curr_sar', 'decimals' => 0],
                'AED' => ['symbol' => 'AED', 'nameKey' => 'curr_aed', 'decimals' => 0],
                'KWD' => ['symbol' => 'KWD', 'nameKey' => 'curr_kwd', 'decimals' => 0],
                'QAR' => ['symbol' => 'QAR', 'nameKey' => 'curr_qar', 'decimals' => 0],
                'BHD' => ['symbol' => 'BHD', 'nameKey' => 'curr_bhd', 'decimals' => 0],
                'OMR' => ['symbol' => 'OMR', 'nameKey' => 'curr_omr', 'decimals' => 0],
                'EGP' => ['symbol' => 'EGP', 'nameKey' => 'curr_egp', 'decimals' => 0],
                'IDR' => ['symbol' => 'Rp', 'nameKey' => 'curr_idr', 'decimals' => 0],
                'EUR' => ['symbol' => '€', 'nameKey' => 'curr_eur', 'decimals' => 0],
                'CNY' => ['symbol' => '¥', 'nameKey' => 'curr_cny', 'decimals' => 0],
                'JPY' => ['symbol' => '¥', 'nameKey' => 'curr_jpy', 'decimals' => 0],
                'TRY' => ['symbol' => '₺', 'nameKey' => 'curr_try', 'decimals' => 0]
            ];

            // Reference base MYR rateFromUSD
            $myrFromUsd = isset($ratesMap['MYR']) ? (float)$ratesMap['MYR'] : 4.44;
            if ($myrFromUsd <= 0) $myrFromUsd = 4.44;

            $updatedRatesList = [];
            $seenCodes = [];

            // 1. Update existing array of objects
            if (is_array($existingRates)) {
                foreach ($existingRates as $item) {
                    if (!is_array($item) || empty($item['code'])) continue;
                    $code = strtoupper($item['code']);
                    $seenCodes[$code] = true;

                    if (isset($ratesMap[$code])) {
                        $rateFromUSD = (float)$ratesMap[$code];
                        $toUSD = $rateFromUSD > 0 ? round(1 / $rateFromUSD, 6) : 1.0;
                        $rateRel = $rateFromUSD > 0 ? round($rateFromUSD / $myrFromUsd, 4) : 1.0;
                        if ($code === 'MYR') $rateRel = 1.0;

                        $item['rateFromUSD'] = $rateFromUSD;
                        $item['toUSD'] = $toUSD;
                        $item['rate'] = $rateRel;
                    }
                    $updatedRatesList[] = $item;
                }
            }

            // 2. Append any newly added currencies
            foreach ($ratesMap as $code => $val) {
                $code = strtoupper($code);
                if (!isset($seenCodes[$code])) {
                    $rateFromUSD = (float)$val;
                    $toUSD = $rateFromUSD > 0 ? round(1 / $rateFromUSD, 6) : 1.0;
                    $rateRel = $rateFromUSD > 0 ? round($rateFromUSD / $myrFromUsd, 4) : 1.0;
                    if ($code === 'MYR') $rateRel = 1.0;

                    $meta = $defaults[$code] ?? ['symbol' => $code, 'nameKey' => 'curr_' . strtolower($code), 'decimals' => 0];

                    $updatedRatesList[] = [
                        'code'        => $code,
                        'symbol'      => $meta['symbol'],
                        'nameKey'     => $meta['nameKey'],
                        'toUSD'       => $toUSD,
                        'rateFromUSD' => $rateFromUSD,
                        'rate'        => $rateRel,
                        'decimals'    => $meta['decimals']
                    ];
                }
            }

            $data = [
                'baseCurrency' => $input['baseCurrency'] ?? ($existingData['baseCurrency'] ?? 'USD'),
                'lastUpdated'  => date('Y-m-d'),
                'rates'        => $updatedRatesList
            ];

            safeWriteJson($filePath, $data);
            sendResponse(true, $data, 'تم تحديث أسعار الصرف بنجاح والحفاظ على بنية البيانات');
            break;
        }

        default:
            sendResponse(false, null, 'الإجراء المطلوب (Action) غير معروف أو غير مدعوم في CMS API', 400);
            break;
    }

} catch (Exception $e) {
    error_log("CMS API Error: " . $e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine());
    sendResponse(false, null, 'حدث خطأ في النظام أثناء معالجة الطلب، يرجى المحاولة لاحقاً', 500);
}
