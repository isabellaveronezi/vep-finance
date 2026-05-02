'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contaFixaSchema, type ContaFixaFormData } from '@/lib/validations/conta-fixa'
import { criarContaFixa, atualizarContaFixa } from '@/app/(app)/contas-fixas/actions'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  SelectWithLabel, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { ContaFixa, Categoria } from '@/app/generated/prisma/client'

interface FormContaFixaProps {
  contaFixa?: ContaFixa
  categorias: Categoria[]
  onSuccess?: () => void
}

export function FormContaFixa({ contaFixa, categorias, onSuccess }: FormContaFixaProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<ContaFixaFormData, any, ContaFixaFormData>({
    resolver: zodResolver(contaFixaSchema) as any,
    defaultValues: {
      tipo:          contaFixa?.tipo ?? 'SAIDA',
      descricao:     contaFixa?.descricao ?? '',
      valor:         contaFixa?.valor ?? undefined,
      diaVencimento: contaFixa?.diaVencimento ?? 10,
      dataInicio:    contaFixa?.dataInicio ? new Date(contaFixa.dataInicio) : null,
      recorrente:    contaFixa?.recorrente ?? true,
      categoriaId:   contaFixa?.categoriaId ?? '',
    },
  })

  const tipo = form.watch('tipo')

  function onSubmit(data: ContaFixaFormData) {
    startTransition(async () => {
      if (contaFixa) {
        await atualizarContaFixa(contaFixa.id, data)
      } else {
        await criarContaFixa(data)
      }
      onSuccess?.()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Tipo: ENTRADA / SAIDA */}
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-2">
                  {(['ENTRADA', 'SAIDA'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => field.onChange(t)}
                      className={cn(
                        'rounded-lg border py-2.5 text-sm font-medium transition-colors',
                        field.value === t
                          ? t === 'ENTRADA'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-red-500 bg-red-50 text-red-700'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {t === 'ENTRADA' ? '↑ Receita fixa' : '↓ Despesa fixa'}
                    </button>
                  ))}
                </div>
              </FormControl>
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
                <Input
                  placeholder={tipo === 'ENTRADA' ? 'Ex: Salário, Aluguel recebido...' : 'Ex: Aluguel, Internet, Academia...'}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Valor + Dia */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={field.value}
                    onChange={field.onChange}
                  />
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
                <FormLabel>{tipo === 'ENTRADA' ? 'Dia que entra' : 'Dia de vencimento'}</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="31" placeholder="10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Início a partir de */}
        <FormField
          control={form.control}
          name="dataInicio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Início a partir de <span className="text-muted-foreground text-xs">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="month"
                  value={field.value ? `${field.value.getFullYear()}-${String(field.value.getMonth() + 1).padStart(2, '0')}` : ''}
                  onChange={(e) => {
                    if (!e.target.value) { field.onChange(null); return }
                    const [y, m] = e.target.value.split('-').map(Number)
                    field.onChange(new Date(y, m - 1, 1))
                  }}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Deixe em branco para valer desde sempre
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categoria */}
        <FormField
          control={form.control}
          name="categoriaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <SelectWithLabel
                items={categorias.map((c) => ({ value: c.id, label: `${c.icone ? c.icone + ' ' : ''}${c.nome}` }))}
                onValueChange={field.onChange}
                value={field.value ?? ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categorias.map((c) => (
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

        {/* Recorrente */}
        <FormField
          control={form.control}
          name="recorrente"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <FormLabel className="text-sm font-medium">Recorrente</FormLabel>
                <p className="text-xs text-muted-foreground">Repete todo mês automaticamente</p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Salvando...' : contaFixa ? 'Salvar alterações' : tipo === 'ENTRADA' ? 'Adicionar receita fixa' : 'Adicionar despesa fixa'}
        </Button>
      </form>
    </Form>
  )
}
