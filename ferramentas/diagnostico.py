#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""O diagnóstico do desenho, em camadas, como um compilador.

Um compilador não pergunta "este programa está certo?" de uma vez: ele passa por
camadas, e cada uma só faz sentido depois que a anterior fechou. Aqui é igual.

  1 · a peça      cada caixa sozinha: tem tipo, nome e lugar?
  2 · o desenho   o grafo: peça solta, ponta que não existe, ciclo
  3 · a ligação   o que a seta exige: quem publica, quem consome, o que falta
  4 · a saída     a árvore escrita: referência que fecha, nada inventado

Cada achado tem nível. `erro` impede a entrega, porque o que sairia não é
estrutura válida. `aviso` deixa passar e fica escrito, porque a decisão é de
quem desenha, não da ferramenta.

  python3 ferramentas/diagnostico.py <proposta.json> [<arvore>]
"""
import io
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)

ERRO, AVISO = "erro", "aviso"

# peça que existe sozinha sem estranheza: ela guarda coisa, e quem a consome
# pode nem estar neste desenho.
PODE_FICAR_SOLTA = re.compile(
    r"bucket|s3|balde|cofre|vault|backup|trilha|log|registro|catalogo|catálogo|"
    r"chave|kms|segredo|secret|repositorio|repositório|ecr|organizacao|organização|"
    r"ipam|dns|zona", re.I)


class Achado(dict):
    def __init__(self, camada, nivel, regra, onde, razao, saida=""):
        super().__init__(camada=camada, nivel=nivel, regra=regra, onde=onde,
                         razao=razao, saida=saida)


# ── camada 1 · a peça ──────────────────────────────────────────────────────

def camada_peca(prop):
    """Cada caixa sozinha: dá para escrever a receita dela?"""
    import gerar_iac as g
    fora = []
    for u in prop.get("unidades") or []:
        if u.get("tipo") in ("fronteira", "artefato"):
            continue
        nome = u.get("nome") or u.get("servico") or "(sem nome)"
        if not u.get("nome"):
            fora.append(Achado(1, ERRO, "peça sem nome", nome,
                               "sem nome não há pasta nem receita",
                               "dê um nome à peça"))
        recursos, _ = g.recursos_de(u.get("servico") or "")
        if not recursos:
            fora.append(Achado(1, AVISO, "serviço fora da tabela", nome,
                               "a tabela de recursos não conhece %r, então a receita "
                               "nasce vazia em vez de inventar recurso"
                               % (u.get("servico") or ""),
                               "acrescente o serviço em ferramentas/mapa_recursos.json"))
        if not u.get("conta"):
            fora.append(Achado(1, AVISO, "peça sem conta", nome,
                               "a célula não sabe em qual conta nasce",
                               "escolha a conta na ficha da peça"))
    return fora


# ── camada 2 · o desenho ───────────────────────────────────────────────────

def camada_desenho(prop):
    """O grafo: o que está solto, o que aponta para o nada, o que dá volta."""
    fora = []
    unidades = [u for u in (prop.get("unidades") or [])
                if u.get("tipo") not in ("artefato",)]
    por_servico = {u["servico"]: u for u in unidades}
    relacoes = prop.get("relacoes") or []

    tocadas = set()
    for r in relacoes:
        for lado in ("origem", "destino"):
            alvo = r.get(lado)
            if alvo in por_servico:
                tocadas.add(alvo)
            elif alvo and not re.match(r"^\[\[|^\d\d-|^sistema externo|^tópico", alvo):
                fora.append(Achado(2, AVISO, "ponta fora do desenho", alvo,
                                   "a seta %s termina em algo que não é peça daqui"
                                   % (r.get("n") or ""),
                                   "traga a peça para o desenho, ou marque a ponta "
                                   "como sistema externo"))

    for u in unidades:
        if u["servico"] in tocadas or u.get("tipo") == "fronteira":
            continue
        pode = PODE_FICAR_SOLTA.search("%s %s" % (u.get("servico") or "", u.get("papel") or ""))
        fora.append(Achado(
            2, AVISO if pode else ERRO, "peça solta", u.get("nome"),
            "nenhuma seta chega nela nem sai dela"
            + ("; guarda conteúdo, então pode viver sozinha" if pode
               else "; uma peça que ninguém usa e que não guarda nada não tem porquê"),
            "ligue a peça a outra, ou tire do desenho"))

    fora += ciclos(prop)
    return fora


def ciclos(prop):
    """Ciclo entre peças: o terragrunt não sabe por onde começar."""
    import gerar_iac as g
    por_servico = {u["servico"]: u for u in (prop.get("unidades") or [])}
    arestas = []
    for r in prop.get("relacoes") or []:
        o, d = por_servico.get(r.get("origem")), por_servico.get(r.get("destino"))
        if not (o and d):
            continue
        par = g.quem_depende(o, d)
        if par:
            arestas.append((par[0]["nome"], par[1]["nome"]))
    vizinhos = {}
    for a, b in arestas:
        vizinhos.setdefault(a, set()).add(b)
    fora, vistos, pilha = [], set(), []

    def anda(n):
        if n in pilha:
            fora.append(Achado(2, AVISO, "ciclo no desenho",
                               " -> ".join(pilha[pilha.index(n):] + [n]),
                               "as duas peças dependem uma da outra, e a ordem de "
                               "criação não existe",
                               "diga qual das duas precisa existir antes; a ferramenta "
                               "mantém um lado só"))
            return
        if n in vistos:
            return
        vistos.add(n)
        pilha.append(n)
        for v in vizinhos.get(n, ()):
            anda(v)
        pilha.pop()

    for n in list(vizinhos):
        anda(n)
    return fora


# ── camada 3 · a ligação ───────────────────────────────────────────────────

def camada_ligacao(prop):
    """O que a seta exige para virar dependência que funciona."""
    import gerar_iac as g
    fora = []
    por_servico = {u["servico"]: u for u in (prop.get("unidades") or [])}

    # seta entre duas peças que não virou dependência nenhuma: quem desenhou
    # espera ordem, e a estrutura sai sem ela
    for r in prop.get("relacoes") or []:
        o, d = por_servico.get(r.get("origem")), por_servico.get(r.get("destino"))
        if not (o and d):
            continue
        if o.get("tipo") in ("fronteira", "artefato") or d.get("tipo") in ("fronteira", "artefato"):
            continue
        if g.quem_depende(o, d):
            continue
        fora.append(Achado(
            3, AVISO, "seta que não virou dependência",
            "%s -> %s" % (o.get("nome"), d.get("nome")),
            "não dá para afirmar qual das duas precisa existir antes, então a "
            "estrutura sai sem ordem entre elas",
            "se uma precisa da outra, diga qual na ficha"))

    # vizinha que não publica endereço: a seta fixa a ordem e não carrega valor.
    # Não é caso raro nem de outro provider: 799 recursos da própria AWS não têm
    # `arn` no esquema, e 221 não têm nem `id`.
    por_nome = {u["nome"]: u for u in (prop.get("unidades") or [])}
    for u in prop.get("unidades") or []:
        if u.get("tipo") in ("fronteira", "artefato"):
            continue
        for alc in g.alcances_de(u):
            for d in g.dependencias_de(u, prop, alc):
                if "arn" in (d.get("saidas") or []):
                    continue
                vizinha = por_nome.get(d["nome"]) or {}
                fora.append(Achado(
                    3, AVISO, "dependência sem endereço",
                    "%s -> %s" % (u["nome"], d["nome"]),
                    "%s publica %s: a seta fixa a ordem e não carrega endereço"
                    % (d["nome"], ", ".join(d.get("saidas") or []) or "nada"),
                    "se esta peça precisa do endereço da outra, o valor entra "
                    "pela ficha"))
            break  # a ligação não muda de alcance para alcance

    for u in prop.get("unidades") or []:
        if u.get("tipo") in ("fronteira", "artefato"):
            continue
        pendentes = [q["nome"] for q in (u.get("perguntas") or [])
                     if not (u.get("respostas") or {}).get(q["nome"])]
        if pendentes:
            fora.append(Achado(
                3, AVISO, "valor que só a pessoa sabe", u["nome"],
                "%d argumento(s) sem resposta: %s" % (len(pendentes), ", ".join(pendentes[:3])),
                "responda na ficha da peça, ou o arquivo sai com PREENCHER"))
    return fora


# ── camada 4 · a saída ─────────────────────────────────────────────────────

def camada_saida(arvore):
    """A árvore escrita: as referências fecham?"""
    if not arvore or not os.path.isdir(arvore):
        return []
    sys.path.insert(0, os.path.join(os.path.dirname(AQUI), "testes"))
    import unidade as u
    u.falhas.clear()
    for regra in u.REGRAS:
        regra(arvore)
    fora = []
    for regra, onde, detalhe in u.falhas:
        nivel = ERRO if ("não existe" in regra or "ciclo" in regra
                         or "própria" in regra) else AVISO
        fora.append(Achado(4, nivel, regra, onde, detalhe,
                           "a árvore não pode sair assim" if nivel == ERRO else ""))
    return fora


# ── o veredito ─────────────────────────────────────────────────────────────

def diagnostica(prop, arvore=None):
    achados = camada_peca(prop) + camada_desenho(prop) + camada_ligacao(prop)
    achados += camada_saida(arvore)
    return achados


def resumo(achados):
    erros = [a for a in achados if a["nivel"] == ERRO]
    avisos = [a for a in achados if a["nivel"] == AVISO]
    return {"erros": len(erros), "avisos": len(avisos),
            "pode_sair": not erros,
            "por_camada": {c: len([a for a in achados if a["camada"] == c])
                           for c in (1, 2, 3, 4)}}


def main(argv):
    if len(argv) < 2:
        print(__doc__.strip())
        return 2
    prop = json.load(io.open(argv[1], encoding="utf-8"))
    achados = diagnostica(prop, argv[2] if len(argv) > 2 else None)
    NOMES = {1: "a peça", 2: "o desenho", 3: "a ligação", 4: "a saída"}
    for camada in (1, 2, 3, 4):
        desta = [a for a in achados if a["camada"] == camada]
        if not desta:
            continue
        print("\ncamada %d · %s" % (camada, NOMES[camada]))
        for a in desta:
            print("  %-6s %-28s %-28s %s"
                  % (a["nivel"], a["regra"], (a["onde"] or "")[:28], a["razao"][:70]))
    r = resumo(achados)
    print("\n%d erro(s), %d aviso(s) · %s"
          % (r["erros"], r["avisos"],
             "pode ser salvo" if r["pode_sair"] else "não sai assim"))
    return 0 if r["pode_sair"] else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
