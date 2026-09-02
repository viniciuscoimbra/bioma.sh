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
      "<caminho/da/receita>": {
        "<nome_do_input>": { "valor": "<exigido>", "por_que": "<a norma que obriga>" }
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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hcl_lido import sem_comentario  # noqa: E402

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IGNORA = {".terragrunt-cache", ".terraform"}

FONTE = re.compile(r'source\s*=\s*"[^"]*catalogo//?((?:organismos|ligacoes|moleculas)/[a-z0-9\-/]+)"')


def bloco_inputs(texto):
    """Só o corpo de `inputs = { ... }`. É ele que decide o que a receita recebe.

    Procurar a chave no arquivo inteiro deixa um `locals` com o mesmo nome
    responder pela obrigação enquanto o `inputs` passa outra coisa, e o portão
    aprova o que o Terraform não vai aplicar.
    """
    i = texto.find("inputs")
    while i >= 0:
        j = texto.find("{", i)
        if j < 0:
            return ""
        nivel, k = 0, j
        while k < len(texto):
            if texto[k] == "{":
                nivel += 1
            elif texto[k] == "}":
                nivel -= 1
                if nivel == 0:
                    return texto[j:k]
            k += 1
        return texto[j:]
    return ""


def valor_no_hcl(texto, chave):
    """O valor literal de `chave = "..."` dentro de `inputs`, ou None.

    None significa "não sei ler", e não "cumpre": expressão que este verificador
    não entende é acusada, porque aprovar o que não se leu é a mentira que ele
    existe para impedir.
    """
    m = re.search(r'^\s*%s\s*=\s*"([^"]*)"\s*$' % re.escape(chave),
                  bloco_inputs(sem_comentario(texto)), re.M)
    return m.group(1) if m else None


def declara(texto, chave):
    """A célula fala desta chave em `inputs`? (mesmo que por expressão)"""
    return re.search(r'^\s*%s\s*=' % re.escape(chave),
                     bloco_inputs(sem_comentario(texto)), re.M) is not None


def _texto(v):
    """O valor como o HCL o escreveria, para os dois lados compararem igual."""
    if isinstance(v, bool):
        return "true" if v else "false"
    if v is None:
        return None
    return str(v)


def default_da_receita(catalogo, receita, chave):
    arq = os.path.join(catalogo, receita, "variables.tf")
    if not os.path.isfile(arq):
        return None
    txt = io.open(arq, encoding="utf-8").read()
    m = re.search(r'variable\s+"%s"\s*\{(.*?)\n\}' % re.escape(chave), txt, re.S)
    if not m:
        return None
    # Default NÃO é só string. A primeira versão desta regex casava apenas
    # `default = "..."`, e devolvia None para número e booleano: uma obrigação
    # sobre `dias_estado_antigo = 90` reprovava as quarenta e nove células, todas
    # com a mensagem "o valor veio de o default da receita" e o valor nulo.
    # Portão que sabe cobrar precisa saber LER, e ler em todas as formas em que
    # o valor pode estar escrito.
    d = re.search(r'^\s*default\s*=\s*"([^"]*)"', m.group(1), re.M)
    if d:
        return d.group(1)
    d = re.search(r'^\s*default\s*=\s*(true|false|-?\d+(?:\.\d+)?)\s*$', m.group(1), re.M)
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
            efetivo, origem = valor_no_hcl(txt, chave), "a célula"
            if not declara(txt, chave):
                efetivo = default_da_receita(catalogo, receita, chave)
                origem = "o default da receita"
            elif efetivo is None:
                origem = "a célula, por expressão que não sei ler"
            # Comparar como TEXTO, e não como o tipo que cada lado trouxe. O
            # exigido vem do JSON já tipado (90 é int, false é bool), e o
            # efetivo vem lido do HCL, que é texto. Sem normalizar, "90" != 90
            # e "false" != False reprovavam toda célula que estava certa.
            if _texto(efetivo) != _texto(exigido):
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
