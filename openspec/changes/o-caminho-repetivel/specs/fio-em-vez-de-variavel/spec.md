## ADDED Requirements

### Requirement: Valor que a árvore produz não é perguntado
Célula que consome um valor emitido por outra SHALL o receber por `dependency`.
A ferramenta SHALL NOT pedir ao operador valor que a própria árvore produz.

#### Scenario: ARN de chave produzido por célula da árvore
- **WHEN** o organismo de chave emite `key_arn` e outra célula precisa dele
- **THEN** a célula consumidora declara `dependency` para a produtora, com `mock_outputs` limitado a plano

#### Scenario: Valor que nenhuma célula produz
- **WHEN** o valor vem de fora da árvore (um provedor SAML, um identificador de grupo do diretório)
- **THEN** ele continua sendo parâmetro, e o pré-voo diz qual célula ele trava

### Requirement: A ferramenta aponta a variável que deveria ser fio
O pré-voo SHALL comparar cada variável pendente com os outputs das células da
árvore e SHALL nomear as que têm produtora conhecida.

#### Scenario: Variável pendente com produtora na árvore
- **WHEN** a variável pendente tem nome de output emitido por um organismo instanciado
- **THEN** o pré-voo diz qual célula a produz e que ela deveria ser dependência

#### Scenario: Produtora existe no catálogo e não tem célula
- **WHEN** o organismo que emitiria o valor está no catálogo sem nenhuma célula que o instancie
- **THEN** o pré-voo diz isso, porque a falta é de célula e não de valor
