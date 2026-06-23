# Tibia Weapon Proficiency Helper

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)

Site de consulta para o sistema de **Weapon Proficiency** do MMORPG Tibia.  
Dados reais de **665 armas** extraidos automaticamente da [TibiaWiki BR](https://tibiawiki.com.br).

## Funcionalidades

| Feature | Descricao |
|---------|-----------|
| **665 Armas** | Todas as armas com proficiencia do Tibia, dados atualizados via scraper |
| **Busca Inteligente** | Busca por nome, tipo, vocacao, monstro ou categoria bestiaria |
| **Filtros Avancados** | 9 tipos, 5 vocations, 50+ familias, 28 bosses, 23 bestiarios |
| **URL Serializada** | Filtros persistem na URL — compartilhe buscas como links |
| **Favoritos** | Salve armas favoritas no localStorage |
| **Paginacao** | 36 armas por pagina com navegacao intuitiva |
| **Simulador** | Monte builds, modifique perks, veja resumo de stats |
| **Exportar Build** | Copie build formatada como texto para compartilhar |
| **Comparar** | Compare ate 3 armas lado a lado |
| **Best in Slot** | Melhor arma por vocation e faixa de nivel |
| **Armas Similares** | No detalhe, veja armas do mesmo tipo/vocation |
| **i18n** | Suporte a ingles e portugues (botao Globe no header) |
| **Dark/Light Mode** | Tema claro e escuro |
| **Changelog** | Historico de versoes do Tibia com mudancas em armas |
| **Update Notifier** | Notificacao quando novos dados estao disponiveis |

## Rotas

| Rota | Descricao |
|------|-----------|
| `/` | Home com busca, destaques e perks populares |
| `/weapons` | Listagem com filtros, stats agregados e paginacao |
| `/weapons/[slug]` | Detalhe da arma com favoritos e armas similares |
| `/simulator` | Simulador de proficiencia com modify/refine/reshape |
| `/compare` | Comparacao lado a lado de ate 3 armas |
| `/best-in-slot` | Melhor arma por vocation e nivel |
| `/changelog` | Historico de versoes do Tibia |

## Stack

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript strict
- **Estilo:** Tailwind CSS v3
- **Componentes:** shadcn/ui + Radix UI
- **Animacoes:** Motion (framer-motion v12)
- **Icones:** Lucide React
- **Temas:** next-themes

## Instalacao

```bash
# Instalar dependencias
npm install

# Rodar em desenvolvimento
npm run dev

# Build de producao
npm run build
npm start
```

Acesse http://localhost:3000

## Dados

### Atualizar dados do wiki

```bash
npx tsx scripts/fetch-wiki.ts
```

Busca todas as 665 armas com proficiencia no TibiaWiki e atualiza `data/weapons.json`.  
Armas ja existentes sao puladas automaticamente. O scraper extrai:
- Stats (ataque, nivel, vocacao, slot)
- Todos os tiers de perks com valores exatos
- Fonte/boss de drop
- Imagem da arma

### Estrutura dos dados

```
data/
  weapons.json      # 665 armas com perks completos
  changelog.json    # Historico de versoes do Tibia
```

## Deploy

O projeto esta configurado para deploy automatico no Vercel.  
Cada push no branch `main` dispara um build e deploy.

## Licenca

Projeto educacional. Tibia e propriedade da CipSoft GmbH.  
Dados baseados na [TibiaWiki BR](https://tibiawiki.com.br).
