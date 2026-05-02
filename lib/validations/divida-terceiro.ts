import { z } from 'zod'

export const dividaTerceiroSchema = z.object({
  nomeDevedor:    z.string().min(1, 'Informe o nome de quem te deve'),
  descricao:      z.string().optional(),
  valorTotal:     z.coerce.number().positive('Valor deve ser maior que zero'),
  formaPagamento: z.enum(['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'BOLETO', 'TRANSFERENCIA']).optional(),
  cartaoId:       z.string().optional(),
  vencimento:     z.coerce.date().optional(),
  grupo:          z.string().optional(),
})

export const recebimentoSchema = z.object({
  valor:          z.coerce.number().positive('Valor deve ser maior que zero'),
  data:           z.coerce.date(),
  formaPagamento: z.enum(['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'BOLETO', 'TRANSFERENCIA']).default('PIX'),
  observacao:     z.string().optional(),
})

export type DividaTerceiroFormData = z.infer<typeof dividaTerceiroSchema>
export type RecebimentoFormData    = z.infer<typeof recebimentoSchema>
