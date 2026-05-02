import { NextRequest, NextResponse } from 'next/server'
import { setupWebhook } from '@/lib/whatsapp'
import { auth } from '@/lib/auth'

// POST /api/whatsapp/setup — registers the webhook URL with Evolution API
// Must be called once after deploy or when the URL changes
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const webhookUrl = `${appUrl}/api/whatsapp/webhook`

  await setupWebhook(webhookUrl)
  return NextResponse.json({ ok: true, webhookUrl })
}
