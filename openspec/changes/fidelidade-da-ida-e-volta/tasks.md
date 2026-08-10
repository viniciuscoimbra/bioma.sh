# Tasks — fidelidade da ida e volta

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.

## 1. A decisão sobrevive ao trajeto

- [x] **1.1 O tradutor guarda a quinta coluna.** `ferramentas/traduzir_bloco.py` lê `realiza` da tabela de serviços e o grava na unidade, cru, com o wikilink. _Evidência: `traduzir_bloco.py 00-fundacao.md --saida /tmp/prova-realiza` gera `AWS Organizations -> '[[#Decisão 1 · Organizations com OUs por natureza]]'`._
- [x] **1.2 O nó carrega a decisão.** `grafo_da_proposta()` copia `realiza` para o nó. _Evidência: `barramento.bio` regerado traz `realiza: [[#Decisão 1 · Log distribuído como espinha]]` no primeiro nó._
- [x] **1.3 A especificação devolve.** `especificacao()` escreve `realiza` na coluna, e `tela` só quando o nó não tem. _Evidência: ida e volta do bloco 00 devolve `| AWS Organizations | OUs, contas, SCP | Management | compartilhado | [[#Decisão 1 · Organizations com OUs por natureza]] |`, onde antes vinha `| tela |`._

## 2. A ponta de fora tem classe

- [x] **2.1 Classificador.** `classe_da_ponta()` decide entre `interna`, `bloco`, `fronteira`, `topico` e `externa`. _Evidência: as cinco exercidas nos seis projetos: 89 `interna`, 23 `externa`, 8 `bloco`, 3 `topico` e 1 `fronteira`, esta última em `seguranca.bio`, onde `sistema externo (IdP corporativo)` casa com `catalogo/fronteiras/idp-corporativo`. `sistema externo (cliente final)` continua `externa`, porque fronteira com esse nome não existe._
- [x] **2.2 O grafo carrega.** `grafo_da_proposta()` grava `de_classe` e `para_classe` em cada aresta, sem mudar `de` e `para`. _Evidência: em `barramento.bio`, `msk interna -> 04-plataforma-dados bloco`._

## 3. Nada quebrou

- [x] **3.1 Portões.** _Evidência: `bash testes/portoes.sh` com compila ok, constroi ok, arvore ok, tela ok, em 32s._
- [x] **3.2 A árvore gerada não mudou.** O gerador não lê os campos novos. _Evidência: portão `arvore` ok sem tocar `testes/arvore_referencia.py`._
- [x] **3.3 Os seis projetos da instância regerados.** _Evidência: `_gerar.py` refaz os seis; diff de 232 linhas acrescentadas nos seis `.bio`, com `realiza` no nó e as duas classes na aresta._
