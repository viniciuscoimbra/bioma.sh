## ADDED Requirements

### Requirement: A seta desenhada vira dependência na estrutura
Aresta entre duas peças SHALL gerar `dependency` na célula de destino, apontando
a célula de origem, e o input que a consome SHALL referenciar o output dela. Sem
isso a ordem de criação não existe na estrutura.

#### Scenario: Duas peças ligadas na mesma conta
- **WHEN** o bucket é ligado à função no canvas
- **THEN** o `terragrunt.hcl` da função traz um bloco `dependency` para o bucket, com `mock_outputs`

#### Scenario: Peça sem ligação
- **WHEN** a peça não tem seta chegando
- **THEN** a célula dela não traz `dependency` nenhuma

### Requirement: O que o provider recusa não sai calado
A geração SHALL rodar a validação do provider sobre a árvore escrita, e o que
for recusado SHALL aparecer escrito dentro do arquivo e na ficha da peça. A
ferramenta SHALL NOT entregar arquivo que o `terraform validate` recusa sem
dizer.

#### Scenario: Recurso com exigência que o esquema não declara
- **WHEN** a peça é `aws_lambda_function`, que exige um entre `filename`, `image_uri` e `s3_bucket`
- **THEN** o arquivo gerado traz a reclamação do provider escrita, e a ficha pergunta o valor que falta

### Requirement: Atributo não referencia o próprio recurso
Nenhum atributo gerado SHALL referenciar o recurso em que ele está declarado.

#### Scenario: Recurso com atributo homônimo do próprio nome
- **WHEN** o gerador escreve `aws_lambda_function`
- **THEN** `function_name` não sai como `aws_lambda_function.<nome>.function_name`
