#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Uma pasta de Terraform ou Terragrunt vira um desenho que abre na tela.

    python3 ferramentas/desenho_da_arvore.py infra/fundacao
    python3 ferramentas/desenho_da_arvore.py infra/plataforma/barramento --saida projetos/

O desenho que sai é da **árvore**, e não da especificação: ele mostra as células
que existem e as dependências entre elas, com o arquivo e a linha de onde cada
uma veio. Desenho gerado da especificação e árvore escrita à mão descrevem a
mesma intenção em granularidades diferentes, e confundir os dois é ver uma coisa
e aplicar outra.

Precisa do leitor do framework, que faz a leitura fiel: o que ele não entender
volta declarado, nunca descartado em silêncio.

    BIOMA_FERRAMENTA=/caminho/para/bioma.sh python3 ferramentas/desenho_da_arvore.py <pasta>
"""
import io
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hcl_lido  # noqa: E402

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRAMEWORK = os.environ.get("BIOMA_FERRAMENTA", os.path.expanduser("~/Sites/bioma.sh"))


def leitor():
    """O importador do framework, que é quem sabe ler Terraform de verdade."""
    caminho = os.path.join(FRAMEWORK, "ferramentas")
    if not os.path.isdir(caminho):
        print("não achei o framework em %s.\n"
              "Ele é outro repositório: github.com/viniciuscoimbra/bioma.sh\n"
              "Aponte com BIOMA_FERRAMENTA=<caminho>." % FRAMEWORK, file=sys.stderr)
        sys.exit(2)
    sys.path.insert(0, caminho)
    import importar_terraform  # noqa: E402
    return importar_terraform


def inputs_da_celula(raiz, rel):
    """O que a célula já respondeu, lido do `terragrunt.hcl` dela."""
    if not rel:
        return {}, []
    caminho = os.path.join(raiz, rel.replace("/", os.sep), "terragrunt.hcl")
    if not os.path.isfile(caminho):
        return {}, []
    try:
        texto = io.open(caminho, encoding="utf-8").read()
    except (IOError, UnicodeDecodeError):
        return {}, []
    return hcl_lido.inputs_do_terragrunt(texto)


def contas_do_live():
    """As contas que a instância declara, para o desenho abrir com elas."""
    try:
        sys.path.insert(0, os.path.join(AQUI, "ferramentas"))
        from contas_do_live import contas_do_live as ler
        lista, erro = ler(os.path.join(AQUI, "infra", "contas.hcl"))
        return lista or []
    except Exception:
        return []


def execucao_do_journal():
    """caminho relativo da célula -> o último apply registrado.

    O journal é o diário de bordo do `bioma.sh` (execucao/journal-*.jsonl), e é
    ele que sabe o que rodou. O desenho carrega essa leitura em cada peça para
    a tela responder "o que já rodou da fase N" sem ninguém abrir a AWS: quem
    confere é a nuvem, mas quem conta a história da execução é o journal.
    Plan não entra: planejar não muda estado, e peça marcada por plan diria
    que rodou o que não rodou.
    """
    import glob
    estado = {}
    for arq in sorted(glob.glob(os.path.join(AQUI, "execucao", "journal-*.jsonl"))):
        perfil = os.path.basename(arq)[len("journal-"):-len(".jsonl")]
        for linha in io.open(arq, encoding="utf-8"):
            try:
                ev = json.loads(linha)
            except ValueError:
                continue
            if ev.get("acao") not in ("apply", "destroy"):
                continue
            caminho = os.path.relpath(str(ev.get("caminho", "")), os.path.join(AQUI, "infra"))
            estado[caminho] = {"acao": ev["acao"], "resultado": ev.get("resultado"),
                               "momento": ev.get("momento"), "perfil": perfil}
    return estado


def receitas_proprias(pasta, grafo):
    """{receita: {arquivo: conteúdo}} do que a instância tem e o bioma não.

    O catálogo do framework é biblioteca comum. O que a instância criou por
    cima é dela, e viaja no projeto: é isso que separa "o `.bio` remonta o
    projeto" de "o `.bio` anota o que existia".
    """
    do_bioma = os.path.join(AQUI, "catalogo")
    da_instancia = os.path.join(pasta, "catalogo")
    fora = {}
    for n in grafo.get("nos") or []:
        r = (n.get("receita") or "").strip()
        if not r or r in fora or os.path.isdir(os.path.join(do_bioma, r)):
            continue
        de = os.path.join(da_instancia, r)
        if not os.path.isdir(de):
            continue
        arqs = {}
        for arq in sorted(os.listdir(de)):
            if arq.endswith((".tf", ".md", ".json")) and os.path.isfile(os.path.join(de, arq)):
                arqs[arq] = io.open(os.path.join(de, arq), encoding="utf-8").read()
        if arqs:
            fora[r] = arqs
    return fora


def dependencias_da_celula(raiz, rel):
    """{rótulo: corpo} dos blocos `dependency` desta célula."""
    arq = os.path.join(raiz, rel, "terragrunt.hcl")
    if not (rel and os.path.isfile(arq)):
        return {}
    return hcl_lido.dependencias_escritas(io.open(arq, encoding="utf-8").read())


def partes_da_celula(raiz, rel):
    """(prosa, blocos, notas) do terragrunt desta célula."""
    arq = os.path.join(raiz, rel, "terragrunt.hcl")
    if not (rel and os.path.isfile(arq)):
        return "", [], {}, []
    return hcl_lido.partes_do_terragrunt(io.open(arq, encoding="utf-8").read())


import contextlib


@contextlib.contextmanager
def instancia_declarada(pasta):
    """Diz às ferramentas do framework onde estão os arquivos DESTA instância.

    `fila.py` e `convencoes.py` procuram o contrato ao lado de si mesmos. Isso
    acerta quando a cópia que roda é a da instância, e erra quando outra
    ferramenta já pôs o `ferramentas/` do framework no `sys.path`: aí o
    `import fila` traz o do framework, que não tem `contrato/` nenhum, e a
    fase saía vazia nas 416 células de uma árvore que tinha a fila do lado.

    Sobe da pasta desenhada até achar os arquivos, e por `realpath`, para que
    uma `infra/` que é link resolva o pai de verdade. Quem já declarou por
    variável de ambiente manda, porque foi escolha explícita.

    A declaração DURA O DESENHO, e não o processo. Escrevendo em `os.environ`
    para sempre, desenhar duas árvores no mesmo processo dava à segunda a fila
    da primeira, e todo processo filho herdava isso — a revisão cruzada de
    2026-09-08 mediu as duas coisas. O que sai daqui volta ao que era.
    """
    antes = {c: os.environ.get(c) for c in ("BIOMA_FILA", "BIOMA_CONVENCOES")}
    p = os.path.realpath(pasta)
    while True:
        for chave, rel in (("BIOMA_FILA", ("contrato", "fila.json")),
                           ("BIOMA_CONVENCOES", ("convencoes.json",))):
            alvo = os.path.join(p, *rel)
            if not os.environ.get(chave) and os.path.isfile(alvo):
                os.environ[chave] = alvo
        pai = os.path.dirname(p)
        if pai == p:
            break
        p = pai
    try:
        yield
    finally:
        for chave, valor in antes.items():
            if valor is None:
                os.environ.pop(chave, None)
            else:
                os.environ[chave] = valor


def mapa_da_fila():
    """O casamento caminho → passo desta instância, ou None se não há fila.

    Instalação sem `contrato/fila.json` não tem ordem declarada, e aí a fase
    fica vazia em vez de inventada: um número de fase errado no desenho é pior
    que nenhum, porque dá ordem de aplicar a quem confia nele.

    Sem cache de módulo: ele guardava a fila da primeira árvore desenhada e
    respondia com ela para a segunda. Quem chama já lê uma vez por desenho.
    """
    try:
        import fila
        mapa = fila.pares_dominio_passo("")
    except (ImportError, SystemExit, OSError, ValueError):
        return None
    # dicionário com as duas chaves vazias é verdadeiro, e passaria como fila
    # declarada: quem responde é o conteúdo.
    return mapa if (mapa["prefixos"] or mapa["segmentos"]) else None


def passo_da_celula(caminho, mapa):
    """O passo da fila de deploy que alcança esta célula, ou None."""
    if not mapa:
        return None
    import fila
    return fila.passo_de(caminho, mapa)


def main(argv):
    if len(argv) < 2:
        print(__doc__, file=sys.stderr)
        return 2
    pasta = os.path.abspath(argv[1].rstrip("/"))
    if not os.path.isdir(pasta):
        print("não achei a pasta %s" % pasta, file=sys.stderr)
        return 2

    destino = argv[argv.index("--saida") + 1] if "--saida" in argv else os.path.join(AQUI, "projetos")
    # O comando que aplica ESTA árvore viaja no projeto: a tela o mostra no
    # rodapé em vez do padrão da casa, que para produção seria um comando que
    # não roda.
    comando = argv[argv.index("--comando") + 1] if "--comando" in argv else ""
    # célula → PÁGINA, que é o recorte de leitura da tela: uma aba por bloco da
    # arquitetura de referência, como aba de planilha. O mapa vem de fora, de
    # quem conhece o desenho de referência da instalação.
    #
    # Isto se chamava `--fases` e escrevia `n["fase"]`, e a palavra estava no
    # campo errado: fase é o passo do deploy, e o bloco da referência não diz
    # nada sobre ordem de aplicar. `--fases` segue aceito, com a data, porque
    # há script de instância chamando assim.
    paginas = {}
    for bandeira in ("--paginas", "--fases"):
        if bandeira in argv:
            paginas = json.load(io.open(argv[argv.index(bandeira) + 1], encoding="utf-8"))
            break
    nome_projeto = argv[argv.index("--nome") + 1] if "--nome" in argv else ""
    os.makedirs(destino, exist_ok=True)

    imp = leitor()
    # o catálogo é biblioteca: as células apontam para ele, e o desenho do live
    # não repete o interior de cada receita como peça
    grafo, relatorio = imp.le(pasta, ignorar=["catalogo"])
    with instancia_declarada(pasta):
        mapa_de_passos = mapa_da_fila()
    rodou = execucao_do_journal()
    # O `root.hcl` na raiz da árvore é quem resolve conta e região por caminho.
    raiz_tem_root_hcl = any(
        os.path.isfile(os.path.join(pasta, *p)) for p in (("root.hcl",), ("..", "root.hcl")))
    for n in grafo.get("nos", []):
        if n.get("id") in paginas:
            n["pagina"] = paginas[n["id"]]
        # A FASE é derivada, e não perguntada: ela é o passo da fila de deploy
        # que alcança esta célula. O framework só parametriza o que exige
        # intervenção humana, e a ordem de aplicar já está declarada em
        # `contrato/fila.json`.
        passo = passo_da_celula(n.get("id"), mapa_de_passos)
        if passo is not None:
            n["fase"] = passo
        ev = rodou.get(n.get("id", ""))
        if ev:
            n.setdefault("valores", {})["execucao"] = (
                "%s %s em %s (%s)" % (ev["acao"], ev["resultado"], ev["momento"], ev["perfil"]))
        # As respostas que a célula já tem. Sem isto o desenho de uma árvore em
        # produção abre pedindo o que foi decidido meses atrás: mil perguntas
        # cuja resposta está no arquivo ao lado. O que a árvore preenche
        # sozinha (`dependency`, `get_env`) entra como resolvido, e não como
        # resposta de gente, porque ninguém escolheu aquilo ali.
        respostas, derivados, formulas, arranjo = inputs_da_celula(pasta, n.get("id") or "")
        if arranjo.get("ordem"):
            n["ordem"] = arranjo["ordem"]
        if arranjo.get("quebras"):
            n["quebras"] = arranjo["quebras"]
        # A coluna do `=` é do autor. `hclfmt` é idempotente e não canônico:
        # ele aceita um grupo alinhado mais largo do que ele mesmo produziria,
        # e deduzir devolve um arquivo também válido que não é o dele.
        if arranjo.get("colunas"):
            n["colunas"] = arranjo["colunas"]
        # A expressão de cada campo derivado viaja no projeto: é ela que o
        # gerador reescreve, e ela não se deduz de volta a partir do nome.
        if formulas:
            n["formulas"] = formulas
        # O que a pessoa escreveu e o framework não modela: a prosa que diz
        # por que a célula existe, os blocos que nenhum parâmetro gera, e o
        # comentário de cada resposta. Sem isto, gerar de volta devolvia um
        # arquivo funcional e mudo, e a razão de cada decisão morria na
        # primeira geração.
        prosa, blocos, notas, arranjo = partes_da_celula(pasta, n.get("id") or "")
        if prosa:
            n["prosa"] = prosa
        if blocos:
            n["blocos"] = blocos
        if notas:
            n["notas"] = notas
        if arranjo:
            n["arranjo"] = arranjo
        deps = dependencias_da_celula(pasta, n.get("id") or "")
        if deps:
            n["dependencias"] = deps
        if respostas:
            n.setdefault("valores", {}).update(respostas)
        # Numa árvore com `root.hcl`, a conta, a região, a OU e os ambientes de
        # cada célula saem do caminho dela e do mapa de contas, em tempo de
        # execução. Perguntá-los peça a peça faz uma árvore de duzentas células
        # abrir com oitocentas perguntas cuja resposta é a mesma linha de
        # configuração, escrita uma vez.
        if raiz_tem_root_hcl:
            derivados = list(derivados) + ["conta", "regiao", "ou", "ambientes"]
        if derivados:
            n["derivados"] = derivados

    if not grafo.get("nos"):
        print("a pasta não tem célula nem recurso que eu saiba ler.", file=sys.stderr)
        for x in relatorio.get("nao_lidos") or []:
            print("  não li: %s" % x, file=sys.stderr)
        return 1

    nome = os.path.relpath(pasta, os.path.join(AQUI, "infra"))
    arquivo = (nome_projeto or (nome.replace("/", "-") + "-da-arvore")).replace("/", "-") + ".bio"

    desenho = {
        "bioma": 2,  # 2: `dominio` e `pagina`; 1 dizia `trilho` e `fase`
        "nome": nome_projeto or ("%s · lido da árvore" % nome),
        # de onde ele veio, para ninguém confundir com o desenho da
        # especificação: os dois existem e não são a mesma coisa
        "origem": {
            "tipo": "arvore",
            "pasta": nome,
            "arquivos": relatorio.get("arquivos"),
            "fiel": relatorio.get("fiel"),
            "nao_lidos": relatorio.get("nao_lidos"),
            "comando": comando,
        },
        "grafo": grafo,
        # As receitas que esta árvore usa e o framework não tem. O `.bio` é o
        # projeto, e projeto que aponta uma peça sem carregá-la não remonta:
        # `organismos/core-banking/ledger-livro` é do domínio de quem desenhou,
        # e não peça do bioma. Sem isto, abrir o `.bio` gerava uma célula
        # apontando para uma receita que não existe em lugar nenhum.
        "catalogo": receitas_proprias(pasta, grafo),
        # as contas que as células realmente usam vêm do importador, que as
        # resolve pelos mapas do contas.hcl da própria árvore; o contas_do_live
        # completa o número de quem já existe
        "contas": relatorio.get("contas") or contas_do_live(),
    }

    saida = os.path.join(destino, arquivo)
    io.open(saida, "w", encoding="utf-8").write(
        json.dumps(desenho, ensure_ascii=False, indent=1) + "\n")

    print("%s" % saida)
    print("  %d peças · %d setas · %d arquivos lidos"
          % (len(grafo["nos"]), len(grafo.get("arestas") or []), relatorio.get("arquivos", 0)))
    if relatorio.get("fiel"):
        print("  fiel: tudo que estava lá virou peça, ou está declarado como escolha")
    else:
        print("  ATENÇÃO: a leitura não foi fiel. O que não foi lido:")
        for x in (relatorio.get("nao_lidos") or [])[:10]:
            print("    %s" % x)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
