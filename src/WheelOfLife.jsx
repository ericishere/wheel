import React from 'react';

const defaultColorSettings = {
  low: '#ef4444',
  mid: '#f59e0b',
  high: '#22c55e',
};

const WheelOfLife = ({ categories, colorSettings = defaultColorSettings }) => {
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

  // Function to get color based on status
  const getItemColor = (status) => {
    const colors = { ...defaultColorSettings, ...colorSettings };
    
    if (status === 'low') return colors.low;
    if (status === 'mid') return colors.mid;
    if (status === 'high') return colors.high;
    
    return '#e2e8f0'; // default gray for undefined status
  };

  // Calculate angle for each item
  let itemAngles = [];
  let currentAngle = 0;
  
  categories.forEach((category, catIndex) => {
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
        const color = getItemColor(item.status);
        
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
            fill={color}
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

        const lineHeight = 11;
        const startY = labelY - ((lines.length - 1) * lineHeight) / 2;

        return (
          <g key={`item-label-${index}`}>
            {lines.map((line, i) => (
              <text
                key={i}
                x={labelX}
                y={startY + i * lineHeight}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize="10"
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
