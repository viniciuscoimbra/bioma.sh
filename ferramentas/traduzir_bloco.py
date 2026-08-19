#!/usr/bin/env python3
"""Traduz um documento de bloco na estrutura do catálogo atômico.

Entrada: o documento de decisão do bloco, que já carrega a especificação em
duas tabelas (Serviços e colocação, Arestas do fluxo) e uma lista (Pontos de
customização por instância). O poster do bloco desenha a mesma coisa e serve
de conferência visual.

Saída: a proposta de estrutura, com as unidades classificadas, as células do
live, as dependências e o que precisa de confirmação humana.

O tradutor separa o que ele decide sozinho do que ele apenas propõe:

  decidido   tipo da unidade, trilho e conta, quantidade de células,
             fronteira, dependência entre blocos
  proposto   agrupamento de serviços numa célula, durabilidade

Regra da casa: onde ele propõe, a razão vem escrita junto, e a pessoa confirma
ou corrige. Proposta sem razão não entra.

Uso: traduzir_bloco.py <caminho do bloco.md> [--saida <pasta>] [--convencoes <arquivo.json>]
"""
import io, json, os, re, sys, unicodedata

# ── zona declarada no bloco → trilho e conta do live ────────────────────────
# Nasce vazio de propósito. "Platform (dados) vira a conta de dados" é nome de
# uma instância, não regra da ferramenta: quem chumbasse isto aqui estaria
# decidindo a topologia de contas de todo mundo que usar o bioma. A instância
# declara o mapa em `zona_trilho` no arquivo de convenções; zona que ninguém
# mapeou vira trilho pelo próprio nome, logo abaixo.
ZONA_TRILHO = {}

# ── a zona parte em topo e OU: "Platform · Barramento" ─────────────────────
# O topo diz a natureza da OU, e a natureza diz quantos ambientes existem. Sem
# isto, "Platform · Barramento" casava com a chave "platform" do mapa acima e
# ia parar no trilho da observabilidade.
TOPO_NATUREZA = {
    "platform":       "capacidade",
    "workloads":      "workload",
    "security":       "fundacional",
    "infrastructure": "fundacional",
    "sandbox":        "fundacional",
    "management":     "fundacional",
}

# Quem hospeda OU filha é a zona que nomeia uma, e não uma lista fixa aqui: a
# zona `Security · CIAM` diz que Security tem filha, e a lista fixa dizia que
# não, colando o CIAM na conta de segurança enquanto a árvore aprovada lhe dá OU
# própria com duas contas.
#
# O que sobra para a instância declarar é o inverso: qual topo é **só**
# agrupador, ou seja, nunca hospeda conta mesmo quando aparece sozinho. Nasce
# vazio, porque a ferramenta não conhece a árvore de ninguém; sem a declaração,
# topo sozinho é a própria folha.
TOPOS_AGRUPADORES = set()

# A natureza de uma OU folha nem sempre é a do topo dela. `Platform · Barramento`
# herda capacidade e `Workloads · <domínio>` herda workload, mas
# `Security · CIAM` não é fundacional como Security: o CIAM tem dois ambientes,
# porque é carga, e Security é plano de controle. Quem sabe disso é a instância.
NATUREZA_POR_OU = {}

# a árvore aprovada: workload tem três contas, capacidade tem duas, conta
# fundacional não representa ambiente. Instância sobrescreve.
AMBIENTES_POR_NATUREZA = {
    "workload":    ["dev", "hml", "prd"],
    "capacidade":  ["nprd", "prd"],
    "fundacional": [],
    "agrupadora":  [],
}
# a cópia intocada do padrão, para `carrega_convencoes` poder voltar a ele em
# vez de acumular o que a instância anterior disse.
PADRAO_AMBIENTES = dict(AMBIENTES_POR_NATUREZA)
PADRAO_TOPO_NATUREZA = dict(TOPO_NATUREZA)

# O que está acima é padrão, não regra da ferramenta: quantos ambientes cada
# natureza tem é decisão de quem opera a instância. A instância sobrescreve por
# `--convencoes <arquivo.json>` ou pela variável BIOMA_CONVENCOES, e o que ela
# não disser continua valendo pelo padrão.
CONVENCOES = {
    "ambientes_por_natureza": AMBIENTES_POR_NATUREZA,
    "zona_trilho": {},          # zona declarada no bloco -> (trilho, conta)
    "apelidos_de_trilho": {},   # nome no catálogo -> nome do trilho na instância
    "topos_agrupadores": [],    # topo que nunca hospeda conta, mesmo sozinho
    "topo_natureza": {},        # topo -> natureza da OU, quando a instância discorda
    "natureza_por_ou": {},      # OU folha -> natureza, quando ela difere do topo
    "_origem": "padrão da ferramenta",
}


def carrega_convencoes(caminho=None):
    """Convenções da instância por cima do padrão da ferramenta."""
    caminho = caminho or os.environ.get("BIOMA_CONVENCOES") or ""
    if not caminho:
        return
    caminho = os.path.abspath(os.path.expanduser(caminho))
    if not os.path.isfile(caminho):
        print("não achei as convenções em %s" % caminho, file=sys.stderr)
        sys.exit(2)
    d = json.load(io.open(caminho, encoding="utf-8"))
    for chave in ("ambientes_por_natureza", "zona_trilho", "apelidos_de_trilho",
                  "topos_agrupadores", "topo_natureza", "natureza_por_ou"):
        if chave in d:
            CONVENCOES[chave] = d[chave]
    CONVENCOES["_origem"] = caminho
    # substituir, não acumular. Carregar as convenções de A e depois as de B
    # deixava viva a chave de A que B não menciona, e `CONVENCOES` (substituído)
    # divergia de `ZONA_TRILHO` (acumulado): dois mapas, duas respostas, para o
    # mesmo desenho. Quem carrega convenção nova está trocando de instância.
    if "ambientes_por_natureza" in d:
        AMBIENTES_POR_NATUREZA.clear()
        AMBIENTES_POR_NATUREZA.update(PADRAO_AMBIENTES)
        AMBIENTES_POR_NATUREZA.update(d["ambientes_por_natureza"])
        # o laço acima substituiu o valor declarado pelo pedaço cru do JSON, e
        # o mapa que a ferramenta usa é o mesclado. Dois mapas para a mesma
        # pergunta é o defeito que este bloco inteiro existe para não ter.
        CONVENCOES["ambientes_por_natureza"] = AMBIENTES_POR_NATUREZA
    if "zona_trilho" in d:
        # o JSON traz [trilho, conta]; o mapa interno usa tupla
        ZONA_TRILHO.clear()
        ZONA_TRILHO.update({k: tuple(v) for k, v in d["zona_trilho"].items()})
    if "topos_agrupadores" in d:
        TOPOS_AGRUPADORES.clear()
        TOPOS_AGRUPADORES.update(x.lower() for x in d["topos_agrupadores"])
        CONVENCOES["topos_agrupadores"] = sorted(TOPOS_AGRUPADORES)
    if "natureza_por_ou" in d:
        NATUREZA_POR_OU.clear()
        NATUREZA_POR_OU.update({k.lower(): v for k, v in d["natureza_por_ou"].items()})
        CONVENCOES["natureza_por_ou"] = NATUREZA_POR_OU
    if "topo_natureza" in d:
        TOPO_NATUREZA.clear()
        TOPO_NATUREZA.update(PADRAO_TOPO_NATUREZA)
        TOPO_NATUREZA.update({k.lower(): v for k, v in d["topo_natureza"].items()})
        CONVENCOES["topo_natureza"] = TOPO_NATUREZA

def zona_partida(zona):
    """(topo, ou) a partir da zona declarada no bloco.

    Devolve (None, None) quando a zona não usa a notação de topo e OU, e aí o
    mapa antigo decide, como antes.
    """
    pedacos = [p.strip() for p in limpo(zona).split("·") if p.strip()]
    if not pedacos:
        return None, None
    topo = pedacos[0].lower()
    if topo not in TOPO_NATUREZA:
        return None, None
    segundo = pedacos[1] if len(pedacos) > 1 else None
    # "Platform · VPC privada" não nomeia OU: o segundo pedaço é detalhe de rede
    if segundo and re.search(r"vpc|regional|rede|3 az|privada|saas", segundo, re.I):
        segundo = None
    # a zona que nomeia a segunda parte está nomeando a OU folha, seja qual for
    # o topo. Sem segunda parte, o topo é a folha, a menos que a instância o
    # tenha declarado agrupador.
    if segundo:
        return topo, segundo
    return (topo, None) if topo in TOPOS_AGRUPADORES else (topo, pedacos[0])


# ── serviço que guarda o que não volta igual (capítulo do tecido) ───────────
GUARDA_CONTEUDO = re.compile(
    r"\b(s3|glue|dynamodb|rds|aurora|kafka|msk|backup|secrets|kms|"
    r"iceberg|lake|athena|redshift|opensearch)\b", re.I)
CAMADA_BRUTA = re.compile(r"raw|bruto|trilha|evidência|evidencia|auditoria", re.I)


# ponta coletiva: o texto nomeia um conjunto, não uma peça. É o que faz a
# ligação ser 1:N no código do catálogo (contas_consumidoras, log_groups)
# enquanto o desenho a mostrava como par.
# O plural marca o conjunto nas duas línguas em que um desenho de infra é
# escrito: quem desenha em inglês ("all accounts") tem a mesma ligação 1:N que
# quem desenha em português, e a ferramenta não pode ver só uma delas.
COLETIVO = re.compile(
    r"^(todas?\b|todos\b|blocos?\b|dom[íi]nios\b|contas\b|consumidores\b|"
    r"as contas\b|os dom[íi]nios\b|cada\b|demais\b|"
    r"all\b|every\b|each\b|any\b|accounts\b|domains\b|consumers\b|"
    r"the accounts\b|other\b|remaining\b)", re.I)

# o conjunto também se escreve com o plural no fim, e aí a cabeça da frase é
# singular: "domain blocks", "consumer accounts". Casar só o começo perdia
# metade das pontas coletivas escritas em inglês.
PLURAL_NO_FIM = re.compile(
    r"\b(accounts|blocks|domains|consumers|services|teams|subscribers|"
    r"regions|environments|workloads|tenants|clusters|"
    r"contas|blocos|dom[íi]nios|consumidores|servi[çc]os|times|ambientes)\s*$",
    re.I)


def coletiva(texto):
    """A ponta nomeia um conjunto, e não uma peça."""
    t = limpo(texto).strip()
    return bool(COLETIVO.match(t) or PLURAL_NO_FIM.search(t))


def artefato_em_unidade(art, trilho):
    """A unidade de um artefato: entregue à esteira, nunca aplicado pelo comando.

    Uma função só, usada pelos dois caminhos (o catálogo e o documento que
    volta pela tela), porque duas cópias divergiriam e a natureza se perderia
    justamente na volta.
    """
    return {
        "servico": art["nome"],
        "nome": art["nome"],
        "papel": art.get("papel") or art.get("contexto") or "artefato da esteira",
        "zona": "artefato de %s" % (art.get("dono") or trilho or "plataforma"),
        "trilho": trilho,
        "por_que_trilho": ("o artefato segue o dono declarado no contrato dele "
                           "(%s), porque é a esteira desse dono que recebe os "
                           "arquivos" % (art.get("dono") or trilho or "plataforma")),
        "conta": None,
        "multiplicidade": "entregue à esteira",
        "ou": None, "natureza_ou": None, "ambientes": [],
        "por_que_ou": "artefato não mora em conta: ele é entregue à esteira",
        "tipo": "artefato",
        "por_que_esse_tipo": ("é entregue à esteira, e não aplicado pelo "
                              "comando: não vira célula no live"),
        "celulas": "nenhuma: artefato não vive no live",
        "durabilidade": None,
        "entrega": art.get("entrega") or [],
        "status_artefato": art.get("status"),
    }


# O dicionário de argumentos: a pergunta em português, o formato, e a sugestão
# de quem tem prática consagrada atrás. Ele é o mesmo que o gerador usa, para a
# peça do catálogo e a peça nascida do zero perguntarem igual.
def _dic_arg():
    caminho = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dicionario.json")
    try:
        return {k: v for k, v in json.load(io.open(caminho, encoding="utf-8")).items()
                if not k.startswith("_")}
    except (IOError, ValueError):
        return {}


DIC_ARG = _dic_arg()


# O que a receita do catálogo exige de quem a instancia. Sem isto a tela não
# tem campo nenhum para a peça que aponta receita, e quem desenha só descobre
# que `supernet` ou `cidr_inspecao` existem no apply, com "No value for
# required variable". A pergunta nasce da variável declarada, e não de
# adivinhação sobre o serviço.
# Duas formas escritas na mesma árvore: o bloco de várias linhas e o de uma
# linha (`variable "plano" { type = string }`). Só a primeira era lida, e a
# receita que declarava tudo em uma linha chegava à tela sem variável nenhuma,
# o que fazia o gerador sobrescrever com argumento de provider.
_VAR = re.compile(
    r'^variable\s+"([a-z0-9_]+)"\s*\{(.*?)^\}'          # várias linhas
    r'|^variable\s+"([a-z0-9_]+)"\s*\{([^\n}]*)\}',      # uma linha
    re.M | re.S)
_DEFAULT = re.compile(r'^\s*default\s*=', re.M)
_DESC = re.compile(r'^\s*description\s*=\s*"((?:[^"\\]|\\.)*)"', re.M)
# `variable "plano" { type = string }` cabe numa linha, e aí o fecha-chaves
# do bloco vem junto no tipo. Sai aqui, senão a tela mostra "string }".
_TIPO = re.compile(r'^\s*type\s*=\s*(.+?)\s*\}?\s*$', re.M)


def variaveis_da_receita(receita, raiz_catalogo=None):
    """As variáveis que a receita exige, com o que cada uma diz de si.

    Variável COM default não vira pergunta obrigatória: o framework herda o
    valor, e perguntar o que já tem resposta é o ruído que esta árvore recusa.
    Ela volta marcada como opcional, para a tela oferecer sem cobrar.
    """
    if not receita:
        return []
    raiz = raiz_catalogo or os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "catalogo")
    caminho = os.path.join(raiz, receita.replace("/", os.sep), "variables.tf")
    if not os.path.isfile(caminho):
        return []
    try:
        texto = io.open(caminho, encoding="utf-8").read()
    except (IOError, UnicodeDecodeError):
        return []
    fora = []
    achados = [(a or c, b or d) for a, b, c, d in _VAR.findall(texto)]
    for nome, corpo in achados:
        d = _DESC.search(corpo)
        ti = _TIPO.search(corpo)
        fora.append({
            "nome": nome,
            "obrigatoria": not _DEFAULT.search(corpo),
            "tipo": (ti.group(1).strip() if ti else "string"),
            "explica": (d.group(1) if d else ""),
        })
    return fora


# Variável que a árvore preenche sozinha não vira pergunta. Perguntar o id do
# hub ou o ARN da chave é pedir o que a célula recebe por `dependency`, e é
# exatamente a dependência disfarçada de pergunta que `fio.py` existe para
# achar.
DA_ARVORE = ("tgw_id", "vpc_id", "subnet_ids", "security_group_ids", "kms_key_arn",
             "ipam_pool_id", "cluster_arn", "role_arn", "bucket_arn", "zona_dns_id",
             "oidc_provider_arn", "registry_arn", "conta_alvo", "conta")


_OUT = re.compile(r'^output\s+"([a-z0-9_]+)"', re.M)


def saidas_da_receita(receita, raiz_catalogo=None):
    """O que a receita publica, para outra célula ler por `dependency`."""
    if not receita:
        return []
    raiz = raiz_catalogo or os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "catalogo")
    caminho = os.path.join(raiz, receita.replace("/", os.sep), "outputs.tf")
    if not os.path.isfile(caminho):
        return []
    try:
        return _OUT.findall(io.open(caminho, encoding="utf-8").read())
    except (IOError, UnicodeDecodeError):
        return []


# Uma variável que espera ARN, id ou lista de sub-rede quase sempre recebe isso
# de outra peça, e não de gente digitando. O casamento é por nome: quem publica
# `key_arn` serve a quem pede `kms_key_arn`, e o sufixo é o que carrega o
# sentido. Casar por semelhança de serviço seria o erro que gerou
# `aws_glue_crawler` para um balde; casar por nome de saída é o que a própria
# árvore já faz quando alguém escreve o `dependency` à mão.
def ligavel(nome_variavel, saida):
    v, s = nome_variavel.lower(), saida.lower()
    if v == s:
        return True
    for sufixo in ("_arn", "_id", "_ids", "_nome", "_name"):
        if v.endswith(sufixo) and s.endswith(sufixo):
            raiz_v, raiz_s = v[: -len(sufixo)], s[: -len(sufixo)]
            if raiz_v.endswith(raiz_s) or raiz_s.endswith(raiz_v):
                return True
    return False


def perguntas_da_receita(receita):
    """As variáveis da receita como pergunta, com o que o dicionário souber.

    O dicionário traz sugestão, formato e o que dói se errar para o argumento
    que tem prática consagrada atrás (as faixas de rede vêm das RFC 1918 e
    6598). O que ele não conhece vira pergunta simples, com a descrição da
    própria variável.
    """
    fora = []
    for v in variaveis_da_receita(receita):
        # A variável que a árvore preenche não é pergunta para digitar, e
        # também não é para sumir: ela é uma LIGAÇÃO esperando ser feita. Some
        # dela e quem desenha não descobre que o cluster precisa da VPC; vira
        # campo de texto e alguém cola um id à mão, que é pior. Ela sai marcada,
        # e quem monta a tela oferece as peças que servem.
        de_ligacao = v["nome"] in DA_ARVORE
        p = {"nome": v["nome"],
             "pergunta": ("De onde vem %s" if de_ligacao else "O valor de %s")
                         % v["nome"].replace("_", " "),
             "explica": v["explica"] or "o que a receita %s espera aqui" % receita,
             "obrigatoria": v["obrigatoria"],
             "de_ligacao": de_ligacao}
        verbete = DIC_ARG.get(v["nome"]) or DIC_ARG.get(v["nome"].split("_")[-1])
        if verbete:
            for campo in ("pergunta", "exemplo", "formato", "erra", "sugestoes", "por_que"):
                if verbete.get(campo):
                    p[campo] = verbete[campo]
            if v["explica"]:
                p["explica"] = v["explica"]
        fora.append(p)
    return fora


def artefatos_do_catalogo():
    """Os artefatos do catálogo, com dono e o que cada um entrega."""
    raiz = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                        "catalogo", "artefatos")
    fora = []
    if not os.path.isdir(raiz):
        return fora
    for nome in sorted(os.listdir(raiz)):
        contrato = os.path.join(raiz, nome, "contrato.json")
        if not os.path.isfile(contrato):
            continue
        try:
            fora.append(json.load(io.open(contrato, encoding="utf-8")))
        except ValueError:
            continue
    return fora


def celulas_da_tabela(txt, titulo):
    """Linhas de uma tabela markdown, como lista de listas."""
    m = re.search(r"## %s(.*?)\n## " % re.escape(titulo), txt, re.S)
    if not m:
        return []
    linhas = []
    for ln in m.group(1).split("\n"):
        if not ln.startswith("|") or re.match(r"^\|[-\s:|]+\|", ln):
            continue
        cel = [c.strip() for c in ln.split("|")[1:-1]]
        if cel and cel[0].lower() in ("serviço", "servico", "#"):
            continue
        linhas.append(cel)
    return linhas


def slug(s):
    """Nome de pasta a partir de texto humano: acento vira a letra sem acento.

    Sem a normalização, "Segurança" virava "seguran-a": o ç caía no [^a-z0-9]
    e deixava um buraco no meio do nome da pasta."""
    sem = unicodedata.normalize("NFKD", str(s or "")).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", sem.lower()).strip("-")


def limpo(s):
    return re.sub(r"\[\[|\]\]|\*\*", "", s).strip()


def apelido(servico):
    """Nome curto e estável da unidade, a partir do nome do serviço.

    O que está entre parênteses distingue duas peças do mesmo serviço: `AWS
    Lambda (ESM)` e `AWS Lambda (Consumer de DLT)` são caixas diferentes no
    desenho. Jogar o parêntese fora fazia as duas virarem `lambda`, e a segunda
    sobrescrevia a primeira na árvore, sem aviso.
    """
    s = limpo(servico).lower()
    s = re.sub(r"^(aws|amazon)\s+", "", s)
    miolo = re.search(r"\(([^)]+)\)", s)
    s = re.sub(r"\(.*?\)", "", s)
    base = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    if not miolo:
        return base
    detalhe = re.sub(r"[^a-z0-9]+", "-", miolo.group(1)).strip("-")
    # o detalhe entra curto: o nome vira pasta, e pasta longa atrapalha
    detalhe = "-".join(p for p in detalhe.split("-") if p not in ("de", "do", "da"))[:24]
    return ("%s-%s" % (base, detalhe)).strip("-") if detalhe else base


def traduz(caminho):
    txt = io.open(caminho, encoding="utf-8").read()
    bloco = os.path.basename(os.path.dirname(caminho))

    servicos = celulas_da_tabela(txt, "Serviços e colocação")
    arestas = celulas_da_tabela(txt, "Arestas (fluxo do diagrama)")
    custom = re.findall(r"^- (.+)$",
                        (re.search(r"## Pontos de customização por instância(.*?)\n## ", txt, re.S)
                         or re.match("", "")).group(1) if
                        re.search(r"## Pontos de customização por instância", txt) else "",
                        re.M)

    unidades, decisoes = [], []

    # o artefato que o tradutor mesmo escreveu, quando o documento volta pela
    # tela. Sem isto ele reentrava como serviço de nuvem, virava organismo e
    # ainda ganhava uma segunda cópia vinda do catálogo: a ida e a volta não
    # devolviam o mesmo desenho.
    do_catalogo = {a["nome"].lower(): a for a in artefatos_do_catalogo()}

    # ── R1 e R4: cada serviço vira uma unidade; a zona dá o trilho ──────────
    for linha in servicos:
        serv, papel, zona, mult, realiza, celula = (linha + [""] * 6)[:6]
        z = limpo(zona).lower()
        if z.startswith("artefato de"):
            unidades.append(artefato_em_unidade(
                do_catalogo.get(limpo(serv).lower(), {"nome": limpo(serv)}),
                slug(z.split("artefato de", 1)[-1].strip().split("/")[-1])
                or "plataforma"))
            continue
        topo, ou = zona_partida(zona)
        if topo:
            # a zona nomeou a OU folha, ou não nomeou e o topo é agrupador
            filha = ou is not None
            natureza = ("agrupadora" if not filha and topo in TOPOS_AGRUPADORES else
                        NATUREZA_POR_OU.get((ou or "").lower(), TOPO_NATUREZA[topo]))
            trilho = slug(ou) if ou else slug(topo)
            # OU agrupadora não hospeda conta: quem hospeda é a folha. Deixar a
            # conta em branco aqui é o que faz a ficha perguntar em vez de a
            # ferramenta inventar um lugar.
            conta = (None if natureza == "agrupadora" else
                     "conta de %s" % ou.lower() if filha and ou else
                     "conta fundacional de %s" % topo)
        else:
            natureza, ou = None, None
            trilho, conta = next((v for k, v in ZONA_TRILHO.items() if z.startswith(k)),
                                 (None, None))
        veio_do_nome = False
        if topo is None and trilho is None and conta is None and not ("saas" in z):
            veio_do_nome = True
            # zona que o mapa não conhece é domínio do cliente: o nome dela
            # vira o trilho. "Domains (faturamento)" gera em faturamento/.
            # Domínio hierárquico ("Plataforma > Redes") vira pasta aninhada,
            # espelhando o modelo de domínios (docs/dominios-e-contas.md).
            if ">" in z:
                pedacos = [slug(p) for p in z.split(">")]
                trilho = "/".join(p for p in pedacos if p) or "dominio"
                cru = z.split(">")[-1].strip()
            else:
                miolo = re.search(r"\(([^)]+)\)", z)
                cru = (miolo.group(1) if miolo else z).strip()
                trilho = slug(cru) or "dominio"
            conta = "conta do domínio %s" % cru
        elif topo is None and conta is None:
            conta = "fora da nossa nuvem"
        eh_saas = "saas" in z
        # O caminho da célula, quando o desenho o conhece. Ele é o que a
        # instância tem no disco, e é por ele que a resposta certa encontra a
        # célula certa: sem isto, as 47 contas governadas desta árvore
        # dividiam um nome só e escreviam umas por cima das outras.
        onde_mora = limpo(celula).strip("/")
        u = {
            "servico": limpo(serv),
            "caminho": onde_mora or None,
            "nome": onde_mora.split("/")[-1] if onde_mora else apelido(serv),
            "papel": limpo(papel),
            "zona": limpo(zona),
            "trilho": trilho,
            "conta": conta,
            "multiplicidade": limpo(mult),
            "ou": ou,
            "natureza_ou": natureza,
            "ambientes": AMBIENTES_POR_NATUREZA.get(natureza or "", None),
            "por_que_ambientes": ("quantos ambientes esta natureza tem vem de %s"
                                  % CONVENCOES["_origem"]),
            "por_que_ou": ("%s é OU agrupadora e não recebe conta: diga qual OU "
                           "folha hospeda esta peça" % topo.capitalize()
                           if topo and natureza == "agrupadora" else
                           "a zona declara topo e OU (%s)" % limpo(zona) if topo else
                           "a zona não usa a notação de topo e OU: OU por confirmar"),
            "pendente_ou": bool(topo) and natureza == "agrupadora",
            # de onde saiu a pasta. Quando ninguém mapeou a zona, o trilho vem
            # do nome dela, e quem lê precisa saber que foi assim para poder
            # discordar: o mapa é convenção da instância, não regra fixa.
            # Cada origem tem a sua frase, e nenhuma cobre a do vizinho: razão
            # que descreve o caminho errado é pior que razão ausente, porque
            # quem lê acha que entendeu.
            "por_que_trilho": ("a zona %r não está no mapa de zonas desta "
                               "instância, então o trilho veio do nome dela. "
                               "Declare `zona_trilho` nas convenções para "
                               "mandar noutra pasta." % limpo(zona)
                               if veio_do_nome else
                               "a zona declara topo e OU (%s), e a OU dá a pasta"
                               % limpo(zona) if topo and ou else
                               "a zona declara só o topo (%s), sem nomear OU "
                               "folha: a pasta veio do topo, e a OU fica por "
                               "confirmar" % limpo(zona) if topo else
                               "a zona é SaaS: fora da nossa nuvem, sem pasta "
                               "no live" if eh_saas and trilho is None else
                               "o mapa de zonas de %s manda esta zona para %s"
                               % (CONVENCOES["_origem"], trilho)),
            # a quinta coluna diz qual decisão de arquitetura esta peça
            # cumpre. Sem ela, a especificação exportada volta sem rastro.
            # Vai crua, com o wikilink: o alvo do link é o rastro.
            "realiza": realiza.strip(),
            "tipo": "fronteira" if eh_saas else "organismo",
            "por_que_esse_tipo": ("o serviço é de terceiro. O bioma cria só a "
                                  "sua ponta da conexão, e o resto continua lá fora")
                                 if eh_saas else ("você cria e mantém este serviço, "
                                                  "e ele guarda dados"),
        }
        # ── R3: multiplicidade decide quantas células no live ──────────────
        if "×pr" in u["multiplicidade"].lower():
            # a stack de uma PR: nasce quando a PR abre, cai quando ela fecha,
            # e o estado dela nunca encosta no da infraestrutura permanente
            u["celulas"] = "uma por PR aberta"
            u["efemero_por_pr"] = True
        elif "×conta" in u["multiplicidade"] or "×conta" in u["zona"]:
            u["celulas"] = "uma por conta observada"
        elif "×" in u["multiplicidade"]:
            u["celulas"] = "uma por " + u["multiplicidade"].split("×")[-1]
        elif u.get("ambientes"):
            # a natureza da OU decide quantos ambientes existem, e é ela que
            # diz quantas células nascem. "uma por plano" valia para todo mundo
            # e entregava duas células até para workload, que tem três.
            u["celulas"] = "uma por ambiente (%s)" % ", ".join(u["ambientes"])
        elif u.get("natureza_ou") == "fundacional":
            u["celulas"] = "uma só: conta fundacional não representa ambiente"
        else:
            u["celulas"] = "uma por plano (nao-prod, prod)"

        # ── R7 (proposta): durabilidade pela pergunta do tecido ────────────
        if u.get("efemero_por_pr"):
            # a stack de uma PR cai por rotina: é para isso que ela existe.
            # Guardar dado nela seria guardar dado que some no merge.
            u["durabilidade"] = "efemera"
            u["por_que_durabilidade"] = ("existe enquanto a PR existir. Cai no "
                                         "fechamento, e nada aqui é para durar")
        elif u["tipo"] == "fronteira":
            u["durabilidade"] = None
        elif GUARDA_CONTEUDO.search(u["servico"]) and CAMADA_BRUTA.search(u["papel"]):
            u["durabilidade"] = "permanente"
            u["por_que_durabilidade"] = ("guarda evidência do passado. Refazer do "
                                         "zero traz outro conteúdo, porque a origem "
                                         "mudou desde então")
        elif GUARDA_CONTEUDO.search(u["servico"]):
            u["durabilidade"] = "permanente"
            u["por_que_durabilidade"] = ("guarda dado que só existe aqui. Se cair, "
                                         "não tem de onde trazer de volta")
        else:
            u["durabilidade"] = "estavel"
            u["por_que_durabilidade"] = ("pode ser recriado do zero: o que ele guarda "
                                         "volta igual pela receita. Ainda assim só cai "
                                         "com janela declarada")
            u["confirmar"] = ("regra geral. Confira contra o papel desta peça e mude "
                              "na ficha se for o caso")
        unidades.append(u)

    # ── artefato: o que a esteira recebe, e o desenho não mostrava ─────────
    # Artefato não é serviço da nuvem, então não está na tabela do bloco. Ele
    # vem do catálogo, pelo dono, e sem isto a área da esteira aparecia como
    # três caixas de IAM, sem os workflows que são a entrega dela.
    trilhos_no_recorte = {u["trilho"] for u in unidades if u.get("trilho")}
    ja_tem = {u["nome"].lower() for u in unidades}
    for art in artefatos_do_catalogo():
        if art["nome"].lower() in ja_tem:
            continue
        dono = (art.get("dono") or "").split("/")[-1]
        # o catálogo chama de `esteira` o que a instância pode chamar de
        # `devsecops`. O apelido é da instância, e não entra no contrato genérico.
        alvos = {dono, CONVENCOES["apelidos_de_trilho"].get(dono, dono)}
        if not (alvos & trilhos_no_recorte):
            continue
        unidades.append(artefato_em_unidade(art, sorted(alvos & trilhos_no_recorte)[0]))

    # ── R5 e R6: as arestas viram fronteira, ligação ou dependência ────────
    # A coluna "cruza fronteira" do bloco marca limite de CONFIANÇA (o SaaS).
    # Travessia de CONTA é outra coisa, e o framework cobra ligação com
    # permissão dos dois lados nela. Ela se deriva das zonas dos dois pontos,
    # que a tabela de Serviços já declara.
    por_nome = {u["servico"].lower(): u for u in unidades}

    def onde(nome):
        n = limpo(nome).lower()
        for k, u in por_nome.items():
            if n in k or k in n:
                return u
        return None

    relacoes = []
    for a in arestas:
        num, origem, destino, flui, canal, cruza = (a + [""] * 6)[:6]
        o, d = limpo(origem), limpo(destino)
        cruza_l = limpo(cruza).lower()
        outro_bloco = re.match(r"^\d\d-", d) or re.match(r"^\d\d-", o)
        uo, ud = onde(o), onde(d)
        rel = {"n": num, "origem": o, "destino": d, "flui": limpo(flui),
               "canal": limpo(canal)}
        n_origem, n_destino = coletiva(o), coletiva(d)
        rel["cardinalidade"] = ("N:N" if n_origem and n_destino
                                else "1:N" if n_origem or n_destino else "1:1")
        rel["por_que_cardinalidade"] = (
            "as duas pontas nomeiam conjunto" if n_origem and n_destino
            else "a ponta %s nomeia um conjunto, não uma peça" % (o if n_origem else d)
            if n_origem or n_destino
            else "as duas pontas são peças nomeadas")
        if cruza_l.startswith("sim"):
            rel["vira"] = "fronteira"
            rel["por_que"] = "a aresta cruza limite de confiança: %s" % limpo(cruza)
        elif outro_bloco:
            rel["vira"] = "dependência entre blocos"
            rel["por_que"] = ("aponta outro bloco: resolve por hormônio publicado, "
                              "nunca por leitura direta do outro trilho")
        elif uo is None or ud is None:
            # ponta fora da tabela de Serviços (tipicamente "blocos de domínio"):
            # a origem mora em toda conta observada, então a aresta atravessa conta
            rel["vira"] = "ligação"
            rel["por_que"] = ("uma das pontas não é serviço deste bloco e mora em "
                              "outra conta: a ponta de cá nasce onde a permissão existe")
            rel["dono"] = (ud or uo or {}).get("trilho")
        elif uo["trilho"] != ud["trilho"]:
            rel["vira"] = "ligação"
            rel["por_que"] = ("origem e destino em trilhos diferentes (%s e %s): "
                              "donos distintos pedem permissão dos dois lados"
                              % (uo["trilho"], ud["trilho"]))
            rel["dono"] = ud["trilho"]
        elif uo["celulas"] != ud["celulas"]:
            rel["vira"] = "ligação"
            rel["por_que"] = ("mesma família e alcances diferentes (%s contra %s): "
                              "a aresta atravessa conta dentro do mesmo trilho"
                              % (uo["celulas"], ud["celulas"]))
            rel["dono"] = ud["trilho"]
        else:
            rel["vira"] = "aresta interna"
            rel["por_que"] = "origem e destino no mesmo trilho e no mesmo alcance"
        relacoes.append(rel)

    # ── R2 (proposta): agrupamento em célula ───────────────────────────────
    # serviços do mesmo trilho, mesma multiplicidade e ligados por aresta
    # interna são candidatos a nascer e morrer juntos.
    grupos = {}
    for u in unidades:
        if u["tipo"] != "organismo":
            continue
        chave = (u["trilho"], u["celulas"])
        grupos.setdefault(chave, []).append(u["nome"])

    return {
        "bloco": bloco,
        "origem": os.path.relpath(caminho, os.path.dirname(os.path.dirname(
            os.path.dirname(os.path.abspath(caminho))))),
        "unidades": unidades,
        "relacoes": relacoes,
        "grupos_candidatos": [{"trilho": k[0], "celulas": k[1], "servicos": v,
                               "confirmar": "nascem e morrem juntos?"}
                              for k, v in grupos.items()],
        "pecas_que_se_trocam": [limpo(c) for c in custom],
    }


def compara(antes, agora):
    """O que mudou entre duas traduções do mesmo bloco.

    É o modo que responde a pergunta do incremental: rodar de novo depois de a
    especificação mudar não pode virar destruição silenciosa.
    """
    ua = {u["nome"]: u for u in antes["unidades"]}
    ug = {u["nome"]: u for u in agora["unidades"]}
    nasceu = sorted(set(ug) - set(ua))
    sumiu = sorted(set(ua) - set(ug))
    mudou = [n for n in sorted(set(ua) & set(ug))
             if (ua[n]["trilho"], ua[n]["celulas"], ua[n].get("durabilidade")) !=
                (ug[n]["trilho"], ug[n]["celulas"], ug[n].get("durabilidade"))]
    ra = {r["n"]: r["vira"] for r in antes["relacoes"]}
    rg = {r["n"]: r["vira"] for r in agora["relacoes"]}
    relacoes = [(n, ra.get(n), rg[n]) for n in rg if ra.get(n) not in (None, rg[n])]

    perigo = [n for n in sumiu if (ua[n].get("durabilidade") == "permanente")]
    return {"nasceu": nasceu, "sumiu": sumiu, "mudou": mudou,
            "relacoes_reclassificadas": relacoes, "perigo": perigo}


def main():
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        sys.exit(2)
    carrega_convencoes(sys.argv[sys.argv.index("--convencoes") + 1]
                       if "--convencoes" in sys.argv else None)
    r = traduz(sys.argv[1])

    if "--contra" in sys.argv:
        antes = json.load(io.open(sys.argv[sys.argv.index("--contra") + 1], encoding="utf-8"))
        d = compara(antes, r)
        print("== o que mudou desde a tradução anterior ==")
        print("  nasceu:  %s" % (", ".join(d["nasceu"]) or "nada"))
        print("  sumiu:   %s" % (", ".join(d["sumiu"]) or "nada"))
        print("  mudou:   %s" % (", ".join(d["mudou"]) or "nada"))
        for n, a, g in d["relacoes_reclassificadas"]:
            print("  aresta %s: %s passou a %s" % (n, a, g))
        if d["perigo"]:
            print("\nPARE. Unidade permanente saiu da especificação: %s"
                  % ", ".join(d["perigo"]))
            print("Permanente que some do papel não vira destroy por rotina. Ou a")
            print("remoção é intencional e passa por decisão registrada, ou a")
            print("especificação está errada. O tradutor não escolhe por você.")
            sys.exit(1)
        sys.exit(0)
    saida = None
    if "--saida" in sys.argv:
        saida = sys.argv[sys.argv.index("--saida") + 1]
        os.makedirs(saida, exist_ok=True)
        io.open(os.path.join(saida, "proposta.json"), "w", encoding="utf-8").write(
            json.dumps(r, ensure_ascii=False, indent=2) + "\n")

    print("bloco: %s" % r["bloco"])
    print("\n== unidades (%d) ==" % len(r["unidades"]))
    for u in r["unidades"]:
        dur = u.get("durabilidade") or "n/a"
        print("  %-22s %-10s %-16s %-11s %s"
              % (u["nome"], u["tipo"], u["trilho"] or "fora", dur, u["celulas"]))
    print("\n== relações (%d) ==" % len(r["relacoes"]))
    for x in r["relacoes"]:
        print("  %s. %-28s → %-28s %s" % (x["n"], x["origem"][:28], x["destino"][:28], x["vira"]))
    print("\n== a confirmar ==")
    for g in r["grupos_candidatos"]:
        print("  agrupar em uma célula? %s · %s" % (g["trilho"], ", ".join(g["servicos"])))
    for u in r["unidades"]:
        if u.get("confirmar"):
            print("  %s: %s" % (u["nome"], u["confirmar"]))
    if saida:
        print("\nproposta em %s/proposta.json" % saida)


if __name__ == "__main__":
    main()
