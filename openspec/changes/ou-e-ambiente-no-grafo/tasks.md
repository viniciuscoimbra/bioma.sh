# Tasks — OU e ambiente no grafo

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.
>
> **Estado**: executada no servidor e nas ferramentas em 2026-08-08. Falta a
> parte de interface (2.3 e o aviso de 4.1), que pede microcopy nas duas línguas
> e prova de navegador.

## 0. A decisão que destrava

- [x] **0.1 Confirmar que o `.bio` descreve todos os ambientes de uma vez**, com o ambiente como propriedade do nó. _Evidência: aprovado pelo Vinícius em 2026-08-08 ("pode executar")._
- [x] **0.2 Confirmar a tabela de natureza da OU** como padrão sobrescrevível por instância. _Evidência: aprovado na mesma resposta. A sobrescrita não existia quando esta task fechou: a spec dizia SHALL e o código tinha dicionário de módulo. Corrigido em 2026-08-08 com `--convencoes <arquivo.json>` e `BIOMA_CONVENCOES`; com `workload: [dev, prd]`, a peça de core bancário passa de três ambientes para dois, e o nó diz que a lista veio do arquivo da instância._
- [x] **0.3 Confirmar que projeto antigo abre marcado como incompleto.** _Evidência: aprovado na mesma resposta._

## 1. O esquema

- [x] **1.1 Nó ganha `ou` e `ambientes`.** _Evidência: em `barramento.bio`, `ou: Barramento` e `ambientes: [nprd, prd]`; em `05`, `ou: Core Bancario` e `[dev, hml, prd]`._
- [ ] **1.2 Natureza da OU no nó.** _Evidência: nos seis projetos, 18 nós `capacidade`, 19 `fundacional` e 9 pendentes, que são as zonas que não nomeiam OU (`Log Archive`, `borda (edge)`, `todas as contas`)._ **REABERTA: zona que nenhum mapa conhece sai com `pendente_ou` falso, e a spec manda ficar pendente. Reproduzido.**
- [x] **1.3 OU agrupadora recusa conta.** _Evidência: zona `Platform` sozinha sai `natureza: agrupadora`, `conta: None`, `pendente_ou: True`, com a razão "Platform é OU agrupadora e não recebe conta: diga qual OU folha hospeda esta peça"._

## 2. De onde vêm os valores

- [x] **2.1 Zona que nomeia a OU.** _Evidência: bloco 01 sai com trilho `barramento`; antes desta change caía em `observabilidade`, porque o mapa antigo casava `platform` por prefixo._
- [ ] **2.2 Mapa da instância.** Com `contas.hcl` importado, a família dá a OU e o sufixo dá o ambiente. _Falta: a zona resolve os casos que nomeiam OU, e o mapa cobriria os que não nomeiam (`Log Archive`, `borda (edge)`). Não começado._
- [ ] **2.3 A ficha pergunta o resto.** _Falta: a razão já sai escrita em `por_que_ou`, e falta a pergunta na ficha, com microcopy nas duas línguas._

## 3. A árvore

- [x] **3.1 Contagem de células pela natureza.** _Evidência: na árvore de referência, `live/barramento/{nprd,prd}` e `live/core-bancario/{dev,hml,prd}`._
- [x] **3.2 Árvore de referência refeita no mesmo commit.** _Evidência: 36 arquivos, com o desenho fixo ganhando um caso de capacidade e um de workload, e as cinco células novas nos caminhos por ambiente._

## 4. Quem já tem projeto

- [ ] **4.1 `.bio` antigo abre marcado, no servidor.** _Evidência: `abrir_bio()` de um projeto sem os campos devolve `{sem_ou_ou_ambiente: 2, quais: [S3, Lambda], recado: "2 de 2 peças esperam OU e ambiente. Nada foi suposto: responda na ficha."}`. **Falta a tela mostrar o aviso**, que é mudança no app e pede foto olhada._ **REABERTA: estava marcada feita e dizia na mesma linha que faltava a tela. Task com ressalva de falta não fecha.**
- [x] **4.2 Os seis projetos da instância regerados.** _Evidência: os seis trazem `ou`, `natureza_ou` e `ambientes`; o bloco 15 do canônico foi corrigido de `Platform (devsecops)` para `Platform · DevSecOps`, e com isso os nós da esteira deixaram de ficar pendentes._
