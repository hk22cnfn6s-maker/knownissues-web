import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyAdminCode } from '@/lib/admin-reauth'

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

  const { error: updateError } = await service
    .from('users_profile')
    .update({ totp_secret: null, totp_enabled: false, totp_verified_at: null })
    .eq('id', admin.id)

  if (updateError) {
    console.error('[admin/2fa/disable] update failed', updateError)
    return NextResponse.json(
      { error: 'Failed to disable two-factor authentication. Please try again.' },
      { status: 500 }
    )
  }

  await service.from('admin_recovery_codes').delete().not('id', 'is', null)

  return NextResponse.json({ success: true })
}
