import Link from 'next/link'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface ContaItem {
  id:           string
  descricao:    string
  valor:        number
  diaVencimento: number
  pagaNoMes:    boolean
}

interface ContasPendentesProps {
  contas: ContaItem[]
  hoje:   number
}

export function ContasPendentes({ contas, hoje }: ContasPendentesProps) {
  const pendentes = contas.filter((c) => !c.pagaNoMes)
  const pagas     = contas.filter((c) => c.pagaNoMes)

  if (contas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Nenhuma conta fixa ativa
      </p>
    )
  }

  return (
    <div className="space-y-1.5">
      {/* Pendentes primeiro */}
      {pendentes.map((c) => {
        const diff    = c.diaVencimento - hoje
        const vencida = diff < 0
        const urgente = diff >= 0 && diff <= 3

        return (
          <div key={c.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors">
            {vencida
              ? <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              : urgente
                ? <Clock className="h-4 w-4 shrink-0 text-yellow-500" />
                : <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            }
            <span className="flex-1 truncate text-sm">{c.descricao}</span>
            <Badge
              variant="outline"
              className={`text-xs shrink-0 ${
                vencida  ? 'bg-red-100 text-red-700 border-red-200' :
                urgente  ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                           'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {vencida ? 'Vencida' : `Dia ${c.diaVencimento}`}
            </Badge>
            <span className="text-sm font-semibold tabular-nums shrink-0">
              {formatCurrency(c.valor)}
            </span>
          </div>
        )
      })}

      {/* Pagas */}
      {pagas.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 opacity-50">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
          <span className="flex-1 truncate text-sm line-through">{c.descricao}</span>
          <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200 shrink-0">
            Paga
          </Badge>
          <span className="text-sm font-semibold tabular-nums shrink-0 text-muted-foreground">
            {formatCurrency(c.valor)}
          </span>
        </div>
      ))}

      <div className="pt-1 border-t">
        <Link href="/contas-fixas" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Ver todas as contas fixas →
        </Link>
      </div>
    </div>
  )
}
