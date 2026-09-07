#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""O harness tem o que promete? Um critério por linha, medido no disco.

Não é nota de qualidade: é lista de presença. Cada critério pergunta por um
arquivo ou por um conteúdo que precisa existir para uma promessa do `AGENTS.md`
ser verificável. Critério que passa não diz que a coisa é boa; diz que ela é
conferível.

O placar existe porque harness apodrece calado: o hook deixa de estar ligado, a
skill perde o link, o portão sai do CI, e nada avisa. Aqui avisa.

    placar_do_harness.py              imprime o placar
    placar_do_harness.py --exigir N   sai 1 se o placar for menor que N

Saída: 0 medido (ou acima do mínimo) · 1 abaixo do mínimo pedido
"""
import io
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def texto(rel):
    p = os.path.join(RAIZ, rel)
    return io.open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def existe(rel):
    return os.path.exists(os.path.join(RAIZ, rel))


CRITERIOS = [
    ("contrato-versionado", "O contrato do agente está no repositório",
     lambda: existe("AGENTS.md") and "@AGENTS.md" in texto("CLAUDE.md")),
    ("harness-sem-vendor", "O harness mora em .agents/ e as cascas apontam para lá",
     lambda: existe(".agents/hooks/guarda.py") and ".agents/hooks/guarda.py" in texto(".claude/settings.json")),
    ("portao-de-comando", "Existe portão antes da ação, com autoteste",
     lambda: existe(".agents/hooks/guarda.py") and "--autoteste" in texto(".agents/hooks/guarda.py")),
    ("caso-por-regra", "Todo portão tem caso recusado E vizinho que passa",
     lambda: bool(_dois_lados())),
    ("evidencia-cobrada", "Task fechada sem comando reprova",
     lambda: existe(".agents/scripts/portao_evidencia.py")),
    ("prova-no-pr", "Corpo de PR sem prova reprova",
     lambda: existe(".agents/scripts/portao_prova.py")),
    ("portoes-no-ci", "Os portões do harness rodam no CI",
     lambda: ".agents/scripts/evals_do_harness.py" in texto(".github/workflows/harness.yml")),
    ("portoes-da-arvore-no-ci", "Os portões do produto rodam no CI",
     lambda: "testes/portoes.sh" in texto(".github/workflows/portoes.yml")),
    ("verificacao-cruzada", "O procedimento de revisão por outro vendor está escrito",
     lambda: existe(".agents/skills/verificacao-cruzada/SKILL.md")),
    ("portao-do-loop", "O gate que decide se algo vira loop autônomo está escrito",
     lambda: existe(".agents/skills/portao-do-loop/SKILL.md")),
    ("as-duas-cascas", "Claude e Codex leem as mesmas skills",
     lambda: existe(".claude/skills/verificacao-cruzada") and existe(".codex/skills/verificacao-cruzada")),
    ("regua-da-ida-e-volta", "A régua da regra pétrea é executável",
     lambda: existe("ferramentas/ida_e_volta.py")),
]


def _dois_lados():
    """Todo tipo de caso tem pelo menos um recusado e um que passa."""
    p = os.path.join(RAIZ, ".agents", "fixtures", "casos.json")
    if not os.path.isfile(p):
        return False
    casos = json.load(io.open(p, encoding="utf-8"))
    por_tipo = {}
    for c in casos:
        t = c.get("tipo")
        if not t:
            continue
        recusa = c.get("esperado") == 2 or c.get("ok") is False
        por_tipo.setdefault(t, set()).add(recusa)
    return bool(por_tipo) and all(len(v) == 2 for v in por_tipo.values())


def main():
    linhas = []
    for ident, rotulo, teste in CRITERIOS:
        try:
            ok = bool(teste())
        except Exception:
            ok = False
        linhas.append((ok, ident, rotulo))
    pontos = sum(1 for ok, _, _ in linhas if ok)
    print("placar do harness · %d de %d" % (pontos, len(linhas)))
    for ok, ident, rotulo in linhas:
        print("  %s  %-26s %s" % ("ok " if ok else "FALTA", ident, rotulo))
    if "--exigir" in sys.argv:
        minimo = int(sys.argv[sys.argv.index("--exigir") + 1])
        if pontos < minimo:
            print("placar abaixo do mínimo pedido (%d)" % minimo, file=sys.stderr)
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
