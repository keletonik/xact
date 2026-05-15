import { Hono } from 'hono';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';
import { scrypt as scryptCb, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { db, schema } from '../db/client.js';
import { signAccess } from '../middleware/auth.js';

const scrypt = promisify(scryptCb);
export const authRouter = new Hono();

async function hash(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`;
}

async function verify(password, stored) {
  const [scheme, saltHex, derivedHex] = stored.split(':');
  if (scheme !== 'scrypt') return false;
  const salt = Buffer.from(saltHex, 'hex');
  const derived = await scrypt(password, salt, 64);
  return timingSafeEqual(Buffer.from(derivedHex, 'hex'), derived);
}

// Password policy: at least 10 characters. We don't enforce complexity classes
// (digit/symbol) — modern guidance (NIST 800-63-3) prefers length over
// composition rules. Min length is a hard wall against trivial guessing.
const MIN_PASSWORD_LENGTH = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

authRouter.post('/register', async (c) => {
  let body;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const { email, password, name, orgName } = body || {};
  if (!email || !password || !name) return c.json({ error: 'Missing fields' }, 400);
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) return c.json({ error: 'Invalid email' }, 400);
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return c.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, 400);
  }
  if (typeof name !== 'string' || name.trim().length === 0) return c.json({ error: 'Name required' }, 400);

  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (existing.length > 0) return c.json({ error: 'Email already registered' }, 409);

  const now = new Date().toISOString();
  const org = { id: uuid(), name: orgName || `${name}'s org`, country: 'AU', currency: 'AUD', createdAt: now };
  await db.insert(schema.orgs).values(org);

  const user = { id: uuid(), orgId: org.id, email, name, role: 'admin', passwordHash: await hash(password), createdAt: now };
  await db.insert(schema.users).values(user);
  const token = await signAccess({ userId: user.id, orgId: org.id, role: user.role });
  return c.json({ token, user: { id: user.id, email, name, role: user.role, orgId: org.id } });
});

authRouter.post('/login', async (c) => {
  let body;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const { email, password } = body || {};
  if (!email || !password) return c.json({ error: 'Missing fields' }, 400);
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (!user) return c.json({ error: 'Invalid credentials' }, 401);
  const ok = await verify(password, user.passwordHash);
  if (!ok) return c.json({ error: 'Invalid credentials' }, 401);
  const token = await signAccess({ userId: user.id, orgId: user.orgId, role: user.role });
  return c.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, orgId: user.orgId } });
});
