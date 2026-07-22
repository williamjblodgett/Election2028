const { defineConfig } = require('@playwright/test');
const externalServer = process.env.ELECTION_TEST_EXTERNAL_SERVER === '1';

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:4173', screenshot: 'only-on-failure', serviceWorkers: 'block' },
  webServer: externalServer ? undefined : {
    command: 'node tests/server.cjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
  },
});
