# Quando a nuvem e o plano discordam

Três famílias de defeito que produzem o mesmo sintoma e pedem curas diferentes.
Nas três a nuvem está certa e a ferramenta reprova, e é essa combinação que as
torna caras: quem lê o erro conclui que nada aconteceu, e o que aconteceu foi
tudo, só não foi registrado.

Todas foram medidas em instalação real entre 26 e 28 de agosto de 2026, e todas
custaram tempo antes de virarem nome.

## O denominador

O Terraform decide comparando duas leituras: o que a receita declara e o que o
provider lê da nuvem. Ele assume que a segunda é fiel, completa e imediata. As
três famílias abaixo são os três jeitos de essa suposição falhar, e nenhum deles
é desvio de configuração:

    família 1   a leitura não devolve o que a escrita aceitou
    família 2   a leitura chega antes de a escrita terminar de valer
    família 3   o recurso nasceu de um ato que ninguém declarou

Nenhuma aparece no plano como erro. As três aparecem como diferença, e o
Terraform trata diferença de um jeito só: propondo mudar.

## Família 1: a verdade mora fora do estado

O provider lê um valor que a API não devolve como foi escrito, compara com o
declarado, e a diferença é estrutural.

**A API aceita e não devolve.** `aws_guardduty_member.email` é aceito na criação
e ausente na leitura. O provider grava vazio, compara com o declarado, e o campo
força substituição. Substituir membro do GuardDuty é desligar a detecção naquela
conta e religar. Em 98 contas, a cada apply.

**A API devolve outra verdade.** `aws_guardduty_member.invite` volta `true`,
porque para o serviço associação por Organizations também é associação. O
provider lê `true`, compara com o `false` declarado, e traduz em
`DisassociateMembers` nas mesmas 98 contas. A AWS recusou todas porque o
auto-enable estava em `ALL`. Foi a recusa dela que impediu o estrago, e não o
desenho de quem aplicou.

**A API preenche o que você não escreveu, e a ordem importa.**
`aws_guardduty_organization_configuration_feature.additional_configuration` é
bloco ordenado. O serviço preenche as sub-configurações sozinho; num map o
Terraform as ordena alfabeticamente, e posição trocada força substituição.

**A associação mora em duas contas.** `aws_route53_zone_association` é criada de
um lado e a zona vive do outro. Gerida junto com a zona, o Terraform recria a
cada apply a associação que ele não enxerga.

Cura: `ignore_changes` no campo, ou declarar explicitamente o que a API preenche.
O critério para escolher entre os dois é uma pergunta só: aquele valor é
**decisão** ou é **eco**? Decisão se declara; eco se ignora. Errar isso nos dois
sentidos custa igual, porque ignorar uma decisão esconde desvio real.

## Família 2: a verdade demora a chegar

A chamada foi aceita, o recurso ainda não está pronto para a chamada seguinte, e
a ferramenta desiste antes.

**O provider desiste antes de a AWS terminar.**
`aws_vpc_block_public_access_options` falhou em onze contas com "waiting for
create", e `update-complete` em todas elas quando conferido depois. A cura é
timeout maior, com o comentário dizendo que ali se mede propagação e não
trabalho: um timeout sem essa frase parece folga, e alguém o encurta.

**O serviço recusa duas mudanças ao mesmo tempo.**
`aws_inspector2_delegated_admin_account` responde `ConflictException: Multiple
changes cannot be done at the same time` quando duas regiões saem em paralelo,
ainda que sejam regiões diferentes na mesma conta. Cura: `depends_on` artificial,
existindo só para serializar, e dizendo isso no comentário.

**O recurso fica em `modifying` e nega o que acabou de aceitar.** Depois de
`enable-http-endpoint` num Aurora, o cluster entra em `modifying` e nesse estado
responde `InvalidResourceStateFault` a `disable-http-endpoint`, e
`DatabaseNotFoundException` ("Cannot find DBInstance in DBCluster") ao Data API,
com a instância `available`. Os dois erros dizem "ainda não" e não "não existe".
Distinguir os dois é o trabalho: repetir sobre "não existe" é laço infinito, e
falhar sobre "ainda não" é desistir de coisa que ia funcionar.

## Família 3: o recurso nasceu de um ato que ninguém declarou

Nem leitura infiel nem propagação lenta. O recurso simplesmente já existe,
porque outro ato o criou, e a receita que o declara chega depois.

**O efeito colateral de outro recurso.** Delegar um serviço de detecção já o
liga na conta delegada: declarar o detector do GuardDuty ou a conta do Macie ali
devolve "already enabled". Quem criou foi a delegação, e ninguém escreveu isso.

**O ato humano que veio antes.** Um usuário de banco criado à mão para
desbloquear um teste; um volume anexado pelo console sem cifra; um domínio
liberado no firewall por apply direto. A receita chega depois e propõe criar o
que já está lá, ou pior, substituir.

**A configuração de organização que cria nas contas-membro.** GuardDuty,
Inspector e Macie ligados na organização fazem nascer recurso em toda conta, e
nenhuma árvore local declara aquilo. É esperado, e precisa estar escrito onde
alguém vai procurar quando o plano estranhar.

Cura: reconciliar antes, nunca recriar. `import` quando o recurso deve ser
governado pela árvore; declarar por que ele fica de fora quando não deve. E o
teste que separa os dois: se o recurso sumisse agora, quem o traria de volta? Se
a resposta for a árvore, ele entra; se for outro ato, ele fica de fora e a razão
vai escrita.

## O que fazer antes de aplicar qualquer coisa em escala

As três famílias têm a mesma defesa, e ela não é uma flag do Terraform:

**Medir o estado antes de espalhar o padrão.** Antes de aplicar bloqueio de
gateway em toda a organização, contar quantos internet gateways cada conta tem.
As de domínio tinham zero, e o bloqueio era inofensivo; a conta de rede tinha um,
e é a que hospeda a saída de todo mundo. O padrão uniforme ali teria cortado o
egresso da organização inteira, e o plano não avisaria, porque para o Terraform
a chamada é idêntica nas duas.

**Conferir o efeito, e não o ato.** Configuração aplicada não é o mesmo que
efeito produzido. GuardDuty org-wide respondeu verde nas duas regiões com
`list-members` devolvendo zero, porque `auto_enable_organization_members = ALL`
governa quem chega e não quem já está. A pergunta certa não era o
`describe-organization-configuration`, era a contagem de membros.

**Desconfiar do plano limpo em mudança relacional.** Quando a mudança tem dois
lados em contas diferentes, cada lado fica certo sozinho e o plano de cada um
sai limpo. Três endpoints centrais nasceram com as zonas associadas a duas VPCs
das cinco declaradas, e o plano das duas células estava limpo, porque a falha
morava entre elas.
