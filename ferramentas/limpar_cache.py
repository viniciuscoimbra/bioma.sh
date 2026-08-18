#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""O que o terraform deixa para trás em cada célula, e quanto pesa.

    python3 ferramentas/limpar_cache.py            só mede e lista
    python3 ferramentas/limpar_cache.py --apagar   apaga e diz quanto voltou

`.terragrunt-cache` e `.terraform` são derivados: nascem do `init` e voltam a
nascer sozinhos. O que mora neles é o binário do provider, e ele é grande.

O cache compartilhado (`TF_PLUGIN_CACHE_DIR` ou `plugin_cache_dir` no
`~/.terraformrc`) poupa o DOWNLOAD, e não o disco: medido no Terraform 1.15.8
em macOS, com e sem cache, o `init` grava uma cópia inteira de 822 MB dentro da
própria pasta, com inode próprio. Quem contar com o cache para não encher o
disco conta errado, e foi assim que uma árvore de 71 células chegou a 48 GB
duas vezes.

Por isso a limpeza é comando, e não efeito colateral de outra coisa: quem
sabe que já terminou de trabalhar é quem opera.

Saída: 0 sempre. Medir não reprova nada.
"""
import io
import os
import shutil
import sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DERIVADAS = (".terragrunt-cache", ".terraform")


def peso(caminho):
    """Bytes realmente ocupados, contando cada inode uma vez só.

    Somar `st_size` conta link e clone como se fossem cópia, e a conta sai
    maior que o disco. O que interessa é bloco ocupado.
    """
    total, vistos = 0, set()
    for base, dirs, arqs in os.walk(caminho):
        for nome in arqs:
            p = os.path.join(base, nome)
            try:
                st = os.lstat(p)
            except OSError:
                continue
            if st.st_ino in vistos:
                continue
            vistos.add(st.st_ino)
            total += st.st_blocks * 512
    return total


def pastas(raiz):
    """Toda pasta derivada sob `raiz`, sem descer dentro das que já achou."""
    fora = []
    for base, dirs, _arqs in os.walk(raiz):
        achadas = [d for d in dirs if d in DERIVADAS]
        for d in achadas:
            fora.append(os.path.join(base, d))
        dirs[:] = [d for d in dirs if d not in DERIVADAS]
    return sorted(fora)


def humano(n):
    for unidade in ("B", "KB", "MB", "GB"):
        if n < 1024 or unidade == "GB":
            return "%.1f %s" % (n, unidade)
        n /= 1024.0


def main(argv):
    raiz = os.path.join(AQUI, "infra")
    if not os.path.isdir(raiz):
        print("sem infra/ em %s: nada a medir" % AQUI)
        return 0
    apagar = "--apagar" in argv

    achadas = pastas(raiz)
    if not achadas:
        print("nenhuma pasta derivada em infra/: a árvore está limpa")
        return 0

    total = 0
    maiores = []
    for p in achadas:
        b = peso(p)
        total += b
        maiores.append((b, p))
    maiores.sort(reverse=True)

    print("%d pasta(s) derivada(s) em infra/, %s no total"
          % (len(achadas), humano(total)))
    for b, p in maiores[:5]:
        print("  %9s  %s" % (humano(b), os.path.relpath(p, AQUI)))
    if len(maiores) > 5:
        print("  ... e mais %d" % (len(maiores) - 5))

    if not apagar:
        print("\nElas voltam a nascer no próximo `init`. Para apagar:")
        print("  python3 ferramentas/limpar_cache.py --apagar")
        return 0

    for _b, p in maiores:
        shutil.rmtree(p, ignore_errors=True)
    restam = pastas(raiz)
    print("\napagadas %d, %s de volta" % (len(achadas) - len(restam), humano(total)))
    if restam:
        print("ficaram %d que o sistema não deixou apagar" % len(restam))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
