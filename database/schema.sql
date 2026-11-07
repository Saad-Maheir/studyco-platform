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

SET FOREIGN_KEY_CHECKS = 1;
