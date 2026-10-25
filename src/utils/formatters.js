/**
 * InvestWise - Formatting Utilities
 * Handles currencies (INR ₹, USD $, EUR €, GBP £), percentages, and compact labels.
 */

export const CURRENCIES = {
  INR: { symbol: '₹', label: 'INR (₹) - Indian Rupee', code: 'INR' },
  USD: { symbol: '$', label: 'USD ($) - US Dollar', code: 'USD' },
  EUR: { symbol: '€', label: 'EUR (€) - Euro', code: 'EUR' },
  GBP: { symbol: '£', label: 'GBP (£) - British Pound', code: 'GBP' },
};

/**
 * Format currency amount based on active currency and style preference
 * @param {number} amount
 * @param {string} currencyCode 'INR' | 'USD' | 'EUR' | 'GBP'
 * @param {boolean} showDecimals
 */
export function formatCurrency(amount, currencyCode = 'INR', showDecimals = false) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const num = Number(amount);
  const sign = num < 0 ? '-' : '';
  const absNum = Math.abs(num);

  if (currencyCode === 'INR') {
    // Standard Indian Numbering System: e.g. 2,45,000 or 1,25,00,000
    const parts = absNum.toFixed(showDecimals ? 2 : 0).split('.');
    let intPart = parts[0];
    const decPart = parts[1] ? `.${parts[1]}` : '';

    if (intPart.length > 3) {
      const lastThree = intPart.substring(intPart.length - 3);
      const otherNumbers = intPart.substring(0, intPart.length - 3);
      intPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }
    return `${sign}${curr.symbol} ${intPart}${decPart}`;
  } else {
    // Western standard grouping
    const formatted = absNum.toLocaleString('en-US', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });
    return `${sign}${curr.symbol}${formatted}`;
  }
}

/**
 * Compact currency for charts or badges: e.g. ₹ 24.5L, ₹ 1.2Cr, $ 245K
 */
export function formatCompactCurrency(amount, currencyCode = 'INR') {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const num = Number(amount);
  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);

  if (currencyCode === 'INR') {
    if (abs >= 10000000) {
      return `${sign}${curr.symbol} ${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `${sign}${curr.symbol} ${(abs / 100000).toFixed(2)} L`;
    }
    if (abs >= 1000) {
      return `${sign}${curr.symbol} ${(abs / 1000).toFixed(1)} K`;
    }
    return `${sign}${curr.symbol} ${abs.toLocaleString('en-IN')}`;
  } else {
    if (abs >= 1000000000) {
      return `${sign}${curr.symbol}${(abs / 1000000000).toFixed(2)}B`;
    }
    if (abs >= 1000000) {
      return `${sign}${curr.symbol}${(abs / 1000000).toFixed(2)}M`;
    }
    if (abs >= 1000) {
      return `${sign}${curr.symbol}${(abs / 1000).toFixed(1)}K`;
    }
    return `${sign}${curr.symbol}${abs.toLocaleString('en-US')}`;
  }
}

/**
 * Format percentage
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Format years or payback
 */
export function formatYears(years) {
  if (years === null || years === undefined || isNaN(years)) return 'Not Recovered';
  const num = Number(years);
  if (num === 1) return '1.0 Year';
  return `${num.toFixed(1)} Years`;
}

/**
 * Format date nicely
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}
