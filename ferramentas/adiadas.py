#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""As células que ficam fora da fila, declaradas nelas mesmas.

    python3 ferramentas/adiadas.py listar        # o que ficou fora, e por quê
    python3 ferramentas/adiadas.py excluir       # a lista para --excluir-de

Duas marcas, no cabeçalho da própria célula:

    # adiada: <razão>
    # trava: <o que fica esperando>

    # cedeu para: <caminho da célula que assumiu>

`adiada` tem volta e `cedeu` não. A diferença importa na tela: a primeira volta
a ser oferecida quando o que a segurava chega, e a segunda nunca mais roda.

A lista de exclusão era escrita à mão, num arquivo separado da célula. Arquivo
assim envelhece calado: a célula muda de nome e a exclusão continua apontando o
nome velho, sem erro nenhum. Agora ela é gerada da árvore.
"""
import io
import os
import re
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INFRA = os.path.join(AQUI, "infra")

ADIADA = re.compile(r"^#\s*adiada:\s*(.+)$")
TRAVA = re.compile(r"^#\s*trava:\s*(.+)$")
CEDEU = re.compile(r"^#\s*cedeu para:\s*(\S+)")
CONTINUACAO = re.compile(r"^#\s{2,}(.+)$")


def declaradas():
    """célula -> {'tipo', 'razao', 'trava'} para toda célula fora da fila."""
    fora = {}
    for base, dirs, arqs in os.walk(INFRA):
        dirs[:] = [d for d in dirs if d not in (".terragrunt-cache", "catalogo")]
        if "terragrunt.hcl" not in arqs:
            continue
        rel = os.path.relpath(base, INFRA)
        achado, campo = None, None
        for linha in io.open(os.path.join(base, "terragrunt.hcl"), encoding="utf-8"):
            linha = linha.rstrip("\n")
            if not linha.startswith("#"):
                break
            m = CEDEU.match(linha)
            if m:
                achado = {"tipo": "cedeu", "razao": m.group(1), "trava": ""}
                campo = None
                continue
            m = ADIADA.match(linha)
            if m:
                achado = achado or {"tipo": "adiada", "razao": "", "trava": ""}
                achado["tipo"] = achado.get("tipo", "adiada")
                achado["razao"] = m.group(1)
                campo = "razao"
                continue
            m = TRAVA.match(linha)
            if m and achado:
                achado["trava"] = m.group(1)
                campo = "trava"
                continue
            m = CONTINUACAO.match(linha)
            if m and achado and campo:
                achado[campo] += " " + m.group(1)
        if achado:
            fora[rel] = achado
    return fora


def pendentes(celula):
    """As variáveis sem valor que a razão da célula nomeia."""
    razao = celula.get("razao", "")
    return [v for v in re.findall(r"TG_[A-Z0-9_]+", razao)
            if not (os.environ.get(v) or "").strip()]


def nomeia_variavel(celula):
    """A razão desta célula chega a NOMEAR alguma variável?

    Separa "não falta nada" de "não havia o que conferir", que a lista vazia de
    `pendentes` confunde. Sem esta pergunta, a célula cuja razão é outra coisa
    (uma role que ainda não existe, um portão da AWS, uma célula de fase 2)
    entra na lista vazia junto com a que de fato destravou, e sai carimbada de
    PRONTA por vacuidade.

    Medido em 2026-09-02: doze células apareciam como PRONTA e só duas eram.
    As seis `politica-msk-consumidor` esperam a role de um consumer que não tem
    célula em ambiente nenhum, e aplicá-las morre com NoSuchEntity — o que já
    aconteceu num apply de 22/08. As duas `publicacao-ledger` esperam a AWS
    liberar o CreateConnector. Nenhuma das oito tem variável para conferir, e
    era exatamente por isso que passavam por prontas.
    """
    return bool(re.findall(r"TG_[A-Z0-9_]+", celula.get("razao", "")))


def main(argv):
    if len(argv) < 2 or argv[1] not in ("listar", "excluir"):
        print(__doc__, file=sys.stderr)
        return 2
    fora = declaradas()

    if argv[1] == "excluir":
        # Entrada de comando, e não documento: uma célula por linha, e o que
        # vier depois de dois espaços é comentário que `--excluir-de` ignora.
        print("# Gerado de infra/ por ferramentas/adiadas.py. Não edite à mão.")
        for rel in sorted(fora):
            print("%s  (%s)" % (rel, fora[rel]["tipo"]))
        return 0

    adiadas = {k: v for k, v in fora.items() if v["tipo"] == "adiada"}
    cedidas = {k: v for k, v in fora.items() if v["tipo"] == "cedeu"}
    print("fora da fila · %d adiada(s) · %d que cederam" % (len(adiadas), len(cedidas)))
    for rel in sorted(adiadas):
        falta = pendentes(adiadas[rel])
        print("\n  %s" % rel)
        print("      %s" % adiadas[rel]["razao"])
        if adiadas[rel]["trava"]:
            print("      trava: %s" % adiadas[rel]["trava"])
        if falta:
            print("      ainda falta: %s" % ", ".join(sorted(set(falta))))
        elif nomeia_variavel(adiadas[rel]):
            print("      PRONTA: o que a segurava já tem valor")
        else:
            print("      SEM VARIÁVEL PARA CONFERIR: o que segura esta célula "
                  "não é valor de env. A razão acima é o veredito, e este "
                  "comando não sabe medi-la.")
    for rel in sorted(cedidas):
        print("\n  %s" % rel)
        print("      cedeu para %s, e não roda mais" % cedidas[rel]["razao"])
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
