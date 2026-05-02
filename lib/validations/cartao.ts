import { z } from 'zod'

export const cartaoSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').max(50),
  bandeira: z.string().optional(),
  limite: z.coerce.number().positive('Limite deve ser maior que zero').optional(),
  diaFechamento: z.coerce.number().int().min(1).max(31, 'Dia inválido'),
  diaVencimento: z.coerce.number().int().min(1).max(31, 'Dia inválido'),
  cor: z.string().optional(),
})

export type CartaoFormData = z.infer<typeof cartaoSchema>
