import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { processMessage } from '@/lib/ai-assistant'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

const ALLOWED_NUMBERS = new Set(
  (process.env.WHATSAPP_ALLOWED_NUMBERS ?? '').split(',').map((n) => n.trim()).filter(Boolean)
)

function normalizeNumber(jid: string): string {
  return jid.replace(/@.*$/, '')
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const event = body as Record<string, unknown>
  const messages = (event.data as Record<string, unknown> | undefined)?.messages as
    | unknown[]
    | undefined

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ ok: true })
  }

  // Single user account shared by the couple
  const user = await db.user.findFirst({ select: { id: true } })
  if (!user) return NextResponse.json({ ok: true })

  for (const msg of messages) {
    const m = msg as Record<string, unknown>
    if (m.fromMe === true) continue

    const senderJid = (m.key as Record<string, unknown>)?.remoteJid as string | undefined
    if (!senderJid) continue

    const senderNumber = normalizeNumber(senderJid)
    if (!ALLOWED_NUMBERS.has(senderNumber)) continue

    const text =
      ((m.message as Record<string, unknown>)?.conversation as string | undefined) ??
      (((m.message as Record<string, unknown>)?.extendedTextMessage as Record<string, unknown>)
        ?.text as string | undefined)

    if (!text?.trim()) continue

    try {
      const reply = await processMessage(user.id, text.trim())
      await sendWhatsAppMessage(senderNumber, reply)
    } catch (err) {
      console.error('[whatsapp-webhook] error:', err)
      await sendWhatsAppMessage(senderNumber, '❌ Erro interno ao processar sua mensagem.')
    }
  }

  return NextResponse.json({ ok: true })
}
