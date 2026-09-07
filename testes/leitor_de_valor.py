#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""O que o leitor de HCL guarda de cada forma de valor, e o que ele devolve.

Um valor de `inputs` volta ao arquivo por um de dois caminhos: `respostas`, que
o gerador escreve entre aspas, ou `formulas`, que ele escreve cru. Mandar
expressão pelo caminho da resposta produz Terraform que não roda:

    schema_avro = file("x.avsc")     vira     schema_avro = "file(\\"x.avsc\\")"

Até 2026-09-07 a escolha saía de uma LISTA DE NOMES de função
(`dependency|local|var|get_env|values|try|merge|jsonencode`), e o que não
estava na lista virava texto. `file(...)` não estava. Nem valor aberto por
parêntese, nem heredoc: os dois se perdiam inteiros.

Lista de nomes é adivinhação, e é o defeito que este repositório persegue em
recurso da AWS. A régua que substituiu: **literal é o que é literal** (texto
entre aspas sem interpolação, número, booleano, nulo). Todo o resto é
expressão, e expressão volta crua.

Medido na árvore real do gf-infrastructure: os três casos abaixo respondem por
parte dos 59 arquivos que saíam parecidos em vez de iguais.

    python3 testes/leitor_de_valor.py

Saída: 0 todas as formas voltam · 1 alguma forma se perde
"""
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(AQUI), "ferramentas"))
import hcl_lido  # noqa: E402

CASOS = [
    # (nome, texto do inputs, chave, como tem que voltar, por onde)
    ("texto simples é resposta",
     'inputs = {\n  nome = "vpc-dominio"\n}\n', "nome", "vpc-dominio", "resposta"),
    ("número é resposta",
     'inputs = {\n  netmask = 16\n}\n', "netmask", 16, "resposta"),
    ("booleano é resposta",
     'inputs = {\n  ativo = true\n}\n', "ativo", True, "resposta"),
    ("nulo é resposta",
     'inputs = {\n  role_backup_arn = null\n}\n', "role_backup_arn", None, "resposta"),
    ("dependência é fórmula",
     'inputs = {\n  vpc_id = dependency.vpc.outputs.vpc_id\n}\n',
     "vpc_id", "dependency.vpc.outputs.vpc_id", "formula"),
    ("chamada de função é fórmula, mesmo fora da lista antiga",
     'inputs = {\n  schema_avro = file("${get_terragrunt_dir()}/x.avsc")\n}\n',
     "schema_avro", 'file("${get_terragrunt_dir()}/x.avsc")', "formula"),
    ("texto com interpolação é fórmula, e não literal",
     'inputs = {\n  arn = "arn:aws:iam::${local.conta}:role/x"\n}\n',
     "arn", '"arn:aws:iam::${local.conta}:role/x"', "formula"),
    ("valor aberto por parêntese volta inteiro",
     'inputs = {\n  ipam_pool_id = (\n    local.a == local.b\n    ? dependency.i.outputs.p["x"]\n'
     '    : dependency.i.outputs.q["y"]\n  )\n}\n',
     "ipam_pool_id",
     '(\n    local.a == local.b\n    ? dependency.i.outputs.p["x"]\n'
     '    : dependency.i.outputs.q["y"]\n  )', "formula"),
    ("concat de várias linhas volta inteiro",
     'inputs = {\n  arns = concat(\n    [dependency.a.outputs.role_arn],\n    ["arn:aws:iam::1:role/b"],\n  )\n}\n',
     "arns",
     'concat(\n    [dependency.a.outputs.role_arn],\n    ["arn:aws:iam::1:role/b"],\n  )', "formula"),
    ("heredoc volta inteiro, corpo incluído",
     'inputs = {\n  buildspec = <<-YAML\n    version: 0.2\n    phases:\n      build:\n'
     '        commands:\n          - echo oi\n  YAML\n}\n',
     "buildspec",
     '<<-YAML\n    version: 0.2\n    phases:\n      build:\n'
     '        commands:\n          - echo oi\n  YAML', "formula"),
    ("mapa de várias linhas volta inteiro",
     'inputs = {\n  camadas = {\n    fila = { bits = 10 }\n  }\n}\n',
     "camadas", '{\n    fila = { bits = 10 }\n  }', "formula"),
]


# ── a coluna do `=` é autoral ──────────────────────────────────────────────
#
# `hclfmt` é idempotente, não canônico: ele aceita um bloco alinhado numa
# coluna mais larga do que a que ele mesmo produziria, e só realinha quando
# alguma linha está fora. Medido em 2026-09-07: `consumo-decisao` mantém a
# coluna 19 num grupo cujo maior nome pede 15, e `hclfmt --diff` não muda nada;
# desalinhando UMA linha, ele reescreve o grupo inteiro em 15.
#
# Então a coluna não se deduz: ela é o que a pessoa escreveu, como `ordem`,
# `quebras` e `arranjo`. O `.bio` precisa guardá-la, ou 12 dos 53 arquivos que
# ainda saem parecidos continuam saindo parecidos para sempre.

COLUNAS = [
    ("a coluna mais larga que o necessário é guardada",
     'inputs = {\n  ambiente           = "dev"\n  imagem_inicial     = "x"\n}\n',
     {"ambiente": 19}),
    ("coluna justa também é guardada",
     'inputs = {\n  ambiente = "dev"\n  plano    = "x"\n}\n',
     {"ambiente": 9}),
]


def confere_colunas():
    falhas = 0
    for nome, texto, esperado in COLUNAS:
        _r, _d, _f, ordem = hcl_lido.inputs_do_terragrunt(texto)
        colunas = (ordem or {}).get("colunas") or {}
        ok = all(colunas.get(k) == v for k, v in esperado.items())
        print("  %-52s %s" % (nome, "ok" if ok else "REPROVADO"))
        if not ok:
            falhas += 1
            print("      esperava %r, veio %r" % (esperado, colunas))
    return falhas


def main():
    falhas = 0
    for nome, texto, chave, esperado, caminho in CASOS:
        respostas, derivados, formulas, _ordem = hcl_lido.inputs_do_terragrunt(texto)
        if caminho == "resposta":
            obtido = respostas.get(chave, "<ausente>")
            ok = chave in respostas and obtido == esperado and chave not in formulas
        else:
            obtido = formulas.get(chave, "<ausente>")
            ok = chave in formulas and obtido == esperado
        print("  %-52s %s" % (nome, "ok" if ok else "REPROVADO"))
        if not ok:
            falhas += 1
            print("      esperava (%s) %r" % (caminho, esperado))
            print("      veio             %r" % (obtido,))
    falhas += confere_colunas()
    print("leitor de valor: %s" % ("ok" if not falhas else "%d forma(s) se perdem" % falhas))
    return 1 if falhas else 0


if __name__ == "__main__":
    sys.exit(main())
