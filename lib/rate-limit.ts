import { createServiceClient } from '@/lib/supabase/server'

export interface RateLimitResult {
  allowed: boolean
  /** Seconds until the caller can retry, only set when allowed is false. */
  retryAfterSeconds?: number
}

/**
 * Rolling-window rate limit backed by the auth_rate_limits table (needed
 * because this app runs on Vercel serverless — an in-memory store
 * wouldn't be shared across invocations). Counts attempts for this
 * ip+route in the trailing window; if under the cap, records this
 * attempt and opportunistically clears expired rows for the same key.
 *
 * Fails open on a database error — a rate-limit outage shouldn't be able
 * to lock every admin/user out of auth entirely.
 */
export async function checkRateLimit(
  route: string,
  ip: string,
  { max, windowMinutes }: { max: number; windowMinutes: number }
): Promise<RateLimitResult> {
  const service = createServiceClient()
  const windowStartThreshold = new Date(Date.now() - windowMinutes * 60_000).toISOString()

  const { count, error } = await service
    .from('auth_rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .eq('route', route)
    .gte('window_start', windowStartThreshold)

  if (error) {
    console.error('[rate-limit] count check failed', error)
    return { allowed: true }
  }

  if ((count ?? 0) >= max) {
    return { allowed: false, retryAfterSeconds: windowMinutes * 60 }
  }

  const { error: insertError } = await service
    .from('auth_rate_limits')
    .insert({ ip_address: ip, route })

  if (insertError) {
    console.error('[rate-limit] failed to record attempt', insertError)
  }

  const { error: cleanupError } = await service
    .from('auth_rate_limits')
    .delete()
    .eq('ip_address', ip)
    .eq('route', route)
    .lt('window_start', windowStartThreshold)

  if (cleanupError) {
    console.error('[rate-limit] cleanup failed', cleanupError)
  }

  return { allowed: true }
}
