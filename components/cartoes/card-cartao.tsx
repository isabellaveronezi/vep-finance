import { CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Cartao } from '@/app/generated/prisma/client'

interface CardCartaoProps {
  cartao: Cartao
  utilizado: number
  proximaFatura?: number
  saldoAPagar?: number
}

export function CardCartao({ cartao, utilizado, proximaFatura, saldoAPagar }: CardCartaoProps) {
  const disponivel = cartao.limite ? cartao.limite - (saldoAPagar ?? utilizado) : null
  const percentual  = cartao.limite ? Math.min((utilizado / cartao.limite) * 100, 100) : null
  const cor = cartao.cor ?? '#6b7280'

  return (
    <div
      className="rounded-[18px] p-[18px] text-white flex flex-col gap-[14px]"
      style={{ backgroundColor: cor, boxShadow: '0 4px 12px rgba(0,0,0,0.18)' }}
    >
      {/* Topo */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium opacity-75">Cartão de crédito</p>
          <p className="text-base font-bold mt-0.5">{cartao.nome}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <CreditCard className="h-[22px] w-[22px] opacity-80" strokeWidth={1.5} />
          {cartao.bandeira && (
            <span className="text-[10px] opacity-75">{cartao.bandeira}</span>
          )}
        </div>
      </div>

      {/* Valores */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] opacity-70">Utilizado</p>
          <p className="text-[13px] font-semibold tabular-nums">{formatCurrency(utilizado)}</p>
        </div>
        {disponivel !== null && (
          <div>
            <p className="text-[10px] opacity-70">Disponível</p>
            <p className="text-[13px] font-semibold tabular-nums">{formatCurrency(disponivel)}</p>
          </div>
        )}
        {cartao.limite && (
          <div>
            <p className="text-[10px] opacity-70">Limite total</p>
            <p className="text-[13px] font-semibold tabular-nums">{formatCurrency(cartao.limite)}</p>
          </div>
        )}
        {proximaFatura !== undefined && (
          <div>
            <p className="text-[10px] opacity-70">Próxima fatura</p>
            <p className="text-[13px] font-semibold tabular-nums">{formatCurrency(proximaFatura)}</p>
          </div>
        )}
      </div>

      {/* Barra de uso */}
      {percentual !== null && (
        <div>
          <div className="flex justify-between text-xs opacity-70 mb-1">
            <span>Uso do limite</span>
            <span>{percentual.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/30">
            <div
              className="h-1.5 rounded-full bg-white transition-all"
              style={{ width: `${percentual}%` }}
            />
          </div>
        </div>
      )}

      {/* Datas */}
      <div className="flex justify-between text-xs opacity-70 border-t border-white/20 pt-3">
        <span>Fecha dia {cartao.diaFechamento}</span>
        <span>Vence dia {cartao.diaVencimento}</span>
      </div>
    </div>
  )
}
