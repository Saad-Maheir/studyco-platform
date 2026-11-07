// Tuition & living cost estimator backed by data/costs.json.
import { i18n } from './i18n.js?v=88.0';
import { CONFIG } from './config.js?v=88.0';

export class CostCalculator {
  constructor() {
    this.costData = null;
  }

  async init() {
    try {
      const res = await fetch('./data/costs.json');
      const data = await res.json();
      this.costData = data.destinations;
    } catch (err) {
      console.warn('[Calculator] Could not load costs.json:', err);
    }
    this.bindEvents();
    this.calculate();
  }

  bindEvents() {
    const countrySelect = document.getElementById('calc-country');
    const majorSelect = document.getElementById('calc-major');

    if (countrySelect) {
      countrySelect.addEventListener('change', () => this.calculate());
    }
    if (majorSelect) {
      majorSelect.addEventListener('change', () => this.calculate());
    }

    window.addEventListener('languageChanged', () => this.calculate());
  }

  calculate() {
    if (!this.costData) return;

    const countrySelect = document.getElementById('calc-country');
    const majorSelect = document.getElementById('calc-major');
    if (!countrySelect || !majorSelect) return;

    const countryKey = countrySelect.value;
    const majorKey = majorSelect.value;

    const countryInfo = this.costData[countryKey];
    if (!countryInfo || !countryInfo.fields[majorKey]) return;

    const details = countryInfo.fields[majorKey];

    const tuitionEl = document.getElementById('calc-tuition-val');
    const durationEl = document.getElementById('calc-duration-val');
    const livingEl = document.getElementById('calc-living-val');
    const waBtn = document.getElementById('calc-wa-btn');

    // ⁦..⁩ isolate the money figures so RTL text doesn't reorder them
    const money = (val) => `⁦${countryInfo.symbol}${val}⁩ / ${i18n.t('calc_per_year')}`;
    const durationNum = details.duration.replace(/\s*years?\s*/i, '');
    if (tuitionEl) tuitionEl.textContent = money(details.tuition);
    if (durationEl) durationEl.textContent = `⁦${durationNum}⁩ ${i18n.t('calc_years')}`;
    if (livingEl) livingEl.textContent = money(details.living);

    const countryText = i18n.t(`dest_${countryKey}`);
    const majorText = i18n.t(`major_${majorKey}`);

    const waMsg = i18n.t('wa_calc_msg', {
      country: countryText,
      major: majorText
    });

    if (waBtn) {
      waBtn.href = CONFIG.getWhatsAppLink(waMsg);
      waBtn.setAttribute('rel', 'noopener noreferrer');
    }
  }
}
