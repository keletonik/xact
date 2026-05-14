import { SignJWT, jwtVerify } from 'jose';

/**
 * Minimal JWT auth. In dev, JWT_SECRET defaults to a stable string so the
 * server boots without configuration. In production it must be set to a
 * 256-bit secret rotated regularly.
 */
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-only-secret-rotate-me');

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
