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

- [ ] **4.1 A peça chega com posição.** `desenho_da_arvore` calcula layout ao
      exportar (por conta e por camada, determinístico), ou a tela posiciona ao
      abrir grafo sem posição — um dos dois, decidido no design. Zoom nunca é
      `NaN%`. _Evidência esperada: `fase1.bio` aberto mostra as peças no canvas,
      zoom numérico, e a foto olhada._
- [ ] **4.2 A peça chega com a conta.** O leitor resolve a conta de cada célula
      (a mesma regra do `root.hcl`: trilho fixo, família+sufixo, domínio) e a
      grava na peça; apelido basta quando o número ainda é `DECLARE_`.
      _Evidência esperada: `fase1.bio` aberto agrupa por network,
      security-tooling, core-bancario-prd…; zero "sem área"._
- [ ] **4.3 A resposta respondida não vira pergunta.** O leitor leva os
      `inputs` de cada célula para a peça, com origem: literal, dependência, ou
      `get_env` com o nome da variável e a queda. Pergunta só fica aberta para
      input que a célula não responde. _Evidência esperada: `fase1.bio` abre
      com as perguntas de célula respondida fechadas (hoje 516 abertas), e a
      peça mostra `TG_REGIAO` como parâmetro onde a célula o lê._
- [ ] **4.4 O comando do rodapé é do projeto aberto.** O `.bio` carrega o
      comando de execução da origem (perfil, alvo, fase), e a tela o mostra em
      vez do padrão fixo. _Evidência esperada: com `fase1.bio` aberto, o rodapé
      diz `--perfil producao --ate prd --fase N`, não `--perfil local --area
      live`._
