module.exports = {
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  clearMocks: true,
  verbose: true,
};
