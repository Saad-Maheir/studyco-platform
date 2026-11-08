// Local static exchange rates engine for zero-cost operation
// Loads conversion table from data/exchange-rates.json without external API calls

let exchangeRatesCache = null;

export const COUNTRY_CURRENCIES = {
  malaysia: 'MYR',
  australia: 'AUD',
  uk: 'GBP',
  canada: 'CAD',
  newzealand: 'NZD',
  singapore: 'SGD'
};

export function getCountryCurrency(country) {
  return COUNTRY_CURRENCIES[country] || 'USD';
}

export async function getExchangeRates() {
  if (exchangeRatesCache) return exchangeRatesCache;
  try {
    const res = await fetch('./data/exchange-rates.json?v=' + Date.now(), { cache: 'no-cache' });
    if (res.ok) {
      exchangeRatesCache = await res.json();
    }
  } catch (err) {
    console.warn('[Currency] Using default fallback rates:', err);
  }

  // Live overrides from localStorage (if edited via admin portal)
  try {
    const localRates = JSON.parse(localStorage.getItem('studyco_exchange_rates') || 'null');
    if (localRates && localRates.rates) {
      if (!exchangeRatesCache) exchangeRatesCache = { baseCurrency: 'USD', rates: [] };
      if (!Array.isArray(localRates.rates) && Array.isArray(exchangeRatesCache.rates)) {
        exchangeRatesCache.rates.forEach(r => {
          if (localRates.rates[r.code] !== undefined) {
            r.rateFromUSD = localRates.rates[r.code];
            r.toUSD = r.rateFromUSD > 0 ? 1 / r.rateFromUSD : 1;
          }
        });
      }
    }
  } catch (e) {}

  if (exchangeRatesCache) return exchangeRatesCache;
    exchangeRatesCache = {
      baseCurrency: 'USD',
      rates: [
        { code: 'USD', symbol: '$', toUSD: 1.0, rateFromUSD: 1.0, decimals: 0 },
        { code: 'AUD', symbol: 'A$', toUSD: 0.65, rateFromUSD: 1.54, decimals: 0 },
        { code: 'GBP', symbol: '£', toUSD: 1.30, rateFromUSD: 0.77, decimals: 0 },
        { code: 'CAD', symbol: 'C$', toUSD: 0.74, rateFromUSD: 1.35, decimals: 0 },
        { code: 'NZD', symbol: 'NZ$', toUSD: 0.60, rateFromUSD: 1.67, decimals: 0 },
        { code: 'SGD', symbol: 'S$', toUSD: 0.76, rateFromUSD: 1.32, decimals: 0 },
        { code: 'MYR', symbol: 'RM', toUSD: 0.225, rateFromUSD: 4.44, decimals: 0 },
        { code: 'SAR', symbol: 'SAR', toUSD: 0.266, rateFromUSD: 3.75, decimals: 0 },
        { code: 'IDR', symbol: 'Rp', toUSD: 0.0000633, rateFromUSD: 15800.0, decimals: 0 }
      ]
    };
    return exchangeRatesCache;
  }

export function formatCurrencyValue(amount, currencyCode) {
  const num = Math.round(Number(amount) || 0);
  const code = (currencyCode || 'USD').toUpperCase();
  switch (code) {
    case 'AUD': return `A$ ${num.toLocaleString('en-US')}`;
    case 'GBP': return `£${num.toLocaleString('en-US')}`;
    case 'CAD': return `C$ ${num.toLocaleString('en-US')}`;
    case 'NZD': return `NZ$ ${num.toLocaleString('en-US')}`;
    case 'SGD': return `S$ ${num.toLocaleString('en-US')}`;
    case 'MYR': return `RM ${num.toLocaleString('en-US')}`;
    case 'USD': return `$${num.toLocaleString('en-US')}`;
    case 'SAR': return `${num.toLocaleString('en-US')} SAR`;
    case 'IDR': return `Rp${num.toLocaleString('id-ID')}`;
    default: return `${code} ${num.toLocaleString('en-US')}`;
  }
}

export function convertCurrency(amount, fromCurrencyCode, toCurrencyCode, exchangeData) {
  if (!amount || isNaN(amount)) return '';
  const num = Number(amount);
  const fromCode = (fromCurrencyCode || 'USD').toUpperCase();
  const toCode = (toCurrencyCode || fromCode).toUpperCase();

  if (fromCode === toCode) {
    return formatCurrencyValue(num, toCode);
  }

  const rates = exchangeData?.rates || [];
  const fromInfo = rates.find(r => r.code === fromCode);
  const toInfo = rates.find(r => r.code === toCode);

  if (!fromInfo || !toInfo) {
    return formatCurrencyValue(num, fromCode);
  }

  // Convert from -> USD -> to
  const toUSDMultiplier = fromInfo.toUSD || (1 / (fromInfo.rateFromUSD || 1));
  const amountUSD = num * toUSDMultiplier;
  const toMultiplier = toInfo.rateFromUSD || (1 / (toInfo.toUSD || 1));
  const convertedAmount = amountUSD * toMultiplier;

  return formatCurrencyValue(convertedAmount, toCode);
}

export function convertFromMYR(amountMYR, targetCurrencyCode, exchangeData) {
  if (!amountMYR || isNaN(amountMYR)) return '';
  return convertCurrency(amountMYR, 'MYR', targetCurrencyCode || 'MYR', exchangeData);
}

export function formatProgramPrice(annualFee, programCurrency, targetCurrency, exchangeData) {
  if (!annualFee || isNaN(annualFee)) return '';
  const progCurr = (programCurrency || 'MYR').toUpperCase();
  const targetCurr = (targetCurrency || '').toUpperCase();

  // If user explicitly chose USD or another currency different from the native one, convert accurately
  if (targetCurr && targetCurr !== progCurr) {
    return convertCurrency(annualFee, progCurr, targetCurr, exchangeData);
  }
  return formatCurrencyValue(annualFee, progCurr);
}

