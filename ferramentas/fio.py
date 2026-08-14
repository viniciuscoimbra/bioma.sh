#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Variável pendente que a própria árvore produziria: quem, e o que falta.

    python3 ferramentas/fio.py

Algumas variáveis da instância não são resposta de ninguém: elas são output de
uma célula que a árvore aplica. Enquanto forem preenchidas à mão entre um passo
e outro, o comando único não fecha, e a árvore tem `dependency` disfarçada de
pergunta. Três ARNs de chave seguravam duas células assim.

A produtora é DECLARADA, e não adivinhada por semelhança de nome. No template
`instancia.env`, a linha `# produz: <familia>/<organismo>.<output> em <célula>`
acima da variável diz quem a emite e onde essa peça mora. Casar
`TG_KMS_BACKUP_ARN` com `key_arn` por parecença é o mesmo erro que gerou
`aws_glue_crawler` para um bucket.

Três respostas, e nenhuma é reprovação: fazer o fio é trabalho, e este comando
diz onde ele falta.

    vira dependency   a célula declarada existe no live, e o fio é escrever
    falta a célula    o organismo emite o valor e ninguém o instancia ali
    declaração errada o organismo ou o output não existe como declarado
"""
import io
import os
import re
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INFRA = os.path.join(AQUI, "infra")

PRODUZ = re.compile(r"^#\s*produz:\s*([\w\-]+/[\w\-]+)\.(\w+)\s+em\s+(\S+)\s*$")
VARIAVEL = re.compile(r"^#?\s*([A-Z][A-Z0-9_]*)\s*=")


def declaradas():
    """variável -> (organismo, output, célula esperada), do template da instância."""
    caminho = os.path.join(INFRA, "instancia.env")
    if not os.path.exists(caminho):
        return {}
    fora, pendente = {}, None
    for linha in io.open(caminho, encoding="utf-8"):
        m = PRODUZ.match(linha.strip())
        if m:
            pendente = (m.group(1), m.group(2), m.group(3))
            continue
        m = VARIAVEL.match(linha)
        if m and pendente:
            fora[m.group(1)] = pendente
            pendente = None
        elif not linha.strip().startswith("#"):
            pendente = None
    return fora


def celulas_por_organismo():
    mapa = {}
    for base, dirs, arqs in os.walk(INFRA):
        dirs[:] = [d for d in dirs if d not in (".terragrunt-cache", "catalogo")]
        if "terragrunt.hcl" not in arqs:
            continue
        txt = io.open(os.path.join(base, "terragrunt.hcl"), encoding="utf-8").read()
        m = re.search(r'source\s*=\s*"[^"]*?catalogo//organismos/([\w\-]+/[\w\-]+)"', txt)
        if m:
            mapa.setdefault(m.group(1), []).append(os.path.relpath(base, INFRA))
    return mapa


def outputs_do_organismo(organismo):
    arq = os.path.join(INFRA, "catalogo", "organismos", organismo, "outputs.tf")
    if not os.path.exists(arq):
        return None
    return set(re.findall(r'output\s+"([^"]+)"',
                          io.open(arq, encoding="utf-8").read()))


def main():
    decl = declaradas()
    if not decl:
        print("nenhuma variável declara produtora no template: sem insumo para decidir",
              file=sys.stderr)
        return 2
    celulas = celulas_por_organismo()

    fio, sem_celula, erros = [], [], []
    for var, (organismo, saida, celula) in sorted(decl.items()):
        if (os.environ.get(var) or "").strip():
            continue
        conhecidos = outputs_do_organismo(organismo)
        if conhecidos is None:
            erros.append("%s declara %s, que não é organismo do catálogo" % (var, organismo))
            continue
        if saida not in conhecidos:
            erros.append("%s declara %s.%s, e o organismo não emite esse output"
                         % (var, organismo, saida))
            continue
        if celula in celulas.get(organismo, []):
            fio.append((var, organismo, saida, celula))
        elif os.path.isdir(os.path.join(INFRA, celula)):
            erros.append("%s espera %s em %s, e essa célula instancia outro organismo"
                         % (var, organismo, celula))
        else:
            sem_celula.append((var, organismo, saida, celula))

    print("fio · %d variável(is) com produtora declarada" % len(decl))
    for var, organismo, saida, celula in fio:
        print("  %-26s vira dependency de %s (%s.%s)"
              % (var, celula, organismo, saida))
    for var, organismo, saida, celula in sem_celula:
        print("  %-26s FALTA A CÉLULA %s, que emitiria %s.%s"
              % (var, celula, organismo, saida))
    for e in erros:
        print("  DECLARAÇÃO ERRADA: %s" % e)
    if not fio and not sem_celula and not erros:
        print("  nenhuma pendente: todas têm valor no ambiente")
    return 1 if erros else 0


if __name__ == "__main__":
    sys.exit(main())
