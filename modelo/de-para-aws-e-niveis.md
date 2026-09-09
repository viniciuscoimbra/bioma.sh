# De-para: o componente da AWS e o nível do bioma

## O censo primeiro: por que o caminho NÃO responde

416 células, cinco formatos de caminho, e a mesma posição significa coisas
diferentes:

    <agrupador>/<dominio>/<ambiente>/<celula>
    <dominio>/<ambiente>/<alcance>/<celula>
    <dominio>/<alcance>/<conta>
    <dominio>/<capacidade>/<alcance>/<conta>/<ambiente>/<celula>

Quatro segmentos nas duas primeiras, e a posição 1 é ambiente numa e domínio na
outra.

Quatro segmentos, dois significados por posição. O nível tem que ser DECLARADO
pela peça, e não deduzido do lugar onde ela caiu.

## Tabela 1 — o que decide cada nível (estrutural)

| #  | nível        | o que é                                        | o que decide, no bioma            |
|----|--------------|------------------------------------------------|-----------------------------------|
| 1  | átomo        | um recurso declarado                            | um `resource` do provider         |
| 2  | molécula     | recursos que só funcionam juntos                | `catalogo/moleculas/`             |
| 3  | célula       | fronteira, interior e registro próprio          | pasta com `terragrunt.hcl`        |
| 4  | trocas       | como uma célula passa informação a outra        | `dependency` / a aresta           |
| 5  | DNA          | a receita versionada e os indivíduos que nascem | `source` + `ref`                  |
| 6  | corpo        | o que chega por outra esteira                   | `catalogo/artefatos/`             |
| 7  | tecido       | o que se refaz e o que nunca volta              | `durabilidade` no contrato        |
| 8  | órgão        | células que juntas cumprem uma função           | o alcance (base/aplicacao/dados)  |
| 9  | sistema      | órgãos de times diferentes ligados por função   | o domínio de negócio              |
| 10 | organismo    | um ambiente completo, atravessando contas       | o ambiente (prd/hml/dev)          |
| 11 | ecossistema  | a Organization: territórios e regras herdadas   | a árvore de OUs, SCP, fronteiras  |
| 12 | biosfera     | várias Organizations, várias nuvens             | o projeto inteiro                 |

## Tabela 2 — o que É o ecossistema, e o que só mora numa conta

A pergunta que separa: **esta coisa existe PORQUE a Organization existe, ou
existe dentro de uma conta e por acaso serve a todas?** Uma chave KMS tem
sentido numa conta sozinha; uma OU não tem sentido nenhum fora da Organization.

### Estrutura do ecossistema — sem Organization, não existem

| peça                | serviço AWS                     |
|---------------------|---------------------------------|
| organizacao         | AWS Organizations               |
| landing-zone        | AWS Control Tower               |
| arvore-ous          | Organizations · OU              |
| politicas-scp       | Organizations · SCP             |
| delegated-admins    | Organizations · delegated admin |
| identity-center     | IAM Identity Center             |

### Recurso de conta com alcance de Organization

Moram numa conta (management, security, log-archive) e a servem inteira. No
desenho da referência eles aparecem em molduras próprias — `SECURITY · CONTA`,
`LOG ARCHIVE · CONTA`, `DR · MANAGEMENT` — e não dentro do bloco de OUs.

| peça                    | serviço AWS              | conta onde mora |
|-------------------------|--------------------------|-----------------|
| baseline-deteccao       | Config + Security Hub    | security        |
| backup-organizacional   | AWS Backup               | management      |
| chave-dominio           | KMS                      | management      |
| categorias-de-custo     | Cost Categories          | management      |
| orcamentos-por-dominio  | Budgets                  | management      |
| acesso-de-emergencia    | IAM break-glass          | management      |
| acesso-ao-dominio       | ligação (IAM dos 2 lados)| atravessa       |

## As duas dimensões que NÃO são nível

- **conta** — fronteira de isolamento e de fatura. O conteúdo de um nível mora
  dentro dela; ela não é um degrau.
- **região** — onde o equipamento está. Zona local é dimensão da região.

Foi a colisão destas duas com os níveis que produziu o desenho errado: a caixa
`conta: management` desenhada no mesmo degrau que `OU: Infrastructure`.

## Sistema e organismo são EIXOS, não aninhamento

Um domínio (sistema) e um ambiente (organismo) não se contêm: uma célula em
`<dominio>/<ambiente>/<alcance>` está nos três ao mesmo tempo. Um campo só com
cinco valores misturaria de novo dois eixos.

O que a tela precisa é de UMA pergunta: **qual é o escopo mais externo que
contém esta peça** — `ecossistema` ou `conta`. As coordenadas (sistema,
organismo, órgão) já viajam separadas no `.bio` como `dominio`, ambiente e
alcance.

## Onde o campo mora

`inventario.json` só existe na instância, e `gerar_estrutura.py` não está no
framework: os `CONTRATO.md` daqui foram gerados lá e copiados. Então a tabela
de níveis é do framework e escrita à mão, como `ferramentas/mapa_recursos.json`
já é — recurso da AWS não sai de adivinhação.

## A colisão de nome que não pode nascer

`catalogo/organismos/` quer dizer "raiz de stack" (implementacao-catalogo.md),
e NÃO o nível 10 do modelo. Nenhum campo novo pode usar a palavra `organismo`
sem dizer qual das duas ele significa.
