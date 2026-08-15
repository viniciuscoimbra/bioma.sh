# Domínios e contas: o modelo que a tela segue

Extraído de uma instância privada de referência. O nome do cliente e o caminho da instância ficam fora do repositório público.

## O que o infra real mostra

```
infra/
  fundacao/            00-organizacao · 02-ous · 04-contas · ...
  plataforma/          barramento · dados · esteira · observabilidade · rede · seguranca
  faturamento/        dev · homolog · prod
  decisao/        dev · homolog · prod
  consumidores/        analitico · bi
```

- A árvore de OUs tem nível um (stream-aligned, platform, security, sandbox, canário)
  e domínios aninhados: `faturamento = { pai = "stream-aligned" }`.
- Conta é célula com `nome`, `email`, `ou_id` e `tags_alocacao = { dominio, ambiente }`.
- Domínio de negócio (stream-aligned) tem uma conta por ambiente:
  `faturamento-dev`, `faturamento-homolog`, `faturamento-prod`.
- Domínio de plataforma tem conta única: `dados`, `rede`, `observabilidade`, `devsecops`.

## O que isso vira na tela

Domínio é uma árvore, não uma lista:

```json
{ "id": "plataforma",       "nome": "Plataforma",   "pai": null }
{ "id": "plataforma-redes", "nome": "Redes",        "pai": "plataforma" }
{ "id": "faturamento",     "nome": "Faturamento", "pai": null }
```

Conta aponta para um domínio e, quando o domínio separa ambientes, para um ambiente:

```json
{ "apelido": "faturamento-dev", "numero": "111122223333",
  "dominio": "faturamento", "ambiente": "dev", "padrao": true }
```

Regras que a tela obedece:

- A peça declara o domínio; a conta sai do domínio, sempre a mesma: a conta padrão
  do domínio (ou a única). Peça nunca nasce com conta aleatória.
- A caixa no canvas rotula `apelido (número)`, nunca só o número.
- Domínio vira pasta na estrutura gerada: filho aninha sob o pai
  (`plataforma/redes/...`), espelhando o infra real.
- Seta entre contas diferentes vira ligação; dentro da mesma conta, dependência.
