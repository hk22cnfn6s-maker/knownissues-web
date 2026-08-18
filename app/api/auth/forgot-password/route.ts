import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { getIpAddress } from '@/lib/request-ip'

const schema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const rate = await checkRateLimit('forgot-password', getIpAddress(request), {
      max: 5,
      windowMinutes: 60,
    })
    if (!rate.allowed) {
      // Same shape as the normal response — don't reveal rate-limit state
      // any more precisely than "try again later" to an anonymous caller.
      return NextResponse.json({ success: true })
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (parsed.success) {
      const { email } = parsed.data
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.knownissues.co.uk'
      const supabase = createClient()

      // Supabase generates the token and sends the email via the configured
      // provider — errors are swallowed so the response never reveals
      // whether the address is registered.
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/reset-password`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[forgot-password]', err)
    return NextResponse.json({ success: true })
  }
}
