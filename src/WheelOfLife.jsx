import React from 'react';

const WheelOfLife = ({ items, ratings, maxScore = 10 }) => {
  const size = 800;
  const center = size / 2;
  const numSegments = items.length;
  const anglePerSegment = (2 * Math.PI) / numSegments;
  const maxRadius = size * 0.4;
  const minRadius = size * 0.1;
  const textRadius = maxRadius + 60;

  // Function to get color based on rating
  const getColor = (rating, level, maxLevel) => {
    let baseHue, baseSaturation, baseLightness;
    
    if (rating < 5) {
      // Red for low ratings
      baseHue = 0;
      baseSaturation = 70;
      baseLightness = 60;
    } else if (rating === 5) {
      // Yellow for medium ratings
      baseHue = 45;
      baseSaturation = 80;
      baseLightness = 60;
    } else {
      // Green for high ratings
      baseHue = 120;
      baseSaturation = 60;
      baseLightness = 60;
    }

    // Inner bars should be darker (less lightness)
    // level 0 is innermost, maxLevel-1 is outermost
    const lightnessAdjustment = (level / (maxLevel - 1)) * 15; // 0 to 15% increase
    const adjustedLightness = baseLightness - 15 + lightnessAdjustment;

    return `hsl(${baseHue}, ${baseSaturation}%, ${adjustedLightness}%)`;
  };

  // Function to create a segment path
  const createSegmentPath = (segmentIndex, innerRadius, outerRadius) => {
    const startAngle = segmentIndex * anglePerSegment - Math.PI / 2;
    const endAngle = (segmentIndex + 1) * anglePerSegment - Math.PI / 2;

    const x1 = center + innerRadius * Math.cos(startAngle);
    const y1 = center + innerRadius * Math.sin(startAngle);
    const x2 = center + outerRadius * Math.cos(startAngle);
    const y2 = center + outerRadius * Math.sin(startAngle);
    const x3 = center + outerRadius * Math.cos(endAngle);
    const y3 = center + outerRadius * Math.sin(endAngle);
    const x4 = center + innerRadius * Math.cos(endAngle);
    const y4 = center + innerRadius * Math.sin(endAngle);

    const largeArcFlag = anglePerSegment > Math.PI ? 1 : 0;

    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
      Z
    `;
  };

  // Function to get text position and rotation
  const getTextPosition = (segmentIndex) => {
    // Center of the segment
    const angle = (segmentIndex + 0.5) * anglePerSegment - Math.PI / 2;
    const x = center + textRadius * Math.cos(angle);
    const y = center + textRadius * Math.sin(angle);

    return { x, y, angle };
  };

  return (
    <svg width={size*2} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background */}
      <circle cx={center} cy={center} r={maxRadius + 50} fill="#ffffff" />
      
      {/* Grid circles */}
      {[...Array(maxScore)].map((_, i) => {
        const radius = minRadius + ((maxRadius - minRadius) / maxScore) * (i + 1);
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

      {/* Grid lines (radial) */}
      {items.map((_, i) => {
        const angle = i * anglePerSegment - Math.PI / 2;
        const x1 = center + minRadius * Math.cos(angle);
        const y1 = center + minRadius * Math.sin(angle);
        const x2 = center + maxRadius * Math.cos(angle);
        const y2 = center + maxRadius * Math.sin(angle);
        
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

      {/* Segments with ratings */}
      {items.map((item, segmentIndex) => {
        const rating = ratings[segmentIndex];
        const numBars = Math.min(rating, maxScore);
        
        return (
          <g key={`segment-${segmentIndex}`}>
            {/* Draw filled bars based on rating */}
            {[...Array(numBars)].map((_, level) => {
              const innerRadius = minRadius + ((maxRadius - minRadius) / maxScore) * level;
              const outerRadius = minRadius + ((maxRadius - minRadius) / maxScore) * (level + 1);
              const path = createSegmentPath(segmentIndex, innerRadius, outerRadius);
              const color = getColor(rating, level, numBars);

              return (
                <path
                  key={`bar-${segmentIndex}-${level}`}
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

      {/* Labels */}
      {items.map((item, index) => {
        const { x, y } = getTextPosition(index);
        const angle = (index + 0.5) * anglePerSegment - Math.PI / 2;
        
        // Determine text anchor based on position
        let textAnchor = 'middle';
        const angleInDegrees = ((angle + Math.PI / 2) * 180 / Math.PI) % 360;
        
        if (angleInDegrees > 10 && angleInDegrees < 170) {
          textAnchor = 'start';
        } else if (angleInDegrees > 190 && angleInDegrees < 350) {
          textAnchor = 'end';
        }

        return (
          <text
            key={`label-${index}`}
            x={x}
            y={y}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fill="#333"
            fontSize="14"
            fontWeight="500"
            style={{ userSelect: 'none' }}
          >
            {item}
          </text>
        );
      })}

      {/* Center circle */}
      <circle cx={center} cy={center} r={minRadius} fill="#ffffff" stroke="#e0e0e0" strokeWidth="2" />
    </svg>
  );
};

export default WheelOfLife;
