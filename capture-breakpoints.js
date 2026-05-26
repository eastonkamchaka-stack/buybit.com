const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const pages = [
  { file: 'overview.html', label: 'overview' },
  { file: 'assets.html', label: 'assets' },
  { file: 'pnl.html', label: 'pnl' },
  { file: 'trade.html', label: 'trade' },
  { file: 'unified.html', label: 'unified' },
  { file: 'withdraw.html', label: 'withdraw' },
  { file: 'login.html', label: 'login' }
];

const viewports = [
  { width: 1440, height: 900, label: 'desktop' },
  { width: 1024, height: 768, label: 'tablet' },
  { width: 768, height: 1024, label: 'tablet-portrait' },
  { width: 428, height: 926, label: 'mobile' }
];

async function capture() {
  const outputDir = path.resolve(__dirname, 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();

  for (const pageDef of pages) {
    const pagePath = path.resolve(__dirname, pageDef.file);
    const url = `file://${pagePath}`;

    for (const viewport of viewports) {
      const page = await context.newPage();
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      if (pageDef.file !== 'login.html') {
        await page.addInitScript(() => {
          sessionStorage.setItem('buybit-authenticated', 'true');
        });
      }
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForTimeout(600);

      const filename = `${pageDef.label}-${viewport.label}.png`;
      const filepath = path.join(outputDir, filename);
      await page.screenshot({ path: filepath, fullPage: true });
      console.log(`Captured ${filepath}`);
      await page.close();
    }
  }

  await browser.close();
  console.log('Breakpoint screenshots complete.');
}

capture().catch((error) => {
  console.error('Screenshot capture failed:', error);
  process.exit(1);
});
