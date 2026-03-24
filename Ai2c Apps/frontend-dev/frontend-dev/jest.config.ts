/** @type {import('jest').Config} */

const config = {
  verbose: true,
  testEnvironment: 'jsdom',
  testMatch: ['**/*vitest/__test__/**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverage: true,
  collectCoverageFrom: ['**/*vitest/__test__/**/?(*.)+(spec|test).[jt]s?(x)'],
  coveragePathIgnorePatterns: [],
};

module.exports = config;
