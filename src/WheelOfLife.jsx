import React from 'react';

const defaultGradientSettings = {
  low: { start: '#fca5a5', end: '#b91c1c' },
  mid: { start: '#fdba74', end: '#ea580c' },
  high: { start: '#86efac', end: '#15803d' },
};

const fallbackGradient = {
  start: '#e2e8f0',
  end: '#cbd5f5',
};

const hexColorPattern = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const isHexColor = (value) => typeof value === 'string' && hexColorPattern.test(value);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeHex = (hex) => {
  const raw = hex.replace('#', '');
  if (raw.length === 3) {
    return raw
      .split('')
      .map((char) => char + char)
      .join('');
  }
  return raw.padStart(6, '0').slice(0, 6);
};

const hexToRgb = (hex) => {
  const normalized = normalizeHex(hex);
  const value = parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const rgbToHex = ({ r, g, b }) => (
  `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`
);

const mixColors = (color, target, amount) => {
  const t = clamp(amount, 0, 1);
  const base = hexToRgb(color);
  const goal = hexToRgb(target);
  return rgbToHex({
    r: base.r + (goal.r - base.r) * t,
    g: base.g + (goal.g - base.g) * t,
    b: base.b + (goal.b - base.b) * t,
  });
};

const adjustColor = (color, amount) => {
  if (!isHexColor(color) || amount === 0) {
    return color;
  }

  const target = amount > 0 ? '#ffffff' : '#000000';
  return mixColors(color, target, Math.abs(amount));
};

const resolveGradientForStatus = (status, gradientSettings) => {
  const defaults = defaultGradientSettings[status] ?? fallbackGradient;
  const entry = gradientSettings?.[status];

  if (!entry) {
    return defaults;
  }

  if (typeof entry === 'string') {
    if (!isHexColor(entry)) {
      return defaults;
    }

    const startColor = adjustColor(entry, 0.3) || defaults.start;
    const endColor = adjustColor(entry, -0.25) || defaults.end;
    return {
      start: isHexColor(startColor) ? startColor : defaults.start,
      end: isHexColor(endColor) ? endColor : defaults.end,
    };
  }

  const startCandidate = entry.start;
  const endCandidate = entry.end;
  const hasStart = isHexColor(startCandidate);
  const hasEnd = isHexColor(endCandidate);

  if (hasStart && hasEnd) {
    return { start: startCandidate, end: endCandidate };
  }

  if (hasStart) {
    const derivedEnd = adjustColor(startCandidate, -0.25) || defaults.end;
    return {
      start: startCandidate,
      end: isHexColor(derivedEnd) ? derivedEnd : defaults.end,
    };
  }

  if (hasEnd) {
    const derivedStart = adjustColor(endCandidate, 0.3) || defaults.start;
    return {
      start: isHexColor(derivedStart) ? derivedStart : defaults.start,
      end: endCandidate,
    };
  }

  return defaults;
};

const WheelOfLife = ({ 
  categories, 
  gradientSettings = defaultGradientSettings, 
  categoryLabelColor = '#000000',
  itemFontSize = 14,
  itemLineHeight = 14,
  categoryFontSize = 20
}) => {
  const size = 900;
  const center = size / 2;
  
  // Calculate total items across all categories
  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  
  // Radius configuration
  const centerRadius = size * 0.08;
  const maxInnerRadius = size * 0.32;
  const categoryRingWidth = size * 0.08;
  const categoryInnerRadius = maxInnerRadius + 10;
  const categoryOuterRadius = categoryInnerRadius + categoryRingWidth;
  const labelRadius = categoryOuterRadius + 50;

  // Calculate angle for each item
  let itemAngles = [];
  let currentAngle = 0;
  
  categories.forEach((category, catIndex) => {
    const anglePerItem = totalItems > 0 ? (2 * Math.PI) / totalItems : 0;
    
    category.items.forEach((item, itemIndex) => {
      itemAngles.push({
        categoryIndex: catIndex,
        itemIndex,
        categoryId: category.id,
        itemId: item.id,
        startAngle: currentAngle - Math.PI / 2,
        endAngle: (currentAngle + anglePerItem) - Math.PI / 2,
        centerAngle: (currentAngle + anglePerItem / 2) - Math.PI / 2,
      });
      currentAngle += anglePerItem;
    });
  });

  // Create path for a segment
  const createSegmentPath = (startAngle, endAngle, innerRadius, outerRadius) => {
    const x1 = center + innerRadius * Math.cos(startAngle);
    const y1 = center + innerRadius * Math.sin(startAngle);
    const x2 = center + outerRadius * Math.cos(startAngle);
    const y2 = center + outerRadius * Math.sin(startAngle);
    const x3 = center + outerRadius * Math.cos(endAngle);
    const y3 = center + outerRadius * Math.sin(endAngle);
    const x4 = center + innerRadius * Math.cos(endAngle);
    const y4 = center + innerRadius * Math.sin(endAngle);

    const largeArcFlag = (endAngle - startAngle) > Math.PI ? 1 : 0;

    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
      Z
    `;
  };

  // Calculate category angles
  let categoryAngles = [];
  let categoryStartAngle = 0;
  
  categories.forEach((category, index) => {
    const itemsInCategory = category.items.length;
    const categoryAngleSpan = totalItems > 0 ? (2 * Math.PI * itemsInCategory) / totalItems : 0;
    
    categoryAngles.push({
      startAngle: categoryStartAngle - Math.PI / 2,
      endAngle: (categoryStartAngle + categoryAngleSpan) - Math.PI / 2,
      centerAngle: (categoryStartAngle + categoryAngleSpan / 2) - Math.PI / 2,
    });
    
    categoryStartAngle += categoryAngleSpan;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        {itemAngles.map((angleData) => {
          const category = categories[angleData.categoryIndex];
          const item = category?.items?.[angleData.itemIndex];

          if (!item) {
            return null;
          }

          const gradient = resolveGradientForStatus(item.status, gradientSettings);
          const startColor = isHexColor(gradient.start) ? gradient.start : fallbackGradient.start;
          const endColor = isHexColor(gradient.end) ? gradient.end : fallbackGradient.end;
          const midColor = mixColors(startColor, endColor, 0.5);
          const gradientId = `item-gradient-${angleData.categoryId}-${angleData.itemId}`;
          const innerPoint = {
            x: center + centerRadius * Math.cos(angleData.centerAngle),
            y: center + centerRadius * Math.sin(angleData.centerAngle),
          };
          const outerPoint = {
            x: center + maxInnerRadius * Math.cos(angleData.centerAngle),
            y: center + maxInnerRadius * Math.sin(angleData.centerAngle),
          };

          return (
            <linearGradient
              key={gradientId}
              id={gradientId}
              x1={innerPoint.x}
              y1={innerPoint.y}
              x2={outerPoint.x}
              y2={outerPoint.y}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={startColor} stopOpacity="0.95" />
              <stop offset="60%" stopColor={midColor} stopOpacity="0.98" />
              <stop offset="100%" stopColor={endColor} stopOpacity="1" />
            </linearGradient>
          );
        })}
        
        {/* Text paths for curved category labels */}
        {categories.map((category, index) => {
          const angleData = categoryAngles[index];
          
          // Create an arc path for the text to follow
          // We'll create a path that spans slightly more than the category's arc
          const startAngle = angleData.startAngle;
          const endAngle = angleData.endAngle;
          const midAngle = angleData.centerAngle;
          
          // Determine if text should be flipped (upside down)
          let textAngle = (midAngle + Math.PI / 2) * 180 / Math.PI;
          const shouldFlip = textAngle > 90 && textAngle < 270;
          
          // Adjust radius based on position - bottom text lower, top text closer to center
          let midRadius = (categoryInnerRadius + categoryOuterRadius) / 2;
          if (textAngle >= 135 && textAngle <= 250) {
            // Bottom text - push further from center
            midRadius = categoryInnerRadius + (categoryOuterRadius - categoryInnerRadius) * 0.55;
          } else if (textAngle < 135 || textAngle > 250) {
            // Top text - pull closer to center
            midRadius = categoryInnerRadius + (categoryOuterRadius - categoryInnerRadius) * 0.35;
          }
          
          // Create arc path - if flipped, draw from end to start (counterclockwise)
          let pathStartAngle, pathEndAngle;
          if (shouldFlip) {
            pathStartAngle = endAngle;
            pathEndAngle = startAngle;
          } else {
            pathStartAngle = startAngle;
            pathEndAngle = endAngle;
          }
          
          const x1 = center + midRadius * Math.cos(pathStartAngle);
          const y1 = center + midRadius * Math.sin(pathStartAngle);
          const x2 = center + midRadius * Math.cos(pathEndAngle);
          const y2 = center + midRadius * Math.sin(pathEndAngle);
          
          const largeArcFlag = Math.abs(pathEndAngle - pathStartAngle) > Math.PI ? 1 : 0;
          const sweepFlag = shouldFlip ? 0 : 1;
          
          const arcPath = `M ${x1} ${y1} A ${midRadius} ${midRadius} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;
          
          return (
            <path
              key={`text-path-${index}`}
              id={`text-path-${index}`}
              d={arcPath}
              fill="none"
            />
          );
        })}
      </defs>

      {/* Background */}
      <circle cx={center} cy={center} r={labelRadius + 80} fill="#ffffff" />
      
      {/* Radial grid lines */}
      {itemAngles.map((angle, i) => {
        const x1 = center + centerRadius * Math.cos(angle.startAngle);
        const y1 = center + centerRadius * Math.sin(angle.startAngle);
        const x2 = center + maxInnerRadius * Math.cos(angle.startAngle);
        const y2 = center + maxInnerRadius * Math.sin(angle.startAngle);
        
        return (
          <line
            key={`grid-line-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#e0e0e0"
            strokeWidth="1"
          />
        );
      })}

      {/* Item segments with status colors */}
      {itemAngles.map((angleData, index) => {
        const category = categories[angleData.categoryIndex];
        const item = category.items[angleData.itemIndex];
        const gradientId = `item-gradient-${angleData.categoryId}-${angleData.itemId}`;
        
        const path = createSegmentPath(
          angleData.startAngle, 
          angleData.endAngle, 
          centerRadius, 
          maxInnerRadius
        );

        return (
          <path
            key={`item-${index}`}
            d={path}
            fill={`url(#${gradientId})`}
            stroke="#ffffff"
            strokeWidth="2"
          />
        );
      })}

      {/* Category outer ring */}
      {categories.map((category, index) => {
        const angleData = categoryAngles[index];
        const path = createSegmentPath(
          angleData.startAngle,
          angleData.endAngle,
          categoryInnerRadius,
          categoryOuterRadius
        );

        return (
          <path
            key={`category-${index}`}
            d={path}
            fill="none"
            stroke={category.color}
            strokeWidth="3"
          />
        );
      })}

      {/* Category labels on outer ring - curved along circle */}
      {categories.map((category, index) => {
        return (
          <text
            key={`category-label-${index}`}
            fill={categoryLabelColor}
            fontSize={categoryFontSize}
            fontWeight="700"
            style={{ userSelect: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            <textPath
              href={`#text-path-${index}`}
              startOffset="50%"
              textAnchor="middle"
            >
              {category.name}
            </textPath>
          </text>
        );
      })}

      {/* Item labels */}
      {itemAngles.map((angleData, index) => {
        const category = categories[angleData.categoryIndex];
        const item = category.items[angleData.itemIndex];
        
        // Position closer to center - at 70% of the inner radius
        const labelRadiusPosition = maxInnerRadius * 0.7;
        const labelX = center + labelRadiusPosition * Math.cos(angleData.centerAngle);
        const labelY = center + labelRadiusPosition * Math.sin(angleData.centerAngle);

        // Always use middle anchor for horizontal text
        const textAnchor = 'middle';

        // Wrap text if too long
        const maxCharsPerLine = 15;
        const words = item.name.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
          const testLine = currentLine ? currentLine + ' ' + word : word;
          if (testLine.length > maxCharsPerLine && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) {
          lines.push(currentLine);
        }

        const startY = labelY - ((lines.length - 1) * itemLineHeight) / 2;

        return (
          <g key={`item-label-${index}`}>
            {lines.map((line, i) => (
              <text
                key={i}
                x={labelX}
                y={startY + i * itemLineHeight}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize={itemFontSize}
                fontWeight="600"
                style={{ userSelect: 'none' }}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}

      {/* Center circle */}
      <circle cx={center} cy={center} r={centerRadius} fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
    </svg>
  );
};

export default WheelOfLife;
