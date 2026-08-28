#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""A ordem de execução, lida do dado em vez de escrita em código de controle.

    python3 ferramentas/fila.py passos                  # os passos, numerados
    python3 ferramentas/fila.py acoes 4 --ate prd       # as ações do passo 4
    python3 ferramentas/fila.py papel 5                 # o papel do passo 5
    python3 ferramentas/fila.py passo-do faturamento/prd/base

A sequência mora em `contrato/fila.json`. Cada passo tem número estável,
título, o papel com que executa e as ações em ordem. Ação é um domínio para
aplicar, um portão para conferir ou uma nota.

Domínio é a palavra, e não "área": uma OU é um domínio, domínios aninham, e o
caminho de uma peça dentro de um deles é o próprio domínio mais o resto. "Área"
queria dizer "diretório" e misturava as três coisas numa palavra só.

Escrita em blocos `if` de shell, a sequência funcionava e não se lia: não dava
para listar sem executar, nem conferir se o que rodou foi o que estava
declarado. Um nome de domínio errado dentro de um `for` pulava a área inteira
em silêncio, e o comando terminava dizendo que deu certo.

O que varia por instalação (quais domínios existem, quais ambientes cada um
tem) continua vindo de `convencoes.json`: a fila declara o formato do caminho,
e não o nome do cliente.

Saída em TSV, uma ação por linha, para o shell consumir sem parser:

    dominio<TAB>plataforma/rede/org<TAB>
    dominio<TAB>plataforma/dados<TAB>plataforma/dados/prd/vpc
    gate<TAB>durabilidade<TAB>plataforma/dados
    nota<TAB>aplicacao<TAB>fora do orquestrador: ...
"""
import io
import json
import os
import re
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

    A lista vem de `convencoes.json`, em ordem de criticidade, e o último é o
    mais crítico. O recorte é POSICIONAL, e não por nome: o mais crítico roda
    sozinho, porque produção não sobe de carona com o resto; qualquer outro roda
    do primeiro até ele.

    Estava escrito `{"dev": ..., "hml": ..., "prd": ...}`, com os três nomes
    dentro do framework. O vocabulário de ambiente é de quem desenha, e uma
    instituição que chame o dela de `homolog` ou `pre` recebia lista vazia: o
    comando terminava dizendo sucesso sem ter rodado nada.
    """
    todos = convencao("ambientes_por_natureza.workload")
    if not todos or ate not in todos:
        return []
    return todos[-1:] if ate == todos[-1] else todos[:todos.index(ate) + 1]


def carrega():
    if not os.path.exists(FILA):
        raise SystemExit("sem %s: a ordem de execução é dado, e ele não está aqui" % FILA)
    d = json.load(io.open(FILA, encoding="utf-8"))
    passos = d.get("passos") or []
    if not passos:
        raise SystemExit("%s não declara passo nenhum" % FILA)
    return d


def alvo_da(acao):
    """O caminho que a ação aplica. `area` é o nome antigo do campo, e vale."""
    return acao.get("dominio") or acao.get("area") or ""


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
    """O que os caminhos da fila precisam saber: o plano e os ambientes.

    O plano das contas de capacidade acompanha a criticidade do recorte, e
    também é posicional: rodando o ambiente mais crítico, o plano é o mais
    crítico; rodando qualquer outro, é o primeiro. Estava `"prd" if ate == "prd"
    else "nprd"`, com os dois nomes dentro do framework.
    """
    ambientes = ambientes_do_ate(ate)
    if not ambientes:
        raise SystemExit(
            "convencoes.json: `%s` não está em ambientes_por_natureza.workload, "
            "e a fila não sabe o que rodar" % ate)
    planos = convencao("ambientes_por_natureza.capacidade")
    if not planos:
        raise SystemExit("convencoes.json: sem ambientes_por_natureza.capacidade a fila "
                         "não sabe em que plano a plataforma roda")
    critico = convencao("ambientes_por_natureza.workload")[-1]
    return {"plano": planos[-1] if ate == critico else planos[0],
            "_ambientes": ambientes}


def dominios_do_recorte(d, ate):
    """Os domínios que a fila aplica num `--ate`, e o que ela declara fora."""
    declaradas, fora = set(), set()
    ctx = contexto_de(ate)
    for p in d["passos"]:
        for a in expande(p.get("acoes", []), ctx):
            if alvo_da(a) and "gate" not in a:
                declaradas.add(alvo_da(a))
            elif "nota" in a and a.get("sobre"):
                fora.add(a["sobre"])
    return declaradas, fora


def portoes_declarados(d):
    """Os nomes de portão que a fila usa, em qualquer recorte.

    Sem `expande`: um portão dentro de um `para_cada` tem o mesmo nome em toda
    iteração, e o que interessa aqui é o nome, não quantas vezes ele roda.
    """
    nomes = set()
    for passo in d["passos"]:
        pilha = list(passo.get("acoes", []))
        while pilha:
            a = pilha.pop()
            if not isinstance(a, dict):
                continue
            if "gate" in a:
                nomes.add(a["gate"])
            pilha.extend(a.get("faz", []))
    return nomes


def portoes_reconhecidos(caminho):
    """Os nomes que o orquestrador sabe despachar, lidos do `case` dele.

    Ler o Bash em vez de manter uma segunda lista aqui é de propósito: lista
    paralela é a coisa que este portão existe para impedir. Sem o arquivo, a
    pergunta não se aplica e a resposta é None, não um conjunto vazio: conjunto
    vazio acusaria todo portão da fila de desconhecido.
    """
    if not os.path.isfile(caminho):
        return None
    dentro, nomes = False, set()
    for linha in io.open(caminho, encoding="utf-8"):
        if 'case "$alvo" in' in linha:
            dentro = True
            continue
        if dentro:
            if "esac" in linha:
                break
            m = re.match(r"\s*([a-z0-9_-]+)\)", linha)
            if m:
                nomes.add(m.group(1))
    return nomes or None


def confere(d, ate):
    """Todo domínio do recorte existe, e toda célula da árvore cai em algum passo.

    O segundo é o que importa: célula que nenhum passo alcança nunca é aplicada,
    e o comando termina dizendo que deu certo.

    Os dois olham recortes diferentes de propósito. A existência do domínio é
    conferida no `--ate` desta corrida, porque a árvore de uma instalação que
    ainda só subiu produção não tem os diretórios de dev. A cobertura é
    conferida contra a união dos três, porque célula de dev existente e fora de
    toda fila é o defeito que este portão procura.
    """
    infra = os.path.join(AQUI, "infra")
    declaradas, fora_por_construcao = dominios_do_recorte(d, ate)
    uniao = set(declaradas)
    # Os outros recortes vêm da instância, e não de uma tupla escrita aqui:
    # `("dev", "hml", "prd")` era o mesmo chumbo que o resto deste arquivo já
    # tinha deixado de ter, e ele deixava de fora o recorte de quem chama o
    # ambiente de outro nome.
    for outro in convencao("ambientes_por_natureza.workload"):
        if outro == ate:
            continue
        try:
            mais, _ = dominios_do_recorte(d, outro)
        except SystemExit:
            continue
        uniao |= mais

    problemas = []
    for dominio in sorted(declaradas):
        if not os.path.isdir(os.path.join(infra, dominio)):
            problemas.append("DOMINIO-AUSENTE %s (declarado na fila para --ate %s, "
                             "e não existe na árvore)" % (dominio, ate))
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

    # O terceiro defeito desta família, e o que ficava invisível: a fila declara
    # um portão por NOME, e quem despacha o nome é o `case` do orquestrador. Os
    # dois eram listas paralelas, e nada as comparava: um nome errado no JSON
    # passava por aqui como "0 problemas" e derrubava o apply no meio, com o
    # orquestrador dizendo "portão desconhecido na fila" depois de já ter
    # aplicado os passos anteriores.
    reconhecidos = portoes_reconhecidos(os.path.join(AQUI, "bioma.sh"))
    if reconhecidos is not None:
        for nome in sorted(portoes_declarados(d) - reconhecidos):
            problemas.append(
                "PORTAO-DESCONHECIDO %s (declarado em contrato/fila.json e sem "
                "ramo no `case` do bioma.sh; o apply pararia ao alcançá-lo). "
                "Conhecidos: %s" % (nome, ", ".join(sorted(reconhecidos))))

    print("fila · %d domínios declarados (--ate %s) · %d células na árvore · %d problema(s)"
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
    # Sem `--ate`, o recorte é o mais crítico que a instância declara. Estava
    # `else "prd"`, e numa instalação que chame o dela de outro nome o default
    # não existia.
    ate = (argv[argv.index("--ate") + 1] if "--ate" in argv
           else (convencao("ambientes_por_natureza.workload") or [""])[-1])
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

    if comando in ("passo-do", "passo-da-area"):
        # Aplicar um domínio solto continua sendo aplicar um pedaço da fila, e
        # o papel de execução dele é o do passo que o contém. Sem esta resposta,
        # `--dominio` era o único caminho sem posição declarada.
        alvo = argv[2].strip("/")
        achado = None
        for ate_tentado in [ate] + convencao("ambientes_por_natureza.workload"):
            try:
                ctx = contexto_de(ate_tentado)
            except SystemExit:
                continue
            for p in d["passos"]:
                for a in expande(p.get("acoes", []), ctx):
                    dominio = alvo_da(a)
                    if "gate" in a or not dominio:
                        continue
                    if alvo == dominio or alvo.startswith(dominio + "/"):
                        # o passo mais específico ganha: `plataforma/dados/prd/vpc`
                        # cai no passo 4 e dentro de `plataforma/dados` do 5
                        if achado is None or len(dominio) > achado[1]:
                            achado = (p["numero"], len(dominio))
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
                if alvo_da(a) and "gate" not in a:
                    print("dominio\t%s\t%s" % (alvo_da(a), " ".join(a.get("pular", []))))
                elif "gate" in a:
                    print("gate\t%s\t%s" % (a["gate"], alvo_da(a)))
                elif "nota" in a:
                    print("nota\t%s\t%s" % (a.get("sobre", ""), a["nota"]))
            return 0
        print("passo %d não existe na fila" % alvo, file=sys.stderr)
        return 2

    print(__doc__, file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
