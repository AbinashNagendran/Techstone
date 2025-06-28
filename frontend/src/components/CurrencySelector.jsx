import React, { useState, useEffect } from 'react';
import { AVAILABLE_CURRENCIES, getUserCurrency, setUserCurrency } from '../services/currencyService.js';
import './CurrencySelector.css';

const CurrencySelector = ({ onCurrencyChange }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const userCurrency = getUserCurrency();
    setSelectedCurrency(userCurrency);
  }, []);

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
    setUserCurrency(currency);
    setIsOpen(false);
    
    // Notify parent component about currency change
    if (onCurrencyChange) {
      onCurrencyChange(currency);
    }
  };

  const selectedCurrencyInfo = AVAILABLE_CURRENCIES[selectedCurrency];

  return (
    <div className="currency-selector">
      <button 
        className="currency-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select currency"
      >
        <span className="currency-symbol">{selectedCurrencyInfo?.symbol || '$'}</span>
        <span className="currency-code">{selectedCurrency}</span>
        <span className="dropdown-arrow">▼</span>
      </button>
      
      {isOpen && (
        <div className="currency-dropdown">
          {Object.entries(AVAILABLE_CURRENCIES).map(([code, info]) => (
            <button
              key={code}
              className={`currency-option ${code === selectedCurrency ? 'selected' : ''}`}
              onClick={() => handleCurrencyChange(code)}
            >
              <span className="currency-symbol">{info.symbol}</span>
              <span className="currency-code">{code}</span>
              <span className="currency-name">{info.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector; 