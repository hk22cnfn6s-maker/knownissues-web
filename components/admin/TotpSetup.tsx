'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Phase = 'status' | 'enrolling' | 'recovery-codes' | 'reauth-disable' | 'reauth-regenerate'

interface EnrollmentData {
  secret: string
  qrDataUrl: string
}

const fieldClasses =
  'w-full min-h-[44px] border border-border rounded-sm px-3 py-2 text-sm text-text-primary bg-background focus:outline-none focus:border-accent transition-colors disabled:opacity-50 text-center tracking-[0.3em] font-mono'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function RecoveryCodesDisplay({
  codes,
  onContinue,
  continueLabel,
}: {
  codes: string[]
  onContinue: () => void
  continueLabel: string
}) {
  const [saved, setSaved] = useState(false)

  return (
    <div className="bg-surface border border-border rounded-sm p-4 sm:p-6 space-y-4">
      <div>
        <h2 className="font-heading text-h4 text-text-primary mb-1">Save your recovery codes</h2>
        <p className="text-sm text-text-secondary">
          Each code can be used once to sign in if you lose access to your authenticator app.
          They won&apos;t be shown again — store them somewhere safe.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-background border border-border rounded-sm p-4 font-mono text-sm text-text-primary">
        {codes.map((c) => (
          <div key={c}>{c}</div>
        ))}
      </div>

      <label className="flex items-center gap-3 min-h-[44px]">
        <input
          type="checkbox"
          checked={saved}
          onChange={(e) => setSaved(e.target.checked)}
          className="w-5 h-5 accent-[color:var(--color-accent)]"
        />
        <span className="text-sm text-text-primary">I&apos;ve saved these codes somewhere safe</span>
      </label>

      <button
        type="button"
        disabled={!saved}
        onClick={onContinue}
        className="w-full sm:w-auto min-h-[48px] px-6 rounded-sm bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {continueLabel}
      </button>
    </div>
  )
}

function ReauthForm({
  title,
  description,
  confirmLabel,
  danger,
  loading,
  error,
  onCancel,
  onConfirm,
}: {
  title: string
  description: string
  confirmLabel: string
  danger?: boolean
  loading: boolean
  error: string | null
  onCancel: () => void
  onConfirm: (code: string) => void
}) {
  const [code, setCode] = useState('')

  return (
    <div className="bg-surface border border-border rounded-sm p-4 sm:p-6 space-y-4">
      <div>
        <h2 className="font-heading text-h4 text-text-primary mb-1">{title}</h2>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>

      <input
        type="text"
        inputMode="text"
        autoComplete="one-time-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={loading}
        placeholder="6-digit code or recovery code"
        className={fieldClasses}
      />

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          disabled={loading || !code.trim()}
          onClick={() => onConfirm(code.trim())}
          className={`min-h-[44px] px-5 rounded-sm text-sm font-semibold transition-colors disabled:opacity-50 ${
            danger
              ? 'bg-red-700 text-white hover:bg-red-800'
              : 'bg-accent text-white hover:bg-accent-hover'
          }`}
        >
          {loading ? 'Checking…' : confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="min-h-[44px] px-5 rounded-sm border border-border text-text-secondary text-sm font-semibold hover:border-text-primary hover:text-text-primary transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function TotpSetup({
  initialEnabled,
  initialVerifiedAt,
}: {
  initialEnabled: boolean
  initialVerifiedAt: string | null
}) {
  const router = useRouter()

  const [enabled, setEnabled] = useState(initialEnabled)
  const [verifiedAt, setVerifiedAt] = useState(initialVerifiedAt)
  const [phase, setPhase] = useState<Phase>('status')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null)
  const [enrollCode, setEnrollCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [recoveryContext, setRecoveryContext] = useState<'enroll' | 'regenerate'>('enroll')

  async function startEnrolment() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/2fa/generate', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to start setup.')
        return
      }
      setEnrollment({ secret: data.secret, qrDataUrl: data.qrDataUrl })
      setEnrollCode('')
      setPhase('enrolling')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function confirmEnrolment() {
    if (!enrollment) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/2fa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: enrollment.secret, code: enrollCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Incorrect code.')
        return
      }
      setEnabled(true)
      setVerifiedAt(new Date().toISOString())
      setRecoveryCodes(data.recoveryCodes)
      setRecoveryContext('enroll')
      setPhase('recovery-codes')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDisable(code: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Incorrect code.')
        return
      }
      setEnabled(false)
      setVerifiedAt(null)
      setPhase('status')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerateCodes(code: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/2fa/regenerate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Incorrect code.')
        return
      }
      setRecoveryCodes(data.recoveryCodes)
      setRecoveryContext('regenerate')
      setPhase('recovery-codes')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (phase === 'recovery-codes' && recoveryCodes) {
    return (
      <RecoveryCodesDisplay
        codes={recoveryCodes}
        continueLabel={recoveryContext === 'enroll' ? 'Continue to dashboard' : 'Done'}
        onContinue={() => {
          setRecoveryCodes(null)
          if (recoveryContext === 'enroll') {
            router.push('/admin')
          } else {
            setPhase('status')
          }
        }}
      />
    )
  }

  if (phase === 'reauth-disable') {
    return (
      <ReauthForm
        title="Confirm code to disable 2FA"
        description="Enter a current code from your authenticator app, or a recovery code."
        confirmLabel="Disable 2FA"
        danger
        loading={loading}
        error={error}
        onCancel={() => {
          setError(null)
          setPhase('status')
        }}
        onConfirm={handleDisable}
      />
    )
  }

  if (phase === 'reauth-regenerate') {
    return (
      <ReauthForm
        title="Confirm code to generate new recovery codes"
        description="This invalidates your existing recovery codes. Enter a current code from your authenticator app, or a recovery code."
        confirmLabel="Generate new codes"
        loading={loading}
        error={error}
        onCancel={() => {
          setError(null)
          setPhase('status')
        }}
        onConfirm={handleRegenerateCodes}
      />
    )
  }

  if (phase === 'enrolling' && enrollment) {
    return (
      <div className="bg-surface border border-border rounded-sm p-4 sm:p-6 space-y-5">
        <div>
          <h2 className="font-heading text-h4 text-text-primary mb-1">Scan the QR code</h2>
          <p className="text-sm text-text-secondary">
            Scan with Google Authenticator, Authy, or any TOTP app.
          </p>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={enrollment.qrDataUrl}
          alt="TOTP QR code"
          className="w-48 h-48 border border-border rounded-sm bg-white p-2"
        />

        <div>
          <p className="text-xs text-text-muted mb-1">Or enter this key manually</p>
          <code className="block w-full break-all bg-background border border-border rounded-sm px-3 py-2 text-xs text-text-primary">
            {enrollment.secret}
          </code>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-primary mb-1">
            Enter the 6-digit code from your app to confirm
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete="one-time-code"
            value={enrollCode}
            onChange={(e) => setEnrollCode(e.target.value.replace(/\D/g, ''))}
            disabled={loading}
            className={fieldClasses}
            placeholder="123456"
          />
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            disabled={loading || enrollCode.length !== 6}
            onClick={confirmEnrolment}
            className="min-h-[48px] px-6 rounded-sm bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Verify & enable'}
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null)
              setEnrollment(null)
              setPhase('status')
            }}
            disabled={loading}
            className="min-h-[48px] px-6 rounded-sm border border-border text-text-secondary text-sm font-semibold hover:border-text-primary hover:text-text-primary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // phase === 'status'
  return (
    <div className="bg-surface border border-border rounded-sm p-4 sm:p-6 space-y-4">
      {enabled ? (
        <>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 bg-green-50 border border-green-200 rounded-sm px-2.5 py-1">
              Enabled
            </span>
            {verifiedAt && (
              <span className="text-xs text-text-muted">since {formatDateTime(verifiedAt)}</span>
            )}
          </div>
          <p className="text-sm text-text-secondary">
            The admin login now requires a code from your authenticator app.
          </p>
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setError(null)
                setPhase('reauth-regenerate')
              }}
              className="min-h-[44px] px-5 rounded-sm border border-border text-text-secondary text-sm font-semibold hover:border-text-primary hover:text-text-primary transition-colors"
            >
              Generate new recovery codes
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null)
                setPhase('reauth-disable')
              }}
              className="min-h-[44px] px-5 rounded-sm border border-border text-red-700 text-sm font-semibold hover:border-red-300 hover:bg-red-50 transition-colors"
            >
              Disable 2FA
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-text-secondary">
            Two-factor authentication is not enabled. Set it up with an authenticator app such as
            Google Authenticator or Authy.
          </p>
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={startEnrolment}
            className="min-h-[48px] px-6 rounded-sm bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Starting…' : 'Set up two-factor authentication'}
          </button>
        </>
      )}
    </div>
  )
}
