#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gate: valor inventado não vira chamada à nuvem.

    python3 ferramentas/verificar_mock.py <caminho-live> [<caminho-catalogo>]

`mock_outputs` existe para planejar uma célula cuja dependência ainda não
aplicou, e `mock_outputs_allowed_terraform_commands` limita o mock ao plano.
Isso protege o APPLY, e não protege o plano: um bloco `data` é resolvido
DURANTE o plano, e o provider vai à nuvem buscar o que o argumento manda.

Quando o argumento de um `data` vem de uma variável que a célula preenche com
`dependency.<x>.outputs.<y>`, e essa dependência tem `mock_outputs`, o plano de
uma árvore ainda não aplicada faz uma chamada real com o valor inventado. Foi o
que aconteceu na fundação de uma instituição: o plano de três ligações de TGW
chamou o SSM contra `arn:aws:ssm:sa-east-1:555555555555:parameter/mock/...`,
com a conta de exemplo dentro do ARN. A resposta foi AccessDenied, e podia ter
sido uma leitura numa conta de terceiro.

Não existe valor de mock inerte para um `data`: ele sempre consulta. A saída é
o organismo não consultar. Onde o valor já é output da produtora, a célula o
recebe por `dependency` e o `data` sai.

Saída: 0 ok · 1 reprovado · 2 sem insumo para decidir
"""
import io
import os
import re
import sys

# `data "tipo" "nome" {` até a chave que fecha o bloco no mesmo nível
DATA = re.compile(r'^data\s+"([^"]+)"\s+"([^"]+)"\s*\{', re.M)
# `var.<nome>` em qualquer posição
VAR = re.compile(r"\bvar\.([a-z_][a-z0-9_]*)\b")
# `<entrada> = dependency.<dep>.outputs.<saida>`
LIGA = re.compile(r"^\s*([a-z_][a-z0-9_]*)\s*=\s*dependency\.([a-z_][a-z0-9_]*)\.outputs\.")
DEPENDENCY = re.compile(r'^dependency\s+"([a-z_][a-z0-9_]*)"\s*\{', re.M)


def corpo_do_bloco(texto, inicio):
    """Do `{` de abertura até a chave que o fecha, contando aninhamento."""
    nivel, i = 0, texto.index("{", inicio)
    for j in range(i, len(texto)):
        if texto[j] == "{":
            nivel += 1
        elif texto[j] == "}":
            nivel -= 1
            if nivel == 0:
                return texto[i:j + 1]
    return texto[i:]


def vars_em_data(caminho):
    """As variáveis que aparecem dentro de bloco `data`, por unidade do catálogo."""
    achados = {}
    for base, dirs, arqs in os.walk(caminho):
        dirs[:] = [d for d in dirs if d != ".terragrunt-cache"]
        for a in arqs:
            if not a.endswith(".tf"):
                continue
            texto = io.open(os.path.join(base, a), encoding="utf-8").read()
            for m in DATA.finditer(texto):
                corpo = corpo_do_bloco(texto, m.start())
                for v in VAR.findall(corpo):
                    achados.setdefault(os.path.relpath(base, caminho), {}).setdefault(
                        v, set()).add("%s.%s" % (m.group(1), m.group(2)))
    return achados


def celulas(live):
    """célula -> (unidade do catálogo, {input: dependência}, {dependências com mock})."""
    fora = {}
    for base, dirs, arqs in os.walk(live):
        dirs[:] = [d for d in dirs if d not in (".terragrunt-cache", "catalogo")]
        if "terragrunt.hcl" not in arqs:
            continue
        texto = io.open(os.path.join(base, "terragrunt.hcl"), encoding="utf-8").read()
        m = re.search(r'source\s*=\s*"[^"]*?catalogo//([\w\-/]+)"', texto)
        if not m:
            continue
        com_mock = set()
        for d in DEPENDENCY.finditer(texto):
            corpo = corpo_do_bloco(texto, d.start())
            if "mock_outputs" in corpo:
                com_mock.add(d.group(1))
        liga = {}
        for linha in texto.splitlines():
            n = LIGA.match(linha)
            if n:
                liga[n.group(1)] = n.group(2)
        fora[os.path.relpath(base, live)] = (m.group(1), liga, com_mock)
    return fora


def main(argv):
    if len(argv) < 2:
        print(__doc__, file=sys.stderr)
        return 2
    live = argv[1]
    catalogo = argv[2] if len(argv) > 2 else os.path.join(live, "catalogo")
    if not os.path.isdir(live) or not os.path.isdir(catalogo):
        print("sem insumo para decidir: falta o live ou o catálogo", file=sys.stderr)
        return 2

    em_data = vars_em_data(catalogo)
    conferidas, achados = 0, []
    for celula, (unidade, liga, com_mock) in sorted(celulas(live).items()):
        conferidas += 1
        perigosas = em_data.get(unidade, {})
        for entrada, dep in sorted(liga.items()):
            if dep not in com_mock or entrada not in perigosas:
                continue
            achados.append((celula, entrada, dep, unidade,
                            sorted(perigosas[entrada])))

    print("mock que fala com a nuvem · %d células conferidas · %d unidade(s) com bloco data"
          % (conferidas, len(em_data)))
    if not achados:
        print("nenhum valor de mock alcança argumento de data source")
        return 0

    for celula, entrada, dep, unidade, blocos in achados:
        print("\n  %s" % celula)
        print("      `%s` vem de dependency.%s, que tem mock_outputs" % (entrada, dep))
        print("      e alimenta %s em %s" % (", ".join(blocos), unidade))
        print("      no plano o provider resolve o data e chama a nuvem com o valor inventado")

    print("\nREPROVADO: mock_outputs_allowed_terraform_commands limita o mock ao plano,")
    print("e é no plano que o data source consulta. Não existe valor inerte para um")
    print("`data`. A saída é a célula receber o valor já pronto por `dependency`, e o")
    print("`data` sair do organismo.")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
