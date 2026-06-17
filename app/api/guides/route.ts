import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { groupGuidesByManufacturer } from '@/lib/guide-display'
import type { Guide, Manufacturer } from '@/types'

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
  const [{ data: guides, error }, { data: manufacturers, error: manufacturersError }] =
    await Promise.all([
      supabase
        .from('guides')
        .select('id, title, slug, description, manufacturer_id, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('manufacturers')
        .select('id, name, slug, logo_filename, display_order, created_at')
        .order('display_order', { ascending: true }),
    ])

  if (error || manufacturersError) {
    console.error('[GET /api/guides]', error ?? manufacturersError)
    return NextResponse.json({ error: 'Failed to load guides.' }, { status: 500 })
  }

  const grouped = groupGuidesByManufacturer(
    (guides ?? []) as Guide[],
    (manufacturers ?? []) as Manufacturer[]
  )

  return NextResponse.json({ manufacturers: grouped })
}
