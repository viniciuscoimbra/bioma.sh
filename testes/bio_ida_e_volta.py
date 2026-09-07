#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""As duas rotas que sustentam a regra pétrea, exercitadas de verdade.

`/salvar` grava o projeto inteiro num `.bio`; `/abrir` devolve o projeto. Se
uma das duas mentir, a promessa do produto cai, e até 2026-09-06 nenhum portão
olhava para elas: `grep -rn 'salvar\\|/abrir' testes/` respondia vazio. A
revisão independente de 2026-09-06 nomeou a mutação que escapava de todos os
portões:

    if caminho == "/salvar":
        return self._json({})      # não grava nada, e responde JSON

`compila` passa, `constroi` passa, `unidade` não toca no servidor e
`prova-tela.py` não clica em salvar. O produto perdia o formato de projeto sem
uma luz vermelha.

O teste sobe o servidor de verdade numa porta livre, salva, lê o arquivo no
disco e reabre. O que ele cobra é o que a regra pétrea precisa: o desenho volta
inteiro, e volta com os campos que fazem o gerador escrever o MESMO arquivo
(`ordem`, `arranjo`, `formulas`, `prosa`, `dependencias`).

    python3 testes/bio_ida_e_volta.py

Saída: 0 as duas rotas cumprem · 1 alguma mente
"""
import io
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
SERVIDOR = os.path.join(RAIZ, "tela", "servidor.py")

# Um nó com tudo o que a ida e volta precisa devolver. Os quatro campos do fim
# são os que a sessão de 2026-08-19 acrescentou ao `.bio` para o arquivo gerado
# bater com o da instância; sem eles o `.bio` volta parecido, e parecido não
# regenera.
NO = {
    "id": "plataforma/rede/prd/vpc-plataforma",
    "servico": "organismos/rede/vpc-plataforma",
    "nome": "vpc-plataforma",
    "receita": "organismos/rede/vpc-plataforma",
    "trilho": "plataforma",
    "zona": "rede-prd",
    "x": 120, "y": 240,
    "valores": {"plano": "producao"},
    "derivados": ["ipam_pool_id", "tgw_id"],
    "formulas": {"ipam_pool_id": 'dependency.ipam.outputs.pool_ids["prd"]',
                 "tgw_id": "dependency.hub.outputs.tgw_id"},
    "ordem": ["conta_plataforma", "regiao", "plano", "ipam_pool_id", "tgw_id"],
    "arranjo": [{"item": "include"}, {"item": "terraform"},
                {"item": "dep:ipam"}, {"item": "dep:hub"}, {"item": "inputs"}],
    "prosa": "# célula: rede/prd/vpc-plataforma\n",
    "dependencias": {"ipam": '  config_path  = "../../org/ipam"\n'},
}
GRAFO = {"nos": [NO], "arestas": [{"de": "a", "para": "b", "rotulo": "ipam"}]}

# A receita própria da instância e o resultado dos linters viajam no `.bio`, e
# perdê-los é perda silenciosa: o projeto reabre parecendo íntegro e sem as
# peças que só ele tem. A terceira rodada da revisão de 2026-09-06 mostrou que
# apagar a persistência de `catalogo` atravessava este portão.
CATALOGO = {"organismos/core-banking/ledger-livro": {
    "main.tf": 'resource "aws_s3_bucket" "livro" {}\n',
    "variables.tf": 'variable "nome" { type = string }\n'}}
REVISAO = {"quando": "2026-09-06T00:00:00Z", "apontamentos": [
    {"celula": "plataforma/rede/prd/vpc-plataforma", "portao": "conformidade",
     "recado": "postura_default declarada"}]}


def porta_livre():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


def posta(porta, rota, corpo):
    req = urllib.request.Request("http://127.0.0.1:%d%s" % (porta, rota),
                                 data=json.dumps(corpo).encode("utf-8"),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def pega(porta, rota, **q):
    url = "http://127.0.0.1:%d%s?%s" % (porta, rota, urllib.parse.urlencode(q))
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def sobe(porta, pasta):
    # o recente do servidor vai para o temporário: a primeira versão deste
    # teste escrevia em tela/recentes.json e restaurava no fim, e restauração
    # no fim não acontece quando o teste é interrompido (revisão de 2026-09-06)
    env = dict(os.environ, PORTA=str(porta),
               BIOMA_RECENTES=os.path.join(pasta, "recentes.json"))
    p = subprocess.Popen([sys.executable, SERVIDOR], cwd=os.path.join(RAIZ, "tela"),
                         env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(80):
        try:
            urllib.request.urlopen("http://127.0.0.1:%d/recentes" % porta, timeout=1).read()
            return p
        except Exception:
            if p.poll() is not None:
                raise SystemExit("o servidor morreu ao subir")
            time.sleep(0.25)
    p.kill()
    raise SystemExit("o servidor não respondeu em 20s")


def confere(rotulo, condicao, detalhe=""):
    print("  %-46s %s" % (rotulo, "ok" if condicao else "REPROVADO"))
    if not condicao and detalhe:
        print("      %s" % detalhe)
    return 0 if condicao else 1


def main():
    porta = porta_livre()
    pasta = tempfile.mkdtemp(prefix="bio-ida-e-volta-")
    servidor = None
    falhas = 0
    try:
        servidor = sobe(porta, pasta)
        salvo = posta(porta, "/salvar", {"nome": "prova", "pasta": pasta,
                                        "grafo": GRAFO, "prefixo": "gf",
                                        "catalogo": CATALOGO, "revisao": REVISAO,
                                        "origem": {"tipo": "arvore", "pasta": "."}})
        arquivo = os.path.join(pasta, "prova.bio")

        # 1. a rota gravou ARQUIVO, e não só respondeu JSON. É esta linha que
        #    pega o `return self._json({})`.
        falhas += confere("/salvar grava o arquivo no disco",
                          os.path.isfile(arquivo), "resposta: %r" % salvo)
        if not os.path.isfile(arquivo):
            return 1

        disco = json.load(io.open(arquivo, encoding="utf-8"))
        # O GRAFO INTEIRO, e não só os nós: a revisão de 2026-09-06 mostrou a
        # mutação `"grafo": {"nos": ...}`, que joga fora TODAS as ligações e
        # passava nas quinze conferências da primeira versão deste teste.
        falhas += confere("o arquivo guarda o grafo inteiro, arestas incluídas",
                          disco.get("grafo") == GRAFO,
                          "veio %r" % (disco.get("grafo"),))
        falhas += confere("o prefixo volta", disco.get("prefixo") == "gf")

        # 2. o que volta é o que entrou
        volta = pega(porta, "/abrir", caminho=arquivo)
        nos = (volta.get("grafo") or {}).get("nos") or []
        falhas += confere("/abrir devolve o grafo inteiro", volta.get("grafo") == GRAFO,
                          "veio %r" % (volta.get("grafo"),))
        falhas += confere("/abrir devolve o nó", len(nos) == 1, "veio %d" % len(nos))
        if not nos:
            return 1
        devolvido = nos[0]

        # 3. os campos sem os quais o gerado sai PARECIDO, e parecido não regenera
        for campo in ("ordem", "arranjo", "formulas", "prosa", "dependencias",
                      "derivados", "valores", "receita", "id"):
            falhas += confere("o campo `%s` volta igual" % campo,
                              devolvido.get(campo) == NO[campo],
                              "esperava %r, veio %r" % (NO[campo], devolvido.get(campo)))

        # 4. posição é projeto: abrir tem que devolver o desenho onde ele estava
        falhas += confere("a posição volta (x, y)",
                          (devolvido.get("x"), devolvido.get("y")) == (NO["x"], NO["y"]))

        # 5. a origem viaja de volta INTEIRA, senão o projeto não sabe de onde
        #    veio nem como se executa
        falhas += confere("a origem volta inteira",
                          volta.get("origem") == {"tipo": "arvore", "pasta": "."},
                          "veio %r" % (volta.get("origem"),))

        # 6. o `.bio` é o PROJETO: sem estes campos ele é anotação parcial
        for campo in ("bioma", "nome", "config", "contas"):
            falhas += confere("o arquivo carrega `%s`" % campo, campo in disco,
                              "chaves: %r" % sorted(disco))
        falhas += confere("a receita própria da instância volta igual",
                          disco.get("catalogo") == CATALOGO,
                          "veio %r" % (disco.get("catalogo"),))
        falhas += confere("o resultado dos linters volta igual",
                          disco.get("revisao") == REVISAO,
                          "veio %r" % (disco.get("revisao"),))
        falhas += confere("o que volta é o que está no disco",
                          {k: v for k, v in volta.items() if k != "pendencias"} == disco,
                          "diferem em %r" % sorted(set(disco) ^ set(volta)))

        # 6. arquivo que não existe é erro nomeado, e não traceback
        erro = pega(porta, "/abrir", caminho=os.path.join(pasta, "nao-existe.bio"))
        falhas += confere("abrir o que não existe devolve erro escrito",
                          "erro" in erro, "veio %r" % erro)
    finally:
        if servidor is not None:
            servidor.kill()
            servidor.wait(timeout=10)
        shutil.rmtree(pasta, ignore_errors=True)

    print("bio ida e volta: %s" % ("ok" if falhas == 0 else "%d reprovação(ões)" % falhas))
    return 1 if falhas else 0


if __name__ == "__main__":
    sys.exit(main())
