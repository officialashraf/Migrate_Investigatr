  const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0].includes("React Router Future Flag Warning")) {
    // Skip the warning
    return;
  }
  // Call the original console.warn for all other warnings
  originalWarn.apply(console, args);
};
export default  originalWarn;