import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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
    guides: { id: string; title: string; slug: string; is_published: boolean } | null
  }> | null
}

export async function GET() {
  // Uses the service client because the `guides` table's own RLS only
  // allows authenticated + verified reads — this route must work for
  // anonymous visitors, so unpublished guides are filtered out by hand
  // below instead of relying on RLS for that part of the join.
  const service = createServiceClient()

  const { data, error } = await service
    .from('magazine_references')
    .select('*, magazine_reference_guides(guides(id, title, slug, is_published))')
    .eq('is_active', true)
    .order('magazine', { ascending: true })
    .order('issue_date', { ascending: true })

  if (error) {
    console.error('[magazine-references]', error)
    return NextResponse.json({ error: 'Failed to load magazine references.' }, { status: 500 })
  }

  const references = (data as RawReference[]).map((row) => {
    const { magazine_reference_guides, ...rest } = row
    return {
      ...rest,
      reference_type: rest.reference_type ?? 'print',
      guides: (magazine_reference_guides ?? [])
        .map((link) => link.guides)
        .filter((g): g is { id: string; title: string; slug: string; is_published: boolean } =>
          Boolean(g && g.is_published)
        )
        .map((g) => ({ id: g.id, title: g.title, slug: g.slug })),
    }
  })

  const grouped = new Map<string, typeof references>()
  for (const reference of references) {
    const list = grouped.get(reference.magazine) ?? []
    list.push(reference)
    grouped.set(reference.magazine, list)
  }

  const magazines = Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([magazine, refs]) => ({ magazine, references: refs }))

  return NextResponse.json({ magazines })
}
