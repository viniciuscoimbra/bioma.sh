#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""A ordem de execução, lida do dado em vez de escrita em código de controle.

    python3 ferramentas/fila.py passos                  # os passos, numerados
    python3 ferramentas/fila.py acoes 4 --ate prd       # as ações do passo 4
    python3 ferramentas/fila.py papel 5                 # o papel do passo 5

A sequência mora em `contrato/fila.json`. Cada passo tem número estável,
título, o papel com que executa e as ações em ordem. Ação é uma área para
aplicar, um portão para conferir ou uma nota.

Escrita em blocos `if` de shell, a sequência funcionava e não se lia: não dava
para listar sem executar, nem conferir se o que rodou foi o que estava
declarado. Um nome de domínio errado dentro de um `for` pulava a área inteira
em silêncio, e o comando terminava dizendo que deu certo.

O que varia por instalação (quais domínios existem, quais ambientes cada um
tem) continua vindo de `convencoes.json`: a fila declara o formato do caminho,
e não o nome do cliente.

Saída em TSV, uma ação por linha, para o shell consumir sem parser:

    area<TAB>plataforma/rede/org<TAB>
    area<TAB>plataforma/dados<TAB>plataforma/dados/prd/vpc
    gate<TAB>durabilidade<TAB>plataforma/dados
    nota<TAB>aplicacao<TAB>fora do orquestrador: ...
"""
import io
import json
import os
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILA = os.path.join(AQUI, "contrato", "fila.json")

sys.path.insert(0, os.path.join(AQUI, "ferramentas"))


def convencao(chave):
    """O mesmo leitor que o resto do comando usa, para não haver duas leituras."""
    import subprocess
    r = subprocess.run([sys.executable, os.path.join(AQUI, "ferramentas", "convencoes.py"),
                        chave], capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit("convencoes.json: %s" % (r.stderr or "").strip())
    return [x for x in (r.stdout or "").splitlines() if x.strip()]


def ambientes_do_ate(ate):
    """Os ambientes de workload que esta corrida cobre.

    A lista vem de `convencoes.json` em ordem de criticidade, e o último é o de
    produção. Mesma regra do comando: `dev` roda só o primeiro, `prd` só o
    último, `hml` tudo menos produção.
    """
    todos = convencao("ambientes_por_natureza.workload")
    if not todos:
        return []
    return {"dev": todos[:1], "hml": todos[:-1], "prd": todos[-1:]}.get(ate, [])


def carrega():
    if not os.path.exists(FILA):
        raise SystemExit("sem %s: a ordem de execução é dado, e ele não está aqui" % FILA)
    d = json.load(io.open(FILA, encoding="utf-8"))
    passos = d.get("passos") or []
    if not passos:
        raise SystemExit("%s não declara passo nenhum" % FILA)
    return d


def expande(acoes, contexto):
    """Resolve `para_cada` e os campos entre chaves, na ordem declarada."""
    fora = []
    for acao in acoes:
        laco = acao.get("para_cada")
        if not laco:
            fora.append({k: (preenche(v, contexto) if isinstance(v, str)
                             else [preenche(x, contexto) for x in v] if k == "pular"
                             else v)
                         for k, v in acao.items()})
            continue
        for ctx in itens_do_laco(laco, acao, contexto):
            fora.extend(expande(acao["faz"], ctx))
    return fora


def preenche(texto, contexto):
    # `_ambientes` é a lista que o laço percorre, e não um campo do caminho: as
    # chaves que começam com `_` são estado do percurso e não entram na
    # substituição.
    for k, v in contexto.items():
        if not k.startswith("_"):
            texto = texto.replace("{%s}" % k, v)
    return texto


def itens_do_laco(laco, acao, contexto):
    if laco == "lista":
        for item in acao["lista"]:
            novo = dict(contexto)
            novo["item"] = item
            yield novo
        return
    if laco == "dominio_ambiente":
        for dom in convencao("dominios"):
            for amb in contexto["_ambientes"]:
                novo = dict(contexto)
                novo["dominio"], novo["ambiente"] = dom, amb
                yield novo
        return
    raise SystemExit("para_cada desconhecido em contrato/fila.json: %s" % laco)


def contexto_de(ate):
    plano = "prd" if ate == "prd" else "nprd"
    ambientes = ambientes_do_ate(ate)
    if not ambientes:
        raise SystemExit("convencoes.json: sem ambientes_por_natureza.workload a fila "
                         "não sabe o que rodar")
    return {"plano": plano, "_ambientes": ambientes}


def areas_do_recorte(d, ate):
    """As áreas que a fila aplica num `--ate`, e o que ela declara fora."""
    declaradas, fora = set(), set()
    ctx = contexto_de(ate)
    for p in d["passos"]:
        for a in expande(p.get("acoes", []), ctx):
            if "area" in a and "gate" not in a:
                declaradas.add(a["area"])
            elif "nota" in a and a.get("sobre"):
                fora.add(a["sobre"])
    return declaradas, fora


def confere(d, ate):
    """Toda área do recorte existe, e toda célula da árvore cai em algum passo.

    O segundo é o que importa: célula que nenhum passo alcança nunca é aplicada,
    e o comando termina dizendo que deu certo.

    Os dois olham recortes diferentes de propósito. A existência da área é
    conferida no `--ate` desta corrida, porque a árvore de uma instalação que
    ainda só subiu produção não tem os diretórios de dev. A cobertura é
    conferida contra a união dos três, porque célula de dev existente e fora de
    toda fila é o defeito que este portão procura.
    """
    infra = os.path.join(AQUI, "infra")
    declaradas, fora_por_construcao = areas_do_recorte(d, ate)
    uniao = set(declaradas)
    for outro in ("dev", "hml", "prd"):
        if outro == ate:
            continue
        try:
            mais, _ = areas_do_recorte(d, outro)
        except SystemExit:
            continue
        uniao |= mais

    problemas = []
    for area in sorted(declaradas):
        if not os.path.isdir(os.path.join(infra, area)):
            problemas.append("AREA-AUSENTE %s (declarada na fila para --ate %s, "
                             "não existe na árvore)" % (area, ate))
    declaradas = uniao

    orfas = []
    for base, dirs, arqs in os.walk(infra):
        dirs[:] = [x for x in dirs if x not in (".terragrunt-cache", "catalogo")]
        if "terragrunt.hcl" not in arqs:
            continue
        rel = os.path.relpath(base, infra)
        if rel == ".":
            continue
        if any(rel == a or rel.startswith(a + "/") for a in declaradas):
            continue
        if any(("/%s/" % f) in ("/%s/" % rel) for f in fora_por_construcao):
            continue
        orfas.append(rel)

    for rel in sorted(orfas):
        problemas.append("CELULA-ORFA %s (nenhum passo da fila a alcança)" % rel)

    print("fila · %d áreas declaradas (--ate %s) · %d células na árvore · %d problema(s)"
          % (len(declaradas), ate, sum(1 for _ in celulas_da_arvore(infra)), len(problemas)))
    for p in problemas:
        print("  " + p)
    return 1 if problemas else 0


def celulas_da_arvore(infra):
    for base, dirs, arqs in os.walk(infra):
        dirs[:] = [x for x in dirs if x not in (".terragrunt-cache", "catalogo")]
        if "terragrunt.hcl" in arqs and os.path.relpath(base, infra) != ".":
            yield os.path.relpath(base, infra)


def main(argv):
    if len(argv) < 2:
        print(__doc__, file=sys.stderr)
        return 2
    comando = argv[1]
    ate = argv[argv.index("--ate") + 1] if "--ate" in argv else "prd"
    d = carrega()

    if comando == "passos":
        for p in d["passos"]:
            print("%d\t%s" % (p["numero"], p["titulo"]))
        return 0

    if comando == "papel":
        alvo = int(argv[2])
        for p in d["passos"]:
            if p["numero"] == alvo:
                print(p.get("papel", ""))
                return 0
        print("passo %d não existe na fila" % alvo, file=sys.stderr)
        return 2

    if comando == "passo-da-area":
        # Aplicar uma área solta continua sendo aplicar um pedaço da fila, e o
        # papel de execução dela é o do passo que a contém. Sem esta resposta,
        # `--area` era o único caminho sem posição declarada.
        alvo = argv[2].strip("/")
        achado = None
        for ate_tentado in (ate,) + ("dev", "hml", "prd"):
            try:
                ctx = contexto_de(ate_tentado)
            except SystemExit:
                continue
            for p in d["passos"]:
                for a in expande(p.get("acoes", []), ctx):
                    area = a.get("area", "")
                    if "gate" in a or not area:
                        continue
                    if alvo == area or alvo.startswith(area + "/"):
                        # o passo mais específico ganha: `plataforma/dados/prd/vpc`
                        # cai no passo 4 e dentro de `plataforma/dados` do 5
                        if achado is None or len(area) > achado[1]:
                            achado = (p["numero"], len(area))
            if achado:
                break
        if not achado:
            print("nenhum passo da fila alcança %s" % alvo, file=sys.stderr)
            return 2
        print(achado[0])
        return 0

    if comando == "conferir":
        return confere(d, ate)

    if comando == "acoes":
        alvo = int(argv[2])
        ctx = contexto_de(ate)
        for p in d["passos"]:
            if p["numero"] != alvo:
                continue
            for a in expande(p.get("acoes", []), ctx):
                if "area" in a and "gate" not in a:
                    print("area\t%s\t%s" % (a["area"], " ".join(a.get("pular", []))))
                elif "gate" in a:
                    print("gate\t%s\t%s" % (a["gate"], a.get("area", "")))
                elif "nota" in a:
                    print("nota\t%s\t%s" % (a.get("sobre", ""), a["nota"]))
            return 0
        print("passo %d não existe na fila" % alvo, file=sys.stderr)
        return 2

    print(__doc__, file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
