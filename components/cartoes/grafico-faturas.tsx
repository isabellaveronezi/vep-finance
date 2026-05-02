'use client'

import { useMemo } from 'react'
import { addMonths, startOfMonth, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { Transacao } from '@/app/generated/prisma/client'

interface GraficoFaturasProps {
  transacoes: Pick<Transacao, 'tipo' | 'valor' | 'data'>[]
  diaFechamento: number
  cor?: string | null
  onBarClick?: (ts: number) => void
}

function getMesFatura(data: Date, diaFechamento: number): Date {
  return data.getDate() <= diaFechamento
    ? startOfMonth(data)
    : startOfMonth(addMonths(data, 1))
}

interface TooltipPayload {
  value: number
  payload: { label: string; total: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const { label, total } = payload[0].payload
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-semibold capitalize">{label}</p>
      <p className="text-muted-foreground">{formatCurrency(total)}</p>
    </div>
  )
}

export function GraficoFaturas({ transacoes, diaFechamento, cor, onBarClick }: GraficoFaturasProps) {
  const hoje = new Date()

  // Fatura atual
  const faturaAtualMs = (
    hoje.getDate() <= diaFechamento
      ? startOfMonth(hoje)
      : startOfMonth(addMonths(hoje, 1))
  ).getTime()

  const dados = useMemo(() => {
    // Agrupa saídas por mês de fatura
    const mapa = new Map<number, number>()

    transacoes
      .filter((t) => t.tipo === 'SAIDA')
      .forEach((t) => {
        const mesFatura = getMesFatura(new Date(t.data), diaFechamento)
        const ts = mesFatura.getTime()
        mapa.set(ts, (mapa.get(ts) ?? 0) + t.valor)
      })

    if (mapa.size === 0) return []

    const timestamps = Array.from(mapa.keys()).sort((a, b) => a - b)
    const min = timestamps[0]
    const max = timestamps[timestamps.length - 1]

    // Garante ao menos 6 meses futuros visíveis
    const fim = Math.max(max, startOfMonth(addMonths(hoje, 5)).getTime())

    const resultado: { ts: number; label: string; total: number; isFuturo: boolean; isAtual: boolean }[] = []
    let cur = new Date(min)
    while (cur.getTime() <= fim) {
      const ts = cur.getTime()
      resultado.push({
        ts,
        label: format(cur, "MMM/yy", { locale: ptBR }),
        total: mapa.get(ts) ?? 0,
        isAtual:  ts === faturaAtualMs,
        isFuturo: ts > faturaAtualMs,
      })
      cur = startOfMonth(addMonths(cur, 1))
    }

    return resultado
  }, [transacoes, diaFechamento, faturaAtualMs])

  if (dados.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        Sem transações para exibir
      </div>
    )
  }

  const barCor  = cor ?? '#6b7280'
  const corAtual  = barCor
  const corFuturo = barCor + 'aa'  // mesma cor com transparência
  const corPassado = '#94a3b8'

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: barCor }} />
          Fatura atual
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: barCor + 'aa' }} />
          Futuras
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-400" />
          Encerradas
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={dados}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.06)', radius: 4 }} />
          <ReferenceLine
            x={dados.find((d) => d.isAtual)?.label}
            stroke={barCor}
            strokeDasharray="4 3"
            strokeWidth={1.5}
          />
          <Bar
            dataKey="total"
            radius={[4, 4, 0, 0]}
            style={onBarClick ? { cursor: 'pointer' } : undefined}
            onClick={(data: { ts: number }) => onBarClick?.(data.ts)}
          >
            {dados.map((d) => (
              <Cell
                key={d.ts}
                fill={d.isAtual ? corAtual : d.isFuturo ? corFuturo : corPassado}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
