/**
 * StudyCo Academic Directory — Advanced Faceted Search Engine
 * Benchmark: Hotcourses Abroad faceted search engine
 * - Instant client-side multi-filtering across programs & universities
 * - Real-time currency conversions (MYR, IDR, USD)
 * - Deep query parameter synchronization
 * - Direct pre-filled WhatsApp consultation per degree
 */

import { i18n } from './i18n.js?v=88.0';
import { CONFIG } from './config.js?v=88.0';
import { getExchangeRates, convertFromMYR, formatProgramPrice, formatCurrencyValue, getCountryCurrency } from './currency.js?v=88.0';

const COUNTRY_FLAGS = {
  malaysia: 'assets/photo/flag-malaysia.svg',
  australia: 'assets/photo/flag-australia.svg',
  uk: 'assets/photo/flag-uk.svg',
  canada: 'assets/photo/flag-canada.svg',
  usa: 'assets/photo/flag-usa.svg',
  newzealand: 'assets/photo/flag-newzealand.svg',
  singapore: 'assets/photo/flag-singapore.svg',
  ireland: 'assets/photo/flag-ireland.svg',
  germany: 'assets/photo/flag-germany.svg',
  netherlands: 'assets/photo/flag-netherlands.svg'
};

const COUNTRY_NAMES = {
  malaysia: 'Malaysia',
  australia: 'Australia',
  uk: 'United Kingdom',
  canada: 'Canada',
  usa: 'USA',
  newzealand: 'New Zealand',
  singapore: 'Singapura',
  ireland: 'Ireland',
  germany: 'Germany',
  netherlands: 'Netherlands'
};

const COUNTRY_NAMES_AR = {
  malaysia: 'ماليزيا',
  australia: 'أستراليا',
  uk: 'المملكة المتحدة',
  canada: 'كندا',
  usa: 'الولايات المتحدة',
  newzealand: 'نيوزيلندا',
  singapore: 'سنغافورة',
  ireland: 'أيرلندا',
  germany: 'ألمانيا',
  netherlands: 'هولندا'
};

const LEVEL_NAMES = {
  ar: {
    bachelor: 'بكالوريوس',
    master: 'ماجستير',
    phd: 'دكتوراه',
    diploma: 'دبلوم',
    foundation: 'سنة تحضيرية'
  },
  en: {
    bachelor: "Bachelor's",
    master: "Master's",
    phd: "PhD",
    diploma: 'Diploma',
    foundation: 'Foundation'
  },
  id: {
    bachelor: 'Sarjana (S1)',
    master: 'Magister (S2)',
    phd: 'Doktor (S3)',
    diploma: 'Diploma',
    foundation: 'Foundation'
  }
};

const FIELD_NAMES = {
  ar: {
    cs: 'علوم الحاسوب وتكنولوجيا المعلومات',
    business: 'إدارة الأعمال والتجارة',
    engineering: 'الهندسة والتكنولوجيا',
    health: 'الطب والعلوم الصحية',
    hospitality: 'الضيافة والسياحة',
    arts: 'الفنون والتصميم',
    law: 'القانون',
    education: 'التربية والتعليم'
  },
  en: {
    cs: 'Computer Science & IT',
    business: 'Business & Management',
    engineering: 'Engineering & Technology',
    health: 'Medicine & Health Sciences',
    hospitality: 'Hospitality & Tourism',
    arts: 'Arts & Design',
    law: 'Law',
    education: 'Education'
  },
  id: {
    cs: 'Ilmu Komputer & IT',
    business: 'Bisnis & Manajemen',
    engineering: 'Teknik & Rekayasa',
    health: 'Kedokteran & Kesehatan',
    hospitality: 'Perhotelan & Pariwisata',
    arts: 'Seni & Desain',
    law: 'Hukum',
    education: 'Pendidikan'
  }
};

const MONTHS_MAP = {
  ar: {
    jan: 'يناير', feb: 'فبراير', mar: 'مارس', apr: 'أبريل',
    may: 'مايو', jun: 'يونيو', jul: 'يوليو', aug: 'أغسطس',
    sep: 'سبتمبر', oct: 'أكتوبر', nov: 'نوفمبر', dec: 'ديسمبر'
  }
};

function formatIntakes(intakesStr, lang) {
  if (!intakesStr) return '';
  if (lang !== 'ar') return intakesStr;
  const parts = intakesStr.split(/[,،\s]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
  const arParts = parts.map(m => {
    const key = m.slice(0, 3);
    return MONTHS_MAP.ar[key] || m;
  });
  return arParts.join('، ');
}

const SEARCH_I18N = {
  ar: {
    resultsCount: (n) => `تم العثور على <span class="highlight" id="count-number">${n}</span> برنامج دراسي`,
    budgetAll: 'الكل (بدون حد أقصى)',
    budgetMax: (formatted) => `<= ${formatted}`,
    chipKeyword: (kw) => `الكلمة المفتاحية: "${kw}"`,
    chipCountry: (c) => `الدولة: ${c}`,
    chipLevel: (l) => `المرحلة: ${l}`,
    chipField: (f) => `المجال: ${f}`,
    chipBudget: (b) => `الحد الأقصى للرسوم <= ${b}`,
    chipIntakes: (i) => `مواعيد القبول: ${i}`,
    removeFilter: 'إزالة الفلتر',
    emptyTitle: 'لم يتم العثور على أي برامج مطابقة',
    emptyDesc: 'لا توجد برامج دراسية تطابق خيارات التصفية المحددة. جرب تغيير كلمة البحث أو إعادة تعيين الفلاتر.',
    emptyReset: 'إعادة تعيين جميع الفلاتر',
    feeLabel: 'الرسوم السنوية',
    durationLabel: 'المدة',
    durationYears: (y) => `${y} سنوات`,
    intakesLabel: 'فترات القبول',
    ieltsLabel: 'شرط اللغة',
    uniDetailsBtn: 'تفاصيل الجامعة',
    waBtn: 'استشارة مجانية عبر واتساب',
    waMsg: (progName, uniName) => `مرحباً StudyCo، أود الاستفسار والتقديم على برنامج: ${progName} في ${uniName}.`
  },
  en: {
    resultsCount: (n) => `Found <span class="highlight" id="count-number">${n}</span> study programs`,
    budgetAll: 'All (No Limit)',
    budgetMax: (formatted) => `<= ${formatted}`,
    chipKeyword: (kw) => `Keyword: "${kw}"`,
    chipCountry: (c) => `Country: ${c}`,
    chipLevel: (l) => `Level: ${l}`,
    chipField: (f) => `Field: ${f}`,
    chipBudget: (b) => `Budget <= ${b}`,
    chipIntakes: (i) => `Intakes: ${i}`,
    removeFilter: 'Remove filter',
    emptyTitle: 'No Programs Found',
    emptyDesc: 'No academic programs matched your current filter criteria. Try searching with different keywords or reset filters.',
    emptyReset: 'Reset All Filters',
    feeLabel: 'Annual Tuition Fee',
    durationLabel: 'Duration',
    durationYears: (y) => `${y} Years`,
    intakesLabel: 'Intakes',
    ieltsLabel: 'Language Req.',
    uniDetailsBtn: 'University Details',
    waBtn: 'Free WhatsApp Consultation',
    waMsg: (progName, uniName) => `Hello StudyCo, I would like to inquire and apply for the program: ${progName} at ${uniName}.`
  },
  id: {
    resultsCount: (n) => `Ditemukan <span class="highlight" id="count-number">${n}</span> program studi`,
    budgetAll: 'Semua (Tanpa Batas)',
    budgetMax: (formatted) => `<= ${formatted}`,
    chipKeyword: (kw) => `Kata Kunci: "${kw}"`,
    chipCountry: (c) => `Negara: ${c}`,
    chipLevel: (l) => `Jenjang: ${l}`,
    chipField: (f) => `Bidang: ${f}`,
    chipBudget: (b) => `Budget <= ${b}`,
    chipIntakes: (i) => `Intakes: ${i}`,
    removeFilter: 'Hapus filter',
    emptyTitle: 'Tidak Ada Program Ditemukan',
    emptyDesc: 'Tidak ada program studi yang cocok dengan filter saat ini. Coba ubah kata kunci atau atur ulang filter pencarian Anda.',
    emptyReset: 'Reset Semua Filter',
    feeLabel: 'Estimasi Biaya / Thn',
    durationLabel: 'Durasi Kuliah',
    durationYears: (y) => `${y} Tahun`,
    intakesLabel: 'Intakes',
    ieltsLabel: 'Syarat Bahasa',
    uniDetailsBtn: 'Profil Kampus',
    waBtn: 'Konsultasi WhatsApp',
    waMsg: (progName, uniName) => `Halo StudyCo, saya tertarik untuk konsultasi dan mendaftar pada program: ${progName} di ${uniName}.`
  }
};

class FacetedSearchEngine {
  constructor() {
    this.universities = [];
    this.programs = [];
    this.filteredPrograms = [];
    this.exchangeData = null;
    this.currency = localStorage.getItem('studyco_currency') || 'native';
    this.visibleCount = 20;

    this.filters = {
      keyword: '',
      country: '',
      level: '',
      field: '',
      maxBudget: 150000,
      intakes: []
    };

    this.sort = 'default';
  }

  async init() {
    try {
      const v = `?v=${Date.now()}`;
      const [uniRes, progRes, exchangeData] = await Promise.all([
        fetch(`./data/universities.json${v}`),
        fetch(`./data/programs.json${v}`),
        getExchangeRates()
      ]);

      const uniData = await uniRes.json();
      const progData = await progRes.json();

      this.universities = uniData.universities || [];
      this.exchangeData = exchangeData;

      // Join programs with university data
      const uniMap = Object.fromEntries(this.universities.map(u => [u.id, u]));
      this.programs = (progData.programs || []).map(p => {
        const uni = uniMap[p.universityId] || {
          id: p.universityId || 'unknown',
          name: 'Partner University',
          arabicName: 'جامعة شريكة',
          country: 'malaysia',
          city: 'Malaysia',
          logo: 'assets/photo/logo-dark.webp',
          intakes: 'Feb, Sep'
        };

        const annualFeeNum = Number(p.annualFee) || 30000;
        return {
          ...p,
          _uni: uni,
          _annualFeeNum: annualFeeNum,
          _country: uni.country || 'malaysia',
          _intakes: p.intakes || uni.intakes || 'Jan, Sep',
          _searchIndex: `${p.name || ''} ${p.nameAr || ''} ${uni.name || ''} ${uni.arabicName || ''} ${p.overview || ''}`.toLowerCase()
        };
      });

    } catch (err) {
      console.warn('[Search] Direct fetch failed (e.g. file:// protocol), using fallback dataset:', err);
      this.universities = [
        { id: "taylors", name: "Taylor's University", arabicName: "جامعة تايلور", country: "malaysia", city: "Subang Jaya", logo: "assets/photo/uni-taylors.svg", intakes: "Feb, Apr, Jun, Aug, Sep, Nov" },
        { id: "apu", name: "Asia Pacific University of Technology & Innovation (APU)", arabicName: "جامعة آسيا باسيفيك", country: "malaysia", city: "Kuala Lumpur", logo: "assets/photo/uni-apu.webp", intakes: "Feb, Apr, Jun, Aug, Sep, Nov" },
        { id: "sunway", name: "Sunway University", arabicName: "جامعة صنواي", country: "malaysia", city: "Sunway City", logo: "assets/photo/uni-sunway.webp", intakes: "Jan, Mar, Apr, Aug, Sep" },
        { id: "monash", name: "Monash University Malaysia", arabicName: "جامعة موناش", country: "australia", city: "Bandar Sunway / Melbourne", logo: "assets/photo/uni-monash.webp", intakes: "Feb, Jul, Oct" },
        { id: "sydney", name: "The University of Sydney", arabicName: "جامعة سيدني", country: "australia", city: "Sydney, NSW", logo: "assets/photo/uni-sydney.svg", intakes: "Feb, Aug" },
        { id: "utm", name: "Universiti Teknologi Malaysia (UTM)", arabicName: "جامعة ماليزيا التكنولوجية", country: "malaysia", city: "Johor / KL", logo: "assets/photo/uni-utm.webp", intakes: "Feb, Sep" }
      ];

      const uniMap = Object.fromEntries(this.universities.map(u => [u.id, u]));
      this.programs = [
        { id: "taylors-cs", universityId: "taylors", name: "Bachelor of Computer Science (Honours) in AI & Data", nameAr: "بكالوريوس علوم الحاسوب والذكاء الاصطناعي", field: "cs", level: "bachelor", duration: 3, annualFee: 48912, ielts: "6.0", _uni: uniMap.taylors, _annualFeeNum: 48912, _country: "malaysia", _intakes: "Feb, Apr, Jun, Aug, Sep" },
        { id: "apu-se", universityId: "apu", name: "BSc (Hons) in Software Engineering", nameAr: "بكالوريوس هندسة البرمجيات", field: "cs", level: "bachelor", duration: 3, annualFee: 35000, ielts: "6.0", _uni: uniMap.apu, _annualFeeNum: 35000, _country: "malaysia", _intakes: "Feb, May, Sep" },
        { id: "sunway-bus", universityId: "sunway", name: "Bachelor of Business Administration (Honours)", nameAr: "بكالوريوس إدارة الأعمال الدولية", field: "business", level: "bachelor", duration: 3, annualFee: 39000, ielts: "6.0", _uni: uniMap.sunway, _annualFeeNum: 39000, _country: "malaysia", _intakes: "Jan, Mar, Aug" },
        { id: "monash-ds", universityId: "monash", name: "Master of Data Science & Artificial Intelligence", nameAr: "ماجستير علم البيانات والذكاء الاصطناعي", field: "cs", level: "master", duration: 2, annualFee: 62000, ielts: "6.5", _uni: uniMap.monash, _annualFeeNum: 62000, _country: "australia", _intakes: "Feb, Jul" },
        { id: "sydney-mba", universityId: "sydney", name: "Master of Business Administration (MBA)", nameAr: "ماجستير إدارة الأعمال التنفيذي", field: "business", level: "master", duration: 1.5, annualFee: 95000, ielts: "7.0", _uni: uniMap.sydney, _annualFeeNum: 95000, _country: "australia", _intakes: "Feb, Aug" },
        { id: "utm-eng", universityId: "utm", name: "Doctor of Philosophy (PhD) in Mechanical Engineering", nameAr: "دكتوراه في الهندسة الميكانيكية المتقدمة", field: "engineering", level: "phd", duration: 3, annualFee: 24000, ielts: "6.0", _uni: uniMap.utm, _annualFeeNum: 24000, _country: "malaysia", _intakes: "Feb, Sep" }
      ];
    }

    this.parseUrlParams();
    this.syncInputsFromState();
    this.updateFacetCounters();
    this.bindEvents();
    this.applyFilters();

    // Listen to language and currency changes
    window.addEventListener('languageChanged', (e) => {
      this.updateBudgetLabel(this.filters.maxBudget);
      this.updateActiveChips();
      this.render();
    });

    window.addEventListener('currencyChanged', (e) => {
      if (e && e.detail && e.detail.currency) {
        this.currency = e.detail.currency;
      }
      this.updateBudgetLabel(this.filters.maxBudget);
      this.render();
    });
  }

  parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || params.get('keyword');
    const country = params.get('country');
    const level = params.get('level');
    const field = params.get('field');
    const budget = params.get('maxBudget') || params.get('budget');

    if (q) this.filters.keyword = q.replace(/[<>]/g, '').trim();
    if (country) this.filters.country = country.trim().toLowerCase();
    if (level) this.filters.level = level.trim().toLowerCase();
    if (field) this.filters.field = field.trim().toLowerCase();
    if (budget && !isNaN(budget)) this.filters.maxBudget = Number(budget);
  }

  syncInputsFromState() {
    // Hero inputs
    const heroKeyword = document.getElementById('hero-search-keyword');
    const heroCountry = document.getElementById('hero-search-country');
    const heroLevel = document.getElementById('hero-search-level');
    if (heroKeyword) heroKeyword.value = this.filters.keyword;
    if (heroCountry) heroCountry.value = this.filters.country;
    if (heroLevel) heroLevel.value = this.filters.level;

    // Sidebar radios
    const countryRadio = document.querySelector(`input[name="filter_country"][value="${this.filters.country}"]`);
    if (countryRadio) countryRadio.checked = true;

    const levelRadio = document.querySelector(`input[name="filter_level"][value="${this.filters.level}"]`);
    if (levelRadio) levelRadio.checked = true;

    const fieldRadio = document.querySelector(`input[name="filter_field"][value="${this.filters.field}"]`);
    if (fieldRadio) fieldRadio.checked = true;

    // Budget slider
    const budgetSlider = document.getElementById('filter-budget-range');
    const budgetDisplay = document.getElementById('budget-value-display');
    if (budgetSlider && budgetDisplay) {
      budgetSlider.value = this.filters.maxBudget;
      this.updateBudgetLabel(this.filters.maxBudget);
    }

    // Currency selector
    const currSelect = document.getElementById('search-currency-select');
    if (currSelect) {
      currSelect.value = this.currency;
    }
  }

  updateBudgetLabel(val) {
    const budgetDisplay = document.getElementById('budget-value-display');
    if (!budgetDisplay) return;
    const lang = i18n.currentLang || 'ar';
    const dict = SEARCH_I18N[lang] || SEARCH_I18N.ar;
    if (val >= 150000) {
      budgetDisplay.textContent = dict.budgetAll;
    } else {
      const formatted = convertFromMYR(val, this.currency, this.exchangeData);
      budgetDisplay.textContent = dict.budgetMax(formatted);
    }
  }

  updateFacetCounters() {
    const countryCounts = { malaysia: 0, australia: 0, uk: 0, canada: 0, newzealand: 0, singapore: 0 };
    const levelCounts = { bachelor: 0, master: 0, phd: 0, diploma: 0, foundation: 0 };
    const fieldCounts = { cs: 0, business: 0, engineering: 0, health: 0, hospitality: 0, arts: 0, law: 0, education: 0 };

    for (let i = 0; i < this.programs.length; i++) {
      const p = this.programs[i];
      if (p._country && countryCounts[p._country] !== undefined) countryCounts[p._country]++;
      const lvl = (p.level || '').toLowerCase();
      if (levelCounts[lvl] !== undefined) levelCounts[lvl]++;
      const fld = (p.field || '').toLowerCase();
      if (fieldCounts[fld] !== undefined) fieldCounts[fld]++;
    }

    for (const [c, count] of Object.entries(countryCounts)) {
      const el = document.getElementById(`count-country-${c}`);
      if (el) el.textContent = count;
    }
    for (const [lvl, count] of Object.entries(levelCounts)) {
      const el = document.getElementById(`count-level-${lvl}`);
      if (el) el.textContent = count;
    }
    for (const [fld, count] of Object.entries(fieldCounts)) {
      const el = document.getElementById(`count-field-${fld}`);
      if (el) el.textContent = count;
    }
  }

  bindEvents() {
    // Hero Search Submit & Enter
    const heroBtn = document.getElementById('hero-search-submit-btn');
    const heroKeyword = document.getElementById('hero-search-keyword');
    const heroCountry = document.getElementById('hero-search-country');
    const heroLevel = document.getElementById('hero-search-level');

    const handleHeroSearch = () => {
      this.filters.keyword = heroKeyword ? heroKeyword.value.trim() : '';
      this.filters.country = heroCountry ? heroCountry.value : '';
      this.filters.level = heroLevel ? heroLevel.value : '';

      // Sync sidebar radios
      const cRadio = document.querySelector(`input[name="filter_country"][value="${this.filters.country}"]`);
      if (cRadio) cRadio.checked = true;
      const lRadio = document.querySelector(`input[name="filter_level"][value="${this.filters.level}"]`);
      if (lRadio) lRadio.checked = true;

      this.visibleCount = 20;
      this.applyFilters();
    };

    if (heroBtn) heroBtn.addEventListener('click', handleHeroSearch);
    if (heroKeyword) {
      let heroDebounce = null;
      heroKeyword.addEventListener('input', () => {
        clearTimeout(heroDebounce);
        heroDebounce = setTimeout(handleHeroSearch, 150);
      });
      heroKeyword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleHeroSearch();
      });
    }
    if (heroCountry) heroCountry.addEventListener('change', handleHeroSearch);
    if (heroLevel) heroLevel.addEventListener('change', handleHeroSearch);

    // Sidebar Radios
    document.querySelectorAll('input[name="filter_country"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.filters.country = e.target.value;
        if (heroCountry) heroCountry.value = this.filters.country;
        this.visibleCount = 20;
        this.applyFilters();
      });
    });

    document.querySelectorAll('input[name="filter_level"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.filters.level = e.target.value;
        if (heroLevel) heroLevel.value = this.filters.level;
        this.visibleCount = 20;
        this.applyFilters();
      });
    });

    document.querySelectorAll('input[name="filter_field"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.filters.field = e.target.value;
        this.visibleCount = 20;
        this.applyFilters();
      });
    });

    // Budget Slider
    const budgetSlider = document.getElementById('filter-budget-range');
    if (budgetSlider) {
      budgetSlider.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        this.filters.maxBudget = val;
        this.updateBudgetLabel(val);
      });
      budgetSlider.addEventListener('change', () => {
        this.visibleCount = 20;
        this.applyFilters();
      });
    }

    // Intakes Checkboxes
    document.querySelectorAll('.intake-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = Array.from(document.querySelectorAll('.intake-checkbox:checked')).map(c => c.value);
        this.filters.intakes = checked;
        this.visibleCount = 20;
        this.applyFilters();
      });
    });

    // Reset All Button
    const resetBtn = document.getElementById('btn-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetFilters();
      });
    }

    // Sort Dropdown
    const sortSelect = document.getElementById('search-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sort = e.target.value;
        this.applySort();
        this.render();
      });
    }

    // Currency Selector
    const currSelect = document.getElementById('search-currency-select');
    if (currSelect) {
      currSelect.addEventListener('change', (e) => {
        this.currency = e.target.value;
        localStorage.setItem('studyco_currency', this.currency);
        this.updateBudgetLabel(this.filters.maxBudget);
        this.render();
      });
    }

    // Mobile Sidebar Toggle
    const mobileBtn = document.getElementById('search-mobile-filter-btn');
    const sidebar = document.getElementById('search-sidebar');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        const isOpen = sidebar.classList.contains('open');
        mobileBtn.setAttribute('aria-expanded', isOpen);
      });
    }

    // Load More Button
    const loadMoreBtn = document.getElementById('btn-load-more');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.visibleCount += 20;
        this.render();
      });
    }
  }

  resetFilters() {
    this.filters = {
      keyword: '',
      country: '',
      level: '',
      field: '',
      maxBudget: 150000,
      intakes: []
    };
    this.visibleCount = 20;

    // Reset UI
    const heroKeyword = document.getElementById('hero-search-keyword');
    const heroCountry = document.getElementById('hero-search-country');
    const heroLevel = document.getElementById('hero-search-level');
    if (heroKeyword) heroKeyword.value = '';
    if (heroCountry) heroCountry.value = '';
    if (heroLevel) heroLevel.value = '';

    const cRadio = document.querySelector('input[name="filter_country"][value=""]');
    if (cRadio) cRadio.checked = true;
    const lRadio = document.querySelector('input[name="filter_level"][value=""]');
    if (lRadio) lRadio.checked = true;
    const fRadio = document.querySelector('input[name="filter_field"][value=""]');
    if (fRadio) fRadio.checked = true;

    const budgetSlider = document.getElementById('filter-budget-range');
    if (budgetSlider) budgetSlider.value = 150000;
    this.updateBudgetLabel(150000);

    document.querySelectorAll('.intake-checkbox').forEach(cb => { cb.checked = false; });

    // Clear URL query
    window.history.replaceState({}, '', window.location.pathname);

    this.applyFilters();
  }

  applyFilters() {
    const { keyword, country, level, field, maxBudget, intakes } = this.filters;
    const kw = keyword.toLowerCase();

    this.filteredPrograms = this.programs.filter(p => {
      // Keyword match
      if (kw && p._searchIndex && !p._searchIndex.includes(kw)) {
        return false;
      }

      // Country match
      if (country && p._country !== country) {
        return false;
      }

      // Level match
      if (level && (p.level || '').toLowerCase() !== level) {
        return false;
      }

      // Field match
      if (field && (p.field || '').toLowerCase() !== field) {
        return false;
      }

      // Budget match
      if (maxBudget < 150000 && p._annualFeeNum > maxBudget) {
        return false;
      }

      // Intake match
      if (intakes.length > 0) {
        const pIntakes = (p._intakes || '').toLowerCase();
        const matchesAnyIntake = intakes.some(intakeMonth => pIntakes.includes(intakeMonth.toLowerCase()));
        if (!matchesAnyIntake) return false;
      }

      return true;
    });

    this.applySort();
    this.updateActiveChips();
    this.render();
  }

  applySort() {
    switch (this.sort) {
      case 'fee-asc':
        this.filteredPrograms.sort((a, b) => a._annualFeeNum - b._annualFeeNum);
        break;
      case 'fee-desc':
        this.filteredPrograms.sort((a, b) => b._annualFeeNum - a._annualFeeNum);
        break;
      case 'duration-asc':
        this.filteredPrograms.sort((a, b) => (Number(a.duration) || 3) - (Number(b.duration) || 3));
        break;
      default:
        // Default: keep natural ranking / order
        break;
    }
  }

  updateActiveChips() {
    const container = document.getElementById('search-active-chips');
    if (!container) return;

    const chips = [];
    const currentLang = i18n.currentLang || 'ar';
    const dict = SEARCH_I18N[currentLang] || SEARCH_I18N.ar;
    const isAr = currentLang === 'ar';

    if (this.filters.keyword) {
      chips.push({
        label: dict.chipKeyword(this.filters.keyword),
        onRemove: () => {
          this.filters.keyword = '';
          const el = document.getElementById('hero-search-keyword');
          if (el) el.value = '';
          this.applyFilters();
        }
      });
    }

    if (this.filters.country) {
      const cName = isAr ? (COUNTRY_NAMES_AR[this.filters.country] || this.filters.country) : (COUNTRY_NAMES[this.filters.country] || this.filters.country);
      chips.push({
        label: dict.chipCountry(cName),
        onRemove: () => {
          this.filters.country = '';
          const radio = document.querySelector('input[name="filter_country"][value=""]');
          if (radio) radio.checked = true;
          const sel = document.getElementById('hero-search-country');
          if (sel) sel.value = '';
          this.applyFilters();
        }
      });
    }

    if (this.filters.level) {
      const levelsMap = LEVEL_NAMES[currentLang] || LEVEL_NAMES.ar;
      const lName = levelsMap[this.filters.level] || this.filters.level;
      chips.push({
        label: dict.chipLevel(lName),
        onRemove: () => {
          this.filters.level = '';
          const radio = document.querySelector('input[name="filter_level"][value=""]');
          if (radio) radio.checked = true;
          const sel = document.getElementById('hero-search-level');
          if (sel) sel.value = '';
          this.applyFilters();
        }
      });
    }

    if (this.filters.field) {
      const fieldsMap = FIELD_NAMES[currentLang] || FIELD_NAMES.ar;
      const fName = fieldsMap[this.filters.field] || this.filters.field;
      chips.push({
        label: dict.chipField(fName),
        onRemove: () => {
          this.filters.field = '';
          const radio = document.querySelector('input[name="filter_field"][value=""]');
          if (radio) radio.checked = true;
          this.applyFilters();
        }
      });
    }

    if (this.filters.maxBudget < 150000) {
      const formatted = convertFromMYR(this.filters.maxBudget, this.currency, this.exchangeData);
      chips.push({
        label: dict.chipBudget(formatted),
        onRemove: () => {
          this.filters.maxBudget = 150000;
          const slider = document.getElementById('filter-budget-range');
          if (slider) slider.value = 150000;
          this.updateBudgetLabel(150000);
          this.applyFilters();
        }
      });
    }

    if (this.filters.intakes.length > 0) {
      const localizedIntakes = this.filters.intakes.map(m => {
        if (isAr) {
          const key = m.slice(0, 3).toLowerCase();
          return MONTHS_MAP.ar[key] || m;
        }
        return m;
      }).join(', ');

      chips.push({
        label: dict.chipIntakes(localizedIntakes),
        onRemove: () => {
          this.filters.intakes = [];
          document.querySelectorAll('.intake-checkbox').forEach(cb => { cb.checked = false; });
          this.applyFilters();
        }
      });
    }

    container.innerHTML = '';
    chips.forEach(chip => {
      const chipEl = document.createElement('span');
      chipEl.className = 'search-chip';

      const labelSpan = document.createElement('span');
      labelSpan.textContent = chip.label;

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'search-chip-close';
      closeBtn.setAttribute('aria-label', dict.removeFilter);
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', chip.onRemove);

      chipEl.appendChild(labelSpan);
      chipEl.appendChild(closeBtn);
      container.appendChild(chipEl);
    });
  }

  render() {
    const container = document.getElementById('search-programs-container');
    const countContainerEl = document.getElementById('search-results-count');
    const paginationEl = document.getElementById('search-pagination-container');
    if (!container) return;

    const currentLang = i18n.currentLang || 'ar';
    const dict = SEARCH_I18N[currentLang] || SEARCH_I18N.ar;
    const isAr = currentLang === 'ar';

    const totalCount = this.filteredPrograms.length;
    const formattedCount = totalCount.toLocaleString(isAr ? 'ar-EG' : (currentLang === 'id' ? 'id-ID' : 'en-US'));
    if (countContainerEl) {
      countContainerEl.innerHTML = dict.resultsCount(formattedCount);
    }

    if (totalCount === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3.5rem 1.5rem; background: #ffffff; border-radius: 16px; border: 1.5px dashed #d1d5db;">
          <svg style="width: 56px; height: 56px; color: #9ca3af; margin-bottom: 1rem;" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
          </svg>
          <h3 style="font-size: 1.3rem; font-weight: 800; color: #1f2937; margin-bottom: 0.5rem;">${dict.emptyTitle}</h3>
          <p style="color: #6b7280; max-width: 480px; margin: 0 auto 1.5rem; font-size: 0.95rem;">
            ${dict.emptyDesc}
          </p>
          <button type="button" class="btn-search-wa" id="btn-empty-reset" style="margin: 0 auto;">
            ${dict.emptyReset}
          </button>
        </div>
      `;
      const emptyReset = document.getElementById('btn-empty-reset');
      if (emptyReset) emptyReset.addEventListener('click', () => this.resetFilters());
      if (paginationEl) paginationEl.style.display = 'none';
      return;
    }

    const levelsMap = LEVEL_NAMES[currentLang] || LEVEL_NAMES.ar;
    const visibleItems = this.filteredPrograms.slice(0, this.visibleCount);

    const cardsHtml = visibleItems.map(p => {
      const uni = p._uni;
      const progName = isAr ? (p.nameAr || p.name) : p.name;
      const uniName = isAr ? (uni.arabicName || uni.name) : uni.name;
      const flagSrc = COUNTRY_FLAGS[p._country] || 'assets/photo/flag-malaysia.svg';
      const countryName = isAr ? (COUNTRY_NAMES_AR[p._country] || p._country) : (COUNTRY_NAMES[p._country] || p._country);
      const progCurrency = p.currency || getCountryCurrency(p._country) || 'MYR';
      const feeFormatted = (this.currency === 'native' || !this.currency)
        ? formatCurrencyValue(p._annualFeeNum, progCurrency)
        : formatProgramPrice(p._annualFeeNum, progCurrency, this.currency, this.exchangeData);
      const durationText = dict.durationYears(p.duration || 3);
      const ieltsText = p.ielts ? `IELTS ${p.ielts}` : 'IELTS 5.5 - 6.0';
      const intakesText = formatIntakes(p._intakes, currentLang);
      const levelBadge = levelsMap[p.level] || (p.level || '').toUpperCase();

      // WhatsApp consultation link
      const waMsg = dict.waMsg(p.name, uni.arabicName || uni.name);
      const waLink = CONFIG.getWhatsAppLink(waMsg);

      return `
        <article class="search-program-card" data-program-id="${p.id}">
          <div class="search-card-top-row">
            <div class="search-card-uni-meta">
              <img class="search-card-uni-logo" src="${uni.logo || 'assets/photo/logo-dark.webp'}" alt="${uniName} Logo" loading="lazy" />
              <div class="search-card-uni-text">
                <h4>${uniName}</h4>
                <p>
                  <img src="${flagSrc}" alt="${countryName}" width="16" height="11" style="border-radius:2px; vertical-align:middle; display:inline-block;" />
                  <span>${uni.city || countryName}</span>
                </p>
              </div>
            </div>
            <span class="search-card-country-badge">
              <span>${levelBadge}</span>
            </span>
          </div>

          <h3 class="search-card-title"><bdi dir="auto">${progName}</bdi></h3>

          <div class="search-card-details-grid">
            <div class="search-card-detail-item">
              <span class="search-card-detail-label">${dict.feeLabel}</span>
              <span class="search-card-detail-value" style="color: #b45309; font-weight: 800;">${feeFormatted}</span>
            </div>
            <div class="search-card-detail-item">
              <span class="search-card-detail-label">${dict.durationLabel}</span>
              <span class="search-card-detail-value">${durationText}</span>
            </div>
            <div class="search-card-detail-item">
              <span class="search-card-detail-label">${dict.intakesLabel}</span>
              <span class="search-card-detail-value" style="font-size: 0.85rem;">${intakesText}</span>
            </div>
            <div class="search-card-detail-item">
              <span class="search-card-detail-label">${dict.ieltsLabel}</span>
              <span class="search-card-detail-value">${ieltsText}</span>
            </div>
          </div>

          <div class="search-card-actions-row">
            <a href="university.html?id=${uni.id}#programs" class="btn-search-detail">
              <span>${dict.uniDetailsBtn}</span>
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-search-wa">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2z"/>
              </svg>
              <span>${dict.waBtn}</span>
            </a>
          </div>
        </article>
      `;
    }).join('');

    container.innerHTML = cardsHtml;

    // Show or hide pagination Load More button
    if (paginationEl) {
      if (this.visibleCount < totalCount) {
        paginationEl.style.display = 'block';
      } else {
        paginationEl.style.display = 'none';
      }
    }
  }
}

// Instantiate and initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const engine = new FacetedSearchEngine();
  engine.init();
});
