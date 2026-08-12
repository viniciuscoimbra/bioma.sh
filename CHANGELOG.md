# Changelog

Todas as mudanças públicas deste repositório entram aqui.

## Não lançado

- `convencoes.py`: a leitura do `convencoes.json` sai de dentro do `bioma.sh` e
  vira ferramenta, que acha a própria raiz pelo `__file__`. Os três blocos de
  Python embutidos traziam a raiz interpolada pelo shell dentro do fonte, e o
  Git Bash só converte caminho que passa por argv: no Windows o Python nativo
  recebia `/c/Users/...`, resolvia relativo ao drive corrente e não achava nada.
  Como os três engoliam o erro, a árvore anunciava "sem declaração" com a
  declaração escrita ao lado, e as fases de domínio não rodavam nada. Ausência
  do arquivo continua legítima; arquivo presente que não abre agora derruba o
  comando com o motivo.
- `oficina.py`: onde o comando externo roda e o que ele não pode deixar para
  trás. O `terraform validate` sobe o provider da AWS como processo à parte,
  neto de quem chamou, e o `subprocess.run` com timeout matava só o filho: o
  provider ficava sem pai, girando em CPU cheia. Nesta máquina foram vinte
  deles, com trinta e seis horas de CPU cada, e quatrocentas e setenta e nove
  pastas temporárias com nove gigas. Agora o comando nasce em sessão própria e
  morre pelo grupo, a pasta some com o processo, e a execução seguinte varre o
  que o SIGKILL deixou. O portão `oficina` guarda o caso e o contra-caso.
- `hcl_lido.py`: leitura de HCL comum aos portões. Comentário deixa de contar
  como código (um comentário citando `mock_outputs_allowed_terraform_commands`
  escondia um mock que valia no apply) e queda com `${get_env(...)}` dentro
  passa a ser lida inteira, com a variável de dentro também cobrada.
- `conformidade` lê o valor dentro de `inputs`, e não o primeiro do arquivo: um
  `locals` com o mesmo nome aprovava o que o Terraform não ia aplicar.
- `alcance` concede por recurso, e não por par de contas: uma concessão a um
  recurso escondia o uso de todos os outros entre as mesmas duas contas.
- Área declarada no roteiro e ausente na árvore derruba o comando. Enquanto
  devolvia sucesso, um nome errado pulava a área inteira em silêncio.
- O framework para de citar cliente: região, domínios, ambientes de workload,
  baldes de state e sementes de attachment saem de `convencoes.json`.

- Portão de alcance: recurso usado de outra conta sem concessão não aplica.
  Quais receitas formam o par sai de `travessias_de_conta` em `convencoes.json`;
  o verificador não conhece receita pelo nome.
- `ilustrativo` e `alcance` aceitam `--escopo`: leem a árvore toda, cobram só a
  área do comando. Sem isso, aplicar uma área era barrado por defeito de outra.

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
