'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CurrencyInputProps {
  value:       number | undefined
  onChange:    (value: number | undefined) => void
  placeholder?: string
  className?:  string
  disabled?:   boolean
}

/**
 * Input de moeda brasileira (vírgula como separador decimal).
 * Recebe e emite `number` — mantém o texto de exibição internamente.
 */
export function CurrencyInput({
  value, onChange, placeholder = '0,00', className, disabled,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState<string>(() => {
    if (value == null || value === 0) return ''
    return String(value).replace('.', ',')
  })

  // Controle para evitar loop ao sincronizar valor externo
  const skipSync = useRef(false)

  useEffect(() => {
    if (skipSync.current) { skipSync.current = false; return }
    if (value == null || value === 0) { setDisplay(''); return }
    const parsed = parseFloat(display.replace(',', '.'))
    if (parsed !== value) setDisplay(String(value).replace('.', ','))
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value

    // Aceita ponto como vírgula (teclados numéricos que emitem ponto)
    raw = raw.replace('.', ',')

    // Mantém apenas dígitos e uma única vírgula
    raw = raw.replace(/[^\d,]/g, '')
    const partes = raw.split(',')
    if (partes.length > 2) raw = partes[0] + ',' + partes.slice(1).join('')

    // Limita a 2 casas decimais
    if (partes[1] !== undefined && partes[1].length > 2) {
      raw = partes[0] + ',' + partes[1].slice(0, 2)
    }

    setDisplay(raw)
    skipSync.current = true

    const num = parseFloat(raw.replace(',', '.'))
    onChange(isNaN(num) ? undefined : num)
  }

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      className={cn(className)}
      disabled={disabled}
    />
  )
}
