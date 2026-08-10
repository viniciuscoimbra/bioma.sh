## ADDED Requirements

### Requirement: A stack de uma PR tem estado próprio
Peça declarada com multiplicidade `×pr` SHALL gerar célula em caminho próprio da PR, e o estado dela SHALL ser prefixado pelo identificador da PR, de modo que nenhum plano da PR enxergue o estado da infraestrutura permanente da mesma conta.

#### Scenario: Uma PR sobe na conta que já tem infraestrutura
- **WHEN** a esteira aplica a stack da PR 1234 na conta `mesa-credito-dev`
- **THEN** a chave do estado começa em `efemero/pr-1234/`, e o plano não lista nenhum recurso da infraestrutura permanente daquela conta

#### Scenario: A PR fecha
- **WHEN** a esteira destrói o escopo da PR 1234
- **THEN** só os recursos daquele estado caem, e a infraestrutura permanente da conta permanece intacta

### Requirement: Todo recurso carrega a marca de quem o criou
A árvore gerada SHALL aplicar tag em todo recurso, com domínio e ambiente sempre, e com identificação de efemeridade, número da PR, momento de criação e prazo quando a stack for de PR.

#### Scenario: Uma PR é abandonada sem fechar
- **WHEN** a faxina agendada procura o que passou do prazo
- **THEN** encontra os recursos por `Ephemeral=true` e `TTL`, sem varrer a conta inteira

#### Scenario: A permissão precisa ser condicional
- **WHEN** o time restringe a role da esteira por tag
- **THEN** a condição encontra `Ephemeral` e `PRNumber` em todo recurso criado pela stack da PR

### Requirement: A base entra por leitura
Peça efêmera que depende de peça permanente SHALL consumi-la por leitura de estado remoto ou por data source, e NÃO SHALL declará-la como dependência aplicável.

#### Scenario: A stack da PR precisa da VPC que já existe
- **WHEN** o bioma gera a célula efêmera que aponta para a rede permanente
- **THEN** o arquivo sai com `terraform_remote_state` sobre o estado da rede, e nenhum `dependency` que possa aplicá-la

### Requirement: A esteira nasce junto da árvore
O bioma SHALL gerar o workflow que cria a stack na abertura da PR, destrói no fechamento e varre o que passou do prazo, com o escopo de execução limitado ao caminho da PR.

#### Scenario: A esteira roda a partir da raiz do repositório por engano
- **WHEN** o workflow gerado executa
- **THEN** ele entra no caminho da PR antes de qualquer comando, e o comando carrega o escopo explícito daquele caminho
