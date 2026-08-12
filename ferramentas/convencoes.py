#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Uma lista declarada em `convencoes.json`, uma por linha.

    python3 ferramentas/convencoes.py dominios
    python3 ferramentas/convencoes.py ambientes_por_natureza.workload
    python3 ferramentas/convencoes.py sementes_de_attachment

O `bioma.sh` lia isto em três blocos de Python embutidos, com a raiz do
repositório interpolada pelo shell dentro do fonte:

    p = os.path.join('$BC', 'convencoes.json')

Caminho que entra por `argv` o Git Bash converte antes de chamar um executável
que não é dele. Caminho colado dentro do fonte chega cru: o Python nativo do
Windows recebe `/c/Users/...` e resolve relativo ao drive corrente, virando
`C:\\c\\Users\\...`, que não existe. Dois dos três blocos caíam em `{}` e o
terceiro em lista vazia, os três com `2> /dev/null` em volta: a árvore anunciava
"sem declaração", as fases de domínio não rodavam nada, e não havia erro em
lugar nenhum. É a queda que funciona, que é o defeito que este repositório
persegue em todo lugar menos aqui dentro.

Esta ferramenta acha a própria raiz pelo `__file__`, como todo verificador já
faz, e assim nenhum caminho cruza a fronteira do shell para o Python.

Ausência e defeito não são a mesma coisa. Árvore sem `convencoes.json` é
legítima (o framework é genérico e roda sem declaração nenhuma): sai vazio, com
0. Arquivo presente que não abre ou não é JSON sai 1, com o motivo, porque aí
alguém escreveu e o comando está desobedecendo.

Uso: convencoes.py <chave[.subchave]> [--arquivo CAMINHO]
Saída: 0 lista (possivelmente vazia) · 1 declaração ilegível · 2 uso errado
"""
import io
import json
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def arquivo():
    """Onde a declaração mora. BIOMA_CONVENCOES vence, como em traduzir_bloco."""
    return os.environ.get("BIOMA_CONVENCOES") or os.path.join(AQUI, "convencoes.json")


def declaracao(chave, caminho=None):
    """A lista sob `chave` (pontilhada), ou [] se a declaração não existe.

    Levanta ValueError se o arquivo existe e não se lê: quem declarou merece
    saber que a declaração não chegou, em vez de ver a árvore seguir sem ela.
    """
    caminho = caminho or arquivo()
    if not os.path.isfile(caminho):
        return []
    try:
        d = json.load(io.open(caminho, encoding="utf-8"))
    except (ValueError, IOError) as e:
        raise ValueError("%s não abre como JSON: %s" % (caminho, e))
    for parte in chave.split("."):
        if not isinstance(d, dict):
            return []
        d = d.get(parte)
        if d is None:
            return []
    if isinstance(d, dict):
        d = sorted(d)
    if not isinstance(d, list):
        d = [d]
    return [str(x) for x in d]


def main(argv):
    chaves = [a for a in argv[1:] if not a.startswith("--")]
    caminho = None
    if "--arquivo" in argv:
        i = argv.index("--arquivo")
        if i + 1 >= len(argv):
            print("--arquivo pede um caminho", file=sys.stderr)
            return 2
        caminho = argv[i + 1]
        chaves = [c for c in chaves if c != caminho]
    if len(chaves) != 1:
        print(__doc__.strip().splitlines()[-2], file=sys.stderr)
        return 2
    try:
        for x in declaracao(chaves[0], caminho):
            print(x)
    except ValueError as e:
        print("%s" % e, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
