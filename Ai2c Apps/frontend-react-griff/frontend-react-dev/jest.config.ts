/** @type {import('jest').Config} */

const config = {
  verbose: true,
  testEnvironment: 'jsdom',
  testMatch: ['**/*vitest/__test__/**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverage: true,
  collectCoverageFrom: ['**/*vitest/__test__/**/?(*.)+(spec|test).[jt]s?(x)'],
  coveragePathIgnorePatterns: [],
  testTimeout: 15000,
};

module.exports = config;
