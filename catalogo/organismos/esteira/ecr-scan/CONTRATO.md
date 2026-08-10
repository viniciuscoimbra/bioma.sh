<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# ecr-scan · organismo

O registro de imagens com verificação contínua de vulnerabilidade.

**Família:** esteira  
**Realiza:** 15·D3  
**Durabilidade:** estavel  
**Custo:** medio  
**Teste local:** fora  
**Tier de teste:** B  

## Cria

- ECR repos
- scan on push
- Inspector (delegado)
- política de imagem por digest

## Não cria

- nada a declarar

## Recebe

- repos

## Publica (sítios de ligação)

- registry_url

## Premissas

- teste local: PutRegistryScanningConfiguration não emulado

## Status

construida (interior escrito e validado com terraform validate)
