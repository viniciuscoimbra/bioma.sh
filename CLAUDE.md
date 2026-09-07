# Harness do bioma.sh para Claude Code

@AGENTS.md

## Específico do Claude Code

**Prova visual é gate.** Antes de dizer que uma mudança de tela está pronta:
construa (`npm run build` em `tela/app`), reinicie o servidor, abra no
navegador, meça o que mudou e **olhe a foto**. O `testes/prova-tela.py` faz o
caminho inteiro e serve de ponto de partida.

**Scratchpad, não o repositório.** Prova, screenshot e script temporário vão
para o diretório de scratchpad da sessão ou para `/tmp`, nunca para dentro do
repositório.

**Uma coisa por vez no commit.** O corpo do commit diz o que estava errado
antes; quando o defeito foi meu, ele diz isso sem rodeio.

**O portão de comando roda antes de você.** `.agents/hooks/guarda.py` é hook de
`PreToolUse` e recusa, com o motivo escrito, o que já custou caro aqui. Recusa
não é opinião dele: cada regra tem a data do erro que a criou e um caso no
`.agents/fixtures/casos.json`. Se uma recusa estiver errada, o conserto é uma
regra melhor com o caso ao lado, nunca desligar o hook.
