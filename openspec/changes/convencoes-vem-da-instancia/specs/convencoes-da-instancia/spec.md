## ADDED Requirements

### Requirement: A ferramenta declara o que é padrão dela
Toda convenção que a ferramenta traz embutida SHALL ser identificada como padrão
na saída, com a origem, e SHALL poder ser sobrescrita por arquivo da instância.
Convenção cujo valor é nome de uma organização SHALL NOT existir embutida.

#### Scenario: Sem arquivo de convenções
- **WHEN** o tradutor roda sem `--convencoes` e sem `BIOMA_CONVENCOES`
- **THEN** cada peça diz que a lista de ambientes veio do padrão da ferramenta

#### Scenario: Com arquivo da instância
- **WHEN** a instância declara `workload: [dev, prd]`
- **THEN** a peça de workload existe em dois ambientes, e diz que a lista veio do arquivo dela

### Requirement: O mapa de zona para trilho é da instância
`ZONA_TRILHO` SHALL vir das convenções da instância, e o padrão da ferramenta
SHALL ser vazio. Zona que nenhum mapa conhece SHALL virar trilho pelo nome, e
SHALL dizer que foi por falta de convenção.

#### Scenario: Instância que declara o mapa
- **WHEN** as convenções mapeiam `platform (dados)` para o trilho `dados`
- **THEN** a peça daquela zona nasce em `dados`

#### Scenario: Zona sem mapa
- **WHEN** a zona é um nome que nenhuma convenção descreve
- **THEN** o trilho sai do nome da zona, e a razão diz que não havia convenção para ela

### Requirement: Ferramenta que depende do inventário da instância mora com ele
Ferramenta do framework SHALL NOT depender de arquivo que vive no repositório de
uma instância. O pré-voo do comando SHALL NOT chamar verificador que responde
"sem insumo" no próprio repositório.

#### Scenario: Pré-voo no framework
- **WHEN** `bioma.sh` roda o pré-voo no repositório do framework
- **THEN** nenhum verificador chamado ali depende de `inventario.json`, e nenhum passa por falta de insumo
