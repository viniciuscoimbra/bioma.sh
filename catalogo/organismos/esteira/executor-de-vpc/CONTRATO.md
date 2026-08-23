<!-- escrito à mão: o gerador regenera a árvore inteira do live e desfaz a poda
     da fase 1, então este contrato não passou por ferramentas/gerar_estrutura.py.
     Ao reincorporar a receita ao inventário, conferir se os dois concordam. -->

# executor-de-vpc · organismo

O braço da esteira dentro de uma VPC: aplica de lá o que só se aplica de lá. Existe porque tópico Kafka e schema no registry se criam falando com o broker numa porta privada do plano de rota, e nenhuma esteira alcançava isso.

**Família:** esteira
**Realiza:** 15·D2 (pipeline é o único caminho), 01.1 §3 (tópico público)
**Durabilidade:** estavel
**Custo:** baixo
**Teste local:** fora
**Tier de teste:** C

## Cria

- projeto de build dentro da VPC declarada, com sub-rede e grupo de segurança
- role de execução com o mínimo para existir (log, interface de rede, leitura do artefato)
- policy do trabalho, declarada pela célula e sem default
- grupo de log cifrado, com retenção

## Não cria

- o trabalho em si (vem do buildspec da célula)
- o gatilho (é da esteira, por workflow)
- permissão no destino (o grupo de segurança do destino é que admite este)

## Recebe

- nome, conta, regiao
- vpc_id, subnet_ids e security_group_ids adicionais
- kms_key_arn e balde_artefatos_arn
- buildspec e politica_do_trabalho (sem default: alcance não se herda)
- variaveis de ambiente do trabalho

## Publica

- projeto_nome (o que a esteira dispara)
- role_arn, security_group_id, grupo_de_log

## Premissas

- a sub-rede declarada alcança o destino do trabalho
- os endpoints que o trabalho usa existem na VPC (logs, sts, kms, ecr, s3)
- segredo não entra por variável de ambiente
