#!/usr/bin/env python3
"""A tela do bioma: escolhe recurso, monta o grafo, vê a árvore nascer.

Roda em localhost, sem nuvem e sem login. Ela amarra o que já existe:

  o esquema do provider  →  a lista de recursos da busca
  o grafo montado na tela →  a especificação (as tabelas que o tradutor lê)
  o tradutor              →  a estrutura
  o gerador               →  os arquivos
  os verificadores        →  o verificações
  bioma.sh                →  o ciclo de vida, com o comando à vista

A especificação é escrita pela tela. Ninguém digita tabela markdown à mão.

Rotas:
  GET  /recursos?q=      recursos do provider, com categoria e quantos exige
  GET  /icone?tipo=      o PNG oficial da AWS daquele recurso
  POST /subir            md, drawio ou imagem entram; o grafo sai
  POST /gerar            o grafo entra; proposta e arquivos saem
  POST /pre-voo          roda os verificadores sobre a árvore gerada
  POST /rodar            executa bioma.sh no perfil declarado
  GET  /contas           as contas AWS cadastradas em tela/contas.json
  POST /contas           grava a lista inteira, conferida antes de tocar o disco

Uso: python3 tela/servidor.py   e abra http://localhost:8000
"""
import base64, concurrent.futures, io, json, os, platform, re, shutil, subprocess, sys, tempfile, threading
import urllib.parse
import xml.etree.ElementTree as ET
import zlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
FERR = os.path.join(RAIZ, "ferramentas")
sys.path.insert(0, FERR)  # as ferramentas são importáveis, e não só chamáveis por subprocesso
import oficina
ESQUEMA = os.environ.get("IAC_ESQUEMA_AWS", os.path.join(FERR, "esquema-aws.json"))
MAPA_ICONES = os.path.join(AQUI, "icones-aws.json")
CONTAS = os.path.join(AQUI, "contas.json")

# perfil de trabalho da beta: o único que a tela dispara
PERFIL_PERMITIDO = "local"
# terraform e terragrunt moram fora do PATH herdado pelo servidor em alguns setups
BINARIOS = [os.path.expanduser("~/.local/bin-arm"), "/usr/local/bin", "/opt/homebrew/bin"]

_recursos = None
_icones = None
_mapa_recursos = None
_dicionario = None

# Os quatro mapas carregam do disco na primeira chamada. O servidor atende uma
# linha por pedido, então dois pedidos simultâneos entram no mesmo carregamento
# e um deles lê o mapa pela metade. A trava deixa o primeiro terminar.
_trava_mapas = threading.RLock()

# último recurso quando a pasta de ícones não existe: 1 pixel transparente
PIXEL = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk"
    "+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")


# ── os mapas ──────────────────────────────────────────────────────────────

def icones():
    """O mapa de ícone e categoria por prefixo do tipo do provider."""
    global _icones
    with _trava_mapas:
        if _icones is None:
            _icones = json.load(io.open(MAPA_ICONES, encoding="utf-8"))
            _icones["raiz"] = os.environ.get("BIOMA_ICONES_AWS", _icones["raiz"])
        return _icones


def mapa_recursos():
    """O mapa serviço → recursos do provider que as receitas já usam."""
    global _mapa_recursos
    with _trava_mapas:
        if _mapa_recursos is None:
            p = os.path.join(FERR, "mapa_recursos.json")
            _mapa_recursos = json.load(io.open(p, encoding="utf-8")) if os.path.exists(p) else {}
        return _mapa_recursos


def casa_prefixo(tipo):
    """A entrada do mapa que casa com o tipo, pelo prefixo mais longo.

    O limite é de segmento: `aws_cloudwatch_event_rule` casa com a entrada do
    EventBridge e não com a do CloudWatch, porque a chave mais longa ganha.
    """
    m = icones()
    tipo = (tipo or "").strip()
    achado, tamanho = None, -1
    for chave, valor in m["servicos"].items():
        if (tipo == chave or tipo.startswith(chave + "_")) and len(chave) > tamanho:
            achado, tamanho = valor, len(chave)
    return achado or m["generico"]


def categoria_do_tipo(tipo):
    return casa_prefixo(tipo)["categoria"]


def caminho_do_icone(tipo):
    """O PNG oficial daquele recurso. Sem entrada no mapa, o genérico."""
    m = icones()
    alvo = os.path.normpath(os.path.join(m["raiz"], casa_prefixo(tipo)["icone"]))
    raiz = os.path.realpath(m["raiz"])
    if not os.path.realpath(alvo).startswith(raiz) or not os.path.exists(alvo):
        alvo = os.path.join(m["raiz"], m["generico"]["icone"])
    return alvo if os.path.exists(alvo) else None


def normaliza(s):
    return re.sub(r"[^a-z0-9]+", " ", (s or "").lower()).strip()


def dicionario_servicos():
    """Nome de serviço normalizado → tipo do provider, dos mapas que já existem."""
    global _dicionario
    with _trava_mapas:
        if _dicionario is None:
            d = {}
            for chave, valor in mapa_recursos().items():
                if chave.startswith("_"):
                    continue
                rec = (valor.get("recursos") or [None])[0]
                if rec:
                    d[normaliza(chave)] = rec
            for apelido, tipo in icones().get("apelidos", {}).items():
                d.setdefault(normaliza(apelido), tipo)
            _dicionario = d
        return _dicionario


def tipo_do_servico(texto):
    """O nome que veio do desenho vira tipo do provider, ou nada.

    Só devolve o que está declarado nos mapas. Serviço fora deles volta None, a
    tela mostra o ícone genérico e ninguém inventa recurso.
    """
    if not texto:
        return None
    bruto = texto.strip()
    if re.fullmatch(r"aws_[a-z0-9_]+", bruto):
        return bruto
    alvo = normaliza(bruto)
    d = dicionario_servicos()
    if alvo in d:
        return d[alvo]
    cand = [k for k in d if k and re.search(r"(^| )%s( |$)" % re.escape(k), alvo)]
    return d[max(cand, key=len)] if cand else None


def recursos():
    """Os recursos do provider, com categoria e quantos argumentos cada um exige."""
    global _recursos
    with _trava_mapas:
        if _recursos is None:
            if not os.path.exists(ESQUEMA):
                _recursos = []
            else:
                d = json.load(io.open(ESQUEMA, encoding="utf-8"))
                prov = list(d["provider_schemas"].values())[0]["resource_schemas"]
                _recursos = sorted(
                    ({"tipo": k,
                      "servico": k.split("_")[1] if "_" in k else k,
                      "categoria": categoria_do_tipo(k),
                      "exige": sum(1 for a in (prov[k].get("block", {}).get("attributes") or {}).values()
                                   if a.get("required"))}
                     for k in prov),
                    key=lambda x: x["tipo"])
        return _recursos


# ── especificação e geração ───────────────────────────────────────────────

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
         "| serviço | papel | zona (conta · rede) | multiplicidade | realiza |",
         "|---|---|---|---|---|"]
    for n in grafo.get("nos") or []:
        # `realiza` aponta a decisão de arquitetura que a peça cumpre. Quem
        # nasceu na tela não tem decisão para apontar, e aí a origem é a tela.
        L.append("| %s | %s | %s | %s | %s |"
                 % (n["servico"], n.get("papel") or "sem papel declarado",
                    n.get("zona") or "Platform", n.get("multiplicidade") or "compartilhado",
                    n.get("realiza") or "tela"))
    L += ["", "## Arestas (fluxo do diagrama)", "",
          "| # | origem | destino | o que flui | canal | cruza fronteira |",
          "|---|---|---|---|---|---|"]
    for i, a in enumerate(grafo.get("arestas", []), 1):
        L.append("| %d | %s | %s | %s | %s | %s |"
                 % (i, ponta(a, 0), ponta(a, 1), a.get("flui") or "dado",
                    a.get("canal") or "direto", a.get("cruza") or "não"))
    L += ["", "## Pontos de customização por instância", ""]
    for p in (grafo.get("customizacao") or []):
        L.append("- %s" % p)
    L += ["", "## Fim", ""]
    return "\n".join(L)


def _ligacoes_possiveis(variavel, grafo, servico_de_quem_pede):
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
        if not n.get("receita") or outra == servico_de_quem_pede:
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
    respondido, receita_de = {}, {}
    for n in (grafo.get("nos") or []):
        chave = (n.get("servico") or "").strip().lower()
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
    if respondido or receita_de:
        d = json.load(io.open(prop, encoding="utf-8"))
        for u in d.get("unidades") or []:
            chave = (u.get("servico") or "").strip().lower()
            r = respondido.get(chave)
            if r:
                u["respostas"] = r
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

def grafo_da_proposta(prop):
    """A proposta do tradutor vira o grafo que a tela desenha.

    A posição sai de grade, não de layout automático: cada trilho é uma faixa e
    cada unidade do trilho ocupa uma coluna. Desenho previsível se lê duas
    vezes igual.
    """
    faixas, nos = [], []
    for u in prop.get("unidades", []):
        trilho = u.get("trilho") or u.get("zona") or "sem trilho"
        if trilho not in faixas:
            faixas.append(trilho)
        linha = faixas.index(trilho)
        coluna = sum(1 for n in nos if n["trilho"] == trilho)
        nos.append({
            "id": u.get("nome"),
            "tipo": tipo_do_servico(u.get("servico") or u.get("nome")),
            "servico": u.get("servico") or u.get("nome"),
            "papel": u.get("papel"),
            "zona": u.get("zona"),
            "conta": u.get("conta"),
            "regiao": u.get("regiao") or "",
            "multiplicidade": u.get("multiplicidade"),
            "realiza": u.get("realiza"),
            "ou": u.get("ou"),
            "natureza_ou": u.get("natureza_ou"),
            "ambientes": u.get("ambientes"),
            "por_que_ou": u.get("por_que_ou"),
            "trilho": trilho,
            "unidade": u.get("tipo"),
            "durabilidade": u.get("durabilidade"),
            "por_que": u.get("por_que_durabilidade") or u.get("por_que_esse_tipo"),
            "x": 80 + coluna * 240,
            "y": 80 + linha * 170,
            "valores": {},
        })
    arestas = []
    for r in prop.get("relacoes", []):
        arestas.append({
            "de": id_do_texto(r.get("origem"), nos),
            "para": id_do_texto(r.get("destino"), nos),
            "flui": r.get("flui"),
            "canal": r.get("canal"),
            "vira": r.get("vira"),
            "por_que": r.get("por_que"),
            "dono": r.get("dono"),
            "cruza": "sim" if r.get("vira") in ("ligação", "fronteira") else "não",
            "de_classe": classe_da_ponta(r.get("origem"), nos),
            "para_classe": classe_da_ponta(r.get("destino"), nos),
            # sem o campo, a aresta vale 1:1, que é o que ela sempre foi
            "cardinalidade": r.get("cardinalidade") or "1:1",
            "por_que_cardinalidade": r.get("por_que_cardinalidade"),
        })
    return {"nos": nos, "arestas": arestas}


def classe_da_ponta(texto, nos):
    """De que natureza é a ponta desta aresta.

    O catálogo já separa bloco, fronteira e sistema externo; o desenho separava
    nada, e quem lia o grafo não sabia se aquilo era vizinho nosso ou caixa
    preta de terceiro.
    """
    bruto = (texto or "").strip()
    if not bruto:
        return "externa"
    alvo = normaliza(bruto)
    if any(normaliza(n["servico"]) == alvo or normaliza(n["id"]) == alvo for n in nos):
        return "interna"
    if bruto.startswith("[["):
        return "bloco"
    if re.match(r"^\d{2}[-.]", bruto):
        return "bloco"
    if bruto.lower().startswith("sistema externo"):
        # o bloco escreve o terceiro como `sistema externo (IdP corporativo)`.
        # O nome de dentro do parêntese é que casa com catalogo/fronteiras/;
        # sem olhar ali, toda fronteira do catálogo passaria por externa.
        miolo = re.search(r"\(([^)]+)\)", bruto)
        if miolo and eh_fronteira(miolo.group(1)):
            return "fronteira"
        return "externa"
    if bruto.lower().startswith(("tópico", "topico")):
        return "topico"
    if eh_fronteira(bruto):
        return "fronteira"
    return "externa"


def eh_fronteira(texto):
    """O nome existe como fronteira no catálogo."""
    s = re.sub(r"[^a-z0-9]+", "-", normaliza(texto)).strip("-")
    return bool(s) and os.path.isdir(os.path.join(RAIZ, "catalogo", "fronteiras", s))


def id_do_texto(texto, nos):
    """A ponta da aresta vira id de nó quando o nó existe no desenho.

    Ponta que não existe fica com o nome que veio: é bloco de fora, e o desenho
    mostra que ela sai do recorte.
    """
    alvo = normaliza(texto)
    if not alvo:
        return texto
    for n in nos:
        if normaliza(n["servico"]) == alvo or normaliza(n["id"]) == alvo:
            return n["id"]
    dentro = [n for n in nos if normaliza(n["id"]) and normaliza(n["id"]) in alvo]
    if dentro:
        return max(dentro, key=lambda n: len(normaliza(n["id"])))["id"]
    return texto


def sobe_terraform(nome, dados):
    """Um `.tf` ou `.hcl` que já existe vira desenho, com o relatório junto.

    O relatório é o que torna a importação confiável: quantos blocos entraram,
    quantas peças saíram e o que não virou peça, com o motivo. Desenho que
    esconde o que não entendeu é pior que desenho nenhum.
    """
    sys.path.insert(0, FERR)
    import importar_terraform as imp

    tmp = oficina.pasta("bioma-tf-")
    alvo = os.path.join(tmp, os.path.basename(nome))
    io.open(alvo, "wb").write(dados)
    grafo, rel = imp.le(tmp)
    if not grafo["nos"]:
        return {"erro": "não achei resource nem module em %s. Se o arquivo é de "
                        "outro formato, use o caminho dele." % os.path.basename(nome)}
    for i, n in enumerate(grafo["nos"]):
        n.setdefault("x", 80 + (i % 5) * 240)
        n.setdefault("y", 80 + (i // 5) * 170)
        n["tipo"] = n.get("recurso") or ""
        n["valores"] = {}
    return {"grafo": grafo, "relatorio": rel,
            "recado": ("%d peça(s) de %d bloco(s); %d não virou peça"
                       % (rel["pecas"], rel["blocos_vistos"], len(rel["nao_lidos"])))}


def sobe_md(nome, dados):
    """Especificação em markdown: o tradutor lê e a tela recebe o grafo pronto."""
    tmp = oficina.pasta("bioma-subir-")
    alvo = os.path.join(tmp, os.path.basename(nome))
    io.open(alvo, "wb").write(dados)
    rc, saida = roda([sys.executable, os.path.join(FERR, "traduzir_bloco.py"),
                      alvo, "--saida", tmp], 120)
    prop = os.path.join(tmp, "proposta.json")
    if not os.path.exists(prop):
        return {"lido": False, "erro": saida[-800:],
                "explicacao": "o tradutor não produziu proposta para este arquivo"}
    proposta = json.load(io.open(prop, encoding="utf-8"))
    return {"lido": True, "grafo": grafo_da_proposta(proposta), "proposta": proposta,
            "nao_lidos": [], "saida": saida[-2000:], "pasta_tradutor": tmp}


def texto_do_drawio(bruto):
    """O conteúdo do drawio, descomprimido quando vem empacotado.

    O drawio grava o modelo em deflate cru dentro de base64. Os dois formatos
    entram aqui e saem como XML.
    """
    try:
        raiz = ET.fromstring(bruto)
    except ET.ParseError:
        return []
    modelos = []
    diagramas = raiz.findall(".//diagram") or ([raiz] if raiz.tag == "diagram" else [])
    if not diagramas and raiz.tag == "mxGraphModel":
        return [raiz]
    for d in diagramas:
        dentro = d.find("mxGraphModel")
        if dentro is not None:
            modelos.append(dentro)
            continue
        carga = (d.text or "").strip()
        if not carga:
            continue
        try:
            crua = zlib.decompress(base64.b64decode(carga), -15).decode("utf-8")
            modelos.append(ET.fromstring(urllib.parse.unquote(crua)))
        except Exception:
            continue
    return modelos


def forma_do_estilo(estilo):
    """O nome da forma AWS dentro do estilo do drawio."""
    if not estilo:
        return None
    m = re.search(r"resIcon=mxgraph\.aws\d*\.[a-z0-9_]*?([a-z0-9_]+)(;|$)", estilo)
    if m:
        return m.group(1)
    m = re.search(r"shape=mxgraph\.aws\d*\.(?:resourceIcon|productIcon)?\.?([a-z0-9_]+)", estilo)
    return m.group(1) if m else None


def sobe_drawio(nome, dados):
    """Lê os shapes do drawio. O que não casa com serviço conhecido não vira nó.

    Cada forma reconhecida vira nó com o tipo do provider. Forma sem serviço
    conhecido vai para a lista do que não foi lido, com o nome e a forma, para
    uma pessoa dizer o que é.
    """
    try:
        bruto = dados.decode("utf-8", "replace")
    except Exception:
        return {"lido": False, "erro": "arquivo não é texto"}
    nos, nao_lidos, por_celula, arestas_cruas = [], [], {}, []
    for pagina, modelo in enumerate(texto_do_drawio(bruto)):
        for c in modelo.iter("mxCell"):
            rotulo = re.sub(r"<[^>]+>", " ", c.get("value") or "")
            rotulo = re.sub(r"\s+", " ", rotulo).strip()
            estilo = c.get("style") or ""
            if c.get("edge") == "1":
                arestas_cruas.append(("%d:%s" % (pagina, c.get("source")),
                                      "%d:%s" % (pagina, c.get("target")), rotulo))
                continue
            if c.get("vertex") != "1":
                continue
            forma = forma_do_estilo(estilo)
            tipo = tipo_do_servico(forma)
            por_que = "forma AWS declarada no desenho"
            if not tipo:
                tipo = tipo_do_servico(rotulo)
                por_que = "casou pelo rótulo; o desenho não declara forma AWS nessa peça"
            if not tipo:
                if rotulo or forma:
                    nao_lidos.append({"nome": rotulo or "sem rótulo",
                                      "forma": forma or "sem forma AWS declarada",
                                      "por_que": "nenhum serviço conhecido casa com esse rótulo"})
                continue
            geo = c.find("mxGeometry")
            ident = rotulo or forma
            base, n = ident, 2
            while any(x["id"] == ident for x in nos):
                ident = "%s-%d" % (base, n)
                n += 1
            no = {"id": ident, "tipo": tipo, "servico": rotulo or forma,
                  "papel": None, "zona": None, "conta": None, "regiao": "",
                  "multiplicidade": None, "forma": forma, "pagina": pagina,
                  "por_que": por_que,
                  "x": float(geo.get("x", 0)) if geo is not None else 80 + 240 * (len(nos) % 5),
                  "y": float(geo.get("y", 0)) if geo is not None else 80 + 170 * (len(nos) // 5),
                  "valores": {}}
            nos.append(no)
            por_celula["%d:%s" % (pagina, c.get("id"))] = ident
    arestas = []
    for de, para, rotulo in arestas_cruas:
        if de in por_celula and para in por_celula:
            arestas.append({"de": por_celula[de], "para": por_celula[para],
                            "flui": rotulo or "dado", "canal": "direto", "cruza": "não"})
        else:
            nao_lidos.append({"nome": rotulo or "seta sem rótulo", "forma": "aresta",
                              "por_que": "uma das pontas não foi reconhecida"})
    return {"lido": bool(nos), "grafo": {"nos": nos, "arestas": arestas},
            "nao_lidos": nao_lidos,
            "explicacao": "o que o drawio declara como forma da AWS virou nó; o resto está na lista do que não foi lido"}


def sobe_imagem(nome, dados, extensao):
    """Imagem não vira grafo. Ela volta para a tela como referência a conferir."""
    mime = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg",
            "svg": "image/svg+xml"}.get(extensao, "application/octet-stream")
    return {"lido": False,
            "imagem": "data:%s;base64,%s" % (mime, base64.b64encode(dados).decode("ascii")),
            "grafo": {"nos": [], "arestas": []}, "nao_lidos": [],
            "explicacao": "imagem precisa de conferência humana: extração de desenho erra, e erro "
                          "silencioso aqui vira infraestrutura errada. Monte o desenho na tela com "
                          "a imagem ao lado."}




# ── ler a imagem com um modelo de visão ────────────────────────────────
# Regra da casa: o modelo NOMEIA candidatos, e o bioma valida contra o esquema
# do provider. Recurso que o modelo inventa e o provider não conhece vai para
# conferência humana, nunca para o desenho.
CHAVE_LLM = os.path.expanduser("~/.bioma/openai.key")


def chave_llm():
    v = os.environ.get("OPENAI_API_KEY")
    if v:
        return v.strip()
    if os.path.exists(CHAVE_LLM):
        return io.open(CHAVE_LLM, encoding="utf-8").read().strip()
    return None


PEDIDO_VISAO = """Você está lendo um diagrama de arquitetura da AWS.

Devolva SÓ um JSON, sem texto em volta, nesta forma:
{"pecas":[{"rotulo":"...","servico":"...","papel":"...","conta":"...","x":0,"y":0}],
 "setas":[{"de":"rotulo da origem","para":"rotulo do destino","canal":"..."}]}

Regras:
- "servico" é o nome do serviço da AWS como a AWS o chama (exemplo: "Amazon S3",
  "AWS Lambda", "Amazon MSK"). Não invente serviço que você não vê no desenho.
- "conta" é o nome da caixa que contém a peça, quando o desenho tiver caixas de
  conta ou de ambiente. Vazio quando não houver.
- "x" e "y" são a posição aproximada em pixels, medida no canto superior
  esquerdo da imagem.
- Em dúvida sobre uma peça, ponha o rótulo que você lê e deixe "servico" vazio.
  Deixar em branco é melhor do que errar o serviço."""


def le_imagem_com_llm(dados, ext):
    chave = chave_llm()
    if not chave:
        return {"lido": False, "porque": "nenhuma chave de modelo configurada. "
                "Ponha a chave em ~/.bioma/openai.key ou em OPENAI_API_KEY."}
    import base64, urllib.request as _u
    b64 = base64.b64encode(dados).decode()
    mime = "image/svg+xml" if ext == "svg" else ("image/jpeg" if ext in ("jpg", "jpeg") else "image/png")
    corpo = json.dumps({
        "model": "gpt-4o",
        "max_tokens": 4000,
        "messages": [{"role": "user", "content": [
            {"type": "text", "text": PEDIDO_VISAO},
            {"type": "image_url", "image_url": {"url": "data:%s;base64,%s" % (mime, b64)}},
        ]}],
    }).encode()
    req = _u.Request("https://api.openai.com/v1/chat/completions", data=corpo,
                     headers={"Content-Type": "application/json",
                              "Authorization": "Bearer " + chave})
    try:
        with _u.urlopen(req, timeout=180) as r:
            resp = json.load(r)
    except Exception as e:
        return {"lido": False, "porque": "o modelo não respondeu: %s" % e}

    texto = resp["choices"][0]["message"]["content"]
    m = re.search(r"\{.*\}", texto, re.S)
    if not m:
        return {"lido": False, "porque": "o modelo respondeu fora do formato pedido"}
    try:
        d = json.loads(m.group(0))
    except Exception:
        return {"lido": False, "porque": "o modelo respondeu um JSON inválido"}

    validos = recursos_validos()
    nos, nao_lidos, por_rotulo = [], [], {}
    for i, p in enumerate(d.get("pecas") or []):
        rotulo = (p.get("rotulo") or "").strip()
        tipo = tipo_pelo_nome(p.get("servico") or "")
        if not tipo or tipo not in validos:
            nao_lidos.append({"texto": rotulo or (p.get("servico") or "peça sem nome"),
                              "motivo": "o modelo leu \"%s\" e isso não casa com um recurso do "
                                        "provider. Escolha o recurso desta peça na tela."
                                        % (p.get("servico") or "nada")})
            continue
        nid = "visao-%d" % i
        por_rotulo[re.sub(r"[^a-z0-9]+", " ", rotulo.lower()).strip()] = nid
        nos.append({"id": nid, "tipo": tipo,
                    "servico": tipo.replace("aws_", "").replace("_", " "),
                    "papel": (p.get("papel") or "").strip(),
                    "zona": "Platform", "conta": (p.get("conta") or "").strip(), "regiao": "",
                    "multiplicidade": "compartilhado",
                    "x": int(p.get("x") or 0) or 40 + (i % 3) * 280,
                    "y": int(p.get("y") or 0) or 40 + (i // 3) * 180,
                    "valores": {}, "rotulo_do_poster": rotulo,
                    "lido_por": "modelo de visão"})

    arestas = []
    for s in (d.get("setas") or []):
        de = por_rotulo.get(re.sub(r"[^a-z0-9]+", " ", (s.get("de") or "").lower()).strip())
        para = por_rotulo.get(re.sub(r"[^a-z0-9]+", " ", (s.get("para") or "").lower()).strip())
        if de and para and de != para:
            arestas.append({"de": de, "para": para, "flui": "", "canal": (s.get("canal") or "")})
        else:
            nao_lidos.append({"texto": "%s -> %s" % (s.get("de"), s.get("para")),
                              "motivo": "seta com ponta que não casa com peça lida"})

    return {"lido": bool(nos), "grafo": {"nos": nos, "arestas": arestas},
            "nao_reconhecido": nao_lidos,
            "porque": "um modelo de visão leu a imagem: %d peças e %d setas. Ele nomeia, "
                      "o bioma valida contra o provider, e o que não casa fica para você "
                      "conferir. Confira antes de gerar: leitura de imagem erra."
                      % (len(nos), len(arestas))}


def _mapa_icone_para_tipo():
    """O ícone do poster diz o recurso.

    A tabela é escrita à mão (`icones-poster.json`) porque o caminho do ícone
    do poster não é o mesmo do mapa da tela, e adivinhar por semelhança de nome
    produzia recurso errado.
    """
    fora = {}
    try:
        mao = json.load(io.open(os.path.join(AQUI, "icones-poster.json"), encoding="utf-8"))
        fora.update({k: v for k, v in mao.items() if not k.startswith("_")})
    except Exception:
        pass
    try:
        d = json.load(io.open(os.path.join(AQUI, "icones-aws.json"), encoding="utf-8"))
    except Exception:
        return fora
    for tipo, v in (d.get("servicos") or {}).items():
        ic = v.get("icone") if isinstance(v, dict) else v
        if ic and ic not in fora:
            fora[ic] = tipo if tipo.startswith("aws_") else "aws_" + tipo
    # o poster usa o ícone genérico do serviço; o mapa guarda o do recurso.
    # casar também pelo nome do arquivo resolve general/sdk.png e afins.
    for ic, tipo in list(fora.items()):
        base = os.path.basename(ic)
        fora.setdefault(base, tipo)
    return fora


_validos = None
_apelidos = None


_arvore_recursos = None


def arvore_recursos():
    """O inventário agrupado por serviço da AWS, para a paleta navegar.

    O grupo é o prefixo do tipo: dois segmentos quando três ou mais recursos
    compartilham (api_gateway, cognito_identity), um segmento no resto. Assim
    "API Gateway (87)" abre nos filhos em vez de 1687 linhas soltas."""
    global _arvore_recursos
    with _trava_mapas:
        if _arvore_recursos is not None:
            return _arvore_recursos
        todos = recursos()
        # serviço de nome composto usa dois segmentos; o resto agrupa pelo
        # primeiro. Cortar por frequência criava grupos mentirosos como
        # "s3 bucket" e "ec2 transit".
        compostos = {"api", "elastic", "global", "service", "storage",
                     "verified", "resource", "media", "network", "vpc"}
        grupos = {}
        for r in todos:
            partes = r["tipo"].split("_")
            if len(partes) >= 3 and partes[1] in compostos:
                chave = "_".join(partes[1:3])
            else:
                chave = partes[1] if len(partes) > 1 else r["tipo"]
            g = grupos.setdefault(chave, {"grupo": chave, "itens": []})
            g["itens"].append({"tipo": r["tipo"], "categoria": r["categoria"], "exige": r["exige"]})
        for g in grupos.values():
            g["quantos"] = len(g["itens"])
            g["rotulo"] = g["grupo"].replace("_", " ")
            g["itens"].sort(key=lambda x: x["tipo"])
        _arvore_recursos = sorted(grupos.values(), key=lambda g: (-g["quantos"], g["grupo"]))
        return _arvore_recursos


def recursos_validos():
    """Os tipos que o provider aceita. Tipo fora daqui não vira peça."""
    global _validos
    if _validos is None:
        try:
            d = json.load(io.open(ESQUEMA, encoding="utf-8"))
            _validos = set(list(d["provider_schemas"].values())[0]["resource_schemas"])
        except Exception:
            _validos = set()
    return _validos


def tipo_pelo_nome(rotulo):
    """O nome do serviço vira o recurso que representa a peça.

    Por tabela escrita à mão, nunca por semelhança de palavra: "Amazon MSK"
    precisa virar o cluster, e a semelhança devolvia o tópico. Nome que não
    está na tabela devolve nada, e a peça vai para conferência.
    """
    global _apelidos
    if _apelidos is None:
        try:
            d = json.load(io.open(os.path.join(AQUI, "servicos-canonicos.json"), encoding="utf-8"))
            _apelidos = [(re.sub(r"[^a-z0-9]+", " ", a).strip(), tp)
                         for tp, lista in d["apelidos"].items() for a in lista]
            _apelidos.sort(key=lambda x: -len(x[0]))
        except Exception:
            _apelidos = []
    alvo = re.sub(r"[^a-z0-9]+", " ", (rotulo or "").lower()).strip()
    if not alvo:
        return None
    for apelido, tipo in _apelidos:
        if re.search(r"\b%s\b" % re.escape(apelido), alvo):
            return tipo
    return None


def ler_poster(html):
    """O HTML do poster vira grafo.

    O poster carrega mais do que a imagem dele: cada peça tem posição, o ícone
    oficial da AWS (que diz o serviço), o nome e o papel; e cada seta tem um
    comentário nomeando as duas pontas. É a versão legível por máquina do mesmo
    desenho, e por isso ela ganha da imagem sempre que existir.
    """
    de_icone = _mapa_icone_para_tipo()
    nos, nao_lidos = [], []

    bloco = re.compile(
        r'<div class="node"[^>]*style="[^"]*left:(\d+)px;\s*top:(\d+)px"[^>]*>(.*?)</div>\s*</div>',
        re.S)
    for i, m in enumerate(re.finditer(
            r'<div class="node"[^>]*left:(\d+)px;\s*top:(\d+)px[^>]*>(.*?)(?=<div class="node"|</div>\s*<svg|\Z)',
            html, re.S)):
        x, y, corpo = int(m.group(1)), int(m.group(2)), m.group(3)
        ic = re.search(r'src="aws://([^"]+)"', corpo)
        nome = re.search(r'class="nl">(.*?)</div>', corpo, re.S)
        papel = re.search(r'class="ns">(.*?)</div>', corpo, re.S)
        rotulo = re.sub(r"<[^>]+>", "", nome.group(1)).strip() if nome else ""
        caminho = ic.group(1) if ic else ""
        # O ícone é declarado por quem desenhou, então ele manda. Casar por
        # semelhança de nome parecia esperto e produzia recurso errado
        # (balde de S3 virando rastreador do Glue), que é pior do que não ler:
        # o que não casa exato vai para conferência humana.
        tipo = de_icone.get(caminho) or de_icone.get(os.path.basename(caminho))
        if tipo and tipo not in recursos_validos():
            tipo = None
        if not tipo:
            nao_lidos.append({
                "texto": rotulo or (caminho or "peça sem nome"),
                "icone": caminho,
                "x": x, "y": y,
                "motivo": "o ícone %s não aponta um recurso do provider. "
                          "Escolha o recurso desta peça na tela." % (caminho or "ausente")})
            continue
        nos.append({
            "id": "poster-%d" % i,
            "tipo": tipo,
            "servico": tipo.replace("aws_", "").replace("_", " "),
            "papel": re.sub(r"<[^>]+>", " ", papel.group(1)).strip() if papel else "",
            "zona": "Platform", "conta": "", "regiao": "",
            "multiplicidade": "compartilhado",
            "x": x, "y": y, "valores": {},
            "rotulo_do_poster": rotulo,
        })

    # as setas vêm nomeadas em comentário: <!-- 2 ADOT -> CloudWatch -->
    def acha(texto):
        alvo = re.sub(r"[^a-z0-9]+", " ", (texto or "").lower()).strip()
        if not alvo:
            return None
        for n in nos:
            for campo in (n.get("rotulo_do_poster"), n["servico"]):
                c = re.sub(r"[^a-z0-9]+", " ", (campo or "").lower()).strip()
                if c and (alvo in c or c in alvo):
                    return n["id"]
        return None

    arestas = []
    for m in re.finditer(r"<!--\s*\d*\s*(.+?)\s*-(?:>|&gt;)\s*(.+?)\s*-->", html):
        de, para = acha(m.group(1)), acha(m.group(2))
        if de and para and de != para:
            arestas.append({"de": de, "para": para, "flui": "", "canal": ""})
        else:
            nao_lidos.append({"texto": "%s -> %s" % (m.group(1), m.group(2)),
                              "motivo": "não achei uma das pontas entre as peças lidas"})

    return {"lido": bool(nos), "grafo": {"nos": nos, "arestas": arestas},
            "nao_reconhecido": nao_lidos,
            "porque": "li o HTML do poster: %d peças e %d setas, com a posição do desenho."
                      % (len(nos), len(arestas))}


def especificacao_irma(nome_imagem):
    """O .md que descreve o mesmo bloco desta imagem.

    O poster `14-observabilidade-aiops-ra.png` e a especificação
    `14-observabilidade-aiops.md` saem do mesmo documento. Procuro o irmão em
    exemplos/ e nas pastas de arquitetura conhecidas antes de pedir trabalho
    manual a quem subiu.
    """
    base = re.sub(r"\.(png|jpg|jpeg|svg)$", "", os.path.basename(nome_imagem), flags=re.I)
    candidatos = [base, re.sub(r"-(ra|poster|fragmento)$", "", base)]
    lugares = [os.path.join(RAIZ, "exemplos")]
    arq = os.path.join(RAIZ, "tela", "lugares-de-especificacao.json")
    if os.path.exists(arq):
        try:
            lugares += [os.path.expanduser(x) for x in json.load(io.open(arq, encoding="utf-8"))]
        except Exception:
            pass
    achados = {}
    for lugar in lugares:
        if not os.path.isdir(lugar):
            continue
        for base_dir, _d, arqs in os.walk(lugar):
            for a in arqs:
                for ext in (".md", ".html"):
                    if a.endswith(ext) and a[: -len(ext)] in candidatos:
                        achados.setdefault(ext, os.path.join(base_dir, a))
    # a especificação ganha do poster: ela declara zona e multiplicidade
    return achados.get(".md") or achados.get(".html")


def subir(nome, dados, forcar_visao=False):
    ext = os.path.splitext(nome)[1].lstrip(".").lower()
    resposta = {"nome": nome, "extensao": ext, "bytes": len(dados)}
    if not dados:
        resposta.update({"lido": False, "erro": "arquivo vazio"})
    elif ext == "md":
        resposta.update(sobe_md(nome, dados))
    elif ext in ("tf", "hcl"):
        resposta.update(sobe_terraform(nome, dados))
    elif ext in ("drawio", "xml"):
        resposta.update(sobe_drawio(nome, dados))
    elif ext in ("html", "htm"):
        resposta.update(ler_poster(dados.decode("utf-8", "replace")))
    elif ext in ("png", "jpg", "jpeg", "svg"):
        r = sobe_imagem(nome, dados, ext)
        # quem pediu a visão quer a visão: o atalho do irmão fica de fora
        par = None if forcar_visao else especificacao_irma(nome)
        if par:
            # o poster e a especificação nascem do mesmo documento: quando o
            # irmão existe, subir a imagem vale por subir a especificação
            if par.endswith(".html"):
                lido = ler_poster(io.open(par, encoding="utf-8", errors="replace").read())
            else:
                lido = sobe_md(os.path.basename(par), io.open(par, "rb").read())
            lido["imagem"] = r.get("imagem")
            lido["porque"] = ("li a especificação irmã desta imagem (%s) e montei o "
                              "desenho. A imagem fica ao lado para conferência."
                              % os.path.basename(par))
            lido["caminho_lido"] = "especificacao-irma"
            lido["irma"] = os.path.basename(par)
            resposta.update(lido)
        else:
            visao = le_imagem_com_llm(dados, ext)
            if visao.get("lido"):
                visao["imagem"] = r.get("imagem")
                visao["caminho_lido"] = "modelo-de-visao"
                resposta.update(visao)
            else:
                r["porque"] = (r.get("porque") or "") + " " + (visao.get("porque") or "")
                resposta.update(r)
    else:
        resposta.update({"lido": False,
                         "erro": "extensão não lida: %s" % (ext or "sem extensão"),
                         "explicacao": "a tela lê md (especificação), drawio ou xml (desenho) e "
                                       "png, jpg ou svg (referência)"})
    return resposta


# ── /pre-voo: os verificadores sobre a árvore ─────────────────────────────

def roda(cmd, segundos, cwd=None, env=None):
    """Executa e devolve código e saída juntas. Estouro de tempo tem código 124.

    Passa pela oficina porque o `terraform validate` daqui abre o provider como
    processo à parte: matar só o filho no estouro deixaria o provider girando
    em CPU cheia depois que a requisição já respondeu.
    """
    rc, saida = oficina.roda(cmd, segundos, cwd=cwd, env=env)
    return rc, sem_cores(saida)


CORES = re.compile(r"\x1b\[[0-9;]*[A-Za-z]")


def sem_cores(texto):
    """Tira o código de cor do terminal. O texto fica inteiro; só some o byte
    de controle, que no navegador apareceria como lixo no meio da frase."""
    return CORES.sub("", texto or "")


def resumo(saida, quantas=3):
    linhas = [l.strip() for l in (saida or "").splitlines() if l.strip()]
    return " · ".join(linhas[-quantas:]) if linhas else "sem saída"


def checa_preenchimento(pasta):
    live = os.path.join(pasta, "live")
    if not os.path.isdir(live):
        return {"nome": "preenchimento", "estado": "pendente",
                "detalhe": "a árvore não tem live/: gere os arquivos antes do verificações"}
    rc, saida = roda([sys.executable, os.path.join(FERR, "verificar_preenchimento.py"), live], 120)
    if rc == 0:
        return {"nome": "preenchimento", "estado": "ok",
                "detalhe": "tudo respondido e no formato que o serviço aceita"}
    if rc == 1:
        fora = "fora do formato" in saida
        cabecas = [l.strip() for l in saida.splitlines()
                   if l.startswith("Falta responder") or l.startswith("Respondido fora")]
        return {"nome": "preenchimento",
                "estado": "bloqueado" if fora else "pendente",
                "detalhe": " · ".join(cabecas) or resumo(saida),
                "saida": saida[-4000:]}
    return {"nome": "preenchimento", "estado": "pendente",
            "detalhe": "o verificador parou: %s" % resumo(saida, 1)}


def inventario_da_arvore(pasta):
    """O inventário que o verificador de durabilidade lê, tirado da própria árvore.

    Cada receita escreve o tecido no cabeçalho do main.tf (`# Tecido: ...`), que
    é o que o tradutor decidiu. Nada é inventado aqui: receita que não declara
    tecido fica de fora e aparece como pendência no detalhe.
    """
    organismos, sem_tecido = {}, []
    base = os.path.join(pasta, "catalogo", "organismos")
    for familia in sorted(os.listdir(base)) if os.path.isdir(base) else []:
        pf = os.path.join(base, familia)
        if not os.path.isdir(pf):
            continue
        for nome in sorted(os.listdir(pf)):
            main = os.path.join(pf, nome, "main.tf")
            if not os.path.exists(main):
                continue
            txt = io.open(main, encoding="utf-8").read()
            m = re.search(r"^#\s*Tecido:\s*([a-zá-ú]+)", txt, re.M | re.I)
            if not m:
                sem_tecido.append("%s/%s" % (familia, nome))
                continue
            organismos.setdefault(familia, []).append(
                {"nome": nome, "durabilidade": m.group(1).lower()})
    return {"organismos": organismos, "moleculas": [], "ligacoes": [],
            "fronteiras": [], "artefatos": []}, sem_tecido


ARRANQUE = """
import importlib.util, sys
spec = importlib.util.spec_from_file_location("verificador", sys.argv[1])
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
if not hasattr(mod, "RAIZ") or not hasattr(mod, "CATALOGO"):
    print("o verificador mudou de forma: sem RAIZ ou CATALOGO para apontar na arvore")
    sys.exit(3)
mod.RAIZ = sys.argv[2]
mod.CATALOGO = sys.argv[3]
mod.main()
"""


def checa_durabilidade(pasta):
    """Roda verificar_durabilidade.py apontado para a árvore da tela.

    O verificador nasceu para o repositório de uma instância: lê `inventario.json`
    na raiz e as receitas em `infra/catalogo`. A árvore da tela tem as receitas e
    tem o tecido escrito dentro delas, então o inventário sai da própria árvore e
    os dois caminhos são reapontados na hora da chamada.
    """
    catalogo = os.path.join(pasta, "catalogo")
    if not os.path.isdir(catalogo):
        return {"nome": "durabilidade", "estado": "pendente",
                "detalhe": "a árvore não tem catalogo/: gere os arquivos antes do verificações"}
    inv, sem_tecido = inventario_da_arvore(pasta)
    if not inv["organismos"]:
        return {"nome": "durabilidade", "estado": "pendente",
                "detalhe": "nenhuma receita da árvore declara tecido no cabeçalho do main.tf"}
    with tempfile.TemporaryDirectory(prefix="bioma-durab-") as tmp:
        io.open(os.path.join(tmp, "inventario.json"), "w", encoding="utf-8").write(
            json.dumps(inv, ensure_ascii=False))
        rc, saida = roda([sys.executable, "-c", ARRANQUE,
                          os.path.join(FERR, "verificar_durabilidade.py"), tmp, catalogo], 120)
    extra = (" · sem tecido declarado: %s" % ", ".join(sem_tecido)) if sem_tecido else ""
    if rc == 0:
        return {"nome": "durabilidade", "estado": "ok",
                "detalhe": resumo(saida, 1) + extra}
    if rc == 1:
        return {"nome": "durabilidade", "estado": "bloqueado",
                "detalhe": resumo(saida, 4) + extra, "saida": saida[-4000:]}
    return {"nome": "durabilidade", "estado": "pendente",
            "detalhe": "o verificador parou: %s" % resumo(saida, 1)}


def diferenca(corpo):
    """O que este desenho acrescenta, muda e tira de uma árvore que já existe.

    Quem tem instância de pé não quer saber o que a ferramenta escreveria do
    zero: quer saber o que muda no que já está lá. A resposta é sobre código no
    disco, e não sobre a nuvem, e a saída diz isso na primeira linha para
    ninguém ler "existe no código" como "existe na conta".
    """
    alvo = (corpo.get("arvore") or "").strip()
    if not alvo:
        return {"erro": "diga a pasta da árvore que já existe, em `arvore`"}
    alvo = os.path.abspath(os.path.expanduser(alvo))
    if not os.path.isdir(alvo):
        return {"erro": "não achei a árvore em %s" % alvo}
    _tmp, prop, erro, _saida = traduz_grafo(corpo.get("grafo") or {})
    if erro:
        return {"erro": erro}
    sys.path.insert(0, FERR)
    import diferenca_da_instancia as d
    r = d.compara(json.load(io.open(prop, encoding="utf-8")), alvo)
    return {
        "arvore": alvo,
        "sobre": "desenho e código, não desenho e nuvem: aplicar é outra pergunta",
        "nasce": ["/".join(k) for k in r["nasce"]],
        "muda": [{"celula": "/".join(m["celula"]), "campo": m["campo"],
                  "de": m["de"], "para": m["para"]} for m in r["muda"]],
        "removidas": ["/".join(k) for k in r["removidas"]],
        "achados": ["/".join(k) for k in r["achados"]],
        "avisos": ["/".join(k) for k in r["avisos"]],
        "conta_comparavel": r["conta_comparavel"],
        "por_que_conta": r["por_que_conta"],
        "recorte": r["recorte"],
        "batem": not (r["nasce"] or r["muda"] or r["sai"]),
    }


def verificador_da_instancia(nome, pasta):
    """O caminho de um verificador que é da instância, não do framework.

    Cobertura confronta o desenho contra o inventário de quem desenhou: é
    conferência do repositório de instância, e o framework não carrega cópia
    dela. Procura na árvore, e nos caminhos que `BIOMA_VERIFICADORES` apontar.
    """
    candidatos = [os.path.join(pasta, "ferramentas", nome)]
    for d in (os.environ.get("BIOMA_VERIFICADORES") or "").split(os.pathsep):
        if d.strip():
            candidatos.append(os.path.join(d.strip(), nome))
    for c in candidatos:
        if os.path.exists(c):
            return c
    return None


def checa_cobertura(pasta):
    """Roda o verificador de cobertura da instância, quando ela tem um.

    Ele confronta as tabelas de Serviços dos blocos com o `inventario.json` da
    instância. Uma árvore que nasce de um desenho na tela não tem nem os blocos
    nem o inventário, e a checagem volta pendente com o motivo, em vez de
    reprovar por falta de arquivo que a tela nunca escreveu.
    """
    alvo = verificador_da_instancia("verificar_cobertura.py", pasta)
    if not alvo:
        return {"nome": "cobertura", "estado": "pendente",
                "detalhe": "cobertura é conferência da instância: nenhum "
                           "verificar_cobertura.py nesta árvore nem em "
                           "BIOMA_VERIFICADORES"}
    rc, saida = roda([sys.executable, alvo], 120,
                     cwd=os.path.dirname(os.path.dirname(alvo)),
                     env=dict(os.environ, BIOMA_RAIZ=pasta))
    concluiu = "Cobertura dos blocos" in saida and "Traceback" not in saida
    if rc == 0 and concluiu:
        return {"nome": "cobertura", "estado": "ok", "detalhe": resumo(saida, 1)}
    if rc == 1 and concluiu:
        return {"nome": "cobertura", "estado": "bloqueado", "detalhe": resumo(saida, 4),
                "saida": saida[-4000:]}
    if rc == 2:
        return {"nome": "cobertura", "estado": "pendente", "detalhe": resumo(saida, 2)}
    return {"nome": "cobertura", "estado": "pendente",
            "detalhe": "a checagem parou: %s" % resumo(saida, 2),
            "saida": saida[-2000:]}


def terraform():
    achado = shutil.which("terraform")
    if achado:
        return achado
    for d in BINARIOS:
        alvo = os.path.join(d, "terraform")
        if os.path.exists(alvo) and os.access(alvo, os.X_OK):
            return alvo
    return None


def checa_plano(pasta):
    """Passa o terraform validate nas receitas geradas, sem tocar a rede.

    `validate` sem `init` não tem provider instalado e reclama disso. Reclamação
    de provider ausente é pendência (falta o init, que baixa provider e não roda
    dentro de uma requisição). Erro de sintaxe ou de argumento é bloqueio.
    """
    tf = terraform()
    if not tf:
        return {"nome": "plano", "estado": "pendente",
                "detalhe": "terraform fora do PATH; sem ele o plano não se confere aqui"}
    base = os.path.join(pasta, "catalogo", "organismos")
    receitas = []
    for familia in sorted(os.listdir(base)) if os.path.isdir(base) else []:
        pf = os.path.join(base, familia)
        for nome in sorted(os.listdir(pf)) if os.path.isdir(pf) else []:
            if os.path.exists(os.path.join(pf, nome, "main.tf")):
                receitas.append(os.path.join(pf, nome))
    if not receitas:
        return {"nome": "plano", "estado": "pendente", "detalhe": "nenhuma receita para validar"}
    limite = receitas[:8]
    quebradas, sem_provider = [], 0
    for r in limite:
        rc, saida = roda([tf, "-chdir=" + r, "validate", "-no-color"], 60)
        if rc == 0:
            continue
        if "Missing required provider" in saida or "terraform init" in saida:
            sem_provider += 1
            continue
        quebradas.append("%s: %s" % (os.path.basename(r), resumo(saida, 2)))
    if quebradas:
        return {"nome": "plano", "estado": "bloqueado",
                "detalhe": " · ".join(quebradas[:3]), "saida": "\n".join(quebradas)[-4000:]}
    if sem_provider:
        passaram = len(limite) - sem_provider
        return {"nome": "plano", "estado": "pendente",
                "detalhe": "%d de %d receitas pedem terraform init (o provider da AWS ainda não "
                           "está instalado na pasta)%s" %
                           (sem_provider, len(limite),
                            "; nas outras %d o validate passou" % passaram if passaram else "")}
    return {"nome": "plano", "estado": "ok",
            "detalhe": "terraform validate passou em %d receitas" % len(limite)}


def pre_voo(corpo):
    pasta = corpo.get("pasta")
    gerado = None
    if not pasta and corpo.get("grafo"):
        gerado = gerar(corpo["grafo"])
        if gerado.get("erro"):
            return {"erro": gerado["erro"], "checagens": [], "bloqueio": True}
        pasta = gerado.get("pasta")
    if not pasta or not os.path.isdir(pasta):
        return {"erro": "sem árvore para conferir: mande pasta ou grafo",
                "checagens": [], "bloqueio": True}
    # o inventário nasce aqui, e não só na hora de rodar: sem isso a mesma
    # checagem daria dois motivos diferentes conforme o comando já tivesse
    # rodado antes, e motivo que muda sozinho é decisão silenciosa
    prepara_arvore(pasta)
    checagens = [checa_preenchimento(pasta), checa_cobertura(pasta),
                 checa_durabilidade(pasta), checa_plano(pasta)]
    bloqueio = any(c["estado"] == "bloqueado" for c in checagens)
    resposta = {"pasta": pasta, "checagens": checagens, "bloqueio": bloqueio,
                "destruir_liberado": not bloqueio,
                "por_que": "destruição fica travada enquanto alguma checagem estiver bloqueada"
                           if bloqueio else "nenhuma checagem bloqueada"}
    if gerado:
        resposta["proposta"] = gerado.get("proposta")
    return resposta


# ── /revisar: o parecer de quem entende ──────────────────────────────────

PEDIDO_REVISAO = """Você é um arquiteto AWS sênior revisando a infraestrutura como
código abaixo. O autor não escreve Terraform: ele desenhou uma arquitetura e a
ferramenta gerou esta árvore.

Responda SÓ um JSON, sem texto em volta, nesta forma:
{"itens":[{"estado":"ok"|"falha"|"risco","titulo":"frase curta",
           "onde":"caminho/do/arquivo ou o nome da peça",
           "porque":"o que está certo, ou o que quebra e quando",
           "conserto":["passo 1","passo 2"]}]}

Regras do parecer:
- Julgue o que está escrito, não o que poderia estar. Não invente arquivo.
- "ok" para o que funciona, com a razão. Traga pelo menos os acertos reais.
- "falha" para o que impede o apply ou cria recurso errado.
- "risco" para o que sobe mas cobra caro depois (segurança, custo, estado).
- Em cada falha ou risco, "conserto" tem passos concretos, na ordem.
- Português do Brasil, direto, sem jargão de consultoria.

A árvore, arquivo por arquivo:
"""


def maquina_arm():
    """A máquina é Apple Silicon? Python e uname mentem sob Rosetta."""
    cod, apple = roda(["sysctl", "-n", "hw.optional.arm64"], 5)
    return (apple or "").strip() == "1" or platform.machine() in ("arm64", "aarch64")


def arquitetura_do_binario(caminho):
    """arm64, x86_64 ou universal, lido do próprio executável."""
    cod, saida = roda(["file", "-b", caminho], 10)
    s = (saida or "").lower()
    if "universal" in s:
        return "universal"
    if "arm64" in s:
        return "arm64"
    if "x86_64" in s:
        return "x86_64"
    return "?"


def escolhe_terraform():
    """O terraform que roda o provider desta máquina.

    O provider da AWS é um binário de quase um giga, e o terraform baixa o da
    arquitetura DELE, não a da máquina. Um terraform x86 sob Rosetta num Mac
    Apple Silicon baixa o provider x86, e o plugin não sobe: a revisão espera
    o tempo limite para descobrir isso. Escolher o binário certo antes evita
    a espera, e quando nenhum serve o diagnóstico sai na hora.

    Devolve (caminho, aviso). Aviso preenchido significa: dá para tentar, mas
    a probabilidade de falhar é alta, e o conserto está escrito.
    """
    candidatos = []
    for nome in ("tofu", "terraform"):
        for lugar in ("/opt/homebrew/bin", "/usr/local/bin"):
            c = os.path.join(lugar, nome)
            if os.path.isfile(c) and os.access(c, os.X_OK):
                candidatos.append(c)
        doPath = shutil.which(nome)
        if doPath and doPath not in candidatos:
            candidatos.append(doPath)
    if not candidatos:
        return None, {"titulo": "o terraform não está instalado nesta máquina",
                      "porque": "sem o binário, ninguém confere se o código compila "
                                "antes de aplicar.",
                      "conserto": ["Instale o terraform: `brew install terraform`.",
                                   "Rode a revisão de novo."]}

    arm = maquina_arm()
    servem = [c for c in candidatos
              if not arm or arquitetura_do_binario(c) in ("arm64", "universal")]
    if servem:
        return servem[0], None

    escolhido = candidatos[0]
    return escolhido, {
        "titulo": "o terraform desta máquina não roda o provider da AWS",
        "porque": "o binário em %s é %s e a máquina é arm64 (Apple Silicon). O "
                  "terraform baixa o provider da arquitetura dele, e esse provider "
                  "não sobe aqui: o código não foi conferido."
                  % (escolhido, arquitetura_do_binario(escolhido)),
        "conserto": ["Instale o terraform nativo: `arch -arm64 brew install terraform`.",
                     "Confira com `file $(which terraform)`: tem que dizer arm64.",
                     "Apague ~/.bioma/validador e rode a revisão de novo."]}


def revisao_local(pasta):
    """O que dá para afirmar sem modelo nenhum: verificadores e terraform."""
    itens = []
    for c in (checa_preenchimento(pasta), checa_cobertura(pasta),
              checa_durabilidade(pasta), checa_plano(pasta)):
        bloqueado = c.get("estado") == "bloqueado"
        itens.append({
            "estado": "falha" if bloqueado else "ok",
            "titulo": c.get("nome") or "verificação",
            "onde": "a árvore inteira",
            "porque": c.get("detalhe") or "",
            "conserto": (["Abra as pendências na tela e responda o que falta.",
                          "Rode a simulação de novo."] if bloqueado else []),
            "fonte": "verificador do bioma",
        })

    # terraform validate por receita: é o juiz que não opina, só compila
    tf, aviso = escolhe_terraform()
    if aviso:
        itens.append({"estado": "risco", "onde": "sua máquina", "fonte": "terraform",
                      "titulo": aviso["titulo"], "porque": aviso["porque"],
                      "conserto": aviso["conserto"]})
        # binário incompatível não é tentado: a espera pelo tempo limite não
        # ensina nada que o diagnóstico acima já não tenha dito
        return itens
    if not tf:
        return itens

    catalogo = os.path.join(pasta, "catalogo", "organismos")
    receitas = []
    for base, _d, arqs in os.walk(catalogo):
        if "main.tf" in arqs:
            receitas.append(base)

    # sem cache de plugin: o provider baixa uma vez, dentro da pasta de
    # validação, e fica lá. O cache compartilhado guarda o binário por link e
    # o terraform recusa executá-lo em algumas máquinas.
    amb = dict(os.environ, TF_IN_AUTOMATION="1")

    # sem provider, terraform não sabe dizer nada: isso é "não deu para
    # conferir", e chamar de "não compila" seria mentir sobre o código
    SEM_PROVIDER = re.compile(r"Failed to (obtain|load) provider|Could not load the schema|"
                              r"failed to install provider|no available releases", re.I)
    # terraform x86 numa máquina arm baixa o provider x86, e o plugin não sobe.
    # Diagnóstico específico porque o conserto também é: trocar o binário.
    ARQ_ERRADA = re.compile(r"not executable by this process|MachO architecture|"
                            r"failed to negotiate|Incompatible API version|"
                            r"timeout while waiting for plugin to start|"
                            r"failed to instantiate provider", re.I)

    # O provider da AWS pesa quase dois gigas, e o init leva um minuto. Uma
    # pasta de validação persistente paga esse minuto uma vez na vida: daí em
    # diante cada receita entra nela e roda só o validate, que leva segundos.
    banca = os.path.expanduser("~/.bioma/validador")
    os.makedirs(banca, exist_ok=True)
    alvos = sorted(receitas)[:12]
    if not alvos:
        return itens

    if not os.path.isdir(os.path.join(banca, ".terraform")):
        shutil.copyfile(os.path.join(alvos[0], "versions.tf"), os.path.join(banca, "versions.tf"))
        cod, saida = roda([tf, "init", "-backend=false", "-input=false", "-no-color"],
                          600, cwd=banca, env=amb)
        if cod != 0:
            itens.append({
                "estado": "risco" if SEM_PROVIDER.search(saida) else "falha",
                "titulo": "não deu para preparar o terraform",
                "onde": "sua máquina", "porque": saida[-500:], "fonte": "terraform init",
                "conserto": ["Confira a conexão com a internet ou o proxy.",
                             "Rode a revisão de novo: o provider fica guardado."]})
            return itens

    def consertoDeAmbiente():
        _c, apple = roda(["sysctl", "-n", "hw.optional.arm64"], 5)
        arm = (apple or "").strip() == "1" or platform.machine() in ("arm64", "aarch64")
        if arm:
            return ["Seu terraform é x86 e a máquina é arm64 (Apple Silicon): o "
                    "provider baixa para a arquitetura errada.",
                    "Instale o terraform nativo: `arch -arm64 brew install terraform`.",
                    "Apague ~/.bioma/validador e rode a revisão de novo."]
        return ["Apague ~/.bioma/validador e rode a revisão de novo."]

    for base in alvos:
        nome = os.path.relpath(base, pasta)
        # o .terraform.lock.hcl também termina em .hcl, e apagá-lo desfazia o
        # init: a limpeza pega só os arquivos da receita anterior
        for velho in os.listdir(banca):
            if velho.endswith(".tf") and velho != "versions.tf":
                os.remove(os.path.join(banca, velho))
        for arq in os.listdir(base):
            if arq.endswith(".tf"):
                shutil.copyfile(os.path.join(base, arq), os.path.join(banca, arq))
        cod, saida = roda([tf, "validate", "-no-color"], 45, cwd=banca, env=amb)
        if cod == 124:
            itens.append({
                "estado": "risco", "onde": "sua máquina", "fonte": "terraform validate",
                "titulo": "o terraform desta máquina não responde",
                "porque": "o validate passou de 45s sem terminar. O plugin do provider "
                          "não sobe nesta máquina, então o código não foi conferido.",
                "conserto": consertoDeAmbiente()})
            break
        if cod == 0:
            itens.append({"estado": "ok", "titulo": "a receita %s compila" % os.path.basename(base),
                          "onde": nome, "fonte": "terraform validate",
                          "porque": "terraform validate passou: os blocos existem no provider e os tipos batem.",
                          "conserto": []})
        elif ARQ_ERRADA.search(saida) or SEM_PROVIDER.search(saida):
            # Python e uname mentem quando o processo roda sob Rosetta: os
            # dois respondem x86_64 numa máquina Apple Silicon. O sysctl fala
            # do hardware, não do processo.
            _c, apple = roda(["sysctl", "-n", "hw.optional.arm64"], 5)
            arm = (apple or "").strip() == "1" or platform.machine() in ("arm64", "aarch64")
            maquina = "arm64 (Apple Silicon)" if arm else platform.machine()
            itens.append({
                "estado": "risco",
                "titulo": ("o terraform desta máquina não roda o provider da AWS"
                           if ARQ_ERRADA.search(saida)
                           else "não deu para conferir %s" % os.path.basename(base)),
                "onde": "sua máquina", "porque": saida[-400:], "fonte": "terraform validate",
                "conserto": (["Seu terraform é x86 e a máquina é %s: o provider baixa "
                              "para a arquitetura errada." % maquina,
                              "Instale o terraform nativo: `arch -arm64 brew install terraform`.",
                              "Apague ~/.bioma/validador e rode a revisão de novo."]
                             if (ARQ_ERRADA.search(saida) and arm)
                             else ["Apague ~/.bioma/validador e rode a revisão de novo."])})
            # o ambiente é o mesmo para todas: insistir nas outras receitas só
            # gastaria um timeout por receita, e o motivo já está dito
            break
        else:
            itens.append({"estado": "falha", "titulo": "a receita %s não compila" % os.path.basename(base),
                          "onde": nome, "porque": saida[-600:], "fonte": "terraform validate",
                          "conserto": ["Leia o erro acima: ele diz o argumento e a linha.",
                                       "Responda o campo na tela, ou ajuste a peça no desenho."]})

    if len(receitas) > len(alvos):
        itens.append({"estado": "risco", "fonte": "terraform validate",
                      "titulo": "a revisão conferiu %d das %d receitas" % (len(alvos), len(receitas)),
                      "onde": "a árvore inteira",
                      "porque": "o teto existe para a revisão não virar espera longa.",
                      "conserto": ["Rode `terraform validate` nas receitas restantes pelo terminal."]})
    return itens

    primeira = alvos[0]
    cod, saida = roda([tf, "init", "-backend=false", "-input=false", "-no-color"],
                      300, cwd=primeira, env=amb)
    if cod != 0:
        itens.append({
            "estado": "risco" if SEM_PROVIDER.search(saida) else "falha",
            "titulo": "não deu para preparar o terraform",
            "onde": os.path.relpath(primeira, pasta), "porque": saida[-500:],
            "fonte": "terraform init",
            "conserto": ["Confira a conexão com a internet ou o proxy.",
                         "Rode a revisão de novo: o provider fica em cache."]})
        return itens

    def confere(base):
        """Só o validate: o provider já veio no init da primeira receita."""
        nome = os.path.relpath(base, pasta)
        if base != primeira:
            # cópia preservando os links internos: o .terraform aponta para o
            # binário no cache, e symlink da pasta inteira faz o terraform
            # recusar o plugin por permissão
            fonte = os.path.join(primeira, ".terraform")
            alvo = os.path.join(base, ".terraform")
            if os.path.isdir(fonte) and not os.path.exists(alvo):
                try:
                    shutil.copytree(fonte, alvo, symlinks=True)
                except OSError:
                    pass
            lock = os.path.join(primeira, ".terraform.lock.hcl")
            if os.path.exists(lock):
                try:
                    shutil.copyfile(lock, os.path.join(base, ".terraform.lock.hcl"))
                except OSError:
                    pass
        cod, saida = roda([tf, "validate", "-no-color"], 120, cwd=base, env=amb)
        if cod == 0:
            return {"estado": "ok", "titulo": "a receita %s compila" % os.path.basename(base),
                    "onde": nome, "fonte": "terraform validate",
                    "porque": "terraform validate passou: os blocos existem no provider e os tipos batem.",
                    "conserto": []}
        if SEM_PROVIDER.search(saida):
            return {"estado": "risco",
                    "titulo": "não deu para conferir %s: o provider da AWS não veio" % os.path.basename(base),
                    "onde": nome, "porque": saida[-500:], "fonte": "terraform validate",
                    "conserto": ["Confira a conexão com a internet ou o proxy.",
                                 "Rode a revisão de novo: o provider fica em cache."]}
        return {"estado": "falha", "titulo": "a receita %s não compila" % os.path.basename(base),
                "onde": nome, "porque": saida[-600:], "fonte": "terraform validate",
                "conserto": ["Leia o erro acima: ele diz o argumento e a linha.",
                             "Responda o campo na tela, ou ajuste a peça no desenho."]}

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        itens += list(pool.map(confere, alvos))
    if len(receitas) > len(alvos):
        itens.append({"estado": "risco", "fonte": "terraform validate",
                      "titulo": "a revisão conferiu %d das %d receitas" % (len(alvos), len(receitas)),
                      "onde": "a árvore inteira",
                      "porque": "o teto existe para a revisão não virar espera longa.",
                      "conserto": ["Rode `terraform validate` nas receitas restantes pelo terminal."]})
    return itens


def revisao_do_modelo(pasta, arquivos):
    """O parecer do especialista. Sem chave, o revisor segue só com o local."""
    chave = chave_llm()
    if not chave:
        return [], "sem chave de modelo: o parecer de especialista ficou de fora"
    import urllib.request as _u
    # o revisor lê o que decide arquitetura: os recursos e as células. O
    # versions.tf é igual em toda receita, e variables/outputs saem do próprio
    # main. Mandar tudo triplicava o tempo de resposta sem mudar o parecer.
    def interessa(c):
        if c.endswith("versions.tf"):
            return False
        return c.endswith(("main.tf", "terragrunt.hcl")) or "/ligacoes/" in c

    pedaços, total = [], 0
    for c in sorted(arquivos):
        if not interessa(c):
            continue
        texto = arquivos[c]
        if total + len(texto) > 45000:
            break
        pedaços.append("### %s\n```\n%s\n```" % (c, texto))
        total += len(texto)
    corpo = json.dumps({
        "model": "gpt-4o",
        "max_tokens": 3000,
        "messages": [{"role": "user", "content": PEDIDO_REVISAO + "\n\n".join(pedaços)}],
    }).encode()
    req = _u.Request("https://api.openai.com/v1/chat/completions", data=corpo,
                     headers={"Content-Type": "application/json",
                              "Authorization": "Bearer " + chave})
    try:
        with _u.urlopen(req, timeout=240) as r:
            resp = json.load(r)
    except Exception as e:
        return [], "o modelo não respondeu: %s" % e
    texto = resp["choices"][0]["message"]["content"]
    m = re.search(r"\{.*\}", texto, re.S)
    if not m:
        return [], "o modelo respondeu fora do formato pedido"
    try:
        d = json.loads(m.group(0))
    except Exception:
        return [], "o modelo respondeu um JSON inválido"
    itens = []
    for i in (d.get("itens") or []):
        estado = (i.get("estado") or "").strip().lower()
        itens.append({
            "estado": estado if estado in ("ok", "falha", "risco") else "risco",
            "titulo": (i.get("titulo") or "").strip(),
            "onde": (i.get("onde") or "").strip(),
            "porque": (i.get("porque") or "").strip(),
            "conserto": [str(p) for p in (i.get("conserto") or [])],
            "fonte": "revisão de especialista",
        })
    return itens, ""


def revisar(corpo):
    """Junta o que a máquina prova e o que o especialista aponta."""
    pasta = corpo.get("pasta")
    arquivos = {}
    if not pasta and corpo.get("grafo"):
        gerado = gerar(corpo["grafo"])
        if gerado.get("erro"):
            return {"erro": gerado["erro"], "itens": []}
        pasta, arquivos = gerado.get("pasta"), gerado.get("arquivos") or {}
    if not pasta or not os.path.isdir(pasta):
        return {"erro": "sem árvore para revisar: mande pasta ou grafo", "itens": []}
    if not arquivos:
        for base, _d, arqs in os.walk(pasta):
            for a in arqs:
                c = os.path.join(base, a)
                try:
                    arquivos[os.path.relpath(c, pasta)] = io.open(c, encoding="utf-8").read()
                except Exception:
                    pass
    prepara_arvore(pasta)
    # as duas fontes rodam juntas: o terraform compila enquanto o revisor lê
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        f_local = pool.submit(revisao_local, pasta)
        f_modelo = pool.submit(revisao_do_modelo, pasta, arquivos)
        itens = f_local.result()
        doModelo, recado = f_modelo.result()
    itens += doModelo
    return {"pasta": pasta, "itens": itens, "recado": recado,
            "resumo": {
                "ok": sum(1 for i in itens if i["estado"] == "ok"),
                "falha": sum(1 for i in itens if i["estado"] == "falha"),
                "risco": sum(1 for i in itens if i["estado"] == "risco"),
            }}


# ── /rodar: o comando, à vista ────────────────────────────────────────────

ACOES = {"plan": ["--plan"], "aplicar": [], "destruir": ["--destruir"]}


def prepara_arvore(pasta):
    """Deixa a árvore da tela pronta para o verificações do comando.

    O verificador de durabilidade lê `inventario.json` na raiz. A tela sabe o
    tecido de cada receita (está no cabeçalho do main.tf), então o inventário
    sai da própria árvore e o gate roda de verdade em vez de ser pulado.
    """
    inv, _sem = inventario_da_arvore(pasta)
    io.open(os.path.join(pasta, "inventario.json"), "w", encoding="utf-8").write(
        json.dumps(inv, ensure_ascii=False, indent=2) + "\n")


def rodar(corpo):
    perfil = (corpo.get("perfil") or "").strip()
    acao = (corpo.get("acao") or "plan").strip()
    area = (corpo.get("area") or "").strip()
    janela = (corpo.get("janela") or "").strip()
    pasta = (corpo.get("pasta") or "").strip()

    if acao not in ACOES:
        return {"erro": "ação desconhecida: %s. Aceito: plan, aplicar, destruir" % acao,
                "comando": "", "saida": "", "codigo": None}
    if perfil != PERFIL_PERMITIDO:
        return {"erro": "nesta beta a tela dispara só o perfil local. Perfil pedido: %s"
                        % (perfil or "nenhum"),
                "comando": "", "saida": "", "codigo": None}
    if area and (area.startswith("/") or ".." in area.replace("\\", "/").split("/")):
        return {"erro": "área fora da árvore: %s" % area, "comando": "", "saida": "", "codigo": None}

    cmd = [os.path.join(RAIZ, "bioma.sh"), "--perfil", perfil]
    if area:
        cmd += ["--area", area]
    cmd += ACOES[acao]
    if acao == "destruir":
        cmd += ["--com-janela"]
    texto = " ".join(["./bioma.sh"] + cmd[1:])

    if acao == "destruir" and not janela:
        return {"erro": "destruir exige janela declarada. Escreva a janela combinada "
                        "(exemplo: 2026-08-06 22:00) e mande de novo. Nada cai por descuido.",
                "comando": texto, "saida": "", "codigo": None}
    if not os.path.exists(cmd[0]):
        return {"erro": "bioma.sh não está em %s" % RAIZ, "comando": texto,
                "saida": "", "codigo": None}

    caminho = os.pathsep.join([d for d in BINARIOS if os.path.isdir(d)] +
                              [os.environ.get("PATH", "")])
    ambiente = dict(os.environ, PATH=caminho)
    # o provider da AWS pesa 700 MB e cada célula baixaria o dele: sem cache
    # comum, o primeiro plano estoura o tempo antes de planejar coisa alguma
    ambiente.setdefault("TF_PLUGIN_CACHE_DIR", os.path.expanduser("~/.terraform.d/plugin-cache"))
    os.makedirs(ambiente["TF_PLUGIN_CACHE_DIR"], exist_ok=True)

    # a árvore da tela não mora em repositório nenhum: o comando é apontado
    # para ela, e os verificadores do verificações junto
    if pasta:
        if not os.path.isdir(pasta):
            return {"erro": "árvore não existe: %s" % pasta, "comando": texto,
                    "saida": "", "codigo": None}
        prepara_arvore(pasta)
        ambiente.update(BIOMA_INFRA=pasta, BIOMA_RAIZ=pasta,
                        BIOMA_CATALOGO=os.path.join(pasta, "catalogo"))

    limite = int(corpo.get("tempo") or 900)
    rc, saida = roda(["bash"] + cmd, limite, cwd=RAIZ, env=ambiente)
    return {"comando": texto, "saida": saida[-20000:], "codigo": rc,
            "janela": janela, "perfil": perfil, "acao": acao,
            "pasta": pasta, "tempo_limite": limite}


# ── HTTP ──────────────────────────────────────────────────────────────────

def parte_do_multipart(corpo, tipo_conteudo):
    """O primeiro arquivo do multipart, com o nome que veio no filename."""
    m = re.search(r'boundary="?([^";]+)"?', tipo_conteudo)
    if not m:
        return None, None
    sep = b"--" + m.group(1).encode("utf-8")
    for pedaco in corpo.split(sep):
        if b"\r\n\r\n" not in pedaco:
            continue
        cabeca, dados = pedaco.split(b"\r\n\r\n", 1)
        achado = re.search(rb'filename="([^"]*)"', cabeca)
        if not achado or not achado.group(1):
            continue
        if dados.endswith(b"\r\n"):
            dados = dados[:-2]
        return achado.group(1).decode("utf-8", "replace"), dados
    return None, None



def _arvore_do_grafo(grafo):
    """Gera a árvore e devolve (pasta, arquivos). Reaproveita o caminho normal."""
    r = gerar(grafo)
    if r.get("erro"):
        return None, r
    return r.get("pasta"), r


def zipar(pasta):
    """A árvore inteira num zip, em memória."""
    import io as _io, zipfile
    buf = _io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for base, _d, arqs in os.walk(pasta):
            for a in arqs:
                c = os.path.join(base, a)
                z.write(c, os.path.join("bioma", os.path.relpath(c, pasta)))
    return buf.getvalue()


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


def confere_antes_de_entregar(pasta):
    """Roda a conferência do provider antes de a árvore sair daqui.

    Enquanto se desenha, a tela responde em segundos e a conferência não cabe:
    ela roda o validate por receita e leva minutos. No momento de levar para a
    máquina, ela cabe, e é o último lugar onde ainda dá para escrever a queixa
    do provider dentro do arquivo em vez de deixar a surpresa para o apply.
    """
    r = subprocess.run([sys.executable, os.path.join(FERR, "gerar_iac.py"),
                        "--so-conferir", pasta], capture_output=True, text=True,
                       env=dict(os.environ, IAC_ESQUEMA_AWS=ESQUEMA))
    saida = (r.stdout or "") + (r.stderr or "")
    m = re.search(r"conferência: (\d+) de (\d+)", saida)
    if m:
        return {"aceitas": int(m.group(1)), "receitas": int(m.group(2))}
    if "conferência pulada" in saida:
        return {"pulada": saida.strip().splitlines()[0]}
    return {}


def materializar(pasta, destino):
    """Escreve a árvore numa pasta da máquina de quem usa.

    Recusa destino que já tenha conteúdo: sobrescrever trabalho alheio é o
    tipo de acidente que não se desfaz.
    """
    import shutil
    destino = os.path.abspath(os.path.expanduser(destino))
    if os.path.exists(destino) and os.listdir(destino):
        return {"erro": "a pasta %s já tem conteúdo. Escolha uma vazia ou outra." % destino}
    os.makedirs(destino, exist_ok=True)
    escritos = []
    for base, _d, arqs in os.walk(pasta):
        for a in arqs:
            c = os.path.join(base, a)
            alvo = os.path.join(destino, os.path.relpath(c, pasta))
            os.makedirs(os.path.dirname(alvo), exist_ok=True)
            shutil.copy2(c, alvo)
            escritos.append(os.path.relpath(alvo, destino))
    return {"destino": destino, "arquivos": sorted(escritos), "quantos": len(escritos)}


# ── as contas cadastradas ─────────────────────────────────────────────────

# conta AWS tem 12 dígitos, sem hífen, e é o que não se repete no cadastro
CONTA_12 = re.compile(r"^[0-9]{12}$")


def le_contas():
    """A lista de tela/contas.json. Arquivo que não existe nasce vazio aqui.

    Nasce no disco em vez de só devolver [] porque a pessoa que abre a pasta
    procurando onde as contas moram precisa achar o arquivo.
    """
    if not os.path.exists(CONTAS):
        io.open(CONTAS, "w", encoding="utf-8").write("[]\n")
        return []
    try:
        dado = json.loads(io.open(CONTAS, encoding="utf-8").read() or "[]")
    except ValueError:
        return []
    return dado if isinstance(dado, list) else []


def importa_contas(corpo):
    """A lista de contas vem do mapa de uma instância, em vez da digitação.

    Substitui a lista inteira e diz isso na resposta: metade importada e metade
    digitada seria pior que as duas listas separadas.
    """
    from contas_do_live import contas_do_live

    lista, erro = contas_do_live((corpo or {}).get("caminho") or "")
    if erro:
        return {"erro": erro}
    limpa, erro = grava_contas(lista)
    if erro:
        return {"erro": erro}
    return {"contas": limpa, "total": len(limpa),
            "recado": "a lista anterior foi substituída pelas %d contas do mapa" % len(limpa)}


def confere_contas(bruto):
    """Devolve (lista limpa, erro). Erro em português, dizendo o que se aceita.

    O servidor confere por conta própria: a gaveta já barra o formato errado,
    e um POST de fora do navegador não passa por ela.
    """
    if not isinstance(bruto, list):
        return None, "a lista de contas precisa ser um array JSON"

    limpa, vistos = [], set()
    for i, c in enumerate(bruto):
        if not isinstance(c, dict):
            return None, "a conta na posição %d não é um objeto" % (i + 1)
        numero = str(c.get("numero") or "").strip()
        apelido = str(c.get("apelido") or "").strip()
        if not CONTA_12.match(numero):
            return None, ('"%s" não entra como número de conta. Aceita exatamente '
                          "12 dígitos, só números. Exemplo: 111111111111" % numero)
        if numero in vistos:
            return None, "a conta %s aparece duas vezes na lista" % numero
        if not apelido:
            return None, ("a conta %s está sem apelido, e é o apelido que rotula "
                          "a caixa no canvas" % numero)
        vistos.add(numero)
        limpa.append({
            "apelido": apelido,
            "numero": numero,
            "area": str(c.get("area") or "").strip(),
            "padrao": bool(c.get("padrao")),
        })

    # uma padrão só: a primeira marcada vence, e lista sem marca promove a primeira
    padroes = [c for c in limpa if c["padrao"]]
    escolhida = padroes[0]["numero"] if padroes else (limpa[0]["numero"] if limpa else None)
    for c in limpa:
        c["padrao"] = c["numero"] == escolhida
    return limpa, None


# Duas gravações do cadastro na mesma hora deixam o arquivo pela metade.
_trava_contas = threading.Lock()


def grava_contas(bruto):
    limpa, erro = confere_contas(bruto)
    if erro:
        return None, erro
    with _trava_contas:
        io.open(CONTAS, "w", encoding="utf-8").write(
            json.dumps(limpa, ensure_ascii=False, indent=2) + "\n")
    return limpa, None



PROJETO = os.path.join(AQUI, "projeto.json")
# As áreas sugeridas. A arquitetura de referência é a maior delas; quem não
# precisa daquele tamanho começa pela simples e cresce depois.
# Conjuntos de partida. O valor é o caminho: ">" aninha filho sob pai, e o
# gerador espelha isso em pasta (docs/dominios-e-contas.md).
AREAS_SUGERIDAS = {
    "simples": [
        {"valor": "Aplicação", "rotulo": "Aplicação"},
        {"valor": "Dados", "rotulo": "Dados"},
        {"valor": "Segurança", "rotulo": "Segurança"},
    ],
    "plataforma": [
        {"valor": "Plataforma", "rotulo": "Plataforma"},
        {"valor": "Plataforma > Dados", "rotulo": "Plataforma > Dados"},
        {"valor": "Plataforma > Rede", "rotulo": "Plataforma > Rede"},
        {"valor": "Plataforma > Segurança", "rotulo": "Plataforma > Segurança"},
    ],
    "referencia": [
        {"valor": "Fundação", "rotulo": "Fundação"},
        {"valor": "Plataforma", "rotulo": "Plataforma"},
        {"valor": "Plataforma > Barramento", "rotulo": "Plataforma > Barramento"},
        {"valor": "Plataforma > Dados", "rotulo": "Plataforma > Dados"},
        {"valor": "Plataforma > Esteira", "rotulo": "Plataforma > Esteira"},
        {"valor": "Plataforma > Observabilidade", "rotulo": "Plataforma > Observabilidade"},
        {"valor": "Plataforma > Rede", "rotulo": "Plataforma > Rede"},
        {"valor": "Plataforma > Segurança", "rotulo": "Plataforma > Segurança"},
        {"valor": "Core Banking", "rotulo": "Core Banking"},
        {"valor": "Mesa de Crédito", "rotulo": "Mesa de Crédito"},
    ],
}

PROJETO_PADRAO = {
    "sigla": "",
    "areas": AREAS_SUGERIDAS["plataforma"],
    "pasta": "",
    "regiao_padrao": "sa-east-1",
    "regioes": ["sa-east-1", "us-east-1"],
    "padrao_nome": "{sigla}-{recurso}-{funcao}",
    "conta_por_area": {},
    # marca que o assistente já rodou; sem ela, começar um projeto abre o
    # assistente antes de qualquer desenho
    "assistente_feito": False,
}


REGIOES_AWS = [
    "us-east-1", "us-east-2", "us-west-1", "us-west-2", "sa-east-1",
    "ca-central-1", "eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1",
    "eu-north-1", "eu-south-1", "ap-northeast-1", "ap-northeast-2",
    "ap-northeast-3", "ap-southeast-1", "ap-southeast-2", "ap-southeast-3",
    "ap-south-1", "ap-east-1", "me-south-1", "af-south-1",
]


def listar_pastas(caminho):
    """As subpastas de um caminho, para o seletor de pasta de trabalho.

    O navegador não enxerga o disco de quem usa, e o servidor roda na mesma
    máquina: quem lista é ele. Só pasta, nunca arquivo, e nunca fora de casa.
    """
    casa = os.path.expanduser("~")
    alvo = os.path.abspath(os.path.expanduser(caminho or casa))
    if not (alvo == casa or alvo.startswith(casa + os.sep) or alvo.startswith("/tmp")):
        alvo = casa
    if not os.path.isdir(alvo):
        alvo = casa
    filhas = []
    try:
        for nome in sorted(os.listdir(alvo)):
            if nome.startswith("."):
                continue
            c = os.path.join(alvo, nome)
            if os.path.isdir(c):
                filhas.append({"nome": nome, "caminho": c})
    except PermissionError:
        pass
    pai = os.path.dirname(alvo)
    return {"caminho": alvo,
            "pai": pai if alvo != casa and (pai == casa or pai.startswith(casa)) else None,
            "pastas": filhas[:400]}


def ler_projeto():
    if not os.path.exists(PROJETO):
        return dict(PROJETO_PADRAO)
    try:
        d = json.load(io.open(PROJETO, encoding="utf-8"))
    except Exception:
        return dict(PROJETO_PADRAO)
    base = dict(PROJETO_PADRAO)
    base.update({k: v for k, v in d.items() if k in PROJETO_PADRAO})
    return base


def gravar_projeto(d):
    """Guarda as decisões que valem para o projeto inteiro.

    Elas existem para a pessoa responder uma vez em vez de responder por peça.
    Região fora da lista do projeto é recusada aqui, e não lá na frente.
    """
    novo = dict(PROJETO_PADRAO)
    novo.update({k: v for k, v in (d or {}).items() if k in PROJETO_PADRAO})
    regioes = [r.strip() for r in (novo.get("regioes") or []) if str(r).strip()]
    if not regioes:
        return {"erro": "declare ao menos uma região para o projeto"}
    if novo.get("regiao_padrao") not in regioes:
        return {"erro": "a região padrão precisa estar na lista de regiões do projeto"}
    if novo.get("pasta"):
        pasta = os.path.abspath(os.path.expanduser(novo["pasta"]))
        pai = os.path.dirname(pasta)
        if not os.path.isdir(pai):
            return {"erro": "a pasta de trabalho precisa estar dentro de uma pasta que existe: %s não existe" % pai}
        novo["pasta"] = pasta
    novo["regioes"] = regioes
    io.open(PROJETO, "w", encoding="utf-8").write(
        json.dumps(novo, ensure_ascii=False, indent=2) + "\n")
    return novo



RECENTES = os.path.join(AQUI, "recentes.json")


def _anota_recente(caminho):
    try:
        lista = json.load(io.open(RECENTES, encoding="utf-8")) if os.path.exists(RECENTES) else []
    except Exception:
        lista = []
    lista = [c for c in lista if c != caminho and os.path.exists(c)]
    lista.insert(0, caminho)
    io.open(RECENTES, "w", encoding="utf-8").write(json.dumps(lista[:5], ensure_ascii=False, indent=2) + "\n")


def salvar_bio(corpo):
    """O projeto inteiro num arquivo .bio: o desenho, a configuração e as contas.

    É JSON legível, para o Git tratar bem e para gente conseguir ler no diff.
    """
    nome = (corpo.get("nome") or "projeto").strip()
    pasta = (corpo.get("pasta") or ler_projeto().get("pasta") or "").strip()
    if not pasta:
        return {"erro": "configure a pasta de trabalho antes de salvar (configurações, aba projeto)"}
    pasta = os.path.abspath(os.path.expanduser(pasta))
    os.makedirs(pasta, exist_ok=True)
    caminho = os.path.join(pasta, re.sub(r"[^a-z0-9._-]+", "-", nome.lower()) + ".bio")
    conteudo = {
        "bioma": 1,
        "nome": nome,
        "prefixo": corpo.get("prefixo") or "",
        "grafo": corpo.get("grafo") or {},
        "config": ler_projeto(),
        "contas": le_contas(),
    }
    # A origem viaja de volta: um projeto lido de árvore sabe de onde veio e
    # como se executa (origem.comando), e salvar não pode apagar isso.
    if corpo.get("origem"):
        conteudo["origem"] = corpo["origem"]
    # A revisão dos linters é resultado de trabalho, e não se reconstrói
    # sozinha ao abrir: sem ela no arquivo, quem retoma o projeto vê zero
    # apontamento e conclui que está tudo certo, quando ninguém rodou nada.
    if corpo.get("revisao"):
        conteudo["revisao"] = corpo["revisao"]
    io.open(caminho, "w", encoding="utf-8").write(
        json.dumps(conteudo, ensure_ascii=False, indent=2) + "\n")
    _anota_recente(caminho)
    return {"caminho": caminho}


def abrir_bio(caminho):
    caminho = os.path.abspath(os.path.expanduser(caminho or ""))
    if not caminho.endswith(".bio") or not os.path.exists(caminho):
        return {"erro": "arquivo .bio não encontrado: %s" % caminho}
    try:
        d = json.load(io.open(caminho, encoding="utf-8"))
    except Exception as e:
        return {"erro": "não consegui ler o .bio: %s" % e}
    _anota_recente(caminho)
    # projeto salvo antes de OU e ambiente existirem abre igual, e diz quantos
    # nós esperam as duas. Assumir ambiente único seria decidir em silêncio.
    nos = (d.get("grafo") or {}).get("nos") or []
    sem = [n.get("servico") or n.get("id") for n in nos
           if not n.get("ou") or n.get("ambientes") is None]
    if sem:
        d["pendencias"] = {
            "sem_ou_ou_ambiente": len(sem),
            "quais": sem[:10],
            "recado": ("%d de %d peças esperam OU e ambiente. Nada foi suposto: "
                       "responda na ficha." % (len(sem), len(nos))),
        }
    return d


def listar_recentes():
    try:
        lista = json.load(io.open(RECENTES, encoding="utf-8")) if os.path.exists(RECENTES) else []
    except Exception:
        lista = []
    fora = []
    for c in lista:
        if not os.path.exists(c):
            continue
        org = ""
        try:
            org = (json.load(io.open(c, encoding="utf-8")).get("prefixo") or "").strip()
        except Exception:
            pass
        fora.append({"caminho": c, "nome": os.path.basename(c)[:-4], "organizacao": org})
    return fora[:5]


class Mao(BaseHTTPRequestHandler):
    def _resp(self, corpo, tipo="application/json", codigo=200, cabecalhos=None):
        b = corpo if isinstance(corpo, bytes) else corpo.encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", tipo + ("; charset=utf-8" if tipo.startswith("text") or
                                                 tipo == "application/json" else ""))
        self.send_header("Content-Length", str(len(b)))
        for k, v in (cabecalhos or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(b)

    def _json(self, dado, codigo=200):
        return self._resp(json.dumps(dado, ensure_ascii=False), "application/json", codigo)

    def _consulta(self):
        return urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)

    def _corpo(self):
        n = int(self.headers.get("Content-Length", 0) or 0)
        return self.rfile.read(n) if n else b""

    def do_GET(self):
        estatico = os.path.join(AQUI, "estatico")
        caminho = urllib.parse.urlparse(self.path).path
        if caminho in ("/", "/index.html"):
            alvo = os.path.join(estatico, "index.html")
            if not os.path.exists(alvo):
                return self._resp("<h1>tela não construída</h1><p>rode: cd tela/app && npm install && npm run build</p>", "text/html")
            return self._resp(io.open(alvo, encoding="utf-8").read(), "text/html")
        if caminho.startswith("/assets/"):
            alvo = os.path.normpath(os.path.join(estatico, caminho.lstrip("/")))
            if alvo.startswith(estatico) and os.path.exists(alvo):
                tipo = "text/css" if alvo.endswith(".css") else "application/javascript"
                return self._resp(io.open(alvo, "rb").read(), tipo)
        if caminho == "/icone":
            return self.icone()
        if caminho == "/exemplo":
            return self.exemplo()
        if caminho == "/recentes":
            return self._json(listar_recentes())
        if caminho == "/abrir":
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            return self._json(abrir_bio((q.get("caminho") or [""])[0]))
        if caminho == "/projeto":
            return self._json({**ler_projeto(), "areas_sugeridas": AREAS_SUGERIDAS,
                               "regioes_aws": REGIOES_AWS})
        if caminho == "/pastas":
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            return self._json(listar_pastas((q.get("caminho") or [""])[0]))
        if caminho == "/contas":
            return self._json(le_contas())
        if caminho == "/recursos":
            if (self._consulta().get("arvore") or [""])[0]:
                return self._json({"grupos": arvore_recursos()})
            q = (self._consulta().get("q") or [""])[0].lower().strip()
            todos = recursos()
            achados = [x for x in todos if q in x["tipo"]] if q else todos[:40]
            return self._json({"total": len(todos), "consulta": q,
                               "categorias": icones()["categorias"],
                               "itens": achados[:60]})
        self.send_response(404); self.end_headers()

    def exemplo(self):
        """Devolve um desenho de exemplos/ para a tela subir sozinha.

        A tela não lê disco. Sem esta rota, abrir um exemplo de verdade exigiria
        escolher o arquivo à mão, e o caminho do desenho subido ficaria sem
        prova automática.
        """
        pasta = os.path.join(RAIZ, "exemplos")
        nome = os.path.basename((self._consulta().get("nome") or [""])[0])
        if not nome:
            itens = sorted(os.listdir(pasta)) if os.path.isdir(pasta) else []
            return self._json({"pasta": "exemplos", "itens": itens})
        alvo = os.path.join(pasta, nome)
        if not os.path.exists(alvo) or not os.path.isfile(alvo):
            return self._json({"erro": "exemplo não existe: %s" % nome}, 404)
        return self._resp(io.open(alvo, "rb").read(), "text/plain")

    def icone(self):
        c = self._consulta()
        tipo = (c.get("tipo") or c.get("servico") or [""])[0]
        if tipo and not tipo.startswith("aws_"):
            tipo = tipo_do_servico(tipo) or tipo
        entrada = casa_prefixo(tipo)
        alvo = caminho_do_icone(tipo)
        if not alvo:
            return self._resp(PIXEL, "image/png", 200,
                              {"X-Bioma-Icone": "ausente", "Cache-Control": "no-store"})
        dados = io.open(alvo, "rb").read()
        etiqueta = '"%s-%d"' % (entrada["icone"].replace("/", "-"), len(dados))
        if self.headers.get("If-None-Match") == etiqueta:
            self.send_response(304); self.end_headers(); return
        return self._resp(dados, "image/png", 200,
                          {"Cache-Control": "public, max-age=604800",
                           "ETag": etiqueta,
                           "X-Bioma-Icone": entrada["icone"],
                           "X-Bioma-Categoria": urllib.parse.quote(entrada["categoria"])})

    def handle_one_request(self):
        """Falha de rota vira resposta, não conexão cortada.

        Sem isto, um erro dentro de uma rota derruba a conexão e o navegador
        mostra "o servidor não respondeu", que esconde o que aconteceu de
        verdade. O traço fica no terminal de quem subiu a tela.
        """
        try:
            BaseHTTPRequestHandler.handle_one_request(self)
        except (BrokenPipeError, ConnectionResetError):
            self.close_connection = True
        except Exception:
            import traceback
            traceback.print_exc()
            try:
                self._json({"erro": "a rota %s falhou; o traço está no terminal do servidor"
                                    % self.path}, 500)
            except Exception:
                self.close_connection = True

    def _rota_baixar(self, grafo):
        pasta, r = _arvore_do_grafo(grafo)
        if pasta is None:
            return self._resp(json.dumps(r, ensure_ascii=False))
        # erro de diagnóstico impede a entrega: o que sairia não é estrutura
        # válida, e entregar assim empurra o problema para quem recebe
        diag = diagnostica_desenho(os.path.join(os.path.dirname(pasta), "proposta.json"), pasta)
        if not diag.get("pode_sair", True):
            return self._resp(json.dumps(
                {"erro": "o desenho tem %d erro(s); corrija antes de levar"
                         % diag["erros"], "diagnostico": diag}, ensure_ascii=False))
        # a árvore só sai daqui depois de o provider dizer o que recusa, e a
        # queixa dele vai escrita dentro do arquivo
        confere_antes_de_entregar(pasta)
        b = zipar(pasta)
        self.send_response(200)
        self.send_header("Content-Type", "application/zip")
        self.send_header("Content-Disposition", 'attachment; filename="bioma.zip"')
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def _rota_materializar(self, corpo):
        destino = (corpo.get("destino") or "").strip()
        if not destino:
            return self._resp(json.dumps({"erro": "diga em que pasta gravar"}, ensure_ascii=False))
        pasta, r = _arvore_do_grafo(corpo.get("grafo") or {})
        if pasta is None:
            return self._resp(json.dumps(r, ensure_ascii=False))
        diag = diagnostica_desenho(os.path.join(os.path.dirname(pasta), "proposta.json"), pasta)
        if not diag.get("pode_sair", True):
            return self._resp(json.dumps(
                {"erro": "o desenho tem %d erro(s); corrija antes de gravar"
                         % diag["erros"], "diagnostico": diag}, ensure_ascii=False))
        conferencia = confere_antes_de_entregar(pasta)
        saida = materializar(pasta, destino)
        if isinstance(saida, dict) and conferencia:
            saida["conferencia"] = conferencia
        return self._resp(json.dumps(saida, ensure_ascii=False))

    def do_POST(self):
        caminho = urllib.parse.urlparse(self.path).path
        if caminho == "/subir":
            bruto = self._corpo()
            tipo_conteudo = self.headers.get("Content-Type", "") or ""
            nome, dados = (None, None)
            if tipo_conteudo.startswith("multipart/form-data"):
                nome, dados = parte_do_multipart(bruto, tipo_conteudo)
            if dados is None:
                nome, dados = (self.headers.get("X-Nome") or "arquivo"), bruto
            # o cabeçalho pede a visão mesmo quando existe especificação irmã:
            # é assim que se testa a leitura de imagem de propósito
            forcar = (self.headers.get("X-Forcar-Visao") or "").strip() == "1"
            return self._json(subir(nome, dados, forcar))
        if caminho == "/salvar":
            return self._json(salvar_bio(json.loads(self._corpo() or b"{}")))
        if caminho == "/projeto":
            # a resposta carrega o mesmo extra do GET: sem ele, salvar uma vez
            # apagava os conjuntos sugeridos e a lista de regiões da tela
            salvo = gravar_projeto(json.loads(self._corpo() or b"{}"))
            if "erro" in salvo:
                return self._json(salvo)
            return self._json({**salvo, "areas_sugeridas": AREAS_SUGERIDAS,
                               "regioes_aws": REGIOES_AWS})
        if caminho == "/baixar":
            return self._rota_baixar(json.loads(self._corpo() or b"{}").get("grafo") or {})
        if caminho == "/materializar":
            return self._rota_materializar(json.loads(self._corpo() or b"{}"))
        if caminho == "/contas/importar":
            return self._json(importa_contas(json.loads(self._corpo() or b"{}")))
        if caminho == "/contas":
            try:
                bruto = json.loads(self._corpo() or b"[]")
            except ValueError as e:
                return self._json({"erro": "o corpo não é JSON: %s" % e}, 400)
            limpa, erro = grava_contas(bruto)
            if erro:
                return self._json({"erro": erro}, 400)
            return self._json(limpa)
        if caminho == "/revisar":
            return self._json(revisar(json.loads(self._corpo() or b"{}")))
        if caminho == "/diferenca":
            return self._json(diferenca(json.loads(self._corpo() or b"{}")))
        if caminho == "/pre-voo":
            return self._json(pre_voo(json.loads(self._corpo() or b"{}")))
        if caminho == "/rodar":
            return self._json(rodar(json.loads(self._corpo() or b"{}")))
        if caminho in ("/", "/gerar"):
            return self._json(gerar(json.loads(self._corpo() or b"{}")))
        return self._json({"erro": "rota desconhecida: %s" % caminho}, 404)

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    porta = int(os.environ.get("PORTA", 8000))
    print("bioma · tela em http://localhost:%d" % porta)
    if not os.path.exists(ESQUEMA):
        print("aviso: sem esquema do provider. Rode ferramentas/baixar_esquema.sh")
    if not os.path.isdir(icones()["raiz"]):
        print("aviso: sem os ícones oficiais em %s; a tela cai no genérico" % icones()["raiz"])
    # Uma linha por pedido. `plan` no perfil local leva minutos, e servidor de
    # linha única deixa a tela inteira parada enquanto ele roda: ícone, cadastro
    # de contas e zip param junto.
    servidor = ThreadingHTTPServer(("127.0.0.1", porta), Mao)
    servidor.daemon_threads = True
    servidor.serve_forever()
