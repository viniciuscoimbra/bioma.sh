# Como colaborar

## Rode antes

```bash
./bioma.sh --diagnostico
bash testes/portoes.sh
```

O diagnóstico diz o que falta na máquina. Os portões dizem se a mudança quebrou Python, tela, regras da receita, diagnóstico, árvore de referência ou prova de navegador.

## Proponha pelo OpenSpec

Mudança de comportamento começa em `openspec/changes/<nome>/`.

Arquivos esperados:

- `proposal.md`: problema, mudança, impacto e o que quebra para quem já usa.
- `design.md`: decisões, alternativas recusadas e razão.
- `specs/<capability>/spec.md`: `Requirement` e `Scenario`.
- `tasks.md`: lista com evidência esperada por item.

Valide:

```bash
openspec validate <nome>
```

## Prove

Uma task só fecha com comando executado e resultado observável anotado na própria linha.

| Mudança | Prova |
|---|---|
| tela | navegador, clique dado, resultado medido e foto conferida |
| gerador ou tradutor | árvore gerada e trecho do arquivo que mudou |
| servidor | rota chamada e resposta |
| texto de interface | frase nova em contexto nas duas línguas |
| licença ou dependência | fonte, licença e decisão registrada |

Foto tirada e não conferida não fecha task. Verde de CI sem evidência no `tasks.md` também não fecha task.

## Texto

Use português do Brasil. Frase curta. Afirmação verificável. Sem texto de marketing.

A interface é bilíngue. Toda microcopy fica em `tela/app/src/dicionario.js`.

## Pull request

Preencha o template. Cole o comando e o resultado dos portões. Aponte a task do OpenSpec.

Não use `git add -A` sem olhar o que entrou:

```bash
git status --short
git diff --stat
```

## Defeito

Abra issue com passos, resultado esperado, resultado visto e versões da máquina. Se for tela, anexe foto. Se envolver segredo ou credencial, use `SECURITY.md`.
