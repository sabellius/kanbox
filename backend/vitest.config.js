import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    include: ["tests/**/*.test.js"],
    exclude: [
      "node_modules/",
      "db/migrations/",
      "db/seed.json",
      "**/*.spec.js",
    ],
  },
});
