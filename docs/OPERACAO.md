# Operação E Manutenção

Projeto: Atelier Daniel Detomi — Arte e Natureza  
Responsável técnico: VyteTech Solutions LTDA

## Rotina Local

Instalar dependências:

```bash
npm install
```

Rodar em desenvolvimento:

```bash
npm run dev
```

URL local padrão:

```text
http://localhost:5173
```

Validar antes de entrega:

```bash
npm run i18n:check
npm run check
npm run build
```

## Variáveis De Ambiente

Use `.env.example` como base.

Obrigatórias em produção:

```env
DATABASE_URL=
SESSION_SECRET=
```

Temporárias para criação do primeiro administrador:

```env
ADMIN_NAME=
ADMIN_USERNAME=
ADMIN_PASSWORD=
```

Remover ou limpar variáveis temporárias após uso.

## Primeiro Deploy

Ordem recomendada:

1. Configurar `DATABASE_URL` e `SESSION_SECRET`.
2. Executar migrations.
3. Executar seed inicial, se necessário.
4. Criar primeiro administrador.
5. Voltar o start command para o comando permanente.

Comando permanente:

```bash
npm start
```

## Migrations

Gerar migration:

```bash
npm run db:generate
```

Aplicar migration:

```bash
npm run db:migrate
```

Regras:

- Nunca aplicar migration em produção sem revisar o SQL.
- Nunca editar migration antiga já aplicada.
- Não usar `db:push` em produção.

## Seed

Executar seed:

```bash
npm run db:seed
```

O seed foi desenhado para preservar conteúdo existente e inserir registros ausentes. Mesmo assim, revisar mudanças antes de rodar em produção.

## Backup

O conteúdo dinâmico do site fica no PostgreSQL.

Antes de mudanças estruturais:

- Gerar backup do banco.
- Validar migration em ambiente de teste ou staging quando disponível.
- Registrar data, responsável e comando executado.

## Checklist De Entrega

Antes de publicar:

- `npm run i18n:check`
- `npm run check`
- `npm run build`
- Revisão visual desktop.
- Revisão visual mobile.
- Teste de login admin.
- Teste das rotas públicas principais.
- Teste de conteúdo multilíngue quando a alteração envolver idiomas.

## Troubleshooting

### Build falha por tipagem

Rodar:

```bash
npm run check
```

Corrigir o primeiro erro real apresentado pelo TypeScript.

### Admin não autentica

Verificar:

- `DATABASE_URL`
- `SESSION_SECRET`
- usuário ativo
- role administrativa
- cookies do navegador

### Conteúdo público não atualiza

Verificar:

- se o item está publicado;
- se a seção está ativa;
- se o idioma atual possui tradução cadastrada;
- se a query foi invalidada no painel após salvar.

### Espaço de Café não aparece

Verificar:

- `cafe.enabled = true`;
- pelo menos um item publicado;
- conteúdo público preenchido no idioma selecionado.

