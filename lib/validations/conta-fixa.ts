import { z } from 'zod'

export const contaFixaSchema = z.object({
  tipo:          z.enum(['ENTRADA', 'SAIDA']).default('SAIDA'),
  descricao:     z.string().min(1, 'Descrição obrigatória').max(100),
  valor:         z.coerce.number().positive('Valor deve ser maior que zero'),
  diaVencimento: z.coerce.number().int().min(1).max(31, 'Dia inválido'),
  dataInicio:    z.coerce.date().optional().nullable(),
  recorrente:    z.boolean().default(true),
  categoriaId:   z.string().optional(),
})

export type ContaFixaFormData = z.infer<typeof contaFixaSchema>
