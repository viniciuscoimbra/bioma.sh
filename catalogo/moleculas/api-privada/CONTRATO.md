<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# api-privada · molécula

Porta síncrona privada: expõe uma API dentro da rede, sem internet, com autorização por identidade.

**Blocos:** 05, 06  
**Realiza:** bordas síncronas privadas  
**Durabilidade:** efemera  
**Custo:** baixo  
**Teste local:** suportado  
**Tier de teste:** B  

## Cria

- aws_api_gateway_rest_api privada
- autorização IAM (SigV4)
- policy do endpoint

## Não cria

- o VPC endpoint execute-api (é da vpc-dominio; recebe o id)

## Recebe

- nome
- vpc_endpoint_id
- rotas

## Publica (sítios de ligação)

- invoke_url
- execution_arn

## Status

construida (interior escrito e validado com terraform validate)
