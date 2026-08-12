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
    # O catálogo é filho do live, e não irmão: `infra/catalogo`, e não
    # `catalogo`. Com `dirname`, apontar para `infra` procurava em `./catalogo`,
    # que não existe — e a metade de formato deste portão ficava inerte.
    catalogo = (sys.argv[sys.argv.index("--catalogo") + 1]
                if "--catalogo" in sys.argv
                else os.path.join(live.rstrip("/"), "catalogo"))

    # Árvore ausente é "sem insumo para decidir", e não "tudo respondido". Sem
    # esta guarda, o portão anunciava verde tendo lido zero células, que é a
    # única falha pior que reprovar sem motivo. Os irmãos `cardinalidade` e
    # `cobertura` já saíam 2 nessa situação.
    if not os.path.isdir(live):
        print("sem insumo para decidir: %s não existe" % live, file=sys.stderr)
        return 2

    pendentes, errados = [], []
    celulas = 0
    for base, _d, arqs in os.walk(live):
        if "terragrunt.hcl" not in arqs or ".terragrunt-cache" in base:
            continue
        celulas += 1
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

    # Zero pendências sobre zero células não é "tudo respondido": é não ter
    # lido. A distinção existe porque o portão passou dois dias devolvendo
    # sucesso apontado para um diretório que não existia.
    if not celulas:
        print("sem insumo para decidir: nenhuma célula sob %s" % live, file=sys.stderr)
        return 2

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
    # `main()` devolve o código, e sem o `sys.exit` ele se perdia: o "sem insumo
    # para decidir" virava saída 0, que é "passou".
    sys.exit(main() or 0)
