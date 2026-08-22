# Padrões VyteTech Para Este Projeto

Empresa: VyteTech Solutions LTDA  
Projeto: Atelier Daniel Detomi — Arte e Natureza

## Objetivo

Manter uma base profissional, segura e sustentável para evolução do site e do painel administrativo.

## Princípios De Desenvolvimento

- Entender a stack real antes de alterar.
- Fazer mudanças pequenas, rastreáveis e focadas.
- Preservar dados do cliente.
- Não alterar arquitetura sem necessidade.
- Priorizar segurança, responsividade, acessibilidade e manutenção.
- Validar build e typecheck antes de entregar.

## Padrão Visual

O site deve manter estética editorial, artística e premium:

- fundo creme;
- tipografia editorial;
- vermelho/bordô como destaque;
- uso generoso de espaço;
- imagens grandes e bem apresentadas;
- nada com aparência de dashboard no site público.

O painel administrativo pode usar linguagem operacional, mas a interface pública deve sempre parecer conteúdo final.

## Internacionalização

Todo texto público novo deve considerar:

```text
pt
en
es
ar
```

Regras:

- Não misturar conteúdo PT em páginas EN/ES/AR sem decisão explícita.
- Não retornar anotações internas pela API pública.
- Manter RTL do árabe funcionando na página.
- Manter o seletor de idiomas do header como único seletor público.

## Banco De Dados

- Usar migrations versionadas.
- Não editar migrations antigas.
- Evitar alterações destrutivas.
- Não apagar conteúdo do cliente em seed.
- Criar campos nullable quando necessário para compatibilidade com dados existentes.

## Admin

O painel deve ser claro e previsível para uso não técnico.

Boas práticas:

- Separar descrição pública de anotação interna.
- Usar rótulos objetivos.
- Não expor termos técnicos desnecessários.
- Confirmar ações destrutivas.
- Preservar fluxo simples de criação, edição, publicação e despublicação.

## Commits

Sugestões de prefixo:

```text
feat: nova funcionalidade
fix: correção de comportamento
docs: documentação
refactor: melhoria interna sem mudança funcional
chore: manutenção sem impacto funcional
```

Exemplos:

```bash
git commit -m "docs: atualiza documentação técnica do projeto"
git commit -m "fix: corrige descrição localizada do Espaço de Café"
git commit -m "feat: adiciona publicação editorial ao Café"
```

## Checklist De Qualidade

Antes de entregar:

- Código compila.
- Build passa.
- i18n passa quando houver alteração textual.
- Não há secrets no repositório.
- Funcionalidades existentes continuam preservadas.
- Mudanças de banco têm migration incremental.
- Documentação foi atualizada quando a mudança altera operação, deploy ou uso.

