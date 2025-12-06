const fs = require('fs');
const { execSync } = require('child_process');
const packageJson = require('./package.json');

// Helper function to safely run git commands
const safeExec = (cmd, fallback = "N/A") => {
  try {
    return execSync(cmd, { stdio: ['pipe', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return fallback;
  }
};

const buildInfo = {
  productName: packageJson.name || "Unknown",
  version: packageJson.version || "0.0.0",
  lastModifiedOn: safeExec('git log -1 --format=%cd'),
  updatedBy: safeExec('git log -1 --format=%an'),
  commit: safeExec('git rev-parse --short HEAD'),
  maintainedBy: "Curated Codes"
};

// Make sure the directory exists
fs.mkdirSync('./src/InfoApp', { recursive: true });

// Write build info
fs.writeFileSync(
  './src/InfoApp/build-info.js',
  `export default ${JSON.stringify(buildInfo, null, 2)};`
);

console.log(' build-info.js created safely');
