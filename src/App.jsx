import React, { useState, useRef, useEffect } from 'react';
import WheelOfLife from './WheelOfLife';
import './App.css';

const defaultCategories = [
  {
    id: 1,
    name: "Security",
    color: "#ef4444",
    items: [
      { name: "Vulnerability Management", rating: 6 },
      { name: "Penetration Test", rating: 5 },
      { name: "Data Loss Prevention", rating: 6 },
      { name: "Incident Response", rating: 6 }
    ]
  },
  {
    id: 2,
    name: "Governance",
    color: "#f59e0b",
    items: [
      { name: "Governance Risk Verification", rating: 5 },
      { name: "Training", rating: 4 }
    ]
  },
  {
    id: 3,
    name: "Engineering",
    color: "#22c55e",
    items: [
      { name: "Engineering", rating: 4 },
      { name: "Architecture", rating: 4 }
    ]
  },
  {
    id: 4,
    name: "Operations",
    color: "#3b82f6",
    items: [
      { name: "Security Operation Center", rating: 5 },
      { name: "DevSecOps", rating: 5 }
    ]
  },
  {
    id: 5,
    name: "Management",
    color: "#8b5cf6",
    items: [
      { name: "Project Management", rating: 6 }
    ]
  }
];

const clampNumber = (value, min, max) => {
  const numeric = Number.isFinite(value) ? value : min;
  if (numeric < min) return min;
  if (numeric > max) return max;
  return numeric;
};

function App() {
  const [categories, setCategories] = useState(defaultCategories);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [maxScore, setMaxScore] = useState(10);
  const [lowThreshold, setLowThreshold] = useState(4);
  const [mediumThreshold, setMediumThreshold] = useState(5);
  const [lowColor, setLowColor] = useState('#ef4444');
  const [mediumColor, setMediumColor] = useState('#f59e0b');
  const [highColor, setHighColor] = useState('#22c55e');
  const [showCustomization, setShowCustomization] = useState(false);
  const wheelRef = useRef(null);

  const handleCategoryNameChange = (categoryId, value) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, name: value } : cat
    ));
  };

  const handleCategoryColorChange = (categoryId, value) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, color: value } : cat
    ));
  };

  const handleItemChange = (categoryId, itemIndex, value) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            items: cat.items.map((item, idx) => 
              idx === itemIndex ? { ...item, name: value } : item
            )
          }
        : cat
    ));
  };

  const handleRatingChange = (categoryId, itemIndex, value) => {
    const parsedValue = Number.parseInt(value, 10);
    const boundedValue = clampNumber(Number.isNaN(parsedValue) ? 0 : parsedValue, 0, maxScore);
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            items: cat.items.map((item, idx) => 
              idx === itemIndex ? { ...item, rating: boundedValue } : item
            )
          }
        : cat
    ));
  };

  const handleLowThresholdChange = (value) => {
    const parsedValue = Number.parseInt(value, 10);
    const safeValue = clampNumber(Number.isNaN(parsedValue) ? lowThreshold : parsedValue, 0, mediumThreshold);
    setLowThreshold(safeValue);
  };

  const handleMediumThresholdChange = (value) => {
    const parsedValue = Number.parseInt(value, 10);
    const safeValue = clampNumber(Number.isNaN(parsedValue) ? mediumThreshold : parsedValue, lowThreshold, maxScore);
    setMediumThreshold(safeValue);
  };

  const addItem = (categoryId) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            items: [...cat.items, { name: `New Item ${cat.items.length + 1}`, rating: 5 }]
          }
        : cat
    ));
  };

  const removeItem = (categoryId, itemIndex) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            items: cat.items.filter((_, i) => i !== itemIndex)
          }
        : cat
    ));
  };

  const moveItem = (categoryId, itemIndex, direction) => {
    setCategories(categories.map(cat => {
      if (cat.id !== categoryId) return cat;
      
      const targetIndex = itemIndex + direction;
      if (targetIndex < 0 || targetIndex >= cat.items.length) {
        return cat;
      }

      const newItems = [...cat.items];
      [newItems[itemIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[itemIndex]];
      return { ...cat, items: newItems };
    }));
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
    setCategories(defaultCategories);
    setMaxScore(10);
    setLowThreshold(4);
    setMediumThreshold(5);
    setLowColor('#ef4444');
    setMediumColor('#f59e0b');
    setHighColor('#22c55e');
  };

  useEffect(() => {
    setLowThreshold((current) => clampNumber(current, 0, Math.min(mediumThreshold, maxScore)));
  }, [maxScore, mediumThreshold]);

  useEffect(() => {
    setMediumThreshold((current) => clampNumber(current, lowThreshold, maxScore));
  }, [lowThreshold, maxScore]);

  const colorSettings = {
    low: { max: lowThreshold, color: lowColor },
    medium: { max: mediumThreshold, color: mediumColor },
    high: { color: highColor },
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
                onChange={(e) => {
                  const parsedValue = Number.parseInt(e.target.value, 10);
                  const bounded = clampNumber(Number.isNaN(parsedValue) ? 10 : parsedValue, 1, 20);
                  setMaxScore(bounded);
                }}
              />
            </label>
          </div>

          <div className="color-thresholds">
            <h3>Color Thresholds</h3>
            <div className="threshold-row">
              <label>
                Low threshold (≤)
                <input
                  type="number"
                  min="0"
                  max={mediumThreshold}
                  value={lowThreshold}
                  onChange={(e) => handleLowThresholdChange(e.target.value)}
                />
              </label>
              <label>
                Medium threshold (≤)
                <input
                  type="number"
                  min={lowThreshold}
                  max={maxScore}
                  value={mediumThreshold}
                  onChange={(e) => handleMediumThresholdChange(e.target.value)}
                />
              </label>
            </div>

            <div className="threshold-row">
              <label>
                Low color
                <input
                  type="color"
                  value={lowColor}
                  onChange={(e) => setLowColor(e.target.value)}
                />
              </label>
              <label>
                Medium color
                <input
                  type="color"
                  value={mediumColor}
                  onChange={(e) => setMediumColor(e.target.value)}
                />
              </label>
              <label>
                High color
                <input
                  type="color"
                  value={highColor}
                  onChange={(e) => setHighColor(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="categories-list">
            {categories.map((category) => (
              <div key={category.id} className="category-section">
                <div className="category-header">
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                    className="category-name-input"
                  />
                  <input
                    type="color"
                    value={category.color}
                    onChange={(e) => handleCategoryColorChange(category.id, e.target.value)}
                    className="category-color-input"
                  />
                </div>
                <div className="items-list">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="item-control">
                      <div className="item-fields">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(category.id, itemIndex, e.target.value)}
                          className="item-input"
                        />
                        <input
                          type="number"
                          min="0"
                          max={maxScore}
                          value={item.rating}
                          onChange={(e) => handleRatingChange(category.id, itemIndex, e.target.value)}
                          className="rating-input"
                        />
                      </div>
                      <div className="item-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => moveItem(category.id, itemIndex, -1)}
                          disabled={itemIndex === 0}
                          aria-label={`Move ${item.name} up`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => moveItem(category.id, itemIndex, 1)}
                          disabled={itemIndex === category.items.length - 1}
                          aria-label={`Move ${item.name} down`}
                        >
                          ↓
                        </button>
                        <button 
                          type="button" 
                          onClick={() => removeItem(category.id, itemIndex)} 
                          className="btn btn-danger remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => addItem(category.id)} 
                  className="btn btn-primary add-item-btn"
                >
                  Add Item to {category.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div 
        ref={wheelRef} 
        className={`wheel-container ${isFullscreen ? 'fullscreen' : ''}`}
      >
        <WheelOfLife 
          categories={categories} 
          maxScore={maxScore} 
          colorSettings={colorSettings} 
        />
      </div>
    </div>
  );
}

export default App;
