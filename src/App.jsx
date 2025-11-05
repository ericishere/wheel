import React, { useState, useRef, useEffect } from 'react';
import WheelOfLife from './WheelOfLife';
import './App.css';

const defaultItems = [
  "Vulnerability Management",
  "Penetration Test",
  "Governance Risk Verification",
  "Engineering",
  "Architecture",
  "Project Management",
  "Training",
  "Data Loss Prevention",
  "Incident Response",
  "Security Operation Center",
  "DevSecOps"  
];

const defaultRatings = [6, 5, 5, 4, 4, 6, 4, 6, 6, 5, 5];

const clampNumber = (value, min, max) => {
  const numeric = Number.isFinite(value) ? value : min;
  if (numeric < min) return min;
  if (numeric > max) return max;
  return numeric;
};

function App() {
  const [items, setItems] = useState(defaultItems);
  const [ratings, setRatings] = useState(defaultRatings);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [maxScore, setMaxScore] = useState(10);
  const [lowThreshold, setLowThreshold] = useState(4);
  const [mediumThreshold, setMediumThreshold] = useState(5);
  const [lowColor, setLowColor] = useState('#ef4444');
  const [mediumColor, setMediumColor] = useState('#f59e0b');
  const [highColor, setHighColor] = useState('#22c55e');
  const [showCustomization, setShowCustomization] = useState(false);
  const wheelRef = useRef(null);

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleRatingChange = (index, value) => {
    const parsedValue = Number.parseInt(value, 10);
    const boundedValue = clampNumber(Number.isNaN(parsedValue) ? 0 : parsedValue, 0, maxScore);
    const newRatings = [...ratings];
    newRatings[index] = boundedValue;
    setRatings(newRatings);
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

  const addItem = () => {
    setItems([...items, `New Item ${items.length + 1}`]);
    setRatings([...ratings, 5]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    setRatings(ratings.filter((_, i) => i !== index));
  };

  const moveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) {
      return;
    }

    setItems((current) => {
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });

    setRatings((current) => {
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
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

          <div className="items-list">
            {items.map((item, index) => (
              <div key={index} className="item-control">
                <div className="item-fields">
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
                </div>
                <div className="item-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${item} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === items.length - 1}
                    aria-label={`Move ${item} down`}
                  >
                    ↓
                  </button>
                  <button type="button" onClick={() => removeItem(index)} className="btn btn-danger remove-btn">
                    Remove
                  </button>
                </div>
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
        <WheelOfLife items={items} ratings={ratings} maxScore={maxScore} colorSettings={colorSettings} />
      </div>
    </div>
  );
}

export default App;
