import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { CURRENCY_SYMBOLS, CURRENCY_NAMES } from '../utils/currency';

export default function CurrencySelector() {
  const { currency, changeCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const currencies = [
    { code: 'NGN', flag: '🇳🇬' },
    { code: 'USD', flag: '🇺🇸' },
    { code: 'GBP', flag: '🇬🇧' },
    { code: 'EUR', flag: '🇪🇺' },
    { code: 'GHS', flag: '🇬🇭' },
    { code: 'KES', flag: '🇰🇪' },
    { code: 'ZAR', flag: '🇿🇦' },
    { code: 'CAD', flag: '🇨🇦' },
    { code: 'AUD', flag: '🇦🇺' },
  ];

  const handleCurrencyChange = (newCurrency) => {
    changeCurrency(newCurrency);
    setIsOpen(false);
  };

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title="Change currency"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-lg">{currentCurrency.flag}</span>
        <span className="font-medium text-gray-700">{CURRENCY_SYMBOLS[currency]}</span>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          <div className="px-3 py-2 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-700 uppercase">Select Currency</p>
          </div>
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => handleCurrencyChange(curr.code)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                curr.code === currency ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{curr.flag}</span>
                <div>
                  <div className="font-medium text-gray-900">{curr.code}</div>
                  <div className="text-xs text-gray-600">{CURRENCY_NAMES[curr.code]}</div>
                </div>
              </div>
              <div className="text-gray-600 font-medium">{CURRENCY_SYMBOLS[curr.code]}</div>
            </button>
          ))}
          <div className="px-3 py-2 border-t border-gray-200 mt-2">
            <p className="text-xs text-gray-500">
              Prices are automatically converted from NGN based on current exchange rates.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
