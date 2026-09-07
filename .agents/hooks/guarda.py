#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Portão de comando: o que já custou caro neste repositório não passa de novo.

Roda como hook `PreToolUse` de Bash, Write e Edit. Lê o JSON do hook no stdin e
devolve a decisão no stdout.

Não substitui julgamento: substitui MEMÓRIA. O que este arquivo cobre é
exatamente o que se esquece quando o contexto está cheio. Cada regra tem a data
do erro que a criou, e sai daqui quando o erro deixar de ser possível.

As regras casam INVOCAÇÃO, e não menção. Um comando que só escreve o nome de um
script dentro de documentação não é o que faz o estrago, e recusá-lo ensina a
contornar o portão em vez de respeitá-lo. Isso não é hipótese: na instância, a
primeira versão da regra do `git add` recusou o commit que documentava a regra
do `git add`.

    guarda.py                # lê o hook no stdin, decide
    guarda.py --autoteste    # o caso recusado e o vizinho que passa

Saída: 0 segue · 2 recusa (com o motivo no stderr, que o agente lê)
"""
import io
import json
import os
import re
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# `cmd` abre o comando, ou vem depois de `;`, `&&`, `||` ou `|`. Sem esta
# âncora, `echo "git add -A"` é lido como `git add -A`.
def invoca(cmd, padrao):
    return re.search(r"(?:^|[;&|]\s*|\n\s*)%s" % padrao, cmd) is not None


def motivo_da_recusa(evento):
    nome = str(evento.get("tool_name") or "")
    entrada = evento.get("tool_input") or {}
    arquivo = str(entrada.get("file_path") or entrada.get("path") or "")
    cmd = str(entrada.get("command") or "")
    base = os.path.basename(arquivo)

    # 1. `git add -A` e `git add .` engolem trabalho de outra sessão.
    #    2026-08-27 no framework: uma remoção de 2594 arquivos se perdeu porque
    #    um `git stash` no meio desfez o índice e o commit passou sem ela.
    if nome == "Bash" and invoca(cmd, r"git\s+add\s+(-A\b|-u\b|\.(?:\s|$))"):
        return ("git add por varredura engole o que outra sessão está escrevendo. "
                "Use caminhos explícitos: `git add ferramentas/x.py tela/y.jsx`.")

    # 2. `git clean -fd` apaga untracked sem olhar de quem é. Quem apaga é o
    #    `-f`: `-n` é ensaio e `-d` só diz que entra em diretório. A primeira
    #    versão desta regra casava `-[a-z]*[fd]` e recusava `git clean -nd`, que
    #    é justamente o comando que se manda antes de apagar. O autoteste pegou.
    if nome == "Bash" and invoca(cmd, r"git\s+clean\s+(?:-[a-eg-mo-z]*f|--force)"):
        return ("git clean apaga untracked sem olhar de quem é. "
                "Liste com `git clean -nd` e apague por caminho.")

    # 3. Reescrever histórico e forçar push são as duas ações desta lista que
    #    o dono do repositório pediu para exigirem decisão humana (AGENTS.md,
    #    "O que exige decisão humana").
    if nome == "Bash" and invoca(cmd, r"git\s+push\s+.*(--force\b|-f\b)"):
        return "push forçado reescreve o que já está publicado: peça ao humano."
    if nome == "Bash" and invoca(cmd, r"git\s+rebase\s+-i|git\s+reset\s+--hard\s+origin"):
        return "reescrever histórico é decisão humana (AGENTS.md)."

    # 4. `push` sem o que reprova em segundos. NÃO é o `testes/portoes.sh`
    #    inteiro: ele constrói o app e sobe o Playwright, leva minutos e um hook
    #    que leva minutos vira hook que alguém desliga. Aqui rodam só os portões
    #    baratos, que são os que pegam o erro bobo antes de ele virar CI
    #    vermelho; o portão completo continua no CI e no fecho da sessão
    #    (skill `ciclo-de-sessao`).
    if nome == "Bash" and invoca(cmd, r"git\s+push\b") and not os.environ.get("BIOMA_PORTOES_OK"):
        falha = portoes_rapidos()
        if falha:
            return ("os portões rápidos reprovam, e o CI vai reprovar igual:\n%s\n"
                    "Corrija, ou exporte BIOMA_PORTOES_OK=1 se a falha for de ambiente." % falha)

    # 5. Segredo não entra em arquivo rastreado. O `.env.example` é o modelo, e
    #    ele passa: recusar o modelo é recusar quem documenta o formato.
    if nome in ("Write", "Edit", "MultiEdit") and re.match(r"^\.env($|\.)", base) and base != ".env.example":
        return "edição direta de %s: segredo não é versionado." % base

    return ""


# O que roda antes do push: segundos, sem rede, sem navegador, sem build.
RAPIDOS = (
    ([sys.executable, "-m", "compileall", "-q", "ferramentas", "tela/servidor.py"],
     "o Python não compila"),
    ([sys.executable, ".agents/scripts/evals_do_harness.py"],
     "os casos do harness reprovam"),
)


def portoes_rapidos(raiz=None):
    """A saída do primeiro portão rápido que reprova, e "" quando todos passam.

    Ausência de insumo não reprova: comando que não existe nesta árvore devolve
    "", porque árvore incompleta não é árvore errada, e portão que recusa por
    ausência ensina a desligar o portão.
    """
    raiz = raiz or RAIZ
    for comando, rotulo in RAPIDOS:
        if comando[1] != "-m" and not os.path.exists(os.path.join(raiz, comando[-1])):
            continue
        if comando[1] == "-m":
            # compila o que existir nesta raiz, e não uma lista fixa
            alvos = [d for d in ("ferramentas", "tela") if os.path.exists(os.path.join(raiz, d))]
            alvos += [f for f in os.listdir(raiz) if f.endswith(".py")] if os.path.isdir(raiz) else []
            if not alvos:
                continue
            comando = comando[:3] + alvos
        try:
            p = subprocess.run(comando, cwd=raiz, capture_output=True, text=True, timeout=60)
        except (subprocess.TimeoutExpired, OSError):
            continue
        if p.returncode != 0:
            return "%s:\n%s" % (rotulo, (p.stdout + p.stderr)[-500:])
    return ""


def decide(evento):
    return 2 if motivo_da_recusa(evento) else 0


def _caso_do_push():
    """A regra 4 exercitada de verdade, nas duas pontas.

    Ela não cabe em `casos.json` porque precisa de uma árvore no disco: uma que
    compila e uma que não. Sem este caso, a regra passaria no autoteste com a
    variável de ambiente ligada, que é o carimbo que este harness proíbe.
    """
    import shutil
    import tempfile
    erros = []
    base = tempfile.mkdtemp(prefix="guarda-caso-")
    try:
        # ponta A: árvore que compila, o push segue
        os.makedirs(os.path.join(base, "ferramentas"))
        io.open(os.path.join(base, "ferramentas", "ok.py"), "w", encoding="utf-8").write("x = 1\n")
        io.open(os.path.join(base, "tela_servidor_falso.py"), "w", encoding="utf-8").write("y = 2\n")
        if portoes_rapidos(base):
            erros.append("  push numa árvore que compila devia seguir, e foi recusado")
        # ponta B: árvore que não compila, o push para
        io.open(os.path.join(base, "ferramentas", "quebrado.py"), "w", encoding="utf-8").write("def (\n")
        if not portoes_rapidos(base):
            erros.append("  push numa árvore que não compila devia parar, e passou")
    finally:
        shutil.rmtree(base, ignore_errors=True)
    return erros


def autoteste():
    """Cada regra com o caso que ela recusa E o vizinho que ela deixa passar."""
    casos = json.load(io.open(os.path.join(RAIZ, ".agents", "fixtures", "casos.json"),
                              encoding="utf-8"))
    # os casos de `casos.json` não são sobre a regra 4: ela tem caso próprio
    # logo abaixo, e é lá que ela roda sem atalho
    os.environ["BIOMA_PORTOES_OK"] = "1"
    erros = _caso_do_push()
    for c in casos:
        if c.get("tipo") != "acao-sensivel":
            continue
        obtido = decide(c["evento"])
        if obtido != c["esperado"]:
            erros.append("  %s: esperava saída %s e veio %s" % (c["nome"], c["esperado"], obtido))
    if erros:
        print("guarda: autoteste REPROVOU\n" + "\n".join(erros), file=sys.stderr)
        return 1
    recusados = sum(1 for c in casos if c.get("tipo") == "acao-sensivel" and c["esperado"] == 2)
    passam = sum(1 for c in casos if c.get("tipo") == "acao-sensivel" and c["esperado"] == 0)
    print("guarda: autoteste passou · %d recusas e %d vizinhos que passam "
          "(+ a regra do push, nas duas pontas)" % (recusados, passam))
    return 0


def main():
    if "--autoteste" in sys.argv:
        return autoteste()
    try:
        bruto = sys.stdin.read().strip()
        evento = json.loads(bruto) if bruto else {}
    except ValueError:
        return 0
    motivo = motivo_da_recusa(evento)
    if not motivo:
        return 0
    print(motivo, file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main())
