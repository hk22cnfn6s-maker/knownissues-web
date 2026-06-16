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
          <h1 className="text-2xl font-bold text-black mb-3">Link not valid</h1>
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-6">
            {errorMessage}
          </p>
          <a href="/register" className="text-sm text-black underline underline-offset-2">
            Back to registration
          </a>
        </>
      ) : (
        <>
          <div className="text-3xl mb-4">✉️</div>
          <h1 className="text-2xl font-bold text-black mb-3">Check your email</h1>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            We've sent a confirmation link to your email address. Click the link
            to activate your account.
          </p>
          <p className="text-sm text-gray-400">
            The link expires after 24 hours. Check your spam folder if you
            don't see it.
          </p>
        </>
      )}
    </AuthLayout>
  )
}
