import React, { useState, useRef } from 'react';
import WheelOfLife from './WheelOfLife';
import './App.css';

const defaultCategories = [
  {
    id: 1,
    name: "Security",
    color: "#3b82f6",
    fontColor: "#3b82f6",
    items: [
      { name: "Vulnerability Management", color: "#3b82f6" },
      { name: "Penetration Test", color: "#3b82f6" },
      { name: "Data Loss Prevention", color: "#3b82f6" },
      { name: "Incident Response", color: "#3b82f6" }
    ]
  },
  {
    id: 2,
    name: "Governance",
    color: "#3b82f6",
    fontColor: "#3b82f6",
    items: [
      { name: "Governance Risk Verification", color: "#3b82f6" },
      { name: "Training", color: "#3b82f6" }
    ]
  },
  {
    id: 3,
    name: "Engineering",
    color: "#3b82f6",
    fontColor: "#3b82f6",
    items: [
      { name: "Engineering", color: "#3b82f6" },
      { name: "Architecture", color: "#3b82f6" }
    ]
  },
  {
    id: 4,
    name: "Operations",
    color: "#3b82f6",
    fontColor: "#3b82f6",
    items: [
      { name: "Security Operation Center", color: "#3b82f6" },
      { name: "DevSecOps", color: "#3b82f6" }
    ]
  },
  {
    id: 5,
    name: "Management",
    color: "#3b82f6",
    fontColor: "#3b82f6",
    items: [
      { name: "Project Management", color: "#3b82f6" }
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

  const handleCategoryFontColorChange = (categoryId, value) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, fontColor: value } : cat
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

  const handleItemColorChange = (categoryId, itemIndex, value) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            items: cat.items.map((item, idx) => 
              idx === itemIndex ? { ...item, color: value } : item
            )
          }
        : cat
    ));
  };

  const addItem = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    const defaultColor = category?.color || "#3b82f6";
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            items: [...cat.items, { name: `New Item ${cat.items.length + 1}`, color: defaultColor }]
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
                  <label className="color-label">
                    Frame Color
                    <input
                      type="color"
                      value={category.color}
                      onChange={(e) => handleCategoryColorChange(category.id, e.target.value)}
                      className="category-color-input"
                    />
                  </label>
                  <label className="color-label">
                    Font Color
                    <input
                      type="color"
                      value={category.fontColor || category.color}
                      onChange={(e) => handleCategoryFontColorChange(category.id, e.target.value)}
                      className="category-color-input"
                    />
                  </label>
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
                        <label className="color-label">
                          Color
                          <input
                            type="color"
                            value={item.color || category.color}
                            onChange={(e) => handleItemColorChange(category.id, itemIndex, e.target.value)}
                            className="item-color-input"
                          />
                        </label>
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
        />
      </div>
    </div>
  );
}

export default App;
