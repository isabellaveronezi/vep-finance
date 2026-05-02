'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { format, addMonths, startOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Plus, Trash2, Pencil, CreditCard, Wallet, RefreshCw, ChevronLeft, ChevronRight, Filter, LayoutGrid } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CardCartao } from './card-cartao'
import { GraficoFaturas } from './grafico-faturas'
import { FormCompraParcelada } from './form-compra-parcelada'
import { FormPagamento } from './form-pagamento'
import { FormEditarLancamento } from './form-editar-lancamento'
import { deletarTransacao, toggleContaOrcamento } from '@/app/(app)/transacoes/actions'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Cartao, Transacao, Categoria } from '@/app/generated/prisma/client'

interface TransacaoComCategoria extends Transacao {
  categoria: Categoria | null
}

interface Props {
  cartao: Cartao
  transacoes: TransacaoComCategoria[]
  categorias: Categoria[]
  cartoes: Cartao[]
}

const STATUS_COLOR: Record<string, string> = {
  PAGO:      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PENDENTE:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PARCELADO: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  AVISTA:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

function getStatusLabel(t: { status: string; totalParcelas: number | null }) {
  if (t.status === 'PARCELADO' && t.totalParcelas === 1) return 'À vista'
  return { PAGO: 'Pago', PENDENTE: 'Pendente', PARCELADO: 'Parcelado' }[t.status] ?? t.status
}

function getStatusColor(t: { status: string; totalParcelas: number | null }) {
  if (t.status === 'PARCELADO' && t.totalParcelas === 1) return STATUS_COLOR.AVISTA
  return STATUS_COLOR[t.status] ?? ''
}

function getMesFatura(data: Date, diaFechamento: number): Date {
  return data.getDate() <= diaFechamento
    ? startOfMonth(data)
    : startOfMonth(addMonths(data, 1))
}

export function DemonstrativoCartao({ cartao, transacoes, categorias, cartoes }: Props) {
  const [adicionando, setAdicionando]         = useState(false)
  const [pagando, setPagando]                 = useState(false)
  const [editando, setEditando]               = useState<TransacaoComCategoria | null>(null)
  const [deletando, setDeletando]             = useState<TransacaoComCategoria | null>(null)
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')
  const [recorrenteFiltro, setRecorrenteFiltro] = useState<'todos' | 'recorrente' | 'nao-recorrente' | 'gasto-mensal'>('todos')
  const [isPending, startTransition]          = useTransition()

  const hoje    = new Date()
  const diaHoje = hoje.getDate()

  const faturaAtual = hoje.getDate() <= cartao.diaFechamento
    ? startOfMonth(hoje)
    : startOfMonth(addMonths(hoje, 1))

  // Coleta todas as faturas únicas a partir das transações
  const faturasSet = new Set<number>()
  transacoes.forEach((t) => {
    const mf = getMesFatura(new Date(t.data), cartao.diaFechamento)
    faturasSet.add(mf.getTime())
  })
  // Garante que a fatura atual sempre aparece
  faturasSet.add(faturaAtual.getTime())

  const faturasOrdenadas = Array.from(faturasSet)
    .sort((a, b) => a - b)
    .map((ts) => new Date(ts))

  const [faturaAtiva, setFaturaAtiva] = useState<Date>(faturaAtual)

  const idxAtivo = faturasOrdenadas.findIndex(
    (f) => f.getTime() === faturaAtiva.getTime()
  )
  const podePrev = idxAtivo > 0
  const podeNext = idxAtivo < faturasOrdenadas.length - 1

  // Transações da fatura ativa
  const transacoesFatura = transacoes.filter((t) => {
    const mf = getMesFatura(new Date(t.data), cartao.diaFechamento)
    return mf.getTime() === faturaAtiva.getTime()
  })

  // Categorias presentes nesta fatura (para popular o filtro)
  const categoriasNaFatura = Array.from(
    new Map(
      transacoesFatura
        .filter((t) => t.categoria)
        .map((t) => [t.categoria!.id, t.categoria!])
    ).values()
  ).sort((a, b) => a.nome.localeCompare(b.nome))

  const transacoesFiltradas = transacoesFatura
    .filter((t) => categoriaFiltro === 'todas' || t.categoriaId === categoriaFiltro)
    .filter((t) => {
      if (recorrenteFiltro === 'recorrente')    return t.recorrente
      if (recorrenteFiltro === 'nao-recorrente') return !t.recorrente
      if (recorrenteFiltro === 'gasto-mensal')  return t.contaOrcamento
      return true
    })

  const totalFiltrado = transacoesFiltradas
    .filter((t) => t.tipo === 'SAIDA')
    .reduce((s, t) => s + t.valor, 0)

  const filtroAtivo = categoriaFiltro !== 'todas' || recorrenteFiltro !== 'todos'

  // Categoria com maior gasto na fatura ativa
  const gastosPorCategoria = transacoesFatura
    .filter((t) => t.tipo === 'SAIDA' && t.categoria)
    .reduce<Record<string, { nome: string; total: number }>>((acc, t) => {
      const id = t.categoriaId!
      acc[id] = { nome: t.categoria!.nome, total: (acc[id]?.total ?? 0) + t.valor }
      return acc
    }, {})
  const categoriaTop = Object.values(gastosPorCategoria).sort((a, b) => b.total - a.total)[0] ?? null

  const totalSaidas = transacoesFatura
    .filter((t) => t.tipo === 'SAIDA')
    .reduce((sum, t) => sum + t.valor, 0)

  const totalPago = transacoesFatura
    .filter((t) => t.tipo === 'ENTRADA')
    .reduce((sum, t) => sum + t.valor, 0)

  const saldo = Math.max(0, totalSaidas - totalPago)

  // Total utilizado no cartão (todas as saídas — para o card visual)
  const utilizado = transacoes
    .filter((t) => t.tipo === 'SAIDA')
    .reduce((sum, t) => sum + t.valor, 0)

  const isFaturaAtual  = faturaAtiva.getTime() === faturaAtual.getTime()
  const faturaProxima  = startOfMonth(addMonths(faturaAtual, 1))
  const isFaturaProxima = faturaAtiva.getTime() === faturaProxima.getTime()

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Link href="/cartoes" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{cartao.nome}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Demonstrativo de gastos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPagando(true)}>
            <Wallet className="h-4 w-4 mr-2" />
            Pagar fatura {format(faturaAtiva, 'MMMM', { locale: ptBR })}
          </Button>
          <Button onClick={() => setAdicionando(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova compra
          </Button>
        </div>
      </div>

      {/* Card visual + gráfico de faturas */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr] items-start">
        <CardCartao cartao={cartao} utilizado={utilizado} />

        <div className="space-y-2 rounded-lg border p-4">
          <div>
            <p className="text-sm font-semibold">Faturas por mês</p>
            <p className="text-xs text-muted-foreground">Total de compras por ciclo de fatura</p>
          </div>
          <GraficoFaturas
            transacoes={transacoes}
            diaFechamento={cartao.diaFechamento}
            cor={cartao.cor}
            onBarClick={(ts) => {
              setFaturaAtiva(new Date(ts))
              setCategoriaFiltro('todas')
              setRecorrenteFiltro('todos')
            }}
          />
        </div>
      </div>

      {/* Navegação de faturas */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost" size="icon"
          disabled={!podePrev}
          onClick={() => { setFaturaAtiva(faturasOrdenadas[idxAtivo - 1]); setCategoriaFiltro('todas'); setRecorrenteFiltro('todos') }}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="text-center">
          <p className="font-semibold capitalize text-lg">
            {format(faturaAtiva, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <p className="text-xs text-muted-foreground">
            {isFaturaAtual  && 'Fatura atual'}
            {isFaturaProxima && 'Próxima fatura'}
            {!isFaturaAtual && !isFaturaProxima && 'Fatura encerrada'}
          </p>
        </div>

        <Button
          variant="ghost" size="icon"
          disabled={!podeNext}
          onClick={() => { setFaturaAtiva(faturasOrdenadas[idxAtivo + 1]); setCategoriaFiltro('todas'); setRecorrenteFiltro('todos') }}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Resumo da fatura ativa */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Total de compras</p>
          <p className="text-xl font-bold">{formatCurrency(totalSaidas)}</p>
          <p className="text-xs text-muted-foreground">
            {isFaturaAtual ? `Fecha dia ${cartao.diaFechamento}` : 'Encerrada'}
          </p>
        </div>
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Pagamentos</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalPago)}
          </p>
          <p className="text-xs text-muted-foreground">
            {isFaturaAtual ? `Vence dia ${cartao.diaVencimento}` : 'registrados'}
          </p>
        </div>
        <div className={`border rounded-lg p-4 space-y-1 ${saldo === 0 && totalSaidas > 0 ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : ''}`}>
          <p className="text-xs text-muted-foreground">Saldo a pagar</p>
          <p className={`text-xl font-bold ${saldo === 0 && totalSaidas > 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
            {formatCurrency(saldo)}
          </p>
          <p className="text-xs text-muted-foreground">
            {saldo === 0 && totalSaidas > 0 ? 'Fatura quitada ✓' : 'restante'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      {transacoesFatura.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />

            {/* Filtro categoria */}
            <Select
              value={categoriaFiltro}
              onValueChange={(v) => setCategoriaFiltro(v ?? 'todas')}
            >
              <SelectTrigger className="w-48 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {categoriasNaFatura.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro recorrente */}
            <Select
              value={recorrenteFiltro}
              onValueChange={(v) => setRecorrenteFiltro((v ?? 'todos') as typeof recorrenteFiltro)}
            >
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="gasto-mensal">Gasto mensal</SelectItem>
                <SelectItem value="recorrente">Recorrentes</SelectItem>
                <SelectItem value="nao-recorrente">Não recorrentes</SelectItem>
              </SelectContent>
            </Select>

            {/* Total filtrado */}
            {filtroAtivo && (
              <div className="ml-auto flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs">
                <span className="text-muted-foreground">
                  {transacoesFiltradas.length} item{transacoesFiltradas.length !== 1 ? 's' : ''} ·
                </span>
                <span className="font-semibold">{formatCurrency(totalFiltrado)}</span>
              </div>
            )}

            {/* Maior gasto (sem filtro ativo) */}
            {!filtroAtivo && categoriaTop && (
              <div className="ml-auto flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs">
                <span className="text-muted-foreground">Maior gasto:</span>
                <span className="font-medium">{categoriaTop.nome}</span>
                <span className="text-muted-foreground">·</span>
                <span className="font-semibold">{formatCurrency(categoriaTop.total)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de transações */}
      {transacoesFiltradas.length === 0 ? (
        <div className="text-center text-muted-foreground py-16 border rounded-lg flex flex-col items-center gap-3">
          <CreditCard className="h-10 w-10 opacity-30" />
          <p>Nenhuma transação nesta fatura.</p>
          <Button variant="outline" onClick={() => setAdicionando(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Lançar compra
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {transacoesFiltradas.map((t) => {
            const rowBg = t.contaOrcamento
              ? 'bg-purple-50 dark:bg-purple-950/30'
              : t.recorrente
              ? 'bg-green-50 dark:bg-green-950/30'
              : t.status === 'PARCELADO' && (t.totalParcelas ?? 1) > 1
              ? 'bg-red-50 dark:bg-red-950/30'
              : 'bg-yellow-50 dark:bg-yellow-950/20'

            return (
            <div key={t.id} className={`flex items-center gap-3 p-3 ${rowBg}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-medium text-sm truncate">{t.descricao}</p>
                  {t.recorrente && (
                    <RefreshCw className="h-3 w-3 text-muted-foreground shrink-0" aria-label="Recorrente" />
                  )}
                  {t.contaOrcamento && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:text-purple-300 leading-none">
                      gasto mensal
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{formatDate(t.data)}</span>
                  {t.categoria && (
                    <span className="text-xs text-muted-foreground">· {t.categoria.nome}</span>
                  )}
                  {t.numeroParcela && t.totalParcelas && (
                    <span className="text-xs text-muted-foreground">
                      · {t.numeroParcela}/{t.totalParcelas}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(t)}`}>
                  {getStatusLabel(t)}
                </span>
                <span className={`font-semibold text-sm tabular-nums ${t.tipo === 'ENTRADA' ? 'text-green-600 dark:text-green-400' : ''}`}>
                  {t.tipo === 'ENTRADA' ? '+' : ''}{formatCurrency(t.valor)}
                </span>
                {t.tipo === 'SAIDA' && (
                  <Button
                    variant="ghost" size="icon"
                    className={`h-7 w-7 ${t.contaOrcamento ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                    disabled={isPending}
                    title={t.contaOrcamento ? 'Remover do gasto mensal' : 'Incluir no gasto mensal'}
                    onClick={() => startTransition(() => toggleContaOrcamento(t.id, cartao.id))}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  disabled={isPending}
                  onClick={() => setEditando(t)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  disabled={isPending}
                  onClick={() => setDeletando(t)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* Dialog nova compra */}
      <Dialog open={adicionando} onOpenChange={setAdicionando}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova compra — {cartao.nome}</DialogTitle>
          </DialogHeader>
          <FormCompraParcelada
            cartaoId={cartao.id}
            categorias={categorias}
            cartoes={cartoes}
            onSuccess={() => setAdicionando(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog pagamento */}
      <Dialog open={pagando} onOpenChange={setPagando}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="capitalize">
              Pagar fatura {format(faturaAtiva, 'MMMM', { locale: ptBR })} — {cartao.nome}
            </DialogTitle>
          </DialogHeader>
          <FormPagamento
            cartaoId={cartao.id}
            nomCartao={cartao.nome}
            mesReferencia={format(faturaAtiva, 'yyyy-MM')}
            valorSugerido={saldo > 0 ? saldo : undefined}
            onSuccess={() => setPagando(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog editar transação */}
      <Dialog open={!!editando} onOpenChange={(open) => !open && setEditando(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar lançamento</DialogTitle>
          </DialogHeader>
          {editando && (
            <FormEditarLancamento
              transacao={editando}
              categorias={categorias}
              onSuccess={() => setEditando(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={!!deletando} onOpenChange={(open) => !open && setDeletando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletando?.descricao}</strong>
              {deletando?.totalParcelas && deletando.totalParcelas > 1
                ? ` — todas as ${deletando.totalParcelas} parcelas serão removidas permanentemente.`
                : ' será removido permanentemente.'
              }
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
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
