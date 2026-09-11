const { test, expect } = require('@playwright/test');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

test.describe('release-to-release updates', () => {
  test.use({ serviceWorkers: 'allow' });
  test('an update bypasses stale HTTP assets and preserves one coherent release until accepted', async ({ page, context }) => {
    test.setTimeout(60000);
    const root = path.resolve(__dirname, '../../dist');
    let release = 'old';
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };
    const server = http.createServer((request, response) => {
      const url = new URL(request.url, 'http://election.localhost');
      const relative = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      const target = path.resolve(root, relative);
      if (!target.startsWith(root + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
        response.writeHead(404); response.end(); return;
      }
      let body = fs.readFileSync(target);
      if (relative === 'service-worker.js') {
        body = Buffer.from(body.toString().replace(/const CACHE_NAME = '[^']+';/, `const CACHE_NAME = 'election2028-upgrade-${release}';`));
      } else if (relative === 'index.html' && release === 'old') {
        body = Buffer.from(body.toString().replace('Up to 96 governing months', 'OLD RELEASE SHELL'));
      } else if (relative === 'js/ui.js' && release === 'old') {
        body = Buffer.from(body.toString().replace('Election 2028 · 2.1', 'Election 2028 · OLD RELEASE'));
      } else if (relative === 'css/styles.css') {
        body = Buffer.concat([body, Buffer.from(`\nbody { --release-marker: ${release}; }`)]);
      }
      response.writeHead(200, {
        'Content-Type': types[path.extname(target)] || 'application/octet-stream',
        'Cache-Control': relative === 'service-worker.js' ? 'no-cache' : 'public, max-age=86400'
      });
      response.end(body);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://election.localhost:${server.address().port}`;
    try {
      await page.goto(origin);
      await page.waitForFunction(() => !!navigator.serviceWorker.controller);
      await expect(page.getByText('OLD RELEASE SHELL', { exact: true })).toBeVisible();
      await page.evaluate(() => localStorage.setItem('upgrade-test-record', 'preserve this career'));
      await page.getByRole('button', { name: 'CREDITS', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Election 2028 · OLD RELEASE', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Close dialog', exact: true }).click();

      release = 'new';
      await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
      await expect(page.locator('#game-update-ready')).toHaveCount(1);
      await page.goto(`${origin}/?resume=1`);
      await expect(page.getByText('OLD RELEASE SHELL', { exact: true })).toBeVisible();
      await expect(page.locator('.update-ready')).toHaveCount(1);
      expect(await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--release-marker').trim())).toBe('old');

      await page.getByRole('button', { name: 'Update ready — save & reload', exact: true }).click();
      await expect(page.getByText('Up to 96 governing months', { exact: true })).toBeVisible();
      await expect(page.locator('.update-ready')).toHaveCount(0);
      expect(await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--release-marker').trim())).toBe('new');
      await page.getByRole('button', { name: 'CREDITS', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Election 2028 · 2.1', exact: true })).toBeVisible();
      expect(await page.evaluate(() => localStorage.getItem('upgrade-test-record'))).toBe('preserve this career');

      await context.setOffline(true);
      await page.reload();
      await expect(page.getByText('Up to 96 governing months', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'CREDITS', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Election 2028 · 2.1', exact: true })).toBeVisible();
    } finally {
      await context.setOffline(false);
      await page.close();
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
  });
});
