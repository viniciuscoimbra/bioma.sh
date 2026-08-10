<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# politica-msk-cluster · ligação

O lado do barramento na autorização entre contas: o cluster admite a conta consumidora.

**Dono:** barramento  
**Teste local:** fora  

## Cria

- cluster policy admitindo conta consumidora

## Permissões exigidas

- kafka:PutClusterPolicy

## Recebe

- cluster_arn
- conta_consumidora

## Premissas

- teste local: PutClusterPolicy do MSK não emulado

## Status

construida (interior escrito e validado com terraform validate)
