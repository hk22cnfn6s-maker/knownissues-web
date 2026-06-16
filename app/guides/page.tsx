import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { extractYearRange } from '@/lib/guide-display'
import type { Guide } from '@/types'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GuideCard from '@/components/ui/GuideCard'

export const dynamic = 'force-dynamic'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function GuidesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/guides')

  const service = createServiceClient()
  const { data: profile } = await service
    .from('users_profile')
    .select('is_verified')
    .eq('id', user.id)
    .single()

  if (!profile?.is_verified) redirect('/verify')

  const [{ data: guides }, { data: downloadsRaw }] = await Promise.all([
    service
      .from('guides')
      .select('id, title, slug, description, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
    service
      .from('downloads')
      .select('downloaded_at, guides(title, slug)')
      .eq('user_id', user.id)
      .order('downloaded_at', { ascending: false }),
  ])

  const downloads = (downloadsRaw ?? []) as unknown as Array<{
    downloaded_at: string
    guides: { title: string; slug: string } | null
  }>

  return (
    <>
      <Header isAuthenticated />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-heading text-h2 text-text-primary mb-2">
          Welcome back — your guides are ready to download
        </h1>
        <p className="text-sm text-text-secondary mb-12">
          Each guide is available once every 30 days.
        </p>

        {downloads.length > 0 && (
          <section className="mb-14">
            <h2 className="font-heading text-h4 text-text-primary mb-4">
              Your downloads
            </h2>
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
          </section>
        )}

        <section>
          <h2 className="font-heading text-h4 text-text-primary mb-4">
            Available guides
          </h2>

          {!guides || guides.length === 0 ? (
            <p className="text-text-muted">No guides available yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(guides as Guide[]).map((guide) => (
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

      <Footer />
    </>
  )
}
