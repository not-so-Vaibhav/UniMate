import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root or server directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // fallback to current dir

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5001,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  DB: {
    HOST: process.env.DB_HOST || '127.0.0.1',
    PORT: parseInt(process.env.DB_PORT, 10) || 3306,
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    NAME: process.env.DB_NAME || 'unimate_db',
  },

  JWT: {
    SECRET: process.env.JWT_SECRET || 'unimate_super_secure_jwt_dev_secret_key_2026',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  },

  AI_SERVICE: {
    URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  },

  UPLOAD: {
    MAX_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
    ALLOWED_TYPES: (process.env.ALLOWED_FILE_TYPES || 'pdf,docx,jpg,png').split(','),
  },
};

// Validate critical configurations
if (env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('SECURITY FATAL: JWT_SECRET must be at least 32 characters in production.');
  }
}
