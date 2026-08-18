import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient, createEphemeralClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { getIpAddress } from '@/lib/request-ip'
import { encrypt } from '@/lib/crypto'
import { PENDING_2FA_COOKIE, PENDING_2FA_TTL_SECONDS } from '@/lib/two-factor-cookies'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const ip = getIpAddress(request)
    const rate = await checkRateLimit('login', ip, { max: 10, windowMinutes: 15 })
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    // Validate credentials on a client that never writes cookies — the
    // admin account may still need a 2FA step before a real session is
    // committed to the response.
    const ephemeral = createEphemeralClient()
    const { data, error } = await ephemeral.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
      return NextResponse.json(
        { error: 'Incorrect email or password.' },
        { status: 401 }
      )
    }

    // Check verification / 2FA status using the service client (bypasses RLS)
    const service = createServiceClient()
    const { data: profile, error: profileError } = await service
      .from('users_profile')
      .select('is_verified, totp_enabled')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Account not found. Please register.' },
        { status: 403 }
      )
    }

    if (!profile.is_verified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in.', unverified: true },
        { status: 403 }
      )
    }

    const adminEmail = process.env.ADMIN_EMAIL
    const isAdmin = !!adminEmail && email === adminEmail

    if (isAdmin && profile.totp_enabled) {
      const payload = JSON.stringify({
        userId: data.user.id,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        attempts: 0,
        expiresAt: Date.now() + PENDING_2FA_TTL_SECONDS * 1000,
      })

      const response = NextResponse.json({ requires2fa: true })
      response.cookies.set(PENDING_2FA_COOKIE, encrypt(payload, 'pending-2fa'), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: PENDING_2FA_TTL_SECONDS,
      })
      return response
    }

    // No 2FA required — persist the session for real via the
    // cookie-writing client, using the tokens we already validated above.
    const supabase = createClient()
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
