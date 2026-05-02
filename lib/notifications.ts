import { db } from '@/lib/db'
import { sendToAll } from '@/lib/whatsapp'
import { formatCurrency, formatDate, getMesAno } from '@/lib/utils'

export async function runNotifications(userId: string): Promise<void> {
  await Promise.all([
    checkBudgets(userId),
    checkUpcomingBills(userId),
    checkOverdueDebts(userId),
    checkCompletedGoals(userId),
  ])
}

async function checkBudgets(userId: string): Promise<void> {
  const mesAno = getMesAno()
  const [ano, mes] = mesAno.split('-').map(Number)
  const inicio = new Date(ano, mes - 1, 1)
  const fim = new Date(ano, mes, 1)

  const orcamentos = await db.orcamento.findMany({
    where: { userId, mesAno },
    include: { categoria: { select: { nome: true } } },
  })

  for (const orc of orcamentos) {
    const where = {
      userId,
      tipo: 'SAIDA' as const,
      data: { gte: inicio, lt: fim },
      ...(orc.categoriaId ? { categoriaId: orc.categoriaId } : {}),
    }

    const { _sum } = await db.transacao.aggregate({ where, _sum: { valor: true } })
    const gasto = _sum.valor ?? 0
    const pct = gasto / orc.valorLimite

    const tipoAlerta =
      pct >= 1
        ? ('ORCAMENTO_100' as const)
        : pct >= 0.9
          ? ('ORCAMENTO_90' as const)
          : pct >= 0.8
            ? ('ORCAMENTO_80' as const)
            : null

    if (!tipoAlerta) continue

    // Avoid re-sending the same alert this month
    const existing = await db.alerta.findFirst({
      where: { userId, tipo: tipoAlerta, createdAt: { gte: inicio } },
    })
    if (existing) continue

    const nome = orc.categoria?.nome ?? 'geral'
    const msg =
      tipoAlerta === 'ORCAMENTO_100'
        ? `🚨 Orçamento ${nome} esgotado! Gasto ${formatCurrency(gasto)} de ${formatCurrency(orc.valorLimite)}.`
        : `⚠️ Orçamento ${nome} em ${Math.round(pct * 100)}%. Gasto ${formatCurrency(gasto)} de ${formatCurrency(orc.valorLimite)}.`

    await db.alerta.create({ data: { userId, tipo: tipoAlerta, mensagem: msg, enviado: true } })
    await sendToAll(msg)
  }
}

async function checkUpcomingBills(userId: string): Promise<void> {
  const hoje = new Date()
  const diaHoje = hoje.getDate()
  const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()

  const contas = await db.contaFixa.findMany({
    where: { userId, ativo: true },
    include: { categoria: { select: { nome: true } } },
  })

  const proximas = contas.filter((c) => {
    const diasAte =
      c.diaVencimento >= diaHoje
        ? c.diaVencimento - diaHoje
        : diasNoMes - diaHoje + c.diaVencimento
    return diasAte <= 3 && diasAte >= 0
  })

  if (proximas.length === 0) return

  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const existing = await db.alerta.findFirst({
    where: { userId, tipo: 'VENCIMENTO_CONTA', createdAt: { gte: inicio } },
  })

  // Only send once per day per month
  if (existing) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const existingDay = new Date(existing.createdAt)
    existingDay.setHours(0, 0, 0, 0)
    if (existingDay.getTime() === today.getTime()) return
  }

  const linhas = proximas.map((c) => {
    const diasNoMesLocal = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
    const diasAte =
      c.diaVencimento >= diaHoje
        ? c.diaVencimento - diaHoje
        : diasNoMesLocal - diaHoje + c.diaVencimento
    const quando = diasAte === 0 ? 'hoje' : diasAte === 1 ? 'amanhã' : `em ${diasAte} dias`
    return `  • ${c.descricao}: ${formatCurrency(c.valor)} (vence ${quando})`
  })

  const msg = `📅 Contas vencendo em breve:\n${linhas.join('\n')}`
  await db.alerta.create({ data: { userId, tipo: 'VENCIMENTO_CONTA', mensagem: msg, enviado: true } })
  await sendToAll(msg)
}

async function checkOverdueDebts(userId: string): Promise<void> {
  const hoje = new Date()
  hoje.setHours(12, 0, 0, 0)

  const [proprias, terceiros] = await Promise.all([
    db.dividaPropria.findMany({
      where: { userId, status: 'ABERTA', vencimento: { lt: hoje } },
    }),
    db.dividaTerceiro.findMany({
      where: { userId, status: { in: ['ABERTA', 'PARCIAL'] }, vencimento: { lt: hoje } },
    }),
  ])

  if (proprias.length === 0 && terceiros.length === 0) return

  const linhas: string[] = ['⏰ Dívidas vencidas:']
  for (const d of proprias) {
    linhas.push(`  • Você deve a ${d.credor}: ${formatCurrency(d.valorTotal)} (venceu ${formatDate(d.vencimento!)})`)
  }
  for (const d of terceiros) {
    const restante = d.valorTotal - d.valorRecebido
    linhas.push(`  • ${d.nomeDevedor} te deve: ${formatCurrency(restante)} (venceu ${formatDate(d.vencimento!)})`)
  }

  // Throttle: only once every 3 days
  const tres = new Date()
  tres.setDate(tres.getDate() - 3)
  const existing = await db.alerta.findFirst({
    where: { userId, tipo: 'VENCIMENTO_CONTA', createdAt: { gte: tres } },
  })
  if (existing) return

  const msg = linhas.join('\n')
  await sendToAll(msg)
}

async function checkCompletedGoals(userId: string): Promise<void> {
  const metas = await db.meta.findMany({
    where: { userId, ativo: true },
  })

  for (const m of metas) {
    if (m.valorAtual < m.valorObjetivo) continue

    const existing = await db.alerta.findFirst({
      where: { userId, tipo: 'META_CONCLUIDA', mensagem: { contains: m.id } },
    })
    if (existing) continue

    const msg = `🎉 Meta "${m.nome}" concluída! Você atingiu ${formatCurrency(m.valorObjetivo)}.`
    await db.alerta.create({
      data: { userId, tipo: 'META_CONCLUIDA', mensagem: `[${m.id}] ${msg}`, enviado: true },
    })
    await sendToAll(msg)
  }
}
