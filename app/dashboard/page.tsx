import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { extractYearRange } from '@/lib/guide-display'
import type { Guide } from '@/types'
import Header from '@/components/layout/Header'
import GuideCard from '@/components/ui/GuideCard'

export const dynamic = 'force-dynamic'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Belt-and-braces guard (middleware should catch this first)
  if (!user) redirect('/login')

  const service = createServiceClient()

  const [{ data: profile }, { data: guides }, { data: downloadsRaw }] =
    await Promise.all([
      service.from('users_profile').select('email').eq('id', user.id).single(),
      service
        .from('guides')
        .select('id, title, slug, description, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false }),
      service
        .from('downloads')
        .select('downloaded_at, guide_id, guides(title, slug)')
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false }),
    ])

  const downloads = (downloadsRaw ?? []) as unknown as Array<{
    downloaded_at: string
    guide_id: string
    guides: { title: string; slug: string } | null
  }>

  const downloadedGuideIds = new Set(downloads.map((d) => d.guide_id))
  const availableGuides = ((guides ?? []) as Guide[]).filter(
    (g) => !downloadedGuideIds.has(g.id)
  )

  return (
    <>
      <Header isAuthenticated />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-heading text-h2 text-text-primary mb-1">
          Good to have you, {profile?.email}
        </h1>
        <p className="text-sm text-text-secondary mb-12">
          Here's everything you've downloaded and what's still available.
        </p>

        <section className="mb-14">
          <h2 className="font-heading text-h4 text-text-primary mb-4">
            Your downloads
          </h2>

          {downloads.length === 0 ? (
            <p className="text-sm text-text-muted">
              You haven't downloaded any guides yet.
            </p>
          ) : (
            <div className="border border-border rounded-sm overflow-hidden bg-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background text-left text-xs text-text-muted">
                    <th className="px-4 py-2 font-medium">Guide</th>
                    <th className="px-4 py-2 font-medium">Downloaded</th>
                  </tr>
                </thead>
                <tbody>
                  {downloads.map((d, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-2 text-text-primary">
                        {d.guides?.title ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-text-secondary">
                        {formatDate(d.downloaded_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="font-heading text-h4 text-text-primary mb-4">
            Available guides
          </h2>

          {availableGuides.length === 0 ? (
            <p className="text-sm text-text-muted">
              You're all caught up — no new guides right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  title={guide.title}
                  slug={guide.slug}
                  description={guide.description}
                  badge={extractYearRange(guide.title)}
                  ctaLabel="View Guide"
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
