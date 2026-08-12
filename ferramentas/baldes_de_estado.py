#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Os nomes dos baldes de estado, lidos de `contas.hcl`.

    python3 ferramentas/baldes_de_estado.py

O `root.hcl` monta o backend como `tfstate-<apelido>-<conta>`, e o apelido e o
número saem do mapa de contas. Qualquer lista escrita à parte envelhece: a do
modo local trazia dez apelidos de quando a árvore tinha dez, e o Terraform
pedia um balde que ninguém semeou, com a mensagem de que o balde não existe e
nenhuma pista de que a lista é que estava velha.

Uma variável de ambiente definida vence o número de exemplo, do mesmo jeito que
vence no `root.hcl`.
"""
import io
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(AQUI, "ferramentas"))
from contas_da_organizacao import LINHA  # noqa: E402


def baldes(caminho=None):
    """['tfstate-<apelido>-<conta>', ...] na ordem em que o mapa declara."""
    caminho = caminho or os.path.join(AQUI, "infra", "contas.hcl")
    if not os.path.isfile(caminho):
        return []
    corpo = io.open(caminho, encoding="utf-8").read()
    if "contas = {" in corpo:
        corpo = corpo.split("contas = {", 1)[1]
    fora, vistos = [], set()
    for linha in corpo.splitlines():
        if linha.strip().startswith("}"):
            break
        m = LINHA.match(linha)
        if not m:
            continue
        apelido, variavel, queda = m.group(1), m.group(2), m.group(3)
        numero = os.environ.get(variavel or "", "") or queda
        # A queda `DECLARE_<VARIÁVEL>` existe para ser impossível: o S3 recusa
        # maiúscula e underscore em nome de balde. Montar o nome com ela seria
        # devolver um balde que ninguém pode criar, e no modo local o comando
        # tentaria criar e falharia sem dizer qual conta falta.
        if numero.startswith("DECLARE_"):
            continue
        nome = "tfstate-%s-%s" % (apelido, numero)
        if nome not in vistos:
            vistos.add(nome)
            fora.append(nome)
    return fora


if __name__ == "__main__":
    lista = baldes(sys.argv[1] if len(sys.argv) > 1 else None)
    if not lista:
        print("não achei conta nenhuma em infra/contas.hcl", file=sys.stderr)
        sys.exit(2)
    print("\n".join(lista))
