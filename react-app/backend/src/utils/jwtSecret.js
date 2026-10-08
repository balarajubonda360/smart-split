import { randomBytes } from 'node:crypto';

const configuredSecret = globalThis.process?.env?.JWT_SECRET;
const isProduction = globalThis.process?.env?.NODE_ENV === 'production';

if (isProduction && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters in production.');
}

if (!isProduction && configuredSecret && configuredSecret.length < 32) {
  console.warn('JWT_SECRET is too short; using a temporary development-only secret.');
}

export const jwtSecret = configuredSecret?.length >= 32
  ? configuredSecret
  : randomBytes(32).toString('hex');
