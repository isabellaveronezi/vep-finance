import { Suspense } from 'react'
import { startOfMonth, endOfMonth } from 'date-fns'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getMesAno } from '@/lib/utils'
import { ListaContasFixas } from '@/components/contas-fixas/lista-contas-fixas'

interface Props {
  searchParams: Promise<{ mes?: string }>
}

export default async function ContasFixasPage({ searchParams }: Props) {
  const { mes } = await searchParams
  const session  = await auth()
  const userId   = session!.user!.id!

  const mesAno = mes ?? getMesAno()
  const [ano, mesNum] = mesAno.split('-').map(Number)
  const inicioMes = new Date(ano, mesNum - 1, 1)
  const fimMes    = endOfMonth(inicioMes)

  const [contasFixas, categorias, pagamentosDoMes] = await Promise.all([
    db.contaFixa.findMany({
      where:   { userId },
      orderBy: { diaVencimento: 'asc' },
      include: { categoria: true },
    }),
    db.categoria.findMany({
      where:   { userId, ativo: true },
      orderBy: { nome: 'asc' },
    }),
    db.transacao.findMany({
      where: {
        userId,
        contaFixaId: { not: null },
        data: { gte: inicioMes, lte: fimMes },
      },
      select: { contaFixaId: true, valor: true },
    }),
  ])

  const valorRealMap = new Map(pagamentosDoMes.map((t) => [t.contaFixaId!, t.valor]))

  const contasComStatus = contasFixas.map((c) => ({
    ...c,
    pagaNoMes: valorRealMap.has(c.id),
    valorPago: valorRealMap.get(c.id) ?? null,
  }))

  return (
    <Suspense>
      <ListaContasFixas
        contasFixas={contasComStatus}
        categorias={categorias}
        mesAno={mesAno}
      />
    </Suspense>
  )
}
