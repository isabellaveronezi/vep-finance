import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ListaCategorias } from '@/components/categorias/lista-categorias'

export default async function CategoriasPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const categorias = await db.categoria.findMany({
    where: { userId },
    orderBy: { nome: 'asc' },
  })

  return (
    <div className="max-w-3xl">
      <ListaCategorias categorias={categorias} />
    </div>
  )
}
