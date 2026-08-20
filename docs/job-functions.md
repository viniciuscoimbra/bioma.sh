# Job functions da AWS, como ponto de partida de permissão

Quando um conjunto de permissão nasce, a primeira pergunta é qual política ele
recebe. A AWS mantém uma lista de políticas por função de trabalho, atualiza
cada uma quando nasce serviço novo, e documenta para quem cada uma serve:
[AWS managed policies for job functions](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_job-functions.html).

Escrever política do zero para cada papel é o que a AWS chama de menor
privilégio, e é o alvo. A job function é onde se começa, não onde se termina: a
própria AWS escreve que estas políticas **não** concedem menor privilégio, e
recomenda medir o uso com o IAM Access Analyzer para depois escrever a política
enxuta.

O bioma oferece esta lista como sugestão no campo `managed_policies`. Sugestão,
e não default: quem desenha escolhe, e o campo aceita qualquer ARN.

## A lista, com o que a AWS diz de cada uma

| política | ARN | para quem |
|---|---|---|
| ViewOnlyAccess | `arn:aws:iam::aws:policy/job-function/ViewOnlyAccess` | lista e descreve recurso, sem ler conteúdo |
| SystemAdministrator | `arn:aws:iam::aws:policy/job-function/SystemAdministrator` | monta e mantém recurso de operação |
| DatabaseAdministrator | `arn:aws:iam::aws:policy/job-function/DatabaseAdministrator` | monta, configura e mantém banco |
| NetworkAdministrator | `arn:aws:iam::aws:policy/job-function/NetworkAdministrator` | monta e mantém recurso de rede |
| DataScientist | `arn:aws:iam::aws:policy/job-function/DataScientist` | roda consulta e análise sobre o dado |
| Billing | `arn:aws:iam::aws:policy/job-function/Billing` | vê custo, configura e autoriza pagamento |
| SecurityAudit | `arn:aws:iam::aws:policy/SecurityAudit` | audita configuração e lê log para investigar |
| AWSSupportAccess | `arn:aws:iam::aws:policy/AWSSupportAccess` | abre e acompanha caso de suporte |
| ReadOnlyAccess | `arn:aws:iam::aws:policy/ReadOnlyAccess` | lê todo recurso, **conteúdo incluído** |
| PowerUserAccess | `arn:aws:iam::aws:policy/PowerUserAccess` | faz tudo menos IAM, Organizations e Account |
| AdministratorAccess | `arn:aws:iam::aws:policy/AdministratorAccess` | faz tudo, e delega |

Quatro delas moram fora do prefixo `job-function/`, e copiar o caminho errado dá
"política não existe" no apply: `SecurityAudit`, `AWSSupportAccess`,
`ReadOnlyAccess`, `PowerUserAccess` e `AdministratorAccess` ficam na raiz.

## As três armadilhas

**ReadOnlyAccess não é ViewOnlyAccess.** A primeira lê o conteúdo de balde do S3
e de tabela do DynamoDB; a segunda só lista e descreve. Num banco, dar a
primeira a quem precisava da segunda é dar leitura de dado de cliente a quem
pediu para enxergar o inventário.

**PowerUserAccess parece intermediário e não é.** Ele faz tudo, com exceção de
IAM, Organizations e Account Management. Numa conta de workload isso é quase
tudo que existe.

**Job function que passa role.** DatabaseAdministrator, DataScientist,
NetworkAdministrator e SystemAdministrator concedem `iam:PassRole` para roles
com nome em padrão fixo (`rds-monitoring-role`, `flow-logs-*`, `ec2-sysadmin-*`
e outros). A role precisa existir e ser criada por quem opera, e o nome dela é
parte da permissão.

## Modelar por função, e não por cargo

O que vira conjunto de permissão é a **função**, e não o cargo da pessoa.
"Arquiteto de dados" não é permissão: ele lê o inventário, opera a plataforma de
dados e às vezes administra um banco, e cada uma dessas é uma função com alcance
próprio.

A pessoa **acumula**. Ela entra nos grupos das funções que exerce, e o alcance
dela é a soma. Isso resolve sozinho o caso que uma tabela de cargo para
permissão nunca resolve: a pessoa que faz duas coisas, a que muda de área, e a
que cobre férias de outra.

Consequências práticas:

- Grupo tem o nome da função, não do cargo (`dominio-exemplo-dba`, e não
  `dba-senior`). Nome de cargo envelhece a cada reorganização; a função continua
  a mesma.
- Função nova nasce quando aparece necessidade que nenhuma existente cobre, e
  não quando aparece cargo novo no organograma.
- Ninguém precisa manter um de-para de cargo para grupo. Ele fica desatualizado
  na primeira contratação e vira documento que mente.
- A revisão de acesso pergunta "esta pessoa ainda exerce esta função?", uma
  função de cada vez, em vez de reavaliar um pacote fechado.

## Quando não usar

Papel que a arquitetura desenhou não vira job function por conveniência. Se o
papel é "abrir sessão gravada só nas máquinas etiquetadas do fornecedor",
nenhuma política da AWS faz isso, e a política própria da instituição é a única
resposta. A job function entra quando o papel de fato é o papel comum que a AWS
descreve.
