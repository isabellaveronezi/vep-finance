'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const GRUPOS: { label: string; emojis: string[] }[] = [
  {
    label: 'Finanças',
    emojis: ['💰','💵','💴','💶','💷','💸','💳','🏦','📊','📈','📉','💹','🪙','💎','🏧','🧾','📑','🤑'],
  },
  {
    label: 'Alimentação',
    emojis: ['🍔','🍕','🍜','🍣','🥗','🛒','☕','🧃','🍺','🍷','🥩','🍗','🥐','🧁','🍦','🍱','🥡','🫕'],
  },
  {
    label: 'Transporte',
    emojis: ['🚗','✈️','🚌','🚕','⛽','🚲','🛵','🚢','🚂','🚁','🛺','🚐','🛻','🏎️','🛞','🗺️','🧳','🅿️'],
  },
  {
    label: 'Casa',
    emojis: ['🏠','🏡','🔧','💡','📱','🖥️','🛋️','🪴','🔑','🚿','🛁','🪣','🧹','🧺','📦','🪟','🚪','🛏️'],
  },
  {
    label: 'Saúde',
    emojis: ['🏥','💊','🏋️','🧘','🩺','💅','💆','🦷','🩻','🩹','💉','🧬','🥦','🏃','🧴','🪥','😷','❤️'],
  },
  {
    label: 'Lazer',
    emojis: ['🎬','🎮','📚','🎵','🎭','🎯','🎪','🎲','🎸','🎨','📷','🎤','🎧','🏖️','⛺','🎡','🎢','🏄'],
  },
  {
    label: 'Compras',
    emojis: ['👗','👟','👜','💄','🛍️','🎁','👒','🕶️','👔','💍','⌚','🧥','👠','🧢','🪮','🛒','🧸','🪆'],
  },
  {
    label: 'Educação',
    emojis: ['📝','🎓','📖','🖊️','🧪','🔬','🏫','📐','📏','🖍️','🧮','💻','🔭','📡','🗂️','📋','📌','✏️'],
  },
  {
    label: 'Pets',
    emojis: ['🐶','🐱','🐠','🐰','🦜','🐹','🦮','🐈','🐾','🦴','🐟','🦎','🐇','🐢','🦜','🪺','🏡','❤️'],
  },
  {
    label: 'Trabalho',
    emojis: ['💼','🖥️','📅','📋','🤝','📞','🖨️','💡','📧','🗒️','📊','🏢','🔐','🧑‍💻','📌','📎','✂️','🗃️'],
  },
]

interface EmojiPickerProps {
  value:    string | null | undefined
  onChange: (emoji: string) => void
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [grupo, setGrupo] = useState(0)

  return (
    <div className="space-y-2">
      {/* Tabs de grupos */}
      <div className="flex flex-wrap gap-1">
        {GRUPOS.map((g, i) => (
          <button
            key={g.label}
            type="button"
            onClick={() => setGrupo(i)}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-medium transition-colors',
              grupo === i
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Grid de emojis */}
      <div className="grid grid-cols-9 gap-1 rounded-lg border p-2 bg-muted/30">
        {GRUPOS[grupo].emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-muted',
              value === emoji && 'bg-primary/10 ring-1 ring-primary'
            )}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Preview do selecionado */}
      {value && (
        <p className="text-xs text-muted-foreground">
          Selecionado: <span className="text-base">{value}</span>
          <button
            type="button"
            onClick={() => onChange('')}
            className="ml-2 underline hover:no-underline"
          >
            limpar
          </button>
        </p>
      )}
    </div>
  )
}
