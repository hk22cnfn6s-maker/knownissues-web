import { verifyTotpCode } from '@/lib/totp'
import { decrypt } from '@/lib/crypto'
import { consumeRecoveryCode } from '@/lib/recovery-codes'
import type { createServiceClient } from '@/lib/supabase/server'

type ServiceClient = ReturnType<typeof createServiceClient>

/**
 * Confirms `code` is either a valid live TOTP code for the given
 * (encrypted-at-rest) secret, or an unused recovery code — the same
 * "TOTP or recovery code" check used at login, and for re-authenticating
 * before disabling 2FA or rotating recovery codes.
 */
export async function verifyAdminCode(
  service: ServiceClient,
  encryptedSecret: string,
  code: string
): Promise<boolean> {
  try {
    if (await verifyTotpCode(code, decrypt(encryptedSecret, 'totp-secret'))) {
      return true
    }
  } catch (err) {
    console.error('[admin-reauth] decrypt/verify failed', err)
  }
  return consumeRecoveryCode(service, code)
}
