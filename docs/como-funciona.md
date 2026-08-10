# Como funciona

O bioma.sh usa nomes biológicos para dar regra a uma árvore de infraestrutura. O nome serve para decidir dono, ciclo de vida e fronteira, não para enfeitar a interface.

## Vocabulário

| Nome | No Terraform e Terragrunt | Regra prática |
|---|---|---|
| átomo | recurso do provider | vem de tabela e esquema, nunca de semelhança de nome |
| molécula | módulo Terraform | junta recursos que nascem e morrem juntos |
| célula | unit Terragrunt com state próprio | tem dono, conta, ambiente e durabilidade |
| ligação | `dependency`, policy, grant ou associação | conecta células sem misturar states |
| fronteira | sistema que o nosso Terraform não governa | vira contrato, não receita aplicada |
| tecido | classe de durabilidade | decide o que pode cair por rotina |
| organismo | capacidade implantável | vira receita de catálogo |
| hormônio | valor publicado por uma célula e lido por outra | carrega endereço, ARN, id ou parâmetro |

## Do desenho à árvore

1. A tela monta um grafo: peças, contas, ambientes e setas.
2. O tradutor classifica cada peça: trilho, OU, ambiente, tipo, durabilidade e razão.
3. O gerador escreve o catálogo: `main.tf`, `variables.tf`, `outputs.tf`, contrato e perguntas pendentes.
4. O gerador escreve o live: `terragrunt.hcl`, dependências e mocks só quando a origem publica o valor.
5. O diagnóstico lê desenho e árvore em camadas. Erro barra entrega. Aviso fica escrito para a pessoa decidir.
6. O usuário baixa a árvore e aplica onde quiser. O bioma.sh não recebe credencial de produção nem executa apply.

## Limites conhecidos

- Setas nem sempre viram valor em `dependency.outputs`; quando a regra não consegue provar o encaixe, o valor fica na ficha.
- Artefatos de esteira ainda têm tasks abertas no OpenSpec: a volta pela especificação perde natureza em alguns casos e nem todos os arquivos do artefato entram no pacote.
- A tela ainda tem avisos abertos para OU e ambiente em projeto antigo.
- O `@refy/ui` está versionado com licença própria; trocar por pacote publicado depende de publicação externa.
