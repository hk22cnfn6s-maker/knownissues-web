import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()

  // 1. Must be authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  // 2. Must be verified (service client bypasses RLS to check the flag)
  const service = createServiceClient()
  const { data: profile } = await service
    .from('users_profile')
    .select('is_verified')
    .eq('id', user.id)
    .single()

  if (!profile?.is_verified) {
    return NextResponse.json(
      { error: 'Please verify your email to access guides.' },
      { status: 403 }
    )
  }

  // 3. Return all published guides (the RLS policy also enforces this,
  //    but we query through the authed client so the policy applies)
  const { data: guides, error } = await supabase
    .from('guides')
    .select('id, title, slug, description, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[GET /api/guides]', error)
    return NextResponse.json({ error: 'Failed to load guides.' }, { status: 500 })
  }

  return NextResponse.json({ guides })
}
