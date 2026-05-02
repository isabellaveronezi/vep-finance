import { z } from 'zod'

export const metaSchema = z.object({
  nome:          z.string().min(1, 'Nome obrigatório').max(80),
  descricao:     z.string().max(200).optional(),
  valorObjetivo: z.coerce.number().positive('Valor deve ser maior que zero'),
  valorAtual:    z.coerce.number().min(0).default(0),
  aportesMensal: z.coerce.number().min(0).optional().nullable(),
  prazoEstimado: z.coerce.date().optional().nullable(),
  icone:         z.string().max(8).optional().nullable(),
})

export const aporteSchema = z.object({
  valor: z.coerce.number().positive('Valor deve ser maior que zero'),
})

export type MetaFormData   = z.infer<typeof metaSchema>
export type AporteFormData = z.infer<typeof aporteSchema>
