#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""O contrato da ligação diz a cardinalidade que a receita implementa.

Contrato que diz 1:1 sobre um `variables.tf` que pede lista é pior que contrato
ausente: quem lê decide errado quantas células a ligação vai precisar, e o erro
só aparece quando falta permissão em produção.

    python3 ferramentas/verificar_cardinalidade.py [catalogo/ligacoes]

Sai zero quando o catálogo está coerente, e um quando não está.
"""
import io
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
# A instância pode guardar o catálogo noutro lugar (`infra/catalogo/` é o
# arranjo comum), e o pré-voo chama os verificadores sem argumento. Em vez de
# obrigar cada instância a passar caminho, o verificador procura nos dois
# arranjos conhecidos, e `BIOMA_LIGACOES` vence os dois.
def _padrao():
    fora = os.environ.get("BIOMA_LIGACOES")
    if fora:
        return fora
    raiz = os.path.dirname(AQUI)
    for tentativa in (os.path.join(raiz, "catalogo", "ligacoes"),
                      os.path.join(raiz, "infra", "catalogo", "ligacoes")):
        if os.path.isdir(tentativa):
            return tentativa
    return os.path.join(raiz, "catalogo", "ligacoes")


PADRAO = _padrao()
CARDINALIDADES = ("1:1", "1:N", "N:N")
FORMAS = ("lista", "celula")


def variaveis(caminho):
    """nome -> tipo declarado, lido do variables.tf."""
    fora = {}
    arq = os.path.join(caminho, "variables.tf")
    if not os.path.isfile(arq):
        return fora
    texto = io.open(arq, encoding="utf-8").read()
    # o bloco de uma linha (`variable "x" { type = list(string) }`) é tão comum
    # quanto o de várias, então o corpo vai do nome até a próxima declaração.
    achados = list(re.finditer(r'variable\s+"([^"]+)"', texto))
    for i, m in enumerate(achados):
        fim = achados[i + 1].start() if i + 1 < len(achados) else len(texto)
        corpo = texto[m.end():fim]
        tipo = re.search(r"type\s*=\s*([a-z]+)", corpo)
        fora[m.group(1)] = tipo.group(1) if tipo else "string"
    return fora


PARES = re.compile(r"map\s*\(\s*object\s*\(", re.S)


def bruto_da_variavel(caminho, nome):
    """O texto da declaração desta variável, para ver o tipo por dentro."""
    arq = os.path.join(caminho, "variables.tf")
    if not os.path.isfile(arq):
        return None
    texto = io.open(arq, encoding="utf-8").read()
    m = re.search(r'variable\s+"%s"' % re.escape(nome), texto)
    if not m:
        return None
    resto = texto[m.end():]
    prox = re.search(r'variable\s+"', resto)
    return resto[:prox.start()] if prox else resto


def confere(pasta):
    queixas, conferidas = [], 0
    for nome in sorted(os.listdir(pasta)):
        caminho = os.path.join(pasta, nome)
        contrato = os.path.join(caminho, "contrato.json")
        if not os.path.isfile(contrato):
            continue
        conferidas += 1
        d = json.load(io.open(contrato, encoding="utf-8"))
        card = d.get("cardinalidade")
        forma = d.get("forma_do_n")
        n_em = d.get("n_em") or []
        vs = variaveis(caminho)

        if card not in CARDINALIDADES:
            queixas.append("%s: cardinalidade ausente ou fora de %s (veio %r)"
                           % (nome, ", ".join(CARDINALIDADES), card))
            continue
        if forma not in FORMAS:
            queixas.append("%s: forma_do_n precisa ser %s (veio %r)"
                           % (nome, " ou ".join(FORMAS), forma))
        # toda coleção precisa estar classificada: ou ela é o outro lado da
        # ligação, ou é detalhe de configuração. Coleção não classificada é o
        # buraco por onde 1:1 passava mentindo sobre uma lista de alvos.
        config = d.get("colecoes_de_config") or []
        colecoes = [v for v, tp in vs.items() if tp in ("list", "map", "set")]
        soltas = [v for v in colecoes if v not in n_em and v not in config]
        if soltas:
            queixas.append("%s: coleção sem classificação: %s. Diga se é o outro "
                           "lado da ligação (n_em) ou detalhe de configuração "
                           "(colecoes_de_config)" % (nome, ", ".join(sorted(soltas))))

        if card == "1:1":
            if n_em:
                queixas.append("%s: diz 1:1 e ainda aponta n_em %s" % (nome, n_em))
            continue
        if not n_em:
            queixas.append("%s: diz %s e não aponta em qual variável o N entra"
                           % (nome, card))
            continue
        for v in n_em:
            if v not in vs:
                queixas.append("%s: n_em aponta %s, que não existe no variables.tf"
                               % (nome, v))
            elif vs[v] not in ("list", "map", "set"):
                queixas.append("%s: diz %s pela variável %s, e ela é %s, não coleção"
                               % (nome, card, v, vs[v]))

        # 1:N e N:N não são a mesma coisa, e o que separa é o par. Duas listas
        # podem ser o mesmo lado (uma role alcança N tópicos e N grupos, e a
        # role continua sendo uma), então contar listas engana. O que denuncia
        # N:N é a coleção de pares: `map(object(...))` com mais de um campo,
        # onde cada entrada casa um lado com o outro.
        pares = [v for v in n_em if PARES.search(bruto_da_variavel(caminho, v) or "")]
        if pares and card != "N:N":
            queixas.append("%s: diz %s e recebe coleção de pares em %s, que é N:N"
                           % (nome, card, ", ".join(pares)))
        elif not pares and card == "N:N" and not d.get("por_que_n_n"):
            # duas listas podem ser lados diferentes (recursos × principais) ou
            # o mesmo lado (uma role alcançando tópicos e grupos). O esquema não
            # diz qual é, então quem escreve declara, e o verificador cobra a
            # declaração em vez de adivinhar.
            queixas.append("%s: diz N:N sem coleção de pares e sem `por_que_n_n`. "
                           "Diga por que os dois lados são plurais, ou corrija "
                           "para 1:N" % nome)
    return queixas, conferidas


def main(argv):
    pasta = argv[1] if len(argv) > 1 else PADRAO
    # Pasta ausente não é reprova: é árvore que ainda não tem ligação, ou
    # catálogo em outro lugar. Quebrar com traceback aqui faz o pré-voo parecer
    # defeito do verificador, e não falta de insumo.
    if not os.path.isdir(pasta):
        print("sem insumo para decidir: não achei %s. Passe a pasta do catálogo "
              "como argumento." % pasta, file=sys.stderr)
        return 2
    queixas, conferidas = confere(pasta)
    if queixas:
        for q in queixas:
            print(q)
        return 1
    print("cardinalidade coerente em %d ligações" % conferidas)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
