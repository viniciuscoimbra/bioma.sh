#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""A VPC default de cada conta: encontra e remove, região a região.

    python3 ferramentas/vpc_default.py --conferir          # só lista
    python3 ferramentas/vpc_default.py --remover

Toda conta AWS nasce com uma VPC default por região, com subnet pública em cada
zona e um internet gateway ligado. Ela não está em desenho nenhum: o endereço se
sobrepõe ao plano do IPAM, o gateway é saída para a internet que não passa pela
inspeção, e o security group default aceita todo tráfego de si mesmo. Enquanto
existir, é caminho que ninguém desenhou e ninguém vigia.

Remover é reversível: `aws ec2 create-default-vpc` devolve uma igual.

A conta é alcançada pela role que o Control Tower deixa em cada conta inscrita
(AWSControlTowerExecution). A conta de management não a tem, e é pulada com a
razão dita: ela não hospeda carga, e a VPC default dela se remove à mão.

Nunca remove VPC que tenha interface de rede: interface é sinal de que alguém
está usando, e o que este comando promete é remover o que ninguém usa.
"""
import io
import json
import os
import subprocess
import sys

REGIOES_PADRAO = "sa-east-1,us-east-1"


def aws(args, creds=None, saida_json=True):
    amb = dict(os.environ)
    if creds:
        amb["AWS_ACCESS_KEY_ID"], amb["AWS_SECRET_ACCESS_KEY"], amb["AWS_SESSION_TOKEN"] = creds
    r = subprocess.run(["aws"] + args + (["--output", "json"] if saida_json else []),
                       capture_output=True, text=True, env=amb)
    if r.returncode != 0:
        return None
    if not saida_json:
        return r.stdout.strip()
    try:
        return json.loads(r.stdout or "null")
    except ValueError:
        return None


def contas():
    d = aws(["organizations", "list-accounts", "--max-items", "300"])
    return [(a["Id"], a["Name"]) for a in (d or {}).get("Accounts", [])
            if a.get("Status") == "ACTIVE"]


def credencial(conta):
    d = aws(["sts", "assume-role", "--role-session-name", "vpc-default",
             "--role-arn", "arn:aws:iam::%s:role/AWSControlTowerExecution" % conta])
    if not d:
        return None
    c = d["Credentials"]
    return (c["AccessKeyId"], c["SecretAccessKey"], c["SessionToken"])


def default_da_regiao(creds, regiao):
    d = aws(["ec2", "describe-vpcs", "--region", regiao,
             "--filters", "Name=isDefault,Values=true"], creds)
    vpcs = (d or {}).get("Vpcs", [])
    return vpcs[0]["VpcId"] if vpcs else None


def em_uso(creds, regiao, vpc):
    d = aws(["ec2", "describe-network-interfaces", "--region", regiao,
             "--filters", "Name=vpc-id,Values=%s" % vpc], creds)
    return len((d or {}).get("NetworkInterfaces", []))


def remove(creds, regiao, vpc):
    """Apaga na ordem que a AWS exige: gateway, sub-redes, e a VPC por último."""
    d = aws(["ec2", "describe-internet-gateways", "--region", regiao,
             "--filters", "Name=attachment.vpc-id,Values=%s" % vpc], creds)
    for igw in (d or {}).get("InternetGateways", []):
        aws(["ec2", "detach-internet-gateway", "--region", regiao,
             "--internet-gateway-id", igw["InternetGatewayId"], "--vpc-id", vpc],
            creds, saida_json=False)
        aws(["ec2", "delete-internet-gateway", "--region", regiao,
             "--internet-gateway-id", igw["InternetGatewayId"]], creds, saida_json=False)

    d = aws(["ec2", "describe-subnets", "--region", regiao,
             "--filters", "Name=vpc-id,Values=%s" % vpc], creds)
    for sub in (d or {}).get("Subnets", []):
        aws(["ec2", "delete-subnet", "--region", regiao,
             "--subnet-id", sub["SubnetId"]], creds, saida_json=False)

    r = subprocess.run(["aws", "ec2", "delete-vpc", "--region", regiao, "--vpc-id", vpc],
                       capture_output=True, text=True,
                       env=dict(os.environ,
                                AWS_ACCESS_KEY_ID=creds[0],
                                AWS_SECRET_ACCESS_KEY=creds[1],
                                AWS_SESSION_TOKEN=creds[2]))
    return r.returncode == 0, (r.stderr or "").strip().splitlines()[-1:] or [""]


def main(argv):
    remover = "--remover" in argv
    if not remover and "--conferir" not in argv:
        print(__doc__, file=sys.stderr)
        return 2
    regioes = os.environ.get("TG_REGIOES_VPC_DEFAULT", REGIOES_PADRAO).split(",")

    lista = contas()
    if not lista:
        print("a Organization não devolveu conta nenhuma", file=sys.stderr)
        return 2

    achadas = removidas = puladas = sem_acesso = 0
    for conta, nome in sorted(lista, key=lambda x: x[1]):
        creds = credencial(conta)
        if not creds:
            sem_acesso += 1
            print("  %-22s sem AWSControlTowerExecution (a management não a tem)" % nome)
            continue
        for regiao in regioes:
            vpc = default_da_regiao(creds, regiao)
            if not vpc:
                continue
            achadas += 1
            usos = em_uso(creds, regiao, vpc)
            if usos:
                puladas += 1
                print("  %-22s %-12s %s em uso (%d interfaces): não removo" % (nome, regiao, vpc, usos))
                continue
            if not remover:
                print("  %-22s %-12s %s removeria" % (nome, regiao, vpc))
                continue
            ok, erro = remove(creds, regiao, vpc)
            if ok:
                removidas += 1
                print("  %-22s %-12s %s removida" % (nome, regiao, vpc))
            else:
                print("  %-22s %-12s %s FALHOU %s" % (nome, regiao, vpc, erro[0][:80]))

    print("\nvpc default · %d achada(s) · %d removida(s) · %d em uso · %d conta(s) sem acesso"
          % (achadas, removidas, puladas, sem_acesso))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
