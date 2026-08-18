import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyTotpCode } from '@/lib/totp'
import { encrypt } from '@/lib/crypto'
import { generateRecoveryCodes, hashRecoveryCode } from '@/lib/recovery-codes'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const secret = typeof body?.secret === 'string' ? body.secret : null
  const code = typeof body?.code === 'string' ? body.code.trim() : null

  if (!secret || !code) {
    return NextResponse.json(
      { error: 'A secret and verification code are required.' },
      { status: 400 }
    )
  }

  const valid = await verifyTotpCode(code, secret)
  if (!valid) {
    return NextResponse.json(
      { error: 'Incorrect code. Check your authenticator app and try again.' },
      { status: 400 }
    )
  }

  const service = createServiceClient()

  const { error: updateError } = await service
    .from('users_profile')
    .update({
      totp_secret: encrypt(secret, 'totp-secret'),
      totp_enabled: true,
      totp_verified_at: new Date().toISOString(),
    })
    .eq('id', admin.id)

  if (updateError) {
    console.error('[admin/2fa/verify-setup] failed to save secret', updateError)
    return NextResponse.json(
      { error: 'Code verified, but the secret could not be saved. Please try again.' },
      { status: 500 }
    )
  }

  // Clear out any codes left over from an abandoned enrolment attempt.
  await service.from('admin_recovery_codes').delete().not('id', 'is', null)

  const recoveryCodes = generateRecoveryCodes()
  const { error: codesError } = await service
    .from('admin_recovery_codes')
    .insert(recoveryCodes.map((c) => ({ code_hash: hashRecoveryCode(c) })))

  if (codesError) {
    console.error('[admin/2fa/verify-setup] failed to save recovery codes', codesError)
    return NextResponse.json(
      {
        error:
          '2FA is enabled, but recovery codes could not be generated. Use "Generate new recovery codes" on this page to create them.',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, recoveryCodes })
}
