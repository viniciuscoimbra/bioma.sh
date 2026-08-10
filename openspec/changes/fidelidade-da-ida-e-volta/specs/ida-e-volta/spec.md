## ADDED Requirements

### Requirement: A decisão que o serviço cumpre atravessa a ida e a volta
O tradutor SHALL guardar a quinta coluna da tabela de serviços em `realiza`, e a
especificação escrita pela tela SHALL devolver esse valor na mesma coluna. Nó
sem `realiza` SHALL escrever `tela`, que é a origem verdadeira de um desenho
nascido ali.

#### Scenario: Bloco com decisão declarada entra e volta
- **WHEN** a especificação de `00-fundacao` entra no tradutor e a proposta volta a virar especificação
- **THEN** a linha do AWS Organizations traz `[[#Decisão 1 · Organizations com OUs por natureza]]` na coluna `realiza`, e não `tela`

#### Scenario: Desenho nascido na tela
- **WHEN** alguém monta um grafo na tela e exporta a especificação
- **THEN** a coluna `realiza` traz `tela` para os nós que ninguém ligou a uma decisão

### Requirement: A ponta de aresta declara de que classe ela é
Toda aresta SHALL trazer a classe de cada ponta em `de_classe` e `para_classe`,
com um destes valores: `interna` quando a ponta é nó do desenho, `bloco` quando
é outro bloco da arquitetura, `fronteira` quando é terceiro que existe em
`catalogo/fronteiras/`, `topico` quando é assunto do barramento e `externa`
para o resto. O bloco escreve terceiro como `sistema externo (nome)`, então o
nome de dentro do parêntese é que decide entre `fronteira` e `externa`. Os campos `de` e `para`
SHALL continuar sendo texto, para não quebrar quem já lê o grafo.

#### Scenario: Aresta que fica dentro do recorte
- **WHEN** o barramento publica para um consumidor que está no mesmo desenho
- **THEN** as duas pontas saem com classe `interna`

#### Scenario: Aresta que sai para outro bloco
- **WHEN** o barramento entrega ao lake de `[[04-plataforma-dados]]`
- **THEN** a ponta de destino sai com classe `bloco`, e o texto continua `04-plataforma-dados`

#### Scenario: Aresta que sai para terceiro que o catálogo conhece
- **WHEN** a identidade federa com `sistema externo (IdP corporativo)`, e `idp-corporativo` existe em `catalogo/fronteiras/`
- **THEN** a ponta sai com classe `fronteira`

#### Scenario: Aresta que sai para terceiro que o catálogo não tem
- **WHEN** a borda pública recebe `sistema externo (cliente final)`, e não existe fronteira com esse nome
- **THEN** a ponta sai com classe `externa`, sem inventar fronteira
