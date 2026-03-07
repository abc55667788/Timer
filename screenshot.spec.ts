import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('capture screenshot of index.html', async ({ page }) => {
  // 由于 5173 可能被占用，Vite 自动切换到了 3001
  const url = 'http://localhost:3001';
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // 等待核心组件加载，例如计时器或主容器
    await page.waitForTimeout(2000); 

    // 创建截图目录
    const screenshotDir = path.join(process.cwd(), 'assets', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotPath = path.join(screenshotDir, 'v1.6.0-preview.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    console.log(`Screenshot saved to: ${screenshotPath}`);
  } catch (error) {
    console.error('Failed to capture screenshot. Is the local dev server running at http://localhost:5173?');
    throw error;
  }
});
