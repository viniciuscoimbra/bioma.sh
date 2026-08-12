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

## 4. A árvore também volta inteira (medido com o fase1.bio da instalação real)

- [x] **4.1 A peça chega com posição.** O `le()` do importador posiciona em
      grade por trilho, determinístico, no dado e não na tela. _Evidência:
      `fase1.bio` regerado abre com as 71 peças no canvas e as setas entre
      elas; zoom 40%, nunca `NaN%`; zero nós sem `x`. Foto olhada em
      2026-08-12._
- [x] **4.2 A peça chega com a conta.** `mapa_de_contas` lê os mapas do
      `contas.hcl` da PRÓPRIA árvore (declaração se lê da fonte, não se copia a
      regra) e `conta_da_celula` resolve; apelido basta quando o número é
      `DECLARE_`. _Evidência: as 71 células com conta na lista e no canvas
      (barramento-prd, network, security-tooling…); "sem área" zero; 8 contas no
      projeto. Foto olhada._
- [x] **4.3 A resposta respondida não vira pergunta.** `respostas_da_celula`
      leva os inputs com origem — literal vira valor, `get_env` vira o valor do
      ambiente ou a queda (e o nome fica em `parametros`), dependência vira
      `ligado`. E o desenho do live deixou de ler o catálogo: o interior das
      receitas punha 244 peças de ruído ao lado das células. _Evidência:
      perguntas de 1616 para 380 e "waiting" de 516 para 92; as que ficam são
      as que a instância ainda não respondeu de verdade (conta `DECLARE_` antes
      do passo 2); `regiao` resolvida do ambiente em 7 células._
- [x] **4.4 O comando do rodapé é do projeto aberto.** `origem.comando` viaja
      no `.bio` (flag `--comando` do desenho) e a tela o prefere ao padrão da
      casa. _Evidência: com `fase1.bio` aberto, o rodapé mostra
      `./bioma.sh --perfil producao --ate prd --fase 1 --plan --excluir-de …`.
      Foto olhada; `bash testes/portoes.sh` com os sete portões ok._
