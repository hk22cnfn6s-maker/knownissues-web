// Edge-safe (Web Crypto based) — this module is imported by
// lib/supabase/middleware.ts, which runs on the Edge Runtime, so it must
// not pull in Node's classic `crypto` module (see lib/crypto.ts's doc
// comment vs. lib/edge-crypto.ts's).
import { signValue, verifySignedValue } from '@/lib/edge-crypto'

export const PENDING_2FA_COOKIE = 'pending_2fa'
export const PENDING_2FA_TTL_SECONDS = 15 * 60
export const MAX_2FA_ATTEMPTS = 5

/**
 * Asserts "this session passed 2FA" for admin routes. Supabase's own
 * session JWT has no field for this, and forcing one in via app_metadata
 * would need a token refresh — so this is a second, independent
 * HMAC-signed cookie checked alongside the real Supabase session.
 * 12h so the admin isn't re-prompted on every request, but does
 * re-verify at least a couple of times a day.
 */
export const ADMIN_2FA_COOKIE = 'admin_2fa_ok'
export const ADMIN_2FA_TTL_SECONDS = 12 * 60 * 60

export interface Pending2faPayload {
  userId: string
  accessToken: string
  refreshToken: string
  attempts: number
  expiresAt: number
}

export async function signAdmin2faCookie(userId: string): Promise<string> {
  const payload = JSON.stringify({ userId, expiresAt: Date.now() + ADMIN_2FA_TTL_SECONDS * 1000 })
  return signValue(payload, 'admin-2fa-ok')
}

/** Returns true if the cookie is validly signed, unexpired, and matches the given user. */
export async function verifyAdmin2faCookie(
  cookieValue: string | undefined,
  userId: string
): Promise<boolean> {
  if (!cookieValue) return false

  const raw = await verifySignedValue(cookieValue, 'admin-2fa-ok')
  if (!raw) return false

  try {
    const payload = JSON.parse(raw) as { userId: string; expiresAt: number }
    return payload.userId === userId && payload.expiresAt > Date.now()
  } catch {
    return false
  }
}
