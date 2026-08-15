#!/usr/bin/env python3
"""As ferramentas que conferem a árvore também são conferidas.

Os nove portões olham o live: célula, receita, contrato, valor. Nenhum olhava o
`bioma.sh` nem os scripts em `ferramentas/`, e foi por aí que passaram os quatro
defeitos mais caros desta árvore — todos da mesma família, todos sem sintoma:

  1. `infra/root.hcl` referenciava `local.papel_esteira` e a definição tinha sido
     comida por uma edição mecânica. Toda célula fora da fundação morria no
     render, e nenhum portão lê HCL como HCL.
  2. `areas_da_fase()` era chamada 245 linhas antes de ser definida. Em Bash isso
     é `command not found`, e sob `set +e` o escopo saía vazio em silêncio.
  3. `confere()` chamava o verificador sem repassar o caminho da árvore.
  4. `verificar_preenchimento.py` caía no default `live/`, que não existe, e
     anunciava "tudo respondido" tendo lido zero células. Verde sobre nada.

Houve uma quinta pergunta aqui, por texto: "o verificador que exige o caminho da
árvore está sendo chamado com ele?". Ela saiu. Regex não segue continuação de
linha nem variável intermediária, e acusava `bioma.sh` e `configurar.py`, que
passam o caminho — os dois na linha seguinte. O teste de vácuo pega a mesma
classe de defeito por execução, e não por adivinhação sobre a forma da chamada.

O denominador é sempre o mesmo: quem confere não era conferido. Este portão faz
cinco perguntas.

  ordem       função de Bash usada antes da linha que a define
  sintaxe     todo .sh passa em `bash -n`, todo .py compila
  nomes       nome lido e nunca definido, em Python
  vácuo       verificador apontado para árvore vazia diz "sem insumo", não "passou"
  origem      arquivo copiado do framework não foi editado na cópia

A quarta é a que não envelhece. Um portão que devolve 0 sobre uma árvore vazia
está sempre errado: ou ele leu e não achou nada onde não há nada — o que é
"sem insumo para decidir", código 2 — ou ele não leu.

Uso: verificar_ferramentas.py [raiz do repositório]
Saída: 0 limpo · 1 reprovado
"""
import ast
import io
import os
import re
import subprocess
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Verificadores que recebem o caminho da árvore como primeiro argumento. O
# `perfil` de `ilustrativo` vem antes dele, e por isso ele entra com índice 2.
POSICAO_DA_ARVORE = {
    "verificar_preenchimento.py": 1,
    "verificar_ilustrativo.py": 2,
    "verificar_parametrizacao.py": 1,
}


def scripts_bash(raiz):
    fora = [os.path.join(raiz, "bioma.sh")]
    for base in ("ferramentas", "politicas", "testes"):
        d = os.path.join(raiz, base)
        if not os.path.isdir(d):
            continue
        for a in sorted(os.listdir(d)):
            if a.endswith(".sh"):
                fora.append(os.path.join(d, a))
    return [p for p in fora if os.path.isfile(p)]


def scripts_python(raiz):
    fora = []
    for base in ("ferramentas", os.path.join("docs", "fase1")):
        d = os.path.join(raiz, base)
        if not os.path.isdir(d):
            continue
        for a in sorted(os.listdir(d)):
            if a.endswith(".py"):
                fora.append(os.path.join(d, a))
    return fora


def ordem_das_funcoes(caminho):
    """Função usada numa linha anterior à que a define.

    Em Bash a função só existe depois que a execução passa pela definição. Usada
    antes, vira `command not found` — e dentro de um bloco com `set +e` isso não
    aborta nada: o valor sai vazio e o comando segue.
    """
    linhas = io.open(caminho, encoding="utf-8").read().splitlines()
    define = {}
    for n, l in enumerate(linhas, 1):
        m = re.match(r"^([a-z_][a-z0-9_]*)\(\)\s*\{", l)
        if m:
            define.setdefault(m.group(1), n)

    achados = []
    for n, l in enumerate(linhas, 1):
        codigo = l.split("#")[0]
        for nome, onde in define.items():
            if n >= onde:
                continue
            if re.match(r"^\s*" + re.escape(nome) + r"\(\)", l):
                continue
            # seguido de /, . ou - é caminho (`tela/servidor.py`), não chamada:
            # foi o falso positivo que este portão deu no próprio portoes.sh
            if re.search(r"(?<![a-z0-9_])" + re.escape(nome) + r"(?![a-z0-9_(/.\-])", codigo):
                achados.append((n, nome, onde))
    return achados


def nomes_indefinidos(caminho):
    """Nome global lido e nunca definido no módulo, nem importado, nem builtin."""
    try:
        arvore = ast.parse(io.open(caminho, encoding="utf-8").read(), caminho)
    except SyntaxError as e:
        return [("sintaxe", e.lineno or 0, str(e))]

    import builtins
    definidos = set(dir(builtins)) | {"__name__", "__file__", "__doc__", "__builtins__"}
    for no in ast.walk(arvore):
        if isinstance(no, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            definidos.add(no.name)
        elif isinstance(no, ast.Name) and isinstance(no.ctx, (ast.Store, ast.Del)):
            definidos.add(no.id)
        elif isinstance(no, ast.arg):
            definidos.add(no.arg)
        elif isinstance(no, (ast.Import, ast.ImportFrom)):
            for a in no.names:
                definidos.add((a.asname or a.name).split(".")[0])
        elif isinstance(no, ast.ExceptHandler) and no.name:
            definidos.add(no.name)
        elif isinstance(no, (ast.comprehension,)):
            for alvo in ast.walk(no.target):
                if isinstance(alvo, ast.Name):
                    definidos.add(alvo.id)

    achados = []
    for no in ast.walk(arvore):
        if isinstance(no, ast.Name) and isinstance(no.ctx, ast.Load):
            if no.id not in definidos:
                achados.append(("nome", no.lineno, no.id))
    return achados


def vacuo(raiz):
    """Portão apontado para árvore vazia: tem que dizer 'sem insumo', não 'passou'.

    Zero achados sobre zero células conferidas é a única resposta que um portão
    nunca pode dar como sucesso, e é o formato exato do defeito que ficou dois
    dias no repositório.
    """
    achados = []
    with tempfile.TemporaryDirectory() as vazio:
        for script, indice in sorted(POSICAO_DA_ARVORE.items()):
            p = os.path.join(raiz, "ferramentas", script)
            if not os.path.isfile(p):
                continue
            argv = [sys.executable, p]
            if indice == 2:
                argv.append("producao")
            argv.append(vazio)
            r = subprocess.run(argv, capture_output=True, text=True, cwd=raiz)
            if r.returncode == 0:
                achados.append((script, (r.stdout or r.stderr).strip().splitlines()[-1:] or [""]))
    return achados


def origem(raiz):
    """Arquivo que veio do framework foi editado na cópia?

    `ferramentas/origem.json` declara, para cada arquivo copiado do framework, o
    sha256 e o commit de onde ele veio. Cópia com hash diferente é edição feita
    no lugar errado: ela funciona hoje e evapora na próxima sincronização, e o
    framework nunca fica sabendo. Foi assim que as duas árvores andaram uma
    semana em linhas separadas. A edição certa acontece no framework, e desce
    por `ferramentas/sincronizar_framework.py`.

    Sem o manifesto não há o que conferir: repositório do próprio framework não
    tem origem, e a pergunta não se aplica.
    """
    import hashlib, json
    manifesto = os.path.join(raiz, "ferramentas", "origem.json")
    if not os.path.isfile(manifesto):
        return []
    dados = json.load(io.open(manifesto, encoding="utf-8"))
    achados = []
    for rel, esperado in sorted(dados.get("arquivos", {}).items()):
        # o mesmo mapa do sincronizador, e não um paralelo: a cópia do catálogo
        # mora sob `infra/`. Ler o manifesto sem o mapa acusava as receitas de
        # ausentes no primeiro apply depois de o catálogo entrar no manifesto.
        p = os.path.join(raiz, "infra", rel) if rel.startswith("catalogo/")             else os.path.join(raiz, rel)
        if not os.path.isfile(p):
            achados.append((rel, "declarado no manifesto e ausente"))
            continue
        bruto = open(p, "rb").read()
        if hashlib.sha256(bruto).hexdigest() == esperado:
            continue
        # O checkout do Windows converte LF em CRLF, e o hash do manifesto é do
        # arquivo como o framework o entregou. Sem dizer isso, a cópia intacta é
        # acusada de editada, e o conserto (o `.gitattributes` na raiz) não tem
        # relação visível com a mensagem.
        if hashlib.sha256(bruto.replace(b"\r\n", b"\n")).hexdigest() == esperado:
            achados.append((rel, "igual ao do framework, com CRLF no lugar de LF: quem "
                                 "converteu foi o checkout. A raiz tem `.gitattributes` "
                                 "com `eol=lf`; refaça o clone ou rode "
                                 "`git add --renormalize .`"))
        else:
            achados.append((rel, "difere do que o framework entregou"))
    return achados


def main():
    raiz = sys.argv[1] if len(sys.argv) > 1 else RAIZ
    problemas = []

    for p in scripts_bash(raiz):
        rel = os.path.relpath(p, raiz)
        r = subprocess.run(["bash", "-n", p], capture_output=True, text=True)
        if r.returncode != 0:
            problemas.append("%s · não passa em `bash -n`\n    %s"
                             % (rel, (r.stderr or "").strip().splitlines()[:1]))
        for n, nome, onde in ordem_das_funcoes(p):
            problemas.append("%s:%d · `%s` usada aqui e definida na linha %d\n"
                             "    em Bash a função só existe depois da definição"
                             % (rel, n, nome, onde))

    for p in scripts_python(raiz):
        rel = os.path.relpath(p, raiz)
        for tipo, n, o in nomes_indefinidos(p):
            if tipo == "sintaxe":
                problemas.append("%s:%d · não compila\n    %s" % (rel, n, o))
            else:
                problemas.append("%s:%d · nome `%s` lido e nunca definido" % (rel, n, o))

    for rel, motivo in origem(raiz):
        problemas.append("%s · %s\n"
                         "    edite no framework (bioma.sh) e traga por"
                         " ferramentas/sincronizar_framework.py" % (rel, motivo))

    for script, saida in vacuo(raiz):
        problemas.append("%s · apontado para árvore VAZIA, devolveu 0 (passou)\n"
                         "    a resposta certa é 2, sem insumo para decidir: %s"
                         % (script, saida[0][:70] if saida else ""))

    if not problemas:
        print("ferramentas · %d scripts de shell e %d de Python conferidos"
              % (len(scripts_bash(raiz)), len(scripts_python(raiz))))
        print("ordem, sintaxe, nomes, resposta a árvore vazia e fidelidade à origem")
        return 0

    print("ferramentas reprovou: %d problema(s)\n" % len(problemas))
    for x in problemas:
        print("  " + x + "\n")
    return 1


if __name__ == "__main__":
    sys.exit(main())
