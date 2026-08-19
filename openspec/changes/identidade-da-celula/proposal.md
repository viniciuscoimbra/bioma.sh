# A célula é identificada por ela mesma, e não pelo serviço que ela usa

## Why

O `.bio` do gf-infrastructure guarda 199 células de uma infraestrutura em
produção. Gerando o código de volta com o que o framework tem hoje, a célula
de produção do core bancário sai com as respostas da célula de homologação:
nome `core-bancario-hml-oracle`, retenção de backup 7 em vez de 30.

A causa é uma só e vale para a árvore inteira. A tela manda ao servidor o
serviço de cada peça, e o servidor casa as respostas por serviço:

```python
chave = (n.get("servico") or "").strip().lower()
respondido[chave] = vals
```

Serviço repete. Medido no `.bio` do gf-infrastructure: 65 serviços distintos
para 199 nós, 37 serviços com mais de uma célula, **134 células cujas
respostas são sobrescritas pela última lida**. Quarenta e sete contas
governadas colapsam numa.

O portão `ida_e_volta.py` mede o mesmo pelo outro lado: 199 nós no desenho,
357 células geradas, e nenhuma delas casa com um caminho da instância.

A pergunta 2 da regra pétrea ("o código que a instância editou à mão é o que
o `.bio` geraria?") está respondida com não, e o número existe.

## What Changes

- A identidade da célula (`id` e `nome`) viaja da tela ao servidor. **Feito**
  em 6124867, porque a ligação clicável dependia dela.
- As respostas passam a ser casadas por `id` de célula, e não por serviço.
- A proposta ganha uma célula por nó do desenho, no lugar de uma unidade por
  serviço multiplicada pelos alcances.
- O caminho da célula gerada sai do `id` do nó, que é o caminho que a
  instância tem no disco.
- `ida_e_volta.py` deixa de ser relatório e vira portão quando as três
  alturas zerarem.

## Capabilities

- `ida-e-volta` (modificada)

## Impact

`tela/servidor.py` (casamento das respostas), `ferramentas/traduzir_bloco.py`
(uma unidade por nó), `ferramentas/gerar_iac.py` (caminho e alcance da
célula), `ferramentas/ida_e_volta.py` (portão).

Toda árvore gerada muda de caminho. As instâncias existentes reimportam.
