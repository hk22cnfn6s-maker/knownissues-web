import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import DownloadButton from '@/components/DownloadButton'
import type { Guide } from '@/types'

export const dynamic = 'force-dynamic'

export default async function GuidePage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login?redirectTo=/guides/${params.slug}`)

  const service = createServiceClient()

  // Verified check
  const { data: profile } = await service
    .from('users_profile')
    .select('is_verified')
    .eq('id', user.id)
    .single()

  if (!profile?.is_verified) redirect('/verify')

  // Fetch the guide
  const { data: guide } = await service
    .from('guides')
    .select('id, title, slug, description, filename, is_published, created_at')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!guide) notFound()

  const g = guide as Guide

  // Check if the user has a recent download so we can surface the
  // rate-limit state before they even click the button.
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

  const retryDate = recentDownload
    ? (() => {
        const d = new Date(recentDownload.downloaded_at)
        d.setDate(d.getDate() + 30)
        return d.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      })()
    : null

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-base font-bold tracking-tight text-black">
          KnownIssues.co.uk
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/guides" className="text-sm text-gray-500 hover:text-black transition-colors">
            ← All guides
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-sm text-gray-500 hover:text-black transition-colors">
              Log out
            </button>
          </form>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <p className="text-xs text-gray-400 mb-6">
          <Link href="/guides" className="hover:text-black transition-colors">
            Guides
          </Link>
          {' / '}
          <span className="text-gray-600">{g.title}</span>
        </p>

        <h1 className="text-2xl font-bold text-black mb-3">{g.title}</h1>

        {g.description && (
          <p className="text-sm text-gray-600 leading-relaxed mb-8">
            {g.description}
          </p>
        )}

        <div className="border-t border-gray-100 pt-8">
          {retryDate ? (
            <div>
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-4 py-3 mb-4 max-w-md">
                You've already downloaded this guide recently. You can download
                it again after <strong>{retryDate}</strong>.
              </p>
              <button
                disabled
                className="inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded opacity-40 cursor-not-allowed"
              >
                Download guide (PDF)
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-400 mb-4">
                PDF · single download per 30 days
              </p>
              <DownloadButton slug={g.slug} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
