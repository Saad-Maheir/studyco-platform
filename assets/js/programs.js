// StudyCo Academic Programmes — Search, filter, sort, currency display, and comparison engine
import { i18n } from './i18n.js?v=88.0';
import { CONFIG } from './config.js?v=88.0';
import { getExchangeRates, formatProgramPrice, formatCurrencyValue, getCountryCurrency } from './currency.js?v=88.0';
import { ICONS } from './icons.js';

const COUNTRY_KEY = {
  malaysia: 'dest_malaysia',
  australia: 'dest_australia',
  uk: 'dest_uk',
  canada: 'dest_canada',
  newzealand: 'dest_newzealand',
  singapore: 'dest_singapore'
};

const FIELD_KEY = {
  business: 'field_business',
  cs: 'field_cs',
  engineering: 'field_engineering',
  health: 'field_health',
  hospitality: 'field_hospitality',
  arts: 'field_arts',
  architecture: 'field_architecture',
  law: 'field_law',
  education: 'field_education'
};

const FLAG = {
  malaysia: 'assets/photo/flag-malaysia.svg',
  australia: 'assets/photo/flag-australia.svg',
  uk: 'assets/photo/flag-uk.svg',
  canada: 'assets/photo/flag-canada.svg',
  newzealand: 'assets/photo/flag-newzealand.svg',
  singapore: 'assets/photo/flag-singapore.svg'
};

const COMPARE_KEY = 'studyco_compare';
const COMPARE_MAX = 3;

function midpoint(rangeStr) {
  if (!rangeStr) return 0;
  const parts = rangeStr.split('-').map((n) => parseFloat(n.replace(/[^0-9.]/g, '')));
  if (parts.length === 1) return parts[0] || 0;
  return (parts[0] + parts[1]) / 2;
}

function getCompareIds() {
  try {
    return JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function setCompareIds(ids) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
}

export class ProgramDirectory {
  constructor() {
    this.universities = [];
    this.programs = [];
    this.costs = {};
    this.exchangeData = null;
    this.filters = { search: '', level: '', field: '', country: '', mode: '' };
    this.sort = 'default';
    this.currency = localStorage.getItem('studyco_currency') || 'native';
    this.currentPage = 1;
    this.pageSize = 24;
  }

  async init() {
    try {
      const v = `?v=${Date.now()}`;
      const [uniRes, progRes, costsRes, exchangeData] = await Promise.all([
        fetch(`./data/universities.json${v}`),
        fetch(`./data/programs.json${v}`),
        fetch(`./data/costs.json${v}`),
        getExchangeRates()
      ]);

      this.universities = (await uniRes.json()).universities;
      this.programs = (await progRes.json()).programs;
      this.costs = (await costsRes.json()).destinations || {};
      this.exchangeData = exchangeData;
    } catch (err) {
      console.warn('[Programs] Could not load data:', err);
      return;
    }

    this.enrichPrograms();
    this.populateFilters();
    this.applyUniFilterFromUrl();
    this.bindEvents();
    this.render();
    this.updateCompareBar();

    window.addEventListener('languageChanged', () => {
      this.populateFilters();
      this.render();
      this.updateCompareBar();
    });
  }

  enrichPrograms() {
    const uniById = Object.fromEntries(this.universities.map((u) => [u.id, u]));
    this.programs.forEach((p) => {
      const uni = uniById[p.universityId] || this.universities[0];
      p._university = uni;
      const c = this.costs[uni?.country || 'malaysia'];
      const field = c && c.fields ? c.fields[p.field] : null;
      p._symbol = c ? c.symbol : 'RM ';
      p._tuition = p.annualFee ? String(p.annualFee) : (field ? field.tuition : '30,000');
      p._duration = p.duration ? String(p.duration) : (field ? field.duration : '3');
      p._midpointNative = p.annualFee || (field ? midpoint(field.tuition) : 30000);
      p._displayName = p.name || (p.titleKey ? i18n.t(p.titleKey) : 'Degree Program');
      p._searchStr = `${p.name || ''} ${p.nameAr || ''} ${uni?.name || ''} ${uni?.arabicName || ''}`.toLowerCase();
    });
  }

  applyUniFilterFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const uni = params.get('uni');
    if (uni) this.filters.uniId = uni;
    const mode = params.get('studyMode') || params.get('mode');
    if (mode) this.filters.mode = mode;
    const level = params.get('level');
    if (level) this.filters.level = level;
    const field = params.get('field');
    if (field) this.filters.field = field;
    const country = params.get('country');
    if (country) this.filters.country = country;
  }

  populateFilters() {
    const levelSelect = document.getElementById('prog-filter-level');
    const fieldSelect = document.getElementById('prog-filter-field');
    const countrySelect = document.getElementById('prog-filter-country');
    const modeSelect = document.getElementById('prog-filter-mode');
    const currSelect = document.getElementById('currency-select');
    if (!levelSelect || !fieldSelect || !countrySelect) return;

    const levels = ['bachelor', 'master', 'phd', 'diploma', 'foundation'];
    const fields = ['cs', 'business', 'engineering', 'health', 'hospitality', 'arts', 'architecture', 'law', 'education'];
    const countries = ['malaysia', 'australia', 'uk', 'canada', 'newzealand', 'singapore'];

    levelSelect.innerHTML = `<option value="">${i18n.t('prog_filter_level')}</option>` +
      levels.map((l) => `<option value="${l}">${i18n.t('level_' + l)}</option>`).join('');

    fieldSelect.innerHTML = `<option value="">${i18n.t('prog_filter_field')}</option>` +
      fields.map((f) => `<option value="${f}">${i18n.t(FIELD_KEY[f] || 'major_' + f) || f}</option>`).join('');

    countrySelect.innerHTML = `<option value="">${i18n.t('prog_filter_country')}</option>` +
      countries.map((c) => `<option value="${c}">${i18n.t(COUNTRY_KEY[c] || c)}</option>`).join('');

    if (currSelect) {
      currSelect.innerHTML = `
        <option value="native" ${this.currency === 'native' ? 'selected' : ''}>${i18n.t('curr_native') || 'العملة الرسمية للدولة (A$, £, C$, NZ$, S$, RM)'}</option>
        <option value="USD" ${this.currency === 'USD' ? 'selected' : ''}>${i18n.t('curr_usd')} ($ USD)</option>
        <option value="IDR" ${this.currency === 'IDR' ? 'selected' : ''}>${i18n.t('curr_idr') || 'الروبية الإندونيسية'} (Rp IDR)</option>
        <option value="SAR" ${this.currency === 'SAR' ? 'selected' : ''}>${i18n.t('curr_sar') || 'الريال السعودي'} (SAR)</option>
        <option value="MYR" ${this.currency === 'MYR' ? 'selected' : ''}>${i18n.t('curr_myr')} (RM MYR)</option>
      `;
    }

    levelSelect.value = this.filters.level;
    fieldSelect.value = this.filters.field;
    countrySelect.value = this.filters.country;
    if (modeSelect) modeSelect.value = this.filters.mode || '';
  }

  bindEvents() {
    const search = document.getElementById('prog-search');
    const level = document.getElementById('prog-filter-level');
    const field = document.getElementById('prog-filter-field');
    const country = document.getElementById('prog-filter-country');
    const mode = document.getElementById('prog-filter-mode');
    const reset = document.getElementById('prog-filter-reset');
    const sort = document.getElementById('prog-sort');
    const currency = document.getElementById('currency-select');
    const clearBtn = document.getElementById('compare-clear-btn');

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
    if (mode) {
      mode.addEventListener('change', () => {
        this.filters.mode = mode.value;
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
        localStorage.setItem('studyco_currency', currency.value);
        this.render();
      });
    }
    if (reset) {
      reset.addEventListener('click', () => {
        this.filters = { search: '', level: '', field: '', country: '', mode: '' };
        if (search) search.value = '';
        if (level) level.value = '';
        if (field) field.value = '';
        if (country) country.value = '';
        if (mode) mode.value = '';
        this.currentPage = 1;
        this.render();
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        setCompareIds([]);
        this.updateCompareBar();
        this.render();
      });
    }
  }

  matches(p) {
    if (this.filters.search) {
      if (!p._searchStr || !p._searchStr.includes(this.filters.search)) return false;
    }
    if (this.filters.level && p.level !== this.filters.level) return false;
    if (this.filters.field && p.field !== this.filters.field) return false;
    if (this.filters.country && p._university?.country !== this.filters.country) return false;
    if (this.filters.uniId && p.universityId !== this.filters.uniId) return false;
    if (this.filters.mode) {
      if (this.filters.mode === 'online' && p.studyMode !== 'online') return false;
      if (this.filters.mode === 'on-campus' && p.studyMode === 'online') return false;
    }
    return true;
  }

  sortedList(list) {
    if (this.sort === 'default') return list;
    const withVal = list.map((p) => {
      const val = p._midpointNative || 0;
      return { p, val };
    });
    withVal.sort((a, b) => (this.sort === 'asc' ? a.val - b.val : b.val - a.val));
    return withVal.map((x) => x.p);
  }

  formatPrice(p) {
    const progCurrency = p.currency || (p._university ? getCountryCurrency(p._university.country) : 'MYR');
    const feeVal = p.annualFee || p._tuition;
    if (this.currency === 'native' || !this.currency) {
      return `${formatCurrencyValue(feeVal, progCurrency)} / ${i18n.t('calc_per_year')}`;
    }
    const converted = formatProgramPrice(feeVal, progCurrency, this.currency, this.exchangeData);
    return `${converted} / ${i18n.t('calc_per_year')}`;
  }

  render() {
    const grid = document.getElementById('prog-grid');
    const noResults = document.getElementById('prog-no-results');
    if (!grid) return;

    let list = this.programs.filter((p) => this.matches(p));
    list = this.sortedList(list);
    grid.innerHTML = '';

    if (list.length === 0) {
      if (noResults) noResults.style.display = 'block';
      this.renderPagination(0, 1, 0);
      return;
    }
    if (noResults) noResults.style.display = 'none';

    const totalCount = list.length;
    const totalPages = Math.ceil(totalCount / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = 1;
    if (this.currentPage < 1) this.currentPage = 1;

    const start = (this.currentPage - 1) * this.pageSize;
    const pageItems = list.slice(start, start + this.pageSize);

    const compareIds = getCompareIds();

    pageItems.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'entity-card';
      const isAr = (i18n.currentLang === 'ar');
      const progTitle = (isAr && p.nameAr) ? p.nameAr : (p.name || (p.titleKey ? i18n.t(p.titleKey) : 'Program'));
      let uniName = (isAr && p._university?.arabicName) ? p._university.arabicName : (p._university ? p._university.name : 'University');
      const rawUniName = uniName;
      if (isAr && uniName.includes('(') && uniName.includes(')')) {
        uniName = uniName.replace(/\(([^)]+)\)/, '<span dir="ltr" style="display:inline-block; unicode-bidi:embed;">($1)</span>');
      }
      const waMsg = i18n.t('wa_program_apply_msg', { program: progTitle, university: rawUniName });
      const checked = compareIds.includes(p.id) ? 'checked' : '';
      const disabled = !checked && compareIds.length >= COMPARE_MAX ? 'disabled' : '';

      const onlineBadge = isOnline
        ? `<span class="entity-card-badge" style="background:#f3e8ff; color:#7e22ce; border:1px solid #d8b4fe; font-weight:700; display:inline-flex; align-items:center; gap:4px;"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> ${isAr ? 'برنامج أونلاين عن بُعد' : 'Gelar Online'}</span>`
        : '';

      card.innerHTML = `
        <a href="university.html?id=${p.universityId}"><div class="entity-card-logo"><img alt="${rawUniName}" loading="lazy" src="${p._university?.logo || ''}"/></div></a>
        <h3 class="entity-card-title"><a href="university.html?id=${p.universityId}" style="color:inherit;"><bdi>${progTitle}</bdi></a></h3>
        ${isAr && p.nameAr ? `<p style="font-size: 0.8rem; color: var(--color-gray-500); margin: -0.25rem 0 0.5rem 0; font-weight: 500;">${p.name}</p>` : ''}
        <div style="margin-block-end: 0.5rem; display:flex; flex-wrap:wrap; justify-content:center; gap:0.35rem;">
          ${onlineBadge}
          <span class="entity-card-badge" style="background:#eef2ff; color:#4338ca; border:1px solid #c7d2fe;">${ICONS.target} ${i18n.t('table_header_ielts')}: ${p.ielts || '6.0'}</span>
        </div>
        <p class="entity-card-meta">${ICONS.building} <bdi>${uniName}</bdi></p>
        <p class="entity-card-meta"><img alt="" class="entity-flag-icon" src="${FLAG[p._university?.country] || ''}"/> ${i18n.t(COUNTRY_KEY[p._university?.country] || p._university?.country)}</p>
        <p class="entity-card-price">${this.formatPrice(p)}</p>
        <p class="entity-card-meta">${ICONS.clock} ${i18n.t('prog_duration_years', { n: p._duration })}</p>
        <label class="entity-compare-checkbox" title="${i18n.t('prog_compare_max')}">
          <input type="checkbox" data-compare-id="${p.id}" ${checked} ${disabled}/>
          ${i18n.t('prog_compare_btn')}
        </label>
        <div class="entity-card-actions">
          <a class="btn-entity-primary" href="university.html?id=${p.universityId}&tab=courses">${i18n.t('btn_view_university')}</a>
          <a class="btn-entity-wa" href="${CONFIG.getWhatsAppLink(waMsg)}" rel="noopener noreferrer" target="_blank">${i18n.t('prog_contact_btn')}</a>
        </div>`;

      const checkbox = card.querySelector('input[data-compare-id]');
      checkbox.addEventListener('change', () => {
        let ids = getCompareIds();
        if (checkbox.checked) {
          if (ids.length >= COMPARE_MAX) {
            checkbox.checked = false;
            return;
          }
          ids.push(p.id);
        } else {
          ids = ids.filter((id) => id !== p.id);
        }
        setCompareIds(ids);
        this.updateCompareBar();
        this.render();
      });
      grid.appendChild(card);
    });

    this.renderPagination(totalCount, totalPages, start);
  }

  renderPagination(totalCount, totalPages, start) {
    const paginationEl = document.getElementById('prog-pagination');
    if (!paginationEl) return;

    if (totalCount === 0 || totalPages <= 1) {
      paginationEl.innerHTML = '';
      paginationEl.style.display = 'none';
      return;
    }

    paginationEl.style.display = 'flex';
    const end = Math.min(start + this.pageSize, totalCount);
    const showingText = i18n.t('prog_showing_count', {
      from: start + 1,
      to: end,
      total: totalCount
    });

    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (this.currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (this.currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', totalPages);
      }
    }

    const prevLabel = i18n.t('pagination_prev');
    const nextLabel = i18n.t('pagination_next');
    const isRtl = (i18n.currentLang === 'ar');

    let controlsHtml = `
      <button class="pagination-btn pagination-prev" ${this.currentPage === 1 ? 'disabled' : ''} aria-label="${prevLabel}">
        ${isRtl ? '→ ' + prevLabel : '← ' + prevLabel}
      </button>
    `;

    pages.forEach((p) => {
      if (p === '...') {
        controlsHtml += `<span class="pagination-ellipsis">…</span>`;
      } else {
        const isActive = p === this.currentPage ? 'active' : '';
        controlsHtml += `<button class="pagination-btn ${isActive}" data-page="${p}">${p}</button>`;
      }
    });

    controlsHtml += `
      <button class="pagination-btn pagination-next" ${this.currentPage === totalPages ? 'disabled' : ''} aria-label="${nextLabel}">
        ${isRtl ? nextLabel + ' ←' : nextLabel + ' →'}
      </button>
    `;

    paginationEl.innerHTML = `
      <div class="pagination-info">${showingText}</div>
      <div class="pagination-controls">${controlsHtml}</div>
    `;

    const prevBtn = paginationEl.querySelector('.pagination-prev');
    if (prevBtn && this.currentPage > 1) {
      prevBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
    }

    const nextBtn = paginationEl.querySelector('.pagination-next');
    if (nextBtn && this.currentPage < totalPages) {
      nextBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
    }

    paginationEl.querySelectorAll('button[data-page]').forEach((btn) => {
      const pageNum = parseInt(btn.getAttribute('data-page'), 10);
      btn.addEventListener('click', () => {
        if (pageNum !== this.currentPage) {
          this.goToPage(pageNum);
        }
      });
    });
  }

  goToPage(pageNum) {
    this.currentPage = pageNum;
    this.render();
    const listSection = document.getElementById('programs-list');
    if (listSection) {
      listSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  updateCompareBar() {
    const bar = document.getElementById('compare-bar');
    const title = document.getElementById('compare-bar-title');
    if (!bar) return;
    const ids = getCompareIds();
    if (ids.length > 0) {
      bar.classList.add('active');
      if (title) title.textContent = `${i18n.t('prog_compare_bar_title')} (${ids.length}/${COMPARE_MAX})`;
    } else {
      bar.classList.remove('active');
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const directory = new ProgramDirectory();
  await directory.init();
});
