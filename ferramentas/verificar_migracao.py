#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gate: aplicação que espera schema não nasce antes da migração ter rodado.

    python3 ferramentas/verificar_migracao.py <caminho-do-live> [--escopo <célula>]

A ordem da esteira é migração ANTES do deploy (15.2): a tarefa efêmera muta o
banco, a esteira confere o código de saída, e só então a aplicação sobe. Quem
aplica a célula por fora da esteira pula essa ordem, e o defeito não aparece no
apply: a função nasce perfeita e falha na primeira escrita, com erro de relação
inexistente, que parece defeito da aplicação e é ausência de migração.

Foi o que aconteceu em 2026-08-26 com o escrivão do livro em produção.

Como o portão sabe: a receita declara em `contrato.json` o que ela espera do
banco, e a tarefa de migração publica em SSM o que aplicou.

    contrato.json:  "exige_schema": ["staging", "ledger", "outbox"]
    parâmetro SSM:  /<dominio>/<ambiente>/migracao/schemas  (lista, separada por vírgula)

O parâmetro é escrito pela tarefa de migração, na conta do ambiente, ao
terminar com sucesso. Nada além dela deveria escrevê-lo: é o registro de que a
mutação aconteceu, e escrever à mão é assinar que rodou sem ter rodado.

Sai 0 quando toda célula com `exige_schema` tem a evidência; 1 quando falta; 2
quando não há insumo para decidir (sem live, sem credencial, sem catálogo).

Convenção que acompanha este portão: receita que declara `exige_schema` e tem
gatilho automático (agendador, fila, stream) nasce com o gatilho PARADO, por
uma variável própria da receita, e liga depois que a migração rodou. O portão
defende o nascimento pela esteira; o interruptor defende o resto, inclusive o
apply feito por fora que não passa por portão nenhum.
"""
import io
import json
import os
import re
import subprocess
import sys


def regiao_do_ambiente(ambiente):
    """A região onde a evidência da célula MORA, e não a da instalação.

    A tarefa de migração escreve o parâmetro na conta E na região onde o banco
    está. Desde que a não-produção mudou de região, ler sempre TG_REGIAO faz o
    portão passar uma célula de Virgínia com a evidência velha de São Paulo, e
    reprovar hml no dia em que São Paulo for destruído. Medido em 2026-09-05:
    dev passou com o parâmetro de 27/08 de sa-east-1 enquanto o de us-east-1
    tinha acabado de nascer.
    """
    if ambiente in ("dev", "hml", "nprd"):
        return os.environ.get("TG_REGIAO_NPRD") or os.environ.get("TG_REGIAO")
    return os.environ.get("TG_REGIAO")


def aws_json(args, creds=None, regiao=None):
    amb = dict(os.environ)
    # A região vem da instalação (TG_REGIAO), nunca do default do CLI da
    # máquina: com o default apontando outra região, o get-parameter lê um SSM
    # onde o parâmetro nunca vai existir, e o portão diz "devendo" sobre uma
    # migração que rodou. Medido assim em 2026-08-26, com o CLI em us-east-1 e
    # a instalação em sa-east-1.
    if regiao or amb.get("TG_REGIAO"):
        amb["AWS_DEFAULT_REGION"] = regiao or amb["TG_REGIAO"]
    if creds:
        amb["AWS_ACCESS_KEY_ID"], amb["AWS_SECRET_ACCESS_KEY"], amb["AWS_SESSION_TOKEN"] = creds
    r = subprocess.run(["aws"] + args + ["--output", "json"],
                       capture_output=True, text=True, env=amb)
    if r.returncode != 0:
        return None
    try:
        return json.loads(r.stdout or "null")
    except ValueError:
        return None


def credencial_da_conta(conta, papel):
    """A entrada na conta do ambiente. Sem ela o portão não decide, e dizer
    'passou' sem ter olhado é o pior resultado possível."""
    d = aws_json(["sts", "assume-role", "--role-session-name", "gate-migracao",
                  "--role-arn", "arn:aws:iam::%s:role/%s" % (conta, papel)])
    if not d:
        return None
    c = d["Credentials"]
    return (c["AccessKeyId"], c["SecretAccessKey"], c["SessionToken"])


def contrato_da_celula(hcl):
    """O contrato da receita que a célula usa, pelo mesmo caminho que o gate de
    durabilidade resolve: o `source` aponta o catálogo, e o catálogo tem a
    ficha."""
    texto = io.open(hcl, encoding="utf-8").read()
    m = re.search(r"catalogo/{1,2}([a-z0-9/_-]+)", texto)
    if not m:
        return None, None
    rel = m.group(1)
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(hcl)))
    while raiz != "/" and not os.path.isdir(os.path.join(raiz, "catalogo")):
        raiz = os.path.dirname(raiz)
    caminho = os.path.join(raiz, "catalogo", rel, "contrato.json")
    if not os.path.isfile(caminho):
        return None, None
    try:
        return json.load(io.open(caminho, encoding="utf-8")), caminho
    except ValueError:
        return None, None


def dominio_e_ambiente(rel):
    """`<dominio>/<ambiente>/aplicacao/<celula>` -> (dominio, ambiente)."""
    partes = rel.split(os.sep)
    return (partes[0], partes[1]) if len(partes) >= 2 else (None, None)


def celulas_com_exigencia(live, escopo):
    fora = []
    raiz = os.path.join(live, escopo) if escopo else live
    for base, dirs, arqs in os.walk(raiz):
        dirs[:] = [d for d in dirs if d not in (".terragrunt-cache", ".terraform", "catalogo")]
        if "terragrunt.hcl" not in arqs:
            continue
        hcl = os.path.join(base, "terragrunt.hcl")
        contrato, _ = contrato_da_celula(hcl)
        if not contrato:
            continue
        exige = contrato.get("exige_schema") or []
        if exige:
            fora.append((os.path.relpath(base, live), exige))
    return sorted(fora)


def ja_aplicada(rel, dominio, ambiente, creds, variavel_da_conta):
    """A célula tem estado no balde da conta? Quem já está no ar não é impedido
    de ser corrigido."""
    var = variavel_da_conta.get("%s-%s" % (dominio, ambiente))
    conta = os.environ.get(var) if var else None
    if not conta:
        return False
    balde = "tfstate-%s-%s-%s" % (dominio, ambiente, conta)
    d = aws_json(["s3api", "head-object", "--bucket", balde,
                  "--key", "%s/terraform.tfstate" % rel.replace(os.sep, "/")], creds)
    return d is not None


def main(argv):
    if len(argv) < 2:
        print(__doc__, file=sys.stderr)
        return 2
    live = os.path.abspath(argv[1])
    escopo = None
    if "--escopo" in argv:
        escopo = argv[argv.index("--escopo") + 1]
    if not os.path.isdir(live):
        print("caminho do live inexistente: %s" % live, file=sys.stderr)
        return 2

    alvos = celulas_com_exigencia(live, escopo)
    if not alvos:
        print("migração · nenhuma célula declara `exige_schema` neste escopo: "
              "sem insumo para decidir", file=sys.stderr)
        return 2

    # A conta de cada ambiente vem do mapa que a instância declara, e não de um
    # nome de variável montado aqui: a chave `<dominio>-<ambiente>` costuma ler
    # uma variável abreviada, e adivinhar o nome faz o portão dizer "sem
    # insumo" sobre uma conta que está declarada ao lado.
    variavel_da_conta = {}
    contas_hcl = os.path.join(live, "contas.hcl")
    if os.path.isfile(contas_hcl):
        for chave, var in re.findall(
                r'^\s*"?([a-z0-9-]+)"?\s*=\s*get_env\("(TG_CONTA_[A-Z0-9_]+)"',
                io.open(contas_hcl, encoding="utf-8").read(), re.M):
            variavel_da_conta[chave] = var

    papel = os.environ.get("TG_PAPEL_ESTEIRA", "esteira-apply")
    faltando, conferidas, sem_entrada, no_ar = [], 0, [], []
    for rel, exige in alvos:
        dominio, ambiente = dominio_e_ambiente(rel)
        var = variavel_da_conta.get("%s-%s" % (dominio, ambiente))
        conta = os.environ.get(var) if var else None
        if not conta:
            sem_entrada.append((rel, "conta do ambiente não declarada"))
            continue
        creds = credencial_da_conta(conta, papel)
        if creds is None:
            sem_entrada.append((rel, "sem entrada na conta %s" % conta))
            continue
        nome = "/%s/%s/migracao/schemas" % (dominio, ambiente)
        d = aws_json(["ssm", "get-parameter", "--name", nome], creds, regiao=regiao_do_ambiente(ambiente))
        aplicados = set()
        if d:
            aplicados = {s.strip() for s in (d.get("Parameter", {}).get("Value") or "").split(",") if s.strip()}
        conferidas += 1
        faltam = [s for s in exige if s not in aplicados]
        if faltam:
            # Célula que JÁ está no ar entra como aviso, não como reprova. O
            # portão existe para a função não nascer sem schema; depois que ela
            # nasceu, barrar o apply impede justamente quem vai consertar
            # (desligar o gatilho, ajustar variável), e o defeito fica de pé
            # por causa do portão. O dano já está feito: o que resta é deixar
            # arrumar, dizendo alto o que falta.
            if ja_aplicada(rel, dominio, ambiente, creds, variavel_da_conta):
                no_ar.append((rel, faltam, nome))
            else:
                faltando.append((rel, faltam, nome, sorted(aplicados) or ["(o parâmetro não existe)"]))

    if sem_entrada:
        for rel, razao in sem_entrada:
            print("sem insumo · %s: %s" % (rel, razao), file=sys.stderr)
        if not conferidas:
            return 2

    for rel, faltam, nome in no_ar:
        print("AVISO · %s está no ar sem o schema que espera (%s)."
              % (rel, ", ".join(faltam)))
        print("        A migração continua devendo, e %s dirá quando ela rodar."
              % nome)
        print("        O apply segue porque impedir agora é impedir o conserto.")

    if faltando:
        print("migração reprovou: %d célula(s) esperam schema que ninguém aplicou\n" % len(faltando))
        for rel, faltam, nome, aplicados in faltando:
            print("  %s" % rel)
            print("      espera: %s" % ", ".join(faltam))
            print("      %s diz: %s" % (nome, ", ".join(aplicados)))
        print("\nA migração roda ANTES do deploy, como tarefa efêmera na VPC do")
        print("ambiente, com a imagem por digest (15.2). Aplicar a célula agora")
        print("faz a função nascer e falhar na primeira escrita, com erro de")
        print("relação inexistente, que parece defeito da aplicação.")
        return 1

    # A linha de resumo é a ÚNICA que o orquestrador mostra quando o portão
    # passa, e por isso ela não pode dizer "todas com evidência" enquanto
    # alguma está no ar devendo: seria o portão declarando limpo o que ele
    # próprio acabou de avisar que está sujo.
    if no_ar:
        print("migração · %d com schema exigido: %d com evidência, %d NO AR "
              "devendo (%s)" % (conferidas, conferidas - len(no_ar), len(no_ar),
                                ", ".join(rel for rel, _, _ in no_ar)))
        return 0

    print("migração · %d célula(s) com schema exigido, todas com evidência da "
          "tarefa que o aplicou" % conferidas)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
