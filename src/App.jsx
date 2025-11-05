import React, { useState, useRef } from 'react';
import WheelOfLife from './WheelOfLife';
import './App.css';

const defaultPresetColors = {
  preset1: '#22c55e', // Green
  preset2: '#f59e0b', // Yellow
  preset3: '#ef4444'  // Red
};

const defaultCategories = [
  {
    id: 1,
    name: "IDENTIFY",
    color: "#2196F3",
    fontColor: "#000000",
    items: [
      { id: 1, name: "Vulnerability Management", colorPreset: 'preset1' },
      { id: 2, name: "Governance Risk Verification", colorPreset: 'preset2' },
      { id: 3, name: "Penetration Test", colorPreset: 'preset3' }
    ]
  },
  {
    id: 2,
    name: "PROTECT",
    color: "#2196F3",
    fontColor: "#000000",
    items: [
      { id: 4, name: "Data Loss Prevention (DLP)", colorPreset: 'preset1' },
      { id: 5, name: "Architecture", colorPreset: 'preset2' },
      { id: 6, name: "Engineering", colorPreset: 'preset3' },
      { id: 7, name: "DevSecOps", colorPreset: 'preset1' },
      { id: 8, name: "Training", colorPreset: 'preset2' }
    ]
  },
  {
    id: 3,
    name: "DETECT",
    color: "#2196F3",
    fontColor: "#000000",
    items: [
      { id: 9, name: "Security Operation Center (SOC)", colorPreset: 'preset3' }
    ]
  },
  {
    id: 4,
    name: "RESPOND",
    color: "#2196F3",
    fontColor: "#000000",
    items: [
      { id: 10, name: "Incident Response", colorPreset: 'preset1' }
    ]
  },
  {
    id: 5,
    name: "RECOVER",
    color: "#2196F3",
    fontColor: "#000000",
    items: [
      { id: 11, name: "Project Management", colorPreset: 'preset2' }
    ]
  }
];

function App() {
  const [categories, setCategories] = useState(defaultCategories);
  const [presetColors, setPresetColors] = useState(defaultPresetColors);
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

  const handleItemColorPresetChange = (categoryId, itemId, value) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, colorPreset: value } : item
          )
        };
      }
      return cat;
    }));
  };

  const handlePresetColorChange = (presetKey, value) => {
    setPresetColors({
      ...presetColors,
      [presetKey]: value
    });
  };

  const addCategory = () => {
    const newId = Math.max(...categories.map(c => c.id)) + 1;
    setCategories([...categories, {
      id: newId,
      name: `Category ${categories.length + 1}`,
      color: '#2196F3',
      fontColor: '#000000',
      items: [{ id: Date.now(), name: 'New Item', colorPreset: 'preset1' }]
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
          items: [...cat.items, { id: newItemId, name: 'New Item', colorPreset: 'preset1' }]
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
    setPresetColors(defaultPresetColors);
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

          <div className="preset-colors-section">
            <h3>Item Color Presets</h3>
            <div className="preset-colors-grid">
              <label className="preset-color-control">
                <span>Preset 1 (Green):</span>
                <input
                  type="color"
                  value={presetColors.preset1}
                  onChange={(e) => handlePresetColorChange('preset1', e.target.value)}
                  className="preset-color-input"
                />
                <span className="color-value">{presetColors.preset1}</span>
              </label>
              <label className="preset-color-control">
                <span>Preset 2 (Yellow):</span>
                <input
                  type="color"
                  value={presetColors.preset2}
                  onChange={(e) => handlePresetColorChange('preset2', e.target.value)}
                  className="preset-color-input"
                />
                <span className="color-value">{presetColors.preset2}</span>
              </label>
              <label className="preset-color-control">
                <span>Preset 3 (Red):</span>
                <input
                  type="color"
                  value={presetColors.preset3}
                  onChange={(e) => handlePresetColorChange('preset3', e.target.value)}
                  className="preset-color-input"
                />
                <span className="color-value">{presetColors.preset3}</span>
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
                    Border Color:
                    <input
                      type="color"
                      value={category.color}
                      onChange={(e) => handleCategoryColorChange(category.id, e.target.value)}
                      className="category-color-input"
                    />
                  </label>
                  <label className="category-color-label">
                    Font Color:
                    <input
                      type="color"
                      value={category.fontColor || '#000000'}
                      onChange={(e) => handleCategoryFontColorChange(category.id, e.target.value)}
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
                        <label className="item-color-label">
                          Color:
                          <select
                            value={item.colorPreset}
                            onChange={(e) => handleItemColorPresetChange(category.id, item.id, e.target.value)}
                            className="item-color-select"
                            style={{ backgroundColor: presetColors[item.colorPreset] }}
                          >
                            <option value="preset1" style={{ backgroundColor: presetColors.preset1 }}>Preset 1 (Green)</option>
                            <option value="preset2" style={{ backgroundColor: presetColors.preset2 }}>Preset 2 (Yellow)</option>
                            <option value="preset3" style={{ backgroundColor: presetColors.preset3 }}>Preset 3 (Red)</option>
                          </select>
                        </label>
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
        <WheelOfLife categories={categories} presetColors={presetColors} />
      </div>
    </div>
  );
}

export default App;
