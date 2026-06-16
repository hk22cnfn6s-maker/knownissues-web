import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  )
}

/**
 * Service-role client — never expose to the browser.
 *
 * Deliberately built with plain @supabase/supabase-js rather than
 * @supabase/ssr: the ssr helpers read the request's session cookies and
 * will transparently use the LOGGED-IN USER's JWT for PostgREST requests
 * whenever one is present, silently downgrading "service" queries to that
 * user's own RLS-restricted permissions. Using a bare client with no
 * cookie/session handling guarantees every request is authenticated as
 * service_role, regardless of who is logged in on the request.
 */
export function createServiceClient() {
  return createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
