/** @type {import('jest').Config} */
export const config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "dist/coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/tests/",
  ],
  coverageProvider: "v8",
  testEnvironment: 'node',
  testRegex: "((\\.|/*.)(test))\\.js?$",
  transform: {},
  verbose: true,
};

export default config;
