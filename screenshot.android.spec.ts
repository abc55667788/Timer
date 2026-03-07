import { test, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const screenshotDir = path.join(process.cwd(), 'assets', 'screenshots');
const baseUrl = process.env.PW_BASE_URL || 'http://localhost:3002';

async function ensureDir() {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
}

test('android portrait timer screenshot', async ({ browser }) => {
  await ensureDir();

  const context = await browser.newContext({
    ...devices['Pixel 7'],
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  });

  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);

  await page.screenshot({
    path: path.join(screenshotDir, 'android-portrait-timer.png'),
    fullPage: true,
  });

  await context.close();
});

test('android landscape timer screenshot', async ({ browser }) => {
  await ensureDir();

  const context = await browser.newContext({
    ...devices['Pixel 7 landscape'],
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  });

  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);

  await page.screenshot({
    path: path.join(screenshotDir, 'android-landscape-timer.png'),
    fullPage: true,
  });

  await context.close();
});

test('android portrait events screenshot', async ({ browser }) => {
  await ensureDir();

  const context = await browser.newContext({
    ...devices['Pixel 7'],
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  });

  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);

  await page.getByRole('button', { name: 'Events' }).click();
  await page.waitForTimeout(900);

  await page.screenshot({
    path: path.join(screenshotDir, 'android-portrait-events.png'),
    fullPage: true,
  });

  await context.close();
});
