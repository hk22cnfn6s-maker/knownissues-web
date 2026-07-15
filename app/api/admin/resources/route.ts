import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const service = createServiceClient()

  const { data, error } = await service
    .from('resource_sections')
    .select('*, items:resource_items(*)')
    .order('display_order', { ascending: true })
    .order('display_order', { ascending: true, foreignTable: 'resource_items' })

  if (error) {
    console.error('[admin/resources]', error)
    return NextResponse.json({ error: 'Failed to load resources.' }, { status: 500 })
  }

  return NextResponse.json({ sections: data })
}
