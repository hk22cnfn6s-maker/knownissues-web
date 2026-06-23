import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { groupGuidesByManufacturer } from '@/lib/guide-display'
import type { Guide, Manufacturer } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Public endpoint — returns only display-safe fields for published guides.
  // The service client bypasses RLS so this works for anonymous visitors.
  // Downloads and guide detail content remain protected in their own routes.
  const service = createServiceClient()

  const [{ data: guides, error }, { data: manufacturers, error: manufacturersError }] =
    await Promise.all([
      service
        .from('guides')
        .select('id, title, slug, description, manufacturer_id, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false }),
      service
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
