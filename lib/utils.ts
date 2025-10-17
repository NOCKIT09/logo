import crypto from 'crypto';
import { config } from './config';

export function generateCode(): string {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `DRM25-${config.cityCode}-${random}`;
}

export function hashIp(ip: string): string {
  return crypto
    .createHash('sha256')
    .update(ip + config.ipHashSalt)
    .digest('hex');
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return '127.0.0.1';
}

export function formatDate(date: Date): string {
  return date.toISOString();
}
