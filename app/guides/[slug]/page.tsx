import { notFound } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { extractYearRange } from '@/lib/guide-display'
import DownloadButton from '@/components/DownloadButton'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { Guide } from '@/types'

export const dynamic = 'force-dynamic'

const whatsCovered = [
  'Full model history and revisions',
  'Every engine explained honestly',
  'Common faults and what to look for',
  'Pre-purchase inspection checklist',
  'Real market values',
  'Running costs breakdown',
  'Specialist resources',
]

export default async function GuidePage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Guide content (title, description, "what's covered") is public
  // marketing content — fetched with the service client so anonymous
  // visitors can see the preview, bypassing the verified-only RLS policy.
  const service = createServiceClient()

  const { data: guide } = await service
    .from('guides')
    .select('id, title, slug, description, filename, is_published, created_at')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!guide) notFound()

  const g = guide as Guide
  const yearRange = extractYearRange(g.title)

  let isVerified = false
  if (user) {
    const { data: profile } = await service
      .from('users_profile')
      .select('is_verified')
      .eq('id', user.id)
      .single()
    isVerified = Boolean(profile?.is_verified)
  }

  let retryDate: string | null = null
  if (user && isVerified) {
    const windowStart = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString()

    const { data: recentDownload } = await service
      .from('downloads')
      .select('downloaded_at')
      .eq('user_id', user.id)
      .eq('guide_id', g.id)
      .gte('downloaded_at', windowStart)
      .order('downloaded_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (recentDownload) {
      const d = new Date(recentDownload.downloaded_at)
      d.setDate(d.getDate() + 30)
      retryDate = d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    }
  }

  return (
    <>
      <Header isAuthenticated={Boolean(user)} />

      {/* Hero */}
      <section className="bg-dark-surface text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <p className="text-xs text-white/50 mb-4">
            <a href="/guides" className="hover:text-white transition-colors">
              Guides
            </a>
            {' / '}
            <span className="text-white/70">{g.title}</span>
          </p>

          {yearRange && (
            <Badge variant="amber" className="mb-4">
              {yearRange}
            </Badge>
          )}

          <h1 className="font-heading text-3xl sm:text-h1 text-white text-balance mb-6">
            {g.title}
          </h1>

          <div className="w-12 h-1 bg-accent" />
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* What's covered */}
        <section className="mb-14">
          <h2 className="font-heading text-h3 text-text-primary mb-6">
            What's covered
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {whatsCovered.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                <svg
                  className="text-accent shrink-0 mt-0.5"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Preview / intro */}
        {g.description && (
          <section className="mb-14">
            <h2 className="font-heading text-h3 text-text-primary mb-4">Introduction</h2>
            <p className="text-base text-text-secondary leading-relaxed">{g.description}</p>
          </section>
        )}

        {/* Download / gate */}
        <section className="border-t border-border pt-10">
          {!user ? (
            <div className="bg-surface border border-border rounded-sm p-8 text-center">
              <h3 className="font-heading text-h4 text-text-primary mb-2">
                Register free to download the complete guide
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                Create a free account and we'll email you the full PDF instantly.
              </p>
              <Button href="/register" variant="primary">
                Register Free to Download
              </Button>
            </div>
          ) : !isVerified ? (
            <div className="bg-surface border border-border rounded-sm p-8 text-center">
              <h3 className="font-heading text-h4 text-text-primary mb-2">
                Verify your email to continue
              </h3>
              <p className="text-sm text-text-secondary">
                Check your inbox for the verification link we sent you.
              </p>
            </div>
          ) : retryDate ? (
            <div>
              <p className="text-sm text-accent-hover bg-accent/10 border border-accent/30 rounded-sm px-4 py-3 mb-4 max-w-md">
                You've already downloaded this guide recently. You can download
                it again after <strong>{retryDate}</strong>.
              </p>
              <Button variant="primary" disabled>
                Download guide (PDF)
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-text-muted mb-4">
                PDF · single download per 30 days
              </p>
              <DownloadButton slug={g.slug} />
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
