module.exports = {
  testEnvironment: 'node',
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'functions/controllers/**/*.js',
    'functions/routes/**/*.js',
    '!functions/**/*.test.js',
  ],
};
