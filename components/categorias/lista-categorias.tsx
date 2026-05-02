'use client'

import { useState, useTransition } from 'react'
import { Pencil, Trash2, ToggleLeft, ToggleRight, Plus } from 'lucide-react'
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
import { FormCategoria } from './form-categoria'
import { toggleCategoria, deletarCategoria } from '@/app/(app)/categorias/actions'
import type { Categoria } from '@/app/generated/prisma/client'

type Filtro = 'TODOS' | 'SAIDA' | 'ENTRADA'

interface ListaCategoriasProps {
  categorias: Categoria[]
}

export function ListaCategorias({ categorias }: ListaCategoriasProps) {
  const [filtro, setFiltro]     = useState<Filtro>('TODOS')
  const [criando, setCriando]   = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [deletando, setDeletando] = useState<Categoria | null>(null)
  const [isPending, startTransition] = useTransition()

  const visiveis = categorias.filter((c) => filtro === 'TODOS' || c.tipo === filtro)

  const ABAS: { val: Filtro; label: string }[] = [
    { val: 'TODOS',   label: 'Todas'    },
    { val: 'SAIDA',   label: 'Despesas' },
    { val: 'ENTRADA', label: 'Receitas' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em]">Categorias</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {categorias.length} categorias cadastradas
          </p>
        </div>
        <Button onClick={() => setCriando(true)}>
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex w-fit gap-1 rounded-[10px] border bg-muted p-[3px]">
        {ABAS.map(({ val, label }) => (
          <button
            key={val}
            onClick={() => setFiltro(val)}
            className={[
              'rounded-lg px-3.5 py-[5px] text-xs font-medium transition-all',
              filtro === val
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {visiveis.length === 0 ? (
        <p className="rounded-xl border py-10 text-center text-sm text-muted-foreground">
          Nenhuma categoria cadastrada.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visiveis.map((cat) => (
            <div
              key={cat.id}
              className={[
                'flex items-start gap-3 rounded-xl border bg-card p-4',
                !cat.ativo ? 'opacity-50' : '',
              ].join(' ')}
            >
              {/* Icon badge */}
              <div
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] text-xl"
                style={{ backgroundColor: cat.cor ?? '#f1f5f9' }}
              >
                {cat.icone ?? '📁'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className={`text-sm font-semibold ${!cat.ativo ? 'line-through' : ''}`}>
                    {cat.nome}
                  </p>
                  <span
                    className={[
                      'shrink-0 rounded-full px-[7px] py-[2px] text-[11px] font-medium',
                      cat.tipo === 'ENTRADA'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500',
                    ].join(' ')}
                  >
                    {cat.tipo === 'ENTRADA' ? 'Receita' : 'Despesa'}
                  </span>
                </div>
                {!cat.ativo && (
                  <p className="text-[11px] text-muted-foreground">inativa</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  disabled={isPending}
                  title={cat.ativo ? 'Desativar' : 'Ativar'}
                  onClick={() => startTransition(() => toggleCategoria(cat.id, !cat.ativo))}
                >
                  {cat.ativo
                    ? <ToggleRight className="h-4 w-4 text-primary" />
                    : <ToggleLeft className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => setEditando(cat)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => setDeletando(cat)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog: nova categoria */}
      <Dialog open={criando} onOpenChange={setCriando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova categoria</DialogTitle>
          </DialogHeader>
          <FormCategoria onSuccess={() => setCriando(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog: editar */}
      <Dialog
        open={!!editando}
        onOpenChange={(open) => { if (!open) setEditando(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar categoria</DialogTitle>
          </DialogHeader>
          {editando && (
            <FormCategoria categoria={editando} onSuccess={() => setEditando(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* AlertDialog: deletar */}
      <AlertDialog
        open={!!deletando}
        onOpenChange={(open) => { if (!open) setDeletando(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria <strong>{deletando?.nome}</strong> será removida
              permanentemente. Transações vinculadas perderão a categoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletando) {
                  startTransition(() => deletarCategoria(deletando.id))
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
