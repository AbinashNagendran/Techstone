import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { id: 1, label: 'Best Sellers ', icon: '😘' },
    { id: 2, label: 'Price Range', icon: '😁' },
    { id: 3, label: 'Ai Assistant', icon: '🤖' },
    { id: 4, label: 'Profile', icon: '👤' },
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
      
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">😂</div>
          <div className="user-details">
            <div className="user-name">Abinash Nagendran</div>
            <div className="user-role">Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 