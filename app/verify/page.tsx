import AuthLayout from '@/components/AuthLayout'

const errorMessages: Record<string, string> = {
  invalid: 'That verification link is invalid. Please register again.',
  used: 'That verification link has already been used. You can log in below.',
  expired: 'That verification link has expired. Please register again.',
  server: 'Something went wrong. Please try again.',
}

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const errorKey = searchParams.error
  const errorMessage = errorKey ? errorMessages[errorKey] : null

  return (
    <AuthLayout>
      {errorMessage ? (
        <>
          <h1 className="font-heading text-h3 text-text-primary mb-3">Link not valid</h1>
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2 mb-6">
            {errorMessage}
          </p>
          <a href="/register" className="text-sm text-accent hover:text-accent-hover font-medium">
            Back to registration
          </a>
        </>
      ) : (
        <>
          <div className="text-3xl mb-4">✉️</div>
          <h1 className="font-heading text-h3 text-text-primary mb-3">Check your email</h1>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            We've sent a confirmation link to your email address. Click the link
            to activate your account.
          </p>
          <p className="text-sm text-text-muted">
            The link expires after 24 hours. Check your spam folder if you
            don't see it.
          </p>
        </>
      )}
    </AuthLayout>
  )
}
