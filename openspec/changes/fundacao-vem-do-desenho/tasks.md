# Tasks — a fundação vem do desenho

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.
> **Ordem**: o grupo 1 é a tabela, e nada do grupo 2 anda sem ela. O grupo 4 fecha a change: sem portão, o caminho não está provado.
> **Fora**: o interior de `landing-zone`, que espera decisão humana sobre módulo de terceiro.

## 1. A tabela

- [ ] **1.1 `ferramentas/mapa_fundacao.json`**, mapeando termo para organismo do catálogo, com as entradas de Organization, OU, SCP e conta. _Evidência esperada: o arquivo, e o termo `organizations account` resolvendo para `fundacao/conta-governada`._
- [ ] **1.2 A tabela é validada na carga.** Organismo apontado precisa existir em `catalogo/`, e os recursos que ele declara precisam existir em `ferramentas/esquema-aws.json`. _Evidência esperada: entrada apontando para organismo inexistente recusa com o nome do organismo, e código 1._
- [ ] **1.3 A divergência entre as duas tabelas acaba.** `ferramentas/ler_diagrama.py:112` e `:195` dizem `aws_organizations_organization`; `tela/icones-aws.json:340` diz `aws_organizations_account`. _Evidência esperada: o mesmo termo resolvendo igual nos dois lugares, e o caso da divergência atual virando teste em `testes/unidade.py`._
- [ ] **1.4 Termo de fundação fora da tabela sai pendente.** _Evidência esperada: peça com termo desconhecido sai pendente com a razão em português, e nenhum `.tf` escrito para ela._
- [ ] **1.5 A tabela declara o que uma célula recebe da outra** (D5), na forma `variável ← organismo.saída`. As duas linhas desta change são `arvore-ous.root_id` ← `organizacao.root_id` e `conta-governada.ou_id` ← `arvore-ous.ous`. Os alvos de `politicas-scp` ficam fora: são lista dentro de campo aninhado de `map(object)`, forma que a tabela não diz. _Evidência esperada: a tabela, cada saída citada existindo no `outputs.tf` do organismo apontado, e `politicas-scp` continuando a perguntar, com a razão escrita._

## 2. O gerador compõe

- [ ] **2.1 Peça de fundação vira célula apontando para o organismo.** _Evidência esperada: a árvore gerada, com `live/fundacao/prd/organizacao/terragrunt.hcl` cujo `source` é o organismo do catálogo._
- [ ] **2.2 O gerador para de escrever dentro de `catalogo/organismos/fundacao/`.** _Evidência esperada: os blocos `resource` que chegam na árvore são idênticos aos do repositório, com `feature_set = "ALL"`, os três tipos de política e `prevent_destroy`. O cabeçalho de comentário pode diferir, e a task diz qual é a diferença. Hoje sai `resource "aws_organizations_organization" "organizacao" { }` com corpo vazio._
- [ ] **2.3 Conta desenhada vira `conta-governada`, e não OU.** _Evidência esperada: a árvore gerada com os inputs de nome, email e OU. Hoje a peça Account sai como `aws_organizations_organizational_unit` com `parent_id = "PREENCHER"`._
- [ ] **2.4 Ler `variables.tf` de organismo escrito à mão.** O gerador só escreve `variables.tf` hoje (`gerar_iac.py:497` e `:1277`), nunca lê. Parse de nome, tipo, obrigatoriedade e `description`. Dependências: nenhuma. _Evidência esperada: o `variables.tf` de `fundacao/conta-governada` lido, com a lista de variáveis e quais são obrigatórias._
- [ ] **2.5 Os inputs da célula saem desse parse**, com a pergunta em português ao lado de cada `PREENCHER`. **Só vira pergunta a variável que a tabela de 1.5 não casar** (D5): antes desta emenda a task dizia "uma pergunta por variável obrigatória", o que faria a árvore pedir `root_id` e `ou_id` a quem opera. Dependências: 2.4, 1.5. _Evidência esperada: o `terragrunt.hcl` gerado de `conta-governada`, com pergunta para `nome` e `email` e nenhuma para `ou_id`._
- [ ] **2.6 A variável casada vira `dependency`** (D5), com `config_path` para a célula que publica e `mock_outputs` limitado a `validate`, `plan` e `init`, como já acontece em `dependencia_hcl` (`gerar_iac.py:889`). Dependências: 1.5, 2.1. _Evidência esperada: `live/fundacao/*/ous/terragrunt.hcl` com `root_id = dependency.organizacao.outputs.root_id`, e `terragrunt run --all plan` resolvendo a ordem sem nenhum id colado à mão._
- [ ] **2.7 `apply_serial` no contrato vira `-parallelism=1` na célula** (D6). O campo entra em `catalogo/organismos/fundacao/arvore-ous/contrato.json`, onde hoje a exigência é a frase `"parallelism 1"` em `premissas`, que não chega a lugar nenhum. Dependências: 2.1. _Evidência esperada: o `terragrunt.hcl` de OUs com o bloco `extra_arguments`, e `terragrunt apply --dry-run` mostrando a flag na linha do terraform._

## 3. O que a árvore recusa e o que ela avisa

- [ ] **3.1 Segunda Organization recusa a tradução inteira**, nomeando as duas peças. _Evidência esperada: o comando com dois nós de Organization saindo com código diferente de zero, os dois nomes na mensagem, e nenhum arquivo escrito. Hoje saem três `aws_organizations_organization` na mesma árvore._
- [ ] **3.2 A árvore diz que `01-landing-zone` está por construir** e que a fase 2 para nela. _Evidência esperada: o aviso escrito na saída da geração, nomeando a unidade e a posição na ordem de `bioma.sh:447`._

## 4. A prova

- [ ] **4.1 `exemplos/fundacao.md`** descrevendo Organization, OUs, SCPs e contas de uma fundação mínima. _Evidência esperada: o arquivo, e a proposta traduzida a partir dele sem nenhuma peça pendente._
- [ ] **4.2 As células de fundação em `testes/arvore-esperada`**, geradas a partir de 4.1, no mesmo commit. _Evidência esperada: os arquivos novos listados, e a contagem antes e depois (hoje são 36, sem nenhuma célula de fundação)._
- [ ] **4.3 O portão compara as duas árvores.** _Evidência esperada: `bash testes/portoes.sh` passando, e uma diferença introduzida de propósito reprovando com o arquivo nomeado._
- [ ] **4.4 A microcopy nova nas duas línguas**, em `tela/app/src/dicionario.js`, para o pendente de fundação e para o aviso da landing zone. _Evidência esperada: as frases em contexto, EN-US e PT-BR, com a foto olhada._
