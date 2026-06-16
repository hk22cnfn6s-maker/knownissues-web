import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Belt-and-braces guard (middleware should catch this first)
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users_profile')
    .select('email, is_verified, created_at')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="text-base font-bold tracking-tight text-black">
          KnownIssues.co.uk
        </span>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            Log out
          </button>
        </form>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-black mb-2">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-8">
          Logged in as <span className="text-black font-medium">{profile?.email}</span>
        </p>

        <Link
          href="/guides"
          className="flex items-center justify-between border border-gray-200 rounded px-5 py-4 hover:border-black transition-colors group"
        >
          <div>
            <p className="text-sm font-semibold text-black">Buyers guides</p>
            <p className="text-sm text-gray-500 mt-0.5">Browse and download PDF guides</p>
          </div>
          <span className="text-gray-400 group-hover:text-black transition-colors">→</span>
        </Link>
      </main>
    </div>
  )
}
