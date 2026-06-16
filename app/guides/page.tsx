import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Guide } from '@/types'

export const dynamic = 'force-dynamic'

export default async function GuidesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/guides')

  // Verify the user's email is confirmed
  const service = createServiceClient()
  const { data: profile } = await service
    .from('users_profile')
    .select('is_verified')
    .eq('id', user.id)
    .single()

  if (!profile?.is_verified) redirect('/verify')

  const { data: guides } = await service
    .from('guides')
    .select('id, title, slug, description, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-base font-bold tracking-tight text-black">
          KnownIssues.co.uk
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black transition-colors">
            Dashboard
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-sm text-gray-500 hover:text-black transition-colors">
              Log out
            </button>
          </form>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-black mb-1">Buyers guides</h1>
        <p className="text-sm text-gray-500 mb-8">
          Download any guide below. Each guide is available once every 30 days.
        </p>

        {!guides || guides.length === 0 ? (
          <p className="text-sm text-gray-400">No guides available yet.</p>
        ) : (
          <ul className="space-y-3">
            {(guides as Guide[]).map((guide) => (
              <li key={guide.id}>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="flex items-start justify-between gap-4 border border-gray-200 rounded px-5 py-4 hover:border-black transition-colors group"
                >
                  <div>
                    <p className="text-sm font-semibold text-black group-hover:underline underline-offset-2">
                      {guide.title}
                    </p>
                    {guide.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{guide.description}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-gray-400 mt-0.5">PDF →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
