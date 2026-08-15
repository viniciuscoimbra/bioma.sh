## ADDED Requirements

### Requirement: O mapa de contas de uma instância vira lista da tela
A ferramenta SHALL ler o bloco de contas de um `contas.hcl` e devolver uma lista
no formato da tela, com `apelido`, `numero`, `area` e `padrao`. Conta cujo valor
vem de variável de ambiente SHALL usar o valor de queda declarado no próprio
arquivo, porque é ele que a instância usa quando a variável não está posta.

#### Scenario: Instância com contas por família
- **WHEN** a ferramenta lê o `contas.hcl` de uma instância com `faturamento-nprd = get_env("TG_CONTA_BARRAMENTO_NPRD", "330000000001")`
- **THEN** a lista traz `{apelido: "faturamento-nprd", numero: "330000000001", area: "Barramento"}`

#### Scenario: Arquivo sem bloco de contas
- **WHEN** o caminho aponta um arquivo que não tem `contas = {`
- **THEN** a ferramenta recusa dizendo o que procurou, e não devolve lista vazia como se estivesse tudo certo

### Requirement: A tela importa o mapa sem digitação
A tela SHALL expor uma rota que recebe o caminho de um `contas.hcl`, valida a
lista pelas mesmas regras da digitação e substitui a lista atual. A resposta
SHALL dizer quantas contas entraram e que a lista anterior foi substituída.

#### Scenario: Importação de uma instância real
- **WHEN** a rota recebe o caminho do `contas.hcl` da instância
- **THEN** a lista da tela passa a ter as contas daquele arquivo, e a resposta traz o total

#### Scenario: Caminho que não existe
- **WHEN** a rota recebe um caminho inexistente
- **THEN** responde com erro em português nomeando o caminho, e a lista anterior fica intacta
