'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { aporteSchema, type AporteFormData } from '@/lib/validations/meta'
import { registrarAporte } from '@/app/(app)/metas/actions'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
import { formatCurrency } from '@/lib/utils'

interface FormAporteProps {
  metaId:    string
  nome:      string
  restante:  number
  onSuccess?: () => void
}

export function FormAporte({ metaId, nome, restante, onSuccess }: FormAporteProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<AporteFormData, any, AporteFormData>({
    resolver: zodResolver(aporteSchema) as any,
    defaultValues: { valor: restante },
  })

  function onSubmit(data: AporteFormData) {
    startTransition(async () => {
      await registrarAporte(metaId, data)
      onSuccess?.()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
          <p className="text-muted-foreground">Meta</p>
          <p className="font-medium">{nome}</p>
          <p className="text-muted-foreground">Falta guardar</p>
          <p className="font-semibold text-base">{formatCurrency(restante)}</p>
        </div>

        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do aporte (R$)</FormLabel>
              <FormControl>
                <CurrencyInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Registrando...' : 'Confirmar aporte'}
        </Button>
      </form>
    </Form>
  )
}
