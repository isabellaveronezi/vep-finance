'use server'

import { revalidatePath } from 'next/cache'
import { addMonths } from 'date-fns'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { dividaTerceiroSchema, recebimentoSchema } from '@/lib/validations/divida-terceiro'

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')
  return session.user.id
}

export async function criarDividaTerceiro(data: unknown) {
  const userId = await getUserId()
  const parsed = dividaTerceiroSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  const divida = await db.dividaTerceiro.create({
    data: {
      nomeDevedor:    parsed.data.nomeDevedor,
      descricao:      parsed.data.descricao  || null,
      valorTotal:     parsed.data.valorTotal,
      vencimento:     parsed.data.vencimento ?? null,
      cartaoId:       parsed.data.cartaoId   || null,
      formaPagamento: parsed.data.formaPagamento ?? null,
      grupo:          parsed.data.grupo      || null,
      userId,
    },
  })

  // Se informou cartão ou forma de pagamento, cria transação SAIDA vinculada
  if (parsed.data.cartaoId || parsed.data.formaPagamento) {
    const isCredito = parsed.data.formaPagamento === 'CREDITO'
    await db.transacao.create({
      data: {
        descricao:      `Empréstimo — ${parsed.data.nomeDevedor}`,
        tipo:           'SAIDA',
        valor:          parsed.data.valorTotal,
        data:           new Date(),
        status:         isCredito ? 'PENDENTE' : 'PAGO',
        formaPagamento: parsed.data.formaPagamento ?? null,
        cartaoId:       parsed.data.cartaoId ?? null,
        dividaId:       divida.id,
        origem:         'MANUAL',
        userId,
      },
    })
  }

  revalidatePath('/dividas')
  revalidatePath('/transacoes')
  if (parsed.data.cartaoId) revalidatePath('/cartoes')
}

export async function criarDividaTerceiroParcelada(data: {
  nomeDevedor:    string
  descricao?:     string
  valorTotal:     number
  totalParcelas:  number
  dataPrimeira:   Date
  formaPagamento?: 'DINHEIRO' | 'PIX' | 'DEBITO' | 'CREDITO' | 'BOLETO' | 'TRANSFERENCIA'
  cartaoId?:      string
  grupo?:         string
}) {
  const userId = await getUserId()
  const { nomeDevedor, descricao, valorTotal, totalParcelas, dataPrimeira, formaPagamento, cartaoId, grupo } = data

  const valorBase = Math.floor((valorTotal / totalParcelas) * 100) / 100
  const ajuste    = Math.round((valorTotal - valorBase * totalParcelas) * 100) / 100
  const isCredito = formaPagamento === 'CREDITO'

  for (let i = 0; i < totalParcelas; i++) {
    const valor     = i === totalParcelas - 1 ? valorBase + ajuste : valorBase
    const vencimento = addMonths(dataPrimeira, i)

    const divida = await db.dividaTerceiro.create({
      data: {
        nomeDevedor,
        descricao:      descricao ? `${descricao} (${i + 1}/${totalParcelas})` : `Parcela ${i + 1}/${totalParcelas}`,
        valorTotal:     valor,
        vencimento,
        formaPagamento: formaPagamento ?? null,
        cartaoId:       cartaoId       || null,
        grupo:          grupo          || null,
        userId,
      },
    })

    if (formaPagamento || cartaoId) {
      await db.transacao.create({
        data: {
          descricao:      `Empréstimo — ${nomeDevedor} (${i + 1}/${totalParcelas})`,
          tipo:           'SAIDA',
          valor,
          data:           vencimento,
          status:         isCredito ? 'PARCELADO' : 'PAGO',
          numeroParcela:  i + 1,
          totalParcelas,
          formaPagamento: formaPagamento ?? null,
          cartaoId:       cartaoId ?? null,
          dividaId:       divida.id,
          origem:         'MANUAL',
          userId,
        },
      })
    }
  }

  revalidatePath('/dividas')
  revalidatePath('/transacoes')
  if (cartaoId) revalidatePath('/cartoes')
}

export async function atualizarDividaTerceiro(id: string, data: unknown) {
  const userId = await getUserId()
  const parsed = dividaTerceiroSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  await db.dividaTerceiro.update({
    where: { id, userId },
    data: {
      nomeDevedor:    parsed.data.nomeDevedor,
      descricao:      parsed.data.descricao  || null,
      valorTotal:     parsed.data.valorTotal,
      vencimento:     parsed.data.vencimento ?? null,
      cartaoId:       parsed.data.cartaoId   || null,
      formaPagamento: parsed.data.formaPagamento ?? null,
      grupo:          parsed.data.grupo      || null,
    },
  })

  revalidatePath('/dividas')
}

export async function registrarRecebimento(dividaId: string, data: unknown) {
  const userId = await getUserId()
  const parsed = recebimentoSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  const divida = await db.dividaTerceiro.findUnique({ where: { id: dividaId, userId } })
  if (!divida) throw new Error('Dívida não encontrada')

  const { _sum } = await db.transacao.aggregate({
    where: { dividaId, tipo: 'ENTRADA' },
    _sum:  { valor: true },
  })
  const recebido = _sum.valor ?? 0

  await db.transacao.create({
    data: {
      descricao:      `Recebimento — ${divida.nomeDevedor}`,
      tipo:           'ENTRADA',
      valor:          parsed.data.valor,
      data:           parsed.data.data,
      status:         'PAGO',
      formaPagamento: parsed.data.formaPagamento,
      origem:         'MANUAL',
      observacao:     parsed.data.observacao ?? null,
      dividaId,
      userId,
    },
  })

  const novoRecebido = recebido + parsed.data.valor
  const novoStatus = novoRecebido >= divida.valorTotal ? 'RECEBIDA' : 'PARCIAL'

  await db.dividaTerceiro.update({
    where: { id: dividaId },
    data:  { status: novoStatus, valorRecebido: novoRecebido },
  })

  revalidatePath('/dividas')
  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
}

export async function quitarDividaTerceiro(id: string) {
  const userId = await getUserId()
  await db.dividaTerceiro.update({
    where: { id, userId },
    data:  { status: 'RECEBIDA' },
  })
  revalidatePath('/dividas')
}

export async function reabrirDividaTerceiro(id: string) {
  const userId = await getUserId()
  await db.dividaTerceiro.update({
    where: { id, userId },
    data:  { status: 'ABERTA' },
  })
  revalidatePath('/dividas')
}

export async function deletarDividaTerceiro(id: string) {
  const userId = await getUserId()
  await db.dividaTerceiro.delete({ where: { id, userId } })
  revalidatePath('/dividas')
  revalidatePath('/transacoes')
}
