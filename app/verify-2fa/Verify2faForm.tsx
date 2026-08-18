'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function Verify2faForm() {
  const router = useRouter()
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Verification failed.')
        if (data.redirectToLogin) {
          router.push('/login')
        }
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="font-heading text-h3 text-text-primary mb-2">Two-factor authentication</h1>
      <p className="text-sm text-text-secondary mb-8">
        Enter the 6-digit code from your authenticator app
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-text-primary mb-1">
            {useRecoveryCode ? 'Recovery code' : 'Verification code'}
          </label>
          {useRecoveryCode ? (
            <input
              id="code"
              type="text"
              autoComplete="one-time-code"
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full min-h-[44px] border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder-text-muted bg-surface focus:outline-none focus:border-accent transition-colors text-center tracking-[0.2em] font-mono"
              placeholder="XXXXXXXXXX"
            />
          ) : (
            <input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="one-time-code"
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full min-h-[44px] border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder-text-muted bg-surface focus:outline-none focus:border-accent transition-colors text-center tracking-[0.3em] font-mono"
              placeholder="123456"
            />
          )}
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={loading} className="w-full">
          {loading ? 'Verifying…' : 'Verify'}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => {
          setUseRecoveryCode((v) => !v)
          setCode('')
          setError(null)
        }}
        className="block w-full text-sm text-text-muted hover:text-accent transition-colors mt-4 text-center"
      >
        {useRecoveryCode ? 'Use an authenticator code instead' : 'Use a recovery code instead'}
      </button>

      <p className="text-sm text-text-secondary mt-6 text-center">
        <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
          Back to login
        </Link>
      </p>
    </>
  )
}
