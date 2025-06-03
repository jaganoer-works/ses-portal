const nextJest = require('next/jest')

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // NextAuth.jsの問題を解決
    '^next-auth$': '<rootDir>/__mocks__/next-auth.js',
    '^next-auth/react$': '<rootDir>/__mocks__/next-auth-react.js',
    '^next-auth/providers/credentials$': '<rootDir>/__mocks__/next-auth-providers-credentials.js',
    // MSWの問題を解決
    '^msw/node$': '<rootDir>/__mocks__/msw-node.js',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/cypress/',
    '<rootDir>/e2e/',
  ],
  // ESMモジュールのトランスパイル設定
  transformIgnorePatterns: [
    'node_modules/(?!(next-auth|@auth|msw|@mswjs)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/not-found.tsx',
    '!src/app/**/error.tsx',
    '!src/app/**/page.tsx', // 統合テストで別途テスト
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config) 