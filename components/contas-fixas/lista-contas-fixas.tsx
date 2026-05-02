'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle, CheckCircle2, Pencil, Plus, Trash2, ToggleLeft, ToggleRight, Tag, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
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
import {
  SelectWithLabel, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { SeletorMes } from '@/components/dashboard/seletor-mes'
import { FormContaFixa } from './form-conta-fixa'
import { toggleContaFixa, deletarContaFixa, marcarComoPaga } from '@/app/(app)/contas-fixas/actions'
import { formatCurrency, getMesAno } from '@/lib/utils'
import type { ContaFixa, Categoria } from '@/app/generated/prisma/client'

interface ContaFixaComStatus extends ContaFixa {
  categoria: Categoria | null
  pagaNoMes: boolean
  valorPago: number | null
}

interface ListaContasFixasProps {
  contasFixas: ContaFixaComStatus[]
  categorias:  Categoria[]
  mesAno:      string
}

const FORMAS_PAGAMENTO = [
  { value: 'PIX',           label: 'PIX' },
  { value: 'DEBITO',        label: 'Débito' },
  { value: 'DINHEIRO',      label: 'Dinheiro' },
  { value: 'BOLETO',        label: 'Boleto' },
  { value: 'TRANSFERENCIA', label: 'Transferência' },
]

function StatusBadge({ conta, mesAno }: { conta: ContaFixaComStatus; mesAno: string }) {
  const isEntrada  = conta.tipo === 'ENTRADA'
  const mesAtual   = getMesAno()
  const isMesAtual = mesAno === mesAtual
  const isPast     = mesAno < mesAtual

  if (conta.pagaNoMes) {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs gap-1">
        <CheckCircle2 className="h-3 w-3" />
        {isEntrada ? 'Recebida' : 'Paga'}
      </Badge>
    )
  }

  // Mês passado e não pago
  if (isPast) {
    return (
      <Badge variant="outline" className={`text-xs ${isEntrada ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
        {isEntrada ? 'Não recebida' : 'Não paga'}
      </Badge>
    )
  }

  // Mês futuro
  if (!isMesAtual) {
    return (
      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
        Dia {conta.diaVencimento}
      </Badge>
    )
  }

  // Mês atual — mostra proximidade
  const hoje = new Date().getDate()
  const diff  = conta.diaVencimento - hoje

  if (diff < 0) {
    return <Badge variant="outline" className={`text-xs ${isEntrada ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
      {isEntrada ? 'Não recebida' : 'Vencida'}
    </Badge>
  }
  if (diff <= 5) {
    return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
      {isEntrada ? `Entra em ${diff}d` : `Vence em ${diff}d`}
    </Badge>
  }
  return <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
    Dia {conta.diaVencimento}
  </Badge>
}

function SecaoContas({
  titulo, contas, icone, mesAno, onPagar, onEditar, onDeletar, onToggle, isPending,
}: {
  titulo:    string
  contas:    ContaFixaComStatus[]
  icone:     React.ReactNode
  mesAno:    string
  onPagar:   (c: ContaFixaComStatus) => void
  onEditar:  (c: ContaFixaComStatus) => void
  onDeletar: (c: ContaFixaComStatus) => void
  onToggle:  (id: string, ativo: boolean) => void
  isPending: boolean
  editando:  ContaFixaComStatus | null
  categorias: Categoria[]
}) {
  if (contas.length === 0) return null
  const isEntrada  = contas[0]?.tipo === 'ENTRADA'
  const isMesAtual = mesAno === getMesAno()

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icone}
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{titulo}</p>
      </div>
      {contas.map((c) => (
        <div
          key={c.id}
          className={`flex items-center gap-4 rounded-lg border bg-card p-4 transition-opacity ${c.pagaNoMes ? 'opacity-60' : ''}`}
        >
          {/* Dia */}
          <div className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md text-center ${
            c.pagaNoMes ? 'bg-green-100' : isEntrada ? 'bg-emerald-50' : 'bg-muted'
          }`}>
            {c.pagaNoMes
              ? <CheckCircle2 className="h-6 w-6 text-green-600" />
              : <>
                  <span className="text-xs text-muted-foreground leading-none">dia</span>
                  <span className="text-lg font-bold leading-tight">{c.diaVencimento}</span>
                </>
            }
          </div>

          {/* Descrição */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`truncate font-medium ${c.pagaNoMes ? 'line-through text-muted-foreground' : ''}`}>
                {c.descricao}
              </span>
              {c.recorrente && (
                <span className="text-xs text-muted-foreground hidden sm:inline">(recorrente)</span>
              )}
            </div>
            {c.categoria && (
              <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />{c.categoria.nome}
              </span>
            )}
          </div>

          {/* Valor + status */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {c.pagaNoMes && c.valorPago !== null && c.valorPago !== c.valor ? (
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground line-through">{formatCurrency(c.valor)}</span>
                <span className={`font-semibold ${isEntrada ? 'text-green-600' : ''}`}>{formatCurrency(c.valorPago)}</span>
              </div>
            ) : (
              <span className={`font-semibold ${isEntrada && !c.pagaNoMes ? 'text-green-600' : ''}`}>
                {formatCurrency(c.valor)}
              </span>
            )}
            <StatusBadge conta={c} mesAno={mesAno} />
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1 shrink-0">
            {isMesAtual && (
              <Button
                variant={c.pagaNoMes ? 'ghost' : 'outline'}
                size="sm"
                className={`h-8 gap-1.5 text-xs ${c.pagaNoMes ? 'text-green-600 hover:text-green-600' : ''}`}
                disabled={c.pagaNoMes || isPending}
                onClick={() => onPagar(c)}
                title={c.pagaNoMes ? (isEntrada ? 'Já recebida este mês' : 'Já paga este mês') : (isEntrada ? 'Marcar como recebida' : 'Marcar como paga')}
              >
                <Wallet className="h-3.5 w-3.5" />
                {c.pagaNoMes ? (isEntrada ? 'Recebida' : 'Paga') : (isEntrada ? 'Receber' : 'Pagar')}
              </Button>
            )}

            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}
              onClick={() => onToggle(c.id, false)} title="Desativar">
              <ToggleRight className="h-4 w-4 text-primary" />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditar(c)} title="Editar">
              <Pencil className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDeletar(c)} title="Deletar">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ListaContasFixas({ contasFixas, categorias, mesAno }: ListaContasFixasProps) {
  const [criando, setCriando]     = useState(false)
  const [editando, setEditando]   = useState<ContaFixaComStatus | null>(null)
  const [deletando, setDeletando] = useState<ContaFixaComStatus | null>(null)
  const [pagando, setPagando]     = useState<ContaFixaComStatus | null>(null)
  const [forma, setForma]         = useState('PIX')
  const [valorReal, setValorReal] = useState('')
  const [isPending, startTransition] = useTransition()

  const ativas   = contasFixas.filter((c) => c.ativo)
  const inativas = contasFixas.filter((c) => !c.ativo)

  const receitas = ativas.filter((c) => c.tipo === 'ENTRADA')
  const despesas = ativas.filter((c) => c.tipo === 'SAIDA')

  const totalReceitas  = receitas.reduce((s, c) => s + c.valor, 0)
  const totalDespesas  = despesas.reduce((s, c) => s + c.valor, 0)
  const receitasRecebidas = receitas.filter((c) => c.pagaNoMes).length
  const despesasPagas     = despesas.filter((c) => c.pagaNoMes).length

  // Agrupamento por categoria (despesas ativas)
  const porCategoria = despesas.reduce<Record<string, { nome: string; cor: string | null; total: number; pagas: number }>>((acc, c) => {
    const key  = c.categoriaId ?? '__sem_categoria__'
    const nome = c.categoria?.nome ?? 'Sem categoria'
    const cor  = c.categoria?.cor ?? null
    if (!acc[key]) acc[key] = { nome, cor, total: 0, pagas: 0 }
    acc[key].total += c.valor
    if (c.pagaNoMes) acc[key].pagas += c.valor
    return acc
  }, {})
  const categoriasDespesas = Object.values(porCategoria).sort((a, b) => b.total - a.total)

  const isEntradaPagando = pagando?.tipo === 'ENTRADA'

  const totalMensal   = totalDespesas
  const totalPago     = despesas.filter((c) => c.pagaNoMes).reduce((s, c) => s + (c.valorPago ?? c.valor), 0)
  const totalPendente = despesas.filter((c) => !c.pagaNoMes).reduce((s, c) => s + c.valor, 0)
  const pendentes     = despesas.filter((c) => !c.pagaNoMes)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em]">Contas Fixas</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {ativas.length} conta{ativas.length !== 1 ? 's' : ''} ativa{ativas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SeletorMes mesAno={mesAno} basePath="/contas-fixas" />
          <Button onClick={() => setCriando(true)}>
            <Plus className="h-4 w-4" />
            Nova conta fixa
          </Button>
        </div>
      </div>

      {/* Chips de resumo */}
      {ativas.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card px-[18px] py-[14px]">
            <p className="text-[11px] text-muted-foreground mb-1">Total mensal</p>
            <p className="text-lg font-bold tabular-nums">{formatCurrency(totalMensal)}</p>
          </div>
          <div className="rounded-xl border bg-card px-[18px] py-[14px]">
            <p className="text-[11px] text-muted-foreground mb-1">Já pago</p>
            <p className="text-lg font-bold tabular-nums text-emerald-600">{formatCurrency(totalPago)}</p>
          </div>
          <div className="rounded-xl border bg-card px-[18px] py-[14px]">
            <p className="text-[11px] text-muted-foreground mb-1">Pendente</p>
            <p className="text-lg font-bold tabular-nums text-amber-500">{formatCurrency(totalPendente)}</p>
          </div>
        </div>
      )}

      {/* Alerta de pendentes */}
      {pendentes.length > 0 && (
        <div className="flex items-center gap-3 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">
            {pendentes.length} conta{pendentes.length > 1 ? 's' : ''} pendente{pendentes.length > 1 ? 's' : ''} — vence{pendentes.length > 1 ? 'm' : ''} em breve
          </span>
        </div>
      )}

      {/* Dialog criar */}
      <Dialog open={criando} onOpenChange={setCriando}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nova conta fixa</DialogTitle></DialogHeader>
          <FormContaFixa categorias={categorias} onSuccess={() => setCriando(false)} />
        </DialogContent>
      </Dialog>

      {contasFixas.length === 0 && (
        <p className="rounded-lg border py-16 text-center text-muted-foreground">
          Nenhuma conta fixa cadastrada ainda.
        </p>
      )}

      {/* Resumo por categoria */}
      {categoriasDespesas.length > 0 && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <p className="text-sm font-semibold">Despesas fixas por categoria</p>
          <div className="space-y-2">
            {categoriasDespesas.map((cat) => {
              const pct     = totalDespesas > 0 ? (cat.total / totalDespesas) * 100 : 0
              const pctPago = cat.total > 0 ? (cat.pagas / cat.total) * 100 : 0
              const cor     = cat.cor ?? '#6b7280'
              return (
                <div key={cat.nome} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cor }}
                      />
                      <span className="font-medium">{cat.nome}</span>
                      {cat.pagas > 0 && cat.pagas < cat.total && (
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(cat.pagas)} pago
                        </span>
                      )}
                      {cat.pagas >= cat.total && cat.total > 0 && (
                        <span className="text-xs text-green-600">pago</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                      <span className="font-semibold tabular-nums">{formatCurrency(cat.total)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pctPago}%`, backgroundColor: cor }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t">
            <span>{categoriasDespesas.length} categoria{categoriasDespesas.length !== 1 ? 's' : ''}</span>
            <span className="font-semibold text-foreground">{formatCurrency(totalDespesas)} total</span>
          </div>
        </div>
      )}

      {/* Receitas fixas */}
      <SecaoContas
        titulo={`Receitas fixas — ${receitasRecebidas}/${receitas.length} recebidas`}
        contas={receitas}
        icone={<TrendingUp className="h-4 w-4 text-green-600" />}
        mesAno={mesAno}
        onPagar={(c) => { setForma('PIX'); setValorReal(''); setPagando(c) }}
        onEditar={setEditando}
        onDeletar={setDeletando}
        onToggle={(id) => startTransition(() => toggleContaFixa(id, false))}
        isPending={isPending}
        editando={editando}
        categorias={categorias}
      />

      {/* Despesas fixas */}
      <SecaoContas
        titulo={`Despesas fixas — ${despesasPagas}/${despesas.length} pagas`}
        contas={despesas}
        icone={<TrendingDown className="h-4 w-4 text-red-500" />}
        mesAno={mesAno}
        onPagar={(c) => { setForma('PIX'); setValorReal(''); setPagando(c) }}
        onEditar={setEditando}
        onDeletar={setDeletando}
        onToggle={(id) => startTransition(() => toggleContaFixa(id, false))}
        isPending={isPending}
        editando={editando}
        categorias={categorias}
      />

      {/* Inativas */}
      {inativas.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Inativas ({inativas.length})
          </p>
          {inativas.map((c) => (
            <div key={c.id} className="flex items-center gap-4 rounded-lg border bg-muted/40 p-4 opacity-60">
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md bg-muted text-center">
                <span className="text-xs text-muted-foreground leading-none">dia</span>
                <span className="text-lg font-bold leading-tight">{c.diaVencimento}</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="truncate font-medium line-through">{c.descricao}</span>
                <span className="ml-2 text-xs text-muted-foreground">{c.tipo === 'ENTRADA' ? 'receita' : 'despesa'}</span>
              </div>
              <span className="font-semibold text-muted-foreground">{formatCurrency(c.valor)}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}
                title="Reativar" onClick={() => startTransition(() => toggleContaFixa(c.id, true))}>
                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Dialog editar — fora da SecaoContas para evitar nesting de Dialog */}
      <Dialog open={!!editando} onOpenChange={(open) => { if (!open) setEditando(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Editar conta fixa</DialogTitle></DialogHeader>
          {editando && (
            <FormContaFixa contaFixa={editando} categorias={categorias} onSuccess={() => setEditando(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pagamento / recebimento */}
      <Dialog open={!!pagando} onOpenChange={(open) => { if (!open) setPagando(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{isEntradaPagando ? 'Marcar como recebida' : 'Marcar como paga'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
              <p className="font-medium">{pagando?.descricao}</p>
              <p className="text-muted-foreground">{pagando ? formatCurrency(pagando.valor) : ''}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">
                Valor deste mês{' '}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </p>
              <Input
                type="number" step="0.01" min="0"
                placeholder={pagando ? String(pagando.valor) : ''}
                value={valorReal}
                onChange={(e) => setValorReal(e.target.value)}
              />
              {valorReal && pagando && Number(valorReal) !== pagando.valor && (
                <p className="text-xs text-muted-foreground">
                  Valor padrão: {formatCurrency(pagando.valor)} · Este mês: {formatCurrency(Number(valorReal))}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">{isEntradaPagando ? 'Forma de recebimento' : 'Forma de pagamento'}</p>
              <SelectWithLabel
                items={FORMAS_PAGAMENTO}
                value={forma}
                onValueChange={(v) => setForma(v ?? 'PIX')}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FORMAS_PAGAMENTO.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </SelectWithLabel>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setPagando(null)}>
                Cancelar
              </Button>
              <Button
                className="flex-1" disabled={isPending}
                onClick={() => {
                  if (pagando) {
                    startTransition(async () => {
                      await marcarComoPaga(pagando.id, forma, valorReal ? Number(valorReal) : undefined)
                      setPagando(null)
                    })
                  }
                }}
              >
                {isPending ? 'Salvando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AlertDialog deletar */}
      <AlertDialog open={!!deletando} onOpenChange={(open) => { if (!open) setDeletando(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar conta fixa?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletando?.descricao}</strong> será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletando) {
                  startTransition(() => deletarContaFixa(deletando.id))
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
