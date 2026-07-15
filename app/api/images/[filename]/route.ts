import { NextRequest, NextResponse } from 'next/server'
import { getObjectBuffer } from '@/lib/r2'

export const dynamic = 'force-dynamic'

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const bucket = process.env.CLOUDFLARE_R2_IMAGES_BUCKET_NAME
  if (!bucket) {
    return NextResponse.json({ error: 'Image storage is not configured.' }, { status: 500 })
  }

  // Keep the key charset tight — R2 keys aren't filesystem paths, but there's
  // no reason to accept anything beyond what we ever generate ourselves.
  if (!/^[a-zA-Z0-9._-]+$/.test(params.filename)) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }

  const ext = params.filename.split('.').pop()?.toLowerCase() ?? ''
  const contentType = CONTENT_TYPES[ext]
  if (!contentType) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }

  try {
    const buffer = await getObjectBuffer(params.filename, bucket)
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(buffer.length),
      },
    })
  } catch (err) {
    console.error('[images]', err)
    return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }
}
