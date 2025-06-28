import React from 'react';
import './Sidebar.css';

const Sidebar = ({ onBestSellersClick, onShowAllClick, onAISearchClick }) => {
  const menuItems = [
    { id: 1, label: 'Best Sellers ', icon: '🔥' },
    { id: 2, label: 'Show All', icon: '📋' },
    { id: 3, label: 'AI Search', icon: '🤖' },
  ];

  const handleButtonClick = (itemId) => {
    if (itemId === 1) {
      // Best Sellers button clicked
      onBestSellersClick();
    } else if (itemId === 2) {
      // Show All button clicked
      onShowAllClick();
    } else if (itemId === 3) {
      // AI Search button clicked
      onAISearchClick();
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">TechStone</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button 
                className="nav-button"
                onClick={() => handleButtonClick(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
    </div>
  );
};

export default Sidebar; 