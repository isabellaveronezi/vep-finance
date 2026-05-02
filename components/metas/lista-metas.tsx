'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, CheckCheck, PiggyBank, Target, TrendingUp } from 'lucide-react'
import { format, differenceInMonths, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FormMeta } from './form-meta'
import { FormAporte } from './form-aporte'
import { deletarMeta, concluirMeta, reabrirMeta } from '@/app/(app)/metas/actions'
import { formatCurrency } from '@/lib/utils'
import type { Meta } from '@/app/generated/prisma/client'

interface ListaMetasProps {
  metas: Meta[]
  hoje:  string
}

function calcularPrevisao(valorAtual: number, valorObjetivo: number, aportesMensal: number | null, hoje: Date) {
  if (!aportesMensal || aportesMensal <= 0) return null
  const restante = valorObjetivo - valorAtual
  if (restante <= 0) return null
  const meses = Math.ceil(restante / aportesMensal)
  return addMonths(hoje, meses)
}

export function ListaMetas({ metas, hoje: hojeIso }: ListaMetasProps) {
  const hoje = new Date(hojeIso)
  const [criando, setCriando]   = useState(false)
  const [editando, setEditando] = useState<Meta | null>(null)
  const [aportando, setAportando] = useState<Meta | null>(null)
  const [deletando, setDeletando] = useState<Meta | null>(null)
  const [isPending, startTransition] = useTransition()

  const ativas    = metas.filter((m) => m.ativo)
  const concluidas = metas.filter((m) => !m.ativo)

  const totalObjetivo = ativas.reduce((s, m) => s + m.valorObjetivo, 0)
  const totalGuardado = ativas.reduce((s, m) => s + m.valorAtual, 0)
  const totalFaltando = totalObjetivo - totalGuardado

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Metas</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {ativas.length} meta{ativas.length !== 1 ? 's' : ''} ativa{ativas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setCriando(true)} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Nova meta
        </Button>
      </div>

      {/* Stats */}
      {ativas.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total objetivo</p>
            </div>
            <p className="text-lg font-bold tabular-nums">{formatCurrency(totalObjetivo)}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <PiggyBank className="h-3.5 w-3.5 text-emerald-600" />
              <p className="text-xs text-muted-foreground">Já guardado</p>
            </div>
            <p className="text-lg font-bold tabular-nums text-emerald-600">{formatCurrency(totalGuardado)}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs text-muted-foreground">Falta guardar</p>
            </div>
            <p className="text-lg font-bold tabular-nums">{formatCurrency(totalFaltando)}</p>
          </div>
        </div>
      )}

      {/* Dialog criar */}
      <Dialog open={criando} onOpenChange={setCriando}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nova meta</DialogTitle></DialogHeader>
          <FormMeta onSuccess={() => setCriando(false)} />
        </DialogContent>
      </Dialog>

      {metas.length === 0 && (
        <div className="rounded-xl border py-16 text-center">
          <PiggyBank className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">Nenhuma meta ainda</p>
          <p className="text-sm text-muted-foreground mt-1">Crie sua primeira meta financeira</p>
        </div>
      )}

      {/* Metas ativas */}
      {ativas.length > 0 && (
        <div className="space-y-3">
          {ativas.map((m) => {
            const restante   = Math.max(0, m.valorObjetivo - m.valorAtual)
            const percentual = m.valorObjetivo > 0
              ? Math.min((m.valorAtual / m.valorObjetivo) * 100, 100)
              : 0
            const concluida  = restante === 0
            const previsao   = calcularPrevisao(m.valorAtual, m.valorObjetivo, m.aportesMensal, hoje)
            const prazoVencido = m.prazoEstimado && new Date(m.prazoEstimado) < hoje && !concluida

            return (
              <div key={m.id} className="rounded-xl border bg-card p-4 space-y-3">
                {/* Topo */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    {m.icone ? (
                      <span className="text-2xl leading-none mt-0.5 shrink-0">{m.icone}</span>
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Target className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{m.nome}</span>
                        {concluida && (
                          <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
                            Concluída 🎉
                          </Badge>
                        )}
                        {prazoVencido && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            Prazo vencido
                          </Badge>
                        )}
                      </div>
                      {m.descricao && (
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">{m.descricao}</p>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="outline" size="sm" className="h-8 gap-1.5 text-xs"
                      onClick={() => setAportando(m)}
                      disabled={concluida}
                    >
                      <PiggyBank className="h-3.5 w-3.5" />
                      Aportar
                    </Button>
                    {concluida && (
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8"
                        title="Marcar como concluída"
                        disabled={isPending}
                        onClick={() => startTransition(() => concluirMeta(m.id))}
                      >
                        <CheckCheck className="h-4 w-4 text-emerald-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditando(m)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeletando(m)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Valores */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Guardado: <span className="font-semibold text-foreground">{formatCurrency(m.valorAtual)}</span></span>
                    <span>Objetivo: <span className="font-semibold text-foreground">{formatCurrency(m.valorObjetivo)}</span></span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${concluida ? 'bg-emerald-500' : 'bg-primary'}`}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentual.toFixed(0)}% concluído</span>
                    <span>Falta: <span className="font-semibold text-foreground">{formatCurrency(restante)}</span></span>
                  </div>
                </div>

                {/* Rodapé informativo */}
                {(m.aportesMensal || m.prazoEstimado || previsao) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 border-t pt-2 text-xs text-muted-foreground">
                    {m.aportesMensal && m.aportesMensal > 0 && (
                      <span>
                        Aporte mensal:{' '}
                        <span className="font-medium text-foreground">{formatCurrency(m.aportesMensal)}</span>
                      </span>
                    )}
                    {previsao && !concluida && (
                      <span>
                        Previsão de conclusão:{' '}
                        <span className="font-medium text-foreground">
                          {format(previsao, "MMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </span>
                    )}
                    {m.prazoEstimado && !concluida && (
                      <span className={prazoVencido ? 'text-red-500' : ''}>
                        Prazo:{' '}
                        <span className="font-medium">
                          {format(new Date(m.prazoEstimado), "dd/MM/yyyy")}
                        </span>
                      </span>
                    )}
                  </div>
                )}

                {/* Dialog editar */}
                <Dialog
                  open={editando?.id === m.id}
                  onOpenChange={(open) => { if (!open) setEditando(null) }}
                >
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Editar meta</DialogTitle></DialogHeader>
                    <FormMeta meta={m} onSuccess={() => setEditando(null)} />
                  </DialogContent>
                </Dialog>
              </div>
            )
          })}
        </div>
      )}

      {/* Concluídas */}
      {concluidas.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Concluídas ({concluidas.length})
          </p>
          {concluidas.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4 opacity-60">
              {m.icone && <span className="text-xl shrink-0">{m.icone}</span>}
              <div className="flex-1 min-w-0">
                <p className="font-medium line-through truncate">{m.nome}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(m.valorObjetivo)}</p>
              </div>
              <Button
                variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                title="Reativar"
                disabled={isPending}
                onClick={() => startTransition(() => reabrirMeta(m.id))}
              >
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Dialog aporte */}
      <Dialog open={!!aportando} onOpenChange={(open) => { if (!open) setAportando(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Registrar aporte</DialogTitle></DialogHeader>
          {aportando && (
            <FormAporte
              metaId={aportando.id}
              nome={aportando.nome}
              restante={Math.max(0, aportando.valorObjetivo - aportando.valorAtual)}
              onSuccess={() => setAportando(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* AlertDialog deletar */}
      <AlertDialog open={!!deletando} onOpenChange={(open) => { if (!open) setDeletando(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar meta?</AlertDialogTitle>
            <AlertDialogDescription>
              A meta <strong>{deletando?.nome}</strong> será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletando) {
                  startTransition(() => deletarMeta(deletando.id))
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
