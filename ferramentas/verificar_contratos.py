#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gate: a ficha de cada peça diz o que a peça faz.

Toda peça do catálogo tem duas descrições. Uma é o código, que a nuvem executa.
A outra é `contrato.json`, que a árvore lê para decidir o que liga em quê, e que
uma pessoa lê para decidir se usa aquela peça.

Quando as duas discordam, quem lê a ficha decide errado e não descobre por quê:
o plano não reclama, o apply passa, e o defeito aparece longe. Foi o que
aconteceu com uma ficha que prometia banco relacional numa peça que criava
tabela de chave e valor — quem a leu foi procurar um endereço de conexão que
nunca existiu.

Este portão confere as duas colunas que a árvore usa para ligar peça em peça:

  publica   o que a ficha promete entregar existe como `output`?
  recebe    o que a ficha diz aceitar existe como `variable`?

Não confere `cria` nem `nao_cria`: essas são prosa sobre intenção, e prosa não
se verifica contando declaração. O que se verifica é o contrato de encaixe.
"""
import json
import os
import re
import sys

POSICAO_DA_ARVORE = 1


def declaracoes(caminho, palavra):
    if not os.path.exists(caminho):
        return set()
    return set(re.findall(rf'{palavra} "([a-z0-9_]+)"', open(caminho, encoding='utf-8').read()))


def identificador(texto):
    """O nome técnico dentro do que a ficha escreveu.

    O campo `recebe` foi escrito para ser lido por gente, e por isso carrega
    explicação junto do nome: `attachment_id (do dono da VPC)`. Comparar a
    frase inteira com o nome da variável acusaria divergência onde há só
    prosa. O que se compara é a primeira palavra, que é o nome.

    Frase sem nome técnico nenhum (`host e porta do destino`) devolve vazio e
    fica de fora: ela descreve o que a peça precisa, não como o argumento se
    chama, e cobrar nome de quem não prometeu nome é inventar defeito.
    """
    primeira = texto.strip().split()[0] if texto.strip() else ''
    return primeira if re.fullmatch(r'[a-z0-9_]+', primeira) else ''


def confere(peca):
    ficha = os.path.join(peca, 'contrato.json')
    if not os.path.exists(ficha):
        return []
    try:
        c = json.load(open(ficha, encoding='utf-8'))
    except json.JSONDecodeError as erro:
        return [(peca, 'FICHA-ILEGIVEL', str(erro))]

    achados = []
    saidas = declaracoes(os.path.join(peca, 'outputs.tf'), 'output')
    entradas = declaracoes(os.path.join(peca, 'variables.tf'), 'variable')

    promessas = {identificador(x) for x in c.get('publica', [])} - {''}
    for nome in sorted(promessas - saidas):
        achados.append((peca, 'PROMETE-E-NAO-ENTREGA', f'`{nome}` está em publica e não existe como output'))
    for nome in sorted(saidas - promessas):
        achados.append((peca, 'ENTREGA-E-NAO-DIZ', f'`{nome}` é output e não está em publica'))
    pedidos = {identificador(x) for x in c.get('recebe', [])} - {''}
    for nome in sorted(pedidos - entradas):
        achados.append((peca, 'PEDE-E-NAO-ACEITA', f'`{nome}` está em recebe e não existe como variable'))
    return achados


def main(raiz):
    catalogo = os.path.join(raiz, 'catalogo')
    if not os.path.isdir(catalogo):
        catalogo = os.path.join(raiz, 'infra', 'catalogo')
    if not os.path.isdir(catalogo):
        print('contratos: sem catálogo para conferir (informe a raiz do live)')
        return 0

    pecas, achados = [], []
    for familia in sorted(os.listdir(catalogo)):
        base = os.path.join(catalogo, familia)
        if not os.path.isdir(base):
            continue
        for nome in sorted(os.listdir(base)):
            peca = os.path.join(base, nome)
            if os.path.isdir(peca) and os.path.exists(os.path.join(peca, 'contrato.json')):
                pecas.append(peca)
                achados += confere(peca)

    if not pecas:
        print('contratos: sem catálogo para conferir (informe a raiz do live)')
        return 0

    if not achados:
        print(f'contratos · {len(pecas)} fichas conferidas contra o código')
        print('o que a ficha promete entregar existe, e o que ela diz aceitar também')
        return 0

    for peca, codigo, razao in achados:
        print(f'  {codigo} {peca.split("catalogo/")[-1]}')
        print(f'      {razao}')
    print()
    print(f'REPROVADO: {len(achados)} divergência(s) entre ficha e código em '
          f'{len({a[0] for a in achados})} peça(s).')
    print('A ficha é o que a árvore lê para ligar peça em peça, e o que uma')
    print('pessoa lê para escolher a peça. Ficha que discorda do código faz')
    print('quem a lê decidir errado sem descobrir por quê.')
    return 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else '.'))
