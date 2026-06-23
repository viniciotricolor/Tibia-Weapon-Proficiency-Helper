# Tibia Weapon Proficiency Helper

Site de consulta para o sistema de Weapon Proficiency do MMORPG Tibia.

## Funcionalidades

- **Listagem de Armas** - 43 armas com dados reais da TibiaWiki BR
- **Filtros** - Busca por perks, tipo de arma, vocacao, slot de mao
- **Detalhe de Armas** - Todos os perks por tier com valores exatos
- **Simulador** - Monte sua build e veja o resumo de stats
- **Modificacao de Perks** - Sistema de modify/refine/reshape com custo de dust
- **Changelog** - Historico de versoes do Tibia com mudancas em armas

## Rotas

| Rota | Descricao |
|------|-----------|
| `/` | Home com busca e destaques |
| `/weapons` | Listagem com filtros |
| `/weapons/[slug]` | Detalhe da arma |
| `/simulator` | Simulador de proficiencia |
| `/changelog` | Historico de versoes |

## Stack

- Next.js 14 (App Router)
- TypeScript strict
- Tailwind CSS v3
- shadcn/ui + Radix UI
- Motion (framer-motion v12)
- Lucide React

## Instalacao

```bash
npm install
npm run dev
```

## Deploy

O projeto esta configurado para deploy automatico no Vercel.

## Dados

Todos os dados de armas e perks sao extraidos da [TibiaWiki BR](https://tibiawiki.com.br).

## Licenca

Projeto educacional. Tibia e propriedade da CipSoft GmbH.
