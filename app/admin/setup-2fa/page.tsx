import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import TotpSetup from '@/components/admin/TotpSetup'

export const dynamic = 'force-dynamic'

export default async function Setup2faPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/login?redirectTo=/admin/setup-2fa')

  const service = createServiceClient()
  const { data: profile } = await service
    .from('users_profile')
    .select('totp_enabled, totp_verified_at')
    .eq('id', admin.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-dark-surface text-white px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-heading text-xl font-semibold tracking-tight">
          KnownIssues<span className="text-accent">.co.uk</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/admin"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            ← Admin dashboard
          </Link>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-heading text-h2 text-text-primary mb-2">
          Two-factor authentication
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          Protect the admin account with a second factor from an authenticator app.
        </p>

        <TotpSetup
          initialEnabled={profile?.totp_enabled ?? false}
          initialVerifiedAt={profile?.totp_verified_at ?? null}
        />
      </main>
    </div>
  )
}
