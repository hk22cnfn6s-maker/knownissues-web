import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import GuideToggle from '@/components/GuideToggle'
import ResourcesManager from '@/components/admin/ResourcesManager'
import MagazineReferencesManager from '@/components/admin/MagazineReferencesManager'

export const dynamic = 'force-dynamic'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/login?redirectTo=/admin')

  const service = createServiceClient()

  const [
    { count: totalUsers },
    { count: totalVerified },
    { count: totalDownloads },
    { data: recentUsers },
    { data: recentDownloadsRaw },
    { data: guides },
  ] = await Promise.all([
    service.from('users_profile').select('*', { count: 'exact', head: true }),
    service
      .from('users_profile')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true),
    service.from('downloads').select('*', { count: 'exact', head: true }),
    service
      .from('users_profile')
      .select('email, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    service
      .from('downloads')
      .select(
        'downloaded_at, ip_address, users_profile(email), guides(title)'
      )
      .order('downloaded_at', { ascending: false })
      .limit(10),
    service
      .from('guides')
      .select('id, title, slug, is_published, created_at')
      .order('created_at', { ascending: false }),
  ])

  const recentDownloads = (recentDownloadsRaw ?? []) as unknown as Array<{
    downloaded_at: string
    ip_address: string | null
    users_profile: { email: string } | null
    guides: { title: string } | null
  }>

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-dark-surface text-white px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-heading text-xl font-semibold tracking-tight">
          KnownIssues<span className="text-accent">.co.uk</span>
        </Link>
        <nav className="flex items-center gap-6">
          <span className="text-sm text-white/50">Admin</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-sm text-white/70 hover:text-white transition-colors">
              Log out
            </button>
          </form>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-heading text-h2 text-text-primary mb-8">Admin dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          <div className="bg-surface border border-border rounded-sm p-6">
            <p className="text-xs text-text-muted mb-1">Registered users</p>
            <p className="font-heading text-h2 text-text-primary">{totalUsers ?? 0}</p>
          </div>
          <div className="bg-surface border border-border rounded-sm p-6">
            <p className="text-xs text-text-muted mb-1">Verified users</p>
            <p className="font-heading text-h2 text-text-primary">{totalVerified ?? 0}</p>
          </div>
          <div className="bg-surface border border-border rounded-sm p-6">
            <p className="text-xs text-text-muted mb-1">Total downloads</p>
            <p className="font-heading text-h2 text-text-primary">{totalDownloads ?? 0}</p>
          </div>
        </div>

        {/* Recent registrations */}
        <section className="mb-14">
          <h2 className="font-heading text-h4 text-text-primary mb-4">
            Recent registrations
          </h2>
          <div className="bg-surface border border-border rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-background text-left text-xs text-text-muted">
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Signed up</th>
                </tr>
              </thead>
              <tbody>
                {(recentUsers ?? []).length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 text-text-muted" colSpan={2}>
                      No registrations yet.
                    </td>
                  </tr>
                ) : (
                  recentUsers!.map((u) => (
                    <tr key={`${u.email}-${u.created_at}`} className="border-t border-border">
                      <td className="px-4 py-2 text-text-primary">{u.email}</td>
                      <td className="px-4 py-2 text-text-secondary">
                        {formatDateTime(u.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent downloads */}
        <section className="mb-14">
          <h2 className="font-heading text-h4 text-text-primary mb-4">
            Recent downloads
          </h2>
          <div className="bg-surface border border-border rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-background text-left text-xs text-text-muted">
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Guide</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">IP address</th>
                </tr>
              </thead>
              <tbody>
                {recentDownloads.length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 text-text-muted" colSpan={4}>
                      No downloads yet.
                    </td>
                  </tr>
                ) : (
                  recentDownloads.map((d, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-2 text-text-primary">
                        {d.users_profile?.email ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-text-secondary">
                        {d.guides?.title ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-text-secondary">
                        {formatDateTime(d.downloaded_at)}
                      </td>
                      <td className="px-4 py-2 text-text-secondary">
                        {d.ip_address ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Guide management */}
        <section>
          <h2 className="font-heading text-h4 text-text-primary mb-4">
            Guide management
          </h2>
          <div className="bg-surface border border-border rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-background text-left text-xs text-text-muted">
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Slug</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(guides ?? []).length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 text-text-muted" colSpan={3}>
                      No guides yet.
                    </td>
                  </tr>
                ) : (
                  guides!.map((g) => (
                    <tr key={g.id} className="border-t border-border">
                      <td className="px-4 py-2 text-text-primary">{g.title}</td>
                      <td className="px-4 py-2 text-text-secondary">{g.slug}</td>
                      <td className="px-4 py-2">
                        <GuideToggle guideId={g.id} isPublished={g.is_published} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Affiliate resources */}
        <section className="mt-14">
          <ResourcesManager />
        </section>

        {/* Magazine references */}
        <section className="mt-14">
          <MagazineReferencesManager />
        </section>
      </main>
    </div>
  )
}
