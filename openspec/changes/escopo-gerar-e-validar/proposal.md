## Why

A ferramenta nasceu de um problema concreto: um parque inicial complexo, as
arquiteturas de referência desenhadas, e nenhum caminho entre o desenho e o
Terraform. O que ela precisa entregar é a estrutura gerada, entendível, com o
histórico do que mudou, baixada na máquina de quem desenhou, para ele subir
onde quiser.

Executar essa estrutura não faz parte do objetivo, e mesmo assim o `bioma.sh`
executa: sobe emulador em contêiner, cria bucket de estado e roda
`terragrunt run --all apply`. O preço aparece na instalação, que cobra
terragrunt, terraform, jq, opa, aws cli e docker antes da primeira tela. Num
repositório aberto isso vira um manual de instalação entre quem clona e quem
vê a ferramenta funcionar.

Quem executa infraestrutura já existe, e é o terraform com o terragrunt em
volta. O bioma acrescenta na camada anterior: transformar desenho em estrutura
correta e provar que ela funciona antes de alguém aplicar.

## What Changes

- **BREAKING**: `bioma.sh` deixa de aplicar e destruir infraestrutura. Criar, atualizar e destruir passam a ser receita gerada, não ação da ferramenta.
- O ciclo de vida continua governado, mas no código gerado e na política, não em tempo de execução: `prevent_destroy` no recurso permanente, política de durabilidade em arquivo que o pipeline de quem usa executa, e a janela de mudança como campo do comando que o próprio time roda.
- A validação fica e cresce: verificadores de preenchimento, cobertura e durabilidade, `terraform validate` por receita e a revisão de especialista.
- O degrau local (emulador em contêiner) sai do caminho obrigatório e vira exemplo em `testes/`, para quem quiser exercitar a árvore de ponta a ponta.
- A instalação encolhe: Python e um navegador bastam para gerar. O terraform passa a ser opcional, exigido só por quem quer a validação por compilação.
- A tela troca os botões de aplicar e destruir pela receita pronta: os comandos exatos, copiáveis, com o que cada um faz e o que ele recusa derrubar.

## Capabilities

### New Capabilities

- `execucao`: onde termina a responsabilidade do bioma e o que ele entrega no lugar de executar.

## Impact

- Quem usa o degrau local hoje (`./bioma.sh --perfil local`) perde o caminho embutido e passa a rodar terragrunt direto, com o compose de `testes/` como apoio.
- O smoke test `testes/fumaca.sh` continua valendo: ele exercita a árvore gerada, e não a ferramenta.
- O que o produto promete fica mais estreito e mais honesto: estrutura correta e provada, não operação de infraestrutura.
