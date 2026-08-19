#!/usr/bin/env python3
"""Os mapas gerados acompanham a árvore que está commitada.

Instância que tem `ferramentas/gerar_mapas.py` regera os mapas de donos e de
ligações no pré-voo, direto na árvore de trabalho. O que o pré-voo não alcança
é o commit: quem commita escolhendo arquivo à mão deixa o mapa regerado para
trás, e a célula sobe com o mapa velho do lado. Aconteceu duas vezes num mesmo
dia, numa árvore real. Mapa velho não quebra apply nenhum; ele espera as três
da manhã de alguém para responder errado sobre quem chamar.

Este portão fecha o buraco onde ele existe, no CI: regera os mapas em modo de
conferência e reprova se o resultado difere do que está na árvore. No checkout
do CI a árvore É o commit, então diff aqui é commit com mapa atrasado. A árvore
não fica tocada: o que o gerador reescreve volta ao que era, byte a byte, e a
única saída do portão é o veredito. No pré-voo ele não tem o que dizer, porque
o pré-voo acabou de regerar; o lugar dele é a esteira.

O gerador é da instância, porque nomeia decisões dela (de que contrato o dono
sai, que credencial aplica o quê). Este portão não nomeia nada: ele pergunta se
o que o gerador produz é o que está commitado, e árvore sem gerador não está
errada, está fora do assunto.

Uso: verificar_mapas.py [raiz do repositório]
Saída: 0 mapas em dia · 1 mapa atrasado ou gerador quebrado · 2 sem insumo
"""
import difflib
import os
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Os dois nomes que o gerador escreve, na raiz de cada área de primeiro nível
# sob infra/. O catálogo não é área: célula não mora nele.
NOMES = ("mapa-donos.md", "mapa-ligacoes.md")


def alvos(infra):
    """Todo caminho onde o gerador pode escrever, exista o arquivo ou não.

    O caminho que ainda não existe entra de propósito: área nova com célula e
    sem mapa é exatamente o commit que esqueceu o mapa, e só aparece no
    veredito se a lista incluir o que o gerador criaria.
    """
    fora = []
    for d in sorted(os.listdir(infra)):
        area = os.path.join(infra, d)
        if not os.path.isdir(area) or d == "catalogo":
            continue
        for nome in NOMES:
            fora.append(os.path.join(area, nome))
    return fora


def main():
    raiz = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else RAIZ)
    gerador = os.path.join(raiz, "ferramentas", "gerar_mapas.py")
    infra = os.path.join(raiz, "infra")
    if not os.path.isfile(gerador) or not os.path.isdir(infra):
        print("sem insumo para decidir: %s não tem gerador de mapas "
              "(ferramentas/gerar_mapas.py) com árvore em infra/" % raiz,
              file=sys.stderr)
        return 2

    caminhos = alvos(infra)
    antes = {}
    for p in caminhos:
        antes[p] = open(p, "rb").read() if os.path.isfile(p) else None

    r = subprocess.run([sys.executable, gerador],
                       capture_output=True, text=True, cwd=raiz)

    # A restauração vem antes de qualquer veredito, o do gerador quebrado
    # incluído: portão que muda a árvore que confere vira gerador acidental,
    # e o defeito que ele acusa some da vista de quem vai consertar.
    atrasados = []
    for p in caminhos:
        depois = open(p, "rb").read() if os.path.isfile(p) else None
        if depois == antes[p]:
            continue
        atrasados.append((p, antes[p], depois))
        if antes[p] is None:
            os.remove(p)
        else:
            open(p, "wb").write(antes[p])

    if r.returncode == 2:
        print("sem insumo para decidir: o gerador não achou área com célula\n"
              "%s" % (r.stderr or r.stdout).strip(), file=sys.stderr)
        return 2
    if r.returncode != 0:
        print("o gerador de mapas quebrou (código %d), e sem ele não há como "
              "dizer se o mapa está em dia:\n%s"
              % (r.returncode, (r.stderr or r.stdout).strip()))
        return 1

    if not atrasados:
        vivos = sum(1 for p in caminhos if antes[p] is not None)
        print("mapas · %d mapas conferidos contra o gerador: acompanham a árvore"
              % vivos)
        return 0

    print("mapa atrasado: %d arquivo(s) não acompanham a árvore commitada\n"
          % len(atrasados))
    for p, velho, novo in atrasados:
        rel = os.path.relpath(p, raiz)
        if velho is None:
            print("  %s · o gerador o cria e o commit não o traz" % rel)
            continue
        print("  %s" % rel)
        diff = difflib.unified_diff(
            velho.decode("utf-8", "replace").splitlines(),
            (novo or b"").decode("utf-8", "replace").splitlines(),
            "commitado", "regerado", lineterm="")
        corpo = list(diff)[2:]
        for linha in corpo[:8]:
            print("      %s" % linha)
        if len(corpo) > 8:
            print("      … %d linha(s) a mais; o diff inteiro sai regerando na "
                  "sua máquina" % (len(corpo) - 8))
    print("\nrode python3 ferramentas/gerar_mapas.py e commite o mapa junto da "
          "célula que o mudou.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
