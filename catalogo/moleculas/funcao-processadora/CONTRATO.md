<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# funcao-processadora · molécula

O processador básico de eventos do desenho: uma função que executa código de negócio, com a permissão, o registro e o alarme que nascem junto dela.

**Blocos:** 05, 06  
**Realiza:** consumo e adapters  
**Durabilidade:** efemera  
**Custo:** baixo  
**Teste local:** suportado  
**Tier de teste:** B  

## Cria

- aws_lambda_function com pacote inicial
- aws_iam_role dedicada com trust do Lambda
- aws_cloudwatch_log_group
- aws_cloudwatch_metric_alarm (namespace AWS/Lambda)

## Não cria

- o tópico que consome
- o segredo que lê
- as versões seguintes do código (esteira)

## Recebe

- nome
- memoria_mb
- pacote_inicial

## Publica (sítios de ligação)

- nome_da_funcao
- permissao_arn

## Premissas

- indivisibilidade por política: role e log dedicados (lintado)

## Status

construida (interior escrito e validado com terraform validate)
