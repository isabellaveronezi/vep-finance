'use client'

import type { ComponentType } from 'react'
import { useState } from 'react'
import { BriefcaseBusiness, HandCoins } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ListaDividas } from './lista-dividas'
import { ListaDividasTerceiro } from './lista-dividas-terceiro'
import { cn, formatCurrency, parseLocalDate } from '@/lib/utils'
import type { DividaPropria, DividaTerceiro, Cartao } from '@/app/generated/prisma/client'

interface DividaComSaldo extends DividaPropria {
  valorPago: number
  pagamentos: { valor: number; data: Date }[]
}

interface DividasPageClientProps {
  dividas: DividaComSaldo[]
  dividasTerceiros: DividaTerceiro[]
  cartoes: Cartao[]
  hoje: string
}

type Tab = 'proprias' | 'terceiros'

export function DividasPageClient({ dividas, dividasTerceiros, cartoes, hoje }: DividasPageClientProps) {
  const [tab, setTab] = useState<Tab>('proprias')

  const now = new Date(hoje)
  const dividasAbertas = dividas.filter((d) => d.status === 'ABERTA')
  const cobrancasAbertas = dividasTerceiros.filter((d) => d.status === 'ABERTA' || d.status === 'PARCIAL')

  const totalDevendo = dividasAbertas.reduce((sum, d) => sum + Math.max(0, d.valorTotal - d.valorPago), 0)
  const totalReceber = cobrancasAbertas.reduce((sum, d) => sum + Math.max(0, d.valorTotal - d.valorRecebido), 0)

  const dividasVencidas = dividasAbertas.filter((d) => d.vencimento && parseLocalDate(d.vencimento) < now).length
  const cobrancasVencidas = cobrancasAbertas.filter((d) => d.vencimento && parseLocalDate(d.vencimento) < now).length

  const saldoLiquido = totalReceber - totalDevendo

  return (
    <div className="space-y-5">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="rounded-[28px] border border-border/70 bg-background p-4 shadow-[0_1px_0_rgba(15,23,42,0.04),0_14px_32px_rgba(15,23,42,0.05)] sm:p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {format(now, "MMMM 'de' yyyy", { locale: ptBR })} · Finanças
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
              Dívidas
            </h1>
          </div>

          <div className={cn(
            'mt-1 rounded-full px-3.5 py-1.5 text-sm font-semibold tabular-nums',
            saldoLiquido >= 0
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
          )}>
            {saldoLiquido >= 0 ? '+' : '−'}{formatCurrency(Math.abs(saldoLiquido))}
          </div>
        </div>

        {/* Metrics bar */}
        <div className="grid grid-cols-3 divide-x divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
          <MetricBlock
            label="A pagar"
            value={formatCurrency(totalDevendo)}
            sub={`${dividasAbertas.length} abertas`}
            tone="negative"
          />
          <MetricBlock
            label="A receber"
            value={formatCurrency(totalReceber)}
            sub={`${cobrancasAbertas.length} pendências`}
            tone="positive"
          />
          <MetricBlock
            label="Saldo líquido"
            value={formatCurrency(Math.abs(saldoLiquido))}
            sub={saldoLiquido >= 0 ? 'posição favorável' : 'posição pressionada'}
            tone={saldoLiquido >= 0 ? 'positive' : 'negative'}
          />
        </div>

        {/* Tab switcher */}
        <div className="mt-3 flex gap-1 rounded-xl border border-border/70 bg-muted/20 p-1">
          <TabPill
            active={tab === 'proprias'}
            icon={BriefcaseBusiness}
            label="Minhas dívidas"
            count={dividasVencidas}
            countTone="negative"
            onClick={() => setTab('proprias')}
          />
          <TabPill
            active={tab === 'terceiros'}
            icon={HandCoins}
            label="Me devem"
            count={cobrancasVencidas}
            countTone="warning"
            onClick={() => setTab('terceiros')}
          />
        </div>
      </div>

      {/* ─── List ────────────────────────────────────────────── */}
      <div className="rounded-[28px] border border-border/70 bg-background p-4 shadow-[0_1px_0_rgba(15,23,42,0.04),0_14px_32px_rgba(15,23,42,0.05)] sm:p-5">
        {tab === 'proprias'
          ? <ListaDividas dividas={dividas} hoje={hoje} />
          : <ListaDividasTerceiro dividas={dividasTerceiros} cartoes={cartoes} hoje={hoje} />}
      </div>
    </div>
  )
}

function MetricBlock({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub: string
  tone: 'positive' | 'negative'
}) {
  return (
    <div className="px-4 py-4 sm:px-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className={cn(
        'mt-1.5 text-lg font-semibold tabular-nums tracking-tight sm:text-xl',
        tone === 'positive'
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-rose-600 dark:text-rose-400',
      )}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
    </div>
  )
}

function TabPill({
  active,
  icon: Icon,
  label,
  count,
  countTone,
  onClick,
}: {
  active: boolean
  icon: ComponentType<{ className?: string }>
  label: string
  count: number
  countTone: 'negative' | 'warning'
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150',
        active
          ? 'bg-foreground text-background shadow-sm'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
      {count > 0 && (
        <span className={cn(
          'rounded-full px-1.5 py-px text-[10px] font-semibold',
          countTone === 'negative'
            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        )}>
          {count}
        </span>
      )}
    </button>
  )
}
