import { createContext, useContext, useState, useEffect } from 'react';
import {
  getUserCurrency,
  setUserCurrency as saveUserCurrency,
  convertCurrency,
  formatCurrency,
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES
} from '../utils/currency';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('NGN');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Detect and set user's currency on mount
    const initCurrency = async () => {
      try {
        const userCurrency = await getUserCurrency();
        setCurrency(userCurrency);
      } catch (error) {
        console.error('Error detecting currency:', error);
        setCurrency('NGN');
      } finally {
        setLoading(false);
      }
    };

    initCurrency();
  }, []);

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    saveUserCurrency(newCurrency);
  };

  // Helper function to convert and format a price from NGN
  const formatPrice = (priceInNGN) => {
    const convertedAmount = convertCurrency(priceInNGN, currency);
    return formatCurrency(convertedAmount, currency);
  };

  // Helper function to get raw converted amount
  const convertPrice = (priceInNGN) => {
    return convertCurrency(priceInNGN, currency);
  };

  const value = {
    currency,
    changeCurrency,
    formatPrice,
    convertPrice,
    currencySymbol: CURRENCY_SYMBOLS[currency] || currency,
    currencyName: CURRENCY_NAMES[currency] || currency,
    loading
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
