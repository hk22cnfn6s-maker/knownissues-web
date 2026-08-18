/**
 * HMAC signing built on the Web Crypto API (crypto.subtle) rather than
 * Node's classic `crypto` module — this file must be importable from
 * lib/supabase/middleware.ts, which Next.js always runs on the Edge
 * Runtime (Node built-ins like `crypto`/`Buffer` aren't available there).
 * Web Crypto is a global in both the Edge runtime and modern Node.js, so
 * this same implementation runs unchanged in the verify-2fa route
 * (Node.js) and in middleware (Edge).
 */

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function toBase64Url(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array {
  const padLength = (4 - (value.length % 4)) % 4
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function deriveHmacKey(purpose: string): Promise<CryptoKey> {
  const hex = process.env.TOTP_ENCRYPTION_KEY
  if (!hex) throw new Error('TOTP_ENCRYPTION_KEY is not set')

  const masterKeyBytes = hexToBytes(hex)
  const purposeBytes = new TextEncoder().encode(':' + purpose)
  const combined = new Uint8Array(masterKeyBytes.length + purposeBytes.length)
  combined.set(masterKeyBytes)
  combined.set(purposeBytes, masterKeyBytes.length)

  const digest = await crypto.subtle.digest('SHA-256', combined)
  return crypto.subtle.importKey('raw', digest, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

/** HMAC-signs an arbitrary string for use as a tamper-evident cookie value. */
export async function signValue(value: string, purpose: string): Promise<string> {
  const key = await deriveHmacKey(purpose)
  const encoded = toBase64Url(new TextEncoder().encode(value))
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encoded))
  return `${encoded}.${toBase64Url(signature)}`
}

/** Verifies and decodes a value produced by signValue(). Returns null if invalid. */
export async function verifySignedValue(
  signed: string,
  purpose: string
): Promise<string | null> {
  const idx = signed.lastIndexOf('.')
  if (idx === -1) return null

  const encoded = signed.slice(0, idx)
  const sig = signed.slice(idx + 1)

  let key: CryptoKey
  let sigBytes: Uint8Array
  try {
    key = await deriveHmacKey(purpose)
    sigBytes = fromBase64Url(sig)
  } catch {
    return null
  }

  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    sigBytes as BufferSource,
    new TextEncoder().encode(encoded)
  )
  if (!valid) return null

  try {
    return new TextDecoder().decode(fromBase64Url(encoded))
  } catch {
    return null
  }
}
