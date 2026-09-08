#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""O de-para entre o componente da AWS e o nível do bioma continua honesto?

    python3 ferramentas/verificar_niveis.py            confere o catálogo
    python3 ferramentas/verificar_niveis.py --autoteste o caso e o vizinho

Duas perguntas, e nenhuma delas adivinha nível:

1. Toda linha de `ferramentas/niveis_aws.json` aponta um tipo que o catálogo
   usa? Linha morta é tabela que ninguém revisa.

2. Entrou no catálogo algum recurso com cara de escopo de Organization sem
   linha na tabela? Aqui o nome NÃO decide o nível: ele só dispara a pergunta.
   A diferença importa — `aws_organizations_organizational_unit` e
   `aws_kms_key` são níveis diferentes, e quem decide isso é gente, uma vez,
   por escrito. O que este portão impede é a decisão ficar em silêncio.

A razão de existir está no desenho: a tela punha AWS Organizations no mesmo
degrau de uma conta, porque nada dizia que os dois vivem em níveis diferentes.
"""
import io
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TABELA = os.path.join(AQUI, "ferramentas", "niveis_aws.json")

# As marcas de uma API que fala com a Organization, e não com uma conta. Elas
# só PERGUNTAM; a resposta é a linha na tabela.
MARCAS = re.compile(
    r"organizations|controltower|ssoadmin|identitystore"
    r"|organization_admin|organization_configuration")

RESOURCE = re.compile(r'^resource\s+"([a-z0-9_]+)"', re.M)
FONTE = re.compile(r'^\s*source\s*=\s*"([^"]+)"', re.M)


def tipos_da_receita(raiz, receita, vistos=None):
    """Os tipos de recurso que esta receita cria, seguindo o que ela compõe.

    `arvore-ous` não declara `resource` nenhum: quem cria a OU é a molécula
    `ou-registrada` que ela compõe. Classificar só pelo que está no arquivo da
    receita responderia "conta" para a peça que É o ecossistema.
    """
    vistos = vistos if vistos is not None else set()
    pasta = os.path.join(raiz, receita.replace("/", os.sep))
    real = os.path.realpath(pasta)
    if real in vistos or not os.path.isdir(real):
        return set()
    vistos.add(real)
    tipos = set()
    for a in sorted(os.listdir(real)):
        if not a.endswith(".tf"):
            continue
        texto = io.open(os.path.join(real, a), encoding="utf-8", errors="replace").read()
        tipos.update(RESOURCE.findall(texto))
        for fonte in FONTE.findall(texto):
            # só caminho local: `git::` e registro são de fora, e o que vem de
            # fora se declara, não se lê
            if fonte.startswith("."):
                alvo = os.path.relpath(os.path.realpath(os.path.join(real, fonte)), raiz)
                tipos.update(tipos_da_receita(raiz, alvo, vistos))
    return tipos


def nivel_da_receita(raiz, receita, tabela=None):
    """`ecossistema` se a receita cria algo que fala com a Organization."""
    d = json.load(io.open(tabela or TABELA, encoding="utf-8"))
    eco = set(d.get("ecossistema", {}))
    return "ecossistema" if (tipos_da_receita(raiz, receita) & eco) else "conta"


def tipos_do_catalogo(raiz):
    achados = set()
    for base, _, arqs in os.walk(raiz):
        if ".terraform" in base:
            continue
        for a in arqs:
            if not a.endswith(".tf"):
                continue
            texto = io.open(os.path.join(base, a), encoding="utf-8", errors="replace").read()
            achados.update(RESOURCE.findall(texto))
    return achados


def confere(raiz_catalogo=None, tabela=None):
    d = json.load(io.open(tabela or TABELA, encoding="utf-8"))
    eco = {k: v for k, v in d.get("ecossistema", {}).items()}
    tipos = tipos_do_catalogo(raiz_catalogo or os.path.join(AQUI, "catalogo"))
    queixas = []
    for t in sorted(set(eco) - tipos):
        queixas.append("linha morta: `%s` está na tabela e o catálogo não usa" % t)
    for t in sorted(t for t in tipos if MARCAS.search(t) and t not in eco):
        queixas.append(
            "`%s` fala com a Organization e não tem linha: diga o nível dele "
            "em ferramentas/niveis_aws.json, com a razão" % t)
    for t, razao in sorted(eco.items()):
        if not (razao or "").strip():
            queixas.append("`%s` está declarado sem razão escrita" % t)
    return queixas, len(eco), len(tipos)


def autoteste():
    import shutil
    import tempfile
    fora = tempfile.mkdtemp(prefix="bioma-niveis-")
    falhas = []
    try:
        # O CASO: um recurso de Organization entra no catálogo sem linha.
        cat = os.path.join(fora, "catalogo", "organismos", "x")
        os.makedirs(cat)
        io.open(os.path.join(cat, "main.tf"), "w", encoding="utf-8").write(
            'resource "aws_organizations_organization" "o" {}\n'
            'resource "aws_organizations_policy" "p" {}\n'
            'resource "aws_ssoadmin_permission_set" "s" {}\n')
        tab = os.path.join(fora, "vazia.json")
        io.open(tab, "w", encoding="utf-8").write('{"ecossistema": {}}')
        q, _, _ = confere(os.path.join(fora, "catalogo"), tab)
        if len(q) != 3:
            falhas.append("o caso: esperava 3 queixas, vieram %d" % len(q))

        # O VIZINHO: recurso de conta não é cobrado, e a tabela declarada passa.
        io.open(os.path.join(cat, "main.tf"), "w", encoding="utf-8").write(
            'resource "aws_kms_key" "k" {}\n'
            'resource "aws_s3_bucket" "b" {}\n'
            'resource "aws_organizations_policy" "p" {}\n')
        io.open(tab, "w", encoding="utf-8").write(
            '{"ecossistema": {"aws_organizations_policy": "regra herdada"}}')
        q, _, _ = confere(os.path.join(fora, "catalogo"), tab)
        if q:
            falhas.append("o vizinho: devia passar, e veio %r" % q)

        # A linha morta também é queixa.
        io.open(tab, "w", encoding="utf-8").write(
            '{"ecossistema": {"aws_organizations_policy": "ok",'
            ' "aws_controltower_landing_zone": "não usado aqui"}}')
        q, _, _ = confere(os.path.join(fora, "catalogo"), tab)
        if len(q) != 1 or "linha morta" not in q[0]:
            falhas.append("linha morta: esperava uma queixa, veio %r" % q)
    finally:
        shutil.rmtree(fora, ignore_errors=True)
    for f in falhas:
        print("  FALHA " + f)
    print("níveis: autoteste %s · o caso recusado e o vizinho que passa"
          % ("passou" if not falhas else "REPROVOU"))
    return 1 if falhas else 0


def main(argv):
    if "--autoteste" in argv:
        return autoteste()
    queixas, n_eco, n_tipos = confere()
    print("níveis · %d tipos no catálogo · %d declarados como ecossistema · "
          "%d de conta" % (n_tipos, n_eco, n_tipos - n_eco))
    for q in queixas:
        print("  " + q)
    if queixas:
        print("\nO nível não sai de semelhança de nome: escreva a linha.")
        return 1
    print("  toda linha aponta tipo em uso, e nenhum recurso de Organization "
          "entrou sem decisão escrita")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
