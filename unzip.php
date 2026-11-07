<?php
/**
 * StudyCo Automated Hostinger Deployment & Extractor (All Phases 1, 2, and 3)
 * Author: Antigravity & Saad Maher Saad
 * Usage:
 * 1. Upload `studyco_hostinger_complete_update.zip` AND this `unzip.php` file to your Hostinger `public_html`.
 * 2. In your browser, open: https://yourdomain.com/unzip.php (e.g. https://studyco.id/unzip.php)
 * 3. Click the extract button or let it run automatically.
 */
@ini_set('display_errors', 1);
@ini_set('memory_limit', '512M');
@set_time_limit(600);

$autoExtract = isset($_GET['auto']) || isset($_POST['extract']);
$deleteAfter = isset($_POST['delete_after']) || isset($_GET['delete_zip']);

// Candidates in order of priority (Latest complete archive is #1)
$zipCandidates = [
    'studyco_hostinger_complete_update.zip',
    'STUDYCO_FULL_WEBSITE_HOSTINGER.zip',
    'studyco_master_hostinger.zip',
    'studyco_hostinger_upload.zip'
];

$targetZip = null;
foreach ($zipCandidates as $zipFile) {
    if (file_exists(__DIR__ . '/' . $zipFile)) {
        $targetZip = $zipFile;
        break;
    }
}

if (!$targetZip) {
    $allZips = glob(__DIR__ . '/*.zip');
    if (!empty($allZips)) {
        // Pick the newest zip
        usort($allZips, function($a, $b) {
            return filemtime($b) - filemtime($a);
        });
        $targetZip = basename($allZips[0]);
    }
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>نشر وتحديث منصة StudyCo الشاملة — Hostinger</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --primary: #d97706;
      --primary-dark: #b45309;
      --bg: #0f172a;
      --card-bg: #ffffff;
      --text: #1e293b;
      --text-muted: #64748b;
      --success: #10b981;
      --success-bg: #ecfdf5;
      --danger: #ef4444;
      --danger-bg: #fef2f2;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", sans-serif;
      background: #f1f5f9;
      color: var(--text);
      line-height: 1.7;
      padding: 30px 15px;
    }
    .container {
      max-width: 720px;
      margin: 0 auto;
      background: var(--card-bg);
      border-radius: 16px;
      padding: 35px 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .logo {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 5px;
    }
    .logo span { color: var(--primary); }
    .badge-phase {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      font-size: 13px;
      font-weight: 700;
      padding: 4px 14px;
      border-radius: 999px;
      margin-top: 6px;
    }
    .alert {
      padding: 16px 20px;
      border-radius: 10px;
      margin: 20px 0;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .alert-success { background: var(--success-bg); border: 1px solid #a7f3d0; color: #065f46; }
    .alert-danger { background: var(--danger-bg); border: 1px solid #fecaca; color: #991b1b; }
    .alert-info { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
    .btn {
      display: inline-block;
      width: 100%;
      text-align: center;
      padding: 14px 24px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #ffffff;
      font-size: 16px;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
    }
    .btn:hover { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); transform: translateY(-1px); }
    .btn-secondary {
      background: #0f172a;
      box-shadow: none;
      margin-top: 10px;
    }
    .btn-secondary:hover { background: #1e293b; }
    .checklist {
      list-style: none;
      margin: 20px 0;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }
    .checklist li {
      padding: 10px 16px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    }
    .checklist li:last-child { border-bottom: none; }
    .checklist li:nth-child(even) { background: #fafafa; }
    .status-ok { color: var(--success); font-weight: 700; }
    .status-fail { color: var(--danger); font-weight: 700; }
    .info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin: 20px 0;
      font-size: 14px;
      color: var(--text-muted);
    }
    code {
      background: #e2e8f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      color: #0f172a;
      direction: ltr;
      display: inline-block;
    }
  </style>
</head>
<body>

<div class="container">
  <div class="header">
    <div class="logo">Study<span>Co</span> Education</div>
    <p style="font-size: 15px; color: #64748b;">أداة النشر وفك الضغط التلقائي السريع على سيرفرات Hostinger</p>
    <div class="badge-phase">✨ شامل جميع المراحل (1 + 2 + 3) بالإصدار الأخير v88.0</div>
  </div>

  <?php if (!$targetZip): ?>
    <div class="alert alert-danger">
      <div>
        <strong>❌ لم يتم العثور على أي ملف مضغوط (.zip) في مجلد <code>public_html</code>!</strong><br>
        يرجى رفع ملف <code>studyco_hostinger_complete_update.zip</code> إلى نفس مسار هذا الملف، ثم إعادة تحديث هذه الصفحة.
      </div>
    </div>
  <?php else: ?>
    <?php
      $zipPath = __DIR__ . '/' . $targetZip;
      $zipSizeMB = round(filesize($zipPath) / (1024 * 1024), 2);
    ?>

    <?php if ($autoExtract): ?>
      <?php
        $zip = new ZipArchive();
        $res = $zip->open($zipPath);
        if ($res === TRUE) {
            $zip->extractTo(__DIR__);
            $zip->close();
            
            // Delete zip if requested
            if ($deleteAfter) {
                @unlink($zipPath);
            }
      ?>
        <div class="alert alert-success">
          <div>
            <strong>🎉 تم فك الضغط ونشر وتحديث كافة صفحات وبيانات المنصة بنجاح!</strong><br>
            تم استخراج الأرشيف <code><?php echo htmlspecialchars($targetZip); ?></code> بالكامل في <code>public_html</code>.
          </div>
        </div>

        <h3 style="font-size:16px; margin-top:20px;">تقرير التحقق من الملفات المنشورة:</h3>
        <ul class="checklist">
          <li>
            <span>1. بوابة خدمات الطلاب (student-services.html)</span>
            <span class="<?php echo file_exists(__DIR__ . '/student-services.html') ? 'status-ok' : 'status-fail'; ?>">
              <?php echo file_exists(__DIR__ . '/student-services.html') ? '✅ جاهز ومحدث' : '❌ مفقود'; ?>
            </span>
          </li>
          <li>
            <span>2. صفحات خدمات ما بعد الوصول (7 صفحات فرعية)</span>
            <span class="<?php echo file_exists(__DIR__ . '/service-airport-pickup.html') && file_exists(__DIR__ . '/service-family-support.html') ? 'status-ok' : 'status-fail'; ?>">
              <?php echo file_exists(__DIR__ . '/service-airport-pickup.html') ? '✅ الـ 7 صفحات محدثة' : '❌ مفقود'; ?>
            </span>
          </li>
          <li>
            <span>3. بيانات خدمات الطلاب وباقات الوصول (data/student-services.json)</span>
            <span class="<?php echo file_exists(__DIR__ . '/data/student-services.json') ? 'status-ok' : 'status-fail'; ?>">
              <?php echo file_exists(__DIR__ . '/data/student-services.json') ? '✅ موجود ومحدث' : '❌ مفقود'; ?>
            </span>
          </li>
          <li>
            <span>4. الصفحة الرئيسية للمنصة (index.html)</span>
            <span class="<?php echo file_exists(__DIR__ . '/index.html') ? 'status-ok' : 'status-fail'; ?>">
              <?php echo file_exists(__DIR__ . '/index.html') ? '✅ جاهز' : '❌ مفقود'; ?>
            </span>
          </li>
          <li>
            <span>5. دليل الجامعات والبرامج (universities.html & programs.html)</span>
            <span class="<?php echo file_exists(__DIR__ . '/universities.html') ? 'status-ok' : 'status-fail'; ?>">
              <?php echo file_exists(__DIR__ . '/universities.html') ? '✅ جاهز' : '❌ مفقود'; ?>
            </span>
          </li>
          <li>
            <span>6. مراكز اللغة والدرجات أونلاين (language-centers & online-degrees)</span>
            <span class="<?php echo file_exists(__DIR__ . '/language-centers.html') ? 'status-ok' : 'status-fail'; ?>">
              <?php echo file_exists(__DIR__ . '/language-centers.html') ? '✅ جاهز' : '❌ مفقود'; ?>
            </span>
          </li>
          <li>
            <span>7. مجلد اللغات والترجمات الكاملة (locales/ - 9 لغات)</span>
            <span class="<?php echo is_dir(__DIR__ . '/locales') ? 'status-ok' : 'status-fail'; ?>">
              <?php echo is_dir(__DIR__ . '/locales') ? '✅ 9 لغات معتمدة' : '❌ مفقود'; ?>
            </span>
          </li>
          <li>
            <span>8. مجلد التصاميم والستايلات التفاعلية (assets/css & assets/js)</span>
            <span class="<?php echo is_dir(__DIR__ . '/assets') ? 'status-ok' : 'status-fail'; ?>">
              <?php echo is_dir(__DIR__ . '/assets') ? '✅ كود الإصدار v88.0' : '❌ مفقود'; ?>
            </span>
          </li>
        </ul>

        <div style="margin-top:25px;">
          <a href="student-services.html" class="btn">🚀 معاينة بوابة خدمات الطلاب مباشرة</a>
          <a href="index.html" class="btn btn-secondary">🌐 فتح الصفحة الرئيسية للموقع</a>
        </div>

        <div class="info-box" style="margin-top:20px;">
          🔒 <strong>خطوة أمان اختيارية:</strong> بعد التأكد من عمل الموقع، يمكنك حذف ملف <code>unzip.php</code> وملف <code>.zip</code> من مدير الملفات للحفاظ على نظافة وأمان السيرفر.
        </div>

      <?php } else { ?>
        <div class="alert alert-danger">
          <div>
            <strong>❌ تعذر فك ضغط الأرشيف (رمز الخطأ: <?php echo $res; ?>)!</strong><br>
            تأكد من اكتمال رفع ملف الـ ZIP وعدم انقطاع الاتصال أثناء الرفع.
          </div>
        </div>
      <?php } ?>

    <?php else: ?>
      <div class="alert alert-info">
        <div>
          📦 <strong>تم العثور على الأرشيف الشامل:</strong><br>
          الملف: <code><?php echo htmlspecialchars($targetZip); ?></code><br>
          الحجم: <strong><?php echo $zipSizeMB; ?> ميجابايت</strong>
        </div>
      </div>

      <form method="POST" action="unzip.php">
        <input type="hidden" name="extract" value="1">
        <div style="margin: 18px 0; font-size: 14px;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" name="delete_after" value="1" style="width:18px; height:18px;">
            <span>حذف ملف الـ ZIP تلقائياً بعد فك الضغط لتوفير مساحة الاستضافة</span>
          </label>
        </div>
        <button type="submit" class="btn">⚡ ابدأ فك الضغط وتحديث الموقع الآن</button>
      </form>
    <?php endif; ?>
  <?php endif; ?>
</div>

</body>
</html>
