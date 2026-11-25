
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://olamoz.co.mz/');
});

const sections = [
  'Notícias quentes',
  'Últimas notícias',
  'Futebol',
  'Tempo',
  'Taxa de câmbio'
];

// TC01 - Kiểm tra giao diện Home
test('TC01 - Kiểm tra giao diện Home', async ({ page }) => {
  for (const name of sections) {
    await expect.soft(
      page.getByText(name, { exact: true }).first(),
      `Kiểm tra hiển thị ${name}`
    ).toBeVisible();
  }
});

// TC02 - Kiểm tra dữ liệu Home
test('TC02 - Kiểm tra dữ liệu Home', async ({ page }) => {
  for (const name of sections) {

    // Lấy vùng chứa tiêu đề và nội dung
    const section = page.locator('div')
      .filter({ hasText: name })
      .filter({ hasText: /\d/ })
      .last();

    await expect(section).toBeVisible();

    const data = await section.innerText();

    console.log(`\n${name}:`, data);

    // Kiểm tra dữ liệu không rỗng
    expect.soft(data.replace(name, '').trim(),
      `${name}: Dữ liệu rỗng`
    ).not.toBe('');

    // Kiểm tra dữ liệu bất thường
    expect.soft(data,
      `${name}: Dữ liệu không hợp lệ`
    ).not.toMatch(/\b(null|undefined|NaN)\b/i);
  }
});
