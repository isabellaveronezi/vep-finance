import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ListaTransacoes } from '@/components/transacoes/lista-transacoes'

export default async function TransacoesPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const [transacoes, categorias, cartoes] = await Promise.all([
    db.transacao.findMany({
      where: { userId },
      orderBy: { data: 'desc' },
      include: { categoria: true, cartao: true },
    }),
    db.categoria.findMany({
      where: { userId },
      orderBy: { nome: 'asc' },
    }),
    db.cartao.findMany({
      where: { userId, ativo: true },
      orderBy: { nome: 'asc' },
    }),
  ])

  return (
    <ListaTransacoes
      transacoes={transacoes}
      categorias={categorias}
      cartoes={cartoes}
    />
  )
}
