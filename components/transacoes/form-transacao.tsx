'use client'

import { useTransition, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { transacaoSchema, type TransacaoFormData } from '@/lib/validations/transacao'
import { criarTransacao, atualizarTransacao } from '@/app/(app)/transacoes/actions'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  SelectWithLabel, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Transacao, Categoria, Cartao } from '@/app/generated/prisma/client'

const FORMAS_PAGAMENTO = [
  { value: 'PIX',           label: 'Pix' },
  { value: 'DINHEIRO',      label: 'Dinheiro' },
  { value: 'DEBITO',        label: 'Débito' },
  { value: 'CREDITO',       label: 'Crédito' },
  { value: 'BOLETO',        label: 'Boleto' },
  { value: 'TRANSFERENCIA', label: 'Transferência' },
]

interface FormTransacaoProps {
  transacao?: Transacao
  categorias: Categoria[]
  cartoes: Cartao[]
  onSuccess?: () => void
}

export function FormTransacao({ transacao, categorias, cartoes, onSuccess }: FormTransacaoProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<TransacaoFormData, any, TransacaoFormData>({
    resolver: zodResolver(transacaoSchema) as any,
    defaultValues: {
      descricao:      transacao?.descricao ?? '',
      tipo:           transacao?.tipo ?? 'SAIDA',
      valor:          transacao?.valor ?? 0,
      data:           transacao?.data ? new Date(transacao.data) : new Date(),
      status:         transacao?.status ?? 'PAGO',
      formaPagamento: transacao?.formaPagamento ?? undefined,
      categoriaId:    transacao?.categoriaId ?? '',
      cartaoId:       transacao?.cartaoId ?? '',
      observacao:     transacao?.observacao ?? '',
      numeroParcela:  transacao?.numeroParcela ?? undefined,
      totalParcelas:  transacao?.totalParcelas ?? undefined,
    },
  })

  const tipoSelecionado = form.watch('tipo')
  const statusSelecionado = form.watch('status')
  const formaPagamento = form.watch('formaPagamento')

  // Filtra categorias pelo tipo selecionado
  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipoSelecionado && c.ativo)

  // Reseta categoriaId ao trocar tipo
  useEffect(() => {
    form.setValue('categoriaId', '')
  }, [tipoSelecionado, form])

  function onSubmit(data: TransacaoFormData) {
    startTransition(async () => {
      if (transacao) {
        await atualizarTransacao(transacao.id, data)
      } else {
        await criarTransacao(data)
      }
      onSuccess?.()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Tipo */}
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <SelectWithLabel
                items={[{ value: 'SAIDA', label: 'Despesa' }, { value: 'ENTRADA', label: 'Receita' }]}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="SAIDA">Despesa</SelectItem>
                  <SelectItem value="ENTRADA">Receita</SelectItem>
                </SelectContent>
              </SelectWithLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Supermercado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Valor + Data */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <CurrencyInput value={field.value} onChange={field.onChange} />
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
                    value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Categoria */}
        <FormField
          control={form.control}
          name="categoriaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <SelectWithLabel
                items={categoriasFiltradas.map((c) => ({ value: c.id, label: `${c.icone ? c.icone + ' ' : ''}${c.nome}` }))}
                onValueChange={field.onChange} value={field.value}
              >
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                <SelectContent>
                  {categoriasFiltradas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icone ? `${c.icone} ` : ''}{c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectWithLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status + Forma de pagamento */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <SelectWithLabel
                  items={[{ value: 'PAGO', label: 'Pago' }, { value: 'PENDENTE', label: 'Pendente' }, { value: 'PARCELADO', label: 'Parcelado' }]}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="PAGO">Pago</SelectItem>
                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                    <SelectItem value="PARCELADO">Parcelado</SelectItem>
                  </SelectContent>
                </SelectWithLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="formaPagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forma de pagamento</FormLabel>
                <SelectWithLabel
                  items={FORMAS_PAGAMENTO}
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                >
                  <FormControl><SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {FORMAS_PAGAMENTO.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectWithLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Cartão — só aparece quando forma = CREDITO */}
        {formaPagamento === 'CREDITO' && cartoes.length > 0 && (
          <FormField
            control={form.control}
            name="cartaoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cartão</FormLabel>
                <SelectWithLabel
                  items={cartoes.map((c) => ({ value: c.id, label: c.nome }))}
                  onValueChange={field.onChange} value={field.value ?? ''}
                >
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione o cartão" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {cartoes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectWithLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Parcelas — só aparece quando status = PARCELADO */}
        {statusSelecionado === 'PARCELADO' && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="numeroParcela"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parcela nº</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="1" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalParcelas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total de parcelas</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="12" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Observação */}
        <FormField
          control={form.control}
          name="observacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <Input placeholder="Notas adicionais..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Salvando...' : transacao ? 'Salvar alterações' : 'Registrar transação'}
        </Button>
      </form>
    </Form>
  )
}
