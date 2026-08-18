import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getIpAddress } from '@/lib/request-ip'
import { PENDING_2FA_COOKIE, ADMIN_2FA_COOKIE, verifyAdmin2faCookie } from '@/lib/two-factor-cookies'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected routes — redirect to /login if not authenticated.
  // /guides/[slug] is intentionally NOT protected here: the guide detail
  // page is publicly viewable (preview + "register to download" gate),
  // only the listing at the exact /guides path requires a session.
  const protectedPaths = ['/dashboard', '/guides']
  const isProtected = protectedPaths.some((p) => pathname === p)

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // /admin — restricted to a single admin email, gated further by TOTP
  // 2FA (once enabled) via a session-scoped cookie set only after
  // /api/auth/verify-2fa succeeds.
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')

  if (isAdminRoute) {
    const adminEmail = process.env.ADMIN_EMAIL
    const isApiRoute = pathname.startsWith('/api/admin')
    const ip = getIpAddress(request)

    if (!user || !adminEmail || user.email !== adminEmail) {
      console.warn(`[admin access denied] no valid admin session — path=${pathname} ip=${ip}`)
      if (isApiRoute) {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
      }
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // /admin/setup-2fa is reachable without the 2FA cookie so a first-time
    // enrolment isn't a chicken-and-egg problem.
    if (pathname !== '/admin/setup-2fa') {
      const { data: profile } = await supabase
        .from('users_profile')
        .select('totp_enabled')
        .eq('id', user.id)
        .single()

      if (profile?.totp_enabled) {
        const cookieValue = request.cookies.get(ADMIN_2FA_COOKIE)?.value
        const verified = await verifyAdmin2faCookie(cookieValue, user.id)

        if (!verified) {
          console.warn(
            `[admin access denied] 2FA not verified for this session — path=${pathname} ip=${ip}`
          )
          if (isApiRoute) {
            return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
          }

          // A pending_2fa cookie means they're mid-login and just need to
          // finish the 2FA step; otherwise there's no session to resume
          // from a fresh password + 2FA login.
          const hasPendingLogin = !!request.cookies.get(PENDING_2FA_COOKIE)?.value
          const redirectUrl = request.nextUrl.clone()
          if (hasPendingLogin) {
            redirectUrl.pathname = '/verify-2fa'
          } else {
            redirectUrl.pathname = '/login'
            redirectUrl.searchParams.set('redirectTo', pathname)
          }
          return NextResponse.redirect(redirectUrl)
        }
      }
    }
  }

  return supabaseResponse
}
