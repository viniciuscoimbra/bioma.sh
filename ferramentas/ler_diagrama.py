#!/usr/bin/env python3
"""Lê um diagrama e devolve o grafo que a tela desenha.

Entrada: a especificação em markdown, o desenho em drawio ou xml do mxGraph,
ou um grafo já pronto em json. Saída: o dicionário que a rota /subir devolve.

    ler(caminho) -> {
        "lido": bool,
        "grafo": {"nos": [...], "arestas": [...]},
        "nao_reconhecido": [{"texto", "onde", "motivo", "candidatos"}],
        "porque": "texto em português"
    }

O nó carrega o que o contrato da tela pede: id, tipo, servico, papel, zona,
conta, regiao, multiplicidade, x, y, valores. A aresta carrega de, para, flui
e canal.

Regra da casa: adivinhar recurso errado é pior do que devolver a lista. O tipo
do provider só sai daqui quando o ícone oficial da AWS diz qual é, ou quando o
texto casa com um nome conhecido sem empate. Onde houver dúvida, o nó vai para
a tela com tipo vazio e o texto original entra em nao_reconhecido, para a
pessoa conferir.

Uso: ler_diagrama.py <caminho> [--pagina N|nome] [--json]
"""
import io
import json
import math
import os
import re
import sys
import zlib
import base64
import urllib.parse
import xml.etree.ElementTree as ET

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)

ESQUEMA = os.path.join(AQUI, "esquema-aws.json")
MAPA = os.path.join(AQUI, "mapa_recursos.json")

# ── grade: onde cada nó nasce quando o desenho não traz posição ──────────────
GRADE_X0, GRADE_Y0, GRADE_COL, GRADE_LIN, GRADE_ALTURA = 80, 100, 300, 140, 5

# ── tolerância da ponta da seta até a borda do nó, em pixels do desenho ──────
# Quem desenha deixa recuo entre a seta e a peça, e o ícone da AWS ainda leva o
# rótulo embaixo. Os dois somam, e a folga cobre os dois.
TOLERANCIA = 36.0
ALTURA_ROTULO = 18.0

# ── ícone oficial da AWS → recurso do provider ──────────────────────────────
# O nome do ícone no mxGraph (resIcon=mxgraph.aws4.<nome>) é declaração de
# quem desenhou, não palpite de semelhança. Por isso a tabela é explícita.
SLUG_TIPO = {
    "api_gateway": "aws_api_gateway_rest_api",
    "apprunner": "aws_apprunner_service",
    "athena": "aws_athena_workgroup",
    "aurora": "aws_rds_cluster",
    "auto_scaling": "aws_autoscaling_group",
    "backup": "aws_backup_vault",
    "batch": "aws_batch_job_queue",
    "certificate_manager": "aws_acm_certificate",
    "cloudformation": "aws_cloudformation_stack",
    "cloudfront": "aws_cloudfront_distribution",
    "cloudtrail": "aws_cloudtrail",
    "cloudwatch": "aws_cloudwatch_log_group",
    "cloudwatch_2": "aws_cloudwatch_log_group",
    "codebuild": "aws_codebuild_project",
    "codecommit": "aws_codecommit_repository",
    "codepipeline": "aws_codepipeline",
    "cognito": "aws_cognito_user_pool",
    "config": "aws_config_configuration_recorder",
    "connect": "aws_connect_instance",
    "control_tower": "aws_controltower_landing_zone",
    "database_migration_service": "aws_dms_replication_instance",
    "direct_connect": "aws_dx_connection",
    "documentdb": "aws_docdb_cluster",
    "dynamodb": "aws_dynamodb_table",
    "ec2": "aws_instance",
    "ecr": "aws_ecr_repository",
    "ecs": "aws_ecs_cluster",
    "efs": "aws_efs_file_system",
    "eks": "aws_eks_cluster",
    "elastic_block_store": "aws_ebs_volume",
    "elastic_container_registry": "aws_ecr_repository",
    "elastic_container_service": "aws_ecs_cluster",
    "elastic_load_balancing": "aws_lb",
    "elasticache": "aws_elasticache_cluster",
    "elasticsearch_service": "aws_opensearch_domain",
    "emr": "aws_emr_cluster",
    "eventbridge": "aws_cloudwatch_event_bus",
    "fargate": "aws_ecs_service",
    "glue": "aws_glue_catalog_database",
    "guardduty": "aws_guardduty_detector",
    "identity_and_access_management_iam": "aws_iam_role",
    "inspector": "aws_inspector2_enabler",
    "internet_gateway": "aws_internet_gateway",
    "key_management_service": "aws_kms_key",
    "kinesis": "aws_kinesis_stream",
    "kinesis_data_analytics": "aws_kinesisanalyticsv2_application",
    "kinesis_data_firehose": "aws_kinesis_firehose_delivery_stream",
    "kinesis_data_streams": "aws_kinesis_stream",
    "lake_formation": "aws_lakeformation_resource",
    "lambda": "aws_lambda_function",
    "macie": "aws_macie2_account",
    "managed_streaming_for_kafka": "aws_msk_cluster",
    "nat_gateway": "aws_nat_gateway",
    "network_firewall": "aws_networkfirewall_firewall",
    "neptune": "aws_neptune_cluster",
    "opensearch_service": "aws_opensearch_domain",
    "organizations": "aws_organizations_organization",
    "pinpoint": "aws_pinpoint_app",
    "privatelink": "aws_vpc_endpoint",
    "quicksight": "aws_quicksight_dashboard",
    "rds": "aws_db_instance",
    "redshift": "aws_redshift_cluster",
    "route_53": "aws_route53_zone",
    "s3": "aws_s3_bucket",
    "sagemaker": "aws_sagemaker_domain",
    "secrets_manager": "aws_secretsmanager_secret",
    "security_hub": "aws_securityhub_account",
    "shield": "aws_shield_protection",
    "simple_email_service": "aws_sesv2_email_identity",
    "simple_notification_service": "aws_sns_topic",
    "simple_queue_service": "aws_sqs_queue",
    "simple_storage_service": "aws_s3_bucket",
    "single_sign_on": "aws_ssoadmin_permission_set",
    "sns": "aws_sns_topic",
    "sqs": "aws_sqs_queue",
    "step_functions": "aws_sfn_state_machine",
    "storage_gateway": "aws_storagegateway_gateway",
    "systems_manager": "aws_ssm_document",
    "transfer_family": "aws_transfer_server",
    "transit_gateway": "aws_ec2_transit_gateway",
    "vpc": "aws_vpc",
    "vpn_gateway": "aws_vpn_gateway",
    "waf": "aws_wafv2_web_acl",
}

# ── ícone que não diz serviço nenhum ────────────────────────────────────────
# São formas de propósito geral do estêncil da AWS. Quem desenha usa elas para
# peça de terceiro, ator humano e caixa preta. Tipar por elas seria inventar.
SLUG_GENERICO = {
    "general", "generic", "users", "user", "client", "internet",
    "machine_learning", "endpoints", "resourceicon", "group",
    "illustration", "office_building", "corporate_data_center", "traditional_server",
}

# ── nome escrito → recurso do provider ──────────────────────────────────────
# Casamento por frase inteira, com a frase mais longa ganhando. Empate de
# tamanho com respostas diferentes vira dúvida, e dúvida não vira tipo.
TEXTO_TIPO = {
    "amazon s3": "aws_s3_bucket",
    "s3": "aws_s3_bucket",
    "bucket": "aws_s3_bucket",
    "balde": "aws_s3_bucket",
    "dynamodb": "aws_dynamodb_table",
    "aurora": "aws_rds_cluster",
    "rds": "aws_db_instance",
    "documentdb": "aws_docdb_cluster",
    "neptune": "aws_neptune_cluster",
    "elasticache": "aws_elasticache_cluster",
    "redshift": "aws_redshift_cluster",
    "opensearch": "aws_opensearch_domain",
    "lambda": "aws_lambda_function",
    "step functions": "aws_sfn_state_machine",
    "eventbridge": "aws_cloudwatch_event_bus",
    "api gateway": "aws_api_gateway_rest_api",
    "appsync": "aws_appsync_graphql_api",
    "sqs": "aws_sqs_queue",
    "sns": "aws_sns_topic",
    "kinesis data streams": "aws_kinesis_stream",
    "firehose": "aws_kinesis_firehose_delivery_stream",
    "msk": "aws_msk_cluster",
    "kafka": "aws_msk_cluster",
    "glue": "aws_glue_catalog_database",
    "glue schema registry": "aws_glue_registry",
    "lake formation": "aws_lakeformation_resource",
    "athena": "aws_athena_workgroup",
    "emr": "aws_emr_cluster",
    "quicksight": "aws_quicksight_dashboard",
    "sagemaker": "aws_sagemaker_domain",
    "bedrock guardrails": "aws_bedrock_guardrail",
    "knowledge bases": "aws_bedrockagent_knowledge_base",
    "kms": "aws_kms_key",
    "secrets manager": "aws_secretsmanager_secret",
    "security hub": "aws_securityhub_account",
    "guardduty": "aws_guardduty_detector",
    "macie": "aws_macie2_account",
    "inspector": "aws_inspector2_enabler",
    "cloudtrail": "aws_cloudtrail",
    "config": "aws_config_configuration_recorder",
    "control tower": "aws_controltower_landing_zone",
    "organizations": "aws_organizations_organization",
    "iam identity center": "aws_ssoadmin_permission_set",
    "waf": "aws_wafv2_web_acl",
    "shield": "aws_shield_protection",
    "cloudfront": "aws_cloudfront_distribution",
    "route 53": "aws_route53_zone",
    "transit gateway": "aws_ec2_transit_gateway",
    "network firewall": "aws_networkfirewall_firewall",
    "nat gateway": "aws_nat_gateway",
    "internet gateway": "aws_internet_gateway",
    "vpc endpoint": "aws_vpc_endpoint",
    "gateway endpoint": "aws_vpc_endpoint",
    "interface endpoint": "aws_vpc_endpoint",
    "privatelink": "aws_vpc_endpoint",
    "direct connect": "aws_dx_connection",
    "cloudwatch": "aws_cloudwatch_log_group",
    "devops guru": "aws_devopsguru_resource_collection",
    "resilience hub": "aws_resiliencehub_resiliency_policy",
    "fis": "aws_fis_experiment_template",
    "systems manager": "aws_ssm_document",
    "backup": "aws_backup_vault",
    "ecr": "aws_ecr_repository",
    "fargate": "aws_ecs_service",
    "ecs": "aws_ecs_cluster",
    "eks": "aws_eks_cluster",
    "cognito": "aws_cognito_user_pool",
    "pinpoint": "aws_pinpoint_app",
    "amazon connect": "aws_connect_instance",
    "dms": "aws_dms_replication_instance",
    "codebuild": "aws_codebuild_project",
    "codepipeline": "aws_codepipeline",
    "cloudformation": "aws_cloudformation_stack",
}

# ── rótulo de caixa que é contexto, não recurso ─────────────────────────────
CAIXA_CONTA = re.compile(r"\b(conta|account)\b", re.I)
CAIXA_REGIAO = re.compile(r"\b(regi[ãa]o|region)\b", re.I)
CAIXA_ZONA = re.compile(
    r"\b(vpc|subnet|sub-rede|zona|az|availability zone|ou\b|organi[zs]ation|"
    r"aws cloud|nuvem|on-?premises|data ?center|ambiente|dom[íi]nio)\b", re.I)

_esquema_cache = None


def _tipos_do_provider():
    """Os recursos que o provider declara. Serve de porta: tipo fora da lista
    não sai daqui."""
    global _esquema_cache
    if _esquema_cache is None:
        try:
            with io.open(ESQUEMA, encoding="utf-8") as f:
                d = json.load(f)
            esquemas = d["provider_schemas"]["registry.terraform.io/hashicorp/aws"]
            _esquema_cache = set(esquemas["resource_schemas"])
        except Exception:
            _esquema_cache = set()
    return _esquema_cache


def _valida_tipo(tipo):
    """Devolve o tipo quando o provider o conhece, e None quando não."""
    if not tipo:
        return None
    conhecidos = _tipos_do_provider()
    if conhecidos and tipo not in conhecidos:
        return None
    return tipo


def _mapa_recursos():
    try:
        with io.open(MAPA, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _texto_limpo(valor):
    """Tira marcação html e devolve as linhas do rótulo."""
    if not valor:
        return []
    t = re.sub(r"<\s*br\s*/?\s*>", "\n", valor, flags=re.I)
    t = re.sub(r"<[^>]+>", "", t)
    t = (t.replace("&nbsp;", " ").replace("&amp;", "&")
          .replace("&lt;", "<").replace("&gt;", ">").replace("&#39;", "'"))
    linhas = [re.sub(r"\s+", " ", l).strip() for l in t.split("\n")]
    return [l for l in linhas if l]


def _normaliza(s):
    s = s.lower()
    s = s.replace("·", " ").replace("—", " ").replace("–", " ")
    for a, b in (("á", "a"), ("à", "a"), ("ã", "a"), ("â", "a"), ("é", "e"),
                 ("ê", "e"), ("í", "i"), ("ó", "o"), ("ô", "o"), ("õ", "o"),
                 ("ú", "u"), ("ç", "c")):
        s = s.replace(a, b)
    s = re.sub(r"^\s*(aws|amazon)\s+", " ", s)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return " " + re.sub(r"\s+", " ", s).strip() + " "


def _identificador(texto, usados):
    base = re.sub(r"[^a-z0-9]+", "-", _normaliza(texto)).strip("-")[:40] or "no"
    nome, n = base, 2
    while nome in usados:
        nome, n = "%s-%d" % (base, n), n + 1
    usados.add(nome)
    return nome


def _tipo_por_slug(slug):
    if not slug or slug in SLUG_GENERICO:
        return None
    return _valida_tipo(SLUG_TIPO.get(slug))


def _tipo_por_texto(texto):
    """Casa o rótulo com um nome conhecido. Devolve (tipo, candidatos).

    A frase mais longa ganha. Duas frases do mesmo tamanho apontando recursos
    diferentes é empate, e empate devolve dúvida em vez de tipo.
    """
    alvo = _normaliza(texto)
    tabela = dict(TEXTO_TIPO)
    for servico, dados in _mapa_recursos().items():
        if servico.startswith("_"):
            continue
        recursos = dados.get("recursos") or []
        if recursos:
            tabela.setdefault(servico, recursos[0])

    achados = [(len(chave), chave, tipo) for chave, tipo in tabela.items()
               if (" %s " % chave) in alvo]
    if not achados:
        return None, []
    achados.sort(reverse=True)
    topo = achados[0][0]
    empatados = {t for tam, _, t in achados if tam == topo}
    if len(empatados) > 1:
        return None, sorted({c for tam, c, _ in achados if tam == topo})
    return _valida_tipo(achados[0][2]), []


# ══ markdown: a especificação com as tabelas de Serviços e Arestas ══════════

def _no_da_unidade(u, identificador, x, y):
    tipo, _ = _tipo_por_texto(u.get("servico", ""))
    return {
        "id": identificador,
        "tipo": tipo,
        "servico": u.get("servico", ""),
        "papel": u.get("papel", ""),
        "zona": u.get("zona", ""),
        "conta": u.get("conta", ""),
        "regiao": "",
        "multiplicidade": u.get("multiplicidade", ""),
        "x": x,
        "y": y,
        "valores": {},
    }


def _grade_por_zona(unidades):
    """Coluna por zona, linha por serviço dentro dela."""
    zonas, posicoes = [], {}
    for i, u in enumerate(unidades):
        z = u.get("trilho") or u.get("zona") or "sem zona"
        if z not in zonas:
            zonas.append(z)
        coluna = zonas.index(z)
        linha = sum(1 for v in unidades[:i]
                    if (v.get("trilho") or v.get("zona") or "sem zona") == z)
        salto, linha = divmod(linha, GRADE_ALTURA)
        posicoes[i] = (GRADE_X0 + coluna * GRADE_COL + salto * (GRADE_COL // 2),
                       GRADE_Y0 + linha * GRADE_LIN)
    return posicoes


def _ler_md(caminho):
    import traduzir_bloco

    proposta = traduzir_bloco.traduz(caminho)
    unidades = proposta.get("unidades", [])
    posicoes = _grade_por_zona(unidades)

    nos, nao, usados, por_servico = [], [], set(), {}
    for i, u in enumerate(unidades):
        x, y = posicoes[i]
        ident = _identificador(u.get("nome") or u.get("servico", ""), usados)
        no = _no_da_unidade(u, ident, x, y)
        if not no["tipo"]:
            nao.append({
                "texto": u.get("servico", ""),
                "onde": "tabela de Serviços",
                "motivo": "serviço fora do mapa de recursos: escolha o recurso na tela",
                "candidatos": [],
            })
        nos.append(no)
        por_servico[_normaliza(u.get("servico", ""))] = ident

    def acha(nome):
        alvo = _normaliza(nome)
        for chave, ident in por_servico.items():
            if chave == alvo or (len(chave) > 4 and chave.strip() in alvo):
                return ident
        return None

    arestas = []
    for r in proposta.get("relacoes", []):
        de, para = acha(r.get("origem", "")), acha(r.get("destino", ""))
        if not de or not para or de == para:
            nao.append({
                "texto": "%s → %s" % (r.get("origem", ""), r.get("destino", "")),
                "onde": "tabela de Arestas",
                "motivo": "uma das pontas não é serviço deste bloco",
                "candidatos": [],
            })
            continue
        arestas.append({"de": de, "para": para, "flui": r.get("flui", ""),
                        "canal": r.get("canal", "")})

    tipados = sum(1 for n in nos if n["tipo"])
    porque = (
        "Li a especificação em markdown com o tradutor de bloco. "
        "%d serviços viraram nós, %d com o recurso do provider já resolvido. "
        "%d arestas entraram, %d ficaram de fora porque apontam outro bloco ou "
        "uma ponta que a tabela de Serviços não declara. "
        "A posição saiu de grade por zona, uma coluna por zona declarada."
        % (len(nos), tipados, len(arestas), len(proposta.get("relacoes", [])) - len(arestas))
    )
    return {"lido": True, "grafo": {"nos": nos, "arestas": arestas},
            "nao_reconhecido": nao, "porque": porque}


# ══ drawio e xml: o desenho do mxGraph ══════════════════════════════════════

def _descomprime(texto):
    """O drawio salvo pelo app guarda a página comprimida em base64."""
    bruto = base64.b64decode(texto.strip())
    return urllib.parse.unquote(zlib.decompress(bruto, -15).decode("utf-8"))


def _paginas(raiz):
    """Cada página do arquivo, como (nome, elemento raiz do grafo)."""
    saida = []
    for i, d in enumerate(raiz.findall(".//diagram")):
        nome = d.get("name") or ("página %d" % i)
        modelo = d.find("mxGraphModel")
        if modelo is None and (d.text or "").strip():
            try:
                modelo = ET.fromstring(_descomprime(d.text))
            except Exception:
                saida.append((nome, None))
                continue
        saida.append((nome, modelo))
    return saida


def _geometria(cel):
    g = cel.find("mxGeometry")
    if g is None:
        return None
    try:
        return (float(g.get("x") or 0), float(g.get("y") or 0),
                float(g.get("width") or 0), float(g.get("height") or 0))
    except ValueError:
        return None


def _pontos_da_aresta(cel):
    g = cel.find("mxGeometry")
    if g is None:
        return None, None
    saida = {}
    for p in g.findall("mxPoint"):
        papel = p.get("as")
        if papel in ("sourcePoint", "targetPoint"):
            try:
                saida[papel] = (float(p.get("x") or 0), float(p.get("y") or 0))
            except ValueError:
                pass
    return saida.get("sourcePoint"), saida.get("targetPoint")


def _distancia(ponto, retangulo):
    px, py = ponto
    x, y, w, h = retangulo
    dx = max(x - px, 0.0, px - (x + w))
    dy = max(y - py, 0.0, py - (y + h))
    return math.hypot(dx, dy)


def _caixa_sob(ponto, caixas):
    """A menor caixa de contexto que a ponta da seta toca."""
    if ponto is None:
        return None
    for b in caixas:
        if _distancia(ponto, b["geo"]) <= TOLERANCIA:
            return b["texto"]
    return None


def _dentro(retangulo, fora):
    x, y, w, h = retangulo
    fx, fy, fw, fh = fora
    return (fx - 1 <= x and fy - 1 <= y
            and x + w <= fx + fw + 1 and y + h <= fy + fh + 1)


def _e_texto_puro(estilo):
    """Legenda solta e nota. Não é peça nem moldura."""
    return estilo.startswith("text;") or "shape=note" in estilo


def _e_caixa(estilo, texto):
    """Caixa de contexto: conta, região, VPC, nuvem. Não vira nó.

    Duas formas dela. A moldura sem preenchimento, que vem desenhada como
    moldura. E a plaquinha de conta, que é pequena e pintada. As duas dizem
    onde uma coisa mora, e nenhuma é recurso do provider.

    Rótulo de moldura costuma ser comprido ("Platform · conta · VPC privada ·
    3 AZ"), então esta decisão vem antes do corte de prosa. Trocar a ordem faz
    a conta sumir dos nós que moram dentro dela.
    """
    if "fillcolor=none" in estilo or "swimlane" in estilo or "container=1" in estilo:
        return True
    return bool(texto and (CAIXA_CONTA.search(texto) or CAIXA_REGIAO.search(texto)))


def _e_enfeite(linhas, geo):
    """Número de passo, título, prosa. Some sem aviso.

    Nome de recurso é curto. Rótulo com frase inteira é explicação do pôster, e
    explicação não vira nó.
    """
    if not linhas:
        return True
    if geo and (geo[2] < 26 or geo[3] < 18):
        return True
    primeira = linhas[0]
    if len(primeira) > 60 or len(primeira.split()) > 8:
        return True
    return bool(re.match(r"^[\d\W]{1,4}$", " ".join(linhas)))


def _ler_drawio(caminho, pagina=None):
    texto = io.open(caminho, encoding="utf-8", errors="replace").read()
    try:
        raiz = ET.fromstring(texto)
    except ET.ParseError as e:
        return {"lido": False, "grafo": {"nos": [], "arestas": []},
                "nao_reconhecido": [],
                "porque": "O arquivo não abriu como XML do mxGraph: %s." % e}

    if raiz.tag == "mxGraphModel":
        paginas = [(os.path.basename(caminho), raiz)]
    else:
        paginas = _paginas(raiz)
    if not paginas:
        return {"lido": False, "grafo": {"nos": [], "arestas": []},
                "nao_reconhecido": [],
                "porque": "O arquivo não tem página de diagrama dentro."}

    escolhida = 0
    if isinstance(pagina, int):
        escolhida = max(0, min(pagina, len(paginas) - 1))
    elif isinstance(pagina, str) and pagina.strip():
        alvo = _normaliza(pagina)
        for i, (nome, _) in enumerate(paginas):
            if alvo.strip() in _normaliza(nome):
                escolhida = i
                break
    nome_pagina, modelo = paginas[escolhida]
    outras = [n for i, (n, _) in enumerate(paginas) if i != escolhida]

    if modelo is None:
        return {"lido": False, "grafo": {"nos": [], "arestas": []},
                "nao_reconhecido": [],
                "porque": ("A página %s está comprimida num formato que não abriu. "
                           "Salve no drawio com XML sem compressão e suba de novo."
                           % nome_pagina)}

    celulas = modelo.findall(".//mxCell")
    # posição relativa a pai: só cabe somar deslocamento quando o pai é caixa
    geo_por_id = {}
    for c in celulas:
        geo_por_id[c.get("id")] = _geometria(c)

    def absoluta(cel):
        geo = _geometria(cel)
        if geo is None:
            return None
        x, y, w, h = geo
        pai, saltos = cel.get("parent"), 0
        while pai and pai not in ("0", "1") and saltos < 12:
            g = geo_por_id.get(pai)
            if g:
                x, y = x + g[0], y + g[1]
            achado = [c for c in celulas if c.get("id") == pai]
            pai = achado[0].get("parent") if achado else None
            saltos += 1
        return (x, y, w, h)

    caixas, candidatos, nao = [], [], []
    for c in celulas:
        if c.get("vertex") != "1":
            continue
        estilo = (c.get("style") or "").lower()
        linhas = _texto_limpo(c.get("value"))
        geo = absoluta(c)
        m = (re.search(r"resicon=mxgraph\.aws4\.([a-z0-9_]+)", estilo)
             or re.search(r"shape=mxgraph\.aws4\.([a-z0-9_]+)", estilo))
        slug = m.group(1) if m else None
        junto = " ".join(linhas)

        if slug is None and _e_texto_puro(estilo):
            continue
        if slug is None and _e_caixa(estilo, junto):
            if geo and junto:
                caixas.append({"texto": junto, "geo": geo})
            continue
        if slug is None and _e_enfeite(linhas, geo):
            continue
        if geo is None or not linhas:
            continue
        candidatos.append({"cel": c, "slug": slug, "linhas": linhas, "geo": geo,
                           "estilo": estilo})

    # ── caixa que guarda peça dentro é moldura, não recurso ─────────────────
    # Vale para o agrupamento sem rótulo de conta ("Consumo · orquestração de
    # saga"). Quem tem ícone da AWS escapa: ícone é declaração de serviço.
    sobrou = []
    for cand in candidatos:
        guarda = any(outro is not cand and _dentro(outro["geo"], cand["geo"])
                     and outro["geo"][2] * outro["geo"][3] < cand["geo"][2] * cand["geo"][3]
                     for outro in candidatos)
        if cand["slug"] is None and guarda:
            caixas.append({"texto": " ".join(cand["linhas"]), "geo": cand["geo"]})
            tipo_moldura, _ = _tipo_por_texto(cand["linhas"][0])
            if tipo_moldura:
                nao.append({
                    "texto": " · ".join(cand["linhas"]),
                    "onde": nome_pagina,
                    "motivo": ("moldura com nome de serviço: virou contexto porque "
                               "guarda outras peças dentro; acrescente %s à mão se "
                               "ela também for recurso" % tipo_moldura),
                    "candidatos": [tipo_moldura],
                })
        else:
            sobrou.append(cand)
    candidatos = sobrou
    caixas.sort(key=lambda b: b["geo"][2] * b["geo"][3])

    def contexto(geo):
        conta = regiao = zona = ""
        for b in caixas:
            if not _dentro(geo, b["geo"]):
                continue
            if not conta and CAIXA_CONTA.search(b["texto"]):
                conta = b["texto"]
            elif not regiao and CAIXA_REGIAO.search(b["texto"]):
                regiao = b["texto"]
            elif not zona:
                zona = b["texto"]
        return conta, regiao, zona

    nos, usados, por_cel = [], set(), {}
    for cand in candidatos:
        linhas, geo = cand["linhas"], cand["geo"]
        servico, papel = linhas[0], " · ".join(linhas[1:])
        tipo = _tipo_por_slug(cand["slug"])
        candidatos_texto = []
        if not tipo:
            tipo, candidatos_texto = _tipo_por_texto(servico)
        conta, regiao, zona = contexto(geo)
        ident = _identificador(servico, usados)
        no = {"id": ident, "tipo": tipo, "servico": servico, "papel": papel,
              "zona": zona, "conta": conta, "regiao": regiao,
              "multiplicidade": "", "x": round(geo[0]), "y": round(geo[1]),
              "valores": {}}
        nos.append(no)
        # o rótulo do ícone da AWS fica embaixo dele, e a seta parte de baixo
        # do rótulo: o alcance da peça cresce para baixo o tanto do texto
        alcance = geo
        if "verticallabelposition=bottom" in cand["estilo"]:
            alcance = (geo[0], geo[1], geo[2],
                       geo[3] + ALTURA_ROTULO * max(1, len(linhas)))
        por_cel[cand["cel"].get("id")] = (ident, alcance)
        if not tipo:
            motivo = ("o ícone é de propósito geral e o texto não casa com "
                      "recurso conhecido")
            if candidatos_texto:
                motivo = "o texto casa com mais de um recurso, e empate não vira tipo"
            elif cand["slug"]:
                motivo = ("o ícone %s não está na tabela de ícones oficiais"
                          % cand["slug"]) if cand["slug"] not in SLUG_GENERICO else motivo
            nao.append({"texto": " · ".join(linhas), "onde": nome_pagina,
                        "motivo": motivo, "candidatos": candidatos_texto})

    # ── as setas ────────────────────────────────────────────────────────────
    # Este desenho liga por geometria, sem source e target. A ponta resolve
    # pela borda mais próxima, com folga de TOLERANCIA pixels.
    def perto(ponto):
        if ponto is None:
            return None, None
        # empatou na distância, ganha a peça menor: ela é a mais específica
        medidas = sorted((_distancia(ponto, geo), geo[2] * geo[3], ident)
                         for ident, geo in por_cel.values())
        if not medidas or medidas[0][0] > TOLERANCIA:
            return None, None
        if len(medidas) > 1:
            d0, a0, _ = medidas[0]
            d1, a1, _ = medidas[1]
            if abs(d1 - d0) < 2.0 and abs(a1 - a0) < 0.05 * max(a0, 1.0):
                return None, "empate"
        return medidas[0][2], None

    arestas, soltas = [], 0
    for c in celulas:
        if c.get("edge") != "1":
            continue
        rotulo = " · ".join(_texto_limpo(c.get("value")))
        de = para = None
        if c.get("source") and c.get("source") in por_cel:
            de = por_cel[c.get("source")][0]
        if c.get("target") and c.get("target") in por_cel:
            para = por_cel[c.get("target")][0]
        p_origem, p_destino = _pontos_da_aresta(c)
        motivo_de = motivo_para = None
        if de is None:
            de, motivo_de = perto(p_origem)
        if para is None:
            para, motivo_para = perto(p_destino)
        if de is None or para is None or de == para:
            soltas += 1
            ponta = []
            if p_origem:
                ponta.append("de (%d,%d)" % (round(p_origem[0]), round(p_origem[1])))
            if p_destino:
                ponta.append("para (%d,%d)" % (round(p_destino[0]), round(p_destino[1])))
            solta = p_origem if de is None else p_destino
            caixa = _caixa_sob(solta, caixas)
            if "empate" in (motivo_de, motivo_para):
                motivo = "duas peças à mesma distância da ponta, e empate não vira ligação"
            elif caixa:
                motivo = ("a ponta cai na caixa \"%s\", que é contexto e não recurso"
                          % caixa)
            else:
                motivo = "a ponta não cai em nenhum recurso"
            nao.append({"texto": rotulo or ("seta %s" % " ".join(ponta)),
                        "onde": nome_pagina, "motivo": motivo, "candidatos": []})
            continue
        conta_de = next(n["conta"] for n in nos if n["id"] == de)
        conta_para = next(n["conta"] for n in nos if n["id"] == para)
        canal = "entre contas" if (conta_de and conta_para
                                   and conta_de != conta_para) else ""
        arestas.append({"de": de, "para": para, "flui": rotulo, "canal": canal})

    total_setas = sum(1 for c in celulas if c.get("edge") == "1")
    tipados = sum(1 for n in nos if n["tipo"])
    porque = (
        "Li a página \"%s\" do desenho do mxGraph. "
        "%d peças viraram nós, %d com o recurso do provider resolvido pelo "
        "ícone oficial ou pelo nome, %d à espera de você dizer qual recurso é. "
        "%d caixas viraram contexto de conta, região e rede. "
        "Setas ligadas pela geometria: %d de %d. Setas na lista para "
        "conferência: %d."
        % (nome_pagina, len(nos), tipados, len(nos) - tipados, len(caixas),
           len(arestas), total_setas, soltas)
    )
    if nos and not any(c["slug"] for c in candidatos):
        porque += (" Nenhuma peça desta página traz ícone da AWS. Página assim "
                   "costuma ser pôster de explicação, não topologia: confira "
                   "antes de gerar arquivo a partir dela.")
    if outras:
        porque += (" O arquivo tem mais %d páginas: %s. Peça a página pelo nome "
                   "para ler outra." % (len(outras), ", ".join(outras[:8])
                                        + (", …" if len(outras) > 8 else "")))
    return {"lido": True, "grafo": {"nos": nos, "arestas": arestas},
            "nao_reconhecido": nao, "porque": porque}


# ══ json: grafo pronto ══════════════════════════════════════════════════════

CAMPOS_NO = ("id", "tipo", "servico", "papel", "zona", "conta", "regiao",
             "multiplicidade", "x", "y", "valores")


def _ler_json(caminho):
    try:
        with io.open(caminho, encoding="utf-8") as f:
            dado = json.load(f)
    except Exception as e:
        return {"lido": False, "grafo": {"nos": [], "arestas": []},
                "nao_reconhecido": [], "porque": "O json não abriu: %s." % e}

    if isinstance(dado, dict) and "grafo" in dado:
        dado = dado["grafo"]
    if isinstance(dado, dict) and "unidades" in dado:
        unidades = dado.get("unidades", [])
        posicoes = _grade_por_zona(unidades)
        nos, usados, nao = [], set(), []
        for i, u in enumerate(unidades):
            x, y = posicoes[i]
            ident = _identificador(u.get("nome") or u.get("servico", ""), usados)
            no = _no_da_unidade(u, ident, x, y)
            if not no["tipo"]:
                nao.append({"texto": u.get("servico", ""), "onde": "unidades",
                            "motivo": "serviço fora do mapa de recursos",
                            "candidatos": []})
            nos.append(no)
        return {"lido": True, "grafo": {"nos": nos, "arestas": []},
                "nao_reconhecido": nao,
                "porque": ("Li uma proposta do tradutor: %d unidades viraram nós "
                           "em grade por zona. As relações ficaram de fora porque "
                           "a proposta guarda nome de serviço, não identificador de nó."
                           % len(nos))}

    if not isinstance(dado, dict) or "nos" not in dado:
        return {"lido": False, "grafo": {"nos": [], "arestas": []},
                "nao_reconhecido": [],
                "porque": ("O json não tem a chave nos. Um grafo pronto é "
                           "{\"nos\": [...], \"arestas\": [...]}.")}

    nos, nao, usados = [], [], set()
    posicao = 0
    for bruto in dado.get("nos") or []:
        if not isinstance(bruto, dict):
            nao.append({"texto": str(bruto)[:80], "onde": "nos",
                        "motivo": "nó que não é objeto", "candidatos": []})
            continue
        servico = bruto.get("servico") or bruto.get("nome") or bruto.get("id") or ""
        ident = bruto.get("id")
        if not ident or ident in usados:
            if ident:
                nao.append({"texto": str(ident), "onde": "nos",
                            "motivo": "id repetido: renomeei para não colidir",
                            "candidatos": []})
            ident = _identificador(servico or "no", usados)
        else:
            usados.add(ident)
        tipo = _valida_tipo(bruto.get("tipo"))
        if bruto.get("tipo") and not tipo:
            nao.append({"texto": str(bruto.get("tipo")), "onde": "nos",
                        "motivo": "o provider da AWS não tem esse recurso",
                        "candidatos": []})
        no = {c: bruto.get(c) for c in CAMPOS_NO}
        no.update({"id": ident, "tipo": tipo, "servico": servico,
                   "valores": bruto.get("valores") or {}})
        for campo in ("papel", "zona", "conta", "regiao", "multiplicidade"):
            no[campo] = no[campo] or ""
        if not isinstance(no["x"], (int, float)) or not isinstance(no["y"], (int, float)):
            coluna, linha = divmod(posicao, GRADE_ALTURA)
            no["x"] = GRADE_X0 + coluna * GRADE_COL
            no["y"] = GRADE_Y0 + linha * GRADE_LIN
        posicao += 1
        nos.append(no)

    ids = {n["id"] for n in nos}
    arestas = []
    for bruto in dado.get("arestas") or []:
        de, para = (bruto or {}).get("de"), (bruto or {}).get("para")
        if de not in ids or para not in ids or de == para:
            nao.append({"texto": "%s → %s" % (de, para), "onde": "arestas",
                        "motivo": "a aresta aponta id que não existe entre os nós",
                        "candidatos": []})
            continue
        arestas.append({"de": de, "para": para, "flui": bruto.get("flui") or "",
                        "canal": bruto.get("canal") or ""})

    tipados = sum(1 for n in nos if n["tipo"])
    return {"lido": True, "grafo": {"nos": nos, "arestas": arestas},
            "nao_reconhecido": nao,
            "porque": ("Li um grafo pronto em json: %d nós, %d com recurso do "
                       "provider conferido contra o esquema, e %d arestas com as "
                       "duas pontas existindo."
                       % (len(nos), tipados, len(arestas)))}


# ══ porta de entrada ════════════════════════════════════════════════════════

def ler(caminho, pagina=None):
    """Lê o diagrama e devolve o grafo, o que não foi reconhecido e a razão."""
    vazio = {"nos": [], "arestas": []}
    if not caminho or not os.path.isfile(caminho):
        return {"lido": False, "grafo": vazio, "nao_reconhecido": [],
                "porque": "O arquivo não existe no caminho informado."}

    ext = os.path.splitext(caminho)[1].lower()
    if ext in (".md", ".markdown"):
        try:
            return _ler_md(caminho)
        except Exception as e:
            return {"lido": False, "grafo": vazio, "nao_reconhecido": [],
                    "porque": ("O markdown não tem as tabelas de Serviços e "
                               "Arestas no formato do bloco: %s." % e)}
    if ext in (".drawio", ".xml"):
        return _ler_drawio(caminho, pagina)
    if ext == ".json":
        return _ler_json(caminho)
    if ext in (".png", ".jpg", ".jpeg", ".webp", ".pdf", ".svg"):
        return {"lido": False, "grafo": vazio, "nao_reconhecido": [],
                "porque": ("Imagem não vira grafo aqui. Suba a imagem para "
                           "conferência e monte o desenho na tela, ou exporte o "
                           "arquivo em drawio.")}
    return {"lido": False, "grafo": vazio, "nao_reconhecido": [],
            "porque": ("Formato %s não é lido. Aceito markdown de especificação, "
                       "drawio, xml do mxGraph e json de grafo." % (ext or "sem extensão"))}


def main():
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        sys.exit(2)
    caminho = sys.argv[1]
    pagina = None
    if "--pagina" in sys.argv:
        bruto = sys.argv[sys.argv.index("--pagina") + 1]
        pagina = int(bruto) if bruto.lstrip("-").isdigit() else bruto

    r = ler(caminho, pagina)
    if "--json" in sys.argv:
        print(json.dumps(r, ensure_ascii=False, indent=2))
        sys.exit(0 if r["lido"] else 1)

    print(r["porque"])
    if not r["lido"]:
        sys.exit(1)
    print("\n== nós (%d) ==" % len(r["grafo"]["nos"]))
    for n in r["grafo"]["nos"]:
        print("  %-34s %-32s %-28s %s"
              % (n["id"][:34], n["tipo"] or "(a escolher)", n["servico"][:28],
                 n["conta"][:24]))
    print("\n== arestas (%d) ==" % len(r["grafo"]["arestas"]))
    for a in r["grafo"]["arestas"]:
        print("  %-30s → %-30s %s" % (a["de"][:30], a["para"][:30], a["flui"][:30]))
    print("\n== não reconhecido (%d) ==" % len(r["nao_reconhecido"]))
    for x in r["nao_reconhecido"]:
        print("  %-46s %s" % (x["texto"][:46], x["motivo"]))
    sys.exit(0)


if __name__ == "__main__":
    main()
