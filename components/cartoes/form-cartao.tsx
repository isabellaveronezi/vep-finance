'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cartaoSchema, type CartaoFormData } from '@/lib/validations/cartao'
import { criarCartao, atualizarCartao } from '@/app/(app)/cartoes/actions'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ColorPicker } from '@/components/ui/color-picker'
import { CurrencyInput } from '@/components/ui/currency-input'
import type { Cartao } from '@/app/generated/prisma/client'

const BANDEIRAS = ['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outro']

interface FormCartaoProps {
  cartao?: Cartao
  onSuccess?: () => void
}

export function FormCartao({ cartao, onSuccess }: FormCartaoProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<CartaoFormData, any, CartaoFormData>({
    resolver: zodResolver(cartaoSchema) as any,
    defaultValues: {
      nome:          cartao?.nome ?? '',
      bandeira:      cartao?.bandeira ?? '',
      limite:        cartao?.limite ?? undefined,
      diaFechamento: cartao?.diaFechamento ?? 1,
      diaVencimento: cartao?.diaVencimento ?? 10,
      cor:           cartao?.cor ?? '#374151',
    },
  })

  function onSubmit(data: CartaoFormData) {
    startTransition(async () => {
      if (cartao) {
        await atualizarCartao(cartao.id, data)
      } else {
        await criarCartao(data)
      }
      onSuccess?.()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do cartão</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Nubank, Inter Gold..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bandeira"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bandeira <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                <SelectContent>
                  {BANDEIRAS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor do cartão</FormLabel>
              <FormControl>
                <ColorPicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="limite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limite (R$) <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <CurrencyInput
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                  placeholder="5.000,00"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="diaFechamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia de fechamento</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="31" placeholder="15" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="diaVencimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia de vencimento</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="31" placeholder="22" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Salvando...' : cartao ? 'Salvar alterações' : 'Adicionar cartão'}
        </Button>
      </form>
    </Form>
  )
}
