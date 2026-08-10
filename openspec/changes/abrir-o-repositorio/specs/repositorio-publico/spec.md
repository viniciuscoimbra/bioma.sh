## ADDED Requirements

### Requirement: O clone carrega só o que é fonte
O repositório SHALL versionar apenas fonte, documentação e o build da tela declarado em design.md. Dependência instalável, cache, estado de execução, segredo e dado da máquina de quem usa NÃO SHALL entrar no versionamento.

#### Scenario: Alguém prepara um commit
- **WHEN** um colaborador ou agente prepara um commit
- **THEN** `tela/app/node_modules/`, `.terraform/`, `*.tfstate`, `.env`, `*.key`, `tela/contas.json`, `projeto.json` e `tela/recentes.json` não são incluídos

#### Scenario: Um clone novo constrói a tela
- **WHEN** alguém clona o repositório e roda `npm ci && npm run build` em `tela/app`
- **THEN** o build termina sem erro e o resultado é idêntico ao que está em `tela/estatico`

### Requirement: Todo código de terceiro tem licença declarada
O repositório SHALL declarar a licença própria em `LICENSE` e, para cada código de terceiro que viaje na árvore, a licença dele e a origem. Código de terceiro sem licença que permita redistribuição NÃO SHALL ser publicado.

#### Scenario: Um design system de terceiro está na árvore
- **WHEN** `tela/refy-ui` (ou qualquer pasta de terceiro) está versionado
- **THEN** existe `tela/refy-ui/LICENSE` com licença que permite redistribuição, e a origem está nomeada em `docs/`

#### Scenario: Alguém quer usar o bioma.sh numa empresa
- **WHEN** a pessoa procura os termos de uso
- **THEN** encontra `LICENSE` na raiz, com licença reconhecida pela OSI ou com os termos escritos por extenso

### Requirement: O contrato de trabalho é único e vale para qualquer agente
O repositório SHALL manter um `AGENTS.md` na raiz como contrato de trabalho, e os arquivos de vendor (`CLAUDE.md` e equivalentes) SHALL apontar para ele em vez de repetir regra.

#### Scenario: Um agente de código abre o repositório pela primeira vez
- **WHEN** o agente lê `CLAUDE.md`
- **THEN** encontra a referência a `AGENTS.md` e nele as regras obrigatórias: prova visual antes de declarar tela pronta, árvore gerada antes de declarar gerador pronto, e o estilo de escrita do projeto

#### Scenario: Uma mudança de tela é declarada pronta
- **WHEN** um agente diz que uma mudança de interface está pronta
- **THEN** existe na mesma entrega a prova em navegador (comando e resultado observável), e não apenas a descrição do que foi feito

### Requirement: A automação reprova mudança quebrada antes do merge
O repositório SHALL executar, a cada proposta de mudança, os portões que provam que o Python compila, que a tela constrói igual ao versionado, que a árvore gerada de referência não mudou sem aviso e que a tela responde.

#### Scenario: Uma mudança altera a saída do gerador
- **WHEN** alguém muda `ferramentas/gerar_iac.py` de um jeito que altera os arquivos gerados
- **THEN** o portão de árvore de referência falha, e a mudança só passa quando a árvore esperada é atualizada no mesmo commit

#### Scenario: Uma mudança na tela é enviada sem construir
- **WHEN** alguém altera `tela/app/src` sem rodar `npm run build`
- **THEN** o portão de build acusa a diferença entre o build e `tela/estatico`

### Requirement: O ambiente é diagnosticado antes de custar tempo
O comando e o revisor SHALL conferir os pré-requisitos da máquina antes de executar trabalho longo, e cada falta SHALL vir com o conserto escrito.

#### Scenario: A máquina tem terraform de arquitetura incompatível
- **WHEN** alguém roda `./bioma.sh` num Mac Apple Silicon com terraform x86
- **THEN** o comando para em segundos dizendo o binário, a arquitetura dele, a da máquina e os comandos do conserto, em vez de falhar no meio de um plan

#### Scenario: Falta um pré-requisito
- **WHEN** falta `terragrunt`, `jq`, `opa` ou a chave do modelo
- **THEN** a mensagem nomeia o que falta e como instalar, e o processo para antes de tocar a nuvem

### Requirement: A instalação está escrita e é reproduzível
O `README.md` SHALL declarar as versões exigidas, as dependências de sistema, o que é opcional e o que bloqueia, de modo que alguém instale sem perguntar.

#### Scenario: Alguém instala do zero
- **WHEN** a pessoa segue o README numa máquina limpa
- **THEN** chega até a tela aberta no navegador com o exemplo carregado, sem passo não escrito
