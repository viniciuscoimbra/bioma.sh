## Why

O Account Factory for Terraform é a solução da AWS para vender conta governada: pedido versionado em repositório, fila, espera do enrollment e customização em três camadas, tudo por CodePipeline e Step Functions numa conta dedicada.

A fundação de referência resolve o mesmo problema por outro caminho: Terragrunt criando `aws_organizations_account` dentro de OU registrada com `aws_controltower_baseline` 5.0, e o comando conferindo `list-enabled-baselines` antes de seguir. Funciona, e tem proteções que o AFT não impõe.

A pergunta que motiva este change é se vale adotar o AFT, e ela não se responde no vazio: adotar muda o desenho da fundação em pontos que já estão construídos e em uso. Este documento levanta a comparação item a item, nomeia cada implicação, e deixa a decisão apoiada em fato.

Há ainda um encaixe que interessa ao bioma como produto: os repositórios `aft-global-customizations` e `aft-account-customizations` são pastas de Terraform que alguém precisa escrever à mão. Escrever isso a partir de arquitetura desenhada é o que a ferramenta faz.

## What Changes

Nada é executado enquanto a decisão não for tomada. O que este change entrega primeiro é o levantamento e a decisão; o resto depende dela.

- Comparação item a item entre o que a fundação cria hoje e o que o AFT esperaria encontrar.
- As implicações no desenho da fundação, cada uma com o que quebra e o que compensa.
- **BREAKING**, se a decisão for adotar: `04-contas` deixa de criar conta por `aws_organizations_account` e passa a emitir pedido de conta; a ordem das fases muda; a proteção `prevent_destroy` da conta sai do estado da instância.
- Se a decisão for adotar, o bioma passa a emitir no layout dos repositórios do AFT, além do layout de hoje.

## Capabilities

### New Capabilities

- `vending-de-contas`: como uma conta governada nasce, quem a protege e quem espera o enrollment.

## Impact

- O levantamento não muda uma linha de código: ele muda o que se sabe antes de decidir.
- Adotar mexe em `02-ous`, `04-contas`, `05-delegated-admins`, `07-identity-center` e na ordem de execução do comando, porque todos eles hoje dependem de conta criada pelo Terragrunt.
- Doze contas já existem criadas pelo caminho atual. Passar a gerência delas para o AFT é migração, e não configuração.
