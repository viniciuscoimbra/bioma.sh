#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gate: a saída que uma célula lê da vizinha existe, na receita e no mock.

`mock_outputs` é o único valor da árvore que ninguém confere contra nada. Ele
existe para o plano de quem depende de célula que ainda não aplicou, e por isso
é escrito à mão, com o nome que a saída tinha no dia. Quando a receita renomeia
a saída, o mock fica para trás e ninguém percebe: a receita real está certa, a
célula está certa, e o comando reprova apontando a linha da célula com
"Unsupported attribute", que manda procurar no lugar errado.

Aconteceu assim: `organismos/seguranca/acesso-auditado` passou a publicar
`politicas_por_circulo` (um mapa por círculo), o mock continuou com
`politica_nome` de uma versão anterior, e `terragrunt hcl validate` reprovava a
árvore inteira por causa de uma linha de mock. A prova de fumaça do instalador
parou de passar, e a mensagem não dizia mock em lugar nenhum.

Duas conferências, por dependência declarada:

1. Toda `dependency.<nome>.outputs.<saida>` que a célula lê existe no
   `outputs.tf` da receita da vizinha. Se não existe, nem o apply funcionaria.
2. Se a dependência declara `mock_outputs`, a mesma saída está lá. Se não
   está, o `validate` e o `plan` reprovam mesmo com o apply correto.

Uso: verificar_mocks.py [caminho-da-arvore]
Saída: 0 coerente · 1 reprovado · 2 sem insumo para decidir
"""
import io
import os
import re
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IGNORA = {".terragrunt-cache", ".terraform"}

FONTE = re.compile(r'source\s*=\s*"[^"]*catalogo//?'
                   r'((?:organismos|ligacoes|moleculas|artefatos)/[a-z0-9\-/]+)"')
DEP = re.compile(r'dependency\s+"([a-z0-9_]+)"\s*\{')
CONFIG_PATH = re.compile(r'config_path\s*=\s*"([^"]+)"')
USO = re.compile(r'dependency\.([a-z0-9_]+)\.outputs\.([a-z0-9_]+)')
SAIDA = re.compile(r'output\s+"([a-z0-9_]+)"')


def bloco(texto, inicio):
    """Do `{` em `inicio` até a chave que o fecha, contando aninhamento."""
    i = texto.find("{", inicio)
    if i < 0:
        return ""
    nivel, k = 0, i
    while k < len(texto):
        if texto[k] == "{":
            nivel += 1
        elif texto[k] == "}":
            nivel -= 1
            if nivel == 0:
                return texto[i + 1:k]
        k += 1
    return texto[i + 1:]


def chaves_do_mock(corpo):
    """As chaves de primeiro nível de `mock_outputs = { ... }`, e só elas.

    Chave aninhada não é saída da vizinha: é conteúdo do valor. Contá-la faria
    o portão acusar a própria correção que ele pede.
    """
    m = re.search(r'mock_outputs\s*=\s*', corpo)
    if not m:
        return None
    dentro = bloco(corpo, m.end())
    # Caractere a caractere, e não linha a linha: `mock_outputs = { a = 1, b = 2 }`
    # cabe numa linha só, e contar por linha enxergava só a primeira chave. Foi
    # o que fez a primeira versão deste portão acusar 25 células sadias.
    fora, nivel, i = [], 0, 0
    while i < len(dentro):
        c = dentro[i]
        if c in "{[":
            nivel += 1
        elif c in "}]":
            nivel -= 1
        elif nivel == 0:
            achou = re.match(r'([a-z0-9_]+)\s*=(?!=)', dentro[i:])
            if achou and (i == 0 or not re.match(r'[a-z0-9_.]', dentro[i - 1])):
                fora.append(achou.group(1))
                i += achou.end()
                continue
        i += 1
    return set(fora)


def saidas_da_receita(catalogo, receita):
    arq = os.path.join(catalogo, receita, "outputs.tf")
    if not os.path.isfile(arq):
        return None
    return set(SAIDA.findall(io.open(arq, encoding="utf-8").read()))


def receita_de(caminho):
    arq = os.path.join(caminho, "terragrunt.hcl")
    if not os.path.isfile(arq):
        return None
    m = FONTE.search(io.open(arq, encoding="utf-8").read())
    return m.group(1) if m else None


def main(argv):
    raiz = os.path.abspath(argv[1]) if len(argv) > 1 else AQUI
    live = os.path.join(raiz, "infra")
    catalogo = os.path.join(live, "catalogo")
    if not os.path.isdir(live) or not os.path.isdir(catalogo):
        print("sem infra/catalogo em %s: sem insumo para decidir" % raiz, file=sys.stderr)
        return 2

    queixas, conferidas = [], 0
    for base, dirs, arqs in os.walk(live):
        dirs[:] = [d for d in dirs if d not in IGNORA]
        if "terragrunt.hcl" not in arqs or os.path.abspath(base).startswith(catalogo):
            continue
        texto = io.open(os.path.join(base, "terragrunt.hcl"), encoding="utf-8").read()
        usos = {}
        for nome, saida in USO.findall(texto):
            usos.setdefault(nome, set()).add(saida)

        for m in DEP.finditer(texto):
            nome = m.group(1)
            corpo = bloco(texto, m.end() - 1)
            cp = CONFIG_PATH.search(corpo)
            if not cp or not usos.get(nome):
                continue
            vizinha = os.path.normpath(os.path.join(base, cp.group(1)))
            receita = receita_de(vizinha)
            if not receita:
                continue
            reais = saidas_da_receita(catalogo, receita)
            if reais is None:
                continue
            conferidas += 1
            celula = os.path.relpath(base, live)
            faltam_na_receita = sorted(usos[nome] - reais)
            if faltam_na_receita:
                queixas.append((celula, nome, receita, "a receita não publica",
                                faltam_na_receita))
            mock = chaves_do_mock(corpo)
            if mock is not None:
                faltam_no_mock = sorted((usos[nome] & reais) - mock)
                if faltam_no_mock:
                    queixas.append((celula, nome, receita, "o mock não traz",
                                    faltam_no_mock))

    print("mocks · %d dependência(s) com saída lida, conferidas contra a receita"
          % conferidas)
    if not queixas:
        return 0
    for celula, dep, receita, o_que, quais in queixas:
        print("\n  %s · dependency %s -> %s" % (celula, dep, receita))
        print("    a célula lê %s, e %s" % (", ".join(quais), o_que))
    print("\nMock que não acompanha a receita reprova `validate` e `plan` apontando")
    print("a linha da célula, e a causa fica na linha do mock.")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
