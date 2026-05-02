import { z } from 'zod'

export const orcamentoSchema = z.object({
  categoriaId: z.string().min(1, 'Selecione uma categoria'),
  valorLimite: z.number().positive('Informe o valor limite'),
  mesAno:      z.string().regex(/^\d{4}-\d{2}$/, 'Mês inválido'),
})

export const limiteGlobalSchema = z.object({
  valorLimite: z.number().positive('Informe o valor limite'),
  mesAno:      z.string().regex(/^\d{4}-\d{2}$/, 'Mês inválido'),
})

export type OrcamentoFormData   = z.infer<typeof orcamentoSchema>
export type LimiteGlobalFormData = z.infer<typeof limiteGlobalSchema>
