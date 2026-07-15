import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

const schema = z.object({
  section_id: z.string().uuid().optional(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  url: z.string().url().optional(),
  badge: z.string().nullable().optional(),
  tag: z.string().nullable().optional(),
  display_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data, error } = await service
    .from('resource_items')
    .update(parsed.data)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    console.error('[admin/resources/items/update]', error)
    return NextResponse.json({ error: 'Failed to update item.' }, { status: 500 })
  }

  return NextResponse.json({ item: data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const service = createServiceClient()
  const { error } = await service.from('resource_items').delete().eq('id', params.id)

  if (error) {
    console.error('[admin/resources/items/delete]', error)
    return NextResponse.json({ error: 'Failed to delete item.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
