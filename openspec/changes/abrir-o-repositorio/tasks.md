# Tasks — abrir o repositório

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.
> **Ordem**: o grupo 1 é impeditivo. Enquanto ele não fechar, o repositório não é publicado, porque publicar redistribui código de terceiro sem licença.
> **Modelos**: `[fable]` decisão e contrato; `[opus]` risco e reescrita; `[sonnet]` implementação especificada; `[haiku]` mecânico.

## 1. Impeditivos legais e de segurança

- [x] 1.1 [fable] Decidir a licença do bioma.sh entre as opções de `design.md` D1, escrever `LICENSE` na raiz e o cabeçalho de copyright. Dependências: decisão do dono. Evidência 2026-08-10: dono pediu licença que impeça venda da ferramenta por fork e preserve uso comercial da Skopia; `LICENSE` passou para PolyForm Shield 1.0.0 com `Copyright 2026 Skopia`; `docs/decisoes/2026-08-10-licenca.md` registra PolyForm Shield, PolyForm Noncommercial e BUSL-1.1.
- [x] 1.2 [fable] Resolver a licença do `@refy/ui` pelo caminho D2.1. Dependências: 1.1. Evidência 2026-08-07: na origem, o `@refy/ui` passou de `UNLICENSED` para `Apache-2.0` e ganhou `LICENSE`; na cópia, `tela/refy-ui/LICENSE` e `tela/refy-ui/package.json` com `Apache-2.0`, mais `tela/refy-ui/ORIGEM.md` dizendo de onde veio e que mudança se faz na origem. Publicar o pacote e trocar a cópia por dependência fica na 1.5, que depende de publicação fora desta máquina.
- [x] 1.3 [sonnet] Escrever `SECURITY.md` e `tela/.env.example`. Dependências: nenhuma. Evidência 2026-08-07: os dois arquivos escritos; o SECURITY diz onde reportar, o prazo, o que a ferramenta toca na máquina de quem usa e o que nunca entra no repositório; o .env.example traz `OPENAI_API_KEY=` vazio e cita `~/.bioma/openai.key`.
- [x] 1.4 [opus] Varredura de segredo e dado pessoal. Dependências: 1.3. Evidência 2026-08-10: a busca por chave de API OpenAI, chave de acesso AWS, chave privada, nome de cliente e caminho local absoluto não encontrou ocorrência pública; contas AWS de 12 dígitos restantes são exemplos sintéticos ou documentação de esquema de provider.

- [ ] 1.5 [sonnet] Publicar o `@refy/ui` num registro e trocar a cópia em `tela/refy-ui` por dependência no `tela/app/package.json`. Dependências: 1.2. Evidência esperada: o pacote publicado, o `package.json` apontando para ele, a pasta removida e `npm ci && npm run build` verde.

## 2. O que viaja no clone

- [x] 2.1 [sonnet] Tirar `tela/app/node_modules` do versionamento. Dependências: 1.2. Evidência 2026-08-07: `git rm -r --cached` removeu 2594 arquivos e `tela/app/node_modules/` entrou no `.gitignore`; `git ls-files tela/app/node_modules | wc -l` devolve 0; `npm run build` terminou em `built in 3.68s`. Falta provar o `npm ci` em clone limpo, que é a 2.3.
- [x] 2.2 [fable] Registrar em `docs/` a decisão de manter `tela/estatico` versionado (D4) e a de não reescrever o histórico (D3), cada uma com a alternativa recusada. Evidência 2026-08-10: `docs/decisoes/2026-08-10-build-e-historico.md` registra as duas decisões e a razão de manter o build versionado.
- [x] 2.3 [haiku] Conferir que um clone limpo reconstrói. Dependências: 2.1. Evidência 2026-08-07: `git clone` para `/tmp/prova-clone` trouxe 45 MB e nenhum `node_modules`; `npm ci && npm run build` em `tela/app` terminou em `built in 4.79s`; `diff -rq` entre o `tela/estatico` do clone e o do repositório não acusou diferença, provando que o build versionado está em dia. Falta a foto da tela pelo README, que espera a 5.1.

## 3. Contrato de trabalho

- [x] 3.1 [fable] Escrever `AGENTS.md`. Dependências: nenhuma. Evidência 2026-08-07: `AGENTS.md` com fontes de verdade, a regra de prova por tipo de mudança (tela pelo navegador, gerador pela árvore gerada), a razão de recurso não sair de adivinhação, estilo, formato de commit e o que exige decisão humana; cada regra traz o defeito que a motivou. `CLAUDE.md` reduzido a `@AGENTS.md` mais três parágrafos do que é específico do Claude Code.
- [x] 3.2 [fable] Escrever `CONTRIBUTING.md`. Dependências: 3.1. Evidência 2026-08-07: o arquivo cobre rodar (com a tabela do que é opcional e o que cada ferramenta habilita), propor pelo openspec, provar antes do pull request e reportar defeito; o README aponta para ele.
- [x] 3.3 [sonnet] Reorganizar a documentação espalhada em `docs/`: `CONTRATO-TELA.md` e `CONTRATO-TELA-2.md` viraram `docs/interface/contrato-tela-beta.md` e `docs/interface/decisao-interface-2026-08-10.md`; `MODELO-DOMINIOS.md` virou `docs/dominios-e-contas.md`; `PRODUCT.md` e `DESIGN.md` continuam onde a skill `impeccable` os procura, com link em `docs/index.md`. Evidência 2026-08-10: arquivos movidos, links internos atualizados e nome de cliente removido desses documentos.
- [x] 3.4 [haiku] Código de conduta e modelos. Dependências: 3.2. Evidência 2026-08-10: `CODE_OF_CONDUCT.md`, `.github/ISSUE_TEMPLATE/defeito.md`, `.github/ISSUE_TEMPLATE/proposta.md` e `.github/pull_request_template.md` revisados; o PR pede `bash testes/portoes.sh`, task OpenSpec e documentação quando comportamento público mudou.

## 4. Automação que reprova

- [x] 4.1 [sonnet] Criar `testes/portoes.sh`. Dependências: 2.1. Evidência 2026-08-07: `bash testes/portoes.sh` devolveu `compila ok`, `constroi ok`, `arvore ok`, `tela ok` em 24s. O portão da tela sobe o servidor numa porta própria e o derruba mesmo quando a prova quebra no meio.
- [x] 4.2 [opus] Árvore de referência. Dependências: 4.1. Evidência 2026-08-07: `testes/arvore_referencia.py` gera de um desenho fixo (três peças, dois domínios, uma ligação entre contas) e compara com `testes/arvore-esperada/` (21 arquivos). Provado dos dois lados: mudei o cabeçalho do gerador de propósito e o portão reprovou nomeando os três `main.tf` que mudaram, com código de saída 1; desfeita a mudança, voltou a passar. A primeira versão do teste também achou um defeito meu: o markdown de entrada estava com as colunas fora do formato do bloco, e o tradutor gerou uma ligação chamada `destino-para-flui` tirada do próprio cabeçalho.
- [~] 4.3 [sonnet] Escrever `.github/workflows/portoes.yml`. Dependências: 4.1, 4.2. Evidência 2026-08-10: o workflow roda `bash testes/portoes.sh`, instala Python 3.11, Node 22, esquema do provider e Chromium, e publica a foto da tela como artefato. A execução verde no GitHub só existe depois do push, então a task fica aberta até lá.
- [x] 4.4 [haiku] A prova da tela sai com código de erro. Dependências: 4.1. Evidência 2026-08-07: a prova foi reescrita no caminho atual (15 verificações) porque a antiga procurava `.cab-org-campo`, que deixou de existir quando o nome do projeto virou leitura, e o portão acusou isso na primeira execução. Ela reprovou de verdade duas vezes durante o trabalho (`14/15 passaram`, código 1) e agora passa `15/15` com código 0.

## 5. Instalação e primeira hora

- [x] 5.1 [fable] Reescrever a seção de instalação do `README.md`: versões de Python, Node e terraform, dependências de sistema (jq, opa, aws cli, docker para o degrau local), o que é opcional, e a ordem real dos passos. Evidência 2026-08-10: `README.md` aponta versões mínimas e dependências; `docs/instalacao.md` traz instalação por macOS e Linux, diagnóstico e primeiro uso.
- [x] 5.2 [sonnet] Acrescentar `./bioma.sh --diagnostico`: confere cada pré-requisito, diz o que falta e o comando de instalar, sem tocar em nada. Evidência 2026-08-10: `./bioma.sh --diagnostico` devolveu código 0 com `0 erro(s), 2 aviso(s)`, nomeando Docker sem daemon e OPA ausente com `brew install opa`.
- [x] 5.3 [haiku] Gravar um exemplo de primeira hora no README: do clone até a árvore gerada em menos de dez comandos. Evidência 2026-08-10: `README.md` traz sete comandos, de `git clone` até `python3 tela/servidor.py`, com a árvore em `/tmp/bioma-arvore`.

## 6. Portão final

- [ ] 6.1 [fable] GATE por revisor diferente de quem implementou: conferir cada requisito de `specs/repositorio-publico/spec.md` contra o repositório real, item por item, e reprovar o que não tiver prova. Dependências: 1.4, 2.3, 3.4, 4.3, 5.3. Evidência esperada: o relatório datado com um veredito por cenário.
