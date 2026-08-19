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


def literal(texto):
    """O literal HCL como valor, e não como o texto que o escreveu.

    O leitor guardava a linha crua e quem gerava a devolvia com `json.dumps`,
    que põe aspas em tudo. `role_backup_arn = null` voltava `= "null"`: a
    receita recebia a palavra em vez da ausência e criava a role errada. O
    mesmo valia para `["alert", "audit"]`, que voltava como uma string com
    JSON dentro, e para `true`, que voltava como texto.
    """
    t = texto.strip()
    if t == "null":
        return None
    if t in ("true", "false"):
        return t == "true"
    if re.fullmatch(r"-?\d+", t):
        return int(t)
    if re.fullmatch(r"-?\d+\.\d+", t):
        return float(t)
    if t.startswith(("[", "{")):
        try:
            import json
            return json.loads(t.replace("=", ":") if t.startswith("{") else t)
        except Exception:
            # HCL que JSON não lê (interpolação, chave sem aspas): o texto
            # inteiro é mais verdadeiro que meia estrutura.
            return t
    return t.strip('"')


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



# Os blocos que o framework modela. O que não está aqui é decisão de quem
# escreveu a célula, e o `.bio` o carrega inteiro: `locals` com o provider da
# região secundária não sai de parâmetro nenhum, e sem ele a célula gerada
# perdia o segundo provider sem dizer.
_MODELADOS = ("include", "terraform", "dependency", "inputs", "dependencies")


def partes_do_terragrunt(texto):
    """(prosa, blocos, notas) do que o gerador não deduz.

    `prosa` é o comentário de cabeçalho, que diz por que a célula existe e o
    que já deu errado nela. `blocos` são os blocos de topo que o framework não
    modela, com o texto que a pessoa escreveu. `notas` é o comentário de cada
    input, por chave.

    Nada disso se deduz do desenho: é o que a pessoa escreveu, e é por isso
    que ele mora no projeto.
    """
    texto = texto or ""
    linhas = texto.split("\n")
    prosa, i = [], 0
    while i < len(linhas) and (linhas[i].startswith("#") or not linhas[i].strip()):
        if linhas[i].startswith("#"):
            prosa.append(linhas[i])
        elif prosa:
            prosa.append("")
        i += 1
    while prosa and not prosa[-1].strip():
        prosa.pop()

    blocos, notas = [], {}
    # `inputs = {` tem sinal de igual e os demais não: um padrão só para os
    # dois, senão o bloco de inputs não era achado e nenhuma nota saía.
    abre = re.compile(r'^([a-z_]+)(\s+"[^"]*")*\s*=?\s*\{', re.M)
    for m in abre.finditer(texto):
        if m.group(1) in _MODELADOS:
            if m.group(1) != "inputs":
                continue
            corpo, _fim = _ate_fechar(texto, m.end() - 1)
            notas.update(_notas_do_bloco(corpo))
            continue
        corpo, fim = _ate_fechar(texto, m.end() - 1)
        # o comentário logo acima do bloco é parte dele
        antes = texto[:m.start()].rstrip("\n").split("\n")
        cab = []
        while antes and antes[-1].lstrip().startswith("#"):
            cab.insert(0, antes.pop())
        blocos.append("\n".join(cab + [texto[m.start():fim + 1]]))
    return "\n".join(prosa), blocos, notas


def dependencias_escritas(texto):
    """{rótulo: corpo} de cada `dependency`, como a célula o escreveu.

    O mock é decisão de quem desenhou: `arn:aws:kms:...:key/mock` diz a forma
    que o plano precisa ver, e um mock gerado por convenção de nome não a
    reproduz. O comentário ao lado diz por que a linha de comandos permitidos
    existe, que é a diferença entre o mock valer no plano e valer no apply.
    """
    fora = {}
    for m in re.finditer(r'^dependency\s+"([^"]*)"\s*\{', texto or "", re.M):
        corpo, _fim = _ate_fechar(texto, m.end() - 1)
        fora[m.group(1)] = corpo.strip("\n")
    return fora


def _ate_fechar(texto, i):
    """(corpo, índice do fecha) do bloco que abre na chave em `i`."""
    nivel = 0
    for j in range(i, len(texto)):
        if texto[j] == "{":
            nivel += 1
        elif texto[j] == "}":
            nivel -= 1
            if nivel == 0:
                return texto[i + 1:j], j
    return texto[i + 1:], len(texto) - 1


def _notas_do_bloco(corpo):
    """{chave: comentário} do que está escrito acima de cada linha do bloco."""
    fora, juntando, nivel = {}, [], 0
    linha = re.compile(r"^\s*([a-z_][a-z0-9_]*)\s*=")
    for bruta in corpo.split("\n"):
        crua = bruta.strip()
        if nivel == 0 and crua.startswith("#"):
            juntando.append(bruta.rstrip())
        elif nivel == 0:
            m = linha.match(bruta)
            if m and juntando:
                fora[m.group(1)] = "\n".join(juntando)
            if crua:
                juntando = []
        nivel += bruta.count("{") + bruta.count("[") - bruta.count("}") - bruta.count("]")
        nivel = max(nivel, 0)
    return fora


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

    Devolve (respostas, derivados, formulas, ordem): o primeiro é o que alguém
    escreveu à mão e a tela pode mostrar como respondido; o segundo é o nome
    das chaves que a árvore preenche sozinha, para a tela dizer que já estão
    resolvidas em vez de perguntar de novo; o terceiro é a expressão de cada
    uma delas.

    A expressão importa porque ela não se deduz de volta.
    `kms_primaria_arn = dependency.chave.outputs.key_arn` e
    `kms_replica_arn = dependency.chave.outputs.replica_arn` saem da mesma
    dependência, e nenhum casamento por nome escolhe entre `key_arn` e
    `replica_arn` sem adivinhar. Guardar o que a célula escreveu é o que faz o
    `.bio` devolver o arquivo, em vez de um parecido.
    """
    texto = sem_comentario(texto or "")
    i = texto.find("inputs")
    if i < 0:
        return {}, [], {}, []
    i = texto.find("{", i)
    if i < 0:
        return {}, [], {}, []
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
    respostas, derivados, formulas, ordem = {}, [], {}, []
    nivel, i = 0, 0
    linha = re.compile(r"^\s*([a-z_][a-z0-9_]*)\s*=\s*(.*)$")
    for bruta in corpo.split("\n"):
        if nivel == 0:
            m = linha.match(bruta)
            if m:
                chave, valor = m.group(1), m.group(2).strip()
                # a ordem em que a célula escreveu é dela: reordenar por
                # alfabeto ou pela receita devolvia outro arquivo
                if chave not in ordem:
                    ordem.append(chave)
                if _DERIVADO.search(valor):
                    derivados.append(chave)
                    if not valor.endswith(("{", "[", "(")):
                        formulas[chave] = valor
                elif valor and not valor.endswith(("{", "[", "(")):
                    respostas[chave] = literal(valor)
                elif valor.endswith(("{", "[")):
                    # bloco de várias linhas: a resposta existe e é grande
                    # demais para caber num campo de texto, mas dizer que
                    # está respondida é mais verdadeiro que perguntar de novo
                    respostas[chave] = "(declarado na célula)"
        nivel += bruta.count("{") + bruta.count("[") - bruta.count("}") - bruta.count("]")
        nivel = max(nivel, 0)
    return respostas, derivados, formulas, ordem
