## ADDED Requirements

### Requirement: O projeto declara onde a referência mora
O `.bio` SHALL poder declarar o caminho da arquitetura de referência do
projeto, e a ferramenta SHALL usar essa declaração em toda leitura da
referência. A ferramenta SHALL NOT depender de variável de ambiente para
encontrá-la.

#### Scenario: Projeto com referência declarada
- **WHEN** o projeto declara a pasta da referência e ela existe
- **THEN** os portões que confrontam desenho com blocos a leem sem configuração extra

#### Scenario: Projeto sem referência
- **WHEN** o projeto não declara referência
- **THEN** os portões que dependem dela saem com "não se aplica" e a razão, e nada mais muda

### Requirement: A referência aparece na tela como base de conhecimento
A tela SHALL mostrar de qual bloco da referência cada peça vem, e SHALL listar
o que os blocos pedem e ainda não tem peça no desenho.

#### Scenario: Peça vinda de um bloco
- **WHEN** a peça realiza um serviço da tabela de um bloco
- **THEN** a ficha dela nomeia o bloco e a decisão que ela cumpre

#### Scenario: Serviço do bloco sem peça
- **WHEN** um serviço da tabela de um bloco não tem peça no desenho
- **THEN** ele aparece como pendência da referência, com o bloco de origem
