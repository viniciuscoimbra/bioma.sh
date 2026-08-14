## ADDED Requirements

### Requirement: A ordem de execução é dado declarado
A sequência de passos SHALL morar em dado versionado, e não em código de
controle. Cada passo SHALL ter número estável, título, as áreas que aplica, o
que exige antes e o que libera depois. O comando SHALL percorrer esse dado.

#### Scenario: Listar a sequência
- **WHEN** o operador pede a fila
- **THEN** ele recebe os passos numerados, na ordem, com as áreas de cada um, sem executar nada

#### Scenario: Passo acrescentado
- **WHEN** um passo novo entra na sequência
- **THEN** ele entra no dado, e nenhum bloco de controle precisa ser editado

### Requirement: Cada passo tem estado, e ele responde pelo que rodou
A ferramenta SHALL registrar, por passo, se ele foi concluído, e SHALL
responder "o que já rodou" a partir desse registro cruzado com o estado na
nuvem. Retomar SHALL continuar da célula onde parou, e não do início do passo.

#### Scenario: Retomada depois de falha no meio de um passo
- **WHEN** um passo falha na quinta de doze células e o operador retoma
- **THEN** as quatro concluídas não rodam de novo, e a execução começa na quinta

#### Scenario: Passo inteiro já concluído
- **WHEN** o passo consta como concluído e nada mudou
- **THEN** o comando o pula dizendo isso, e não devolve sucesso silencioso

### Requirement: A credencial de execução sai da posição na fila
O passo SHALL declarar com qual papel ele executa. A ferramenta SHALL NOT
inferir o papel a partir de rastro de execuções anteriores.

#### Scenario: Passo anterior ao que cria o papel da esteira
- **WHEN** o passo roda antes daquele que cria o papel da esteira
- **THEN** ele usa o papel que nasce com a conta, porque é o que o dado declara

#### Scenario: Conta fora do passo que criou o papel
- **WHEN** um passo alcança uma conta onde o papel da esteira não foi criado
- **THEN** a ferramenta diz isso antes de executar, nomeando a conta e o passo que a deixaria pronta
