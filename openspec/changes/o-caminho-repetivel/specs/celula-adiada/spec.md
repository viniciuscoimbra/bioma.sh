## ADDED Requirements

### Requirement: Célula fora da fila declara por quê, na própria célula
Célula que não roda SHALL declarar isso nela mesma, com a razão e com o que ela
trava adiante. A declaração SHALL distinguir a que tem volta (`adiada`) da que
não tem (`cedeu`, com o caminho de quem assumiu).

#### Scenario: Célula adiada por valor que ainda não existe
- **WHEN** a célula espera um valor que só nasce depois
- **THEN** ela declara `adiada`, a razão, e as células que ficam esperando por ela

#### Scenario: Célula que passou o serviço a outra
- **WHEN** uma célula de bootstrap é substituída pela definitiva
- **THEN** ela declara `cedeu` e o caminho da definitiva, e nenhuma execução a inclui

#### Scenario: Lista de exclusão gerada
- **WHEN** o comando monta a fila
- **THEN** as exclusões saem das declarações das células, e não de um arquivo escrito à mão

### Requirement: O que ficou fora é oferecido ao fim da execução
Ao terminar, a ferramenta SHALL listar as células adiadas, o que cada uma
trava, e SHALL perguntar se alguma delas roda agora. A resposta SHALL ficar
registrada.

#### Scenario: Execução termina com célula adiada cujo valor já chegou
- **WHEN** a execução termina e a variável que adiava a célula agora tem valor
- **THEN** a ferramenta diz que ela está pronta e pergunta se roda agora

#### Scenario: Execução termina com célula adiada ainda travada
- **WHEN** o que a adiava continua faltando
- **THEN** a ferramenta a lista com o que falta, e não pergunta

#### Scenario: Terminal não interativo
- **WHEN** não há terminal para perguntar
- **THEN** a lista é impressa e nada é executado sem resposta
