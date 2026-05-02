'use server'

import { startOfMonth, endOfMonth } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { contaFixaSchema } from '@/lib/validations/conta-fixa'

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')
  return session.user.id
}

export async function criarContaFixa(data: unknown) {
  const userId = await getUserId()
  const parsed = contaFixaSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  await db.contaFixa.create({
    data: {
      ...parsed.data,
      categoriaId: parsed.data.categoriaId || null,
      userId,
    },
  })
  revalidatePath('/contas-fixas')
}

export async function atualizarContaFixa(id: string, data: unknown) {
  const userId = await getUserId()
  const parsed = contaFixaSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  await db.contaFixa.update({
    where: { id, userId },
    data: {
      ...parsed.data,
      categoriaId: parsed.data.categoriaId || null,
    },
  })
  revalidatePath('/contas-fixas')
}

export async function toggleContaFixa(id: string, ativo: boolean) {
  const userId = await getUserId()
  await db.contaFixa.update({ where: { id, userId }, data: { ativo } })
  revalidatePath('/contas-fixas')
}

export async function deletarContaFixa(id: string) {
  const userId = await getUserId()
  await db.contaFixa.delete({ where: { id, userId } })
  revalidatePath('/contas-fixas')
}

export async function marcarComoPaga(id: string, formaPagamento?: string, valorReal?: number) {
  const userId = await getUserId()

  const contaFixa = await db.contaFixa.findUnique({ where: { id, userId } })
  if (!contaFixa) throw new Error('Conta fixa não encontrada')

  const agora = new Date()

  // Idempotência: impede duplicata no mesmo mês
  const jaExiste = await db.transacao.findFirst({
    where: {
      userId,
      contaFixaId: id,
      data: { gte: startOfMonth(agora), lte: endOfMonth(agora) },
    },
  })
  if (jaExiste) throw new Error('Conta já marcada como paga neste mês')

  const vencimento = new Date(agora.getFullYear(), agora.getMonth(), contaFixa.diaVencimento)

  await db.transacao.create({
    data: {
      descricao:     contaFixa.descricao,
      tipo:          contaFixa.tipo,
      valor:         valorReal && valorReal > 0 ? valorReal : contaFixa.valor,
      data:          vencimento,
      status:        'PAGO',
      formaPagamento: (formaPagamento as 'PIX' | 'DINHEIRO' | 'DEBITO' | 'BOLETO' | 'TRANSFERENCIA') ?? 'PIX',
      origem:        'MANUAL',
      categoriaId:   contaFixa.categoriaId ?? null,
      contaFixaId:   id,
      userId,
    },
  })

  revalidatePath('/contas-fixas')
  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
}
