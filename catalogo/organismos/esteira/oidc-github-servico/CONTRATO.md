<!-- escrito à mão: o gerador regenera a árvore inteira do live e desfaz a poda
     da fase 1, então este contrato não passou por ferramentas/gerar_estrutura.py.
     Ao reincorporar a receita ao inventário, conferir se os dois concordam. -->


# oidc-github-servico · organismo

O contrato de deploy do repositório de aplicação em cada conta: quatro roles, uma por estágio da esteira, confiando no Environment do GitHub que aprova aquele estágio.

**Família:** esteira  
**Realiza:** 15·D2, 15·D7  
**Durabilidade:** estavel  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** B  

## Cria

- role esteira-registro (push da imagem/pacote no build)
- role esteira-dev (preview por PR e deploy contínuo em dev)
- role esteira-hml (candidato de homologação)
- role esteira-prd (só na conta de produção)
- trust por GitHub Environment, não por evento

## Não cria

- o OIDC provider (reaproveita o de organismos/esteira/oidc-github, um só por conta)
- os Environments do GitHub (são do repositório do serviço, fora do Terraform)

## Recebe

- repo_servico
- oidc_provider_arn
- roles

## Publica (sítios de ligação)

- role_arns

## Premissas

- distinto de organismos/esteira/oidc-github: aquele confia no repo -live de infraestrutura, este confia no repo de aplicação
- o sub claim do GitHub muda de formato quando o job referencia um Environment (`repo:org/repo:environment:NOME`, e não `repo:org/repo:pull_request`), e todo workflow desta esteira referencia Environment
- role de produção só nasce na instância da conta de produção (quem instancia declara só as roles daquela conta em `roles`); não existe em dev nem hml
- teste local: CreateOpenIDConnectProvider não emulado

## Status

construida (interior escrito e validado com terraform validate)
