import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_sections')
    .select('*, items:resource_items(*)')
    .order('display_order', { ascending: true })
    .order('display_order', { ascending: true, foreignTable: 'resource_items' })

  if (error) {
    console.error('[resources]', error)
    return NextResponse.json({ error: 'Failed to load resources.' }, { status: 500 })
  }

  return NextResponse.json({ sections: data })
}
