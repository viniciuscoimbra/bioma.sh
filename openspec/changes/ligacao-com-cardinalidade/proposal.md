## Why

A relação do desenho é um par: uma origem, um destino. As receitas do catálogo
deixaram de ser isso há tempo, e nem o contrato nem o desenho acompanharam.

| ligação | o que `variables.tf` pede | o que `contrato.json` declara |
|---|---|---|
| `acesso-lake` | `grants`, um mapa de concessões | tabela, consumidor, recorte |
| `boundary-ram` | `resource_arns` e `principals`, duas listas | `resource_arns`, `principal_ou` |
| `politica-msk-cluster` | `contas_consumidoras`, lista | `conta_consumidora`, singular |
| `subscricao-logs` | `log_groups`, lista | `log_groups` |
| `oam-link`, `grant-kms` | um alvo por célula | um alvo |

Três receitas já são 1:N ou N:N no código. Duas expressam o N repetindo célula,
e é assim que a instância privada de referência tem 22 células de OIDC, uma por conta
alvo. O desenho não sabe de nenhuma das duas formas: quem monta na tela liga uma
caixa na outra, e o N aparece depois, na mão de quem escreve o `terragrunt.hcl`.

O custo disso é concreto. Uma ligação 1:N desenhada como N ligações 1:1 vira N
células onde deveria ter uma com lista, e o inverso também: uma ligação que
precisa de célula por alvo desenhada como uma só entrega permissão faltando.

## What Changes

- A relação ganha `cardinalidade`, com `1:1`, `1:N` ou `N:N`, e a forma como o N
  se realiza: `lista` quando a receita recebe uma lista, `celula` quando cada
  alvo pede célula própria.
- O contrato de cada ligação declara a cardinalidade, e um verificador reprova
  contrato que diz 1:1 sobre `variables.tf` que pede lista.
- O tradutor deriva a cardinalidade das pontas: aresta que termina em ponta
  plural (`todas as contas`, `blocos de domínio`) nasce 1:N.
- Os contratos que hoje descrevem errado são corrigidos junto, porque contrato
  que mente é pior que contrato ausente.

## Capabilities

### New Capabilities

- `cardinalidade-da-ligacao`: o que a ferramenta garante sobre quantos de cada
  lado uma ligação tem.

## Impact

- `.bio` existente não quebra: relação sem `cardinalidade` vale como `1:1`, que
  é o que ela é hoje.
- Os contratos de `acesso-lake`, `boundary-ram` e `politica-msk-cluster` mudam
  de texto, e o verificador novo passa a reprovar quem divergir.
- A árvore gerada não muda nesta change. Gerar N células a partir de uma ligação
  `1:N` com forma `celula` é o passo seguinte, e depende de `ou-e-ambiente-no-grafo`,
  porque é a mesma mecânica de multiplicar célula.
