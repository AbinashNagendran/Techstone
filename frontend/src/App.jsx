import { useState } from 'react'
import Sidebar from './components/Sidebar'
import { statsData } from './data/statsData'

import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <header className="main-header">
        <div className="prompt-input-container">
              <input 
                type="text" 
                placeholder="Enter your prompt here..." 
                className="prompt-input"
              />
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
            <h2>Dashboard</h2>
            <p>add products here</p>
            <div className="stats-grid">
              {statsData.map((stat) => (
                <div key={stat.id} className="stat-card">
                  <a href={stat.link}>{stat.title}</a>
                  <p className="stat-number">{stat.value}</p>
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
