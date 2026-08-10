## ADDED Requirements

### Requirement: Conta governada nasce por um caminho declarado
A fundação SHALL declarar, em documento versionado, qual é o caminho pelo qual uma conta governada nasce, e o mesmo caminho SHALL valer para toda conta nova do parque.

#### Scenario: Alguém precisa de uma conta nova
- **WHEN** um time pede uma conta para um domínio
- **THEN** encontra escrito onde o pedido é feito, quem aprova, quanto tempo leva o enrollment e o que já vem configurado quando a conta chega

#### Scenario: O parque tem contas de duas origens
- **WHEN** existem contas criadas antes da mudança de caminho
- **THEN** o documento diz quais são, por qual caminho vieram, e se serão migradas ou mantidas como estão

### Requirement: Conta não é encerrada por descuido, venha de onde vier
O encerramento de conta SHALL exigir passo deliberado e autorizado, mesmo quando o recurso da conta não estiver no estado da instância.

#### Scenario: A conta passa a ser gerida por um sistema de vending
- **WHEN** o recurso da conta sai do estado da instância
- **THEN** a proteção que existia por `prevent_destroy` é substituída por controle de permissão que negue o encerramento fora do papel autorizado, e isso está aplicado antes da migração

### Requirement: A ferramenta emite no layout que a esteira do cliente espera
Quando a esteira de destino tiver layout próprio de repositório, o bioma SHALL emitir a estrutura naquele layout, sem que o desenho precise mudar.

#### Scenario: O cliente usa uma fábrica de contas com repositórios próprios
- **WHEN** o desenho é o mesmo e o destino é o layout da fábrica
- **THEN** a árvore sai organizada nas pastas que a fábrica espera, e a decisão de cada peça continua justificada
