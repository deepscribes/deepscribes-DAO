import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js"],
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};

export default config;
