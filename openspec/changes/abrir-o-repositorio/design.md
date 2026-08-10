# Design: abrir o repositório

As decisões deste change, com a alternativa recusada.

## D1. Licença do bioma.sh

Decisão: PolyForm Shield License 1.0.0.

Razão: o dono exige que terceiros não vendam a ferramenta, mesmo em fork, e que a Skopia possa usar o bioma.sh para vender serviço. PolyForm Shield permite uso, mudança e distribuição para fins que não concorram com o software nem com produtos do licenciante feitos com ele.

Alternativas recusadas:

| Licença | Por que não serve |
|---|---|
| Apache-2.0 | permite vender fork e serviço concorrente |
| PolyForm Noncommercial 1.0.0 | bloqueia uso comercial interno por terceiros sem contrato separado |
| BUSL-1.1 com Additional Use Grant | exige Change Date e abertura futura da versão |

A decisão detalhada está em `docs/decisoes/2026-08-10-licenca.md`.

## D2. O `@refy/ui` dentro da árvore

`tela/refy-ui` é uma cópia do design system de origem privada. A cópia tem `tela/refy-ui/LICENSE`, `package.json` com `Apache-2.0` e origem em `tela/refy-ui/ORIGEM.md`.

Três saídas avaliadas:

1. Publicar o pacote e consumir por dependência.
2. Manter a cópia com permissão escrita.
3. Substituir por camada mínima própria.

Decisão atual: manter a cópia licenciada até existir pacote publicado. Publicar pacote e remover a cópia continua na task 1.5, porque envolve ação fora desta máquina.

## D3. O `node_modules` versionado

Saiu do versionamento. `npm ci` reconstrói a dependência, e `package-lock.json` fica como fonte da resolução.

## D4. O `tela/estatico` versionado

Fica versionado. Isso permite abrir a tela com `python3 tela/servidor.py` sem Node instalado.

A alternativa recusada foi exigir build local para todo primeiro uso. Isso tornaria o clone mais puro e pioraria o caminho de quem só quer usar a ferramenta.

## D5. Histórico do Git

Não será reescrito agora. Remover arquivos do índice não apaga o peso do histórico, mas reescrever histórico quebra clones e exige decisão humana.

A decisão está registrada em `docs/decisoes/2026-08-10-build-e-historico.md`.

## D6. Contrato de agentes

`AGENTS.md` é o contrato único. `CLAUDE.md` aponta para ele e guarda só o que é específico do harness.

Regra: tela se prova com navegador e foto conferida; gerador se prova com árvore gerada; servidor se prova com rota e resposta.

## D7. Automação que reprova

`testes/portoes.sh` roda seis portões:

1. Python compila.
2. A tela constrói e o build bate com `tela/estatico`.
3. Regras unitárias da receita passam.
4. Diagnóstico em camadas passa.
5. Árvore de referência não muda sem atualização explícita.
6. A tela responde no navegador.

O workflow `.github/workflows/portoes.yml` roda o mesmo script.

## D8. Segredo e dado de máquina

`.gitignore` cobre segredo, estado, cache, conta local, projeto local, recentes, `node_modules`, logs, `.DS_Store` e `__pycache__`.

Varredura final deve procurar:

- nome de cliente;
- `/Users/`;
- chave de API OpenAI e chave de acesso AWS;
- chave privada;
- conta AWS de 12 dígitos fora dos exemplos.
