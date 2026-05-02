import OpenAI from 'openai'
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions'
import { db } from '@/lib/db'
import { getMesAno, formatCurrency, formatDate } from '@/lib/utils'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_monthly_summary',
      description:
        'Retorna resumo financeiro do mês: total de entradas, saídas, saldo e uso de orçamento.',
      parameters: {
        type: 'object',
        properties: {
          mesAno: {
            type: 'string',
            description: 'Mês no formato YYYY-MM. Padrão: mês atual.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_transactions',
      description: 'Lista transações recentes com filtros opcionais.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Máximo de resultados (padrão 10)' },
          tipo: { type: 'string', enum: ['ENTRADA', 'SAIDA'] },
          mesAno: { type: 'string', description: 'Filtrar por mês YYYY-MM' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_transaction',
      description: 'Registra uma nova transação (receita ou despesa).',
      parameters: {
        type: 'object',
        required: ['descricao', 'tipo', 'valor'],
        properties: {
          descricao: { type: 'string' },
          tipo: { type: 'string', enum: ['ENTRADA', 'SAIDA'] },
          valor: { type: 'number' },
          data: { type: 'string', description: 'Data no formato YYYY-MM-DD. Padrão: hoje.' },
          status: { type: 'string', enum: ['PAGO', 'PENDENTE'], description: 'Padrão: PAGO' },
          observacao: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_debts',
      description: 'Lista dívidas abertas: o que você deve e o que te devem.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_goals',
      description: 'Lista metas de poupança com progresso atual.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_upcoming_bills',
      description: 'Lista contas fixas com vencimento nos próximos dias.',
      parameters: {
        type: 'object',
        properties: {
          days: { type: 'number', description: 'Dias à frente para verificar (padrão 7)' },
        },
      },
    },
  },
]

type ToolInput = Record<string, unknown>

async function executeTool(userId: string, toolName: string, input: ToolInput): Promise<string> {
  switch (toolName) {
    case 'get_monthly_summary': {
      const mesAno = (input.mesAno as string | undefined) ?? getMesAno()
      const [ano, mes] = mesAno.split('-').map(Number)
      const inicio = new Date(ano, mes - 1, 1)
      const fim = new Date(ano, mes, 1)

      const transacoes = await db.transacao.findMany({
        where: { userId, data: { gte: inicio, lt: fim } },
        select: { tipo: true, valor: true, status: true },
      })

      const entradas = transacoes
        .filter((t) => t.tipo === 'ENTRADA' && t.status === 'PAGO')
        .reduce((s, t) => s + t.valor, 0)
      const saidas = transacoes
        .filter((t) => t.tipo === 'SAIDA')
        .reduce((s, t) => s + t.valor, 0)

      const orcamento = await db.orcamento.findFirst({
        where: { userId, categoriaId: null, mesAno },
      })

      const linhas = [
        `📊 Resumo ${mesAno}`,
        `Entradas: ${formatCurrency(entradas)}`,
        `Saídas: ${formatCurrency(saidas)}`,
        `Saldo: ${formatCurrency(entradas - saidas)}`,
      ]
      if (orcamento) {
        const pct = Math.round((saidas / orcamento.valorLimite) * 100)
        linhas.push(`Orçamento: ${pct}% de ${formatCurrency(orcamento.valorLimite)}`)
      }
      return linhas.join('\n')
    }

    case 'get_transactions': {
      const limit = (input.limit as number | undefined) ?? 10
      const tipo = input.tipo as 'ENTRADA' | 'SAIDA' | undefined
      const mesAno = input.mesAno as string | undefined

      let dateFilter: { gte: Date; lt: Date } | undefined
      if (mesAno) {
        const [ano, mes] = mesAno.split('-').map(Number)
        dateFilter = { gte: new Date(ano, mes - 1, 1), lt: new Date(ano, mes, 1) }
      }

      const transacoes = await db.transacao.findMany({
        where: {
          userId,
          ...(tipo ? { tipo } : {}),
          ...(dateFilter ? { data: dateFilter } : {}),
        },
        orderBy: { data: 'desc' },
        take: limit,
        include: { categoria: { select: { nome: true } } },
      })

      if (transacoes.length === 0) return 'Nenhuma transação encontrada.'

      return transacoes
        .map(
          (t) =>
            `${t.tipo === 'ENTRADA' ? '💚' : '🔴'} ${formatDate(t.data)} — ${t.descricao}${t.categoria ? ` (${t.categoria.nome})` : ''}: ${formatCurrency(t.valor)}`
        )
        .join('\n')
    }

    case 'add_transaction': {
      const dataStr = (input.data as string | undefined) ?? new Date().toISOString().slice(0, 10)
      const [ano, mes, dia] = dataStr.split('-').map(Number)

      const nova = await db.transacao.create({
        data: {
          userId,
          descricao: input.descricao as string,
          tipo: input.tipo as 'ENTRADA' | 'SAIDA',
          valor: input.valor as number,
          data: new Date(ano, mes - 1, dia, 12),
          status: (input.status as 'PAGO' | 'PENDENTE' | undefined) ?? 'PAGO',
          observacao: input.observacao as string | undefined,
          origem: 'WHATSAPP',
        },
      })

      return `✅ Registrado: ${nova.descricao} — ${formatCurrency(nova.valor)} (${nova.tipo})`
    }

    case 'get_debts': {
      const [proprias, terceiros] = await Promise.all([
        db.dividaPropria.findMany({
          where: { userId, status: 'ABERTA' },
          include: { transacoes: { select: { valor: true } } },
        }),
        db.dividaTerceiro.findMany({
          where: { userId, status: { in: ['ABERTA', 'PARCIAL'] } },
        }),
      ])

      const linhas: string[] = []

      if (proprias.length) {
        linhas.push('💸 Você deve:')
        for (const d of proprias) {
          const pago = d.transacoes.reduce((s, t) => s + t.valor, 0)
          const restante = d.valorTotal - pago
          linhas.push(
            `  • ${d.credor}: ${formatCurrency(restante)}${d.vencimento ? ` (vence ${formatDate(d.vencimento)})` : ''}`
          )
        }
      }

      if (terceiros.length) {
        linhas.push('💰 Te devem:')
        for (const d of terceiros) {
          const restante = d.valorTotal - d.valorRecebido
          linhas.push(
            `  • ${d.nomeDevedor}: ${formatCurrency(restante)}${d.vencimento ? ` (vence ${formatDate(d.vencimento)})` : ''}`
          )
        }
      }

      return linhas.length ? linhas.join('\n') : 'Nenhuma dívida aberta.'
    }

    case 'get_goals': {
      const metas = await db.meta.findMany({
        where: { userId, ativo: true },
        orderBy: { prazoEstimado: 'asc' },
      })

      if (metas.length === 0) return 'Nenhuma meta cadastrada.'

      return metas
        .map((m) => {
          const pct = Math.round((m.valorAtual / m.valorObjetivo) * 100)
          const barra = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10))
          return `🎯 ${m.nome}: ${formatCurrency(m.valorAtual)} / ${formatCurrency(m.valorObjetivo)} [${barra}] ${pct}%`
        })
        .join('\n')
    }

    case 'get_upcoming_bills': {
      const days = (input.days as number | undefined) ?? 7
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      const contas = await db.contaFixa.findMany({
        where: { userId, ativo: true },
        include: { categoria: { select: { nome: true } } },
      })

      const proximas = contas.filter((c) => {
        const diaHoje = hoje.getDate()
        const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
        const diasAte =
          c.diaVencimento >= diaHoje
            ? c.diaVencimento - diaHoje
            : diasNoMes - diaHoje + c.diaVencimento
        return diasAte <= days
      })

      if (proximas.length === 0) return `Nenhuma conta vencendo nos próximos ${days} dias.`

      return (
        `📅 Contas nos próximos ${days} dias:\n` +
        proximas
          .map(
            (c) =>
              `  • Dia ${c.diaVencimento} — ${c.descricao}${c.categoria ? ` (${c.categoria.nome})` : ''}: ${formatCurrency(c.valor)}`
          )
          .join('\n')
      )
    }

    default:
      return 'Ferramenta não reconhecida.'
  }
}

export async function processMessage(userId: string, userMessage: string): Promise<string> {
  const systemPrompt = `Você é o assistente financeiro pessoal do FinControl, acessível via WhatsApp.
Responda em português, de forma concisa e direta. Use os dados reais do banco do usuário.
Hoje é ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}.
Para registrar transações, confirme os dados antes se houver ambiguidade.
Use emojis com moderação para facilitar leitura no celular.`

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]

  let response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    tools: TOOLS,
    tool_choice: 'auto',
    messages,
  })

  while (response.choices[0].finish_reason === 'tool_calls') {
    const assistantMessage = response.choices[0].message
    messages.push(assistantMessage)

    const toolCalls = assistantMessage.tool_calls ?? []
    const results = await Promise.all(
      toolCalls.map(async (tc) => {
        const fn = (tc as { id: string; function: { name: string; arguments: string } }).function
        const input = JSON.parse(fn.arguments || '{}') as ToolInput
        const result = await executeTool(userId, fn.name, input)
        return {
          role: 'tool' as const,
          tool_call_id: tc.id,
          content: result,
        }
      })
    )

    messages.push(...results)

    response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      tools: TOOLS,
      tool_choice: 'auto',
      messages,
    })
  }

  return response.choices[0].message.content ?? 'Não entendi. Pode reformular?'
}
