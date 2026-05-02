---
name: vepfinance-design
description: Use this skill to generate well-branded interfaces and assets for VeP Finance, a Brazilian personal finance web app (formerly FinControl). Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping or production code.
user-invocable: true
---

Read the README.md file within this skill folder, and explore the other available files before starting any work.

## Quick reference
- **Font**: Inter (all weights)
- **Primary color**: `#0f172a` (near-black) — buttons, active nav, headings
- **Income**: `#10b981` green | **Expense**: `#ef4444` red | **Balance+**: `#3b82f6` blue
- **Card style**: `rounded-xl border bg-card p-5` (Tailwind) — 14px radius, white bg, border
- **List item**: `rounded-lg border bg-background px-4 py-3`
- **Progress**: emerald < 60% → yellow 60–79% → amber 80–99% → red ≥ 100%
- **Language**: Brazilian Portuguese throughout
- **Icons**: Lucide React, stroke-only, `h-4 w-4` in nav, `h-5 w-5` in lists
- **Numbers**: always `tabular-nums`, formatted with `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`

## Files available
- `README.md` — full brand context, content fundamentals, visual foundations
- `colors_and_type.css` — all CSS vars, semantic aliases, type roles
- `assets/logo.svg` — VeP Finance wordmark SVG
- `ui_kits/fincontrol/` — React UI kit (Dashboard, Transações, Cartões, Orçamentos, Metas, Categorias, Contas Fixas)
- `preview/` — HTML design system cards for reference

## If creating visual artifacts (slides, mocks, prototypes)
Copy assets out and create static HTML files. Use Inter from Google Fonts CDN.

## If working on production code (Next.js + Tailwind + shadcn)
Read the existing component files to understand the patterns, then apply the design tokens from this skill. The project uses shadcn/ui — prefer its components when available.

## If the user invokes this skill without other guidance
Ask what they want to build or improve, ask a few focused questions about the screen/component in question, then act as an expert product designer who outputs either HTML prototypes or production-ready TSX code depending on the need.
