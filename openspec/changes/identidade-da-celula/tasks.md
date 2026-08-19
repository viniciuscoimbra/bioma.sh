# Tasks — identidade da célula

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado
> observável anotados na própria linha.

## 1. A identidade chega ao servidor

- [x] **1.1 A tela manda `id` e `nome` de cada peça.** _Evidência: 6124867;
  a ligação oferecida em `resolucao-central` passou a nomear
  `plataforma/barramento/prd/vpc` no lugar do serviço._

## 2. As respostas param de colidir

- [ ] **2.1 O servidor casa resposta por `id`.** _Evidência esperada: gerar do
  `.bio` do gf-infrastructure e ver `core-bancario-prd-oracle` no terragrunt
  de produção, hoje escrito `core-bancario-hml-oracle`._
- [ ] **2.2 A proposta traz uma unidade por nó.** _Evidência esperada: 199
  unidades para 199 nós, hoje 65._

## 3. O caminho volta a ser o da instância

- [ ] **3.1 O gerado sai no caminho do `id`.** _Evidência esperada:
  `ida_e_volta.py` sai de 0 arquivos casados para 199._
- [ ] **3.2 As três alturas zeram.** _Evidência esperada: a saída do portão._

## 4. O portão trava

- [ ] **4.1 `ida_e_volta.py` reprova quando a distância volta a crescer.**
  _Evidência esperada: teste em `testes/unidade.py`._
