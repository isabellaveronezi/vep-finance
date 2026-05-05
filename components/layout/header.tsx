'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { LogOut, Menu, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import { NavLinks } from '@/components/layout/sidebar'

interface HeaderProps {
  userName?: string | null
}

export function Header({ userName }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Hamburguer — visível só no mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Spacer no desktop para manter o avatar à direita */}
      <span className="hidden md:block" />

      {/* Sheet de navegação mobile */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" showCloseButton className="w-64 p-0 pt-0 flex flex-col">
          <div className="px-5 py-4 flex items-center gap-2 border-b">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[#0f172a]">
              <span className="text-[9px] font-black tracking-tight text-white">VeP</span>
            </div>
            <span className="text-base font-bold tracking-tight text-[#0f172a]">VeP Finance</span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <NavLinks onItemClick={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Avatar + dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="relative h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors outline-none">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium truncate">{userName ?? 'Usuário'}</span>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
