import { Page, Locator } from '@playwright/test';

/**
 * Lớp Base Page Object đại diện cho các hành vi dùng chung giữa các trang.
 */
export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Điều hướng tới một đường dẫn hoặc URL.
   */
  public async navigate(path = ''): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Click vào một phần tử sau khi đảm bảo phần tử đó đã hiển thị.
   */
  public async click(locator: Locator, options?: Parameters<Locator['click']>[0]): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click(options);
  }

  /**
   * Điền văn bản vào ô nhập liệu sau khi đảm bảo ô nhập liệu đã hiển thị.
   */
  public async fill(locator: Locator, text: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(text);
  }

  /**
   * Nhập từng ký tự tuần tự vào ô nhập liệu.
   */
  public async type(locator: Locator, text: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.pressSequentially(text);
  }

  /**
   * Lấy nội dung văn bản của phần tử.
   */
  public async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.textContent()) || '';
  }

  /**
   * Kiểm tra xem phần tử có hiển thị hay không, trả về false nếu lỗi thay vì ném exception.
   */
  public async isVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }
}
