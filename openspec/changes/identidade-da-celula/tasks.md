# Tasks — identidade da célula

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado
> observável anotados na própria linha.
>
> **Medida de referência**: `python3 ferramentas/ida_e_volta.py
> <projeto.bio> <raiz-da-instancia>`, contra a árvore da instância de
> referência (199 células em produção).

## 1. A identidade chega ao servidor

- [x] **1.1 A tela manda `id` e `nome` de cada peça.** _Evidência: 6124867; a
  ligação oferecida em `resolucao-central` passou a nomear
  `plataforma/barramento/prd/vpc` no lugar do serviço._
- [x] **1.2 A especificação carrega a célula e as pontas de cada seta.**
  _Evidência: 314012b; a tabela ganhou as colunas `célula`, `de`, `para` e
  `rótulo`, no fim, para que especificação escrita à mão continue valendo._

## 2. As respostas param de colidir

- [x] **2.1 O servidor casa resposta por caminho.** _Evidência: 314012b; o
  terragrunt de produção do domínio afetado saiu com o nome da própria ficha
  e retenção 30, e não mais com os valores de homologação._
- [x] **2.2 Uma célula por nó do desenho.** _Evidência: 314012b; 199 células
  geradas para 199 nós, e não 357._

## 3. O caminho e a receita voltam a ser os da instância

- [x] **3.1 O gerado sai no caminho do `id`.** _Evidência: 314012b; as 199
  células casam com o disco, e a comparação de arquivo passou a existir._
- [x] **3.2 A receita é a que o nó aponta.** _Evidência: 314012b; a peça é
  copiada do catálogo, e a que só a instância tem viaja no `.bio`. 65 pedidas,
  0 sem correspondência._
- [x] **3.3 O arquivo volta como a pessoa o escreveu.** _Evidência: b5ded30,
  6a47f82, 295ca0a; prosa, blocos livres, notas de cada resposta, ordem,
  arranjo dos blocos, fórmulas e rótulos das dependências. 188 dos 199
  arquivos iguais._

## 4. O portão trava

- [ ] **4.1 Fechar os 11 arquivos que ainda diferem.** _Estado: nenhum abaixo
  de 90%. Falta olhar caso a caso._
- [ ] **4.2 `ida_e_volta.py` reprova quando a distância volta a crescer.**
  _Evidência esperada: teste em `testes/unidade.py` com as três alturas em
  zero._
