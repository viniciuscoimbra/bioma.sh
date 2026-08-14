#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""O que não é código, e sem o que o comando não começa.

    python3 ferramentas/prerequisitos.py conferir --passo 2 [--apply]
    python3 ferramentas/prerequisitos.py listar

Quota de contas, endereços de e-mail com entrega provada, root da conta de
management no domínio da instituição. Nenhum deles é Terraform, todos são
condição para um passo específico, e a falta de qualquer um aparece no meio do
apply, quando já existe conta criada.

A resposta não é um valor: é a afirmação de que aconteceu, com a data. Ninguém
consome "a quota é 60"; o que o comando precisa saber é que alguém cuidou disso
e quando. Por isso o formato é `AAAA-MM-DD` e a variável começa com `TG_OK_`.

Onde a nuvem souber responder, a leitura automática CONFIRMA a declaração e
avisa quando as duas divergem. Ela não substitui: a prova de entrega de nove
endereços e a troca do root não se leem por API, e metade automática ensinaria
que a lista é opcional.

Saída: 0 ok ou aviso · 1 reprovado · 2 sem insumo para decidir
"""
import json
import os
import re
import subprocess
import sys

DATA = re.compile(r"^\d{4}-\d{2}-\d{2}$")

# variável -> (o que é, de quem é a ação, passo que ela alcança, nível, confirmação)
#
# O nível separa o que faz o passo FALHAR do que deixa a instituição fora de
# conformidade. Os dois são declarados, e é essa a regra: um portão que só cobra
# o que trava ensina que o resto é opcional. O que muda é a consequência.
#
#   exige   sem a declaração o apply para: o passo falha no meio, com recurso
#           já criado e sem volta
#   espera  sem a declaração o apply segue e o pré-voo diz que falta
PREREQUISITOS = {
    "TG_OK_QUOTA_CONTAS": (
        "a quota de contas da Organization cobre a árvore inteira",
        "quem opera a conta AWS, por ticket no Service Quotas",
        2,
        "exige",
        "quota",
    ),
    "TG_OK_EMAILS": (
        "os endereços das contas existem e a entrega foi provada",
        "a instituição, no provedor de e-mail dela",
        2,
        "exige",
        None,
    ),
    "TG_OK_ROOT_MANAGEMENT": (
        "o root e os contatos da conta de management estão no domínio da instituição",
        "a instituição",
        1,
        "espera",
        None,
    ),
}

# A quota de contas por Organization ("Maximum number of accounts"). O código é
# da AWS e não muda por conta.
QUOTA_CONTAS = ("organizations", "L-E619E033")


def declarado(var):
    return (os.environ.get(var) or "").strip()


def quota_real():
    """O valor que a AWS diz, ou None quando não dá para perguntar."""
    r = subprocess.run(["aws", "service-quotas", "get-service-quota",
                        "--service-code", QUOTA_CONTAS[0],
                        "--quota-code", QUOTA_CONTAS[1],
                        "--query", "Quota.Value", "--output", "json"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        return None
    try:
        return int(float(json.loads(r.stdout or "null")))
    except (ValueError, TypeError):
        return None


def contas_da_arvore():
    """Quantas contas a árvore cria. É o que a quota precisa cobrir."""
    infra = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "infra")
    alvo = os.path.join(infra, "fundacao", "04-contas")
    if not os.path.isdir(alvo):
        return 0
    return sum(1 for d in os.listdir(alvo)
               if os.path.exists(os.path.join(alvo, d, "terragrunt.hcl")))


def confere(passo, apply_mode):
    cobrados = {v: e for v, e in PREREQUISITOS.items()
                if passo is None or e[2] <= passo}
    if not cobrados:
        print("pré-requisitos · nenhum cobrado neste passo")
        return 0

    faltando, avisos = [], []
    print("pré-requisitos · %d cobrado(s)%s"
          % (len(cobrados), " até o passo %d" % passo if passo else ""))
    for var in sorted(cobrados):
        oque, dono, trava, nivel, confirma = cobrados[var]
        valor = declarado(var)
        if not valor:
            faltando.append((var, oque, dono, trava, nivel))
            continue
        if not DATA.match(valor):
            faltando.append((var, "%s (a resposta é a data, no formato AAAA-MM-DD; "
                                  "veio %r)" % (oque, valor), dono, trava, nivel))
            continue
        extra = ""
        if confirma == "quota":
            real, preciso = quota_real(), contas_da_arvore()
            if real is None:
                extra = " · a AWS não respondeu a quota; a declaração é o que vale"
            elif preciso and real < preciso:
                extra = " · A AWS DIZ %d, E A ÁRVORE CRIA %d CONTAS" % (real, preciso)
                avisos.append(var)
            else:
                extra = " · a AWS confirma %d" % real
        print("  %-24s %s%s" % (var, valor, extra))

    for var, oque, dono, trava, nivel in faltando:
        print("  %-24s SEM DECLARAÇÃO" % var)
        print("      %s" % oque)
        print("      é ação de: %s" % dono)
        if nivel == "exige":
            print("      trava o passo %d da fila" % trava)
        else:
            print("      esperada antes do passo %d, e não trava o comando" % trava)

    trava_o_comando = [f for f in faltando if f[4] == "exige"]
    if trava_o_comando and apply_mode:
        print("\nREPROVADO: o que falta acima não é código, e o apply descobre isso no")
        print("meio, quando já existe conta criada. Declare a data em")
        print("infra/instancia.env.local, ou rode ./bioma.sh --instalar.")
        return 1
    if faltando and not trava_o_comando:
        print("\naviso: o que falta acima não trava o comando, e continua faltando.")
    elif faltando:
        print("\naviso: planejar não cria conta nem consome quota, então o plano segue.")
    if avisos:
        print("\naviso: declaração e nuvem divergem nas variáveis acima.")
    return 0


def main(argv):
    if len(argv) < 2:
        print(__doc__, file=sys.stderr)
        return 2
    if argv[1] == "listar":
        for var, (oque, dono, trava, nivel, _) in sorted(PREREQUISITOS.items()):
            print("%s\t%s\t%s\t%d\t%s" % (var, oque, dono, trava, nivel))
        return 0
    if argv[1] != "conferir":
        print(__doc__, file=sys.stderr)
        return 2
    passo = None
    if "--passo" in argv:
        passo = int(argv[argv.index("--passo") + 1])
    return confere(passo, "--apply" in argv)


if __name__ == "__main__":
    sys.exit(main(sys.argv))
