#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gate: a árvore usa os valores que esta instituição declarou obrigatórios.

O catálogo é genérico de propósito. A postura padrão de um firewall, o tempo de
retenção de um log, o algoritmo de uma chave: cada um é um botão, porque nem
toda instituição que usa este catálogo responde ao mesmo regulador.

Quem responde a um declara em `convencoes.json`, e a partir daí o botão para de
ser botão: vira obrigação, e mexer nele reprova. Sem isso, a conformidade passa
a depender de quem rodou o comando naquele dia.

    "politicas_obrigatorias": {
      "organismos/rede/inspecao-egress": {
        "postura_default": { "valor": "drop", "por_que": "CMN 4.893, art. 3º" }
      }
    }

O valor que vale é o efetivo: o que a célula passa, ou o default da receita
quando ela não passa nada. Uma obrigação que o default já satisfaz continua
declarada, porque default muda e obrigação não.

Uso: verificar_conformidade.py [caminho-da-instancia]
Saída: 0 conforme · 1 reprovado · 2 sem insumo para decidir
"""
import io
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IGNORA = {".terragrunt-cache", ".terraform"}

FONTE = re.compile(r'source\s*=\s*"[^"]*catalogo//?((?:organismos|ligacoes|moleculas)/[a-z0-9\-/]+)"')


def valor_no_hcl(texto, chave):
    """O valor literal de `chave = "..."`, ou None quando não é literal simples.

    Expressão que não seja literal volta como None de propósito: dizer que uma
    obrigação foi cumprida por algo que este verificador não sabe ler seria
    exatamente a mentira que ele existe para impedir.
    """
    m = re.search(r'^\s*%s\s*=\s*"([^"]*)"\s*$' % re.escape(chave), texto, re.M)
    return m.group(1) if m else None


def default_da_receita(catalogo, receita, chave):
    arq = os.path.join(catalogo, receita, "variables.tf")
    if not os.path.isfile(arq):
        return None
    txt = io.open(arq, encoding="utf-8").read()
    m = re.search(r'variable\s+"%s"\s*\{(.*?)\n\}' % re.escape(chave), txt, re.S)
    if not m:
        return None
    d = re.search(r'^\s*default\s*=\s*"([^"]*)"', m.group(1), re.M)
    return d.group(1) if d else None


def main(argv):
    raiz = os.path.abspath(argv[1]) if len(argv) > 1 else AQUI
    conv = os.path.join(raiz, "convencoes.json")
    if not os.path.isfile(conv):
        print("sem convencoes.json em %s: sem insumo para decidir" % raiz, file=sys.stderr)
        return 2
    obrigacoes = (json.load(io.open(conv, encoding="utf-8"))
                  .get("politicas_obrigatorias") or {})
    obrigacoes = {k: v for k, v in obrigacoes.items() if not k.startswith("_")}
    if not obrigacoes:
        print("conformidade: esta instância não declarou política obrigatória")
        return 0

    live = os.path.join(raiz, "infra")
    catalogo = os.path.join(live, "catalogo")
    if not os.path.isdir(live):
        print("sem infra/ em %s: sem insumo para decidir" % raiz, file=sys.stderr)
        return 2

    queixas, conferidas = [], 0
    for base, dirs, arqs in os.walk(live):
        dirs[:] = [d for d in dirs if d not in IGNORA]
        if "terragrunt.hcl" not in arqs:
            continue
        txt = io.open(os.path.join(base, "terragrunt.hcl"), encoding="utf-8").read()
        m = FONTE.search(txt)
        if not m or m.group(1) not in obrigacoes:
            continue
        receita = m.group(1)
        celula = os.path.relpath(base, live)
        for chave, regra in obrigacoes[receita].items():
            if chave.startswith("_"):
                continue
            exigido = regra["valor"] if isinstance(regra, dict) else regra
            porque = regra.get("por_que", "") if isinstance(regra, dict) else ""
            conferidas += 1
            efetivo = valor_no_hcl(txt, chave)
            origem = "a célula"
            if efetivo is None and ("%s " % chave) not in txt and ("%s=" % chave) not in txt:
                efetivo = default_da_receita(catalogo, receita, chave)
                origem = "o default da receita"
            if efetivo != exigido:
                queixas.append((celula, chave, exigido, efetivo, origem, porque))

    print("conformidade · %d obrigações conferidas em %d receitas"
          % (conferidas, len(obrigacoes)))
    if not queixas:
        return 0
    for celula, chave, exigido, efetivo, origem, porque in queixas:
        print("\n  %s" % celula)
        print("    %s = %r, e esta instituição exige %r" % (chave, efetivo, exigido))
        print("    (o valor veio de %s)" % origem)
        if porque:
            print("    por quê: %s" % porque)
    print("\nA obrigação está em convencoes.json, `politicas_obrigatorias`. Mudar o")
    print("valor exige mudar a declaração, e a declaração fica no diff.")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
