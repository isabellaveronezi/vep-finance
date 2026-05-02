'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { recebimentoSchema, type RecebimentoFormData } from '@/lib/validations/divida-terceiro'
import { registrarRecebimento } from '@/app/(app)/dividas/actions-terceiro'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  SelectWithLabel, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { CurrencyInput } from '@/components/ui/currency-input'
import { formatCurrency } from '@/lib/utils'

const FORMAS = [
  { value: 'PIX',           label: 'PIX' },
  { value: 'DINHEIRO',      label: 'Dinheiro' },
  { value: 'DEBITO',        label: 'Débito' },
  { value: 'CREDITO',       label: 'Crédito' },
  { value: 'BOLETO',        label: 'Boleto' },
  { value: 'TRANSFERENCIA', label: 'Transferência' },
]

interface FormRecebimentoProps {
  dividaId:      string
  nomeDevedor:   string
  saldoRestante: number
  onSuccess?:    () => void
}

export function FormRecebimento({ dividaId, nomeDevedor, saldoRestante, onSuccess }: FormRecebimentoProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<RecebimentoFormData, any, RecebimentoFormData>({
    resolver: zodResolver(recebimentoSchema) as any,
    defaultValues: {
      valor:          saldoRestante,
      data:           new Date(),
      formaPagamento: 'PIX',
      observacao:     '',
    },
  })

  function onSubmit(data: RecebimentoFormData) {
    startTransition(async () => {
      await registrarRecebimento(dividaId, data)
      onSuccess?.()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="text-muted-foreground">Devedor</p>
          <p className="font-medium">{nomeDevedor}</p>
          <p className="text-muted-foreground mt-1">Saldo a receber</p>
          <p className="font-semibold text-base">{formatCurrency(saldoRestante)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor recebido (R$)</FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="0,00"
                  />
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
              <FormLabel>Forma de recebimento</FormLabel>
              <SelectWithLabel
                items={FORMAS}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
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
                <Input placeholder="Ex: Pagamento parcial..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Registrando...' : 'Confirmar recebimento'}
        </Button>
      </form>
    </Form>
  )
}
