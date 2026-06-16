import { createClient } from '@/lib/supabase/server'

/** Returns the authenticated user if they match ADMIN_EMAIL, otherwise null. */
export async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminEmail = process.env.ADMIN_EMAIL
  if (!user || !adminEmail || user.email !== adminEmail) {
    return null
  }

  return user
}
