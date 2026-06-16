import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 sm:px-6 py-6">
        <Link
          href="/"
          className="font-heading text-xl font-semibold text-text-primary tracking-tight"
        >
          KnownIssues<span className="text-accent">.co.uk</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-surface border border-border rounded-sm p-8 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  )
}
