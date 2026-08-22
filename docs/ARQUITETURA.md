# Arquitetura Técnica

Projeto: Atelier Daniel Detomi — Arte e Natureza  
Responsável técnico: VyteTech Solutions LTDA

## Visão Geral

A aplicação combina site público, painel administrativo protegido e backend próprio em um projeto TypeScript.

Stack principal:

- Frontend: React, Vite, TypeScript, Tailwind CSS e React Router.
- Backend: Hono, tRPC e Node.js.
- Banco de dados: PostgreSQL com Drizzle ORM.
- Estado remoto no frontend: TanStack Query via tRPC.
- Deploy previsto: Render ou ambiente Node compatível.

## Fluxo De Requisição

1. O usuário acessa uma rota pública ou administrativa.
2. O frontend React renderiza a página correspondente.
3. Dados dinâmicos são buscados por tRPC.
4. O backend valida contexto, permissões e entrada.
5. O Drizzle executa operações no PostgreSQL.
6. A resposta retorna tipada para o frontend.

## Estrutura Principal

```text
api/          Backend, routers tRPC, autenticação e contexto.
contracts/    Contratos compartilhados entre frontend e backend.
db/           Schema Drizzle, migrations, seed e traduções iniciais.
public/       Assets públicos versionados.
scripts/      Scripts operacionais.
src/          Aplicação React.
```

## Módulos Públicos

- Home
- O Artista
- Obras
- Galeria
- Exposições
- Tiradentes
- Detalhe de obra
- Espaço de Café

O menu público é dinâmico em pontos específicos. O Espaço de Café só aparece quando está ativo e possui conteúdo publicado.

## Módulos Administrativos

- Obras
- Imagens
- Textos
- Design
- Seções
- Idiomas
- Cupom
- Promoções
- Entrega
- Espaço de Café
- Usuários

Rotas administrativas dependem de sessão válida e perfil administrativo.

## Internacionalização

Locales internos:

```text
pt
en
es
ar
```

Camadas de tradução:

- Dicionários estáticos em `src/lib/i18n.tsx` e `src/lib/adminI18n.ts`.
- Textos editáveis em `site_texts` e `site_text_translations`.
- Obras em `works` e `work_translations`.
- Espaço de Café em `drafts` e `draft_translations`.

Regra importante: conteúdo ausente em `en`, `es` ou `ar` não deve cair silenciosamente para português quando for conteúdo editorial editável.

## Espaço De Café

Tabelas:

- `drafts`: item base, tipo, conteúdo, descrição PT/base, anotação interna e estado de publicação.
- `draft_translations`: traduções por `draftId` e `locale`.

Campos públicos:

- `id`
- `type`
- `title`
- `content`
- `description`
- `updatedAt`

Campos privados:

- `note`
- dados administrativos auxiliares

Regras:

- `published = false`: não aparece publicamente.
- `published = true`: pode aparecer publicamente.
- `cafe.enabled = false`: módulo oculto.
- `cafe.enabled = true` sem itens publicados: menu e página pública não exibem conteúdo vazio.

## Banco De Dados

Schema central em:

```text
db/schema.ts
```

Migrations em:

```text
db/migrations/
```

Regras:

- Não editar migrations antigas já aplicadas.
- Para alterações estruturais, editar `db/schema.ts` e executar `npm run db:generate`.
- Revisar a migration gerada antes de aplicar.
- Aplicar com `npm run db:migrate` somente no ambiente correto.

## Segurança

- Senhas administrativas são armazenadas como hash.
- Sessões usam cookie HttpOnly.
- Rotas administrativas validam autenticação e autorização no backend.
- Secrets ficam em variáveis de ambiente.
- A API pública não retorna anotações internas nem dados administrativos desnecessários.

