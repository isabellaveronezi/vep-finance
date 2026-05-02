import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/** Converte Date/string do banco (UTC midnight) para Date representando aquele dia ao meio-dia UTC */
export function parseLocalDate(date: Date | string): Date {
  const iso = typeof date === 'string' ? date : date.toISOString()
  return new Date(iso.slice(0, 10) + 'T12:00:00Z')
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR').format(parseLocalDate(date))
}

export function getMesAno(date?: Date): string {
  const d = date ?? new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
