import { useState } from 'react'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <header className="main-header">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1>Welcome to TechStone</h1>
        </header>
        
        <div className="content">
          <div className="welcome-card">
            <h2>Dashboard</h2>
            <p>add products here</p>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Pc 1</h3>
                <p className="stat-number">1200$</p>
              </div>
              <div className="stat-card">
                <h3>Pc 2 </h3>
                <p className="stat-number">1400$</p>
              </div>
              <div className="stat-card">
                <h3>Pc 3</h3>
                <p className="stat-number">500$</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
