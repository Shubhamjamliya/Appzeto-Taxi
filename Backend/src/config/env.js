import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

const resolvedJwtSecret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;
const resolvedJwtExpiresIn = process.env.JWT_EXPIRES_IN || process.env.JWT_ACCESS_EXPIRES || '7d';

const requiredEnvVars = ['MONGODB_URI'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

if (!resolvedJwtSecret) {
  throw new Error('Missing required environment variable: JWT_SECRET or JWT_ACCESS_SECRET');
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.isInteger(Number(process.env.PORT)) ? Number(process.env.PORT) : 4000,
  mongoUri: process.env.MONGODB_URI,
  mongoDbName: process.env.MONGODB_DB_NAME || 'appzeto_taxi',
  jwtSecret: resolvedJwtSecret,
  jwtExpiresIn: resolvedJwtExpiresIn,
  corsOrigin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '*',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'appzeto-taxi',
  },
};
