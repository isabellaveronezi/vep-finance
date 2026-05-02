'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { dividaPropiaSchema, type DividaPropiaFormData } from '@/lib/validations/divida-propria'
import { criarDivida, atualizarDivida } from '@/app/(app)/dividas/actions'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { DividaPropria } from '@/app/generated/prisma/client'

interface FormDividaProps {
  divida?:   DividaPropria
  onSuccess?: () => void
}

export function FormDivida({ divida, onSuccess }: FormDividaProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<DividaPropiaFormData, any, DividaPropiaFormData>({
    resolver: zodResolver(dividaPropiaSchema) as any,
    defaultValues: {
      credor:     divida?.credor     ?? '',
      descricao:  divida?.descricao  ?? '',
      valorTotal: divida?.valorTotal ?? undefined,
      parcelas:   divida?.parcelas   ?? undefined,
      vencimento: divida?.vencimento ? new Date(divida.vencimento) : undefined,
    },
  })

  function onSubmit(data: DividaPropiaFormData) {
    startTransition(async () => {
      if (divida) {
        await atualizarDivida(divida.id, data)
      } else {
        await criarDivida(data)
      }
      onSuccess?.()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <FormField
          control={form.control}
          name="credor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credor</FormLabel>
              <FormControl>
                <Input placeholder="Ex: João, Banco Itaú, Loja XYZ..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <Input placeholder="Ex: Empréstimo para reforma, Notebook parcelado..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valorTotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor total (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0,00"
                    {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parcelas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parcelas <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                <FormControl>
                  <Input type="number" min="1" placeholder="Ex: 12"
                    {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="vencimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de quitação prevista <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Salvando...' : divida ? 'Salvar alterações' : 'Registrar dívida'}
        </Button>
      </form>
    </Form>
  )
}
