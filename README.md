# Atelier Daniel Detomi — Arte e Natureza

Site institucional e plataforma administrativa do Atelier Daniel Detomi — Arte e Natureza.

Projeto desenvolvido e mantido tecnicamente pela VyteTech.

## Visão Geral

Aplicação web com site público responsivo, painel administrativo protegido, conteúdo dinâmico e persistência em PostgreSQL.

A arquitetura atual utiliza React/Vite no frontend, Hono + tRPC no backend, Drizzle ORM para acesso a dados e Render como ambiente de hospedagem.

## Funcionalidades

### Site Público

- Home
- Artista
- Obras
- Galeria
- Exposições
- Tiradentes
- Detalhe de obra
- Conteúdo responsivo
- Internacionalização em português, inglês, espanhol e árabe
- Exibição pública de cupom e promoções conforme configuração administrativa

### Painel Administrativo

- Obras
- Textos
- Imagens e uploads
- Design
- Seções
- Idiomas
- Cupom
- Promoções
- Entrega
- Espaço de Café
- Usuários administrativos

### Segurança

- Login próprio da aplicação
- Senhas armazenadas apenas como hash
- Sessão em cookie HttpOnly
- Autorização administrativa validada no backend
- Secrets configurados por variáveis de ambiente

## Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- tRPC Client

### Backend

- Node.js
- Hono
- tRPC

### Dados

- PostgreSQL
- Drizzle ORM
- `pg`

### Infraestrutura

- Render
- Render PostgreSQL

## Requisitos

- Node.js 20 LTS ou versão compatível definida pelo projeto
- npm
- PostgreSQL para persistência local ou produção

Não há `.nvmrc` ou `.node-version` versionado neste repositório.

## Variáveis De Ambiente

Use `.env.example` como referência. Não versionar arquivos `.env` com valores reais.

### Permanentes Em Produção

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | Sim | Connection string PostgreSQL usada pela aplicação e pelo Drizzle. |
| `SESSION_SECRET` | Sim | Segredo usado para assinatura/verificação da sessão administrativa. |

Formato esperado de `DATABASE_URL`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

### Opcional

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `PORT` | Não | Porta usada pelo `npm start`. Padrão: `3000`. |

### Temporárias Para Bootstrap

| Variável | Uso |
| --- | --- |
| `ADMIN_NAME` | Nome do primeiro administrador. |
| `ADMIN_USERNAME` | Nome de usuário do primeiro administrador. |
| `ADMIN_PASSWORD` | Senha inicial do primeiro administrador. |

`ADMIN_NAME`, `ADMIN_USERNAME` e `ADMIN_PASSWORD` devem ser removidas do ambiente de produção após a criação do primeiro administrador.

## Instalação Local

```bash
npm install
```

Crie um `.env` local com `DATABASE_URL` quando for usar banco, painel administrativo e persistência.

Aplicar migrations:

```bash
npm run db:migrate
```

Popular conteúdo inicial idempotente, quando necessário:

```bash
npm run db:seed
```

Criar o primeiro administrador:

```bash
ADMIN_NAME="Administrador" ADMIN_USERNAME="admin" ADMIN_PASSWORD="senha-forte" npm run admin:create
```

No Windows PowerShell:

```powershell
$env:ADMIN_NAME="Administrador"
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="senha-forte"
npm run admin:create
```

## Desenvolvimento

```bash
npm run dev
```

URL local padrão:

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

## Banco De Dados

- `npm run db:generate`: gera migration Drizzle a partir do schema atual.
- `npm run db:migrate`: aplica migrations versionadas no banco definido por `DATABASE_URL`.
- `npm run db:push`: sincroniza schema diretamente; usar apenas em desenvolvimento ou situações controladas.
- `npm run db:seed`: insere conteúdo inicial ausente, sem apagar registros existentes.

Em produção, prefira sempre migrations versionadas:

```text
db:generate -> revisão da migration -> db:migrate
```

Não editar migrations já executadas em produção.

## Autenticação Administrativa

O login administrativo é próprio da aplicação.

Fluxo:

1. Administrador acessa `/login`.
2. Backend valida nome de usuário e senha.
3. Senha é comparada com `passwordHash`.
4. Sessão é criada no backend.
5. Cookie HttpOnly é enviado ao navegador.
6. Rotas administrativas validam autenticação e perfil `admin` no backend.

Depois do primeiro acesso, novos administradores podem ser gerenciados pelo painel em:

```text
Admin -> Usuários
```

## Primeiro Administrador

Para banco vazio, configure temporariamente:

```env
ADMIN_NAME=
ADMIN_USERNAME=
ADMIN_PASSWORD=
```

Execute:

```bash
npm run admin:create
```

O comando é idempotente:

- se o usuário não existir, cria o administrador;
- se o usuário já existir, não duplica e finaliza com sucesso.

Remova as variáveis temporárias após a criação do primeiro administrador.

## Conteúdo Administrativo

Textos, imagens, obras, preços, promoções e demais conteúdos cadastrados pelo painel administrativo são persistidos no ambiente de produção e ficam sob responsabilidade do administrador autorizado do site.

Alterações feitas pelo painel não exigem modificação do código-fonte, salvo quando houver mudança estrutural da aplicação.

## Conteúdo Inicial

O seed de conteúdo é idempotente e não apaga dados:

```bash
npm run db:seed
```

Ele insere somente registros ausentes, preservando edições feitas pelo painel.

## Status De Obras

Os status internos canônicos são:

```text
available
sold
reserved
unavailable
```

A tradução acontece somente na camada de apresentação. Valores legados em português são normalizados por compatibilidade.

## Uploads

Uploads persistentes são armazenados no PostgreSQL da aplicação e não dependem do filesystem efêmero da instância de aplicação.

Arquivos estáticos versionados continuam em `public/`.

## Segurança

- Credenciais e secrets não devem ser versionados.
- Senhas administrativas são armazenadas apenas como hash.
- Sessões administrativas usam cookie HttpOnly.
- A autorização administrativa é validada no backend.
- Secrets de produção devem ser configurados somente no provedor de infraestrutura.
- Migrations devem ser versionadas e revisadas antes de aplicação.
- Não há credenciais hardcoded no código-fonte.

## Produção

- Código-fonte versionado em repositório privado.
- Deploy conectado ao repositório no provedor de hospedagem.
- Banco PostgreSQL separado da instância da aplicação.
- Secrets configurados via environment variables.
- Domínio configurado via DNS.
- HTTPS gerenciado pelo provedor de hospedagem.

## Deploy No Render

Ambiente atual de hospedagem: Render.

Banco atual: PostgreSQL gerenciado.

### Build Command

```bash
npm ci && npm run build
```

O projeto possui `package-lock.json`; por isso, `npm ci` é recomendado para instalação reproduzível em produção.

### Start Command Permanente

```bash
npm start
```

### Comandos Temporários De Operação

Alguns planos/ambientes podem não disponibilizar shell interativo. Nesses casos, os comandos abaixo podem ser usados temporariamente como Start Command para executar uma operação e iniciar a aplicação em seguida.

Aplicar migrations:

```bash
npm run db:migrate && npm start
```

Criar primeiro administrador:

```bash
npm run admin:create && npm start
```

Popular conteúdo inicial:

```bash
npm run db:seed && npm start
```

Após concluir a operação, volte o Start Command permanente para:

```bash
npm start
```

## Backup E Continuidade

O código-fonte é versionado em repositório privado.

Os dados dinâmicos são persistidos em PostgreSQL.

Políticas de backup, retenção e recuperação do banco dependem dos recursos contratados no provedor de infraestrutura.

## Estrutura Principal

```text
api/
contracts/
db/
public/
src/
scripts/
```

Diretórios principais:

- `api/`: backend, routers, contexto, autenticação e integração tRPC.
- `contracts/`: tipos e contratos compartilhados.
- `db/`: schema Drizzle, relações, seed e migrations.
- `public/`: assets estáticos versionados.
- `src/`: frontend React.
- `scripts/`: scripts operacionais, como criação do primeiro administrador.

## Validação Antes De Publicar

Antes de publicar alterações:

```bash
npm run check
npm run build
```

Quando houver alteração de schema:

```bash
npm run db:generate
```

Revise a migration gerada antes de aplicar.

Depois aplique no ambiente correto:

```bash
npm run db:migrate
```

Não aplicar migration diretamente em produção sem revisão da migration gerada.

## Observações De Produção

- Não versionar `.env`, `.env.local`, `.env.production`, `node_modules`, `dist` ou caches locais.
- Não editar migrations já aplicadas em produção.
- Não inserir senhas administrativas em código, migration, seed ou documentação.
