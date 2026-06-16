import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const service = createServiceClient()

  const { data: guide, error: fetchError } = await service
    .from('guides')
    .select('id, is_published')
    .eq('id', params.id)
    .single()

  if (fetchError || !guide) {
    return NextResponse.json({ error: 'Guide not found.' }, { status: 404 })
  }

  const { error: updateError } = await service
    .from('guides')
    .update({ is_published: !guide.is_published })
    .eq('id', params.id)

  if (updateError) {
    console.error('[admin/guides/toggle]', updateError)
    return NextResponse.json({ error: 'Failed to update guide.' }, { status: 500 })
  }

  return NextResponse.json({ is_published: !guide.is_published })
}
