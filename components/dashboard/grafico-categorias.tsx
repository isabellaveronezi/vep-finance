'use client'

import { useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector,
} from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CategoriaGasto {
  id:    string
  nome:  string
  total: number
  cor?:  string | null
}

interface TransacaoLeve {
  id:          string
  descricao:   string
  valor:       number
  data:        Date
  status:      string
  categoriaId: string | null
}

interface GraficoCategoriasProps {
  dados:         CategoriaGasto[]
  totalDespesas: number
  transacoes:    TransacaoLeve[]
}

const PALETTE = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
]

const STATUS_COR: Record<string, string> = {
  PAGO:      'bg-green-100 text-green-700',
  PENDENTE:  'bg-yellow-100 text-yellow-700',
  PARCELADO: 'bg-blue-100 text-blue-700',
}

const TOP_N = 6

interface TooltipPayload {
  name: string
  value: number
  payload: { pct: number; fill: string }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const { name, value, payload: p } = payload[0]
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-semibold">{name}</p>
      <p className="text-muted-foreground">{formatCurrency(value)} · {p.pct.toFixed(1)}%</p>
    </div>
  )
}

// Setor ativo com brilho
function ActiveShape(props: Parameters<typeof Sector>[0] & { payload?: { fill: string } }) {
  return (
    <g>
      <Sector {...props} outerRadius={(props.outerRadius ?? 0) + 6} />
    </g>
  )
}

export function GraficoCategorias({ dados, totalDespesas, transacoes }: GraficoCategoriasProps) {
  const [ativo, setAtivo]       = useState<number | undefined>(undefined)
  const [filtro, setFiltro]     = useState<string | null>(null)  // categoriaId ou 'outros'
  const [expandido, setExpandido] = useState(false)

  if (dados.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sem despesas no período
      </div>
    )
  }

  // Top 6 + Outros
  const top    = dados.slice(0, TOP_N)
  const resto  = dados.slice(TOP_N)
  const totalOutros = resto.reduce((s, d) => s + d.total, 0)

  const chartData = [
    ...top.map((d, i) => ({
      ...d,
      fill: d.cor ?? PALETTE[i % PALETTE.length],
      pct:  totalDespesas > 0 ? (d.total / totalDespesas) * 100 : 0,
      isOutros: false,
    })),
    ...(resto.length > 0 ? [{
      id:    'outros',
      nome:  `Outros (${resto.length})`,
      total: totalOutros,
      fill:  '#94a3b8',
      pct:   totalDespesas > 0 ? (totalOutros / totalDespesas) * 100 : 0,
      isOutros: true,
    }] : []),
  ]

  // Transações do filtro selecionado
  const idsOutros = new Set(resto.map((d) => d.id))
  const txFiltradas = filtro
    ? filtro === 'outros'
      ? transacoes.filter((t) => t.categoriaId && idsOutros.has(t.categoriaId))
      : transacoes.filter((t) => t.categoriaId === filtro)
    : []

  const categoriaFiltroNome = filtro
    ? filtro === 'outros'
      ? `Outros (${resto.length} categorias)`
      : chartData.find((d) => d.id === filtro)?.nome ?? ''
    : ''

  const totalFiltro = txFiltradas.reduce((s, t) => s + t.valor, 0)
  const txVisiveis  = expandido ? txFiltradas : txFiltradas.slice(0, 5)

  function handleClick(entry: { id: string }) {
    const novoFiltro = filtro === entry.id ? null : entry.id
    setFiltro(novoFiltro)
    setExpandido(false)
  }

  return (
    <div className="space-y-4 overflow-x-hidden">
      {/* Donut */}
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="total"
            nameKey="nome"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            {...{ activeIndex: ativo, activeShape: ActiveShape }}
            onMouseEnter={(_, i) => setAtivo(i)}
            onMouseLeave={() => setAtivo(undefined)}
            onClick={(entry) => handleClick(entry as unknown as { id: string })}
            style={{ cursor: 'pointer' }}
          >
            {chartData.map((d) => (
              <Cell
                key={d.id}
                fill={d.fill}
                opacity={filtro && filtro !== d.id ? 0.35 : 1}
                stroke={filtro === d.id ? '#fff' : 'none'}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Lista de categorias — clicável */}
      <div className="space-y-1.5">
        {chartData.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => handleClick(d)}
            className={`grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted/60 sm:grid-cols-[minmax(0,1fr)_auto_auto] ${filtro === d.id ? 'bg-muted' : ''}`}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.fill }} />
              <span className="min-w-0 truncate text-sm">{d.nome}</span>
            </span>
            <span className="shrink-0 text-right text-sm font-medium tabular-nums whitespace-nowrap">{formatCurrency(d.total)}</span>
            <span className="hidden shrink-0 text-xs text-muted-foreground tabular-nums whitespace-nowrap sm:inline">{d.pct.toFixed(0)}%</span>
          </button>
        ))}
      </div>

      {/* Painel de detalhamento */}
      {filtro && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{categoriaFiltroNome}</p>
              <p className="text-xs text-muted-foreground">
                {txFiltradas.length} transaç{txFiltradas.length === 1 ? 'ão' : 'ões'} ·{' '}
                <span className="font-medium text-foreground">{formatCurrency(totalFiltro)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setFiltro(null); setExpandido(false) }}
              className="rounded-md p-1 hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {txFiltradas.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">Sem transações</p>
          ) : (
            <>
              <div className="divide-y rounded-lg border bg-background overflow-hidden">
                {txVisiveis.map((t) => (
                  <div key={t.id} className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{t.descricao}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.data)}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs shrink-0 ${STATUS_COR[t.status] ?? ''}`}>
                      {t.status === 'PAGO' ? 'Pago' : t.status === 'PARCELADO' ? 'Parcelado' : 'Pendente'}
                    </Badge>
                    <span className="text-sm font-semibold tabular-nums shrink-0 whitespace-nowrap">
                      {formatCurrency(t.valor)}
                    </span>
                  </div>
                ))}
              </div>

              {txFiltradas.length > 5 && (
                <button
                  type="button"
                  onClick={() => setExpandido(!expandido)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
                >
                  {expandido
                    ? <><ChevronUp className="h-3 w-3" /> Mostrar menos</>
                    : <><ChevronDown className="h-3 w-3" /> Ver mais {txFiltradas.length - 5} transações</>
                  }
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
