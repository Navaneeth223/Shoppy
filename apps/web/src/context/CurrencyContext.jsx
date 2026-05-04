import React, { createContext, useContext, useState, useCallback } from 'react';

const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

// Static exchange rates (in production, fetch from an API like exchangeratesapi.io)
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  INR: 83.5,
  JPY: 149.5,
};

const CurrencyContext = createContext({
  currency: 'USD',
  symbol: '$',
  setCurrency: () => {},
  convert: (amount) => amount,
  format: (amount) => `$${amount.toFixed(2)}`,
  supportedCurrencies: SUPPORTED_CURRENCIES,
});

/**
 * Currency provider — handles multi-currency display.
 * All prices are stored in USD; conversion is display-only.
 */
export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    try {
      return localStorage.getItem('nexus_currency') || 'USD';
    } catch {
      return 'USD';
    }
  });

  const setCurrency = useCallback((code) => {
    if (EXCHANGE_RATES[code]) {
      setCurrencyState(code);
      try {
        localStorage.setItem('nexus_currency', code);
      } catch {}
    }
  }, []);

  /**
   * Converts a USD amount to the selected currency.
   * @param {number} usdAmount
   * @returns {number}
   */
  const convert = useCallback(
    (usdAmount) => {
      const rate = EXCHANGE_RATES[currency] || 1;
      return usdAmount * rate;
    },
    [currency]
  );

  /**
   * Formats a USD amount in the selected currency.
   * @param {number} usdAmount
   * @returns {string}
   */
  const format = useCallback(
    (usdAmount) => {
      const converted = convert(usdAmount);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: currency === 'JPY' ? 0 : 2,
        maximumFractionDigits: currency === 'JPY' ? 0 : 2,
      }).format(converted);
    },
    [currency, convert]
  );

  const currentCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === currency);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        symbol: currentCurrency?.symbol || '$',
        setCurrency,
        convert,
        format,
        supportedCurrencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * Hook to access currency context.
 */
export function useCurrency() {
  return useContext(CurrencyContext);
}

export default CurrencyContext;
