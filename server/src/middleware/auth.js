import { SignJWT, jwtVerify } from 'jose';

/**
 * Minimal JWT auth.
 *
 * Production deploys MUST set JWT_SECRET (≥ 32 bytes recommended). The server
 * refuses to start in production with the dev fallback secret to prevent the
 * "shipped with default secret" class of incident.
 */
const RAW_SECRET = process.env.JWT_SECRET || 'dev-only-secret-rotate-me';
if (process.env.NODE_ENV === 'production' && RAW_SECRET === 'dev-only-secret-rotate-me') {
  throw new Error(
    'JWT_SECRET is unset in production. Refusing to start with the dev fallback secret. ' +
    'Generate a value with `openssl rand -hex 32` and set it as an environment variable.',
  );
}
const SECRET = new TextEncoder().encode(RAW_SECRET);

export async function signAccess(payload, expSec = 900) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expSec}s`)
    .sign(SECRET);
}

export async function verifyAccess(token) {
  const { payload } = await jwtVerify(token, SECRET);
  return payload;
}

/** Hono middleware that requires a Bearer JWT and injects c.set('user', payload). */
export async function requireAuth(c, next) {
  const header = c.req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return c.json({ error: 'Missing bearer token' }, 401);
  try {
    const payload = await verifyAccess(token);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
}
