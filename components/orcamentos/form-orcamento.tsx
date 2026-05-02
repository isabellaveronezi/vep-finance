'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { orcamentoSchema, type OrcamentoFormData } from '@/lib/validations/orcamento'
import { salvarOrcamento } from '@/app/(app)/orcamentos/actions'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  SelectWithLabel, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Categoria, Orcamento } from '@/app/generated/prisma/client'

interface Props {
  mesAno:      string
  categorias:  Categoria[]
  /** Se passado, é edição — preenche os valores iniciais */
  orcamento?:  Orcamento
  /** IDs de categorias que já têm orçamento neste mês (para não duplicar) */
  usadas?:     string[]
  onSuccess?:  () => void
}

export function FormOrcamento({ mesAno, categorias, orcamento, usadas = [], onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()

  // Categorias disponíveis para criar: apenas SAIDA ativas e que ainda não têm orçamento
  // (na edição mostramos a categoria atual mesmo que já esteja "usada")
  const disponíveis = categorias.filter(
    (c) => c.tipo === 'SAIDA' && c.ativo && (!usadas.includes(c.id) || c.id === orcamento?.categoriaId)
  )

  const form = useForm<OrcamentoFormData>({
    resolver: zodResolver(orcamentoSchema),
    defaultValues: {
      categoriaId: orcamento?.categoriaId ?? '',
      valorLimite: orcamento?.valorLimite ?? (undefined as unknown as number),
      mesAno,
    },
  })

  function onSubmit(data: OrcamentoFormData) {
    startTransition(async () => {
      await salvarOrcamento(data)
      onSuccess?.()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <FormField control={form.control} name="categoriaId" render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <SelectWithLabel
              items={disponíveis.map((c) => ({
                value: c.id,
                label: `${c.icone ? c.icone + ' ' : ''}${c.nome}`,
              }))}
              value={field.value}
              onValueChange={field.onChange}
              disabled={!!orcamento}
            >
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {disponíveis.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icone ? `${c.icone} ` : ''}{c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectWithLabel>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="valorLimite" render={({ field }) => (
          <FormItem>
            <FormLabel>Limite mensal (R$)</FormLabel>
            <FormControl>
              <CurrencyInput value={field.value} onChange={field.onChange} placeholder="500,00" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Salvando...' : orcamento ? 'Salvar alterações' : 'Adicionar orçamento'}
        </Button>
      </form>
    </Form>
  )
}
