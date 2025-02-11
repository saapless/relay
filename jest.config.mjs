import { createDefaultEsmPreset } from "ts-jest";

/** @type {import('ts-jest').JestConfigWithTsJest} */

const config = {
  verbose: true,
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  ...createDefaultEsmPreset({ tsconfig: "<rootDir>/tsconfig.json", useESM: true }),
};

export default config;
