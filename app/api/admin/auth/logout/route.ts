import { NextResponse } from 'next/server'
import { revokeSession } from '@/lib/auth'

export async function POST() {
  try {
    await revokeSession()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
  }
}
