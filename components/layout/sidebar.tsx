'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  CreditCard,
  FileText,
  Target,
  Bell,
  Wallet,
  Settings,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const navItems = [
  { href: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/transacoes',   label: 'Transações',    icon: ArrowLeftRight },
  { href: '/categorias',   label: 'Categorias',    icon: Tag },
  { href: '/cartoes',      label: 'Cartões',       icon: CreditCard },
  { href: '/contas-fixas', label: 'Contas Fixas',  icon: FileText },
  { href: '/dividas',      label: 'Dívidas',       icon: TrendingDown },
  { href: '/orcamentos',   label: 'Orçamentos',    icon: Wallet },
  { href: '/metas',        label: 'Metas',         icon: Target },
  { href: '/alertas',      label: 'Alertas',       icon: Bell },
  { href: '/configuracoes',label: 'Configurações', icon: Settings },
]

export function NavLinks({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1 flex-1">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onItemClick}
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname === href || pathname.startsWith(href + '/')
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r bg-background px-3 py-4">
      <div className="mb-6 px-2 flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[#0f172a]">
          <span className="text-[9px] font-black tracking-tight text-white">VeP</span>
        </div>
        <span className="text-base font-bold tracking-tight text-[#0f172a]">VeP Finance</span>
      </div>
      <NavLinks />
    </aside>
  )
}
