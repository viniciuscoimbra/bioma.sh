#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Roda os casos de `fixtures/casos.json` contra os portões que os cobram.

Um autoteste por script já existe. Este roda todos de uma vez e falha se algum
tipo de caso ficar sem dono: caso escrito e nenhum portão que o exercite é
documentação, não portão, e é assim que uma regra morre sem ninguém notar.

    evals_do_harness.py

Saída: 0 todos os casos exercitados e corretos · 1 caso órfão ou reprovado
"""
import io
import json
import os
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# tipo do caso -> quem o exercita
DONO = {
    "acao-sensivel": (".agents/hooks/guarda.py", "--autoteste"),
    "evidencia": (".agents/scripts/portao_evidencia.py", "--autoteste"),
    "prova": (".agents/scripts/portao_prova.py", "--autoteste"),
}


def main():
    casos = json.load(io.open(os.path.join(RAIZ, ".agents", "fixtures", "casos.json"),
                              encoding="utf-8"))
    tipos = {}
    for c in casos:
        if "tipo" in c:
            tipos[c["tipo"]] = tipos.get(c["tipo"], 0) + 1

    orfaos = sorted(set(tipos) - set(DONO))
    if orfaos:
        print("caso sem portão que o exercite: %s" % ", ".join(orfaos), file=sys.stderr)
        return 1
    sem_caso = sorted(set(DONO) - set(tipos))
    if sem_caso:
        print("portão sem caso nenhum: %s" % ", ".join(sem_caso), file=sys.stderr)
        return 1

    falhou = False
    for tipo, (script, flag) in sorted(DONO.items()):
        p = subprocess.run([sys.executable, os.path.join(RAIZ, script), flag],
                           cwd=RAIZ, capture_output=True, text=True)
        marca = "ok " if p.returncode == 0 else "REPROVOU"
        print("  %-8s %-40s %d caso(s)" % (marca, script, tipos[tipo]))
        if p.returncode != 0:
            falhou = True
            sys.stderr.write(p.stdout + p.stderr)
    if falhou:
        return 1
    print("evals do harness: %d casos, todos com dono" % len(tipos and [c for c in casos if "tipo" in c]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
