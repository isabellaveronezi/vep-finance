import { Suspense } from 'react'
import { addMonths, subMonths, startOfMonth, endOfMonth, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getMesAno } from '@/lib/utils'
import { SeletorMes } from '@/components/dashboard/seletor-mes'
import { ResumoCards } from '@/components/dashboard/resumo-cards'
import { GraficoCategorias } from '@/components/dashboard/grafico-categorias'
import { ContasPendentes } from '@/components/dashboard/contas-pendentes'
import { CartoesFatura } from '@/components/dashboard/cartoes-fatura'

interface Props {
  searchParams: Promise<{ mes?: string }>
}

/** Retorna o início do mês de fatura a que a transação pertence */
function getMesFatura(data: Date, diaFechamento: number): Date {
  return data.getDate() <= diaFechamento
    ? startOfMonth(data)
    : startOfMonth(addMonths(data, 1))
}

export default async function DashboardPage({ searchParams }: Props) {
  const { mes } = await searchParams
  const session  = await auth()
  const userId   = session!.user!.id!

  const mesAno   = mes ?? getMesAno()
  const [ano, mesNum] = mesAno.split('-').map(Number)

  const inicioMes = new Date(ano, mesNum - 1, 1)
  const fimMes    = endOfMonth(inicioMes)
  const hoje      = new Date()
  const isMesAtual = mesAno === getMesAno()

  const [transacoes, contasFixas, pagamentosContasFixas, cartoes, todasTransacoesCartao, dividasAbertas, dividasTerceirosCartao] = await Promise.all([
    // Transações do mês selecionado
    db.transacao.findMany({
      where: { userId, data: { gte: inicioMes, lte: fimMes } },
      include: { categoria: true },
    }),
    // Contas fixas ativas
    db.contaFixa.findMany({
      where: { userId, ativo: true },
      orderBy: { diaVencimento: 'asc' },
    }),
    // Pagamentos de contas fixas no mês
    db.transacao.findMany({
      where: {
        userId,
        contaFixaId: { not: null },
        data: { gte: inicioMes, lte: fimMes },
      },
      select: { contaFixaId: true, valor: true },
    }),
    // Cartões ativos
    db.cartao.findMany({
      where: { userId, ativo: true },
      orderBy: { nome: 'asc' },
    }),
    // Todas transações de cartão (SAIDA + ENTRADA) para calcular saldo a pagar
    db.transacao.findMany({
      where: { userId, cartaoId: { not: null } },
      select: { cartaoId: true, valor: true, data: true, tipo: true },
    }),
    // Dívidas próprias abertas com vencimento definido
    db.dividaPropria.findMany({
      where: { userId, status: 'ABERTA', vencimento: { not: null } },
      select: {
        id:         true,
        valorTotal: true,
        parcelas:   true,
        vencimento: true,
        transacoes: {
          where:   { tipo: 'SAIDA' },
          select:  { data: true, valor: true },
          orderBy: { data: 'asc' },
        },
      },
    }),
    // Dívidas de terceiros vinculadas a cartão — para calcular gasto real
    db.dividaTerceiro.findMany({
      where: {
        userId,
        cartaoId:   { not: null },
        vencimento: { not: null },
        status:     { in: ['ABERTA', 'PARCIAL'] },
      },
      select: { cartaoId: true, valorTotal: true, valorRecebido: true, vencimento: true },
    }),
  ])

  // ── Contas fixas — base para métricas ───────────────────────────────────
  const pagasSet = new Set(pagamentosContasFixas.map((p) => p.contaFixaId!))
  const pagasMap = new Map(pagamentosContasFixas.map((p) => [p.contaFixaId!, p.valor]))

  // Só inclui contas fixas que já começaram (dataInicio <= início do mês, ou sem dataInicio)
  // Compara startOfMonth para evitar problema de fuso horário:
  // o browser salva meia-noite local, o servidor UTC armazena com offset,
  // então o timestamp pode ser ligeiramente maior que inicioMes mesmo sendo o mesmo mês.
  const contasFixasAtivas = contasFixas.filter((c) =>
    !c.dataInicio || startOfMonth(new Date(c.dataInicio)) <= inicioMes
  )

  // Contas fixas ainda não lançadas no mês (sem transação): entram como previsto
  const receitasFixasAuto = contasFixasAtivas
    .filter((c) => c.tipo === 'ENTRADA' && !pagasSet.has(c.id))
    .reduce((s, c) => s + Number(c.valor), 0)

  const despesasFixasAuto = contasFixasAtivas
    .filter((c) => c.tipo === 'SAIDA' && !pagasSet.has(c.id))
    .reduce((s, c) => s + Number(c.valor), 0)

  // ── Cartões: saldo a pagar da fatura do mês selecionado ──────────────────
  // Calculado antes das métricas para entrar no total de despesas
  const faturaMs = startOfMonth(inicioMes).getTime()

  const cartoesComFatura = cartoes.map((c) => {
    const txDoCartao = todasTransacoesCartao.filter((t) => t.cartaoId === c.id)
    const txFatura   = txDoCartao.filter(
      (t) => getMesFatura(new Date(t.data), c.diaFechamento).getTime() === faturaMs
    )

    const saidas     = txFatura.filter((t) => t.tipo === 'SAIDA').reduce((s, t) => s + t.valor, 0)
    const pagamentos = txFatura.filter((t) => t.tipo === 'ENTRADA').reduce((s, t) => s + t.valor, 0)
    const faturaAtual  = Math.max(0, saidas - pagamentos) // saldo ainda a pagar (widget)
    const faturaGrossa = saidas                           // gasto bruto

    // Para Despesas:
    // - Pagamento parcial → desconta o que foi pago
    // - Fatura totalmente paga → mantém o gasto bruto (não some das despesas)
    const faturaParaDespesas = pagamentos >= saidas ? saidas : faturaAtual

    // Terceiros neste ciclo: dívidas de terceiros vinculadas a este cartão
    // cujo vencimento cai neste ciclo de fatura → estorno de despesa
    const terceirosMes = dividasTerceirosCartao
      .filter((d) =>
        d.cartaoId === c.id &&
        getMesFatura(new Date(d.vencimento!), c.diaFechamento).getTime() === faturaMs
      )
      .reduce((s, d) => s + Math.max(0, d.valorTotal - d.valorRecebido), 0)

    // Gasto real = o que é genuinamente seu (terceiros serão reembolsados)
    const gastoReal = Math.max(0, faturaParaDespesas - terceirosMes)

    return {
      id:            c.id,
      nome:          c.nome,
      cor:           c.cor,
      limite:        c.limite,
      faturaAtual,
      faturaGrossa,
      faturaParaDespesas,
      terceirosMes,
      gastoReal,
      jaFatura:      pagamentos,
      diaVencimento: c.diaVencimento,
    }
  })

  // Despesas usam gastoReal — exclui o que terceiros vão reembolsar
  const totalFaturas    = cartoesComFatura.reduce((s, c) => s + c.gastoReal, 0)
  const totalFaturaPago = cartoesComFatura.reduce((s, c) => s + c.jaFatura, 0)

  // ── Métricas principais ──────────────────────────────────────────────────
  // Exclui ENTRADAs com cartaoId — são pagamentos de fatura, não receita real
  // Reembolsos de terceiros (dividaId) contam como receita: é dinheiro que entrou no caixa
  // O lado da despesa já é corrigido via gastoReal (terceiros subtraídos da fatura)
  const receitasPagas = transacoes
    .filter((t) => t.tipo === 'ENTRADA' && t.status === 'PAGO' && !t.cartaoId)
    .reduce((s, t) => s + t.valor, 0)

  // Despesas pagas: saídas PAGO sem cartão + pagamentos de fatura feitos no mês
  const pagamentosCartaoMes = transacoes
    .filter((t) => t.tipo === 'ENTRADA' && !!t.cartaoId)
    .reduce((s, t) => s + t.valor, 0)

  const despesasPagas = transacoes
    .filter((t) => t.tipo === 'SAIDA' && t.status === 'PAGO' && !t.cartaoId)
    .reduce((s, t) => s + t.valor, 0) + pagamentosCartaoMes

  // Receitas: pagas + contas fixas de entrada ainda não marcadas
  const receitas = receitasPagas + receitasFixasAuto

  // Despesas: saídas sem cartão (por data) + contas fixas não pagas + total das faturas
  // Transações de cartão são excluídas aqui e somadas pelo ciclo de fatura (evita dupla contagem)
  const contasFixasPagasNoMes = transacoes
    .filter((t) => t.tipo === 'SAIDA' && !!t.contaFixaId)
    .reduce((s, t) => s + t.valor, 0)

  const totalContasFixas = despesasFixasAuto + contasFixasPagasNoMes

  // Outros gastos: exclui cartão, conta fixa e dívidas (tratadas separadamente)
  const outrasDespesas = transacoes
    .filter((t) => t.tipo === 'SAIDA' && !t.cartaoId && !t.contaFixaId && !t.dividaPropiaId)
    .reduce((s, t) => s + t.valor, 0)

  // ── Dívidas: parcelas que vencem no mês selecionado ───────────────────────
  // Lógica: para dívida com N parcelas e vencimento final V,
  //   parcela k (0-indexed) cai no mês: startOfMonth(subMonths(V, N-1-k))
  // Se aquela parcela já foi paga neste mês, subtrai o que foi pago.
  const totalDividas = dividasAbertas.reduce((acc, divida) => {
    const N    = divida.parcelas ?? 1          // sem parcelas definidas = dívida única
    const venc = new Date(divida.vencimento!)
    const valorParcela = divida.valorTotal / N

    for (let k = 0; k < N; k++) {
      const mesParcelaMs = startOfMonth(subMonths(venc, N - 1 - k)).getTime()
      if (mesParcelaMs !== inicioMes.getTime()) continue

      // Quanto já foi pago neste mês para esta dívida
      const jaPagoMes = divida.transacoes
        .filter((t) => startOfMonth(new Date(t.data)).getTime() === inicioMes.getTime())
        .reduce((s, t) => s + t.valor, 0)

      acc += Math.max(0, valorParcela - jaPagoMes)
      break
    }
    return acc
  }, 0)

  const despesas = outrasDespesas + totalContasFixas + totalFaturas + totalDividas

  const detalhesDespesas = [
    { label: 'Faturas dos cartões', valor: totalFaturas },
    { label: 'Contas fixas',        valor: totalContasFixas },
    { label: 'Dívidas (parcelas)',   valor: totalDividas },
    { label: 'Outros gastos',       valor: outrasDespesas },
  ].filter((d) => d.valor > 0)

  const saldo = receitas - despesas

  // ── Já pago: breakdown do que saiu de fato do bolso ─────────────────────
  const outrosPagos = transacoes
    .filter((t) => t.tipo === 'SAIDA' && t.status === 'PAGO' && !t.cartaoId && !t.contaFixaId && !t.dividaPropiaId)
    .reduce((s, t) => s + t.valor, 0)

  const jaPagoItens = [
    { label: 'Faturas de cartão', valor: totalFaturaPago },
    { label: 'Contas fixas',      valor: contasFixasPagasNoMes },
    { label: 'Outros',            valor: outrosPagos },
  ].filter((d) => d.valor > 0)

  const jaPagoTotal = jaPagoItens.reduce((s, d) => s + d.valor, 0)

  // ── Gráfico por categoria ────────────────────────────────────────────────
  const gastosPorCategoria = transacoes
    .filter((t) => t.tipo === 'SAIDA' && t.categoria)
    .reduce<Record<string, { id: string; nome: string; total: number; cor?: string | null }>>((acc, t) => {
      const id = t.categoriaId!
      acc[id] = {
        id,
        nome:  t.categoria!.nome,
        cor:   t.categoria!.cor,
        total: (acc[id]?.total ?? 0) + t.valor,
      }
      return acc
    }, {})

  const dadosCategoria = Object.values(gastosPorCategoria)
    .sort((a, b) => b.total - a.total)

  const contasParaDashboard = contasFixasAtivas.map((c) => ({
    id:            c.id,
    descricao:     c.descricao,
    valor:         pagasMap.get(c.id) ?? c.valor,
    diaVencimento: c.diaVencimento,
    pagaNoMes:     pagasSet.has(c.id),
  }))

  const nomeUsuario = session?.user?.name?.split(' ')[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em]">
            Bem-vindo{nomeUsuario ? `, ${nomeUsuario}` : ''}!
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aqui está o resumo do seu mês.
          </p>
        </div>
        <Suspense fallback={<div className="h-9 w-48 animate-pulse rounded-md bg-muted" />}>
          <SeletorMes mesAno={mesAno} />
        </Suspense>
      </div>

      {/* Cards de métricas */}
      <ResumoCards
        receitas={receitas}
        receitasPagas={receitasPagas}
        despesas={despesas}
        despesasPagas={despesasPagas}
        saldo={saldo}
        isFuturo={mesAno > getMesAno()}
        isMesAtual={isMesAtual}
        jaPagoTotal={jaPagoTotal}
        jaPagoItens={jaPagoItens}
        detalhesDespesas={detalhesDespesas}
      />

      {/* Linha central: gráfico + painel lateral */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Gráfico por categoria */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold">Despesas por categoria</p>
            <p className="text-xs text-muted-foreground">Todos os lançamentos de saída do mês</p>
          </div>
          <GraficoCategorias
            dados={dadosCategoria}
            totalDespesas={despesas}
            transacoes={transacoes
              .filter((t) => t.tipo === 'SAIDA')
              .map((t) => ({
                id:        t.id,
                descricao: t.descricao,
                valor:     t.valor,
                data:      t.data,
                status:    t.status,
                categoriaId: t.categoriaId,
              }))
            }
          />
        </div>

        {/* Painel lateral */}
        <div className="space-y-6">
          {/* Contas fixas */}
          <div className="rounded-xl border bg-card p-5">
            <div className="mb-3">
              <p className="text-sm font-semibold">Contas fixas</p>
              <p className="text-xs text-muted-foreground">
                {contasParaDashboard.filter((c) => c.pagaNoMes).length}/{contasParaDashboard.length} pagas este mês
              </p>
            </div>
            <ContasPendentes
              contas={contasParaDashboard}
              hoje={isMesAtual ? hoje.getDate() : mesAno < getMesAno() ? 31 : 0}
            />
          </div>

          {/* Cartões */}
          <div className="rounded-xl border bg-card p-5">
            <div className="mb-3">
              <p className="text-sm font-semibold">Cartões — fatura do mês</p>
              <p className="text-xs text-muted-foreground">
                {isMesAtual ? 'Ciclo em aberto de cada cartão' : `Gastos no ciclo de ${format(inicioMes, "MMMM", { locale: ptBR })}`}
              </p>
            </div>
            <CartoesFatura cartoes={cartoesComFatura} />
          </div>
        </div>
      </div>
    </div>
  )
}
