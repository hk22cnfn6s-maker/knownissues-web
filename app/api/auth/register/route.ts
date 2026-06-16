import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { sendVerificationEmail } from '@/lib/email'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data
    const supabase = createServiceClient()

    // 1. Create the auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // skip Supabase's own email — we handle it
      })

    if (authError) {
      // Surface duplicate-email as a friendly message
      if (authError.message.toLowerCase().includes('already')) {
        return NextResponse.json(
          { error: 'An account with that email already exists.' },
          { status: 409 }
        )
      }
      throw authError
    }

    const userId = authData.user.id

    // 2. Insert users_profile row (trigger may have already done this,
    //    use upsert to be safe)
    const { error: profileError } = await supabase
      .from('users_profile')
      .upsert({ id: userId, email, is_verified: false })

    if (profileError) throw profileError

    // 3. Generate a verification token (expire in 24 h)
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { error: tokenError } = await supabase
      .from('verification_tokens')
      .insert({ user_id: userId, token, expires_at: expiresAt })

    if (tokenError) throw tokenError

    // 4. Send verification email
    await sendVerificationEmail(email, token)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
