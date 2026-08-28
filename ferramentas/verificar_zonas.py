#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gate: endpoint central sem a associação do outro lado não alcança ninguém.

    python3 ferramentas/verificar_zonas.py <caminho-do-live> [--plano <plano>]

Acrescentar um serviço a `var.servicos` da célula `rede/<plano>/endpoints-centrais`
é METADE do ato, e o organismo diz isso em letra maiúscula no cabeçalho: ele cria
o endpoint, a zona privada e a AUTORIZAÇÃO para cada VPC consumidora, e a
associação em si mora do outro lado, em `ligacoes/resolucao-central`, aplicada na
conta de quem consome. Enquanto ela não roda, o nome do serviço resolve para o
endereço público na conta do domínio e a chamada morre por timeout de REDE, que
faz procurar em qualquer lugar menos no DNS.

Foi o que aconteceu em 2026-08-27. Três serviços entraram na lista de produção
(`elasticloadbalancing`, `acm`, `sqs`), a célula central aplicou, e as três zonas
nasceram com 2 VPCs associadas contra as 5 das zonas antigas: faltavam
`dados-prd`, `barramento-prd` e `mesa-credito-prd`. Nada acusou. O controle de
postura que perguntaria isso (`EC2.55` e os irmãos) é estruturalmente vermelho
nesta topologia, porque ele pergunta por endpoint DENTRO de cada VPC e o desenho
tem um endpoint central com zona associada; um controle sempre vermelho não avisa
quando a coisa realmente falta.

As três perguntas, e por que são três:

  declarada   `vpcs_consumidoras` da célula central conta N VPCs, e existem N
              células `ligacoes/resolucao-central` apontando para ela? Esta não
              precisa de credencial nenhuma, e pega a falha um degrau ANTES: quem
              acrescenta uma VPC à lista central e esquece de criar a ligação.

  associada   cada zona do plano tem tantas VPCs quanto a lista declara, mais a
              própria VPC de rede que a hospeda? É a pergunta que pega o caso de
              2026-08-27, e ela não se responde comparando zonas entre si: se
              NENHUMA ligação tiver aplicado, todas as zonas terão exatamente uma
              VPC e um teste por comparação passaria limpo.

  nascida     todo serviço declarado em `servicos` tem zona? Sem isso, a célula
              central que nunca aplicou passa pelas outras duas perguntas por não
              ter nada a conferir.

Sai 0 quando as três respondem sim; 1 quando falta; 2 quando não há insumo para
decidir (sem live, sem célula central, sem credencial na conta de rede). Zero
achados sobre zero zonas conferidas é a resposta que este portão nunca dá.
"""
import argparse
import io
import json
import os
import re
import subprocess
import sys

COMENTARIO_DA_ZONA = re.compile(r"resolucao central do endpoint de (.+)$")


def aws_json(args, creds=None):
    amb = dict(os.environ)
    # A região vem da instalação, nunca do default do CLI da máquina: com o
    # default em outra região o list-hosted-zones responde de um Route 53 que
    # não é este, e o portão decide sobre a conta errada. Mesma armadilha
    # documentada em verificar_migracao.py.
    if amb.get("TG_REGIAO"):
        amb["AWS_DEFAULT_REGION"] = amb["TG_REGIAO"]
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


def credencial_da_rede():
    """A entrada na conta que hospeda os endpoints. Sem ela o portão não decide,
    e dizer 'passou' sem ter olhado é o pior resultado possível."""
    conta = os.environ.get("TG_CONTA_NETWORK")
    papel = os.environ.get("TG_PAPEL_ESTEIRA", "esteira-plan")
    if not conta:
        return None
    d = aws_json(["sts", "assume-role", "--role-session-name", "gate-zonas",
                  "--role-arn", "arn:aws:iam::%s:role/%s" % (conta, papel)])
    if not d:
        return None
    c = d["Credentials"]
    return (c["AccessKeyId"], c["SecretAccessKey"], c["SessionToken"])


def celulas_centrais(live):
    """As células que instanciam `endpoints-centrais`, por plano.

    O plano é o penúltimo segmento do caminho (`rede/<plano>/endpoints-centrais`)
    e não um input, porque é ele que separa as duas árvores de zona que convivem
    na mesma conta com o mesmo nome de serviço.
    """
    achadas = {}
    for base, dirs, arqs in os.walk(live):
        dirs[:] = [d for d in dirs if d not in (".terragrunt-cache", ".terraform")]
        if "terragrunt.hcl" not in arqs or os.path.basename(base) != "endpoints-centrais":
            continue
        texto = io.open(os.path.join(base, "terragrunt.hcl"), encoding="utf-8").read()
        m = re.search(r"servicos\s*=\s*\[(.*?)\]", texto, re.S)
        servicos = re.findall(r'"([^"]+)"', m.group(1)) if m else []
        bloco = re.search(r"vpcs_consumidoras\s*=\s*\[(.*?)\]", texto, re.S)
        consumidoras = len(re.findall(r"dependency\.[\w-]+\.outputs\.vpc_id",
                                      bloco.group(1))) if bloco else 0
        plano = os.path.basename(os.path.dirname(base))
        achadas[plano] = {
            "caminho": os.path.relpath(base, live),
            "absoluto": os.path.abspath(base),
            "servicos": servicos,
            "consumidoras": consumidoras,
        }
    return achadas


def ligacoes_por_central(live, centrais):
    """Quantas células `resolucao-central` apontam para cada célula central.

    O `config_path` é resolvido como caminho, e não comparado como texto: as
    células chegam de profundidades diferentes da árvore, e a mesma central é
    escrita com um número diferente de `../` em cada uma.
    """
    contagem = {plano: [] for plano in centrais}
    por_absoluto = {d["absoluto"]: plano for plano, d in centrais.items()}
    for base, dirs, arqs in os.walk(live):
        dirs[:] = [d for d in dirs if d not in (".terragrunt-cache", ".terraform")]
        if "terragrunt.hcl" not in arqs or os.path.basename(base) != "resolucao-central":
            continue
        texto = io.open(os.path.join(base, "terragrunt.hcl"), encoding="utf-8").read()
        for alvo in re.findall(r'config_path\s*=\s*"([^"]+)"', texto):
            destino = os.path.abspath(os.path.join(base, alvo))
            if destino in por_absoluto:
                contagem[por_absoluto[destino]].append(os.path.relpath(base, live))
    return {plano: sorted(cs) for plano, cs in contagem.items()}


def zonas_da_conta(creds):
    """As zonas de resolução central, com as VPCs de cada uma.

    O serviço sai do comentário que o organismo escreve, e não do nome: o nome é
    o do serviço público (`api.ecr.<regiao>.amazonaws.com`) e é o MESMO nas duas
    zonas que convivem, uma por plano.
    """
    d = aws_json(["route53", "list-hosted-zones"], creds)
    if d is None:
        return None
    zonas = []
    for h in d.get("HostedZones", []):
        m = COMENTARIO_DA_ZONA.search((h.get("Config") or {}).get("Comment") or "")
        if not m:
            continue
        ident = h["Id"].split("/")[-1]
        detalhe = aws_json(["route53", "get-hosted-zone", "--id", ident], creds)
        if detalhe is None:
            return None
        zonas.append({
            "id": ident,
            "servico": m.group(1).strip(),
            "nome": h["Name"].rstrip("."),
            "vpcs": {v["VPCId"] for v in detalhe.get("VPCs", [])},
        })
    return zonas


def agrupar_por_plano(zonas, centrais):
    """Reparte as zonas entre os planos que convivem na conta.

    Duas zonas do mesmo plano compartilham pelo menos a VPC de rede que as
    hospeda, e zonas de planos diferentes não compartilham VPC nenhuma: uma VPC
    de domínio pertence a um ambiente só, e a célula central de um plano só
    autoriza as VPCs daquele plano. Então componente conexo por VPC em comum é
    exatamente um plano, inclusive quando uma zona está incompleta (a zona que
    perdeu associações ainda carrega a VPC de rede, que é a que ela nunca perde).

    Qual componente é qual plano se decide pelos SERVIÇOS: cada célula central
    declara a lista dela, e as listas diferem. Sem isso, a zona de um plano
    seria cobrada com o número de consumidoras do outro.
    """
    restantes, componentes = list(zonas), []
    while restantes:
        grupo, acumuladas = [restantes.pop(0)], None
        acumuladas = set(grupo[0]["vpcs"])
        mudou = True
        while mudou:
            mudou = False
            for z in list(restantes):
                if z["vpcs"] & acumuladas:
                    grupo.append(z)
                    acumuladas |= z["vpcs"]
                    restantes.remove(z)
                    mudou = True
        componentes.append(grupo)

    atribuido, usados = {}, set()
    for grupo in sorted(componentes, key=len, reverse=True):
        nomes = {z["servico"] for z in grupo}
        melhor, placar = None, -1
        for plano, d in centrais.items():
            if plano in usados:
                continue
            p = len(nomes & set(d["servicos"]))
            if p > placar:
                melhor, placar = plano, p
        if melhor is None or placar <= 0:
            atribuido.setdefault(None, []).extend(grupo)
            continue
        usados.add(melhor)
        atribuido[melhor] = grupo
    return atribuido


def main(argv):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("live", nargs="?", default=os.environ.get("TG_LIVE", ""))
    p.add_argument("--plano", default=None, help="confere só este plano")
    args = p.parse_args(argv)

    if not args.live or not os.path.isdir(args.live):
        print("zonas: sem árvore para conferir (informe o caminho do live)")
        return 2

    centrais = celulas_centrais(args.live)
    if args.plano:
        centrais = {k: v for k, v in centrais.items() if k == args.plano}
    if not centrais:
        print("zonas: nenhuma célula `endpoints-centrais` na árvore, "
              "sem insumo para decidir")
        return 2

    ligacoes = ligacoes_por_central(args.live, centrais)
    achados, avisos = [], []

    # ── declarada: a lista central e as células de ligação contam igual? ──
    for plano, d in sorted(centrais.items()):
        declaradas, ligadas = d["consumidoras"], ligacoes[plano]
        if declaradas != len(ligadas):
            achados.append(
                "%s · a célula central autoriza %d VPC(s) consumidora(s) e a árvore "
                "tem %d célula(s) `resolucao-central` apontando para ela. A "
                "autorização sem a ligação é endpoint que ninguém alcança pelo "
                "nome.\n      ligações encontradas: %s"
                % (d["caminho"], declaradas, len(ligadas),
                   ", ".join(ligadas) or "nenhuma"))

    creds = credencial_da_rede()
    if creds is None:
        if achados:
            print("zonas fora do contrato: %d achado(s) na declaração\n" % len(achados))
            for a in achados:
                print("  %s" % a)
            return 1
        print("zonas: a declaração fecha em %d plano(s), e a conta de rede não "
              "respondeu (sem TG_CONTA_NETWORK ou sem credencial): as associações "
              "reais não foram conferidas" % len(centrais))
        return 2

    zonas = zonas_da_conta(creds)
    if zonas is None:
        print("zonas: a conta de rede não respondeu ao Route 53, sem insumo para "
              "decidir sobre as associações")
        return 2

    por_plano = agrupar_por_plano(zonas, centrais)

    for plano, d in sorted(centrais.items()):
        grupo = por_plano.get(plano, [])
        vistos = {z["servico"] for z in grupo}

        # ── nascida: serviço declarado que não virou zona ──
        faltando = [s for s in d["servicos"] if s not in vistos]
        if faltando:
            achados.append(
                "%s · %d serviço(s) declarado(s) sem zona na conta de rede: %s. "
                "A célula central não aplicou, ou aplicou sem estes."
                % (d["caminho"], len(faltando), ", ".join(sorted(faltando))))

        # ── associada: a zona alcança todas as VPCs que a lista declara? ──
        # +1 é a VPC de rede: a zona nasce associada à VPC que a hospeda, e ela
        # não está em `vpcs_consumidoras` porque não é consumidora, é a dona.
        esperado = d["consumidoras"] + 1
        for z in sorted(grupo, key=lambda x: x["servico"]):
            if len(z["vpcs"]) < esperado:
                achados.append(
                    "%s · a zona de `%s` (%s) alcança %d VPC(s) e a árvore declara "
                    "%d. Faltam %d associação(ões): a célula `resolucao-central` de "
                    "quem consome não aplicou, e o nome resolve para o endereço "
                    "público lá."
                    % (d["caminho"], z["servico"], z["id"], len(z["vpcs"]),
                       esperado, esperado - len(z["vpcs"])))
            elif len(z["vpcs"]) > esperado:
                avisos.append(
                    "AVISO: %s · a zona de `%s` alcança %d VPC(s) e a árvore declara "
                    "%d. Associação a mais não quebra resolução, mas é VPC que "
                    "ninguém declarou aqui."
                    % (d["caminho"], z["servico"], len(z["vpcs"]), esperado))

    # A zona que não casa com plano nenhum só é notícia quando a árvore inteira
    # foi conferida: com `--plano`, as zonas do outro plano caem aqui por
    # construção, e chamá-las de resíduo seria o portão acusando o próprio filtro.
    if not args.plano:
        for z in sorted(por_plano.get(None, []), key=lambda x: x["servico"]):
            avisos.append(
                "AVISO: a zona de `%s` (%s) não casa com plano nenhum da árvore. "
                "Zona de resolução central sem célula que a declare é resíduo de "
                "plano apagado, ou plano que mora em outra árvore." % (z["servico"], z["id"]))

    conferidas = sum(len(g) for p, g in por_plano.items() if p)
    if not conferidas and not achados:
        print("zonas: nenhuma zona de resolução central na conta de rede, "
              "sem insumo para decidir")
        return 2

    for a in avisos:
        print("  %s" % a)
    if achados:
        print("\nzonas fora do contrato: %d achado(s)\n" % len(achados))
        for a in achados:
            print("  %s" % a)
        print("\nacrescentar serviço à célula central é metade do ato; a outra "
              "metade é `terragrunt apply` na `resolucao-central` de cada consumidora")
        return 1

    print("zonas · %d zona(s) de resolução central em %d plano(s): cada uma alcança "
          "as VPCs que a árvore declara" % (conferidas, len([p for p in por_plano if p])))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
