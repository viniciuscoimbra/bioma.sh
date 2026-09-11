## ADDED Requirements

### Requirement: Quem vem de fora entra com o escopo que é dele
A ligação da política do cluster SHALL aceitar `leitores` e `escritores` como
mapas, cada entrada com os principais, os tópicos e, no leitor, os grupos. Cada
entrada SHALL gerar os próprios statements, e o escopo declarado numa entrada
NÃO SHALL alcançar principal de outra entrada nem das listas de escopo
compartilhado.

#### Scenario: Consumidor que não é conector
- **WHEN** uma role de outra conta precisa ler um tópico e nada mais
- **THEN** ela recebe leitura e descrição só nos tópicos da entrada dela, sem
  escrita e sem criação de tópico

#### Scenario: Dois produtores de tópicos diferentes
- **WHEN** duas entradas de escritor declaram tópicos diferentes
- **THEN** cada principal escreve só nos tópicos da entrada dele

### Requirement: O leitor conecta sem escrita idempotente
O statement de conexão de uma entrada de leitor SHALL trazer `Connect` e
`DescribeCluster`. O de escritor SHALL trazer também `WriteDataIdempotently`,
porque a ação só serve a quem escreve.

#### Scenario: Entrada de leitor
- **WHEN** a entrada está em `leitores`
- **THEN** o statement de conexão traz duas ações, sem escrita idempotente

#### Scenario: Entrada de escritor
- **WHEN** a entrada está em `escritores`
- **THEN** o statement de conexão traz também `WriteDataIdempotently`

### Requirement: Leitor sem grupo não recebe coordenação
Entrada de leitor sem grupo declarado NÃO SHALL gerar statement de coordenação,
porque quem lê por partição atribuída não entra em grupo, e statement sem recurso
não é política válida.

#### Scenario: Leitor sem grupo
- **WHEN** a entrada de leitor declara tópicos e nenhum grupo
- **THEN** ela gera o statement de conexão e o de leitura, e nenhum de grupo

#### Scenario: Leitor com grupo
- **WHEN** a entrada de leitor declara um grupo
- **THEN** ela gera também o statement de coordenação, com o grupo declarado
  como recurso

### Requirement: O nome da entrada identifica os statements dela
O Sid de cada statement gerado SHALL começar pelo nome da entrada que o gerou,
para que a política planejada possa ser comparada com a que está na nuvem
statement por statement.

#### Scenario: Entrada nomeada
- **WHEN** a entrada de leitor se chama `LeitoresDeFora`
- **THEN** os statements saem como `LeitoresDeForaConectam`, `LeitoresDeForaLeem`
  e `LeitoresDeForaCoordenam`

#### Scenario: Comparação com a política viva
- **WHEN** a política na nuvem traz um statement com o mesmo Sid de uma entrada
- **THEN** as duas versões do statement podem ser casadas pela chave, e o que
  sobra de diferença é o que o apply muda

### Requirement: Nome que não serve como Sid é recusado no plano
Nome repetido entre `leitores` e `escritores` SHALL ser recusado por precondição
do recurso, nomeando os Sids gerados. Nome com caractere fora de letra e número,
nome igual a prefixo que a receita já usa, e entrada sem principal ou sem tópico
SHALL ser recusados pela validação da variável. As duas recusas SHALL acontecer
no plano, e não no momento de gravar a política.

#### Scenario: Mesmo nome nos dois mapas
- **WHEN** `leitores` e `escritores` têm uma entrada com o mesmo nome
- **THEN** o plano é recusado, porque os dois gerariam o mesmo Sid de conexão

#### Scenario: Nome com caractere que o Sid não aceita
- **WHEN** a entrada se chama `com-hifen`
- **THEN** o plano é recusado, dizendo que o nome vira prefixo de Sid

#### Scenario: Nome igual a prefixo da receita
- **WHEN** a entrada se chama como um dos prefixos das listas de escopo
  compartilhado
- **THEN** o plano é recusado, porque o Sid colidiria com o statement que a
  própria receita gera

#### Scenario: Entrada com lista vazia
- **WHEN** a entrada declara principais e nenhum tópico
- **THEN** o plano é recusado, porque o statement sairia sem recurso

### Requirement: Catálogo sem entradas gera a política de antes
Os dois mapas SHALL nascer vazios, e catálogo que não declara entrada NÃO SHALL
ver mudança na política gerada.

#### Scenario: Célula que não declara leitor nem escritor
- **WHEN** a célula usa só `contas_consumidoras`, `conectores_arns` e
  `produtores_arns`
- **THEN** a política sai com os mesmos statements de antes desta change
