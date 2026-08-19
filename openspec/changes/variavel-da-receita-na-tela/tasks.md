# Tasks

Régua: abrir `fase1.bio` na tela, escolher uma célula de VPC e ver o campo
`supernet` com as três sugestões da RFC 1918.

- [x] A tradução lê o `variables.tf` da receita e devolve uma pergunta por
      variável exigida.
      **Evidência:** a proposta de uma unidade de `vpc-plataforma` com as
      perguntas listadas, hoje zero.
- [x] A pergunta cruza com o dicionário e traz sugestão e formato.
      **Evidência:** o campo `supernet` na tela com os três valores e a fonte.
- [x] Variável preenchida por dependency não vira pergunta.
      **Evidência:** `tgw_id` e `kms_key_arn` ausentes da lista, com o motivo.
- [x] O caminho do zero não muda.
      **Evidência:** o gerador só cede as perguntas quando a unidade declara
      receita; sem receita, ele segue deduzindo do serviço. `prova-tela.py` em
      15/15. A `prova-do-zero.py` não serve de régua aqui: ela já falhava
      antes desta mudança, medido contra a árvore limpa, e o defeito dela é
      outro.

## Fechada em 2026-08-19

Medição final contra o projeto real de 157 células: a unidade de `vpc-dominio`
sai de 2 perguntas (argumento de provider) para 10 (as da receita), com
`supernet` trazendo os três valores da RFC 1918. Na tela, "WHAT THE RECIPE
REQUIRES 10", com o contador em 3 de 13 aceitas.
