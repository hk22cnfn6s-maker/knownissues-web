import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

const schema = z.object({
  magazine: z.string().min(1).optional(),
  reference_type: z.enum(['print', 'web']).optional(),
  issue_number: z.string().nullable().optional(),
  issue_date: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  article_title: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  guide_ids: z.array(z.string().uuid()).optional(),
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

  const { guide_ids, ...fields } = parsed.data

  if (Object.keys(fields).length === 0 && guide_ids === undefined) {
    return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })
  }

  const service = createServiceClient()

  if (Object.keys(fields).length > 0) {
    const { error } = await service
      .from('magazine_references')
      .update(fields)
      .eq('id', params.id)

    if (error) {
      console.error('[admin/magazine-references/update]', error)
      return NextResponse.json({ error: 'Failed to update reference.' }, { status: 500 })
    }
  }

  if (guide_ids !== undefined) {
    const { error: deleteError } = await service
      .from('magazine_reference_guides')
      .delete()
      .eq('reference_id', params.id)

    if (deleteError) {
      console.error('[admin/magazine-references/relink]', deleteError)
      return NextResponse.json({ error: 'Failed to update linked guides.' }, { status: 500 })
    }

    if (guide_ids.length > 0) {
      const { error: linkError } = await service
        .from('magazine_reference_guides')
        .insert(guide_ids.map((guide_id) => ({ reference_id: params.id, guide_id })))

      if (linkError) {
        console.error('[admin/magazine-references/relink]', linkError)
        return NextResponse.json({ error: 'Failed to update linked guides.' }, { status: 500 })
      }
    }
  }

  const { data: reference, error: fetchError } = await service
    .from('magazine_references')
    .select('*, magazine_reference_guides(guides(id, title, slug))')
    .eq('id', params.id)
    .single()

  if (fetchError || !reference) {
    console.error('[admin/magazine-references/refetch]', fetchError)
    return NextResponse.json({ error: 'Failed to load updated reference.' }, { status: 500 })
  }

  const { magazine_reference_guides, ...rest } = reference
  const updated = {
    ...rest,
    reference_type: rest.reference_type ?? 'print',
    guides: (magazine_reference_guides ?? [])
      .map((link: { guides: { id: string; title: string; slug: string } | null }) => link.guides)
      .filter(Boolean),
  }

  return NextResponse.json({ reference: updated })
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
  const { error } = await service.from('magazine_references').delete().eq('id', params.id)

  if (error) {
    console.error('[admin/magazine-references/delete]', error)
    return NextResponse.json({ error: 'Failed to delete reference.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
