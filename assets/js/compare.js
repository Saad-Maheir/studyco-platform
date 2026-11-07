// StudyCo Academic Directory — Side-by-side programme comparison engine
// selection made on programs.html.
import { i18n } from './i18n.js?v=88.0';
import { getExchangeRates, convertFromMYR, formatProgramPrice, formatCurrencyValue, getCountryCurrency } from './currency.js?v=88.0';

const COUNTRY_KEY = { malaysia: 'dest_malaysia', australia: 'dest_australia', uk: 'dest_uk', canada: 'dest_canada', newzealand: 'dest_newzealand', singapore: 'dest_singapore' };
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
const COMPARE_KEY = 'studyco_compare';

function getCompareIds() {
  try { return JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]'); } catch (e) { return []; }
}
function setCompareIds(ids) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
}

class ComparePage {
  constructor() {
    this.universities = [];
    this.programs = [];
    this.costs = {};
    this.exchangeData = null;
    this.currency = localStorage.getItem('studyco_currency') || 'native';
  }

  async init() {
    const ids = getCompareIds();
    if (ids.length === 0) {
      this.render();
      window.addEventListener('languageChanged', () => this.render());
      return;
    }

    try {
      const v = `?v=${Date.now()}`;
      const [uniRes, progRes, costsRes, rates] = await Promise.all([
        fetch(`./data/universities.json${v}`),
        fetch(`./data/programs.json${v}`),
        fetch(`./data/costs.json${v}`),
        getExchangeRates()
      ]);
      this.universities = (await uniRes.json()).universities;
      this.programs = (await progRes.json()).programs;
      this.costs = (await costsRes.json()).destinations;
      this.exchangeData = rates;
    } catch (err) {
      console.warn('[Compare] Could not load data:', err);
      return;
    }
    const uniById = Object.fromEntries(this.universities.map((u) => [u.id, u]));
    this.programs.forEach((p) => {
      p._university = uniById[p.universityId];
      const c = this.costs[p._university?.country];
      const field = c ? c.fields[p.field] : null;
      p._symbol = c ? c.symbol : '';
      p._tuition = field ? field.tuition : '';
      p._duration = field ? field.duration : '';
    });
    this.render();
    window.addEventListener('languageChanged', () => this.render());
  }

  render() {
    const body = document.getElementById('compare-table-body');
    const table = document.getElementById('compare-table');
    const empty = document.getElementById('compare-empty');
    if (!body) return;

    const ids = getCompareIds();
    const list = ids.map((id) => this.programs.find((p) => p.id === id)).filter(Boolean);

    if (list.length === 0) {
      if (table) table.style.display = 'none';
      if (empty) empty.style.display = 'block';
      return;
    }
    if (table) table.style.display = 'table';
    if (empty) empty.style.display = 'none';

    body.innerHTML = '';
    const isAr = (i18n.currentLang === 'ar');

    list.forEach((p) => {
      const row = document.createElement('tr');
      const progTitle = (isAr && p.nameAr) ? p.nameAr : (p.name || p.id);
      const uniName = (isAr && p._university?.arabicName) ? p._university.arabicName : (p._university ? p._university.name : 'University');
      const progCurrency = p.currency || (p._university ? getCountryCurrency(p._university.country) : 'MYR');
      const feeVal = p.annualFee || p._tuition;
      const feeStr = (this.currency === 'native' || !this.currency)
        ? `${formatCurrencyValue(feeVal, progCurrency)} / ${i18n.t('calc_per_year')}`
        : `${formatProgramPrice(feeVal, progCurrency, this.currency, this.exchangeData)} / ${i18n.t('calc_per_year')}`;
      const durationVal = p.duration || p._duration || 3;

      row.innerHTML = `
        <td><img alt="${uniName}" src="${p._university?.logo || ''}" style="width:36px;height:36px;object-fit:contain;"/></td>
        <td>
          <strong>${progTitle}</strong>
          ${isAr && p.nameAr ? `<br/><span style="color:var(--color-gray-500);font-size:0.8rem;">${p.name}</span>` : ''}
          <br/><span style="color:var(--color-gray-600);font-size:0.82rem;">${uniName} — ${i18n.t(COUNTRY_KEY[p._university?.country] || p._university?.country)}</span>
        </td>
        <td>${i18n.t(FIELD_KEY[p.field] || p.field)}</td>
        <td><strong style="color:var(--color-primary-dark);">${feeStr}</strong></td>
        <td>${i18n.t('prog_duration_years', { n: durationVal })}</td>
        <td><button class="btn-compare-remove" data-remove-id="${p.id}">${i18n.t('compare_table_remove')}</button></td>`;
      row.querySelector('[data-remove-id]').addEventListener('click', () => {
        setCompareIds(getCompareIds().filter((id) => id !== p.id));
        this.render();
      });
      body.appendChild(row);
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const page = new ComparePage();
  await page.init();
});
