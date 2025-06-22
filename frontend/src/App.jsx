import { useState } from 'react';
import Sidebar from './components/Sidebar'
import { statsData } from './data/statsData'
import { GoogleGenAI } from "@google/genai";


// const ai = new GoogleGenAI({ apiKey: "AIzaSyBxbvgyoYiE3yuhWttntABFfcFsPDrFJe8" });

// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: "Explain how AI works in a few words",
//   });
//   console.log(response.text);
// }

// main();



import './App.css'

function App() {
  const [inputValue, setInputValue] = useState('');
  const [filteredData, setFilteredData] = useState(statsData);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      const newFilteredData = statsData.filter(stat =>
        stat.title.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredData(newFilteredData);
    }
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
                onKeyDown={handleKeyDown}
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
            <h2>Pre-Builts</h2>
            <p>Customize your search using the filters</p>
            <div className="stats-grid">
              {filteredData.map((stat) => (
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
