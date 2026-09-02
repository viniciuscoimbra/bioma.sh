#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""O que já rodou, o que falta e o que está travado, célula a célula.

    python3 ferramentas/estado.py            # a árvore inteira
    python3 ferramentas/estado.py plataforma # uma área

Quem responde é a AWS, e não o histórico: célula com estado no balde já foi
aplicada, e célula sem estado ainda não. O journal diz quando, e a lista de
variáveis sem valor diz o que impede.

Cinco colunas de resposta:

    rodou      tem estado no balde da conta dela
    falta      não tem estado, e nada impede
    adiada     não tem estado, e a própria célula diz por que ainda não roda
    travado    não tem estado, e uma variável da instância está sem valor
    cedeu      não roda mais: a célula diz para quem passou o serviço

`adiada` entrou em 2026-09-02, e a razão é que sem ela a coluna `falta` mentia.
Numa árvore real, das 23 células em `falta`, 23 eram adiadas com razão escrita
na primeira linha do `terragrunt.hcl` — uma esperando a role de um consumer que
não existe (aplicar morre com NoSuchEntity, e já morreu), outra esperando a AWS
liberar o CreateConnector. "falta 23, e nada impede" convidava a aplicar todas.
O número verdadeiro de células aplicáveis era ZERO, e o comando dizia 23.

A declaração já existia e já era lida por `adiadas.py`. O que faltava era esta
coluna consultá-la, e é só isso que mudou: nenhuma medição nova, uma pergunta
que não estava sendo feita.
"""
import io
import json
import os
import re
import subprocess
import sys

import adiadas

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


def aws_json(args, creds=None):
    amb = dict(os.environ)
    if creds:
        amb["AWS_ACCESS_KEY_ID"], amb["AWS_SECRET_ACCESS_KEY"], amb["AWS_SESSION_TOKEN"] = creds
    r = subprocess.run(["aws"] + args + ["--output", "json"],
                       capture_output=True, text=True, env=amb)
    if r.returncode != 0:
        return None
    try:
        return json.loads(r.stdout or "null")
    except ValueError:
        return None


def baldes():
    """balde -> chaves com estado, um balde por conta que a árvore usa.

    O estado de cada célula mora na conta dela, e `list-buckets` só enxerga a
    conta da credencial: sem entrar em cada uma, a árvore inteira aparece como
    não aplicada logo depois de ter sido aplicada. A entrada é a role que o
    Control Tower deixa em toda conta inscrita.
    """
    mapa = {}

    def colhe(creds=None):
        d = aws_json(["s3api", "list-buckets",
                      "--query", "Buckets[?starts_with(Name,`tfstate-`)].Name"], creds)
        for balde in d or []:
            chaves = aws_json(["s3api", "list-objects-v2", "--bucket", balde,
                               "--query", "Contents[].Key"], creds) or []
            mapa[balde] = {k[:-len("/terraform.tfstate")]
                           for k in chaves if k.endswith("/terraform.tfstate")}

    colhe()
    contas = aws_json(["organizations", "list-accounts", "--max-items", "300"]) or {}
    for a in contas.get("Accounts", []):
        if a.get("Status") != "ACTIVE":
            continue
        d = aws_json(["sts", "assume-role", "--role-session-name", "estado",
                      "--role-arn",
                      "arn:aws:iam::%s:role/AWSControlTowerExecution" % a["Id"]])
        if not d:
            continue
        c = d["Credentials"]
        colhe((c["AccessKeyId"], c["SecretAccessKey"], c["SessionToken"]))
    return mapa


def aplicadas(mapa):
    todas = set()
    for chaves in mapa.values():
        todas |= chaves
    return todas


def travas():
    """célula -> variáveis sem valor, do mesmo verificador do pré-voo.

    Nem toda queda impede. `get_env("TG_PAPEL_ESTEIRA", "esteira-apply")` tem
    valor: o template escolheu um, e ele vale. O que impede é a queda que
    declara a própria ausência (`DECLARE_<VARIÁVEL>`, convenção da árvore) e a
    queda ilustrativa, que o verificador já nomeia na linha seguinte. Contar as
    duas juntas punha em `travado` célula que roda hoje, e o comando existe
    justamente para ninguém precisar conferir isso na mão.
    """
    r = subprocess.run([sys.executable,
                        os.path.join(AQUI, "ferramentas", "verificar_ilustrativo.py"),
                        "producao", INFRA], capture_output=True, text=True)
    presa, atual, impede = {}, None, False
    for linha in (r.stdout or "").splitlines():
        m = re.match(r"^\s{2}(TG_[A-Z_0-9]+) = (.*)$", linha)
        if m:
            atual, queda = m.group(1), m.group(2)
            impede = queda.startswith("DECLARE_")
            continue
        m = re.match(r"^\s+([^·]+) · ", linha)
        if m and atual:
            impede = impede or m.group(1).strip() != "queda não sobrescrita"
            continue
        m = re.match(r"^\s+cai em: (.+)$", linha)
        if m and atual and impede:
            for alvo in m.group(1).split(","):
                presa.setdefault(alvo.strip(), set()).add(atual)
    return presa


def cessoes(area):
    """célula -> para quem ela cedeu, declarado na primeira linha dela.

    Uma célula de bootstrap existe para sair de cena: a fundação sobe o serviço
    na management e a célula definitiva assume quando a delegação está de pé.
    Sem a marca, o comando a lista em `falta` para sempre, e quem lê aplica o
    espelho por cima do titular. A marca é `# cedeu para: <caminho>`.
    """
    dito = {}
    for rel in celulas(area):
        arq = os.path.join(INFRA, rel, "terragrunt.hcl")
        for linha in io.open(arq, encoding="utf-8"):
            m = re.match(r"^#\s*cedeu para:\s*(\S+)", linha)
            if m:
                dito[rel] = m.group(1)
                break
    return dito


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
    cedeu_para = cessoes(area)

    rodou, falta, travado, cedeu, adiada = [], [], [], [], []
    # A declaração vem da primeira linha do terragrunt.hcl da própria célula, a
    # mesma que `adiadas.py` lê. Ela vence `presa` porque é decisão escrita por
    # gente, e `presa` é dedução: quando as duas apontam a mesma célula, a
    # razão escrita diz mais do que o nome da variável vazia.
    adiada_por = {rel: v["razao"] for rel, v in adiadas.declaradas().items()
                  if v["tipo"] == "adiada"}
    for rel in celulas(area):
        # A chave no balde é o que `path_relative_to_include()` devolve, e isso
        # depende de onde mora o root.hcl do trilho: na fundação ele está
        # dentro de `fundacao/`, e a chave sai sem esse pedaço; na plataforma
        # ele está acima, e a chave sai com `plataforma/`. As duas formas
        # valem, e comparar só uma fazia a fundação inteira aparecer como não
        # aplicada.
        formas = {rel, rel.split("/", 1)[1] if "/" in rel else rel}
        if any(formas & chaves for chaves in mapa.values()):
            rodou.append((rel, quando.get(rel, "")))
        elif rel in cedeu_para:
            cedeu.append((rel, cedeu_para[rel]))
        elif rel in adiada_por:
            adiada.append((rel, adiada_por[rel]))
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
    if adiada:
        print("\nadiada (%d), com a razão escrita na própria célula" % len(adiada))
        for rel, razao in adiada:
            print("  %-58s %s" % (rel, razao[:88]))
    print("\ntravado (%d), esperando valor da instância" % len(travado))
    for rel, vs in travado:
        print("  %-58s %s" % (rel, ", ".join(vs)))
    if cedeu:
        print("\ncedeu (%d), não roda mais" % len(cedeu))
        for rel, alvo in cedeu:
            print("  %-58s → %s" % (rel, alvo))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
