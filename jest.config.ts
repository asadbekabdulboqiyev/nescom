import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/tests/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  testTimeout: 30000,
  collectCoverageFrom: [
    'src/lib/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    'src/contexts/**/*.{ts,tsx}',
    '!src/lib/__tests__/**',
    '!src/components/__tests__/**',
    '!src/lib/prisma.ts',
    '!src/**/*.d.ts',
    '!src/**/*.stories.*',
    '!src/types/**',
    '!src/generated/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'clover'],
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 5,
      lines: 10,
      statements: 10,
    },
    'src/lib/**/*.{ts,tsx}': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
