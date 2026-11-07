import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CheckoutSchema } from '@/lib/validations'
import { buildOrderRef } from '@/lib/utils'

// Helper function to send WhatsApp and Meta/Facebook notifications server-side
async function sendOrderNotifications(order: {
  reference: string
  customerName: string
  phone: string
  city: string
  address: string
  subtotal: number
  shipping: number
  total: number
  items: Array<{ productName: string; variant?: string | null; price: number; quantity: number }>
}) {
  try {
    // 1. Fetch store settings for WhatsApp and Facebook integration config
    const settings = await prisma.storeSettings.findMany({
      where: {
        key: {
          in: [
            'whatsapp_enabled',
            'whatsapp_number',
            'whatsapp_token',
            'whatsapp_phone_number_id',
            'facebook_enabled',
            'facebook_page_id',
            'facebook_access_token',
          ],
        },
      },
    })

    const settingsMap: Record<string, string> = {}
    settings.forEach((s) => {
      settingsMap[s.key] = s.value
    })

    const whatsappEnabled = settingsMap['whatsapp_enabled'] !== 'false' // default true if not explicitly disabled
    const waNumber = settingsMap['whatsapp_number'] || process.env.WHATSAPP_RECIPIENT_NUMBER || '212664810767'
    const waToken = settingsMap['whatsapp_token'] || process.env.WHATSAPP_TOKEN
    const waPhoneId = settingsMap['whatsapp_phone_number_id'] || process.env.WHATSAPP_PHONE_NUMBER_ID

    const fbEnabled = settingsMap['facebook_enabled'] === 'true'
    const fbPageId = settingsMap['facebook_page_id'] || process.env.FACEBOOK_PAGE_ID
    const fbToken = settingsMap['facebook_access_token'] || process.env.FACEBOOK_ACCESS_TOKEN

    // Build formatted message text
    const itemsList = order.items
      .map((i, idx) => `${idx + 1}. *${i.productName}*${i.variant ? ` (${i.variant})` : ''} - ${i.quantity}x (${(i.price * i.quantity).toFixed(2)} MAD)`)
      .join('\n')

    const messageText = `🛍️ *Nouvelle Commande Aurora Luxe!*\n\n` +
      `📌 *Réf:* ${order.reference}\n` +
      `👤 *Client:* ${order.customerName}\n` +
      `📱 *Téléphone:* ${order.phone}\n` +
      `🏙️ *Ville:* ${order.city}\n` +
      `📍 *Adresse:* ${order.address}\n\n` +
      `📦 *Articles:*\n${itemsList}\n\n` +
      `🏷️ *Sous-total:* ${order.subtotal.toFixed(2)} MAD\n` +
      `🚚 *Livraison:* ${order.shipping.toFixed(2)} MAD\n` +
      `💰 *Total:* *${order.total.toFixed(2)} MAD*\n\n` +
      `💳 *Paiement:* Cash on Delivery (COD)`

    // ─── 1. WhatsApp Cloud API Notification ────────────────────────────────
    if (whatsappEnabled && waToken && waPhoneId && waNumber) {
      try {
        const cleanRecipient = waNumber.replace(/\D/g, '')
        const waRes = await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${waToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanRecipient,
            type: 'text',
            text: { body: messageText },
          }),
        })
        if (!waRes.ok) {
          const errData = await waRes.json()
          console.error('WhatsApp Cloud API error:', errData)
        } else {
          console.log(`WhatsApp notification sent successfully for order ${order.reference}`)
        }
      } catch (err) {
        console.error('Failed to dispatch WhatsApp notification:', err)
      }
    }

    // ─── 2. Facebook Graph API Page Notification / Post ────────────────────
    if (fbEnabled && fbToken && fbPageId) {
      try {
        const fbRes = await fetch(`https://graph.facebook.com/v19.0/${fbPageId}/feed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText.replace(/\*/g, ''), // Strip markdown bold for FB feed if needed
            access_token: fbToken,
          }),
        })
        if (!fbRes.ok) {
          const errData = await fbRes.json()
          console.error('Facebook Graph API error:', errData)
        } else {
          console.log(`Facebook page notification posted successfully for order ${order.reference}`)
        }
      } catch (err) {
        console.error('Failed to dispatch Facebook notification:', err)
      }
    }
  } catch (error) {
    console.error('Error in sendOrderNotifications:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input with Zod — only accept productId, variantKey, quantity
    const validationResult = CheckoutSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Server-side: fetch prices and check stock
    const resolvedItems: Array<{
      productId: string
      productName: string
      variant?: string
      price: number
      quantity: number
    }> = []

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product || !product.active) {
        return NextResponse.json(
          { error: `Produit non disponible: ${item.productId}` },
          { status: 422 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour: ${product.name}. Disponible: ${product.stock}` },
          { status: 422 }
        )
      }

      resolvedItems.push({
        productId: product.id,
        productName: product.name,
        variant: item.variantKey,
        price: product.salePrice != null && product.salePrice < product.price
          ? product.salePrice
          : product.price,
        quantity: item.quantity,
      })
    }

    // Fetch shipping fee from settings (fallback to 30 MAD)
    const shippingSetting = await prisma.storeSettings.findUnique({
      where: { key: 'shipping_fee' },
    })
    const shipping = parseFloat(shippingSetting?.value ?? '30')

    // Server-side total calculation
    const subtotal = resolvedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total = subtotal + shipping

    // Get order count for reference generation
    const orderCount = await prisma.order.count()
    const reference = buildOrderRef(orderCount)

    // Create order and update stock atomically
    const order = await prisma.$transaction(async (tx) => {
      // Create order with items
      const created = await tx.order.create({
        data: {
          reference,
          customerName: data.customerName,
          phone: data.phone,
          city: data.city,
          address: data.address,
          addressExtra: null,
          notes: null,
          subtotal,
          shipping,
          total,
          paymentMethod: 'COD',
          status: 'PENDING',
          items: {
            create: resolvedItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              variant: item.variant || null,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
      })

      // Decrement stock for each product
      for (const item of resolvedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      return created
    })

    // Dispatch WhatsApp & Facebook notifications asynchronously (non-blocking)
    sendOrderNotifications({
      reference: order.reference,
      customerName: order.customerName,
      phone: order.phone,
      city: order.city,
      address: order.address,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      items: resolvedItems,
    }).catch((err) => {
      console.error('Background notification dispatch error:', err)
    })

    return NextResponse.json(
      { reference: order.reference, total: order.total },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la commande' },
      { status: 500 }
    )
  }
}
