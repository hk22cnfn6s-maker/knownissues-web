import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { generateTotpSecret, buildOtpauthUrl } from '@/lib/totp'

export const dynamic = 'force-dynamic'

export async function POST() {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const service = createServiceClient()
  const { data: profile } = await service
    .from('users_profile')
    .select('totp_enabled')
    .eq('id', admin.id)
    .single()

  if (profile?.totp_enabled) {
    return NextResponse.json(
      {
        error:
          'Two-factor authentication is already enabled. Disable it first to generate a new secret.',
      },
      { status: 409 }
    )
  }

  const secret = generateTotpSecret()
  const otpauthUrl = buildOtpauthUrl(secret)
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl)

  return NextResponse.json({ secret, otpauthUrl, qrDataUrl })
}
