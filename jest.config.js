module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
   testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '!**/__tests__/**/*.empty.test.[jt]s?(x)' 
  ],
  setupFilesAfterEnv: [], 
  globalSetup: undefined, 
  globalTeardown: undefined
};