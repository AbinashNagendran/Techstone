import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { id: 1, label: 'Best Sellers ', icon: '🔥' },
    { id: 2, label: 'Price Range', icon: '💲' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">TechStone</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <a href="#" className="nav-link">
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
    </div>
  );
};

export default Sidebar; 