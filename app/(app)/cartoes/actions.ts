'use server'

import { revalidatePath } from 'next/cache'
import { addMonths, parseISO, startOfMonth } from 'date-fns'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cartaoSchema } from '@/lib/validations/cartao'
import { z } from 'zod'

const compraParceladaSchema = z.object({
  descricao:       z.string().min(1),
  valorTotal:      z.coerce.number().positive(),
  totalParcelas:   z.coerce.number().int().min(1).max(360),
  parcelaInicial:  z.coerce.number().int().min(1),
  dataPrimeiraParcela: z.coerce.date(),
  categoriaId:     z.string().min(1),
  cartaoId:        z.string().min(1),
  observacao:      z.string().optional(),
})

const compraRecorrenteSchema = z.object({
  descricao:   z.string().min(1),
  valor:       z.coerce.number().positive(),
  meses:       z.coerce.number().int().min(1).max(36),
  dataInicio:  z.coerce.date(),
  categoriaId: z.string().min(1),
  cartaoId:    z.string().min(1),
  observacao:  z.string().optional(),
})

const pagamentoSchema = z.object({
  cartaoId:       z.string().min(1),
  valor:          z.coerce.number().positive(),
  data:           z.coerce.date(),
  mesReferencia:  z.string().optional(), // yyyy-MM — define o ciclo da fatura
  formaPagamento: z.enum(['DINHEIRO', 'PIX', 'DEBITO', 'BOLETO', 'TRANSFERENCIA']).default('PIX'),
  descricao:      z.string().optional(),
  observacao:     z.string().optional(),
})

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')
  return session.user.id
}

export async function criarCartao(data: unknown) {
  const userId = await getUserId()
  const parsed = cartaoSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  await db.cartao.create({ data: { ...parsed.data, userId } })
  revalidatePath('/cartoes')
}

export async function atualizarCartao(id: string, data: unknown) {
  const userId = await getUserId()
  const parsed = cartaoSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  await db.cartao.update({ where: { id, userId }, data: parsed.data })
  revalidatePath('/cartoes')
}

export async function toggleCartao(id: string, ativo: boolean) {
  const userId = await getUserId()
  await db.cartao.update({ where: { id, userId }, data: { ativo } })
  revalidatePath('/cartoes')
}

export async function deletarCartao(id: string) {
  const userId = await getUserId()
  await db.cartao.delete({ where: { id, userId } })
  revalidatePath('/cartoes')
}

/**
 * Cria todas as parcelas restantes de uma compra no cartão.
 * Exemplo: TV 12x a partir da parcela 6 → cria parcelas 6/12 ... 12/12
 */
export async function criarCompraParcelada(data: unknown) {
  const userId = await getUserId()
  const parsed = compraParceladaSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  const {
    descricao, valorTotal, totalParcelas, parcelaInicial,
    dataPrimeiraParcela, categoriaId, cartaoId, observacao,
  } = parsed.data

  const valorBase   = Math.floor((valorTotal / totalParcelas) * 100) / 100
  const totalBase   = valorBase * totalParcelas
  const ajuste      = Math.round((valorTotal - totalBase) * 100) / 100
  const parcelasRestantes = totalParcelas - parcelaInicial + 1

  const transacoes = Array.from({ length: parcelasRestantes }, (_, i) => {
    const numero = parcelaInicial + i
    const isUltima = numero === totalParcelas
    return {
      descricao,
      tipo:          'SAIDA' as const,
      valor:         isUltima ? valorBase + ajuste : valorBase,
      data:          addMonths(dataPrimeiraParcela, i),
      status:        'PARCELADO' as const,
      formaPagamento:'CREDITO' as const,
      origem:        'MANUAL' as const,
      numeroParcela: numero,
      totalParcelas,
      categoriaId,
      cartaoId,
      observacao:    observacao ?? null,
      userId,
    }
  })

  await db.transacao.createMany({ data: transacoes })

  revalidatePath('/cartoes')
  revalidatePath(`/cartoes/${cartaoId}`)
  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
}

/**
 * Cria N lançamentos mensais idênticos (assinatura, mensalidade, etc.)
 */
export async function criarCompraRecorrente(data: unknown) {
  const userId = await getUserId()
  const parsed = compraRecorrenteSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  const { descricao, valor, meses, dataInicio, categoriaId, cartaoId, observacao } = parsed.data

  const transacoes = Array.from({ length: meses }, (_, i) => ({
    descricao,
    tipo:          'SAIDA' as const,
    valor,
    data:          addMonths(dataInicio, i),
    status:        'PARCELADO' as const,
    formaPagamento:'CREDITO' as const,
    origem:        'MANUAL' as const,
    recorrente:    true,
    categoriaId,
    cartaoId,
    observacao:    observacao ?? null,
    userId,
  }))

  await db.transacao.createMany({ data: transacoes })

  revalidatePath('/cartoes')
  revalidatePath(`/cartoes/${cartaoId}`)
  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
}

/**
 * Registra pagamento (parcial ou total) da fatura do cartão.
 */
export async function registrarPagamento(data: unknown) {
  const userId = await getUserId()
  const parsed = pagamentoSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  const { cartaoId, valor, data: dataPagamento, mesReferencia, formaPagamento, descricao, observacao } = parsed.data

  // Se mesReferencia informado, usar o 1º do mês para garantir que getMesFatura
  // agrupe este pagamento no ciclo correto independente do dia real de pagamento.
  const dataTransacao = mesReferencia
    ? startOfMonth(parseISO(`${mesReferencia}-01`))
    : dataPagamento

  await db.transacao.create({
    data: {
      descricao:     descricao || 'Pagamento fatura',
      tipo:          'ENTRADA',
      valor,
      data:          dataTransacao,
      status:        'PAGO',
      formaPagamento,
      origem:        'MANUAL',
      observacao:    observacao ?? null,
      cartaoId,
      userId,
    },
  })

  revalidatePath('/cartoes')
  revalidatePath(`/cartoes/${cartaoId}`)
  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
}

