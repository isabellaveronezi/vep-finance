# FinControl Design System

## O que é este projeto

**FinControl** é um sistema de finanças pessoais web que substitui planilhas fragmentadas por um painel centralizado. Permite registrar lançamentos, controlar cartões de crédito, contas fixas, orçamentos por categoria, metas financeiras e alertas automáticos — com integração futura com WhatsApp.

**Usuário-alvo:** uso pessoal, single-user no MVP.

## Fontes dos recursos

| Recurso | Localização |
|---|---|
| Codebase Next.js | `fincontrol/` (local mount via File System Access API) |
| Figma | Não fornecido |
| Screenshots/PDFs | Não fornecidos |

---

## Produtos

### App Web (fincontrol/)
Aplicação web full-stack com:
- **Dashboard** — renda, despesas, saldo, gasto/dia, gráfico por categoria
- **Transações** — lista com busca, filtros, CRUD
- **Categorias** — cards com % do orçamento consumido
- **Orçamentos** — limites mensais por categoria
- **Cartões** — cards visuais com limite/utilizado/disponível
- **Contas Fixas** — recorrências com status pago/pendente
- **Dívidas** — controle de valores que terceiros devem ao usuário
- **Metas** — progresso, aporte mensal, previsão de conclusão
- **Alertas** — central de notificações
- **Configurações** — perfil e preferências

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Linguagem | TypeScript (strict) |
| Estilização | Tailwind CSS v4 |
| Componentes | shadcn/ui |
| Ícones | Lucide React |
| Gráficos | Recharts |
| Fontes | Geist Sans + Geist Mono (Vercel) |
| ORM | Prisma + PostgreSQL |

---

## CONTENT FUNDAMENTALS

### Idioma
Totalmente em **Português Brasileiro (pt-BR)**. Terminologia financeira nacional: "receitas", "despesas", "saldo", "lançamentos", "cartão de crédito", "parcelas", "boleto", "PIX".

### Tom e voz
- **Direto e funcional** — sem floreios. A UI fala como um assistente financeiro pessoal, não como um banco corporativo.
- **Primeira pessoa do usuário** — "você está no positivo", "você está no negativo"
- **Frases curtas** — labels, tooltips e mensagens de estado são lacônicos
- **Sem emojis** na UI principal. Emojis são usados **somente** como ícones de categoria (ex: 🍔 Alimentação, 🏠 Moradia) — completamente user-defined
- **Casing**: Title Case para nomes de seções e módulos ("Contas Fixas", "Orçamentos"); minúsculas para subtítulos e labels secundários

### Exemplos de copy
- "receita esperada no mês" / "entradas recebidas no mês"
- "você está no positivo" / "você está no negativo"
- "Nenhuma transação encontrada."
- "Clique em 'Registrar gasto' para começar a controlar."
- "Deletar transação?" / "será removida permanentemente."
- "Ver detalhes" / "Ocultar detalhes"
- "Fecha dia 10" / "Vence dia 15"

### Números e moeda
- Sempre formatados com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
- Valores numéricos usam `tabular-nums` para alinhamento visual
- Prefixo `+` para entradas, `−` para saídas nas listas

---

## VISUAL FOUNDATIONS

### Paleta de Cores
O sistema é **majoritariamente acromático** (shadcn/ui default), com cores semânticas reservadas para estados financeiros:

| Papel | Cor / Token | Uso |
|---|---|---|
| Background | `oklch(1 0 0)` branco | Fundo da página e cards |
| Foreground | `oklch(0.145 0 0)` quase-preto | Texto principal |
| Primary | `oklch(0.205 0 0)` preto suave | Botão primário, nav ativo |
| Muted | `oklch(0.97 0 0)` cinza quase-branco | Fundos secundários |
| Muted FG | `oklch(0.556 0 0)` cinza médio | Labels, subtítulos |
| Border | `oklch(0.922 0 0)` cinza claro | Bordas de card e input |
| Destructive | `oklch(0.577 0.245 27.325)` vermelho | Ações destrutivas, erros |
| **Verde** | `#10b981 / bg-green-*` | Receitas, entradas, saldo positivo, "pago" |
| **Vermelho** | `#ef4444 / bg-red-*` | Despesas, saídas, saldo negativo, excedeu limite |
| **Âmbar** | `#f59e0b / bg-amber-*` | Avisos, 80–99% do orçamento |
| **Azul** | `#3b82f6 / bg-blue-*` | Saldo positivo (card dashboard) |
| **Roxo** | `#8b5cf6 / bg-purple-*` | Gasto/dia (card dashboard) |
| **Índigo** | `#6366f1` | Cor padrão no gráfico de categorias |

O modo escuro é suportado — backgrounds e foregrounds invertem; sidebar usa `oklch(0.205 0 0)` no escuro com primary `oklch(0.488 0.243 264.376)` (azul).

### Tipografia
- **Display/Heading**: Geist Sans, `font-bold`, sizes: `text-2xl` (32px) para títulos de página
- **Body**: Geist Sans, `text-sm` (14px), `font-medium` para labels importantes
- **Muted**: `text-xs` (12px), `text-muted-foreground`
- **Mono/Tabular**: Geist Mono, `tabular-nums` — para valores monetários
- **Scale**: 2xl (títulos), sm (body), xs (labels/meta)

### Espaçamento
- Cards: `p-5` (20px padding), `gap-3` ou `gap-4` em grids
- Nav items: `px-3 py-2`
- Seções: `space-y-4` ou `space-y-6`
- Grid responsivo: `sm:grid-cols-2 lg:grid-cols-4` (dashboard cards)

### Cards
- `rounded-xl border bg-card p-5` — cards principais (métricas dashboard)
- `rounded-lg border bg-background px-4 py-3` — itens de lista (transações)
- `rounded-2xl p-5 text-white shadow-md` — cartões de crédito (coloridos com `style={{ backgroundColor: cor }}`)
- Sem sombras pesadas — apenas `shadow-md` nos cartões coloridos

### Bordas e Raios
- `--radius: 0.625rem` (10px) — base
- `rounded-md` (8px) — botões, inputs
- `rounded-lg` (10px) — itens de lista, tooltips
- `rounded-xl` (14px) — cards principais
- `rounded-2xl` (20px) — cards de cartão de crédito
- `rounded-full` — barras de progresso, avatars

### Sidebar / Layout
- Sidebar fixa à esquerda, `w-60`, `border-r`, `bg-background`
- Nav item ativo: `bg-primary text-primary-foreground`
- Nav item inativo: `text-muted-foreground hover:bg-muted hover:text-foreground`
- Ícone + label side-by-side: `gap-3`, ícone `h-4 w-4`
- Brand name no topo: `text-xl font-bold tracking-tight`

### Ícones (Lucide React)
- Tamanho padrão nos nav: `h-4 w-4`
- Tamanho em cards de métrica: `h-4 w-4` dentro de badge `h-8 w-8`
- Tamanho de destaque: `h-5 w-5` ou `h-6 w-6`
- Sem fill — apenas stroke (estilo Lucide padrão)

### Iconezinhos de status financeiro
- `TrendingUp` verde — Receitas
- `TrendingDown` vermelho — Despesas
- `Wallet` azul/laranja — Saldo
- `CalendarDays` roxo — Gasto/dia
- `ArrowUpCircle` verde — entrada em lista
- `ArrowDownCircle` vermelho — saída em lista
- `CreditCard` — cartões
- `ShieldCheck` — teto de orçamento

### Barras de progresso (orçamentos)
- `bg-emerald-500` — < 60% usado
- `bg-yellow-300` — 60–79%
- `bg-amber-400` — 80–99%
- `bg-red-500` — ≥ 100% (excedeu)
- Track: `bg-muted`, `h-2`, `rounded-full`

### Animações
- `transition-colors` em hover states
- `transition-all duration-300` em barras de progresso
- Sem animações de entrada elaboradas — transições sutis apenas
- Sem easing customizado — Tailwind padrão

### Hover / Press states
- Hover em lista: `hover:bg-muted/50`
- Hover em nav: `hover:bg-muted hover:text-foreground`
- Hover em botões ghost: shadcn padrão
- Sem shrink/scale em press

### Gráficos
- Donut chart (Recharts `PieChart`) para categorias
- `innerRadius={60} outerRadius={90}` — forma de donut
- Paleta de cores para fatias: `['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16']`
- "Outros": `#94a3b8`
- Tooltip: `rounded-lg border bg-background px-3 py-2 shadow-md`

### Imagens / Fundos
- Sem imagens de fundo, padrões ou texturas
- Sem gradients decorativos
- Background é sempre branco (light) ou quase-preto (dark)
- Cartões de crédito usam cor sólida definida pelo usuário

---

## ICONOGRAFIA

**Sistema**: Lucide React (`lucide-react`) — ícones de linha (stroke), 24px base, peso `1.5`.

Não há font de ícones embutida. Todos os ícones são componentes SVG React importados individualmente de `lucide-react`.

**Ícones de emoji**: Usados exclusivamente como ícones de categoria financeira pelo usuário (ex: 🛒 Mercado, 🏠 Moradia). São strings salvas no banco em `Categoria.icone`.

**Ícones de navegação**:
- Dashboard → `LayoutDashboard`
- Transações → `ArrowLeftRight`
- Categorias → `Tag`
- Cartões → `CreditCard`
- Contas Fixas → `FileText`
- Dívidas → `TrendingDown`
- Orçamentos → `Wallet`
- Metas → `Target`
- Alertas → `Bell`
- Configurações → `Settings`

Não há assets de ícone separados (SVGs ou PNGs) no projeto — tudo via CDN Lucide.

---

## Arquivos disponíveis

| Arquivo/Pasta | Descrição |
|---|---|
| `README.md` | Este arquivo — contexto completo |
| `colors_and_type.css` | CSS vars de cores, tipografia e tokens |
| `assets/` | Assets visuais (logo SVG, paleta) |
| `preview/` | Cards HTML do Design System |
| `ui_kits/fincontrol/` | UI Kit completo — telas e componentes |
| `SKILL.md` | Skill file para uso com Claude Code |
