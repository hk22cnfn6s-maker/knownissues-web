'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justVerified = searchParams.get('verified') === '1'
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed.')
        return
      }

      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="font-heading text-h3 text-text-primary mb-2">Welcome back</h1>
      <p className="text-sm text-text-secondary mb-8">
        Log in to download and manage your guides.
      </p>

      {justVerified && (
        <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-sm px-3 py-2 mb-4">
          Email verified — you can now log in.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-[44px] border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder-text-muted bg-surface focus:outline-none focus:border-accent transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full min-h-[44px] border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder-text-muted bg-surface focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={loading} className="w-full">
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <p className="text-sm text-text-secondary mt-6 text-center">
        No account?{' '}
        <Link href="/register" className="text-accent hover:text-accent-hover font-medium">
          Create one
        </Link>
      </p>
    </>
  )
}
