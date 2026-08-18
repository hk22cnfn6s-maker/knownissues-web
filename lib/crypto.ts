import crypto from 'crypto'

/**
 * All admin auth secrets (TOTP secret at rest, the pending-2fa session
 * payload, the post-2fa cookie) derive from this one env var via
 * purpose-scoped subkeys, rather than reusing the raw key across
 * different algorithms.
 */
function getMasterKey(): Buffer {
  const hex = process.env.TOTP_ENCRYPTION_KEY
  if (!hex) throw new Error('TOTP_ENCRYPTION_KEY is not set')
  const key = Buffer.from(hex, 'hex')
  if (key.length !== 32) {
    throw new Error('TOTP_ENCRYPTION_KEY must be a 32-byte hex string')
  }
  return key
}

function deriveKey(purpose: string): Buffer {
  return crypto.createHash('sha256').update(getMasterKey()).update(':').update(purpose).digest()
}

/** AES-256-GCM encrypt. Output: base64url(iv).base64url(authTag).base64url(ciphertext) */
export function encrypt(plaintext: string, purpose: string): string {
  const key = deriveKey(purpose)
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv, authTag, ciphertext].map((b) => b.toString('base64url')).join('.')
}

export function decrypt(payload: string, purpose: string): string {
  const [ivB64, tagB64, dataB64] = payload.split('.')
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('Malformed ciphertext')

  const key = deriveKey(purpose)
  const iv = Buffer.from(ivB64, 'base64url')
  const authTag = Buffer.from(tagB64, 'base64url')
  const data = Buffer.from(dataB64, 'base64url')

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}

/** HMAC-signs an arbitrary string for use as a tamper-evident cookie value. */
export function signValue(value: string, purpose: string): string {
  const key = deriveKey(purpose)
  const encoded = Buffer.from(value, 'utf8').toString('base64url')
  const sig = crypto.createHmac('sha256', key).update(encoded).digest('base64url')
  return `${encoded}.${sig}`
}

/** Verifies and decodes a value produced by signValue(). Returns null if invalid. */
export function verifySignedValue(signed: string, purpose: string): string | null {
  const idx = signed.lastIndexOf('.')
  if (idx === -1) return null

  const encoded = signed.slice(0, idx)
  const sig = signed.slice(idx + 1)
  const key = deriveKey(purpose)
  const expected = crypto.createHmac('sha256', key).update(encoded).digest('base64url')

  const sigBuf = Buffer.from(sig)
  const expectedBuf = Buffer.from(expected)
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null
  }

  try {
    return Buffer.from(encoded, 'base64url').toString('utf8')
  } catch {
    return null
  }
}
