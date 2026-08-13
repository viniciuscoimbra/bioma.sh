#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Lê a Organization e escreve as linhas de `instancia.env` com os números reais.

Depois que `fundacao/04-contas` aplica, cada conta existe de verdade e tem um
número. Transcrever 49 números à mão é onde o erro entra, e erro de número de
conta não aparece no plano: ele aparece no apply, apontando para a conta errada.

    aws sso login   (ou o que sua sessão exigir na management)
    python3 ferramentas/contas_da_organizacao.py >> infra/instancia.env

Sem argumento, ele fala com a AWS. Com um arquivo JSON como argumento, lê a
saída já salva de `aws organizations list-accounts`, para conferir sem sessão.
"""
import io
import json
import os
import re
import subprocess
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTAS_HCL = os.path.join(AQUI, "infra", "contas.hcl")
# `apelido = get_env("TG_CONTA_X", "DECLARE_TG_CONTA_X")`, que é a forma de hoje,
# ou `apelido = "111111111111"` para uma conta escrita direto.
#
# A queda deixou de ser numérica quando o portão de procedência entrou: um número
# de exemplo forma nome de balde válido e grava estado na conta errada, então a
# queda virou `DECLARE_<VARIÁVEL>`, que o S3 recusa. Este regex ainda exigia
# dígitos, casava zero linha, e as duas ferramentas que dependem dele
# devolviam lista vazia sem dizer nada — inclusive a que o runbook manda rodar
# logo depois de as contas nascerem.
LINHA = re.compile(
    r'^\s*"?([A-Za-z0-9_-]+)"?\s*=\s*'
    r'(?:get_env\(\s*"([^"]+)"\s*,\s*)?'
    r'"(\d{6,14}|DECLARE_[A-Z0-9_]+)"'
)


def apelidos_esperados():
    """{apelido no live: nome da variável} do mapa de contas da instância."""
    fora = {}
    if not os.path.isfile(CONTAS_HCL):
        return fora
    corpo = io.open(CONTAS_HCL, encoding="utf-8").read()
    if "contas = {" in corpo:
        corpo = corpo.split("contas = {", 1)[1]
    for linha in corpo.splitlines():
        if linha.strip().startswith("}"):
            break
        m = LINHA.match(linha)
        if m:
            apelido, variavel, _n = m.group(1), m.group(2), m.group(3)
            fora[apelido] = variavel or ("TG_CONTA_%s" % apelido.upper().replace("-", "_"))
    return fora


def da_aws():
    saida = subprocess.run(
        ["aws", "organizations", "list-accounts", "--output", "json"],
        capture_output=True, text=True)
    if saida.returncode != 0:
        print("não consegui falar com a Organization. Faça a sessão na conta de "
              "management e tente de novo.\n%s" % saida.stderr.strip(), file=sys.stderr)
        sys.exit(2)
    return json.loads(saida.stdout)


def main(argv):
    bruto = (json.load(io.open(argv[1], encoding="utf-8")) if len(argv) > 1
             else da_aws())
    contas = bruto.get("Accounts") or []
    if not contas:
        print("a Organization não devolveu conta nenhuma", file=sys.stderr)
        return 2

    esperados = apelidos_esperados()
    # o apelido da conta na AWS é o Name; ele é o que casa com o live
    por_nome = {c["Name"]: c["Id"] for c in contas if c.get("Status") == "ACTIVE"}

    # A raiz e o identificador da Organization saem da mesma sessão que lista as
    # contas, e faltar TG_ROOT_ID derruba o pré-voo com `r-mock` em qualquer
    # célula que receba a raiz. Quem roda este comando para trazer os números já
    # está na management: pedir uma segunda ferramenta para duas linhas é como o
    # valor ficava faltando.
    if len(argv) <= 1:
        org = subprocess.run(["aws", "organizations", "describe-organization",
                              "--query", "Organization.Id", "--output", "text"],
                             capture_output=True, text=True)
        raiz = subprocess.run(["aws", "organizations", "list-roots",
                               "--query", "Roots[0].Id", "--output", "text"],
                              capture_output=True, text=True)
        print("\n# ── a Organization, lida da mesma sessão ──────────────────────────")
        if org.returncode == 0 and org.stdout.strip():
            print("TG_ORG_ID=%s" % org.stdout.strip())
        if raiz.returncode == 0 and raiz.stdout.strip():
            print("TG_ROOT_ID=%s" % raiz.stdout.strip())

    print("\n# ── números reais, lidos da Organization ──────────────────────────")
    achadas, faltando = 0, []
    for apelido, variavel in sorted(esperados.items()):
        if apelido in por_nome:
            print("%s=%s" % (variavel, por_nome[apelido]))
            achadas += 1
        else:
            faltando.append(apelido)

    sobrando = sorted(set(por_nome) - set(esperados))
    print("\n# %d de %d contas do live encontradas na Organization." % (achadas, len(esperados)),
          file=sys.stderr)
    if faltando:
        print("# ainda não existem na Organization: %s" % ", ".join(faltando), file=sys.stderr)
    if sobrando:
        print("# existem na Organization e não estão no live: %s" % ", ".join(sobrando),
              file=sys.stderr)
    # conta que existe na nuvem e não no desenho é achado, não detalhe: ou ela
    # nasceu fora da esteira, ou o live está atrasado.
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
