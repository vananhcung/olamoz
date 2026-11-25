
import { test, expect } from '@playwright/test';

test('Đăng nhập bằng số điện thoại và OTP', async ({ page }) => {

  // 1. Truy cập website
  await page.goto('http://olamoz.co.mz/');

  // 2. Mở màn hình đăng nhập
  await page.locator('#profile-dropdown').click();
  await page.getByRole('link', { name: 'Entrar' }).click();

// 3. Nhập số điện thoại
await page.getByRole('textbox', {
  name: 'Digite seu número de telefone'
}).fill('873297810');

// Chờ 1 giây
await page.waitForTimeout(1000);

// 4. Click nút Enviar
await page.getByRole('button', {
  name: 'Enviar OTP',
  exact: true
}).click();

// Chờ màn hình nhập OTP
await page.waitForTimeout(1500);

  // 4. Kiểm tra các nút gửi OTP
  const buttons = page.getByRole('button', {
    name: 'Enviar OTP',
    exact: true
  });
  
  console.log('Số nút gửi OTP:', await buttons.count());

  // Chọn nút đang hiển thị
  const sendOTP = buttons.filter({ visible: true });

  await expect(sendOTP).toHaveCount(1);
  await expect(sendOTP).toBeEnabled();

  // 5. Click gửi OTP
  await sendOTP.click();

  // 6. Kiểm tra màn hình nhập OTP
  const otpInputs = page.locator('input[maxlength="1"]');

  await expect(otpInputs).toHaveCount(6);

  // 7. Nhập mã OTP
  const otp = '546221';

  for (let i = 0; i < otp.length; i++) {
    await otpInputs.nth(i).fill(otp[i]);
  }

  // 8. Kiểm tra mã OTP đã được nhập
  for (let i = 0; i < otp.length; i++) {
    await expect(otpInputs.nth(i)).toHaveValue(otp[i]);
  }

});
