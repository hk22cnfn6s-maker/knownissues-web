import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import GuideToggle from '@/components/GuideToggle'

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
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-base font-bold tracking-tight text-black">
          KnownIssues.co.uk
        </Link>
        <nav className="flex items-center gap-6">
          <span className="text-sm text-gray-400">Admin</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-sm text-gray-500 hover:text-black transition-colors">
              Log out
            </button>
          </form>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-black mb-8">Admin dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="border border-gray-200 rounded p-5">
            <p className="text-xs text-gray-400 mb-1">Registered users</p>
            <p className="text-2xl font-bold text-black">{totalUsers ?? 0}</p>
          </div>
          <div className="border border-gray-200 rounded p-5">
            <p className="text-xs text-gray-400 mb-1">Verified users</p>
            <p className="text-2xl font-bold text-black">{totalVerified ?? 0}</p>
          </div>
          <div className="border border-gray-200 rounded p-5">
            <p className="text-xs text-gray-400 mb-1">Total downloads</p>
            <p className="text-2xl font-bold text-black">{totalDownloads ?? 0}</p>
          </div>
        </div>

        {/* Recent registrations */}
        <section className="mb-12">
          <h2 className="text-sm font-semibold text-black mb-3">
            Recent registrations
          </h2>
          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-400">
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Signed up</th>
                </tr>
              </thead>
              <tbody>
                {(recentUsers ?? []).length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 text-gray-400" colSpan={2}>
                      No registrations yet.
                    </td>
                  </tr>
                ) : (
                  recentUsers!.map((u) => (
                    <tr key={`${u.email}-${u.created_at}`} className="border-t border-gray-100">
                      <td className="px-4 py-2 text-black">{u.email}</td>
                      <td className="px-4 py-2 text-gray-500">
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
        <section className="mb-12">
          <h2 className="text-sm font-semibold text-black mb-3">
            Recent downloads
          </h2>
          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-400">
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Guide</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">IP address</th>
                </tr>
              </thead>
              <tbody>
                {recentDownloads.length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 text-gray-400" colSpan={4}>
                      No downloads yet.
                    </td>
                  </tr>
                ) : (
                  recentDownloads.map((d, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-4 py-2 text-black">
                        {d.users_profile?.email ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {d.guides?.title ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-gray-500">
                        {formatDateTime(d.downloaded_at)}
                      </td>
                      <td className="px-4 py-2 text-gray-500">
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
          <h2 className="text-sm font-semibold text-black mb-3">
            Guide management
          </h2>
          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-400">
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Slug</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(guides ?? []).length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 text-gray-400" colSpan={3}>
                      No guides yet.
                    </td>
                  </tr>
                ) : (
                  guides!.map((g) => (
                    <tr key={g.id} className="border-t border-gray-100">
                      <td className="px-4 py-2 text-black">{g.title}</td>
                      <td className="px-4 py-2 text-gray-500">{g.slug}</td>
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
      </main>
    </div>
  )
}
