import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie')

  if (!cookieHeader) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const ok = await verifySession()
  if (!ok) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}
