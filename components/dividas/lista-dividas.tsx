'use client'

import type { ComponentType } from 'react'
import { useState, useTransition } from 'react'
import {
  CheckCheck,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Wallet,
} from 'lucide-react'
import { format, startOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FormDivida } from './form-divida'
import { FormPagamentoDivida } from './form-pagamento-divida'
import { deletarDivida, quitarDivida, reabrirDivida } from '@/app/(app)/dividas/actions'
import { cn, formatCurrency, parseLocalDate } from '@/lib/utils'
import type { DividaPropria } from '@/app/generated/prisma/client'

interface DividaComSaldo extends DividaPropria {
  valorPago: number
  pagamentos: { valor: number; data: Date }[]
}

interface ListaDividasProps {
  dividas: DividaComSaldo[]
  hoje: string
}

interface Parcelamento {
  numero: number
  dataVenc: Date
  valor: number
  pago: boolean
  vencida: boolean
  valorPago: number | null
}

export function ListaDividas({ dividas, hoje: hojeIso }: ListaDividasProps) {
  const hoje = new Date(hojeIso)
  const [criando, setCriando] = useState(false)
  const [editando, setEditando] = useState<DividaComSaldo | null>(null)
  const [pagando, setPagando] = useState<DividaComSaldo | null>(null)
  const [deletando, setDeletando] = useState<DividaComSaldo | null>(null)
  const [abertasCards, setAbertasCards] = useState<Set<string>>(new Set())
  const [expandidasParcelas, setExpandidasParcelas] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  function toggleCard(id: string) {
    setAbertasCards((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function toggleParcelas(id: string) {
    setExpandidasParcelas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function getParcelas(d: DividaComSaldo): Parcelamento[] {
    if (!d.vencimento) return []
    const quantidade = d.parcelas ?? 1
    const vencimento = new Date(d.vencimento)

    return Array.from({ length: quantidade }, (_, index) => {
      const dataVenc = subMonths(vencimento, quantidade - 1 - index)
      const mesMs = startOfMonth(dataVenc).getTime()
      const pagamento = d.pagamentos.find(
        (item) => startOfMonth(new Date(item.data)).getTime() === mesMs
      )
      return {
        numero: index + 1,
        dataVenc,
        valor: d.valorTotal / quantidade,
        pago: Boolean(pagamento),
        vencida: !pagamento && dataVenc < hoje,
        valorPago: pagamento?.valor ?? null,
      }
    })
  }

  const abertas = dividas.filter((d) => d.status === 'ABERTA')
  const quitadas = dividas.filter((d) => d.status === 'QUITADA')

  const totalDevendo = abertas.reduce((sum, d) => sum + Math.max(0, d.valorTotal - d.valorPago), 0)
  const totalPago = abertas.reduce((sum, d) => sum + d.valorPago, 0)
  const dividasVencidas = abertas.filter((d) => d.vencimento && parseLocalDate(d.vencimento) < hoje).length

  const inicioMesAtual = startOfMonth(hoje)
  const saldoMensal = abertas.reduce((sum, d) => {
    if (!d.vencimento) return sum
    const parcelas = d.parcelas
      ? getParcelas(d)
      : [{ numero: 1, dataVenc: parseLocalDate(d.vencimento), valor: d.valorTotal, pago: d.valorPago >= d.valorTotal, vencida: false, valorPago: null }]
    const parcelaMes = parcelas.find(
      (item) => !item.pago && startOfMonth(item.dataVenc).getTime() === inicioMesAtual.getTime()
    )
    return sum + (parcelaMes?.valor ?? 0)
  }, 0)

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Minhas dívidas</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {abertas.length > 0
              ? `${abertas.length} em aberto · ${formatCurrency(totalDevendo)} restante`
              : 'Nenhuma dívida em aberto'}
          </p>
        </div>
        <Button
          onClick={() => setCriando(true)}
          size="sm"
          className="h-8 w-full gap-1.5 rounded-lg text-xs sm:w-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          Nova dívida
        </Button>
      </div>

      {/* Inline metrics */}
      {abertas.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-lg bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <span>Pago <span className="font-medium text-foreground">{formatCurrency(totalPago)}</span></span>
          {saldoMensal > 0 && (
            <span>Este mês <span className="font-medium text-foreground">{formatCurrency(saldoMensal)}</span></span>
          )}
          {dividasVencidas > 0 && (
            <span className="font-medium text-rose-600 dark:text-rose-400">
              {dividasVencidas} vencida{dividasVencidas !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={criando} onOpenChange={setCriando}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar dívida</DialogTitle>
          </DialogHeader>
          <FormDivida onSuccess={() => setCriando(false)} />
        </DialogContent>
      </Dialog>

      {/* Empty state */}
      {dividas.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma dívida registrada.</p>
        </div>
      )}

      {/* Open debts */}
      {abertas.length > 0 && (
        <div className="overflow-hidden rounded-[22px] border border-border/70 divide-y divide-border/50">
          {abertas.map((d) => {
            const saldo = Math.max(0, d.valorTotal - d.valorPago)
            const percentual = d.valorTotal > 0 ? Math.min((d.valorPago / d.valorTotal) * 100, 100) : 0
            const vencida = d.vencimento && parseLocalDate(d.vencimento) < hoje
            const parcelas = d.parcelas ? getParcelas(d) : []
            const parcelaAtual = parcelas.find((p) => !p.pago)?.numero ?? null
            const parcelaUnit = formatCurrency(d.valorTotal / (d.parcelas ?? 1))
            const aberta = abertasCards.has(d.id)

            return (
              <article key={d.id} className={cn('bg-background', aberta && 'bg-muted/[0.06]')}>
                {/* Row */}
                <button
                  onClick={() => toggleCard(d.id)}
                  className="group flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/30"
                >
                  {/* Status dot */}
                  <span className={cn(
                    'mt-[7px] h-2 w-2 shrink-0 rounded-full',
                    vencida ? 'bg-rose-500' : percentual >= 80 ? 'bg-emerald-500' : 'bg-muted-foreground/30',
                  )} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm font-semibold text-foreground">{d.credor}</span>
                        {d.parcelas && (
                          <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {parcelaAtual ? `${parcelaAtual}/${d.parcelas}x` : `${d.parcelas}x`}
                          </span>
                        )}
                        {vencida && (
                          <span className="shrink-0 rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                            Vencida
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                        {formatCurrency(saldo)}
                      </span>
                    </div>

                    {d.descricao && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{d.descricao}</p>
                    )}

                    {/* Progress + meta */}
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-border/70">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            percentual >= 80 ? 'bg-emerald-500' : 'bg-foreground/40',
                          )}
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-muted-foreground/60">
                        {percentual.toFixed(0)}%
                      </span>
                      {d.vencimento && (
                        <span className="text-[10px] text-muted-foreground/60">
                          {format(parseLocalDate(d.vencimento), 'dd MMM', { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="mt-0.5 shrink-0 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/60">
                    {aberta ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>

                {/* Expanded */}
                {aberta && (
                  <div className="border-t border-border/50 px-4 py-4">
                    <div className="space-y-3.5">
                      {/* Stats */}
                      <div className="grid grid-cols-3 divide-x divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-muted/20">
                        <StatBlock label="Pago" value={formatCurrency(d.valorPago)} />
                        <StatBlock label="Total" value={formatCurrency(d.valorTotal)} />
                        <StatBlock label="Restante" value={formatCurrency(saldo)} accent="negative" />
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span className="font-medium uppercase tracking-[0.14em]">Progresso</span>
                          <span className="tabular-nums">{percentual.toFixed(0)}% quitado</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-border/70">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              percentual >= 80 ? 'bg-emerald-500' : 'bg-foreground/50',
                            )}
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="overflow-hidden rounded-xl border border-border/70 divide-y divide-border/50">
                        <ActionCmd
                          icon={Wallet}
                          label="Registrar pagamento"
                          onClick={() => setPagando(d)}
                          disabled={saldo <= 0 || isPending}
                          primary
                        />
                        <ActionCmd
                          icon={CheckCheck}
                          label="Quitar manualmente"
                          tone="positive"
                          onClick={() => startTransition(() => quitarDivida(d.id))}
                          disabled={isPending}
                        />
                        <ActionCmd
                          icon={Pencil}
                          label="Editar dívida"
                          onClick={() => setEditando(d)}
                        />
                        <ActionCmd
                          icon={Trash2}
                          label="Excluir dívida"
                          tone="negative"
                          onClick={() => setDeletando(d)}
                        />
                      </div>

                      {/* Cronograma */}
                      {d.vencimento && d.parcelas && (
                        <div className="overflow-hidden rounded-xl border border-border/70">
                          <button
                            onClick={() => toggleParcelas(d.id)}
                            className="flex w-full items-center justify-between px-4 py-3 text-xs transition-colors hover:bg-muted/30"
                          >
                            <span className="font-medium text-foreground/70">Cronograma de parcelas</span>
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <span>{parcelaUnit} cada</span>
                              {expandidasParcelas.has(d.id)
                                ? <ChevronUp className="h-3.5 w-3.5" />
                                : <ChevronRight className="h-3.5 w-3.5" />}
                            </span>
                          </button>
                          {expandidasParcelas.has(d.id) && (
                            <div className="divide-y divide-border/50 border-t border-border/50">
                              {getParcelas(d).map((p) => (
                                <ParcelRow key={p.numero} parcela={p} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Edit dialog */}
                <Dialog
                  open={editando?.id === d.id}
                  onOpenChange={(open) => { if (!open) setEditando(null) }}
                >
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Editar dívida</DialogTitle>
                    </DialogHeader>
                    <FormDivida divida={d} onSuccess={() => setEditando(null)} />
                  </DialogContent>
                </Dialog>
              </article>
            )
          })}
        </div>
      )}

      {/* Quitadas */}
      {quitadas.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.17em] text-muted-foreground">
            Quitadas · {quitadas.length}
          </p>
          <div className="overflow-hidden rounded-[20px] border border-border/50 divide-y divide-border/40">
            {quitadas.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/20">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/40" />
                <span className="flex-1 truncate text-sm text-muted-foreground/50 line-through">{d.credor}</span>
                {d.descricao && (
                  <span className="hidden max-w-[180px] truncate text-xs text-muted-foreground/40 sm:block">
                    {d.descricao}
                  </span>
                )}
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground/50">
                  {formatCurrency(d.valorTotal)}
                </span>
                <button
                  title="Reabrir"
                  disabled={isPending}
                  onClick={() => startTransition(() => reabrirDivida(d.id))}
                  className="rounded-md p-1 text-muted-foreground/40 transition-colors hover:bg-muted hover:text-muted-foreground disabled:opacity-30"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment dialog */}
      <Dialog open={!!pagando} onOpenChange={(open) => { if (!open) setPagando(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
          </DialogHeader>
          {pagando && (
            <FormPagamentoDivida
              dividaId={pagando.id}
              credor={pagando.credor}
              saldoRestante={Math.max(0, pagando.valorTotal - pagando.valorPago)}
              onSuccess={() => setPagando(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={!!deletando} onOpenChange={(open) => { if (!open) setDeletando(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar dívida?</AlertDialogTitle>
            <AlertDialogDescription>
              A dívida com <strong>{deletando?.credor}</strong> e todos os pagamentos vinculados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletando) {
                  startTransition(async () => {
                    await deletarDivida(deletando.id)
                    setDeletando(null)
                  })
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────

function StatBlock({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: 'positive' | 'negative'
}) {
  return (
    <div className="px-2 py-2 sm:px-4 sm:py-3">
      <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px]">{label}</p>
      <p className={cn(
        'mt-0.5 text-xs font-semibold tabular-nums sm:mt-1 sm:text-sm',
        accent === 'positive'
          ? 'text-emerald-600 dark:text-emerald-400'
          : accent === 'negative'
          ? 'text-rose-600 dark:text-rose-400'
          : 'text-foreground',
      )}>
        {value}
      </p>
    </div>
  )
}

function ActionCmd({
  icon: Icon,
  label,
  onClick,
  tone = 'neutral',
  disabled,
  primary,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  tone?: 'positive' | 'negative' | 'neutral'
  disabled?: boolean
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors disabled:pointer-events-none disabled:opacity-40',
        primary && 'font-medium text-foreground hover:bg-muted/40',
        !primary && tone === 'positive' && 'text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400',
        !primary && tone === 'negative' && 'text-rose-600 hover:bg-rose-500/10 dark:text-rose-400',
        !primary && tone === 'neutral' && 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  )
}

function ParcelRow({ parcela }: { parcela: Parcelamento }) {
  const status = parcela.pago ? 'Pago' : parcela.vencida ? 'Vencida' : 'Pendente'

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2.5 text-xs',
      parcela.pago && 'bg-emerald-500/[0.04]',
      parcela.vencida && 'bg-rose-500/[0.04]',
    )}>
      <span className={cn(
        'h-1.5 w-1.5 shrink-0 rounded-full',
        parcela.pago ? 'bg-emerald-500' : parcela.vencida ? 'bg-rose-500' : 'bg-muted-foreground/30',
      )} />
      <span className="w-20 shrink-0 text-muted-foreground">Parcela {parcela.numero}</span>
      <span className="flex-1 text-muted-foreground/70">
        {format(parcela.dataVenc, "MMM 'de' yyyy", { locale: ptBR })}
      </span>
      <span className="tabular-nums text-foreground/70">
        {parcela.valorPago !== null && parcela.valorPago !== parcela.valor ? (
          <>{formatCurrency(parcela.valorPago)} <span className="line-through opacity-50">{formatCurrency(parcela.valor)}</span></>
        ) : (
          formatCurrency(parcela.valor)
        )}
      </span>
      <span className={cn(
        'w-14 text-right font-medium',
        parcela.pago
          ? 'text-emerald-600 dark:text-emerald-400'
          : parcela.vencida
          ? 'text-rose-600 dark:text-rose-400'
          : 'text-muted-foreground/50',
      )}>
        {status}
      </span>
    </div>
  )
}
