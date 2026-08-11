# Changelog

Todas as mudanças públicas deste repositório entram aqui.

## Não lançado

- Portão de conformidade: a instância declara em `convencoes.json` quais valores
  do catálogo são obrigatórios, e trocar um reprova. Resolve o dilema entre
  receita genérica e garantia regulatória sem chumbar nenhuma das duas.
- `inspecao-egress` ganha `postura_default` (drop|allow). O padrão é `drop`,
  porque errar bloqueando é recuperável e errar liberando não; quem precisa de
  `allow` declara, e a declaração fica no diff.

- Portão de procedência: nenhuma reserva escrita no template consegue passar por
  valor declarado. Pega conta inventada na queda de `get_env` (crua ou dentro de
  um ARN), `dependency` cujo mock alcança o apply, e saída de plano versionada.
- Portão de valor ilustrativo movido para cá: ele confere o ambiente, e não sabe
  nada de instituição nenhuma.
- Portão de preenchimento passa a rodar no pré-voo, onde já devia estar.
- Cardinalidade sai como "sem insumo" quando a pasta de ligações não existe, em
  vez de quebrar com traceback, e acha o catálogo tanto em `catalogo/` quanto em
  `infra/catalogo/` (`BIOMA_LIGACOES` vence os dois).
- `docs/portoes.md` explica os cinco, a diferença entre procedência e
  ilustrativo, e a régua para decidir o que é do framework e o que é da
  instância.

- Troca da licença do repositório para PolyForm Shield 1.0.0.
- Documentação pública em `docs/`: instalação, funcionamento e decisões.
- `./bioma.sh --diagnostico` para conferir pré-requisitos sem tocar em nuvem.
- README refeito com primeiro uso e placeholders de telas.
- Código de conduta, contribuição, segurança e templates revisados.
- Higiene de Git para caches, logs, `.DS_Store` e arquivos locais da tela.
