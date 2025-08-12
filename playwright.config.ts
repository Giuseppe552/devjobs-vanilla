import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  use: { baseURL: "http://localhost:5173" },
  webServer: {
    command: "npx http-server -p 5173 -c-1 .",
    port: 5173,
    reuseExistingServer: !process.env.CI
  }
});
