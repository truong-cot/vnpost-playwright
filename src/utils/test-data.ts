/**
 * Tiện ích Tạo Dữ liệu Kiểm thử (Test Data Generator)
 * Tạo dữ liệu kiểm thử độc nhất, có khả năng truy vết cho kiểm thử tự động.
 * Định dạng tuân theo quy tắc: [prefix]_[testName]_[timestamp]_[random]
 */
export class TestDataGenerator {
  /**
   * Tạo một chuỗi độc nhất, chứa tiền tố, tên testcase, timestamp và chuỗi ngẫu nhiên.
   */
  public static generateUniqueString(prefix: string, testName: string, length = 4): string {
    const date = new Date();
    const timestamp = date.toISOString().slice(0, 10).replace(/-/g, ''); // Định dạng YYYYMMDD
    const random = Math.random().toString(36).substring(2, 2 + length).toUpperCase();
    return `${prefix}_${testName}_${timestamp}_${random}`;
  }

  /**
   * Tạo một địa chỉ email độc nhất, phục vụ kiểm thử.
   * Ví dụ: auto_createCustomer_20260617_A3F2@example.com
   */
  public static generateUniqueEmail(testName: string, prefix = 'auto'): string {
    const uniqueStr = this.generateUniqueString(prefix, testName);
    return `${uniqueStr}@example.com`;
  }

  /**
   * Tạo một số điện thoại ngẫu nhiên.
   * Ví dụ: 03xxxxxxxx
   */
  public static generateRandomPhoneNumber(): string {
    const prefixes = ['03', '05', '07', '08', '09'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8);
    return `${randomPrefix}${randomSuffix}`;
  }
}
