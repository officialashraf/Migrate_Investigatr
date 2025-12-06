const fs = require('fs');
const path = require('path');
const colors = require('./color').default;
const typography = require('./typography').default;
const shape = require('./shape').default;
const shadows = require('./shadow').default;

let cssContent = ':root {\n';

// Colors
for (let color in colors) {
  for (let shade in colors[color]) {
    cssContent += `  --color-${color}-${shade}: ${colors[color][shade]};\n`;
  }
}

// Shape
for (let prop in shape) {
  cssContent += `  --shape-${prop}: ${shape[prop]}${typeof shape[prop] === 'number' ? 'px' : ''};\n`;
}

// Typography
for (let prop in typography) {
  if (typeof typography[prop] === 'object') {
    for (let sub in typography[prop]) {
      cssContent += `  --font-${prop}-${sub}: ${typography[prop][sub]};\n`;
    }
  } else {
    cssContent += `  --font-${prop}: ${typography[prop]}${prop === 'fontSize' ? 'px' : ''};\n`;
  }
}

// Shadows
for (let key in shadows) {
  cssContent += `  --shadow-${key}: ${shadows[key]};\n`;
}

cssContent += '}\n';

// Write to file
fs.writeFileSync(path.join(__dirname, './designTokens.css'), cssContent);
console.log(' CSS Variables generated successfully!');
