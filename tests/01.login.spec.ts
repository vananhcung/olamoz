import { test, expect } from '@playwright/test';

test('Đăng nhập bằng số điện thoại và OTP', async ({ page }) => {

  console.log('\n===== KIỂM TRA ĐĂNG NHẬP =====');

  // 1. Truy cập website
  await page.goto('http://olamoz.co.mz/');
  console.log('[PASS] Bước 1: Truy cập website thành công');

  // 2. Mở màn hình đăng nhập
  await page.locator('#profile-dropdown').click();
  await page.getByRole('link', { name: 'Entrar' }).click();

  const phoneInput = page.getByRole('textbox', {
    name: 'Digite seu número de telefone'
  });

  await expect(phoneInput).toBeVisible();
  console.log('[PASS] Bước 2: Hiển thị màn hình đăng nhập');

  // 3. Nhập số điện thoại
  await phoneInput.fill('873297810');
  await expect(phoneInput).toHaveValue('873297810');

  console.log('[PASS] Bước 3: Nhập số điện thoại thành công');

  await page.waitForTimeout(1000);

  // 4. Click nút Enviar OTP
  await page.getByRole('button', {
    name: 'Enviar OTP',
    exact: true
  }).click();

  console.log('[PASS] Bước 4: Click nút Enviar OTP');

  await page.waitForTimeout(1500);

  // 5. Kiểm tra nút gửi OTP
  const buttons = page.getByRole('button', {
    name: 'Enviar OTP',
    exact: true
  });

  const sendOTP = buttons.filter({ visible: true });

  await expect(sendOTP).toHaveCount(1);
  await expect(sendOTP).toBeEnabled();

  console.log('[PASS] Bước 5: Nút gửi OTP hiển thị và được phép thao tác');
  console.log('       Số nút gửi OTP:', await sendOTP.count());

  // 6. Click gửi OTP
  await sendOTP.click();

  console.log('[PASS] Bước 6: Click xác nhận gửi OTP');

  // 7. Kiểm tra màn hình nhập OTP
  const otpInputs = page.locator('input[maxlength="1"]');

  await expect(otpInputs).toHaveCount(6);

  console.log('[PASS] Bước 7: Hiển thị 6 ô nhập mã OTP');

  // 8. Nhập mã OTP
  const otp = '546221';

  for (let i = 0; i < otp.length; i++) {
    await otpInputs.nth(i).fill(otp[i]);
  }

  console.log('[PASS] Bước 8: Nhập mã OTP thành công');

  // 9. Kiểm tra mã OTP đã được nhập
  for (let i = 0; i < otp.length; i++) {
    await expect(otpInputs.nth(i)).toHaveValue(otp[i]);
  }

  console.log('[PASS] Bước 9: Giá trị 6 ô OTP chính xác');

  console.log('================================');
  console.log('KẾT QUẢ: PASS - Kiểm tra luồng nhập OTP');
  console.log('================================\n');

});