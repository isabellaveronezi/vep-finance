'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categoriaSchema, type CategoriaFormData } from '@/lib/validations/categoria'
import { criarCategoria, atualizarCategoria } from '@/app/(app)/categorias/actions'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  SelectWithLabel, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ColorPicker } from '@/components/ui/color-picker'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import type { Categoria } from '@/app/generated/prisma/client'

interface FormCategoriaProps {
  categoria?: Categoria
  onSuccess?: () => void
}

export function FormCategoria({ categoria, onSuccess }: FormCategoriaProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome:  categoria?.nome  ?? '',
      tipo:  categoria?.tipo  ?? 'SAIDA',
      icone: categoria?.icone ?? '',
      cor:   categoria?.cor   ?? '',
    },
  })

  const icone = form.watch('icone')
  const cor   = form.watch('cor')

  function onSubmit(data: CategoriaFormData) {
    startTransition(async () => {
      if (categoria) {
        await atualizarCategoria(categoria.id, data)
      } else {
        await criarCategoria(data)
      }
      onSuccess?.()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

        {/* Preview */}
        {(icone || cor) && (
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
              style={{ backgroundColor: cor || '#e5e7eb' }}
            >
              {icone || '?'}
            </div>
            <div>
              <p className="text-sm font-medium">{form.watch('nome') || 'Nome da categoria'}</p>
              <p className="text-xs text-muted-foreground">Preview</p>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Alimentação" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SAIDA">Despesa</SelectItem>
                  <SelectItem value="ENTRADA">Receita</SelectItem>
                </SelectContent>
              </SelectWithLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Emoji */}
        <FormField
          control={form.control}
          name="icone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ícone <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <EmojiPicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cor */}
        <FormField
          control={form.control}
          name="cor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <ColorPicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Salvando...' : categoria ? 'Salvar alterações' : 'Criar categoria'}
        </Button>
      </form>
    </Form>
  )
}
