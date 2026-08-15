#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gate: ninguém aplica uma célula que usa um recurso que ela não alcança.

Um recurso que mora numa conta e é usado de outra precisa das duas pontas: a
política do recurso admitindo quem consome, E permissão no consumidor. Falta
uma, e o Terraform não vê: o recurso está descrito certo, a célula aplica sem
uma queixa, e quem descobre é a primeira requisição, com acesso negado.

Este verificador cruza as duas coisas que a árvore já sabe: quem consome de
outra conta, e quem tem a concessão. A diferença é a lista de células que
aplicam e não funcionam.

**Quais receitas** formam esse par é da instituição, não deste arquivo. Declare
em `convencoes.json`:

    "travessias_de_conta": {
      "<receita que publica o recurso>": {
        "concedida_por": "<ligação que concede o uso>",
        "por_que": "<por que as duas pontas são necessárias>"
      }
    }

Uma travessia se concede de duas formas, e a declaração diz qual:

  `concedida_por`      uma ligação por consumidor, nomeada e auditável uma a uma
  `concedida_na_fonte` a própria receita que publica o recurso já admite quem
                       usa — a key policy com `aws:PrincipalOrgID`, por exemplo

A segunda não é ausência de controle: é o controle declarado uma vez, no lugar
onde o recurso mora, em vez de repetido em N ligações. Onde ela vale, o que
recorta quem usa é o IAM da conta consumidora.

Sem a declaração ele sai como "sem insumo": uma árvore onde ninguém declarou
travessia não está errada, está sem a informação.

Reprova no apply, e não no plano. Planejar a travessia é legítimo (é assim que
se vê o tamanho dela); aplicar é que produz o recurso que falha depois.

Uso: verificar_alcance.py [caminho-da-instancia] [--apply] [--escopo CAMINHO]
Saída: 0 ok ou aviso · 1 reprovado · 2 sem insumo para decidir
"""
import io
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IGNORA = {".terragrunt-cache", ".terraform"}

DEP = re.compile(r'dependency\s+"([^"]+)"\s*\{')
CP = re.compile(r'config_path\s*=\s*"([^"]+)"')
FONTE = re.compile(r'source\s*=\s*"[^"]*catalogo//?((?:organismos|ligacoes|moleculas)/[a-z0-9\-/]+)"')


def conta_de(rel, agrupadores):
    """A conta que aplica a célula: o trilho, pela regra da instância.

    Um topo agrupador não é conta: cada trilho abaixo dele é. Os demais topos
    são a conta inteira. Quem diz quais são agrupadores é `convencoes.json`, em
    `agrupadores_no_live`, porque isso é arranjo de árvore e não lei da
    natureza. Cuidado com o vocabulário de OU, que costuma ter outro nome para a
    mesma coisa: usar um pelo outro colapsa trilhos e esconde travessia.
    """
    partes = rel.split("/")
    if partes[0] in agrupadores and len(partes) > 1:
        return "%s/%s" % (partes[0], partes[1])
    return partes[0]


def celulas(raiz):
    fora = []
    for base, dirs, arqs in os.walk(raiz):
        dirs[:] = [d for d in dirs if d not in IGNORA]
        if "terragrunt.hcl" not in arqs:
            continue
        rel = os.path.relpath(base, raiz)
        txt = io.open(os.path.join(base, "terragrunt.hcl"), encoding="utf-8").read()
        m = FONTE.search(txt)
        fora.append((rel, m.group(1) if m else None, txt))
    return sorted(fora)


def main(argv):
    positivos = [a for a in argv[1:] if not a.startswith("--")]
    raiz = os.path.abspath(positivos[0]) if positivos else AQUI
    apply_mode = "--apply" in argv
    escopo = None
    if "--escopo" in argv:
        escopo = os.path.abspath(argv[argv.index("--escopo") + 1])

    conv = os.path.join(raiz, "convencoes.json")
    if not os.path.isfile(conv):
        print("sem convencoes.json em %s: sem insumo para decidir" % raiz, file=sys.stderr)
        return 2
    convencoes = json.load(io.open(conv, encoding="utf-8"))
    pares = {k: v for k, v in (convencoes.get("travessias_de_conta") or {}).items()
             if not k.startswith("_")}
    agrupadores = set(convencoes.get("agrupadores_no_live") or [])
    if not pares:
        print("alcance: esta instância não declarou travessia de conta")
        return 0

    live = os.path.join(raiz, "infra")
    if not os.path.isdir(live):
        print("sem infra/ em %s: sem insumo para decidir" % raiz, file=sys.stderr)
        return 2
    todas = celulas(live)
    if not todas:
        print("nenhuma célula sob %s: sem insumo para decidir" % live, file=sys.stderr)
        return 2

    # O escopo limita QUEM reprova, e não o que se lê: para saber que uma célula
    # publica um recurso de travessia é preciso enxergar a árvore inteira, mesmo
    # quando o comando é de uma área só. Sem essa separação, aplicar a fundação
    # era barrado por defeito de área que ninguém pediu para aplicar.
    def no_escopo(rel):
        # `startswith` puro casa prefixo de NOME, e não de caminho: o escopo
        # `ligacoes/associacao-tgw` casaria `associacao-tgw-faturamento-dev`,
        # que é outra célula. A árvore tem 12 pares assim.
        if escopo is None:
            return True
        alvo = os.path.abspath(os.path.join(live, rel))
        return alvo == escopo or alvo.startswith(escopo.rstrip(os.sep) + os.sep)

    fontes = {}   # célula que publica -> receita
    concessoes = set()
    # Receita cuja concessão mora na própria fonte: quem publica já admite quem
    # usa, e não há ligação a procurar.
    na_fonte = {r for r, regra in pares.items() if regra.get("concedida_na_fonte")}
    for rel, receita, txt in todas:
        if receita in pares:
            fontes[rel] = receita
        for r, regra in pares.items():
            if receita != regra.get("concedida_por"):
                continue
            # A concessão é POR RECURSO, e não por par de contas. Guardar só
            # `(consumidora, fonte)` fazia um único grant a uma chave esconder o
            # uso de todas as outras chaves entre as mesmas duas contas.
            for m in DEP.finditer(txt):
                cp = CP.search(txt[m.end():txt.find("}", m.end())])
                if cp:
                    alvo = os.path.normpath(os.path.join(rel, cp.group(1)))
                    concessoes.add((conta_de(rel, agrupadores), alvo))

    travessias = []
    for rel, _receita, txt in todas:
        for m in DEP.finditer(txt):
            cp = CP.search(txt[m.end():txt.find("}", m.end())])
            if not cp:
                continue
            alvo = os.path.normpath(os.path.join(rel, cp.group(1)))
            if alvo not in fontes:
                continue
            de, para = conta_de(rel, agrupadores), conta_de(alvo, agrupadores)
            if de == para or (de, alvo) in concessoes:
                continue  # mesma conta, ou concessão declarada PARA ESTE recurso
            if fontes[alvo] in na_fonte:
                continue  # a receita que publica já admite quem usa
            if not no_escopo(rel):
                continue
            travessias.append((rel, fontes[alvo], de, para))

    onde = " (escopo: %s)" % os.path.relpath(escopo, live) if escopo else ""
    print("alcance · %d recursos de travessia · %d usos entre contas sem concessão%s"
          % (len(fontes), len(travessias), onde))
    if not travessias:
        return 0

    por_par = {}
    for rel, receita, de, para in travessias:
        por_par.setdefault((de, para, receita), []).append(rel)
    for (de, para, receita), quais in sorted(por_par.items()):
        regra = pares[receita]
        print("\n  %s usa `%s` de %s em %d células, e nada concede:"
              % (de, receita, para, len(quais)))
        for c in sorted(quais)[:4]:
            print("    %s" % c)
        if len(quais) > 4:
            print("    (e mais %d)" % (len(quais) - 4))
        if regra.get("por_que"):
            print("    %s" % regra["por_que"])
        print("    a concessão é `%s`" % regra.get("concedida_por", "(não declarada)"))

    if apply_mode:
        print("\nREPROVADO: estas células aplicam e falham na primeira requisição.")
        return 1
    print("\nO plano segue: ver o tamanho da travessia é para isso. O apply reprova.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
