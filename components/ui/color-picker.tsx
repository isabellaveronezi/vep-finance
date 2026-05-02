'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export const CORES_PRESET = [
  // Neutros
  { label: 'Branco',        value: '#f9fafb' },
  { label: 'Prata',         value: '#9ca3af' },
  { label: 'Grafite',       value: '#374151' },
  { label: 'Preto',         value: '#111827' },
  // Vermelhos / Rosas
  { label: 'Rose claro',    value: '#fb7185' },
  { label: 'Salmão',        value: '#f43f5e' },
  { label: 'Rose',          value: '#e11d48' },
  { label: 'Vermelho',      value: '#dc2626' },
  { label: 'Vermelho escuro', value: '#991b1b' },
  // Laranjas / Amarelos
  { label: 'Laranja claro', value: '#fb923c' },
  { label: 'Laranja',       value: '#ea580c' },
  { label: 'Amarelo',       value: '#facc15' },
  { label: 'Âmbar',         value: '#f59e0b' },
  { label: 'Ouro',          value: '#d97706' },
  { label: 'Marrom dourado', value: '#b45309' },
  // Verdes
  { label: 'Lima',          value: '#a3e635' },
  { label: 'Verde claro',   value: '#4ade80' },
  { label: 'Verde',         value: '#16a34a' },
  { label: 'Esmeralda',     value: '#059669' },
  { label: 'Teal',          value: '#0d9488' },
  // Azuis / Cianos
  { label: 'Ciano claro',   value: '#22d3ee' },
  { label: 'Ciano',         value: '#0891b2' },
  { label: 'Azul claro',    value: '#38bdf8' },
  { label: 'Azul',          value: '#2563eb' },
  { label: 'Azul escuro',   value: '#1e3a8a' },
  // Roxos / Violetas
  { label: 'Índigo',        value: '#4f46e5' },
  { label: 'Violeta',       value: '#7c3aed' },
  { label: 'Roxo',          value: '#9333ea' },
  { label: 'Fúcsia',        value: '#c026d3' },
  { label: 'Rosa',          value: '#db2777' },
  // Marrons
  { label: 'Marrom claro',  value: '#a16207' },
  { label: 'Marrom',        value: '#92400e' },
]

interface ColorPickerProps {
  value:    string | null | undefined
  onChange: (cor: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {CORES_PRESET.map((c) => (
        <button
          key={c.value}
          type="button"
          title={c.label}
          onClick={() => onChange(c.value)}
          className={cn(
            'h-8 w-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center',
            value === c.value && 'ring-2 ring-offset-2 ring-foreground scale-110'
          )}
          style={{ backgroundColor: c.value }}
        >
          {value === c.value && (
            <Check className="h-4 w-4 text-white drop-shadow" />
          )}
        </button>
      ))}
    </div>
  )
}
