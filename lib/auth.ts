import crypto from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const COOKIE_NAME = 'aurora_session'
const SESSION_DURATION_DAYS = 7

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function createSession(): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000)

  await prisma.adminSession.create({
    data: { token: hashedToken, expiresAt },
  })

  return rawToken
}

export async function setSessionCookie(rawToken: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  })
}

export async function verifySession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const rawToken = cookieStore.get(COOKIE_NAME)?.value
    if (!rawToken) return false

    const hashedToken = hashToken(rawToken)
    const session = await prisma.adminSession.findUnique({
      where: { token: hashedToken },
    })

    if (!session) return false
    if (session.expiresAt < new Date()) {
      await prisma.adminSession.delete({ where: { token: hashedToken } })
      return false
    }

    return true
  } catch {
    return false
  }
}

export async function revokeSession() {
  try {
    const cookieStore = await cookies()
    const rawToken = cookieStore.get(COOKIE_NAME)?.value
    if (rawToken) {
      const hashedToken = hashToken(rawToken)
      await prisma.adminSession.deleteMany({ where: { token: hashedToken } })
    }
    cookieStore.delete({
      name: COOKIE_NAME,
      path: '/',
    })
  } catch {
    // ignore
  }
}

export function getSessionCookieRaw(): string | undefined {
  return undefined
}

export function hashTokenEdge(token: string): string {
  return hashToken(token)
}
