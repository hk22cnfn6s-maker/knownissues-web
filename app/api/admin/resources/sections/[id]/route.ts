import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  display_order: z.number().int().optional(),
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

  const service = createServiceClient()
  const { data, error } = await service
    .from('resource_sections')
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      display_order: parsed.data.display_order ?? 0,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    console.error('[admin/resources/sections/update]', error)
    return NextResponse.json({ error: 'Failed to update section.' }, { status: 500 })
  }

  return NextResponse.json({ section: data })
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
  const { error } = await service.from('resource_sections').delete().eq('id', params.id)

  if (error) {
    console.error('[admin/resources/sections/delete]', error)
    return NextResponse.json({ error: 'Failed to delete section.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
