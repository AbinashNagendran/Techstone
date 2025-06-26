import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar'
import { statsData } from './data/statsData'


import './App.css'

function App() {
  const [inputValue, setInputValue] = useState('');
  const [filteredData, setFilteredData] = useState(statsData);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Generate suggestions based on input
  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
      setFilteredData(statsData);
    } else {
      const matchingProducts = statsData.filter(stat =>
        stat.title.toLowerCase().includes(inputValue.toLowerCase())
      );
      
      // Create suggestions from matching products
      const newSuggestions = matchingProducts.map(stat => ({
        id: stat.id,
        title: stat.title,
        type: 'product'
      }));
      
      setSuggestions(newSuggestions);
      // Don't filter the main display - keep showing all products
      setFilteredData(statsData);
    }
  }, [inputValue]);

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.title);
    setShowSuggestions(false);
    // Only filter the main display when a suggestion is selected
    const selectedProduct = statsData.filter(stat =>
      stat.title.toLowerCase().includes(suggestion.title.toLowerCase())
    );
    setFilteredData(selectedProduct);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <header className="main-header">
          <div className="prompt-input-container">
              <input 
                type="text" 
                placeholder="Search for a product..." 
                className="prompt-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className="suggestion-icon">🔍</span>
                      <span className="suggestion-text">{suggestion.title}</span>
                    </div>
                  ))}
                </div>
              )}
          </div>
          <div className="logo-container">
            <h1>Stores</h1>

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
          <div className="welcome-card">
            <h2>Pre-Builts</h2>
            <h4 className='welcome-subtitle'>Customize your search using the filters</h4>
            <div className="stats-grid">
              {filteredData.map((stat) => (
                <div key={stat.id} className="stat-card">
                  {stat.salePrice > 0 && (
                    <img className="sale-image" src="/frontend_images/onSale.png" alt="Sale" />
                  )}
                  <a href={stat.link}>{stat.title}</a>
                  <p className="stat-number">
                    {stat.salePrice > 0
                      ? (
                        <span className="sale-info">
                          {stat.salePrice + "$"}
                          <span className="discount-text">
                            {Math.round(((stat.regularPrice - stat.salePrice) / stat.regularPrice) * 100)}% OFF
                          </span>
                        </span>
                      )
                      : stat.regularPrice + "$"
                    }
                  </p>
                  <img  className='stat-image' src={stat.image} alt="" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
