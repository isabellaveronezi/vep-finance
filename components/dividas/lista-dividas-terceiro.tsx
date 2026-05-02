'use client'

import type { ComponentType } from 'react'
import { useState, useTransition } from 'react'
import {
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Clock3,
  CreditCard,
  HandCoins,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { addMonths, format, startOfMonth } from 'date-fns'
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
import { FormDividaTerceiro } from './form-divida-terceiro'
import { FormRecebimento } from './form-recebimento'
import {
  deletarDividaTerceiro,
  quitarDividaTerceiro,
  reabrirDividaTerceiro,
} from '@/app/(app)/dividas/actions-terceiro'
import { cn, formatCurrency, parseLocalDate } from '@/lib/utils'
import type { DividaTerceiro, Cartao } from '@/app/generated/prisma/client'

interface DividaTerceiroComSaldo extends DividaTerceiro {
  valorRecebido: number
}

interface ListaDividasTerceiroProps {
  dividas: DividaTerceiroComSaldo[]
  cartoes: Cartao[]
  hoje: string
}

const FORMA_LABELS: Record<string, string> = {
  PIX: 'PIX',
  CREDITO: 'Crédito',
  DEBITO: 'Débito',
  DINHEIRO: 'Dinheiro',
  BOLETO: 'Boleto',
  TRANSFERENCIA: 'Transferência',
}

export function ListaDividasTerceiro({ dividas, cartoes, hoje: hojeIso }: ListaDividasTerceiroProps) {
  const hoje = new Date(hojeIso)
  const [criando, setCriando] = useState(false)
  const [editando, setEditando] = useState<DividaTerceiroComSaldo | null>(null)
  const [recebendo, setRecebendo] = useState<DividaTerceiroComSaldo | null>(null)
  const [deletando, setDeletando] = useState<DividaTerceiroComSaldo | null>(null)
  const [abertasCards, setAbertasCards] = useState<Set<string>>(new Set())
  // grupos fechados — começa vazio = todos abertos
  const [gruposFechados, setGruposFechados] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  function toggleCard(id: string) {
    setAbertasCards((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function toggleGrupo(chave: string) {
    setGruposFechados((prev) => {
      const next = new Set(prev)
      if (next.has(chave)) { next.delete(chave) } else { next.add(chave) }
      return next
    })
  }

  const abertas = dividas.filter((d) => d.status === 'ABERTA' || d.status === 'PARCIAL')
  const recebidas = dividas.filter((d) => d.status === 'RECEBIDA')
  const totalAReceber = abertas.reduce((sum, d) => sum + Math.max(0, d.valorTotal - d.valorRecebido), 0)
  const totalRecebido = abertas.reduce((sum, d) => sum + d.valorRecebido, 0)
  const cobrancasAtrasadas = abertas.filter((d) => d.vencimento && parseLocalDate(d.vencimento) < hoje).length

  const inicioMesAtual = startOfMonth(hoje)
  const saldoMensalAReceber = abertas.reduce((sum, d) => {
    if (!d.vencimento) return sum
    const venc = parseLocalDate(d.vencimento)
    if (startOfMonth(venc).getTime() !== inicioMesAtual.getTime()) return sum
    return sum + Math.max(0, d.valorTotal - d.valorRecebido)
  }, 0)

  const cartaoMap = Object.fromEntries(cartoes.map((c) => [c.id, c.nome]))
  const cartaoInfoMap = Object.fromEntries(
    cartoes.map((c) => [c.id, { diaFechamento: c.diaFechamento, diaVencimento: c.diaVencimento }])
  )

  const gruposMap = new Map<string, DividaTerceiroComSaldo[]>()
  for (const d of abertas) {
    const chave = d.grupo ?? ''
    const lista = gruposMap.get(chave) ?? []
    lista.push(d)
    gruposMap.set(chave, lista)
  }

  const grupos = [
    ...Array.from(gruposMap.entries()).filter(([k]) => k !== '').sort(([a], [b]) => a.localeCompare(b)),
    ...(gruposMap.has('') ? [['', gruposMap.get('')!] as [string, DividaTerceiroComSaldo[]]] : []),
  ]

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Me devem</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {abertas.length > 0
              ? `${abertas.length} pendências · ${formatCurrency(totalAReceber)} a receber`
              : 'Ninguém te deve nada. Por enquanto.'}
          </p>
        </div>
        <Button
          onClick={() => setCriando(true)}
          size="sm"
          className="h-8 gap-1.5 rounded-lg text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Nova cobrança
        </Button>
      </div>

      {/* Inline metrics */}
      {abertas.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            Recebido <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRecebido)}</span>
          </span>
          {saldoMensalAReceber > 0 && (
            <span>Este mês <span className="font-medium text-foreground">{formatCurrency(saldoMensalAReceber)}</span></span>
          )}
          {cobrancasAtrasadas > 0 && (
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {cobrancasAtrasadas} atrasada{cobrancasAtrasadas !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={criando} onOpenChange={setCriando}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar cobrança</DialogTitle>
          </DialogHeader>
          <FormDividaTerceiro cartoes={cartoes} onSuccess={() => setCriando(false)} />
        </DialogContent>
      </Dialog>

      {/* Empty state */}
      {dividas.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Ninguém te deve nada. Por enquanto.</p>
        </div>
      )}

      {/* Grouped open debts */}
      {grupos.map(([grupo, itens]) => {
        const chaveGrupo = grupo || '__sem_grupo'
        const totalGrupo = itens.reduce((sum, d) => sum + Math.max(0, d.valorTotal - d.valorRecebido), 0)
        const nomeGrupo = grupo || 'Sem grupo'
        const todosRecebidos = itens.every((d) => d.status === 'RECEBIDA')
        if (todosRecebidos) return null

        const fechado = gruposFechados.has(chaveGrupo)
        const vencidasNoGrupo = itens.filter((d) => d.vencimento && parseLocalDate(d.vencimento) < hoje).length

        return (
          <section key={chaveGrupo} className="overflow-hidden rounded-[22px] border border-border/70">
            {/* ─── Group header (accordion toggle) ─── */}
            <button
              type="button"
              onClick={() => toggleGrupo(chaveGrupo)}
              className="flex w-full items-center justify-between gap-3 bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="text-sm font-semibold text-foreground">{nomeGrupo}</span>
                <span className="rounded-full border border-border/70 bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                  {itens.length}
                </span>
                {vencidasNoGrupo > 0 && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    {vencidasNoGrupo} atrasada{vencidasNoGrupo !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalGrupo)}
                </span>
                <span className="text-muted-foreground/50">
                  {fechado ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </span>
              </div>
            </button>

            {/* ─── Items (collapsible) ─── */}
            {!fechado && (
              <div className="divide-y divide-border/50">
                {itens.map((d) => {
                  const saldo = Math.max(0, d.valorTotal - d.valorRecebido)
                  const percentual = d.valorTotal > 0 ? Math.min((d.valorRecebido / d.valorTotal) * 100, 100) : 0

                  const vencimentoEfetivo = (() => {
                    if (!d.vencimento) return null
                    const dataVenc = parseLocalDate(d.vencimento)
                    const info = d.cartaoId ? cartaoInfoMap[d.cartaoId] : null
                    if (!info) return dataVenc
                    const mesFatura = dataVenc.getDate() <= info.diaFechamento
                      ? startOfMonth(dataVenc)
                      : startOfMonth(addMonths(dataVenc, 1))
                    return new Date(mesFatura.getFullYear(), mesFatura.getMonth(), info.diaVencimento)
                  })()

                  const vencida = vencimentoEfetivo && vencimentoEfetivo < hoje
                  const aberta = abertasCards.has(d.id)

                  return (
                    <article key={d.id} className={cn('bg-background', aberta && 'bg-muted/[0.06]')}>
                      {/* Row */}
                      <button
                        onClick={() => toggleCard(d.id)}
                        className="group flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/30"
                      >
                        {/* Status dot */}
                        <span className={cn(
                          'mt-[7px] h-2 w-2 shrink-0 rounded-full',
                          vencida
                            ? 'bg-amber-500'
                            : d.status === 'PARCIAL'
                            ? 'bg-blue-500'
                            : percentual >= 80
                            ? 'bg-emerald-500'
                            : 'bg-muted-foreground/30',
                        )} />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="truncate text-sm font-semibold text-foreground">
                                {d.nomeDevedor}
                              </span>
                              {d.status === 'PARCIAL' && (
                                <span className="shrink-0 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                                  Parcial
                                </span>
                              )}
                              {vencida && (
                                <span className="shrink-0 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                  Atrasada
                                </span>
                              )}
                              {d.formaPagamento && (
                                <span className="hidden shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
                                  {FORMA_LABELS[d.formaPagamento] ?? d.formaPagamento}
                                </span>
                              )}
                            </div>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(saldo)}
                            </span>
                          </div>

                          {d.descricao && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">{d.descricao}</p>
                          )}

                          {/* Progress */}
                          <div className="mt-2.5 flex items-center gap-3">
                            <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-border/70">
                              <div
                                className="h-full rounded-full bg-emerald-500/60 transition-all duration-500"
                                style={{ width: `${percentual}%` }}
                              />
                            </div>
                            <span className="text-[10px] tabular-nums text-muted-foreground/60">
                              {percentual.toFixed(0)}%
                            </span>
                            {vencimentoEfetivo && (
                              <span className="text-[10px] text-muted-foreground/60">
                                {format(vencimentoEfetivo, 'dd MMM', { locale: ptBR })}
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
                              <StatBlock label="Recebido" value={formatCurrency(d.valorRecebido)} accent="positive" />
                              <StatBlock label="Total" value={formatCurrency(d.valorTotal)} />
                              <StatBlock label="Restante" value={formatCurrency(saldo)} />
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span className="font-medium uppercase tracking-[0.14em]">Recebimento</span>
                                <span className="tabular-nums">{percentual.toFixed(0)}% recebido</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-border/70">
                                <div
                                  className="h-full rounded-full bg-emerald-500/70 transition-all duration-500"
                                  style={{ width: `${percentual}%` }}
                                />
                              </div>
                            </div>

                            {/* Meta pills */}
                            {(vencimentoEfetivo || d.cartaoId) && (
                              <div className="flex flex-wrap gap-2">
                                {vencimentoEfetivo && (
                                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/20 px-2.5 py-1 text-xs text-muted-foreground">
                                    <Clock3 className="h-3 w-3 shrink-0" />
                                    {d.cartaoId
                                      ? `Fatura ${format(vencimentoEfetivo, "MMM yyyy", { locale: ptBR })} · dia ${vencimentoEfetivo.getDate()}`
                                      : `Prazo ${format(vencimentoEfetivo, "dd 'de' MMM", { locale: ptBR })}`}
                                  </span>
                                )}
                                {d.cartaoId && cartaoMap[d.cartaoId] && (
                                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/20 px-2.5 py-1 text-xs text-muted-foreground">
                                    <CreditCard className="h-3 w-3 shrink-0" />
                                    {cartaoMap[d.cartaoId]}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="overflow-hidden rounded-xl border border-border/70 divide-y divide-border/50">
                              <ActionCmd
                                icon={HandCoins}
                                label="Registrar recebimento"
                                onClick={() => setRecebendo(d)}
                                disabled={saldo <= 0 || isPending}
                                primary
                              />
                              <ActionCmd
                                icon={CheckCheck}
                                label="Marcar como recebida"
                                tone="positive"
                                onClick={() => startTransition(() => quitarDividaTerceiro(d.id))}
                                disabled={isPending}
                              />
                              <ActionCmd
                                icon={Pencil}
                                label="Editar cobrança"
                                onClick={() => setEditando(d)}
                              />
                              <ActionCmd
                                icon={Trash2}
                                label="Excluir cobrança"
                                tone="negative"
                                onClick={() => setDeletando(d)}
                              />
                            </div>
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
                            <DialogTitle>Editar cobrança</DialogTitle>
                          </DialogHeader>
                          <FormDividaTerceiro divida={d} cartoes={cartoes} onSuccess={() => setEditando(null)} />
                        </DialogContent>
                      </Dialog>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}

      {/* Received */}
      {recebidas.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.17em] text-muted-foreground">
            Recebidas · {recebidas.length}
          </p>
          <div className="overflow-hidden rounded-[20px] border border-border/50 divide-y divide-border/40">
            {recebidas.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/20">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/40" />
                <span className="flex-1 truncate text-sm text-muted-foreground/50 line-through">{d.nomeDevedor}</span>
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
                  onClick={() => startTransition(() => reabrirDividaTerceiro(d.id))}
                  className="rounded-md p-1 text-muted-foreground/40 transition-colors hover:bg-muted hover:text-muted-foreground disabled:opacity-30"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Receipt dialog */}
      <Dialog open={!!recebendo} onOpenChange={(open) => { if (!open) setRecebendo(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar recebimento</DialogTitle>
          </DialogHeader>
          {recebendo && (
            <FormRecebimento
              dividaId={recebendo.id}
              nomeDevedor={recebendo.nomeDevedor}
              saldoRestante={Math.max(0, recebendo.valorTotal - recebendo.valorRecebido)}
              onSuccess={() => setRecebendo(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={!!deletando} onOpenChange={(open) => { if (!open) setDeletando(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar cobrança?</AlertDialogTitle>
            <AlertDialogDescription>
              A dívida de <strong>{deletando?.nomeDevedor}</strong> e todos os recebimentos vinculados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletando) {
                  startTransition(() => deletarDividaTerceiro(deletando.id))
                  setDeletando(null)
                }
              }}
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
    <div className="px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={cn(
        'mt-1 text-sm font-semibold tabular-nums',
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
