'use server'

import { revalidatePath } from 'next/cache'
import { addMonths } from 'date-fns'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orcamentoSchema, limiteGlobalSchema } from '@/lib/validations/orcamento'

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')
  return session.user.id
}

export async function salvarOrcamento(data: unknown) {
  const userId = await getUserId()
  const parsed = orcamentoSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  const { categoriaId, valorLimite, mesAno } = parsed.data

  await db.orcamento.upsert({
    where:  { userId_categoriaId_mesAno: { userId, categoriaId, mesAno } },
    update: { valorLimite },
    create: { userId, categoriaId, valorLimite, mesAno },
  })

  revalidatePath('/orcamentos')
}

export async function salvarLimiteGlobal(data: unknown) {
  const userId = await getUserId()
  const parsed = limiteGlobalSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  const { valorLimite, mesAno } = parsed.data

  // Limite global: categoriaId = null. Upsert manual pois Prisma unique não suporta null.
  const existing = await db.orcamento.findFirst({
    where: { userId, mesAno, categoriaId: null },
  })

  if (existing) {
    await db.orcamento.update({ where: { id: existing.id }, data: { valorLimite } })
  } else {
    await db.orcamento.create({ data: { userId, mesAno, valorLimite, categoriaId: null } })
  }

  revalidatePath('/orcamentos')
}

export async function registrarGastoParcelado(data: {
  descricao:      string
  valorTotal:     number
  totalParcelas:  number
  dataPrimeira:   Date
  categoriaId:    string
  formaPagamento: 'DINHEIRO' | 'PIX' | 'DEBITO' | 'CREDITO' | 'BOLETO' | 'TRANSFERENCIA'
  cartaoId?:      string
}) {
  const userId = await getUserId()

  const { descricao, valorTotal, totalParcelas, dataPrimeira, categoriaId, formaPagamento, cartaoId } = data

  const valorBase  = Math.floor((valorTotal / totalParcelas) * 100) / 100
  const ajuste     = Math.round((valorTotal - valorBase * totalParcelas) * 100) / 100

  const transacoes = Array.from({ length: totalParcelas }, (_, i) => ({
    descricao,
    tipo:           'SAIDA' as const,
    valor:          i === totalParcelas - 1 ? valorBase + ajuste : valorBase,
    data:           addMonths(dataPrimeira, i),
    status:         'PARCELADO' as const,
    formaPagamento,
    origem:         'MANUAL' as const,
    numeroParcela:  i + 1,
    totalParcelas,
    categoriaId,
    cartaoId:       cartaoId || null,
    contaOrcamento: true,
    userId,
  }))

  await db.transacao.createMany({ data: transacoes })

  revalidatePath('/orcamentos')
  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
  if (cartaoId) revalidatePath(`/cartoes/${cartaoId}`)
}

export async function deletarOrcamento(id: string) {
  const userId = await getUserId()
  await db.orcamento.delete({ where: { id, userId } })
  revalidatePath('/orcamentos')
}
