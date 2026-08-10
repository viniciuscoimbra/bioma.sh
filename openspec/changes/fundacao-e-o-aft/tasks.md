# Tasks — a fundação e o AFT

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.
> **Ordem**: o grupo 1 está feito e é o que embasa a decisão. O grupo 2 responde o que o artigo não responde. Nada do grupo 4 começa antes da decisão em 3.1.

## 1. O levantamento

- [x] 1.1 [fable] Comparar item a item o que a fundação cria hoje com o que o AFT esperaria encontrar. Dependências: nenhuma. Evidência 2026-08-07: tabela de doze linhas em `design.md`, feita contra o artigo oficial e contra `implementacao/bioma/infra`: a conta nasce de `aws_organizations_account` em `04-contas`, a OU é registrada com `aws_controltower_baseline` 5.0 em `02-ous`, o gate de enrollment é `controltower list-enabled-baselines --include-children` no `bioma.sh`, e o equivalente de global customization é `06-baseline-seguranca`.
- [x] 1.2 [fable] Nomear cada implicação da adoção no desenho da fundação. Dependências: 1.1. Evidência 2026-08-07: seis implicações em `design.md` (I1 conta AFT Management e lugar na árvore de OUs; I2 quem cria a conta e a perda do `prevent_destroy`; I3 a ordem das fases; I4 as dependências de `05-delegated-admins` e `07-identity-center`; I5 as doze contas existentes; I6 a landing zone como pré-requisito comum), cada uma com o que quebra e o que compensa.

## 2. O que o artigo não responde

- [ ] 2.1 [sonnet] Confirmar na documentação corrente do AFT quais provedores de repositório a versão em uso aceita, e se o time pode manter os pedidos no GitHub. Dependências: nenhuma. Evidência esperada: o trecho da documentação com a versão, e a decisão de onde os quatro repositórios moram.
- [ ] 2.2 [opus] Levantar o procedimento de importar conta existente para a gerência do AFT, e o que ele exige do estado atual. Dependências: 2.1. Evidência esperada: o procedimento, e uma estimativa de esforço para as doze contas.
- [ ] 2.3 [sonnet] Confirmar se o Account Factory aplica as tags de alocação (`dominio`, `ambiente`) no nascimento da conta, já que 00·D6 diz que tag de billing não é retroativa. Dependências: 2.1. Evidência esperada: a resposta com a fonte, e o plano B caso não aplique.
- [ ] 2.4 [opus] Rodar o AFT numa Organization de ensaio: instalar, pedir uma conta de teste, medir o tempo até `SUCCEEDED` e tentar importar uma conta criada por fora. Dependências: 2.1, 2.2. Evidência esperada: os tempos medidos, o que quebrou e o custo real da importação.

## 3. A decisão

- [x] 3.1 [fable] Decidir entre A, B e C. Dependências: 2.4 (dispensada). Evidência 2026-08-07: **A, por ora**. A proposta aprovada não pede AFT: ela promete que "quem cria e governa isso é o Control Tower", e isso já está de pé (OU registrada com `aws_controltower_baseline` 5.0, conta governada com trava, e o gate de `list-enabled-baselines` no comando). Adotar agora custaria as seis implicações de `design.md` num prazo de aplicação apertado, sem entregar nada que a proposta prometa. O grupo 2 fica como pesquisa para depois da aplicação, e o C continua sendo o desenho recomendado quando houver folga.

## 4. Se a decisão for B ou C

> Dormente desde 2026-08-07 pela decisão A em 3.1. Só acorda se a decisão mudar.

- [ ] 4.1 [opus] A conta AFT Management: onde ela nasce na árvore de OUs e o que ela recebe de baseline. Dependências: 3.1. Evidência esperada: o desenho da árvore atualizado e a conta criada em ensaio.
- [ ] 4.2 [opus] Compensar a perda do `prevent_destroy`: SCP que negue `organizations:CloseAccount` fora do papel autorizado, aplicada antes de qualquer migração. Dependências: 3.1. Evidência esperada: a SCP aplicada e uma tentativa de encerramento recusada em ensaio.
- [ ] 4.3 [opus] Reordenar as fases da fundação com o AFT no lugar certo, e mudar as dependências de `05-delegated-admins` e `07-identity-center` para leitura do que o AFT produz. Dependências: 4.1. Evidência esperada: o plano da fundação inteira rodando na ordem nova, em ensaio.
- [ ] 4.4 [fable] O bioma emite no layout do AFT: `aft-global-customizations` e `aft-account-customizations` a partir do mesmo desenho. Dependências: 3.1. Evidência esperada: a árvore gerada nos dois layouts a partir do mesmo `.bio`, e a diferença entre elas explicada.
- [ ] 4.5 [opus] Migrar as doze contas, ou registrar por escrito a decisão de conviver com duas origens. Dependências: 2.2, 4.2. Evidência esperada: as contas importadas com o estado conferido, ou o documento da decisão.
