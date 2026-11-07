import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'aurora_session'

// Edge-compatible SHA-256 hash using Web Crypto API
async function hashTokenEdge(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes (except /admin/login and /admin/api/auth/login)
  if (!pathname.startsWith('/admin')) return NextResponse.next()
  if (pathname === '/admin/login') return NextResponse.next()
  if (pathname.startsWith('/api/admin/auth')) return NextResponse.next()

  const rawToken = request.cookies.get(COOKIE_NAME)?.value

  if (!rawToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Lightweight check for page routes via internal /api/admin/auth/me
  if (!pathname.startsWith('/api/')) {
    const verifyUrl = new URL('/api/admin/auth/me', request.url)
    try {
      const res = await fetch(verifyUrl, {
        headers: { cookie: `${COOKIE_NAME}=${rawToken}` },
      })
      if (!res.ok) {
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        response.cookies.delete(COOKIE_NAME)
        return response
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
