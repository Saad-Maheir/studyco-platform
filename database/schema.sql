-- ==============================================================================
-- StudyCo Education Services - Database Schema
-- StudyCo Education Platform — B2B Partner Network & Central Administration Schema
-- Target Hostinger Database: u202803270_studyco_db
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. Table: admins (حسابات إدارة المنصة المركزية - Super Admin & Staff)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(255) NOT NULL COMMENT 'اسم المسؤول أو المدير',
  `email` VARCHAR(191) NOT NULL UNIQUE COMMENT 'البريد الإلكتروني للدخول',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'كلمة المرور المشفرة بـ bcrypt',
  `role` ENUM('super_admin', 'staff') NOT NULL DEFAULT 'super_admin' COMMENT 'صلاحية الحساب',
  `last_login` DATETIME DEFAULT NULL COMMENT 'آخر تسجيل دخول',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table: agents (وكلاء التعليم والشركاء المعتمدين)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `agents` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `agency_name` VARCHAR(255) NOT NULL COMMENT 'اسم الوكالة أو المكتب التعليمي',
  `contact_name` VARCHAR(255) NOT NULL COMMENT 'اسم الشخص المسؤول أو الوكيل',
  `username` VARCHAR(100) DEFAULT NULL UNIQUE COMMENT 'اسم المستخدم أو اليوزر الذي تصدره الإدارة',
  `email` VARCHAR(191) NOT NULL UNIQUE COMMENT 'البريد الإلكتروني لتسجيل الدخول',
  `password_hash` VARCHAR(255) DEFAULT NULL COMMENT 'كلمة المرور المشفرة بـ bcrypt (تصدرها الإدارة عند الموافقة)',
  `phone` VARCHAR(50) DEFAULT NULL COMMENT 'رقم الهاتف',
  `whatsapp` VARCHAR(50) NOT NULL COMMENT 'رقم الواتساب للتواصل والإشعارات',
  `country` VARCHAR(100) NOT NULL COMMENT 'دولة مقر الوكيل',
  `city` VARCHAR(100) DEFAULT NULL COMMENT 'المدينة',
  `website` VARCHAR(255) DEFAULT NULL COMMENT 'الموقع الإلكتروني أو رابط السوشيال ميديا',
  `company_bio` TEXT DEFAULT NULL COMMENT 'نبذة عن الشركة والوكالة',
  `company_profile_file` VARCHAR(500) DEFAULT NULL COMMENT 'ملف بروفايل الشركة المرفوع',
  `company_profile_name` VARCHAR(255) DEFAULT NULL COMMENT 'الاسم الأصلي لملف البروفايل',
  `company_docs_file` VARCHAR(500) DEFAULT NULL COMMENT 'ملف أوراق وترخيص الشركة المرفوع',
  `company_docs_name` VARCHAR(255) DEFAULT NULL COMMENT 'الاسم الأصلي لأوراق الشركة',
  `experience_years` VARCHAR(50) DEFAULT NULL COMMENT 'سنوات الخبرة في المجال التعليمي',
  `annual_students_est` VARCHAR(50) DEFAULT NULL COMMENT 'العدد التقديري للطلاب سنوياً',
  `status` ENUM('pending', 'active', 'suspended', 'rejected') NOT NULL DEFAULT 'pending' COMMENT 'حالة الحساب',
  `admin_notes` TEXT DEFAULT NULL COMMENT 'ملاحظات الإدارة الداخلية على الوكيل',
  `last_login` DATETIME DEFAULT NULL COMMENT 'آخر تسجيل دخول',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_agents_email` (`email`),
  INDEX `idx_agents_username` (`username`),
  INDEX `idx_agents_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table: students (سجلات الطلاب التابعين للوكلاء)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `agent_id` INT UNSIGNED NOT NULL COMMENT 'معرف الوكيل صاحب الطلب',
  `reference_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'الرقم المرجعي الموحد للطلب مثل STU-2026-001',
  `full_name` VARCHAR(255) NOT NULL COMMENT 'اسم الطالب بالكامل كما في الجواز بالإنجليزية',
  `full_name_ar` VARCHAR(255) DEFAULT NULL COMMENT 'اسم الطالب بالعربية أو لغة إضافية',
  `gender` ENUM('male', 'female') DEFAULT 'male',
  `birth_date` DATE DEFAULT NULL COMMENT 'تاريخ الميلاد',
  `nationality` VARCHAR(100) NOT NULL COMMENT 'جنسية الطالب',
  `passport_number` VARCHAR(100) NOT NULL COMMENT 'رقم جواز السفر',
  `email` VARCHAR(191) DEFAULT NULL COMMENT 'بريد الطالب الإلكتروني',
  `phone` VARCHAR(50) DEFAULT NULL COMMENT 'هاتف الطالب أو ولي أمره',
  `whatsapp` VARCHAR(50) DEFAULT NULL COMMENT 'واتساب الطالب',
  `destination_country` VARCHAR(100) NOT NULL COMMENT 'وجهة الدراسة: ماليزيا، بريطانيا، كندا، استراليا...',
  `target_university` VARCHAR(255) NOT NULL COMMENT 'الجامعة المستهدفة',
  `target_program` VARCHAR(255) NOT NULL COMMENT 'التخصص أو البرنامج الأكاديمي',
  `degree_level` VARCHAR(100) NOT NULL COMMENT 'المرحلة الدراسية: بكالوريوس، ماجستير، دكتوراه، لغة...',
  `intake_date` VARCHAR(100) DEFAULT NULL COMMENT 'فصل الالتحاق المتوقع: سبتمبر 2026 مثلاً',
  `status` ENUM(
    'submitted',
    'under_review',
    'conditional_offer',
    'unconditional_offer',
    'awaiting_payment',
    'visa_processing',
    'enrolled',
    'rejected',
    'cancelled'
  ) NOT NULL DEFAULT 'submitted' COMMENT 'مرحلة معالجة الملف الحالية',
  `agent_notes` TEXT DEFAULT NULL COMMENT 'ملاحظات الوكيل عند رفع الطلب',
  `admin_feedback` TEXT DEFAULT NULL COMMENT 'ملاحظات إدارة StudyCo وتوجيهاتها للوكيل',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_students_agent_id` (`agent_id`),
  INDEX `idx_students_status` (`status`),
  INDEX `idx_students_ref` (`reference_code`),
  CONSTRAINT `fk_students_agent` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table: student_documents (الملفات والمستندات المحمية المرفوعة للطلاب)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_documents` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` INT UNSIGNED NOT NULL COMMENT 'معرف الطالب التابع له المستند',
  `agent_id` INT UNSIGNED NOT NULL COMMENT 'معرف الوكيل الذي رفع المستند أو 0 إذا رفعه الأدمن',
  `doc_type` ENUM(
    'passport',
    'transcript',
    'high_school_cert',
    'bachelor_cert',
    'english_cert',
    'personal_photo',
    'recommendation_letter',
    'other'
  ) NOT NULL COMMENT 'نوع المستند',
  `title` VARCHAR(255) DEFAULT NULL COMMENT 'وصف أو عنوان إضافي للمستند',
  `original_name` VARCHAR(255) NOT NULL COMMENT 'اسم الملف الأصلي عند الرفع',
  `file_name` VARCHAR(255) NOT NULL COMMENT 'اسم الملف المخزن الآمن على السيرفر',
  `file_path` VARCHAR(500) NOT NULL COMMENT 'المسار النسبي للتخزين',
  `file_size` INT UNSIGNED NOT NULL COMMENT 'حجم الملف بالبايت',
  `mime_type` VARCHAR(100) NOT NULL COMMENT 'نوع المحتوى مثل application/pdf',
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_doc_student_id` (`student_id`),
  INDEX `idx_doc_agent_id` (`agent_id`),
  CONSTRAINT `fk_docs_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table: status_logs (سجل التتبع الزمني لمسار الطلب - Timeline Tracker)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `status_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` INT UNSIGNED NOT NULL COMMENT 'معرف الطالب',
  `old_status` VARCHAR(50) DEFAULT NULL COMMENT 'الحالة السابقة',
  `new_status` VARCHAR(50) NOT NULL COMMENT 'الحالة الجديدة',
  `comment` TEXT DEFAULT NULL COMMENT 'ملاحظات أو سبب التحديث',
  `changed_by` VARCHAR(100) NOT NULL DEFAULT 'admin' COMMENT 'من قام بالتحديث (وكيل / إدارة / نظام)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_logs_student_id` (`student_id`),
  CONSTRAINT `fk_logs_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 6. CMS Tables for Dynamic Educational Content Management
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 6.1 Table: cms_universities (إدارة بيانات الجامعات والشراكات)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cms_universities` (
  `id` VARCHAR(100) NOT NULL COMMENT 'معرف الجامعة الفريد مثل taylors أو adelaide',
  `name` VARCHAR(255) NOT NULL COMMENT 'اسم الجامعة بالإنجليزية',
  `arabic_name` VARCHAR(255) DEFAULT NULL COMMENT 'اسم الجامعة بالعربية',
  `country` VARCHAR(100) NOT NULL COMMENT 'دولة الجامعة: ماليزيا، أستراليا...',
  `city` VARCHAR(100) DEFAULT NULL COMMENT 'المدينة والموقع',
  `ranking` VARCHAR(255) DEFAULT NULL COMMENT 'تصنيف QS أو الترتيب العالمي',
  `established` VARCHAR(50) DEFAULT NULL COMMENT 'سنة التأسيس',
  `campus_name` VARCHAR(255) DEFAULT NULL COMMENT 'اسم الحرم الجامعي',
  `student_count` VARCHAR(100) DEFAULT NULL COMMENT 'عدد الطلاب وتنوع الجنسيات',
  `intakes` VARCHAR(255) DEFAULT NULL COMMENT 'مواعيد فصول الالتحاق السنوية',
  `fee_range_min` DECIMAL(12,2) DEFAULT 0 COMMENT 'الحد الأدنى للرسوم السنوية',
  `fee_range_max` DECIMAL(12,2) DEFAULT 0 COMMENT 'الحد الأقصى للرسوم السنوية',
  `currency` VARCHAR(20) DEFAULT 'MYR' COMMENT 'عملة المصاريف الأصلية',
  `logo` VARCHAR(500) DEFAULT NULL COMMENT 'مسار شعار الجامعة النسبي',
  `image` VARCHAR(500) DEFAULT NULL COMMENT 'مسار صورة الحرم الجامعي الرئيسية',
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

-- ------------------------------------------------------------------------------
-- 6.2 Table: cms_programs (إدارة البرامج والتخصصات الدراسية)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cms_programs` (
  `id` VARCHAR(191) NOT NULL COMMENT 'معرف البرنامج الفريد',
  `university_id` VARCHAR(100) NOT NULL COMMENT 'معرف الجامعة التابع لها البرنامج',
  `name` VARCHAR(255) NOT NULL COMMENT 'اسم التخصص أو البرنامج بالإنجليزية',
  `name_ar` VARCHAR(255) DEFAULT NULL COMMENT 'اسم التخصص أو البرنامج بالعربية',
  `field` VARCHAR(100) DEFAULT NULL COMMENT 'المجال الأكاديمي: cs, business, engineering...',
  `level` VARCHAR(50) DEFAULT NULL COMMENT 'المرحلة: bachelor, master, phd, diploma, foundation',
  `duration` VARCHAR(50) DEFAULT NULL COMMENT 'مدة الدراسة بالسنوات',
  `annual_fee` DECIMAL(12,2) DEFAULT 0 COMMENT 'الرسوم السنوية التقديرية',
  `currency` VARCHAR(20) DEFAULT 'MYR' COMMENT 'العملة',
  `ielts` VARCHAR(50) DEFAULT NULL COMMENT 'متطلب اللغة الإنجليزية',
  `intakes` VARCHAR(255) DEFAULT NULL COMMENT 'فصول بدء الدراسة',
  `study_mode` VARCHAR(50) DEFAULT 'on-campus' COMMENT 'نمط الدراسة: on-campus أو online',
  `full_json` LONGTEXT DEFAULT NULL COMMENT 'البيانات التفصيلية بما فيها المساقات والرسوم السنوية',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cms_prog_uni` (`university_id`),
  INDEX `idx_cms_prog_field` (`field`),
  INDEX `idx_cms_prog_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6.3 Table: cms_online_programs (إدارة برامج الدرجات الجامعية عن بعد)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 6.4 Table: cms_language_centers (إدارة معاهد ومراكز اللغة الإنجليزية)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cms_language_centers` (
  `id` VARCHAR(100) NOT NULL COMMENT 'معرف معهد اللغة مثل bright-language-center',
  `name` VARCHAR(255) NOT NULL COMMENT 'اسم المعهد بالإنجليزية',
  `name_ar` VARCHAR(255) DEFAULT NULL COMMENT 'اسم المعهد بالعربية',
  `country` VARCHAR(100) NOT NULL DEFAULT 'malaysia' COMMENT 'الدولة',
  `city` VARCHAR(100) DEFAULT NULL COMMENT 'المدينة بالإنجليزية',
  `city_ar` VARCHAR(100) DEFAULT NULL COMMENT 'المدينة بالعربية',
  `image` VARCHAR(500) DEFAULT NULL COMMENT 'مسار صورة المعهد',
  `min_fee_myr` DECIMAL(12,2) DEFAULT 0 COMMENT 'أقل باقة شهرية',
  `max_fee_myr` DECIMAL(12,2) DEFAULT 0 COMMENT 'أعلى باقة',
  `packages_count` INT UNSIGNED DEFAULT 0 COMMENT 'عدد الباقات المتاحة',
  `packages_json` LONGTEXT DEFAULT NULL COMMENT 'قائمة الباقات الشهرية والتأشيرات والأسعار JSON',
  `features_json` LONGTEXT DEFAULT NULL COMMENT 'مميزات المعهد JSON',
  `about` TEXT DEFAULT NULL COMMENT 'نبذة عن المعهد بالإنجليزية',
  `about_ar` TEXT DEFAULT NULL COMMENT 'نبذة عن المعهد بالعربية',
  `full_json` LONGTEXT DEFAULT NULL COMMENT 'كافة بيانات المعهد وترجمات اللغات التسع',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cms_lc_country` (`country`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6.5 Table: cms_scholarships (إدارة المنح الدراسية والخصومات الأكاديمية)
-- ------------------------------------------------------------------------------
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

SET FOREIGN_KEY_CHECKS = 1;
