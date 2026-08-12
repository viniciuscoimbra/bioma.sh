#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""A oficina: o que ela mata, o que ela apaga e o que ela não pode encostar.

O que este teste guarda aconteceu de verdade nesta máquina. O `terraform
validate` sobe o provider da AWS como processo à parte, neto de quem chamou.
O `subprocess.run` com timeout mata só o filho; o provider ficou vivo, sem pai,
girando em CPU cheia. Vinte deles, trinta e seis horas de CPU cada, e a máquina
parou de responder.

Cada caso vem com o contra-caso, e o contra-caso importa mais aqui: uma
varredura que mata processo demais é pior que o vazamento que ela conserta.

  python3 testes/oficina.py
"""
import io
import os
import shutil
import stat
import subprocess
import sys
import time

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
FERR = os.path.join(RAIZ, "ferramentas")
sys.path.insert(0, FERR)
import oficina  # noqa: E402

placar = []


def diz(ok, item, nota=""):
    placar.append((bool(ok), item, nota))
    print(("  PASS  " if ok else "  FALHA ") + item + (("  · " + str(nota)) if nota else ""))


MARCA = "zz-oficina-teste"


def dublê(pasta, nome):
    """Um executável que ignora os sinais que o provider ignora e não sai.

    O nome carrega "terraform" porque é assim que a varredura reconhece o
    alvo, e o corpo ignora TERM e INT porque é assim que o provider se comporta.
    """
    caminho = os.path.join(pasta, nome)
    io.open(caminho, "w", encoding="utf-8").write(
        '#!/bin/sh\ntrap "" TERM INT HUP\nwhile : ; do /bin/sleep 5 ; done\n')
    os.chmod(caminho, os.stat(caminho).st_mode | stat.S_IEXEC | stat.S_IXGRP)
    return caminho


def rodando(agulha):
    r = subprocess.run(["/bin/ps", "-axo", "pid=,ppid=,command="],
                       capture_output=True, text=True)
    return [l for l in r.stdout.splitlines()
            if agulha in l and "/bin/ps" not in l and "testes/oficina.py" not in l]


def varre_tudo():
    subprocess.run("pkill -9 -f " + MARCA, shell=True)
    time.sleep(0.5)


# ── o que ela roda ─────────────────────────────────────────────────────────

def executar():
    print("\no que a oficina roda")
    rc, saida = oficina.roda(["/bin/echo", "olá"], 10)
    diz(rc == 0 and "olá" in saida, "comando que termina devolve código e saída", saida.strip())

    rc, _ = oficina.roda(["/bin/sleep", "30"], 1)
    diz(rc == oficina.ESTOURO, "comando que passa do tempo devolve 124", rc)

    rc, _ = oficina.roda(["/nao/existe/comando/nenhum"], 5)
    diz(rc == oficina.SEM_COMANDO, "comando que não existe devolve 127", rc)


def neto_morre_junto():
    """O caso que originou tudo: o neto que ignora TERM tem que morrer."""
    print("\no neto que o comando abre")
    base = oficina.pasta("bioma-" + MARCA + "-neto-", varrer=False)
    filho = dublê(base, "terraform-provider-falso-" + MARCA)
    try:
        # o pai abre o neto e espera, igual ao terraform com o provider
        rc, _ = oficina.roda(["/bin/sh", "-c", "%s & wait" % filho], 2)
        time.sleep(1)
        sobrou = rodando(MARCA)
        diz(rc == oficina.ESTOURO and not sobrou,
            "o neto que ignora TERM morre com o grupo no estouro de tempo",
            "%d sobrevivente(s)" % len(sobrou))
    finally:
        varre_tudo()
        oficina.solta(base)


# ── o que ela apaga ────────────────────────────────────────────────────────

def pasta_some():
    print("\na pasta temporária")
    saida = subprocess.run(
        [sys.executable, "-c",
         "import sys; sys.path.insert(0, %r); import oficina;"
         " print(oficina.pasta('bioma-%s-some-', varrer=False))" % (FERR, MARCA)],
        capture_output=True, text=True).stdout.strip()
    diz(saida.startswith(os.path.realpath("/")) or os.sep in saida,
        "a pasta nasce com caminho", saida)
    diz(not os.path.exists(saida),
        "a pasta some quando o processo que a criou sai")


def varredura():
    print("\na varredura do que ficou de execução anterior")
    velha = oficina.pasta("bioma-" + MARCA + "-velha-", varrer=False)
    orfao = dublê(velha, "terraform-provider-falso-" + MARCA)
    # o processo nasce sem pai vivo, como o provider de uma execução morta
    subprocess.Popen(["/bin/sh", "-c", "%s &" % orfao], cwd=velha,
                     start_new_session=True).wait()
    time.sleep(1)
    antes = len(rodando(MARCA))
    # o relógio da pasta recua, para que a varredura a considere velha
    os.utime(velha, (time.time() - 86400, time.time() - 86400))

    orfaos, velhas = oficina.varrer_resto(horas=1, prefixo="bioma-" + MARCA)
    time.sleep(1)
    diz(antes >= 1, "o órfão de mentira está de pé antes da varredura", antes)
    diz(not rodando(MARCA), "a varredura mata o órfão que roda dentro da pasta", orfaos)
    diz(not os.path.exists(velha), "a varredura apaga a pasta esquecida", velhas)
    varre_tudo()
    shutil.rmtree(velha, ignore_errors=True)


def nao_encosta_no_alheio():
    """O contra-caso. Varredura que mata trabalho de outra pessoa é pior que o
    vazamento: aqui o processo tem pai vivo e roda fora de qualquer pasta do
    bioma, e tem que continuar de pé."""
    print("\no que a varredura não pode encostar")
    fora = oficina.pasta("zz-alheio-" + MARCA + "-", varrer=False)
    vivo = dublê(fora, "terraform-provider-de-outra-pessoa-" + MARCA)
    p = subprocess.Popen([vivo], cwd=fora)
    time.sleep(1)
    try:
        oficina.varrer_resto(horas=0, prefixo="bioma-")
        time.sleep(1)
        diz(p.poll() is None,
            "terraform com pai vivo, fora de pasta do bioma, continua rodando")
    finally:
        p.kill()
        varre_tudo()
        oficina.solta(fora)

    # o caso difícil: a pasta é do bioma, tem a idade toda, e mesmo assim
    # pertence a quem ainda está de pé. Duas execuções ao mesmo tempo são o
    # normal quando os testes rodam área por área.
    codigo = ("import sys, time; sys.path.insert(0, %r); import oficina;"
              " print(oficina.pasta('bioma-%s-viva-', varrer=False), flush=True);"
              " time.sleep(30)" % (FERR, MARCA))
    outro = subprocess.Popen([sys.executable, "-c", codigo], stdout=subprocess.PIPE,
                             text=True)
    try:
        dele = outro.stdout.readline().strip()
        os.utime(dele, (time.time() - 86400, time.time() - 86400))
        oficina.varrer_resto(horas=1, prefixo="bioma-")
        diz(os.path.isdir(dele),
            "pasta do bioma com dono vivo não é apagada por outra execução",
            os.path.basename(dele))
    finally:
        outro.kill()
        outro.wait()
        shutil.rmtree(dele, ignore_errors=True)


def main():
    executar()
    neto_morre_junto()
    pasta_some()
    varredura()
    nao_encosta_no_alheio()
    ruins = [p for p in placar if not p[0]]
    print("\n%d de %d verificações" % (len(placar) - len(ruins), len(placar)))
    return 1 if ruins else 0


if __name__ == "__main__":
    sys.exit(main())
