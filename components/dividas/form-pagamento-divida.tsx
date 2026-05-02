'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { pagamentoDividaSchema, type PagamentoDividaFormData } from '@/lib/validations/divida-propria'
import { registrarPagamento } from '@/app/(app)/dividas/actions'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  SelectWithLabel, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

const FORMAS = [
  { value: 'PIX',           label: 'PIX' },
  { value: 'DEBITO',        label: 'Débito' },
  { value: 'DINHEIRO',      label: 'Dinheiro' },
  { value: 'BOLETO',        label: 'Boleto' },
  { value: 'TRANSFERENCIA', label: 'Transferência' },
]

interface FormPagamentoDividaProps {
  dividaId:      string
  credor:        string
  saldoRestante: number
  onSuccess?:    () => void
}

export function FormPagamentoDivida({ dividaId, credor, saldoRestante, onSuccess }: FormPagamentoDividaProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<PagamentoDividaFormData, any, PagamentoDividaFormData>({
    resolver: zodResolver(pagamentoDividaSchema) as any,
    defaultValues: {
      valor:          saldoRestante,
      data:           new Date(),
      formaPagamento: 'PIX',
      observacao:     '',
    },
  })

  function onSubmit(data: PagamentoDividaFormData) {
    startTransition(async () => {
      await registrarPagamento(dividaId, data)
      onSuccess?.()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="text-muted-foreground">Credor</p>
          <p className="font-medium">{credor}</p>
          <p className="text-muted-foreground mt-1">Saldo restante</p>
          <p className="font-semibold text-base">{formatCurrency(saldoRestante)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor do pagamento (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0.01"
                    {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="formaPagamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forma de pagamento</FormLabel>
              <SelectWithLabel
                items={FORMAS}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {FORMAS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </SelectWithLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <Input placeholder="Ex: Parcela 3/12..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Registrando...' : 'Confirmar pagamento'}
        </Button>
      </form>
    </Form>
  )
}
