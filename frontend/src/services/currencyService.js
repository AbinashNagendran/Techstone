// Currency conversion service using ExchangeRate-API
import { EXCHANGE_RATE_API_KEY, EXCHANGE_RATE_BASE_URL } from '../config/exchangeRate.js';

// Cache for exchange rates to avoid excessive API calls
let exchangeRateCache = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Available currencies with their symbols
export const AVAILABLE_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  BRL: { symbol: 'R$', name: 'Brazilian Real' }
};

// Get exchange rates from API
export const getExchangeRates = async (baseCurrency = 'USD') => {
  try {
    // Check if we have valid cached data
    const now = Date.now();
    if (exchangeRateCache[baseCurrency] && (now - cacheTimestamp) < CACHE_DURATION) {
      return exchangeRateCache[baseCurrency];
    }

    const response = await fetch(`${EXCHANGE_RATE_BASE_URL}/${EXCHANGE_RATE_API_KEY}/latest/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.result === 'success') {
      // Cache the results
      exchangeRateCache[baseCurrency] = data.conversion_rates;
      cacheTimestamp = now;
      return data.conversion_rates;
    } else {
      throw new Error('Failed to fetch exchange rates');
    }
    
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Return fallback rates (1:1) if API fails
    const fallbackRates = {};
    Object.keys(AVAILABLE_CURRENCIES).forEach(currency => {
      fallbackRates[currency] = 1;
    });
    return fallbackRates;
  }
};

// Convert price from one currency to another
export const convertPrice = (price, fromCurrency, toCurrency, exchangeRates) => {
  if (!price || !exchangeRates) return price;
  
  // If currencies are the same, return original price
  if (fromCurrency === toCurrency) return price;
  
  // Convert using exchange rates
  const rate = exchangeRates[toCurrency];
  if (rate) {
    return price * rate;
  }
  
  return price; // Return original price if conversion fails
};

// Format price with currency symbol
export const formatPrice = (price, currency) => {
  if (!price) return 'N/A';
  
  const currencyInfo = AVAILABLE_CURRENCIES[currency];
  if (!currencyInfo) return `$${price}`;
  
  // Format based on currency
  switch (currency) {
    case 'JPY':
      return `${currencyInfo.symbol}${Math.round(price)}`;
    case 'EUR':
    case 'GBP':
    case 'USD':
    case 'CAD':
    case 'AUD':
    case 'CHF':
    case 'BRL':
      return `${currencyInfo.symbol}${price.toFixed(2)}`;
    case 'CNY':
    case 'INR':
      return `${currencyInfo.symbol}${price.toFixed(0)}`;
    default:
      return `${currencyInfo.symbol}${price.toFixed(2)}`;
  }
};

// Get user's preferred currency from localStorage or default to USD
export const getUserCurrency = () => {
  return localStorage.getItem('preferredCurrency') || 'USD';
};

// Set user's preferred currency
export const setUserCurrency = (currency) => {
  localStorage.setItem('preferredCurrency', currency);
};

// Convert all product prices to a specific currency
export const convertProductPrices = async (products, targetCurrency) => {
  if (targetCurrency === 'USD') {
    return products; // No conversion needed for USD
  }
  
  try {
    const exchangeRates = await getExchangeRates('USD');
    
    return products.map(product => ({
      ...product,
      salePrice: product.salePrice > 0 ? convertPrice(product.salePrice, 'USD', targetCurrency, exchangeRates) : 0,
      regularPrice: convertPrice(product.regularPrice, 'USD', targetCurrency, exchangeRates)
    }));
    
  } catch (error) {
    console.error('Error converting product prices:', error);
    return products; // Return original products if conversion fails
  }
}; 