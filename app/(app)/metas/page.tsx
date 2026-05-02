import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ListaMetas } from '@/components/metas/lista-metas'

export default async function MetasPage() {
  const session = await auth()
  const userId  = session!.user!.id!

  const metas = await db.meta.findMany({
    where:   { userId },
    orderBy: [{ ativo: 'desc' }, { createdAt: 'desc' }],
  })

  return <ListaMetas metas={metas} hoje={new Date().toISOString()} />
}
