'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { metaSchema, aporteSchema } from '@/lib/validations/meta'

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')
  return session.user.id
}

export async function criarMeta(data: unknown) {
  const userId = await getUserId()
  const parsed = metaSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  await db.meta.create({
    data: {
      ...parsed.data,
      descricao:     parsed.data.descricao     ?? null,
      icone:         parsed.data.icone         ?? null,
      aportesMensal: parsed.data.aportesMensal ?? null,
      prazoEstimado: parsed.data.prazoEstimado ?? null,
      userId,
    },
  })
  revalidatePath('/metas')
}

export async function atualizarMeta(id: string, data: unknown) {
  const userId = await getUserId()
  const parsed = metaSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  await db.meta.update({
    where: { id, userId },
    data: {
      ...parsed.data,
      descricao:     parsed.data.descricao     ?? null,
      icone:         parsed.data.icone         ?? null,
      aportesMensal: parsed.data.aportesMensal ?? null,
      prazoEstimado: parsed.data.prazoEstimado ?? null,
    },
  })
  revalidatePath('/metas')
}

export async function deletarMeta(id: string) {
  const userId = await getUserId()
  await db.meta.delete({ where: { id, userId } })
  revalidatePath('/metas')
}

export async function registrarAporte(id: string, data: unknown) {
  const userId = await getUserId()
  const parsed = aporteSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  const meta = await db.meta.findUnique({ where: { id, userId } })
  if (!meta) throw new Error('Meta não encontrada')

  const novoValor = Math.min(meta.valorAtual + parsed.data.valor, meta.valorObjetivo)
  await db.meta.update({
    where: { id, userId },
    data:  { valorAtual: novoValor },
  })
  revalidatePath('/metas')
}

export async function concluirMeta(id: string) {
  const userId = await getUserId()
  await db.meta.update({ where: { id, userId }, data: { ativo: false } })
  revalidatePath('/metas')
}

export async function reabrirMeta(id: string) {
  const userId = await getUserId()
  await db.meta.update({ where: { id, userId }, data: { ativo: true } })
  revalidatePath('/metas')
}
