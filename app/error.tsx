'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[unhandled render error]', error)
  }, [error])

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
        <div className="w-full max-w-sm bg-surface border border-border rounded-sm p-8 shadow-sm text-center">
          <h1 className="font-heading text-h4 text-text-primary mb-2">Something went wrong</h1>
          <p className="text-sm text-text-secondary mb-6">
            Please try again. If this keeps happening, come back a little later.
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={reset}
              className="min-h-[44px] px-5 rounded-sm bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="min-h-[44px] flex items-center justify-center px-5 rounded-sm border border-border text-text-secondary text-sm font-semibold hover:border-text-primary hover:text-text-primary transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
