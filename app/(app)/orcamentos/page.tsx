import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getMesAno } from '@/lib/utils'
import { startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { SeletorMes } from '@/components/dashboard/seletor-mes'
import { ListaOrcamentos } from '@/components/orcamentos/lista-orcamentos'
import type { CardGasto } from '@/components/orcamentos/lista-orcamentos'

interface Props {
  searchParams: Promise<{ mes?: string }>
}

export default async function OrcamentosPage({ searchParams }: Props) {
  const { mes } = await searchParams
  const mesAno  = mes ?? getMesAno()

  const session = await auth()
  const userId  = session!.user!.id!

  const inicioMes = startOfMonth(parseISO(`${mesAno}-01`))
  const fimMes    = endOfMonth(inicioMes)

  const [gastos, orcamentos, categorias, cartoes] = await Promise.all([
    // Apenas o que foi registrado pelo orçamento
    db.transacao.findMany({
      where: {
        userId,
        contaOrcamento: true,
        data: { gte: inicioMes, lte: fimMes },
      },
      select: {
        id:             true,
        categoriaId:    true,
        valor:          true,
        descricao:      true,
        data:           true,
        status:         true,
        formaPagamento: true,
        numeroParcela:  true,
        totalParcelas:  true,
        cartaoId:       true,
        cartao:         { select: { nome: true } },
      },
      orderBy: { data: 'desc' },
    }),

    db.orcamento.findMany({
      where: { userId, mesAno },
    }),

    db.categoria.findMany({
      where:   { userId, tipo: 'SAIDA', ativo: true },
      orderBy: { nome: 'asc' },
    }),

    db.cartao.findMany({
      where:   { userId, ativo: true },
      orderBy: { nome: 'asc' },
    }),
  ])

  // Limite global (categoriaId null)
  const limiteGlobal = orcamentos.find((o) => o.categoriaId === null) ?? null

  // Mapa categoriaId → limite (só os por categoria)
  const limitePorCategoria = new Map(
    orcamentos
      .filter((o) => o.categoriaId !== null)
      .map((o) => [o.categoriaId!, o])
  )

  // Agrupa gastos por categoria
  const gastoPorCategoria = new Map<string, number>()
  const transacoesPorCategoria = new Map<string, typeof gastos>()
  let totalGasto = 0
  for (const t of gastos) {
    totalGasto += t.valor
    if (!t.categoriaId) continue
    gastoPorCategoria.set(t.categoriaId, (gastoPorCategoria.get(t.categoriaId) ?? 0) + t.valor)
    const lista = transacoesPorCategoria.get(t.categoriaId) ?? []
    lista.push(t)
    transacoesPorCategoria.set(t.categoriaId, lista)
  }

  // Categorias que aparecem no mês: com gasto OU com limite definido
  const categoriaMap = new Map(categorias.map((c) => [c.id, c]))
  const categoriasVisiveis = new Set([
    ...gastoPorCategoria.keys(),
    ...limitePorCategoria.keys(),
  ])

  const cards: CardGasto[] = Array.from(categoriasVisiveis)
    .map((catId) => {
      const categoria  = categoriaMap.get(catId)
      if (!categoria) return null
      const orc        = limitePorCategoria.get(catId) ?? null
      return {
        categoriaId:  catId,
        categoria,
        gasto:        gastoPorCategoria.get(catId) ?? 0,
        limite:       orc?.valorLimite ?? null,
        orcamentoId:  orc?.id ?? null,
        mesAno,
        transacoes:   transacoesPorCategoria.get(catId) ?? [],
      }
    })
    .filter(Boolean) as CardGasto[]

  // Ordena: com limite primeiro, depois por nome
  cards.sort((a, b) => {
    if ((a.limite !== null) !== (b.limite !== null)) return a.limite !== null ? -1 : 1
    return a.categoria.nome.localeCompare(b.categoria.nome)
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-center">
        <SeletorMes mesAno={mesAno} basePath="/orcamentos" />
      </div>

      <ListaOrcamentos
        mesAno={mesAno}
        cards={cards}
        limiteGlobal={limiteGlobal ? { ...limiteGlobal, gasto: totalGasto } : null}
        totalGasto={totalGasto}
        categorias={categorias}
        cartoes={cartoes}
      />
    </div>
  )
}
