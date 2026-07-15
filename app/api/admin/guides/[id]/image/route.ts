import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { putObject, deleteObject } from '@/lib/r2'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const ALLOWED_TYPES: Record<string, 'jpg' | 'png' | 'webp'> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const bucket = process.env.CLOUDFLARE_R2_IMAGES_BUCKET_NAME
  if (!bucket) {
    return NextResponse.json({ error: 'Image storage is not configured.' }, { status: 500 })
  }

  const service = createServiceClient()
  const { data: guide, error: guideError } = await service
    .from('guides')
    .select('id, slug, cover_image')
    .eq('id', params.id)
    .single()

  if (guideError || !guide) {
    return NextResponse.json({ error: 'Guide not found.' }, { status: 404 })
  }

  const formData = await request.formData()
  const file = formData.get('image')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No image file provided.' }, { status: 400 })
  }

  const ext = ALLOWED_TYPES[file.type]
  if (!ext) {
    return NextResponse.json(
      { error: 'Unsupported file type. Use JPG, PNG, or WebP.' },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Image must be under 5MB.' }, { status: 400 })
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer())

  let resized: Buffer
  try {
    const pipeline = sharp(inputBuffer).resize(1200, 800, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    resized = await (ext === 'jpg' ? pipeline.jpeg() : pipeline.toFormat(ext)).toBuffer()
  } catch (err) {
    console.error('[admin/guides/image] resize failed', err)
    return NextResponse.json({ error: 'Could not process image.' }, { status: 400 })
  }

  const filename = `${guide.slug}-cover.${ext}`

  try {
    await putObject(bucket, filename, resized, file.type)
  } catch (err) {
    console.error('[admin/guides/image] upload failed', err)
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 })
  }

  // Clean up the old object if this replaces an image with a different extension
  if (guide.cover_image && guide.cover_image !== filename) {
    try {
      await deleteObject(bucket, guide.cover_image)
    } catch (err) {
      console.error('[admin/guides/image] cleanup of old image failed', err)
    }
  }

  const { error: updateError } = await service
    .from('guides')
    .update({ cover_image: filename })
    .eq('id', params.id)

  if (updateError) {
    console.error('[admin/guides/image] db update failed', updateError)
    return NextResponse.json({ error: 'Image uploaded but failed to save.' }, { status: 500 })
  }

  return NextResponse.json({ cover_image: filename })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const bucket = process.env.CLOUDFLARE_R2_IMAGES_BUCKET_NAME
  if (!bucket) {
    return NextResponse.json({ error: 'Image storage is not configured.' }, { status: 500 })
  }

  const service = createServiceClient()
  const { data: guide, error: guideError } = await service
    .from('guides')
    .select('id, cover_image')
    .eq('id', params.id)
    .single()

  if (guideError || !guide) {
    return NextResponse.json({ error: 'Guide not found.' }, { status: 404 })
  }

  if (guide.cover_image) {
    try {
      await deleteObject(bucket, guide.cover_image)
    } catch (err) {
      console.error('[admin/guides/image] delete from R2 failed', err)
    }
  }

  const { error: updateError } = await service
    .from('guides')
    .update({ cover_image: null })
    .eq('id', params.id)

  if (updateError) {
    console.error('[admin/guides/image] db update failed', updateError)
    return NextResponse.json({ error: 'Failed to remove image.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
