'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, addMonths, subMonths, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { z } from 'zod'
import { registrarPagamento } from '@/app/(app)/cartoes/actions'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  SelectWithLabel, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const schema = z.object({
  valor:          z.number().positive('Informe o valor pago'),
  data:           z.string().min(1, 'Data obrigatória'),
  mesReferencia:  z.string().min(1, 'Selecione o mês de referência'),
  formaPagamento: z.enum(['DINHEIRO', 'PIX', 'DEBITO', 'BOLETO', 'TRANSFERENCIA']),
  descricao:      z.string().optional(),
})

type FormData = z.infer<typeof schema>

const FORMAS = [
  { value: 'PIX',           label: 'Pix' },
  { value: 'DINHEIRO',      label: 'Dinheiro' },
  { value: 'DEBITO',        label: 'Débito' },
  { value: 'BOLETO',        label: 'Boleto' },
  { value: 'TRANSFERENCIA', label: 'Transferência' },
]

/** Gera opções de mês: 3 meses atrás até 1 mês à frente */
function gerarOpcoesMes() {
  const hoje = new Date()
  return Array.from({ length: 5 }, (_, i) => {
    const d = addMonths(startOfMonth(hoje), i - 3)
    const value = format(d, 'yyyy-MM')
    const label = format(d, "MMMM 'de' yyyy", { locale: ptBR })
    return { value, label: label.charAt(0).toUpperCase() + label.slice(1) }
  })
}

interface Props {
  cartaoId:       string
  nomCartao:      string
  mesReferencia?: string
  valorSugerido?: number
  onSuccess?:     () => void
}

export function FormPagamento({ cartaoId, nomCartao, mesReferencia: mesRef, valorSugerido, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()

  const opcoesMes = gerarOpcoesMes()
  const mesDefault = mesRef ?? format(subMonths(startOfMonth(new Date()), 1), 'yyyy-MM')

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      valor:          valorSugerido ?? (undefined as unknown as number),
      data:           format(new Date(), 'yyyy-MM-dd'),
      mesReferencia:  mesDefault,
      formaPagamento: 'PIX',
      descricao:      '',
    },
  })

  function onSubmit(data: FormData) {
    const mesLabel = opcoesMes.find((m) => m.value === data.mesReferencia)?.label ?? data.mesReferencia
    startTransition(async () => {
      await registrarPagamento({
        cartaoId,
        valor:          data.valor,
        data:           new Date(data.data + 'T12:00:00'),
        mesReferencia:  data.mesReferencia,
        formaPagamento: data.formaPagamento,
        descricao:      data.descricao || `Pagamento fatura ${nomCartao} — ${mesLabel}`,
        observacao:     `Ref: ${data.mesReferencia}`,
      })
      onSuccess?.()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <FormField control={form.control} name="valor" render={({ field }) => (
          <FormItem>
            <FormLabel>Valor pago (R$)</FormLabel>
            <FormControl>
              <CurrencyInput value={field.value} onChange={field.onChange} placeholder="0,00" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="data" render={({ field }) => (
            <FormItem>
              <FormLabel>Data do pagamento</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="formaPagamento" render={({ field }) => (
            <FormItem>
              <FormLabel>Forma</FormLabel>
              <SelectWithLabel
                items={FORMAS}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FORMAS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </SelectWithLabel>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="descricao" render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
            <FormControl>
              <Input placeholder={`Pagamento fatura ${nomCartao}...`} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Registrando...' : 'Registrar pagamento'}
        </Button>
      </form>
    </Form>
  )
}
