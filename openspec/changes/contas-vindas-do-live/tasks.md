# Tasks — contas vindas do live

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.

## 1. A ferramenta

- [x] **1.1 Leitor do mapa.** `ferramentas/contas_do_live.py` lê o bloco `contas` e devolve a lista no formato da tela. _Evidência: contra o `contas.hcl` da instância privada de referência saem 28 contas, a primeira `{apelido: log-archive, numero: 110000000001, area: Log Archive, padrao: true}`._
- [x] **1.2 Área pela família.** O sufixo de ambiente sai do apelido para formar a área. _Evidência: `barramento-nprd` e `barramento-prd` saem os dois com área `Barramento`._
- [x] **1.3 Arquivo sem contas recusa.** _Evidência: contra o `README.md`, sai `não tem o bloco `contas = {`, que é onde a instância declara conta e número` e código 1._

## 2. A rota

- [x] **2.1 Importar.** `POST /contas/importar` substitui a lista e responde o total. _Evidência: `contas_do_live.py` contra o `contas.hcl` real devolve 28 contas, a primeira `{apelido: log-archive, numero: 110000000001, area: Log Archive, padrao: true}`. O número repetido deixou de sumir: mapa com `barramento-prd` e `barramento-producao` no mesmo `110000000003` recusa a importação inteira nomeando os dois apelidos, que é a mesma resposta que a digitação já dava. Seis decisões em `testes/unidade.py`, caso e contra-caso._
- [x] **2.2 Caminho inexistente.** _Evidência: `curl` com `/tmp/nao-existe.hcl` devolve `não achei o mapa de contas em /tmp/nao-existe.hcl`, e a lista anterior fica._

## 3. Quem já usa

- [x] **3.1 O gerador da instância usa a ferramenta.** `projetos/_gerar.py` importa `contas_do_live` e perdeu o parser próprio. _Evidência: os seis `.bio` regerados trazem as contas em `{apelido, numero, area, padrao}`, no lugar do `{nome, id}` que a tela não aceitava._
- [x] **3.2 Portões.** _Evidência: compila ok, constroi ok, arvore ok, tela ok, em 32s._
