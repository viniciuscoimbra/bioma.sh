## Why

A política do cluster do barramento admitia principal de fora por duas listas de
escopo único. `conectores_arns` divide os mesmos tópicos e grupos entre todos os
seus principais, e ainda carrega o que o worker do MSK Connect precisa
(`WriteData`, `CreateTopic`, `transactional-id`). `produtores_arns` divide uma
lista de tópicos entre todos os produtores.

O que a lista única cobra de quem entra nela:

| quem entra | o que ele precisa | o que vem junto |
|---|---|---|
| consumidor que não é conector | `ReadData` num tópico | escrita e criação de tópico em todos os tópicos da lista |
| segundo produtor | escrita no tópico dele | escrita no tópico do primeiro produtor |
| leitor que não usa grupo | ler por partição atribuída | a receita não tinha onde declarar isso |

A instalação que precisava de escopo por principal editava a política no console,
e o apply seguinte apagava a edição sem aviso: `PutClusterPolicy` substitui a
política inteira, e o diff da célula não mostra o que estava na nuvem.

O grupo de segurança do cluster tinha o estreitamento equivalente do lado da
rede. Ele aceitava origem dentro das faixas que já conhecia, e a conexão
multi-VPC atende cada broker numa porta a partir de 14001. A VPC de uma conta de
fora da organização fica fora dessas faixas: o handshake TCP não completa e o
bootstrap da conexão fica em timeout. A 9098 do conector gerenciado não serve
para esse caminho.

## What Changes

- A ligação `politica-msk-cluster` ganha `leitores` e `escritores`, mapas em que
  cada entrada junta principais com os tópicos e os grupos deles, e gera os
  próprios statements.
- O nome da entrada vira o prefixo do Sid dos statements que ela gera, o que
  permite comparar a política planejada com a que está na nuvem statement por
  statement.
- O leitor conecta sem `WriteDataIdempotently`, e leitor sem grupo declarado não
  gera o statement de coordenação.
- Nome repetido entre os dois mapas é recusado por `precondition` do recurso.
  Nome com caractere fora de letra e número, nome igual a prefixo que a receita
  já usa e entrada com lista vazia são recusados por `validation` da variável.
- O organismo `barramento/msk-cluster` ganha `cidrs_vpc_connectivity`, que abre
  14001-14100 para a VPC declarada, com CIDR IPv4 e piso de prefixo `/16`.
- Os sete casos de `terraform test` da ligação passam a viver em
  `catalogo/ligacoes/politica-msk-cluster/tests/politica.tftest.hcl`, com
  provider simulado.

## Capabilities

### New Capabilities

- `autorizacao-do-cluster`: quem de fora fala com o cluster do barramento, e com
  que escopo.
- `alcance-do-cluster`: de que rede a conexão chega ao broker.

## Impact

- Nada quebra para quem já usa. `leitores` e `escritores` nascem `{}`,
  `cidrs_vpc_connectivity` nasce `[]`, e o caso
  `sem_entradas_a_politica_fica_como_era` mede a política com cinco statements,
  o tamanho que ela tinha antes.
- `conectores_arns` e `produtores_arns` continuam valendo. Mover o que está
  nelas para entradas por principal é trabalho de cada instalação, e fica fora
  desta change.
- O nome da entrada passa a ser interface: renomear a entrada renomeia os Sids,
  e o apply seguinte reescreve a política inteira com os nomes novos.
- O contrato das duas peças declara os campos novos (`CONTRATO.md` e
  `contrato.json`), que é de onde o verificador de contratos lê.
