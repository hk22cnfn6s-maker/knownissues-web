import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

type RawReference = {
  id: string
  magazine: string
  issue_number: string | null
  issue_date: string | null
  article_title: string | null
  url: string | null
  notes: string | null
  reference_type: string | null
  display_order: number
  is_active: boolean
  created_at: string
  magazine_reference_guides: Array<{
    guides: { id: string; title: string; slug: string } | null
  }> | null
}

function toReference(row: RawReference) {
  const { magazine_reference_guides, ...rest } = row
  return {
    ...rest,
    reference_type: rest.reference_type ?? 'print',
    guides: (magazine_reference_guides ?? [])
      .map((link) => link.guides)
      .filter((g): g is { id: string; title: string; slug: string } => Boolean(g)),
  }
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const service = createServiceClient()

  const [{ data: references, error }, { data: guides, error: guidesError }] = await Promise.all([
    service
      .from('magazine_references')
      .select('*, magazine_reference_guides(guides(id, title, slug))')
      .order('magazine', { ascending: true })
      .order('issue_date', { ascending: true }),
    service
      .from('guides')
      .select('id, title, slug')
      .eq('is_published', true)
      .order('title', { ascending: true }),
  ])

  if (error || guidesError) {
    console.error('[admin/magazine-references]', error ?? guidesError)
    return NextResponse.json({ error: 'Failed to load magazine references.' }, { status: 500 })
  }

  return NextResponse.json({
    references: (references as RawReference[]).map(toReference),
    guides: guides ?? [],
  })
}

const schema = z.object({
  magazine: z.string().min(1, 'Magazine / source name is required'),
  reference_type: z.enum(['print', 'web']).optional(),
  issue_number: z.string().optional().nullable(),
  issue_date: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  article_title: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  guide_ids: z.array(z.string().uuid()).optional(),
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
  const { guide_ids, ...fields } = parsed.data

  const { data: reference, error } = await service
    .from('magazine_references')
    .insert({
      magazine: fields.magazine,
      reference_type: fields.reference_type ?? 'print',
      issue_number: fields.issue_number || null,
      issue_date: fields.issue_date || null,
      url: fields.url || null,
      article_title: fields.article_title || null,
      notes: fields.notes || null,
      is_active: fields.is_active ?? true,
    })
    .select()
    .single()

  if (error || !reference) {
    console.error('[admin/magazine-references]', error)
    return NextResponse.json({ error: 'Failed to create reference.' }, { status: 500 })
  }

  let guides: { id: string; title: string; slug: string }[] = []

  if (guide_ids && guide_ids.length > 0) {
    const { error: linkError } = await service
      .from('magazine_reference_guides')
      .insert(guide_ids.map((guide_id) => ({ reference_id: reference.id, guide_id })))

    if (linkError) {
      console.error('[admin/magazine-references/link]', linkError)
      return NextResponse.json({ error: 'Failed to link guides.' }, { status: 500 })
    }

    const { data: linkedGuides } = await service
      .from('guides')
      .select('id, title, slug')
      .in('id', guide_ids)

    guides = linkedGuides ?? []
  }

  return NextResponse.json({ reference: { ...reference, guides } }, { status: 201 })
}
