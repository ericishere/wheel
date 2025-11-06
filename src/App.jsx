import React, { useState, useRef, useEffect } from 'react';
import WheelOfLife from './WheelOfLife';
import './App.css';

const defaultCategories = [
  {
    id: 1,
    name: "IDENTIFY",
    color: "#000000",
    items: [
      { id: 1, name: "Governance", status: "high" },
      { id: 2, name: "Penetration Test", status: "high" }
    ]
  },
  {
    id: 2,
    name: "PROTECT",
    color: "#000000",
    items: [
      { id: 3, name: "Data Loss Prevention", status: "high" },
      { id: 4, name: "Training", status: "high" },
      { id: 5, name: "Strategic Architecture", status: "mid" },
      { id: 6, name: "Application Security", status: "low" },
      { id: 7, name: "Vulnerability Management", status: "low" }
    ]
  },
  {
    id: 3,
    name: "DETECT",
    color: "#000000",
    items: [
      { id: 8, name: "Security Operation Center", status: "mid" },
      { id: 9, name: "Threat Intelligence", status: "mid" }
    ]
  },
  {
    id: 4,
    name: "RESPOND",
    color: "#000000",
    items: [
      { id: 10, name: "Incident Response", status: "mid" }
    ]
  },
  {
    id: 5,
    name: "ALL",
    color: "#000000",
    items: [
      { id: 11, name: "Engineer", status: "mid" },
      { id: 12, name: "PMO", status: "high" }
    ]
  }
];

const defaultGradientSettings = {
  low: { start: '#fca5a5', end: '#b91c1c' },
  mid: { start: '#fdba74', end: '#ea580c' },
  high: { start: '#86efac', end: '#15803d' },
};

const createDefaultGradients = () => ({
  low: { ...defaultGradientSettings.low },
  mid: { ...defaultGradientSettings.mid },
  high: { ...defaultGradientSettings.high },
});

function App() {
  const [categories, setCategories] = useState(defaultCategories);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [statusGradients, setStatusGradients] = useState(createDefaultGradients);
  const [categoryLabelColor, setCategoryLabelColor] = useState('#000000');
  const [itemFontSize, setItemFontSize] = useState(14);
  const [itemLineHeight, setItemLineHeight] = useState(14);
  const [categoryFontSize, setCategoryFontSize] = useState(20);
  const [showCustomization, setShowCustomization] = useState(false);
  const wheelRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleGradientColorChange = (status, stop, value) => {
    setStatusGradients(prev => {
      const base = prev[status] ?? defaultGradientSettings[status] ?? {};
      return {
        ...prev,
        [status]: {
          ...base,
          [stop]: value,
        },
      };
    });
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

  // Listen for fullscreen changes (e.g., when user presses ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const resetToDefaults = () => {
    setCategories(defaultCategories);
    setStatusGradients(createDefaultGradients());
    setCategoryLabelColor('#000000');
    setItemFontSize(14);
    setItemLineHeight(14);
    setCategoryFontSize(20);
  };

  const exportConfig = () => {
    const config = {
      version: '1.0',
      categories: categories,
      statusGradients: statusGradients,
      categoryLabelColor: categoryLabelColor,
      itemFontSize: itemFontSize,
      itemLineHeight: itemLineHeight,
      categoryFontSize: categoryFontSize,
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wheel-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importConfig = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result);
        
        // Validate config structure
        if (!config.categories || !Array.isArray(config.categories)) {
          throw new Error('Invalid configuration file: categories missing or invalid');
        }

        // Apply configuration
        if (config.categories) setCategories(config.categories);
        if (config.statusGradients) setStatusGradients(config.statusGradients);
        if (config.categoryLabelColor) setCategoryLabelColor(config.categoryLabelColor);
        if (typeof config.itemFontSize === 'number') setItemFontSize(config.itemFontSize);
        if (typeof config.itemLineHeight === 'number') setItemLineHeight(config.itemLineHeight);
        if (typeof config.categoryFontSize === 'number') setCategoryFontSize(config.categoryFontSize);

        alert('Configuration loaded successfully!');
      } catch (error) {
        alert(`Error loading configuration: ${error.message}`);
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be imported again if needed
    event.target.value = '';
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const gradientSettings = {
    low: { ...defaultGradientSettings.low, ...statusGradients.low },
    mid: { ...defaultGradientSettings.mid, ...statusGradients.mid },
    high: { ...defaultGradientSettings.high, ...statusGradients.high },
  };

  const statusLabels = {
    low: 'Low (Red)',
    mid: 'Mid (Orange)',
    high: 'High (Green)',
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Wheels diagram</h1>
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
            <div className="panel-actions">
              <button onClick={exportConfig} className="btn btn-success">Export Config</button>
              <button onClick={triggerImport} className="btn btn-success">Import Config</button>
              <button onClick={resetToDefaults} className="btn btn-secondary">Reset to Defaults</button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importConfig}
              style={{ display: 'none' }}
            />
          </div>
          
          <div className="color-thresholds">
            <h3>Status Gradients</h3>
            {Object.entries(statusLabels).map(([status, label]) => {
              const gradient = gradientSettings[status] ?? defaultGradientSettings[status];
              return (
                <div key={status} className="status-gradient-group">
                  <span className="status-gradient-title">{label}</span>
                  <div className="gradient-row">
                    <label>
                      Start Color
                      <input
                        type="color"
                        value={gradient?.start || '#e2e8f0'}
                        onChange={(e) => handleGradientColorChange(status, 'start', e.target.value)}
                      />
                    </label>
                    <label>
                      End Color
                      <input
                        type="color"
                        value={gradient?.end || '#cbd5f5'}
                        onChange={(e) => handleGradientColorChange(status, 'end', e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
            <div className="threshold-row">
              <label>
                Category Label Color
                <input
                  type="color"
                  value={categoryLabelColor}
                  onChange={(e) => setCategoryLabelColor(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="font-settings">
            <h3>Font Settings</h3>
            <div className="threshold-row">
              <label>
                Item Font Size
                <input
                  type="number"
                  min="8"
                  max="24"
                  value={itemFontSize}
                  onChange={(e) => setItemFontSize(Number(e.target.value))}
                />
              </label>
              <label>
                Item Line Height
                <input
                  type="number"
                  min="8"
                  max="30"
                  value={itemLineHeight}
                  onChange={(e) => setItemLineHeight(Number(e.target.value))}
                />
              </label>
              <label>
                Category Font Size
                <input
                  type="number"
                  min="12"
                  max="32"
                  value={categoryFontSize}
                  onChange={(e) => setCategoryFontSize(Number(e.target.value))}
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
                          <option value="mid">Mid (Orange)</option>
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
        {isFullscreen && (
          <button onClick={toggleFullscreen} className="btn btn-exit-fullscreen">
            Exit Fullscreen
          </button>
        )}
        <WheelOfLife 
          categories={categories} 
          gradientSettings={gradientSettings} 
          categoryLabelColor={categoryLabelColor}
          itemFontSize={itemFontSize}
          itemLineHeight={itemLineHeight}
          categoryFontSize={categoryFontSize}
        />
      </div>
    </div>
  );
}

export default App;
