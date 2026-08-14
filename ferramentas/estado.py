#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""O que já rodou, o que falta e o que está travado, célula a célula.

    python3 ferramentas/estado.py            # a árvore inteira
    python3 ferramentas/estado.py plataforma # uma área

Quem responde é a AWS, e não o histórico: célula com estado no balde já foi
aplicada, e célula sem estado ainda não. O journal diz quando, e a lista de
variáveis sem valor diz o que impede.

Três colunas de resposta, e nenhuma delas depende de alguém ter anotado:

    rodou      tem estado no balde da conta dela
    falta      não tem estado, e nada impede
    travado    não tem estado, e uma variável da instância está sem valor
"""
import io
import json
import os
import re
import subprocess
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INFRA = os.path.join(AQUI, "infra")


def celulas(area):
    raiz = os.path.join(INFRA, area) if area else INFRA
    fora = []
    for base, dirs, arqs in os.walk(raiz):
        dirs[:] = [d for d in dirs if d not in (".terragrunt-cache", "catalogo")]
        if "terragrunt.hcl" in arqs and os.path.basename(base) != "fundacao":
            rel = os.path.relpath(base, INFRA)
            if rel != ".":
                fora.append(rel)
    return sorted(fora)


def baldes():
    """balde -> chaves com estado, um balde por conta que a árvore usa."""
    r = subprocess.run(["aws", "s3api", "list-buckets",
                        "--query", "Buckets[?starts_with(Name,`tfstate-`)].Name",
                        "--output", "json"], capture_output=True, text=True)
    nomes = json.loads(r.stdout or "[]") if r.returncode == 0 else []
    mapa = {}
    for balde in nomes:
        r = subprocess.run(["aws", "s3api", "list-objects-v2", "--bucket", balde,
                            "--query", "Contents[].Key", "--output", "json"],
                           capture_output=True, text=True)
        if r.returncode == 0:
            chaves = json.loads(r.stdout or "null") or []
            mapa[balde] = {k[:-len("/terraform.tfstate")]
                           for k in chaves if k.endswith("/terraform.tfstate")}
    return mapa


def aplicadas(mapa):
    todas = set()
    for chaves in mapa.values():
        todas |= chaves
    return todas


def travas():
    """célula -> variáveis sem valor, do mesmo verificador do pré-voo."""
    r = subprocess.run([sys.executable,
                        os.path.join(AQUI, "ferramentas", "verificar_ilustrativo.py"),
                        "producao", INFRA], capture_output=True, text=True)
    presa, atual = {}, None
    for linha in (r.stdout or "").splitlines():
        m = re.match(r"^\s{2}(TG_[A-Z_0-9]+) =", linha)
        if m:
            atual = m.group(1)
        m = re.match(r"^\s+cai em: (.+)$", linha)
        if m and atual:
            for alvo in m.group(1).split(","):
                presa.setdefault(alvo.strip(), set()).add(atual)
    return presa


def journal():
    quando = {}
    d = os.path.join(AQUI, "execucao")
    for arq in sorted(os.listdir(d)) if os.path.isdir(d) else []:
        if not arq.startswith("journal-") or not arq.endswith(".jsonl"):
            continue
        for linha in io.open(os.path.join(d, arq), encoding="utf-8"):
            try:
                ev = json.loads(linha)
            except ValueError:
                continue
            if ev.get("acao") == "apply" and ev.get("resultado") == "ok":
                rel = os.path.relpath(str(ev.get("caminho", "")), INFRA)
                quando[rel] = str(ev.get("momento", ""))[:10]
    return quando


def main(argv):
    area = argv[1] if len(argv) > 1 else ""
    mapa = baldes()
    tem = aplicadas(mapa)
    presa = travas()
    quando = journal()

    rodou, falta, travado = [], [], []
    for rel in celulas(area):
        # a chave no balde é o caminho da célula relativo a `infra/`, que é o
        # que `path_relative_to_include()` devolve com o root no topo do trilho
        if any(rel in chaves for chaves in mapa.values()):
            rodou.append((rel, quando.get(rel, "")))
        elif rel in presa:
            travado.append((rel, sorted(presa[rel])))
        else:
            falta.append(rel)

    print("estado da árvore%s · a AWS é quem responde\n" % (" · %s" % area if area else ""))
    print("rodou (%d)" % len(rodou))
    for rel, dia in rodou:
        print("  %-58s %s" % (rel, dia))
    print("\nfalta (%d), e nada impede" % len(falta))
    for rel in falta:
        print("  %s" % rel)
    print("\ntravado (%d), esperando valor da instância" % len(travado))
    for rel, vs in travado:
        print("  %-58s %s" % (rel, ", ".join(vs)))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
