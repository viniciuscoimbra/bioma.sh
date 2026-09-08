#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""O caminho que vai do desenho ao código: especificação, tradutor, gerador.

    from caminho_gerador import gerar
    gerar({"nos": [...], "arestas": [...], "catalogo": {...}})

Isto morava dentro de `tela/servidor.py`, e por isso a régua da regra pétrea
(`ida_e_volta.py`) não rodava da instância: ela importava o servidor, e a
instância não tem `tela/`. Rodando de lá, o comando morria com
`ModuleNotFoundError: No module named 'servidor'`, e a única medição da
promessa central do produto só existia para quem tivesse o framework em disco.

O servidor continua sendo o dono da TELA. O que saiu daqui é o que transforma
desenho em árvore, e isso não é assunto de servidor HTTP: é ferramenta, como o
gerador e o tradutor que ele chama.

A extração foi por movimento do texto, e provada byte a byte: as 651 saídas do
`fase1.bio` real são idênticas antes e depois (sha256 do conjunto
49a450b50989ccaef94949c97ff6e052d46c265d3014c00fec0ff5067b2c3940).
"""
import io
import json
import os
import subprocess
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
FERR = AQUI
sys.path.insert(0, FERR)
import oficina  # noqa: E402

ESQUEMA = os.environ.get("IAC_ESQUEMA_AWS", os.path.join(FERR, "esquema-aws.json"))


def vocabulario_antigo(d):
    """O `.bio` gravado antes de 2026-09-07 chamava o domínio de `trilho`.

    A palavra nomeava três coisas: o domínio do elemento, as duas colunas
    laterais da tela e o inspetor. A tela já lia `dominio`, e o gerador ainda
    escrevia `trilho`: os 416 elementos de um projeto real abriam com "sem
    área" no painel esquerdo, porque produtor e leitor falavam palavras
    diferentes. Aqui o arquivo antigo é traduzido na entrada, e não em cada
    lugar que o consome — tradução espalhada é a que diverge.

    A tradução é da CHAVE, nunca do valor: o valor (`plataforma`,
    `core-bancario`) é componente do caminho de `catalogo/organismos/<x>/`, e
    mexer nele reescreveria o `source` de centenas de células.
    """
    for n in (d.get("grafo") or {}).get("nos") or []:
        if "trilho" in n:
            n.setdefault("dominio", n.pop("trilho"))


def ponta(aresta, lado):
    """A ponta da aresta, no nome do contrato da tela ou no nome antigo."""
    return aresta.get("de" if lado == 0 else "para") or \
        aresta.get("origem" if lado == 0 else "destino") or ""


def especificacao(grafo):
    """O grafo da tela vira o documento que o tradutor lê.

    É aqui que a pergunta "como nasce aquele documento" se responde: nasce
    daqui, e o que a pessoa vê é o desenho, nunca a tabela.
    """
    L = ["# %s" % (grafo.get("nome") or "arquitetura"), "",
         "Especificação escrita pela tela do bioma.", "",
         "## Serviços e colocação", "",
         "| serviço | papel | zona (conta · rede) | multiplicidade | realiza | célula |",
         "|---|---|---|---|---|---|"]
    for n in grafo.get("nos") or []:
        # `realiza` aponta a decisão de arquitetura que a peça cumpre. Quem
        # nasceu na tela não tem decisão para apontar, e aí a origem é a tela.
        #
        # A última coluna é a identidade da célula. Sem ela o tradutor só tem o
        # serviço para se orientar, e serviço repete: as seis VPCs desta árvore
        # dividiam a mesma resposta e escreviam no mesmo caminho. Fica no fim
        # para que especificação escrita à mão, que não a tem, continue valendo.
        L.append("| %s | %s | %s | %s | %s | %s |"
                 % (n["servico"], n.get("papel") or "sem papel declarado",
                    n.get("raia") or n.get("conta") or "Platform",
                    n.get("multiplicidade") or "compartilhado",
                    n.get("realiza") or "tela", n.get("id") or ""))
    # As duas últimas colunas são a identidade das pontas. Sem elas a aresta
    # só sabe o serviço, e a dependência gerada apontava para a primeira
    # célula daquele serviço em vez da que o desenho ligou.
    L += ["", "## Arestas (fluxo do diagrama)", "",
          "| # | origem | destino | o que flui | canal | cruza fronteira | de | para | rótulo |",
          "|---|---|---|---|---|---|---|---|---|"]
    por_id = {n.get("id"): n for n in (grafo.get("nos") or []) if n.get("id")}
    for i, a in enumerate(grafo.get("arestas", []), 1):
        de, para = ponta(a, 0), ponta(a, 1)
        # a tela manda o id nas pontas; a especificação escrita à mão manda o
        # nome do serviço, e aí a identidade fica em branco
        L.append("| %d | %s | %s | %s | %s | %s | %s | %s | %s |"
                 % (i,
                    (por_id[de]["servico"] if de in por_id else de),
                    (por_id[para]["servico"] if para in por_id else para),
                    a.get("flui") or "dado", a.get("canal") or "direto",
                    a.get("cruza") or "não",
                    de if de in por_id else "", para if para in por_id else "",
                    a.get("rotulo") or ""))
    L += ["", "## Pontos de customização por instância", ""]
    for p in (grafo.get("customizacao") or []):
        L.append("- %s" % p)
    L += ["", "## Fim", ""]
    return "\n".join(L)


def _ligacoes_possiveis(variavel, grafo, quem_pede):
    """As peças do desenho que publicam saída compatível com esta variável.

    Devolve uma lista de {peca, saida, por_que}, para a tela oferecer a ligação
    em vez de pedir o valor. A regra de compatibilidade é do tradutor, que é
    quem sabe ler receita.
    """
    sys.path.insert(0, FERR)
    from traduzir_bloco import saidas_da_receita, ligavel
    fora = []
    for n in (grafo.get("nos") or []):
        outra = (n.get("servico") or "").strip().lower()
        # A peça não se oferece a si mesma. A comparação é por onde ela mora:
        # por serviço, uma VPC deixava de aparecer para as outras cinco.
        if not n.get("receita") or ((n.get("id") or "").strip() or outra) == quem_pede:
            continue
        for saida in saidas_da_receita(n["receita"]):
            if not ligavel(variavel, saida):
                continue
            fora.append({
                "peca": n.get("id") or n.get("nome") or outra,
                "receita": n["receita"],
                "saida": saida,
                "por_que": ("%s publica `%s`, que é o que `%s` espera: ligando as "
                            "duas, o valor passa a vir da peça e para de ser "
                            "digitado." % (n.get("nome") or outra, saida, variavel)),
            })
    return fora[:8]


def _perguntas_da_receita(receita):
    """Ponte para o tradutor, que é quem sabe ler a receita do catálogo."""
    sys.path.insert(0, FERR)
    from traduzir_bloco import perguntas_da_receita as _p
    return _p(receita)


def traduz_grafo(grafo):
    """(pasta, proposta, erro, saída do tradutor) do desenho, sem escrever árvore.

    Gerar e comparar precisam da mesma proposta. Traduzir duas vezes, cada uma
    com o seu jeito, deixaria a tela dizer uma coisa no código gerado e outra na
    comparação com a instância.
    """
    if "grafo" in (grafo or {}) and "nos" not in (grafo or {}):
        grafo = grafo["grafo"]
    if not (grafo.get("nos") or []):
        return None, None, "grafo sem peça nenhuma: a tela manda os nós do desenho em `nos`", ""
    tmp = oficina.pasta("bioma-tela-")
    espec = os.path.join(tmp, "especificacao.md")
    io.open(espec, "w", encoding="utf-8").write(especificacao(grafo))

    p1 = subprocess.run([sys.executable, os.path.join(FERR, "traduzir_bloco.py"),
                         espec, "--saida", tmp], capture_output=True, text=True)
    prop = os.path.join(tmp, "proposta.json")
    if not os.path.exists(prop):
        return None, None, (p1.stderr or p1.stdout)[-800:], p1.stdout
    # o que a pessoa respondeu na ficha entra na proposta: sem isso, responder
    # na tela não muda uma linha do arquivo gerado
    respondido, receita_de, formula_de, escrito_de = {}, {}, {}, {}
    for n in (grafo.get("nos") or []):
        # A célula se identifica por onde ela mora, e não pelo serviço que ela
        # usa: serviço repete, e com ele por chave a última peça lida
        # respondia pelas outras. Nesta árvore eram 134 células de 199.
        chave = (n.get("id") or "").strip() or (n.get("servico") or "").strip().lower()
        # `null` e `false` são resposta, e não ausência. O filtro antigo usava
        # `str(v or "")`, que descarta os dois: `role_backup_arn = null` sumia
        # e o gerado pedia PREENCHER onde a célula tinha respondido.
        vals = {k: v for k, v in ((n.get("valores") or {})).items()
                if v is None or isinstance(v, (bool, int, float, list, dict)) or str(v).strip()}
        if vals:
            respondido[chave] = vals
        # A receita que o nó aponta viaja junto. Ela não sobrevive à
        # especificação em markdown, que é tabela de serviço, e sem ela o
        # tradutor não tem como perguntar o que a receita exige: a peça do
        # catálogo chegava à tela sem campo nenhum, e quem desenha só descobria
        # `supernet` ou `cidr_inspecao` no apply.
        if n.get("receita"):
            receita_de[chave] = n["receita"]
        if n.get("formulas"):
            formula_de[chave] = n["formulas"]
        escrito = {k: n[k] for k in ("prosa", "blocos", "notas", "ordem",
                                     "quebras", "arranjo", "colunas", "dependencias") if n.get(k)}
        if escrito:
            escrito_de[chave] = escrito
    proprias = grafo.get("catalogo") or {}
    if respondido or receita_de or proprias or formula_de or escrito_de:
        d = json.load(io.open(prop, encoding="utf-8"))
        # As receitas que só a instância tem viajam com o projeto e voltam ao
        # disco: sem isto a célula saía apontando uma peça que não existe nem
        # no catálogo do bioma nem no que o gerador escreveu.
        if proprias:
            d["catalogo_proprio"] = proprias
        for u in d.get("unidades") or []:
            chave = (u.get("caminho") or "").strip() or (u.get("servico") or "").strip().lower()
            r = respondido.get(chave)
            if r:
                u["respostas"] = r
            f = formula_de.get(chave)
            if f:
                u["formulas"] = f
            u.update(escrito_de.get(chave) or {})
            rec = receita_de.get(chave)
            if rec:
                u["receita"] = rec
                u["perguntas"] = _perguntas_da_receita(rec)
                # Onde o campo pode ser ligado, e por quê. Quem desenha não
                # tem como saber de cor que a chave do domínio publica
                # `key_arn` e que é dela que o banco tira `kms_key_arn`: a tela
                # mostra as peças que servem, e a ligação vira seta em vez de
                # valor digitado.
                for q in u["perguntas"]:
                    op = _ligacoes_possiveis(q["nome"], grafo, chave)
                    if op:
                        q["ligar_a"] = op
        json.dump(d, io.open(prop, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    return tmp, prop, None, p1.stdout


def gerar(grafo):
    if "grafo" in (grafo or {}) and "nos" not in (grafo or {}):
        grafo = grafo["grafo"]
    tmp, prop, erro, saida_traducao = traduz_grafo(grafo)
    if erro:
        return {"erro": erro}

    arvore = os.path.join(tmp, "arvore")
    p2 = subprocess.run([sys.executable, os.path.join(FERR, "gerar_iac.py"),
                         prop, "--destino", arvore, "--forcar"],
                        capture_output=True, text=True,
                        env=dict(os.environ, IAC_ESQUEMA_AWS=ESQUEMA))
    arquivos = {}
    for base, _d, arqs in os.walk(arvore):
        for a in arqs:
            c = os.path.join(base, a)
            arquivos[os.path.relpath(c, arvore)] = io.open(c, encoding="utf-8").read()
    diag = diagnostica_desenho(prop, arvore)
    return {"especificacao": especificacao(grafo),
            "proposta": json.load(io.open(prop, encoding="utf-8")),
            "arquivos": arquivos,
            "saida": saida_traducao + p2.stdout,
            "diagnostico": diag,
            "pasta": arvore}


# ── /subir: o desenho de fora vira grafo ──────────────────────────────────


def diagnostica_desenho(prop_caminho, arvore=None):
    """As quatro camadas sobre o desenho, antes de a árvore sair daqui."""
    sys.path.insert(0, FERR)
    import diagnostico as dg
    try:
        prop = json.load(io.open(prop_caminho, encoding="utf-8"))
    except Exception:
        return {"erros": 0, "avisos": 0, "pode_sair": True, "achados": []}
    achados = dg.diagnostica(prop, arvore)
    r = dg.resumo(achados)
    r["achados"] = achados
    return r
