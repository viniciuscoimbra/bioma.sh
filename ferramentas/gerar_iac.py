#!/usr/bin/env python3
"""Escreve os arquivos .tf e .hcl a partir da proposta do tradutor.

Entrada: a proposta que o `traduzir_bloco.py` produz.
Saída: a árvore do catálogo atômico com arquivos que rodam.

  <destino>/catalogo/organismos/<trilho>/<nome>/   versions.tf main.tf variables.tf outputs.tf
  <destino>/catalogo/ligacoes/<nome>/              idem
  <destino>/catalogo/fronteiras/<nome>/            só o contrato: o que não é nosso não tem receita
  <destino>/live/<trilho>/<alcance>/<nome>/        terragrunt.hcl de cada célula

Onde o mapa de recursos conhece o serviço, o esqueleto nasce com os recursos
do provider certos. Onde não conhece, nasce um bloco TODO nomeando o serviço,
porque recurso inventado é pior do que recurso ausente.

Uso: gerar_iac.py <proposta.json> --destino <pasta> [--forcar]
"""
import io, json, os, re, shutil, sys
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import oficina
MAPA = json.load(io.open(os.path.join(AQUI, "mapa_recursos.json"), encoding="utf-8"))

# Esquema do provider: quais argumentos cada recurso exige. Sai de
#   terraform providers schema -json
# num diretório com o provider fixado. Sem ele o gerador escreve o esqueleto
# sem argumento, e o `terraform validate` reprova por argumento faltando.
ESQUEMA = os.environ.get("IAC_ESQUEMA_AWS", os.path.join(AQUI, "esquema-aws.json"))
_cache = {}

# Como perguntar cada valor em português, com exemplo e formato aceito.
DIC = json.load(io.open(os.path.join(AQUI, "dicionario.json"), encoding="utf-8"))


def como_perguntar(arg, tipo_recurso, tipo_hcl_, desc):
    """A pergunta, o exemplo, o formato e o que dói se errar."""
    for chave in (arg, arg.split("_")[-1]):
        if chave in DIC and not chave.startswith("_"):
            d = dict(DIC[chave])
            d["nome"] = arg
            return d
    return {"nome": arg,
            "pergunta": "O valor de %s" % arg.replace("_", " "),
            "exemplo": {"number": "30", "bool": "true"}.get(tipo_hcl_, "texto"),
            "formato": "^[0-9]+$" if tipo_hcl_ == "number" else ("^(true|false)$" if tipo_hcl_ == "bool" else ".+"),
            "explica": desc or ("o que o recurso %s espera neste campo" % tipo_recurso),
            "erra": "o processo para antes de tocar a nuvem se o formato estiver errado"}


# Argumento que é referência a outro recurso DA MESMA receita não vira
# pergunta: o gerador liga sozinho. Perguntar o nome do balde quatro vezes
# para as quatro sub-receitas do mesmo balde é ruído, e ruído faz gente errar.
LIGACOES_INTERNAS = {
    "bucket": ("aws_s3_bucket", "id"),
    "role": ("aws_iam_role", "arn"),
    "target_key_id": ("aws_kms_key", "key_id"),
    "kms_key_id": ("aws_kms_key", "arn"),
    "queue_url": ("aws_sqs_queue", "url"),
    "topic_arn": ("aws_sns_topic", "arn"),
    "secret_id": ("aws_secretsmanager_secret", "id"),
    "cluster_arn": ("aws_msk_cluster", "arn"),
    # a instância do Aurora aponta o cluster da própria receita. Sem esta
    # linha o gerado saía `cluster_identifier = "PREENCHER"` do lado do
    # `aws_rds_cluster` que ele mesmo tinha acabado de escrever.
    "cluster_identifier": ("aws_rds_cluster", "id"),
    "log_group_name": ("aws_cloudwatch_log_group", "name"),
    "registry_arn": ("aws_glue_registry", "arn"),
    "database_name": ("aws_glue_catalog_database", "name"),
    "table_name": ("aws_glue_catalog_table", "name"),
    "function_name": ("aws_lambda_function", "function_name"),
    "rest_api_id": ("aws_api_gateway_rest_api", "id"),
}


def rotulo_do(nome):
    """O rótulo do bloco Terraform: o nome da célula, não "este".

    `aws_s3_bucket.trilha_auditoria` se lê no plano, no state e no erro;
    `aws_s3_bucket.este` não diz de qual peça se trata."""
    return re.sub(r"[^a-z0-9]+", "_", str(nome or "").lower()).strip("_") or "principal"


def liga_interno(arg, recursos_da_receita, rotulo="principal", dono=None):
    """A referência que resolve este argumento dentro da própria receita.

    `dono` é o recurso onde o argumento está sendo escrito. Sem ele, um
    argumento homônimo do próprio recurso resolvia para ele mesmo, e saía
    `function_name = aws_lambda_function.x.function_name`, que é ciclo.
    """
    def util(tipo):
        return tipo in recursos_da_receita and tipo != dono

    alvo = LIGACOES_INTERNAS.get(arg)
    if alvo and util(alvo[0]):
        return "%s.%s.%s" % (alvo[0], rotulo, alvo[1])
    if arg.endswith("_arn"):
        base = "aws_" + arg[:-4]
        if util(base):
            return "%s.%s.arn" % (base, rotulo)
    return None


# O esquema da AWS é o primeiro, e não o único: uma esteira mora no GitHub e a
# observabilidade pode morar no Datadog. Cada arquivo aqui é um `terraform
# providers schema -json`, e o recurso sai dele, nunca de adivinhação.
ESQUEMAS = [ESQUEMA] + [
    os.path.join(AQUI, n) for n in ("esquema-outros.json", "esquema-extra.json")]
_provider_de = {}


def esquema_do_recurso(tipo):
    if not _cache:
        achou = False
        for arq in ESQUEMAS:
            if not os.path.exists(arq):
                continue
            d = json.load(io.open(arq, encoding="utf-8"))
            for endereco, corpo in (d.get("provider_schemas") or {}).items():
                curto = endereco.split("/")[-1]
                fonte = "/".join(endereco.split("/")[-2:])
                for nome, esq in (corpo.get("resource_schemas") or {}).items():
                    _cache.setdefault(nome, esq)
                    _provider_de.setdefault(nome, (curto, fonte))
                achou = True
        if not achou:
            _cache["_vazio"] = True
            return None
    return _cache.get(tipo)


def provider_do_recurso(tipo):
    """(apelido, origem) do provider que declara este recurso."""
    esquema_do_recurso(tipo)
    return _provider_de.get(tipo) or ("aws", "hashicorp/aws")


def tipo_hcl(t):
    if isinstance(t, str):
        return t if t in ("string", "number", "bool") else "any"
    if isinstance(t, list) and t and t[0] in ("list", "set"):
        interno = t[1] if isinstance(t[1], str) else "any"
        return "list(%s)" % (interno if interno in ("string", "number", "bool") else "any")
    if isinstance(t, list) and t and t[0] == "map":
        return "map(string)"
    return "any"


# argumento -> valor derivado do próprio contexto da receita. O que tem
# resposta óbvia não vira pergunta: pergunta de sobra ensina que a ferramenta
# dá trabalho.
DERIVADOS = {
    ("aws_cloudwatch_metric_alarm", "alarm_name"): '"${var.nome}-alarme"',
    ("aws_s3_bucket_versioning", "versioning_configuration.status"): '"Enabled"',
}

# quem pode assumir a role depende de quem trabalha na receita
TRUST_POR_VIZINHO = {
    "aws_lambda_function": "lambda.amazonaws.com",
    "aws_ecs_service": "ecs-tasks.amazonaws.com",
    "aws_sfn_state_machine": "states.amazonaws.com",
    "aws_scheduler_schedule": "scheduler.amazonaws.com",
    "aws_kinesis_firehose_delivery_stream": "firehose.amazonaws.com",
    "aws_glue_job": "glue.amazonaws.com",
}


def trust_da_receita(recursos_da_receita):
    for vizinho, servico in TRUST_POR_VIZINHO.items():
        if vizinho in recursos_da_receita:
            return ('jsonencode({\n    Version = "2012-10-17"\n    Statement = [{\n'
                    '      Effect = "Allow"\n      Principal = { Service = "%s" }\n'
                    '      Action = "sts:AssumeRole"\n    }]\n  })' % servico)
    return None


def exigencias(tipo_recurso, prefixo, recursos_da_receita=(), rotulo="principal"):
    """(linhas do recurso, variáveis, perguntas) para o que o provider exige."""
    esq = esquema_do_recurso(tipo_recurso)
    if not esq:
        return ["  # TODO(argumentos): esquema do provider indisponível"], [], []
    bloco = esq.get("block", {})
    linhas, variaveis, perguntas = [], [], []
    for nome, at in sorted((bloco.get("attributes") or {}).items()):
        if not at.get("required"):
            continue
        interno = liga_interno(nome, recursos_da_receita, rotulo, dono=tipo_recurso)
        if interno:
            linhas.append("  %-28s = %s # ligado pelo bioma: mesma receita" % (nome, interno))
            continue
        derivado = DERIVADOS.get((tipo_recurso, nome))
        if derivado:
            linhas.append("  %-28s = %s # derivado pelo bioma; mude na receita se precisar" % (nome, derivado))
            continue
        if tipo_recurso == "aws_iam_role" and nome == "assume_role_policy":
            trust = trust_da_receita(recursos_da_receita)
            if trust:
                linhas.append("  %-28s = %s # quem trabalha nesta receita pode assumir" % (nome, trust))
                continue
        v = "%s_%s" % (prefixo, nome)
        th = tipo_hcl(at.get("type"))
        linhas.append("  %-28s = var.%s" % (nome, v))
        variaveis.append('variable "%s" {\n  type        = %s\n  description = "%s de %s (exigido pelo provider)"\n}\n'
                         % (v, th, nome, tipo_recurso))
        perguntas.append(como_perguntar(v, tipo_recurso, th, at.get("description")))
    for nome, bt in sorted((bloco.get("block_types") or {}).items()):
        if (bt.get("min_items") or 0) < 1:
            continue
        dentro = []
        for an, at in sorted((bt.get("block", {}).get("attributes") or {}).items()):
            if not at.get("required"):
                continue
            v = "%s_%s_%s" % (prefixo, nome, an)
            # o argumento dentro de bloco aninhado também pode ser respondido
            # pela própria receita. Sem isto, `broker_node_group_info.security_groups`
            # virava pergunta mesmo quando o security group nascia ali do lado.
            interno = liga_interno(an, recursos_da_receita, rotulo, dono=tipo_recurso)
            if interno:
                dentro.append("    %-26s = %s # ligado pelo bioma: mesma receita" % (an, interno))
                continue
            derivado = DERIVADOS.get((tipo_recurso, "%s.%s" % (nome, an)))
            if derivado:
                dentro.append("    %-26s = %s # derivado pelo bioma" % (an, derivado))
                continue
            dentro.append("    %-26s = var.%s" % (an, v))
            th = tipo_hcl(at.get("type"))
            variaveis.append('variable "%s" {\n  type        = %s\n  description = "%s.%s de %s (exigido pelo provider)"\n}\n'
                             % (v, th, nome, an, tipo_recurso))
            perguntas.append(como_perguntar(v, tipo_recurso, th, at.get("description")))
        linhas.append("  %s {\n%s\n  }" % (nome, "\n".join(dentro) if dentro else "    # sem argumento obrigatório"))
    return linhas, variaveis, perguntas

VERSIONS = """terraform {
  required_version = ">= 1.11"
  required_providers {
    aws = { source = "hashicorp/aws", version = ">= 6.40.0, < 7.0.0" }
  }
}
"""

# a versão que o bioma fixa por provider. Provider fora desta tabela entra sem
# restrição de versão e diz isso por escrito, em vez de fingir que sabe.
VERSAO_DO_PROVIDER = {
    "hashicorp/aws": ">= 6.40.0, < 7.0.0",
    "datadog/datadog": "~> 3.60",
    "integrations/github": "~> 6.0",
}


def versions_tf(recursos):
    """O `versions.tf` da receita, com os providers que ela de fato usa."""
    usados = {}
    for r in recursos or []:
        apelido, fonte = provider_do_recurso(r)
        usados[apelido] = fonte
    if not usados:
        usados = {"aws": "hashicorp/aws"}
    linhas = []
    for apelido in sorted(usados):
        fonte = usados[apelido]
        versao = VERSAO_DO_PROVIDER.get(fonte)
        if versao:
            linhas.append('    %-8s = { source = "%s", version = "%s" }'
                          % (apelido, fonte, versao))
        else:
            linhas.append('    %-8s = { source = "%s" } # versão não fixada pelo bioma'
                          % (apelido, fonte))
    return ('terraform {\n  required_version = ">= 1.11"\n'
            '  required_providers {\n%s\n  }\n}\n' % "\n".join(linhas))


# O papel refina o recurso. O nome do serviço diz a família; o papel, escrito na
# coluna ao lado no bloco, diz qual peça daquela família é. Sem isto, `AWS
# Lambda (ESM)` nascia como função e nunca como o event source mapping que ela
# de fato é, e `SCP (Organizations)` nascia como uma organização inteira.
# Cada alvo é conferido contra o esquema antes de valer.
POR_PAPEL = [
    # (o que o serviço parece, o que o papel diz, o recurso que vale)
    (r"lambda", r"\besm\b|event source|consumidor|consome",
     ["aws_lambda_event_source_mapping", "aws_lambda_function"]),
    # "guardrail" é o que descreve a política; o papel do próprio Organizations
    # menciona SCP entre o que ele gerencia, e citar não é ser.
    (r"organizations|scp", r"guardrail|pol[ií]tica preventiva|pol[ií]tica de controle",
     ["aws_organizations_policy", "aws_organizations_policy_attachment"]),
    (r"glue", r"\bjob\b|pyspark|etl|transforma",
     ["aws_glue_job"]),
    (r"glue", r"cat[áa]logo|catalog|banco de dados",
     ["aws_glue_catalog_database", "aws_glue_catalog_table"]),
    (r"glue", r"schema|contrato de evento|registry",
     ["aws_glue_registry", "aws_glue_schema"]),
    (r"s3|bucket", r"tabela|iceberg|s3 tables",
     ["aws_s3tables_table_bucket"]),
    (r"config", r"regra|conformidade|compliance",
     ["aws_config_config_rule"]),
    (r"cloudwatch|observabilidade", r"alarme|alarm",
     ["aws_cloudwatch_metric_alarm"]),
    (r"datadog", r"painel|dashboard",
     ["datadog_dashboard"]),
    (r"datadog", r"sint[ée]tico|synthetic|sonda",
     ["datadog_synthetics_test"]),
    (r"github", r"segredo|secret|oidc|credencial",
     ["github_actions_secret"]),
    (r"github", r"prote[çc][ãa]o|branch|revis[ãa]o",
     ["github_branch_protection"]),
]


def refina_por_papel(servico, papel, recursos):
    """O recurso que o papel indica, quando ele indica algum.

    Só troca quando o alvo existe no esquema: papel que aponta recurso que não
    existe deixa a escolha como estava, em vez de trocar por invenção.
    """
    s, p = (servico or "").lower(), (papel or "").lower()
    for quando_servico, quando_papel, alvos in POR_PAPEL:
        if not (re.search(quando_servico, s) and re.search(quando_papel, p)):
            continue
        validos = [a for a in alvos if esquema_do_recurso(a)]
        if validos:
            return validos
    return recursos


def recursos_de(servico):
    """Os recursos que este serviço vira, pela tabela escrita à mão.

    Vence a chave mais específica, e não a primeira do arquivo: por ordem de
    declaração, `MSK Connect (S3 Sink)` casava com `s3` e virava um balde, e
    `VPC Gateway Endpoint` casava com `vpc` e virava uma VPC inteira.
    """
    s = servico.lower()
    for chave, v in sorted(MAPA.items(), key=lambda kv: -len(kv[0])):
        if chave.startswith("_"):
            continue
        if chave in s:
            return v["recursos"], v.get("nota")
    return [], None


def curto_do_tipo(tipo):
    """`aws_security_group` vira `security_group`: o tipo sem o provider."""
    return re.sub(r"^[a-z0-9]+_", "", tipo)


def saidas_de(u):
    """O que esta receita publica: `id` e `arn` de cada recurso que ela cria.

    Quem desenha não sabe o que a vizinha vai precisar, e não deveria decidir
    isso. O par id/arn é o que toda dependência pede, e o esquema do provider
    diz quais recursos têm cada um. O que sai daqui é o que o `mock_outputs` da
    vizinha declara: mock inventado esconde receita que não publica nada, e foi
    assim que uma dependência apontou para uma saída inexistente sem ninguém
    perceber.

    Publicar só o recurso principal deixava o resto endereçável por ninguém: a
    receita criava a role e o security group, e a vizinha que precisava deles
    escrevia o ARN à mão. O principal continua saindo como `id`/`arn`, para o
    que já existe não mudar de nome; os outros saem com o tipo no nome
    (`iam_role_arn`, `security_group_id`), que é o que deixa casar por tipo.

    Endereço que cruza dono continua sendo hormônio (`aws_ssm_parameter`), e
    não output.
    """
    recursos, _ = recursos_de(u["servico"])
    if not recursos:
        return []
    rotulo = re.sub(r"[^a-z0-9_]+", "_", u["nome"].lower()).strip("_") or "principal"
    fora, vistos = [], set()
    for i, tipo in enumerate(recursos):
        esquema = esquema_do_recurso(tipo) or {}
        atributos = (esquema.get("block") or {}).get("attributes") or {}
        # configuração de outro recurso não é endereço de ninguém, e quem diz
        # isso é o esquema, não o nome: `aws_s3_bucket_versioning` e
        # `aws_iam_role_policy` não têm ARN porque não são coisa endereçável,
        # enquanto `aws_vpc_endpoint_service` tem, apesar de o nome parecer
        # sufixo de outro recurso. Publicar o id da configuração só enchia o
        # mock da vizinha de linha que ninguém lê.
        if i and atributos and "arn" not in atributos:
            continue
        for atributo in ("id", "arn"):
            if atributos and atributo not in atributos:
                continue
            nome = atributo if i == 0 else "%s_%s" % (curto_do_tipo(tipo), atributo)
            if nome in vistos:
                continue
            vistos.add(nome)
            fora.append((nome, "%s.%s.%s" % (tipo, rotulo, atributo)))
    return fora


def saidas_por_tipo(u):
    """{(tipo do recurso, atributo): nome da saída} do que esta receita publica.

    Tipo que aparece duas vezes na mesma receita sai da conta inteira. Deixar o
    primeiro vencer entregaria à vizinha o endereço de uma das duas peças, sem
    dizer qual, e ela aceitaria calada. Enquanto o mapa de recursos identificar
    peça só por tipo, ambiguidade aqui vira pergunta na ficha.
    """
    recursos, _ = recursos_de(u["servico"])
    repetidos = {t for t in recursos if recursos.count(t) > 1}
    fora = {}
    for nome, ref in saidas_de(u):
        tipo, _rot, atributo = ref.split(".", 2)
        if tipo in recursos and tipo not in repetidos:
            fora.setdefault((tipo, atributo), nome)
    return fora


# ── o que cada argumento pede, em tipo de recurso ──────────────────────────
# Vocabulário do Terraform, e não desta ou daquela organização: `security_group_ids`
# quer id de security group em qualquer desenho que alguém faça. É por aqui que
# a ferramenta deixa de casar por pedaço de nome, que foi o que pôs o ARN de um
# cluster onde o provider queria o de uma role.
PEDIDOS = [
    # o mesmo conceito tem mais de uma grafia no provider: `security_group_ids`
    # no ECS, `security_groups` no MSK, `client_subnets` no cluster e
    # `subnet_ids` no resto. Quem desenha não escolhe a grafia, o recurso é que
    # escolhe, então as duas entram.
    (re.compile(r"(^|_)(vpc_)?security_group_ids$|(^|_)security_groups$"),
     "aws_security_group", "id", True),
    (re.compile(r"(^|_)(vpc_)?security_group_id$"), "aws_security_group", "id", False),
    (re.compile(r"(^|_)subnet_ids$|(^|_)client_subnets$|(^|_)subnets$"),
     "aws_subnet", "id", True),
    (re.compile(r"(^|_)subnet_id$"), "aws_subnet", "id", False),
    (re.compile(r"(^|_)vpc_id$"), "aws_vpc", "id", False),
    # Role não entra nesta tabela, e a auditoria de 2026-08-10 mostrou por quê:
    # `task_role_arn`, `execution_role_arn`, `service_access_role_arn` e
    # `lambda_success_feedback_role_arn` são todos `aws_iam_role`, e nenhum é o
    # mesmo papel. O tipo diz "uma role"; qual role é decisão de desenho, e a
    # ferramenta ligando por tipo punha a role de execução de uma Lambda onde o
    # provider quer a que o Scheduler assume. Fica pergunta.
    (re.compile(r"(^|_)(kms_)?key_arn$"), "aws_kms_key", "arn", False),
    (re.compile(r"(^|_)kms_key_id$"), "aws_kms_key", "id", False),
    (re.compile(r"(^|_)bucket_arn$"), "aws_s3_bucket", "arn", False),
    (re.compile(r"(^|_)log_group_arn$"), "aws_cloudwatch_log_group", "arn", False),
    (re.compile(r"(^|_)topic_arn$"), "aws_sns_topic", "arn", False),
    (re.compile(r"(^|_)queue_arn$"), "aws_sqs_queue", "arn", False),
    (re.compile(r"(^|_)table_arn$"), "aws_dynamodb_table", "arn", False),
]


def pedido_do_argumento(pergunta):
    """(tipo, atributo, é lista) que este argumento pede, quando dá para saber."""
    for rx, tipo, atributo, lista in PEDIDOS:
        if rx.search(pergunta):
            return tipo, atributo, lista
    return None


def outputs_tf(u):
    saidas = saidas_de(u)
    if not saidas:
        return ("# Esta receita não publica saída: nenhum recurso dela expõe id ou arn\n"
                "# no esquema do provider. Endereço que outro dono consome vira\n"
                "# hormônio (aws_ssm_parameter), e não output.\n")
    cab = ("# O que esta célula publica para as vizinhas. É daqui que sai o valor\n"
           "# que a dependência delas consome; endereço que cruza dono vira\n"
           "# hormônio (aws_ssm_parameter), e não output.\n")
    return cab + "".join(
        'output "%s" { value = %s }\n' % (nome, ref) for nome, ref in saidas)


def escreve(caminho, texto):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    io.open(caminho, "w", encoding="utf-8").write(texto)


def main_tf(u):
    recursos, nota = recursos_de(u["servico"])
    cab = ["# Organismo %s: %s" % (u["nome"], u["papel"]),
           "# Zona declarada no bloco: %s · %s" % (u["zona"], u["celulas"]),
           "# Tecido: %s (%s)" % (u.get("durabilidade") or "?",
                                  u.get("por_que_durabilidade", "")),
           ""]
    if nota:
        cab.insert(3, "# %s" % nota)
    corpo, variaveis, perguntas = [], [], []
    conjunto = set(recursos)
    rotulo = rotulo_do(u["nome"])
    if not recursos:
        corpo.append("""# TODO(receita): o mapa de recursos não conhece "%s".
# Consulte o registro do provider e declare aqui os recursos que este serviço
# exige. Nada é gerado às cegas: recurso inventado passa no lint e falha no
# apply, que é o pior momento para descobrir.
""" % u["servico"])
    for r in recursos:
        trava = ""
        if u.get("durabilidade") == "permanente" and r in (
                "aws_s3_bucket", "aws_rds_cluster", "aws_dynamodb_table",
                "aws_kms_key", "aws_glue_registry", "aws_glue_catalog_database",
                "aws_msk_cluster"):
            trava = "\n  # tecido permanente: não cai por destroy\n  lifecycle { prevent_destroy = true }\n"
        prefixo = re.sub(r"^aws_", "", r)
        linhas, vs, ps = exigencias(r, prefixo, conjunto, rotulo)
        variaveis += vs
        perguntas += ps
        corpo.append('resource "%s" "%s" {\n%s\n%s}\n'
                     % (r, rotulo, "\n".join(linhas), trava))
    return "\n".join(cab) + "\n".join(corpo), variaveis, perguntas


def variables_tf(u, pecas, exigidas):
    v = ['variable "nome"     { type = string }',
         'variable "ambiente" { type = string }',
         ""]
    if "conta" in u["celulas"]:
        v.append('variable "conta_alvo" { type = string }')
        v.append("")
    if exigidas:
        v.append("# o que o provider exige para cada recurso desta receita. Cada um é")
        v.append("# uma peça que se troca: valor vem de fora, nunca fixo na receita.")
        v.append("")
        v += exigidas
    if pecas:
        v.append("# as peças que se trocam, tiradas dos Pontos de customização do bloco:")
        for p in pecas:
            v.append("#   %s" % p)
    return "\n".join(v) + "\n"


def ficha(u, perguntas, respostas=None):
    """O guia de leitura desta parte: o que ela é e o que ainda falta.

    Não é arquivo para editar. As respostas moram no terragrunt.hcl da célula,
    e quem usa a tela responde lá pelas Pendências. Aqui só se lê."""
    respostas = respostas or {}
    L = ["# %s" % u["nome"], "",
         "**O que esta parte faz:** %s" % u["papel"], "",
         "Este arquivo é leitura. Você não edita nada aqui.",
         "As respostas moram no `terragrunt.hcl` desta célula: responda pela tela,",
         "em Pendências, ou escreva o valor direto lá.", ""]
    if not perguntas:
        L += ["Esta parte não pede nenhum valor seu. Pode criar direto.", ""]
        return "\n".join(L)

    faltam = [p for p in perguntas if not str(respostas.get(p["nome"]) or "").strip()]
    L += ["## O que falta", ""]
    if not faltam:
        L += ["Nada. As %d respostas estão preenchidas no `terragrunt.hcl`." % len(perguntas), ""]
    else:
        L += ["%s de %d, %s resposta." % (
            len(faltam), len(perguntas),
            "este campo espera" if len(faltam) == 1 else "estes campos esperam"), ""]
    for p in perguntas:
        dada = str(respostas.get(p["nome"]) or "").strip()
        L += ["### %s" % p["pergunta"],
              "",
              "| | |",
              "|---|---|",
              "| campo | `%s` |" % p["nome"],
              "| agora | %s |" % ("`%s`" % dada if dada else "**esperando resposta**"),
              "| exemplo | `%s` |" % p["exemplo"],
              "| formato aceito | %s |" % p["explica"],
              "| se errar | %s |" % p["erra"],
              ""]
    L += ["## O que o bioma já respondeu por você", "",
          "Argumento que aponta outro recurso desta mesma parte não vira pergunta:",
          "o bioma liga sozinho e escreve a ligação no arquivo, com o comentário",
          "`ligado pelo bioma`. Se discordar de um desses, mude no arquivo da",
          "receita, não aqui.", ""]
    return "\n".join(L)


def leitura_da_base(u, bases):
    """A infraestrutura permanente que uma stack de PR precisa ler.

    Nunca por `dependency`: dependency é aplicável, e o plano de uma PR não
    pode ter permissão de mexer na base da conta. Por leitura de estado remoto
    o acesso é físicamente de leitura, e o pior caso é o plano falhar por não
    achar o estado, em vez de alterar o que já existe.
    """
    if not bases:
        return ""
    blocos = []
    for b in bases:
        rotulo = rotulo_do(b["nome"])
        blocos.append("""    data "terraform_remote_state" "%(rotulo)s" {
      backend = include.root.locals.remoto ? "s3" : "local"
      config = include.root.locals.remoto ? {
        bucket = include.root.locals.balde
        key    = "permanente/%(trilho)s/%(alcance)s/%(nome)s/terraform.tfstate"
        region = include.root.locals.regiao
      } : {
        path = "${get_repo_root()}/live/.estado/permanente/%(trilho)s/%(alcance)s/%(nome)s/terraform.tfstate"
      }
    }""" % dict(rotulo=rotulo, trilho=b["trilho"], nome=b["nome"],
                alcance=b.get("alcance", "nprd")))
    return """
# A base desta conta entra por LEITURA, e não por dependency. Dependency é
# aplicável: o plano desta PR poderia mexer na infraestrutura permanente. Aqui
# ele só consegue ler.
generate "base" {
  path      = "base.tf"
  if_exists = "overwrite"
  contents  = <<-EOF
%s
  EOF
}
""" % "\n".join(blocos)


WORKFLOW_PR = """# Ambiente efêmero por PR, gerado pelo bioma.sh
#
# Abre a PR: a stack sobe na conta do domínio, com estado próprio prefixado
# pelo número da PR. Fecha a PR: a mesma stack cai, e só ela, porque o destroy
# enxerga apenas aquele estado. Diariamente: o que passou do prazo cai também,
# porque PR abandonada não fecha e a conta sangra.
#
# Antes de valer, três coisas do lado de vocês:
#   1. o balde de estado precisa existir (TG_BALDE_ESTADO);
#   2. a role assumida precisa poder criar só o que é efêmero (Condition por
#      aws:RequestTag/Ephemeral e aws:ResourceTag/PRNumber);
#   3. o segredo AWS_ROLE_ARN no repositório, com trust para o OIDC do GitHub.
name: Ambiente efêmero da PR

on:
  pull_request:
    types: [opened, synchronize, reopened, closed]
  schedule:
    - cron: "0 6 * * *"

permissions:
  id-token: write
  contents: read
  pull-requests: write

env:
  TG_BALDE_ESTADO: ${{ vars.TG_BALDE_ESTADO }}
  AWS_DEFAULT_REGION: %(regiao)s
  BIOMA_TTL_HORAS: "72"
  ESCOPO: %(escopo)s

jobs:
  subir:
    if: github.event_name == 'pull_request' && github.event.action != 'closed'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_DEFAULT_REGION }}
      - uses: gruntwork-io/terragrunt-action@v2
        env:
          PR_NUMBER: ${{ github.event.number }}
        with:
          tg_dir: ${{ env.ESCOPO }}
          tg_command: run --all apply --non-interactive
      - uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: 'Ambiente efêmero da PR #' + context.issue.number + ' no ar. Ele cai quando esta PR fechar.'
            })

  derrubar:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_DEFAULT_REGION }}
      # o escopo é o caminho da stack efêmera, nunca a raiz: run --all destroy
      # a partir daqui não alcança nenhuma unit de fora deste diretório
      - uses: gruntwork-io/terragrunt-action@v2
        env:
          PR_NUMBER: ${{ github.event.number }}
        with:
          tg_dir: ${{ env.ESCOPO }}
          tg_command: run --all destroy --non-interactive

  faxina:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_DEFAULT_REGION }}
      # por tag, jamais por conta inteira: a varredura enxerga só o que esta
      # esteira criou e já passou do prazo
      - name: O que passou do prazo
        run: |
          limite=$(date -u -d "-${BIOMA_TTL_HORAS} hours" +%%FT%%TZ 2> /dev/null \
            || date -u -v-${BIOMA_TTL_HORAS}H +%%FT%%TZ)
          echo "recursos efêmeros criados antes de $limite:"
          aws resourcegroupstaggingapi get-resources \
            --tag-filters Key=Ephemeral,Values=true \
            --query "ResourceTagMappingList[?Tags[?Key=='CriadoEm' && Value<'$limite']].ResourceARN" \
            --output text
          echo "para derrubar, rode o job derrubar com o PR_NUMBER de cada um."
"""


def bases_de(u, prop):
    """As peças permanentes que esta stack de PR toca.

    Só faz sentido para a stack efêmera: entre células permanentes o vínculo
    já é resolvido por dependência normal, e não há risco de uma apagar a
    outra."""
    if not u.get("efemero_por_pr"):
        return []
    porNome = {x["servico"]: x for x in prop.get("unidades") or []}
    vizinhas, visto = [], set()
    for r in prop.get("relacoes") or []:
        outro = None
        if r.get("origem") == u["servico"]:
            outro = porNome.get(r.get("destino"))
        elif r.get("destino") == u["servico"]:
            outro = porNome.get(r.get("origem"))
        if not outro or outro.get("efemero_por_pr") or outro["nome"] in visto:
            continue
        visto.add(outro["nome"])
        vizinhas.append(outro)
    return vizinhas


def alcances_de(u):
    """Em que alcances esta peça nasce. Uma regra só, porque duas divergiam:
    a célula nascia num caminho e a dependência apontava outro."""
    if u.get("efemero_por_pr"):
        return ["efemero"]
    if u.get("ambientes"):
        return list(u["ambientes"])
    if u.get("natureza_ou") == "fundacional":
        return ["compartilhado"]
    if "plano" in (u.get("celulas") or ""):
        return ["nprd", "prd"]
    return ["conta-observada"]


def miolo_do_tipo(tipo):
    """`aws_lambda_function` -> {"lambda", "function", "lambda_function"}."""
    p = tipo[4:] if tipo.startswith("aws_") else tipo
    partes = p.split("_")
    return set(partes) | {p} | {"_".join(partes[:2])} if len(partes) > 1 else {p}


def consome(tipo_que_pede, tipo_publicado):
    """O recurso `tipo_que_pede` tem argumento que aponta `tipo_publicado`?

    Endereço é o que amarra um recurso a outro: argumento terminado em `_arn`
    ou `_id` cujo nome carrega o miolo do outro tipo. É derivável do esquema, e
    é o que decide quem depende de quem: a seta do desenho diz por onde o dado
    corre, não quem precisa existir antes.
    """
    esq = esquema_do_recurso(tipo_que_pede)
    if not esq:
        return False
    bloco = esq.get("block") or {}
    nomes = list((bloco.get("attributes") or {}).keys())
    for nome, sub in (bloco.get("block_types") or {}).items():
        nomes.append(nome)
        nomes += list(((sub.get("block") or {}).get("attributes") or {}).keys())
    alvo = miolo_do_tipo(tipo_publicado)
    for n in nomes:
        if not (n.endswith("_arn") or n.endswith("_id") or n in ("role", "target")):
            continue
        pedacos = set(n.split("_"))
        if pedacos & alvo:
            return True
    return False


def quem_depende(a, b):
    """(dependente, publicador) para o par, ou None quando não dá para afirmar.

    Sem isto a direção vinha da ponta da seta, e a seta é fluxo de dado: o
    relógio dispara a função, e quem precisa do endereço da função é o relógio.
    Invertido, o grafo ganhava ciclo.
    """
    ra, _ = recursos_de(a.get("servico") or "")
    rb, _ = recursos_de(b.get("servico") or "")
    if not ra or not rb:
        return None
    a_pede = consome(ra[0], rb[0])
    b_pede = consome(rb[0], ra[0])
    if a_pede and not b_pede:
        return a, b
    if b_pede and not a_pede:
        return b, a
    # O esquema nem sempre desempata: o `target.arn` de um agendador aponta
    # qualquer coisa, e o nome não diz o quê. Aí vale a regra do desenho: quem
    # dispara, chama ou publica guarda o endereço do outro, então a origem da
    # seta é quem depende. Era o contrário, e o relógio virava dependente da
    # função que ele dispara.
    return a, b


def sem_ciclo(pares):
    """Descarta a aresta que fecharia um ciclo, e diz qual foi.

    Ciclo entre células trava o terragrunt: ele não sabe por onde começar. Onde
    o desenho tem ida e volta entre duas peças, a segunda não vira dependência.
    """
    vizinhos, mantidos, descartadas = {}, [], []

    def alcanca(a, b, visto=None):
        visto = visto or set()
        if a in visto:
            return False
        visto.add(a)
        return b in vizinhos.get(a, set()) or any(
            alcanca(x, b, visto) for x in vizinhos.get(a, set()))

    # ordem estável: sem isto o corte dependia da ordem da tabela do bloco, e
    # duas execuções podiam manter arestas diferentes
    for dependente, publicador in sorted(pares):
        if alcanca(publicador, dependente):
            descartadas.append((dependente, publicador))
            continue  # fecharia ciclo
        vizinhos.setdefault(dependente, set()).add(publicador)
        mantidos.append((dependente, publicador))
    for d, p in descartadas:
        print("  ciclo no desenho: %s <-> %s. Mantive só um lado; diga qual "
              "precisa existir antes." % (d, p))
    return mantidos


def dependencias_de(u, prop, alcance):
    """As células de que esta depende, pelas setas que chegam nela.

    A seta desenhada é a ordem de criação. Sem virar `dependency`, a estrutura
    sai sem ordem nenhuma, e o comentário de `bases_de` chegou a afirmar que
    isso já era resolvido "por dependência normal", que não existia.
    """
    por_servico = {x["servico"]: x for x in prop.get("unidades") or []}
    # o grafo inteiro decide, e não a aresta isolada: só assim dá para saber
    # qual delas fecharia ciclo
    if "_pares" not in prop:
        pares = []
        # A célula que a seta ligou, e não a primeira do mesmo serviço: com 47
        # contas governadas no desenho, casar por serviço punha a dependência
        # sempre na mesma peça.
        por_caminho = {u["caminho"]: u for u in prop["unidades"] if u.get("caminho")}
        for r in prop.get("relacoes") or []:
            o = por_caminho.get(r.get("de_celula")) or por_servico.get(r.get("origem"))
            d = por_caminho.get(r.get("para_celula")) or por_servico.get(r.get("destino"))
            if not (o and d):
                continue
            # A seta que veio de um `dependency` no disco já diz a direção, e
            # `quem_depende` não tem como confirmá-la: ela desempata pela
            # tabela de recursos da AWS, e a receita do catálogo não está
            # nela. Numa árvore importada, isso deixava toda dependência de
            # fora — a célula saía sem saber de quem ela precisa.
            par = ((o, d) if (r.get("de_celula") and r.get("para_celula")
                              and "depend" in (r.get("flui") or "").lower())
                   else quem_depende(o, d))
            if par:
                pares.append((chave_da_unidade(par[0]), chave_da_unidade(par[1]), r))
        vivos = sem_ciclo([(a, b) for a, b, _ in pares])
        prop["_pares"] = [(a, b, r) for a, b, r in pares if (a, b) in vivos]

    fora, visto = [], set()
    for dependente, publicador, r in prop["_pares"]:
        if dependente != chave_da_unidade(u):
            continue
        par = (u, next((x for x in prop["unidades"]
                        if chave_da_unidade(x) == publicador), None))
        if not par[1]:
            continue
        origem = par[1]
        if chave_da_unidade(origem) == chave_da_unidade(u) \
                or chave_da_unidade(origem) in visto:
            continue
        if origem.get("tipo") in ("fronteira", "artefato"):
            continue  # o que não vira célula não tem de quem depender
        visto.add(chave_da_unidade(origem))
        alcances = alcances_de(origem)
        # trilho pode faltar num desenho que veio da tela sem área declarada:
        # quebrar aqui deixaria a pessoa sem estrutura por um campo em branco
        fora.append({"nome": origem["nome"], "caminho": origem.get("caminho"),
                     # o rótulo que a célula escreveu, quando ela o escreveu:
                     # as fórmulas dela citam `dependency.<rótulo>.outputs`, e
                     # renomear aqui quebrava toda referência do arquivo
                     "rotulo": r.get("rotulo") or origem["nome"],
                     "trilho": origem.get("trilho") or "plataforma",
                     "alcance": alcance if alcance in alcances else alcances[0],
                     "flui": r.get("flui") or "dado",
                     # o mock declara o que a origem publica de verdade. Com
                     # receita do catálogo, quem sabe é o `outputs.tf` dela: a
                     # tabela de recursos da AWS não conhece a peça, e sem isto
                     # toda dependência saía sem mock, como se a origem não
                     # publicasse nada.
                     "saidas": saidas_da_receita_ou_servico(origem),
                     # e o tipo de cada saída é o que deixa casar por tipo em
                     # vez de por pedaço de nome
                     "por_tipo": saidas_por_tipo(origem)})
    return fora


BLOCO_DEP = """# a seta do desenho: %(flui)s. É ela que fixa a ordem de criação.
dependency "%(nome)s" {
  config_path = "%(caminho)s"
%(mock)s}"""

# o mock declara o que a origem publica de verdade. Mock inventado esconde
# receita que não publica nada, e foi assim que uma dependência apontou para
# uma saída inexistente sem ninguém perceber.
BLOCO_MOCK = """
  # sem mock, o plano de quem ainda não aplicou a origem para aqui
  mock_outputs = {
%(mock)s
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan", "init"]
"""

SEM_MOCK = """
  # a origem não publica saída, então não há o que simular: esta dependência
  # existe só para fixar a ordem de criação.
"""


def dependencia_hcl(deps, u, alcance):
    """Os blocos `dependency`, com mock para o plano rodar antes do apply."""
    if not deps:
        return ""
    partes = []
    for d in deps:
        # O caminho relativo entre duas células que sabem onde moram. Montado
        # de trilho e alcance, ele acertava só quando as duas seguiam o mesmo
        # desenho de pastas: numa árvore real, `../09-chave-backup` virava
        # `../../compartilhado/09-chave-backup`, que não existe.
        if u.get("caminho") and d.get("caminho"):
            caminho = os.path.relpath(d["caminho"], u["caminho"])
        elif d["trilho"] == u["trilho"]:
            caminho = "../../%s/%s" % (d["alcance"], d["nome"])
        else:
            caminho = "../../../%s/%s/%s" % (d["trilho"], d["alcance"], d["nome"])
        saidas = d.get("saidas") or []
        if saidas:
            mock = "\n".join('    %-3s = "mock-%s-%s"' % (n, d["nome"], n) for n in saidas)
            corpo = BLOCO_MOCK % dict(mock=mock)
        else:
            corpo = SEM_MOCK
        rot = d.get("rotulo") or d["nome"]
        escrita = (u.get("dependencias") or {}).get(rot)
        if escrita:
            # o corpo que a célula escreveu: o mock dela mostra a forma que o
            # plano precisa ver, e um mock por convenção de nome não a reproduz
            partes.append('%sdependency "%s" {\n%s\n}' % (
                "" if u.get("prosa") else "# a seta do desenho: %s. É ela que fixa a ordem de criação.\n" % (d.get("flui") or "dado"),
                rot, escrita))
            continue
        partes.append(BLOCO_DEP % dict(nome=rot, caminho=caminho,
                                       flui=d["flui"], mock=corpo))
    return "\n" + "\n\n".join(partes) + "\n"


def resposta_da_vizinha(pergunta, deps):
    """A referência que responde esta pergunta, quando uma vizinha a publica.

    A pergunta nasce como `<recurso>_<argumento>`; o que interessa é o
    argumento. Endereço (`*_arn`, `role`, `kms_key_id`) é o que a vizinha
    publica, e só liga quando uma única dependência combina: com duas, a
    ferramenta estaria escolhendo por quem desenhou.
    """
    # Primeiro por tipo: o argumento diz que recurso ele quer, e a vizinha diz
    # que recursos ela cria. Só liga quando uma única vizinha publica aquele
    # tipo; com duas, quem escolhe é quem desenhou, não a ferramenta.
    pedido = pedido_do_argumento(pergunta)
    if pedido:
        tipo, atributo, lista = pedido
        candidatas = [(d, (d.get("por_tipo") or {})[(tipo, atributo)])
                      for d in deps if (tipo, atributo) in (d.get("por_tipo") or {})]
        if len(candidatas) == 1:
            d, saida = candidatas[0]
            ref = "dependency.%s.outputs.%s" % (d["nome"], saida)
            return "[%s]" % ref if lista else ref
        return None

    if not pergunta.endswith("_arn"):
        return None
    # Fora da tabela de tipos, sobra o nome, e aí a régua é estrita: ARN de
    # papel, chave ou log é de outro tipo de recurso, e casar por substring
    # punha o ARN do cluster onde o provider quer o de uma role, que o Terraform
    # aceita porque os dois são texto. Errado calado é pior que PREENCHER.
    alvo = pergunta[:-4]
    if any(p in alvo for p in ("role", "kms", "key", "log", "policy", "topic",
                               "queue", "bucket_notification")):
        return None
    candidatas = []
    for d in deps:
        if "arn" not in (d.get("saidas") or []):
            continue
        pedaco = re.sub(r"[^a-z0-9]+", "_", d["nome"].lower()).strip("_")
        # o nome da vizinha precisa fechar o argumento, e não só aparecer nele:
        # `msk` casava dentro de `mskconnect_connector_service_execution_role`
        if pedaco and (alvo.endswith("_" + pedaco) or alvo == pedaco):
            candidatas.append(d)
    if len(candidatas) != 1:
        return None
    return "dependency.%s.outputs.arn" % candidatas[0]["nome"]


def valor_hcl(v):
    """O valor como HCL, e não como JSON.

    `json.dumps(None)` é `null` e coincide, mas `json.dumps` de uma resposta
    que já veio como texto punha aspas em `null` e em `true`. O tipo chega
    aqui pronto do leitor de HCL: emitir é escolher a forma, não adivinhar.
    """
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return json.dumps(v)
    return json.dumps(v, ensure_ascii=False)


def saidas_da_receita_ou_servico(u):
    """O que esta peça publica: pelo `outputs.tf` da receita, ou pelo serviço."""
    r = u.get("receita")
    if r:
        sys.path.insert(0, AQUI)
        from traduzir_bloco import saidas_da_receita
        fora = list(saidas_da_receita(r))
        if fora:
            return fora
    return [n for n, _ in saidas_de(u)]


def chave_da_unidade(u):
    """Como esta peça se identifica: onde ela mora, ou o nome quando não sabe.

    Nome repete. Duas células da mesma receita têm o mesmo nome, e indexar por
    ele fazia a dependência de uma valer para as duas.
    """
    return u.get("caminho") or u.get("nome") or ""


def celulas_no_live(u, destino, prop, perguntas):
    """Os terragrunt.hcl desta peça, e os caminhos escritos.

    A célula que sabe onde mora não se multiplica por alcance: o caminho dela
    já diz o ambiente. Multiplicar dava duas pastas para uma célula só, e as
    duas escreviam por cima da vizinha de mesmo nome — 199 nós viravam 357
    arquivos e nenhum casava com o disco.
    """
    alcances = ([u["caminho"].split("/")[-2] if "/" in u["caminho"] else "prd"]
                if u.get("caminho") else alcances_de(u))
    # A unidade que aponta receita do catálogo já traz as perguntas DELA,
    # postas pelo tradutor a partir do `variables.tf`. Elas vencem: as daqui
    # são deduzidas do serviço da AWS e servem ao desenho que nasce do zero.
    if not (u.get("receita") and u.get("perguntas")):
        u["perguntas"] = perguntas
    fora = []
    for alc in alcances:
        p = os.path.join(destino, "live",
                         u["caminho"] if u.get("caminho")
                         else os.path.join(u["trilho"], alc, u["nome"]),
                         "terragrunt.hcl")
        # um `../` por pasta entre a célula e a raiz do live: o catálogo é
        # irmão das células, e não filho da pasta que as contém. Contando a
        # partir de `destino`, o `live/` entrava na conta e o `source` subia um
        # nível a mais do que devia.
        prof = len(os.path.relpath(os.path.dirname(p),
                                   os.path.join(destino, "live")).split(os.sep))
        # As mesmas perguntas que a tela mostra, e não as deduzidas do serviço:
        # é por esta lista que o terragrunt sabe quais chaves emitir.
        # As chaves que a árvore resolve entram na lista mesmo sem serem
        # pergunta: elas saem do `inputs` como referência, e ficando de fora o
        # arquivo gerado perdia as linhas que ligam a célula às vizinhas.
        emitir = [(q["nome"], q.get("pergunta", "")) for q in (u.get("perguntas") or perguntas)]
        ja = {n for n, _ in emitir}
        # Tudo que a célula respondeu sai, mesmo o que a receita não declara:
        # `ambiente` não é variável da receita e estava escrito no arquivo, e
        # ficando de fora o gerado perdia a linha sem dizer.
        # Com a ordem lida do disco, ela é a lista fiel do que o arquivo tem:
        # resposta fora dela veio do importador, e não da célula. O `nome`
        # deduzido do nome da pasta entrava como input que ninguém escreveu.
        if u.get("ordem"):
            emitir = [(n, dict(emitir).get(n, "")) for n in u["ordem"]]
        else:
            emitir += [(n, "") for n in list(u.get("formulas") or {})
                       + list(u.get("respostas") or {})
                       if n not in ja and not ja.add(n)]
        # A ordem em que a célula escreveu vence a da receita: ela é escolha de
        # quem desenhou, e reordenar devolvia outro arquivo com o mesmo efeito.
        ordem = u.get("ordem") or []
        if ordem:
            posicao = {n: i for i, n in enumerate(ordem)}
            emitir.sort(key=lambda par: posicao.get(par[0], len(ordem) + 1))
        escreve(p, celula_hcl(u, prof, alc, emitir,
                              (u.get("respostas") or {}),
                              bases_de(u, prop),
                              dependencias_de(u, prop, alc)))
        fora.append(p)
    return fora


def bloco_de_inputs(perguntas, respostas, formulas, opcionais, notas, quebras, deps):
    """As linhas de `inputs`, alinhadas por grupo como o `hclfmt` alinha.

    O alinhamento não é por coluna fixa: o `terragrunt hclfmt` alinha cada
    grupo contíguo pelo maior nome dele, e um comentário ou uma linha em
    branco abre grupo novo. Com uma coluna fixa, um bloco de nomes curtos
    ficava com trinta espaços no meio e nenhum arquivo casava com o que a
    instância mantém à mão.
    """
    respostas = respostas or {}
    linhas = []
    for n, d in perguntas:
        if n in formulas:
            # o que a célula escreveu vence o que a ferramenta deduziria: a
            # dedução casa por nome, e por nome `vpc_id` acha `outputs.id`
            valor, comentario = formulas[n], ""
        elif n in respostas and respostas[n] != "":
            valor, comentario = valor_hcl(respostas[n]), ""
        elif resposta_da_vizinha(n, deps):
            valor, comentario = resposta_da_vizinha(n, deps), " # a seta do desenho já respondeu"
        elif n in opcionais:
            continue
        else:
            valor, comentario = '"PREENCHER"', " # %s" % (d or "veja LEIA.md")
        linhas.append((n, valor, comentario, notas.get(n), n in quebras))

    fora, grupo = [], []

    def despeja():
        if not grupo:
            return
        larg = max(len(n) for n, _, _, _, _ in grupo)
        for n, valor, comentario, _, _ in grupo:
            fora.append("  %-*s = %s%s" % (larg, n, valor, comentario))
        grupo[:] = []

    for item in linhas:
        n, valor, comentario, nota, quebra = item
        if quebra or nota:
            despeja()
            if quebra:
                fora.append("")
            if nota:
                fora.append(nota)
        grupo.append(item)
    despeja()
    if notas.get("__fim__"):
        fora.append(notas["__fim__"])
    return "".join(l + "\n" for l in fora)


def caminho_root_de(le_o_root):
    """O corpo do `include "root"`, com `expose` só onde a célula lê o root."""
    return ('  path   = find_in_parent_folders("root.hcl")\n  expose = true\n'
            if le_o_root else '  path = find_in_parent_folders("root.hcl")\n')


def por_arranjo(u, arranjo, topo, corpo_root, receita, sobe, deps_hcl, base, inputs, cabeca):
    """O arquivo montado na ordem em que a célula o escreveu.

    A ordem dos blocos é decisão de quem escreveu: numa célula da esteira, é
    entre `terraform` e a dependência que mora a explicação de por que ali NÃO
    existe um `dependency`. Montando sempre na mesma ordem, esse comentário
    aterrissava no meio de outro assunto.
    """
    escritas = u.get("dependencias") or {}
    blocos = u.get("blocos") or []
    partes = [topo]
    # as dependências que o desenho tem e a célula não listou entram no fim,
    # antes do `inputs`: seta nova no desenho vira bloco novo no arquivo
    ja = set()
    fora = []
    for passo in arranjo:
        item, cabe = passo["item"], passo.get("cabeca")
        if cabe:
            fora.append(cabe)
        if item == "include":
            fora.append('include "root" {\n%s}' % corpo_root)
        elif item == "terraform":
            fora.append('terraform {\n'
                        '  # no live real: git::<catalogo>//%s?ref=<tag do catalogo.hcl>\n'
                        '  source = "%scatalogo//%s"\n}' % (receita, sobe, receita))
        elif item.startswith("dep:"):
            rot = item[4:]
            ja.add(rot)
            if rot in escritas:
                fora.append('dependency "%s" {\n%s\n}' % (rot, escritas[rot]))
        elif item.startswith("livre:"):
            i = int(item[6:])
            if i < len(blocos):
                fora.append(blocos[i])
        elif item == "inputs":
            novas = "\n".join(b for b in (deps_hcl or "").split("\n\n")
                              if b.strip() and not any(
                                  ('dependency "%s"' % r) in b for r in ja))
            if novas.strip():
                fora.append(novas.strip())
            fora.append("inputs = {\n%s%s}" % (cabeca, inputs))
    partes.append("\n\n".join(fora))
    return "\n".join(partes).rstrip("\n") + "\n"


def celula_hcl(u, profundidade, alcance, perguntas=(), respostas=None, bases=(), deps=()):
    sobe = "../" * profundidade
    # A receita que a peça aponta, e não uma deduzida do trilho e do nome. O
    # desenho pedia `ligacoes/acesso-ao-dominio` e a célula saía apontando
    # `organismos/<trilho>/<nome>`, que não existe no catálogo: das 65 receitas
    # pedidas por esta árvore, 65 saíam com endereço trocado.
    receita = u.get("receita") or ("organismos/%s/%s" % (u["trilho"], u["nome"]))
    # `nome` e `ambiente` no cabeçalho eram input que ninguém respondeu, e
    # `nome` ainda saía duas vezes no mesmo bloco quando a ficha o respondia.
    # Só entram onde não há receita para dizer o que a célula exige.
    # Variável com default na receita e sem resposta não é pendência: o
    # framework herda o valor, e escrever PREENCHER ali põe a palavra dentro
    # do Terraform. A célula do backup saía pedindo três agendas que a receita
    # já resolve.
    opcionais = {q["nome"] for q in (u.get("perguntas") or [])
                 if q.get("obrigatoria") is False}
    # O que a árvore preenche sozinha volta escrito como a célula o escreveu.
    formulas = u.get("formulas") or {}
    # O comentário que a pessoa escreveu acima de cada resposta.
    notas = u.get("notas") or {}

    def nota(n):
        return (notas[n] + "\n") if n in notas else ""


    cabeca = "" if u.get("receita") else (
        '  nome     = "%s"\n  ambiente = "%s"\n' % (u["nome"], alcance))
    # A prosa da célula vence o aviso genérico: ela diz por que a peça existe
    # e o que já deu errado nela, e é o que a pessoa escreveu.
    topo = u.get("prosa") or (
        "# célula: %s\n"
        "# gerada a partir do desenho; a próxima geração sobrescreve. Os inputs são a\n"
        "# parte sua: responda pela tela, ou escreva o valor aqui mesmo."
        % (u.get("caminho") or ("%s/%s/%s" % (u["trilho"], alcance, u["nome"]))))
    # Os blocos que nenhum parâmetro gera entram antes das dependências, que é
    # onde a célula os escreveu.
    livres = "".join("\n" + b + "\n" for b in (u.get("blocos") or []))
    arranjo = u.get("arranjo") or []
    # `expose` só onde a célula lê os locals do root. Emitido sempre, ele
    # aparecia em duzentas células que nunca o usam, e nenhuma delas casava
    # com o arquivo que a instância mantém à mão.
    le_o_root = "include.root" in (livres + json.dumps(u.get("formulas") or {}))
    if arranjo:
        return por_arranjo(u, arranjo, topo, caminho_root_de(le_o_root), receita,
                           sobe, dependencia_hcl(deps, u, alcance),
                           leitura_da_base(u, bases),
                           bloco_de_inputs(perguntas, respostas, formulas, opcionais,
                                           notas, u.get("quebras") or [], deps),
                           cabeca)
    return """%(topo)s
include "root" {
%(caminho_root)s}

terraform {
  # no live real: git::<catalogo>//%(receita)s?ref=<tag do catalogo.hcl>
  source = "%(sobe)scatalogo//%(receita)s"
}
%(livres)s%(deps)s%(base)s
inputs = {
%(cabeca)s%(pendentes)s}
""" % dict(trilho=u["trilho"], nome=u["nome"], alcance=alcance, sobe=sobe,
           receita=receita, cabeca=cabeca, topo=topo, livres=livres,
           caminho_root=caminho_root_de(le_o_root),
           deps=dependencia_hcl(deps, u, alcance),
           base=leitura_da_base(u, bases),
           pendentes=bloco_de_inputs(perguntas, respostas, formulas, opcionais,
                                     notas, u.get("quebras") or [], deps))


# serviços que o degrau local emula. Endpoint fora desta lista vai para a AWS
# de verdade, e é assim que se descobre que faltou emular alguma coisa.
EMULADOS = [
    "acm", "apigateway", "apigatewayv2", "athena", "backup", "cloudformation",
    "cloudtrail", "cloudwatch", "codebuild", "codepipeline", "config",
    "dynamodb", "ec2", "ecr", "ecs", "eks", "elasticache", "events", "firehose",
    "glue", "iam", "kafka", "kinesis", "kms", "lambda", "logs", "rds",
    "route53", "s3", "scheduler", "secretsmanager", "sfn", "sns", "sqs", "ssm",
    "sts", "wafv2",
]

ROOT_HCL = """# A raiz do live: o que toda célula herda por `include "root"`. Sem ele o
# terragrunt não acha onde guardar estado nem como falar com a nuvem.

locals {
  modo     = get_env("TG_MODO", "aws")
  regiao   = get_env("TG_REGIAO", "DECLARE_TG_REGIAO")
  emulador = get_env("BIOMA_EMULADOR", "http://localhost:4566")
  emulados = [EMULADOS]

  # A PR que está sendo provisionada, quando houver. Ela prefixa a chave do
  # estado e etiqueta todo recurso: sem esse prefixo, o plano da PR enxergaria
  # o estado da infraestrutura permanente da mesma conta, e o destroy do
  # fechamento viraria roleta.
  pr      = get_env("PR_NUMBER", "")
  efemero = local.pr != ""
  prefixo = local.efemero ? "efemero/pr-${local.pr}" : "permanente"

  # O balde do estado. Vazio mantém o estado em disco, que é o padrão de quem
  # está desenhando; preenchido, o estado vai para o S3 da instância.
  balde  = get_env("TG_BALDE_ESTADO", "")
  remoto = local.balde != ""

  # A faxina precisa achar o que expirou sem varrer a conta inteira, e a role
  # da esteira precisa condicionar por tag. As duas coisas vivem daqui.
  ttl_horas = get_env("BIOMA_TTL_HORAS", "72")
  marcas = merge(
    { Origem = "bioma.sh" },
    local.efemero ? {
      Ephemeral = "true"
      PRNumber  = local.pr
      CriadoEm  = timestamp()
      TTLHoras  = local.ttl_horas
    } : {},
  )
}

# Onde o estado mora. Em disco por padrão, porque a árvore nasce de um desenho
# e ainda não é repositório de instância. Com TG_BALDE_ESTADO preenchido, vai
# para o S3, e a chave começa no prefixo: `permanente/...` para o que dura,
# `efemero/pr-1234/...` para a stack de uma PR. É esse prefixo que garante que
# o destroy do fechamento não enxergue um único recurso da infraestrutura
# permanente da mesma conta.
remote_state {
  backend = local.remoto ? "s3" : "local"
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite"
  }
  config = local.remoto ? {
    bucket       = local.balde
    key          = "${local.prefixo}/${path_relative_to_include()}/terraform.tfstate"
    region       = local.regiao
    encrypt      = true
    use_lockfile = true
  } : {
    path = "${get_parent_terragrunt_dir()}/.estado/${local.prefixo}/${path_relative_to_include()}/terraform.tfstate"
  }
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite"
  contents  = <<-EOF
    provider "aws" {
      region = "${local.regiao}"

      default_tags {
        tags = ${jsonencode(local.marcas)}
      }

%{ if local.modo == "local" ~}
      access_key                  = "teste"
      secret_key                  = "teste"
      skip_credentials_validation = true
      skip_metadata_api_check     = true
      skip_requesting_account_id  = true
      s3_use_path_style           = true
      endpoints {
%{ for s in local.emulados ~}
        ${s} = "${local.emulador}"
%{ endfor ~}
      }
%{ endif ~}
    }
  EOF
}
"""


def root_hcl():
    return ROOT_HCL.replace("EMULADOS", ", ".join('"%s"' % s for s in EMULADOS))


# Quem guarda o recurso é quem autoriza: a política mora no lado de quem é
# acessado. Tabela escrita à mão, do mesmo jeito que a de recursos: adivinhar
# o recurso de política gera Terraform plausível que falha no apply.
POLITICA_DO_DESTINO = {
    "aws_s3_bucket": ("aws_s3_bucket_policy", "bucket", "s3:GetObject, s3:PutObject"),
    "aws_sqs_queue": ("aws_sqs_queue_policy", "queue_url", "sqs:SendMessage"),
    "aws_sns_topic": ("aws_sns_topic_policy", "arn", "sns:Publish"),
    "aws_kms_key": ("aws_kms_key_policy", "key_id", "kms:Decrypt, kms:GenerateDataKey"),
    "aws_secretsmanager_secret": ("aws_secretsmanager_secret_policy", "secret_arn",
                                  "secretsmanager:GetSecretValue"),
    "aws_ecr_repository": ("aws_ecr_repository_policy", "repository", "ecr:GetDownloadUrlForLayer"),
    "aws_glue_catalog_database": ("aws_lakeformation_permissions", "database", "SELECT"),
    "aws_dynamodb_table": (None, None, "dynamodb:GetItem, dynamodb:PutItem"),
    "aws_msk_cluster": (None, None, "kafka-cluster:Connect, kafka-cluster:WriteData"),
}

# Um canal tem receita própria quando a AWS tem um recurso feito para ele.
CANAL_PROPRIO = {
    "subscription": ("aws_cloudwatch_log_subscription_filter", """
resource "aws_cloudwatch_log_subscription_filter" "esta" {
  name            = "%(nome)s"
  log_group_name  = var.origem_log_group
  destination_arn = var.destino_arn
  filter_pattern  = var.filtro
  role_arn        = var.role_entrega_arn
}

variable "origem_log_group" { type = string }
variable "destino_arn"      { type = string }
variable "role_entrega_arn" { type = string }
variable "filtro"           { type = string, default = "" }
"""),
}


def ligacao_tf(rel):
    cab = """# Ligação %(nome)s: %(flui)s
# Por que é ligação: %(por_que)s
# Canal declarado no bloco: %(canal)s
#
# Ligação tem permissão dos DOIS lados e state próprio. Ela mora no live de
# quem tem a permissão de criar, que aqui é o trilho %(dono)s.
""" % dict(nome=rel["nome"], flui=rel["flui"], por_que=rel["por_que"],
           canal=rel["canal"], dono=rel.get("dono") or "a confirmar")

    canal = (rel.get("canal") or "").strip().lower()
    if canal in CANAL_PROPRIO:
        return cab + (CANAL_PROPRIO[canal][1] % dict(nome=rel["nome"]))

    destino = (rel.get("recurso_destino") or "").strip()
    politica, campo, acoes = POLITICA_DO_DESTINO.get(destino, (None, None, "a ação que o consumo exige"))

    corpo = ["", "# O lado de quem consome: um papel com a permissão declarada.",
             '''resource "aws_iam_role" "consumidor" {
  name               = "%s-consumidor"
  assume_role_policy = data.aws_iam_policy_document.confia.json
}

data "aws_iam_policy_document" "confia" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "AWS"
      identifiers = [var.conta_consumidora]
    }
  }
}

data "aws_iam_policy_document" "pode" {
  statement {
    actions   = var.acoes
    resources = [var.recurso_destino_arn]
  }
}

resource "aws_iam_role_policy" "consumidor" {
  role   = aws_iam_role.consumidor.id
  policy = data.aws_iam_policy_document.pode.json
}
''' % rel["nome"]]

    if politica:
        corpo.append("# O lado de quem guarda o recurso: a política que autoriza o papel acima.")
        corpo.append('''data "aws_iam_policy_document" "autoriza" {
  statement {
    actions   = var.acoes
    resources = [var.recurso_destino_arn]
    principals {
      type        = "AWS"
      identifiers = [aws_iam_role.consumidor.arn]
    }
  }
}

resource "%s" "esta" {
  %s = var.%s
  policy = data.aws_iam_policy_document.autoriza.json
}
''' % (politica, campo, campo))
    else:
        corpo.append("# Este destino não tem recurso de política próprio: a permissão")
        corpo.append("# vive inteira no papel do consumidor, acima.")

    corpo.append('''
variable "conta_consumidora"   { type = string }
variable "recurso_destino_arn" { type = string }
variable "acoes" {
  type        = list(string)
  description = "o que o consumo exige"
  default     = [%s]
}''' % ", ".join('"%s"' % a.strip() for a in acoes.split(",")))

    if campo:
        corpo.append('variable "%s" { type = string }' % campo)

    return cab + "\n".join(corpo) + "\n"


def main():
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        sys.exit(2)
    # conferir uma árvore já escrita: é o que a tela chama na hora de entregar
    if sys.argv[1] == "--so-conferir":
        conferir(sys.argv[2])
        return
    prop = json.load(io.open(sys.argv[1], encoding="utf-8"))
    destino = sys.argv[sys.argv.index("--destino") + 1] if "--destino" in sys.argv else None
    if not destino:
        print("falta --destino", file=sys.stderr)
        sys.exit(2)
    if os.path.exists(destino) and "--forcar" in sys.argv:
        shutil.rmtree(destino)

    pecas = prop.get("pecas_que_se_trocam", [])
    escritos = []

    for u in prop["unidades"]:
        if u["tipo"] == "artefato":
            # artefato é entregue à esteira, e não aplicado pelo comando: ele
            # entra no pacote que a pessoa leva, e nunca vira célula no live
            # o interior do artefato vai junto: sem os arquivos, quem recebe a
            # árvore da esteira recebe um leia-me falando de workflows que não
            # estão lá
            fonte = os.path.join(AQUI, os.pardir, "catalogo", "artefatos", u["nome"])
            fonte = os.path.normpath(fonte)
            if os.path.isdir(fonte):
                import shutil
                for base, _dd, arqs in os.walk(fonte):
                    for a_ in arqs:
                        de = os.path.join(base, a_)
                        para = os.path.join(destino, "artefatos", u["nome"],
                                            os.path.relpath(de, fonte))
                        os.makedirs(os.path.dirname(para), exist_ok=True)
                        shutil.copy2(de, para)
                        escritos.append(para)
            p = os.path.join(destino, "artefatos", u["nome"], "LEIA-ME.md")
            escreve(p, "# artefato: %s\n\n%s\n\n**Dono:** %s\n\n"
                       "**O que ele entrega:**\n%s\n\n"
                       "**Onde ele roda:** na esteira de quem opera, e não no live. "
                       "O comando não aplica artefato.\n"
                       % (u["servico"], u["papel"], u["zona"],
                          "\n".join("- `%s`" % a for a in (u.get("entrega") or []))
                          or "- (o interior está no catálogo)"))
            escritos.append(p)
            continue
        if u["tipo"] == "fronteira":
            p = os.path.join(destino, "catalogo/fronteiras", u["nome"], "CONTRATO.md")
            escreve(p, "# fronteira: %s\n\n%s\n\n**Por que é fronteira:** %s\n\n"
                       "**A nossa ponta:** o que entra na nossa nuvem é só o lado de cá "
                       "(credencial, endpoint, exportador). O serviço em si não tem receita "
                       "aqui, e nunca terá.\n" % (u["servico"], u["papel"],
                                                  u["por_que_esse_tipo"]))
            escritos.append(p)
            continue

        # A peça que o desenho aponta é copiada do catálogo, e não deduzida
        # de novo a partir do serviço. Deduzir dava um `main.tf` plausível com
        # outro nome e outro conteúdo: das 65 receitas que esta árvore pede,
        # nenhuma aparecia no que saiu. A dedução continua valendo onde não há
        # receita, que é o desenho nascido na tela.
        # A peça que veio no projeto vence a do framework: ela é a que a
        # instância usa, e é a que o `.bio` carrega.
        propria = (prop.get("catalogo_proprio") or {}).get(u.get("receita") or "")
        if propria:
            base = os.path.join(destino, "catalogo", u["receita"])
            for arq, texto in sorted(propria.items()):
                escreve(os.path.join(base, arq), texto)
                escritos.append(os.path.join(base, arq))
            _c, _e, perguntas = main_tf(u)
            escritos += celulas_no_live(u, destino, prop, perguntas)
            continue

        do_catalogo = os.path.join(AQUI, os.pardir, "catalogo", u["receita"]) \
            if u.get("receita") else None
        if do_catalogo and os.path.isdir(do_catalogo):
            base = os.path.join(destino, "catalogo", u["receita"])
            for arq in sorted(os.listdir(do_catalogo)):
                if not arq.endswith((".tf", ".md", ".json", ".py", ".sh")):
                    continue
                de = os.path.join(do_catalogo, arq)
                if not os.path.isfile(de):
                    continue
                escreve(os.path.join(base, arq), io.open(de, encoding="utf-8").read())
                escritos.append(os.path.join(base, arq))
            _corpo, _exig, perguntas = main_tf(u)
            if not (u.get("receita") and u.get("perguntas")):
                u["perguntas"] = perguntas
            escritos += celulas_no_live(u, destino, prop, perguntas)
            continue

        base = os.path.join(destino, "catalogo/organismos", u["trilho"], u["nome"])
        corpo, exigidas, perguntas = main_tf(u)
        recursos_desta, _nota = recursos_de(u.get("servico") or "")
        recursos_desta = refina_por_papel(u.get("servico"), u.get("papel"), recursos_desta)
        escreve(os.path.join(base, "versions.tf"), versions_tf(recursos_desta))
        escreve(os.path.join(base, "main.tf"), corpo)
        escreve(os.path.join(base, "variables.tf"), variables_tf(u, pecas, exigidas))
        escreve(os.path.join(base, "outputs.tf"), outputs_tf(u))
        escritos += [os.path.join(base, f) for f in
                     ("versions.tf", "main.tf", "variables.tf", "outputs.tf")]

        # células no live, pelo alcance que a multiplicidade declarou.
        # Nome de pasta sem sinal de menor e maior: o alcance vira caminho de
        # verdade, e caminho com < > quebra glob de shell e fila do terragrunt.
        # A stack da PR mora num alcance próprio, e o caminho carrega o
        # identificador: é ele que separa o estado do da infraestrutura
        # permanente da mesma conta.
        # A pasta é uma só: `efemero/`. Quem separa uma PR da outra é a chave
        # do estado, que carrega o número (ver root.hcl). Pasta por PR exigiria
        # o pipeline materializar diretório, e o terragrunt não interpola nome
        # de pasta.
        # A natureza da OU decide os alcances: workload tem três, capacidade de
        # plataforma tem dois, conta fundacional tem um. Antes disto todo mundo
        # caía em nao-prod e prod, e workload nascia com uma célula a menos.
        # A célula que sabe onde mora não se multiplica por alcance: o
        # caminho dela já diz o ambiente. Multiplicar dava duas pastas para
        # uma célula só, e as duas escreviam por cima da vizinha de mesmo
        # nome — 199 nós viravam 357 arquivos e nenhum casava com o disco.
        escritos += celulas_no_live(u, destino, prop, perguntas)

    for rel in prop["relacoes"]:
        if rel["vira"] != "ligação":
            continue
        rel = dict(rel)
        cru = ("%s-para-%s" % (rel["origem"], rel["destino"]))
        sem = unicodedata.normalize("NFKD", cru).encode("ascii", "ignore").decode()
        rel["nome"] = re.sub(r"[^a-z0-9]+", "-", sem.lower()).strip("-")[:48]
        # o recurso do destino decide qual política escrever
        recursos_destino, _ = recursos_de(rel["destino"])
        rel["recurso_destino"] = recursos_destino[0] if recursos_destino else ""
        p = os.path.join(destino, "catalogo/ligacoes", rel["nome"], "main.tf")
        escreve(p, ligacao_tf(rel))
        escreve(os.path.join(os.path.dirname(p), "versions.tf"), VERSIONS)
        escritos += [p, os.path.join(os.path.dirname(p), "versions.tf")]

    if any(e.startswith(os.path.join(destino, "live")) for e in escritos):
        raiz = os.path.join(destino, "live", "root.hcl")
        escreve(raiz, root_hcl())
        escritos.append(raiz)

    # A esteira nasce junto: sem ela, a stack de PR é uma pasta que ninguém
    # sabe quando criar nem quando derrubar.
    efemeras = [u for u in prop["unidades"] if u.get("efemero_por_pr")]
    if efemeras:
        trilho = efemeras[0]["trilho"]
        caminho = os.path.join(destino, ".github", "workflows", "ambiente-efemero.yml")
        escreve(caminho, WORKFLOW_PR % dict(
            regiao=None,
            escopo="live/%s/efemero" % trilho))
        escritos.append(caminho)

    # a proposta volta ao disco com as perguntas de cada unidade: é por ela
    # que a tela sabe o que perguntar, agora que não existe perguntas.json
    json.dump(prop, io.open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("escritos %d arquivos em %s" % (len(escritos), destino))
    for e in sorted(escritos):
        print("  " + os.path.relpath(e, destino))

    if "--conferir" in sys.argv:
        conferir(destino)


def conferir(destino):
    """Roda o validate em cada receita e escreve no arquivo o que faltou.

    Parte do que o provider exige não está no esquema: a regra do tipo "um
    destes três" só aparece quando o validate roda. Em vez de deixar isso como
    surpresa, o gerador pergunta e anota a resposta do próprio Terraform dentro
    do main.tf.

    O provider da AWS tem centenas de megabytes, e um `init` por receita torna a
    conferência inviável: dezesseis em paralelo estouraram cinco minutos cada
    nesta máquina. Aqui o `init` roda uma vez numa bancada, e cada receita é
    copiada para dentro dela e validada reusando o mesmo `.terraform`.
    """
    # o binário é configurável porque o `terraform` do PATH pode ser de outra
    # arquitetura: sob emulação o provider não inicia dentro do timeout, e a
    # conferência ficaria travada sem dizer por quê.
    tf = os.environ.get("BIOMA_TERRAFORM") or shutil.which("terraform")
    if not tf:
        print("conferência pulada: não achei o terraform. "
              "Aponte com BIOMA_TERRAFORM=<caminho>.")
        return

    raizes = []
    for base, _dirs, arqs in os.walk(destino):
        if "main.tf" in arqs and ".terraform" not in base:
            raizes.append(base)
    if not raizes:
        return

    # o provider que o validate abre é neto deste processo e não sai sozinho:
    # quem cuida de matá-lo, e da pasta, é a oficina.
    bancada = oficina.pasta("bioma-conferencia-")
    try:
        shutil.copy2(os.path.join(raizes[0], "versions.tf"), bancada)
        rc, saida = oficina.roda(
            [tf, "init", "-backend=false", "-input=false", "-no-color"], 600,
            cwd=bancada)
        if rc == oficina.ESTOURO:
            print("conferência pulada: o terraform não inicializou dentro do tempo.")
            return
        if rc != 0:
            print("conferência pulada: o terraform não inicializou nesta máquina.")
            print((saida.strip().splitlines() or [""])[-1][:120])
            return

        ok = 0
        for r in sorted(raizes):
            for a in os.listdir(bancada):
                if a.endswith(".tf"):
                    os.remove(os.path.join(bancada, a))
            for a in os.listdir(r):
                if a.endswith(".tf"):
                    shutil.copy2(os.path.join(r, a), bancada)
            rc, saida = oficina.roda([tf, "validate", "-no-color"], 180, cwd=bancada)
            if rc == 0:
                ok += 1
                continue
            queixa = (["o terraform não respondeu a tempo nesta máquina"]
                      if rc == oficina.ESTOURO
                      else [l.strip("│ ").rstrip()
                            for l in saida.split("\n") if l.strip("│ ").strip()])
            nota = ["", "# TODO(o provider reclamou): o esquema não declara esta exigência,",
                    "# e ela só aparece no validate. A resposta dele, sem edição:", "#"]
            nota += ["#   " + q for q in queixa[:12]]
            with io.open(os.path.join(r, "main.tf"), "a", encoding="utf-8") as f:
                f.write("\n".join(nota) + "\n")
            print("  anotado o que falta em %s" % os.path.relpath(r, destino))
        print("conferência: %d de %d validam sem intervenção" % (ok, len(raizes)))
    finally:
        oficina.solta(bancada)


if __name__ == "__main__":
    main()
