#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""As regras da receita, conferidas sem nuvem e sem provider.

`terraform validate` prova sintaxe. Ele não prova que a receita fecha: uma
dependência pode apontar para uma célula que não publica nada, e o `mock_outputs`
responde no lugar do output que não existe. Foi assim que uma ligação quebrada
passou por boa.

Estas regras rodam em segundos, sobre a árvore que o gerador escreve.

  python3 testes/unidade.py            as duas fontes (desenho fixo e bloco real)
  python3 testes/unidade.py <arvore>   uma árvore já gerada
"""
import io
import json
import os
import re
import subprocess
import sys
import tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
FERR = os.path.join(RAIZ, "ferramentas")
sys.path.insert(0, FERR)
import oficina

DEP = re.compile(r'dependency\s+"([^"]+)"\s*\{(.*?)\n\}', re.S)
CONFIG_PATH = re.compile(r'config_path\s*=\s*"([^"]+)"')
MOCK = re.compile(r"mock_outputs\s*=\s*\{(.*?)\n\s*\}", re.S)
CHAVE_MOCK = re.compile(r"^\s*([a-z_]+)\s*=", re.M)
OUTPUT = re.compile(r'output\s+"([^"]+)"')
RECURSO = re.compile(r'^resource\s+"([^"]+)"\s+"([^"]+)"', re.M)
ATRIBUTO = re.compile(r'^\s{2}([a-z_0-9]+)\s*=\s*(.+?)\s*(?:#.*)?$', re.M)

falhas = []


def erra(regra, onde, detalhe):
    falhas.append((regra, onde, detalhe))


# A árvore do bioma separa `live/` de `catalogo/`, e a de terceiros não segue
# convenção nenhuma. As regras valem para as duas: célula é pasta com
# terragrunt.hcl, receita é pasta com main.tf, onde quer que estejam.
IGNORA = (".terragrunt-cache", ".terraform", ".git", "node_modules")


def _anda(raiz):
    for base, dirs, arqs in os.walk(raiz):
        dirs[:] = [d for d in dirs if d not in IGNORA]
        yield base, arqs


def celulas(arvore):
    dentro = os.path.join(arvore, "live")
    for base, arqs in _anda(dentro if os.path.isdir(dentro) else arvore):
        if "terragrunt.hcl" in arqs:
            yield os.path.join(base, "terragrunt.hcl")


def receitas(arvore):
    dentro = os.path.join(arvore, "catalogo")
    for base, arqs in _anda(dentro if os.path.isdir(dentro) else arvore):
        if "main.tf" in arqs:
            yield base


def saidas_da_receita(pasta):
    arq = os.path.join(pasta, "outputs.tf")
    if not os.path.isfile(arq):
        return set()
    return set(OUTPUT.findall(io.open(arq, encoding="utf-8").read()))


def receita_da_celula(caminho, arvore):
    """A pasta da receita que esta célula aponta, quando ela é local.

    `source` remoto (git::, https, registry) não é buraco: a receita mora fora
    da árvore, de propósito. Cobrar pasta local ali acusaria erro em todo live
    que consome módulo versionado, que é a prática corrente.
    """
    t = io.open(caminho, encoding="utf-8").read()
    m = re.search(r'source\s*=\s*"([^"]+)"', t)
    if not m:
        return None
    bruto = m.group(1)
    if bruto.startswith(("git::", "http", "github.com", "tfr://", "${")) or "//" in bruto.split("?")[0][:8]:
        return None
    alvo = bruto.replace("//", "/")
    return os.path.normpath(os.path.join(os.path.dirname(caminho), alvo))


# ── as regras ──────────────────────────────────────────────────────────────

def regra_dependencia_existe(arvore):
    """Toda dependência aponta uma célula que existe na árvore."""
    for c in celulas(arvore):
        t = io.open(c, encoding="utf-8").read()
        for nome, corpo in DEP.findall(t):
            m = CONFIG_PATH.search(corpo)
            if not m:
                erra("dependência sem caminho", os.path.relpath(c, arvore), nome)
                continue
            alvo = os.path.normpath(os.path.join(os.path.dirname(c), m.group(1)))
            if not os.path.isfile(os.path.join(alvo, "terragrunt.hcl")):
                erra("dependência aponta célula que não existe",
                     os.path.relpath(c, arvore), m.group(1))


def regra_mock_bate_com_saida(arvore):
    """O mock só declara o que a origem publica de verdade."""
    for c in celulas(arvore):
        t = io.open(c, encoding="utf-8").read()
        for nome, corpo in DEP.findall(t):
            m = CONFIG_PATH.search(corpo)
            mm = MOCK.search(corpo)
            if not (m and mm):
                continue
            alvo = os.path.normpath(os.path.join(os.path.dirname(c), m.group(1)))
            alvo_tg = os.path.join(alvo, "terragrunt.hcl")
            if not os.path.isfile(alvo_tg):
                continue
            receita = receita_da_celula(alvo_tg, arvore)
            publica = saidas_da_receita(receita) if receita else set()
            for chave in CHAVE_MOCK.findall(mm.group(1)):
                if chave not in publica:
                    erra("mock declara saída que a origem não publica",
                         os.path.relpath(c, arvore),
                         "%s.%s (a origem publica: %s)"
                         % (nome, chave, ", ".join(sorted(publica)) or "nada"))


def regra_sem_auto_referencia(arvore):
    """Nenhum atributo referencia o recurso em que ele está declarado.

    O bloco acaba na chave que fecha, e não na próxima linha em branco: sem
    contar chave, a regra acusava referência legítima feita depois do bloco, em
    `locals` ou noutro recurso. Foi o que ela fez no terraform-aws-eks.
    """
    for pasta in receitas(arvore):
        t = io.open(os.path.join(pasta, "main.tf"), encoding="utf-8").read()
        atual, profundidade = None, 0
        for linha in t.splitlines():
            m = re.match(r'^resource\s+"([^"]+)"\s+"([^"]+)"', linha)
            if m:
                atual, profundidade = "%s.%s" % (m.group(1), m.group(2)), 0
            if atual:
                profundidade += linha.count("{") - linha.count("}")
                if not m and ("%s." % atual) in linha:
                    erra("atributo referencia o próprio recurso",
                         os.path.relpath(pasta, arvore), linha.strip()[:70])
                if profundidade <= 0 and not m:
                    atual = None


MODULO = re.compile(r'^module\s+"', re.M)


def regra_receita_tem_recurso(arvore):
    """Receita sem recurso diz por escrito por que está vazia.

    Compor módulo é receita: os exemplos do terraform-aws-vpc e do
    terraform-aws-eks só têm `module`, e a regra os acusava um a um. Pasta que
    compõe módulo cria infraestrutura tanto quanto pasta que declara recurso.
    """
    for pasta in receitas(arvore):
        t = io.open(os.path.join(pasta, "main.tf"), encoding="utf-8").read()
        if RECURSO.search(t) or MODULO.search(t):
            continue
        if "TODO(receita)" not in t:
            erra("receita sem recurso e sem explicação",
                 os.path.relpath(pasta, arvore), "main.tf sem resource, sem module e sem razão")


def regra_arn_nunca_literal(arvore):
    """Argumento de ARN vira referência ou variável, nunca texto solto."""
    for pasta in receitas(arvore):
        # `exemplo/` é o story do organismo: o chamado mínimo com valores de
        # brinquedo, que existe para o módulo com provider aliased ter uma raiz
        # que valida. ARN literal ali é o exemplo, não a receita.
        if os.path.basename(pasta) in ("exemplo", "exemplos", "examples"):
            continue
        t = io.open(os.path.join(pasta, "main.tf"), encoding="utf-8").read()
        for nome, valor in ATRIBUTO.findall(t):
            if not nome.endswith("_arn") and nome not in ("role", "kms_key_id"):
                continue
            v = valor.strip()
            # Política gerenciada da AWS é constante do provedor, e não endereço
            # de vizinha: `arn:aws:iam::aws:policy/...` é o mesmo em toda conta
            # do mundo, e escrevê-la é a forma certa de usá-la. A regra existe
            # contra ARN de recurso da instância, que muda de conta para conta.
            if v.startswith('"arn:aws:iam::aws:policy/'):
                continue
            if v.startswith('"arn:'):
                erra("ARN escrito à mão na receita",
                     os.path.relpath(pasta, arvore), "%s = %s" % (nome, v[:40]))


def regra_preencher_tem_pergunta(arvore, proposta):
    """Todo `PREENCHER` na célula tem pergunta correspondente na proposta."""
    if not proposta:
        return
    perguntas = set()
    for u in proposta.get("unidades") or []:
        for q in u.get("perguntas") or []:
            perguntas.add(q.get("nome"))
    for c in celulas(arvore):
        t = io.open(c, encoding="utf-8").read()
        for m in re.finditer(r'^\s{2}([a-z_0-9]+)\s*=\s*"PREENCHER"', t, re.M):
            if m.group(1) not in perguntas:
                erra("PREENCHER sem pergunta na ficha",
                     os.path.relpath(c, arvore), m.group(1))


def regra_input_puxa_saida_que_existe(arvore):
    """Input que referencia a vizinha só cita saída que ela publica."""
    for c in celulas(arvore):
        t = io.open(c, encoding="utf-8").read()
        deps = {n: corpo for n, corpo in DEP.findall(t)}
        for m in re.finditer(r"dependency\.([a-z0-9_-]+)\.outputs\.([a-z_]+)", t):
            nome, saida = m.group(1), m.group(2)
            if nome not in deps:
                erra("input puxa dependência que a célula não declara",
                     os.path.relpath(c, arvore), nome)
                continue
            cp = CONFIG_PATH.search(deps[nome])
            if not cp:
                continue
            alvo = os.path.normpath(os.path.join(os.path.dirname(c), cp.group(1)))
            # célula que não existe já é queixa da regra anterior; aqui ela só
            # não pode derrubar a suíte inteira. Rebentar no primeiro caminho
            # torto esconde todas as regras que vinham depois.
            if not os.path.isfile(os.path.join(alvo, "terragrunt.hcl")):
                continue
            receita = receita_da_celula(os.path.join(alvo, "terragrunt.hcl"), arvore)
            publica = saidas_da_receita(receita) if receita else set()
            if saida not in publica:
                erra("input puxa saída que a vizinha não publica",
                     os.path.relpath(c, arvore), "%s.%s" % (nome, saida))


def regra_sem_ciclo(arvore):
    """O grafo de dependências não tem ciclo: com ciclo o terragrunt trava."""
    grafo = {}
    for c in celulas(arvore):
        eu = os.path.dirname(c)
        t = io.open(c, encoding="utf-8").read()
        for _n, corpo in DEP.findall(t):
            m = CONFIG_PATH.search(corpo)
            if m:
                grafo.setdefault(eu, set()).add(
                    os.path.normpath(os.path.join(eu, m.group(1))))
    vistos, pilha = set(), set()

    def anda(n, caminho):
        if n in pilha:
            erra("ciclo entre células", os.path.relpath(n, arvore),
                 " -> ".join(os.path.basename(x) for x in caminho[-3:]))
            return
        if n in vistos:
            return
        vistos.add(n); pilha.add(n)
        for v in grafo.get(n, ()):
            anda(v, caminho + [v])
        pilha.discard(n)

    for n in list(grafo):
        anda(n, [n])


def regra_receita_de_celula_existe(arvore):
    """Célula que aponta receita local aponta uma que existe."""
    for c in celulas(arvore):
        r = receita_da_celula(c, arvore)
        if r is None:
            continue  # receita remota ou sem source: não é buraco local
        if not os.path.isfile(os.path.join(r, "main.tf")):
            erra("célula aponta receita que não existe",
                 os.path.relpath(c, arvore), r)


REGRAS = [regra_dependencia_existe, regra_mock_bate_com_saida,
          regra_sem_ciclo, regra_receita_de_celula_existe,
          regra_input_puxa_saida_que_existe,
          regra_sem_auto_referencia, regra_receita_tem_recurso,
          regra_arn_nunca_literal]


def confere(arvore, proposta=None, rotulo=""):
    antes = len(falhas)
    for r in REGRAS:
        r(arvore)
    regra_preencher_tem_pergunta(arvore, proposta)
    novas = len(falhas) - antes
    n_cel = len(list(celulas(arvore)))
    n_rec = len(list(receitas(arvore)))
    print("%-28s %2d células, %2d receitas · %s"
          % (rotulo, n_cel, n_rec,
             "ok" if not novas else "%d queixa(s)" % novas))


def gera(espec, convencoes=None):
    tmp = oficina.pasta("bioma-unidade-")
    cmd = [sys.executable, os.path.join(FERR, "traduzir_bloco.py"), espec, "--saida", tmp]
    if convencoes:
        cmd += ["--convencoes", convencoes]
    subprocess.run(cmd, capture_output=True, text=True)
    prop = os.path.join(tmp, "proposta.json")
    if not os.path.exists(prop):
        return None, None
    arv = os.path.join(tmp, "arvore")
    subprocess.run([sys.executable, os.path.join(FERR, "gerar_iac.py"),
                    prop, "--destino", arv, "--forcar"], capture_output=True, text=True)
    return arv, json.load(io.open(prop, encoding="utf-8"))


# ── funções puras: o unitário de verdade, sem árvore e sem disco ───────────

def testa_funcoes():
    """As decisões do gerador, chamadas direto, com o caso e o contra-caso."""
    sys.path.insert(0, FERR)
    import gerar_iac as g

    def confere(ok, item, nota=""):
        if not ok:
            erra("função decide errado", item, nota)

    # alcances: a natureza da OU decide, e uma regra só serve os dois lugares
    confere(g.alcances_de({"ambientes": ["nprd", "prd"]}) == ["nprd", "prd"],
            "alcances_de · capacidade")
    confere(g.alcances_de({"natureza_ou": "fundacional"}) == ["compartilhado"],
            "alcances_de · fundacional")
    confere(g.alcances_de({"efemero_por_pr": True}) == ["efemero"],
            "alcances_de · efêmero")

    # referência interna nunca aponta o próprio recurso
    confere(g.liga_interno("role", ["aws_iam_role", "aws_lambda_function"], "x",
                           dono="aws_lambda_function") == "aws_iam_role.x.arn",
            "liga_interno · liga no outro recurso")
    confere(g.liga_interno("function_name", ["aws_lambda_function"], "x",
                           dono="aws_lambda_function") is None,
            "liga_interno · recusa o próprio recurso")

    # a receita publica id e arn do recurso principal
    saidas = dict(g.saidas_de({"servico": "Amazon S3", "nome": "lake"}))
    confere("arn" in saidas and "id" in saidas, "saidas_de · publica id e arn",
            str(sorted(saidas)))
    confere(g.saidas_de({"servico": "coisa que ninguém conhece", "nome": "x"}) == [],
            "saidas_de · serviço desconhecido não publica nada")

    # o input só puxa da vizinha quando uma única dependência combina
    uma = [{"nome": "cluster", "saidas": ["id", "arn"]}]
    confere(g.resposta_da_vizinha("mskconnect_connector_cluster_arn", uma)
            == "dependency.cluster.outputs.arn",
            "resposta_da_vizinha · o nome da vizinha fecha o argumento")
    confere(g.resposta_da_vizinha("msk_cluster_arn", []) is None,
            "resposta_da_vizinha · sem vizinha, pergunta")
    confere(g.resposta_da_vizinha("msk_cluster_name", uma) is None,
            "resposta_da_vizinha · argumento que não é endereço não puxa")
    confere(g.resposta_da_vizinha("mskconnect_connector_cluster_arn",
                                  [{"nome": "cluster", "saidas": []}]) is None,
            "resposta_da_vizinha · vizinha que não publica arn não responde")
    # o caso que a auditoria pegou: substring casava `msk` dentro de
    # `..._service_execution_role_arn`, e o ARN do cluster ia parar onde o
    # provider quer o de uma role
    confere(g.resposta_da_vizinha("mskconnect_connector_service_execution_role_arn",
                                  [{"nome": "msk", "saidas": ["id", "arn"]}]) is None,
            "resposta_da_vizinha · não liga ARN de cluster em argumento de role")
    confere(g.resposta_da_vizinha("bucket_kms_key_arn",
                                  [{"nome": "key", "saidas": ["id", "arn"]}]) is None,
            "resposta_da_vizinha · não liga em argumento de chave")

    # o corte de ciclo não pode depender da ordem em que as arestas chegam
    confere(g.sem_ciclo([("A", "B"), ("B", "A")]) == g.sem_ciclo([("B", "A"), ("A", "B")]),
            "sem_ciclo · corte estável nas duas ordens")

    # a ponta coletiva nas duas línguas: quem desenha em inglês tem a mesma
    # ligação 1:N de quem desenha em português
    import traduzir_bloco as tb
    for texto in ("todas as contas", "all accounts", "domain blocks",
                  "consumer accounts", "cada domínio", "every region"):
        confere(tb.coletiva(texto), "coletiva · %s é conjunto" % texto)
    for texto in ("Amazon MSK", "Amazon Kinesis", "a conta de dados",
                  "AWS Organizations"):
        confere(not tb.coletiva(texto), "coletiva · %s é uma peça" % texto)
    print("%-28s %2d decisões conferidas" % ("funções puras", 25))


def testa_diff():
    """O diff contra árvore que já existe, numa árvore de mentira montada aqui.

    O caso é sintético de propósito: nenhuma instância real tem, ao mesmo
    tempo, célula permanente sumida e célula efêmera sumida, e são justamente
    essas duas que o programa confundia.
    """
    import shutil
    sys.path.insert(0, FERR)
    import diferenca_da_instancia as d

    def confere(ok, item, nota=""):
        if not ok:
            erra("diff decide errado", item, nota)

    base = oficina.pasta("bioma-diff-")
    try:
        for receita, dur in (("a", "estavel"), ("perm", "permanente")):
            pasta = os.path.join(base, "rec", receita)
            os.makedirs(pasta)
            io.open(os.path.join(pasta, "contrato.json"), "w", encoding="utf-8").write(
                '{"durabilidade": "%s"}' % dur)
        for amb, nome, receita in (("compartilhado", "a", "a"),
                                   ("compartilhado", "b", "perm"),
                                   ("efemero", "c", "a")):
            pasta = os.path.join(base, "arv", "x", amb, nome)
            os.makedirs(pasta)
            io.open(os.path.join(pasta, "terragrunt.hcl"), "w", encoding="utf-8").write(
                'terraform { source = "../../../../rec//%s" }\n' % receita)
        prop = {"unidades": [{"nome": "a", "trilho": "x", "servico": "S",
                              "natureza_ou": "fundacional", "ambientes": []}]}
        r = d.compara(prop, os.path.join(base, "arv"))

        confere(("x", "compartilhado", "b") in r["avisos"],
                "permanente sumida vira aviso", str(r["avisos"]))
        confere(("x", "efemero", "c") in r["removidas"],
                "efêmera sumida vira removida, não achado", str(r["removidas"]))
        confere(("x", "efemero", "c") not in r["achados"],
                "efêmera não aparece também como achado")
        confere(set(r["sai"]) == set(r["avisos"] + r["removidas"] + r["achados"]),
                "sai é a soma das três leituras do que saiu")
        # com uma permanente pendurada, dizer que batem seria aprovar por omissão
        confere(bool(r["nasce"] or r["muda"] or r["sai"]),
                "permanente sumida impede o veredito de que batem")
        confere(not r["conta_comparavel"] and r["por_que_conta"],
                "conta que ninguém escreve na célula sai declarada, não calada")

        # contra-caso: desenho que descreve as três, e nada sai
        prop2 = {"unidades": [
            {"nome": "a", "trilho": "x", "servico": "S",
             "natureza_ou": "fundacional", "ambientes": []},
            {"nome": "b", "trilho": "x", "servico": "S", "ambientes": ["compartilhado"]},
            {"nome": "c", "trilho": "x", "servico": "S", "ambientes": ["efemero"]}]}
        r2 = d.compara(prop2, os.path.join(base, "arv"))
        confere(not r2["sai"], "desenho que cobre a árvore não deixa nada saindo",
                str(r2["sai"]))
    finally:
        shutil.rmtree(base, ignore_errors=True)

    # a conta escrita em vocabulários diferentes não é mudança de infraestrutura
    confere(d.motivo_da_conta(False, True, True).endswith(
        "(número de doze dígitos de um lado, nome do outro)"),
        "vocabulário diferente de conta sai declarado")
    confere("nenhum dos dois" in d.motivo_da_conta(False, False, False),
            "conta que ninguém escreve não culpa a árvore")
    print("%-28s %2d decisões conferidas" % ("diff sobre instância", 9))


def testa_roundtrip():
    """A ida e a volta devolvem o mesmo desenho, com a mesma natureza.

    O que a tela escreve, o tradutor lê de novo quando a pessoa reabre o
    projeto. Se a natureza se perde nessa volta, o artefato reaparece como
    recurso de nuvem e ainda ganha uma cópia: o desenho salvo deixa de ser o
    desenho aberto.
    """
    import shutil
    sys.path.insert(0, FERR)
    import traduzir_bloco as tb

    def confere(ok, item, nota=""):
        if not ok:
            erra("ida e volta perde informação", item, nota)

    doc = "\n".join([
        "# volta", "", "## Serviços e colocação", "",
        "| serviço | papel | zona (conta · rede) | multiplicidade | realiza |",
        "|---|---|---|---|---|",
        "| Amazon S3 | guarda o dado | Platform · Dados | compartilhado | tela |",
        "| workflows-da-esteira | seis arquivos de CI | artefato de esteira | "
        "entregue à esteira | tela |",
        "", "## Arestas (fluxo do diagrama)", "",
        "| # | origem | destino | o que flui | canal | cruza fronteira |",
        "|---|---|---|---|---|---|", "", "## Fim", ""])
    base = oficina.pasta("bioma-volta-")
    try:
        arq = os.path.join(base, "espec.md")
        io.open(arq, "w", encoding="utf-8").write(doc)
        r = subprocess.run([sys.executable, os.path.join(FERR, "traduzir_bloco.py"),
                            arq, "--saida", base], capture_output=True, text=True)
        prop = os.path.join(base, "proposta.json")
        confere(os.path.exists(prop), "o documento da tela traduz", r.stderr[-200:])
        if not os.path.exists(prop):
            return
        u = json.load(io.open(prop, encoding="utf-8"))["unidades"]
        # o tradutor acrescenta os artefatos que o catálogo tem para o trilho:
        # o que se afirma aqui é sobre a peça que voltou, e não sobre o total
        arte = {x["nome"]: x for x in u if x.get("tipo") == "artefato"}
        confere("workflows-da-esteira" in arte, "peça declarada artefato volta artefato",
                str([(x["nome"], x.get("tipo")) for x in u]))
        confere(arte.get("workflows-da-esteira", {}).get("conta") is None,
                "artefato volta sem conta: ele não mora em conta nenhuma")
        nomes = [x["nome"] for x in u]
        confere(len(nomes) == len(set(nomes)), "a volta não duplica peça",
                str(sorted(nomes)))
    finally:
        shutil.rmtree(base, ignore_errors=True)
    print("%-28s %2d decisões conferidas" % ("ida e volta", 4))


def testa_fiacao_por_tipo():
    """O endereço da vizinha vem do tipo do recurso, e não de pedaço de nome.

    A receita publicava só o recurso principal, então a role e o security group
    que ela cria não tinham endereço, e quem precisava deles escrevia o ARN à
    mão. E o casamento por substring punha o ARN de um cluster onde o provider
    quer o de uma role, que o Terraform aceita porque os dois são texto.
    """
    sys.path.insert(0, FERR)
    import gerar_iac as g

    def confere(ok, item, nota=""):
        if not ok:
            erra("fiação por tipo decide errado", item, nota)

    # a receita publica cada recurso que cria, e não só o principal
    saidas = dict(g.saidas_de({"nome": "lambda-x", "servico": "AWS Lambda"}))
    confere("arn" in saidas, "o principal continua saindo como arn", str(sorted(saidas)))
    confere("iam_role_arn" in saidas, "a role que a receita cria ganha endereço",
            str(sorted(saidas)))
    # configuração de outro recurso da mesma receita não vira endereço, e quem
    # decide isso é o esquema (configuração não tem ARN), não o nome
    saidas = dict(g.saidas_de({"nome": "balde", "servico": "Amazon S3"}))
    confere(not any(n.startswith("s3_bucket_versioning") for n in saidas),
            "configuração do balde não vira saída", str(sorted(saidas)))
    # o contra-caso do nome: `aws_vpc_endpoint_service` parece sufixo de
    # `aws_vpc_endpoint` e é coisa endereçável, com ARN próprio
    saidas = dict(g.saidas_de({"nome": "pl", "servico": "AWS PrivateLink"}))
    confere(any("vpc_endpoint" in n for n in saidas),
            "peça com ARN próprio sai, mesmo com nome de sufixo", str(sorted(saidas)))

    # o argumento diz o tipo que quer, nas grafias que o provider usa
    for arg, tipo in (("security_group_ids", "aws_security_group"),
                      ("broker_node_group_info_security_groups", "aws_security_group"),
                      ("client_subnets", "aws_subnet"),
                      ("subnet_ids", "aws_subnet"),
                      ("kms_key_arn", "aws_kms_key")):
        pedido = g.pedido_do_argumento(arg)
        confere(pedido and pedido[0] == tipo, "%s pede %s" % (arg, tipo), str(pedido))
    confere(g.pedido_do_argumento("kafka_version") is None,
            "versão não é endereço de peça nenhuma")
    # role carrega papel, e o tipo não diz qual: `task_role_arn` do ECS,
    # `execution_role_arn`, `service_access_role_arn` do DMS e
    # `lambda_success_feedback_role_arn` do SNS são todos `aws_iam_role` e
    # nenhum é o mesmo. Nenhum deles pode ser ligado por tipo.
    for arg in ("task_role_arn", "execution_role_arn", "service_access_role_arn",
                "lambda_success_feedback_role_arn", "service_execution_role_arn"):
        confere(g.pedido_do_argumento(arg) is None,
                "%s não se liga por tipo: role carrega papel" % arg)

    role = {("aws_iam_role", "arn"): "iam_role_arn"}
    uma = [{"nome": "func", "por_tipo": role}]
    confere(g.resposta_da_vizinha("task_role_arn", uma) is None,
            "a role de uma vizinha não vira task role de ECS")
    confere(g.resposta_da_vizinha("cluster_arn", uma) is None,
            "ARN de cluster não aceita o endereço de uma role")
    sg = {("aws_security_group", "id"): "security_group_id"}
    umsg = [{"nome": "rede", "por_tipo": sg}]
    duassg = [{"nome": "rede", "por_tipo": sg}, {"nome": "outra", "por_tipo": sg}]
    confere(g.resposta_da_vizinha("security_group_ids", umsg)
            == "[dependency.rede.outputs.security_group_id]",
            "argumento de lista recebe lista",
            str(g.resposta_da_vizinha("security_group_ids", umsg)))
    confere(g.resposta_da_vizinha("security_group_ids", duassg) is None,
            "duas vizinhas do mesmo tipo não deixam a ferramenta escolher")

    # tipo repetido dentro da própria receita também é ambiguidade, e o mapa
    # identifica peça só por tipo: sai da conta em vez de o primeiro vencer
    antes = g.MAPA.get("_prova_duas_roles")
    g.MAPA["prova de duas roles"] = {"recursos": ["aws_iam_role", "aws_iam_role"]}
    try:
        por_tipo = g.saidas_por_tipo({"nome": "x", "servico": "prova de duas roles"})
        confere(("aws_iam_role", "arn") not in por_tipo,
                "tipo repetido na receita não vira endereço", str(por_tipo))
    finally:
        g.MAPA.pop("prova de duas roles", None)
        if antes is not None:
            g.MAPA["_prova_duas_roles"] = antes
    print("%-28s %2d decisões conferidas" % ("fiação por tipo", 20))


def testa_razao_do_trilho():
    """Toda peça diz de onde veio a pasta, e a razão não descreve outro caminho.

    Razão ausente deixa quem lê sem como discordar. Razão que descreve o caminho
    errado é pior: ela convence. Os dois defeitos existiam — o artefato saía sem
    razão nenhuma, e zona que declara só o topo (`Security`) dizia "declara topo
    e OU".
    """
    sys.path.insert(0, FERR)
    import importlib
    import traduzir_bloco as tb

    def confere(ok, item, nota=""):
        if not ok:
            erra("razão do trilho decide errado", item, nota)

    base = oficina.pasta("bioma-razao-")
    espec = os.path.join(base, "prova", "bloco.md")
    os.makedirs(os.path.dirname(espec))
    io.open(espec, "w", encoding="utf-8").write(
        "# prova\n\n## Serviços e colocação\n\n"
        "| serviço | papel | zona (conta · rede) | multiplicidade | realiza |\n"
        "|---|---|---|---|---|\n"
        "| Amazon MSK | fila | Platform · Barramento | compartilhado | [[#D1]] |\n"
        "| AWS Config | regra | Platform | compartilhado | [[#D2]] |\n"
        "| Datadog | métrica | Platform (SaaS) | compartilhado | [[#D3]] |\n"
        "| AWS Transit Gateway | trânsito | Network | compartilhado | [[#D4]] |\n"
        "\n## Arestas (fluxo do diagrama)\n\n"
        "| # | origem | destino | o que flui | canal | cruza fronteira |\n"
        "|---|---|---|---|---|---|\n"
        "| 1 | Amazon MSK | AWS KMS | cifra | SDK | não |\n\n## Fim\n")

    importlib.reload(tb)
    tb.carrega_convencoes(None)
    r = tb.traduz(espec)
    por_nome = {u["nome"]: u for u in r["unidades"]}
    confere(all(u.get("por_que_trilho") for u in r["unidades"]),
            "toda unidade traz a razão do trilho",
            str([u["nome"] for u in r["unidades"] if not u.get("por_que_trilho")]))
    confere("topo e OU" in por_nome["msk"]["por_que_trilho"],
            "topo com OU diz topo e OU", por_nome["msk"]["por_que_trilho"])
    # sem convenção, topo sozinho é a própria folha: a ferramenta não conhece a
    # árvore de ninguém, e supor agrupadora seria decidir pela instância
    confere("topo e OU" in por_nome["config"]["por_que_trilho"],
            "sem convenção, topo sozinho é a folha",
            por_nome["config"]["por_que_trilho"])
    confere("SaaS" in por_nome["datadog"]["por_que_trilho"],
            "SaaS diz que não tem pasta no live", por_nome["datadog"]["por_que_trilho"])
    confere("veio do nome" in por_nome["transit-gateway"]["por_que_trilho"],
            "zona fora do mapa diz que o nome decidiu",
            por_nome["transit-gateway"]["por_que_trilho"])

    # com a instância declarando o topo como agrupador, a mesma zona passa a
    # dizer que falta a OU folha, em vez de fingir que o topo é ela
    agr = os.path.join(base, "agrupadores.json")
    io.open(agr, "w", encoding="utf-8").write('{"topos_agrupadores": ["platform"]}')
    importlib.reload(tb)
    tb.carrega_convencoes(agr)
    r2 = tb.traduz(espec)
    p2 = {u["nome"]: u for u in r2["unidades"]}
    confere("só o topo" in p2["config"]["por_que_trilho"],
            "topo declarado agrupador pede a OU folha",
            p2["config"]["por_que_trilho"])
    confere(p2["config"].get("pendente_ou") is True,
            "e a peça fica pendente de OU em vez de inventar uma")
    importlib.reload(tb)
    tb.carrega_convencoes(None)

    # o artefato do catálogo também responde de onde veio a pasta
    arte = [tb.artefato_em_unidade(a, "devsecops") for a in tb.artefatos_do_catalogo()]
    confere(arte and all(a.get("por_que_trilho") for a in arte),
            "artefato traz a razão do trilho", str(len(arte)))

    # carregar convenções duas vezes troca de instância, não empilha as duas
    a = os.path.join(base, "a.json")
    b = os.path.join(base, "b.json")
    io.open(a, "w", encoding="utf-8").write(
        '{"zona_trilho": {"network": ["infrastructure", "conta de rede"]},'
        ' "ambientes_por_natureza": {"workload": ["dev", "prd"]}}')
    io.open(b, "w", encoding="utf-8").write(
        '{"zona_trilho": {"security": ["security", "conta de segurança"]},'
        ' "ambientes_por_natureza": {"capacidade": ["prd"]}}')
    importlib.reload(tb)
    tb.carrega_convencoes(a)
    tb.carrega_convencoes(b)
    confere(set(tb.ZONA_TRILHO) == {"security"},
            "convenção nova substitui a anterior", str(sorted(tb.ZONA_TRILHO)))
    confere(set(tb.ZONA_TRILHO) == set(tb.CONVENCOES["zona_trilho"]),
            "o mapa interno e o declarado não divergem",
            "%s vs %s" % (sorted(tb.ZONA_TRILHO), sorted(tb.CONVENCOES["zona_trilho"])))
    confere(tb.AMBIENTES_POR_NATUREZA["workload"] == ["dev", "hml", "prd"],
            "convenção nova não herda os ambientes da anterior",
            str(tb.AMBIENTES_POR_NATUREZA["workload"]))
    confere(tb.CONVENCOES["ambientes_por_natureza"] == tb.AMBIENTES_POR_NATUREZA,
            "ambientes declarados e usados são o mesmo mapa",
            "%s vs %s" % (tb.CONVENCOES["ambientes_por_natureza"],
                          tb.AMBIENTES_POR_NATUREZA))
    importlib.reload(tb)
    print("%-28s %2d decisões conferidas" % ("razão do trilho", 12))


def testa_contas():
    """O mapa de contas da instância vira lista sem apagar conta.

    A tela recusa quem digita a mesma conta duas vezes. A importação descartava
    a repetida em silêncio, e a lista saía menor do que o mapa sem ninguém
    reclamar: dois caminhos para a mesma lista, com respostas opostas.
    """
    sys.path.insert(0, FERR)
    import contas_do_live as cl

    def confere(ok, item, nota=""):
        if not ok:
            erra("importação de contas decide errado", item, nota)

    base = oficina.pasta("bioma-contas-")
    def mapa(nome, corpo):
        p = os.path.join(base, nome)
        io.open(p, "w", encoding="utf-8").write(corpo)
        return p

    bom = mapa("bom.hcl", 'contas = {\n'
               '  log-archive = "110000000001"\n'
               '  barramento-nprd = get_env("TG_BARRAMENTO_NPRD", "110000000002")\n'
               '  barramento-prd = "110000000003"\n}\n')
    lista, erro = cl.contas_do_live(bom)
    confere(erro is None and len(lista) == 3, "mapa com três contas vira três", str(erro))
    confere(lista and lista[0]["padrao"] is True, "a primeira conta nasce padrão")
    confere(any(c["area"] == "Barramento" for c in lista),
            "o sufixo de ambiente sai da área", str([c["area"] for c in lista]))

    # contra-caso: a mesma conta com dois apelidos recusa a importação inteira
    ruim = mapa("ruim.hcl", 'contas = {\n'
                '  barramento-prd = "110000000003"\n'
                '  barramento-producao = "110000000003"\n}\n')
    lista, erro = cl.contas_do_live(ruim)
    confere(lista is None and erro and "duas vezes" in erro,
            "número repetido recusa em vez de sumir", str(erro))
    confere(erro and "barramento-prd" in erro and "barramento-producao" in erro,
            "a recusa nomeia os dois apelidos", str(erro))

    vazio = mapa("vazio.hcl", "# sem bloco de contas\n")
    lista, erro = cl.contas_do_live(vazio)
    confere(lista is None and erro and "contas = {" in erro,
            "arquivo sem o bloco recusa", str(erro))
    print("%-28s %2d decisões conferidas" % ("contas da instância", 6))


def testa_importacao():
    """Ler código que já existe: o que não virou peça tem que estar declarado.

    A regra do requisito é uma só: qualquer importação está certa, não importa o
    arquivo. Certa aqui não quer dizer que tudo vira peça; quer dizer que o que
    não virou aparece na conta, separado entre o que foi escolha e o que o
    leitor não soube ler.
    """
    import shutil
    sys.path.insert(0, FERR)
    import importar_terraform as imp

    def confere(ok, item, nota=""):
        if not ok:
            erra("importação decide errado", item, nota)

    base = oficina.pasta("bioma-imp-")
    try:
        # um live de terragrunt puro: nenhum `resource`, e mesmo assim há peça
        for nome, corpo in (
            ("a/terragrunt.hcl",
             'include "root" { path = find_in_parent_folders() }\n'
             'terraform { source = "../rec//vpc" }\n'),
            ("b/terragrunt.hcl",
             'terraform { source = "../rec//cluster" }\n'
             'dependency "rede" { config_path = "../a" }\n'
             'inputs = { x = 1 }\n'),
        ):
            caminho = os.path.join(base, nome)
            os.makedirs(os.path.dirname(caminho))
            io.open(caminho, "w", encoding="utf-8").write(corpo)
        g, r = imp.le(base)
        confere(len(g["nos"]) == 2, "célula terragrunt vira peça sem resource nenhum",
                str(len(g["nos"])))
        confere(any(a["de"] == "b" and a["para"] == "a" for a in g["arestas"]),
                "dependency vira seta entre células", str(g["arestas"]))
        confere(r["fiel"], "live de terragrunt legível sai fiel",
                str(r["nao_lidos"]))
        confere(g["nos"][0]["servico"] in ("vpc", "cluster"),
                "a receita apontada vira o serviço da peça", g["nos"][0]["servico"])

        # `.tf` com data: escolha declarada, e não falta de leitura
        tf = os.path.join(base, "modulo")
        os.makedirs(tf)
        io.open(os.path.join(tf, "main.tf"), "w", encoding="utf-8").write(
            'data "aws_caller_identity" "atual" {}\n'
            'resource "aws_s3_bucket" "lake" { bucket = "x" }\n'
            'resource "aws_s3_bucket_policy" "p" {\n'
            '  bucket = aws_s3_bucket.lake.id\n}\n'
            'bloco_que_ninguem_conhece "z" {}\n')
        g2, r2 = imp.le(tf)
        confere(len(g2["nos"]) == 2, "resource vira peça", str(len(g2["nos"])))
        confere(any(n["bloco"] == "data" for n in r2["nao_vira_peca"]),
                "`data` é escolha declarada, não falha")
        confere(not r2["fiel"] and any("bloco_que_ninguem_conhece" in n["motivo"]
                                       for n in r2["nao_lidos"]),
                "bloco desconhecido derruba a fidelidade e diz o nome",
                str(r2["nao_lidos"]))
        confere(any(a["de"] == "aws_s3_bucket_policy.p"
                    and a["para"] == "aws_s3_bucket.lake" for a in g2["arestas"]),
                "referência entre recursos vira seta", str(g2["arestas"]))
    finally:
        shutil.rmtree(base, ignore_errors=True)
    print("%-28s %2d decisões conferidas" % ("importação", 8))


def main(argv):
    testa_funcoes()
    testa_diff()
    testa_importacao()
    testa_roundtrip()
    testa_razao_do_trilho()
    testa_fiacao_por_tipo()
    testa_contas()
    if len(argv) > 1:
        confere(argv[1], None, os.path.basename(argv[1].rstrip("/")))
    else:
        arv, prop = gera(os.path.join(RAIZ, "exemplos", "desenho.md"))
        if arv:
            confere(arv, prop, "exemplo")
        else:
            print("exemplo   · sem exemplos/desenho.md, pulado")
        for nome, caminho in ALVOS:
            if not os.path.isfile(caminho):
                continue
            arv, prop = gera(caminho, CONVENCOES if os.path.isfile(CONVENCOES) else None)
            if arv:
                confere(arv, prop, nome)
        for nome, pasta in DE_TERCEIROS:
            if os.path.isdir(pasta):
                confere(pasta, None, nome)

    if falhas:
        print()
        for regra, onde, detalhe in falhas:
            print("  %-42s %-34s %s" % (regra, onde, detalhe))
        print("\n%d queixa(s)" % len(falhas))
        return 1
    print("\nnenhuma queixa")
    return 0


RA = os.environ.get("BIOMA_INSTANCIA", "")
CONVENCOES = os.path.join(RA, "implementacao/bioma/convencoes.json")
# Código comprovado de terceiros, quando estiver na máquina: se a regra acusa
# erro no que a comunidade usa em produção, o erro é da regra. Foi assim que
# duas caíram: a que exigia `resource` (exemplo que só compõe `module`) e a de
# auto-referência (que não fechava o bloco na chave).
DE_TERCEIROS = [
    ("terraform-aws-vpc", "/tmp/tf-vpc"),
    ("terraform-aws-eks", "/tmp/tf-eks"),
    ("terragrunt-live-example", "/tmp/tg-real"),
]

ALVOS = [
    ("bloco 01 barramento", os.path.join(RA, "arquitetura/01-barramento/01-barramento.md")),
    ("bloco 04 dados", os.path.join(RA, "arquitetura/04-plataforma-dados/04-plataforma-dados.md")),
]

if __name__ == "__main__":
    sys.exit(main(sys.argv))
