import React, { useState, useRef } from 'react';
import WheelOfLife from './WheelOfLife';
import './App.css';

const defaultItems = [
  "Data Loss Prevention",
  "Vulnerability Management",
  "Governance Risk Verification",
  "Architecture",
  "Penetration Test",
  "Project Management",
  "Incident Response",
  "Engineering",
  "DevSecOps",
  "Training",
  "Security Operation Center"
];

const defaultRatings = [6, 6, 5, 4, 5, 6, 6, 4, 5, 4, 5];

function App() {
  const [items, setItems] = useState(defaultItems);
  const [ratings, setRatings] = useState(defaultRatings);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [maxScore, setMaxScore] = useState(10);
  const [showCustomization, setShowCustomization] = useState(false);
  const wheelRef = useRef(null);

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleRatingChange = (index, value) => {
    const newRatings = [...ratings];
    newRatings[index] = parseInt(value) || 0;
    setRatings(newRatings);
  };

  const addItem = () => {
    setItems([...items, `New Item ${items.length + 1}`]);
    setRatings([...ratings, 5]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    setRatings(ratings.filter((_, i) => i !== index));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wheelRef.current?.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const resetToDefaults = () => {
    setItems(defaultItems);
    setRatings(defaultRatings);
    setMaxScore(10);
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Wheel of Life</h1>
        <div className="header-actions">
          <button onClick={() => setShowCustomization(!showCustomization)} className="btn btn-secondary">
            {showCustomization ? 'Hide' : 'Show'} Customization
          </button>
          <button onClick={toggleFullscreen} className="btn btn-primary">
            Fullscreen
          </button>
        </div>
      </div>

      {showCustomization && (
        <div className="customization-panel">
          <div className="panel-header">
            <h2>Customization</h2>
            <button onClick={resetToDefaults} className="btn btn-secondary">Reset to Defaults</button>
          </div>
          
          <div className="max-score-control">
            <label>
              Max Score:
              <input
                type="number"
                min="1"
                max="20"
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value) || 10)}
              />
            </label>
          </div>

          <div className="items-list">
            {items.map((item, index) => (
              <div key={index} className="item-control">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  className="item-input"
                />
                <input
                  type="number"
                  min="0"
                  max={maxScore}
                  value={ratings[index]}
                  onChange={(e) => handleRatingChange(index, e.target.value)}
                  className="rating-input"
                />
                <button onClick={() => removeItem(index)} className="btn btn-danger">
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button onClick={addItem} className="btn btn-primary add-item-btn">
            Add Item
          </button>
        </div>
      )}

      <div 
        ref={wheelRef} 
        className={`wheel-container ${isFullscreen ? 'fullscreen' : ''}`}
      >
        <WheelOfLife items={items} ratings={ratings} maxScore={maxScore} />
      </div>
    </div>
  );
}

export default App;
