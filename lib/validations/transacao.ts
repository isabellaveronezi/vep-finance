import { z } from 'zod'

export const transacaoSchema = z.object({
  descricao: z.string().min(1, 'Descrição obrigatória').max(100),
  tipo: z.enum(['ENTRADA', 'SAIDA']),
  valor: z.coerce.number().positive('Valor deve ser maior que zero'),
  data: z.coerce.date({ error: 'Data inválida' }),
  status: z.enum(['PAGO', 'PENDENTE', 'PARCELADO']).default('PAGO'),
  formaPagamento: z
    .enum(['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'BOLETO', 'TRANSFERENCIA'])
    .optional(),
  categoriaId: z.string().min(1, 'Categoria obrigatória'),
  cartaoId: z.string().optional(),
  observacao: z.string().optional(),
  numeroParcela:  z.coerce.number().int().positive().optional(),
  totalParcelas:  z.coerce.number().int().positive().optional(),
  contaOrcamento: z.boolean().optional(),
})

export type TransacaoFormData = z.infer<typeof transacaoSchema>
