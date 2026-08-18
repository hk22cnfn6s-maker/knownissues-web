import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { decrypt, encrypt } from '@/lib/crypto'
import { checkRateLimit } from '@/lib/rate-limit'
import { getIpAddress } from '@/lib/request-ip'
import { verifyTotpCode } from '@/lib/totp'
import { consumeRecoveryCode } from '@/lib/recovery-codes'
import {
  PENDING_2FA_COOKIE,
  PENDING_2FA_TTL_SECONDS,
  MAX_2FA_ATTEMPTS,
  ADMIN_2FA_COOKIE,
  ADMIN_2FA_TTL_SECONDS,
  signAdmin2faCookie,
  type Pending2faPayload,
} from '@/lib/two-factor-cookies'

const schema = z.object({ code: z.string().min(1, 'Code is required') })

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

function expireSession(message: string) {
  const response = NextResponse.json({ error: message, redirectToLogin: true }, { status: 401 })
  response.cookies.delete(PENDING_2FA_COOKIE)
  return response
}

export async function POST(request: NextRequest) {
  try {
    const ip = getIpAddress(request)
    const rate = await checkRateLimit('verify-2fa', ip, { max: 5, windowMinutes: 15 })
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try logging in again later.' },
        { status: 429 }
      )
    }

    const cookieValue = request.cookies.get(PENDING_2FA_COOKIE)?.value
    if (!cookieValue) {
      return expireSession('Your session has expired. Please log in again.')
    }

    let pending: Pending2faPayload
    try {
      pending = JSON.parse(decrypt(cookieValue, 'pending-2fa'))
    } catch {
      return expireSession('Your session has expired. Please log in again.')
    }

    if (typeof pending.expiresAt !== 'number' || pending.expiresAt < Date.now()) {
      return expireSession('Your session has expired. Please log in again.')
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const code = parsed.data.code.trim()

    const service = createServiceClient()
    const { data: profile } = await service
      .from('users_profile')
      .select('totp_secret')
      .eq('id', pending.userId)
      .single()

    let valid = false
    if (profile?.totp_secret) {
      try {
        valid = await verifyTotpCode(code, decrypt(profile.totp_secret, 'totp-secret'))
      } catch (err) {
        console.error('[verify-2fa] decrypt failed', err)
      }
    }
    if (!valid) {
      valid = await consumeRecoveryCode(service, code)
    }

    if (!valid) {
      const attempts = pending.attempts + 1
      if (attempts >= MAX_2FA_ATTEMPTS) {
        return expireSession('Too many incorrect attempts. Please log in again.')
      }

      const response = NextResponse.json(
        { error: `Incorrect code. ${MAX_2FA_ATTEMPTS - attempts} attempt(s) remaining.` },
        { status: 400 }
      )
      const updated: Pending2faPayload = { ...pending, attempts }
      response.cookies.set(PENDING_2FA_COOKIE, encrypt(JSON.stringify(updated), 'pending-2fa'), {
        ...cookieOptions,
        maxAge: PENDING_2FA_TTL_SECONDS,
      })
      return response
    }

    // Success — persist the real Supabase session (tokens validated at
    // /api/auth/login, held in the pending cookie until now) and mark
    // this session as having passed 2FA.
    const supabase = createClient()
    await supabase.auth.setSession({
      access_token: pending.accessToken,
      refresh_token: pending.refreshToken,
    })

    const response = NextResponse.json({ success: true })
    response.cookies.delete(PENDING_2FA_COOKIE)
    response.cookies.set(ADMIN_2FA_COOKIE, await signAdmin2faCookie(pending.userId), {
      ...cookieOptions,
      maxAge: ADMIN_2FA_TTL_SECONDS,
    })
    return response
  } catch (err) {
    console.error('[verify-2fa]', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
