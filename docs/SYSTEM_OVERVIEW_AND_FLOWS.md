# Arte e Natureza — mapa técnico e fluxos

**Versão:** 0.1 · **Data:** 2026-11-11 · **Status:** síntese documental sob revisão

## Resumo técnico
Este documento consolida a visão geral descrita no README e a estrutura de diretórios observada na branch principal. Não substitui contratos de API, modelos de dados, diagramas detalhados nem validação de produção.

**Tecnologias indicadas pelo projeto:** React, Hono, tRPC, PostgreSQL, Drizzle, Render.

## Fluxo principal (nível de contexto)
Visitante → React/Vite → conteúdo e catálogo; administrador → login → Hono/tRPC → PostgreSQL e mídia → conteúdo público.

## Diagrama de governança do fluxo
~~~mermaid
flowchart TD
 A[Usuário ou sistema externo] --> B[Interface ou entrada HTTP]
 B --> C[Autenticação e validação quando aplicável]
 C --> D[Serviços e regras de negócio]
 D --> E[(Persistência ou integração)]
 E --> F[Resposta ou evento]
 F --> G[Monitoramento e suporte]
~~~

**Nota:** o diagrama descreve camadas lógicas e não constitui desenho de rede, inventário exaustivo de endpoints nem evidência de controles efetivamente implantados.

## Materiais já presentes
- README.md
- docs/ARQUITETURA.md
- docs/OPERACAO.md

## Pontos de revisão prioritária
Validar permissões administrativas, integridade de conteúdo, recuperação, deploy e autorização para divulgação.

## Fluxo de mudança controlada
1. Registrar necessidade e impacto no escopo.
2. Verificar arquitetura real, dependências e permissões.
3. Criar ADR quando houver escolha arquitetural significativa.
4. Alterar código e documentação na mesma PR.
5. Executar testes pertinentes e registrar evidência, sem declarar PASS antecipadamente.
6. Validar Preview/staging quando aplicável e aprovar deploy.
7. Validar produção, observabilidade e rollback após a publicação autorizada.

## Controle documental
**Owner técnico:** a designar. **Aprovador:** a designar. **Classificação:** pública somente na parte aprovada, sem dados de cliente. **Próxima revisão:** antes do merge ou na próxima mudança material.

Referência: [Governança deste projeto](./GOVERNANCE.md).
