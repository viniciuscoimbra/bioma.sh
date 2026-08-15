#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""A regra pétrea medida: o `.bio` regera o código da instância?

    python3 ferramentas/ida_e_volta.py <projeto.bio> <raiz-da-instancia>

O bioma gera o `.bio`; o `.bio` remonta o projeto; exportar gera o código. A
promessa só vale se der para medir, e este comando mede: abre o `.bio`, roda o
MESMO caminho da tela (especificação → tradutor → gerador) e compara o que
saiu com o código que a instância tem no disco.

É relatório, e não portão: a distância nunca tinha sido medida, e portão sobre
número desconhecido só ensina a ser ignorado. Ele responde em três alturas,
da mais grossa à mais fina:

    células     cada nó do desenho virou uma célula gerada? cada célula da
                instância tem nó no desenho?
    receitas    a receita que o nó pede existe no catálogo gerado?
    arquivos    para as células que casam, o terragrunt.hcl gerado é igual,
                parecido ou outro?

Não olha a nuvem: se o código está aplicado é pergunta do `estado.py`.

Saída: 0 sempre que mediu · 2 sem insumo para decidir
"""
import difflib
import io
import json
import os
import subprocess
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
sys.path.insert(0, os.path.join(RAIZ, "tela"))


def celulas_da_instancia(infra):
    fora = set()
    for base, dirs, arqs in os.walk(infra):
        dirs[:] = [d for d in dirs if d not in (".terragrunt-cache", "catalogo")]
        if "terragrunt.hcl" in arqs:
            rel = os.path.relpath(base, infra)
            if rel != ".":
                fora.add(rel)
    return fora


def celulas_geradas(arvore):
    live = os.path.join(arvore, "live")
    fora = set()
    for base, dirs, arqs in os.walk(live):
        if "terragrunt.hcl" in arqs:
            fora.add(os.path.relpath(base, live))
    return fora


def parecido(a, b):
    """0.0 a 1.0, por linha. O que interessa é a ordem de grandeza."""
    la = io.open(a, encoding="utf-8").read().splitlines()
    lb = io.open(b, encoding="utf-8").read().splitlines()
    return difflib.SequenceMatcher(None, la, lb).ratio()


def main(argv):
    if len(argv) < 3:
        print(__doc__, file=sys.stderr)
        return 2
    caminho_bio, raiz_inst = argv[1], argv[2]
    infra = os.path.join(raiz_inst, "infra")
    if not os.path.isfile(caminho_bio) or not os.path.isdir(infra):
        print("sem insumo para decidir: preciso do .bio e da raiz da instância",
              file=sys.stderr)
        return 2

    bio = json.load(io.open(caminho_bio, encoding="utf-8"))
    grafo = bio.get("grafo") or bio
    nos = grafo.get("nos") or []
    if not nos:
        print("sem insumo para decidir: o .bio não tem nó nenhum", file=sys.stderr)
        return 2

    # o MESMO caminho da tela, e não um paralelo: gerar e comparar com
    # traduções diferentes deixaria este relatório medir outra coisa
    import servidor
    resultado = servidor.gerar({"nos": nos, "arestas": grafo.get("arestas") or []})
    if resultado.get("erro"):
        print("a geração falhou, e isso JÁ é a resposta da pergunta 2: o "
              "framework não regera este projeto.\n\n%s" % resultado["erro"])
        return 0
    arvore = resultado.get("pasta") or resultado.get("arvore")
    if not arvore or not os.path.isdir(arvore):
        print("o gerador não devolveu a pasta da árvore; o contrato de "
              "`servidor.gerar` mudou e este relatório precisa acompanhar",
              file=sys.stderr)
        return 2

    desenhadas = {n.get("id", "") for n in nos if n.get("id")}
    geradas = celulas_geradas(arvore)
    reais = celulas_da_instancia(infra)

    print("ida e volta · %d nós no desenho · %d células geradas · %d células na instância"
          % (len(nos), len(geradas), len(reais)))

    # células: o desenho fala dos mesmos lugares que a instância?
    so_desenho = sorted(desenhadas - reais)
    so_instancia = sorted(reais - desenhadas)
    print("\ncélulas")
    print("  desenho e instância falam do mesmo lugar: %d" % len(desenhadas & reais))
    for rel in so_desenho[:10]:
        print("  só no desenho: %s" % rel)
    if len(so_desenho) > 10:
        print("  ... e mais %d só no desenho" % (len(so_desenho) - 10))
    for rel in so_instancia[:10]:
        print("  só na instância: %s" % rel)
    if len(so_instancia) > 10:
        print("  ... e mais %d só na instância" % (len(so_instancia) - 10))

    # receitas: o catálogo gerado cobre o que o desenho pede?
    pedidas = {n.get("receita", "") for n in nos if n.get("receita")}
    catalogo_gerado = set()
    cat = os.path.join(arvore, "catalogo")
    for base, dirs, arqs in os.walk(cat):
        if any(a.endswith(".tf") for a in arqs):
            catalogo_gerado.add(os.path.relpath(base, cat))
    sem_receita = sorted(p for p in pedidas if p not in catalogo_gerado)
    print("\nreceitas")
    print("  pedidas pelo desenho: %d · no catálogo gerado: %d · sem correspondência: %d"
          % (len(pedidas), len(catalogo_gerado), len(sem_receita)))
    for p in sem_receita[:10]:
        print("  o desenho pede e o gerador não escreveu: %s" % p)

    # arquivos: para as células que o gerador escreveu E existem na instância,
    # o quanto o terragrunt.hcl gerado parece com o real?
    iguais, perto, longe = 0, 0, 0
    exemplos_longe = []
    for rel in sorted(geradas & reais):
        g = os.path.join(arvore, "live", rel, "terragrunt.hcl")
        r = os.path.join(infra, rel, "terragrunt.hcl")
        razao = parecido(g, r)
        if razao >= 0.98:
            iguais += 1
        elif razao >= 0.6:
            perto += 1
        else:
            longe += 1
            if len(exemplos_longe) < 5:
                exemplos_longe.append((rel, razao))
    comparadas = iguais + perto + longe
    print("\narquivos (%d células geradas que existem na instância)" % comparadas)
    if comparadas:
        print("  iguais (>=98%%): %d · parecidos (>=60%%): %d · outros: %d"
              % (iguais, perto, longe))
        for rel, razao in exemplos_longe:
            print("  longe: %s (%d%%)" % (rel, int(razao * 100)))
    else:
        print("  nenhuma célula gerada casa com caminho da instância: a "
              "comparação de arquivo nem começa, e a distância está na camada "
              "de células acima")
        for rel in sorted(geradas)[:5]:
            print("  o gerador escreveu: live/%s" % rel)
        for rel in sorted(catalogo_gerado)[:5]:
            print("  e no catálogo:     %s" % rel)

    print("\nA resposta da regra pétrea sai destes números, e não de opinião:")
    print("a pergunta 2 fecha quando as três alturas zeram.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
