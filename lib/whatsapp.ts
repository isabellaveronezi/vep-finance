const API_URL = process.env.EVOLUTION_API_URL!
const API_KEY = process.env.EVOLUTION_API_KEY!
const INSTANCE = process.env.EVOLUTION_INSTANCE_NAME!

export async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  const res = await fetch(`${API_URL}/message/sendText/${INSTANCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: API_KEY },
    body: JSON.stringify({ number: to, text }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Evolution API ${res.status}: ${body}`)
  }
}

// Sends to all authorized numbers (the couple)
export async function sendToAll(text: string): Promise<void> {
  const numbers = (process.env.WHATSAPP_ALLOWED_NUMBERS ?? '')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean)
  await Promise.all(numbers.map((n) => sendWhatsAppMessage(n, text)))
}

export async function setupWebhook(webhookUrl: string): Promise<void> {
  const res = await fetch(`${API_URL}/webhook/set/${INSTANCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: API_KEY },
    body: JSON.stringify({
      url: webhookUrl,
      webhook_by_events: false,
      webhook_base64: false,
      events: ['MESSAGES_UPSERT'],
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Webhook setup ${res.status}: ${body}`)
  }
}
