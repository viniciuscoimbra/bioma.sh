#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""O mapa de contas de uma instância vira a lista de contas do desenho.

A instância já declara conta, número e família em `infra/contas.hcl`. Sem isto,
quem desenha digita a lista de novo na tela, e as duas divergem no primeiro
vending de conta sem ninguém reclamar.

    python3 ferramentas/contas_do_live.py <caminho>/contas.hcl
"""
import io
import json
import os
import re
import sys

# `nome = get_env("VAR", "111111111111")` ou `nome = "111111111111"`. O valor de
# queda é o que a instância usa quando a variável não está posta, então é ele
# que representa a conta no desenho.
LINHA = re.compile(r'^\s*"?([A-Za-z0-9_-]+)"?\s*=\s*(?:get_env\([^,]+,\s*)?"(\d{6,14})"')
SUFIXOS = ("-nprd", "-prd", "-dev", "-hml")


def area_da_conta(apelido):
    """A área é a família do nome, sem o sufixo de ambiente.

    `barramento-nprd` e `barramento-prd` são a mesma caixa em dois ambientes, e
    é a caixa que rotula o desenho.
    """
    base = apelido
    for s in SUFIXOS:
        if base.endswith(s):
            base = base[: -len(s)]
            break
    return " ".join(p.capitalize() for p in base.replace("_", "-").split("-"))


def contas_do_live(caminho):
    """Devolve (lista, erro). Erro em português, dizendo o que se procurou."""
    caminho = os.path.abspath(os.path.expanduser(caminho or ""))
    if not os.path.isfile(caminho):
        return None, "não achei o mapa de contas em %s" % caminho
    texto = io.open(caminho, encoding="utf-8").read()
    if "contas = {" not in texto:
        return None, ("%s não tem o bloco `contas = {`, que é onde a instância "
                      "declara conta e número" % caminho)
    corpo = texto.split("contas = {", 1)[1]
    lista, vistos = [], {}
    for linha in corpo.splitlines():
        if linha.strip().startswith("}"):
            break
        m = LINHA.match(linha)
        if not m:
            continue
        apelido, numero = m.group(1), m.group(2).zfill(12)
        # número repetido recusa a importação inteira, e não some da lista.
        # Descartar em silêncio era pior que os dois caminhos que já existem:
        # quem digita a mesma conta duas vezes é recusado, e quem importa
        # perdia uma conta sem nenhum aviso na tela.
        if numero in vistos:
            return None, ("a conta %s aparece duas vezes no mapa, como `%s` e "
                          "`%s`. Importar apagaria uma das duas em silêncio: "
                          "corrija %s antes." % (numero, vistos[numero], apelido,
                                                 os.path.basename(caminho)))
        vistos[numero] = apelido
        lista.append({
            "apelido": apelido,
            "numero": numero,
            "area": area_da_conta(apelido),
            "padrao": False,
        })
    if not lista:
        return None, "o bloco `contas` de %s não tem nenhuma conta legível" % caminho
    lista[0]["padrao"] = True
    return lista, None


def main(argv):
    if len(argv) != 2:
        print(__doc__.strip())
        return 2
    lista, erro = contas_do_live(argv[1])
    if erro:
        print(erro, file=sys.stderr)
        return 1
    print(json.dumps(lista, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
