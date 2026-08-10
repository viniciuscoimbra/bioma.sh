#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""As seis áreas do caso de uso, passando pelo bioma inteiro.

Para cada área: traduz a especificação, gera a árvore com a conferência do
provider ligada, e conta o que saiu. O número que interessa é quantas receitas
o provider aceita sem intervenção, e quantas células a seta ligou.

  BIOMA_TERRAFORM=<terraform> python3 testes/seis-areas.py
"""
import io
import json
import os
import re
import subprocess
import sys
import tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
FERR = os.path.join(RAIZ, "ferramentas")

# A instância que serve de caso de uso. Fora dela, o teste se declara pulado em
# vez de fingir que passou.
RA = os.environ.get(
    "BIOMA_INSTANCIA",
    "")
CONVENCOES = os.path.join(RA, "implementacao/bioma/convencoes.json")

AREAS = [
    ("fundação",    "arquitetura/00-fundacao/00-fundacao.md"),
    ("barramento",  "arquitetura/01-barramento/01-barramento.md"),
    ("rede",        "arquitetura/02-rede-conectividade/02-rede-conectividade.md"),
    ("segurança",   "arquitetura/03-seguranca-identidade/03-seguranca-identidade.md"),
    ("dados",       "arquitetura/04-plataforma-dados/04-plataforma-dados.md"),
    ("esteira",     "arquitetura/15-devsecops-plataforma/15-devsecops-plataforma.md"),
]


def uma(nome, rel, conferir):
    espec = os.path.join(RA, rel)
    if not os.path.isfile(espec):
        return None
    tmp = tempfile.mkdtemp(prefix="bioma-seis-")
    cmd = [sys.executable, os.path.join(FERR, "traduzir_bloco.py"), espec, "--saida", tmp]
    if os.path.isfile(CONVENCOES):
        cmd += ["--convencoes", CONVENCOES]
    subprocess.run(cmd, capture_output=True, text=True)
    prop = os.path.join(tmp, "proposta.json")
    if not os.path.exists(prop):
        return {"area": nome, "erro": "o tradutor não produziu proposta"}
    arv = os.path.join(tmp, "arvore")
    g = [sys.executable, os.path.join(FERR, "gerar_iac.py"), prop, "--destino", arv, "--forcar"]
    if conferir:
        g.append("--conferir")
    saida = subprocess.run(g, capture_output=True, text=True).stdout

    receitas, com_recurso, aceitas = 0, 0, 0
    for base, _d, arqs in os.walk(os.path.join(arv, "catalogo")):
        if "main.tf" not in arqs:
            continue
        receitas += 1
        corpo = io.open(os.path.join(base, "main.tf"), encoding="utf-8").read()
        # receita sem recurso valida no terraform e não é receita: contá-la
        # como aceita foi o que fez a medida anterior parecer boa
        if not re.search(r'^resource\s+"', corpo, re.M):
            continue
        com_recurso += 1
        if "TODO(o provider reclamou)" not in corpo:
            aceitas += 1
    celulas, com_dep, puxam = 0, 0, 0
    for base, _d, arqs in os.walk(os.path.join(arv, "live")):
        if "terragrunt.hcl" not in arqs:
            continue
        celulas += 1
        t = io.open(os.path.join(base, "terragrunt.hcl"), encoding="utf-8").read()
        if re.search(r'^dependency\s+"', t, re.M):
            com_dep += 1
        if ".outputs." in t:
            puxam += 1
    m = re.search(r"conferência: (\d+) de (\d+)", saida)
    return {"area": nome, "receitas": receitas, "com_recurso": com_recurso,
            "aceitas": aceitas if conferir else None,
            "celulas": celulas, "com_dep": com_dep, "puxam": puxam,
            "conferencia": m.group(0) if m else None, "arvore": arv}


def main(argv):
    conferir = "--rapido" not in argv
    if not os.path.isdir(RA):
        print("pulado: a instância do caso de uso não está nesta máquina "
              "(aponte com BIOMA_INSTANCIA)")
        return 0
    if conferir and not (os.environ.get("BIOMA_TERRAFORM")
                         or subprocess.run(["which", "terraform"],
                                           capture_output=True).returncode == 0):
        print("sem terraform: rodando sem a conferência do provider")
        conferir = False

    print("%-12s %-9s %-12s %-9s %-9s %-9s %s"
          % ("área", "receitas", "com recurso", "aceitas", "células", "com dep.", "puxam"))
    total = {"receitas": 0, "com_recurso": 0, "aceitas": 0, "celulas": 0, "com_dep": 0}
    for nome, rel in AREAS:
        r = uma(nome, rel, conferir)
        if r is None:
            print("%-12s (especificação ausente)" % nome)
            continue
        if r.get("erro"):
            print("%-12s %s" % (nome, r["erro"]))
            continue
        print("%-12s %-9s %-12s %-9s %-9s %-9s %s"
              % (nome, r["receitas"], r["com_recurso"],
                 r["aceitas"] if r["aceitas"] is not None else "-",
                 r["celulas"], r["com_dep"], r["puxam"]), flush=True)
        for k in total:
            total[k] += r[k] or 0
    print("%-12s %-9s %-12s %-9s %-9s %-9s"
          % ("total", total["receitas"], total["com_recurso"], total["aceitas"],
             total["celulas"], total["com_dep"]))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
