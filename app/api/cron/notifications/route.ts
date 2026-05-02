import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { runNotifications } from '@/lib/notifications'

// Protect with a shared secret — set CRON_SECRET in .env.local
export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await db.user.findFirst({ select: { id: true } })
  if (!user) return NextResponse.json({ error: 'No user' }, { status: 404 })

  await runNotifications(user.id)
  return NextResponse.json({ ok: true })
}
