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
    peca = {"id": chave, "servico": receita or "célula sem receita",
            "nome": os.path.basename(pasta) or chave,
            "recurso": "", "papel": "célula terragrunt",
            "receita": receita, "de": {"arquivo": rel, "linha": 1}}
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


def le(alvo):
    """(grafo, relatório) do que existe em disco.

    O relatório é a parte que faz a importação ser confiável: quantos blocos o
    leitor viu, quantos viraram peça, o que ele decidiu não trazer, e o que ele
    não soube ler. `fiel` só é verdadeiro quando a última lista está vazia.
    """
    pecas, arestas, nao_lidos, nao_vira = [], [], [], []
    vistos, blocos = {}, 0
    raiz = alvo if os.path.isdir(alvo) else os.path.dirname(alvo)
    lista = arquivos(alvo)

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

    relatorio = {
        "arquivos": len(lista),
        "blocos_vistos": blocos,
        "pecas": len(pecas),
        "arestas": len(arestas),
        "nao_vira_peca": nao_vira,
        "nao_lidos": nao_lidos,
        "fiel": len(nao_lidos) == 0,
    }
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
