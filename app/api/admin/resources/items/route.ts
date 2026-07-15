import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

const schema = z.object({
  section_id: z.string().uuid('A section is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  url: z.string().url('Enter a valid URL'),
  badge: z.string().optional().nullable(),
  tag: z.string().optional().nullable(),
  display_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const service = createServiceClient()
  const { data, error } = await service
    .from('resource_items')
    .insert({
      section_id: parsed.data.section_id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      url: parsed.data.url,
      badge: parsed.data.badge || null,
      tag: parsed.data.tag || null,
      display_order: parsed.data.display_order ?? 0,
      is_active: parsed.data.is_active ?? true,
    })
    .select()
    .single()

  if (error) {
    console.error('[admin/resources/items]', error)
    return NextResponse.json({ error: 'Failed to create item.' }, { status: 500 })
  }

  return NextResponse.json({ item: data }, { status: 201 })
}
