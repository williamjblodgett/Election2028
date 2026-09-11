const { defineConfig } = require('@playwright/test');
const externalServer = process.env.ELECTION_TEST_EXTERNAL_SERVER === '1';
const baseURL=process.env.ELECTION_TEST_URL || 'http://127.0.0.1:4173';

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: { baseURL, screenshot: 'only-on-failure', serviceWorkers: 'block' },
  webServer: externalServer ? undefined : {
    command: 'node tests/server.cjs',
    url: baseURL,
    reuseExistingServer: true,
  },
});
