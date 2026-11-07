// StudyCo Student Care — Sub-Service Dynamic Multilingual Renderer
import { CONFIG } from './config.js?v=88.0';
import { i18n } from './i18n.js?v=88.0';

const ICONS_CONFIG = {
  'airport-pickup': {
    cls: 'icon-plane',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><path d="M17 3l4 4-10 10H7v-4L17 3z"/></svg>'
  },
  'accommodation': {
    cls: 'icon-home',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
  },
  'essential-activations': {
    cls: 'icon-card',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="7" cy="15" r="1.5"/></svg>'
  },
  'pre-departure': {
    cls: 'icon-grad',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>'
  },
  'orientation': {
    cls: 'icon-compass',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>'
  },
  'job-placement': {
    cls: 'icon-briefcase',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
  },
  'family-support': {
    cls: 'icon-family',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
  }
};

const UI_DICTIONARY = {
  home: {
    ar: 'الرئيسية', en: 'Home', id: 'Beranda', ko: '홈', ja: 'ホーム', zh: '首页', ru: 'Главная', fr: 'Accueil', es: 'Inicio'
  },
  studentServices: {
    ar: 'خدمات الطلاب', en: 'Student Services', id: 'Layanan Siswa', ko: '학생 지원 서비스', ja: '学生サポートサービス', zh: '留学生全方位服务', ru: 'Студенческие услуги', fr: 'Services aux étudiants', es: 'Servicios para estudiantes'
  },
  bookWa: {
    ar: 'طلب واستشارة الخدمة عبر واتساب',
    en: 'Book & Consult via WhatsApp',
    id: 'Pesan & Konsultasi via WhatsApp',
    ko: 'WhatsApp으로 서비스 신청 및 상담',
    ja: 'WhatsAppで相談・予約する',
    zh: '通过 WhatsApp 预约与咨询',
    ru: 'Заказать услугу в WhatsApp',
    fr: 'Demander & Consulter sur WhatsApp',
    es: 'Solicitar y Consultar por WhatsApp'
  },
  backToPortal: {
    ar: 'العودة لبوابة خدمات الطلاب الرئيسية',
    en: 'Back to All Student Services',
    id: 'Kembali ke Portal Layanan Siswa',
    ko: '학생 지원 서비스 메인으로 돌아가기',
    ja: '学生サポートポータルに戻る',
    zh: '返回留学生服务主门户',
    ru: 'Назад к общему порталу услуг',
    fr: 'Retour au portail des services étudiants',
    es: 'Volver al portal de servicios para estudiantes'
  },
  overviewTitle: {
    ar: 'نظرة شاملة على الخدمة (المواصفات القياسية الدولية)',
    en: 'Comprehensive Service Overview (Global Standards)',
    id: 'Gambaran Lengkap Layanan (Standar Internasional)',
    ko: '서비스 종합 개요 (글로벌 표준 기준)',
    ja: 'サービス概要（国際基準仕様）',
    zh: '服务全面概览（国际认证标准）',
    ru: 'Полный обзор услуги (международные стандарты)',
    fr: 'Présentation complète du service (Normes internationales)',
    es: 'Descripción general del servicio (Estándares internacionales)'
  },
  benefitsTitle: {
    ar: 'الميزات والمنافع الأساسية للخدمة',
    en: 'Key Features & Core Benefits',
    id: 'Fitur Utama & Manfaat Layanan',
    ko: '핵심 서비스 기능 및 주요 혜택',
    ja: '主な特徴とメリット',
    zh: '核心功能与服务优势',
    ru: 'Ключевые особенности и преимущества',
    fr: 'Avantages et caractéristiques clés',
    es: 'Características clave y beneficios'
  },
  processTitle: {
    ar: 'مراحل وخطوات تقديم الخدمة (6 خطوات عملية)',
    en: 'Step-by-Step Delivery Process (6 Practical Steps)',
    id: 'Tahapan & Proses Layanan (6 Langkah Praktis)',
    ko: '서비스 진행 단계 및 절차 (실무 6단계)',
    ja: 'サービス提供のステップ（実践的な6段階）',
    zh: '服务实施流程（6个标准步骤）',
    ru: 'Поэтапный процесс предоставления услуги (6 шагов)',
    fr: 'Processus étape par étape (6 étapes pratiques)',
    es: 'Proceso de entrega paso a paso (6 pasos prácticos)'
  },
  coverageTitle: {
    ar: 'نطاق تغطية الخدمة في الوجهات الدراسية الـ 6 المعتمدة',
    en: 'Service Coverage Across All 6 Study Destinations',
    id: 'Cakupan Layanan di 6 Negara Tujuan Studi',
    ko: '공식 6개 유학 국가별 현지 지원 범위',
    ja: '認定6カ国におけるサポート範囲',
    zh: '覆盖全部6个官方留学国家的专属支持',
    ru: 'Охват услуги в 6 странах обучения',
    fr: 'Couverture du service dans les 6 pays d’études',
    es: 'Cobertura del servicio en los 6 países de estudio'
  },
  sidebarConsultTitle: {
    ar: 'طلب واستشارة الخدمة',
    en: 'Book & Inquire About Service',
    id: 'Pesan & Konsultasi Layanan',
    ko: '서비스 예약 및 1:1 전담 상담',
    ja: 'サービスのお申し込み・ご相談',
    zh: '立即预约并咨询该服务',
    ru: 'Заказ и консультация по услуге',
    fr: 'Réserver & Se renseigner',
    es: 'Reservar y Consultar servicio'
  },
  sidebarConsultDesc: {
    ar: 'فريقنا الميداني في أستراليا، ماليزيا، بريطانيا، كندا، نيوزيلندا، وسنغافورة بانتظارك. احجز الآن برقم رحلتك عبر واتساب الاستشارات الرسمي.',
    en: 'Our certified field team in Australia, Malaysia, UK, Canada, New Zealand, and Singapore is ready to assist you 24/7.',
    id: 'Tim lapangan resmi kami di Australia, Malaysia, Inggris, Kanada, Selandia Baru, dan Singapura siap membantu 24/7.',
    ko: '호주, 말레이시아, 영국, 캐나다, 뉴질랜드, 싱가포르 현지 전담팀이 24시간 연중무휴 상시 지원합니다.',
    ja: 'オーストラリア、マレーシア、英国、カナダ、ニュージーランド、シンガポールの現地スタッフが24時間体制で待機しています。',
    zh: '我们在澳大利亚、马来西亚、英国、加拿大、新西兰和新加坡的官方实地团队全天候为您保驾护航。',
    ru: 'Наша официальная команда в Австралии, Малайзии, Великобритании, Канаде, Новой Зеландии и Сингапуре готова помочь 24/7.',
    fr: 'Notre équipe locale en Australie, Malaisie, Royaume-Uni, Canada, Nouvelle-Zélande et Singapour est disponible 24/7.',
    es: 'Nuestro equipo local en Australia, Malasia, Reino Unido, Canadá, Nueva Zelanda y Singapur le asiste 24/7.'
  },
  sidebarF1: {
    ar: 'دعم ومتابعة ميدانية على مدار الساعة 24/7',
    en: '24/7 dedicated on-ground field support',
    id: 'Dukungan lapangan 24/7',
    ko: '현지 24시간 연중무휴 전담 현장 밀착 케어',
    ja: '24時間365日の現地オンサイトサポート',
    zh: '全天候24/7本地专属实地支持',
    ru: 'Круглосуточная поддержка 24/7 на месте',
    fr: 'Assistance locale dédiée 24/7',
    es: 'Soporte presencial dedicado 24/7'
  },
  sidebarF2: {
    ar: 'فريق رسمي متعدد اللغات (عربي، إنجليزي، إندونيسي)',
    en: 'Multilingual official team (Arabic, English, Indonesian)',
    id: 'Tim resmi multibahasa (Arab, Inggris, Indonesia)',
    ko: '다국어 구사 공식 팀 (아랍어, 영어, 인도네시아어)',
    ja: '多言語対応の公式スタッフ（アラビア語・英語・インドネシア語）',
    zh: '多语言官方服务团队（阿语、英语、印尼语等）',
    ru: 'Многоязычная команда специалистов',
    fr: 'Équipe officielle multilingue',
    es: 'Equipo oficial multilingüe'
  },
  sidebarF3: {
    ar: 'تغطية رسمية متكاملة في 6 دول دراسية',
    en: 'Full coverage across 6 study destinations',
    id: 'Cakupan penuh di 6 negara studi',
    ko: '6대 유학 대상국 전역 완벽 보장',
    ja: '全6カ国の留学先を完全網羅',
    zh: '全面覆盖全部6大主流留学国家',
    ru: 'Полный охват в 6 странах обучения',
    fr: 'Couverture complète dans 6 pays',
    es: 'Cobertura completa en 6 países'
  },
  otherServicesTitle: {
    ar: 'خدمات الطلاب الشاملة الأخرى',
    en: 'Other Student Services',
    id: 'Layanan Mahasiswa Lainnya',
    ko: '기타 주요 학생 지원 서비스',
    ja: 'その他の学生サポートサービス',
    zh: '其他核心留学生专属服务',
    ru: 'Другие студенческие услуги',
    fr: 'Autres services étudiants',
    es: 'Otros servicios para estudiantes'
  },
  viewDetails: {
    ar: 'عرض التفاصيل الكاملة',
    en: 'View Full Details',
    id: 'Lihat Detail Lengkap',
    ko: '상세 보기',
    ja: '詳細を見る',
    zh: '查看详情',
    ru: 'Подробнее',
    fr: 'Voir les détails',
    es: 'Ver detalles'
  },
  certifiedStandard: {
    ar: 'رعاية 360 معتمدة دوليا',
    en: '360 Certified Global Care',
    id: 'Layanan 360 Terverifikasi Global',
    ko: '글로벌 공인 360 토탈 케어',
    ja: '国際認証 360 安心サポート',
    zh: '360 全方位国际认证保障',
    ru: 'Забота 360 по мировым стандартам',
    fr: 'Prise en charge 360 certifiée',
    es: 'Atención 360 certificada globalmente'
  },
  waInquiryMsg: {
    ar: 'مرحبا StudyCo، أود الاستفسار وحجز خدمة: {serviceName}',
    en: 'Hello StudyCo, I would like to inquire about and book the service: {serviceName}',
    id: 'Halo StudyCo, saya ingin berkonsultasi dan memesan layanan: {serviceName}',
    ko: '안녕하세요 StudyCo, 다음 서비스 신청 및 상담을 희망합니다: {serviceName}',
    ja: 'StudyCo様、以下のサービスについて相談・申し込みを希望します: {serviceName}',
    zh: '您好 StudyCo，我想咨询并预约以下留学生服务：{serviceName}',
    ru: 'Здравствуйте StudyCo! Я хочу проконсультироваться и заказать услугу: {serviceName}',
    fr: 'Bonjour StudyCo, je souhaite me renseigner et réserver le service : {serviceName}',
    es: 'Hola StudyCo, deseo consultar y reservar el servicio: {serviceName}'
  }
};

export class SubServicePageManager {
  constructor() {
    this.servicesData = null;
    this.currentSlug = this.detectSlug();
    this.currentLang = i18n.currentLanguage || 'ar';
  }

  detectSlug() {
    const bodySlug = document.body.getAttribute('data-service-id');
    if (bodySlug) return bodySlug;

    const path = window.location.pathname;
    const match = path.match(/service-([a-z\-]+)\.html/);
    if (match) return match[1];

    if (path.includes('airport-pickup')) return 'airport-pickup';
    if (path.includes('accommodation')) return 'accommodation';
    if (path.includes('essential-activations')) return 'essential-activations';
    if (path.includes('pre-departure')) return 'pre-departure';
    if (path.includes('orientation')) return 'orientation';
    if (path.includes('job-placement')) return 'job-placement';
    if (path.includes('family-support')) return 'family-support';

    return 'airport-pickup';
  }

  async init() {
    try {
      const res = await fetch('./data/sub-services-content.json?v=88.0');
      this.servicesData = await res.json();
    } catch (err) {
      console.error('[SubService] Error loading sub-services-content.json:', err);
      return;
    }

    const urlLang = new URLSearchParams(window.location.search).get('lang');
    this.currentLang = (urlLang && CONFIG.supportedLanguages.includes(urlLang))
      ? urlLang
      : ((window.i18n && window.i18n.currentLang) || localStorage.getItem('studyco_lang') || document.documentElement.lang || 'ar');

    this.render();
    this.setupLanguageListener();
  }

  setupLanguageListener() {
    const onLang = (lang) => {
      const targetLang = lang || (window.i18n && window.i18n.currentLang) || document.documentElement.lang || 'ar';
      if (targetLang && targetLang !== this.currentLang) {
        this.currentLang = targetLang;
        this.render();
      }
    };

    window.addEventListener('languageChanged', (e) => onLang(e.detail?.lang));
    document.addEventListener('languageChanged', (e) => onLang(e.detail?.lang));

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'lang') {
          onLang(document.documentElement.lang);
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  t(dictKey, params = {}) {
    const entry = UI_DICTIONARY[dictKey] || {};
    let text = entry[this.currentLang] || entry['ar'] || entry['en'] || '';
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, v);
    }
    return text;
  }

  getServiceField(service, field) {
    if (!service || !service[field]) return '';
    const obj = service[field];
    if (typeof obj === 'string') return obj;
    return obj[this.currentLang] || obj['ar'] || obj['en'] || obj['id'] || '';
  }

  render() {
    if (!this.servicesData) return;
    const srv = this.servicesData[this.currentSlug];
    if (!srv) {
      console.warn(`[SubService] Slug ${this.currentSlug} not found in database.`);
      return;
    }

    const title = this.getServiceField(srv, 'title');
    const badge = this.getServiceField(srv, 'badge');
    const subtitle = this.getServiceField(srv, 'subtitle');
    const p1 = this.getServiceField(srv, 'overview_p1');
    const p2 = this.getServiceField(srv, 'overview_p2');

    const iconInfo = ICONS_CONFIG[this.currentSlug] || ICONS_CONFIG['airport-pickup'];

    // 1. Breadcrumbs
    const bcEl = document.querySelector('.ss-breadcrumb');
    if (bcEl) {
      bcEl.innerHTML = `
        <a href="index.html">${this.t('home')}</a>
        <span>/</span>
        <a href="student-services.html">${this.t('studentServices')}</a>
        <span>/</span>
        <span>${title}</span>
      `;
    }

    // 2. 3D Micro-Badge (No Unicode Emojis!)
    const badgeContainer = document.querySelector('.ss-3d-badge') || document.querySelector('.ss-sub-badge');
    if (badgeContainer) {
      badgeContainer.className = 'ss-3d-badge';
      badgeContainer.innerHTML = `
        <div class="ss-3d-icon ${iconInfo.cls}">
          ${iconInfo.svg}
        </div>
        <span class="ss-sub-badge-text">${badge}</span>
      `;
    }

    // 3. Hero Title & Subtitle
    const titleEl = document.querySelector('.ss-sub-title');
    if (titleEl) titleEl.textContent = title;

    const subEl = document.querySelector('.ss-sub-subtitle');
    if (subEl) subEl.textContent = subtitle;

    // 4. Hero Actions Buttons (Clean SVG, No Unicode Emojis!)
    const waMsg = this.t('waInquiryMsg', { serviceName: title });
    const waLink = CONFIG.getWhatsAppLink(waMsg);

    const waBtnEl = document.querySelector('.ss-sub-actions .btn-ss-primary');
    if (waBtnEl) {
      waBtnEl.href = waLink;
      waBtnEl.innerHTML = `
        <span>${this.t('bookWa')}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2z"/></svg>
      `;
    }

    const backBtnEl = document.querySelector('.ss-sub-actions .btn-ss-secondary');
    if (backBtnEl) {
      const isRtl = this.currentLang === 'ar';
      backBtnEl.innerHTML = `
        <span>${this.t('backToPortal')}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">${isRtl ? '<polyline points="15 18 9 12 15 6"/>' : '<polyline points="9 18 15 12 9 6"/>'}</svg>
      `;
    }

    // 5. Dedicated Hero Visual Banner
    const heroBannerBox = document.querySelector('.ss-sub-hero-banner');
    if (heroBannerBox) {
      const imgPath = srv.image || 'assets/photo/services/airport_pickup.jpg';
      heroBannerBox.innerHTML = `
        <img src="${imgPath}" alt="${title}" class="ss-sub-hero-img" loading="eager" decoding="async">
        <div class="ss-hero-3d-floating-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5b000" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>${this.t('certifiedStandard')}</span>
        </div>
      `;
    }

    // 6. Overview Section
    const overviewBoxes = document.querySelectorAll('.ss-sub-card-box');
    if (overviewBoxes.length > 0) {
      const ovBox = overviewBoxes[0];
      const h2 = ovBox.querySelector('.ss-sub-card-title');
      if (h2) {
        h2.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5b000" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          ${this.t('overviewTitle')}
        `;
      }
      const paras = ovBox.querySelectorAll('.ss-sub-card-desc');
      if (paras.length >= 2) {
        paras[0].textContent = p1;
        paras[1].textContent = p2;
        for (let i = 2; i < paras.length; i++) {
          paras[i].style.display = 'none';
        }
      }
    }

    // 7. Key Features & Benefits (Second card box)
    if (overviewBoxes.length > 1 && srv.benefits) {
      const benBox = overviewBoxes[1];
      const h2 = benBox.querySelector('.ss-sub-card-title');
      if (h2) {
        h2.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          ${this.t('benefitsTitle')}
        `;
      }

      const existingCards = benBox.querySelectorAll('.ss-sub-highlight-card');
      existingCards.forEach(c => c.remove());

      const benefitsHtml = srv.benefits.map(b => {
        const bTitle = b.title[this.currentLang] || b.title['ar'] || b.title['en'] || '';
        const bDesc = b.desc[this.currentLang] || b.desc['ar'] || b.desc['en'] || '';
        return `
          <div class="ss-sub-highlight-card">
            <div class="ss-sub-highlight-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <h4 class="ss-sub-highlight-title">${bTitle}</h4>
              <p class="ss-sub-highlight-desc">${bDesc}</p>
            </div>
          </div>
        `;
      }).join('');

      benBox.insertAdjacentHTML('beforeend', benefitsHtml);
    }

    // 8. Delivery Process (Third card box)
    if (overviewBoxes.length > 2 && srv.process) {
      const procBox = overviewBoxes[2];
      const h2 = procBox.querySelector('.ss-sub-card-title');
      if (h2) {
        h2.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          ${this.t('processTitle')}
        `;
      }

      let timelineWrap = procBox.querySelector('.ss-sub-timeline-wrap');
      if (!timelineWrap) {
        const existingSteps = procBox.querySelectorAll('.ss-sub-process-step, .ss-sub-timeline-step');
        timelineWrap = document.createElement('div');
        timelineWrap.className = 'ss-sub-timeline-wrap';
        if (existingSteps.length > 0) {
          existingSteps[0].parentNode.insertBefore(timelineWrap, existingSteps[0]);
          existingSteps.forEach(el => el.remove());
        } else {
          procBox.appendChild(timelineWrap);
        }
      }

      timelineWrap.innerHTML = srv.process.map(step => {
        const sTitle = (step.title && (step.title[this.currentLang] || step.title['en'] || step.title['ar'])) || '';
        const sDesc = (step.desc && (step.desc[this.currentLang] || step.desc['en'] || step.desc['ar'])) || '';
        return `
          <div class="ss-sub-timeline-step">
            <div class="ss-sub-step-num">${step.step}</div>
            <div class="ss-sub-step-body">
              <h4 class="ss-sub-step-title">${sTitle}</h4>
              <p class="ss-sub-step-desc">${sDesc}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    // 9. Country Coverage (Fourth card box) - Fully Multilingual
    if (overviewBoxes.length > 3 && srv.coverage) {
      const covBox = overviewBoxes[3];
      const h2 = covBox.querySelector('.ss-sub-card-title');
      if (h2) {
        h2.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          ${this.t('coverageTitle')}
        `;
      }

      let covGrid = covBox.querySelector('.ss-sub-country-grid') || covBox.querySelector('.ss-coverage-grid');
      if (!covGrid) {
        const existingItems = covBox.querySelectorAll('.ss-coverage-item, .ss-sub-country-card');
        covGrid = document.createElement('div');
        covGrid.className = 'ss-sub-country-grid';
        if (existingItems.length > 0) {
          existingItems[0].parentNode.insertBefore(covGrid, existingItems[0]);
          existingItems.forEach(el => el.remove());
        } else {
          covBox.appendChild(covGrid);
        }
      }

      covGrid.innerHTML = srv.coverage.map(c => {
        const cName = (c.country && (c.country[this.currentLang] || c.country['en'] || c.country['ar'])) || '';
        const cDesc = (c.detail && (c.detail[this.currentLang] || c.detail['en'] || c.detail['ar'])) || '';
        return `
          <div class="ss-sub-country-card">
            <div class="ss-sub-country-header">
              <h4 class="ss-sub-country-name">${cName}</h4>
            </div>
            <p class="ss-sub-country-desc">${cDesc}</p>
          </div>
        `;
      }).join('');
    }

    // 10. Sidebar Card 1: Consultation Booking Box
    const consultCard = document.querySelector('.ss-sidebar-consult-card');
    if (consultCard) {
      const cTitle = consultCard.querySelector('.ss-sidebar-consult-title h3');
      if (cTitle) cTitle.textContent = this.t('sidebarConsultTitle');

      const cDesc = consultCard.querySelector('.ss-sidebar-consult-desc');
      if (cDesc) cDesc.textContent = this.t('sidebarConsultDesc');

      const f1 = consultCard.querySelector('.ss-sidebar-f1');
      if (f1) f1.textContent = this.t('sidebarF1');

      const f2 = consultCard.querySelector('.ss-sidebar-f2');
      if (f2) f2.textContent = this.t('sidebarF2');

      const f3 = consultCard.querySelector('.ss-sidebar-f3');
      if (f3) f3.textContent = this.t('sidebarF3');

      const cWaBtn = consultCard.querySelector('.ss-sidebar-wa-btn');
      if (cWaBtn) {
        cWaBtn.href = waLink;
        const span = cWaBtn.querySelector('span');
        if (span) span.textContent = this.t('bookWa');
      }
    }

    // 11. Sidebar Card 2: Other Services Navigator (with 3D Icons, zero emojis)
    const otherServicesBox = document.getElementById('ss-sidebar-other-services');
    if (otherServicesBox) {
      const otherNavTitle = document.querySelector('.ss-sidebar-nav-title span');
      if (otherNavTitle) otherNavTitle.textContent = this.t('otherServicesTitle');

      const allKeys = Object.keys(this.servicesData);
      otherServicesBox.innerHTML = allKeys.map(k => {
        const item = this.servicesData[k];
        const isCurrent = k === this.currentSlug;
        const itemTitle = this.getServiceField(item, 'title');
        const itemUrl = item.file || `service-${k}.html`;
        const iconDef = ICONS_CONFIG[k] || ICONS_CONFIG['airport-pickup'];

        return `
          <a href="${itemUrl}" class="ss-sidebar-nav-item ${isCurrent ? 'active' : ''}">
            <div class="ss-3d-icon ${iconDef.cls}" style="width:28px; height:28px; border-radius:6px;">
              ${iconDef.svg}
            </div>
            <div class="ss-sidebar-nav-text">
              <h5 class="ss-sidebar-nav-name">${itemTitle}</h5>
              <span class="ss-sidebar-nav-action">${this.t('viewDetails')}</span>
            </div>
          </a>
        `;
      }).join('');
    }

    // 12. Page Document Title
    document.title = `${title} | StudyCo Education Services`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const manager = new SubServicePageManager();
  manager.init();
});
