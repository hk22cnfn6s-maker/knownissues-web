import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const service = createServiceClient()

  const { data: manufacturers, error } = await service
    .from('manufacturers')
    .select('id, name, slug, display_order')
    .order('name', { ascending: true })

  if (error) {
    console.error('[GET /api/manufacturers]', error)
    return NextResponse.json({ error: 'Failed to load manufacturers.' }, { status: 500 })
  }

  return NextResponse.json({ manufacturers: manufacturers ?? [] })
}
