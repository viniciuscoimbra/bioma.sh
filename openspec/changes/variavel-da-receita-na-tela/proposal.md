## Why

A tela pergunta as variáveis que o gerador deduz do esquema da AWS, e só
essas. Célula que aponta receita do catálogo não gera pergunta de variável
nenhuma: medido em 2026-08-18 contra um projeto real de 157 células, uma
unidade de `organismos/rede/vpc-plataforma` volta com **zero perguntas**.

O efeito prático aparece quando o catálogo é o caminho normal, que é o caso de
qualquer instalação que já existe. As variáveis que a receita declara
(`supernet`, `cidr_inspecao`, `camadas`, `retencao_backup_dias`) não têm campo
na tela, e quem desenha não descobre que elas existem: descobre no apply, com
"No value for required variable".

O dicionário já sabe sugerir valor com a prática atrás (RFC 1918 para espaço
privado, RFC 6598 para o que não mora em plano de rota), e essa sugestão não
alcança nenhuma dessas variáveis hoje.

## What Changes

- A tradução lê o `variables.tf` da receita apontada pelo nó e produz uma
  pergunta por variável sem default, mais as com default como campo opcional.
- A pergunta herda `description` da variável como explicação, e cruza o nome
  com o dicionário para trazer sugestão, formato e o que dói se errar.
- Variável que a célula já preenche por `dependency` não vira pergunta: ela é
  fio da árvore, e perguntar o que a árvore produz é o defeito que
  `fio.py` existe para achar.

## Capabilities

- `tela`: a peça do catálogo mostra as variáveis que ela exige, com sugestão
  onde há prática consagrada.
