# bioma.sh

## O que é

Ferramenta que transforma arquitetura de nuvem desenhada em Terraform e Terragrunt: pastas, arquivos, contratos, travas de ciclo de vida e a receita para operar. Ela gera, mostra o que decidiu, prova que compila e entrega na máquina de quem desenhou. Aplicar é do time que opera, no pipeline dele.

**Register:** product. A tela serve o produto, não é o produto.

## Usuários

**O arquiteto que não escreve Terraform.** Desenha arquitetura há anos, entende conta, rede, domínio e dado. Nunca escreveu HCL e não pretende. Foi a abstração biológica (átomo, molécula, célula, tecido) que fez ele entender infraestrutura como código pela primeira vez. Ele precisa montar o desenho, ver a estrutura nascer e responder perguntas em português. Se a tela pedir uma decisão que exige saber Terraform, ele para.

**O engenheiro que vive de Terraform.** Oito anos de HCL, três de Terragrunt em produção. Desconfia de gerador de código por experiência própria. Ele quer velocidade e segurança, e só confia no que consegue ler: o HCL gerado e o comando executado. Se a ferramenta esconder o que faz, ele fecha e escreve à mão.

Os dois olham a mesma tela ao mesmo tempo. A tela precisa servir aos dois sem virar duas telas.

## O trabalho que a tela faz

Montar a arquitetura visualmente, ver a estrutura de pastas e o código nascerem enquanto se monta, e disparar o ciclo de vida com o comando à vista.

Três momentos, na mesma tela:
1. **Montar.** Escolher recursos da AWS, posicionar, ligar um no outro, dizer em que conta cada um mora.
2. **Ver.** A árvore de pastas e os arquivos aparecendo, com a razão de cada classificação escrita ao lado.
3. **Agir.** Criar, atualizar, destruir, provar, cada botão mostrando o comando que executa.

## Tom

Direto e técnico, em português. A ferramenta explica o porquê de cada decisão que toma, sempre. Nunca decide em silêncio, nunca esconde o comando, nunca usa palavra bonita no lugar de palavra exata.

Vocabulário do modelo biológico onde ele ajuda a entender (tecido permanente, célula, ligação), vocabulário da AWS onde a precisão importa (conta, região, ARN).

## Anti-referências

**Não é ferramenta de diagrama.** Draw.io e Lucidchart desenham bonito e não produzem nada. Aqui o desenho existe para virar código.

**Não é console de nuvem.** O console da AWS mostra o que existe. Aqui se decide o que vai existir.

**Não é caixa-preta com botão mágico.** Todo gerador que esconde o que faz perde o engenheiro no primeiro minuto. O código gerado e o comando executado ficam à vista o tempo todo.

**Não é SaaS de infraestrutura.** Roda local, sem login, sem nuvem, sem conta.

## Princípios

**Mostrar o comando sempre.** Botão que faz algo mostra o que vai rodar, antes de rodar.

**Explicar toda classificação.** Quando a ferramenta decide que algo é tecido permanente ou que uma seta virou ligação, a razão aparece ao lado, escrita.

**Perguntar em português, uma coisa por vez.** Quem preenche não precisa saber o nome do argumento no provider.

**Errar cedo e barulhento.** Formato errado para antes de tocar a nuvem, com o que foi escrito, o que se aceita e um exemplo certo.

**Nada é destruído por descuido.** A classificação de cada parte decide o que pode cair, e o que é permanente não cai por rotina.
