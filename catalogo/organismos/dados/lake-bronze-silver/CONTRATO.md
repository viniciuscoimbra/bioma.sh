<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# lake-bronze-silver · organismo

As duas primeiras camadas do lake: o dado cru aterrissado e o dado limpo, em formato aberto.

**Família:** dados  
**Realiza:** 04  
**Durabilidade:** permanente  
**Custo:** medio  
**Teste local:** suportado  
**Tier de teste:** B  

## Cria

- buckets S3 Bronze/Silver
- Iceberg
- lifecycle
- object lock onde exigido
- política de bucket: nega transporte inseguro e acesso direto fora das roles do trilho (K8)

## Não cria

- Gold (do domínio produtor)

## Recebe

- plano
- kms_arn
- principais_de_escrita (roles do trilho)
- excecoes_arns

## Publica (sítios de ligação)

- bucket_arns
- bucket_nomes

## Status

construida (interior escrito e validado com terraform validate)
