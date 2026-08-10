## Why

O catálogo tem quatro naturezas: organismo, molécula, ligação e artefato. O
desenho mostra três. Artefato não aparece.

O caso que revelou isso: a esteira de entrega. O `.bio` da esteira traz o OIDC,
o scan do registro e o workspace, que são organismos, e não traz os seis
workflows, que são o artefato `esteira-workflows`. A entrega principal daquela
área é justamente o que não se vê. Quem olha o desenho da esteira conclui que a
esteira é três caixas de IAM.

O tradutor também não tem de onde tirar artefato: a tabela de serviços de um
bloco descreve serviço da nuvem, e artefato não é serviço. Ele nasce do
catálogo, ligado ao trilho que é dono dele.

## What Changes

- O grafo aceita nó de natureza `artefato`, com o dono e o que ele entrega.
- O tradutor lê o catálogo de artefatos e acrescenta ao desenho os que têm dono
  no trilho daquele recorte.
- A tela rotula artefato com marca própria e verbete de ajuda nas duas línguas,
  porque hoje um tipo que ela não conhece aparece sem etiqueta nenhuma.
- Artefato não vira célula do live, e o desenho diz isso: ele é entregue à
  esteira, não aplicado pelo comando.

## Capabilities

### New Capabilities

- `artefato-no-desenho`: como o que a esteira recebe aparece no desenho.

## Impact

- Nenhum `.bio` existente quebra: nó de artefato é acréscimo.
- A tela precisa de mudança no app, então esta change carrega o portão de
  construção e a prova de navegador.
- O gerador continua ignorando artefato ao escrever a árvore, e a árvore gerada
  não muda. O que muda é o pacote que a pessoa leva para a máquina, que passa a
  incluir o interior do artefato.
