'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthLayout from '@/components/AuthLayout'
import Button from '@/components/ui/Button'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Registration failed.')
        return
      }

      router.push('/verify')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="font-heading text-h3 text-text-primary mb-2">
        Get your free buyers guide
      </h1>
      <p className="text-sm text-text-secondary mb-8">
        Create a free account to download expert used car guides.
      </p>

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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full min-h-[44px] border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder-text-muted bg-surface focus:outline-none focus:border-accent transition-colors"
            placeholder="At least 8 characters"
          />
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={loading} className="w-full">
          {loading ? 'Creating account…' : 'Create free account'}
        </Button>

        <p className="text-xs text-text-muted text-center pt-1">
          We'll email you a verification link. No spam, ever.
        </p>
      </form>

      <p className="text-sm text-text-secondary mt-6 text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
