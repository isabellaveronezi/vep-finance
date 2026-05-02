'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { transacaoSchema } from '@/lib/validations/transacao'

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')
  return session.user.id
}

export async function criarTransacao(data: unknown) {
  const userId = await getUserId()
  const parsed = transacaoSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  const { cartaoId, ...rest } = parsed.data

  await db.transacao.create({
    data: {
      ...rest,
      userId,
      origem: 'MANUAL',
      cartaoId: cartaoId || null,
    },
  })

  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
  revalidatePath('/orcamentos')
  if (cartaoId) revalidatePath(`/cartoes/${cartaoId}`)
}

export async function atualizarTransacao(id: string, data: unknown) {
  const userId = await getUserId()
  const parsed = transacaoSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  const { cartaoId, ...rest } = parsed.data

  await db.transacao.update({
    where: { id, userId },
    data: {
      ...rest,
      cartaoId: cartaoId || null,
    },
  })

  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
}

export async function atualizarStatusTransacao(
  id: string,
  status: 'PAGO' | 'PENDENTE' | 'PARCELADO'
) {
  const userId = await getUserId()

  await db.transacao.update({
    where: { id, userId },
    data: { status },
  })

  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
}

export async function toggleContaOrcamento(id: string, cartaoId: string | null) {
  const userId = await getUserId()

  const transacao = await db.transacao.findUnique({ where: { id, userId }, select: { contaOrcamento: true } })
  if (!transacao) throw new Error('Transação não encontrada')

  await db.transacao.update({
    where: { id, userId },
    data: { contaOrcamento: !transacao.contaOrcamento },
  })

  revalidatePath('/orcamentos')
  if (cartaoId) revalidatePath(`/cartoes/${cartaoId}`)
}

export async function deletarTransacao(id: string) {
  const userId = await getUserId()

  const t = await db.transacao.findUnique({
    where: { id, userId },
    select: { descricao: true, totalParcelas: true, cartaoId: true, categoriaId: true },
  })
  if (!t) return

  // Parcelado com mais de 1x → remove todas as parcelas do mesmo grupo
  if (t.totalParcelas && t.totalParcelas > 1) {
    await db.transacao.deleteMany({
      where: {
        userId,
        descricao:     t.descricao,
        totalParcelas: t.totalParcelas,
        cartaoId:      t.cartaoId ?? null,
        categoriaId:   t.categoriaId ?? null,
      },
    })
  } else {
    await db.transacao.delete({ where: { id, userId } })
  }

  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
  revalidatePath('/orcamentos')
  revalidatePath('/cartoes')
}
