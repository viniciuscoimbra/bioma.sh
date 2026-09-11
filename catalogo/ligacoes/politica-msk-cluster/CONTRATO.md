<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# politica-msk-cluster · ligação

O lado do barramento na autorização entre contas: o cluster admite a conta consumidora.

**Dono:** barramento  
**Teste local:** fora  

## Cria

- cluster policy admitindo conta consumidora (conexão privada) e roles de conector de outra conta (protocolo IAM direto)
- statements por entrada de leitor e de escritor, cada uma com os próprios tópicos e grupos

## Permissões exigidas

- kafka:PutClusterPolicy

## Recebe

- cluster_arn
- contas_consumidoras
- conectores_arns
- topicos_dos_conectores
- grupos_dos_conectores
- produtores_arns
- topicos_dos_produtores
- leitores
- escritores

## Premissas

- teste local: PutClusterPolicy do MSK não emulado

## Status

construida (interior escrito e validado com terraform validate)
