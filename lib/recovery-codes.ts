import crypto from 'crypto'
import type { createServiceClient } from '@/lib/supabase/server'

type ServiceClient = ReturnType<typeof createServiceClient>

// Excludes 0/O and 1/I to avoid ambiguity when the admin transcribes a code.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 10
const CODE_COUNT = 8

function randomCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH)
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
  }
  return code
}

export function generateRecoveryCodes(): string[] {
  return Array.from({ length: CODE_COUNT }, randomCode)
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/[\s-]/g, '')
}

export function hashRecoveryCode(code: string): string {
  return crypto.createHash('sha256').update(normalizeCode(code)).digest('hex')
}

/**
 * Atomically marks one unused recovery code as used, matched by hash.
 * Returns true only if this call was the one that flipped it — the
 * `used = false` guard in the WHERE clause means a concurrent duplicate
 * attempt against the same code will affect zero rows and return false.
 */
export async function consumeRecoveryCode(
  service: ServiceClient,
  code: string
): Promise<boolean> {
  const hash = hashRecoveryCode(code)

  const { data, error } = await service
    .from('admin_recovery_codes')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('code_hash', hash)
    .eq('used', false)
    .select('id')

  if (error) {
    console.error('[recovery-codes] consume failed', error)
    return false
  }

  return (data?.length ?? 0) > 0
}
