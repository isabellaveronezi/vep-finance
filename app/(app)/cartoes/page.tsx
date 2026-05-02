import { addMonths, startOfMonth } from 'date-fns'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { TabelaCartoes } from '@/components/cartoes/tabela-cartoes'

/** Retorna o início do mês de fatura a que a transação pertence */
function getMesFatura(data: Date, diaFechamento: number): Date {
  return data.getDate() <= diaFechamento
    ? startOfMonth(data)
    : startOfMonth(addMonths(data, 1))
}

export default async function CartoesPage() {
  const session = await auth()
  const userId  = session!.user!.id!

  const hoje = new Date()

  const [cartoes, todasTransacoes] = await Promise.all([
    db.cartao.findMany({
      where:   { userId },
      orderBy: { nome: 'asc' },
    }),
    db.transacao.findMany({
      where: {
        userId,
        cartaoId: { not: null },
      },
      select: { cartaoId: true, valor: true, data: true, tipo: true },
    }),
  ])

  // Para cada cartão calcula o saldo a pagar da fatura atual
  const cartoesComUso = cartoes.map((cartao) => {
    const txDoCartao = todasTransacoes.filter((t) => t.cartaoId === cartao.id)

    // Mês da fatura atual: se hoje <= diaFechamento → mês atual; senão → próximo mês
    const faturaAtualMs = (
      hoje.getDate() <= cartao.diaFechamento
        ? startOfMonth(hoje)
        : startOfMonth(addMonths(hoje, 1))
    ).getTime()

    const txFaturaAtual = txDoCartao.filter(
      (t) => getMesFatura(new Date(t.data), cartao.diaFechamento).getTime() === faturaAtualMs
    )

    // Total bruto de compras na fatura atual (exibido como "Utilizado")
    const utilizado = txFaturaAtual
      .filter((t) => t.tipo === 'SAIDA')
      .reduce((acc, t) => acc + t.valor, 0)

    // Pagamentos registrados na fatura atual (ENTRADA)
    const pagamentos = txFaturaAtual
      .filter((t) => t.tipo === 'ENTRADA')
      .reduce((acc, t) => acc + t.valor, 0)

    // Saldo a pagar = compras − pagamentos (base para "Próxima fatura" e "Disponível")
    const saldoAPagar = Math.max(0, utilizado - pagamentos)

    return { ...cartao, utilizado, proximaFatura: saldoAPagar, saldoAPagar }
  })

  return <TabelaCartoes cartoes={cartoesComUso} />
}
