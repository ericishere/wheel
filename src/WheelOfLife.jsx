import React from 'react';

const WheelOfLife = ({ categories }) => {
  const size = 800;
  const center = size / 2;
  const numCategories = categories.length;
  const categoryAnglePerSegment = (2 * Math.PI) / numCategories;
  
  // Radius calculations
  const categoryOuterRadius = size * 0.45; // Outer circle for categories
  const categoryInnerRadius = size * 0.35; // Inner boundary for categories
  const itemOuterRadius = size * 0.33; // Outer boundary for items (same for all)
  const itemInnerRadius = size * 0.1; // Inner boundary for items
  const categoryTextRadius = categoryOuterRadius + 60;

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

      {/* Draw category segments (outer circle) - Hollow with white fill and colored frame */}
      {categories.map((category, catIndex) => {
        const categoryColor = category.color || "#3b82f6";
        
        return (
          <g key={`category-${catIndex}`}>
            <path
              d={createSegmentPathCustom(
                catIndex * categoryAnglePerSegment - Math.PI / 2,
                (catIndex + 1) * categoryAnglePerSegment - Math.PI / 2,
                categoryInnerRadius,
                categoryOuterRadius
              )}
              fill="#ffffff"
              stroke={categoryColor}
              strokeWidth="3"
            />
          </g>
        );
      })}

      {/* Draw item segments - all same size, only color differs */}
      {itemSegments.map((itemSegment) => {
        const { itemIndex: segIndex, color, itemStartAngle, itemEndAngle } = itemSegment;
        const itemColor = color || "#3b82f6";
        
        return (
          <g key={`item-segment-${segIndex}`}>
            <path
              d={createSegmentPathCustom(itemStartAngle, itemEndAngle, itemInnerRadius, itemOuterRadius)}
              fill={itemColor}
              stroke="#ffffff"
              strokeWidth="1"
            />
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

        const fontColor = category.fontColor || category.color || "#3b82f6";

        return (
          <g key={`category-label-${catIndex}`}>
            <text
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fill={fontColor}
              fontSize="18"
              fontWeight="600"
              style={{ userSelect: 'none' }}
            >
              {category.name}
            </text>
          </g>
        );
      })}

      {/* Item labels - inside each segment */}
      {itemSegments.map((itemSegment) => {
        const { itemIndex: segIndex, name, itemCenterAngle } = itemSegment;
        // Position text inside the segment, closer to center
        const textRadius = (itemInnerRadius + itemOuterRadius) / 2;
        const { x, y, angle } = getTextPosition(itemCenterAngle, textRadius);

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
            <text
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fill="#ffffff"
              fontSize="11"
              fontWeight="600"
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
