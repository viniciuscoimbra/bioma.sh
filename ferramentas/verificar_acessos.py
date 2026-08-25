#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gate: conta que tem carga tem caminho de gente declarado.

A conta nasce por receita e o acesso humano nasce por outra célula. Quando as
duas não andam juntas, a conta sobe, recebe carga, e ninguém do time a alcança:
a única entrada que resta é o papel de organização assumido da management, que
é o que a fundação existe para não precisar usar no dia a dia.

O defeito é silencioso porque nada falha. O apply passa (a esteira tem o
próprio papel), o recurso nasce, e a falta só aparece quando uma pessoa tenta
entrar e descobre que a conta não está na lista dela. Foi assim que um domínio
inteiro ficou fora do alcance de quem o opera, e o sintoma chegou como "meu SSO
não tem essa conta", semanas depois do apply.

O que este gate cobra: toda conta com célula de carga na árvore aparece como
alvo de alguma célula de acesso, ou está declarada como conta sem gente, com a
razão escrita. Ele lê a árvore, e não a nuvem: atribuição feita pelo console
não conta como declarada, e é essa a intenção. Acesso que mora fora do código
não se audita em revisão, não se reproduz noutra instalação e não se revoga em
lote no dia em que alguém sai. Conta criada e ainda vazia não é cobrada: ela não tem o que
alcançar, e cobrar antes da carga ensinaria a declarar exceção por antecipação.

A declaração é da instância, em `convencoes.json`:

    "contas_sem_acesso_humano": {
      "<apelido>": "a razão pela qual nenhuma pessoa entra nesta conta"
    }

Uso: python3 ferramentas/verificar_acessos.py [<raiz-da-arvore>]
Saída: 0 ok · 1 conta com carga e sem caminho · 2 sem insumo para decidir
"""
import io
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IGNORA = {".terragrunt-cache", ".terraform"}

RECEITA_CONTA = "organismos/fundacao/conta-governada"
# Duas receitas concedem acesso, e as duas contam. A ligação nomeia a conta pela
# variável dela; o organismo da fundação nomeia pela dependência da célula que
# cria a conta. Ler só uma das duas fazia o gate acusar conta que a árvore já
# declara, e gate que grita o que já está feito ensina a ser ignorado.
RECEITA_ACESSO = "ligacoes/acesso-ao-dominio"
RECEITA_IDENTIDADE = "organismos/fundacao/identity-center"

FONTE = re.compile(r'source\s*=\s*"[^"]*catalogo//?((?:organismos|ligacoes|moleculas|artefatos)/[a-z0-9\-/]+)"')
VAR_CONTA = re.compile(r'get_env\(\s*"(TG_CONTA_[A-Z_0-9]+)"')
MAPA_LINHA = re.compile(r'^\s*"?([a-z0-9/_-]+)"?\s*=\s*"([a-z0-9-]+)"\s*$', re.M)
CONTA_LINHA = re.compile(r'^\s*([a-z][a-z0-9-]*)\s*=\s*get_env\(\s*"(TG_CONTA_[A-Z_0-9]+)"', re.M)
DEP_CONTA = re.compile(r'dependency\s+"([^"]+)"\s*\{[^}]*?config_path\s*=\s*"([^"]+)"', re.S)
DEP_USADA = re.compile(r'dependency\.([a-z0-9_]+)\.outputs\.account_id')


def bloco(texto, nome):
    """O corpo de um bloco `nome = { ... }` de HCL, pela primeira chave que fecha."""
    m = re.search(r"%s\s*=\s*\{" % re.escape(nome), texto)
    if not m:
        return ""
    resto = texto[m.end():]
    fim = resto.find("\n  }")
    return resto[:fim] if fim > 0 else resto


def mapa_de_contas(infra):
    """Os três mapas que o root.hcl usa para resolver a conta de cada célula."""
    caminho = os.path.join(infra, "contas.hcl")
    if not os.path.isfile(caminho):
        return None
    texto = io.open(caminho, encoding="utf-8").read()
    return {
        "var_por_conta": dict(CONTA_LINHA.findall(bloco(texto, "contas"))),
        "conta_fixa": dict(MAPA_LINHA.findall(bloco(texto, "trilho_conta_fixa"))),
        "familia": dict(MAPA_LINHA.findall(bloco(texto, "trilho_familia"))),
        "sufixo": dict(MAPA_LINHA.findall(bloco(texto, "ambiente_sufixo"))),
    }


# A fundação tem `root.hcl` próprio e roda na management, que não é conta de
# carga: tratá-la como conta faria o gate cobrar caminho de gente para cada
# passo dela, e o passo não é lugar onde gente entra.
RAIZ_FUNDACIONAL = "fundacao"


def conta_da_celula(rel, mapa):
    """A conta que uma célula toca, na mesma regra do root.hcl.

    Reimplementar a regra é o preço de um gate que lê a árvore sem chamar o
    Terragrunt. Ela é curta e está num lugar só; divergir dela faria o gate
    falar de conta errada, que é pior do que não falar.
    """
    partes = rel.split("/")
    raiz = partes[0]
    if raiz == RAIZ_FUNDACIONAL:
        return None
    if raiz == "plataforma" and len(partes) > 3 and partes[2] == "contas":
        return partes[3]
    if raiz in ("plataforma", "consumidores"):
        chave = "%s/%s" % (raiz, partes[1] if len(partes) > 1 else "")
        if chave in mapa["conta_fixa"]:
            return mapa["conta_fixa"][chave]
        familia = mapa["familia"].get(chave)
        if not familia:
            return None
        ambiente = partes[2] if len(partes) > 2 else "prd"
        return "%s-%s" % (familia, mapa["sufixo"].get(ambiente, ambiente))
    if len(partes) > 1:
        return "%s-%s" % (raiz, partes[1])
    return None


def celulas(infra):
    """(caminho relativo, receita, texto) de cada célula da árvore."""
    for base, dirs, arqs in os.walk(infra):
        dirs[:] = [d for d in dirs if d not in IGNORA]
        if "terragrunt.hcl" not in arqs or os.path.samefile(base, infra):
            continue
        texto = io.open(os.path.join(base, "terragrunt.hcl"), encoding="utf-8").read()
        m = FONTE.search(texto)
        yield os.path.relpath(base, infra), (m.group(1) if m else None), texto


def dispensadas():
    """As contas que a instância declara sem gente, com a razão de cada uma."""
    caminho = os.environ.get("BIOMA_CONVENCOES") or os.path.join(AQUI, "convencoes.json")
    if not os.path.isfile(caminho):
        return {}
    try:
        d = json.load(io.open(caminho, encoding="utf-8"))
    except ValueError:
        return {}
    return {k: v for k, v in d.get("contas_sem_acesso_humano", {}).items()
            if not k.startswith("_")}


def main(argv):
    raiz = argv[1] if len(argv) > 1 else os.path.join(AQUI, "infra")
    infra = os.path.abspath(raiz)
    if not os.path.isdir(infra):
        print("sem insumo para decidir: %s não existe" % infra, file=sys.stderr)
        return 2
    mapa = mapa_de_contas(infra)
    if not mapa or not mapa["var_por_conta"]:
        print("sem insumo para decidir: %s/contas.hcl não declara contas" % infra,
              file=sys.stderr)
        return 2

    nasce, com_carga, alcancadas = set(), {}, set()
    for rel, receita, texto in celulas(infra):
        if receita == RECEITA_CONTA:
            nasce.add(os.path.basename(rel))
            continue
        if receita == RECEITA_IDENTIDADE:
            # a matriz aponta a conta pela dependência que a cria, e o apelido
            # é o nome da pasta dessa célula
            caminho_da_dep = {n: c for n, c in DEP_CONTA.findall(texto)}
            for nome in set(DEP_USADA.findall(texto)):
                caminho = caminho_da_dep.get(nome, "")
                if caminho:
                    alcancadas.add(os.path.basename(caminho.rstrip("/")))
            continue
        if receita == RECEITA_ACESSO:
            # a célula de acesso nomeia a conta pela variável dela, e uma
            # célula pode alcançar mais de uma conta (um conjunto por ambiente)
            vars_ = set(VAR_CONTA.findall(texto))
            for apelido, var in mapa["var_por_conta"].items():
                if var in vars_:
                    alcancadas.add(apelido)
            continue
        alvo = conta_da_celula(rel, mapa)
        if alvo:
            com_carga.setdefault(alvo, []).append(rel)

    if not nasce:
        print("sem insumo para decidir: nenhuma célula de conta na árvore", file=sys.stderr)
        return 2

    fora = dispensadas()
    orfas = sorted(c for c in com_carga if c not in alcancadas and c not in fora)

    print("acessos · %d conta(s) na árvore · %d com carga · %d alcançada(s) por célula de acesso"
          % (len(nasce), len(com_carga), len(alcancadas)))
    if fora:
        print("  %d declarada(s) sem gente: %s" % (len(fora), ", ".join(sorted(fora))))
    if not orfas:
        print("toda conta com carga tem caminho de gente declarado")
        return 0

    print("\nconta com carga cujo acesso humano NÃO nasce da árvore:")
    for c in orfas:
        cels = com_carga[c]
        print("  %s · %d célula(s), entre elas %s" % (c, len(cels), cels[0]))
    print("\nO que existir de acesso nessas contas foi posto fora daqui, e o que")
    print("mora fora da árvore ninguém audita, reproduz nem revoga em lote.")
    print("Ou nasce a célula de acesso do domínio, ou a conta entra em")
    print("`contas_sem_acesso_humano` do convencoes.json, com a razão escrita.")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
