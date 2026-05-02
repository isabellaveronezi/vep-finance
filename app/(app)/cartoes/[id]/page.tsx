import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { DemonstrativoCartao } from '@/components/cartoes/demonstrativo-cartao'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CartaoPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  const userId = session!.user!.id!

  const [cartao, transacoes, categorias, cartoes] = await Promise.all([
    db.cartao.findUnique({ where: { id, userId } }),
    db.transacao.findMany({
      where: { cartaoId: id, userId },
      include: { categoria: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.categoria.findMany({
      where: { userId, tipo: 'SAIDA', ativo: true },
      orderBy: { nome: 'asc' },
    }),
    db.cartao.findMany({
      where: { userId, ativo: true },
      orderBy: { nome: 'asc' },
    }),
  ])

  if (!cartao) notFound()

  return (
    <DemonstrativoCartao
      cartao={cartao}
      transacoes={transacoes}
      categorias={categorias}
      cartoes={cartoes}
    />
  )
}
