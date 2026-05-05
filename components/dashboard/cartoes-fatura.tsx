import Link from 'next/link'
import { CreditCard, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface CartaoItem {
  id:            string
  nome:          string
  cor:           string | null
  limite:        number | null
  faturaAtual:   number
  faturaGrossa:  number
  terceirosMes:  number
  gastoReal:     number
  jaFatura:      number
  diaVencimento: number
}

interface CartoesFaturaProps {
  cartoes: CartaoItem[]
}

export function CartoesFatura({ cartoes }: CartoesFaturaProps) {
  if (cartoes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Nenhum cartão ativo
      </p>
    )
  }

  const totalFaturas   = cartoes.reduce((s, c) => s + c.faturaGrossa, 0)
  const totalPendente  = cartoes.reduce((s, c) => s + c.faturaAtual, 0)
  const totalTerceiros = cartoes.reduce((s, c) => s + c.terceirosMes, 0)
  const totalGastoReal = cartoes.reduce((s, c) => s + c.gastoReal, 0)

  return (
    <div className="space-y-2">
      {cartoes.map((c) => {
        const cor        = c.cor ?? '#6b7280'
        const quitada    = c.faturaGrossa > 0 && c.faturaAtual === 0
        const percentual = c.limite && c.faturaGrossa > 0
          ? Math.min((c.faturaAtual / c.limite) * 100, 100)
          : null
        const critico    = percentual !== null && percentual >= 80

        return (
          <Link key={c.id} href={`/cartoes/${c.id}`} className="block">
            <div className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
              {/* Ícone colorido */}
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: cor + '22' }}
                >
                  <CreditCard className="h-4 w-4" style={{ color: cor }} />
                </div>

                {/* Nome + valores */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{c.nome}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {quitada && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      <span className={`text-sm font-semibold tabular-nums whitespace-nowrap ${quitada ? 'text-emerald-600' : ''}`}>
                        {formatCurrency(c.faturaGrossa)}
                      </span>
                    </div>
                  </div>

                  {percentual !== null && (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${critico ? 'bg-red-500' : 'bg-primary'}`}
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                      <span className={`text-xs tabular-nums shrink-0 ${critico ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                        {percentual.toFixed(0)}%
                      </span>
                    </div>
                  )}

                  <p className="truncate text-xs text-muted-foreground">
                    {quitada
                      ? `Pago ${formatCurrency(c.jaFatura)} · vence dia ${c.diaVencimento}`
                      : `Restam ${formatCurrency(c.faturaAtual)} · vence dia ${c.diaVencimento}`
                    }
                    {c.limite && ` · limite ${formatCurrency(c.limite)}`}
                  </p>
                  {c.terceirosMes > 0 && (
                    <p className="truncate text-xs text-emerald-600">
                      − {formatCurrency(c.terceirosMes)} de terceiros · gasto real{' '}
                      <span className="font-semibold">{formatCurrency(c.gastoReal)}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )
      })}

      <div className="pt-2 border-t flex flex-wrap items-start justify-between gap-2">
        <Link href="/cartoes" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Ver todos os cartões →
        </Link>
        <div className="text-right space-y-0.5">
          <span className="text-xs font-semibold tabular-nums block whitespace-nowrap">
            Total: {formatCurrency(totalFaturas)}
          </span>
          {totalTerceiros > 0 && (
            <span className="text-[11px] text-emerald-600 tabular-nums block whitespace-nowrap">
              Gasto real: {formatCurrency(totalGastoReal)}
            </span>
          )}
          {totalPendente > 0 && (
            <span className="text-[11px] text-muted-foreground tabular-nums block whitespace-nowrap">
              {formatCurrency(totalPendente)} pendente
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
