## ADDED Requirements

### Requirement: Pré-requisito humano é entrada obrigatória do comando
A ferramenta SHALL manter a lista dos pré-requisitos que não são código, cada um
com o dono e o que ele trava. Cada pré-requisito SHALL ser respondido com a data
em que foi cumprido. Sem a resposta, o comando SHALL parar antes de tocar a
nuvem e dizer qual falta.

#### Scenario: Pré-requisito sem declaração
- **WHEN** o operador roda um apply de perfil real e a quota de contas não está declarada
- **THEN** o comando para antes do pré-voo, nomeia o pré-requisito, o dono e o que ele trava, e não chama Terraform nenhum

#### Scenario: Pré-requisito declarado
- **WHEN** a declaração existe com a data
- **THEN** o pré-voo imprime o pré-requisito com a data e segue

#### Scenario: Plano não exige declaração
- **WHEN** o comando é `--plan`
- **THEN** a declaração ausente vira aviso, porque planejar não cria conta nem consome quota

### Requirement: A declaração é perguntada na instalação
A instalação SHALL perguntar cada pré-requisito na mesma etapa em que pergunta
os demais valores da instância, com a explicação do que ele significa e de quem
é a ação.

#### Scenario: Instalação interativa
- **WHEN** a instalação chega à etapa dos valores
- **THEN** cada pré-requisito é perguntado com o dono dito, e a resposta em branco fica registrada como pendente

### Requirement: A leitura automática confirma, e não substitui
Onde a nuvem souber responder pelo pré-requisito, a ferramenta SHALL comparar a
declaração com o que a nuvem diz e SHALL avisar quando divergirem. A leitura
automática SHALL NOT dispensar a declaração.

#### Scenario: Quota declarada e quota real divergem
- **WHEN** a declaração diz que a quota subiu e a AWS devolve o valor antigo
- **THEN** o comando avisa a divergência, com os dois números
