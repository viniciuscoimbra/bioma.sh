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


# Um valor de `inputs` que veio de outra célula ou do ambiente não é resposta
# de gente: `dependency.x.outputs.y` é fio da árvore, e `get_env(...)` é a
# pergunta feita noutro lugar. Guardar isso como resposta faria a tela mostrar
# preenchido o que ninguém decidiu ali.
_DERIVADO = re.compile(r"\b(dependency|local|var|get_env|values|try|merge|jsonencode)\s*[.(]")


def inputs_do_terragrunt(texto):
    """O bloco `inputs` de uma célula, com o que é resposta de gente.

    Devolve (respostas, derivados): o primeiro é o que alguém escreveu à mão e
    a tela pode mostrar como respondido; o segundo é o nome das chaves que a
    árvore preenche sozinha, para a tela dizer que já estão resolvidas em vez
    de perguntar de novo.
    """
    texto = sem_comentario(texto or "")
    i = texto.find("inputs")
    if i < 0:
        return {}, []
    i = texto.find("{", i)
    if i < 0:
        return {}, []
    nivel, fim = 0, len(texto)
    for j in range(i, len(texto)):
        if texto[j] == "{":
            nivel += 1
        elif texto[j] == "}":
            nivel -= 1
            if nivel == 0:
                fim = j
                break
    corpo = texto[i + 1:fim]

    # Só as chaves do PRIMEIRO nível. Um `camadas = { fila = {...} }` tem
    # chaves dentro dele que não são input nenhum, e colhê-las faria a tela
    # mostrar `prefixo_bits` como se fosse pergunta da célula.
    respostas, derivados = {}, []
    nivel, i = 0, 0
    linha = re.compile(r"^\s*([a-z_][a-z0-9_]*)\s*=\s*(.*)$")
    for bruta in corpo.split("\n"):
        if nivel == 0:
            m = linha.match(bruta)
            if m:
                chave, valor = m.group(1), m.group(2).strip()
                if _DERIVADO.search(valor):
                    derivados.append(chave)
                elif valor and not valor.endswith(("{", "[", "(")):
                    respostas[chave] = valor.strip('"')
                elif valor.endswith(("{", "[")):
                    # bloco de várias linhas: a resposta existe e é grande
                    # demais para caber num campo de texto, mas dizer que
                    # está respondida é mais verdadeiro que perguntar de novo
                    respostas[chave] = "(declarado na célula)"
        nivel += bruta.count("{") + bruta.count("[") - bruta.count("}") - bruta.count("]")
        nivel = max(nivel, 0)
    return respostas, derivados
