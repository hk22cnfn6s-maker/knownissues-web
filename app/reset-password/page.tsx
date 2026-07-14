'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthLayout from '@/components/AuthLayout'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

type Status = 'checking' | 'ready' | 'expired'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('checking')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Supabase appends #error=...&error_code=...&error_description=... to
    // the redirect URL when the recovery link is invalid or has expired.
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    if (hashParams.get('error')) {
      setStatus('expired')
      return
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('ready')
      }
    })

    // Covers the case where the recovery session was already established
    // (and the event already fired) before this listener was attached.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus((current) => (current === 'checking' && session ? 'ready' : current))
    })

    const timeout = setTimeout(() => {
      setStatus((current) => (current === 'checking' ? 'expired' : current))
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setStatus('expired')
        return
      }

      router.push('/login?reset=1')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      {status === 'checking' && (
        <p className="text-sm text-text-secondary text-center py-8">
          Verifying your reset link…
        </p>
      )}

      {status === 'expired' && (
        <>
          <h1 className="font-heading text-h3 text-text-primary mb-3">Link not valid</h1>
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2 mb-6">
            This reset link has expired. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="text-sm text-accent hover:text-accent-hover font-medium"
          >
            Request a new reset link
          </Link>
        </>
      )}

      {status === 'ready' && (
        <>
          <h1 className="font-heading text-h3 text-text-primary mb-2">Set a new password</h1>
          <p className="text-sm text-text-secondary mb-8">
            Choose a new password for your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                New password
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-text-primary mb-1"
              >
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full min-h-[44px] border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder-text-muted bg-surface focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" disabled={loading} className="w-full">
              {loading ? 'Updating…' : 'Set new password'}
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  )
}
