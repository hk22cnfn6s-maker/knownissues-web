import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  try {
    const { token } = params
    const supabase = createServiceClient()

    // 1. Look up the token
    const { data: tokenRow, error: tokenError } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (tokenError || !tokenRow) {
      return NextResponse.redirect(`${siteUrl}/verify?error=invalid`)
    }

    if (tokenRow.used) {
      return NextResponse.redirect(`${siteUrl}/verify?error=used`)
    }

    if (new Date(tokenRow.expires_at) < new Date()) {
      return NextResponse.redirect(`${siteUrl}/verify?error=expired`)
    }

    // 2. Mark token as used
    const { error: updateTokenError } = await supabase
      .from('verification_tokens')
      .update({ used: true })
      .eq('id', tokenRow.id)

    if (updateTokenError) throw updateTokenError

    // 3. Mark user as verified
    const { error: profileError } = await supabase
      .from('users_profile')
      .update({ is_verified: true })
      .eq('id', tokenRow.user_id)

    if (profileError) throw profileError

    // 4. Redirect to login with a success flag
    return NextResponse.redirect(`${siteUrl}/login?verified=1`)
  } catch (err) {
    console.error('[verify-token]', err)
    return NextResponse.redirect(`${siteUrl}/verify?error=server`)
  }
}
