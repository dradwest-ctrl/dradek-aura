import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const ok = await verifySession()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { whatsapp_number, whatsapp_token, whatsapp_phone_number_id } = await request.json()

    if (!whatsapp_token || !whatsapp_phone_number_id || !whatsapp_number) {
      return NextResponse.json(
        { error: 'Le numéro de téléphone, le Token et le Phone Number ID sont requis pour le test WhatsApp.' },
        { status: 400 }
      )
    }

    const cleanRecipient = whatsapp_number.replace(/\D/g, '')
    const testMessage = `🧪 *Test de notification Aurora Luxe*\n\n` +
      `Ceci est un message de test envoyé depuis votre tableau de bord administrateur.\n` +
      `Les notifications WhatsApp automatiques pour les nouvelles commandes sont opérationnelles ! 🚀`

    const waRes = await fetch(`https://graph.facebook.com/v19.0/${whatsapp_phone_number_id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsapp_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanRecipient,
        type: 'text',
        text: { body: testMessage },
      }),
    })

    const data = await waRes.json()

    if (!waRes.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Erreur lors de l\'envoi du message WhatsApp via Meta API' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error testing WhatsApp API:', error)
    return NextResponse.json({ error: error.message || 'Erreur interne du serveur' }, { status: 500 })
  }
}
