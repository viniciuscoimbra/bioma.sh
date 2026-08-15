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

    # Onde a cópia de um caminho do framework mora na instância. `ferramentas/`
    # é espelho direto; o catálogo exportado mora sob `infra/`. Sem este mapa o
    # catálogo ficava fora do sincronismo, e foi assim que os dois divergiram em
    # vinte arquivos durante semanas sem ninguém ver.
    def local_de(rel):
        if rel.startswith("catalogo/"):
            return os.path.join(RAIZ, "infra", rel)
        return os.path.join(RAIZ, rel)

    retidos, descem, iguais, manifesto_corrigido = [], [], [], []
    for rel, registrado in sorted(dados.get("arquivos", {}).items()):
        local = local_de(rel)
        fonte = os.path.join(framework, rel)
        if not os.path.isfile(fonte):
            retidos.append((rel, "não existe no framework; o manifesto está errado ou o framework anda atrás"))
            continue
        h_fonte = sha(fonte)
        h_local = sha(local) if os.path.isfile(local) else None
        if h_local == h_fonte:
            iguais.append(rel)
            # Cópia igual ao framework com manifesto atrasado acontece quando a
            # mudança subiu por cópia manual: os dois arquivos batem, o hash
            # registrado não, e o portão reprova uma cópia que está certa. O
            # manifesto descreve o presente, não a última descida.
            if registrado != h_fonte:
                dados["arquivos"][rel] = h_fonte
                manifesto_corrigido.append(rel)
        elif h_local is not None and h_local != registrado:
            # a cópia local mudou depois da última sincronização: é edição que
            # ainda não subiu, e descer por cima destrói trabalho
            retidos.append((rel, "editado na cópia depois da última sincronização; suba ao framework primeiro"))
        else:
            descem.append(rel)

    # Ferramenta nova no framework não está no manifesto da instância, e por
    # isso nunca descia: quem a escreveu via o portão passar e a instância
    # seguir sem ela. O que existe em `ferramentas/` do framework é do
    # framework por definição, porque nasceu lá; o que a instituição escreve
    # nunca aparece do outro lado.
    # Só o que o Git do framework rastreia: `esquema-aws.json` e companhia são
    # baixados por `baixar_esquema.sh` em cada lado e divergem por natureza, e
    # não são o que este manifesto governa.
    rastreados = subprocess.run(["git", "-C", framework, "ls-files",
                                 "ferramentas", "catalogo"],
                                capture_output=True, text=True).stdout.split()
    for rel in sorted(rastreados):
        nome = os.path.basename(rel)
        if rel in dados.get("arquivos", {}) or nome.startswith((".", "__")):
            continue
        # do catálogo entra só a receita: contrato, documento e workflow de
        # artefato são material da peça, e o manifesto governa código
        if rel.startswith("catalogo/") and not rel.endswith((".tf", ".hcl")):
            continue
        # `catalogo.hcl` é configuração da instalação (de onde as receitas
        # vêm), e cada lado tem o seu por direito: no framework é modelo, na
        # instância aponta o que ela decidiu. Governá-lo sobrescreveria a
        # decisão da instituição a cada sincronismo.
        if rel == "catalogo/catalogo.hcl":
            continue
        fonte = os.path.join(framework, rel)
        if not os.path.isfile(fonte):
            continue
        local = local_de(rel)
        if os.path.isfile(local) and sha(local) != sha(fonte):
            retidos.append((rel, "existe dos dois lados com conteúdo diferente e "
                                 "fora do manifesto; resolva à mão qual vale"))
        else:
            descem.append(rel)
            dados.setdefault("arquivos", {})[rel] = ""

    if retidos:
        print("retido: %d arquivo(s) com edição local que não subiu\n" % len(retidos))
        for rel, motivo in retidos:
            print("  %s\n      %s" % (rel, motivo))
        return 1

    # O commit anotado é a procedência das cópias, e não um efeito colateral de
    # ter copiado alguma coisa. Enquanto ele só era reescrito quando um arquivo
    # descia, um commit que não mexeu em ferramenta nenhuma (ou um amend, que
    # troca o sha sem trocar o conteúdo) deixava o manifesto apontando um commit
    # que não existe mais no framework. O ponteiro parecia certo e não era, que
    # é a única coisa que este manifesto existe para impedir.
    desatualizado = (commit and dados.get("framework_commit") != commit) or bool(manifesto_corrigido)

    if not descem and not desatualizado:
        print("nada a fazer: as %d cópias batem com o framework (%s)" % (len(iguais), commit))
        return 0

    if conferir:
        if descem:
            print("desceriam %d arquivo(s) do framework %s:" % (len(descem), commit))
            for rel in descem:
                print("  %s" % rel)
        if desatualizado:
            print("as cópias batem, e o manifesto anotaria %s no lugar de %s"
                  % (commit, dados.get("framework_commit")))
        for rel in manifesto_corrigido:
            print("  manifesto atrasado para %s: o hash seria recalculado" % rel)
        return 0

    for rel in descem:
        conteudo = open(os.path.join(framework, rel), "rb").read()
        destino = local_de(rel)
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        open(destino, "wb").write(conteudo)
        dados["arquivos"][rel] = hashlib.sha256(conteudo).hexdigest()
        print("  desceu %s" % rel)

    for rel in manifesto_corrigido:
        print("  manifesto corrigido para %s (cópia já batia com o framework)" % rel)
    dados["framework_commit"] = commit
    io.open(MANIFESTO, "w", encoding="utf-8").write(
        json.dumps(dados, indent=1, ensure_ascii=False, sort_keys=True) + "\n")
    print("origem.json atualizado para o framework %s" % commit)
    # O sincronismo é o momento em que algo desta instância pode ter chegado ao
    # framework. A limpeza roda aqui porque é aqui que o vazamento nasce, e um
    # framework com o vocabulário de um cliente dentro é produto quebrado para
    # todos os outros. Regra pétrea: o bioma não tem NADA de cliente nenhum.
    r = subprocess.run([sys.executable,
                        os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                     "verificar_limpeza.py"), framework])
    if r.returncode == 1:
        print("o framework está contaminado com termos desta instância; limpe "
              "antes de publicar qualquer coisa lá", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
