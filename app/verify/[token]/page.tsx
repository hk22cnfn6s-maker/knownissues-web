import { redirect } from 'next/navigation'

/**
 * This page is hit when a user clicks the link in the email.
 * It immediately delegates to the API route which handles validation
 * and issues the redirect. We use a server component meta-redirect
 * as a belt-and-braces fallback in case JS is disabled.
 */
export default function VerifyTokenPage({
  params,
}: {
  params: { token: string }
}) {
  redirect(`/api/auth/verify/${params.token}`)
}
