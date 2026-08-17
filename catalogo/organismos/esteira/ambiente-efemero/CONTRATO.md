<!-- escrito à mão: o gerador regenera a árvore inteira do live e desfaz a poda
     da fase 1, então este contrato não passou por ferramentas/gerar_estrutura.py.
     Ao reincorporar a receita ao inventário, conferir se os dois concordam. -->


# ambiente-efemero · organismo

A camada de aplicação que nasce com o pull request e morre com ele: a função, a porta privada e o nome próprio daquele PR.

**Família:** esteira  
**Realiza:** 15·D7, 15.2 §3  
**Durabilidade:** efemera  
**Custo:** baixo  
**Teste local:** plan-apenas  
**Tier de teste:** B  

## Cria

- funcao-processadora com o artefato do PR
- alias da função
- api-privada do prefixo
- deployment e stage
- custom domain privado do prefixo
- base path mapping
- associação do domínio ao VPC endpoint
- registro DNS na zona wildcard

## Não cria

- a VPC e o VPC endpoint execute-api (vpc-dominio)
- a zona privada (resolver-dns)
- o certificado wildcard e a CA privada (infra de base)
- o banco e o barramento de não-produção
- a imagem ou o pacote do artefato (esteira)

## Recebe

- prefixo
- tipo
- referencia_artefato
- vpc_endpoint_id
- zona_dns_id
- certificado_wildcard_arn

## Publica (sítios de ligação)

- url

## Premissas

- aplicada pela esteira, nunca pelo live: o ciclo de vida é o do PR
- o mesmo mecanismo serve o preview (pr-NNN) e a homologação (rc-NN); muda a conta
- empacotamento igual ao de dev e prd, por paridade (15·D7)
- todo recurso etiquetado com efemero e prefixo: é como o teto e a varredura o encontram
- teste local: custom domain privado do API Gateway não emulado

## Status

construida (interior escrito e validado com terraform validate)
