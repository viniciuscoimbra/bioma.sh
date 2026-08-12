#!/usr/bin/env python3
"""Onde o comando externo roda, e o que ele não pode deixar para trás.

O `terraform validate` sobe o provider da AWS como processo à parte, neto de
quem chamou. Quem mata só o filho deixa o neto vivo: o provider herdou os canos
de saída, ignora SIGTERM de propósito e gira em CPU cheia até a máquina acabar.
Nesta máquina foram vinte processos esquecidos, com trinta e seis horas de CPU
cada, antes de o framework aprender a matar o grupo inteiro.

O diretório temporário tem o mesmo problema do outro lado: `mkdtemp` sem quem
apague deixou quatrocentos e setenta e nove pastas e nove gigas em disco.

São quatro coberturas, e cada uma pega o que a anterior não pega:

  o `finally` de quem chama cobre a saída normal e a exceção
  o `atexit` e o handler de sinal cobrem o Ctrl-C e o `kill`
  `mata_sob` cobre o provider que sobreviveu ao terraform que o abriu
  `varrer_resto` cobre o SIGKILL, onde nada deste processo chega a rodar

Uso:

    import oficina
    tmp = oficina.pasta("bioma-conferencia-")     # some quando o processo sai
    rc, saida = oficina.roda([tf, "validate"], 180, cwd=tmp)   # 124 se estourar
"""
import atexit
import os
import re
import shutil
import signal
import subprocess
import tempfile
import time

ESTOURO = 124     # o mesmo código que o `timeout(1)` usa
SEM_COMANDO = 127

_ABERTOS = set()      # os processos em curso agora
_PASTAS = set()       # os diretórios temporários desta execução
_ARMADO = [False]
_VARRIDO = [False]


# ── o que está rodando na máquina ──────────────────────────────────────────

def _processos():
    """(pid, ppid, comando) de tudo que roda, ou vazio se o ps não responder."""
    try:
        r = subprocess.run(["/bin/ps", "-axo", "pid=,ppid=,command="],
                           capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.SubprocessError):
        return []
    fora = []
    for linha in r.stdout.splitlines():
        campos = linha.split(None, 2)
        if len(campos) == 3 and campos[0].isdigit() and campos[1].isdigit():
            fora.append((int(campos[0]), int(campos[1]), campos[2]))
    return fora


def _cwd_de(pid):
    """O diretório de trabalho de um processo, ou None se não der para saber.

    É o que identifica o provider: o comando dele é um caminho relativo dentro
    de `.terraform`, igual em qualquer projeto. Só o diretório de trabalho diz
    se aquele processo é lixo desta ferramenta ou trabalho de outra pessoa.
    """
    if os.path.isdir("/proc"):
        try:
            return os.readlink("/proc/%d/cwd" % pid)
        except OSError:
            return None
    lsof = shutil.which("lsof") or "/usr/sbin/lsof"
    try:
        r = subprocess.run([lsof, "-a", "-p", str(pid), "-d", "cwd", "-Fn"],
                           capture_output=True, text=True, timeout=15)
    except (OSError, subprocess.SubprocessError):
        return None
    for linha in r.stdout.splitlines():
        if linha.startswith("n/"):
            return linha[1:]
    return None


# O dono vai no nome da pasta, e não num arquivo dentro dela: a pasta às vezes
# é a raiz de uma árvore que outro teste compara arquivo por arquivo, e marca
# solta ali dentro apareceria como diferença.
DONO = re.compile(r"-pid(\d+)-")


def _mata(pid):
    try:
        os.kill(pid, signal.SIGKILL)
        return True
    except OSError:
        return False


def _vivo(pid):
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False
    except OSError:
        return True    # existe e é de outro usuário


def _dono_vivo(caminho):
    """Se a pasta ainda tem dono de pé. Sem marca, ninguém responde por ela.

    É o que separa a pasta abandonada da pasta em uso: idade não serve, porque
    uma conferência longa passa de qualquer prazo, e duas execuções ao mesmo
    tempo são o caso normal quando os testes rodam área por área.
    """
    m = DONO.search(os.path.basename(caminho.rstrip(os.sep)))
    if not m:
        return False
    pid = int(m.group(1))
    return pid != os.getpid() and _vivo(pid)


def _mata_grupo(p):
    """Mata o processo e tudo que ele abriu, pelo grupo, e recolhe o corpo."""
    if p.poll() is None:
        try:
            os.killpg(os.getpgid(p.pid), signal.SIGKILL)
        except (OSError, AttributeError):
            p.kill()
    try:
        p.communicate(timeout=30)
    except (subprocess.SubprocessError, ValueError, OSError):
        pass


def mata_sob(raiz):
    """Mata todo terraform cujo diretório de trabalho está dentro de raiz.

    Cobre o provider que sobreviveu ao terraform que o abriu: o grupo daquele
    processo já não existe, mas o diretório de trabalho ainda o denuncia.
    """
    raiz = os.path.realpath(raiz)
    mortos = 0
    for pid, _ppid, comando in _processos():
        if pid == os.getpid() or "terraform" not in comando:
            continue
        cwd = _cwd_de(pid)
        if not cwd:
            continue
        cwd = os.path.realpath(cwd)
        if (cwd == raiz or cwd.startswith(raiz + os.sep)) and _mata(pid):
            mortos += 1
    return mortos


# ── a limpeza ──────────────────────────────────────────────────────────────

def limpar():
    """Mata o que está aberto e apaga as pastas desta execução.

    Matar primeiro, apagar depois: quem apaga a pasta debaixo de um provider
    vivo o deixa girando sobre um diretório que não existe mais, e aí nem o
    caminho serve para achá-lo.
    """
    for p in list(_ABERTOS):
        _mata_grupo(p)
        _ABERTOS.discard(p)
    for d in list(_PASTAS):
        mata_sob(d)
        shutil.rmtree(d, ignore_errors=True)
        _PASTAS.discard(d)


def _armar():
    """Liga a limpeza na saída e nos sinais que dá para interceptar."""
    if _ARMADO[0]:
        return
    _ARMADO[0] = True
    atexit.register(limpar)
    for s in (signal.SIGINT, signal.SIGTERM, signal.SIGHUP):
        anterior = signal.getsignal(s)

        def trata(numero, quadro, anterior=anterior):
            limpar()
            if callable(anterior):
                anterior(numero, quadro)
            else:
                signal.signal(numero, signal.SIG_DFL)
                os.kill(os.getpid(), numero)

        try:
            signal.signal(s, trata)
        except (ValueError, OSError):
            pass    # fora da thread principal não dá para instalar handler


def varrer_resto(horas=2, prefixo="bioma-"):
    """Mata provider órfão e apaga pasta que ficou de execução anterior.

    Quando o processo leva SIGKILL, nada dele executa: nem o `finally`, nem o
    `atexit`, nem o handler. O provider fica sem pai e gira sozinho, e a pasta
    fica no disco. A limpeza tem que vir de fora, e a execução seguinte é a
    única que passa por ali.

    Só entra no alvo o processo sem pai (adotado pelo init) cujo diretório de
    trabalho está numa pasta deste prefixo. Terraform que alguém está rodando
    tem pai vivo e não é tocado.
    """
    tmp = tempfile.gettempdir()
    tabela = _processos()
    filhos = {}
    for pid, ppid, _c in tabela:
        filhos.setdefault(ppid, []).append(pid)

    orfaos, abandonadas = 0, set()
    for pid, ppid, comando in tabela:
        if ppid != 1 or "terraform" not in comando:
            continue
        cwd = _cwd_de(pid) or ""
        partes = cwd.split(os.sep)
        if not any(p.startswith(prefixo) for p in partes):
            continue
        # o órfão e tudo que desceu dele: o provider às vezes fica pendurado
        # num shell intermediário, que sobreviveu junto. Descendente de órfão
        # do bioma é lixo do bioma, e execução viva tem pai vivo.
        fila, alvo = [pid], []
        while fila:
            atual = fila.pop()
            alvo.append(atual)
            fila.extend(filhos.get(atual, []))
        for a in reversed(alvo):
            if _mata(a):
                orfaos += 1
        # a pasta de um processo sem dono está abandonada, e não espera a idade:
        # é ela que guarda o provider de centenas de megabytes. Pasta com dono
        # de pé fica: o órfão morre, o trabalho de quem está vivo continua.
        for i, p in enumerate(partes):
            if p.startswith(prefixo):
                candidata = os.sep.join(partes[:i + 1])
                if not _dono_vivo(candidata):
                    abandonadas.add(candidata)
                break

    agora = time.time()
    velhas = 0
    try:
        nomes = os.listdir(tmp)
    except OSError:
        nomes = []
    for nome in nomes:
        if not nome.startswith(prefixo):
            continue
        caminho = os.path.join(tmp, nome)
        try:
            if not os.path.isdir(caminho) or _dono_vivo(caminho):
                continue
            idade = agora - os.path.getmtime(caminho)
            if idade > horas * 3600 or os.path.realpath(caminho) in {
                    os.path.realpath(a) for a in abandonadas}:
                mata_sob(caminho)
                shutil.rmtree(caminho, ignore_errors=True)
                velhas += 1
        except OSError:
            pass
    return orfaos, velhas


# ── o que se usa daqui ─────────────────────────────────────────────────────

def pasta(prefixo, varrer=True):
    """Um diretório temporário que some quando este processo sai.

    Na primeira chamada varre o resto de execuções anteriores, que é onde o
    acúmulo mora: nenhuma execução sozinha vaza muito, e foram centenas.
    """
    if varrer and not _VARRIDO[0]:
        _VARRIDO[0] = True
        orfaos, velhas = varrer_resto()
        if orfaos:
            print("varrido: %d terraform sem dono de execução anterior" % orfaos)
        if velhas:
            print("varrido: %d pasta(s) esquecida(s) em %s"
                  % (velhas, tempfile.gettempdir()))
    _armar()
    d = tempfile.mkdtemp(prefix="%spid%d-" % (prefixo, os.getpid()))
    _PASTAS.add(d)
    return d


def solta(caminho):
    """Apaga uma pasta antes da hora, com o que estiver rodando nela."""
    mata_sob(caminho)
    shutil.rmtree(caminho, ignore_errors=True)
    _PASTAS.discard(caminho)


def roda(cmd, segundos, cwd=None, env=None):
    """Executa e devolve (código, saída). Estouro de tempo devolve 124.

    O comando nasce em sessão própria para que o SIGKILL do estouro alcance
    junto o que ele abriu. Sem isso o `subprocess.run` mata só o filho, e a
    leitura da saída trava esperando canos que o neto órfão continua segurando.
    """
    _armar()
    try:
        p = subprocess.Popen(cmd, cwd=cwd, env=env, stdin=subprocess.DEVNULL,
                             stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                             text=True, start_new_session=True)
    except OSError as e:
        return SEM_COMANDO, str(e)
    _ABERTOS.add(p)
    try:
        saida, erro = p.communicate(timeout=segundos)
        return p.returncode, (saida or "") + (erro or "")
    except subprocess.TimeoutExpired as e:
        _mata_grupo(p)
        parcial = e.stdout or ""
        if isinstance(parcial, bytes):
            parcial = parcial.decode("utf-8", "replace")
        return ESTOURO, parcial + "\npassou do tempo limite de %ds" % segundos
    finally:
        _ABERTOS.discard(p)
