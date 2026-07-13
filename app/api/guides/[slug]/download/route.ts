import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getObjectBuffer } from '@/lib/r2'
import { watermarkPdf } from '@/lib/watermark'
import { sendGuideDeliveryEmail } from '@/lib/email'

const RATE_LIMIT_DAYS = 30

function getIpAddress(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

/** Returns the earliest date the user/IP can download again, or null if they're clear. */
function nextAllowedDate(downloadedAt: string): Date {
  const d = new Date(downloadedAt)
  d.setDate(d.getDate() + RATE_LIMIT_DAYS)
  return d
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient()

    // ── 1. Auth check ──────────────────────────────────────────────────────────
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const service = createServiceClient()

    // ── 2. Verified check ──────────────────────────────────────────────────────
    const { data: profile } = await service
      .from('users_profile')
      .select('is_verified')
      .eq('id', user.id)
      .single()

    if (!profile?.is_verified) {
      return NextResponse.json(
        { error: 'Please verify your email to download guides.' },
        { status: 403 }
      )
    }

    // ── 3. Resolve guide ───────────────────────────────────────────────────────
    const { data: guide, error: guideError } = await service
      .from('guides')
      .select('id, filename, title')
      .eq('slug', params.slug)
      .eq('is_published', true)
      .single()

    if (guideError || !guide) {
      return NextResponse.json({ error: 'Guide not found.' }, { status: 404 })
    }

    // ── 4. Rate limiting ───────────────────────────────────────────────────────
    const windowStart = new Date(
      Date.now() - RATE_LIMIT_DAYS * 24 * 60 * 60 * 1000
    ).toISOString()

    const ipAddress = getIpAddress(request)

    // Check by user_id
    const { data: userDownload } = await service
      .from('downloads')
      .select('downloaded_at')
      .eq('user_id', user.id)
      .eq('guide_id', guide.id)
      .gte('downloaded_at', windowStart)
      .order('downloaded_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (userDownload) {
      const again = nextAllowedDate(userDownload.downloaded_at)
      return NextResponse.json(
        {
          error: `You've already downloaded this guide recently. You can download it again after ${formatDate(again)}.`,
          retryAfter: again.toISOString(),
        },
        { status: 429 }
      )
    }

    // Check by IP address (only if IP is known)
    if (ipAddress !== 'unknown') {
      const { data: ipDownload } = await service
        .from('downloads')
        .select('downloaded_at')
        .eq('ip_address', ipAddress)
        .eq('guide_id', guide.id)
        .gte('downloaded_at', windowStart)
        .order('downloaded_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (ipDownload) {
        const again = nextAllowedDate(ipDownload.downloaded_at)
        return NextResponse.json(
          {
            error: `This guide was recently downloaded from your network. You can download it again after ${formatDate(again)}.`,
            retryAfter: again.toISOString(),
          },
          { status: 429 }
        )
      }
    }

    // ── 5. Fetch the raw PDF from R2 and stamp it with a per-download watermark ─
    const rawPdf = await getObjectBuffer(guide.filename)
    const watermarkedPdf = await watermarkPdf(rawPdf, user.email ?? 'unknown user')

    // ── 6. Log the download (before serving the file) ──────────────────────────
    const { error: insertError } = await service.from('downloads').insert({
      user_id: user.id,
      guide_id: guide.id,
      ip_address: ipAddress,
    })

    if (insertError) {
      // Non-fatal: file is ready — log but still serve it
      console.error('[download] failed to log download:', insertError)
    }

    // ── 7. Email the watermarked guide to the user (non-fatal if it fails) ─────
    if (user.email) {
      try {
        await sendGuideDeliveryEmail(user.email, guide.title, watermarkedPdf, guide.filename)
      } catch (emailError) {
        console.error('[download] failed to send delivery email:', emailError)
      }
    }

    // ── 8. Serve the watermarked PDF directly ───────────────────────────────────
    // Copy into a plain Uint8Array — Buffer's ArrayBufferLike type isn't
    // directly assignable to the DOM BodyInit/BlobPart types.
    const body = new Uint8Array(watermarkedPdf)

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${guide.filename}"`,
        'Content-Length': String(watermarkedPdf.length),
      },
    })
  } catch (err) {
    console.error('[POST /api/guides/[slug]/download]', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
