module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^@env$': '<rootDir>/src/config/__mocks__/env.ts',
  },
};
