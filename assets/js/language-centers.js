// StudyCo - Language Centers Directory (18 Independent Malaysian Institutes + Partner University Centers)
import { i18n } from './i18n.js?v=88.0';
import { CONFIG } from './config.js?v=88.0';
import { formatCurrencyValue, convertFromMYR, getExchangeRates } from './currency.js?v=88.0';
import { getFeatureText, getLcText, getWhatsAppMessage } from './lc-translations.js?v=88.0';

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

function formatDuration(months, lang) {
  const count = parseInt(months, 10) || 1;
  if (lang === 'ar') {
    if (count === 1) return 'شهر واحد';
    if (count === 2) return 'شهران';
    if (count >= 3 && count <= 10) return `${count} أشهر`;
    return `${count} شهراً`;
  }
  if (lang === 'id') return `${count} Bulan`;
  if (lang === 'zh') return `${count} 个月`;
  if (lang === 'es') return `${count} Mes${count > 1 ? 'es' : ''}`;
  if (lang === 'fr') return `${count} Mois`;
  if (lang === 'ru') return `${count} мес.`;
  if (lang === 'ja') return `${count}ヶ月`;
  if (lang === 'ko') return `${count}개월`;
  return `${count} Month${count > 1 ? 's' : ''}`;
}

function formatVisa(visa, months, lang) {
  const hasVisa = visa && visa !== 'No' && visa !== '0 month(s)' && visa !== '0' && months >= 4;
  if (lang === 'ar') {
    if (hasVisa) {
      return `تأشيرة طالب متاحة (${months >= 10 ? 'صلاحية سنة' : 'صلاحية 6 أشهر'})`;
    }
    return 'بدون تأشيرة دراسية (دورة قصيرة)';
  }
  if (lang === 'id') {
    if (hasVisa) return `Visa Pelajar Tersedia (${months >= 10 ? '1 Tahun' : '6 Bulan'})`;
    return 'Tanpa Visa Pelajar (Kursus Singkat)';
  }
  if (lang === 'zh') {
    if (hasVisa) return `可办理学生签证（${months >= 10 ? '1年' : '6个月'}）`;
    return '无学生签证（短期学习）';
  }
  if (lang === 'es') {
    if (hasVisa) return `Visa de estudiante (${months >= 10 ? '1 año' : '6 meses'})`;
    return 'Sin visa (curso corto)';
  }
  if (lang === 'fr') {
    if (hasVisa) return `Visa étudiant (${months >= 10 ? '1 an' : '6 mois'})`;
    return 'Sans visa (cours court)';
  }
  if (lang === 'ru') {
    if (hasVisa) return `Студенческая виза (${months >= 10 ? '1 год' : '6 месяцев'})`;
    return 'Без визы (краткий курс)';
  }
  if (lang === 'ja') {
    if (hasVisa) return `学生ビザ（${months >= 10 ? '1年' : '6ヶ月'}）`;
    return 'ビザなし（短期コース）';
  }
  if (lang === 'ko') {
    if (hasVisa) return `학생 비자 (${months >= 10 ? '1년' : '6개월'})`;
    return '비자 없음 (단기 과정)';
  }
  if (hasVisa) return `Student Visa Available (${months >= 10 ? '1 Year' : '6 Months'})`;
  return 'No Student Visa (Short Course)';
}

export class LanguageCenterDirectory {
  constructor() {
    this.centers = [];
    this.universities = [];
    this.filters = { search: '', country: '', type: 'all' };
    this.currency = localStorage.getItem('studyco_currency') || 'MYR';
    this.exchangeData = null;
  }

  async init() {
    try {
      const [lcRes, uniRes, exchangeData] = await Promise.all([
        fetch('./data/language-centers.json?v=' + Date.now(), { cache: 'no-cache' }),
        fetch('./data/universities.json?v=' + Date.now(), { cache: 'no-cache' }),
        getExchangeRates()
      ]);
      const lcData = await lcRes.json();
      this.centers = lcData.languageCenters || lcData.centers || [];
      const uniData = await uniRes.json();
      this.universities = uniData.universities || uniData || [];
      this.exchangeData = exchangeData;

      // Live CMS overrides overlay (Server data/cms-overrides.json + Client localStorage)
      const applyLcOverrides = (ov) => {
        if (!ov) return;
        const modified = ov.language_centers?.modified || ov.language_centers || {};
        Object.values(modified).forEach(c => {
          if (c && c.id) {
            const idx = this.centers.findIndex(x => x.id === c.id);
            if (idx >= 0) this.centers[idx] = Object.assign({}, this.centers[idx], c);
            else this.centers.unshift(c);
          }
        });
        const deleted = ov.deleted_language_centers || ov.language_centers?.deleted || [];
        if (Array.isArray(deleted) && deleted.length > 0) {
          const delSet = new Set(deleted);
          this.centers = this.centers.filter(c => !delSet.has(c.id));
        }
      };

      try {
        const ovRes = await fetch('./data/cms-overrides.json?v=' + Date.now(), { cache: 'no-cache' });
        if (ovRes.ok) applyLcOverrides(await ovRes.json());
      } catch (e) {}

      // Client-side preview overrides from localStorage (Vercel / Offline mode)
      try {
        const localOv = JSON.parse(localStorage.getItem('studyco_cms_overrides') || 'null');
        if (localOv) applyLcOverrides(localOv);
        const localCenters = JSON.parse(localStorage.getItem('studyco_language_centers') || 'null');
        if (Array.isArray(localCenters) && localCenters.length > 0) {
          localCenters.forEach(c => {
            if (c && c.id) {
              const idx = this.centers.findIndex(x => x.id === c.id);
              if (idx >= 0) this.centers[idx] = Object.assign({}, this.centers[idx], c);
              else this.centers.unshift(c);
            }
          });
        }
      } catch (e) {}
    } catch (err) {
      console.warn('[LanguageCenters] Could not load data:', err);
      return;
    }

    const uniById = Object.fromEntries(this.universities.map((u) => [u.id, u]));
    this.centers.forEach((c) => {
      if (c.universityId && uniById[c.universityId]) {
        c._university = uniById[c.universityId];
      }
    });

    this.populateFilters();
    this.bindEvents();
    this.render();

    window.addEventListener('languageChanged', () => {
      this.populateFilters();
      this.render();
      // Re-render open modal if exists
      const modal = document.getElementById('lc-details-modal');
      if (modal && modal.classList.contains('open') && this._activeCenter) {
        this.openModal(this._activeCenter);
      }
    });

    window.addEventListener('currencyChanged', (e) => {
      if (e.detail?.currency) {
        this.currency = e.detail.currency;
      }
      this.render();
      const modal = document.getElementById('lc-details-modal');
      if (modal && modal.classList.contains('open') && this._activeCenter) {
        this.openModal(this._activeCenter);
      }
    });
  }

  getCenterName(c, lang) {
    if (c.nameMulti && c.nameMulti[lang]) return c.nameMulti[lang];
    if (lang === 'ar' && c.nameAr) return c.nameAr;
    return c.name || c.nameAr || '';
  }

  getCenterCity(c, lang) {
    if (c.cityMulti && c.cityMulti[lang]) return c.cityMulti[lang];
    if (lang === 'ar' && c.cityAr) return c.cityAr;
    return c.city || '';
  }

  getCenterFeatures(c, lang) {
    if (c.featuresMulti && c.featuresMulti[lang] && c.featuresMulti[lang].length) {
      return c.featuresMulti[lang];
    }
    const base = c.features || [];
    return base.map((f) => getFeatureText(f, lang));
  }

  getCenterAbout(c, lang) {
    if (c.aboutMulti && c.aboutMulti[lang]) return c.aboutMulti[lang];
    if (lang === 'ar') return c.aboutAr || c.about || '';
    return c.about || c.aboutAr || '';
  }

  populateFilters() {
    const countrySelect = document.getElementById('lc-filter-country');
    if (!countrySelect) return;
    const countries = [...new Set(this.centers.map((c) => c.country))];
    countrySelect.innerHTML = `<option value="">${i18n.t('lc_filter_country') || 'All Countries'}</option>` +
      countries.map((c) => `<option value="${c}">${i18n.t(COUNTRY_KEY[c] || c)}</option>`).join('');
    countrySelect.value = this.filters.country;
  }

  bindEvents() {
    const search = document.getElementById('lc-search');
    const country = document.getElementById('lc-filter-country');
    if (search) {
      search.addEventListener('input', () => {
        this.filters.search = search.value.trim().toLowerCase();
        this.render();
      });
    }
    if (country) {
      country.addEventListener('change', () => {
        this.filters.country = country.value;
        this.render();
      });
    }

    // Modal click delegation
    document.addEventListener('click', (e) => {
      const btnDetails = e.target.closest('.btn-lc-modal');
      if (btnDetails) {
        const cid = btnDetails.getAttribute('data-lc-id');
        const center = this.centers.find((c) => c.id === cid);
        if (center) {
          this.openModal(center);
        }
      }

      if (e.target.closest('#lc-modal-close') || e.target.classList.contains('course-modal-backdrop')) {
        this.closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  matches(c) {
    const lang = i18n.currentLang || 'ar';
    const name = this.getCenterName(c, lang).toLowerCase();
    const origName = (c.name || '').toLowerCase();
    const arName = (c.nameAr || '').toLowerCase();
    const city = this.getCenterCity(c, lang).toLowerCase();

    if (this.filters.search) {
      const q = this.filters.search;
      const matchName = name.includes(q) || origName.includes(q) || arName.includes(q);
      const matchCity = city.includes(q);
      if (!matchName && !matchCity) return false;
    }

    if (this.filters.country && c.country !== this.filters.country) {
      return false;
    }
    return true;
  }

  formatPrice(feeMYR) {
    if (!feeMYR) return '2,100 MYR';
    if (this.currency === 'native' || this.currency === 'MYR' || !this.currency) {
      return `${feeMYR.toLocaleString()} MYR`;
    }
    return convertFromMYR(feeMYR, this.currency, this.exchangeData);
  }

  render() {
    const grid = document.getElementById('lc-grid');
    const noResults = document.getElementById('lc-no-results');
    if (!grid) return;

    const list = this.centers.filter((c) => this.matches(c));
    grid.innerHTML = '';

    if (list.length === 0) {
      if (noResults) noResults.style.display = 'block';
      return;
    }
    if (noResults) noResults.style.display = 'none';

    const lang = i18n.currentLang || 'ar';

    list.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'entity-card lc-card-enhanced';
      card.style.cssText = 'display: flex; flex-direction: column; justify-content: space-between; text-align: start; padding: 1.25rem; border-radius: 1rem; border: 1px solid var(--color-gray-200); background: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: all 0.3s ease; position: relative;';

      const name = this.getCenterName(c, lang);
      const city = this.getCenterCity(c, lang);
      const countryLabel = i18n.t(COUNTRY_KEY[c.country] || c.country);
      const rawImgSrc = c.image || (c._university && c._university.image) || 'assets/photo/logo.webp';
      const imgSrc = rawImgSrc.includes('?') ? rawImgSrc : `${rawImgSrc}?v=40.0`;
      
      const waMsg = getWhatsAppMessage(name, city, countryLabel, lang);
      const minFeeFormatted = this.formatPrice(c.minFeeMYR);

      const features = this.getCenterFeatures(c, lang);
      const featuresHtml = (features && features.length)
        ? `<div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-block: 0.75rem;">
            ${features.slice(0, 3).map(f => `<span style="font-size: 0.75rem; background: #f8fafc; color: #334155; padding: 0.2rem 0.55rem; border-radius: 0.35rem; border: 1px solid #e2e8f0; font-weight: 500;">${f}</span>`).join('')}
           </div>`
        : '';

      const badgeKey = c.universityId ? 'lc_badge_university' : 'lc_badge_independent';
      const badgeText = getLcText(badgeKey, lang, i18n);
      const badgeStyle = c.universityId
        ? 'background:#eff6ff; color:#1d4ed8; font-size:0.75rem; font-weight:700; padding:0.2rem 0.55rem; border-radius:4px; border:1px solid #bfdbfe;'
        : 'background:#f0fdf4; color:#15803d; font-size:0.75rem; font-weight:700; padding:0.2rem 0.55rem; border-radius:4px; border:1px solid #bbf7d0;';
      const badgeType = `<span style="${badgeStyle}">${badgeText}</span>`;

      card.innerHTML = `
        <div>
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%); border-radius: 0.75rem; height: 135px; display: flex; align-items: center; justify-content: center; padding: 0.75rem; position: relative; margin-block-end: 0.85rem; border: 1px solid #e2e8f0; overflow: hidden;">
            <div style="background: #ffffff; border-radius: 0.5rem; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <img alt="${name}" src="${imgSrc}" onerror="this.onerror=null; this.src='assets/photo/logo.webp';" style="max-width: 90%; max-height: 90%; width: auto; height: auto; object-fit: contain; transition: transform 0.3s ease;">
            </div>
            <span style="position: absolute; inset-block-start: 10px; inset-inline-end: 10px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(4px); color: #fff; font-size: 0.75rem; padding: 0.2rem 0.55rem; border-radius: 20px; display: flex; align-items: center; gap: 4px;">
              <img alt="" src="${FLAG[c.country] || ''}" style="width: 14px; height: 10px; object-fit: cover; border-radius: 2px;"> ${city}
            </span>
          </div>

          <div style="margin-block-end:0.4rem;">${badgeType}</div>

          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--color-black); margin-block-end: 0.35rem; line-height: 1.4;">${name}</h3>
          
          <div style="font-size: 0.85rem; color: var(--color-gray-600); margin-block-end: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>${city}، ${countryLabel}</span>
            <span>•</span>
            <span style="color: #0284c7; font-weight: 600;">${c.packagesCount || c.packages?.length || 12} ${getLcText('lc_packages_count', lang, i18n)}</span>
          </div>

          <div style="background: #fffdf5; border: 1px solid #fef08a; border-radius: 0.5rem; padding: 0.55rem 0.75rem; margin-block-end: 0.75rem;">
            <span style="font-size: 0.8rem; color: #854d0e; display: block;">${getLcText('lc_fee_monthly_from', lang, i18n)}</span>
            <span style="font-size: 1.1rem; font-weight: 800; color: #b45309;">${minFeeFormatted} <span style="font-size: 0.75rem; font-weight: normal; color: #713f12;">${getLcText('lc_per_month', lang, i18n)}</span></span>
          </div>

          ${featuresHtml}
        </div>

        <div style="display: flex; gap: 0.5rem; margin-block-start: 1rem;">
          <button class="btn-lc-modal" data-lc-id="${c.id}" style="flex: 1; padding: 0.65rem 0.5rem; background: var(--color-primary); color: #000; font-weight: 700; font-size: 0.88rem; border: none; border-radius: 0.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: opacity 0.2s;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            ${getLcText('lc_btn_details', lang, i18n)}
          </button>
          <a href="${CONFIG.getWhatsAppLink(waMsg)}" rel="noopener noreferrer" target="_blank" style="flex: 1; padding: 0.65rem 0.5rem; background: #25D366; color: #fff; font-weight: 700; font-size: 0.88rem; text-decoration: none; border-radius: 0.5rem; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2z"/></svg>
            ${getLcText('lc_btn_apply', lang, i18n)}
          </a>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  openModal(center) {
    this._activeCenter = center;
    const lang = i18n.currentLang || 'ar';
    const name = this.getCenterName(center, lang);
    const city = this.getCenterCity(center, lang);
    const countryLabel = i18n.t(COUNTRY_KEY[center.country] || center.country);
    const about = this.getCenterAbout(center, lang);
    const features = this.getCenterFeatures(center, lang);
    const packages = center.packages || [];

    let modal = document.getElementById('lc-details-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'lc-details-modal';
      modal.className = 'course-modal-backdrop';
      document.body.appendChild(modal);
    }

    const waMsg = getWhatsAppMessage(name, city, countryLabel, lang);

    const badgeKey = center.universityId ? 'lc_badge_university' : 'lc_badge_independent';
    const badgeText = getLcText(badgeKey, lang, i18n);

    const packagesRows = packages.map((p) => {
      const durLabel = formatDuration(p.months || p.duration, lang);
      const visaLabel = formatVisa(p.visa, p.months || 1, lang);
      const hasVisa = p.visa && p.visa !== 'No' && p.visa !== '0 month(s)' && p.visa !== '0' && (p.months || 1) >= 4;

      return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 0.75rem; font-weight: 600; color: #1e293b;">${durLabel}</td>
          <td style="padding: 0.75rem; font-weight: 800; color: #b45309; font-size: 1.05rem;">${this.formatPrice(p.feeMYR)}</td>
          <td style="padding: 0.75rem;">
            <span style="display: inline-block; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; background: ${hasVisa ? '#dcfce7; color: #15803d;' : '#f1f5f9; color: #64748b;'}">
              ${visaLabel}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="course-modal-dialog" style="max-width: 720px; width: 92%; max-height: 90vh; overflow-y: auto; background: #fff; border-radius: 1.25rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); margin: auto; position: relative; overscroll-behavior: contain;">
        
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 1.5rem; border-radius: 1.25rem 1.25rem 0 0; position: relative; color: #fff; display: flex; gap: 1.25rem; align-items: center;">
          <button id="lc-modal-close" style="position: absolute; inset-block-start: 15px; inset-inline-end: 15px; background: rgba(255,255,255,0.15); color: #fff; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">✕</button>
          
          <div style="width: 105px; height: 80px; background: #fff; border-radius: 0.75rem; padding: 0.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
            <img src="${(center.image || 'assets/photo/logo.webp') + (center.image && center.image.includes('?') ? '&v=40.0' : '?v=40.0')}" onerror="this.onerror=null; this.src='assets/photo/logo.webp';" alt="${name}" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain;">
          </div>
          
          <div style="flex: 1; min-width: 0;">
            <span style="background: var(--color-primary); color: #000; font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 4px; display: inline-block; margin-block-end: 6px;">${badgeText}</span>
            <h2 style="font-size: 1.3rem; font-weight: 800; margin: 0 0 4px 0; line-height: 1.3;">${name}</h2>
            <p style="font-size: 0.88rem; margin: 0; opacity: 0.85;">${city}، ${countryLabel}</p>
          </div>
        </div>

        <div style="padding: 1.5rem;">
          
          <!-- About -->
          <div style="margin-block-end: 1.5rem;">
            <h4 style="font-size: 1rem; font-weight: 700; margin-block-end: 0.5rem; color: #0f172a;">${getLcText('lc_modal_about_title', lang, i18n)}</h4>
            <p style="font-size: 0.9rem; line-height: 1.7; color: #475569; margin: 0;">${about}</p>
          </div>

          <!-- Key Features -->
          ${features && features.length ? `
            <div style="margin-block-end: 1.5rem;">
              <h4 style="font-size: 1rem; font-weight: 700; margin-block-end: 0.5rem; color: #0f172a;">${getLcText('lc_modal_highlights_title', lang, i18n)}</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.5rem;">
                ${features.map(f => `<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; font-weight: 500;">${f}</div>`).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Packages Table -->
          <div style="margin-block-end: 1.5rem;">
            <h4 style="font-size: 1rem; font-weight: 700; margin-block-end: 0.75rem; color: #0f172a; display: flex; justify-content: space-between; align-items: center;">
              <span>${getLcText('lc_modal_table_title', lang, i18n)}</span>
              <span style="font-size: 0.75rem; font-weight: normal; color: #64748b;">${getLcText('lc_modal_table_subtitle', lang, i18n)}</span>
            </h4>
            
            <div style="overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 0.75rem;">
              <table style="width: 100%; border-collapse: collapse; text-align: start; font-size: 0.9rem;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                    <th style="padding: 0.75rem;">${getLcText('lc_modal_th_duration', lang, i18n)}</th>
                    <th style="padding: 0.75rem;">${getLcText('lc_modal_th_fee', lang, i18n)}</th>
                    <th style="padding: 0.75rem;">${getLcText('lc_modal_th_visa', lang, i18n)}</th>
                  </tr>
                </thead>
                <tbody>
                  ${packagesRows}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Bottom Action Bar -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;">
            <div>
              <span style="font-size: 0.85rem; color: #64748b; display: block;">${getLcText('lc_modal_cta_title', lang, i18n)}</span>
              <span style="font-size: 0.95rem; font-weight: 700; color: #0f172a;">${getLcText('lc_modal_cta_sub', lang, i18n)}</span>
            </div>
            <a href="${CONFIG.getWhatsAppLink(waMsg)}" rel="noopener noreferrer" target="_blank" style="padding: 0.75rem 1.5rem; background: #25D366; color: #fff; font-weight: 800; font-size: 0.95rem; text-decoration: none; border-radius: 0.5rem; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2z"/></svg>
              ${getLcText('lc_modal_cta_whatsapp', lang, i18n)}
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

  closeModal() {
    this._activeCenter = null;
    const modal = document.getElementById('lc-details-modal');
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
    window.lcDirectory = new LanguageCenterDirectory();
    window.lcDirectory.init();
  });
} else {
  window.lcDirectory = new LanguageCenterDirectory();
  window.lcDirectory.init();
}
