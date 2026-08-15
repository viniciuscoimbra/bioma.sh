#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""As células que ficam FORA do recorte de um `--ate`, uma por linha.

    python3 ferramentas/recorte.py <caminho> --ate prd

Toda instalação tem mais ambientes na árvore do que numa corrida. Quem decide
quais entram é o `--ate`, e o resto sai da fila. Este comando responde o "resto".

O vocabulário é da instituição, e vem de `convencoes.json`: os ambientes de
workload em ordem de criticidade, e os planos das contas de capacidade. Estava
escrito em `case` de shell, com `dev`, `hml`, `prd` e `nprd` dentro do
orquestrador. Uma instituição que chamasse o ambiente dela de `pre` montava a
fila certa e depois excluía as células erradas, sem erro na tela: o comando
terminava dizendo sucesso tendo aplicado menos do que a fila prometia.

Um segmento do caminho é de ambiente quando ele é um dos nomes declarados, ou
termina em `-<nome>`. Nome que a instituição não declarou não é ambiente, e a
célula fica: recortar pelo que não se conhece é o caminho para sumir com célula
sem dizer.

A célula que CRIA conta é exceção declarada: ela roda na conta de management, e
o sufixo do nome diz o ambiente que a conta VAI hospedar, não onde ela nasce.
Filtrar por ele deixava as contas de todo ambiente não corrente fora de toda
fila, e nenhuma delas nasceria nunca.
"""
import os
import subprocess
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Caminho cuja célula não carrega ambiente de execução, e por isso não é
# recortada por ele.
SEM_AMBIENTE_DE_EXECUCAO = ("fundacao/04-contas",)


def convencao(chave):
    r = subprocess.run([sys.executable, os.path.join(AQUI, "ferramentas", "convencoes.py"),
                        chave], capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit("convencoes.json: %s" % (r.stderr or "").strip())
    return [x for x in (r.stdout or "").splitlines() if x.strip()]


def dentro_do_ate(ate):
    """Os ambientes que ESTA corrida cobre, workload e plano juntos.

    Mesma regra posicional do leitor da fila: o mais crítico roda sozinho, e
    qualquer outro roda do primeiro até ele. O plano da capacidade acompanha.
    """
    workload = convencao("ambientes_por_natureza.workload")
    planos = convencao("ambientes_por_natureza.capacidade")
    if not workload or ate not in workload:
        raise SystemExit("convencoes.json: `%s` não está em ambientes_por_natureza.workload"
                         % ate)
    if ate == workload[-1]:
        dentro = set(workload[-1:])
        dentro |= set(planos[-1:])
    else:
        dentro = set(workload[:workload.index(ate) + 1])
        dentro |= set(planos[:1])
    return dentro, set(workload) | set(planos)


def e_ambiente(segmento, conhecidos):
    """`prd` é ambiente; `faturamento-prd` também; `dados` não."""
    if segmento in conhecidos:
        return segmento
    for nome in conhecidos:
        if segmento.endswith("-" + nome):
            return nome
    return None


def main(argv):
    if len(argv) < 2:
        print(__doc__, file=sys.stderr)
        return 2
    raiz = argv[1]
    ate = argv[argv.index("--ate") + 1] if "--ate" in argv else ""
    if not ate:
        print("recorte.py pede --ate", file=sys.stderr)
        return 2
    if not os.path.isdir(raiz):
        return 0
    dentro, conhecidos = dentro_do_ate(ate)

    for base, dirs, arqs in os.walk(raiz):
        dirs[:] = [d for d in dirs if d != ".terragrunt-cache"]
        if "terragrunt.hcl" not in arqs:
            continue
        norm = base.replace(os.sep, "/")
        if any(("/%s/" % x) in norm + "/" for x in SEM_AMBIENTE_DE_EXECUCAO):
            continue
        rel = os.path.relpath(base, raiz)
        fora = False
        for segmento in rel.split("/"):
            nome = e_ambiente(segmento, conhecidos)
            if nome and nome not in dentro:
                fora = True
                break
        if fora:
            print(base)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
