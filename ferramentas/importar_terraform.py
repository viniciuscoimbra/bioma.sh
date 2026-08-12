#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Terraform e Terragrunt que já existem viram desenho.

A regra que manda aqui: o que entra tem que sair fiel, ou ser declarado. Nada é
descartado em silêncio. Cada peça carrega o arquivo e a linha de onde veio, e o
que o leitor não entendeu volta na lista `nao_lidos`, com o motivo.

Sem isto, importar seria pior que não importar: a pessoa veria um desenho que
não é o código dela, e não teria como saber.

Dois formatos, duas leituras. Em `.tf`, a peça é o `resource` ou o `module`. Em
Terragrunt, a peça é a célula: a pasta com `terragrunt.hcl`, que aponta uma
receita e depende de outras células. Um live de Terragrunt não tem `resource`
nenhum, e ler só blocos rotulados devolvia zero peça dizendo que foi fiel.

  python3 ferramentas/importar_terraform.py <arquivo ou pasta>
"""
import io
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)

IGNORA = (".terragrunt-cache", ".terraform", ".git", "node_modules")

# qualquer bloco de topo, rotulado ou não: `resource "x" "y" {`, `locals {`
BLOCO = re.compile(r'^([a-z_][a-z0-9_]*)((?:\s+"[^"]*")*)\s*\{', re.M)
ROTULO = re.compile(r'"([^"]*)"')
REF = re.compile(r'\b((?:aws|datadog|github|tls|random|null|local|kubernetes|'
                 r'google|azurerm|helm|vault|cloudflare)_[a-z0-9_]+)\.([a-z0-9_-]+)\.')
REF_MOD = re.compile(r'\bmodule\.([a-z0-9_-]+)\.')
SOURCE = re.compile(r'source\s*=\s*"([^"]+)"')
CONFIG_PATH = re.compile(r'config_path\s*=\s*"([^"]+)"')
NOME_DEP = re.compile(r'^dependency\s+"([^"]+)"', re.M)

# bloco que existe e não é peça: a escolha é do leitor, e vem escrita. Isto é
# diferente de não saber ler, e misturar as duas fazia `fiel` ser falso em todo
# `.tf` de verdade, porque todo módulo sério tem um `data`.
NAO_VIRA_PECA = {
    "data": "lê o que já existe: não cria nada",
    "locals": "valores locais do arquivo",
    "variable": "entrada da receita",
    "output": "saída da receita",
    "provider": "configuração de provider",
    "terraform": "configuração do próprio terraform",
    "moved": "histórico de renomeação de recurso",
    "import": "adoção de recurso que já existe",
    "check": "asserção sobre o plano",
    "removed": "remoção declarada de recurso",
    "include": "herança de configuração terragrunt",
    "inputs": "valores que a célula passa à receita",
    "generate": "arquivo que o terragrunt escreve antes de rodar",
    "remote_state": "onde o estado mora",
    "dependencies": "ordem entre células, sem valor",
    "retry": "política de repetição do terragrunt",
    "errors": "tratamento de erro do terragrunt",
    "feature": "chave de funcionalidade do terragrunt",
    "exclude": "o que o terragrunt pula",
    "unit": "unidade declarada em stack do terragrunt",
    "stack": "pilha declarada pelo terragrunt",
    "catalog": "onde o terragrunt procura módulos",
    "engine": "motor de execução do terragrunt",
}


def arquivos(alvo):
    if os.path.isfile(alvo):
        return [alvo]
    fora = []
    for base, dirs, arqs in os.walk(alvo):
        dirs[:] = [d for d in dirs if d not in IGNORA]
        for a in sorted(arqs):
            # `.pkr.hcl` é Packer, que empresta a sintaxe e não é Terraform:
            # lê-lo daria "bloco desconhecido" em arquivo que nunca foi nosso
            if a.endswith((".tf", ".hcl")) and not a.endswith(".pkr.hcl"):
                fora.append(os.path.join(base, a))
    return fora


def corpo_do_bloco(texto, inicio):
    """O texto do bloco que começa em `inicio`, contando chave por chave."""
    prof, i, comecou = 0, inicio, False
    while i < len(texto):
        if texto[i] == "{":
            prof += 1
            comecou = True
        elif texto[i] == "}":
            prof -= 1
            if comecou and prof == 0:
                return texto[inicio:i + 1]
        i += 1
    return texto[inicio:]


GET_ENV = re.compile(r'get_env\(\s*"([A-Z0-9_]+)"\s*(?:,\s*"([^"]*)")?\s*\)')
DEP_REF = re.compile(r'dependency\.([a-z0-9_]+)\.outputs\.([a-z0-9_.\[\]"]+)')
LINHA_INPUT = re.compile(r'^\s{2,}([a-z0-9_]+)\s*=\s*(.+?)\s*$', re.M)


def respostas_da_celula(texto):
    """O que a célula JÁ responde, para a pergunta não ficar aberta na tela.

    Aberto na tela, um projeto lido de árvore real mostrava 516 campos
    "esperando resposta" que os terragrunt.hcl respondem há dias: a leitura
    trazia a pergunta e deixava a resposta para trás. Três origens, cada uma
    com um destino:

      literal               vira o valor do campo
      get_env(VAR, queda)   vira o valor do ambiente, ou a queda; o nome da
                            variável fica em `parametros`, que é a resposta a
                            "o que foi parametrizado?"
      dependency.x.outputs  vira `ligado`, porque o valor só existe aplicado
    """
    m = re.search(r'^inputs\s*=\s*\{', texto, re.M)
    if not m:
        return {}, {}, {}
    corpo = corpo_do_bloco(texto, m.start())
    valores, parametros, ligados = {}, {}, {}
    for lm in LINHA_INPUT.finditer(corpo):
        campo, bruto = lm.group(1), lm.group(2)
        ge = GET_ENV.search(bruto)
        if ge:
            var, queda = ge.group(1), ge.group(2) or ""
            valores[campo] = os.environ.get(var) or queda
            parametros[campo] = var
            continue
        dp = DEP_REF.search(bruto)
        if dp:
            ligados[campo] = "%s → %s" % (dp.group(1), dp.group(2))
            continue
        mstr = re.match(r'^"([^"$]*)"$', bruto)
        if mstr:
            valores[campo] = mstr.group(1)
        elif re.match(r'^(true|false|-?[0-9.]+)$', bruto):
            valores[campo] = bruto
    return valores, parametros, ligados


def mapa_de_contas(raiz):
    """Os mapas de resolução de conta, lidos do contas.hcl da própria árvore.

    A regra de "qual conta roda esta célula" mora no root.hcl da instância, e
    reescrevê-la aqui seria a segunda cópia que diverge. Os MAPAS, porém, são
    declaração (`trilho_conta_fixa`, `trilho_familia`, `ambiente_sufixo`,
    `contas`), e declaração se lê da fonte.
    """
    for cand in (os.path.join(raiz, "contas.hcl"),
                 os.path.join(raiz, "infra", "contas.hcl")):
        if os.path.isfile(cand):
            texto = io.open(cand, encoding="utf-8").read()
            break
    else:
        return None

    def bloco(nome):
        m = re.search(nome + r'\s*=\s*\{', texto)
        if not m:
            return {}
        corpo = corpo_do_bloco(texto, m.start())
        fora = {}
        for lm in re.finditer(r'^\s*"?([A-Za-z0-9/_-]+)"?\s*=\s*(.+?)\s*$', corpo, re.M):
            chave, bruto = lm.group(1), lm.group(2)
            ge = GET_ENV.search(bruto)
            if ge:
                fora[chave] = os.environ.get(ge.group(1)) or ge.group(2) or ""
            else:
                ms = re.match(r'^"([^"]*)"', bruto)
                if ms:
                    fora[chave] = ms.group(1)
        return fora

    return {"contas": bloco("contas"),
            "fixa": bloco("trilho_conta_fixa"),
            "familia": bloco("trilho_familia"),
            "sufixo": bloco("ambiente_sufixo")}


def conta_da_celula(chave, mapas):
    """O apelido da conta onde a célula roda — a mesma conta do root.hcl."""
    if not mapas:
        return ""
    partes = chave.split("/")
    raiz = partes[0]
    if raiz == "fundacao":
        if len(partes) >= 3 and partes[1] == "04-contas":
            return partes[2]
        return "management"
    if raiz == "plataforma" and len(partes) > 3 and partes[2] == "contas":
        return partes[3]
    if raiz in ("plataforma", "consumidores"):
        trilho = "%s/%s" % (raiz, partes[1] if len(partes) > 1 else "")
        if trilho in mapas["fixa"]:
            return mapas["fixa"][trilho]
        ambiente = partes[2] if len(partes) > 2 else "prd"
        familia = mapas["familia"].get(trilho)
        sufixo = mapas["sufixo"].get(ambiente)
        return "%s-%s" % (familia, sufixo) if familia and sufixo else ""
    if len(partes) > 1:
        return "%s-%s" % (raiz, partes[1])
    return ""


def celula_terragrunt(arq, texto, raiz, rel):
    """(peça, arestas) de uma pasta com `terragrunt.hcl`.

    A peça é a célula, e o serviço dela é a receita que ela aponta. As setas
    saem dos `dependency`, que é como o terragrunt escreve ordem entre células.
    """
    pasta = os.path.dirname(arq)
    chave = os.path.relpath(pasta, raiz).replace(os.sep, "/")
    m = SOURCE.search(texto)
    receita = ""
    if m:
        receita = m.group(1).split("?")[0].split("//")[-1].strip("/")
    valores, parametros, ligados = respostas_da_celula(texto)
    valores.setdefault("nome", os.path.basename(pasta) or chave)
    peca = {"id": chave, "servico": receita or "célula sem receita",
            "nome": os.path.basename(pasta) or chave,
            "recurso": "", "papel": "célula terragrunt",
            "receita": receita, "de": {"arquivo": rel, "linha": 1},
            "valores": valores, "parametros": parametros, "ligado": ligados,
            "trilho": chave.split("/")[0]}
    arestas = []
    for m in re.finditer(r'^dependency\s+"[^"]*"\s*\{', texto, re.M):
        corpo = corpo_do_bloco(texto, m.start())
        cp = CONFIG_PATH.search(corpo)
        if not cp:
            continue
        destino = os.path.normpath(os.path.join(pasta, cp.group(1)))
        arestas.append({"de": chave,
                        "para": os.path.relpath(destino, raiz).replace(os.sep, "/"),
                        "flui": "dependência", "canal": "terragrunt",
                        "por_que": "a célula %s declara dependency para %s"
                                   % (chave, cp.group(1))})
    return peca, arestas


def le(alvo, ignorar=None):
    """(grafo, relatório) do que existe em disco.

    `ignorar` pula subárvores pelo nome do primeiro nível (ex.: `catalogo`): o
    desenho de uma árvore live mostra as células e suas ligações, e ler o
    catálogo junto punha os recursos internos de cada receita como peças ao
    lado delas — 244 nós de ruído e centenas de perguntas que não são da
    instância, e sim do interior da biblioteca.

    O relatório é a parte que faz a importação ser confiável: quantos blocos o
    leitor viu, quantos viraram peça, o que ele decidiu não trazer, e o que ele
    não soube ler. `fiel` só é verdadeiro quando a última lista está vazia.
    """
    pecas, arestas, nao_lidos, nao_vira = [], [], [], []
    vistos, blocos = {}, 0
    raiz = alvo if os.path.isdir(alvo) else os.path.dirname(alvo)
    lista = arquivos(alvo)
    if ignorar:
        lista = [a for a in lista
                 if os.path.relpath(a, raiz).split(os.sep)[0] not in ignorar]

    for arq in lista:
        try:
            texto = io.open(arq, encoding="utf-8", errors="replace").read()
        except OSError as e:
            nao_lidos.append({"arquivo": arq, "motivo": "não consegui abrir: %s" % e})
            continue
        rel = os.path.relpath(arq, raiz)

        if os.path.basename(arq) == "terragrunt.hcl":
            peca, setas = celula_terragrunt(arq, texto, raiz, rel)
            pecas.append(peca)
            vistos[peca["id"]] = peca
            arestas += setas
            # os blocos de dentro continuam contados e explicados
            for m in BLOCO.finditer(texto):
                blocos += 1
                tipo = m.group(1)
                if tipo not in NAO_VIRA_PECA and tipo != "dependency":
                    nao_lidos.append({"arquivo": rel,
                                      "linha": texto[:m.start()].count("\n") + 1,
                                      "motivo": "bloco `%s` desconhecido numa célula "
                                                "terragrunt" % tipo})
            continue

        for m in BLOCO.finditer(texto):
            blocos += 1
            tipo = m.group(1)
            rotulos = ROTULO.findall(m.group(2) or "")
            linha = texto[:m.start()].count("\n") + 1
            corpo = corpo_do_bloco(texto, m.start())
            if tipo == "resource":
                if len(rotulos) < 2:
                    nao_lidos.append({"arquivo": rel, "linha": linha,
                                      "motivo": "resource sem nome"})
                    continue
                chave = "%s.%s" % (rotulos[0], rotulos[1])
                peca = {"id": chave, "servico": rotulos[0], "nome": rotulos[1],
                        "recurso": rotulos[0], "papel": "",
                        "de": {"arquivo": rel, "linha": linha}, "corpo": corpo}
                pecas.append(peca)
                vistos[chave] = peca
            elif tipo == "module":
                if not rotulos:
                    nao_lidos.append({"arquivo": rel, "linha": linha,
                                      "motivo": "module sem nome"})
                    continue
                chave = "module.%s" % rotulos[0]
                pecas.append({"id": chave, "servico": "módulo %s" % rotulos[0],
                              "nome": rotulos[0], "recurso": "",
                              "papel": "composição de módulo",
                              "de": {"arquivo": rel, "linha": linha}, "corpo": corpo})
                vistos[chave] = pecas[-1]
            elif tipo == "dependency":
                chave = "dependency.%s" % (rotulos[0] if rotulos else "")
                vistos.setdefault(chave, {"id": chave, "servico": chave,
                                          "nome": chave,
                                          "de": {"arquivo": rel, "linha": linha}})
                nao_vira.append({"arquivo": rel, "linha": linha, "bloco": tipo,
                                 "motivo": "aponta outra célula, e não uma peça"})
            elif tipo in NAO_VIRA_PECA:
                nao_vira.append({"arquivo": rel, "linha": linha, "bloco": tipo,
                                 "motivo": NAO_VIRA_PECA[tipo]})
            else:
                nao_lidos.append({"arquivo": rel, "linha": linha,
                                  "motivo": "bloco `%s` desconhecido" % tipo})

    # as setas dos `.tf` saem das referências dentro de cada bloco
    for p in pecas:
        corpo = p.pop("corpo", "")
        if not corpo:
            continue
        for tipo, nome in REF.findall(corpo):
            alvo_chave = "%s.%s" % (tipo, nome)
            if alvo_chave == p["id"] or alvo_chave not in vistos:
                continue
            arestas.append({"de": p["id"], "para": alvo_chave, "flui": "referência",
                            "canal": "terraform", "por_que": "o código de %s usa %s"
                                                             % (p["id"], alvo_chave)})
        for nome in REF_MOD.findall(corpo):
            if "module.%s" % nome in vistos and "module.%s" % nome != p["id"]:
                arestas.append({"de": p["id"], "para": "module.%s" % nome,
                                "flui": "referência", "canal": "terraform"})

    # A conta de cada célula, pelos mapas da própria árvore. Sem conta, tudo
    # abria "sem área".
    mapas = mapa_de_contas(raiz)
    usadas = []
    celulas = [p for p in pecas if p.get("papel") == "célula terragrunt"]
    for p in celulas:
        p.setdefault("trilho", p["id"].split("/")[0])
        apelido = conta_da_celula(p["id"], mapas)
        if apelido:
            p["zona"] = apelido
            numero = (mapas["contas"].get(apelido) or "") if mapas else ""
            if re.match(r"^[0-9]{12}$", numero):
                p.setdefault("valores", {})["conta"] = numero
            if apelido not in usadas:
                usadas.append(apelido)

    # O layout é determinístico e sai da ESTRUTURA, não de força ou aleatório:
    # a coluna é a profundidade na cadeia de dependências (quem não depende de
    # ninguém à esquerda; quem depende, à direita de quem provê), e a faixa é a
    # conta. Desenho previsível se lê duas vezes igual — e uma fileira única de
    # 71 peças, que era o layout anterior, não se lê nenhuma.
    dep = {}
    ids = {p["id"] for p in celulas}
    for a in arestas:
        if a.get("flui") == "dependência" and a["de"] in ids and a["para"] in ids:
            dep.setdefault(a["de"], []).append(a["para"])

    prof_memo = {}
    def prof(cid, pilha=()):
        if cid in prof_memo:
            return prof_memo[cid]
        if cid in pilha:
            return 0  # ciclo declarado não derruba o desenho
        alvos = dep.get(cid, [])
        v = 0 if not alvos else 1 + max(prof(d, pilha + (cid,)) for d in alvos)
        prof_memo[cid] = v
        return v

    LARG, ALT, TOPO, ESQ, VAO = 260, 150, 80, 80, 60
    y_base, ocupado = {}, {}
    faixa_ordem = usadas or ["sem-conta"]
    y = TOPO
    for apelido in faixa_ordem:
        y_base[apelido] = y
        da_conta = [c for c in celulas if c.get("zona", "sem-conta") == apelido]
        pilhas = {}
        for c in sorted(da_conta, key=lambda c: c["id"]):
            d = prof(c["id"])
            pilhas[d] = pilhas.get(d, 0) + 1
        altura = max(pilhas.values()) if pilhas else 1
        y += altura * ALT + VAO

    for c in sorted(celulas, key=lambda c: c["id"]):
        apelido = c.get("zona", "sem-conta")
        d = prof(c["id"])
        k = ocupado.get((apelido, d), 0)
        ocupado[(apelido, d)] = k + 1
        c.setdefault("x", ESQ + d * LARG)
        c.setdefault("y", y_base.get(apelido, TOPO) + k * ALT)

    # o que não é célula (composição de módulo, recurso solto) cai na grade
    # antiga, abaixo das faixas
    resto = [p for p in pecas if p.get("papel") != "célula terragrunt"]
    for i, p in enumerate(resto):
        p.setdefault("trilho", p.get("de", {}).get("arquivo", "recursos").split("/")[0])
        p.setdefault("x", ESQ + (i % 6) * 240)
        p.setdefault("y", y + 120 + (i // 6) * 170)
    contas = [{"apelido": a,
               "numero": (mapas["contas"].get(a) or "") if mapas else "",
               "area": a, "padrao": a == "management"} for a in usadas]

    relatorio = {
        "arquivos": len(lista),
        "blocos_vistos": blocos,
        "pecas": len(pecas),
        "arestas": len(arestas),
        "nao_vira_peca": nao_vira,
        "nao_lidos": nao_lidos,
        "fiel": len(nao_lidos) == 0,
    }
    relatorio["contas"] = contas
    return {"nos": pecas, "arestas": arestas}, relatorio


def main(argv):
    if len(argv) < 2:
        print(__doc__.strip())
        return 2
    grafo, rel = le(os.path.abspath(os.path.expanduser(argv[1])))
    print("%d arquivo(s) · %d bloco(s) · %d peça(s) · %d seta(s)"
          % (rel["arquivos"], rel["blocos_vistos"], rel["pecas"], rel["arestas"]))
    if rel["nao_vira_peca"]:
        conta = {}
        for n in rel["nao_vira_peca"]:
            conta[n["bloco"]] = conta.get(n["bloco"], 0) + 1
        print("\nnão é peça, por escolha (%d): %s"
              % (len(rel["nao_vira_peca"]),
                 ", ".join("%s ×%d" % (k, v) for k, v in sorted(conta.items()))))
    if rel["nao_lidos"]:
        print("\nnão soube ler (%d):" % len(rel["nao_lidos"]))
        for n in rel["nao_lidos"][:12]:
            print("  %-40s %s" % ("%s:%s" % (n.get("arquivo"), n.get("linha", "")),
                                  n["motivo"]))
    print("\nfiel: %s" % ("sim" if rel["fiel"] else "não, veja acima"))
    if "--json" in argv:
        io.open("grafo-importado.json", "w", encoding="utf-8").write(
            json.dumps({"grafo": grafo, "relatorio": rel}, ensure_ascii=False, indent=2))
        print("grafo-importado.json")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
