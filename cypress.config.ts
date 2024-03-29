import { defineConfig } from "cypress";
import task from "@cypress/code-coverage/task";

export default defineConfig({
  env: {
    codeCoverage: {
      exclude: "cypress/**/*.*",
    },
  },
  e2e: {
    baseUrl: "http://localhost:4173/", // production port
    viewportWidth: 1440,
    viewportHeight: 900,
    env: {
      IS_CI: "",
    },
    setupNodeEvents(on, config) {
      task(on, config);
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
  },
  // Enable cross-domain iframe access
  chromeWebSecurity: false,
});
