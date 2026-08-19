#!/usr/bin/env python3
"""A árvore gerada de referência, para o gerador não mudar sozinho.

Gera a estrutura a partir de um desenho fixo e compara com o que está
versionado em `testes/arvore-esperada/`. Mudança no gerador que altere a saída
reprova aqui, e só passa quando a referência for atualizada no mesmo commit.
Assim o revisor vê o que mudou no que a ferramenta escreve, e não só no que
ela executa.

  python3 testes/arvore_referencia.py --conferir    reprova se divergir
  python3 testes/arvore_referencia.py --atualizar   grava a referência nova
"""
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
FERR = os.path.join(RAIZ, "ferramentas")
sys.path.insert(0, FERR)
import oficina
ESPERADA = os.path.join(AQUI, "arvore-esperada")
ESQUEMA = os.path.join(FERR, "esquema-aws.json")
CONVENCOES = os.path.join(AQUI, "convencoes-referencia.json")

# Um desenho pequeno e representativo: dois domínios, três tecidos possíveis,
# uma seta que atravessa conta (vira ligação) e uma que não (vira dependência).
#
# Os nomes de zona são sintéticos, e é o que os torna prova: nome de OU pertence
# a quem desenhou a árvore, e desenho de teste com o vocabulário de alguém real
# leva esse vocabulário para dentro do framework. `alfa` e `beta` viram
# capacidade e workload por estarem declarados em `convencoes-referencia.json`,
# nunca por como se chamam.
DESENHO = {
    "nome": "referencia",
    "nos": [
        {"servico": "lambda function", "papel": "recorta o evento",
         "zona": "Gama", "multiplicidade": "compartilhado"},
        {"servico": "sqs queue", "papel": "fila de eventos",
         "zona": "Gama", "multiplicidade": "compartilhado"},
        {"servico": "s3 bucket", "papel": "trilha de auditoria",
         "zona": "Gama > Delta", "multiplicidade": "compartilhado"},
        # a notação de topo e OU: a natureza da OU decide quantos ambientes
        # existem, e é o que faz workload nascer com três células e capacidade
        # com duas
        {"servico": "kafka cluster", "papel": "distribui evento entre contas",
         "zona": "Alfa · Folha Um · VPC privada", "multiplicidade": "compartilhado"},
        {"servico": "aurora cluster", "papel": "livro-razão do domínio",
         "zona": "Beta · Folha Dois · VPC privada", "multiplicidade": "compartilhado"},
    ],
    "arestas": [
        {"origem": "lambda function", "destino": "sqs queue",
         "flui": "evento", "canal": "direto", "cruza": "não"},
        {"origem": "lambda function", "destino": "s3 bucket",
         "flui": "trilha", "canal": "direto", "cruza": "não"},
        {"origem": "aurora cluster", "destino": "kafka cluster",
         "flui": "lançamento", "canal": "evento", "cruza": "não"},
    ],
}


def gera():
    """Roda o tradutor e o gerador, e devolve {caminho: conteúdo}."""
    # Sem o esquema, o gerador escreve `TODO(argumentos)` no lugar do que o
    # provider exige, e a comparação vira saída degradada contra referência
    # íntegra: o diff cresce por toda a árvore e se lê como se o gerador
    # tivesse mudado sozinho. Foi o que aconteceu, e custou o diagnóstico.
    if not os.path.exists(ESQUEMA):
        raise SystemExit(
            "sem ferramentas/esquema-aws.json: o gerador escreveria o esqueleto\n"
            "sem os argumentos do provider, e a árvore comparada não valeria\n"
            "nada. Traga o esquema, que o CI também traz antes dos portões:\n"
            "  ./ferramentas/baixar_esquema.sh")
    tmp = oficina.pasta("bioma-referencia-")
    try:
        espec = os.path.join(tmp, "desenho.md")
        io.open(espec, "w", encoding="utf-8").write(markdown_do(DESENHO))
        r = subprocess.run(
            [sys.executable, os.path.join(RAIZ, "ferramentas", "traduzir_bloco.py"),
             espec, "--saida", os.path.join(tmp, "proposta"),
             "--convencoes", CONVENCOES],
            capture_output=True, text=True)
        prop = os.path.join(tmp, "proposta", "proposta.json")
        if not os.path.exists(prop):
            raise SystemExit("o tradutor não produziu proposta:\n" + (r.stderr or r.stdout))
        arvore = os.path.join(tmp, "arvore")
        r = subprocess.run(
            [sys.executable, os.path.join(RAIZ, "ferramentas", "gerar_iac.py"),
             prop, "--destino", arvore, "--forcar"],
            capture_output=True, text=True,
            env=dict(os.environ, IAC_ESQUEMA_AWS=ESQUEMA))
        if not os.path.isdir(arvore):
            raise SystemExit("o gerador não produziu árvore:\n" + (r.stderr or r.stdout))
        saida = {}
        for base, _d, arqs in os.walk(arvore):
            for a in arqs:
                c = os.path.join(base, a)
                saida[os.path.relpath(c, arvore)] = io.open(c, encoding="utf-8").read()
        return saida
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def markdown_do(d):
    """O desenho no formato que o tradutor lê.

    O formato é o do bloco de arquitetura, e não uma invenção deste teste: a
    tabela de serviços começa na coluna `serviço`, a de arestas começa na
    coluna `#`. Errar isso desloca as colunas em silêncio, e a primeira versão
    deste arquivo gerou uma ligação chamada `destino-para-flui`, tirada do
    próprio cabeçalho.
    """
    L = ["# %s" % d["nome"], "", "## Serviços e colocação", "",
         "| serviço | papel | zona (conta · rede) | multiplicidade | realiza |",
         "|---|---|---|---|---|"]
    for n in d["nos"]:
        L.append("| %s | %s | %s | %s | |"
                 % (n["servico"], n["papel"], n["zona"], n["multiplicidade"]))
    L += ["", "## Arestas (fluxo do diagrama)", "",
          "| # | origem | destino | o que flui | canal | cruza fronteira |",
          "|---|---|---|---|---|---|"]
    for i, a in enumerate(d["arestas"], 1):
        L.append("| %d | %s | %s | %s | %s | %s |"
                 % (i, a["origem"], a["destino"], a["flui"], a["canal"], a["cruza"]))
    L += ["", "## Pontos de customização por instância", "", "## fim", ""]
    return "\n".join(L)


def le_esperada():
    saida = {}
    for base, _d, arqs in os.walk(ESPERADA):
        for a in arqs:
            c = os.path.join(base, a)
            saida[os.path.relpath(c, ESPERADA)] = io.open(c, encoding="utf-8").read()
    return saida


def atualiza():
    # Gera antes de apagar. Na outra ordem, qualquer parada do gerador deixa o
    # repositório sem referência nenhuma, e foi o que aconteceu quando o
    # esquema do provider faltava: os 36 arquivos sumiram e o portão passou a
    # dizer que a referência não existia.
    arvore = gera()
    shutil.rmtree(ESPERADA, ignore_errors=True)
    for caminho, texto in arvore.items():
        alvo = os.path.join(ESPERADA, caminho)
        os.makedirs(os.path.dirname(alvo), exist_ok=True)
        io.open(alvo, "w", encoding="utf-8").write(texto)
    print("referência atualizada: %d arquivos em testes/arvore-esperada/" % len(arvore))


def confere():
    agora, antes = gera(), le_esperada()
    if not antes:
        raise SystemExit("não existe referência ainda: rode --atualizar e revise o que entrou")
    faltando = sorted(set(antes) - set(agora))
    novos = sorted(set(agora) - set(antes))
    mudados = sorted(c for c in (set(agora) & set(antes)) if agora[c] != antes[c])
    if not (faltando or novos or mudados):
        print("a árvore gerada bate com a referência (%d arquivos)" % len(agora))
        return 0
    print("a árvore gerada mudou:")
    for c in faltando:
        print("  sumiu   %s" % c)
    for c in novos:
        print("  novo    %s" % c)
    for c in mudados:
        print("  mudou   %s" % c)
    print("\nSe a mudança é a que você quis, rode:")
    print("  python3 testes/arvore_referencia.py --atualizar")
    print("e mande a referência no mesmo commit, para o revisor ver o que mudou.")
    return 1


if __name__ == "__main__":
    if "--atualizar" in sys.argv:
        atualiza()
    else:
        raise SystemExit(confere())
