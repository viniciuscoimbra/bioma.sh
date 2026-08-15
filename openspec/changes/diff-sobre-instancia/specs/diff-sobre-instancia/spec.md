## ADDED Requirements

### Requirement: A comparação responde em nasce, muda e sai
A ferramenta SHALL comparar um desenho com uma árvore existente no disco e
responder em três listas: células que nascem, células que mudam e células que
saem. A resposta SHALL dizer que a comparação é entre desenho e código, e não
entre código e nuvem.

#### Scenario: Desenho que acrescenta uma capacidade
- **WHEN** o desenho tem a OU Verificação e a árvore não
- **THEN** as células dela aparecem em "nasce", e nada aparece em "sai"

#### Scenario: Instância inteira sem mudança
- **WHEN** o desenho descreve exatamente a árvore existente
- **THEN** as três listas voltam vazias, e a resposta diz que desenho e código batem

### Requirement: O que muda é dito por campo
Célula que existe nos dois lados e difere SHALL aparecer com o campo que mudou e
os dois valores, sem exigir leitura do arquivo gerado.

#### Scenario: Conta trocada
- **WHEN** a célula do barramento sai da conta de dados para a conta do barramento
- **THEN** a resposta diz `conta: faturamento-nprd → faturamento-nprd`

### Requirement: Remoção passa pela trava de durabilidade
Célula que sumiu do desenho e é de tecido permanente SHALL aparecer como aviso,
com a razão, e SHALL NOT ser apresentada como remoção a executar. Célula efêmera
SHALL aparecer como remoção normal.

#### Scenario: Permanente fora do desenho
- **WHEN** a célula do lake sai do desenho e ela é permanente
- **THEN** a resposta avisa que o desenho não a descreve mais e que ela não cai por rotina

### Requirement: Célula sem origem em desenho é achado
Célula que existe na árvore e não vem de desenho nenhum SHALL aparecer como
achado próprio, separada das três listas.

#### Scenario: Instância que envelheceu
- **WHEN** a árvore tem célula escrita à mão, fora de qualquer desenho
- **THEN** ela aparece como achado, com o caminho, e não como remoção
