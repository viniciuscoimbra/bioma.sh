#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gate: a ficha não promete sítio de ligação que a receita não publica.

    python3 ferramentas/verificar_contratos.py <raiz do repositório> [--completo]

O `publica` do `contrato.json` é o que outra célula lê por
`dependency.<nome>.outputs.<sítio>`. Quando ele nomeia um output que a receita
não tem, quem escreve a célula seguinte descobre no `terragrunt plan`, e a ficha
que existe para poupar essa leitura foi o que causou a viagem.

O caminho como isso acontece não é descuido: a receita é renomeada num commit
que resolve outra coisa, e a ficha fica com o nome velho. Medido nesta árvore em
2026-08-28, antes do conserto: dezenove fichas nomeavam sítio inexistente, e a
maioria era exatamente isso (`arn_segredo` quando o output virou `arn`,
`state_machine_arn` quando virou `motor_arn`, `rt_ids` quando virou
`route_table_ids`). Nenhum portão perguntava.

## O que este portão NÃO pergunta, e por quê

**Prosa não se confere.** Dez fichas escrevem o `publica` como descrição e não
como identificador (`"tgw_id (a proposta de associação aponta para ele)"`,
`"arn do balde gold"`, `"métrica exceção de posting"`). Isso é escolha de quem
escreveu, às vezes porque o que a célula publica não é um output do Terraform, e
um portão que exigisse identificador ali estaria cobrando uma convenção que
ninguém decidiu. Entrada que não casa `^[a-z0-9_]+$` é pulada.

**Ficha que omite não reprova, e sai contada e não listada.** Quarenta e sete
fichas listam menos do que a receita publica, e isso é informação faltando, não
informação errada: ninguém quebra por causa de um sítio que existe e não foi
anunciado. Quarenta e sete linhas de aviso a cada execução é a receita para o
portão deixar de ser lido, então a saída normal traz uma linha com a contagem, e
`--completo` lista quais são.

A assimetria é o desenho: prometer o que não existe manda alguém para o lugar
errado, e deixar de anunciar o que existe apenas não ajuda.

## Insumo

Sai 0 quando nenhuma ficha promete sítio inexistente; 1 quando alguma promete;
2 quando não há o que conferir (sem catálogo, sem ficha com receita ao lado).
Zero achados sobre zero fichas conferidas é a resposta que este portão nunca dá.
"""
import io
import json
import os
import re
import sys

IDENTIFICADOR = re.compile(r"[a-z0-9_]+")
DECLARA_OUTPUT = re.compile(r'output\s+"([^"]+)"')


def fichas_com_receita(catalogo):
    """As fichas que têm receita ao lado, e portanto têm o que ser conferido.

    Ligação, fronteira e artefato não têm `outputs.tf` por natureza, e ficha sem
    receita não é defeito: é peça de outro tipo. A que tem receita e não tem
    `outputs.tf` entra assim mesmo, com conjunto vazio, porque prometer sítio
    sem publicar nenhum é o caso mais grave da mesma pergunta.
    """
    achadas = []
    for base, dirs, arqs in os.walk(catalogo):
        dirs[:] = [d for d in dirs if d not in (".terragrunt-cache", ".terraform")]
        if "contrato.json" not in arqs:
            continue
        if "main.tf" not in arqs:
            continue
        try:
            ficha = json.load(io.open(os.path.join(base, "contrato.json"), encoding="utf-8"))
        except ValueError:
            continue
        saidas = set()
        p = os.path.join(base, "outputs.tf")
        if os.path.isfile(p):
            saidas = set(DECLARA_OUTPUT.findall(io.open(p, encoding="utf-8").read()))
        achadas.append((os.path.relpath(base, catalogo), ficha.get("publica") or [], saidas))
    return sorted(achadas)


def main(argv):
    completo = "--completo" in argv
    argv = [a for a in argv if a != "--completo"]
    raiz = argv[0] if argv else os.environ.get("TG_RAIZ", "")
    if not raiz or not os.path.isdir(raiz):
        print("contratos: sem repositório para conferir (informe a raiz)")
        return 2

    catalogo = None
    for candidato in (os.path.join(raiz, "infra", "catalogo"), os.path.join(raiz, "catalogo")):
        if os.path.isdir(candidato):
            catalogo = candidato
            break
    if catalogo is None:
        print("contratos: nenhum catálogo nesta raiz, sem insumo para decidir")
        return 2

    fichas = fichas_com_receita(catalogo)
    if not fichas:
        print("contratos: nenhuma ficha com receita ao lado, sem insumo para decidir")
        return 2

    achados, avisos = [], []
    for nome, publica, saidas in fichas:
        # Prosa não se confere: ver a nota no cabeçalho.
        nomeados = [p for p in publica if IDENTIFICADOR.fullmatch(p)]
        promete_sem_ter = sorted(set(nomeados) - saidas)
        if promete_sem_ter:
            achados.append(
                "%s · a ficha promete %s, e a receita publica %s. Quem ler o "
                "contrato e escrever `dependency.<nome>.outputs.%s` descobre no "
                "plano."
                % (nome, ", ".join("`%s`" % p for p in promete_sem_ter),
                   ", ".join("`%s`" % s for s in sorted(saidas)) or "nada",
                   promete_sem_ter[0]))
        nao_anunciados = sorted(saidas - set(nomeados))
        if nao_anunciados and not promete_sem_ter:
            avisos.append("%s (%s)" % (nome, ", ".join(nao_anunciados)))

    if avisos:
        print("AVISO: %d ficha(s) anunciam menos do que a receita publica. Não "
              "quebra ninguém: some quando alguém precisar do sítio. "
              "`--completo` lista." % len(avisos))
        if completo:
            for a in avisos:
                print("  " + a)
    if achados:
        print("\ncontratos fora do que a receita entrega: %d achado(s) em %d ficha(s)\n"
              % (len(achados), len(fichas)))
        for a in achados:
            print("  " + a)
        print("\no `publica` da ficha é o que outra célula lê por `dependency`; "
              "quando a receita renomeia um output, a ficha acompanha no mesmo commit")
        return 1

    print("contratos · %d ficha(s) com receita: nenhuma promete sítio de ligação "
          "que a receita não publica" % len(fichas))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
