'use client'

import { TrendingUp, TrendingDown, Wallet, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface DetalheItem {
  label: string
  valor: number
}

interface JaPagoItem {
  label: string
  valor: number
}

interface ResumoCardsProps {
  receitas:         number
  receitasPagas:    number
  despesas:         number
  despesasPagas:    number
  saldo:            number
  isFuturo:         boolean
  isMesAtual:       boolean
  jaPagoTotal:      number
  jaPagoItens:      JaPagoItem[]
  detalhesDespesas: DetalheItem[]
}

interface CardProps {
  label:     string
  valor:     number
  sub?:      string
  icon:      React.ReactNode
  cor:       string
  detalhes?: DetalheItem[]
  progresso?: number
  corBarra?:  string
}

function MetricCard({ label, valor, sub, icon, cor, detalhes, progresso, corBarra = 'bg-emerald-500' }: CardProps) {
  return (
    <div className="rounded-xl border bg-card p-[18px] flex flex-col gap-[10px]">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${cor}`}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight tabular-nums">{formatCurrency(valor)}</p>
        {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
      </div>

      {typeof progresso === 'number' && progresso < 1 && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-300 ${corBarra}`}
            style={{ width: `${Math.round(progresso * 100)}%` }}
          />
        </div>
      )}

      {detalhes && detalhes.length > 0 && (
        <div className="border-t pt-2 space-y-1.5">
          {detalhes.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold tabular-nums">{formatCurrency(item.valor)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ResumoCards({
  receitas, receitasPagas, despesas, despesasPagas,
  saldo, isFuturo, isMesAtual, jaPagoTotal, jaPagoItens, detalhesDespesas,
}: ResumoCardsProps) {
  const saldoPositivo = saldo >= 0

  const progressoReceitas = !isFuturo && receitas > 0 ? receitasPagas / receitas : undefined
  const progressoDespesas = !isFuturo && despesas > 0 ? despesasPagas / despesas : undefined

  const subReceitas = isFuturo
    ? 'receita esperada no mês'
    : receitasPagas < receitas
      ? `${formatCurrency(receitasPagas)} já recebido`
      : 'entradas recebidas no mês'

  const subDespesas = isFuturo
    ? 'despesas previstas no mês'
    : despesasPagas < despesas
      ? `${formatCurrency(despesasPagas)} já pago`
      : 'despesas pagas no mês'

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label={isFuturo ? 'Receita prevista' : 'Receitas'}
        valor={receitas}
        sub={subReceitas}
        icon={<TrendingUp className="h-4 w-4" />}
        cor="bg-green-100 text-green-600"
        progresso={progressoReceitas}
      />
      <MetricCard
        label={isFuturo ? 'Despesas previstas' : 'Despesas'}
        valor={despesas}
        sub={subDespesas}
        icon={<TrendingDown className="h-4 w-4" />}
        cor="bg-red-100 text-red-600"
        detalhes={detalhesDespesas}
        progresso={progressoDespesas}
        corBarra="bg-red-400"
      />
      <MetricCard
        label={isFuturo ? 'Saldo previsto' : 'Saldo'}
        valor={saldo}
        sub={saldoPositivo ? 'você está no positivo' : 'você está no negativo'}
        icon={<Wallet className="h-4 w-4" />}
        cor={saldoPositivo ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}
      />

      {/* Card Já Pago */}
      <div className="rounded-xl border bg-card p-[18px] flex flex-col gap-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {isFuturo ? 'Planejado pagar' : 'Já pago no mês'}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </span>
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight tabular-nums">
            {formatCurrency(jaPagoTotal)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {isMesAtual ? 'saído do bolso este mês' : 'total pago no período'}
          </p>
        </div>

        {jaPagoItens.length > 0 && (
          <div className="border-t pt-2 space-y-1.5">
            {jaPagoItens.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold tabular-nums">{formatCurrency(item.valor)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
