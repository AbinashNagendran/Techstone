import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar'
import AIChat from './components/AIChat'
import CurrencySelector from './components/CurrencySelector'
import { statsData } from './data/statsData'
import { convertProductPrices, formatPrice, getUserCurrency } from './services/currencyService'

import './App.css'

function App() {
  const [inputValue, setInputValue] = useState('');
  const [filteredData, setFilteredData] = useState(statsData.flat());
  const [showAISearch, setShowAISearch] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [convertedData, setConvertedData] = useState(statsData);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `Hello! I'm your AI shopping assistant. I can help you find:

• PCs under specific price ranges
• Gaming optimized computers  
• Products with specific features
• Best value recommendations

What are you looking for today?`,
      timestamp: new Date()
    }
  ]);

  // Initialize currency on component mount
  useEffect(() => {
    const userCurrency = getUserCurrency();
    setSelectedCurrency(userCurrency);
  }, []);

  // Convert prices when currency changes
  useEffect(() => {
    const convertPrices = async () => {
      const converted = await convertProductPrices(filteredData, selectedCurrency);
      setConvertedData(converted);
    };
    
    convertPrices();
  }, [filteredData, selectedCurrency]);

  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (searchTerm) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          // Flatten all products from all stores and then filter
          const allProducts = statsData.flat();
          const newFilteredData = allProducts.filter(stat =>
            stat.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredData(newFilteredData);
        }, 100); // waiting 100ms after user stops typing
      };
    })(),
    []
  );

  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredData(statsData.flat()); // Show all data if search is empty
    } else {
      debouncedSearch(inputValue);
    }
  }, [inputValue, debouncedSearch]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      // Clear the timeout and search immediately
      const allProducts = statsData.flat();
      const newFilteredData = allProducts.filter(stat =>
        stat.title.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredData(newFilteredData);
    }
  };

  // Function to filter best sellers (rating >= 4.0)
  const filterBestSellers = () => {
    setShowAISearch(false); // Exit AI Search mode
    const allProducts = statsData.flat();
    const bestSellers = allProducts.filter(stat => stat.rating >= 4.0);
    setFilteredData(bestSellers);
  };

  // Function to show all products
  const showAllProducts = () => {
    setShowAISearch(false); // Exit AI Search mode
    setFilteredData(statsData.flat());
  };

  // Function to handle AI Search
  const handleAISearch = () => {
    setShowAISearch(!showAISearch);
  };

  // Function to handle AI-filtered products
  const handleAIProductsFiltered = (products) => {
    if (products && products.length > 0) {
      setFilteredData(products);
    }
  };

  // Function to handle chat messages
  const handleChatMessages = (messages) => {
    setChatMessages(messages);
  };

  // Function to handle currency change
  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
  };

  return (
    <div className="app">
      <Sidebar 
        onBestSellersClick={filterBestSellers} 
        onShowAllClick={showAllProducts} 
        onAISearchClick={handleAISearch}
      />
      <main className="main-content">
        <header className="main-header">
          {!showAISearch && (
            <div className="prompt-input-container">
                <input 
                  type="text" 
                  placeholder="Search for a product..." 
                  className="prompt-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
            </div>
          )}
          <div className="logo-container">
            <h1>Stores</h1>
            <CurrencySelector onCurrencyChange={handleCurrencyChange} />
            <button className="store-btn">
              <img src="/company_icons/Amazon-512.webp" alt="Amazon" />
            </button>
            <button className="store-btn">
              <img src="/company_icons/bestbuy_circle.png" alt="Best Buy" />
            </button>
            <button className="store-btn">
              <img src="/company_icons/canada_computer_logo.png" alt="Canada Computer" />
            </button>
          </div>
        </header>
        
        <div className="content">
          {showAISearch ? (
            <AIChat 
              onProductsFiltered={handleAIProductsFiltered}
              messages={chatMessages}
              onMessagesChange={handleChatMessages}
              selectedCurrency={selectedCurrency}
            />
          ) : (
            <div className="welcome-card">
              <h2>Pre-Builts</h2>
              <h4 className='welcome-subtitle'>Customize your search using the filters</h4>
              <div className="stats-grid">
                {convertedData.map((stat) => (
                  <div key={stat.id} className="stat-card">
                    {stat.salePrice > 0 && (
                      <img className="sale-image" src="/frontend_images/onSale.png" alt="Sale" />
                    )}
                    <a href={stat.link}>{stat.title}</a>
                    <p className="stat-number">
                      {stat.salePrice > 0
                        ? (
                          <span className="sale-info">
                            {formatPrice(stat.salePrice, selectedCurrency)}
                            <span className="discount-text">
                              {Math.round(((stat.regularPrice - stat.salePrice) / stat.regularPrice) * 100)}% OFF
                            </span>
                          </span>
                        )
                        : formatPrice(stat.regularPrice, selectedCurrency)
                      }
                    </p>
                    <img  className='stat-image' src={stat.image} alt="" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
