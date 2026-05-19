import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  const isDashboard  = /\/[^/]+\/dashboard/.test(path)
  const isSuperAdmin = path.startsWith('/super-admin')

  if (!isDashboard && !isSuperAdmin) return NextResponse.next()

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET ?? 'opheon-saas-secret-key-2024-change-in-production',
  })

  if (!token) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, req.url))
  }

  if (isSuperAdmin && token.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
