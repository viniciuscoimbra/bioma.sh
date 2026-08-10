#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""O que este desenho acrescenta, muda e remove numa árvore que já existe.

O gerador escreve árvore nova. Quem tem instância de pé precisa da outra
resposta, e sem ela a única saída é ler o diff do Git linha a linha.

A comparação é entre desenho e código no disco. Ela não olha a nuvem: se o
código está aplicado ou não é pergunta do `terraform plan`, e confundir as duas
faria alguém tratar "existe no código" como "existe na conta".

    python3 ferramentas/diferenca_da_instancia.py <proposta.json> <arvore>

Sai zero quando desenho e código batem, e um quando há diferença.
"""
import io
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
SOURCE = re.compile(r'source\s*=\s*"([^"]+)"')
# conta escrita na própria célula, em literal. Árvore que resolve a conta pelo
# caminho (um `root.hcl` com mapa) não cabe aqui: ler isso exigiria avaliar HCL,
# e chutar seria pior do que dizer que não dá para comparar.
CONTA = re.compile(r'^\s*(?:conta|account_id|aws_account_id)\s*=\s*"([^"${]+)"', re.M)
# ambiente que nasce e morre com uma PR: sumir dele é o comportamento, não achado
EFEMERO = ("efemero", "efêmero", "pr", "ephemeral")

# a mesma coisa escrita de dois jeitos: o desenho usa o sufixo da conta, a
# árvore de uma instância viva costuma usar o nome do plano de rota
AMBIENTE = {"nao-prod": "nprd", "nao_prod": "nprd", "naoprod": "nprd",
            "prod": "prd", "producao": "prd", "homolog": "hml",
            "homologacao": "hml", "org": "compartilhado", "ligacoes": "ligacoes"}


def normaliza_ambiente(nome):
    return AMBIENTE.get(nome.lower(), nome.lower())


def celula_do_caminho(caminho, raiz):
    """(area, ambiente, nome) a partir dos três últimos pedaços do caminho.

    Serve para as duas árvores: a que o gerador escreve
    (`live/barramento/prd/kafka-cluster`) e a de uma instância viva
    (`plataforma/barramento/prod/msk-cluster`).
    """
    rel = os.path.relpath(os.path.dirname(caminho), raiz)
    partes = [p for p in rel.split(os.sep) if p not in (".", "live")]
    if len(partes) < 3:
        return None
    area, amb, nome = partes[-3:]
    return (area, normaliza_ambiente(amb), nome)


def receita_de(caminho):
    """(receita, durabilidade, conta) do organismo que a célula aponta.

    A durabilidade vem do contrato da receita, e não do desenho: célula que só
    existe na árvore não tem desenho de onde tirar, e é justamente ela que o
    aviso de permanente precisa proteger.
    """
    texto = io.open(caminho, encoding="utf-8", errors="replace").read()
    m = SOURCE.search(texto)
    if not m:
        return None, None, None
    bruto = m.group(1).split("?")[0]
    receita = bruto.split("//")[-1].strip("/")
    durabilidade = None
    if not bruto.startswith(("git::", "http")):
        local = os.path.normpath(os.path.join(os.path.dirname(caminho),
                                              bruto.replace("//", "/")))
        contrato = os.path.join(local, "contrato.json")
        if os.path.isfile(contrato):
            try:
                durabilidade = json.load(io.open(contrato, encoding="utf-8")).get("durabilidade")
            except ValueError:
                durabilidade = None
    conta = CONTA.search(texto)
    return receita, durabilidade, (conta.group(1) if conta else None)


def varre(raiz):
    """{(area, ambiente, nome): {caminho, receita}} de uma árvore no disco."""
    fora = {}
    for base, dirs, arqs in os.walk(raiz):
        dirs[:] = [d for d in dirs if d not in (".terragrunt-cache", ".terraform", ".git")]
        if "terragrunt.hcl" not in arqs:
            continue
        caminho = os.path.join(base, "terragrunt.hcl")
        chave = celula_do_caminho(caminho, raiz)
        if not chave:
            continue
        receita, durabilidade, conta = receita_de(caminho)
        fora[chave] = {"caminho": os.path.relpath(caminho, raiz),
                       "receita": receita, "durabilidade": durabilidade,
                       "conta": conta}
    return fora


def do_desenho(proposta):
    """{(trilho, ambiente, nome): {receita}} do que o desenho descreve."""
    fora = {}
    for u in proposta.get("unidades", []):
        if u.get("tipo") == "fronteira":
            continue
        ambientes = u.get("ambientes")
        if not ambientes:
            ambientes = (["efemero"] if u.get("efemero_por_pr")
                         else ["compartilhado"] if u.get("natureza_ou") == "fundacional"
                         else ["nao-prod", "prod"])
        for amb in ambientes:
            chave = (u["trilho"], normaliza_ambiente(amb), u["nome"])
            fora[chave] = {
                "receita": "organismos/%s/%s" % (u["trilho"], u["nome"]),
                "durabilidade": u.get("durabilidade"),
                "ou": u.get("ou"),
                "conta": u.get("conta"),
            }
    return fora


def motivo_da_conta(comparavel, na_arvore, no_desenho):
    """Por que a conta entrou, ou não entrou, na comparação."""
    if comparavel:
        return ""
    cabeca = "a conta não é campo de célula nesta comparação: "
    if na_arvore and no_desenho:
        return cabeca + ("as duas pontas a escrevem em vocabulários diferentes "
                         "(número de doze dígitos de um lado, nome do outro)")
    if na_arvore:
        return cabeca + "o desenho não a traz"
    if no_desenho:
        return cabeca + ("a árvore a resolve fora da célula (um root.hcl com "
                         "mapa, pelo caminho)")
    return cabeca + "nenhum dos dois a escreve na célula"


def compara(proposta, raiz):
    desenho, arvore = do_desenho(proposta), varre(raiz)
    # o desenho responde pelo recorte dele. Célula de trilho que ele nem
    # descreve não é achado: é outro assunto, e listá-la afogaria o que importa.
    recorte = {k[0] for k in desenho}
    arvore = {k: v for k, v in arvore.items() if k[0] in recorte}
    nasce = sorted(k for k in desenho if k not in arvore)
    sai = sorted(k for k in arvore if k not in desenho)

    # a conta só é campo quando as duas pontas a escrevem. Uma árvore que
    # resolve conta pelo caminho, num `root.hcl` com mapa, não a escreve em
    # célula nenhuma: dizer isso é melhor do que comparar contra None e calar.
    conta_na_arvore = any(v.get("conta") for v in arvore.values())
    conta_no_desenho = any(v.get("conta") for v in desenho.values())
    # o desenho escreve a conta por nome ("conta de dados"); uma árvore que a
    # escreve usa o número de doze dígitos. Comparar os dois marcaria toda
    # célula como mudada, e a mudança seria da língua, não da infraestrutura.
    numero = re.compile(r"^\d{12}$")
    def so_numero(vals):
        vals = [v for v in vals if v]
        return bool(vals) and all(numero.match(str(v)) for v in vals)
    numerica_na_arvore = so_numero([v.get("conta") for v in arvore.values()])
    numerica_no_desenho = so_numero([v.get("conta") for v in desenho.values()])
    mesma_lingua = numerica_na_arvore == numerica_no_desenho
    conta_comparavel = conta_na_arvore and conta_no_desenho and mesma_lingua

    muda = []
    for k in sorted(set(desenho) & set(arvore)):
        d, a = desenho[k], arvore[k]
        if d["receita"] and a["receita"] and d["receita"] != a["receita"]:
            muda.append({"celula": k, "campo": "receita",
                         "de": a["receita"], "para": d["receita"]})
        if conta_comparavel and d.get("conta") and a.get("conta") \
                and d["conta"] != a["conta"]:
            muda.append({"celula": k, "campo": "conta",
                         "de": a["conta"], "para": d["conta"]})

    # três destinos para o que está na árvore e não no desenho:
    #   aviso    permanente, protegido pela durabilidade: nunca cai por rotina
    #   removida efêmera do ambiente de PR: sumir é o comportamento dela
    #   achado   o resto, que sem histórico do desenho anterior não dá para
    #            separar entre "saiu do desenho" e "nunca esteve nele"
    avisos, removidas, achados = [], [], []
    for k in sai:
        if arvore[k].get("durabilidade") == "permanente":
            avisos.append(k)
        elif k[1] in EFEMERO or arvore[k].get("durabilidade") == "efemera":
            removidas.append(k)
        else:
            achados.append(k)
    return {"nasce": nasce, "muda": muda, "sai": sai, "achados": achados,
            "removidas": removidas, "avisos": avisos,
            "conta_comparavel": conta_comparavel,
            "por_que_conta": motivo_da_conta(conta_comparavel, conta_na_arvore,
                                             conta_no_desenho),
            "recorte": sorted(recorte), "total_desenho": len(desenho),
            "total_arvore": len(arvore)}


def main(argv):
    if len(argv) != 3:
        print(__doc__.strip())
        return 2
    proposta = json.load(io.open(argv[1], encoding="utf-8"))
    raiz = os.path.abspath(os.path.expanduser(argv[2]))
    if not os.path.isdir(raiz):
        print("não achei a árvore em %s" % raiz, file=sys.stderr)
        return 2
    r = compara(proposta, raiz)
    print("desenho e código, não desenho e nuvem: aplicar é outra pergunta.")
    print("recorte: %s" % ", ".join(r["recorte"]))
    print("desenho: %d células · árvore no recorte: %d células"
          % (r["total_desenho"], r["total_arvore"]))
    if r["por_que_conta"]:
        print(r["por_que_conta"])
    # aviso conta: uma célula permanente que sumiu do desenho é diferença, e
    # dizer "batem" com ela pendurada era aprovar por omissão
    if not (r["nasce"] or r["muda"] or r["sai"]):
        print("batem: nada nasce, nada muda, nada sai")
        return 0
    for k in r["nasce"]:
        print("nasce    %s/%s/%s" % k)
    for m in r["muda"]:
        print("muda     %s/%s/%s · %s: %s → %s"
              % (m["celula"] + (m["campo"], m["de"], m["para"])))
    for k in r["removidas"]:
        print("removida %s/%s/%s é efêmera e sumiu do desenho: some com a PR" % k)
    for k in r["achados"]:
        print("achado   %s/%s/%s existe na árvore e não vem de desenho nenhum" % k)
    for k in r["avisos"]:
        print("aviso    %s/%s/%s é permanente e sumiu do desenho: não cai por rotina" % k)
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
