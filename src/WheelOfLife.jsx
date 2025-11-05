import React from 'react';

const defaultColorSettings = {
  low: { max: 4, color: '#ef4444' },
  medium: { max: 5, color: '#f59e0b' },
  high: { color: '#22c55e' },
};

const hexToRgb = (hex) => {
  if (typeof hex !== 'string') {
    return { r: 239, g: 68, b: 68 };
  }

  let normalized = hex.replace('#', '').trim();

  if (normalized.length === 3) {
    normalized = normalized
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const parsed = Number.parseInt(normalized, 16);
  if (Number.isNaN(parsed)) {
    return { r: 239, g: 68, b: 68 };
  }

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
};

const mixWithWhite = (hex, amount) => {
  const safeAmount = Math.min(Math.max(amount, 0), 1);
  const { r, g, b } = hexToRgb(hex);

  const mixChannel = (channel) => Math.round(channel + (255 - channel) * safeAmount);

  return `rgb(${mixChannel(r)}, ${mixChannel(g)}, ${mixChannel(b)})`;
};

const resolveBaseColor = (rating, colorSettings) => {
  const merged = { ...defaultColorSettings, ...colorSettings };
  const lowMax = merged.low?.max ?? defaultColorSettings.low.max;
  const mediumMax = merged.medium?.max ?? defaultColorSettings.medium.max;
  const lowColor = merged.low?.color ?? defaultColorSettings.low.color;
  const mediumColor = merged.medium?.color ?? defaultColorSettings.medium.color;
  const highColor = merged.high?.color ?? defaultColorSettings.high.color;

  if (rating <= lowMax) {
    return lowColor;
  }

  if (rating <= mediumMax) {
    return mediumColor;
  }

  return highColor;
};

const WheelOfLife = ({ categories, maxScore = 10, colorSettings = defaultColorSettings }) => {
  const size = 900;
  const center = size / 2;
  const numCategories = categories.length;
  
  // Calculate total items across all categories
  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  
  // Radius configuration
  const centerRadius = size * 0.08;
  const maxInnerRadius = size * 0.32;
  const categoryRingWidth = size * 0.08;
  const categoryInnerRadius = maxInnerRadius + 10;
  const categoryOuterRadius = categoryInnerRadius + categoryRingWidth;
  const labelRadius = categoryOuterRadius + 50;

  // Function to get color based on rating for items
  const getItemColor = (rating, level, maxLevel) => {
    if (rating <= 0) {
      return 'rgba(226, 232, 240, 0.75)';
    }

    const baseColor = resolveBaseColor(rating, colorSettings);
    if (maxLevel <= 1) {
      return mixWithWhite(baseColor, 0.16);
    }

    const progress = level / (maxLevel - 1);
    const lightenAmount = 0.06 + progress * 0.18;
    return mixWithWhite(baseColor, lightenAmount);
  };

  // Calculate angle for each item
  let itemAngles = [];
  let currentAngle = 0;
  
  categories.forEach((category, catIndex) => {
    const itemsInCategory = category.items.length;
    const anglePerItem = (2 * Math.PI) / totalItems;
    
    category.items.forEach((item, itemIndex) => {
      itemAngles.push({
        categoryIndex: catIndex,
        itemIndex,
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
    const categoryAngleSpan = (2 * Math.PI * itemsInCategory) / totalItems;
    
    categoryAngles.push({
      startAngle: categoryStartAngle - Math.PI / 2,
      endAngle: (categoryStartAngle + categoryAngleSpan) - Math.PI / 2,
      centerAngle: (categoryStartAngle + categoryAngleSpan / 2) - Math.PI / 2,
    });
    
    categoryStartAngle += categoryAngleSpan;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background */}
      <circle cx={center} cy={center} r={labelRadius + 80} fill="#ffffff" />
      
      {/* Concentric grid circles for items */}
      {[...Array(maxScore)].map((_, i) => {
        const radius = centerRadius + ((maxInnerRadius - centerRadius) / maxScore) * (i + 1);
        return (
          <circle
            key={`grid-${i}`}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="1"
          />
        );
      })}

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

      {/* Item segments with ratings */}
      {itemAngles.map((angleData, index) => {
        const category = categories[angleData.categoryIndex];
        const item = category.items[angleData.itemIndex];
        const rating = item.rating;
        const numBars = Math.min(rating, maxScore);
        
        return (
          <g key={`item-${index}`}>
            {[...Array(numBars)].map((_, level) => {
              const innerRadius = centerRadius + ((maxInnerRadius - centerRadius) / maxScore) * level;
              const outerRadius = centerRadius + ((maxInnerRadius - centerRadius) / maxScore) * (level + 1);
              const path = createSegmentPath(angleData.startAngle, angleData.endAngle, innerRadius, outerRadius);
              const color = getItemColor(rating, level, numBars);

              return (
                <path
                  key={`bar-${index}-${level}`}
                  d={path}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              );
            })}
          </g>
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
            fill={category.color}
            stroke="#ffffff"
            strokeWidth="3"
          />
        );
      })}

      {/* Category labels on outer ring */}
      {categories.map((category, index) => {
        const angleData = categoryAngles[index];
        const midRadius = (categoryInnerRadius + categoryOuterRadius) / 2;
        const x = center + midRadius * Math.cos(angleData.centerAngle);
        const y = center + midRadius * Math.sin(angleData.centerAngle);
        
        // Calculate rotation angle for text
        let textAngle = (angleData.centerAngle + Math.PI / 2) * 180 / Math.PI;
        
        // Flip text if it would be upside down
        if (textAngle > 90 && textAngle < 270) {
          textAngle += 180;
        }

        return (
          <text
            key={`category-label-${index}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ffffff"
            fontSize="16"
            fontWeight="700"
            transform={`rotate(${textAngle}, ${x}, ${y})`}
            style={{ userSelect: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            {category.name}
          </text>
        );
      })}

      {/* Item labels */}
      {itemAngles.map((angleData, index) => {
        const category = categories[angleData.categoryIndex];
        const item = category.items[angleData.itemIndex];
        const rating = Math.max(0, Math.min(item.rating, maxScore));

        const ringStep = (maxInnerRadius - centerRadius) / maxScore;
        const barOuterRadius = rating > 0 ? centerRadius + ringStep * rating : centerRadius;
        const connectorStartRadius = Math.min(barOuterRadius, maxInnerRadius);
        const connectorEndRadius = labelRadius - 12;
        
        const connectorStartX = center + connectorStartRadius * Math.cos(angleData.centerAngle);
        const connectorStartY = center + connectorStartRadius * Math.sin(angleData.centerAngle);
        const connectorEndX = center + connectorEndRadius * Math.cos(angleData.centerAngle);
        const connectorEndY = center + connectorEndRadius * Math.sin(angleData.centerAngle);
        
        const labelX = center + labelRadius * Math.cos(angleData.centerAngle);
        const labelY = center + labelRadius * Math.sin(angleData.centerAngle);

        // Determine text anchor based on position
        let textAnchor = 'middle';
        const angleInDegrees = ((angleData.centerAngle + Math.PI / 2) * 180) / Math.PI % 360;

        if (angleInDegrees > 10 && angleInDegrees < 170) {
          textAnchor = 'start';
        } else if (angleInDegrees > 190 && angleInDegrees < 350) {
          textAnchor = 'end';
        }

        return (
          <g key={`item-label-${index}`}>
            <line
              x1={connectorStartX}
              y1={connectorStartY}
              x2={connectorEndX}
              y2={connectorEndY}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fill="#333"
              fontSize="13"
              fontWeight="500"
              style={{ userSelect: 'none' }}
            >
              {item.name}
            </text>
          </g>
        );
      })}

      {/* Center circle with label */}
      <circle cx={center} cy={center} r={centerRadius} fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#1e293b"
        fontSize="16"
        fontWeight="700"
        style={{ userSelect: 'none' }}
      >
        WHEEL OF LIFE
      </text>
    </svg>
  );
};

export default WheelOfLife;
