import * as dotenv from 'dotenv';
import * as path from 'path';

// Nạp các biến môi trường từ file .env tại thư mục gốc của dự án
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const ENV = {
  BASE_URL: process.env.BASE_URL || 'https://vnpost.sfin.vn/',
  TEST_USERNAME: process.env.TEST_USERNAME || '',
  TEST_PASSWORD: process.env.TEST_PASSWORD || '',
};
