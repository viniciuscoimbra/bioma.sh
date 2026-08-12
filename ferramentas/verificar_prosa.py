#!/usr/bin/env python3
"""A prosa dos .md segue o contrato de estilo da casa.

Duas regras mecânicas, as únicas que uma máquina confere sem opinar:

  travessão em prosa   o AGENTS.md manda virar parênteses, dois-pontos ou
                       vírgula. Trinta e dois sobreviveram numa instância real
                       até alguém ler os documentos inteiros.
  bold como tese       linha que é só **negrito** é ênfase no lugar de
                       argumento.

O que fica de fora, e por quê: bloco de código e tabela não são prosa; arquivo
com "gerado por" no cabeçalho tem o estilo do gerador, e se o estilo está
errado o defeito é de lá.

ESTE VERIFICADOR NÃO SEGURA PRODUÇÃO. Decisão do dono, 2026-08-12: estilo de
documentação é higiene, e higiene não bloqueia apply. Quem o chama no pré-voo
trata qualquer saída como aviso; o código de saída existe para quem quiser
cobrá-lo em esteira de documentação.

Uso: verificar_prosa.py [raiz do repositório]
Saída: 0 limpo · 1 achados · 2 sem insumo
"""
import io
import os
import re
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def arquivos_md(raiz):
    r = subprocess.run(["git", "-C", raiz, "ls-files", "*.md"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        return None
    return [os.path.join(raiz, a) for a in r.stdout.split()]


def prosa_de(texto):
    """As linhas que são prosa: sem bloco de código, sem tabela."""
    sem_codigo = re.sub(r"```.*?```", lambda m: "\n" * m.group(0).count("\n"),
                        texto, flags=re.S)
    for n, linha in enumerate(sem_codigo.splitlines(), 1):
        if linha.lstrip().startswith("|"):
            continue
        yield n, linha


def main():
    raiz = sys.argv[1] if len(sys.argv) > 1 else RAIZ
    arquivos = arquivos_md(raiz)
    if arquivos is None:
        print("sem insumo para decidir: %s não é repositório git" % raiz,
              file=sys.stderr)
        return 2

    achados = []
    lidos = 0
    for p in arquivos:
        if not os.path.isfile(p):
            continue
        texto = io.open(p, encoding="utf-8").read()
        if "gerado por" in texto[:300]:
            continue
        lidos += 1
        rel = os.path.relpath(p, raiz)
        for n, linha in prosa_de(texto):
            if " — " in linha:
                achados.append((rel, n, "travessão em prosa", linha.strip()[:80]))
            if re.match(r"^\*\*[^*]+\*\*$", linha.strip()):
                achados.append((rel, n, "bold como tese", linha.strip()[:80]))

    if not lidos:
        print("sem insumo para decidir: nenhum .md rastreado sob %s" % raiz,
              file=sys.stderr)
        return 2

    if not achados:
        print("prosa · %d documentos no contrato de estilo: sem travessão em "
              "prosa, sem bold como tese" % lidos)
        return 0

    print("prosa fora do contrato: %d achado(s) em %d documento(s)\n"
          % (len(achados), len({a[0] for a in achados})))
    for rel, n, tipo, trecho in achados:
        print("  %s:%d · %s\n      %s" % (rel, n, tipo, trecho))
    print("\ntravessão vira parênteses, dois-pontos ou vírgula; tese vira frase.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
