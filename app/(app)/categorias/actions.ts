'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { categoriaSchema } from '@/lib/validations/categoria'

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')
  return session.user.id
}

export async function criarCategoria(data: unknown) {
  const userId = await getUserId()
  const parsed = categoriaSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  await db.categoria.create({
    data: { ...parsed.data, userId },
  })

  revalidatePath('/categorias')
}

export async function atualizarCategoria(id: string, data: unknown) {
  const userId = await getUserId()
  const parsed = categoriaSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  await db.categoria.update({
    where: { id, userId },
    data: parsed.data,
  })

  revalidatePath('/categorias')
}

export async function toggleCategoria(id: string, ativo: boolean) {
  const userId = await getUserId()

  await db.categoria.update({
    where: { id, userId },
    data: { ativo },
  })

  revalidatePath('/categorias')
}

export async function deletarCategoria(id: string) {
  const userId = await getUserId()

  await db.categoria.delete({
    where: { id, userId },
  })

  revalidatePath('/categorias')
}
