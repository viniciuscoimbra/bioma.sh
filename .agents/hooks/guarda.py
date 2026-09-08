#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Portão de comando: o que já custou caro neste repositório não passa de novo.

Roda como hook `PreToolUse` de Bash, Write e Edit. Lê o JSON do hook no stdin e
devolve a decisão no stdout.

Não substitui julgamento: substitui MEMÓRIA. O que este arquivo cobre é
exatamente o que se esquece quando o contexto está cheio. Cada regra tem a data
do erro que a criou, e sai daqui quando o erro deixar de ser possível.

**Isto NÃO é barreira de segurança.** Uma revisão independente de 2026-09-06
mostrou o contorno de toda regra daqui em uma linha: `git add --all` no lugar de
`-A`, `command git push` no lugar de `git push`, `printf > .env.local` no lugar
de editar o arquivo. Regra de shell casa grafia, e grafia se troca. Quem quiser
desviar, desvia. O que ela impede é a mão no automático, que é o defeito que de
fato aconteceu aqui três vezes. Tratá-la como barreira seria pior do que não
tê-la: daria sensação de proteção onde há lembrete.

As regras casam INVOCAÇÃO, e não menção. Um comando que só escreve o nome de um
script dentro de documentação não é o que faz o estrago, e recusá-lo ensina a
contornar o portão em vez de respeitá-lo. Isso não é hipótese: na instância, a
primeira versão da regra do `git add` recusou o commit que documentava a regra
do `git add`.

    guarda.py                # lê o hook no stdin, decide
    guarda.py --autoteste    # o caso recusado e o vizinho que passa

Saída: 0 segue · 2 recusa (com o motivo no stderr, que o agente lê)
"""
import io
import json
import os
import re
import sys

# `subprocess` fica de fora de propósito: ele custa 0,2s do meio segundo que o
# Python leva para subir, e este arquivo roda ANTES DE CADA COMANDO. Só a regra
# do push precisa dele, e ela o importa na hora. Medido nesta máquina em
# 2026-09-06: 0,48s sem ele, 0,68s com ele, contra 0,53s de `python3 -c pass`.

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def _so_comando(cmd):
    """O comando sem o que é DADO: corpo de heredoc e texto entre aspas.

    Sem isto a regra casa menção. Aconteceu em 2026-09-06, duas vezes no mesmo
    dia: um heredoc que ESCREVIA os casos de teste do portão foi recusado pelo
    portão, porque cada linha do corpo do heredoc parece uma linha de comando.
    A âncora de quebra de linha é necessária (script de várias linhas é comando
    de verdade), então o que sai é o dado, não a âncora.
    """
    fora = []
    resto = cmd or ""
    # corpo de heredoc: de <<MARCA até a linha que só tem MARCA
    while True:
        m = re.search(r"<<-?\s*[\"\']?([A-Za-z_][A-Za-z0-9_]*)[\"\']?", resto)
        if not m:
            fora.append(resto)
            break
        marca = m.group(1)
        fora.append(resto[:m.end()])
        depois = resto[m.end():]
        f = re.search(r"^\s*%s\s*$" % re.escape(marca), depois, re.M)
        resto = depois[f.end():] if f else ""
        if not f:
            break
    texto = "".join(fora)
    # Duas passadas, e a ordem importa.
    #
    # 1. Separador DENTRO de aspas não é separador: `'nota; git add -A'` é
    #    texto, e o `;` dele não abre comando nenhum.
    # 2. Só então as aspas somem, para `git add "."` virar `git add .`.
    #
    # A versão que fazia só o passo 2 recusava documentação válida (revisão de
    # 2026-09-06, quarta rodada), e a que apagava o conteúdo entre aspas deixava
    # `git add "."` passar (terceira rodada). As duas pontas precisam da ordem.
    texto = re.sub(r"'[^']*'|\"[^\"]*\"",
                   lambda m: re.sub(r"[;&|\n]", "_", m.group(0)), texto)
    return texto.replace('"', "").replace("'", "")


# `cmd` abre o comando, ou vem depois de `;`, `&&`, `||`, `|` ou quebra de
# linha. Sem esta âncora, `echo git add -A` é lido como `git add -A`.
def invoca(cmd, padrao):
    return re.search(r"(?:^|[;&|]\s*|\n\s*)%s" % padrao, _so_comando(cmd)) is not None


def motivo_da_recusa(evento):
    nome = str(evento.get("tool_name") or "")
    entrada = evento.get("tool_input") or {}
    arquivo = str(entrada.get("file_path") or entrada.get("path") or "")
    cmd = str(entrada.get("command") or "")
    base = os.path.basename(arquivo)

    # 1. `git add -A` e `git add .` engolem trabalho de outra sessão.
    #    2026-08-27 no framework: uma remoção de 2594 arquivos se perdeu porque
    #    um `git stash` no meio desfez o índice e o commit passou sem ela.
    if nome == "Bash" and invoca(cmd, r"(?:command\s+)?git\s+add\s+(-A\b|--all\b|-u\b|--update\b|\.(?:\s|$))"):
        return ("git add por varredura engole o que outra sessão está escrevendo. "
                "Use caminhos explícitos: `git add ferramentas/x.py tela/y.jsx`.")

    # 2. `git clean -fd` apaga untracked sem olhar de quem é. Quem apaga é o
    #    `-f`: `-n` é ensaio e `-d` só diz que entra em diretório. A primeira
    #    versão desta regra casava `-[a-z]*[fd]` e recusava `git clean -nd`, que
    #    é justamente o comando que se manda antes de apagar. O autoteste pegou.
    if nome == "Bash" and invoca(cmd, r"(?:command\s+)?git\s+clean\s+(?:[^;&|\n]*\s)?(?:-[a-eg-mo-z]*f|--force)"):
        return ("git clean apaga untracked sem olhar de quem é. "
                "Liste com `git clean -nd` e apague por caminho.")

    # 3. Reescrever histórico e forçar push são as duas ações desta lista que
    #    o dono do repositório pediu para exigirem decisão humana (AGENTS.md,
    #    "O que exige decisão humana").
    if nome == "Bash" and invoca(cmd, r"(?:command\s+)?git\s+push\s+[^;&|\n]*(--force\b|--force-with-lease\b|-f\b|\s\+[\w./-]+:)"):
        return "push forçado reescreve o que já está publicado: peça ao humano."
    if nome == "Bash" and invoca(cmd, r"(?:command\s+)?git\s+rebase\s+(-i\b|--interactive\b)|(?:command\s+)?git\s+(reset\s+--hard|filter-branch|filter-repo)\b"):
        return "reescrever histórico é decisão humana (AGENTS.md)."

    # 4. `push` sem o que reprova em segundos. NÃO é o `testes/portoes.sh`
    #    inteiro: ele constrói o app e sobe o Playwright, leva minutos e um hook
    #    que leva minutos vira hook que alguém desliga. Aqui rodam só os portões
    #    baratos, que são os que pegam o erro bobo antes de ele virar CI
    #    vermelho; o portão completo continua no CI e no fecho da sessão
    #    (skill `ciclo-de-sessao`).
    if nome == "Bash" and invoca(cmd, r"(?:command\s+)?git\s+push\b") and not os.environ.get("BIOMA_PORTOES_OK"):
        falha = portoes_rapidos()
        if falha:
            return ("os portões rápidos reprovam, e o CI vai reprovar igual:\n%s\n"
                    "Corrija, ou exporte BIOMA_PORTOES_OK=1 se a falha for de ambiente." % falha)

    # 0. A NUVEM ESTÁ FORA DO ALCANCE. Nem escrita, nem leitura.
    #
    #    Decisão do dono do repositório em 2026-09-07, e ela não é preferência:
    #    a credencial é de um cliente, e usar a conta dele fora do combinado
    #    expõe uma pessoa a responder por isso. Ler parece inofensivo e não é:
    #    `sts assume-role` entra numa conta e deixa registro no CloudTrail
    #    dela, e listar objeto de balde é acesso a dado de terceiro.
    #
    #    O trabalho é o CÓDIGO: o do framework e o da instância.
    #    O que a nuvem tem se aprende do código que já foi gerado, e não
    #    perguntando à nuvem.
    #
    #    Passam: `terraform fmt` e `terraform validate`, que leem arquivo e
    #    não falam com a AWS, e qualquer comando que só MENCIONE a nuvem.
    if nome == "Bash":
        if invoca(cmd, r"(?:command\s+)?aws\s"):
            return ("a nuvem está fora do alcance: a credencial é de um cliente, "
                    "e nem leitura foi combinada. O trabalho é o código.")
        if invoca(cmd, r"(?:command\s+)?terragrunt\s") and not re.search(
                r"\bterragrunt\s+(hcl\s+)?(format|fmt|validate|hclvalidate)\b", cmd):
            return ("terragrunt fala com a AWS. `hcl format` e `validate` passam; "
                    "o resto é a nuvem, e ela está fora do alcance.")
        if invoca(cmd, r"(?:command\s+)?terraform\s") and not re.search(
                r"\bterraform\s+(fmt|validate|version|providers\s+schema)\b", cmd):
            return ("terraform fala com a AWS. `fmt`, `validate`, `version` e "
                    "`providers schema` passam; o resto está fora do alcance.")
        if invoca(cmd, r"(?:\./)?bioma\.sh\b"):
            return ("`bioma.sh` planeja e aplica na nuvem. Fora do alcance: quem "
                    "roda é quem opera, com a própria credencial.")
        # As ferramentas da instância que falam com a AWS, por nome. A lista é
        # medida (`grep '"aws"' ferramentas/*.py`), e não escrita de memória.
        if invoca(cmd, r"(?:python3?\s+\S*)?(?:%s)" % "|".join([
                r"estado\.py", r"contas_da_organizacao\.py", r"contas_do_live\.py",
                r"etiquetas_na_nuvem\.py", r"cobertura_de_etiquetas\.py",
                r"etiquetar_contas\.py", r"categorias_de_custo\.py",
                r"relatorio_finops\.py", r"painel_finops\.py", r"medir_finops\.py",
                r"verificar_zonas\.py", r"verificar_aplicado\.py",
                r"publicar_[a-z_]*\.py", r"aplicar_segredo[a-z_]*\.py",
                r"vpc_default\.py", r"guia\.py", r"instalar\.py"])):
            return ("essa ferramenta lê a nuvem, e a nuvem está fora do alcance. "
                    "O que ela responderia se aprende do código.")

    # 5. Segredo não entra em arquivo rastreado. O `.env.example` é o modelo, e
    #    ele passa: recusar o modelo é recusar quem documenta o formato.
    if nome in ("Write", "Edit", "MultiEdit") and re.match(r"^\.env($|\.)", base) and base != ".env.example":
        return "edição direta de %s: segredo não é versionado." % base
    # o mesmo arquivo pelo shell: `printf x > .env.local` faz o que o Write faz
    if nome == "Bash" and re.search(r">>?\s*[^\s;&|]*\.env(?:\.[a-z]+)?(?:\s|$)", _so_comando(cmd)) \
            and ".env.example" not in cmd:
        return "escrever num .env pelo shell é a mesma coisa: segredo não é versionado."

    return ""


# O que roda antes do push: segundos, sem rede, sem navegador, sem build.
# O que roda antes do push: segundos, sem rede, sem navegador, sem build.
#
# `evals_do_harness.py` NÃO entra aqui, e a razão é recursão: ele roda o
# autoteste deste arquivo, que exercita a regra do push pela entrada pública,
# que rodaria os evals outra vez. Medido em 2026-09-06, com o comando travando
# em dois minutos. Os evals são portão de CI, e é lá que eles bastam.
RAPIDOS = [
    ([sys.executable, "-m", "compileall", "-q"], "o Python não compila"),
    ([sys.executable, ".agents/scripts/evals_do_harness.py"], "os casos do harness reprovam"),
]

# Os evals rodam o autoteste DESTE arquivo, que exercita a regra do push, que
# rodaria os evals de novo. A sentinela corta a reentrância sem tirar o portão:
# a primeira correção tinha removido os evals do pré-push, e isso reduziu a
# proteção em vez de consertá-la (revisão de 2026-09-06, terceira rodada).
REENTRANCIA = "BIOMA_GUARDA_EM_AUTOTESTE"


def portoes_rapidos(raiz=None):
    """A saída do primeiro portão rápido que reprova, e "" quando todos passam.

    Ausência de insumo não reprova: comando que não existe nesta árvore devolve
    "", porque árvore incompleta não é árvore errada, e portão que recusa por
    ausência ensina a desligar o portão.
    """
    import subprocess  # só aqui: ver o comentário dos imports

    raiz = raiz or RAIZ
    for comando, rotulo in RAPIDOS:
        if os.environ.get(REENTRANCIA) and "evals_do_harness" in comando[-1]:
            continue
        if comando[1] == "-m" and comando[2] == "compileall":
            # compila o que existir NESTA raiz, e não uma lista fixa: o caso de
            # teste usa uma árvore de mentira, e ela não tem `ferramentas/`
            alvos = sorted(d for d in os.listdir(raiz)
                           if d.endswith(".py") or os.path.isdir(os.path.join(raiz, d)))
            alvos = [a for a in alvos if not a.startswith(".")]
            if not alvos:
                continue
            comando = comando + alvos
        elif not os.path.exists(os.path.join(raiz, comando[-1])):
            # Árvore sem harness nenhum é incompleta, e incompleta não é
            # errada. Mas árvore COM harness e sem este script é harness
            # mutilado, e aprovar por ausência é como o portão some.
            if os.path.isdir(os.path.join(raiz, ".agents", "scripts")):
                return "%s: %s não existe, e o harness está aqui" % (rotulo, comando[-1])
            continue
        try:
            p = subprocess.run(comando, cwd=raiz, capture_output=True, text=True,
                               timeout=int(os.environ.get("BIOMA_PORTAO_SEGUNDOS", "60")))
        except subprocess.TimeoutExpired:  # falha FECHADA
            # antes isto era `continue`, e o portão APROVAVA por não ter medido.
            # Revisão de 2026-09-06: portão que aprova quando não conseguiu
            # rodar é portão que some no dia em que a máquina está lenta.
            return "%s: o portão não terminou a tempo, e não dá para aprovar sem medir" % rotulo
        except OSError as e:
            return "%s: não consegui rodar o portão (%s)" % (rotulo, e)
        if p.returncode != 0:
            return "%s:\n%s" % (rotulo, (p.stdout + p.stderr)[-500:])
    return ""


def decide(evento):
    return 2 if motivo_da_recusa(evento) else 0


def _caso_da_composicao():
    """O pré-push continua rodando os portões que ele promete rodar.

    A primeira correção da recursão tirou `evals_do_harness.py` de `RAPIDOS` e
    ninguém viu: o autoteste passava com o pré-push reduzido a `compileall`
    (revisão de 2026-09-06, quarta rodada). Composição de portão também é
    comportamento, e comportamento sem caso é o que apodrece calado.
    """
    alvos = " ".join(" ".join(c) for c, _ in RAPIDOS)
    faltam = [n for n in ("compileall", "evals_do_harness") if n not in alvos]
    return ["  o pré-push deixou de rodar: %s" % ", ".join(faltam)] if faltam else []


def _caso_do_push():
    """A regra 4 exercitada de verdade, nas duas pontas.

    Ela não cabe em `casos.json` porque precisa de uma árvore no disco: uma que
    compila e uma que não. Sem este caso, a regra passaria no autoteste com a
    variável de ambiente ligada, que é o carimbo que este harness proíbe.
    """
    import shutil
    import tempfile
    erros = []

    # ponta 0: pela entrada pública, sem atalho, nesta árvore que compila.
    # `decide()` é o que o hook chama, e é o que precisa devolver 0.
    antes = os.environ.pop("BIOMA_PORTOES_OK", None)
    try:
        for grafia in ("git push origin master", "command git push origin master"):
            if decide({"tool_name": "Bash", "tool_input": {"command": grafia}}) != 0:
                erros.append("  push por decide() numa árvore sadia devia seguir: %s" % grafia)
    finally:
        if antes is not None:
            os.environ["BIOMA_PORTOES_OK"] = antes

    base = tempfile.mkdtemp(prefix="guarda-caso-")
    global RAIZ
    raiz_real = RAIZ
    try:
        # As três pontas passam por `decide()`, que é o caminho que o hook usa.
        # A versão anterior chamava `portoes_rapidos()` direto em duas delas, e
        # uma mutação que fizesse `decide()` ignorar a falha ficava fora do
        # teste (revisão de 2026-09-06, terceira rodada).
        empurra = {"tool_name": "Bash", "tool_input": {"command": "git push origin master"}}
        os.makedirs(os.path.join(base, "ferramentas"))
        io.open(os.path.join(base, "ferramentas", "ok.py"), "w", encoding="utf-8").write("x = 1\n")
        RAIZ = base
        # ponta A: árvore que compila, o push segue
        if decide(empurra) != 0:
            erros.append("  push numa árvore que compila devia seguir, e foi recusado")
        # ponta B: árvore que não compila, o push para
        io.open(os.path.join(base, "ferramentas", "quebrado.py"), "w", encoding="utf-8").write("def (\n")
        if decide(empurra) == 0:
            erros.append("  push numa árvore que não compila devia parar, e passou")
        # ponta C: portão que não termina NÃO aprova. Antes isto era `continue`,
        # e o portão sumia no dia em que a máquina estivesse lenta.
        os.environ["BIOMA_PORTAO_SEGUNDOS"] = "2"
        io.open(os.path.join(base, "trava.py"), "w", encoding="utf-8").write(
            "import time\ntime.sleep(90)\n")
        salvo = list(RAPIDOS)
        try:
            # ponta C: portão que não termina PARA o push, em vez de aprovar
            RAPIDOS[:] = [([sys.executable, "trava.py"], "portão travado")]
            io.open(os.path.join(base, "ferramentas", "quebrado.py"), "w",
                    encoding="utf-8").write("x = 1\n")
            if decide(empurra) == 0:
                erros.append("  portão que estoura o tempo devia parar o push, e aprovou")
            # ponta D: script do harness sumido, com o harness presente, PARA
            RAPIDOS[:] = [([sys.executable, ".agents/scripts/sumiu.py"], "portão sumido")]
            os.makedirs(os.path.join(base, ".agents", "scripts"), exist_ok=True)
            if decide(empurra) == 0:
                erros.append("  portão que sumiu do harness devia parar o push, e aprovou")
        finally:
            RAPIDOS[:] = salvo
            os.environ.pop("BIOMA_PORTAO_SEGUNDOS", None)
    finally:
        RAIZ = raiz_real
        shutil.rmtree(base, ignore_errors=True)
    return erros


def autoteste():
    """Cada regra com o caso que ela recusa E o vizinho que ela deixa passar."""
    casos = json.load(io.open(os.path.join(RAIZ, ".agents", "fixtures", "casos.json"),
                              encoding="utf-8"))
    # A regra 4 tem caso próprio logo abaixo, e ele passa pela ENTRADA PÚBLICA
    # (decide), sem a variável de atalho. A revisão de 2026-09-06 mostrou que a
    # versão anterior ligava BIOMA_PORTOES_OK antes de tudo e chamava
    # portoes_rapidos() direto: a regra 4 nunca era exercitada pelo caminho que
    # o hook usa de verdade.
    erros = _caso_da_composicao()
    os.environ[REENTRANCIA] = "1"
    try:
        erros += _caso_do_push()
    finally:
        os.environ.pop(REENTRANCIA, None)
    os.environ["BIOMA_PORTOES_OK"] = "1"
    for c in casos:
        if c.get("tipo") != "acao-sensivel":
            continue
        obtido = decide(c["evento"])
        if obtido != c["esperado"]:
            erros.append("  %s: esperava saída %s e veio %s" % (c["nome"], c["esperado"], obtido))
    if erros:
        print("guarda: autoteste REPROVOU\n" + "\n".join(erros), file=sys.stderr)
        return 1
    recusados = sum(1 for c in casos if c.get("tipo") == "acao-sensivel" and c["esperado"] == 2)
    passam = sum(1 for c in casos if c.get("tipo") == "acao-sensivel" and c["esperado"] == 0)
    print("guarda: autoteste passou · %d recusas e %d vizinhos que passam "
          "(+ a regra do push, nas quatro pontas)" % (recusados, passam))
    return 0


def main():
    if "--autoteste" in sys.argv:
        return autoteste()
    try:
        bruto = sys.stdin.read().strip()
        evento = json.loads(bruto) if bruto else {}
    except ValueError:
        return 0
    motivo = motivo_da_recusa(evento)
    if not motivo:
        return 0
    print(motivo, file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main())
