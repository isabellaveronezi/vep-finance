# FinControl — Contexto do Projeto

## O que é este arquivo
Este arquivo serve como contexto principal para o desenvolvimento do FinControl no VSCode (via GitHub Copilot, Cursor ou qualquer LLM integrado ao editor). Leia este arquivo antes de gerar qualquer código.

---

## Visão geral do produto

**FinControl** é um sistema de finanças pessoais web que substitui uma planilha fragmentada por um painel centralizado. O sistema permite registrar lançamentos, controlar cartões de crédito, contas fixas, orçamentos por categoria, metas financeiras e alertas automáticos — com integração futura com WhatsApp.

**Usuário alvo:** uso pessoal, single-user no MVP.

---

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14+ com App Router |
| Linguagem | TypeScript (strict) |
| Estilização | Tailwind CSS |
| Componentes | shadcn/ui |
| ORM | Prisma |
| Banco de dados | PostgreSQL (via Docker local, Neon em produção) |
| Autenticação | NextAuth.js v5 (Auth.js) |
| Gráficos | Recharts |
| Validação | Zod + React Hook Form |
| Ícones | Lucide React |
| Datas | date-fns |
| Deploy | Vercel (app) + Neon (banco) |

---

## Ambiente de desenvolvimento

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 20+
- pnpm (gerenciador de pacotes preferido)

### Serviços Docker
O ambiente local sobe via Docker Compose com os seguintes serviços:

- **postgres** — banco principal na porta 5432
- **adminer** — interface web para o banco na porta 8080 (opcional, útil no dev)

---

## Estrutura de pastas

```
fincontrol/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (app)/
│   │   ├── layout.tsx               ← layout com sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── transacoes/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── categorias/
│   │   │   └── page.tsx
│   │   ├── cartoes/
│   │   │   └── page.tsx
│   │   ├── contas-fixas/
│   │   │   └── page.tsx
│   │   ├── orcamentos/
│   │   │   └── page.tsx
│   │   ├── metas/
│   │   │   └── page.tsx
│   │   ├── alertas/
│   │   │   └── page.tsx
│   │   └── configuracoes/
│   │       └── page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       └── webhooks/
│           └── whatsapp/route.ts     ← fase 3
├── components/
│   ├── ui/                           ← gerados pelo shadcn
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── dashboard/
│   │   ├── resumo-cards.tsx
│   │   ├── grafico-categorias.tsx
│   │   ├── lista-alertas.tsx
│   │   └── cartoes-resumo.tsx
│   ├── transacoes/
│   │   ├── lista-transacoes.tsx
│   │   └── form-transacao.tsx
│   ├── cartoes/
│   │   ├── card-cartao.tsx
│   │   └── tabela-cartoes.tsx
│   ├── contas-fixas/
│   │   └── lista-contas-fixas.tsx
│   └── shared/
│       ├── badge-status.tsx
│       ├── valor-formatado.tsx
│       └── barra-progresso.tsx
├── lib/
│   ├── db.ts                         ← singleton do Prisma Client
│   ├── auth.ts                       ← config do NextAuth
│   ├── utils.ts                      ← cn(), formatCurrency(), etc.
│   └── validations/
│       ├── transacao.ts
│       ├── cartao.ts
│       └── conta-fixa.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
│   └── index.ts                      ← tipos globais do domínio
├── hooks/
│   ├── use-transacoes.ts
│   └── use-dashboard.ts
├── docker-compose.yml
├── .env.local
├── .env.example
└── context.md                        ← este arquivo
```

---

## Docker — setup inicial

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: fincontrol_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: fincontrol
      POSTGRES_PASSWORD: fincontrol123
      POSTGRES_DB: fincontrol_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U fincontrol -d fincontrol_dev']
      interval: 10s
      timeout: 5s
      retries: 5

  adminer:
    image: adminer:latest
    container_name: fincontrol_adminer
    restart: unless-stopped
    ports:
      - '8080:8080'
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
```

### Comandos para subir o ambiente

```bash
# 1. Subir os containers
docker compose up -d

# 2. Verificar se estão rodando
docker compose ps

# 3. Ver logs do postgres
docker compose logs postgres

# 4. Parar os containers
docker compose down

# 5. Parar e remover volumes (reset total do banco)
docker compose down -v
```

### .env.local

```env
# Banco de dados
DATABASE_URL="postgresql://fincontrol:fincontrol123@localhost:5432/fincontrol_dev"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-um-secret-seguro-aqui"

# App
NEXT_PUBLIC_APP_NAME="FinControl"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### .env.example

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""
NEXT_PUBLIC_APP_NAME="FinControl"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Prisma — schema completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Usuário ──────────────────────────────────────────────

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  transacoes       Transacao[]
  categorias       Categoria[]
  cartoes          Cartao[]
  contasFixas      ContaFixa[]
  orcamentos       Orcamento[]
  metas            Meta[]
  alertas          Alerta[]
  dividasTerceiros DividaTerceiro[]

  @@map("users")
}

// ─── Categoria ────────────────────────────────────────────
// Categorias são totalmente dinâmicas — criadas pelo usuário sem necessidade
// de alteração no banco. "Animais", "Exercícios", "Viagem" são apenas registros
// nesta tabela. Nunca crie tabelas separadas para agrupadores de gasto.

model Categoria {
  id        String   @id @default(cuid())
  nome      String
  tipo      TipoTransacao
  icone     String?
  cor       String?
  ativo     Boolean  @default(true)
  createdAt DateTime @default(now())

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  subcategorias Subcategoria[]
  transacoes    Transacao[]
  orcamentos    Orcamento[]
  contasFixas   ContaFixa[]

  @@map("categorias")
}

model Subcategoria {
  id        String  @id @default(cuid())
  nome      String
  ativo     Boolean @default(true)

  categoriaId String
  categoria   Categoria @relation(fields: [categoriaId], references: [id], onDelete: Cascade)

  transacoes Transacao[]

  @@map("subcategorias")
}

// ─── Cartão ───────────────────────────────────────────────

model Cartao {
  id              String  @id @default(cuid())
  nome            String
  bandeira        String?
  limite          Float?
  diaFechamento   Int
  diaVencimento   Int
  cor             String?
  ativo           Boolean @default(true)
  createdAt       DateTime @default(now())

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  transacoes Transacao[]

  @@map("cartoes")
}

// ─── Transação ────────────────────────────────────────────

model Transacao {
  id             String        @id @default(cuid())
  descricao      String
  tipo           TipoTransacao
  valor          Float
  data           DateTime
  status         StatusTransacao @default(PENDENTE)
  formaPagamento FormaPagamento?
  observacao     String?
  origem         OrigemTransacao @default(MANUAL)
  numeroParcela  Int?
  totalParcelas  Int?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  userId         String
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  categoriaId    String?
  categoria      Categoria?    @relation(fields: [categoriaId], references: [id])

  subcategoriaId String?
  subcategoria   Subcategoria? @relation(fields: [subcategoriaId], references: [id])

  cartaoId       String?
  cartao         Cartao?       @relation(fields: [cartaoId], references: [id])

  dividaId       String?
  divida         DividaTerceiro? @relation(fields: [dividaId], references: [id])

  @@map("transacoes")
}

// ─── Conta Fixa ───────────────────────────────────────────

model ContaFixa {
  id          String  @id @default(cuid())
  descricao   String
  valor       Float
  diaVencimento Int
  recorrente  Boolean @default(true)
  ativo       Boolean @default(true)
  createdAt   DateTime @default(now())

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  categoriaId String?
  categoria   Categoria? @relation(fields: [categoriaId], references: [id])

  @@map("contas_fixas")
}

// ─── Orçamento ────────────────────────────────────────────

model Orcamento {
  id           String   @id @default(cuid())
  valorLimite  Float
  mesAno       String   // formato: "2026-04"
  createdAt    DateTime @default(now())

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  categoriaId String
  categoria   Categoria @relation(fields: [categoriaId], references: [id])

  @@unique([userId, categoriaId, mesAno])
  @@map("orcamentos")
}

// ─── Meta ─────────────────────────────────────────────────

model Meta {
  id            String   @id @default(cuid())
  nome          String
  descricao     String?
  valorObjetivo Float
  valorAtual    Float    @default(0)
  aportesMensal Float?
  prazoEstimado DateTime?
  icone         String?
  ativo         Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("metas")
}

// ─── Alerta ───────────────────────────────────────────────

model Alerta {
  id        String      @id @default(cuid())
  tipo      TipoAlerta
  mensagem  String
  lido      Boolean     @default(false)
  enviado   Boolean     @default(false)
  createdAt DateTime    @default(now())

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("alertas")
}

// ─── Dívida de Terceiro ───────────────────────────────────
// Representa valores que OUTRAS PESSOAS devem a você.
// Cada recebimento parcial gera uma Transacao do tipo ENTRADA
// vinculada a esta dívida via dividaId.
// saldoRestante = valorTotal - valorRecebido (calculado na aplicação)

model DividaTerceiro {
  id             String       @id @default(cuid())
  nomeDevedor    String
  descricao      String?
  valorTotal     Float
  valorRecebido  Float        @default(0)
  vencimento     DateTime?
  status         StatusDivida @default(ABERTA)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  transacoes Transacao[]

  @@map("dividas_terceiros")
}

// ─── Enums ────────────────────────────────────────────────

enum TipoTransacao {
  ENTRADA
  SAIDA
}

enum StatusTransacao {
  PAGO
  PENDENTE
  PARCELADO
}

enum FormaPagamento {
  DINHEIRO
  PIX
  DEBITO
  CREDITO
  BOLETO
  TRANSFERENCIA
}

enum OrigemTransacao {
  MANUAL
  WHATSAPP
  IMPORTACAO
}

enum TipoAlerta {
  ORCAMENTO_80
  ORCAMENTO_90
  ORCAMENTO_100
  VENCIMENTO_CONTA
  CARTAO_LIMITE
  SOBRA_BAIXA
  META_CONCLUIDA
}

enum StatusDivida {
  ABERTA
  RECEBIDA
  PARCIAL
}
```

---

## Comandos Prisma

```bash
# Gerar o client após qualquer mudança no schema
npx prisma generate

# Criar e aplicar migration
npx prisma migrate dev --name init

# Aplicar migrations em produção
npx prisma migrate deploy

# Abrir o Prisma Studio (interface visual do banco)
npx prisma studio

# Rodar o seed
npx prisma db seed
```

---

## Setup inicial do projeto — passo a passo

```bash
# 1. Criar o projeto Next.js
pnpm create next-app@latest fincontrol --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

cd fincontrol

# 2. Instalar dependências principais
pnpm add prisma @prisma/client
pnpm add next-auth@beta
pnpm add zod react-hook-form @hookform/resolvers
pnpm add date-fns
pnpm add recharts
pnpm add lucide-react
pnpm add bcryptjs
pnpm add -D @types/bcryptjs

# 3. Inicializar o Prisma
npx prisma init

# 4. Instalar shadcn/ui
pnpm dlx shadcn@latest init

# 5. Adicionar componentes shadcn necessários
pnpm dlx shadcn@latest add button card input label select badge
pnpm dlx shadcn@latest add dialog sheet tabs table
pnpm dlx shadcn@latest add form dropdown-menu separator
pnpm dlx shadcn@latest add progress alert avatar

# 6. Subir o Docker
docker compose up -d

# 7. Copiar o schema Prisma (ver seção acima) para prisma/schema.prisma

# 8. Rodar a primeira migration
npx prisma migrate dev --name init

# 9. Gerar o client
npx prisma generate

# 10. Iniciar o servidor de desenvolvimento
pnpm dev
```

---

## lib/db.ts — Singleton do Prisma

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

---

## lib/utils.ts — Utilitários base

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function getMesAno(date?: Date): string {
  const d = date ?? new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
```

---

## Convenções de código

### Nomenclatura
- Componentes: PascalCase (`FormTransacao.tsx`)
- Funções e variáveis: camelCase (`formatCurrency`)
- Rotas e pastas: kebab-case (`/contas-fixas`)
- Tipos e interfaces: PascalCase com prefixo descritivo (`TransacaoFormData`)
- Constantes globais: UPPER_SNAKE_CASE (`MAX_PARCELAS`)

### Padrões de Server Actions
```typescript
// app/transacoes/actions.ts
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function criarTransacao(data: TransacaoFormData) {
  // sempre validar com zod antes de salvar
  const parsed = transacaoSchema.safeParse(data)
  if (!parsed.success) throw new Error('Dados inválidos')

  await db.transacao.create({ data: parsed.data })
  revalidatePath('/transacoes')
  revalidatePath('/dashboard')
}
```

### Padrão de componente de página
```typescript
// app/(app)/transacoes/page.tsx
import { db } from '@/lib/db'
import { ListaTransacoes } from '@/components/transacoes/lista-transacoes'

export default async function TransacoesPage() {
  const transacoes = await db.transacao.findMany({
    orderBy: { data: 'desc' },
    include: { categoria: true, cartao: true },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Transações</h1>
      <ListaTransacoes transacoes={transacoes} />
    </div>
  )
}
```

---

## Módulos do MVP — prioridade de desenvolvimento

| Ordem | Módulo | Status |
|---|---|---|
| 1 | Docker + Prisma + NextAuth | 🔧 Setup |
| 2 | Layout base + Sidebar | ⬜ A fazer |
| 3 | Categorias (CRUD) | ⬜ A fazer |
| 4 | Transações (CRUD) | ⬜ A fazer |
| 5 | Dashboard mensal | ⬜ A fazer |
| 6 | Cartões de crédito | ⬜ A fazer |
| 7 | Contas fixas | ⬜ A fazer |
| 8 | Alertas internos | ⬜ A fazer |
| 9 | Orçamentos | ⬜ A fazer |
| 10 | Metas | ⬜ A fazer |
| 11 | WhatsApp (fase 3) | ⬜ Futuro |

---

## Regras de negócio críticas

1. Todo lançamento exige: `data`, `valor`, `tipo` e `categoriaId`
2. Compras em cartão devem ter `cartaoId` preenchido
3. O dashboard sempre filtra pelo mês selecionado (`mesAno`)
4. Alertas não devem ser disparados em duplicidade no mesmo evento
5. Lançamentos criados via WhatsApp devem ter `origem = WHATSAPP`
6. Saldo do mês = soma de ENTRADAS − soma de SAÍDAS com status PAGO
7. Orçamento é por categoria + mês (`@@unique([userId, categoriaId, mesAno])`)
8. `saldoRestante` de dívida = `valorTotal` − `valorRecebido` (calculado na aplicação, nunca salvo no banco)
9. Recebimentos parciais de dívida entram como `Transacao` do tipo `ENTRADA` com `dividaId` preenchido
10. Categorias são dinâmicas — nunca criar tabelas separadas para agrupadores de gasto. "Animais", "Exercícios" e similares são apenas registros em `Categoria`

---

## Referência visual das telas

Telas aprovadas (ver `FinControl_SDD_Telas.pdf`):

- **Dashboard** — renda, despesas, saldo, gasto/dia, alertas, gráfico por categoria, cartões
- **Transações** — lista com busca, filtros por tipo/categoria/status, botão + Novo
- **Categorias** — cards com % do orçamento consumido, separados em fixas e variáveis
- **Orçamentos** — limites mensais por categoria, destaque para próximos do limite
- **Cartões** — cards visuais com limite, utilizado, disponível, fechamento e vencimento
- **Contas Fixas** — lista com status pago/pendente, destaque para pendências
- **Metas** — progresso, aporte mensal, valor faltante, previsão de conclusão
- **Alertas** — central com novos e histórico
- **WhatsApp** — integração com comandos rápidos (fase 3)
- **Configurações** — perfil e preferências de notificação

---

## Variáveis de ambiente necessárias

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | Connection string PostgreSQL |
| `NEXTAUTH_SECRET` | Sim | Secret para assinar tokens JWT |
| `NEXTAUTH_URL` | Sim | URL base da aplicação |
| `NEXT_PUBLIC_APP_NAME` | Não | Nome exibido na UI |
| `WHATSAPP_TOKEN` | Fase 3 | Token da Evolution API |
| `WHATSAPP_INSTANCE` | Fase 3 | Nome da instância WhatsApp |

---

## Observações para o LLM do editor

- Sempre usar **Server Components** por padrão; usar `'use client'` apenas quando necessário (interatividade, hooks)
- Preferir **Server Actions** em vez de API Routes para mutations
- Usar sempre `revalidatePath` após mutations para atualizar o cache
- Validar dados com **Zod** antes de qualquer operação no banco
- Senhas devem ser hasheadas com **bcryptjs** antes de salvar
- Formatar valores monetários sempre com `formatCurrency()` de `@/lib/utils`
- O campo `mesAno` segue o formato `"YYYY-MM"` (ex: `"2026-04"`)
- Sempre usar o singleton `db` de `@/lib/db`, nunca instanciar `PrismaClient` diretamente
- `DividaTerceiro` representa pessoas que devem dinheiro ao usuário — nunca o contrário. Recebimentos são `Transacao` do tipo `ENTRADA`
- Nunca criar tabelas para agrupadores de gasto — usar `Categoria` + `Subcategoria` que são dinâmicas
