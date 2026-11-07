import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSession, setSessionCookie } from '@/lib/auth'

// Fallback hash for '@05Youssef05@' if ADMIN_PASSWORD_HASH is not set in environment
const DEFAULT_ADMIN_PASSWORD_HASH = '$2a$12$cXA6GspSFWZ5T5KtRu5MuOZrFXF8WnDqSikZFoh5hbr4vYqUt6V2m'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur et mot de passe requis.' },
        { status: 400 }
      )
    }

    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const passwordHash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_PASSWORD_HASH

    if (!process.env.ADMIN_PASSWORD_HASH) {
      console.warn('ADMIN_PASSWORD_HASH not set in environment, using default development fallback.')
    }

    // Check username
    if (username !== adminUsername) {
      // Constant-time to prevent timing attacks
      await bcrypt.compare(password, '$2a$12$invalidhashfortimingatttacks000000000000000000000000000')
      return NextResponse.json(
        { error: 'Identifiants incorrects.' },
        { status: 401 }
      )
    }

    // Verify password
    const valid = await bcrypt.compare(password, passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: 'Identifiants incorrects.' },
        { status: 401 }
      )
    }

    // Create session in DB and set cookie
    const rawToken = await createSession()
    await setSessionCookie(rawToken)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
