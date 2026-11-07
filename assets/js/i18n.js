import { CONFIG } from './config.js?v=88.0';

class I18nManager {
  constructor() {
    this.currentLang = CONFIG.defaultLanguage;
    this.translations = {};
  }

  // Resolution order: ?lang= param, saved choice, browser language, site default.
  // Anything outside the supported list is ignored.
  detectLanguage() {
    const paramLang = new URLSearchParams(window.location.search).get('lang');
    if (paramLang && CONFIG.supportedLanguages.includes(paramLang.toLowerCase())) {
      return paramLang.toLowerCase();
    }

    const storedLang = localStorage.getItem('studyco_lang');
    if (storedLang && CONFIG.supportedLanguages.includes(storedLang.toLowerCase())) {
      return storedLang.toLowerCase();
    }

    const navLang = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
    if (CONFIG.supportedLanguages.includes(navLang)) {
      return navLang;
    }

    return CONFIG.defaultLanguage;
  }

  async loadLanguage(lang) {
    const sanitizedLang = CONFIG.supportedLanguages.includes(lang) ? lang : CONFIG.defaultLanguage;
    this.currentLang = sanitizedLang;
    localStorage.setItem('studyco_lang', sanitizedLang);

    try {
      const response = await fetch(`./locales/${sanitizedLang}.json?v=20261105_v4`);
      if (!response.ok) {
        throw new Error(`Failed to load translations: ${sanitizedLang}`);
      }
      this.translations = await response.json();
    } catch (err) {
      console.warn(`[i18n] ${sanitizedLang} unavailable, using ${CONFIG.defaultLanguage}:`, err);
      if (sanitizedLang !== CONFIG.defaultLanguage) {
        return this.loadLanguage(CONFIG.defaultLanguage);
      }
    }

    this.applyLanguageToDOM();
  }

  applyLanguageToDOM() {
    document.documentElement.classList.add('no-lang-transition');
    document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = this.currentLang;

    // Close any open drawer and reset hamburger button
    const drawer = document.getElementById('mobile-nav-drawer');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    if (hamburgerBtn) {
      hamburgerBtn.classList.remove('active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }

    // Guard: If translations failed to load or are empty, preserve existing DOM text!
    if (!this.translations || Object.keys(this.translations).length === 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.remove('no-lang-transition');
        });
      });
      return;
    }

    // textContent only - translation strings must never be parsed as HTML
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const translation = this.t(el.getAttribute('data-i18n'));
      if (translation && translation !== el.getAttribute('data-i18n')) {
        el.textContent = translation;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const translation = this.t(el.getAttribute('data-i18n-placeholder'));
      if (translation && translation !== el.getAttribute('data-i18n-placeholder')) {
        el.setAttribute('placeholder', translation);
      }
    });

    this.updateMetaTags();

    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));

    // Re-enable transitions after layout update
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('no-lang-transition');
      });
    });
  }

  updateMetaTags() {
    // Sub-pages opt in via <body data-meta-key="universities">; the homepage
    // (no attribute) keeps using meta_title/meta_desc exactly as before.
    const pageKey = document.body.dataset.metaKey;
    const title = pageKey ? (this.translations['meta_title_' + pageKey] || this.translations.meta_title) : this.translations.meta_title;
    const desc = pageKey ? (this.translations['meta_desc_' + pageKey] || this.translations.meta_desc) : this.translations.meta_desc;
    if (title) {
      document.title = title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
    }
    if (desc) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', desc);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', desc);
    }
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', this.currentLang);
  }

  t(key, replacements = {}) {
    let val = this.translations[key];
    if (!val) {
      const emergencyFallbacks = {
        btn_explore_unis: {
          ar: 'استكشف الجامعات',
          en: 'Explore Universities',
          id: 'Jelajahi Universitas',
          zh: '探索大学',
          es: 'Explorar Universidades',
          fr: 'Explorer les Universités',
          ru: 'Исследовать университеты',
          ja: '大学を探索する',
          ko: '대학 둘러보기'
        },
        lc_tab_all: {
          ar: 'معاهد اللغة المعتمدة في ماليزيا (18 معهداً)',
          en: 'Accredited Language Institutes in Malaysia (18 Institutes)',
          id: 'Institut Bahasa Terakreditasi di Malaysia (18 Institut)',
          zh: '马来西亚认证语言学院（18所）',
          es: 'Institutos de idiomas acreditados en Malasia (18)',
          fr: 'Instituts de langues accrédités en Malaisie (18)',
          ru: 'Аккредитованные языковые институты в Малайзии (18)',
          ja: 'マレーシア公認語学学校（18校）',
          ko: '말레이시아 공인 어학원 (18개)'
        },
        lc_tab_independent: {
          ar: 'معاهد اللغة المعتمدة في ماليزيا (18 معهداً)',
          en: 'Accredited Language Institutes in Malaysia (18 Institutes)',
          id: 'Institut Bahasa Terakreditasi di Malaysia (18 Institut)',
          zh: '马来西亚认证语言学院（18所）',
          es: 'Institutos de idiomas acreditados en Malasia (18)',
          fr: 'Instituts de langues accrédités en Malaisie (18)',
          ru: 'Аккредитованные языковые институты в Малайзии (18)',
          ja: 'マレーシア公認語学学校（18校）',
          ko: '말레이시아 공인 어학원 (18개)'
        },
        online_hero_badge: {
          ar: '327+ برنامج ودرجة جامعية أونلاين للدراسة عن بُعد',
          en: '327+ Online Degrees & Distance Learning Programs',
          id: '327+ Program & Gelar Online untuk Kuliah Jarak Jauh',
          zh: '327+ 在线远程学位与大学课程',
          es: '327+ Programas y Títulos Universitarios Online',
          fr: '327+ Programmes et Diplômes Universitaires en Ligne',
          ru: '327+ онлайн-программ и университетских степеней',
          ja: '327+ オンライン大学学位・遠隔教育プログラム',
          ko: '327+ 온라인 학위 및 원격 교육 프로그램'
        }
      };

      if (emergencyFallbacks[key]) {
        val = emergencyFallbacks[key][this.currentLang] || emergencyFallbacks[key]['ar'] || emergencyFallbacks[key]['en'];
      } else {
        return null;
      }
    }

    Object.keys(replacements).forEach((placeholder) => {
      val = val.replace(`{${placeholder}}`, replacements[placeholder]);
    });
    return val;
  }
}

export const i18n = (typeof window !== 'undefined' && window.StudyCo_i18n) ? window.StudyCo_i18n : new I18nManager();
if (typeof window !== 'undefined' && !window.StudyCo_i18n) {
  window.StudyCo_i18n = i18n;
}
