'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { dividaPropiaSchema, pagamentoDividaSchema } from '@/lib/validations/divida-propria'

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')
  return session.user.id
}

export async function criarDivida(data: unknown) {
  const userId = await getUserId()
  const parsed = dividaPropiaSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  await db.dividaPropria.create({
    data: {
      ...parsed.data,
      vencimento: parsed.data.vencimento ?? null,
      userId,
    },
  })
  revalidatePath('/dividas')
}

export async function atualizarDivida(id: string, data: unknown) {
  const userId = await getUserId()
  const parsed = dividaPropiaSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  await db.dividaPropria.update({
    where: { id, userId },
    data: {
      ...parsed.data,
      vencimento: parsed.data.vencimento ?? null,
    },
  })
  revalidatePath('/dividas')
}

export async function registrarPagamento(dividaId: string, data: unknown) {
  const userId = await getUserId()
  const parsed = pagamentoDividaSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  const divida = await db.dividaPropria.findUnique({ where: { id: dividaId, userId } })
  if (!divida) throw new Error('Dívida não encontrada')

  // Soma dos pagamentos já feitos
  const { _sum } = await db.transacao.aggregate({
    where: { dividaPropiaId: dividaId, tipo: 'SAIDA' },
    _sum:  { valor: true },
  })
  const pago = _sum.valor ?? 0

  await db.transacao.create({
    data: {
      descricao:     `Pagamento — ${divida.credor}`,
      tipo:          'SAIDA',
      valor:         parsed.data.valor,
      data:          parsed.data.data,
      status:        'PAGO',
      formaPagamento: parsed.data.formaPagamento,
      origem:        'MANUAL',
      observacao:    parsed.data.observacao ?? null,
      dividaPropiaId: dividaId,
      userId,
    },
  })

  // Quita automaticamente se saldo zerado
  const novoPago = pago + parsed.data.valor
  if (novoPago >= divida.valorTotal) {
    await db.dividaPropria.update({
      where: { id: dividaId },
      data:  { status: 'QUITADA' },
    })
  }

  revalidatePath('/dividas')
  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
}

export async function quitarDivida(id: string) {
  const userId = await getUserId()
  await db.dividaPropria.update({
    where: { id, userId },
    data:  { status: 'QUITADA' },
  })
  revalidatePath('/dividas')
}

export async function reabrirDivida(id: string) {
  const userId = await getUserId()
  await db.dividaPropria.update({
    where: { id, userId },
    data:  { status: 'ABERTA' },
  })
  revalidatePath('/dividas')
}

export async function deletarDivida(id: string) {
  const userId = await getUserId()
  await db.dividaPropria.delete({ where: { id, userId } })
  revalidatePath('/dividas')
}
