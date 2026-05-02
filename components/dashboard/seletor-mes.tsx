'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getMesAno } from '@/lib/utils'

interface SeletorMesProps {
  mesAno:    string
  basePath?: string
}

export function SeletorMes({ mesAno, basePath = '/dashboard' }: SeletorMesProps) {
  const router      = useRouter()
  const searchParams = useSearchParams()

  const data      = parseISO(`${mesAno}-01`)
  const atual     = getMesAno()
  const isHoje    = mesAno === atual
  const limiteMax = getMesAno(addMonths(parseISO(`${atual}-01`), 6))
  const isMax     = mesAno >= limiteMax

  function navegar(delta: -1 | 1) {
    const nova = getMesAno(delta === -1 ? subMonths(data, 1) : addMonths(data, 1))
    const params = new URLSearchParams(searchParams.toString())
    params.set('mes', nova)
    router.push(`${basePath}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1.5 rounded-lg border bg-card px-2 py-1.5">
      <button
        onClick={() => navegar(-1)}
        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="min-w-[120px] text-center">
        <p className="text-sm font-medium capitalize">
          {format(data, "MMM 'de' yyyy", { locale: ptBR })}
        </p>
        {isHoje
          ? <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Mês atual</p>
          : mesAno > atual
            ? <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Planejamento</p>
            : null
        }
      </div>

      <button
        onClick={() => navegar(1)}
        disabled={isMax}
        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
