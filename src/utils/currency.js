/**
 * Currency conversion and formatting utilities
 */

// Exchange rates (base: NGN - Nigerian Naira)
// Update these rates periodically or fetch from an API
export const EXCHANGE_RATES = {
  NGN: 1,        // Nigerian Naira (base currency)
  USD: 0.0012,   // US Dollar (1 NGN = 0.0012 USD, or 1 USD ≈ 833 NGN)
  GBP: 0.00095,  // British Pound (1 NGN = 0.00095 GBP, or 1 GBP ≈ 1053 NGN)
  EUR: 0.0011,   // Euro (1 NGN = 0.0011 EUR, or 1 EUR ≈ 909 NGN)
  GHS: 0.015,    // Ghanaian Cedi (1 NGN = 0.015 GHS, or 1 GHS ≈ 67 NGN)
  KES: 0.15,     // Kenyan Shilling (1 NGN = 0.15 KES, or 1 KES ≈ 6.7 NGN)
  ZAR: 0.022,    // South African Rand (1 NGN = 0.022 ZAR, or 1 ZAR ≈ 45 NGN)
  CAD: 0.0017,   // Canadian Dollar (1 NGN = 0.0017 CAD, or 1 CAD ≈ 588 NGN)
  AUD: 0.0018,   // Australian Dollar (1 NGN = 0.0018 AUD, or 1 AUD ≈ 556 NGN)
};

// Currency symbols
export const CURRENCY_SYMBOLS = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
  GHS: 'GH₵',
  KES: 'KSh',
  ZAR: 'R',
  CAD: 'C$',
  AUD: 'A$',
};

// Currency names
export const CURRENCY_NAMES = {
  NGN: 'Nigerian Naira',
  USD: 'US Dollar',
  GBP: 'British Pound',
  EUR: 'Euro',
  GHS: 'Ghanaian Cedi',
  KES: 'Kenyan Shilling',
  ZAR: 'South African Rand',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
};

// Country to currency mapping
export const COUNTRY_CURRENCY_MAP = {
  NG: 'NGN', // Nigeria
  US: 'USD', // United States
  GB: 'GBP', // United Kingdom
  UK: 'GBP', // United Kingdom (alternative)
  DE: 'EUR', // Germany
  FR: 'EUR', // France
  IT: 'EUR', // Italy
  ES: 'EUR', // Spain
  NL: 'EUR', // Netherlands
  BE: 'EUR', // Belgium
  AT: 'EUR', // Austria
  IE: 'EUR', // Ireland
  PT: 'EUR', // Portugal
  GR: 'EUR', // Greece
  GH: 'GHS', // Ghana
  KE: 'KES', // Kenya
  ZA: 'ZAR', // South Africa
  CA: 'CAD', // Canada
  AU: 'AUD', // Australia
};

/**
 * Convert amount from NGN to target currency
 * @param {number} amountInNGN - Amount in Nigerian Naira
 * @param {string} targetCurrency - Target currency code (e.g., 'USD', 'GBP')
 * @returns {number} Converted amount
 */
export const convertCurrency = (amountInNGN, targetCurrency = 'NGN') => {
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  return amountInNGN * rate;
};

/**
 * Format currency amount with proper symbol and formatting
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'NGN') => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  // Round to 2 decimal places for most currencies, 0 for NGN
  const decimals = currency === 'NGN' ? 0 : 2;
  const roundedAmount = Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);

  // Format with thousand separators
  const formatted = roundedAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return `${symbol}${formatted}`;
};

/**
 * Get currency for a country code
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {string} Currency code
 */
export const getCurrencyForCountry = (countryCode) => {
  return COUNTRY_CURRENCY_MAP[countryCode?.toUpperCase()] || 'NGN';
};

/**
 * Detect user's location and get appropriate currency
 * Uses IP-based detection with fallback options
 * @returns {Promise<string>} Currency code
 */
export const detectUserCurrency = async () => {
  try {
    // Primary: Try ipapi.co (more reliable, no rate limit for basic use)
    try {
      const response = await fetch('https://ipapi.co/json/', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.country_code && !data.error) {
          const currency = getCurrencyForCountry(data.country_code);
          console.log(`Currency detected: ${currency} from country: ${data.country_code}`);
          return currency;
        }
      }
    } catch (error) {
      console.log('ipapi.co failed, trying fallback...');
    }

    // Fallback 1: Try ip-api.com
    try {
      const response = await fetch('http://ip-api.com/json/');
      if (response.ok) {
        const data = await response.json();
        if (data.countryCode && data.status === 'success') {
          const currency = getCurrencyForCountry(data.countryCode);
          console.log(`Currency detected (fallback): ${currency} from country: ${data.countryCode}`);
          return currency;
        }
      }
    } catch (error) {
      console.log('Fallback API also failed');
    }

    // Fallback 2: Use browser timezone as a hint
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) {
      // Map common timezones to countries
      if (timezone.includes('Lagos') || timezone.includes('Africa/Lagos')) return 'NGN';
      if (timezone.includes('New_York') || timezone.includes('Los_Angeles') || timezone.includes('Chicago')) return 'USD';
      if (timezone.includes('London')) return 'GBP';
      if (timezone.includes('Paris') || timezone.includes('Berlin') || timezone.includes('Rome')) return 'EUR';
      if (timezone.includes('Accra')) return 'GHS';
      if (timezone.includes('Nairobi')) return 'KES';
      if (timezone.includes('Johannesburg')) return 'ZAR';
    }

  } catch (error) {
    console.log('Currency detection failed completely, defaulting to NGN', error);
  }

  // Default to NGN if all detection fails
  console.log('Using default currency: NGN');
  return 'NGN';
};

/**
 * Get user's preferred currency from localStorage or detect it
 * @returns {Promise<string>} Currency code
 */
export const getUserCurrency = async () => {
  // Check if user has manually overridden (from settings page)
  const manualOverride = localStorage.getItem('manualCurrencyOverride');
  if (manualOverride && EXCHANGE_RATES[manualOverride]) {
    console.log(`Using manual currency override: ${manualOverride}`);
    return manualOverride;
  }

  // Check if we have a recently detected currency (within last 24 hours)
  const storedCurrency = localStorage.getItem('preferredCurrency');
  const detectionTimestamp = localStorage.getItem('currencyDetectionTimestamp');
  const now = Date.now();
  const oneDayInMs = 24 * 60 * 60 * 1000;

  if (storedCurrency && detectionTimestamp) {
    const timeSinceDetection = now - parseInt(detectionTimestamp);
    if (timeSinceDetection < oneDayInMs && EXCHANGE_RATES[storedCurrency]) {
      console.log(`Using cached currency (detected ${Math.round(timeSinceDetection / 1000 / 60)} minutes ago): ${storedCurrency}`);
      return storedCurrency;
    }
  }

  // Otherwise, detect based on location
  console.log('Detecting currency based on location...');
  const detectedCurrency = await detectUserCurrency();

  // Store the detected currency with timestamp
  localStorage.setItem('preferredCurrency', detectedCurrency);
  localStorage.setItem('currencyDetectionTimestamp', now.toString());

  return detectedCurrency;
};

/**
 * Set user's preferred currency (manual override from settings)
 * @param {string} currency - Currency code
 * @param {boolean} isManualOverride - Whether this is a manual override (default: true)
 */
export const setUserCurrency = (currency, isManualOverride = true) => {
  if (EXCHANGE_RATES[currency]) {
    localStorage.setItem('preferredCurrency', currency);
    localStorage.setItem('currencyDetectionTimestamp', Date.now().toString());

    if (isManualOverride) {
      localStorage.setItem('manualCurrencyOverride', currency);
      console.log(`Manual currency override set to: ${currency}`);
    }
  }
};

/**
 * Clear manual currency override and redetect based on location
 * @returns {Promise<string>} Newly detected currency code
 */
export const resetToAutoCurrency = async () => {
  localStorage.removeItem('manualCurrencyOverride');
  localStorage.removeItem('preferredCurrency');
  localStorage.removeItem('currencyDetectionTimestamp');

  const detectedCurrency = await detectUserCurrency();
  localStorage.setItem('preferredCurrency', detectedCurrency);
  localStorage.setItem('currencyDetectionTimestamp', Date.now().toString());

  console.log(`Currency reset to auto-detected: ${detectedCurrency}`);
  return detectedCurrency;
};
