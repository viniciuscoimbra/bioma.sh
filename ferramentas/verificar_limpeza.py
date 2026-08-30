#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gate: o framework não carrega nada da instituição que o usa.

    python3 ferramentas/verificar_limpeza.py <caminho-do-framework>

Roda DA INSTÂNCIA, e é dela que o vocabulário vem. O framework não sabe quem o
usa, e é exatamente por isso que uma lista de palavras escrita nele não
funciona: ela mesma seria contaminação, e envelheceria a cada cliente novo.

O que a instância declara sobre si, e este comando colhe:

    convencoes.json        os domínios, os apelidos de trilho, as zonas
    contas.hcl             os apelidos de conta
    instancia.env.local    número de conta, ARN, domínio de e-mail, prefixo,
                           organização no GitHub
    convencoes.json        os domínios, e os nomes próprios que só a instituição
                           sabe declarar (`nomes_da_instituicao`)
    git remote             a organização e o nome do repositório dela

Cada termo desses, encontrado em arquivo rastreado do framework, é vazamento.
O nome de um domínio do cliente dentro do produto é o mesmo defeito que o
número de uma conta: leva a arquitetura de alguém para dentro da ferramenta, e
a ferramenta não tem NADA em relação a cliente nenhum.

Termos curtos demais (até 2 caracteres) ficam de fora: `gf` dentro de `config`
é coincidência, e um gate que grita coincidência ensina a ser ignorado. O
prefixo do cliente entra pelo valor declarado (`TG_PREFIXO`), que aparece nos
usos reais como palavra inteira.

Saída: 0 limpo · 1 vazamento · 2 sem insumo para decidir
"""
import io
import json
import os
import re
import subprocess
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def termos_da_instancia():
    """termo -> de onde ele veio. Só palavras com 3+ caracteres."""
    fora = {}

    # O primeiro rótulo de um domínio às vezes É uma palavra do idioma, e aí
    # ele deixa de identificar alguém: prosa de interface que diga "estresse
    # <rótulo>" não vazou cliente nenhum. Sem uma saída, o portão acusa texto
    # em língua natural e nunca fecha — e portão que nunca fecha ensina a
    # ignorar portão.
    #
    # A lista é DA INSTÂNCIA, e não daqui: escrever a palavra neste arquivo
    # seria o próprio framework guardando o vocabulário de um cliente, que é
    # exatamente o que este verificador existe para impedir. Quem declara é
    # `convencoes.json`, em `rotulos_que_sao_palavra_comum`, e a declaração
    # fica no diff de quem a fez.
    #
    # Ela vale SÓ para o rótulo isolado. O domínio inteiro e o nome da
    # organização seguem sendo termo, porque esses identificam.
    palavra_comum = set()
    caminho_conv = os.environ.get("BIOMA_CONVENCOES") or os.path.join(AQUI, "convencoes.json")
    if os.path.exists(caminho_conv):
        try:
            palavra_comum = {
                str(p).lower()
                for p in json.load(io.open(caminho_conv, encoding="utf-8")).get(
                    "rotulos_que_sao_palavra_comum", [])
            }
        except ValueError:
            palavra_comum = set()

    def poe(valor, origem, so_se_identifica=False):
        v = (valor or "").strip().strip("/")
        if len(v) < 3:
            return
        if so_se_identifica and v.lower() in palavra_comum:
            return
        fora.setdefault(v.lower(), origem)

    # convencoes.json: os domínios. Só eles: os apelidos de trilho e as zonas
    # usam o vocabulário do próprio bioma (esteira, devsecops), e colhê-los
    # fazia o gate acusar a ferramenta de conter a si mesma.
    caminho = os.environ.get("BIOMA_CONVENCOES") or os.path.join(AQUI, "convencoes.json")
    if os.path.exists(caminho):
        d = json.load(io.open(caminho, encoding="utf-8"))
        for dom in d.get("dominios", []):
            poe(dom, "convencoes.json dominios")

        # Os nomes PRÓPRIOS que a instituição carrega e que nenhum outro campo
        # declara: o fornecedor de um core, a marca de um parceiro, o nome de
        # um produto interno. Eles não são domínio, não são conta e não são
        # valor de variável — aparecem em PROSA, dentro do comentário que
        # explica por que a receita existe, e é assim que atravessam.
        #
        # Achado real em 2026-08-29: o nome do fornecedor do core de uma
        # instalação estava em quatro arquivos do catálogo desde o primeiro
        # commit deste repositório, que é PÚBLICO, e este portão aprovava —
        # ele não tinha de onde saber que aquela palavra era de alguém. Uma
        # lista de nomes dentro deste arquivo seria o próprio framework
        # guardando o vocabulário de um cliente, que é o que ele existe para
        # impedir; por isso a declaração é da instância, e fica no diff de
        # quem a fez.
        for termo in d.get("nomes_da_instituicao", []):
            poe(termo, "convencoes.json nomes_da_instituicao")

    # contas.hcl: os apelidos de conta que não são genéricos da landing zone
    genericos = {"log-archive", "audit", "management", "network", "security-tooling",
                 "shared-services", "backup", "identity", "sandbox"}
    contas = os.path.join(AQUI, "infra", "contas.hcl")
    if os.path.exists(contas):
        texto = io.open(contas, encoding="utf-8").read()
        # só o que está DENTRO do bloco `contas = {`: fora dele moram valores
        # genéricos (regiao, org) que são vocabulário da ferramenta
        m_bloco = re.search(r"contas\s*=\s*\{(.*?)\n\}", texto, re.S)
        for m in re.finditer(r"^\s*([a-z][a-z0-9-]+)\s*=\s*get_env",
                             m_bloco.group(1) if m_bloco else "", re.M):
            apelido = m.group(1)
            if apelido not in genericos:
                poe(apelido, "contas.hcl")

    # instancia.env.local: os VALORES (conta, ARN, domínio, prefixo), nunca os nomes
    local = os.path.join(AQUI, "infra", "instancia.env.local")
    if os.path.exists(local):
        for linha in io.open(local, encoding="utf-8"):
            m = re.match(r"^\s*(TG_[A-Z0-9_]+)\s*=\s*(.+?)\s*$", linha)
            if not m:
                continue
            nome, valor = m.group(1), m.group(2)
            if re.fullmatch(r"\d{4}-\d{2}-\d{2}", valor):
                continue  # data de pré-requisito não identifica ninguém
            if re.fullmatch(r"\d{12}", valor) or valor.startswith("arn:"):
                poe(valor, nome)
            # TG_ORG_GITHUB entrou em 2026-08-29: o nome da organização do
            # cliente no GitHub aparecia literal num exemplo de comentário do
            # catálogo, e o portão não o colhia — era valor de variável, mas de
            # uma variável que esta lista não citava.
            elif nome in ("TG_DOMINIO_EMAIL", "TG_PREFIXO", "TG_ORG_ID", "TG_ORG_GITHUB"):
                poe(valor, nome)
                if "." in valor:
                    poe(valor.split(".")[0], nome + " (primeiro rótulo)",
                        so_se_identifica=True)

    # o caminho da instância no disco: a pasta da consultoria e a do projeto
    # também nomeiam gente. `Sites`, `home` e afins são de todo mundo e ficam
    # de fora.
    comuns = {"users", "home", "sites", "var", "opt", "srv", "work", "repos",
              "code", "projects", "dev", "www", "documents", "desktop"}
    usuario = os.path.basename(os.path.expanduser("~")).lower()
    for pedaco in AQUI.split(os.sep):
        if (pedaco and pedaco.lower() not in comuns and pedaco.lower() != usuario
                and not pedaco.startswith(".")):
            poe(pedaco, "caminho da instância")

    # o remoto da instância: a organização e o repositório
    r = subprocess.run(["git", "-C", AQUI, "remote", "get-url", "origin"],
                       capture_output=True, text=True)
    if r.returncode == 0:
        url = r.stdout.strip()
        for pedaco in re.split(r"[/:@.]", url):
            if pedaco and pedaco not in ("git", "https", "ssh", "com", "org", "www",
                                         "bitbucket", "github", "gitlab"):
                poe(pedaco, "git remote")

    return fora


def arquivos_do_framework(framework):
    r = subprocess.run(["git", "-C", framework, "ls-files"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        return None
    return [x for x in r.stdout.splitlines() if x.strip()]


def main(argv):
    if len(argv) < 2:
        print(__doc__, file=sys.stderr)
        return 2
    framework = argv[1]
    if not os.path.isdir(framework):
        print("sem insumo para decidir: %s não existe" % framework, file=sys.stderr)
        return 2
    termos = termos_da_instancia()
    if not termos:
        print("sem insumo para decidir: esta instância não declara vocabulário "
              "(convencoes.json, contas.hcl, instancia.env.local)", file=sys.stderr)
        return 2
    # O que é família do catálogo do PRÓPRIO framework não é vocabulário de
    # cliente: um domínio de template existe na ferramenta antes de existir em
    # qualquer instância, e acusá-lo seria o gate acusando a ferramenta de
    # conter a si mesma. A lista sai do framework, e não mora aqui, pelo mesmo
    # motivo de sempre: escrever nomes neste arquivo é o defeito que ele caça.
    org_dir = os.path.join(framework, "catalogo", "organismos")
    if os.path.isdir(org_dir):
        familias = {f.lower() for f in os.listdir(org_dir)
                    if os.path.isdir(os.path.join(org_dir, f))}
        termos = {t: o for t, o in termos.items() if t not in familias}
    if not termos:
        print("limpeza do framework · todo termo declarado é família do próprio catálogo")
        return 0

    arquivos = arquivos_do_framework(framework)
    if not arquivos:
        print("sem insumo para decidir: %s não é repositório git" % framework,
              file=sys.stderr)
        return 2

    # A fronteira é alfanumérica: `um composto como `<ligacao>-<dominio>-dev`` carrega o
    # domínio do cliente mesmo com hífen dos dois lados, e a fronteira por
    # hífen deixava todo composto passar.
    padrao = re.compile(r"(?<![a-z0-9])(%s)(?![a-z0-9])"
                        % "|".join(re.escape(t) for t in sorted(termos, key=len,
                                                                reverse=True)),
                        re.I)
    achados = []
    for rel in arquivos:
        caminho = os.path.join(framework, rel)
        try:
            texto = io.open(caminho, encoding="utf-8").read()
        except (UnicodeDecodeError, IsADirectoryError, FileNotFoundError):
            continue
        m = padrao.search(rel)
        if m:
            achados.append((rel, 0, m.group(1), "(no CAMINHO do arquivo)"))
        for i, linha in enumerate(texto.splitlines(), 1):
            m = padrao.search(linha)
            if m:
                achados.append((rel, i, m.group(1), linha.strip()[:90]))

    print("limpeza do framework · %d termo(s) da instância · %d arquivo(s) varridos"
          % (len(termos), len(arquivos)))
    if not achados:
        print("nenhum termo desta instituição dentro do framework")
        return 0
    vistos = set()
    for rel, i, termo, linha in achados:
        chave = (rel, termo)
        if chave in vistos:
            continue
        vistos.add(chave)
        print("  %s:%d · `%s` (%s)" % (rel, i, termo, termos[termo.lower()]))
        print("      %s" % linha)
    print("\nREPROVADO: o framework não tem NADA em relação a cliente nenhum. O que")
    print("aparece acima é da instituição, e o lugar dele é a instância ou um")
    print("parâmetro.")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
