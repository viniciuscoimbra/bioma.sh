## Why

O bioma faz duas coisas hoje, e a segunda está escrita no lugar errado. Ler uma
árvore Terraform e transformá-la em projeto visual (`.bio`) é do framework.
Aplicar essa árvore por fases, com journal, gates e pontos de parada humana,
está escrito **dentro da instância**: o `bioma.sh` do a-instancia carrega
seis fases de roteiro à mão, e o do framework nem conhece apply — só escreve a
receita.

O custo de o plano de entrega ser código escrito à mão apareceu quatro vezes na
primeira instalação real, todas encontradas por auditoria e não por portão:

- duas ligações de TGW estavam numa fase anterior à das VPCs de que dependem;
- o domínio `faturamento` nunca entrou na fila, porque o roteiro dizia
  `faturamento`, e área inexistente contava como sucesso;
- o escopo do pré-voo divergiu da fila real duas vezes, porque eram duas listas
  que precisavam concordar;
- a camada de aplicação entrou na fase 6 sem planejar, porque ninguém conferiu
  que as células dela eram esqueleto.

Nenhum desses defeitos é possível quando as fases são **calculadas** do grafo
de dependências, e a instalação real provou que o cálculo funciona: o recorte
de 69 células, o fecho transitivo e a detecção das duas ligações fora de ordem
saíram de scripts que leem `config_path` — escritos como descartáveis, dentro
de `docs/fase1/` da instância.

## What Changes

O plano de entrega vira artefato calculado na exportação, e não roteiro escrito
no orquestrador.

1. **`ferramentas/plano_de_entrega.py`** lê a árvore (`config_path` de cada
   célula, contratos, `convencoes.json`) e emite `entrega.json`: as células em
   ondas topológicas, cortadas em fases pelos limites que os metadados já
   declaram — durabilidade (`permanente`/`estavel` para antes de aplicar),
   irreversibilidade (conta e e-mail não voltam: fase própria, com célula
   canário antes do lote), gate assíncrono (enrollment do Control Tower), troca
   de credencial (management → conta membro → esteira).
2. **A exportação do `.bio` carrega o plano.** Quem exporta vê as fases, ajusta
   os cortes na tela se quiser, e o ajuste fica registrado como decisão. O que
   hoje é "seis fases porque alguém escreveu seis" vira "N fases porque o grafo
   e os contratos dizem N, e o dono mexeu onde quis".
3. **O orquestrador executa `entrega.json`** em vez de carregar roteiro. As
   fases 1-6 do a-instancia viram o primeiro caso de teste: o gerador tem
   que reproduzir (ou melhorar, apontando por quê) o plano que a instalação
   real derivou à mão.
4. **Um portão novo cobra a coerência**: célula que depende de célula de fase
   posterior reprova. É o teste que os quatro defeitos acima não tiveram.

## Capabilities

- `plano-de-entrega`: calcular, exportar, ajustar e executar o plano de fases
  de uma árvore Terragrunt a partir do grafo e dos contratos.

## Impact

- `ferramentas/`: novo `plano_de_entrega.py`; o executor passa a ler
  `entrega.json`.
- `tela/`: visualização e ajuste do plano na exportação (fase posterior da
  implementação; o cálculo e a execução não dependem dela).
- Instâncias: `docs/fase1/classificar.py` e `dependencias.py` do
  a-instancia são absorvidos pelo cálculo genérico; o roteiro de fases do
  `bioma.sh` da instância vira dado.
- Resolve a bifurcação dos dois `bioma.sh`: o do framework calcula e escreve o
  plano; a execução por fases deixa de ser código da instância.
