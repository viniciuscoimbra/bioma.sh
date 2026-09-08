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
    """(prosa, blocos, notas, arranjo) do que o gerador não deduz.

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
    # UMA linha em branco no fim sobrevive, e o resto some. Ela é do autor:
    # `fundacao/02-ous` cola a prosa no primeiro bloco e
    # `fundacao/00-organizacao` deixa uma linha entre os dois. Descartando
    # todas, o gerador não tinha como distinguir os dois arquivos, e reescrevia
    # um deles (medido em 2026-09-07, na conferência da fundação).
    tinha_branco = bool(prosa) and not prosa[-1].strip()
    while prosa and not prosa[-1].strip():
        prosa.pop()
    if prosa and tinha_branco:
        prosa.append("")

    blocos, notas, arranjo = [], {}, []
    # `inputs = {` tem sinal de igual e os demais não: um padrão só para os
    # dois, senão o bloco de inputs não era achado e nenhuma nota saía.
    abre = re.compile(r'^([a-z_]+)(\s+"[^"]*")*\s*=?\s*\{', re.M)
    for m in abre.finditer(texto):
        # o comentário logo acima do bloco é parte dele, seja o bloco qual for
        # `colada` é se o comentário encosta no bloco que ele explica. Sem
        # isso o gerador punha uma linha em branco entre os dois sempre, e
        # quatro células da fundação saíam diferentes em BYTE passando no
        # limiar de 98% de linhas iguais (revisão independente, 2026-09-07).
        colada = not texto[:m.start()].endswith("\n\n")
        antes = texto[:m.start()].rstrip("\n").split("\n")
        cab = []
        while antes and antes[-1].lstrip().startswith("#"):
            cab.insert(0, antes.pop())
        cabeca = "\n".join(cab)
        if m.group(1) in _MODELADOS:
            corpo, _fim = _ate_fechar(texto, m.end() - 1)
            if m.group(1) == "inputs":
                notas.update(_notas_do_bloco(corpo))
                item = "inputs"
            elif m.group(1) == "dependency":
                rot = re.search(r'"([^"]*)"', m.group(0))
                item = "dep:" + (rot.group(1) if rot else "")
            else:
                item = m.group(1)
        else:
            corpo, fim = _ate_fechar(texto, m.end() - 1)
            item = "livre:%d" % len(blocos)
            blocos.append(texto[m.start():fim + 1])
        # A ordem em que a célula pôs os blocos é dela, e o comentário entre
        # dois deles também: numa célula da esteira, é entre `terraform` e a
        # dependência que mora a explicação de por que ali NÃO há dependency.
        # a cabeça do primeiro bloco é a prosa da célula, e já saiu por lá
        if not arranjo:
            cabeca = ""
        if cabeca:
            passo = {"item": item, "cabeca": cabeca}
            if colada:
                passo["colada"] = True
            arranjo.append(passo)
        else:
            arranjo.append({"item": item})
    return "\n".join(prosa), blocos, notas, arranjo


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


def _valor_multilinha(texto, chave):
    """O valor de `chave` no `inputs`, com as linhas que ele ocupa.

    O valor não começa necessariamente com chave ou colchete:
    `policy_apply_json = jsonencode({...})` abre com uma chamada, e um leitor
    que só procurasse `{` devolvia meia política.
    """
    m = re.search(r"^\s*%s\s*=[ \t]*(\S.*)$" % re.escape(chave), texto, re.M)
    if not m:
        return None
    i = m.start(1)
    # Heredoc: o valor vai de `<<-MARCA` até a linha que só tem MARCA. Ele não
    # fecha por contagem de parêntese, e o leitor devolvia None: o `buildspec`
    # do executor perdia o YAML inteiro, e com ele 324 linhas de comentário
    # (medido numa árvore de produção em 2026-09-07).
    h = re.match(r"<<-?\s*[\"\']?([A-Za-z_][A-Za-z0-9_]*)[\"\']?", texto[i:])
    if h:
        f = re.search(r"^[ \t]*%s[ \t]*$" % re.escape(h.group(1)), texto[i:], re.M)
        return texto[i:i + f.end()] if f else None
    nivel, dentro, j = 0, False, i
    while j < len(texto):
        c = texto[j]
        if c == '"' and texto[j - 1] != "\\":
            dentro = not dentro
        elif not dentro:
            if c in "{[(":
                nivel += 1
            elif c in "}])":
                nivel -= 1
                if nivel == 0:
                    return texto[i:j + 1]
                if nivel < 0:
                    return None
            elif c == "\n" and nivel == 0:
                return None
        j += 1
    return None


def _comentario_no_fim(linha):
    """O `# ...` no fim da linha, quando ele não está dentro de aspas."""
    dentro = False
    for i, c in enumerate(linha):
        if c == '"' and (i == 0 or linha[i - 1] != "\\"):
            dentro = not dentro
        elif c == "#" and not dentro:
            return linha[i:].rstrip()
    return ""


def _quebras_do_bloco(texto, ordem):
    """As chaves que o autor separou com linha em branco do grupo anterior."""
    m = re.search(r"^inputs\s*=?\s*\{", texto, re.M)
    if not m:
        return []
    corpo, _fim = _ate_fechar(texto, m.end() - 1)
    fora, vazio, nivel, primeira = [], False, 0, True
    linha = re.compile(r"^\s*([a-z_][a-z0-9_]*)\s*=")
    for bruta in corpo.split("\n"):
        if nivel == 0:
            crua = bruta.strip()
            if not crua:
                vazio = True
            elif not crua.startswith("#"):
                k = linha.match(bruta)
                if k:
                    # a primeira chave não tem grupo antes dela: a linha vazia
                    # ali é só o corpo do bloco começando
                    if vazio and not primeira and k.group(1) in ordem:
                        fora.append(k.group(1))
                    primeira = False
                vazio = False
        nivel += bruta.count("{") + bruta.count("[") - bruta.count("}") - bruta.count("]")
        nivel = max(nivel, 0)
    return fora


def _notas_do_bloco(corpo):
    """{chave: comentário} do que a pessoa escreveu junto de cada resposta.

    Duas coisas cabem aqui, e a chave as separa: `chave` é o comentário
    escrito ACIMA da linha, e `chave##` é o que veio no fim dela. O de fim de
    linha é onde mora a razão curta — "o collector roda com a aplicação" — e
    perdê-lo devolvia o valor sem o porquê.
    """
    fora, juntando, nivel = {}, [], 0
    linha = re.compile(r"^\s*([a-z_][a-z0-9_]*)\s*=")
    for bruta in corpo.split("\n"):
        crua = bruta.strip()
        if nivel == 0 and crua.startswith("#"):
            juntando.append(bruta.rstrip())
        elif nivel == 0:
            m = linha.match(bruta)
            if m:
                if juntando:
                    fora[m.group(1)] = "\n".join(juntando)
                fim = _comentario_no_fim(bruta)
                if fim:
                    fora[m.group(1) + "##"] = fim
            if crua:
                juntando = []
            elif juntando:
                # Linha em branco ENTRE dois parágrafos da mesma nota. Ela não
                # fecha a nota (a chave ainda não veio), e some se ninguém a
                # guardar: em `fundacao/07-identity-center` isso era um byte de
                # diferença num arquivo de 16 KB, invisível para um limiar de
                # semelhança de linha (revisão independente, 2026-09-07).
                juntando.append("")
    # O comentário que fecha o bloco não pertence a chave nenhuma, e some se
    # ninguém o guardar: no hub, é ele que explica por que o plano
    # compartilhado não tem entrada.
    if juntando:
        fora["__fim__"] = "\n".join(juntando)
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
# Uma lista de nomes de função decidia o que era expressão, e o que não estava
# nela virava texto entre aspas dentro do Terraform:
#
#     schema_avro = file("x.avsc")   virava   schema_avro = "file(\\"x.avsc\\")"
#
# `file` não estava na lista. Lista de nomes é adivinhação, e é o mesmo defeito
# que este repositório recusa em recurso da AWS. A régua trocou de lado:
# LITERAL é o que é literal, e todo o resto é expressão.
_LITERAL = re.compile(r"""^(?:
      "(?:[^"\\$]|\\.|\$(?!\{))*"     # texto entre aspas, sem interpolação
    | -?\d+(?:\.\d+)?                  # número
    | true | false | null                # booleano e nulo
    )$""", re.X)


def e_literal(valor):
    """O valor é dado, e não expressão? Só então ele volta entre aspas."""
    return bool(_LITERAL.match((valor or "").strip()))


# guardado porque `quedas_de_get_env` e o gerador ainda perguntam por ele
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
    bruto = texto or ""
    texto = sem_comentario(bruto)
    i = texto.find("inputs")
    if i < 0:
        return {}, [], {}, {"ordem": [], "quebras": []}
    i = texto.find("{", i)
    if i < 0:
        return {}, [], {}, {"ordem": [], "quebras": []}
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
    # A coluna do `=` é do autor, e não se deduz. `hclfmt` é idempotente e não
    # canônico: ele aceita um grupo alinhado mais largo do que ele mesmo
    # produziria, e só reescreve quando alguma linha está fora. Medido em
    # 2026-09-07 numa célula real: coluna 19 num grupo que pede 15, e o
    # formatador não muda nada; desalinhando uma linha, ele reescreve em 15.
    colunas = {}
    nivel, i = 0, 0
    linha = re.compile(r"^\s*([a-z_][a-z0-9_]*)(\s*)=\s*(.*)$")
    vazio = False
    for bruta in corpo.split("\n"):
        if nivel == 0:
            if not bruta.strip():
                vazio = True
            m = linha.match(bruta)
            if m:
                chave, valor = m.group(1), m.group(3).strip()
                colunas[chave] = len(chave) + len(m.group(2))
                # a ordem em que a célula escreveu é dela: reordenar por
                # alfabeto ou pela receita devolvia outro arquivo
                if chave not in ordem:
                    ordem.append(chave)
                # a linha em branco antes da chave é do autor, e o `hclfmt`
                # alinha por grupo contíguo: sem ela o bloco inteiro alinhava
                # junto, e nenhum arquivo casava com o que a instância mantém
                vazio = False
                if not valor:
                    pass
                elif e_literal(valor):
                    # Dado, e só dado: volta entre aspas, como veio.
                    respostas[chave] = literal(valor)
                elif _DERIVADO.search(valor) and not valor.endswith(("{", "[", "(")) \
                        and not valor.startswith("<<"):
                    # Expressão de uma linha que vem da árvore: a tela a mostra
                    # como ligação, e não como campo para digitar.
                    derivados.append(chave)
                    formulas[chave] = valor
                else:
                    # Todo o resto é expressão, e expressão volta CRUA. Vale
                    # para bloco (`{`, `[`), para parêntese (`concat(`, um
                    # ternário), para heredoc (`<<-YAML`) e para chamada de
                    # função que nenhuma lista conhecia (`file(...)`).
                    inteiro = _valor_multilinha(bruto, chave) or valor
                    formulas[chave] = inteiro
                    if _DERIVADO.search(inteiro):
                        derivados.append(chave)
                    if valor.endswith(("{", "[", "(")) or valor.startswith("<<"):
                        # A tela mostra que está respondido; o texto é o que
                        # volta ao arquivo. Sem isto o gerado escrevia a frase
                        # "(declarado na célula)" dentro do Terraform.
                        respostas[chave] = "(declarado na célula)"
        nivel += bruta.count("{") + bruta.count("[") - bruta.count("}") - bruta.count("]")
        nivel = max(nivel, 0)
    # As quebras saem do texto ORIGINAL: tirar o comentário deixa a linha
    # vazia no lugar dele, e o gerado ganhava uma linha em branco que a célula
    # não tem antes de cada resposta comentada.
    return respostas, derivados, formulas, {"ordem": ordem,
                                            "quebras": _quebras_do_bloco(bruto, ordem),
                                            "colunas": colunas}
