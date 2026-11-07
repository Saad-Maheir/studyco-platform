import { i18n } from './i18n.js?v=88.0';
import { CONFIG } from './config.js?v=88.0';

const COUNTRY_KEY = { malaysia: 'dest_malaysia', australia: 'dest_australia', uk: 'dest_uk', canada: 'dest_canada', newzealand: 'dest_newzealand', singapore: 'dest_singapore' };
const FIELD_KEY = { business: 'major_business', cs: 'major_cs', engineering: 'major_engineering', health: 'major_health', hospitality: 'major_hospitality', arts: 'major_arts', law: 'major_law', architecture: 'major_architecture' };
const FLAG = { malaysia: 'assets/photo/flag-malaysia.svg', australia: 'assets/photo/flag-australia.svg', uk: 'assets/photo/flag-uk.svg', canada: 'assets/photo/flag-canada.svg', newzealand: 'assets/photo/flag-newzealand.svg', singapore: 'assets/photo/flag-singapore.svg' };

export class UniversityDirectory {
  constructor() {
    this.universities = [];
    this.filters = { search: '', country: '', field: '' };
    this.pageSize = 24;
    this.visibleCount = 24;
  }

  async init() {
    try {
      const v = `?v=${Date.now()}`;
      const uniRes = await fetch(`/data/universities.json${v}`);
      this.universities = (await uniRes.json()).universities;
    } catch (err) {
      console.warn('[Universities] Could not load data:', err);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const countryParam = urlParams.get('country');
    if (countryParam && COUNTRY_KEY[countryParam]) {
      this.filters.country = countryParam;
    }

    this.populateFilters();
    this.bindEvents();
    this.render();
    window.addEventListener('languageChanged', () => {
      this.populateFilters();
      this.render();
    });
  }

  programCountFor(uniId) {
    const uni = this.universities.find((u) => u.id === uniId);
    return uni?.programsCount || 0;
  }

  populateFilters() {
    const countrySelect = document.getElementById('uni-filter-country');
    const fieldSelect = document.getElementById('uni-filter-field');
    if (!countrySelect || !fieldSelect) return;

    const countries = [...new Set(this.universities.map((u) => u.country))];
    const fields = ['business', 'cs', 'engineering', 'health', 'hospitality', 'arts', 'architecture', 'law'];

    countrySelect.innerHTML = `<option value="">${i18n.t('uni_filter_country')}</option>` +
      countries.map((c) => `<option value="${c}">${i18n.t(COUNTRY_KEY[c] || c)}</option>`).join('');
    fieldSelect.innerHTML = `<option value="">${i18n.t('uni_filter_field')}</option>` +
      fields.map((f) => `<option value="${f}">${i18n.t(FIELD_KEY[f] || f)}</option>`).join('');

    countrySelect.value = this.filters.country;
    fieldSelect.value = this.filters.field;
  }

  bindEvents() {
    const search = document.getElementById('uni-search');
    const countrySelect = document.getElementById('uni-filter-country');
    const fieldSelect = document.getElementById('uni-filter-field');
    const resetBtn = document.getElementById('uni-filter-reset');
    const loadMoreBtn = document.getElementById('uni-load-more-btn');

    if (search) {
      let debounceTimer = null;
      search.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.filters.search = search.value.trim().toLowerCase();
          this.visibleCount = this.pageSize;
          this.render();
        }, 150);
      });
    }
    if (countrySelect) countrySelect.addEventListener('change', () => { 
      this.filters.country = countrySelect.value; 
      this.visibleCount = this.pageSize;
      this.render(); 
    });
    if (fieldSelect) fieldSelect.addEventListener('change', () => { 
      this.filters.field = fieldSelect.value; 
      this.visibleCount = this.pageSize;
      this.render(); 
    });
    if (resetBtn) resetBtn.addEventListener('click', () => {
      this.filters = { search: '', country: '', field: '' };
      if (search) search.value = '';
      if (countrySelect) countrySelect.value = '';
      if (fieldSelect) fieldSelect.value = '';
      this.visibleCount = this.pageSize;
      this.render();
    });
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.visibleCount += this.pageSize;
        this.render();
      });
    }
  }

  matches(uni) {
    if (this.filters.search) {
      const q = this.filters.search;
      const matchEn = uni.name && uni.name.toLowerCase().includes(q);
      const matchAr = uni.arabicName && uni.arabicName.toLowerCase().includes(q);
      if (!matchEn && !matchAr) return false;
    }
    if (this.filters.country && uni.country !== this.filters.country) return false;
    if (this.filters.field) {
      const hasField = Array.isArray(uni.majors) && uni.majors.includes(this.filters.field);
      if (!hasField) return false;
    }
    return true;
  }

  render() {
    const grid = document.getElementById('uni-grid');
    const noResults = document.getElementById('uni-no-results');
    const loadMoreWrap = document.getElementById('uni-load-more-wrap');
    const loadMoreBtn = document.getElementById('uni-load-more-btn');
    if (!grid) return;

    const list = this.universities.filter((u) => this.matches(u));
    grid.innerHTML = '';

    if (list.length === 0) {
      if (noResults) noResults.style.display = 'block';
      if (loadMoreWrap) loadMoreWrap.style.display = 'none';
      return;
    }
    if (noResults) noResults.style.display = 'none';

    const visibleList = list.slice(0, this.visibleCount);
    const fragment = document.createDocumentFragment();

    visibleList.forEach((uni) => {
      const count = this.programCountFor(uni.id);
      const card = document.createElement('div');
      card.className = 'entity-card';
      const isAr = (i18n.currentLang === 'ar');
      let uniTitle = (isAr && uni.arabicName) ? uni.arabicName : uni.name;
      const rawTitle = uniTitle;
      if (isAr && uniTitle.includes('(') && uniTitle.includes(')')) {
        uniTitle = uniTitle.replace(/\(([^)]+)\)/, '<span dir="ltr" style="display:inline-block; unicode-bidi:embed;">($1)</span>');
      }
      const waMsg = i18n.t('wa_university_msg', { university: rawTitle });
      const logoSrc = uni.logo ? (uni.logo.startsWith('/') || uni.logo.startsWith('http') ? uni.logo : '/' + uni.logo) : '/assets/photo/logo.webp';
      card.innerHTML = `
        <a href="university.html?id=${uni.id}"><div class="entity-card-logo"><img alt="${rawTitle}" loading="lazy" decoding="async" src="${logoSrc}" width="80" height="80" onerror="this.onerror=null; this.src='/assets/photo/logo.webp';"/></div></a>
        <h3 class="entity-card-title"><a href="university.html?id=${uni.id}" style="color:inherit;"><bdi>${uniTitle}</bdi></a></h3>
        <p class="entity-card-meta"><img alt="" class="entity-flag-icon" src="${FLAG[uni.country] || ''}" width="20" height="14"/> ${i18n.t(uni.cityKey || uni.city)}${i18n.t('list_separator')}${i18n.t(COUNTRY_KEY[uni.country] || uni.country)}</p>
        <span class="entity-card-badge">${i18n.t('uni_programs_count', { count: String(count) })}</span>
        <div class="entity-card-actions">
          <a class="btn-entity-primary" href="university.html?id=${uni.id}">${i18n.t('uni_view_programs_btn')}</a>
          <a class="btn-entity-wa" href="${CONFIG.getWhatsAppLink(waMsg)}" rel="noopener noreferrer" target="_blank">${i18n.t('uni_contact_btn')}</a>
        </div>`;
      fragment.appendChild(card);
    });

    grid.appendChild(fragment);

    if (loadMoreWrap && loadMoreBtn) {
      if (this.visibleCount < list.length) {
        loadMoreWrap.style.display = 'block';
        const isAr = (i18n.currentLang === 'ar');
        const shown = Math.min(this.visibleCount, list.length);
        const total = list.length;
        const textSpan = loadMoreBtn.querySelector('.load-more-text');
        if (textSpan) {
          textSpan.textContent = isAr 
            ? `عرض المزيد من الجامعات (تم عرض ${shown} من أصل ${total})` 
            : `Tampilkan Lebih Banyak (${shown} dari ${total})`;
        }
      } else {
        loadMoreWrap.style.display = 'none';
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const directory = new UniversityDirectory();
  await directory.init();
});
