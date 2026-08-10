#!/usr/bin/env python3
"""Lista as células que um perfil pula, lendo o contrato de cada receita.

Para cada terragrunt.hcl sob o caminho dado, resolve o source no catálogo e lê
o contrato.json. Regras:
  local   -> pula contrato com local: fora (plan-apenas sai no modo apply)
  ensaio  -> pula contrato com custo: alto
  sandbox -> não pula nada
Sai um caminho de célula por linha (relativo ao caminho dado), para o
bioma.sh montar os --queue-exclude-dir. Journal registra cada pulo.

Uso: excluir_por_perfil.py <perfil> <caminho-live> [--apply]
"""
import io, json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def contrato_da_celula(hcl_path):
    txt = io.open(hcl_path, encoding="utf-8").read()
    m = re.search(r'source\s*=\s*"([^"]+)"', txt)
    if not m:
        return None
    src = m.group(1)
    m2 = re.search(r"catalogo//?((?:organismos|ligacoes|moleculas)/[a-z0-9\-/]+)", src)
    if not m2:
        return None
    contrato = os.path.join(RAIZ, "infra", "catalogo", m2.group(1), "contrato.json")
    if not os.path.exists(contrato):
        return None
    return json.load(io.open(contrato, encoding="utf-8"))


def main():
    if len(sys.argv) < 3:
        print(__doc__, file=sys.stderr)
        sys.exit(2)
    perfil, caminho = sys.argv[1], sys.argv[2]
    apply_mode = "--apply" in sys.argv
    if perfil == "sandbox":
        return
    for raiz, dirs, arquivos in os.walk(caminho):
        # o cache do terragrunt guarda uma cópia da receita dentro da célula;
        # contá-la duplicaria o pulo e sujaria o journal
        dirs[:] = [d for d in dirs if d != ".terragrunt-cache"]
        if "terragrunt.hcl" not in arquivos:
            continue
        c = contrato_da_celula(os.path.join(raiz, "terragrunt.hcl"))
        if c is None:
            continue
        local = (c.get("local") or "").split(":")[0].strip()
        custo = (c.get("custo") or "").strip()
        pula = None
        if perfil == "local" and local == "fora":
            pula = "local: fora"
        elif perfil == "local" and apply_mode and local == "plan-apenas":
            pula = "local: plan-apenas (sem apply)"
        elif perfil == "ensaio" and custo == "alto":
            pula = "custo: alto"
        if pula:
            print("%s\t%s\t%s" % (os.path.relpath(raiz, caminho), c.get("nome", "?"), pula))


if __name__ == "__main__":
    main()
