#!/usr/bin/env python3
"""Gate: nenhum valor ilustrativo entra num apply de conta real.

`PREENCHER` é o que a célula grita, e `verificar_preenchimento.py` já o pega. O
perigo é o que a célula sussurra: a queda de `get_env` escrita nela mesma
(`111111111111`, `r-ilustrativa`, `arn:...:key/ilustrativa`) resolve sozinha, o
plano sai bonito e o apply cria recurso com valor de exemplo na conta do
cliente. Nada reprova no caminho.

A trava é a ausência, não a string. Uma lista de strings proibidas envelhece a
cada valor novo. O que não envelhece: variável que `instancia.env` não põe no
ambiente cai no valor escrito na célula, e esse valor é decisão do template, não
da instância. Por isso o critério de reprovação é `get_env` cuja variável está
ausente do ambiente. Declarada vazia passa: vazio declarado é decisão da
instância, e tratá-lo como ausência travou célula certa duas vezes — a da VPN,
vazia de propósito no modo certificado, e a do cluster, cuja lista extra de
ARNs é legitimamente vazia. A forma do valor entra depois, só para nomear o
achado, e
existe porque "conta de exemplo" e "domínio reservado" dizem ao operador o
tamanho do estrago melhor do que "variável ausente".

O apply em `ensaio`, `sandbox` ou `producao` reprova em qualquer queda. O plano avisa: para
a queda que machuca, a conta, quem reprova é a AWS, célula por célula, porque
`contas.hcl` devolve `DECLARE_<VARIÁVEL>` e o S3 recusa o nome do balde. Uma
varredura daqui cobraria as 46 contas que só existem depois da fase 04 para
deixar planejar a fase 00, e planejar antes de aplicar é o caminho do RUNBOOK.

`local` passa: ali quem responde é o emulador, e os números inventados vêm
declarados de `infra/contas-ilustrativas.env`.

Uso: verificar_ilustrativo.py <perfil> <caminho-live> [--apply]
Saída: 0 ok ou aviso · 1 reprovado · 2 sem insumo para decidir
"""
import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hcl_lido import quedas_de_get_env, sem_comentario  # noqa: E402

# `producao` entra com o mesmo rigor de `sandbox`: a conta é do cliente e a
# queda escrita na célula é decisão do template, não da instituição. Ele estava
# de fora, e como o bioma.sh trata o código 2 deste portão como fatal, todo
# comando de produção morria aqui — antes do Terragrunt, com "sem insumo para
# decidir" no lugar do defeito real.
PERFIS = ("local", "ensaio", "sandbox", "producao")

# Variáveis que decidem COMO rodar, e não O QUE a instância é. A queda delas é
# resposta legítima, e acusá-las junto com número de conta de exemplo ensinava
# quem lê a ignorar o relatório inteiro.
MODO_DE_EXECUCAO = ("TG_ASSUMIR_PAPEL", "TG_MODO", "TG_TF_PATH", "BIOMA_TERRAFORM")

# Postas pelo próprio bioma.sh antes de chamar o terragrunt, nunca por
# instancia.env: cobrá-las do operador seria pedir o que ele não decide.
ENV_DO_ORQUESTRADOR = {"TG_MODO", "TG_NON_INTERACTIVE"}

GET_ENV_COM_QUEDA = re.compile(
    r'get_env\(\s*"([A-Z][A-Z0-9_]*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*\)')
GET_ENV_SEM_QUEDA = re.compile(
    r'get_env\(\s*"([A-Z][A-Z0-9_]*)"\s*\)')

# Marcadores que a árvore escreve quando declara um valor como ilustração. É
# convenção do repositório, não adivinhação: onde aparecem, o autor da célula
# está avisando que o valor não vale para aplicar.
MARCADOR = re.compile(
    r"(?:^|[^A-Za-z])(ilustrativ[ao]|ilustracao|exemplo|example|mock|fake|dummy|placeholder)"
    r"(?:[^A-Za-z]|$)")

# RFC 2606 e RFC 6761 reservam estes para documentação e teste, mais o
# `.exemplo` que a árvore usa na versão em português.
TLD_RESERVADO = {"exemplo", "example", "test", "invalid", "localhost", "example.com",
                 "example.org", "example.net"}


def conta_de_exemplo(valor):
    """Doze dígitos com pouca variação são conta de exemplo, não conta emitida.

    Conta AWS real é sorteada: doze dígitos aleatórios formam cerca de onze
    blocos de dígitos repetidos. As de exemplo são escritas à mão e formam
    poucos (`700000000001` tem três, `999999999999` tem um, `111122223333` tem
    três). Quatro blocos é o corte, e a chance de uma conta real cair abaixo
    dele é desprezível. A segunda regra cobre a sequência corrida
    (`123456789012`) que a documentação da AWS usa e que forma doze blocos.
    """
    if not re.fullmatch(r"\d{12}", valor):
        return False
    if len(re.findall(r"(.)\1*", valor)) <= 4:
        return True
    digitos = [int(c) for c in valor]
    return all((b - a) % 10 == 1 for a, b in zip(digitos, digitos[1:]))


def anfitriao(valor):
    """O host de uma URL, ou do que já for um host cru. Vazio quando não é nem um."""
    m = re.match(r"^[A-Za-z][A-Za-z0-9+.\-]*://([^/?#]+)", valor)
    host = m.group(1) if m else valor
    host = host.split("@")[-1].split(":")[0].rstrip(".").lower()
    if "." not in host or not re.fullmatch(r"[a-z0-9.\-]+", host):
        return ""
    return host


def dominio_reservado(valor):
    host = anfitriao(valor)
    if not host:
        return False
    partes = host.split(".")
    return partes[-1] in TLD_RESERVADO or ".".join(partes[-2:]) in TLD_RESERVADO


def forma(valor):
    """Nomeia o que o valor é. Serve à mensagem, não ao veredito."""
    if valor == "":
        return "queda vazia"
    if conta_de_exemplo(valor):
        return "conta de exemplo"
    if valor.startswith("arn:"):
        campos = valor.split(":", 5)
        if len(campos) >= 5 and conta_de_exemplo(campos[4]):
            return "ARN em conta de exemplo"
        if MARCADOR.search(campos[-1]):
            return "ARN com sufixo de ilustração"
        return "ARN escrito na célula"
    if dominio_reservado(valor):
        return "domínio reservado para documentação"
    if MARCADOR.search(valor):
        return "marcador de ilustração"
    return "queda não sobrescrita"


def variaveis_de_instancia(caminho_env):
    """As variáveis que instancia.env conhece, e se cada uma está descomentada.

    Serve para dizer ao operador o que fazer: descomentar a linha que já existe,
    ou acrescentar a variável que ninguém previu.
    """
    conhecidas = {}
    if not os.path.exists(caminho_env):
        return conhecidas
    for linha in io.open(caminho_env, encoding="utf-8"):
        m = re.match(r"^\s*(#\s*)?([A-Z][A-Z0-9_]*)\s*=", linha)
        if m:
            conhecidas[m.group(2)] = m.group(1) is None
    return conhecidas


def celulas_adiadas(raiz):
    """As que declaram `# adiada:` no próprio arquivo.

    Elas não rodam, e por isso a queda dentro delas não vai virar recurso
    nenhum. Cobrar valor de instância nelas barra o comando inteiro por uma
    célula que a árvore já sabe que não executa, e o efeito prático é o oposto
    do que este portão existe para fazer: quem precisa seguir apaga a
    declaração de adiada em vez de declarar o valor.
    """
    fora = set()
    for base, dirs, arqs in os.walk(raiz):
        dirs[:] = [d for d in dirs if d != ".terragrunt-cache"]
        if "terragrunt.hcl" not in arqs:
            continue
        try:
            texto = io.open(os.path.join(base, "terragrunt.hcl"), encoding="utf-8").read()
        except (IOError, UnicodeDecodeError):
            continue
        if re.search(r"^#\s*adiada:", texto, re.M):
            fora.add(os.path.abspath(base))
    return fora


def arquivos_do_live(raiz):
    """Todo .hcl do live, menos o das células adiadas. Célula e arquivo
    compartilhado entram juntos: uma queda em `contas.hcl` alcança a árvore
    inteira e é o pior caso, não uma exceção."""
    adiadas = celulas_adiadas(raiz)
    achados = []
    for base, dirs, arqs in os.walk(raiz):
        dirs[:] = [d for d in dirs if d != ".terragrunt-cache"]
        if os.path.abspath(base) in adiadas:
            continue
        for a in sorted(arqs):
            if a.endswith(".hcl"):
                achados.append(os.path.join(base, a))
    return sorted(achados)


def main():
    if len(sys.argv) < 3:
        print(__doc__, file=sys.stderr)
        sys.exit(2)
    perfil, raiz = sys.argv[1], sys.argv[2]
    apply_mode = "--apply" in sys.argv
    # O escopo limita QUEM é cobrado, e não o que se lê. Sem ele, aplicar uma
    # área era barrado por variável que só cai em outra, e a fundação ficava num
    # nó cego: as contas que a fase 04 CRIA eram cobradas para deixar a fase 04
    # rodar. Nenhuma ordem de execução satisfazia.
    # `--escopo` pode vir repetido: uma fase toca várias áreas, e antes só o
    # último valor valia. Com `--fase 1`, o verificador cobrava variável de
    # célula que só roda no passo 5.
    escopos = [os.path.normpath(sys.argv[i + 1])
               for i, a in enumerate(sys.argv) if a == "--escopo" and i + 1 < len(sys.argv)]
    if perfil not in PERFIS:
        print("perfil desconhecido: %s (esperado %s)" % (perfil, ", ".join(PERFIS)),
              file=sys.stderr)
        sys.exit(2)
    if not os.path.isdir(raiz):
        print("caminho do live inexistente: %s" % raiz, file=sys.stderr)
        sys.exit(2)

    arquivos = arquivos_do_live(raiz)
    if not arquivos:
        print("nenhum .hcl sob %s: sem insumo para decidir" % raiz, file=sys.stderr)
        sys.exit(2)

    conhecidas = variaveis_de_instancia(os.path.join(raiz, "instancia.env"))

    # A conta do operador é por variável (ele preenche uma linha de
    # instancia.env e apaga dezenas de quedas), e a evidência é por célula. O
    # relatório junta os dois: uma entrada por variável e queda, com as células
    # que caem nela.
    #
    # Por variável e queda, e não por variável: a mesma variável cai com quedas
    # diferentes em lugares diferentes, e agrupando só pelo nome a primeira
    # queda encontrada era colada em todos. `TG_PAPEL_ESTEIRA` cai em
    # `DECLARE_TG_PAPEL_ESTEIRA` na fundação e em `esteira-apply` no live: o
    # relatório acusava a célula que tem valor de estar sem valor, e quem lê a
    # saída marcava como travada uma célula que roda hoje.
    pendentes, celulas = {}, 0
    for caminho in arquivos:
        rel = os.path.relpath(caminho, raiz)
        if os.path.basename(caminho) == "terragrunt.hcl":
            celulas += 1
            rotulo = os.path.dirname(rel) or "."
        else:
            # queda em arquivo compartilhado alcança toda célula abaixo dele, e
            # é o pior caso, não uma exceção
            rotulo = rel + " (compartilhado)"
        txt = sem_comentario(io.open(caminho, encoding="utf-8").read())
        # Queda com `${get_env(...)}` dentro conta as duas: a de fora e a de
        # dentro. A leitura ingênua parava no primeiro aspas interno, e a
        # variável de dentro escapava da cobrança inteira.
        pares = quedas_de_get_env(txt)
        for var, queda in pares:
            if var in ENV_DO_ORQUESTRADOR or var in MODO_DE_EXECUCAO:
                continue
            # Presente no ambiente é declarada, mesmo vazia: quem escreveu
            # `TG_X=` no instancia.env decidiu o vazio (lista de exceções sem
            # entrada, recurso opcional recusado). Só a ausência reprova.
            if var in os.environ:
                continue
            valor = "(sem queda)" if queda is None else queda
            entrada = pendentes.setdefault(
                (var, valor),
                ("aborta o terragrunt", []) if queda is None
                else (forma(queda), []))
            if rotulo not in entrada[1]:
                entrada[1].append(rotulo)

    # O apply reprova em qualquer queda: ele cria recurso, e recurso com valor de
    # template é recurso errado na conta do cliente.
    #
    # O plano avisa e segue. Não por tolerância: porque para a queda que de fato
    # machuca, a conta, quem reprova é a própria AWS, célula por célula. Conta
    # não declarada devolve `DECLARE_<VARIÁVEL>` e o nome do balde vira
    # `tfstate-<trilho>-DECLARE_TG_CONTA_X`, que o S3 recusa com InvalidBucketName
    # e o nome da variável dentro da mensagem. Isso é mais preciso do que
    # qualquer varredura daqui, que olha a árvore toda e cobraria as 46 contas
    # que só nascem na fase 04 para deixar planejar a fase 00.
    def sob(caminho, escopo):
        """`caminho` é o próprio escopo ou está dentro dele.

        `startswith` puro casa prefixo de NOME, não de caminho: o escopo
        `ligacoes/associacao-tgw` casaria `associacao-tgw-faturamento-dev`, que
        é outra célula. A árvore tem 12 pares assim.
        """
        return caminho == escopo or caminho.startswith(escopo.rstrip("/") + os.sep)

    def no_escopo(entrada):
        """A variável cai em alguma CÉLULA da área que este comando aplica?

        Queda em arquivo compartilhado (`contas.hcl`) não conta, e não por
        tolerância: ela tem guarda melhor. O portão de procedência garante que a
        reserva de lá é incapaz de funcionar, então a nuvem recusa na célula
        exata, com o nome da variável no erro. Cobrar aqui, além de redundante,
        criava um nó cego: as contas que a fase de vending CRIA eram exigidas
        para deixar essa fase rodar.
        """
        if not escopos:
            return True
        return any(any(sob(os.path.normpath(r), e) for e in escopos)
                   for r in entrada[1] if "(compartilhado)" not in r)

    cobradas = {v: e for v, e in pendentes.items() if no_escopo(e)}
    reprova = apply_mode and perfil in ("ensaio", "sandbox", "producao") and bool(cobradas)
    print("valor ilustrativo · perfil %s · %s · %d células conferidas"
          % (perfil, "apply" if apply_mode else "plan", celulas))

    if not pendentes:
        print("nenhuma queda de get_env em uso: toda variável veio da instância")
        sys.exit(0)

    # O relatório mostra o que este comando cobra, e não a árvore inteira: listar
    # 59 variáveis para dizer que 2 faltam ensina quem lê a ignorar o relatório.
    mostrar = cobradas if escopos else pendentes
    alcance = sum(len(e[1]) for e in mostrar.values())
    variaveis = {var for var, _ in mostrar}
    # A mensagem descreve o escopo inteiro, e não o primeiro item: com dois, ela
    # dizia "no escopo fundacao/00-organizacao" enquanto cobrava variável de
    # plataforma/esteira. Acima de três, o escopo é uma fila de células e listar
    # todas empurraria o número, que é o que importa, para fora da tela.
    if not escopos:
        onde = ""
    elif len(escopos) <= 3:
        onde = " no escopo %s" % ", ".join(escopos)
    else:
        onde = " nas %d células deste passo (a primeira é %s)" % (len(escopos), escopos[0])
    print("%d variáveis sem valor da instância%s, caindo em %d arquivos do live"
          % (len(variaveis), onde, alcance))
    if escopos and len(pendentes) > len(mostrar):
        print("(%d outras caem fora deste escopo e não são cobradas aqui)"
              % (len({v for v, _ in pendentes} - variaveis)))
    if not mostrar:
        print("nada a cobrar neste escopo")
        sys.exit(0)
    for var, queda in sorted(mostrar):
        nome_forma, onde = mostrar[(var, queda)]
        if var not in conhecidas:
            acao = "acrescente a instancia.env"
        elif conhecidas[var]:
            acao = "está em instancia.env, mas não chegou ao ambiente"
        else:
            acao = "descomente em instancia.env"
        print("  %s = %s" % (var, queda))
        print("      %s · %s" % (nome_forma, acao))
        print("      cai em: %s%s"
              % (", ".join(onde[:5]),
                 " e mais %d" % (len(onde) - 5) if len(onde) > 5 else ""))

    if reprova:
        print("\nREPROVADO: o perfil %s fala com a AWS de verdade, e o apply" % perfil)
        print("criaria recurso com os valores acima, que são do template e não")
        print("desta instituição.")
        print("\nDeclare em infra/instancia.env.local, ou rode --perfil local, que")
        print("aplica no emulador e carrega infra/contas-ilustrativas.env.")
        sys.exit(1)
    if perfil == "local":
        print("\nperfil local: a queda vale, porque quem responde é o emulador.")
    else:
        print("\naviso: plano com queda. As que decidem a conta derrubam o próprio")
        print("comando (o S3 recusa `tfstate-...-DECLARE_TG_CONTA_X`); as demais")
        print("aparecem no plano com valor de template. O apply reprova em todas.")
    sys.exit(0)


if __name__ == "__main__":
    main()
