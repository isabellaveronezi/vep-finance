'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { metaSchema, type MetaFormData } from '@/lib/validations/meta'
import { criarMeta, atualizarMeta } from '@/app/(app)/metas/actions'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
import type { Meta } from '@/app/generated/prisma/client'

interface FormMetaProps {
  meta?:      Meta
  onSuccess?: () => void
}

export function FormMeta({ meta, onSuccess }: FormMetaProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<MetaFormData, any, MetaFormData>({
    resolver: zodResolver(metaSchema) as any,
    defaultValues: {
      nome:          meta?.nome          ?? '',
      descricao:     meta?.descricao     ?? '',
      valorObjetivo: meta?.valorObjetivo ?? undefined,
      valorAtual:    meta?.valorAtual    ?? 0,
      aportesMensal: meta?.aportesMensal ?? null,
      prazoEstimado: meta?.prazoEstimado ? new Date(meta.prazoEstimado) : null,
      icone:         meta?.icone         ?? '',
    },
  })

  function onSubmit(data: MetaFormData) {
    startTransition(async () => {
      if (meta) {
        await atualizarMeta(meta.id, data)
      } else {
        await criarMeta(data)
      }
      onSuccess?.()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Ícone + Nome */}
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="icone"
            render={({ field }) => (
              <FormItem className="w-16 shrink-0">
                <FormLabel>Ícone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="🎯"
                    className="text-center text-lg"
                    maxLength={2}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Nome da meta</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Viagem para Europa, Reserva de emergência..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Descrição */}
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <Input placeholder="Detalhes sobre a meta..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Valor objetivo + Valor atual */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valorObjetivo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor objetivo (R$)</FormLabel>
                <FormControl>
                  <CurrencyInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="valorAtual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Já guardei (R$)</FormLabel>
                <FormControl>
                  <CurrencyInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Aporte mensal + Prazo */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="aportesMensal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aporte mensal <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                <FormControl>
                  <CurrencyInput value={field.value ?? undefined} onChange={(v) => field.onChange(v ?? null)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prazoEstimado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Salvando...' : meta ? 'Salvar alterações' : 'Criar meta'}
        </Button>
      </form>
    </Form>
  )
}
