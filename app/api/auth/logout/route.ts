import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PENDING_2FA_COOKIE, ADMIN_2FA_COOKIE } from '@/lib/two-factor-cookies'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  await supabase.auth.signOut()

  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.delete(PENDING_2FA_COOKIE)
  response.cookies.delete(ADMIN_2FA_COOKIE)
  return response
}
