'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { z } from 'zod'
import { criarTransacao } from '@/app/(app)/transacoes/actions'
import { registrarGastoParcelado } from '@/app/(app)/orcamentos/actions'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  SelectWithLabel, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Categoria, Cartao } from '@/app/generated/prisma/client'

const schemaSingle = z.object({
  descricao:      z.string().min(1, 'Descrição obrigatória'),
  valor:          z.number().positive('Informe o valor'),
  data:           z.coerce.date(),
  categoriaId:    z.string().min(1, 'Selecione a categoria'),
  formaPagamento: z.enum(['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'BOLETO', 'TRANSFERENCIA']),
  cartaoId:       z.string().optional(),
})

const schemaParcelado = z.object({
  descricao:      z.string().min(1, 'Descrição obrigatória'),
  valorTotal:     z.number().positive('Informe o valor total'),
  totalParcelas:  z.number().int().min(2, 'Mínimo 2 parcelas').max(360),
  data:           z.coerce.date(),
  categoriaId:    z.string().min(1, 'Selecione a categoria'),
  formaPagamento: z.enum(['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'BOLETO', 'TRANSFERENCIA']),
  cartaoId:       z.string().optional(),
})

type SingleData    = z.infer<typeof schemaSingle>
type ParceladoData = z.infer<typeof schemaParcelado>

const FORMAS = [
  { value: 'CREDITO',       label: 'Crédito' },
  { value: 'DEBITO',        label: 'Débito' },
  { value: 'PIX',           label: 'Pix' },
  { value: 'DINHEIRO',      label: 'Dinheiro' },
  { value: 'BOLETO',        label: 'Boleto' },
  { value: 'TRANSFERENCIA', label: 'Transferência' },
]

interface Props {
  categorias: Categoria[]
  cartoes:    Cartao[]
  onSuccess?: () => void
}

const defaultsSingle: SingleData = {
  descricao:      '',
  valor:          undefined as unknown as number,
  data:           new Date(),
  categoriaId:    '',
  formaPagamento: 'CREDITO',
  cartaoId:       '',
}

const defaultsParcelado: ParceladoData = {
  descricao:      '',
  valorTotal:     undefined as unknown as number,
  totalParcelas:  undefined as unknown as number,
  data:           new Date(),
  categoriaId:    '',
  formaPagamento: 'CREDITO',
  cartaoId:       '',
}

export function FormGasto({ categorias, cartoes, onSuccess }: Props) {
  const [isParcelado, setIsParcelado]    = useState(false)
  const [isPending, startTransition]     = useTransition()

  const formSingle = useForm<SingleData, any, SingleData>({
    resolver: zodResolver(schemaSingle) as any,
    defaultValues: defaultsSingle,
  })

  const formParcelado = useForm<ParceladoData, any, ParceladoData>({
    resolver: zodResolver(schemaParcelado) as any,
    defaultValues: defaultsParcelado,
  })

  const forma         = isParcelado ? formParcelado.watch('formaPagamento') : formSingle.watch('formaPagamento')
  const valorTotal    = formParcelado.watch('valorTotal')
  const totalParcelas = formParcelado.watch('totalParcelas')
  const valorParcela  = valorTotal > 0 && totalParcelas >= 2
    ? Math.floor((valorTotal / totalParcelas) * 100) / 100
    : null

  function handleToggle(parcelado: boolean) {
    setIsParcelado(parcelado)
    formSingle.reset(defaultsSingle)
    formParcelado.reset(defaultsParcelado)
  }

  function onSubmitSingle(data: SingleData) {
    const isCredito = data.formaPagamento === 'CREDITO'
    startTransition(async () => {
      await criarTransacao({
        descricao:      data.descricao,
        tipo:           'SAIDA',
        valor:          data.valor,
        data:           data.data,
        status:         isCredito ? 'PENDENTE' : 'PAGO',
        formaPagamento: data.formaPagamento,
        categoriaId:    data.categoriaId,
        cartaoId:       isCredito ? (data.cartaoId || '') : '',
        observacao:     '',
        contaOrcamento: true,
      })
      formSingle.reset(defaultsSingle)
      onSuccess?.()
    })
  }

  function onSubmitParcelado(data: ParceladoData) {
    startTransition(async () => {
      await registrarGastoParcelado({
        descricao:      data.descricao,
        valorTotal:     data.valorTotal,
        totalParcelas:  data.totalParcelas,
        dataPrimeira:   data.data,
        categoriaId:    data.categoriaId,
        formaPagamento: data.formaPagamento,
        cartaoId:       data.formaPagamento === 'CREDITO' ? (data.cartaoId || undefined) : undefined,
      })
      formParcelado.reset(defaultsParcelado)
      onSuccess?.()
    })
  }

  const categoriasItems = categorias.map((c) => ({
    value: c.id,
    label: `${c.icone ? c.icone + ' ' : ''}${c.nome}`,
  }))

  return (
    <div className="space-y-4">
      {/* Toggle avulso / parcelado */}
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

      {/* ── Formulário AVULSO ── */}
      {!isParcelado && (
        <Form {...formSingle}>
          <form onSubmit={formSingle.handleSubmit(onSubmitSingle)} className="space-y-4">

            <FormField control={formSingle.control} name="descricao" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Supermercado, Farmácia..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={formSingle.control} name="valor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <CurrencyInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={formSingle.control} name="data" render={({ field }) => (
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

            <FormField control={formSingle.control} name="categoriaId" render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <SelectWithLabel items={categoriasItems} value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icone ? `${c.icone} ` : ''}{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectWithLabel>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={formSingle.control} name="formaPagamento" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pagamento</FormLabel>
                  <SelectWithLabel items={FORMAS} value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {FORMAS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </SelectWithLabel>
                  <FormMessage />
                </FormItem>
              )} />

              {forma === 'CREDITO' && cartoes.length > 0 && (
                <FormField control={formSingle.control} name="cartaoId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cartão</FormLabel>
                    <SelectWithLabel
                      items={cartoes.map((c) => ({ value: c.id, label: c.nome }))}
                      value={field.value ?? ''} onValueChange={field.onChange}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {cartoes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                      </SelectContent>
                    </SelectWithLabel>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Registrando...' : 'Registrar gasto'}
            </Button>
          </form>
        </Form>
      )}

      {/* ── Formulário PARCELADO ── */}
      {isParcelado && (
        <Form {...formParcelado}>
          <form onSubmit={formParcelado.handleSubmit(onSubmitParcelado)} className="space-y-4">

            <FormField control={formParcelado.control} name="descricao" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Geladeira, Curso..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

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
                      type="number" min="2" max="360" placeholder="12"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Preview do valor por parcela */}
            {valorParcela && (
              <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                Cada parcela: <span className="font-semibold text-foreground">
                  R$ {valorParcela.toFixed(2).replace('.', ',')}
                </span>
                {' '}· descontada todo mês do orçamento
              </div>
            )}

            <FormField control={formParcelado.control} name="data" render={({ field }) => (
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

            <FormField control={formParcelado.control} name="categoriaId" render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <SelectWithLabel items={categoriasItems} value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icone ? `${c.icone} ` : ''}{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectWithLabel>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={formParcelado.control} name="formaPagamento" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pagamento</FormLabel>
                  <SelectWithLabel items={FORMAS} value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {FORMAS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </SelectWithLabel>
                  <FormMessage />
                </FormItem>
              )} />

              {forma === 'CREDITO' && cartoes.length > 0 && (
                <FormField control={formParcelado.control} name="cartaoId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cartão</FormLabel>
                    <SelectWithLabel
                      items={cartoes.map((c) => ({ value: c.id, label: c.nome }))}
                      value={field.value ?? ''} onValueChange={field.onChange}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {cartoes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                      </SelectContent>
                    </SelectWithLabel>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Registrando...' : `Registrar ${totalParcelas >= 2 ? `${totalParcelas}x` : 'parcelas'}`}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
