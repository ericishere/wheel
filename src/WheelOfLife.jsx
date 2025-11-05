import React from 'react';

const WheelOfLife = ({ categories }) => {
  const size = 900;
  const center = size / 2;
  const numCategories = categories.length;
  
  // Calculate total items across all categories
  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  
  // Radius configuration
  const centerRadius = size * 0.08;
  const itemOuterRadius = size * 0.32;
  const categoryRingWidth = size * 0.08;
  const categoryInnerRadius = itemOuterRadius + 10;
  const categoryOuterRadius = categoryInnerRadius + categoryRingWidth;

  // Calculate angle for each item (equal sizing)
  let itemAngles = [];
  let currentAngle = 0;
  const anglePerItem = (2 * Math.PI) / totalItems;
  
  categories.forEach((category, catIndex) => {
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
      <circle cx={center} cy={center} r={categoryOuterRadius + 20} fill="#ffffff" />

      {/* Item segments (equal length, colored fills) */}
      {itemAngles.map((angleData, index) => {
        const category = categories[angleData.categoryIndex];
        const item = category.items[angleData.itemIndex];
        const path = createSegmentPath(angleData.startAngle, angleData.endAngle, centerRadius, itemOuterRadius);

        // Calculate text position (near outer edge of inner circle - more space)
        const textRadius = itemOuterRadius - 20; // Position near outer edge
        const textX = center + textRadius * Math.cos(angleData.centerAngle);
        const textY = center + textRadius * Math.sin(angleData.centerAngle);
        
        // Calculate rotation angle for text
        let textAngle = (angleData.centerAngle + Math.PI / 2) * 180 / Math.PI;
        
        // Flip text if it would be upside down
        if (textAngle > 90 && textAngle < 270) {
          textAngle += 180;
        }

        return (
          <g key={`item-${index}`}>
            <path
              d={path}
              fill={item.color}
              stroke="#ffffff"
              strokeWidth="3"
            />
            <text
              x={textX}
              y={textY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#333333"
              fontSize="12"
              fontWeight="600"
              transform={`rotate(${textAngle}, ${textX}, ${textY})`}
              style={{ userSelect: 'none' }}
            >
              {item.name}
            </text>
          </g>
        );
      })}

      {/* Category outer ring (hollow with colored border) */}
      {categories.map((category, index) => {
        const angleData = categoryAngles[index];
        const path = createSegmentPath(
          angleData.startAngle,
          angleData.endAngle,
          categoryInnerRadius,
          categoryOuterRadius
        );

        // Calculate text position
        const midRadius = (categoryInnerRadius + categoryOuterRadius) / 2;
        const textX = center + midRadius * Math.cos(angleData.centerAngle);
        const textY = center + midRadius * Math.sin(angleData.centerAngle);
        
        // Calculate rotation angle for text
        let textAngle = (angleData.centerAngle + Math.PI / 2) * 180 / Math.PI;
        
        // Flip text if it would be upside down
        if (textAngle > 90 && textAngle < 270) {
          textAngle += 180;
        }

        return (
          <g key={`category-${index}`}>
            <path
              d={path}
              fill="#ffffff"
              stroke={category.color}
              strokeWidth="5"
            />
            <text
              x={textX}
              y={textY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={category.fontColor || '#000000'}
              fontSize="16"
              fontWeight="700"
              transform={`rotate(${textAngle}, ${textX}, ${textY})`}
              style={{ userSelect: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              {category.name}
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
