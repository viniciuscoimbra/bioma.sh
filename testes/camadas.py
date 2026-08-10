#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""As camadas do diagnóstico, exercitadas com desenhos sintéticos.

Teste que só roda em cima do desenho de um cliente prova aquele desenho. Aqui
cada regra tem o caso que ela deve pegar e o contra-caso que ela não pode pegar,
montados na mão, sem depender de bloco nenhum.

Camadas, na ordem em que um compilador as roda:

  1 · a peça      cada caixa sozinha
  2 · o desenho   o grafo
  3 · a ligação   o que a seta exige
  4 · a saída     a árvore escrita

  python3 testes/camadas.py
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

import diagnostico as dg  # noqa: E402

placar = []

# código comprovado de terceiros, quando estiver na máquina: a importação tem
# que bater com o que está escrito no arquivo, e não com o que ela gostaria
DE_TERCEIROS = [
    ("terraform-aws-vpc", "/tmp/tf-vpc"),
    ("terraform-aws-eks", "/tmp/tf-eks"),
    ("terragrunt-live-example", "/tmp/tg-real"),
]


def diz(ok, item, nota=""):
    placar.append((bool(ok), item, nota))
    print(("  PASS  " if ok else "  FALHA ") + item + (("  · " + str(nota)) if nota else ""))


def peca(nome, servico="Amazon S3", papel="guarda coisa", conta="conta-x", **extra):
    d = {"nome": nome, "servico": servico, "papel": papel, "conta": conta,
         "tipo": "organismo", "multiplicidade": "compartilhado", "zona": "Platform",
         "celulas": "uma por plano (nao-prod, prod)", "perguntas": [], "respostas": {}}
    d.update(extra)
    return d


def desenho(unidades, relacoes=()):
    return {"unidades": list(unidades), "relacoes": list(relacoes)}


def seta(origem, destino, flui="dado"):
    return {"n": "1", "origem": origem, "destino": destino, "flui": flui,
            "canal": "direto", "vira": "aresta interna"}


def achou(achados, regra, nivel=None):
    return [a for a in achados
            if a["regra"] == regra and (nivel is None or a["nivel"] == nivel)]


# ── camada 1 · a peça ──────────────────────────────────────────────────────

def camada_1():
    print("\ncamada 1 · a peça")

    d = desenho([peca("", servico="Amazon S3")])
    diz(achou(dg.camada_peca(d), "peça sem nome", dg.ERRO), "peça sem nome é erro")

    d = desenho([peca("x", servico="Serviço Que Não Existe")])
    diz(achou(dg.camada_peca(d), "serviço fora da tabela", dg.AVISO),
        "serviço que a tabela não conhece é aviso, não invenção")

    d = desenho([peca("x", conta=None)])
    diz(achou(dg.camada_peca(d), "peça sem conta", dg.AVISO), "peça sem conta é aviso")

    d = desenho([peca("balde")])
    diz(not dg.camada_peca(d), "peça completa não gera achado",
        [a["regra"] for a in dg.camada_peca(d)])

    d = desenho([peca("x", tipo="fronteira", servico="Serviço Que Não Existe")])
    diz(not dg.camada_peca(d), "fronteira não é cobrada como receita")


# ── camada 2 · o desenho ───────────────────────────────────────────────────

def camada_2():
    print("\ncamada 2 · o desenho")

    d = desenho([peca("func", servico="AWS Lambda", papel="processa evento")])
    diz(achou(dg.camada_desenho(d), "peça solta", dg.ERRO),
        "peça solta que não guarda nada é erro")

    d = desenho([peca("balde", servico="Amazon S3", papel="guarda a trilha")])
    diz(achou(dg.camada_desenho(d), "peça solta", dg.AVISO),
        "peça solta que guarda conteúdo é só aviso")

    d = desenho([peca("a", servico="AWS Lambda"), peca("b", servico="Amazon S3")],
                [seta("AWS Lambda", "Amazon S3")])
    diz(not achou(dg.camada_desenho(d), "peça solta"),
        "peça ligada não é solta")

    d = desenho([peca("a", servico="AWS Lambda")],
                [seta("AWS Lambda", "Serviço Fantasma")])
    diz(achou(dg.camada_desenho(d), "ponta fora do desenho", dg.AVISO),
        "seta que termina no nada é aviso")

    d = desenho([peca("a", servico="AWS Lambda")],
                [seta("AWS Lambda", "sistema externo (bureau)")])
    diz(not achou(dg.camada_desenho(d), "ponta fora do desenho"),
        "sistema externo é ponta legítima")

    d = desenho([peca("a", servico="AWS Lambda"), peca("b", servico="Amazon DynamoDB")],
                [seta("AWS Lambda", "Amazon DynamoDB"), seta("Amazon DynamoDB", "AWS Lambda")])
    diz(achou(dg.camada_desenho(d), "ciclo no desenho"), "ida e volta vira ciclo declarado")

    d = desenho([peca("a", servico="AWS Lambda"), peca("b", servico="Amazon DynamoDB")],
                [seta("AWS Lambda", "Amazon DynamoDB")])
    diz(not achou(dg.camada_desenho(d), "ciclo no desenho"), "seta de mão única não é ciclo")


# ── camada 3 · a ligação ───────────────────────────────────────────────────

def camada_3():
    print("\ncamada 3 · a ligação")

    pergunta = {"nome": "lambda_function_function_name", "pergunta": "Como a função se chama?"}
    d = desenho([peca("func", servico="AWS Lambda", perguntas=[pergunta])])
    diz(achou(dg.camada_ligacao(d), "valor que só a pessoa sabe", dg.AVISO),
        "argumento sem resposta vira aviso")

    d = desenho([peca("func", servico="AWS Lambda", perguntas=[pergunta],
                      respostas={"lambda_function_function_name": "recorta"})])
    diz(not achou(dg.camada_ligacao(d), "valor que só a pessoa sabe"),
        "argumento respondido não cobra de novo")

    # vizinha de um serviço que a tabela não conhece não publica nada, então a
    # seta fixa ordem e não carrega valor
    d = desenho([peca("nuvem", servico="Serviço Que Não Existe", papel="faz algo"),
                 peca("func", servico="AWS Lambda", papel="processa")],
                [seta("AWS Lambda", "Serviço Que Não Existe")])
    diz(achou(dg.camada_ligacao(d), "seta que não virou dependência", dg.AVISO),
        "seta que não vira ordem é aviso")

    d = desenho([peca("balde", servico="Amazon S3", papel="guarda"),
                 peca("func", servico="AWS Lambda", papel="processa")],
                [seta("AWS Lambda", "Amazon S3")])
    diz(not achou(dg.camada_ligacao(d), "seta que não virou dependência"),
        "seta entre peças conhecidas vira ordem")

    # 799 recursos da AWS não têm arn no esquema, e o Config é um deles: a
    # dependência existe e não carrega endereço
    d = desenho([peca("gravador", servico="AWS Config", papel="grava a configuração"),
                 peca("balde", servico="Amazon S3", papel="guarda a trilha")],
                [seta("Amazon S3", "AWS Config")])
    diz(achou(dg.camada_ligacao(d), "dependência sem endereço", dg.AVISO),
        "vizinha que não publica arn vira aviso de ligação")

    d = desenho([peca("func", servico="AWS Lambda", papel="processa"),
                 peca("balde", servico="Amazon S3", papel="guarda")],
                [seta("AWS Lambda", "Amazon S3")])
    diz(not achou(dg.camada_ligacao(d), "dependência sem endereço"),
        "vizinha que publica arn não vira aviso")


# ── camada 4 · a saída ─────────────────────────────────────────────────────

def camada_4():
    print("\ncamada 4 · a saída")
    tmp = tempfile.mkdtemp(prefix="bioma-camadas-")
    espec = os.path.join(tmp, "d.md")
    io.open(espec, "w", encoding="utf-8").write(MARKDOWN)
    subprocess.run([sys.executable, os.path.join(FERR, "traduzir_bloco.py"),
                    espec, "--saida", tmp], capture_output=True, text=True)
    prop = os.path.join(tmp, "proposta.json")
    if not os.path.exists(prop):
        diz(False, "o desenho sintético vira proposta")
        return
    arv = os.path.join(tmp, "arvore")
    subprocess.run([sys.executable, os.path.join(FERR, "gerar_iac.py"),
                    prop, "--destino", arv, "--forcar"], capture_output=True, text=True)
    p = json.load(io.open(prop, encoding="utf-8"))
    achados = dg.camada_saida(arv)
    diz(not [a for a in achados if a["nivel"] == dg.ERRO],
        "a árvore de um desenho simples sai sem erro de saída",
        [a["regra"] for a in achados][:3])

    # adultera a árvore: dependência apontando para o vazio
    alvo = None
    for base, _d, arqs in os.walk(os.path.join(arv, "live")):
        if "terragrunt.hcl" in arqs:
            alvo = os.path.join(base, "terragrunt.hcl")
            break
    if alvo:
        t = io.open(alvo, encoding="utf-8").read()
        t += ('\ndependency "fantasma" {\n  config_path = "../../nao-existe/fantasma"\n}\n')
        io.open(alvo, "w", encoding="utf-8").write(t)
        achados = dg.camada_saida(arv)
        diz(achou(achados, "dependência aponta célula que não existe", dg.ERRO),
            "dependência para o vazio é erro de saída")

    diz(dg.resumo([dg.Achado(2, dg.ERRO, "x", "y", "z")])["pode_sair"] is False,
        "erro impede a saída")
    diz(dg.resumo([dg.Achado(2, dg.AVISO, "x", "y", "z")])["pode_sair"] is True,
        "aviso deixa sair")


def arvore_na_mao(celula="", receita="", outputs=None):
    """Uma árvore mínima escrita à mão, para exercitar a camada 4 sozinha.

    Sem passar pelo gerador: aqui interessa a regra, e não o que o gerador
    produz hoje. Regra que só é exercitada pela saída do gerador deixa de pegar
    o dia em que o gerador mudar.
    """
    raiz = tempfile.mkdtemp(prefix="bioma-camada4-")
    rec = os.path.join(raiz, "catalogo", "organismos", "plataforma", "peca")
    os.makedirs(rec)
    io.open(os.path.join(rec, "main.tf"), "w", encoding="utf-8").write(
        receita or 'resource "aws_s3_bucket" "peca" {\n  bucket = var.nome\n}\n')
    io.open(os.path.join(rec, "outputs.tf"), "w", encoding="utf-8").write(
        "".join('output "%s" { value = aws_s3_bucket.peca.%s }\n' % (o, o)
                for o in (outputs if outputs is not None else ["id", "arn"])))
    cel = os.path.join(raiz, "live", "plataforma", "prod", "peca")
    os.makedirs(cel)
    io.open(os.path.join(cel, "terragrunt.hcl"), "w", encoding="utf-8").write(
        celula or 'terraform {\n  source = "../../../../catalogo//organismos/plataforma/peca"\n}\n')
    return raiz


def camada_4_regras():
    """Cada regra da saída com o caso e o contra-caso, em árvore de mentira."""
    print("\ncamada 4 · a saída, regra a regra")

    # ARN escrito à mão
    arv = arvore_na_mao(receita='resource "aws_sns_topic_policy" "peca" {\n'
                                '  topic_arn = "arn:aws:sns:sa-east-1:1:x"\n}\n')
    diz(achou(dg.camada_saida(arv), "ARN escrito à mão na receita"),
        "ARN literal na receita é achado")
    arv = arvore_na_mao(receita='resource "aws_sns_topic_policy" "peca" {\n'
                                '  topic_arn = aws_sns_topic.outro.arn\n}\n')
    diz(not achou(dg.camada_saida(arv), "ARN escrito à mão na receita"),
        "ARN por referência não é achado")

    # auto-referência
    arv = arvore_na_mao(receita='resource "aws_lambda_function" "peca" {\n'
                                '  function_name = aws_lambda_function.peca.function_name\n}\n')
    diz(achou(dg.camada_saida(arv), "atributo referencia o próprio recurso"),
        "recurso que se cita é achado")
    arv = arvore_na_mao(receita='resource "aws_lambda_function" "peca" {\n'
                                '  function_name = var.nome\n}\n')
    diz(not achou(dg.camada_saida(arv), "atributo referencia o próprio recurso"),
        "recurso que cita variável não é achado")

    # receita sem recurso
    arv = arvore_na_mao(receita="# nada aqui\n")
    diz(achou(dg.camada_saida(arv), "receita sem recurso e sem explicação"),
        "receita vazia e calada é achado")
    arv = arvore_na_mao(receita="# TODO(receita): a tabela não conhece este serviço\n")
    diz(not achou(dg.camada_saida(arv), "receita sem recurso e sem explicação"),
        "receita vazia que explica não é achado")

    # mock declarando o que a origem não publica
    vizinha = ('terraform {\n  source = "../../../../catalogo//organismos/plataforma/peca"\n}\n'
               'dependency "peca" {\n  config_path = "../../prod/peca"\n'
               '  mock_outputs = {\n    inventado = "x"\n  }\n}\n')
    arv = arvore_na_mao(celula=vizinha)
    diz(achou(dg.camada_saida(arv), "mock declara saída que a origem não publica"),
        "mock com chave inventada é achado")
    real = vizinha.replace("inventado", "arn")
    arv = arvore_na_mao(celula=real)
    diz(not achou(dg.camada_saida(arv), "mock declara saída que a origem não publica"),
        "mock que espelha a saída real não é achado")

    # input puxando saída que não existe
    puxa = ('terraform {\n  source = "../../../../catalogo//organismos/plataforma/peca"\n}\n'
            'dependency "peca" {\n  config_path = "../../prod/peca"\n}\n'
            'inputs = {\n  x = dependency.peca.outputs.fantasma\n}\n')
    arv = arvore_na_mao(celula=puxa)
    diz(achou(dg.camada_saida(arv), "input puxa saída que a vizinha não publica"),
        "input puxando saída inexistente é achado")
    arv = arvore_na_mao(celula=puxa.replace("fantasma", "arn"))
    diz(not achou(dg.camada_saida(arv), "input puxa saída que a vizinha não publica"),
        "input puxando saída real não é achado")


MARKDOWN = """# desenho de teste

## Serviços e colocação

| serviço | papel | zona (conta · rede) | multiplicidade | realiza |
|---|---|---|---|---|
| Amazon S3 | guarda a trilha | Platform · Dados | compartilhado | teste |
| AWS Lambda | recorta o evento | Platform · Dados | compartilhado | teste |

## Arestas (fluxo do diagrama)

| # | origem | destino | o que flui | canal | cruza fronteira |
|---|---|---|---|---|---|
| 1 | AWS Lambda | Amazon S3 | trilha | direto | não |

## Fim
"""


def camada_0_recurso():
    """O recurso escolhido: família pelo serviço, peça pelo papel."""
    print("\ncamada 0 · o recurso escolhido")
    sys.path.insert(0, FERR)
    import gerar_iac as g

    def confere(servico, papel, esperado, item):
        base = g.recursos_de(servico)[0]
        fim = g.refina_por_papel(servico, papel, base)
        diz(fim and fim[0] == esperado, item, "%s -> %s" % (servico, fim[0] if fim else "vazio"))

    confere("AWS Lambda (ESM)", "consumidor do barramento",
            "aws_lambda_event_source_mapping", "papel de consumo vira event source mapping")
    confere("AWS Lambda", "recorta o evento",
            "aws_lambda_function", "sem papel de consumo continua função")
    confere("SCP (Organizations)", "guardrail preventivo",
            "aws_organizations_policy", "papel de guardrail vira política, não organização")
    confere("AWS Organizations", "OUs, contas, SCP",
            "aws_organizations_organization", "papel de estrutura continua organização")
    confere("AWS Glue (Catalog + jobs)", "job PySpark do Silver",
            "aws_glue_job", "papel de job vira job")
    confere("Datadog", "painel ao vivo", "datadog_dashboard", "papel de painel vira dashboard")
    confere("GitHub Actions", "segredo de OIDC", "github_actions_secret",
            "esteira no GitHub tem recurso próprio")

    # provider fora da AWS entra com o provider certo no versions.tf
    diz("datadog/datadog" in g.versions_tf(["datadog_monitor"]),
        "receita de Datadog declara o provider dela")
    diz("hashicorp/aws" in g.versions_tf(["aws_s3_bucket"]),
        "receita de AWS continua declarando a AWS")
    diz("integrations/github" in g.versions_tf(["github_actions_secret"]),
        "receita de GitHub declara o provider dela")


def camada_importacao():
    """O que entra sai fiel, ou é declarado. Vale para qualquer arquivo."""
    print("\ncamada 0 · a importação")
    sys.path.insert(0, FERR)
    import importar_terraform as imp

    tmp = tempfile.mkdtemp(prefix="bioma-import-")
    io.open(os.path.join(tmp, "main.tf"), "w", encoding="utf-8").write(TF_EXEMPLO)
    grafo, rel = imp.le(tmp)
    ids = {n["id"] for n in grafo["nos"]}

    diz(rel["pecas"] == 3, "cada resource e module vira uma peça",
        "%d peça(s): %s" % (rel["pecas"], sorted(ids)))
    diz("aws_s3_bucket.trilha" in ids and "module.rede" in ids,
        "resource e module entram pelo nome que têm no código")
    diz(any(a["de"] == "aws_lambda_function.recorta" and a["para"] == "aws_s3_bucket.trilha"
            for a in grafo["arestas"]),
        "referência entre recursos vira seta")
    diz(all(n.get("de", {}).get("linha") for n in grafo["nos"]),
        "cada peça diz de que arquivo e linha veio")
    diz(any(n["bloco"] == "data" for n in rel["nao_vira_peca"]),
        "o que não vira peça por escolha é declarado, e não sumido")
    diz(rel["fiel"] is True,
        "`data` é escolha do leitor: não derruba a fidelidade")

    # bloco que o leitor não conhece é outra coisa: aí a fidelidade cai
    tmp3 = tempfile.mkdtemp(prefix="bioma-import3-")
    io.open(os.path.join(tmp3, "main.tf"), "w", encoding="utf-8").write(
        'bloco_que_ninguem_conhece "z" {}\n')
    _g3, r3 = imp.le(tmp3)
    diz(r3["fiel"] is False, "importação com bloco não lido não se declara fiel")
    diz(any("bloco_que_ninguem_conhece" in n["motivo"] for n in r3["nao_lidos"]),
        "o bloco não lido aparece pelo nome")

    tmp2 = tempfile.mkdtemp(prefix="bioma-import2-")
    io.open(os.path.join(tmp2, "main.tf"), "w", encoding="utf-8").write(
        'resource "aws_s3_bucket" "x" {\n  bucket = "a"\n}\n')
    _g, r2 = imp.le(tmp2)
    diz(r2["fiel"] is True, "importação sem sobra se declara fiel")

    # o número tem que bater com o que está escrito no código
    for nome, pasta in DE_TERCEIROS:
        if not os.path.isdir(pasta):
            continue
        _g, r = imp.le(pasta)
        no_codigo = 0
        for base, dirs, arqs in os.walk(pasta):
            dirs[:] = [d for d in dirs if d not in imp.IGNORA]
            for a in arqs:
                if not a.endswith((".tf", ".hcl")):
                    continue
                txt = io.open(os.path.join(base, a), encoding="utf-8", errors="replace").read()
                if a == "terragrunt.hcl":
                    # num live de terragrunt a peça é a célula, e não o recurso:
                    # o arquivo inteiro é uma peça
                    no_codigo += 1
                    continue
                no_codigo += len(re.findall(r'^resource\s+"', txt, re.M))
                no_codigo += len(re.findall(r'^module\s+"', txt, re.M))
        diz(r["pecas"] == no_codigo, "importação de %s bate com o código" % nome,
            "%d peças contra %d blocos no código" % (r["pecas"], no_codigo))


TF_EXEMPLO = """
data "aws_caller_identity" "atual" {}

resource "aws_s3_bucket" "trilha" {
  bucket = "trilha"
}

resource "aws_lambda_function" "recorta" {
  function_name = "recorta"
  s3_bucket     = aws_s3_bucket.trilha.id
}

module "rede" {
  source = "./rede"
}
"""


def camada_ajuda():
    """Todo verbete que a tela promete existe de verdade.

    A etiqueta do artefato chamava um verbete `artefato` que não existia: o
    clique prometia explicação e não abria nada. A regra é sobre o conjunto,
    e não sobre esse caso: qualquer verbete citado no código tem que estar no
    glossário, nas duas línguas.
    """
    print("\ncamada 5 · a ajuda da tela")
    fonte = os.path.join(RAIZ, "tela", "app", "src")
    if not os.path.isdir(fonte):
        diz(True, "sem código de tela nesta cópia, pulado")
        return
    bruto = io.open(os.path.join(fonte, "verbetes.js"), encoding="utf-8").read()
    # as categorias também têm `chave`, e não são verbetes: só o que está dentro
    # do array VERBETES conta
    verbetes = bruto.split("VERBETES = [", 1)[-1]
    existem = set(re.findall(r"chave:\s*'([^']+)'", verbetes))
    pedidos = set()
    for base, _d, arqs in os.walk(fonte):
        for a in arqs:
            if not a.endswith((".js", ".jsx")):
                continue
            txt = io.open(os.path.join(base, a), encoding="utf-8").read()
            pedidos |= set(re.findall(r'verbete="([a-z_-]+)"', txt))
            pedidos |= set(re.findall(r"verbete:\s*'([a-z_-]+)'", txt))
    faltam = sorted(pedidos - existem)
    diz(not faltam, "todo verbete pedido pela tela existe no glossário",
        "faltam: %s" % ", ".join(faltam) if faltam else "%d verbetes" % len(pedidos))

    # e cada um responde nas duas línguas
    sem_lingua = []
    for chave in sorted(existem):
        trecho = verbetes.split("chave: '%s'" % chave, 1)[-1].split("chave: '")[0]
        if "pt: {" not in trecho or "en: {" not in trecho:
            sem_lingua.append(chave)
    diz(not sem_lingua, "cada verbete responde em português e em inglês",
        ", ".join(sem_lingua))


def main():
    for f in (camada_importacao, camada_0_recurso, camada_1, camada_2, camada_3,
              camada_4, camada_4_regras, camada_ajuda):
        f()
    ok = sum(1 for o, _, _ in placar if o)
    print("\n%d de %d verificações" % (ok, len(placar)))
    return 0 if ok == len(placar) else 1


if __name__ == "__main__":
    sys.exit(main())
