import { z } from 'zod'

export const dividaPropiaSchema = z.object({
  credor:     z.string().min(1, 'Informe o credor'),
  descricao:  z.string().optional(),
  valorTotal: z.coerce.number().positive('Valor deve ser maior que zero'),
  parcelas:   z.coerce.number().int().positive().optional(),
  vencimento: z.coerce.date().optional(),
})

export const pagamentoDividaSchema = z.object({
  valor:          z.coerce.number().positive('Valor deve ser maior que zero'),
  data:           z.coerce.date(),
  formaPagamento: z.enum(['DINHEIRO', 'PIX', 'DEBITO', 'BOLETO', 'TRANSFERENCIA']).default('PIX'),
  observacao:     z.string().optional(),
})

export type DividaPropiaFormData    = z.infer<typeof dividaPropiaSchema>
export type PagamentoDividaFormData = z.infer<typeof pagamentoDividaSchema>
