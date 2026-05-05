'use client'

import { useState, useTransition } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Pencil, Trash2, ShieldCheck, Receipt, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { CurrencyInput } from '@/components/ui/currency-input'
import { FormOrcamento } from './form-orcamento'
import { FormGasto } from './form-gasto'
import { deletarOrcamento, salvarLimiteGlobal } from '@/app/(app)/orcamentos/actions'
import { formatCurrency } from '@/lib/utils'
import type { Categoria, Cartao, Orcamento } from '@/app/generated/prisma/client'

export interface TransacaoOrcamento {
  id:             string
  descricao:      string
  valor:          number
  data:           Date
  status:         string
  formaPagamento: string | null
  numeroParcela:  number | null
  totalParcelas:  number | null
  cartaoId:       string | null
  cartao:         { nome: string } | null
  categoriaId:    string | null
}

export interface CardGasto {
  categoriaId:  string
  categoria:    Categoria
  gasto:        number
  limite:       number | null
  orcamentoId:  string | null
  mesAno:       string
  transacoes:   TransacaoOrcamento[]
}

interface LimiteGlobalData extends Orcamento {
  gasto: number
}

interface Props {
  mesAno:       string
  cards:        CardGasto[]
  limiteGlobal: LimiteGlobalData | null
  totalGasto:   number
  categorias:   Categoria[]
  cartoes:      Cartao[]
}

function BarraProgresso({ pct }: { pct: number }) {
  const clamped = Math.min(pct, 100)
  const cor =
    pct >= 100 ? 'bg-red-500' :
    pct >= 80  ? 'bg-amber-400' :
    pct >= 60  ? 'bg-yellow-300' :
                 'bg-emerald-500'
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${cor}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

function LimiteGlobalCard({ limiteGlobal, totalGasto, mesAno }: {
  limiteGlobal: LimiteGlobalData | null
  totalGasto:   number
  mesAno:       string
}) {
  const [editando, setEditando]      = useState(false)
  const [valor, setValor]            = useState<number | undefined>(limiteGlobal?.valorLimite)
  const [isPending, startTransition] = useTransition()

  const limite  = limiteGlobal?.valorLimite ?? 0
  const pct     = limite > 0 ? (totalGasto / limite) * 100 : 0
  const excedeu = totalGasto > limite && limite > 0

  function salvar() {
    if (!valor) return
    startTransition(async () => {
      await salvarLimiteGlobal({ valorLimite: valor, mesAno })
      setEditando(false)
    })
  }

  async function remover() {
    if (!limiteGlobal) return
    startTransition(async () => { await deletarOrcamento(limiteGlobal.id) })
  }

  if (!limiteGlobal && !editando) {
    return (
      <button
        onClick={() => setEditando(true)}
        className="w-full rounded-xl border border-dashed border-indigo-300/60 bg-indigo-50/40 p-4 text-left hover:bg-indigo-50/70 transition-colors"
      >
        <div className="flex items-center gap-2 text-indigo-600">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-sm font-medium">Definir teto mensal geral</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Limite total do mês independente de categoria.
        </p>
      </button>
    )
  }

  if (editando) {
    return (
      <div className="rounded-xl border border-indigo-300/50 bg-indigo-50/40 p-4 space-y-3">
        <div className="flex items-center gap-2 text-indigo-600">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-sm font-medium">Teto mensal geral</span>
        </div>
        <div className="flex gap-2">
          <CurrencyInput value={valor} onChange={setValor} placeholder="Ex: 5.000,00" className="flex-1" />
          <Button size="sm" onClick={salvar} disabled={isPending || !valor}>
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditando(false)}>Cancelar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-indigo-300/50 bg-indigo-50/40 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-indigo-600">
          <ShieldCheck className="h-4 w-4" />
          <div>
            <p className="text-sm font-medium">Teto mensal geral</p>
            <p className="text-xs text-muted-foreground">Limite: {formatCurrency(limite)}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => { setValor(limite); setEditando(true) }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={remover} disabled={isPending}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <BarraProgresso pct={pct} />
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Gasto: <span className="font-medium text-foreground">{formatCurrency(totalGasto)}</span>
        </span>
        {excedeu ? (
          <span className="font-semibold text-red-500">Excedeu {formatCurrency(totalGasto - limite)}</span>
        ) : (
          <span className="text-muted-foreground">
            Restante: <span className="font-medium text-foreground">{formatCurrency(limite - totalGasto)}</span>
          </span>
        )}
        <span className={`font-semibold ${pct >= 100 ? 'text-red-500' : pct >= 80 ? 'text-amber-500' : 'text-emerald-600'}`}>
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  )
}

export function ListaOrcamentos({ mesAno, cards, limiteGlobal, totalGasto, categorias, cartoes }: Props) {
  const [dialog, setDialog] = useState<
    'registrar-gasto' | 'novo-limite' | { card: CardGasto } | null
  >(null)
  const [detalhes, setDetalhes] = useState<CardGasto | null>(null)
  const [deletando, setDeletando] = useState<string | null>(null)

  const mesLabel  = format(parseISO(`${mesAno}-01`), "MMMM 'de' yyyy", { locale: ptBR })
  const usadas    = cards.filter((c) => c.orcamentoId).map((c) => c.categoriaId)

  async function handleDeleteLimite(orcamentoId: string) {
    setDeletando(orcamentoId)
    await deletarOrcamento(orcamentoId)
    setDeletando(null)
  }

  const cardEmEdicao = dialog !== null && dialog !== 'registrar-gasto' && dialog !== 'novo-limite'
    ? dialog.card
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em]">Orçamentos</h1>
          <p className="text-xs text-muted-foreground capitalize">{mesLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setDialog('novo-limite')}>
            <Plus className="h-4 w-4 mr-1" /> Limite por categoria
          </Button>
          <Button size="sm" onClick={() => setDialog('registrar-gasto')}>
            <Receipt className="h-4 w-4 mr-1" /> Registrar gasto
          </Button>
        </div>
      </div>

      {/* Teto geral */}
      <LimiteGlobalCard limiteGlobal={limiteGlobal} totalGasto={totalGasto} mesAno={mesAno} />

      {/* Cards por categoria */}
      {cards.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          <p className="font-medium">Nenhum gasto registrado neste mês</p>
          <p className="text-sm mt-1">Clique em "Registrar gasto" para começar a controlar.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => {
            const temLimite = card.limite !== null
            const pct       = temLimite ? (card.gasto / card.limite!) * 100 : 0
            const excedeu   = temLimite && card.gasto > card.limite!

            return (
              <div key={card.categoriaId} className="rounded-xl border bg-card p-4 space-y-3">
                {/* Cabeçalho */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {card.categoria.icone && (
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg shrink-0"
                        style={{ backgroundColor: card.categoria.cor ?? '#e5e7eb' }}
                      >
                        {card.categoria.icone}
                      </span>
                    )}
                    <div>
                      <p className="font-medium text-sm">{card.categoria.nome}</p>
                      {temLimite
                        ? <p className="text-xs text-muted-foreground">Limite: {formatCurrency(card.limite!)}</p>
                        : <p className="text-xs text-muted-foreground">Sem limite definido</p>
                      }
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      title={temLimite ? 'Editar limite' : 'Definir limite'}
                      onClick={() => setDialog({ card })}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {card.orcamentoId && (
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteLimite(card.orcamentoId!)}
                        disabled={deletando === card.orcamentoId}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Barra — só aparece se tiver limite */}
                {temLimite && <BarraProgresso pct={pct} />}

                {/* Valores */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Gasto: <span className="font-semibold text-foreground">{formatCurrency(card.gasto)}</span>
                  </span>
                  {temLimite && (
                    excedeu ? (
                      <span className="font-semibold text-red-500">
                        Excedeu {formatCurrency(card.gasto - card.limite!)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Restante: <span className="font-medium text-foreground">{formatCurrency(card.limite! - card.gasto)}</span>
                      </span>
                    )
                  )}
                  {temLimite && (
                    <span className={`font-semibold ${pct >= 100 ? 'text-red-500' : pct >= 80 ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {Math.round(pct)}%
                    </span>
                  )}
                </div>

                {/* Ver detalhes */}
                {card.transacoes.length > 0 && (
                  <button
                    onClick={() => setDetalhes(card)}
                    className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <span>{card.transacoes.length} lançamento{card.transacoes.length !== 1 ? 's' : ''}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Dialog: registrar gasto */}
      <Dialog open={dialog === 'registrar-gasto'} onOpenChange={(open) => { if (!open) setDialog(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar gasto</DialogTitle></DialogHeader>
          <FormGasto categorias={categorias} cartoes={cartoes} onSuccess={() => setDialog(null)} />
        </DialogContent>
      </Dialog>

      {/* Dialog: definir / editar limite por categoria */}
      <Dialog
        open={dialog === 'novo-limite' || cardEmEdicao !== null}
        onOpenChange={(open) => { if (!open) setDialog(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {cardEmEdicao?.orcamentoId ? 'Editar limite' : 'Definir limite por categoria'}
            </DialogTitle>
          </DialogHeader>
          <FormOrcamento
            mesAno={mesAno}
            categorias={categorias}
            orcamento={cardEmEdicao?.orcamentoId
              ? { id: cardEmEdicao.orcamentoId, categoriaId: cardEmEdicao.categoriaId, valorLimite: cardEmEdicao.limite!, mesAno, userId: '', createdAt: new Date() }
              : undefined
            }
            usadas={usadas}
            onSuccess={() => setDialog(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog: detalhes da categoria */}
      <Dialog open={!!detalhes} onOpenChange={(open) => { if (!open) setDetalhes(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detalhes?.categoria.icone && (
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md text-base shrink-0"
                  style={{ backgroundColor: detalhes.categoria.cor ?? '#e5e7eb' }}
                >
                  {detalhes.categoria.icone}
                </span>
              )}
              {detalhes?.categoria.nome}
            </DialogTitle>
          </DialogHeader>

          {detalhes && (
            <div className="space-y-3">
              {/* Resumo */}
              <div className="flex gap-3 rounded-lg bg-muted/50 p-3 text-sm">
                <div className="flex-1 text-center">
                  <p className="text-xs text-muted-foreground">Total gasto</p>
                  <p className="font-semibold">{formatCurrency(detalhes.gasto)}</p>
                </div>
                {detalhes.limite && (
                  <>
                    <div className="w-px bg-border" />
                    <div className="flex-1 text-center">
                      <p className="text-xs text-muted-foreground">Limite</p>
                      <p className="font-semibold">{formatCurrency(detalhes.limite)}</p>
                    </div>
                    <div className="w-px bg-border" />
                    <div className="flex-1 text-center">
                      <p className="text-xs text-muted-foreground">Restante</p>
                      <p className={`font-semibold ${detalhes.gasto > detalhes.limite ? 'text-red-500' : 'text-emerald-600'}`}>
                        {formatCurrency(detalhes.limite - detalhes.gasto)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Lista de transações */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {detalhes.transacoes.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{t.descricao}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(t.data), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        {t.formaPagamento && (
                          <Badge variant="outline" className="text-xs py-0 h-4">
                            {FORMA_LABELS[t.formaPagamento] ?? t.formaPagamento}
                          </Badge>
                        )}
                        {t.cartao && (
                          <Badge variant="secondary" className="text-xs py-0 h-4">
                            {t.cartao.nome}
                          </Badge>
                        )}
                        {t.totalParcelas && (
                          <span className="text-xs text-muted-foreground">
                            {t.numeroParcela}/{t.totalParcelas}x
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold shrink-0 text-red-500">
                      -{formatCurrency(t.valor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

const FORMA_LABELS: Record<string, string> = {
  PIX:           'PIX',
  CREDITO:       'Crédito',
  DEBITO:        'Débito',
  DINHEIRO:      'Dinheiro',
  BOLETO:        'Boleto',
  TRANSFERENCIA: 'Transferência',
}
