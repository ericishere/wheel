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
  const size = 800;
  const center = size / 2;
  const numCategories = categories.length;
  const categoryAnglePerSegment = (2 * Math.PI) / numCategories;
  
  // Calculate all items to determine angles
  const allItems = [];
  categories.forEach((category, catIndex) => {
    category.items.forEach((item) => {
      allItems.push({ ...item, categoryIndex: catIndex, categoryColor: category.color, categoryName: category.name });
    });
  });
  
  const totalItems = allItems.length;
  const itemAnglePerSegment = totalItems > 0 ? (2 * Math.PI) / totalItems : 0;
  
  // Radius calculations
  const categoryOuterRadius = size * 0.45; // Outer circle for categories
  const categoryInnerRadius = size * 0.35; // Inner boundary for categories
  const itemOuterRadius = size * 0.33; // Outer boundary for items
  const itemInnerRadius = size * 0.1; // Inner boundary for items
  const categoryTextRadius = categoryOuterRadius + 60;
  const itemTextRadius = itemOuterRadius + 40;

  // Function to get color based on rating, using category color as base
  const getItemColor = (rating, level, maxLevel, categoryColor) => {
    if (rating <= 0) {
      return 'rgba(226, 232, 240, 0.75)';
    }

    // Use category color instead of threshold-based colors
    const baseColor = categoryColor;
    if (maxLevel <= 1) {
      return mixWithWhite(baseColor, 0.16);
    }

    const progress = level / (maxLevel - 1);
    const lightenAmount = 0.06 + progress * 0.18;
    return mixWithWhite(baseColor, lightenAmount);
  };

  // Function to create a segment path with custom angles
  const createSegmentPathCustom = (startAngle, endAngle, innerRadius, outerRadius) => {
    const x1 = center + innerRadius * Math.cos(startAngle);
    const y1 = center + innerRadius * Math.sin(startAngle);
    const x2 = center + outerRadius * Math.cos(startAngle);
    const y2 = center + outerRadius * Math.sin(startAngle);
    const x3 = center + outerRadius * Math.cos(endAngle);
    const y3 = center + outerRadius * Math.sin(endAngle);
    const x4 = center + innerRadius * Math.cos(endAngle);
    const y4 = center + innerRadius * Math.sin(endAngle);

    const angleDiff = endAngle - startAngle;
    const largeArcFlag = angleDiff > Math.PI ? 1 : 0;

    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
      Z
    `;
  };

  // Function to create a segment path (for evenly distributed items)
  const createSegmentPath = (segmentIndex, innerRadius, outerRadius, anglePerSegment) => {
    const startAngle = segmentIndex * anglePerSegment - Math.PI / 2;
    const endAngle = (segmentIndex + 1) * anglePerSegment - Math.PI / 2;
    return createSegmentPathCustom(startAngle, endAngle, innerRadius, outerRadius);
  };

  // Function to get text position
  const getTextPosition = (angle, textRadius) => {
    const x = center + textRadius * Math.cos(angle);
    const y = center + textRadius * Math.sin(angle);
    return { x, y, angle };
  };

  // Calculate item positions within categories
  let itemIndex = 0;
  const itemSegments = [];
  categories.forEach((category, catIndex) => {
    const categoryStartAngle = catIndex * categoryAnglePerSegment - Math.PI / 2;
    const categoryEndAngle = (catIndex + 1) * categoryAnglePerSegment - Math.PI / 2;
    const categoryAngleRange = categoryEndAngle - categoryStartAngle;
    const numItemsInCategory = category.items.length;
    const itemAnglePerSegment = numItemsInCategory > 0 ? categoryAngleRange / numItemsInCategory : 0;
    
    category.items.forEach((item, itemLocalIndex) => {
      const itemStartAngle = categoryStartAngle + itemLocalIndex * itemAnglePerSegment;
      const itemEndAngle = categoryStartAngle + (itemLocalIndex + 1) * itemAnglePerSegment;
      const itemCenterAngle = (itemStartAngle + itemEndAngle) / 2;
      
      itemSegments.push({
        ...item,
        categoryIndex: catIndex,
        categoryColor: category.color,
        categoryName: category.name,
        itemIndex: itemIndex++,
        itemStartAngle,
        itemEndAngle,
        itemCenterAngle,
        itemAnglePerSegment
      });
    });
  });

  return (
    <svg width={size*2} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background */}
      <circle cx={center} cy={center} r={categoryOuterRadius + 50} fill="#ffffff" />
      
      {/* Grid circles for items */}
      {[...Array(maxScore)].map((_, i) => {
        const radius = itemInnerRadius + ((itemOuterRadius - itemInnerRadius) / maxScore) * (i + 1);
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

      {/* Category outer circle grid */}
      <circle
        cx={center}
        cy={center}
        r={categoryInnerRadius}
        fill="none"
        stroke="#d0d0d0"
        strokeWidth="2"
      />
      <circle
        cx={center}
        cy={center}
        r={categoryOuterRadius}
        fill="none"
        stroke="#d0d0d0"
        strokeWidth="2"
      />

      {/* Grid lines for items (radial) */}
      {itemSegments.map((itemSegment, i) => {
        const angle = itemSegment.itemStartAngle;
        const x1 = center + itemInnerRadius * Math.cos(angle);
        const y1 = center + itemInnerRadius * Math.sin(angle);
        const x2 = center + itemOuterRadius * Math.cos(angle);
        const y2 = center + itemOuterRadius * Math.sin(angle);
        
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
      
      {/* Draw closing line for last item in each category */}
      {categories.map((category, catIndex) => {
        const categoryEndAngle = (catIndex + 1) * categoryAnglePerSegment - Math.PI / 2;
        const x1 = center + itemInnerRadius * Math.cos(categoryEndAngle);
        const y1 = center + itemInnerRadius * Math.sin(categoryEndAngle);
        const x2 = center + itemOuterRadius * Math.cos(categoryEndAngle);
        const y2 = center + itemOuterRadius * Math.sin(categoryEndAngle);
        
        return (
          <line
            key={`category-closing-line-${catIndex}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#e0e0e0"
            strokeWidth="1"
          />
        );
      })}

      {/* Category radial lines */}
      {categories.map((_, i) => {
        const angle = i * categoryAnglePerSegment - Math.PI / 2;
        const x1 = center + categoryInnerRadius * Math.cos(angle);
        const y1 = center + categoryInnerRadius * Math.sin(angle);
        const x2 = center + categoryOuterRadius * Math.cos(angle);
        const y2 = center + categoryOuterRadius * Math.sin(angle);
        
        return (
          <line
            key={`category-line-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#d0d0d0"
            strokeWidth="2"
          />
        );
      })}

      {/* Draw category segments (outer circle) */}
      {categories.map((category, catIndex) => {
        const categoryColor = category.color;
        const lightCategoryColor = mixWithWhite(categoryColor, 0.3);
        
        return (
          <g key={`category-${catIndex}`}>
            <path
              d={createSegmentPath(catIndex, categoryInnerRadius, categoryOuterRadius, categoryAnglePerSegment)}
              fill={lightCategoryColor}
              stroke="#ffffff"
              strokeWidth="2"
            />
          </g>
        );
      })}

      {/* Draw item segments with ratings */}
      {itemSegments.map((itemSegment) => {
        const { itemIndex: segIndex, rating, categoryColor, itemStartAngle, itemEndAngle } = itemSegment;
        const numBars = Math.min(rating, maxScore);
        
        return (
          <g key={`item-segment-${segIndex}`}>
            {/* Draw filled bars based on rating */}
            {[...Array(numBars)].map((_, level) => {
              const innerRadius = itemInnerRadius + ((itemOuterRadius - itemInnerRadius) / maxScore) * level;
              const outerRadius = itemInnerRadius + ((itemOuterRadius - itemInnerRadius) / maxScore) * (level + 1);
              const path = createSegmentPathCustom(itemStartAngle, itemEndAngle, innerRadius, outerRadius);
              const color = getItemColor(rating, level, numBars, categoryColor);

              return (
                <path
                  key={`bar-${segIndex}-${level}`}
                  d={path}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              );
            })}
          </g>
        );
      })}

      {/* Category labels */}
      {categories.map((category, catIndex) => {
        const categoryCenterAngle = (catIndex + 0.5) * categoryAnglePerSegment - Math.PI / 2;
        const { x, y, angle } = getTextPosition(categoryCenterAngle, categoryTextRadius);
        
        // Determine text anchor based on position
        let textAnchor = 'middle';
        const angleInDegrees = ((angle + Math.PI / 2) * 180) / Math.PI % 360;

        if (angleInDegrees > 10 && angleInDegrees < 170) {
          textAnchor = 'start';
        } else if (angleInDegrees > 190 && angleInDegrees < 350) {
          textAnchor = 'end';
        }

        return (
          <g key={`category-label-${catIndex}`}>
            <text
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fill={category.color}
              fontSize="18"
              fontWeight="600"
              style={{ userSelect: 'none' }}
            >
              {category.name}
            </text>
          </g>
        );
      })}

      {/* Item labels */}
      {itemSegments.map((itemSegment) => {
        const { itemIndex: segIndex, name, rating, categoryColor, itemCenterAngle } = itemSegment;
        const { x, y, angle } = getTextPosition(itemCenterAngle, itemTextRadius);
        const boundedRating = Math.max(0, Math.min(rating ?? 0, maxScore));

        const ringStep = (itemOuterRadius - itemInnerRadius) / maxScore;
        const barOuterRadius = boundedRating > 0 ? itemInnerRadius + ringStep * boundedRating : itemInnerRadius;
        const connectorStartRadius = Math.min(barOuterRadius, itemOuterRadius);
        const connectorEndRadius = itemTextRadius - 12;
        const connectorStartX = center + connectorStartRadius * Math.cos(angle);
        const connectorStartY = center + connectorStartRadius * Math.sin(angle);
        const connectorEndX = center + connectorEndRadius * Math.cos(angle);
        const connectorEndY = center + connectorEndRadius * Math.sin(angle);

        // Determine text anchor based on position
        let textAnchor = 'middle';
        const angleInDegrees = ((angle + Math.PI / 2) * 180) / Math.PI % 360;

        if (angleInDegrees > 10 && angleInDegrees < 170) {
          textAnchor = 'start';
        } else if (angleInDegrees > 190 && angleInDegrees < 350) {
          textAnchor = 'end';
        }

        return (
          <g key={`item-label-${segIndex}`}>
            <line
              x1={connectorStartX}
              y1={connectorStartY}
              x2={connectorEndX}
              y2={connectorEndY}
              stroke={categoryColor}
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.5"
            />
            <text
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fill="#333"
              fontSize="12"
              fontWeight="500"
              style={{ userSelect: 'none' }}
            >
              {name}
            </text>
          </g>
        );
      })}

      {/* Center circle */}
      <circle cx={center} cy={center} r={itemInnerRadius} fill="#ffffff" stroke="#e0e0e0" strokeWidth="2" />
    </svg>
  );
};

export default WheelOfLife;
