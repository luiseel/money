/** @type {import("eslint").Linter.Config} */
// Import eslint-config-turbo properly
let turboConfig;
try {
  turboConfig = require("eslint-config-turbo");
  // Handle both default export and direct export patterns
  if (turboConfig.default) {
    turboConfig = turboConfig.default;
  }
} catch (error) {
  // Fallback to empty configuration if turbo config can't be loaded
  turboConfig = { extends: [], plugins: [] };
}

module.exports = {
  root: true,
  ...(turboConfig || {}),
  extends: [
    ...(turboConfig?.extends || []),
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier",
  ],
  plugins: [...(turboConfig?.plugins || []), "@typescript-eslint/eslint-plugin"],
  parser: "@typescript-eslint/parser",
  ignorePatterns: [
    ".*.js",
    "*.setup.js",
    "*.config.js",
    ".turbo/",
    "dist/",
    "coverage/",
    "node_modules/",
    ".husky/",
  ],
};
