import React, { useState, useRef, useEffect } from 'react';
import WheelOfLife from './WheelOfLife';
import './App.css';

const defaultCategories = [
  {
    id: 1,
    name: "IDENTIFY",
    color: "#5DADE2",
    items: [
      { id: 1, name: "Vulnerability Management", rating: 6 },
      { id: 2, name: "Governance Risk Verification", rating: 5 },
      { id: 3, name: "Penetration Test", rating: 5 }
    ]
  },
  {
    id: 2,
    name: "PROTECT",
    color: "#AF7AC5",
    items: [
      { id: 4, name: "Data Loss Prevention (DLP)", rating: 7 },
      { id: 5, name: "Architecture", rating: 6 },
      { id: 6, name: "Engineering", rating: 4 },
      { id: 7, name: "DevSecOps", rating: 6 },
      { id: 8, name: "Training", rating: 4 }
    ]
  },
  {
    id: 3,
    name: "DETECT",
    color: "#F39C12",
    items: [
      { id: 9, name: "Security Operation Center (SOC)", rating: 6 }
    ]
  },
  {
    id: 4,
    name: "RESPOND",
    color: "#EC7063",
    items: [
      { id: 10, name: "Incident Response", rating: 6 }
    ]
  },
  {
    id: 5,
    name: "RECOVER",
    color: "#52BE80",
    items: [
      { id: 11, name: "Project Management", rating: 5 }
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
  const [lowColor, setLowColor] = useState('#ef4444'); // red
  const [mediumColor, setMediumColor] = useState('#fbbf24'); // yellow
  const [highColor, setHighColor] = useState('#22c55e'); // green
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

  const handleItemNameChange = (categoryId, itemId, value) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, name: value } : item
          )
        };
      }
      return cat;
    }));
  };

  const handleItemRatingChange = (categoryId, itemId, value) => {
    const parsedValue = Number.parseInt(value, 10);
    const boundedValue = clampNumber(Number.isNaN(parsedValue) ? 0 : parsedValue, 0, maxScore);
    
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, rating: boundedValue } : item
          )
        };
      }
      return cat;
    }));
  };

  const addCategory = () => {
    const newId = Math.max(...categories.map(c => c.id)) + 1;
    setCategories([...categories, {
      id: newId,
      name: `Category ${categories.length + 1}`,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      items: [{ id: Date.now(), name: 'New Item', rating: 5 }]
    }]);
  };

  const removeCategory = (categoryId) => {
    if (categories.length <= 1) {
      alert('You must have at least one category');
      return;
    }
    setCategories(categories.filter(cat => cat.id !== categoryId));
  };

  const addItemToCategory = (categoryId) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        const newItemId = cat.items.length > 0 
          ? Math.max(...cat.items.map(i => i.id)) + 1 
          : 1;
        return {
          ...cat,
          items: [...cat.items, { id: newItemId, name: 'New Item', rating: 5 }]
        };
      }
      return cat;
    }));
  };

  const removeItemFromCategory = (categoryId, itemId) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        if (cat.items.length <= 1) {
          alert('Each category must have at least one item');
          return cat;
        }
        return {
          ...cat,
          items: cat.items.filter(item => item.id !== itemId)
        };
      }
      return cat;
    }));
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
    setLowColor('#ef4444'); // red
    setMediumColor('#fbbf24'); // yellow
    setHighColor('#22c55e'); // green
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
            <h3>Item Color Thresholds (for inner rings)</h3>
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

          <div className="categories-section">
            <h3>Categories & Items</h3>
            
            {categories.map((category) => (
              <div key={category.id} className="category-container">
                <div className="category-header">
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                    className="category-name-input"
                    placeholder="Category Name"
                  />
                  <label className="category-color-label">
                    Color:
                    <input
                      type="color"
                      value={category.color}
                      onChange={(e) => handleCategoryColorChange(category.id, e.target.value)}
                      className="category-color-input"
                    />
                  </label>
                  <button 
                    onClick={() => removeCategory(category.id)} 
                    className="btn btn-danger"
                    disabled={categories.length <= 1}
                  >
                    Remove Category
                  </button>
                </div>

                <div className="items-list">
                  {category.items.map((item) => (
                    <div key={item.id} className="item-control">
                      <div className="item-fields">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemNameChange(category.id, item.id, e.target.value)}
                          className="item-input"
                          placeholder="Item Name"
                        />
                        <input
                          type="number"
                          min="0"
                          max={maxScore}
                          value={item.rating}
                          onChange={(e) => handleItemRatingChange(category.id, item.id, e.target.value)}
                          className="rating-input"
                        />
                      </div>
                      <div className="item-actions">
                        <button 
                          type="button" 
                          onClick={() => removeItemFromCategory(category.id, item.id)} 
                          className="btn btn-danger remove-btn"
                          disabled={category.items.length <= 1}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => addItemToCategory(category.id)} 
                  className="btn btn-secondary add-item-btn"
                >
                  Add Item to {category.name}
                </button>
              </div>
            ))}

            <button onClick={addCategory} className="btn btn-primary add-category-btn">
              Add New Category
            </button>
          </div>
        </div>
      )}

      <div 
        ref={wheelRef} 
        className={`wheel-container ${isFullscreen ? 'fullscreen' : ''}`}
      >
        <WheelOfLife categories={categories} maxScore={maxScore} colorSettings={colorSettings} />
      </div>
    </div>
  );
}

export default App;
