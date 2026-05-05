'use client'

import { useState, useTransition } from 'react'
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  SelectWithLabel,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { FormTransacao } from './form-transacao'
import {
  deletarTransacao,
  atualizarStatusTransacao,
} from '@/app/(app)/transacoes/actions'
import { formatCurrency, formatDate } from '@/lib/utils'
import type {
  Transacao,
  Categoria,
  Cartao,
} from '@/app/generated/prisma/client'

type TransacaoComRelacoes = Transacao & {
  categoria: Categoria | null
  cartao: Cartao | null
}

interface ListaTransacoesProps {
  transacoes: TransacaoComRelacoes[]
  categorias: Categoria[]
  cartoes: Cartao[]
}

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'outline'> = {
  PAGO: 'default',
  PENDENTE: 'secondary',
  PARCELADO: 'outline',
}

const STATUS_LABEL: Record<string, string> = {
  PAGO: 'Pago',
  PENDENTE: 'Pendente',
  PARCELADO: 'Parcelado',
}

export function ListaTransacoes({
  transacoes,
  categorias,
  cartoes,
}: ListaTransacoesProps) {
  const ITEMS_POR_PAGINA = 20

  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'ENTRADA' | 'SAIDA'>('TODOS')
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODOS')
  const [pagina, setPagina] = useState(1)
  const [criando, setCriando] = useState(false)
  const [editando, setEditando] = useState<TransacaoComRelacoes | null>(null)
  const [deletando, setDeletando] = useState<TransacaoComRelacoes | null>(null)
  const [isPending, startTransition] = useTransition()

  function resetFiltro<T>(setter: (v: T) => void, value: T) {
    setter(value)
    setPagina(1)
  }

  const filtradas = transacoes.filter((t) => {
    if (filtroTipo !== 'TODOS' && t.tipo !== filtroTipo) return false
    if (filtroStatus !== 'TODOS' && t.status !== filtroStatus) return false
    if (filtroCategoria !== 'TODOS' && t.categoriaId !== filtroCategoria) return false
    if (busca && !t.descricao.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const totalPaginas    = Math.max(1, Math.ceil(filtradas.length / ITEMS_POR_PAGINA))
  const paginaSegura    = Math.min(pagina, totalPaginas)
  const transacoesPagina = filtradas.slice((paginaSegura - 1) * ITEMS_POR_PAGINA, paginaSegura * ITEMS_POR_PAGINA)

  const totalEntradas = filtradas
    .filter((t) => t.tipo === 'ENTRADA' && t.status === 'PAGO')
    .reduce((acc, t) => acc + t.valor, 0)

  const totalSaidas = filtradas
    .filter((t) => t.tipo === 'SAIDA' && t.status === 'PAGO')
    .reduce((acc, t) => acc + t.valor, 0)

  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Transações</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {transacoes.length} lançamentos
          </p>
        </div>

        <Button onClick={() => setCriando(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nova transação
        </Button>
      </div>

      <Dialog open={criando} onOpenChange={setCriando}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova transação</DialogTitle>
          </DialogHeader>
          <FormTransacao
            categorias={categorias}
            cartoes={cartoes}
            onSuccess={() => setCriando(false)}
          />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
          <ArrowUpCircle className="h-5 w-5 shrink-0 text-green-500" />
          <div>
            <p className="text-xs text-muted-foreground">Entradas (pagas)</p>
            <p className="font-semibold text-green-600">
              {formatCurrency(totalEntradas)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
          <ArrowDownCircle className="h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="text-xs text-muted-foreground">Saídas (pagas)</p>
            <p className="font-semibold text-red-600">
              {formatCurrency(totalSaidas)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-40 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-9"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPagina(1) }}
          />
        </div>

        <div className="w-full sm:w-auto">
          <SelectWithLabel
            items={[
              { value: 'TODOS', label: 'Todos os tipos' },
              { value: 'ENTRADA', label: 'Receitas' },
              { value: 'SAIDA', label: 'Despesas' },
            ]}
            value={filtroTipo}
            onValueChange={(v: string | null) => resetFiltro(setFiltroTipo, (v ?? 'TODOS') as typeof filtroTipo)}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os tipos</SelectItem>
              <SelectItem value="ENTRADA">Receitas</SelectItem>
              <SelectItem value="SAIDA">Despesas</SelectItem>
            </SelectContent>
          </SelectWithLabel>
        </div>

        <div className="w-full sm:w-auto">
          <SelectWithLabel
            items={[
              { value: 'TODOS', label: 'Todos os status' },
              { value: 'PAGO', label: 'Pago' },
              { value: 'PENDENTE', label: 'Pendente' },
              { value: 'PARCELADO', label: 'Parcelado' },
            ]}
            value={filtroStatus}
            onValueChange={(v) => resetFiltro(setFiltroStatus, v ?? 'TODOS')}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os status</SelectItem>
              <SelectItem value="PAGO">Pago</SelectItem>
              <SelectItem value="PENDENTE">Pendente</SelectItem>
              <SelectItem value="PARCELADO">Parcelado</SelectItem>
            </SelectContent>
          </SelectWithLabel>
        </div>

        <div className="w-full sm:w-auto">
          <SelectWithLabel
            items={[
              { value: 'TODOS', label: 'Todas as categorias' },
              ...categorias.filter((c) => c.ativo).map((c) => ({
                value: c.id,
                label: `${c.icone ? c.icone + ' ' : ''}${c.nome}`,
              })),
            ]}
            value={filtroCategoria}
            onValueChange={(v) => resetFiltro(setFiltroCategoria, v ?? 'TODOS')}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todas as categorias</SelectItem>
              {categorias
                .filter((c) => c.ativo)
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icone ? `${c.icone} ` : ''}
                    {c.nome}
                  </SelectItem>
                ))}
            </SelectContent>
          </SelectWithLabel>
        </div>
      </div>

      {filtradas.length === 0 ? (
        <p className="rounded-lg border py-12 text-center text-muted-foreground">
          Nenhuma transação encontrada.
        </p>
      ) : (
        <div className="space-y-1">
          {transacoesPagina.map((t) => (
            <div
              key={t.id}
              className="rounded-lg border bg-background px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                {t.tipo === 'ENTRADA' ? (
                  <ArrowUpCircle className="h-5 w-5 shrink-0 text-green-500" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5 shrink-0 text-red-500" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{t.descricao}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDate(t.data)}
                    {t.categoria && ` · ${t.categoria.icone ?? ''} ${t.categoria.nome}`}
                    {t.cartao && ` · ${t.cartao.nome}`}
                    {t.status === 'PARCELADO' &&
                      t.numeroParcela &&
                      t.totalParcelas &&
                      ` · ${t.numeroParcela}/${t.totalParcelas}x`}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                <span
                  className={`shrink-0 whitespace-nowrap font-semibold tabular-nums ${
                    t.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {t.tipo === 'ENTRADA' ? '+' : '-'}
                  {formatCurrency(t.valor)}
                </span>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    const next = t.status === 'PAGO' ? 'PENDENTE' : 'PAGO'
                    startTransition(() => atualizarStatusTransacao(t.id, next))
                  }}
                  className="shrink-0"
                  title="Clique para alternar status"
                >
                  <Badge variant={STATUS_BADGE[t.status]}>
                    {STATUS_LABEL[t.status]}
                  </Badge>
                </button>

                <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditando(t)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setDeletando(t)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                </div>

                <Dialog
                  open={editando?.id === t.id}
                  onOpenChange={(open) => {
                    if (!open) setEditando(null)
                  }}
                >
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Editar transação</DialogTitle>
                    </DialogHeader>
                    <FormTransacao
                      transacao={t}
                      categorias={categorias}
                      cartoes={cartoes}
                      onSuccess={() => setEditando(null)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {(paginaSegura - 1) * ITEMS_POR_PAGINA + 1}–{Math.min(paginaSegura * ITEMS_POR_PAGINA, filtradas.length)} de {filtradas.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="icon"
              className="h-7 w-7"
              disabled={paginaSegura === 1}
              onClick={() => setPagina((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="px-2 text-xs tabular-nums">{paginaSegura}/{totalPaginas}</span>
            <Button
              variant="outline" size="icon"
              className="h-7 w-7"
              disabled={paginaSegura === totalPaginas}
              onClick={() => setPagina((p) => p + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog
        open={!!deletando}
        onOpenChange={(open) => {
          if (!open) setDeletando(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar transação?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletando?.descricao}</strong>{' '}
              ({deletando && formatCurrency(deletando.valor)}) será removida
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletando) {
                  startTransition(() => deletarTransacao(deletando.id))
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