# Design — a fundação e o AFT

Levantado em 2026-08-07, contra o artigo oficial do AFT e contra a fundação em
`implementacao/bioma/infra` da instância privada de referência.

## O que cada um faz

| O trabalho | AFT | A fundação hoje |
|---|---|---|
| pedir conta | commit em `aft-account-request`, fila em DynamoDB | `04-contas/<nome>/terragrunt.hcl` chamando `conta-governada` |
| criar conta | Control Tower Account Factory (Service Catalog) | `aws_organizations_account` direto |
| enrolar no Control Tower | pipeline do AFT espera | herança do baseline na OU (`aws_controltower_baseline` 5.0) |
| esperar o enrollment | Step Functions do AFT | `bioma.sh` roda `controltower list-enabled-baselines --include-children` e barra até `SUCCEEDED` |
| customização de todas as contas | repositório `aft-global-customizations` | `06-baseline-seguranca` |
| customização por conta | repositório `aft-account-customizations` | catálogo de organismos, por domínio e ambiente |
| customização antes da conta existir | `aft-account-provisioning-customizations`, com Step Functions falando com sistema externo | não existe |
| parâmetro por conta | SSM Parameter Store | hormônio (SSM), mesmo mecanismo |
| onde a esteira roda | CodePipeline na conta AFT Management | Terragrunt, na máquina de quem opera ou no CI do time |
| proteção da conta | não impõe | `prevent_destroy = true` e `close_on_deletion = false` |
| árvore de OUs e SCP | fora do AFT | `02-ous` e `03-scp` |
| Identity Center | fora do AFT | `07-identity-center` |
| backup organizacional | fora do AFT | `08-backup` |

Resumo: o AFT cobre o vending e o encanamento da customização. A fundação cobre
isso e mais a organização inteira, sem o encanamento.

## As implicações no desenho da fundação

### I1. Uma conta nova, e ela muda a árvore de OUs

O AFT mora em conta dedicada, a AFT Management. Ela não existe nas doze de hoje
(`core-banking-*`, `mesa-credito-*`, dados, devsecops, observabilidade, rede,
sandbox, seguranca). Entra em `04-contas` e precisa de lugar na árvore de
`02-ous`: sob `platform` é o candidato natural, e isso é decisão de quem desenha.

### I2. Quem cria a conta deixa de ser o Terragrunt

Hoje a conta nasce de `aws_organizations_account` no estado da instância. Com
AFT, ela nasce do Account Factory, e o estado é do AFT. `04-contas` passa a
emitir pedido em vez de criar recurso.

Consequência direta: **a proteção sai do seu estado**. Hoje a conta tem
`prevent_destroy = true` e `close_on_deletion = false`, com a nota de que
encerramento só acontece por workflow próprio. Nada disso sobrevive à migração,
porque o recurso deixa de ser seu. Compensar exige SCP que negue
`organizations:CloseAccount` fora do papel autorizado, e isso passa a ser
requisito, não opção.

### I3. A ordem das fases muda

Hoje: organização → OUs → SCP → contas → delegated admins → baseline → Identity
Center → backup, com o gate de baseline entre elas.

Com AFT: organização → OUs → landing zone → **AFT instalado e de pé** → pedidos
de conta → customizações. O AFT precisa existir antes da primeira conta nova, e
a instalação dele é um apply próprio, com pré-requisitos próprios.

### I4. Quatro dependências mudam de fonte

`05-delegated-admins` depende de `04-contas/seguranca`, e `07-identity-center`
depende de `04-contas/core-banking-dev`. Com o AFT criando as contas, essas
dependências deixam de ser `dependency` entre units e passam a ser leitura do
que o AFT produziu, provavelmente por SSM ou data source.

### I5. Doze contas existentes: migrar ou conviver

As contas de hoje foram criadas fora do AFT. Ou elas são importadas para a
gerência dele, ou o parque passa a ter duas origens de conta. As duas saídas têm
custo, e escolher exige saber quanto custa a importação na versão do AFT que
estiver em uso.

### I6. A landing zone continua sendo pré-requisito de ambos

`01-landing-zone` está declarada e vazia, esperando a decisão entre o módulo da
Gruntwork e o `mcaf-landing-zone` (o recurso cru foi rejeitado por diff perpétuo
e por recuperação difícil). O AFT **pressupõe Control Tower implantado**, então
essa pendência bloqueia os dois caminhos igualmente. Ela não é argumento a favor
nem contra o AFT.

## O que ainda não sei, e precisa ser confirmado antes de decidir

- **Onde os repositórios do AFT podem morar.** O artigo mostra CodeCommit. Se o
  time usa GitHub, é preciso confirmar na documentação corrente do AFT qual
  provedor de VCS a versão em uso aceita, porque isso muda quem hospeda o
  pedido de conta.
- **Como o AFT importa conta existente**, e o que a importação exige do estado
  atual.
- **Se o Account Factory aceita as tags de alocação** que a fundação hoje aplica
  no nascimento da conta (`dominio`, `ambiente`), já que a decisão 00·D6 diz que
  tag de billing não é retroativa.

Nenhuma das três se responde por leitura do artigo, que é de 2021 e descreve a
solução no estado dela naquele momento.

## As três saídas

**A. Ficar como está.** A fundação já cria conta governada, já espera o
enrollment com gate próprio e já protege a conta. Não paga conta nova, nem
migração, nem encanamento. Perde: fila de pedidos versionada com aprovação
separada, e as provisioning customizations que falam com sistema externo.

**B. Adotar o AFT inteiro.** Vending e customização passam a ser dele. Paga I1 a
I5. Ganha o caminho suportado pela AWS e a esteira pronta.

**C. Compor.** O AFT como fábrica de contas; o bioma gerando o Terraform que vai
dentro de `aft-global-customizations` e `aft-account-customizations`. Os dois
repositórios do AFT são pastas vazias que alguém precisa escrever, e escrever
isso a partir do desenho é o que a ferramenta faz. Paga I1 a I5 do mesmo jeito,
mas o conteúdo continua nascendo do desenho, com as decisões justificadas.

**Recomendação: C**, com uma ressalva de sequência. Antes de mexer na fundação,
vale rodar o AFT numa Organization de ensaio, com uma conta de teste, e medir
quanto custa a importação de uma conta existente. A decisão entre A e C depende
desse número, e ele não está em nenhum artigo.
