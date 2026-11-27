
import { test, expect } from '@playwright/test';

// =====================================================
// CẤU HÌNH CHUNG
// =====================================================

const source = 'Olho Clinico';
const MAX_DAYS = 7;

const articleSelector =
  '.row.highlight article:visible, .row.post-list article:visible';

const sections = [
  'Listas de Origens',
  'Olho Clinico',
  'Futebol',
  'Tempo',
  'Taxa de câmbio'
];

// Mở màn hình Olho Clinico trước mỗi test case
test.beforeEach(async ({ page }) => {

  await page.goto('http://olamoz.co.mz/');

  await page.getByRole('link', {
    name: source,
    exact: true
  }).click();

});

// =====================================================
// TC03 - KIỂM TRA GIAO DIỆN OLHO CLINICO
// =====================================================

test('TC03 - Kiểm tra giao diện Olho Clinico', async ({ page }) => {

  console.log('\n===== KIỂM TRA GIAO DIỆN =====');

  for (const name of sections) {

    await expect.soft(
      page.getByText(name, { exact: true }).first(),
      `Kiểm tra hiển thị ${name}`
    ).toBeVisible();

  }

  // Kiểm tra danh sách bài viết
  await expect.soft(
    page.locator(articleSelector).first(),
    'Không hiển thị danh sách bài viết'
  ).toBeVisible();

  // Kiểm tra hiển thị nút Tiếp theo
  await expect.soft(
    page.getByRole('link', {
      name: 'Próximo',
      exact: true
    }),
    'Không hiển thị nút Próximo'
  ).toBeVisible();

});

// =====================================================
// TC04 - KIỂM TRA DỮ LIỆU OLHO CLINICO
// =====================================================

test('TC04 - Kiểm tra dữ liệu Olho Clinico', async ({ page }) => {

  test.setTimeout(120000);

  // ===================================================
  // 1. KIỂM TRA DỮ LIỆU BÀI VIẾT
  // ===================================================

  const articles = page.locator(articleSelector);

  await expect(
    articles.first(),
    'Không có dữ liệu bài viết'
  ).toBeVisible();

  const total = await articles.count();

  console.log('\n===== KIỂM TRA DỮ LIỆU BÀI VIẾT =====');
  console.log(`Nguồn tin: ${source}`);
  console.log(`Tổng số bài viết: ${total}`);

  expect.soft(
    total,
    'Danh sách bài viết rỗng'
  ).toBeGreaterThan(0);

  for (let i = 0; i < total; i++) {

    const article = articles.nth(i);
    const data = await article.innerText();

    const title = data
      .split('\n')
      .map(text => text.trim())
      .find(text => text.length > 0) ?? '';

    console.log(`\n========== BÀI VIẾT ${i + 1} ==========`);
    console.log(data);

    // Kiểm tra dữ liệu không rỗng
    expect.soft(
      data.trim(),
      `Bài viết ${i + 1}: Dữ liệu rỗng`
    ).not.toBe('');

    // Kiểm tra tiêu đề
    expect.soft(
      title,
      `Bài viết ${i + 1}: Không có tiêu đề`
    ).not.toBe('');

    // Kiểm tra dữ liệu bất thường
    expect.soft(
      data,
      `${title}: Dữ liệu không hợp lệ`
    ).not.toMatch(/\b(null|undefined|NaN)\b/i);

    // Kiểm tra tên nguồn tin
    expect.soft(
      data,
      `${title}: Không hiển thị đúng nguồn tin`
    ).toContain(source);

    // Kiểm tra có hiển thị ngày giờ đăng bài
    expect.soft(
      data,
      `${title}: Thiếu ngày giờ đăng bài`
    ).toMatch(
      /\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/
    );

  }

  // ===================================================
  // 2. KIỂM TRA FUTEBOL, TEMPO, TAXA DE CÂMBIO
  // ===================================================

  console.log('\n===== KIỂM TRA DỮ LIỆU TIỆN ÍCH =====');

  const widgets = [
    {
      name: 'Futebol',
      pattern: /Futebol\s+\d{1,2}:\d{2}\s+\d{1,2}\/\d{1,2}/i
    },
    {
      name: 'Tempo',
      pattern: /Tempo\s+(?:-?\d+(?:[.,]\d+)?|null|undefined|NaN)\s*°/i
    },
    {
      name: 'Taxa de câmbio',
      pattern: /Taxa de câmbio[\s\S]*Compra/i
    }
  ];

  for (const widget of widgets) {

    const section = page.locator('div')
      .filter({
        hasText: new RegExp(`^\\s*${widget.name}`, 'i')
      })
      .filter({
        hasText: widget.pattern
      })
      .last();

    await expect.soft(
      section,
      `${widget.name}: Không hiển thị dữ liệu`
    ).toBeVisible({ timeout: 10000 });

    if (!(await section.isVisible())) {

      console.error(
        `FAIL - ${widget.name}: Không tìm thấy dữ liệu`
      );

      continue;
    }

    const data = await section.innerText();

    console.log(`\n${widget.name}:`);
    console.log(data);

    // Kiểm tra dữ liệu không rỗng
    expect.soft(
      data.replace(widget.name, '').trim(),
      `${widget.name}: Dữ liệu rỗng`
    ).not.toBe('');

    // Kiểm tra dữ liệu bất thường
    expect.soft(
      data,
      `${widget.name}: Dữ liệu không hợp lệ`
    ).not.toMatch(/\b(null|undefined|NaN)\b/i);

    // -------------------------------------------------
    // KIỂM TRA FUTEBOL
    // -------------------------------------------------

    if (widget.name === 'Futebol') {

      expect.soft(
        data,
        'Futebol: Không có giờ thi đấu'
      ).toMatch(/\d{1,2}:\d{2}/);

      expect.soft(
        data,
        'Futebol: Không có ngày thi đấu'
      ).toMatch(/\d{1,2}\/\d{1,2}/);

      expect.soft(
        data,
        'Futebol: Không có thông tin đối đầu'
      ).toMatch(/\bVS\b/i);

      expect.soft(
        data,
        'Futebol: Không có tỷ số'
      ).toMatch(/\d+\s*-\s*\d+/);

    }

    // -------------------------------------------------
    // KIỂM TRA TEMPO
    // -------------------------------------------------

    if (widget.name === 'Tempo') {

      expect.soft(
        data,
        'Tempo: Nhiệt độ không hợp lệ'
      ).toMatch(/-?\d+(?:[.,]\d+)?\s*°/);

    }

    // -------------------------------------------------
    // KIỂM TRA TỶ GIÁ
    // -------------------------------------------------

    if (widget.name === 'Taxa de câmbio') {

      expect.soft(
        data,
        'Không có dữ liệu tỷ giá mua'
      ).toMatch(/Compra\s+\d+(?:[.,]\d+)?/i);

      expect.soft(
        data,
        'Không có dữ liệu tỷ giá bán'
      ).toMatch(/Venda\s+\d+(?:[.,]\d+)?/i);

      // Tách dữ liệu theo từng loại tiền tệ
      const currencies = data
        .replace('Taxa de câmbio', '')
        .trim()
        .split(/(?=\b[A-Z]{3}\b)/)
        .map(item => item.trim())
        .filter(Boolean);

      console.log(
        `Tổng số loại tiền tệ: ${currencies.length}`
      );

      for (const currency of currencies) {

        const currencyName = currency
          .match(/^[A-Z]{3}\b/)?.[0] ?? 'Không xác định';

        expect.soft(
          currency,
          `${currencyName}: Tỷ giá mua không hợp lệ`
        ).toMatch(/Compra\s+\d+(?:[.,]\d+)?/i);

        expect.soft(
          currency,
          `${currencyName}: Tỷ giá bán không hợp lệ`
        ).toMatch(/Venda\s+\d+(?:[.,]\d+)?/i);

      }

    }

  }

  console.log('\n===== TỔNG KẾT KIỂM TRA DỮ LIỆU =====');
  console.log(`Tổng số bài viết: ${total}`);
  console.log(`Tổng số lỗi: ${test.info().errors.length}`);

});

// =====================================================
// TC05 - KIỂM TRA THỜI GIAN ĐĂNG BÀI OLHO CLINICO
// =====================================================

test('TC05 - Kiểm tra thời gian đăng bài Olho Clinico', async ({ page }) => {

  const articles = page.locator(articleSelector);

  await expect(
    articles.first(),
    'Không có bài viết để kiểm tra thời gian'
  ).toBeVisible();

  const total = await articles.count();

  let oldArticles = 0;
  let validArticles = 0;
  let invalidDates = 0;

  console.log('\n===== KIỂM TRA THỜI GIAN ĐĂNG BÀI =====');
  console.log(`Nguồn tin: ${source}`);
  console.log(`Tổng số bài viết: ${total}`);

  for (let i = 0; i < total; i++) {

    const data = await articles.nth(i).innerText();

    const title = data
      .split('\n')
      .map(text => text.trim())
      .find(text => text.length > 0) ?? '';

    console.log(`\n========== BÀI VIẾT ${i + 1} ==========`);
    console.log(`Tiêu đề: ${title}`);

    // Lấy ngày giờ đăng bài
    const dateMatch = data.match(
      /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/
    );

    expect.soft(
      dateMatch,
      `${title}: Không tìm thấy thời gian đăng`
    ).not.toBeNull();

    if (!dateMatch) {

      invalidDates++;

      console.error(
        'FAIL - Không tìm thấy thời gian đăng'
      );

      continue;
    }

    const [, day, month, year, hour, minute] = dateMatch;

    // Thời gian theo múi giờ Mozambique UTC+2
    const publishedDate = new Date(
      `${year}-${month}-${day}T${hour}:${minute}:00+02:00`
    );

    const ageDays =
      (Date.now() - publishedDate.getTime()) /
      (1000 * 60 * 60 * 24);

    console.log(`Ngày đăng: ${dateMatch[0]}`);

    // Kiểm tra ngày giờ hợp lệ
    const validDate =
      Number.isFinite(ageDays) &&
      ageDays >= 0;

    expect.soft(
      validDate,
      `${title}: Thời gian đăng không hợp lệ`
    ).toBeTruthy();

    if (!validDate) {

      invalidDates++;

      console.error(
        'FAIL - Thời gian đăng không hợp lệ'
      );

      continue;
    }

    console.log(`Đã đăng: ${ageDays.toFixed(2)} ngày`);

    // Kiểm tra thời gian đăng không quá 7 ngày
    expect.soft(
      ageDays,
      `${title}: Đã đăng ${ageDays.toFixed(2)} ngày`
    ).toBeLessThanOrEqual(MAX_DAYS);

    if (ageDays > MAX_DAYS) {

      oldArticles++;

      console.error(
        `FAIL - Bài viết đã quá ${MAX_DAYS} ngày`
      );

    } else {

      validArticles++;

      console.log(
        'PASS - Thời gian đăng hợp lệ'
      );

    }

  }

  console.log('\n===== TỔNG KẾT THỜI GIAN ĐĂNG BÀI =====');
  console.log(`Tổng số bài viết: ${total}`);
  console.log(`Bài viết trong hạn: ${validArticles}`);
  console.log(`Bài viết quá ${MAX_DAYS} ngày: ${oldArticles}`);
  console.log(`Bài viết lỗi thời gian: ${invalidDates}`);
  console.log(`Tổng số lỗi: ${test.info().errors.length}`);

});

// =====================================================
// TC06 - KIỂM TRA CHỨC NĂNG PHÂN TRANG OLHO CLINICO
// =====================================================

test('TC06 - Kiểm tra chức năng phân trang Olho Clinico', async ({ page }) => {

  test.setTimeout(120000);

  const articles = page.locator(articleSelector);

  console.log('\n===== KIỂM TRA CHỨC NĂNG PHÂN TRANG =====');

  // ===================================================
  // 1. LƯU DỮ LIỆU TRANG ĐẦU TIÊN
  // ===================================================

  await expect(
    articles.first(),
    'Trang đầu tiên không có bài viết'
  ).toBeVisible();

  const firstPageData = await articles.allInnerTexts();

  console.log(`URL trang đầu: ${page.url()}`);
  console.log(`Số bài viết trang đầu: ${firstPageData.length}`);

  // ===================================================
  // 2. KIỂM TRA NÚT PRÓXIMO - TIẾP THEO
  // ===================================================

  const nextButton = page.getByRole('link', {
    name: 'Próximo',
    exact: true
  });

  await expect(
    nextButton,
    'Không hiển thị nút Próximo'
  ).toBeVisible();

  await expect(
    nextButton,
    'Không thể thao tác nút Próximo'
  ).toBeEnabled();

  await nextButton.click();

  console.log('\nĐã nhấn nút Próximo');

  // ===================================================
  // 3. KIỂM TRA DỮ LIỆU SAU KHI CHUYỂN TRANG
  // ===================================================

  await expect(
    articles.first(),
    'Trang tiếp theo không có bài viết'
  ).toBeVisible();

  // Chờ dữ liệu trang tiếp theo thay đổi
  await expect.poll(
    async () => {

      const currentData = await articles.allInnerTexts();

      return currentData.length > 0 &&
        JSON.stringify(currentData) !==
        JSON.stringify(firstPageData);

    },
    {
      message: 'Danh sách bài viết không thay đổi',
      timeout: 15000
    }
  ).toBe(true);

  const nextPageData = await articles.allInnerTexts();

  console.log(`URL trang tiếp theo: ${page.url()}`);
  console.log(`Số bài viết trang tiếp theo: ${nextPageData.length}`);

  // Kiểm tra từng bài viết ở trang tiếp theo
  for (let i = 0; i < nextPageData.length; i++) {

    const data = nextPageData[i];

    console.log(`\nBài viết ${i + 1}:`);
    console.log(data);

    expect.soft(
      data.trim(),
      `Bài viết ${i + 1}: Dữ liệu rỗng`
    ).not.toBe('');

    expect.soft(
      data,
      `Bài viết ${i + 1}: Dữ liệu không hợp lệ`
    ).not.toMatch(/\b(null|undefined|NaN)\b/i);

    expect.soft(
      data,
      `Bài viết ${i + 1}: Sai nguồn tin`
    ).toContain(source);

    expect.soft(
      data,
      `Bài viết ${i + 1}: Thiếu ngày giờ đăng`
    ).toMatch(
      /\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/
    );

  }

  console.log('\nĐã chuyển sang danh sách bài viết mới');

  // ===================================================
  // 4. KIỂM TRA NÚT ANTERIOR - QUAY LẠI
  // ===================================================

  const previousButton = page.getByRole('link', {
    name: 'Anterior',
    exact: true
  });

  await expect(
    previousButton,
    'Không hiển thị nút Anterior'
  ).toBeVisible();

  await expect(
    previousButton,
    'Không thể thao tác nút Anterior'
  ).toBeEnabled();

  await previousButton.click();

  console.log('\nĐã nhấn nút Anterior');

  // ===================================================
  // 5. KIỂM TRA DỮ LIỆU KHI QUAY LẠI
  // ===================================================

  await expect.poll(
    async () => await articles.allInnerTexts(),
    {
      message: 'Dữ liệu không trở về trang ban đầu',
      timeout: 15000
    }
  ).toEqual(firstPageData);

  console.log(`URL sau khi quay lại: ${page.url()}`);
  console.log('Đã quay lại đúng danh sách bài viết ban đầu');

  console.log('\n===== TỔNG KẾT PHÂN TRANG =====');
  console.log(`Số bài viết trang đầu: ${firstPageData.length}`);
  console.log(`Số bài viết trang tiếp theo: ${nextPageData.length}`);
  console.log(`Tổng số lỗi: ${test.info().errors.length}`);

});
