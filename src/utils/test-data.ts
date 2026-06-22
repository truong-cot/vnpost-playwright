/**
 * Test Data Generator Utility
 * Generates unique, traceable test data for automation testing.
 * Format follows the rules: [prefix]_[testName]_[timestamp]_[random]
 */
export class TestDataGenerator {
  /**
   * Generates a unique, traceable string containing prefix, test name, timestamp, and a random string.
   */
  public static generateUniqueString(prefix: string, testName: string, length = 4): string {
    const date = new Date();
    const timestamp = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const random = Math.random().toString(36).substring(2, 2 + length).toUpperCase();
    return `${prefix}_${testName}_${timestamp}_${random}`;
  }

  /**
   * Generates a unique, traceable email address.
   * Example: auto_createCustomer_20260617_A3F2@test.com
   */
  public static generateUniqueEmail(testName: string, prefix = 'auto'): string {
    const uniqueStr = this.generateUniqueString(prefix, testName);
    return `${uniqueStr}@example.com`;
  }

  /**
   * Generates a random phone number.
   * Example: 03xxxxxxxx
   */
  public static generateRandomPhoneNumber(): string {
    const prefixes = ['03', '05', '07', '08', '09'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8);
    return `${randomPrefix}${randomSuffix}`;
  }
}
