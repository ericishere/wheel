import React, { useState, useRef } from 'react';
import WheelOfLife from './WheelOfLife';
import './App.css';

const defaultCategories = [
  {
    id: 1,
    name: "IDENTIFY",
    color: "#5DADE2",
    items: [
      { id: 1, name: "Vulnerability Management", status: "high" },
      { id: 2, name: "Governance Risk Verification", status: "mid" },
      { id: 3, name: "Penetration Test", status: "mid" }
    ]
  },
  {
    id: 2,
    name: "PROTECT",
    color: "#AF7AC5",
    items: [
      { id: 4, name: "Data Loss Prevention (DLP)", status: "high" },
      { id: 5, name: "Architecture", status: "high" },
      { id: 6, name: "Engineering", status: "mid" },
      { id: 7, name: "DevSecOps", status: "high" },
      { id: 8, name: "Training", status: "low" }
    ]
  },
  {
    id: 3,
    name: "DETECT",
    color: "#F39C12",
    items: [
      { id: 9, name: "Security Operation Center (SOC)", status: "high" }
    ]
  },
  {
    id: 4,
    name: "RESPOND",
    color: "#EC7063",
    items: [
      { id: 10, name: "Incident Response", status: "high" }
    ]
  },
  {
    id: 5,
    name: "RECOVER",
    color: "#52BE80",
    items: [
      { id: 11, name: "Project Management", status: "mid" }
    ]
  }
];

function App() {
  const [categories, setCategories] = useState(defaultCategories);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lowColor, setLowColor] = useState('#ef4444');
  const [midColor, setMidColor] = useState('#f59e0b');
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

  const handleItemStatusChange = (categoryId, itemId, value) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, status: value } : item
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
      items: [{ id: Date.now(), name: 'New Item', status: 'mid' }]
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
          items: [...cat.items, { id: newItemId, name: 'New Item', status: 'mid' }]
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
    setLowColor('#ef4444');
    setMidColor('#f59e0b');
    setHighColor('#22c55e');
  };

  const colorSettings = {
    low: lowColor,
    mid: midColor,
    high: highColor,
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
          
          <div className="color-thresholds">
            <h3>Status Colors</h3>
            <div className="threshold-row">
              <label>
                Low (Red)
                <input
                  type="color"
                  value={lowColor}
                  onChange={(e) => setLowColor(e.target.value)}
                />
              </label>
              <label>
                Mid (Yellow)
                <input
                  type="color"
                  value={midColor}
                  onChange={(e) => setMidColor(e.target.value)}
                />
              </label>
              <label>
                High (Green)
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
                        <select
                          value={item.status}
                          onChange={(e) => handleItemStatusChange(category.id, item.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="low">Low (Red)</option>
                          <option value="mid">Mid (Yellow)</option>
                          <option value="high">High (Green)</option>
                        </select>
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
        <WheelOfLife categories={categories} colorSettings={colorSettings} />
      </div>
    </div>
  );
}

export default App;
