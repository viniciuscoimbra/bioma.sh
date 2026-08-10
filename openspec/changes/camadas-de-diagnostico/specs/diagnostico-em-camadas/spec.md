## ADDED Requirements

### Requirement: O diagnóstico roda em camadas, na ordem em que elas valem
A ferramenta SHALL diagnosticar o desenho em quatro camadas: a peça, o desenho,
a ligação e a saída. Cada achado SHALL declarar a camada, o nível, a razão em
português e o que fazer.

#### Scenario: Peça sem nome
- **WHEN** uma peça do desenho não tem nome
- **THEN** sai achado de camada 1, nível erro, dizendo que sem nome não há pasta nem receita

#### Scenario: Serviço que a tabela não conhece
- **WHEN** a peça é de um serviço fora de `mapa_recursos.json`
- **THEN** sai achado de camada 1, nível aviso, e nenhum recurso é inventado

### Requirement: Peça solta é erro, salvo quando ela guarda conteúdo
Peça sem nenhuma seta SHALL gerar achado de camada 2. O nível SHALL ser erro,
salvo quando a peça guarda conteúdo, e nesse caso SHALL ser aviso, porque quem a
consome pode não estar naquele desenho.

#### Scenario: Função solta
- **WHEN** uma função sem seta nenhuma está no canvas
- **THEN** o achado é erro, e a árvore não sai

#### Scenario: Balde solto
- **WHEN** um balde sem seta nenhuma está no canvas
- **THEN** o achado é aviso, e a árvore sai

### Requirement: Ciclo e ponta perdida aparecem antes de gerar
Ida e volta entre duas peças SHALL gerar achado de ciclo na camada 2. Seta que
termina em algo que não é peça do desenho nem sistema externo SHALL gerar achado
de ponta fora do desenho.

#### Scenario: Ida e volta
- **WHEN** A aponta B e B aponta A
- **THEN** sai o achado de ciclo, nomeando as duas peças

#### Scenario: Ponta em sistema externo
- **WHEN** a seta termina em `sistema externo (bureau)`
- **THEN** nenhum achado de ponta perdida sai, porque a ponta é legítima

### Requirement: Erro impede a entrega
A árvore SHALL NOT ser entregue quando houver achado de nível erro. Achado de
nível aviso SHALL deixar a entrega seguir.

#### Scenario: Desenho com erro
- **WHEN** o diagnóstico traz ao menos um erro
- **THEN** o veredito diz que não sai assim

### Requirement: Cada regra tem caso e contra-caso sintéticos
Toda regra do diagnóstico SHALL ser exercitada por desenho montado no teste, com
o caso que ela pega e o contra-caso que ela não pode pegar. Regra sem
contra-caso SHALL ser tratada como não coberta.

#### Scenario: Suíte de camadas
- **WHEN** `python3 testes/camadas.py` roda
- **THEN** cada camada mostra suas verificações, e o comando sai com código 1 se qualquer uma falhar
