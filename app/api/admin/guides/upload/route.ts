import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { putObject } from '@/lib/r2'

export const dynamic = 'force-dynamic'

const MAX_SIZE = 50 * 1024 * 1024 // 50MB
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME
  if (!bucket) {
    return NextResponse.json({ error: 'Guide storage is not configured.' }, { status: 500 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 })
  }

  const pdf = formData.get('pdf')
  const title = formData.get('title')
  const slugRaw = formData.get('slug')
  const description = formData.get('description')
  const manufacturerId = formData.get('manufacturer_id')
  const isPublished = formData.get('is_published') === 'true'

  if (!(pdf instanceof File)) {
    return NextResponse.json({ error: 'A PDF file is required.' }, { status: 400 })
  }
  if (typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
  }
  if (typeof slugRaw !== 'string' || !slugRaw.trim()) {
    return NextResponse.json({ error: 'Slug is required.' }, { status: 400 })
  }
  if (typeof description !== 'string' || !description.trim()) {
    return NextResponse.json({ error: 'Description is required.' }, { status: 400 })
  }
  if (typeof manufacturerId !== 'string' || !manufacturerId.trim()) {
    return NextResponse.json({ error: 'Manufacturer is required.' }, { status: 400 })
  }

  const slug = slugRaw.trim().toLowerCase()
  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      { error: 'Slug must be lowercase letters, numbers, and hyphens only.' },
      { status: 400 }
    )
  }

  const isPdfMime = pdf.type === 'application/pdf'
  const isPdfExt = pdf.name.toLowerCase().endsWith('.pdf')
  if (!isPdfMime || !isPdfExt) {
    return NextResponse.json({ error: 'File must be a PDF.' }, { status: 400 })
  }

  if (pdf.size > MAX_SIZE) {
    return NextResponse.json({ error: 'PDF must be under 50MB.' }, { status: 400 })
  }

  const service = createServiceClient()

  const { data: existing, error: existingError } = await service
    .from('guides')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existingError) {
    console.error('[admin/guides/upload] slug check failed', existingError)
    return NextResponse.json({ error: 'Failed to validate slug. Please try again.' }, { status: 500 })
  }
  if (existing) {
    return NextResponse.json(
      { error: 'A guide with this slug already exists. Choose a different slug.' },
      { status: 400 }
    )
  }

  const filename = `${slug}.pdf`
  const buffer = Buffer.from(await pdf.arrayBuffer())

  try {
    await putObject(bucket, filename, buffer, 'application/pdf')
  } catch (err) {
    console.error('[admin/guides/upload] R2 upload failed', err)
    return NextResponse.json({ error: 'Failed to upload the PDF to storage.' }, { status: 500 })
  }

  const { data: guide, error: insertError } = await service
    .from('guides')
    .insert({
      title: title.trim(),
      slug,
      description: description.trim(),
      manufacturer_id: manufacturerId,
      is_published: isPublished,
      filename,
    })
    .select('id')
    .single()

  if (insertError || !guide) {
    console.error('[admin/guides/upload] db insert failed', insertError)
    const message =
      insertError?.code === '23503'
        ? 'The selected manufacturer no longer exists. Refresh and try again.'
        : insertError?.code === '23505'
          ? 'A guide with this slug already exists. Choose a different slug.'
          : 'The PDF was uploaded but the guide record could not be saved. Contact support.'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ success: true, guide_id: guide.id, filename })
}
