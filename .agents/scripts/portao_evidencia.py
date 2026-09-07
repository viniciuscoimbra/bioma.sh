#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Task fechada sem evidência de comando não fecha.

`AGENTS.md` diz "prova ou não aconteceu", e a evidência de cada task mora no
`tasks.md` da change. A regra vale só para a linha que o diff FECHA (`+- [x]`):
task que continua aberta não deve nada, e task que já estava fechada antes não
volta a ser cobrada.

Evidência é comando que alguém pode repetir. Adjetivo não é evidência: "ficou
bom" e "testado" passam por prova e não são, e é exatamente por aí que uma
tarefa entra fechada sem nada por trás.

    portao_evidencia.py <base>   confere o diff de <base>...HEAD
    portao_evidencia.py --autoteste

Saída: 0 passou · 1 reprovou · 0 com aviso quando não há base (nada a comparar)
"""
import io
import json
import os
import re
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FECHA = re.compile(r"^\+\s*-\s*\[x\]", re.I)
# comando que dá para repetir: crase com conteúdo, ou uma invocação nomeada
COMANDO = re.compile(r"`[^`]+`|\b(?:python3?|bash|npm|npx|node|pytest|curl|gh|terragrunt|terraform)\s+\S")


def linhas_sem_prova(diff):
    return [l for l in diff.split("\n") if FECHA.match(l) and not COMANDO.search(l)]


def diff_de(base, alvo="openspec/changes"):
    """O diff, ou ValueError quando o git não conseguiu produzi-lo.

    Antes o código de saída era ignorado: base inexistente devolvia diff vazio,
    e vazio passava por "nenhuma task fechada sem prova". Revisão de 2026-09-06.
    """
    p = subprocess.run(["git", "diff", "--unified=0", "%s...HEAD" % base, "--", alvo],
                       cwd=RAIZ, capture_output=True, text=True)
    if p.returncode != 0:
        raise ValueError("git diff falhou contra %r: %s" % (base, p.stderr.strip()[:200]))
    return p.stdout


def autoteste():
    casos = json.load(io.open(os.path.join(RAIZ, ".agents", "fixtures", "casos.json"),
                              encoding="utf-8"))
    erros = []
    for c in casos:
        if c.get("tipo") != "evidencia":
            continue
        ok = not linhas_sem_prova(c["diff"])
        if ok != c["ok"]:
            erros.append("  %s: esperava ok=%s" % (c["nome"], c["ok"]))
    if erros:
        print("evidência: autoteste REPROVOU\n" + "\n".join(erros), file=sys.stderr)
        return 1
    print("evidência: autoteste passou")
    return 0


def main():
    if "--autoteste" in sys.argv:
        return autoteste()
    base = sys.argv[1] if len(sys.argv) > 1 else ""
    if not base:
        print("evidência: sem base para comparar, nada a decidir")
        return 0
    try:
        faltando = linhas_sem_prova(diff_de(base))
    except ValueError as e:
        print("%s" % e, file=sys.stderr)
        return 1
    if not faltando:
        print("evidência: toda task fechada neste diff traz comando")
        return 0
    print("task fechada sem evidência de comando:\n" + "\n".join(faltando), file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
