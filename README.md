# CLIENT-ARTE-E-NATUREZA

Site institucional e painel administrativo do Atelier Daniel Detomi - Arte e Natureza.

O projeto usa frontend React/Vite, backend Hono + tRPC e persistencia em PostgreSQL via Drizzle ORM. A versao atual nao usa MySQL, Kimi ou OAuth externo.

## Funcionalidades

- Site publico responsivo com paginas de Home, Artista, Obras, Galeria, Exposicoes, Tiradentes e detalhe de obra.
- Conteudo dinamico vindo do banco para obras, textos e configuracoes.
- Painel administrativo protegido por login proprio de administrador.
- Gestao administrativa de obras, imagens/uploads, textos, design, secoes, idiomas, cupom, promocoes, entrega, Espaco de Cafe e usuarios.
- Autenticacao por e-mail e senha, com senha armazenada como hash e sessao em cookie HttpOnly.
- Internacionalizacao em portugues, ingles, espanhol e arabe, com suporte a idiomas habilitados/desabilitados pelo painel.
- Cupom global com ativacao por obra.
- Promocao de compra com valor minimo configuravel.
- Uploads salvos no banco PostgreSQL para nao depender do filesystem efemero do Render.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- tRPC
- Hono
- Drizzle ORM
- PostgreSQL (`pg`)
- Render PostgreSQL em producao

## Requisitos

- Node.js 20+
- npm
- PostgreSQL para persistencia local ou producao

## Variaveis De Ambiente

Use `.env.example` como referencia.

```env
SESSION_SECRET=
DATABASE_URL=
PORT=3000
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Descricao:

- `DATABASE_URL`: obrigatoria em producao e para painel/admin/persistencia. Formato PostgreSQL:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

- `SESSION_SECRET`: obrigatoria em producao. Em desenvolvimento, se ausente, o backend usa um segredo temporario local.
- `PORT`: opcional. Usada no `npm start`; padrao `3000`.
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: usadas somente para criar o primeiro administrador com `npm run admin:create`.

Nao coloque credenciais reais no repositorio.

## Instalacao Local

```bash
npm install
```

Crie um `.env` local com, no minimo, `DATABASE_URL` se for usar painel, banco e persistencia.

Depois execute as migrations:

```bash
npm run db:migrate
```

Opcionalmente, popule o conteudo inicial idempotente:

```bash
npm run db:seed
```

Crie o primeiro administrador:

```bash
ADMIN_NAME="Administrador" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="senha-forte" npm run admin:create
```

No Windows PowerShell:

```powershell
$env:ADMIN_NAME="Administrador"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="senha-forte"
npm run admin:create
```

## Desenvolvimento

```bash
npm run dev
```

A aplicacao local roda em:

```text
http://localhost:3000
```

Rotas principais:

- `/`
- `/artista`
- `/obras`
- `/galeria`
- `/exposicoes`
- `/tiradentes`
- `/obra/:slug`
- `/login`
- `/admin`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run check
npm run lint
npm run test
npm run admin:create
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:seed
```

### Banco

- `npm run db:generate`: gera migration Drizzle a partir do schema.
- `npm run db:migrate`: aplica migrations no banco configurado em `DATABASE_URL`.
- `npm run db:push`: sincroniza schema diretamente; use com cuidado.
- `npm run db:seed`: insere conteudo inicial ausente sem apagar registros existentes.

## Autenticacao Administrativa

O login administrativo e proprio da aplicacao.

Fluxo:

1. Administrador acessa `/login`.
2. Backend valida e-mail e senha.
3. Senha e comparada com `passwordHash`.
4. Sessao e criada no backend.
5. Cookie HttpOnly e enviado ao navegador.
6. Rotas administrativas validam autenticacao e perfil `admin` no backend.

Nao existe login Kimi, OAuth Kimi, `APP_ID`, `APP_SECRET`, `KIMI_AUTH_URL`, `KIMI_OPEN_URL`, `VITE_KIMI_AUTH_URL` ou `VITE_APP_ID`.

## Primeiro Administrador

Para banco vazio, configure temporariamente:

```env
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Execute:

```bash
npm run admin:create
```

O comando e idempotente:

- se o e-mail nao existir, cria o administrador;
- se o e-mail ja existir, nao duplica e finaliza com sucesso.

Depois do primeiro acesso, novos administradores podem ser gerenciados pelo painel em:

```text
Admin -> Usuarios
```

## Conteudo Inicial

O seed de conteudo e idempotente e nao apaga dados:

```bash
npm run db:seed
```

Ele insere somente registros ausentes, preservando edicoes feitas pelo painel.

## Status De Obras

Os status internos canonicos sao:

```text
available
sold
reserved
unavailable
```

A traducao acontece somente na camada de apresentacao. Valores legados em portugues sao normalizados por compatibilidade.

## Deploy No Render

### Build Command

```bash
npm install && npm run build
```

### Start Command normal

```bash
npm start
```

### Variaveis no Render

Configure:

```env
DATABASE_URL=
SESSION_SECRET=
```

`DATABASE_URL` deve ser a connection string PostgreSQL fornecida pelo Render.

### Aplicar migrations

Como o plano gratuito do Render pode nao ter shell, use temporariamente o Start Command:

```bash
npm run db:migrate && npm start
```

Depois que as migrations forem aplicadas com sucesso, volte para:

```bash
npm start
```

### Criar primeiro administrador no Render Free

Configure temporariamente:

```env
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Use temporariamente o Start Command:

```bash
npm run admin:create && npm start
```

Depois que o administrador for criado, volte para:

```bash
npm start
```

### Popular conteudo inicial no Render Free

Para inserir obras/textos iniciais ausentes:

```bash
npm run db:seed && npm start
```

Depois volte para:

```bash
npm start
```

## Estrutura Principal

```text
api/
  admin-router.ts
  auth-router.ts
  cafe-router.ts
  content-router.ts
  boot.ts
  context.ts
  queries/
  lib/
contracts/
db/
  schema.ts
  relations.ts
  seed.ts
  migrations/
public/
  images/
  videos/
src/
  components/
  hooks/
  lib/
  pages/
scripts/
  create-admin.ts
```

## Validacao

Antes de publicar alteracoes:

```bash
npm run check
npm run build
```

Quando houver alteracao de schema:

```bash
npm run db:generate
```

Depois aplique a migration no ambiente correto:

```bash
npm run db:migrate
```

## Observacoes De Producao

- Nao versionar `.env`, `.env.local`, `.env.production`, `node_modules`, `dist` ou caches locais.
- Nao depender do filesystem local do Render para uploads permanentes.
- Nao editar migrations ja aplicadas em producao; gere sempre uma migration incremental.
- Nao inserir senhas administrativas em codigo, migration, seed ou README.
