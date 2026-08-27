#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gate: aplicação que espera schema não nasce antes da migração ter rodado.

    python3 ferramentas/verificar_migracao.py <caminho-do-live> [--escopo <célula>]

A ordem da esteira é migração ANTES do deploy (15.2): a tarefa efêmera muta o
banco, a esteira confere o código de saída, e só então a aplicação sobe. Quem
aplica a célula por fora da esteira pula essa ordem, e o defeito não aparece no
apply: a função nasce perfeita e falha na primeira escrita, com erro de relação
inexistente, que parece defeito da aplicação e é ausência de migração.

Foi o que aconteceu em 2026-08-26 com o escrivão do livro em produção.

Como o portão sabe: a receita declara em `contrato.json` o que ela espera do
banco, e a tarefa de migração publica em SSM o que aplicou.

    contrato.json:  "exige_schema": ["staging", "ledger", "outbox"]
    parâmetro SSM:  /<dominio>/<ambiente>/migracao/schemas  (lista, separada por vírgula)

O parâmetro é escrito pela tarefa de migração, na conta do ambiente, ao
terminar com sucesso. Nada além dela deveria escrevê-lo: é o registro de que a
mutação aconteceu, e escrever à mão é assinar que rodou sem ter rodado.

Sai 0 quando toda célula com `exige_schema` tem a evidência; 1 quando falta; 2
quando não há insumo para decidir (sem live, sem credencial, sem catálogo).
"""
import io
import json
import os
import re
import subprocess
import sys


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


def credencial_da_conta(conta, papel):
    """A entrada na conta do ambiente. Sem ela o portão não decide, e dizer
    'passou' sem ter olhado é o pior resultado possível."""
    d = aws_json(["sts", "assume-role", "--role-session-name", "gate-migracao",
                  "--role-arn", "arn:aws:iam::%s:role/%s" % (conta, papel)])
    if not d:
        return None
    c = d["Credentials"]
    return (c["AccessKeyId"], c["SecretAccessKey"], c["SessionToken"])


def contrato_da_celula(hcl):
    """O contrato da receita que a célula usa, pelo mesmo caminho que o gate de
    durabilidade resolve: o `source` aponta o catálogo, e o catálogo tem a
    ficha."""
    texto = io.open(hcl, encoding="utf-8").read()
    m = re.search(r"catalogo/{1,2}([a-z0-9/_-]+)", texto)
    if not m:
        return None, None
    rel = m.group(1)
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(hcl)))
    while raiz != "/" and not os.path.isdir(os.path.join(raiz, "catalogo")):
        raiz = os.path.dirname(raiz)
    caminho = os.path.join(raiz, "catalogo", rel, "contrato.json")
    if not os.path.isfile(caminho):
        return None, None
    try:
        return json.load(io.open(caminho, encoding="utf-8")), caminho
    except ValueError:
        return None, None


def dominio_e_ambiente(rel):
    """`core-bancario/prd/aplicacao/posting-ledger` -> (core-bancario, prd)."""
    partes = rel.split(os.sep)
    return (partes[0], partes[1]) if len(partes) >= 2 else (None, None)


def celulas_com_exigencia(live, escopo):
    fora = []
    raiz = os.path.join(live, escopo) if escopo else live
    for base, dirs, arqs in os.walk(raiz):
        dirs[:] = [d for d in dirs if d not in (".terragrunt-cache", ".terraform", "catalogo")]
        if "terragrunt.hcl" not in arqs:
            continue
        hcl = os.path.join(base, "terragrunt.hcl")
        contrato, _ = contrato_da_celula(hcl)
        if not contrato:
            continue
        exige = contrato.get("exige_schema") or []
        if exige:
            fora.append((os.path.relpath(base, live), exige))
    return sorted(fora)


def main(argv):
    if len(argv) < 2:
        print(__doc__, file=sys.stderr)
        return 2
    live = os.path.abspath(argv[1])
    escopo = None
    if "--escopo" in argv:
        escopo = argv[argv.index("--escopo") + 1]
    if not os.path.isdir(live):
        print("caminho do live inexistente: %s" % live, file=sys.stderr)
        return 2

    alvos = celulas_com_exigencia(live, escopo)
    if not alvos:
        print("migração · nenhuma célula declara `exige_schema` neste escopo: "
              "sem insumo para decidir", file=sys.stderr)
        return 2

    mapa = json.loads(subprocess.run(
        [sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                      "contas_do_live.py"), "--json"],
        capture_output=True, text=True).stdout or "{}") if os.path.isfile(
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "contas_do_live.py")) else {}

    papel = os.environ.get("TG_PAPEL_ESTEIRA", "esteira-apply")
    faltando, conferidas, sem_entrada = [], 0, []
    for rel, exige in alvos:
        dominio, ambiente = dominio_e_ambiente(rel)
        conta = os.environ.get("TG_CONTA_%s_%s" % (
            dominio.replace("-", "_").upper(), ambiente.upper()))
        if not conta:
            conta = (mapa.get("%s-%s" % (dominio, ambiente)) or {}).get("id") if isinstance(mapa, dict) else None
        if not conta:
            sem_entrada.append((rel, "conta do ambiente não declarada"))
            continue
        creds = credencial_da_conta(conta, papel)
        if creds is None:
            sem_entrada.append((rel, "sem entrada na conta %s" % conta))
            continue
        nome = "/%s/%s/migracao/schemas" % (dominio, ambiente)
        d = aws_json(["ssm", "get-parameter", "--name", nome], creds)
        aplicados = set()
        if d:
            aplicados = {s.strip() for s in (d.get("Parameter", {}).get("Value") or "").split(",") if s.strip()}
        conferidas += 1
        faltam = [s for s in exige if s not in aplicados]
        if faltam:
            faltando.append((rel, faltam, nome, sorted(aplicados) or ["(o parâmetro não existe)"]))

    if sem_entrada:
        for rel, razao in sem_entrada:
            print("sem insumo · %s: %s" % (rel, razao), file=sys.stderr)
        if not conferidas:
            return 2

    if faltando:
        print("migração reprovou: %d célula(s) esperam schema que ninguém aplicou\n" % len(faltando))
        for rel, faltam, nome, aplicados in faltando:
            print("  %s" % rel)
            print("      espera: %s" % ", ".join(faltam))
            print("      %s diz: %s" % (nome, ", ".join(aplicados)))
        print("\nA migração roda ANTES do deploy, como tarefa efêmera na VPC do")
        print("ambiente, com a imagem por digest (15.2). Aplicar a célula agora")
        print("faz a função nascer e falhar na primeira escrita, com erro de")
        print("relação inexistente, que parece defeito da aplicação.")
        return 1

    print("migração · %d célula(s) com schema exigido, todas com evidência da "
          "tarefa que o aplicou" % conferidas)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
