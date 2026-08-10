## ADDED Requirements

### Requirement: O nó declara a unidade organizacional onde mora
Todo nó SHALL trazer `ou` com o nome da unidade organizacional, e a natureza
dela SHALL ser uma de `workload`, `capacidade`, `fundacional` ou `agrupadora`. OU
agrupadora SHALL recusar conta, porque quem hospeda conta é a OU folha.

#### Scenario: Zona que já nomeia a OU
- **WHEN** a zona do serviço é `Platform · Barramento`
- **THEN** o nó sai com `ou` igual a `Barramento` e natureza `capacidade`

#### Scenario: Zona sem OU e sem mapa importado
- **WHEN** a zona é um nome que o mapa não conhece e não há `contas.hcl` importado
- **THEN** o nó sai com `ou` vazia e marcado como pendente, e a ficha pergunta em português

### Requirement: O ambiente é dimensão do nó, não sufixo de nome
Todo nó SHALL declarar em quais ambientes ele existe, e a lista SHALL sair da
natureza da OU: `dev`, `hml` e `prd` para workload; `nprd` e `prd` para
capacidade de plataforma; nenhum para fundacional. A instância SHALL poder
sobrescrever a lista, porque a quantidade de ambientes é decisão de quem opera.

#### Scenario: Peça de capacidade de plataforma
- **WHEN** o cluster do barramento é desenhado na OU Barramento
- **THEN** o nó existe em `nprd` e `prd`, e a árvore gerada tem duas células

#### Scenario: Peça de conta fundacional
- **WHEN** o hub de trânsito é desenhado na conta de rede
- **THEN** o nó não tem ambiente, e a árvore gerada tem uma célula

#### Scenario: Instância que opera com dois ambientes de workload
- **WHEN** a instância declara `workload: [dev, prd]` nas convenções dela
- **THEN** a peça de workload existe em `dev` e `prd`, e o nó diz que a lista veio do arquivo da instância, e não do padrão da ferramenta

### Requirement: Projeto salvo antes desta mudança abre e se declara incompleto
Um `.bio` sem `ou` e sem `ambiente` SHALL abrir sem erro, e cada nó sem as duas
propriedades SHALL aparecer como pendente. A tela SHALL dizer quantos nós estão
assim. A ferramenta SHALL NOT assumir ambiente único.

#### Scenario: Projeto antigo
- **WHEN** alguém abre um `.bio` gerado antes desta mudança
- **THEN** o desenho aparece inteiro, com o aviso de quantos nós esperam OU e ambiente, e nenhum valor é inventado
