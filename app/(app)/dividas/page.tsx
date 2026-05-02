import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { DividasPageClient } from '@/components/dividas/dividas-page-client'

export default async function DividasPage() {
  const session = await auth()
  const userId  = session!.user!.id!

  const [dividas, dividasTerceiros, cartoes] = await Promise.all([
    db.dividaPropria.findMany({
      where:   { userId },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        transacoes: {
          where:   { tipo: 'SAIDA' },
          select:  { valor: true, data: true },
          orderBy: { data: 'asc' },
        },
      },
    }),
    db.dividaTerceiro.findMany({
      where:   { userId },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    }),
    db.cartao.findMany({
      where:   { userId, ativo: true },
      orderBy: { nome: 'asc' },
    }),
  ])

  const dividasComSaldo = dividas.map((d) => ({
    ...d,
    valorPago:   d.transacoes.reduce((s, t) => s + t.valor, 0),
    pagamentos:  d.transacoes.map((t) => ({ valor: t.valor, data: t.data })),
    transacoes:  undefined,
  }))

  return (
    <DividasPageClient
      dividas={dividasComSaldo}
      dividasTerceiros={dividasTerceiros}
      cartoes={cartoes}
      hoje={new Date().toISOString()}
    />
  )
}
