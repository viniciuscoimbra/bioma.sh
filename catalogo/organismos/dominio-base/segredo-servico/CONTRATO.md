<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# segredo-servico · organismo

O cofre do segredo de configuração sensível de um serviço (connection string do banco, certificado de fornecedor) — a receita cria só o recurso vazio; o time do serviço preenche a versão por fora.

**Família:** dominio-base
**Realiza:** add-ambiente-efemero, teste de ponta a ponta do preview
**Durabilidade:** permanente
**Custo:** baixo
**Teste local:** plan-apenas
**Tier de teste:** C

## Cria

- aws_secretsmanager_secret (o cofre; o valor entra por canal próprio, nunca por esta receita)

## Não cria

- o conteúdo do secret: quem preenche a versão do segredo é o time do serviço, via secret de pipeline do repositório do serviço (o repositório do serviço), nunca commitado em texto claro no catálogo
- a Lambda que lê este segredo (core-banking/desembolso)

## Recebe

- nome
- kms_key_arn

## Publica (sítios de ligação)

- arn
- nome

## Premissas

- a versão do secret (connection string, certificado de fornecedor) é aplicada fora desta receita, por quem sabe o valor real: um módulo que recebe o valor como input o grava no state do Terraform, então o valor nunca deve ser passado como input aqui

## Status

construida (interior escrito e validado com terraform validate)
