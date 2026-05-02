'use client'

import { useTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { z } from 'zod'
import { RefreshCw, SplitSquareHorizontal, Info } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { CurrencyInput } from '@/components/ui/currency-input'
import { criarCompraParcelada, criarCompraRecorrente } from '@/app/(app)/cartoes/actions'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  SelectWithLabel, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Categoria, Cartao } from '@/app/generated/prisma/client'

// ── schemas ──────────────────────────────────────────────────────────────────

const parceladaSchema = z.object({
  descricao:           z.string().min(1, 'Descrição obrigatória'),
  valorTotal:          z.number().positive('Valor deve ser positivo'),
  totalParcelas:       z.coerce.number().int().min(1).max(360),
  parcelaInicial:      z.coerce.number().int().min(1),
  dataPrimeiraParcela: z.string().min(1, 'Data obrigatória'),
  categoriaId:         z.string().min(1, 'Categoria obrigatória'),
  cartaoId:            z.string().min(1),
  observacao:          z.string().optional(),
}).refine(
  (d) => d.parcelaInicial <= d.totalParcelas,
  { message: 'Parcela inicial não pode ser maior que o total', path: ['parcelaInicial'] }
)

const recorrenteSchema = z.object({
  descricao:   z.string().min(1, 'Descrição obrigatória'),
  valor:       z.number().positive('Valor deve ser positivo'),
  meses:       z.coerce.number().int().min(1).max(36),
  dataInicio:  z.string().min(1, 'Data obrigatória'),
  categoriaId: z.string().min(1, 'Categoria obrigatória'),
  cartaoId:    z.string().min(1),
  observacao:  z.string().optional(),
})

type ParceladaData = z.infer<typeof parceladaSchema>
type RecorrenteData = z.infer<typeof recorrenteSchema>
type Modo = 'PARCELADA' | 'RECORRENTE'

// ── helper: calcula fatura destino ───────────────────────────────────────────

function calcularFaturaLabel(diaFechamento: number, dataStr: string): string {
  const data = new Date(dataStr + 'T12:00:00')
  const dia  = data.getDate()
  const mesFechamento = dia <= diaFechamento ? data : addMonths(data, 1)
  return format(mesFechamento, "MMMM 'de' yyyy", { locale: ptBR })
}

function defaultDate(diaFechamento: number): string {
  return format(new Date(), 'yyyy-MM-dd')
}

// ── component ────────────────────────────────────────────────────────────────

interface Props {
  cartaoId: string
  categorias: Categoria[]
  cartoes: Cartao[]
  onSuccess?: () => void
}

export function FormCompraParcelada({ cartaoId, categorias, cartoes, onSuccess }: Props) {
  const [modo, setModo]             = useState<Modo>('PARCELADA')
  const [isPending, startTransition] = useTransition()

  const categoriasSaida = categorias.filter((c) => c.tipo === 'SAIDA' && c.ativo)

  // ── form parcelada ──────────────────────────────────────────────────────────
  const formP = useForm<ParceladaData, any, ParceladaData>({
    resolver: zodResolver(parceladaSchema) as any,
    defaultValues: {
      descricao: '', valorTotal: undefined, totalParcelas: 1, parcelaInicial: 1,
      dataPrimeiraParcela: format(new Date(), 'yyyy-MM-dd'),
      categoriaId: '', cartaoId, observacao: '',
    },
  })

  const vTotal    = formP.watch('valorTotal')
  const nTotal    = formP.watch('totalParcelas')
  const nInicial  = formP.watch('parcelaInicial')
  const dataP     = formP.watch('dataPrimeiraParcela')
  const cartaoIdP = formP.watch('cartaoId')

  const restantes   = Math.max(0, nTotal - nInicial + 1)
  const valorParc   = nTotal > 0 ? Math.floor((vTotal / nTotal) * 100) / 100 : 0
  const cartaoSelP  = cartoes.find((c) => c.id === cartaoIdP)
  const faturaLabelP = cartaoSelP && dataP
    ? calcularFaturaLabel(cartaoSelP.diaFechamento, dataP)
    : null

  function onSubmitP(data: ParceladaData) {
    startTransition(async () => {
      await criarCompraParcelada({
        ...data,
        dataPrimeiraParcela: new Date(data.dataPrimeiraParcela + 'T12:00:00'),
      })
      onSuccess?.()
    })
  }

  // ── form recorrente ─────────────────────────────────────────────────────────
  const cartaoAtual = cartoes.find((c) => c.id === cartaoId)
  const dataInicioDefault = cartaoAtual
    ? defaultDate(cartaoAtual.diaFechamento)
    : format(new Date(), 'yyyy-MM-dd')

  const formR = useForm<RecorrenteData, any, RecorrenteData>({
    resolver: zodResolver(recorrenteSchema) as any,
    defaultValues: {
      descricao: '', valor: undefined, meses: 12,
      dataInicio: dataInicioDefault,
      categoriaId: '', cartaoId, observacao: '',
    },
  })

  const dataR     = formR.watch('dataInicio')
  const cartaoIdR = formR.watch('cartaoId')
  const cartaoSelR = cartoes.find((c) => c.id === cartaoIdR)
  const faturaLabelR = cartaoSelR && dataR
    ? calcularFaturaLabel(cartaoSelR.diaFechamento, dataR)
    : null

  function onSubmitR(data: RecorrenteData) {
    startTransition(async () => {
      await criarCompraRecorrente({
        ...data,
        dataInicio: new Date(data.dataInicio + 'T12:00:00'),
      })
      onSuccess?.()
    })
  }

  // ── UI ──────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Toggle modo */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
        {([
          { value: 'PARCELADA', label: 'Parcelada', icon: SplitSquareHorizontal },
          { value: 'RECORRENTE', label: 'Recorrente', icon: RefreshCw },
        ] as const).map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setModo(value)}
            className={cn(
              'flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-sm font-medium transition-all',
              modo === value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── MODO PARCELADA ── */}
      {modo === 'PARCELADA' && (
        <Form {...formP}>
          <form onSubmit={formP.handleSubmit(onSubmitP)} className="space-y-4">

            <FormField control={formP.control} name="descricao" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl><Input placeholder="Ex: TV Samsung, iPhone 16..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField
              control={formP.control}
              name="valorTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor total (R$)</FormLabel>
                  <FormControl>
                    <CurrencyInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={formP.control} name="totalParcelas" render={({ field }) => (
                <FormItem>
                  <FormLabel>Total de parcelas</FormLabel>
                  <FormControl><Input type="number" min="1" max="360" placeholder="12" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={formP.control} name="parcelaInicial" render={({ field }) => (
                <FormItem>
                  <FormLabel>Parcela inicial</FormLabel>
                  <FormControl><Input type="number" min="1" placeholder="1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {vTotal > 0 && nTotal > 0 && (
              <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                <p className="font-medium">Resumo</p>
                <p className="text-muted-foreground">
                  Valor por parcela: <span className="font-semibold text-foreground">{formatCurrency(valorParc)}</span>
                </p>
                <p className="text-muted-foreground">
                  Lançamentos: <span className="font-semibold text-foreground">
                    {nInicial}/{nTotal} até {nTotal}/{nTotal} ({restantes}x)
                  </span>
                </p>
              </div>
            )}

            <FormField control={formP.control} name="dataPrimeiraParcela" render={({ field }) => (
              <FormItem>
                <FormLabel>Data da parcela {nInicial}/{nTotal}</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {faturaLabelP && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-md px-3 py-2">
                <Info className="h-3.5 w-3.5 shrink-0" />
                Esta parcela vai para a fatura de <strong className="ml-1 capitalize">{faturaLabelP}</strong>
              </div>
            )}

            <FormField control={formP.control} name="categoriaId" render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <SelectWithLabel
                  items={categoriasSaida.map((c) => ({ value: c.id, label: c.nome }))}
                  onValueChange={field.onChange} value={field.value}
                >
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoriasSaida.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectWithLabel>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={formP.control} name="cartaoId" render={({ field }) => (
              <FormItem>
                <FormLabel>Cartão</FormLabel>
                <SelectWithLabel
                  items={cartoes.filter((c) => c.ativo).map((c) => ({ value: c.id, label: c.nome }))}
                  onValueChange={field.onChange} value={field.value}
                >
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione o cartão" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cartoes.filter((c) => c.ativo).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectWithLabel>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={formP.control} name="observacao" render={({ field }) => (
              <FormItem>
                <FormLabel>Observação <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                <FormControl><Input placeholder="Anotação livre..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Lançando...' : `Lançar ${restantes} parcela${restantes !== 1 ? 's' : ''}`}
            </Button>
          </form>
        </Form>
      )}

      {/* ── MODO RECORRENTE ── */}
      {modo === 'RECORRENTE' && (
        <Form {...formR}>
          <form onSubmit={formR.handleSubmit(onSubmitR)} className="space-y-4">

            <FormField control={formR.control} name="descricao" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl><Input placeholder="Ex: Netflix, Spotify, Academia..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={formR.control} name="valor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor mensal (R$)</FormLabel>
                  <FormControl>
                    <CurrencyInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={formR.control} name="meses" render={({ field }) => (
                <FormItem>
                  <FormLabel>Por quantos meses</FormLabel>
                  <FormControl><Input type="number" min="1" max="36" placeholder="12" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={formR.control} name="dataInicio" render={({ field }) => (
              <FormItem>
                <FormLabel>Primeiro lançamento</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {faturaLabelR && (
              <div className="flex items-center gap-2 text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-md px-3 py-2">
                <Info className="h-3.5 w-3.5 shrink-0" />
                Primeiro lançamento na fatura de <strong className="ml-1 capitalize">{faturaLabelR}</strong>
              </div>
            )}

            <FormField control={formR.control} name="categoriaId" render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <SelectWithLabel
                  items={categoriasSaida.map((c) => ({ value: c.id, label: c.nome }))}
                  onValueChange={field.onChange} value={field.value}
                >
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoriasSaida.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectWithLabel>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={formR.control} name="cartaoId" render={({ field }) => (
              <FormItem>
                <FormLabel>Cartão</FormLabel>
                <SelectWithLabel
                  items={cartoes.filter((c) => c.ativo).map((c) => ({ value: c.id, label: c.nome }))}
                  onValueChange={field.onChange} value={field.value}
                >
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione o cartão" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cartoes.filter((c) => c.ativo).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectWithLabel>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={formR.control} name="observacao" render={({ field }) => (
              <FormItem>
                <FormLabel>Observação <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                <FormControl><Input placeholder="Anotação livre..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Lançando...' : 'Criar recorrência'}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
