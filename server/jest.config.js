/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  testMatch: ["**/*.test.js"],
  testTimeout: 30000,
  verbose: true,
  bail: false,
  maxWorkers: 1,
  forceExit: true,
  detectOpenHandles: true,
};

module.exports = config;
