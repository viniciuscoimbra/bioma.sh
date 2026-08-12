#!/usr/bin/env python3
"""Traz de volta do framework os arquivos que são dele, e registra de onde vieram.

`ferramentas/` desta árvore tem duas populações. O que é da instituição
(cobertura, gerar_estrutura, guia, instalar...) mora aqui e evolui aqui. O que é
do framework (os portões, o gerador, a oficina) mora em
github.com/viniciuscoimbra/bioma.sh, e AQUI FICA SÓ A CÓPIA QUE RODA.

As duas árvores já andaram uma semana em linhas separadas, cada lado evoluindo a
própria cópia, e reconciliar depois custou uma medição arquivo a arquivo. Este
script é a volta única: a edição acontece no framework, e desce por aqui.

O que ele faz, nesta ordem:

1. Recusa a descida se a cópia local de um arquivo do manifesto foi editada
   (hash diferente do manifesto E diferente do framework): essa edição ainda
   não subiu, e descer por cima a destruiria. Suba primeiro, no repositório do
   framework, e rode de novo.
2. Copia do framework cada arquivo do manifesto.
3. Reescreve `origem.json` com o sha256 de cada um e o commit do framework.

O portão `verificar_ferramentas` fecha o ciclo: cópia com hash diferente do
manifesto reprova o pré-voo, com a instrução de editar no framework.

Uso: sincronizar_framework.py [--framework CAMINHO] [--conferir]
  --framework  onde o checkout do framework está (default: $BIOMA_FRAMEWORK,
               senão ~/Sites/bioma.sh)
  --conferir   não copia nada; só diz o que desceria e o que está retido
Saída: 0 sincronizado (ou nada a fazer) · 1 retido por edição local · 2 sem framework
"""
import hashlib
import io
import json
import os
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFESTO = os.path.join(RAIZ, "ferramentas", "origem.json")


def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()


def main():
    framework = os.environ.get("BIOMA_FRAMEWORK", os.path.expanduser("~/Sites/bioma.sh"))
    if "--framework" in sys.argv:
        framework = sys.argv[sys.argv.index("--framework") + 1]
    conferir = "--conferir" in sys.argv

    if not os.path.isdir(os.path.join(framework, "ferramentas")):
        print("sem framework em %s: aponte com --framework ou BIOMA_FRAMEWORK" % framework,
              file=sys.stderr)
        return 2
    if not os.path.isfile(MANIFESTO):
        print("sem ferramentas/origem.json: o manifesto diz o que é do framework, "
              "e sem ele este script não sabe o que trazer", file=sys.stderr)
        return 2

    dados = json.load(io.open(MANIFESTO, encoding="utf-8"))
    commit = subprocess.run(["git", "-C", framework, "rev-parse", "--short", "HEAD"],
                            capture_output=True, text=True).stdout.strip()

    retidos, descem, iguais = [], [], []
    for rel, registrado in sorted(dados.get("arquivos", {}).items()):
        local = os.path.join(RAIZ, rel)
        fonte = os.path.join(framework, rel)
        if not os.path.isfile(fonte):
            retidos.append((rel, "não existe no framework; o manifesto está errado ou o framework anda atrás"))
            continue
        h_fonte = sha(fonte)
        h_local = sha(local) if os.path.isfile(local) else None
        if h_local == h_fonte:
            iguais.append(rel)
        elif h_local is not None and h_local != registrado:
            # a cópia local mudou depois da última sincronização: é edição que
            # ainda não subiu, e descer por cima destrói trabalho
            retidos.append((rel, "editado na cópia depois da última sincronização; suba ao framework primeiro"))
        else:
            descem.append(rel)

    if retidos:
        print("retido: %d arquivo(s) com edição local que não subiu\n" % len(retidos))
        for rel, motivo in retidos:
            print("  %s\n      %s" % (rel, motivo))
        return 1

    if not descem:
        print("nada a fazer: as %d cópias batem com o framework (%s)" % (len(iguais), commit))
        return 0

    if conferir:
        print("desceriam %d arquivo(s) do framework %s:" % (len(descem), commit))
        for rel in descem:
            print("  %s" % rel)
        return 0

    for rel in descem:
        conteudo = open(os.path.join(framework, rel), "rb").read()
        destino = os.path.join(RAIZ, rel)
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        open(destino, "wb").write(conteudo)
        dados["arquivos"][rel] = hashlib.sha256(conteudo).hexdigest()
        print("  desceu %s" % rel)

    dados["framework_commit"] = commit
    io.open(MANIFESTO, "w", encoding="utf-8").write(
        json.dumps(dados, indent=1, ensure_ascii=False, sort_keys=True) + "\n")
    print("origem.json atualizado para o framework %s" % commit)
    return 0


if __name__ == "__main__":
    sys.exit(main())
