import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  display_order: z.number().int().optional(),
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
    .from('resource_sections')
    .insert({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      display_order: parsed.data.display_order ?? 0,
    })
    .select()
    .single()

  if (error) {
    console.error('[admin/resources/sections]', error)
    return NextResponse.json({ error: 'Failed to create section.' }, { status: 500 })
  }

  return NextResponse.json({ section: { ...data, items: [] } }, { status: 201 })
}
