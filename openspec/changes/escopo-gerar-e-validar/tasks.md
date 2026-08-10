# Tasks — gerar e validar

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.
> **Ordem**: 1 antes de tudo. É decisão do dono, e o resto do trabalho muda conforme a resposta.

## 1. A decisão

- [x] 1.1 [fable] Decidir entre A e B. Dependências: decisão do dono. Evidência 2026-08-07: **B**. O objetivo é o download da estrutura validada, para quem desenhou subir na máquina dele, local ou na AWS de verdade; executar não faz parte disso, e a camada de execução cobra seis dependências na instalação e manutenção permanente. Sincronizar no GitHub de quem usa fica para o site, num passo posterior.

## 2. O comando

- [x] 2.1 [opus] Tirar `apply` e `destroy` do `bioma.sh`. Dependências: 1.1. Evidência 2026-08-07: a ação padrão virou `receita` e `--destruir` virou `receita-destruir`; contra uma árvore gerada em /tmp, `./bioma.sh --perfil local --area live/plataforma` imprimiu `cd <area>` e `terragrunt run --all apply … --queue-exclude-dir` para os três caminhos de produção, e a variante `--destruir` imprimiu o mesmo com `destroy`, as duas terminando sem tocar em nuvem nem emulador. O `terragrunt run --all` só executa quando a ação é `plan`.
- [x] 2.2 [sonnet] Pré-requisito por camada. Dependências: 2.1. Evidência 2026-08-07: o comando exige `python3` e `jq` sempre, e `terragrunt`/`terraform` só quando a ação é `plan`; `opa` ausente vira aviso dizendo que o gate de durabilidade fica de fora, em vez de abortar; o emulador e a conferência de arquitetura do terraform passaram a valer só no plano. A receita rodou nesta máquina, que não tem opa nem emulador no ar.
- [x] 2.3 [sonnet] Degrau local documentado. Dependências: 2.1. Evidência 2026-08-07: `testes/degrau-local.md` traz os quatro passos (emulador, buckets de estado, receita executada por quem quiser, smoke), e o comando continua imprimindo a receita com as exclusões de produção. O `fumaca.sh` roda pelo documento; rodá-lo aqui exigiria o docker no ar, que esta máquina não tem agora.

## 3. A tela

- [x] 3.1 [fable] A tela entrega a receita. Dependências: 1.1. Evidência 2026-08-07: a barra passou a ter `View code, Questions, Review, Copy, Simulate, The recipe`, sem Apply nem Destroy (medido no navegador); a gaveta traz os dois comandos copiáveis e a linha `REFUSES TO DESTROY: 4 PERMANENT CELL(S) · s3-bucket dynamodb-table rds-cluster kms-key`, tirada da proposta.
- [x] 3.2 [sonnet] A janela vira registro. Dependências: 3.1. Evidência 2026-08-07: o campo mora na gaveta da receita e entra no comando de destruir como comentário (`# janela: …`); o modal de destruição e o `destruirMesmo` da composição foram removidos.

## 4. A garantia no que é gerado

- [x] 4.1 [opus] A trava mora no gerado. Dependências: 1.1. Evidência 2026-08-07: na árvore de referência, `catalogo/organismos/plataforma/dados/s3-bucket/main.tf` (tecido permanente) tem `prevent_destroy = true`, e as duas células estáveis (lambda-function, sqs-queue) têm zero, que é o esperado: estável cai com janela declarada. A política de durabilidade em `politicas/` continua versionada junto.
- [~] 4.2 [sonnet] O gate no pipeline de quem usa. Dependências: 4.1. Evidência 2026-08-07: seção escrita no README com os três passos (plan, show -json, opa eval), a saída de reprovação e o que cada classificação recusa. Rodar contra um plano destrutivo ficou por fazer: esta máquina não tem `opa` instalado, e a prova pede a execução de verdade, não a leitura da política.

## 5. A promessa reescrita

- [x] 5.1 [fable] Reescrever a promessa. Dependências: 2.1, 3.1. Evidência 2026-08-07: o README abre em "transforma arquitetura desenhada em Terraform e Terragrunt … você baixa e sobe onde quiser", tem a tabela das três camadas de instalação (gerar: Python e navegador; provar que compila: terraform; parecer e leitura de imagem: chave de modelo), e ganhou em "Para que não serve" a linha de que nenhuma chave de nuvem passa pela ferramenta. O PRODUCT.md acompanha.
