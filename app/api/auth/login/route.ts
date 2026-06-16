import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
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

    // Use anon client so the session cookie is set correctly
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: 'Incorrect email or password.' },
        { status: 401 }
      )
    }

    // Check is_verified using the service client (bypasses RLS)
    const service = createServiceClient()
    const { data: profile, error: profileError } = await service
      .from('users_profile')
      .select('is_verified')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Account not found. Please register.' },
        { status: 403 }
      )
    }

    if (!profile.is_verified) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Please verify your email before logging in.', unverified: true },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
