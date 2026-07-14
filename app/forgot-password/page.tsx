'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthLayout from '@/components/AuthLayout'
import Button from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <AuthLayout>
      {submitted ? (
        <>
          <h1 className="font-heading text-h3 text-text-primary mb-3">Check your email</h1>
          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            If an account exists for that email, a reset link has been sent. Check your inbox.
          </p>
          <Link href="/login" className="text-sm text-accent hover:text-accent-hover font-medium">
            Back to login
          </Link>
        </>
      ) : (
        <>
          <h1 className="font-heading text-h3 text-text-primary mb-2">Reset your password</h1>
          <p className="text-sm text-text-secondary mb-8">
            Enter your email address and we&apos;ll send you a reset link
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

            <Button type="submit" variant="primary" disabled={loading} className="w-full">
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>

          <p className="text-sm text-text-secondary mt-6 text-center">
            <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
              Back to login
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  )
}
