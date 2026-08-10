## Why

O bioma.sh está pronto para ser usado por quem o escreveu e não está pronto para receber ninguém. Um clone hoje traz 48 MB de `node_modules` versionado, um design system de terceiro com licença `UNLICENSED` copiado para dentro, nenhuma licença própria, nenhuma automação que reprove uma mudança quebrada, e nenhum contrato que diga a um colaborador (humano ou agente) o que é obrigatório antes de propor mudança.

Nada disso é falha de código: o produto funciona de ponta a ponta. É falta do que separa um repositório pessoal de um repositório público. E dois desses pontos são impeditivos legais ou de segurança, não estéticos: sem licença, ninguém pode usar nem contribuir com segurança jurídica; com `@refy/ui` UNLICENSED dentro da árvore, publicar redistribui código de terceiro sem autorização.

## What Changes

- **BREAKING**: `tela/app/node_modules` sai do versionamento. Quem clona passa a rodar `npm ci` antes de construir a tela.
- **BREAKING**: `tela/refy-ui` deixa de ser cópia versionada. O design system entra por dependência declarada, com licença resolvida, ou é substituído pela camada mínima própria.
- Licença do bioma.sh escolhida e escrita, com cabeçalho de terceiros onde houver.
- Contrato de trabalho para agentes (`AGENTS.md`) e mapa para humanos (`CONTRIBUTING.md`), com a regra de evidência que já governa este projeto na prática.
- Automação que reprova antes de mergear: lint de Python, prova da tela em navegador, geração de árvore de referência e comparação com o esperado.
- Diagnóstico de ambiente no comando e no revisor, para o colaborador saber em segundos o que falta na máquina dele.
- Documentação de instalação real: versões exigidas, dependências do sistema, o que é opcional e o que bloqueia.
- Os documentos internos espalhados (`CONTRATO-TELA.md`, `CONTRATO-TELA-2.md`, `MODELO-DOMINIOS.md`, `PRODUCT.md`, `DESIGN.md`) reorganizados em `docs/`, com o que é decisão virando registro datado.

## Capabilities

### New Capabilities

- `repositorio-publico`: o que um clone precisa carregar, o que nunca entra no versionamento, e o que a automação reprova.

### Modified Capabilities

Nenhuma: o produto não muda de comportamento neste change. O que muda é o que viaja no clone e o que barra uma mudança ruim.

## Impact

- Quem já usa o repositório localmente precisa rodar `npm ci` uma vez depois do merge, porque `node_modules` deixa de vir junto.
- O `tela/estatico` (build da tela) continua versionado por decisão explícita, para que rodar a tela não exija Node. Isso é registrado em `design.md`, não é acidente.
- O histórico do Git guarda os 48 MB mesmo depois da remoção. Reescrever histórico é decisão separada, tratada em `design.md`.
