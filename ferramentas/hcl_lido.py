#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Leitura de HCL que os portões compartilham.

Cada portão que lia HCL com uma expressão regular própria errava de um jeito
diferente, e todos do mesmo lado: deixando passar. Um comentário citando o nome
de um atributo bastava para o portão achar que o atributo estava lá; uma queda
com `${get_env(...)}` dentro parava no primeiro aspas e virava outra string.

Aqui a leitura é uma só, e ela erra para o lado de acusar.
"""
import re

_COMENTARIO = re.compile(r'(?m)(^|\s)(#|//).*$')


def sem_comentario(texto):
    """O texto sem comentário de linha, preservando o que está entre aspas.

    Portão que procura substring num arquivo inteiro confunde comentário com
    código, e a diferença entre "esta linha existe" e "alguém escreveu que ela
    deveria existir" é a diferença entre a trava funcionar e não funcionar.
    """
    fora, i, dentro_aspas = [], 0, False
    while i < len(texto):
        c = texto[i]
        if c == '"' and (i == 0 or texto[i - 1] != "\\"):
            dentro_aspas = not dentro_aspas
            fora.append(c); i += 1; continue
        if not dentro_aspas and (c == "#" or (c == "/" and texto[i:i + 2] == "//")):
            j = texto.find("\n", i)
            i = len(texto) if j < 0 else j
            continue
        fora.append(c); i += 1
    return "".join(fora)


def quedas_de_get_env(texto):
    """[(variável, queda)] de todo `get_env`, com a queda inteira.

    A queda pode conter `${...}` com aspas dentro (`"arn:...${get_env("X","y")}"`),
    e uma expressão regular ingênua para no primeiro aspas interno e devolve
    meia string. Aqui se conta a profundidade de `${}` para fechar onde é.
    """
    fora = []
    for m in re.finditer(r'get_env\(\s*"([A-Z][A-Z0-9_]*)"\s*(,)?', texto):
        var = m.group(1)
        if not m.group(2):
            fora.append((var, None))   # sem queda: o terragrunt já morre sozinho
            continue
        i = texto.find('"', m.end())
        if i < 0:
            continue
        j, prof = i + 1, 0
        while j < len(texto):
            if texto[j] == "\\":
                j += 2; continue
            if texto[j:j + 2] == "${":
                prof += 1; j += 2; continue
            if texto[j] == "}" and prof:
                prof -= 1; j += 1; continue
            if texto[j] == '"' and prof == 0:
                break
            j += 1
        fora.append((var, texto[i + 1:j]))
    return fora
