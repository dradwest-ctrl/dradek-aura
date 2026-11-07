import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const ok = await verifySession()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'banner' or 'video' or 'product'

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 })
    }

    let validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
    let uploadSubDir = 'products'
    let maxSize = 10 * 1024 * 1024 // 10MB default

    if (type === 'video') {
      validMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime']
      uploadSubDir = 'videos'
      maxSize = 100 * 1024 * 1024 // 100MB for video
    } else if (type === 'banner') {
      uploadSubDir = 'banners'
      maxSize = 25 * 1024 * 1024 // 25MB for high res 4K banner
    }

    if (!validMimeTypes.includes(file.type) && !file.name.endsWith('.mp4')) {
      return NextResponse.json({ error: "Format de fichier non autorisé." }, { status: 400 })
    }

    if (file.size > maxSize) {
      return NextResponse.json({ error: 'La taille maximale autorisée est dépassée.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name) || (type === 'video' ? '.mp4' : '.jpg')
    const uniqueName = `${crypto.randomUUID()}${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadSubDir)

    await mkdir(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, uniqueName)

    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/${uploadSubDir}/${uniqueName}`
    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: "Impossible de télécharger le fichier. Veuillez réessayer." }, { status: 500 })
  }
}
