#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Corpo de PR sem a prova não passa.

A tabela de `AGENTS.md` diz qual prova fecha cada tipo de mudança. Quem revisa
precisa dela no corpo do PR, e não num comentário que se perde: PR sem prova
transfere para o revisor o trabalho de descobrir o que foi conferido.

    PR_BODY="..." portao_prova.py
    portao_prova.py --autoteste

Saída: 0 passou (ou não há corpo) · 1 reprovou
"""
import io
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RESUMO = re.compile(r"^##\s+(resumo|summary)", re.I | re.M)
PROVA = re.compile(r"^##\s+(prova|verifica|evid)", re.I | re.M)


def faltas(corpo):
    fora = []
    if not RESUMO.search(corpo):
        fora.append("falta `## Resumo` no corpo do PR")
    if not PROVA.search(corpo):
        fora.append("falta `## Prova` no corpo do PR (AGENTS.md diz qual prova fecha cada mudança)")
    return fora


def autoteste():
    casos = json.load(io.open(os.path.join(RAIZ, ".agents", "fixtures", "casos.json"),
                              encoding="utf-8"))
    erros = []
    for c in casos:
        if c.get("tipo") != "prova":
            continue
        if (not faltas(c["corpo"])) != c["ok"]:
            erros.append("  %s: esperava ok=%s" % (c["nome"], c["ok"]))
    if erros:
        print("prova: autoteste REPROVOU\n" + "\n".join(erros), file=sys.stderr)
        return 1
    print("prova: autoteste passou")
    return 0


def main():
    if "--autoteste" in sys.argv:
        return autoteste()
    corpo = os.environ.get("PR_BODY", "")
    if not corpo:
        print("prova: sem corpo de PR, nada a decidir")
        return 0
    fora = faltas(corpo)
    if not fora:
        print("prova: o corpo do PR traz resumo e prova")
        return 0
    print("\n".join(fora), file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
