// StudyCo - Online Degrees Directory (UK, Malaysia, New Zealand, Australia)
import { i18n } from './i18n.js?v=88.0';
import { CONFIG } from './config.js?v=88.0';
import { convertFromMYR, getExchangeRates } from './currency.js?v=88.0';

const COUNTRY_KEY = {
  malaysia: 'dest_malaysia',
  australia: 'dest_australia',
  uk: 'dest_uk',
  canada: 'dest_canada',
  newzealand: 'dest_newzealand',
  singapore: 'dest_singapore'
};

const FLAG = {
  malaysia: 'assets/photo/flag-malaysia.svg',
  australia: 'assets/photo/flag-australia.svg',
  uk: 'assets/photo/flag-uk.svg',
  canada: 'assets/photo/flag-canada.svg',
  newzealand: 'assets/photo/flag-newzealand.svg',
  singapore: 'assets/photo/flag-singapore.svg'
};

const TRANSLATIONS = {
  levels: {
    '': { ar: 'جميع الدرجات العلمية', en: 'All Degree Levels', id: 'Semua Jenjang Gelar', zh: '所有学位级别', es: 'Todos los niveles', fr: 'Tous les niveaux', ru: 'Все степени', ja: 'すべての学位', ko: '모든 학위 과정' },
    bachelor: { ar: 'بكالوريوس أونلاين', en: 'Online Bachelor', id: 'Program Sarjana Online', zh: '在线学士', es: 'Licenciatura en línea', fr: 'Licence en ligne', ru: 'Онлайн бакалавриат', ja: 'オンライン学士', ko: '온라인 학사' },
    master: { ar: 'ماجستير & MBA أونلاين', en: 'Online Master & MBA', id: 'Program Magister & MBA', zh: '在线硕士与MBA', es: 'Máster y MBA en línea', fr: 'Master & MBA en ligne', ru: 'Онлайн магистратура и MBA', ja: 'オンライン修士＆MBA', ko: '온라인 석사 및 MBA' },
    phd: { ar: 'دكتوراه أونلاين', en: 'Online PhD', id: 'Program Doktor Online', zh: '在线博士', es: 'Doctorado en línea', fr: 'Doctorat en ligne', ru: 'Онлайн докторантура', ja: 'オンライン博士', ko: '온라인 박사' },
    diploma: { ar: 'دبلوم وشهادات مهنية', en: 'Diploma & Certifications', id: 'Diploma & Sertifikasi', zh: '文凭与专业证书', es: 'Diploma y certificaciones', fr: 'Diplôme & certificats', ru: 'Диплом и сертификаты', ja: 'ディプロマ・認定証', ko: '디플로마 및 자격' }
  },
  fields: {
    '': { ar: 'جميع التخصصات', en: 'All Study Fields', id: 'Semua Bidang Studi', zh: '所有学科专业', es: 'Todas las áreas', fr: 'Tous les domaines', ru: 'Все специальности', ja: 'すべての専門分野', ko: '모든 전공 분야' },
    business: { ar: 'إدارة الأعمال والمحاسبة', en: 'Business & Management', id: 'Bisnis & Manajemen', zh: '商业与管理', es: 'Negocios y Administración', fr: 'Commerce & Gestion', ru: 'Бизнес и менеджмент', ja: 'ビジネス・経営学', ko: '경영학 및 비즈니스' },
    cs: { ar: 'علوم الحاسوب والذكاء الاصطناعي', en: 'Computer Science & AI', id: 'Ilmu Komputer & AI', zh: '计算机科学与AI', es: 'Informática e IA', fr: 'Informatique & IA', ru: 'Информатика и ИИ', ja: 'コンピュータ科学・AI', ko: '컴퓨터 공학 및 AI' },
    engineering: { ar: 'الهندسة والتكنولوجيا', en: 'Engineering & Technology', id: 'Teknik & Teknologi', zh: '工程与技术', es: 'Ingeniería y Tecnología', fr: 'Ingénierie & Technologie', ru: 'Инженерия и технологии', ja: '工学・技術', ko: '공학 및 기술' },
    health: { ar: 'العلوم الصحية والطبية', en: 'Health & Medical Sciences', id: 'Ilmu Kesehatan & Medis', zh: '健康与医学科学', es: 'Ciencias de la Salud', fr: 'Sciences de la santé', ru: 'Медицинские науки', ja: '健康・医療科学', ko: '보건 및 의료 과학' },
    education: { ar: 'التربية والتعليم', en: 'Education & Teaching', id: 'Pendidikan & Keguruan', zh: '教育与教学', es: 'Educación y Enseñanza', fr: 'Éducation & Enseignement', ru: 'Образование и педагогика', ja: '教育・指導法', ko: '교육 및 교수법' },
    arts: { ar: 'الآداب والعلوم الإنسانية', en: 'Arts & Humanities', id: 'Seni & Humaniora', zh: '人文与艺术', es: 'Artes y Humanidades', fr: 'Arts & Lettres', ru: 'Гуманитарные науки', ja: '人文学・芸術', ko: '인문학 및 예술' },
    law: { ar: 'القانون والدراسات الدولية', en: 'Law & International Studies', id: 'Hukum & Studi Internasional', zh: '法律与国际研究', es: 'Derecho y Estudios Internacionales', fr: 'Droit & Études internationales', ru: 'Право и международные исследования', ja: '法学・国際研究', ko: '법학 및 국제학' }
  },
  countries: {
    '': { ar: 'جميع الدول', en: 'All Countries', id: 'Semua Negara', zh: '所有国家', es: 'Todos los países', fr: 'Tous les pays', ru: 'Все страны', ja: 'すべての国', ko: '모든 국가' },
    malaysia: { ar: 'ماليزيا', en: 'Malaysia', id: 'Malaysia', zh: '马来西亚', es: 'Malasia', fr: 'Malaisie', ru: 'Малайзия', ja: 'マレーシア', ko: '말레이시아' },
    uk: { ar: 'بريطانيا', en: 'United Kingdom', id: 'Inggris', zh: '英国', es: 'Reino Unido', fr: 'Royaume-Uni', ru: 'Великобритания', ja: 'イギリス', ko: '영국' },
    newzealand: { ar: 'نيوزيلندا', en: 'New Zealand', id: 'Selandia Baru', zh: '新西兰', es: 'Nueva Zelanda', fr: 'Nouvelle-Zélande', ru: 'Новая Зеландия', ja: 'ニュージーランド', ko: '뉴질랜드' },
    australia: { ar: 'أستراليا', en: 'Australia', id: 'Australia', zh: '澳大利亚', es: 'Australia', fr: 'Australie', ru: 'Австралия', ja: 'オーストラリア', ko: '호주' }
  },
  sort: {
    default: { ar: 'الأكثر ملاءمة', en: 'Most Relevant', id: 'Paling Relevan', zh: '最相关', es: 'Más relevante', fr: 'Plus pertinent', ru: 'По релевантности', ja: '関連順', ko: '관련성 높은 순' },
    asc: { ar: 'الرسوم: من الأقل للأعلى', en: 'Tuition: Low to High', id: 'Biaya: Terendah ke Tertinggi', zh: '学费：从低到高', es: 'Precio: Menor a Mayor', fr: 'Frais : Croissant', ru: 'Стоимость: по возрастанию', ja: '学費：安い順', ko: '학비: 낮은 순' },
    desc: { ar: 'الرسوم: من الأعلى للأقل', en: 'Tuition: High to Low', id: 'Biaya: Tertinggi ke Terendah', zh: '学费：从高到低', es: 'Precio: Mayor a Menor', fr: 'Frais : Décroissant', ru: 'Стоимость: по убыванию', ja: '学費：高い順', ko: '학비: 높은 순' }
  },
  ui: {
    detailsBtn: { ar: 'الخطة والتفاصيل', en: 'Syllabus & Details', id: 'Rencana & Detail', zh: '方案与详情', es: 'Plan y detalles', fr: 'Programme & Détails', ru: 'План и детали', ja: 'カリキュラム詳細', ko: '학습 계획 및 상세' },
    applyBtn: { ar: 'قدم عبر واتساب', en: 'Apply via WhatsApp', id: 'Daftar via WhatsApp', zh: 'WhatsApp 咨询', es: 'Aplicar por WhatsApp', fr: 'Postuler via WhatsApp', ru: 'Подать через WhatsApp', ja: 'WhatsAppでお問合せ', ko: 'WhatsApp으로 지원' },
    onlineBadge: { ar: 'دراسة أونلاين عن بُعد', en: 'Online Degree', id: 'Gelar Online', zh: '在线远程课程', es: 'Estudio en línea', fr: 'Étude en ligne', ru: 'Онлайн обучение', ja: 'オンライン遠隔学位', ko: '온라인 원격 학위' },
    annualTuition: { ar: 'الرسوم الدراسية السنوية:', en: 'Annual Tuition:', id: 'Biaya Kuliah Per Tahun:', zh: '每年学费：', es: 'Matrícula anual:', fr: 'Frais annuels :', ru: 'Годовая оплата:', ja: '年間授業料：', ko: '연간 학비:' },
    perYear: { ar: 'سنوياً', en: 'per year', id: 'per tahun', zh: '每年', es: 'por año', fr: 'par an', ru: 'в год', ja: '年間', ko: '연간' },
    academicYears: { ar: 'سنوات دراسية', en: 'Academic Years', id: 'Tahun Akademik', zh: '学年', es: 'Años académicos', fr: 'Années d’études', ru: 'Учебных года', ja: '学年', ko: '학년' },
    prev: { ar: 'السابق', en: 'Previous', id: 'Sebelumnya', zh: '上一页', es: 'Anterior', fr: 'Précédent', ru: 'Назад', ja: '前へ', ko: '이전' },
    next: { ar: 'التالي', en: 'Next', id: 'Selanjutnya', zh: '下一页', es: 'Siguiente', fr: 'Suivant', ru: 'Далее', ja: '次へ', ko: '다음' },
    searchPlaceholder: { ar: 'ابحث باسم البرنامج أو التخصص أو الجامعة...', en: 'Search program, major, or university...', id: 'Cari nama program, jurusan, atau universitas...', zh: '按专业名称、学科或大学搜索...', es: 'Buscar por programa, área o universidad...', fr: 'Rechercher par programme, domaine ou université...', ru: 'Поиск по названию программы или университету...', ja: 'プログラム名、専攻、大学名で検索...', ko: '프로그램명, 전공 또는 대학명 검색...' }
  }
};

function getFieldTheme(field) {
  switch (field) {
    case 'health':
      return {
        gradient: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
        accent: '#10b981',
        iconSvg: '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>'
      };
    case 'business':
      return {
        gradient: 'linear-gradient(135deg, #1e40af 0%, #172554 100%)',
        accent: '#3b82f6',
        iconSvg: '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>'
      };
    case 'cs':
      return {
        gradient: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
        accent: '#818cf8',
        iconSvg: '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>'
      };
    case 'engineering':
      return {
        gradient: 'linear-gradient(135deg, #ea580c 0%, #431407 100%)',
        accent: '#f97316',
        iconSvg: '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
      };
    case 'education':
      return {
        gradient: 'linear-gradient(135deg, #0284c7 0%, #082f49 100%)',
        accent: '#38bdf8',
        iconSvg: '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>'
      };
    case 'arts':
      return {
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #3b0764 100%)',
        accent: '#a855f7',
        iconSvg: '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>'
      };
    case 'law':
      return {
        gradient: 'linear-gradient(135deg, #b45309 0%, #451a03 100%)',
        accent: '#f59e0b',
        iconSvg: '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="3" x2="12" y2="21"></line><path d="M6 8l6-5 6 5"></path><path d="M6 18l6 3 6-3"></path></svg>'
      };
    default:
      return {
        gradient: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)',
        accent: '#94a3b8',
        iconSvg: '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>'
      };
  }
}

function getProgramImage(p) {
  if (p.image) return p.image;
  const text = `${p.name || ''} ${p.nameAr || ''} ${p.field || ''}`.toLowerCase();
  
  // Health sub-specialties
  if (text.includes('nurs') || text.includes('تمريض')) return 'assets/photo/programs/nursing.webp';
  if (text.includes('imaging') || text.includes('radiolog') || text.includes('تصوير') || text.includes('أشعة')) return 'assets/photo/programs/medical_imaging.webp';
  if (text.includes('biomed') || text.includes('حيوية')) return 'assets/photo/programs/biomedical.webp';
  if (text.includes('pharm') || text.includes('صيدل')) return 'assets/photo/programs/pharmacy.webp';
  if (text.includes('physio') || text.includes('علاج طبيعي')) return 'assets/photo/programs/physiotherapy.webp';
  if (text.includes('environmental health') || text.includes('سلامة بيئية') || text.includes('بيئية')) return 'assets/photo/programs/environmental_health.webp';
  if (text.includes('public health') || text.includes('صحة عامة')) return 'assets/photo/programs/public_health.webp';
  if (text.includes('health') || text.includes('medical') || text.includes('طب') || text.includes('صح')) return 'assets/photo/programs/health_general.webp';

  // Computer Science & AI
  if (text.includes('artificial intelligence') || text.includes('ai') || text.includes('ذكاء اصطناعي')) return 'assets/photo/programs/ai_robotics.webp';
  if (text.includes('data science') || text.includes('analytics') || text.includes('بيانات') || text.includes('تحليلات')) return 'assets/photo/programs/data_science.webp';
  if (text.includes('cyber') || text.includes('أمن سيبراني') || text.includes('security')) return 'assets/photo/programs/cybersecurity.webp';
  if (text.includes('software') || text.includes('برمجيات')) return 'assets/photo/programs/software_eng.webp';
  if (text.includes('cloud') || text.includes('network') || text.includes('شبكات') || text.includes('سحابية')) return 'assets/photo/programs/cloud_computing.webp';
  if (p.field === 'cs' || text.includes('comput') || text.includes('حاسوب') || text.includes('تقنية معلومات') || text.includes('information tech')) return 'assets/photo/programs/computer_science.webp';

  // Business & Finance
  if (text.includes('mba') || text.includes('إدارة أعمال')) return 'assets/photo/programs/mba.webp';
  if (text.includes('account') || text.includes('محاسب')) return 'assets/photo/programs/accounting.webp';
  if (text.includes('financ') || text.includes('تمويل') || text.includes('مالي') || text.includes('banking')) return 'assets/photo/programs/finance.webp';
  if (text.includes('market') || text.includes('تسويق')) return 'assets/photo/programs/marketing.webp';
  if (text.includes('hospitality') || text.includes('tourism') || text.includes('hotel') || text.includes('فندق') || text.includes('سياح') || text.includes('ضياف')) return 'assets/photo/programs/hospitality.webp';
  if (text.includes('supply chain') || text.includes('logistics') || text.includes('إمداد') || text.includes('لوجست')) return 'assets/photo/programs/logistics.webp';
  if (text.includes('human resource') || text.includes('hr') || text.includes('موارد بشرية')) return 'assets/photo/programs/human_resources.webp';
  if (text.includes('project manag') || text.includes('إدارة مشاريع')) return 'assets/photo/programs/project_management.webp';
  if (p.field === 'business' || text.includes('management') || text.includes('business') || text.includes('إدار') || text.includes('أعمال')) return 'assets/photo/programs/business_admin.webp';

  // Engineering
  if (text.includes('civil') || text.includes('مدني') || text.includes('إنشاء')) return 'assets/photo/programs/civil_engineering.webp';
  if (text.includes('mechanical') || text.includes('ميكانيك')) return 'assets/photo/programs/mechanical_engineering.webp';
  if (text.includes('electrical') || text.includes('electronic') || text.includes('كهربا')) return 'assets/photo/programs/electrical_engineering.webp';
  if (text.includes('chemical') || text.includes('كيميائي')) return 'assets/photo/programs/chemical_engineering.webp';
  if (text.includes('petroleum') || text.includes('نفط') || text.includes('oil')) return 'assets/photo/programs/petroleum_engineering.webp';
  if (p.field === 'engineering' || text.includes('engineer') || text.includes('هندس')) return 'assets/photo/programs/engineering_general.webp';

  // Education
  if (text.includes('early child') || text.includes('طفولة')) return 'assets/photo/programs/early_childhood.webp';
  if (text.includes('tesol') || text.includes('english teaching') || text.includes('تعليم اللغة')) return 'assets/photo/programs/language_teaching.webp';
  if (p.field === 'education' || text.includes('education') || text.includes('teaching') || text.includes('تربي') || text.includes('تعليم')) return 'assets/photo/programs/education_general.webp';

  // Law
  if (text.includes('international law') || text.includes('قانون دولي')) return 'assets/photo/programs/international_law.webp';
  if (p.field === 'law' || text.includes('law') || text.includes('legal') || text.includes('حقوق') || text.includes('قانون')) return 'assets/photo/programs/law_general.webp';

  // Arts & Media
  if (text.includes('graphic') || text.includes('design') || text.includes('تصميم')) return 'assets/photo/programs/graphic_design.webp';
  if (text.includes('media') || text.includes('journalism') || text.includes('إعلام') || text.includes('صحاف')) return 'assets/photo/programs/media_journalism.webp';
  if (text.includes('psycholog') || text.includes('نفس')) return 'assets/photo/programs/psychology.webp';
  if (text.includes('international relation') || text.includes('علاقات دولية')) return 'assets/photo/programs/international_relations.webp';
  if (p.field === 'arts' || text.includes('art') || text.includes('humanit') || text.includes('آداب') || text.includes('فنون')) return 'assets/photo/programs/arts_humanities.webp';

  return 'assets/photo/programs/academic_general.webp';
}

export class OnlineDegreesDirectory {
  constructor() {
    this.programs = [];
    this.universities = [];
    this.filters = { search: '', level: '', field: '', country: '' };
    this.sort = 'default';
    this.currency = localStorage.getItem('studyco_currency') || 'native';
    this.currentPage = 1;
    this.pageSize = 18;
    this.exchangeData = null;
  }

  async init() {
    this.parseUrlParams();

    try {
      let progData = null;
      try {
        const progRes = await fetch('./data/online-programs.json?v=' + Date.now(), { cache: 'no-cache' });
        if (progRes.ok) {
          progData = await progRes.json();
        }
      } catch (e) {
        console.warn('[OnlineDegrees] Fallback to programs.json', e);
      }

      if (!progData) {
        const progRes = await fetch('./data/programs.json?v=20261107', { cache: 'default' });
        progData = await progRes.json();
      }

      const [uniRes, exchangeData] = await Promise.all([
        fetch('./data/universities.json?v=' + Date.now(), { cache: 'no-cache' }),
        getExchangeRates()
      ]);
      const allPrograms = progData.programs || progData || [];
      const uniData = await uniRes.json();
      this.universities = uniData.universities || uniData || [];
      this.exchangeData = exchangeData;

      const uniById = Object.fromEntries(this.universities.map((u) => [u.id, u]));

      // Filter to online degrees only
      this.programs = allPrograms.filter((p) => {
        return p.studyMode === 'online' || p.mode === 'online' || p.isOnline === true;
      });

      // Live CMS overrides overlay (Server data/cms-overrides.json + Client localStorage)
      const applyOnlineOverrides = (ov) => {
        if (!ov) return;
        const modified = ov.online_degrees?.modified || ov.online_degrees || {};
        Object.values(modified).forEach(p => {
          if (p && p.id) {
            const idx = this.programs.findIndex(x => x.id === p.id);
            if (idx >= 0) this.programs[idx] = Object.assign({}, this.programs[idx], p);
            else this.programs.unshift(p);
          }
        });
        const deleted = ov.deleted_online_degrees || ov.online_degrees?.deleted || [];
        if (Array.isArray(deleted) && deleted.length > 0) {
          const delSet = new Set(deleted);
          this.programs = this.programs.filter(p => !delSet.has(p.id));
        }
      };

      try {
        const ovRes = await fetch('./data/cms-overrides.json?v=' + Date.now(), { cache: 'no-cache' });
        if (ovRes.ok) applyOnlineOverrides(await ovRes.json());
      } catch (e) {}

      // Client-side preview overrides from localStorage (Vercel / Offline mode)
      try {
        const localOv = JSON.parse(localStorage.getItem('studyco_cms_overrides') || 'null');
        if (localOv) applyOnlineOverrides(localOv);
        const localDegrees = JSON.parse(localStorage.getItem('studyco_online_degrees') || 'null');
        if (Array.isArray(localDegrees) && localDegrees.length > 0) {
          localDegrees.forEach(p => {
            if (p && p.id) {
              const idx = this.programs.findIndex(x => x.id === p.id);
              if (idx >= 0) this.programs[idx] = Object.assign({}, this.programs[idx], p);
              else this.programs.unshift(p);
            }
          });
        }
      } catch (e) {}

      this.programs.forEach((p) => {
        p._university = uniById[p.universityId] || null;
        p._searchStr = `${p.name || ''} ${p.nameAr || ''} ${p._university?.name || ''} ${p._university?.arabicName || ''} ${p.field || ''}`.toLowerCase();
      });
    } catch (err) {
      console.warn('[OnlineDegrees] Could not load data:', err);
    }

    this.populateFilters();
    this.bindEvents();
    this.render();

    window.addEventListener('languageChanged', () => {
      this.populateFilters();
      this.render();
    });

    window.addEventListener('currencyChanged', (e) => {
      if (e.detail?.currency) {
        this.currency = e.detail.currency;
      }
      this.render();
    });
  }

  parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const lvl = params.get('level');
    if (lvl) this.filters.level = lvl;
    const fld = params.get('field');
    if (fld) this.filters.field = fld;
    const country = params.get('country');
    if (country) this.filters.country = country;
    const search = params.get('q');
    if (search) this.filters.search = search.toLowerCase();
  }

  populateFilters() {
    const lang = i18n.currentLang || 'ar';
    const levelSelect = document.getElementById('online-filter-level');
    const fieldSelect = document.getElementById('online-filter-field');
    const countrySelect = document.getElementById('online-filter-country');
    const sortSelect = document.getElementById('online-sort');
    const searchInput = document.getElementById('online-search');
    const resetBtn = document.getElementById('online-filter-reset');

    if (searchInput) {
      const ph = TRANSLATIONS.ui.searchPlaceholder[lang] || TRANSLATIONS.ui.searchPlaceholder.ar;
      searchInput.placeholder = ph;
    }

    if (resetBtn) {
      resetBtn.textContent = lang === 'ar' ? 'إعادة ضبط' : (lang === 'id' ? 'Reset Filter' : 'Reset Filters');
    }

    if (levelSelect) {
      levelSelect.innerHTML = Object.entries(TRANSLATIONS.levels).map(([k, v]) => {
        const text = v[lang] || v.ar;
        return `<option value="${k}">${text}</option>`;
      }).join('');
      levelSelect.value = this.filters.level;
    }

    if (fieldSelect) {
      fieldSelect.innerHTML = Object.entries(TRANSLATIONS.fields).map(([k, v]) => {
        const text = v[lang] || v.ar;
        return `<option value="${k}">${text}</option>`;
      }).join('');
      fieldSelect.value = this.filters.field;
    }

    if (countrySelect) {
      countrySelect.innerHTML = Object.entries(TRANSLATIONS.countries).map(([k, v]) => {
        const text = v[lang] || v.ar;
        return `<option value="${k}">${text}</option>`;
      }).join('');
      countrySelect.value = this.filters.country;
    }

    if (sortSelect) {
      sortSelect.innerHTML = Object.entries(TRANSLATIONS.sort).map(([k, v]) => {
        const text = v[lang] || v.ar;
        return `<option value="${k}">${text}</option>`;
      }).join('');
      sortSelect.value = this.sort;
    }
  }

  bindEvents() {
    const search = document.getElementById('online-search');
    const level = document.getElementById('online-filter-level');
    const field = document.getElementById('online-filter-field');
    const country = document.getElementById('online-filter-country');
    const reset = document.getElementById('online-filter-reset');
    const sort = document.getElementById('online-sort');
    const currency = document.getElementById('currency-select');

    if (search) {
      let debounceTimer = null;
      search.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.filters.search = search.value.trim().toLowerCase();
          this.currentPage = 1;
          this.render();
        }, 150);
      });
    }
    if (level) {
      level.addEventListener('change', () => {
        this.filters.level = level.value;
        this.currentPage = 1;
        this.render();
      });
    }
    if (field) {
      field.addEventListener('change', () => {
        this.filters.field = field.value;
        this.currentPage = 1;
        this.render();
      });
    }
    if (country) {
      country.addEventListener('change', () => {
        this.filters.country = country.value;
        this.currentPage = 1;
        this.render();
      });
    }
    if (sort) {
      sort.addEventListener('change', () => {
        this.sort = sort.value;
        this.currentPage = 1;
        this.render();
      });
    }
    if (currency) {
      currency.addEventListener('change', () => {
        this.currency = currency.value;
        this.render();
      });
    }
    if (reset) {
      reset.addEventListener('click', () => {
        this.filters = { search: '', level: '', field: '', country: '' };
        if (search) search.value = '';
        if (level) level.value = '';
        if (field) field.value = '';
        if (country) country.value = '';
        this.currentPage = 1;
        this.render();
      });
    }

    // Modal click delegation
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-program-modal');
      if (btn) {
        const progId = btn.getAttribute('data-prog-id');
        const prog = this.programs.find((p) => String(p.id) === String(progId));
        if (prog) this.openProgramModal(prog);
      }
      if (e.target.closest('#online-modal-close') || e.target.classList.contains('course-modal-backdrop')) {
        this.closeProgramModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeProgramModal();
    });
  }

  matches(p) {
    if (this.filters.search) {
      if (!p._searchStr || !p._searchStr.includes(this.filters.search)) return false;
    }
    if (this.filters.level && p.level !== this.filters.level) return false;
    if (this.filters.field && p.field !== this.filters.field) return false;
    if (this.filters.country && p._university?.country !== this.filters.country) return false;
    return true;
  }

  sortedList(list) {
    if (this.sort === 'default') return list;
    const copy = [...list];
    if (this.sort === 'asc') {
      return copy.sort((a, b) => (a.annualFee || 0) - (b.annualFee || 0));
    }
    if (this.sort === 'desc') {
      return copy.sort((a, b) => (b.annualFee || 0) - (a.annualFee || 0));
    }
    return copy;
  }

  formatPrice(p) {
    const fee = p.annualFee || 15000;
    const curr = p.currency || (p._university?.country === 'uk' ? 'GBP' : p._university?.country === 'newzealand' ? 'NZD' : 'MYR');
    const lang = i18n.currentLang || 'ar';
    const perYear = TRANSLATIONS.ui.perYear[lang] || TRANSLATIONS.ui.perYear.ar;

    if (this.currency === 'native' || !this.currency) {
      const sym = curr === 'MYR' ? 'RM ' : curr === 'GBP' ? '£' : curr === 'NZD' ? 'NZ$ ' : '$ ';
      return `${sym}${fee.toLocaleString()} / ${perYear}`;
    }

    return convertFromMYR(fee, this.currency, this.exchangeData);
  }

  filteredList() {
    return this.programs.filter((p) => this.matches(p));
  }

  render() {
    const grid = document.getElementById('online-grid') || document.getElementById('online-programs-grid');
    const pagination = document.getElementById('online-pagination');
    const countBadge = document.getElementById('online-count-badge');
    const noResults = document.getElementById('online-no-results');
    if (!grid) return;

    const list = this.filteredList();
    const sorted = this.sortedList(list);

    const lang = i18n.currentLang || 'ar';
    const isAr = (lang === 'ar');

    if (countBadge) {
      countBadge.textContent = isAr ? `${sorted.length} برنامج` : `${sorted.length} Programs`;
    }

    if (sorted.length === 0) {
      grid.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
      if (pagination) pagination.innerHTML = '';
      return;
    }

    if (noResults) noResults.style.display = 'none';

    const totalPages = Math.ceil(sorted.length / this.pageSize);
    if (this.currentPage > totalPages) this.currentPage = 1;

    const start = (this.currentPage - 1) * this.pageSize;
    const paged = sorted.slice(start, start + this.pageSize);

    grid.innerHTML = '';

    paged.forEach((p) => {
      const card = document.createElement('article');
      card.className = 'entity-card';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.justifyContent = 'space-between';

      let progTitle = (isAr && p.nameAr) ? p.nameAr : p.name;
      if (isAr && progTitle) {
        progTitle = progTitle
          .replace(/\s*في\s*Online\s*Degree/gi, ' أونلاين')
          .replace(/\s*[-–]\s*Online\s*Degree/gi, ' أونلاين')
          .replace(/\s*Online\s*Degree/gi, ' أونلاين')
          .replace(/\s*\(Online\)/gi, ' أونلاين')
          .replace(/\s*online/gi, ' أونلاين')
          .replace(/\s*أونلاين\s*أونلاين/g, ' أونلاين')
          .replace(/\s*في\s*–\s*/g, ' ')
          .replace(/\s*في\s*-\s*/g, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim();
      }

      const uniName = (isAr && p._university?.arabicName) ? p._university.arabicName : (p._university?.name || 'University');
      const waMsg = isAr
        ? `مرحباً StudyCo، أود الاستفسار والتسجيل في البرنامج الأونلاين: ${progTitle} في جامعة ${uniName}.`
        : `Hello StudyCo, I would like to inquire about the online program: ${p.name} at ${p._university?.name}.`;

      const levelObj = TRANSLATIONS.levels[p.level] || TRANSLATIONS.levels[''];
      const levelLabel = levelObj[lang] || levelObj.ar;

      const fieldTheme = getFieldTheme(p.field);
      const fieldObj = TRANSLATIONS.fields[p.field] || TRANSLATIONS.fields[''];
      const fieldLabel = fieldObj[lang] || fieldObj.ar;

      const detailsBtnText = TRANSLATIONS.ui.detailsBtn[lang] || TRANSLATIONS.ui.detailsBtn.ar;
      const applyBtnText = TRANSLATIONS.ui.applyBtn[lang] || TRANSLATIONS.ui.applyBtn.ar;
      const onlineBadgeText = TRANSLATIONS.ui.onlineBadge[lang] || TRANSLATIONS.ui.onlineBadge.ar;
      const annualTuitionLabel = TRANSLATIONS.ui.annualTuition[lang] || TRANSLATIONS.ui.annualTuition.ar;
      const academicYearsText = TRANSLATIONS.ui.academicYears[lang] || TRANSLATIONS.ui.academicYears.ar;

      const cleanedEngName = (p.name || '')
        .replace(/\s*[-–]\s*Online\s*Degree/gi, '')
        .replace(/\s*\(Online\)/gi, '')
        .trim();

      const subtitleHtml = (isAr && cleanedEngName && cleanedEngName !== progTitle)
        ? `<p style="font-size: 0.8rem; color: var(--color-gray-500); margin: 0 0 0.65rem 0; font-weight: 500; line-height: 1.35; direction: ltr; text-align: ${isAr ? 'right' : 'left'};">${cleanedEngName}</p>`
        : '';

      card.innerHTML = `
        <div>
          <!-- Authentic Academic Specialization Photo Banner with Field Badge and Uni Logo -->
          <div style="position: relative; height: 135px; border-radius: 0.75rem; overflow: hidden; margin: -1.25rem -1.25rem 1rem -1.25rem; background: #0f172a;">
            <img src="${p.image || getProgramImage(p)}" alt="${progTitle}" loading="lazy" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: brightness(0.9); transition: transform 0.4s ease;" onerror="this.src='${p._university?.image || 'assets/photo/hero_student_clean.webp'}'">
            <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.72) 100%);"></div>
            
            <span style="position: absolute; inset-block-start: 10px; inset-inline-start: 10px; background: rgba(15,23,42,0.78); backdrop-filter: blur(8px); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px; border: 1px solid rgba(255,255,255,0.25); z-index: 2;">
              ${fieldTheme.iconSvg} <span>${fieldLabel}</span>
            </span>

            <a href="university.html?id=${p.universityId}" title="${uniName}" style="position: absolute; inset-block-end: 10px; inset-inline-end: 10px; width: 50px; height: 50px; background: #ffffff; border-radius: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; padding: 4px; z-index: 2; border: 1px solid rgba(255,255,255,0.85);">
              <img alt="${uniName}" src="${p._university?.logo || 'assets/photo/logo.webp'}" onerror="this.onerror=null; this.src='assets/photo/logo.webp';" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain;">
            </a>
          </div>

          <h3 class="entity-card-title" style="display: block !important; text-align: start !important; min-height: 48px; font-size: 1.08rem; font-weight: 700; margin: 0 0 0.35rem 0 !important; line-height: 1.45;">
            <a href="university.html?id=${p.universityId}" style="color:inherit; text-decoration:none;"><bdi>${progTitle}</bdi></a>
          </h3>
          ${subtitleHtml}
          
          <div style="margin-block-end: 0.6rem; display:flex; flex-wrap:wrap; gap:0.35rem;">
            <span class="entity-card-badge" style="background:#f3e8ff; color:#7e22ce; border:1px solid #d8b4fe; font-weight:700; font-size:0.75rem; padding:0.2rem 0.55rem; border-radius:4px; display:inline-flex; align-items:center; gap:4px;">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              ${onlineBadgeText}
            </span>
            <span class="entity-card-badge" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-weight:700; font-size:0.75rem; padding:0.2rem 0.55rem; border-radius:4px; display:inline-flex; align-items:center; gap:4px;">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
              ${levelLabel}
            </span>
          </div>

          <p class="entity-card-meta" style="font-size:0.85rem; color:var(--color-gray-600); margin-block-end:0.35rem; display:flex; align-items:center; gap:6px;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 21h18M3 7v14M21 7v14M6 7V4a1 1 0 011-1h10a1 1 0 011 1v3M9 11v6M15 11v6"></path></svg> 
            <bdi>${uniName}</bdi>
          </p>
          <p class="entity-card-meta" style="font-size:0.85rem; color:var(--color-gray-600); margin-block-end:0.75rem; display:flex; align-items:center; gap:6px;">
            <img alt="" class="entity-flag-icon" src="${FLAG[p._university?.country] || ''}" style="width:14px; height:10px; object-fit:cover; border-radius:2px;"/> 
            <span>${i18n.t(COUNTRY_KEY[p._university?.country] || p._university?.country)}</span>
          </p>
          
          <div style="background:#faf5ff; border:1px solid #f3e8ff; border-radius:0.5rem; padding:0.5rem 0.75rem; margin-block-end:0.6rem;">
            <span style="font-size:0.75rem; color:#6b21a8; display:block;">${annualTuitionLabel}</span>
            <span style="font-size:1.1rem; font-weight:800; color:#581c87;">${this.formatPrice(p)}</span>
          </div>

          <p class="entity-card-meta" style="font-size:0.85rem; color:var(--color-gray-600); display:flex; align-items:center; gap:6px;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> 
            <span>${p.duration || '2-3'} ${academicYearsText}</span>
          </p>
        </div>

        <div class="entity-card-actions" style="margin-block-start:1rem; display:flex; gap:0.5rem;">
          <button class="btn-entity-primary btn-program-modal" data-prog-id="${p.id}" type="button" style="flex:1; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; padding:0.65rem 0.5rem; background:var(--color-primary); color:#000; font-weight:700; font-size:0.88rem; border:none; border-radius:0.5rem; transition:opacity 0.2s;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            <span>${detailsBtnText}</span>
          </button>
          <a class="btn-entity-wa" href="${CONFIG.getWhatsAppLink(waMsg)}" rel="noopener noreferrer" target="_blank" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:0.65rem 0.5rem; background:#25D366; color:#fff; font-weight:700; font-size:0.88rem; text-decoration:none; border-radius:0.5rem; text-align:center;">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2z"/></svg>
            <span>${applyBtnText}</span>
          </a>
        </div>
      `;

      grid.appendChild(card);
    });

    this.renderPagination(totalPages, pagination);
  }

  renderPagination(totalPages, container) {
    if (!container || totalPages <= 1) {
      if (container) container.innerHTML = '';
      return;
    }

    const lang = i18n.currentLang || 'ar';
    const isAr = (lang === 'ar');
    const prevText = TRANSLATIONS.ui.prev[lang] || TRANSLATIONS.ui.prev.ar;
    const nextText = TRANSLATIONS.ui.next[lang] || TRANSLATIONS.ui.next.ar;

    let controls = '';

    if (this.currentPage > 1) {
      controls += `<button class="pagination-btn pagination-prev" data-page="${this.currentPage - 1}">${isAr ? '→ ' + prevText : '← ' + prevText}</button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        controls += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        controls += `<span class="pagination-dots" style="padding:0 0.4rem; color:#94a3b8; font-weight:700;">...</span>`;
      }
    }

    if (this.currentPage < totalPages) {
      controls += `<button class="pagination-btn pagination-next" data-page="${this.currentPage + 1}">${isAr ? nextText + ' ←' : nextText + ' →'}</button>`;
    }

    container.innerHTML = `
      <div class="pagination-controls" style="display:flex; flex-direction:row; align-items:center; justify-content:center; gap:0.5rem; flex-wrap:wrap; width:100%;">
        ${controls}
      </div>
    `;

    container.querySelectorAll('.pagination-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.currentPage = parseInt(btn.getAttribute('data-page'), 10);
        this.render();
        const listEl = document.getElementById('online-degrees-list');
        if (listEl) {
          window.scrollTo({ top: listEl.offsetTop - 80, behavior: 'smooth' });
        }
      });
    });
  }

  openProgramModal(prog) {
    const lang = i18n.currentLang || 'ar';
    const isAr = (lang === 'ar');
    const title = (isAr && prog.nameAr) ? prog.nameAr : prog.name;
    const uni = prog._university;
    const uniName = (isAr && uni?.arabicName) ? uni.arabicName : (uni?.name || 'University');
    const countryLabel = i18n.t(COUNTRY_KEY[uni?.country] || uni?.country);

    let modal = document.getElementById('online-prog-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'online-prog-modal';
      modal.className = 'course-modal-backdrop';
      document.body.appendChild(modal);
    }

    const waMsg = isAr
      ? `مرحباً StudyCo، أود الاستفسار والتسجيل في البرنامج الأونلاين: ${title} بجامعة ${uniName}.`
      : `Hello StudyCo, I would like to inquire about the online program: ${prog.name} at ${uni?.name}.`;

    // Curriculum
    const curr = (isAr && prog.curriculumAr && prog.curriculumAr.length) ? prog.curriculumAr : (prog.curriculum || []);
    let currHtml = '';
    if (curr.length > 0) {
      currHtml = `
        <div style="margin-block-end: 1.5rem;">
          <h4 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-block-end: 0.75rem;">${isAr ? 'الخطة الدراسية السنوية' : 'Annual Curriculum Plan'}</h4>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${curr.map(yr => `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 0.85rem;">
                <strong style="color: #6b21a8; font-size: 0.95rem; display: block; margin-block-end: 0.4rem;">${isAr ? 'السنة ' + yr.year : 'Year ' + yr.year}</strong>
                <ul style="margin: 0; padding-inline-start: 1.25rem; font-size: 0.88rem; color: #475569; line-height: 1.6;">
                  ${(yr.subjects || []).map(s => `<li>${s}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Requirements
    const reqText = isAr ? (prog.requirementsAr || prog.requirements) : (prog.requirements || prog.requirementsAr);
    let reqHtml = '';
    if (reqText) {
      reqHtml = `
        <div style="margin-block-end: 1.5rem;">
          <h4 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-block-end: 0.5rem;">${isAr ? 'شروط ومتطلبات القبول' : 'Admission Requirements'}</h4>
          <p style="font-size: 0.9rem; line-height: 1.7; color: #475569; margin: 0;">${reqText}</p>
        </div>
      `;
    }

    // Careers
    const carText = isAr ? (prog.careerOpportunitiesAr || prog.careerOpportunities) : (prog.careerOpportunities || prog.careerOpportunitiesAr);
    let carHtml = '';
    if (carText) {
      carHtml = `
        <div style="margin-block-end: 1.5rem;">
          <h4 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-block-end: 0.5rem;">${isAr ? 'الفرص المهنية والمستقبل الوظيفي' : 'Career Opportunities'}</h4>
          <p style="font-size: 0.9rem; line-height: 1.7; color: #475569; margin: 0;">${carText}</p>
        </div>
      `;
    }

    // Overview
    const ovText = isAr ? (prog.overviewAr || prog.overview) : (prog.overview || prog.overviewAr);

    modal.innerHTML = `
      <div class="course-modal-dialog" style="max-width: 720px; width: 92%; max-height: 90vh; overflow-y: auto; background: #fff; border-radius: 1.25rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); margin: auto; position: relative; overscroll-behavior: contain;">
        
        <div style="background: linear-gradient(135deg, #2e1065 0%, #1e1b4b 100%); color: #fff; padding: 1.5rem; border-radius: 1.25rem 1.25rem 0 0; position: relative; display: flex; gap: 1.25rem; align-items: center;">
          <button id="online-modal-close" style="position: absolute; inset-block-start: 15px; inset-inline-end: 15px; background: rgba(255,255,255,0.15); color: #fff; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">✕</button>
          
          <div style="width: 80px; height: 80px; background: #fff; border-radius: 0.75rem; padding: 0.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
            <img src="${uni?.logo || 'assets/photo/logo.webp'}" onerror="this.onerror=null; this.src='assets/photo/logo.webp';" alt="${uniName}" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain;">
          </div>
          
          <div style="flex: 1; min-width: 0;">
            <span style="background: #a855f7; color: #fff; font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 4px; display: inline-block; margin-block-end: 6px;">
              ${isAr ? 'برنامج دراسي معتمد أونلاين عن بُعد' : 'Accredited Online Degree Program'}
            </span>
            <h2 style="font-size: 1.3rem; font-weight: 800; margin: 0 0 4px 0; line-height: 1.3;">${title}</h2>
            <p style="font-size: 0.88rem; margin: 0; opacity: 0.85;">${uniName} • ${countryLabel}</p>
          </div>
        </div>

        <div style="padding: 1.5rem;">
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 0.75rem; padding: 1rem; margin-block-end: 1.5rem;">
            <div>
              <span style="font-size: 0.75rem; color: #6b21a8; display: block;">${isAr ? 'الدرجة العلمية' : 'Degree Level'}</span>
              <strong style="font-size: 0.95rem; color: #3b0764;">${prog.level || 'Bachelor'}</strong>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: #6b21a8; display: block;">${isAr ? 'المدة الدراسية' : 'Duration'}</span>
              <strong style="font-size: 0.95rem; color: #3b0764;">${prog.duration || '3'} ${isAr ? 'سنوات' : 'Years'}</strong>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: #6b21a8; display: block;">${isAr ? 'الرسوم السنوية' : 'Annual Fee'}</span>
              <strong style="font-size: 1.05rem; color: #581c87; font-weight: 800;">${this.formatPrice(prog)}</strong>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: #6b21a8; display: block;">${isAr ? 'نمط الدراسة' : 'Study Mode'}</span>
              <strong style="font-size: 0.95rem; color: #15803d;">${isAr ? 'عن بُعد (Online 100%)' : '100% Online'}</strong>
            </div>
          </div>

          <!-- Overview -->
          ${ovText ? `
            <div style="margin-block-end: 1.5rem;">
              <h4 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-block-end: 0.5rem;">${isAr ? 'نبذة عن البرنامج الأكاديمي' : 'About Academic Program'}</h4>
              <p style="font-size: 0.9rem; line-height: 1.7; color: #475569; margin: 0;">${ovText}</p>
            </div>
          ` : ''}

          <!-- Curriculum -->
          ${currHtml}

          <!-- Requirements -->
          ${reqHtml}

          <!-- Career Opportunities -->
          ${carHtml}

          <!-- WhatsApp Action Bar -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-block-start: 1.5rem;">
            <div>
              <span style="font-size: 0.85rem; color: #64748b; display: block;">${isAr ? 'هل تود التسجيل أو فحص مؤهلاتك للقبول؟' : 'Ready to apply or check your admission eligibility?'}</span>
              <span style="font-size: 0.95rem; font-weight: 700; color: #0f172a;">${isAr ? 'مستشار StudyCo مستعد لمساعدتك مجاناً' : 'StudyCo counselor is ready to assist you for free'}</span>
            </div>
            <a href="${CONFIG.getWhatsAppLink(waMsg)}" rel="noopener noreferrer" target="_blank" style="padding: 0.75rem 1.5rem; background: #25D366; color: #fff; font-weight: 800; font-size: 0.95rem; text-decoration: none; border-radius: 0.5rem; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2z"/></svg>
              ${isAr ? 'تواصل وسجل عبر واتساب' : 'Apply via WhatsApp'}
            </a>
          </div>

        </div>
      </div>
    `;

    modal.classList.add('open');
    modal.style.display = 'flex';
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
  }

  closeProgramModal() {
    const modal = document.getElementById('online-prog-modal');
    if (modal) {
      modal.classList.remove('open');
      modal.style.display = 'none';
    }
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
  }
}

// Auto-boot on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.onlineDirectory = new OnlineDegreesDirectory();
    window.onlineDirectory.init();
  });
} else {
  window.onlineDirectory = new OnlineDegreesDirectory();
  window.onlineDirectory.init();
}
