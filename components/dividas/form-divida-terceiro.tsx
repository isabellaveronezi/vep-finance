'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { z } from 'zod'
import { criarDividaTerceiro, atualizarDividaTerceiro, criarDividaTerceiroParcelada } from '@/app/(app)/dividas/actions-terceiro'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  SelectWithLabel, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { CurrencyInput } from '@/components/ui/currency-input'
import { cn } from '@/lib/utils'
import type { DividaTerceiro, Cartao } from '@/app/generated/prisma/client'

const FORMAS = [
  { value: 'PIX',           label: 'PIX' },
  { value: 'CREDITO',       label: 'Crédito' },
  { value: 'DEBITO',        label: 'Débito' },
  { value: 'DINHEIRO',      label: 'Dinheiro' },
  { value: 'BOLETO',        label: 'Boleto' },
  { value: 'TRANSFERENCIA', label: 'Transferência' },
]

const FORMA_ENUM = ['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'BOLETO', 'TRANSFERENCIA'] as const

const schemaAvulso = z.object({
  nomeDevedor:    z.string().min(1, 'Informe o nome'),
  descricao:      z.string().optional(),
  grupo:          z.string().optional(),
  valorTotal:     z.number().positive('Informe o valor'),
  formaPagamento: z.enum(FORMA_ENUM).optional(),
  cartaoId:       z.string().optional(),
  vencimento:     z.coerce.date().optional(),
})

const schemaParcelado = z.object({
  nomeDevedor:    z.string().min(1, 'Informe o nome'),
  descricao:      z.string().optional(),
  grupo:          z.string().optional(),
  valorTotal:     z.number().positive('Informe o valor total'),
  totalParcelas:  z.number().int().min(2, 'Mínimo 2 parcelas').max(360),
  dataPrimeira:   z.coerce.date(),
  formaPagamento: z.enum(FORMA_ENUM).optional(),
  cartaoId:       z.string().optional(),
})

type AvulsoData    = z.infer<typeof schemaAvulso>
type ParceladoData = z.infer<typeof schemaParcelado>

interface FormDividaTerceiroProps {
  divida?:    DividaTerceiro
  cartoes:    Cartao[]
  onSuccess?: () => void
}

const defaultsAvulso: AvulsoData = {
  nomeDevedor: '', descricao: '', grupo: '', valorTotal: undefined as unknown as number,
  formaPagamento: undefined, cartaoId: '', vencimento: undefined,
}

const defaultsParcelado: ParceladoData = {
  nomeDevedor: '', descricao: '', grupo: '', valorTotal: undefined as unknown as number,
  totalParcelas: undefined as unknown as number, dataPrimeira: new Date(),
  formaPagamento: undefined, cartaoId: '',
}

export function FormDividaTerceiro({ divida, cartoes, onSuccess }: FormDividaTerceiroProps) {
  const [isParcelado, setIsParcelado] = useState(false)
  const [isPending, startTransition]  = useTransition()

  const formAvulso = useForm<AvulsoData, any, AvulsoData>({
    resolver: zodResolver(schemaAvulso) as any,
    defaultValues: divida ? {
      nomeDevedor:    divida.nomeDevedor,
      descricao:      divida.descricao ?? '',
      grupo:          divida.grupo ?? '',
      valorTotal:     divida.valorTotal,
      formaPagamento: (divida.formaPagamento as AvulsoData['formaPagamento']) ?? undefined,
      cartaoId:       divida.cartaoId ?? '',
      vencimento:     divida.vencimento ? new Date(divida.vencimento) : undefined,
    } : defaultsAvulso,
  })

  const formParcelado = useForm<ParceladoData, any, ParceladoData>({
    resolver: zodResolver(schemaParcelado) as any,
    defaultValues: defaultsParcelado,
  })

  const formaAvulso     = formAvulso.watch('formaPagamento')
  const formaParcelado  = formParcelado.watch('formaPagamento')
  const valorTotal      = formParcelado.watch('valorTotal')
  const totalParcelas   = formParcelado.watch('totalParcelas')
  const valorParcela    = valorTotal > 0 && totalParcelas >= 2
    ? Math.floor((valorTotal / totalParcelas) * 100) / 100
    : null

  const cartoesItems = cartoes.map((c) => ({ value: c.id, label: c.nome }))

  function handleToggle(parcelado: boolean) {
    setIsParcelado(parcelado)
    formAvulso.reset(defaultsAvulso)
    formParcelado.reset(defaultsParcelado)
  }

  function onSubmitAvulso(data: AvulsoData) {
    const payload = {
      ...data,
      cartaoId: data.formaPagamento === 'CREDITO' ? (data.cartaoId || undefined) : undefined,
      descricao: data.descricao || undefined,
      grupo:     data.grupo     || undefined,
    }
    startTransition(async () => {
      if (divida) {
        await atualizarDividaTerceiro(divida.id, payload)
      } else {
        await criarDividaTerceiro(payload)
      }
      onSuccess?.()
    })
  }

  function onSubmitParcelado(data: ParceladoData) {
    startTransition(async () => {
      await criarDividaTerceiroParcelada({
        nomeDevedor:    data.nomeDevedor,
        descricao:      data.descricao,
        grupo:          data.grupo,
        valorTotal:     data.valorTotal,
        totalParcelas:  data.totalParcelas,
        dataPrimeira:   data.dataPrimeira,
        formaPagamento: data.formaPagamento,
        cartaoId:       data.formaPagamento === 'CREDITO' ? (data.cartaoId || undefined) : undefined,
      })
      onSuccess?.()
    })
  }

  const camposComuns = (
    control: any,
    forma: AvulsoData['formaPagamento'] | ParceladoData['formaPagamento']
  ) => (
    <>
      <FormField control={control} name="nomeDevedor" render={({ field }) => (
        <FormItem>
          <FormLabel>Quem te deve</FormLabel>
          <FormControl><Input placeholder="Ex: João, Maria..." {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <div className="grid grid-cols-2 gap-4">
        <FormField control={control} name="grupo" render={({ field }) => (
          <FormItem>
            <FormLabel>Grupo <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
            <FormControl><Input placeholder="Ex: Viagem, Churrasco..." {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={control} name="descricao" render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
            <FormControl><Input placeholder="Ex: Passagem, Ingresso..." {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <FormField control={control} name="formaPagamento" render={({ field }) => (
        <FormItem>
          <FormLabel>Como você emprestou <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
          <SelectWithLabel items={FORMAS} onValueChange={field.onChange} value={field.value ?? ''}>
            <FormControl>
              <SelectTrigger className="w-full"><SelectValue placeholder="Selecione..." /></SelectTrigger>
            </FormControl>
            <SelectContent>
              {FORMAS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </SelectWithLabel>
          <FormMessage />
        </FormItem>
      )} />

      {forma === 'CREDITO' && cartoes.length > 0 && (
        <FormField control={control} name="cartaoId" render={({ field }) => (
          <FormItem>
            <FormLabel>Cartão de crédito usado</FormLabel>
            <SelectWithLabel items={cartoesItems} onValueChange={field.onChange} value={field.value ?? ''}>
              <FormControl>
                <SelectTrigger className="w-full"><SelectValue placeholder="Selecione o cartão..." /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {cartoes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
              </SelectContent>
            </SelectWithLabel>
            <FormMessage />
          </FormItem>
        )} />
      )}
    </>
  )

  return (
    <div className="space-y-4">
      {/* Toggle — só para novo registro */}
      {!divida && (
        <div className="grid grid-cols-2 gap-2">
          {[false, true].map((p) => (
            <button
              key={String(p)}
              type="button"
              onClick={() => handleToggle(p)}
              className={cn(
                'rounded-lg border py-2 text-sm font-medium transition-colors',
                isParcelado === p
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted'
              )}
            >
              {p ? 'Parcelado' : 'Avulso'}
            </button>
          ))}
        </div>
      )}

      {/* ── Formulário AVULSO ── */}
      {(!isParcelado || divida) && (
        <Form {...formAvulso}>
          <form onSubmit={formAvulso.handleSubmit(onSubmitAvulso)} className="space-y-4">
            {camposComuns(formAvulso.control, formaAvulso)}

            <FormField control={formAvulso.control} name="valorTotal" render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <CurrencyInput value={field.value} onChange={field.onChange} placeholder="0,00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={formAvulso.control} name="vencimento" render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo para receber <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value + 'T12:00:00') : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Salvando...' : divida ? 'Salvar alterações' : 'Registrar dívida'}
            </Button>
          </form>
        </Form>
      )}

      {/* ── Formulário PARCELADO ── */}
      {isParcelado && !divida && (
        <Form {...formParcelado}>
          <form onSubmit={formParcelado.handleSubmit(onSubmitParcelado)} className="space-y-4">
            {camposComuns(formParcelado.control, formaParcelado)}

            <div className="grid grid-cols-2 gap-4">
              <FormField control={formParcelado.control} name="valorTotal" render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor total (R$)</FormLabel>
                  <FormControl>
                    <CurrencyInput value={field.value} onChange={field.onChange} placeholder="1.200,00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={formParcelado.control} name="totalParcelas" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nº de parcelas</FormLabel>
                  <FormControl>
                    <Input
                      type="number" min="2" max="360" placeholder="3"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {valorParcela && (
              <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                Cada parcela:{' '}
                <span className="font-semibold text-foreground">
                  R$ {valorParcela.toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}

            <FormField control={formParcelado.control} name="dataPrimeira" render={({ field }) => (
              <FormItem>
                <FormLabel>Data da 1ª parcela</FormLabel>
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

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Registrando...' : `Registrar ${totalParcelas >= 2 ? `${totalParcelas}x` : 'parcelas'}`}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
