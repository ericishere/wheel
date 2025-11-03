const defaultItems = [
  "Data Loss Prevention",
  "Vulnerability Management",
  "Governance Risk Verification",
  "Architecture",
  "Penetration Test",
  "Project Management",
  "Incident Response",
  "Engineering",
  "DevSecOps",
  "Training",
  "Security Operation Center"
];

const defaultRatings = [6, 6, 5, 4, 5, 6, 6, 4, 5, 4, 5];

const state = {
  items: [...defaultItems],
  ratings: [...defaultRatings],
  maxRating: Math.max(...defaultRatings),
  targetRating: 5,
  innerGapPercent: 18,
  segmentGapDegrees: 1.5,
  lightenStep: 15,
  showGuides: true,
  showScale: true,
  colors: {
    low: "#e74c3c",
    target: "#f1c40f",
    high: "#2ecc71"
  }
};

const elements = {
  maxRating: document.getElementById("max-rating"),
  innerGap: document.getElementById("inner-gap"),
  segmentGap: document.getElementById("segment-gap"),
  lightenStep: document.getElementById("lighten-step"),
  showGuides: document.getElementById("show-guides"),
  showScale: document.getElementById("show-scale"),
  targetRating: document.getElementById("target-rating"),
  colorLow: document.getElementById("color-low"),
  colorTarget: document.getElementById("color-target"),
  colorHigh: document.getElementById("color-high"),
  itemsList: document.getElementById("items-list"),
  addItem: document.getElementById("add-item"),
  wheelCanvas: document.getElementById("wheel-canvas"),
  wheelWrapper: document.getElementById("wheel-wrapper"),
  fullscreenBtn: document.getElementById("fullscreen-btn"),
  downloadBtn: document.getElementById("download-btn"),
  rangeValueInner: document.querySelector('[data-for="inner-gap"]'),
  rangeValueSegment: document.querySelector('[data-for="segment-gap"]'),
  rangeValueLighten: document.querySelector('[data-for="lighten-step"]'),
  lowThresholdDisplay: document.getElementById("low-threshold-display"),
  targetThresholdDisplay: document.getElementById("target-threshold-display"),
  highThresholdDisplay: document.getElementById("high-threshold-display")
};

elements.maxRating.value = state.maxRating;
elements.targetRating.value = state.targetRating;
elements.targetRating.max = String(state.maxRating);

document.addEventListener("DOMContentLoaded", () => {
  buildItemsList();
  updateThresholdLabels();
  attachEventListeners();
  drawWheel();
  window.addEventListener("resize", () => {
    window.requestAnimationFrame(drawWheel);
  });
});

function buildItemsList() {
  elements.itemsList.innerHTML = "";
  state.items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "item-row";
    row.dataset.index = String(index);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = item;
    nameInput.placeholder = "Item label";
    nameInput.addEventListener("input", () => {
      state.items[index] = nameInput.value;
      drawWheel();
    });

    const ratingInput = document.createElement("input");
    ratingInput.type = "number";
    ratingInput.min = "0";
    ratingInput.max = String(state.maxRating);
    ratingInput.value = state.ratings[index] ?? 0;
    ratingInput.addEventListener("input", () => {
      const parsed = clamp(Number(ratingInput.value), 0, state.maxRating);
      state.ratings[index] = parsed;
      ratingInput.value = String(parsed);
      drawWheel();
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeItem(index));

    row.append(nameInput, ratingInput, removeBtn);
    elements.itemsList.appendChild(row);
  });
}

function attachEventListeners() {
  elements.addItem.addEventListener("click", () => {
    state.items.push(`Item ${state.items.length + 1}`);
    state.ratings.push(Math.min( Math.round(state.maxRating / 2), state.maxRating));
    buildItemsList();
    drawWheel();
  });

  elements.maxRating.addEventListener("input", () => {
    const newMax = Math.max(1, Number(elements.maxRating.value) || 1);
    state.maxRating = newMax;
    elements.targetRating.max = String(state.maxRating);
    state.targetRating = clamp(Number(elements.targetRating.value) || state.targetRating, 0, state.maxRating);
    elements.targetRating.value = String(state.targetRating);
    clampRatings();
    updateThresholdLabels();
    buildItemsList();
    drawWheel();
  });

  elements.targetRating.addEventListener("input", () => {
    state.targetRating = clamp(Number(elements.targetRating.value) || 0, 0, state.maxRating);
    elements.targetRating.value = String(state.targetRating);
    updateThresholdLabels();
    drawWheel();
  });

  elements.innerGap.addEventListener("input", () => {
    state.innerGapPercent = Number(elements.innerGap.value);
    updateRangeValue(elements.rangeValueInner, `${elements.innerGap.value}%`);
    drawWheel();
  });

  elements.segmentGap.addEventListener("input", () => {
    state.segmentGapDegrees = Number(elements.segmentGap.value);
    updateRangeValue(elements.rangeValueSegment, `${elements.segmentGap.value}°`);
    drawWheel();
  });

  elements.lightenStep.addEventListener("input", () => {
    state.lightenStep = Number(elements.lightenStep.value);
    updateRangeValue(elements.rangeValueLighten, `${elements.lightenStep.value}%`);
    drawWheel();
  });

  elements.showGuides.addEventListener("change", () => {
    state.showGuides = elements.showGuides.checked;
    drawWheel();
  });

  elements.showScale.addEventListener("change", () => {
    state.showScale = elements.showScale.checked;
    drawWheel();
  });

  elements.colorLow.addEventListener("input", () => {
    state.colors.low = elements.colorLow.value;
    drawWheel();
  });

  elements.colorTarget.addEventListener("input", () => {
    state.colors.target = elements.colorTarget.value;
    drawWheel();
  });

  elements.colorHigh.addEventListener("input", () => {
    state.colors.high = elements.colorHigh.value;
    drawWheel();
  });

  elements.fullscreenBtn.addEventListener("click", toggleFullscreen);
  elements.downloadBtn.addEventListener("click", downloadImage);

  updateRangeValue(elements.rangeValueInner, `${elements.innerGap.value}%`);
  updateRangeValue(elements.rangeValueSegment, `${elements.segmentGap.value}°`);
  updateRangeValue(elements.rangeValueLighten, `${elements.lightenStep.value}%`);
}

function updateThresholdLabels() {
  const value = clamp(state.targetRating, 0, state.maxRating);
  elements.lowThresholdDisplay.textContent = String(value);
  elements.targetThresholdDisplay.textContent = String(value);
  elements.highThresholdDisplay.textContent = String(value);
}

function updateRangeValue(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function removeItem(index) {
  if (state.items.length <= 3) {
    alert("Keep at least three items to build a meaningful wheel.");
    return;
  }
  state.items.splice(index, 1);
  state.ratings.splice(index, 1);
  buildItemsList();
  drawWheel();
}

function clampRatings() {
  state.ratings = state.ratings.map((rating, index) => {
    const clamped = clamp(rating, 0, state.maxRating);
    return clamped;
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    elements.wheelWrapper.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.();
  }
}

document.addEventListener("fullscreenchange", () => {
  const text = document.fullscreenElement ? "Exit fullscreen" : "Enter fullscreen";
  elements.fullscreenBtn.textContent = text;
});

function downloadImage() {
  const link = document.createElement("a");
  link.download = "wheel-of-life.png";
  link.href = elements.wheelCanvas.toDataURL("image/png");
  link.click();
}

function drawWheel() {
  const canvas = elements.wheelCanvas;
  const ctx = canvas.getContext("2d");
  const parentSize = canvas.parentElement.getBoundingClientRect();
  const size = Math.min(parentSize.width, parentSize.height || parentSize.width);
  if (!size) {
    return;
  }
  const dpr = window.devicePixelRatio || 1;

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const center = size / 2;
  const maxRadius = (size / 2) * 0.8;
  const innerGap = (state.innerGapPercent / 100) * maxRadius;
  const levels = state.maxRating;
  const step = (maxRadius - innerGap) / levels;
  const totalItems = state.items.length;
  const gapRadians = (state.segmentGapDegrees * Math.PI) / 180;

  if (totalItems === 0) {
    return;
  }

  ctx.save();
  ctx.translate(center, center);

  if (state.showGuides) {
    drawGuides(ctx, levels, innerGap, step, maxRadius, totalItems, gapRadians);
  }

  const fontSize = Math.max(14, size / 40);
  ctx.font = `${fontSize}px 'Segoe UI', Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  state.items.forEach((item, index) => {
    const rating = state.ratings[index] ?? 0;
    const colorBase = getColorForRating(rating);
    drawItemSegments(ctx, {
      index,
      totalItems,
      rating,
      levels,
      innerGap,
      step,
      gapRadians,
      colorBase
    });
  });

  state.items.forEach((item, index) => {
    drawLabel(ctx, {
      item,
      index,
      totalItems,
      maxRadius,
      innerGap,
      step,
      gapRadians,
      fontSize
    });
  });

  if (state.showScale) {
    drawScaleMarkers(ctx, levels, innerGap, step);
  }

  ctx.restore();
}

function drawGuides(ctx, levels, innerGap, step, maxRadius, totalItems, gapRadians) {
  ctx.save();
  ctx.strokeStyle = "rgba(12, 35, 64, 0.1)";
  ctx.lineWidth = 1;

  for (let level = 1; level <= levels; level++) {
    const radius = innerGap + step * level;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(12, 35, 64, 0.18)";

  for (let i = 0; i < totalItems; i++) {
    const angle = (i / totalItems) * Math.PI * 2;
    const startAngle = angle + gapRadians / 2;
    const endAngle = startAngle;
    ctx.beginPath();
    ctx.moveTo(Math.cos(startAngle) * innerGap, Math.sin(startAngle) * innerGap);
    ctx.lineTo(Math.cos(startAngle) * maxRadius, Math.sin(startAngle) * maxRadius);
    ctx.stroke();
  }

  ctx.restore();
}

function drawItemSegments(ctx, { index, totalItems, rating, levels, innerGap, step, gapRadians, colorBase }) {
  if (rating <= 0) {
    return;
  }

  const anglePerItem = (Math.PI * 2) / totalItems;
  const startAngle = index * anglePerItem + gapRadians / 2;
  const endAngle = (index + 1) * anglePerItem - gapRadians / 2;

  for (let level = 1; level <= rating; level++) {
    const innerRadius = innerGap + step * (level - 1);
    const outerRadius = innerGap + step * level;
    const lightenAmount = ((level - 1) / Math.max(rating - 1, 1)) * (state.lightenStep / 100);
    const fillColor = adjustLightness(colorBase, lightenAmount);
    ctx.beginPath();
    ctx.moveTo(Math.cos(startAngle) * innerRadius, Math.sin(startAngle) * innerRadius);
    ctx.arc(0, 0, outerRadius, startAngle, endAngle, false);
    ctx.lineTo(Math.cos(endAngle) * innerRadius, Math.sin(endAngle) * innerRadius);
    ctx.arc(0, 0, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(Math.cos(startAngle) * innerGap, Math.sin(startAngle) * innerGap);
  ctx.arc(0, 0, innerGap + step * rating, startAngle, endAngle, false);
  ctx.lineTo(Math.cos(endAngle) * innerGap, Math.sin(endAngle) * innerGap);
  ctx.arc(0, 0, innerGap, endAngle, startAngle, true);
  ctx.closePath();
  ctx.strokeStyle = "rgba(12, 35, 64, 0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawLabel(ctx, { item, index, totalItems, maxRadius, innerGap, step, gapRadians, fontSize }) {
  const anglePerItem = (Math.PI * 2) / totalItems;
  const midAngle = index * anglePerItem + anglePerItem / 2;
  const radialDistance = maxRadius + fontSize * 2.6;
  const x = Math.cos(midAngle) * radialDistance;
  const y = Math.sin(midAngle) * radialDistance;

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#1c2745";
  ctx.fillText(item, 0, 0);
  ctx.restore();
}

function drawScaleMarkers(ctx, levels, innerGap, step) {
  ctx.save();
  ctx.font = `${Math.max(10, step * 0.35)}px 'Segoe UI', Roboto, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(12, 35, 64, 0.55)";

  for (let level = 1; level <= levels; level++) {
    const radius = innerGap + step * level;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = "rgba(12, 35, 64, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    const marker = `${level}`;
    ctx.fillText(marker, radius + 6, 0);
  }

  ctx.restore();
}

function getColorForRating(rating) {
  const targetValue = clamp(state.targetRating, 0, state.maxRating);
  if (rating > targetValue) {
    return state.colors.high;
  }
  if (rating === targetValue) {
    return state.colors.target;
  }
  return state.colors.low;
}

function adjustLightness(color, lightenAmount) {
  const { h, s, l } = hexToHSL(color);
  const newLightness = clamp(l + lightenAmount * 100, 0, 100);
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(newLightness)}%)`;
}

function hexToHSL(hex) {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100
  };
}
