'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { z } from 'zod'
import { atualizarTransacao } from '@/app/(app)/transacoes/actions'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  SelectWithLabel, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Transacao, Categoria } from '@/app/generated/prisma/client'

const editSchema = z.object({
  descricao:   z.string().min(1, 'Descrição obrigatória'),
  valor:       z.number().positive('Valor deve ser positivo'),
  data:        z.coerce.date(),
  categoriaId: z.string().min(1, 'Categoria obrigatória'),
  observacao:  z.string().optional(),
})

type EditData = z.infer<typeof editSchema>

interface Props {
  transacao:  Transacao
  categorias: Categoria[]
  onSuccess?: () => void
}

export function FormEditarLancamento({ transacao, categorias, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<EditData, any, EditData>({
    resolver: zodResolver(editSchema) as any,
    defaultValues: {
      descricao:   transacao.descricao,
      valor:       Number(transacao.valor),
      data:        new Date(transacao.data),
      categoriaId: transacao.categoriaId ?? '',
      observacao:  transacao.observacao ?? '',
    },
  })

  function onSubmit(data: EditData) {
    startTransition(async () => {
      // Preserva campos que não são editados aqui
      await atualizarTransacao(transacao.id, {
        descricao:      data.descricao,
        valor:          data.valor,
        data:           data.data,
        categoriaId:    data.categoriaId,
        observacao:     data.observacao,
        tipo:           transacao.tipo,
        status:         transacao.status,
        formaPagamento: transacao.formaPagamento ?? undefined,
        cartaoId:       transacao.cartaoId ?? undefined,
        numeroParcela:  transacao.numeroParcela ?? undefined,
        totalParcelas:  transacao.totalParcelas ?? undefined,
      })
      onSuccess?.()
    })
  }

  const categoriasSaida = categorias.filter((c) => c.ativo)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <FormField control={form.control} name="descricao" render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="valor" render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <CurrencyInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="data" render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                  onChange={(e) => field.onChange(new Date(e.target.value + 'T12:00:00'))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="categoriaId" render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <SelectWithLabel
              items={categoriasSaida.map((c) => ({ value: c.id, label: `${c.icone ? c.icone + ' ' : ''}${c.nome}` }))}
              value={field.value}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {categoriasSaida.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icone ? `${c.icone} ` : ''}{c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectWithLabel>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="observacao" render={({ field }) => (
          <FormItem>
            <FormLabel>Observação <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
            <FormControl><Input placeholder="Ex: USD 15,99 · cotação R$5,80" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Info de parcela — somente leitura */}
        {transacao.numeroParcela && transacao.totalParcelas && (
          <p className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-2">
            Parcela {transacao.numeroParcela}/{transacao.totalParcelas} — apenas este lançamento será alterado
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </form>
    </Form>
  )
}
