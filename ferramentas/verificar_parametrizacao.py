#!/usr/bin/env python3
"""Todo valor desta instituição é parâmetro, e nenhum é literal na célula.

Conta, ARN e região são valores da instalação, não da receita. Escritos dentro
de uma célula, viajam com o repositório: o mesmo arquivo vale para outra
instituição e continua nomeando a conta da primeira.

Procedência cobre o caso vizinho e não este: ela examina a QUEDA do `get_env`,
o valor de reserva capaz de passar por valor declarado. Onde não há `get_env`
não há queda para examinar, e o literal atravessa inteiro.

Três atravessaram, e cada um escapou da varredura que encontrou o anterior:

    topicos_arns = ["arn:aws:kafka:sa-east-1:555555555555:topic/faturamento-prd/..."]
    imagem       = "444444444444.dkr.ecr.sa-east-1.amazonaws.com/..."
    standards_arns = ["arn:aws:securityhub:sa-east-1::standards/..."]

Os três aplicam sem erro e apontam para recurso que não existe. Uma varredura
escrita a cada pergunta erra de um jeito novo a cada pergunta; um portão erra
uma vez e é corrigido no lugar onde a regra mora.

O que NÃO é achado, e por quê:

- linha dentro de `mock_outputs`: o `mock_outputs_allowed_terraform_commands`
  a barra no apply, e é justamente ali que o valor inventado tem lugar;
- `catalogo/*/exemplo/`: exemplo de receita não é célula do live;
- `arn:aws:iam::aws:policy/...`: política gerenciada da AWS não tem conta;
- CIDR e faixa de porta: são desenho de rede, e moram no `instancia.env` por
  outra razão que não é procedência.

Uso: verificar_parametrizacao.py [caminho-do-live]
Saída: 0 limpo · 1 reprovado
"""
import io
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def sem_comentario(linha):
    """A linha sem o comentário, respeitando aspas."""
    fora, i = [], 0
    aspas = None
    while i < len(linha):
        c = linha[i]
        if aspas:
            if c == "\\":
                fora.append(linha[i:i + 2]); i += 2; continue
            if c == aspas:
                aspas = None
        elif c in "\"'":
            aspas = c
        elif c == "#":
            break
        fora.append(c); i += 1
    return "".join(fora)


REGIOES = r"(?:us|eu|ap|sa|ca|me|af|il|mx)-(?:north|south|east|west|central|northeast|northwest|southeast|southwest)-\d"

REGRAS = (
    ("conta AWS", re.compile(r"\d{12}"),
     "número de 12 dígitos é conta; ele vem de contas.hcl ou de TG_CONTA_<NOME>"),
    ("ARN com conta", re.compile(r"arn:aws[a-z-]*:[a-z0-9-]+:[a-z0-9-]*:\d{12}:"),
     "o ARN carrega a conta; ele vem da dependência que publica o recurso"),
    ("região", re.compile(REGIOES),
     "a região é da instituição e vem de TG_REGIAO ou TG_REGIAO_SECUNDARIA"),
)

# 100 GiB em bytes, e outros números grandes que não são conta
NAO_E_CONTA = re.compile(r"\b(?:1073741824\d|10737418240\d)\b")


def linhas_do_live(caminho):
    """Cada linha de código do live, com o bloco mock_outputs já descartado."""
    for raiz, dirs, arqs in os.walk(caminho):
        dirs[:] = [d for d in dirs if d != ".terragrunt-cache"]
        if os.sep + "exemplo" in raiz:
            continue
        for a in sorted(arqs):
            if not a.endswith((".hcl", ".tf")):
                continue
            # O lockfile é artefato do init, e os hashes zh: dele têm corridas
            # de 12 dígitos que parecem conta. Ele nem é escrito por gente: o
            # primeiro plano da árvore o gerou e este portão reprovou o segundo.
            if a == ".terraform.lock.hcl":
                continue
            p = os.path.join(raiz, a)
            profundidade = 0
            for n, linha in enumerate(io.open(p, encoding="utf-8"), 1):
                # `#` só abre comentário quando não está dentro de string: cortar
                # no primeiro perdia o que viesse depois, e um ARN com `#` no
                # meio escondia o resto da linha.
                codigo = sem_comentario(linha)
                if not codigo.strip():
                    continue
                if "mock_outputs" in codigo and "allowed" not in codigo:
                    profundidade = max(0, codigo.count("{") - codigo.count("}"))
                    continue
                if profundidade > 0:
                    profundidade += codigo.count("{") - codigo.count("}")
                    continue
                yield p, n, codigo, linha


def main():
    caminho = sys.argv[1] if len(sys.argv) > 1 else os.path.join(RAIZ, "infra")
    if not os.path.isdir(caminho):
        print(f"sem insumo para decidir: {caminho} não existe", file=sys.stderr)
        return 2

    achados = []
    conferidas = 0
    for p, n, codigo, linha in linhas_do_live(caminho):
        conferidas += 1
        if "arn:aws:iam::aws:policy" in codigo or NAO_E_CONTA.search(codigo):
            continue
        for nome, rx, porque in REGRAS:
            m = rx.search(codigo)
            if m:
                achados.append((os.path.relpath(p, RAIZ), n, nome, m.group(0),
                                porque, linha.strip()[:96]))
                break

    # Zero literais sobre zero linhas é não ter lido, e não árvore limpa.
    if not conferidas:
        print(f"sem insumo para decidir: nenhuma linha de código sob {caminho}",
              file=sys.stderr)
        return 2

    if not achados:
        print(f"parametrização · 0 conta, 0 ARN e 0 região literais "
              f"em {conferidas} linhas de código do live")
        print("o que é do ambiente vem do ambiente, e o que é mock não alcança o apply")
        return 0

    print(f"parametrização reprovou: {len(achados)} valor(es) desta instalação "
          f"escritos na célula, fora de mock\n")
    for arquivo, n, nome, trecho, porque, texto in achados:
        print(f"{arquivo}:{n}  {nome} `{trecho}`")
        print(f"    {texto}")
        print(f"    {porque}\n")
    return 1


if __name__ == "__main__":
    sys.exit(main())
