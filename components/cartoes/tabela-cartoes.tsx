'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { CardCartao } from './card-cartao'
import { FormCartao } from './form-cartao'
import { toggleCartao, deletarCartao } from '@/app/(app)/cartoes/actions'
import { formatCurrency } from '@/lib/utils'
import type { Cartao } from '@/app/generated/prisma/client'

interface TabelaCartoesProps {
  cartoes: (Cartao & { utilizado: number; proximaFatura: number; saldoAPagar: number })[]
}

export function TabelaCartoes({ cartoes }: TabelaCartoesProps) {
  const [criando, setCriando] = useState(false)
  const [editando, setEditando] = useState<Cartao | null>(null)
  const [deletando, setDeletando] = useState<Cartao | null>(null)
  const [isPending, startTransition] = useTransition()

  const totalLimite     = cartoes.reduce((s, c) => s + (c.limite ?? 0), 0)
  const totalUtilizado  = cartoes.reduce((s, c) => s + c.saldoAPagar, 0)
  const totalDisponivel = cartoes.reduce((s, c) => s + ((c.limite ?? 0) - c.saldoAPagar), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em]">Cartões</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {cartoes.length} cartão(ões) cadastrado(s)
          </p>
        </div>

        <Button onClick={() => setCriando(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo cartão
        </Button>
      </div>

      {/* Chips de resumo */}
      {cartoes.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card px-[18px] py-[14px]">
            <p className="text-[11px] text-muted-foreground mb-1">Limite total</p>
            <p className="text-lg font-bold tabular-nums text-muted-foreground">{formatCurrency(totalLimite)}</p>
          </div>
          <div className="rounded-xl border bg-card px-[18px] py-[14px]">
            <p className="text-[11px] text-muted-foreground mb-1">Total utilizado</p>
            <p className="text-lg font-bold tabular-nums text-red-500">{formatCurrency(totalUtilizado)}</p>
          </div>
          <div className="rounded-xl border bg-card px-[18px] py-[14px]">
            <p className="text-[11px] text-muted-foreground mb-1">Disponível total</p>
            <p className="text-lg font-bold tabular-nums text-emerald-600">{formatCurrency(totalDisponivel)}</p>
          </div>
        </div>
      )}

      <Dialog open={criando} onOpenChange={setCriando}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo cartão</DialogTitle>
          </DialogHeader>
          <FormCartao onSuccess={() => setCriando(false)} />
        </DialogContent>
      </Dialog>

      {cartoes.length === 0 ? (
        <p className="rounded-lg border py-16 text-center text-muted-foreground">
          Nenhum cartão cadastrado ainda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cartoes.map((c) => (
            <div key={c.id} className="space-y-3">
              <Link
                href={`/cartoes/${c.id}`}
                className={`block overflow-hidden rounded-[18px] transition-opacity hover:opacity-90 ${c.ativo ? '' : 'pointer-events-none opacity-50'}`}
              >
                <CardCartao cartao={c} utilizado={c.utilizado} proximaFatura={c.proximaFatura} saldoAPagar={c.saldoAPagar} />
              </Link>

              <div className="flex items-center justify-between px-1">
                {!c.ativo && (
                  <Badge variant="outline" className="text-xs">
                    inativo
                  </Badge>
                )}

                <Link
                  href={`/cartoes/${c.id}`}
                  className={
                    buttonVariants({ variant: 'ghost', size: 'sm' }) +
                    ' h-7 gap-1 px-2 text-xs text-muted-foreground'
                  }
                >
                  Ver detalhes <ChevronRight className="h-3 w-3" />
                </Link>

                <div className="ml-auto flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(() => toggleCartao(c.id, !c.ativo))
                    }
                    title={c.ativo ? 'Desativar' : 'Ativar'}
                  >
                    {c.ativo ? (
                      <ToggleRight className="h-4 w-4 text-primary" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditando(c)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeletando(c)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <Dialog
                    open={editando?.id === c.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setEditando(null)
                      }
                    }}
                  >
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Editar cartão</DialogTitle>
                      </DialogHeader>
                      <FormCartao
                        cartao={c}
                        onSuccess={() => setEditando(null)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deletando}
        onOpenChange={(open) => {
          if (!open) {
            setDeletando(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar cartão?</AlertDialogTitle>
            <AlertDialogDescription>
              O cartão <strong>{deletando?.nome}</strong> será removido. As
              transações vinculadas perderão o vínculo com o cartão.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletando) {
                  startTransition(() => deletarCartao(deletando.id))
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