import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object representing common behaviors across all pages.
 */
export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to a path or URL.
   */
  public async navigate(path = ''): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Clicks on an element after ensuring it is visible.
   */
  public async click(locator: Locator, options?: Parameters<Locator['click']>[0]): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click(options);
  }

  /**
   * Fills an input element with text after ensuring it is visible.
   */
  public async fill(locator: Locator, text: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(text);
  }

  /**
   * Types text sequentially into an input element.
   */
  public async type(locator: Locator, text: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.pressSequentially(text);
  }

  /**
   * Retrieves text content of an element.
   */
  public async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.textContent()) || '';
  }

  /**
   * Checks if an element is visible, returns false on failure instead of throwing.
   */
  public async isVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }
}
