import { generateSecret, generateURI, verify } from 'otplib'

const ISSUER = 'KnownIssues.co.uk'
const ACCOUNT_LABEL = 'admin@knownissues.co.uk'

// Symmetric ±1 time-step (30s) tolerance for clock drift between the
// server and the admin's authenticator app.
const EPOCH_TOLERANCE_SECONDS = 30

export function generateTotpSecret(): string {
  return generateSecret()
}

export function buildOtpauthUrl(secret: string): string {
  return generateURI({ issuer: ISSUER, label: ACCOUNT_LABEL, secret })
}

export async function verifyTotpCode(token: string, secret: string): Promise<boolean> {
  const result = await verify({ secret, token, epochTolerance: EPOCH_TOLERANCE_SECONDS })
  return result.valid
}
