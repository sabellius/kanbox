import js from "@eslint/js";
import globals from "globals";
import vitest from "@vitest/eslint-plugin";

export default [
  // Base configuration for all JavaScript files
  js.configs.recommended,

  // Source files configuration
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],
      "no-console": "off",
      "no-undef": "error",
    },
  },

  // Test files configuration with Vitest
  {
    files: ["tests/**/*.js"],
    ...vitest.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...vitest.environments.env.globals,
      },
    },
  },
];
