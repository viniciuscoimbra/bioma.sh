#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gate: nenhum valor de reserva consegue passar por valor declarado.

Uma árvore de Terragrunt é escrita antes de a instituição existir, e por isso
cada célula carrega valores de exemplo. O perigo não é o valor de exemplo: é o
valor de exemplo que **funciona**. Por funcionar, ele não levanta erro, e o
comando segue produzindo a coisa errada com a aparência da coisa certa.

Este verificador confere a procedência: todo valor que chega a um comando veio
de quem declarou, e não do template. Três formas de quebrar isso:

1. Queda de `get_env` com conta que ninguém emitiu. `get_env("TG_CONTA_X",
   "111111111111")` devolve um número válido, que forma um nome de balde de
   estado válido, e o estado da instituição vai para um balde batizado com um
   número inventado, dentro da conta real dela. A queda tem que ser incapaz de
   funcionar: `DECLARE_<VARIÁVEL>` não é nome de balde que o S3 aceite nem
   valor que `allowed_account_ids` aceite.

   Vale para a conta escondida dentro de um ARN
   (`arn:aws:acm:sa-east-1:222222222222:certificate/...`), que é a mesma conta
   inventada com um ARN em volta.

2. `dependency` sem `mock_outputs_allowed_terraform_commands`. O mock existe
   para o plano de quem depende de algo que ainda não aplicou. Sem essa linha o
   Terragrunt o entrega também no apply, e o recurso nasce apontando para um
   ARN inventado enquanto o comando escreve `Apply complete`.

3. Saída de plano versionada. `plano.json` tem número de conta e id de recurso,
   envelhece no commit seguinte e se lê como registro de um plano real.

A régua de "conta inventada" é a variação dos dígitos, e não uma lista de
números proibidos, que envelhece a cada número novo.

Uso: verificar_procedencia.py [caminho-da-arvore]
Saída: 0 limpo · 1 reprovado
"""
import io
import os
import re
import subprocess
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# O arquivo que declara os números inventados, e diz no cabeçalho que são
# inventados. Só o perfil `local` o carrega.
ILUSTRATIVOS = os.environ.get("BIOMA_CONTAS_ILUSTRATIVAS",
                             os.path.join("infra", "contas-ilustrativas.env"))

# A queda de um get_env, seja ela qual for. O julgamento de "isto é conta
# inventada" vem depois, e não do formato da linha: já custou caro a régua que
# só via doze dígitos sozinhos e deixava passar
# `arn:aws:acm:sa-east-1:222222222222:certificate/...`, que é a mesma conta
# inventada com um ARN em volta.
QUALQUER_QUEDA = re.compile(
    r'get_env\(\s*"([A-Z][A-Z0-9_]*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*\)')
DEP = re.compile(r'dependency\s+"([^"]+)"\s*\{')
IGNORA = {".git", ".terragrunt-cache", ".terraform", "__pycache__", "node_modules"}


def hcl_da_arvore(raiz):
    for base, dirs, arqs in os.walk(raiz):
        dirs[:] = [d for d in dirs if d not in IGNORA]
        for a in sorted(arqs):
            if a.endswith((".hcl", ".tf")):
                yield os.path.join(base, a)


def conta_de_exemplo(valor):
    """Doze dígitos com pouca variação são conta de exemplo, não conta emitida.

    Conta AWS real é sorteada: doze dígitos aleatórios formam cerca de onze
    blocos de dígitos repetidos. As de exemplo são escritas à mão e formam
    poucos (`700000000001` tem três, `999999999999` tem um, `111122223333` tem
    três). Quatro blocos é o corte, e a chance de uma conta real cair abaixo
    dele é desprezível. A segunda regra cobre a sequência corrida
    (`123456789012`) que a documentação da AWS usa e que forma doze blocos.
    """
    if not re.fullmatch(r"\d{12}", valor):
        return False
    if len(re.findall(r"(.)\1*", valor)) <= 4:
        return True
    digitos = [int(c) for c in valor]
    return all((b - a) % 10 == 1 for a, b in zip(digitos, digitos[1:]))


def corpo_do_bloco(texto, fim_do_cabecalho):
    """Do `{` até o `}` que o fecha, contando aninhamento."""
    i = fim_do_cabecalho - 1
    nivel, j = 0, i
    while j < len(texto):
        if texto[j] == "{":
            nivel += 1
        elif texto[j] == "}":
            nivel -= 1
            if nivel == 0:
                break
        j += 1
    return texto[i:j]


def conta_inventada(valor):
    """O valor é uma conta que ninguém emitiu, crua ou dentro de um ARN?

    A decisão é de `conta_de_exemplo`, pela variação dos dígitos.
    """
    if conta_de_exemplo(valor):
        return valor
    if valor.startswith("arn:"):
        campos = valor.split(":", 5)
        if len(campos) >= 5 and conta_de_exemplo(campos[4]):
            return campos[4]
    return ""


def conta_com_reserva_que_funciona(raiz):
    fora = []
    for caminho in hcl_da_arvore(raiz):
        texto = io.open(caminho, encoding="utf-8", errors="replace").read()
        for m in QUALQUER_QUEDA.finditer(texto):
            num = conta_inventada(m.group(2))
            if not num:
                continue
            linha = texto[:m.start()].count("\n") + 1
            fora.append((os.path.relpath(caminho, raiz), linha, m.group(1), m.group(2)))
    return fora


def mock_que_alcanca_o_apply(raiz):
    fora = []
    for caminho in hcl_da_arvore(raiz):
        if os.path.basename(caminho) != "terragrunt.hcl":
            continue
        texto = io.open(caminho, encoding="utf-8", errors="replace").read()
        for m in DEP.finditer(texto):
            corpo = corpo_do_bloco(texto, m.end())
            if "mock_outputs" in corpo and "mock_outputs_allowed_terraform_commands" not in corpo:
                linha = texto[:m.start()].count("\n") + 1
                fora.append((os.path.relpath(caminho, raiz), linha, m.group(1)))
    return fora


def plano_versionado(raiz):
    r = subprocess.run(["git", "-C", raiz, "ls-files"], capture_output=True, text=True)
    if r.returncode != 0:
        return []
    return [l for l in r.stdout.splitlines() if os.path.basename(l) == "plano.json"]


def main(argv):
    raiz = os.path.abspath(argv[1]) if len(argv) > 1 else AQUI
    if not os.path.isdir(raiz):
        print("não achei a árvore em %s" % raiz, file=sys.stderr)
        return 1

    contas = conta_com_reserva_que_funciona(raiz)
    mocks = mock_que_alcanca_o_apply(raiz)
    planos = plano_versionado(raiz)

    print("procedência · %d queda com conta inventada · %d mock que alcança o "
          "apply · %d saída de plano versionada" % (len(contas), len(mocks), len(planos)))

    if not (contas or mocks or planos):
        ilus = os.path.join(raiz, ILUSTRATIVOS)
        if os.path.isfile(ilus):
            quantos = sum(1 for l in io.open(ilus, encoding="utf-8")
                          if re.match(r"^[A-Z]", l))
            print("os %d números inventados moram em %s, e só o perfil local os carrega"
                  % (quantos, ILUSTRATIVOS))
        return 0

    if contas:
        print("\nvalor de reserva que funciona (a conta não declarada vira número válido):")
        for arq, linha, var, num in contas[:12]:
            print("  %s:%d  %s cai em %s" % (arq, linha, var, num))
        if len(contas) > 12:
            print("  (e mais %d)" % (len(contas) - 12))
        print("  conserte: o valor de reserva é \"DECLARE_<VARIÁVEL>\", não um número")

    if mocks:
        print("\nmock que vale no apply (falta mock_outputs_allowed_terraform_commands):")
        for arq, linha, nome in mocks[:12]:
            print("  %s:%d  dependency \"%s\"" % (arq, linha, nome))
        if len(mocks) > 12:
            print("  (e mais %d)" % (len(mocks) - 12))
        print("  conserte: mock_outputs_allowed_terraform_commands = "
              "[\"validate\", \"plan\", \"init\"]")

    if planos:
        print("\nsaída de plano versionada (tem conta e id, e envelhece):")
        for p in planos[:8]:
            print("  %s" % p)
        print("  conserte: git rm --cached, e **/plano.json no .gitignore")

    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
