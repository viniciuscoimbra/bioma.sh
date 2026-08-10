#!/usr/bin/env python3
"""Gate: confere o preenchimento das células, e ensina onde está errado.

Ele faz duas perguntas por valor: foi respondido? e a resposta está no formato
que o serviço aceita? A segunda é a que importa, porque valor no formato errado
para no meio do apply, e valor no formato certo com conteúdo errado cria coisa
errada em silêncio.

A regra de formato de cada valor vem do `perguntas.json` que o gerador escreve
ao lado da receita, que é a mesma regra que a pessoa leu no LEIA.md.

Uso: verificar_preenchimento.py <pasta do live> [--catalogo <pasta>]
"""
import io, json, os, re, sys


def perguntas_da_receita(catalogo, caminho_receita):
    p = os.path.join(catalogo, caminho_receita, "perguntas.json")
    if not os.path.exists(p):
        return {}
    return {q["nome"]: q for q in json.load(io.open(p, encoding="utf-8"))}


def main():
    live = sys.argv[1] if len(sys.argv) > 1 else "live"
    catalogo = (sys.argv[sys.argv.index("--catalogo") + 1]
                if "--catalogo" in sys.argv
                else os.path.join(os.path.dirname(live.rstrip("/")), "catalogo"))

    pendentes, errados = [], []
    for base, _d, arqs in os.walk(live):
        if "terragrunt.hcl" not in arqs or ".terragrunt-cache" in base:
            continue
        txt = io.open(os.path.join(base, "terragrunt.hcl"), encoding="utf-8").read()
        m = re.search(r'source\s*=\s*"[^"]*catalogo//?((?:organismos|ligacoes)/[a-z0-9\-/]+)"', txt)
        perg = perguntas_da_receita(catalogo, m.group(1)) if m else {}
        celula = os.path.relpath(base, live)
        for chave, valor in re.findall(r'^\s*([a-z0-9_]+)\s*=\s*"([^"]*)"', txt, re.M):
            if valor == "PREENCHER":
                pendentes.append((celula, chave, perg.get(chave)))
            elif chave in perg:
                fmt = perg[chave].get("formato") or ".+"
                if not re.match(fmt, valor):
                    errados.append((celula, chave, valor, perg[chave]))

    if not pendentes and not errados:
        print("preenchimento: tudo respondido e no formato certo")
        sys.exit(0)

    if pendentes:
        print("Falta responder (%d):\n" % len(pendentes))
        for celula, chave, q in pendentes:
            print("  %s · %s" % (celula, chave))
            if q:
                print("     pergunta: %s" % q["pergunta"])
                print("     exemplo:  %s" % q["exemplo"])
                print("     formato:  %s" % q["explica"])
            print()
    if errados:
        print("Respondido fora do formato (%d):\n" % len(errados))
        for celula, chave, valor, q in errados:
            print("  %s · %s" % (celula, chave))
            print('     você escreveu: "%s"' % valor)
            print("     o aceito é:    %s" % q["explica"])
            print("     exemplo certo: %s" % q["exemplo"])
            print("     se ficar assim: %s" % q["erra"])
            print()
    sys.exit(1)


if __name__ == "__main__":
    main()
