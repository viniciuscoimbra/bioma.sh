# Tasks — convenções vêm da instância

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.
>
> **Estado**: as seções 0 a 4 fecharam em 2026-08-09, com evidência na linha. A
> auditoria de 2026-08-10 abriu a seção 5: a mesma régua aplicada à tela, que
> continua decidindo pela instância em seis lugares.

## 0. O que já foi feito

- [x] **0.1 Levantamento.** _Evidência: 34 linhas com nome de domínio de cliente, em `gerar_estrutura.py` (12), `verificar_cobertura.py` (10) e `traduzir_bloco.py` (2)._
- [x] **0.2 As duas ferramentas contaminadas não rodam aqui.** _Evidência: `gerar_estrutura.py` quebra com `FileNotFoundError`; `verificar_cobertura.py` responde "sem insumo para decidir" e sai zero, dentro do pré-voo do comando._
- [x] **0.3 `AGRUPADORAS` com nome de cliente removida.** _Evidência: era constante morta; a regra que vale é topo que não nomeia OU folha._
- [x] **0.4 Apelido de trilho sai do contrato genérico.** _Evidência: `esteira-workflows/contrato.json` voltou a falar só do dono, e `apelidos_de_trilho` virou convenção da instância._
- [x] **0.5 Ambientes por natureza sobrescrevíveis.** _Evidência: `--convencoes` e `BIOMA_CONVENCOES`; com `workload: [dev, prd]`, a peça de core bancário passa de três para dois ambientes._

## 1. A decisão que destrava

- [x] **1.1 Confirmar que `gerar_estrutura.py` e `verificar_cobertura.py` vão para a instância**, em vez de aceitarem caminho por argumento. _Evidência: resposta do Vinícius em 2026-08-09 ("Siga até acabar") sobre a ordem proposta, cujo item 5 era este. As duas foram para a instância._
- [x] **1.2 Confirmar que o pré-voo perde `confere cobertura`** enquanto ela não existir na instância. _Evidência: a mesma resposta. Um portão que responde "sem insumo para decidir" e sai zero finge conferir, e finge pior do que não existir._

## 2. O mapa de zona

- [x] **2.1 `ZONA_TRILHO` nasce vazio na ferramenta.** _Evidência: `ZONA_TRILHO = {}` em `ferramentas/traduzir_bloco.py`. Bloco de prova com as zonas antigas, traduzido sem convenções: `Platform (dados)` cai em `dados` e `Network` cai em `network`, os dois pelo nome da zona._
- [x] **2.2 A razão diz que faltou convenção.** _Evidência: `por_que_trilho` na peça: "a zona 'Network' não está no mapa de zonas desta instância, então o trilho veio do nome dela. Declare `zona_trilho` nas convenções para mandar noutra pasta."_
- [x] **2.3 A instância privada declara o mapa.** _Evidência: arquivo de convenções com as cinco zonas (`platform (dados)`, `platform (devsecops)`, `platform (saas)`, `security`, `network`). O mesmo bloco de prova traduzido com `--convencoes` manda `Network` para `infrastructure` em vez de `network`, e a razão passa a nomear o arquivo de convenções que decidiu. Nos dezoito blocos do repositório o resultado não muda: eles escrevem a zona como `Topo · OU`, que resolve antes do mapa._

## 3. As ferramentas mudam de casa

- [x] **3.1 Mover as duas para a instância.** _Evidência: `implementacao/bioma/ferramentas/` do repositório da arquitetura tem `gerar_estrutura.py` e `verificar_cobertura.py`, ao lado de `esquema-aws.json` e `mapa_recursos.json`, que são o inventário que elas leem. Nenhuma das duas existe mais em `ferramentas/` do framework._
- [x] **3.2 O pré-voo para de chamar o que não tem insumo.** _Evidência: as chamadas `confere` do `bioma.sh` são duas, `durabilidade` e `cardinalidade`. No lugar da terceira ficou o comentário que diz por que ela saiu, e o pré-voo não imprime mais "PULADO · cobertura". A tela continua chamando cobertura em `checa_cobertura()`, e isso é o certo: lá ela procura o verificador **da instância** (`verificador_da_instancia`) e, quando não acha, volta `pendente` com o motivo escrito, em vez de sair zero fingindo que conferiu._

## 4. A ponta plural em inglês

- [x] **4.1 `COLETIVO` deixa de ser só português.** _Limite declarado, dos contra-exemplos da auditoria de 2026-08-10: `Contas a pagar` sai como conjunto sem ser, e `private subnets` e `as filas consumidoras` são conjunto e não são reconhecidos. A regra é heurística de língua, e a cardinalidade que sai dela é proposta com a razão junto; quem fecha é a ficha perguntar (task 2.2 de `o-caminho-do-zero`)._ _Evidência: dez decisões em `testes/unidade.py`, caso e contra-caso. Conjunto: `todas as contas`, `all accounts`, `domain blocks`, `consumer accounts`, `cada domínio`, `every region`. Peça: `Amazon MSK`, `Amazon Kinesis`, `a conta de dados`, `AWS Organizations`. Duas expressões respondem, a cabeça da frase e o plural no fim._

## 5. A tela também decide pela instância

Aberto pela auditoria de 2026-08-10 (`arquitetura/_registro/parecer-codex-convencoes-2026-08-10.md`
no repositório da arquitetura). A régua que moveu `ZONA_TRILHO` e as duas
ferramentas de cobertura aponta agora para a tela: são convenções desta
organização morando no framework.

- [ ] **5.1 A lista de zonas sai do código da tela.** `tela/app/src/partes.jsx:8-13` e `tela/index.html:114` trazem `Platform`, `Platform (dados)`, `Platform (devsecops)`, `Security`, `Network`, `Platform (SaaS)` fixas. _Evidência esperada: a tela lendo as zonas das convenções da instância, e caindo em lista vazia com o convite a declarar quando não houver._
- [ ] **5.2 As sugestões de domínio saem do servidor.** `tela/servidor.py:1878-1893` sugere `Plataforma > Dados`, `Plataforma > Esteira`, `Core Banking`, `Mesa de Crédito`. _Evidência esperada: sugestão vinda do `.bio` aberto ou das convenções, e nenhuma quando não houver._
- [ ] **5.3 O caminho local sai do arquivo versionado.** `tela/lugares-de-especificacao.json:1` guarda o caminho da máquina do Vinícius, com o nome do cliente. _Evidência esperada: o arquivo nasce vazio e a tela grava o que a pessoa abrir._
- [x] **5.4 Placeholder e exemplo deixam de nomear cliente.** _Evidência 2026-08-10: `tela/app/src/assistente.jsx` usa `minha-org` e `BIO`; `tela/app/src/verbetes.js` usa `aplicacao/prod/vpc`; `docs/dominios-e-contas.md` remove o nome do cliente; o build da tela será regenerado junto desta mudança._
- [ ] **5.5 Quais topos hospedam OU filha é da instância.** `TOPO_COM_OU_FILHA = ("platform", "workloads")` e `TOPO_NATUREZA` em `ferramentas/traduzir_bloco.py` decidem a árvore desta organização dentro da ferramenta, e erram: a zona `Security · CIAM` traduz para trilho `security` e `conta fundacional de security`, enquanto a árvore aprovada põe `CIAM` como OU própria sob `Security`, com `ciam-nprd` e `ciam-prd`. **Muda a árvore gerada da segurança: pede decisão registrada antes de mexer.** _Evidência esperada: a tradução do bloco 03 devolvendo a OU `CIAM` com dois ambientes, e as duas tabelas vindo das convenções._
- [ ] **5.6 A decisão de lista vem do esquema, e não do sufixo do argumento.** `PEDIDOS` em `ferramentas/gerar_iac.py` marca lista pelo nome (`security_groups$`), enquanto `exigencias()` já lê o tipo real do atributo no esquema do provider. São duas fontes para a mesma pergunta. _Evidência esperada: a resposta da vizinha embrulhada em lista só quando o esquema disser que o atributo é lista, com o contra-caso de um argumento plural que o provider declara escalar._
- [ ] **5.7 Convenções que sobraram em `traduzir_bloco.py`.** Os topos fixos (`platform`, `workloads`, `security`) em `TOPO_NATUREZA`, e a queda para `uma por plano (nao-prod, prod)` quando a natureza não diz. Achado da auditoria de 2026-08-10. _Evidência esperada: os dois vindos das convenções, com o padrão da ferramenta declarado à parte._
- [ ] **5.8 Convenções de instância em `gerar_iac.py`.** `TRUST_POR_VIZINHO`, as ações padrão por destino e o canal `subscription` com `role_entrega_arn`. Achado da auditoria de 2026-08-10. _Evidência esperada: as três lidas das convenções, e a busca por nome de cliente em `ferramentas/` voltando vazia._
