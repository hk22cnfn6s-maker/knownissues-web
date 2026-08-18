import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyAdminCode } from '@/lib/admin-reauth'
import { generateRecoveryCodes, hashRecoveryCode } from '@/lib/recovery-codes'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const code = typeof body?.code === 'string' ? body.code.trim() : null
  if (!code) {
    return NextResponse.json({ error: 'A verification code is required.' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: profile } = await service
    .from('users_profile')
    .select('totp_secret, totp_enabled')
    .eq('id', admin.id)
    .single()

  if (!profile?.totp_enabled || !profile.totp_secret) {
    return NextResponse.json(
      { error: 'Two-factor authentication is not enabled.' },
      { status: 400 }
    )
  }

  const valid = await verifyAdminCode(service, profile.totp_secret, code)
  if (!valid) {
    return NextResponse.json({ error: 'Incorrect code.' }, { status: 400 })
  }

  await service.from('admin_recovery_codes').delete().not('id', 'is', null)

  const recoveryCodes = generateRecoveryCodes()
  const { error: codesError } = await service
    .from('admin_recovery_codes')
    .insert(recoveryCodes.map((c) => ({ code_hash: hashRecoveryCode(c) })))

  if (codesError) {
    console.error('[admin/2fa/regenerate-codes] insert failed', codesError)
    return NextResponse.json(
      { error: 'Failed to generate new recovery codes. Please try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, recoveryCodes })
}
