import { z } from 'zod'

export const categoriaSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').max(50),
  tipo: z.enum(['ENTRADA', 'SAIDA']),
  icone: z.string().optional(),
  cor: z.string().optional(),
})

export type CategoriaFormData = z.infer<typeof categoriaSchema>
