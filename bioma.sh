#!/usr/bin/env bash
# bioma.sh · o botão. Provisiona a estrutura inteira na ordem do DAG, por perfil, com
# journal e retomada.
#
# Produção entra pelo par `--perfil producao --ate prd`, e só por ele: nos
# outros perfis todo caminho prod/ continua fora da fila. A trava anterior era
# recusar produção sempre, o que sobrou de quando este live não tinha conta
# real. Ela impedia o caminho que uma instalação nova pode precisar, que é
# subir produção primeiro, dentro da quota de contas que a AWS liberou.
#
# Uso:
#   ./bioma.sh --perfil local|ensaio|sandbox|producao [--ate <ambiente>]
#                    [--plan] [--retomar] [--passo N] [--excluir-de arquivo]
#   ./bioma.sh --guia [--so-plano] [--desde N]
#
#   --guia     conduz a fundação passo a passo, e lê a AWS entre um e outro.
#   --so-plano percorre os passos sem nunca aplicar.
#   --desde    retoma o guia no passo N, em vez de recomeçar no primeiro.
#
#   --perfil   local: Floci em contêiner (testes/); ensaio: a
#              Organization de ensaio; sandbox: a conta do cliente com teto;
#              producao: a Organization do cliente, sem teto e sem rede de
#              proteção. Só ele aceita `--ate prd`.
#   --ate      até que ambiente esta corrida vai. Os nomes são os que
#              `convencoes.json` declara, em ordem de criticidade: o mais
#              crítico roda SOZINHO (produção não sobe de carona) e exige
#              `--perfil producao`; qualquer outro roda do primeiro até ele.
#              Sem o flag, o primeiro da lista.
#   --excluir-de  arquivo com um caminho de célula por linha (relativo a
#              infra/), que a fila pula. O recorte de quais contas existem é
#              desta instituição, e não do orquestrador: veja docs/fase1/.
#   --listar-fila  imprime as células que entrariam, domínio a domínio, e sai. Não
#              fala com a AWS, não roda pré-voo e não muda estado.
#   --plan     só planeja (e roda o gate de durabilidade nas células de dados).
#   --destruir destrói o que a ficha permite destruir. Permanente nunca cai.
#              Estável exige --com-janela, que é a declaração de que a janela
#              foi combinada. Efêmera cai por rotina.
#   --com-janela  autoriza destruir tecido estável nesta execução.
#   --retomar  pula o que o journal já registrou como ok.
#   --passo    roda um passo só (1 a 6). Os passos são o que se roda um a um,
#              olhando o resultado na AWS entre eles:
#              1 OUs e políticas · 2 contas · 3 fundação depois das contas ·
#              4 rede, conectividade e segurança · 5 plataforma · 6 workloads
#              `--fase` é o nome antigo e vale. Fase, no modelo, é o bloco da
#              arquitetura de referência: o que se entrega e quando.
#   --dominio  roda um domínio só, pelo caminho dentro de infra/ (o uso do dia
#              a dia: mexer num pedaço sem acordar o resto). Uma OU é um
#              domínio, domínios aninham, e o que vem depois do caminho do
#              domínio é a peça dentro dele. `--area` é o nome antigo e vale.
#
# Premissa de versão: Terragrunt >= 0.80 (run --all, --queue-exclude-dir) e
# Terraform >= 1.11 (lockfile nativo no S3).
set -euo pipefail

BC="$(cd "$(dirname "$0")" && pwd)"
INFRA="$BC/infra"

# Cache de plugin compartilhado. Sem isto, cada célula que roda `init` baixa uma
# cópia inteira do provider para dentro do próprio `.terragrunt-cache`: o binário
# da AWS tem 776 MB, e sessenta cópias dele viraram 46 GB do mesmo arquivo. Com o
# cache, o provider mora num lugar só e cada célula aponta para ele por link.
#
# Mora AQUI, antes de qualquer despacho, e não lá embaixo junto do pré-voo: o
# `--guia` e o `--instalar` respondem antes do perfil e saem com `exit`, então
# nunca alcançavam a linha e rodavam terraform sem cache nenhum. Quem conduziu a
# fundação pelo guia encheu o disco sem tocar em nada errado.
export TF_PLUGIN_CACHE_DIR="${TF_PLUGIN_CACHE_DIR:-$HOME/.terraform.d/plugin-cache}"
mkdir -p "$TF_PLUGIN_CACHE_DIR"

# Os valores desta instância moram num arquivo só, e são carregados antes de
# tudo. O que estiver comentado lá continua caindo no valor ilustrativo escrito
# na célula, que serve para planejar e não para aplicar.
if [ -f "$INFRA/instancia.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$INFRA/instancia.env"
  set +a
fi
# O `.local` vem depois e vence. É nele que os valores reais moram, e ele não é
# versionado: número de conta e ARN do cliente dentro do repositório é
# vazamento que ninguém desfaz depois do primeiro clone.
if [ -f "$INFRA/instancia.env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$INFRA/instancia.env.local"
  set +a
fi

# O comando de instalar, no sistema de quem está lendo. "instale o terraform" não
# ajuda quem abriu o Git Bash no Windows para seguir um documento escrito no Mac,
# e `uname -s` ali devolve MINGW64_NT-..., que não casa com Darwin nem com Linux
# e caía no conselho vago. A tabela por pacote é a mesma de ferramentas/instalar.py.
# Uma lista declarada pela instância, uma por linha. O caminho da árvore NÃO
# cruza para dentro do Python: a ferramenta acha a própria raiz pelo `__file__`.
# Caminho que entra por argv o Git Bash converte antes de chamar um executável
# que não é dele; caminho colado dentro do fonte chega cru, e o Python nativo do
# Windows lê `/c/Users/...` relativo ao drive corrente.
declaracao() { # chave[.subchave]
  python3 "$BC/ferramentas/convencoes.py" "$1"
}

instalador() { # pacote
  case "$(uname -s)" in
    Darwin) echo "brew install $1" ;;
    Linux)  echo "instale $1 pelo gerenciador da sua distribuição" ;;
    MINGW*|MSYS*|CYGWIN*)
      case "$1" in
        python)     echo "winget install Python.Python.3.12" ;;
        jq)         echo "winget install jqlang.jq" ;;
        node)       echo "winget install OpenJS.NodeJS.LTS" ;;
        terraform)  echo "winget install HashiCorp.Terraform" ;;
        terragrunt) echo "winget install Gruntwork.Terragrunt" ;;
        awscli)     echo "winget install Amazon.AWSCLI" ;;
        docker)     echo "winget install Docker.DockerDesktop" ;;
        *)          echo "winget install $1 (ou baixe e deixe no PATH)" ;;
      esac ;;
    *)      echo "instale $1 e deixe no PATH" ;;
  esac
}

versao_ok() { # encontrada mínima
  python3 - "$1" "$2" <<'PY'
import re, sys
def partes(v):
    nums = [int(x) for x in re.findall(r"\d+", v)[:3]]
    return tuple(nums + [0] * (3 - len(nums)))
sys.exit(0 if partes(sys.argv[1]) >= partes(sys.argv[2]) else 1)
PY
}

diagnostico_ambiente() {
  local falhas=0 avisos=0
  echo "== diagnóstico do ambiente =="

  confere_bin() { # nome pacote obrigatório|opcional motivo
    local nome="$1" pacote="$2" tipo="$3" motivo="$4"
    if command -v "$nome" > /dev/null; then
      printf 'ok   %-12s %s\n' "$nome" "$(command -v "$nome")"
      return 0
    fi
    local rotulo="aviso"
    [ "$tipo" = "obrigatório" ] && rotulo="erro"
    printf '%-6s%-12s falta: %s\n' "$rotulo" "$nome" "$motivo"
    printf '     instale: %s\n' "$(instalador "$pacote")"
    if [ "$tipo" = "obrigatório" ]; then falhas=$((falhas + 1)); else avisos=$((avisos + 1)); fi
    return 0
  }

  confere_versao() { # nome mínima comando-de-versão
    local nome="$1" minima="$2" saida
    command -v "$nome" > /dev/null || return 0
    saida="$("$nome" --version 2>&1 | head -1 || true)"
    if command -v python3 > /dev/null && versao_ok "$saida" "$minima"; then
      printf 'ok   %-12s %s\n' "$nome" "$saida"
    else
      printf 'erro %-12s versão mínima: %s; encontrada: %s\n' "$nome" "$minima" "${saida:-indisponível}"
      falhas=$((falhas + 1))
    fi
  }

  confere_bin python3 python obrigatório "servidor, tradutor e gerador usam Python"
  confere_versao python3 3.9
  confere_bin jq jq obrigatório "o comando escreve e lê JSON"
  confere_bin node node opcional "necessário para construir a tela"
  confere_versao node 20
  confere_bin npm node opcional "necessário para instalar a tela"
  confere_bin terraform terraform opcional "necessário para validar e planejar"
  confere_versao terraform 1.11
  confere_bin terragrunt terragrunt opcional "necessário para planejar a árvore"
  confere_versao terragrunt 0.80
  confere_bin aws awscli opcional "necessário para plano local e plano em AWS"
  confere_bin docker docker opcional "necessário para o degrau local"
  if command -v docker > /dev/null; then
    if docker info > /dev/null 2>&1; then
      echo "ok   docker       daemon respondendo"
    else
      echo "aviso docker       comando existe, daemon não respondeu"
      avisos=$((avisos + 1))
    fi
  fi
  confere_bin opa opa obrigatório "o gate de durabilidade não roda sem ele, e o pré-voo para"

  if python3 -c "import playwright" > /dev/null 2>&1; then
    echo "ok   playwright   pacote Python instalado"
  else
    echo "aviso playwright   falta a prova de navegador"
    echo "     instale: python3 -m pip install playwright && python3 -m playwright install chromium"
    avisos=$((avisos + 1))
  fi

  # O que o `init` deixou para trás. Não é erro, é peso: aparece aqui para
  # alguém ver em 5 GB, e não em 46, que foi onde deu duas vezes.
  derivadas="$(python3 "$BC/ferramentas/limpar_cache.py" 2> /dev/null | head -1)"
  case "$derivadas" in
    *"está limpa"*) echo "ok   cache        infra/ sem pasta derivada" ;;
    *GB*)           echo "aviso cache       $derivadas"
                    echo "     apague: python3 ferramentas/limpar_cache.py --apagar"
                    avisos=$((avisos + 1)) ;;
    *)              [ -n "$derivadas" ] && echo "ok   cache        $derivadas" ;;
  esac

  if [ -f "$BC/ferramentas/esquema-aws.json" ]; then
    echo "ok   esquema      ferramentas/esquema-aws.json"
  else
    echo "aviso esquema      falta o esquema do provider"
    echo "     gere: ./ferramentas/baixar_esquema.sh"
    avisos=$((avisos + 1))
  fi

  if [ -n "${OPENAI_API_KEY:-}" ] || [ -f "$HOME/.bioma/openai.key" ]; then
    echo "ok   modelo       chave encontrada para leitura de imagem"
  else
    echo "aviso modelo       sem chave; leitura de imagem fica desligada"
    echo "     use: export OPENAI_API_KEY=..."
    avisos=$((avisos + 1))
  fi

  echo "== resultado: $falhas erro(s), $avisos aviso(s) =="
  [ "$falhas" = 0 ]
}

# As células que um passo vai rodar, uma por linha, relativas a infra/.
#
# Isto era uma lista de ÁREAS escrita à mão, e a cobrança do pré-voo saía maior
# que a fila: `plataforma/rede` como escopo arrasta `rede/nprd`, que o recorte
# tira. No passo 5 eram 26 variáveis cobradas para 15 que a fila toca.
#
# Agora a resposta vem da própria fila: o script se chama com `--listar-fila`,
# que percorre os mesmos passos, aplica os mesmos excludes e não fala com a AWS.
# Uma fonte só, e o desalinhamento deixa de ser possível.
celulas_do_passo() { # numero-do-passo
  local saida
  # O erro do filho sobe: com ele engolido, uma falha aqui virava escopo vazio,
  # e escopo vazio faz o pré-voo cobrar a árvore inteira — que é o sintoma que
  # este mesmo comando já teve uma vez, por outra causa.
  if ! saida=$("$0" --perfil "$PERFIL" --ate "$ATE" --passo "$1" --listar-fila \
                    ${EXCLUIR_DE:+--excluir-de "$EXCLUIR_DE"} 2>&1); then
    echo "não consegui montar a fila do passo $1 para escopar o pré-voo:" >&2
    echo "$saida" | tail -3 >&2
    exit 1
  fi
  printf '%s\n' "$saida" | sed -n 's/^   \([a-z].*\)$/\1/p'
}

# A ação padrão é a receita: o bioma escreve o comando que cria e atualiza, e
# quem opera roda no pipeline dele. Só o plano roda aqui, porque planejar não
# muda estado e é a prova mais barata de que a tradução está certa.

PERFIL="" ; ATE="" ; ACAO="apply" ; RETOMAR=0 ; SO_PASSO="" ; JANELA=0 ; SO_DOMINIO="" ; DIAGNOSTICO=0 ; CONFIGURAR=0 ; GUIA=0 ; SO_PLANO=0 ; INSTALAR=0 ; EXCLUIR_DE="" ; LISTAR=0 ; DESDE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --diagnostico) DIAGNOSTICO=1; shift ;;
    --instalar)    INSTALAR=1; shift ;;
    --configurar)  CONFIGURAR=1; shift ;;
    --guia)        GUIA=1; shift ;;
    --so-plano)    SO_PLANO=1; shift ;;
    # `--desde` no fim da linha, sem número, morria em `$2: unbound variable`,
    # que é erro do bash e não instrução a quem digitou.
    --desde)       if [ $# -lt 2 ]; then echo "--desde pede o número do passo"; exit 2; fi
                   DESDE="$2"; shift 2 ;;
    --perfil)  PERFIL="$2"; shift 2 ;;
    --ate)     ATE="$2"; shift 2 ;;
    --plan)    ACAO="plan"; shift ;;
    --destruir)   ACAO="destroy"; shift ;;
    --com-janela) JANELA=1; shift ;;
    --retomar) RETOMAR=1; shift ;;
    --passo)   SO_PASSO="$2"; shift 2 ;;
    # `--fase` foi o nome deste flag, e fase quer dizer outra coisa no modelo:
    # é o bloco da arquitetura de referência, o que se entrega e quando. O que
    # este flag recorta é PASSO de execução. Continua aceito para não quebrar
    # quem já o usa.
    --fase)    SO_PASSO="$2"
               echo "aviso: --fase virou --passo (fase é o bloco da referência); o antigo ainda vale"
               shift 2 ;;
    --dominio) SO_DOMINIO="$2"; shift 2 ;;
    # `--area` foi o nome deste flag até a árvore ganhar vocabulário. Uma OU é
    # um domínio, e "área" queria dizer diretório: misturava domínio, ambiente e
    # peça numa palavra só. Continua aceito para não quebrar quem já o usa.
    --area)    SO_DOMINIO="$2"
               echo "aviso: --area virou --dominio (uma OU é um domínio); o antigo ainda vale"
               shift 2 ;;
    --excluir-de) EXCLUIR_DE="$2"; shift 2 ;;
    --listar-fila) LISTAR=1; shift ;;
    *) echo "flag desconhecida: $1"; exit 2 ;;
  esac
done
# O diagnóstico responde antes de tudo e não exige perfil: quem ainda não tem o
# ambiente montado não sabe qual perfil escolher, e mandar escolher primeiro é
# pedir decisão a quem ainda não pode tomá-la.
if [ "$DIAGNOSTICO" = 1 ]; then
  diagnostico_ambiente
  exit $?
fi

# `--configurar` também responde antes do perfil: ele existe justamente para
# quem ainda não tem o que o perfil exige.
# A instalação responde antes de tudo: ela existe para quem ainda não tem nada.
if [ "$INSTALAR" = 1 ]; then
  python3 "$BC/ferramentas/instalar.py"
  exit $?
fi

# O guia conduz a fundação passo a passo e mostra o que nasceu na AWS. Ele também
# responde antes do perfil: quem está começando não escolheu perfil ainda.
if [ "$GUIA" = 1 ]; then
  set --
  if [ "$SO_PLANO" = 1 ]; then set -- "$@" --so-plano; fi
  if [ -n "$DESDE" ]; then set -- "$@" --desde "$DESDE"; fi
  python3 "$BC/ferramentas/guia.py" "$@"
  exit $?
fi

if [ "$CONFIGURAR" = 1 ]; then
  python3 "$BC/ferramentas/configurar.py" ${SO_DOMINIO:+--area "$SO_DOMINIO"}
  exit $?
fi

case "$PERFIL" in local|ensaio|sandbox|producao) ;; *) echo "obrigatório: --perfil local|ensaio|sandbox|producao"; exit 2 ;; esac
# Os ambientes são os que a instituição declara, e não uma lista escrita aqui.
# Sem o flag, o primeiro da lista: era `dev` por default, e o default de uma
# instalação é o ambiente MENOS crítico dela, tenha o nome que tiver.
[ -n "$ATE" ] || ATE=$(python3 "$BC/ferramentas/convencoes.py" ambientes_por_natureza.workload | head -1)
if ! python3 "$BC/ferramentas/convencoes.py" ambientes_por_natureza.workload | grep -qx "$ATE"; then
  echo "--ate aceita o que convencoes.json declara em ambientes_por_natureza.workload:"
  python3 "$BC/ferramentas/convencoes.py" ambientes_por_natureza.workload | tr '\n' ' '
  echo; exit 2
fi
# O par é a trava. `--ate prd` em perfil de ensaio apontaria a fila de produção
# para a Organization errada, e o `allowed_account_ids` só reprovaria célula a
# célula, depois do init de cada uma.
if [ "$ATE" = "prd" ] && [ "$PERFIL" != "producao" ]; then
  echo "--ate prd exige --perfil producao (veio --perfil $PERFIL)"; exit 2
fi
if [ "$PERFIL" = "producao" ] && [ "$ATE" != "prd" ]; then
  echo "--perfil producao roda só produção: use --ate prd"; exit 2
fi
if [ -n "$EXCLUIR_DE" ] && [ ! -f "$EXCLUIR_DE" ]; then
  echo "--excluir-de: arquivo não encontrado: $EXCLUIR_DE"; exit 2
fi

# A declaração de `# adiada:` na célula vale no APPLY, e não só no relatório.
# Sem isto ela era informativa: a célula continuava na fila, o terraform tentava
# criar o recurso e falhava com o valor de queda dentro (uma imagem chamada
# DECLARE_TG_IMAGEM_... chegou a ser passada ao Lambda). Quem lê o aviso no fim
# do comando já não podia fazer nada: o passo tinha caído no meio.
#
# `--excluir-de` explícito vence: quem passa a lista sabe o que está fazendo.
if [ -z "$EXCLUIR_DE" ]; then
  EXCLUIR_DE="$BC/execucao/adiadas.txt"
  mkdir -p "$BC/execucao"
  python3 "$BC/ferramentas/adiadas.py" excluir > "$EXCLUIR_DE" 2>/dev/null || EXCLUIR_DE=""
fi

JOURNAL="$BC/execucao/journal-$PERFIL.jsonl"
mkdir -p "$BC/execucao"

registra() { # passo caminho acao resultado
  # `--listar-fila` promete não mudar estado, e journal é estado. A guarda mora
  # aqui, e não em cada chamada, porque quem esquecer de guardar não erra.
  [ "$LISTAR" = 1 ] && return 0
  jq -cn --arg f "$1" --arg c "$2" --arg a "$3" --arg r "$4" \
    --arg t "$(date -u +%FT%TZ)" \
    '{momento:$t, passo:$f, caminho:$c, acao:$a, resultado:$r}' >> "$JOURNAL"
}

# O registro de "já rodou" vale enquanto o domínio não muda. Ele é por DOMÍNIO,
# e domínio é um caminho: acrescentar uma célula dentro dele não invalida o
# registro sozinho. Era assim que `--retomar` pulava o domínio inteiro e
# terminava com sucesso sem ter aplicado a célula nova.
#
# A comparação é com o arquivo mais recente do domínio. Mais novo que o registro
# quer dizer que alguém mexeu depois do apply, e o registro deixa de responder.
#
# Numa máquina recém-clonada todo arquivo é mais novo que qualquer registro, e
# `--retomar` roda a árvore inteira. Errar para o lado de rodar de novo é o lado
# certo (terragrunt é idempotente, e o custo é tempo), mas quem opera de duas
# máquinas vê retomadas longas sem entender por quê.
ja_feito() { # passo caminho
  [ "$RETOMAR" = 1 ] || return 1
  [ -f "$JOURNAL" ] || return 1
  # `.passo // .fase`: o campo se chamava `fase` até a palavra ganhar o
  # significado do modelo (bloco da referência). O journal já escrito continua
  # respondendo, e não se reescreve diário de bordo.
  local quando
  quando=$(jq -r --arg f "$1" --arg c "$2" \
    'select((.passo // .fase)==$f and .caminho==$c and .resultado=="ok") | .momento' \
    "$JOURNAL" 2> /dev/null | tail -1)
  [ -n "$quando" ] || return 1
  local mudou
  mudou=$(python3 - "$2" "$quando" <<'PY'
import os, sys, datetime
area, quando = sys.argv[1], sys.argv[2]
registro = datetime.datetime.strptime(quando, "%Y-%m-%dT%H:%M:%SZ").replace(
    tzinfo=datetime.timezone.utc).timestamp()
for base, dirs, arqs in os.walk(area):
    dirs[:] = [d for d in dirs if d != ".terragrunt-cache"]
    for a in arqs:
        if os.path.getmtime(os.path.join(base, a)) > registro:
            print(os.path.relpath(os.path.join(base, a), area))
            raise SystemExit(0)
PY
)
  if [ -n "$mudou" ]; then
    echo "  (journal) $2 rodou em $quando, e $mudou mudou depois: roda de novo"
    return 1
  fi
  return 0
}

# ── pré-voo ──────────────────────────────────────────────────────────────
# Qual papel este comando assume nas contas membro. Ele sai da POSIÇÃO na fila:
# cada passo de `contrato/fila.json` declara com qual papel executa, e o script
# o exporta antes de rodar as ações daquele passo.
#
#   conta-nova   OrganizationAccountAccessRole, que nasce junto com cada conta
#                (molécula `conta`) e é a única que existe até o passo 5
#   esteira      esteira-plan para planejar, esteira-apply para aplicar, criadas
#                pelo passo 5 em cada conta que tem célula de OIDC
#
# Antes, a escolha vinha de `esteira_pronta()`: uma busca no journal por
# qualquer apply de esteira que tivesse dado certo. Ordem derivada de rastro, e
# não de declaração: bastava UMA célula de esteira aplicar para todo comando
# seguinte assumir `esteira-apply`, inclusive nas contas onde a célula de OIDC
# não rodou e o papel não existe. A fila nua atravessa contas assim.
#
# A fundação não entra nesta conta: `infra/fundacao/root.hcl` não assume papel
# por default, porque SCP não incide sobre a management e papel de pipeline ali
# não teria guardrail acima. Declarar TG_PAPEL_ESTEIRA no ambiente sobrepõe a
# escolha, para o resgate em que o papel declarado não serve.
PAPEL_FIXO="${TG_PAPEL_ESTEIRA:-}"

papel_do_passo() { # numero-do-passo
  local declarado
  declarado=$(python3 "$BC/ferramentas/fila.py" papel "$1" 2>/dev/null) || declarado=""
  case "$declarado" in
    esteira)  [ "$ACAO" = "plan" ] && echo esteira-plan || echo esteira-apply ;;
    conta-nova|"") echo OrganizationAccountAccessRole ;;
    *) echo "$declarado" ;;
  esac
}

# Exporta o papel do passo, respeitando quem foi declarado no ambiente.
papel_deste_passo() { # numero-do-passo
  [ -z "$PAPEL_FIXO" ] || { export TG_PAPEL_ESTEIRA="$PAPEL_FIXO"; return 0; }
  export TG_PAPEL_ESTEIRA="$(papel_do_passo "$1")"
}

# Sem passo definido ainda, o pré-voo precisa de um papel para os verificadores
# que leem o live. O do primeiro passo serve: nenhum deles fala com conta membro.
papel_deste_passo 1

# TG_ASSUMIR_PAPEL não precisa existir no ambiente: sem ela, a fundação roda
# direto (o root dela cai em `nao`) e o live assume (o root dele cai em `sim`).
# Declarada como `nao`, ela derruba os passos 4 a 6: sem assumir, o provider
# fica na management e `allowed_account_ids` recusa a conta alvo.
if [ "${TG_ASSUMIR_PAPEL:-sim}" = "nao" ]; then
  echo "aviso: TG_ASSUMIR_PAPEL=nao desliga o assume também no live, e os passos 4 a 6"
  echo "       quebram na tranca de conta. Fora da fundação, remova a variável:"
  echo "       a role certa é escolhida sozinha (hoje: $TG_PAPEL_ESTEIRA)."
fi

echo "== pré-voo (perfil $PERFIL, até $ATE, ação $ACAO) =="
# Listar a fila não toca em AWS, em estado nem em binário de Terraform: ela lê
# caminho de diretório. Exigir o pré-voo inteiro aqui é impedir de conferir o
# recorte quem ainda não terminou de montar o ambiente, que é justamente quem
# mais precisa conferir.
if [ "$LISTAR" = 1 ]; then
  echo "   (--listar-fila: pré-voo pulado, nada é executado)"
else
# O primeiro portão é o que não é código. Quota de contas, endereços de e-mail
# com entrega provada, root da management no domínio da instituição: nenhum é
# Terraform, todos são condição de um passo, e a falta aparecia no meio do
# apply, com conta já criada e sem volta.
#
# Ele cobra até o passo desta corrida: `--passo 4` não precisa da declaração que
# só o 5 exige, e cobrar tudo sempre é o caminho para ninguém ler o relatório.
prereq_ate=""
if [ -n "${SO_PASSO:-}" ]; then
  prereq_ate="$SO_PASSO"
elif [ -n "${SO_DOMINIO:-}" ]; then
  prereq_ate=$(python3 "$BC/ferramentas/fila.py" passo-do "$SO_DOMINIO" --ate "$ATE" 2>/dev/null || echo "")
fi
flag_prereq=()
[ "$ACAO" = "apply" ] && flag_prereq+=(--apply)
[ -n "$prereq_ate" ] && flag_prereq+=(--passo "$prereq_ate")
if ! python3 "$BC/ferramentas/prerequisitos.py" conferir ${flag_prereq[@]+"${flag_prereq[@]}"}; then
  exit 1
fi

for b in terragrunt terraform python3 jq; do
  command -v "$b" > /dev/null || { echo "falta $b no PATH"; exit 1; }
done
if [ "$ACAO" = "plan" ]; then
  command -v opa > /dev/null || { echo "falta opa (gate de durabilidade); brew install opa"; exit 1; }
fi
if [ "$PERFIL" = "local" ]; then
  export TG_MODO=local
  # O emulador não tem Organization, então não existe conta real para ler. Os
  # números inventados moram num arquivo só, que diz no cabeçalho que são
  # inventados, e nenhum outro perfil o carrega.
  if [ -f "$INFRA/contas-ilustrativas.env" ]; then
    set -a
    # shellcheck disable=SC1091
    . "$INFRA/contas-ilustrativas.env"
    set +a
  fi
  command -v aws > /dev/null || { echo "falta aws cli (cria os buckets de state locais)"; exit 1; }
  # nenhuma credencial real alcança o modo local: sobrescreve o ambiente
  export AWS_ACCESS_KEY_ID=teste AWS_SECRET_ACCESS_KEY=teste
  export AWS_DEFAULT_REGION=sa-east-1
  unset AWS_PROFILE AWS_SESSION_TOKEN 2> /dev/null || true
  curl -sf http://localhost:4566/_floci/health > /dev/null \
    || { echo "Floci fora do ar; suba com: docker compose -f testes/docker-compose.yml up -d"; exit 1; }
  # Os baldes de state nascem aqui: o bootstrap do terragrunt exige STS real, e
  # o emulador não responde STS. Quais baldes é o `contas.hcl` que diz, pela
  # mesma regra do `root.hcl` (`tfstate-<apelido>-<conta>`). Já foi lista escrita
  # aqui, e ela envelheceu em silêncio.
  for b in $(python3 "$BC/ferramentas/baldes_de_estado.py" 2> /dev/null); do
    aws --endpoint-url http://localhost:4566 s3api create-bucket \
      --bucket "$b" --create-bucket-configuration LocationConstraint=sa-east-1 \
      > /dev/null 2>&1 || true
  done
  # locks órfãos de execuções interrompidas (regra do modo local, operador único)
  for b in $(aws --endpoint-url http://localhost:4566 s3api list-buckets --query "Buckets[].Name" --output text 2> /dev/null); do
    case "$b" in tfstate-*)
      aws --endpoint-url http://localhost:4566 s3api list-objects-v2 --bucket "$b" \
        --query "Contents[?ends_with(Key, '.tflock')].Key" --output text 2> /dev/null \
        | tr '\t' '\n' | while read -r k; do
            [ -n "$k" ] && [ "$k" != "None" ] && aws --endpoint-url http://localhost:4566 \
              s3api delete-object --bucket "$b" --key "$k" > /dev/null 2>&1 || true
          done ;;
    esac
  done
  # sementes de hormônio: o que organismos plan-apenas/fora publicariam. O
  # emulador não reduz ARN de parâmetro ao nome, então cada semente entra
  # três vezes: pelo nome (leitura na própria conta) e pelo ARN completo nas
  # contas que os mocks nomeiam (leitura entre contas, como a receita faz).
  # Quando o organismo aplica de verdade, o valor real substitui.
  semear() { # nome valor
    for n in "$1" \
      "arn:aws:ssm:${TG_REGIAO:-sa-east-1}:${TG_CONTA_REDE:-222222222222}:parameter$1" \
      "arn:aws:ssm:${TG_REGIAO:-sa-east-1}:${TG_CONTA_DADOS:-555555555555}:parameter$1"; do
      aws --endpoint-url http://localhost:4566 ssm put-parameter \
        --name "$n" --type String --value "$2" --tier Advanced --overwrite > /dev/null 2>&1 || true
    done
  }
  semear /fundacao/rede/tgw-id "tgw-0f00000000semente0"
  # quais domínios recebem semente é declaração da instância, não lista daqui:
  # a escrita à mão envelheceu duas vezes sem ninguém ver
  while IFS= read -r par; do
    [ -n "$par" ] && semear "/dominios/$par/attachment-id" "tgw-attach-0semente0000000000"
  done <<< "$(declaracao sementes_de_attachment)"
else
  export TG_MODO=aws
  command -v aws > /dev/null || { echo "falta aws cli"; exit 1; }
  aws sts get-caller-identity > /dev/null || { echo "credencial AWS ausente"; exit 1; }
  # Sem a conta declarada, o `root.hcl` cai no número de exemplo e o balde de
  # estado nasce como `tfstate-fundacao-111111111111` DENTRO da conta real, com
  # o único sintoma sendo "AWS account ID not allowed" logo depois. Já aconteceu
  # três vezes. Esta guarda vivia só no guia, e chamar o bioma.sh direto passava
  # por fora dela.
  if [ -z "${TG_CONTA_MANAGEMENT:-}" ]; then
    echo "TG_CONTA_MANAGEMENT não está declarada, e o balde de estado nasceria"
    echo "com o número de exemplo dentro da sua conta. Rode antes:"
    echo "    python3 ferramentas/instalar.py"
    exit 1
  fi
  # Quem é a credencial tem que ser quem o arquivo diz, ou o estado de uma conta
  # vai para o balde de outra.
  eu=$(aws sts get-caller-identity --query Account --output text 2> /dev/null)
  if [ -n "$eu" ] && [ "$eu" != "$TG_CONTA_MANAGEMENT" ]; then
    echo "a credencial é da conta $eu e TG_CONTA_MANAGEMENT diz $TG_CONTA_MANAGEMENT."
    echo "Corrija um dos dois antes de seguir."
    exit 1
  fi
  # Conta nova nasce fora da governança quando quem a cria é usuário do IAM: o
  # Control Tower, ao inscrevê-la, dá acesso no Identity Center a quem iniciou o
  # processo, e usuário do IAM não existe lá. O apply do Terraform diz
  # `Succeeded` e as contas ficam sem baseline. Aconteceu em 2026-08-14 com 41
  # contas de uma vez, e o conserto foi reinscrever OU por OU. Fora da criação
  # de conta o usuário do IAM continua servindo, e por isso a trava é só aqui.
  quem=$(aws sts get-caller-identity --query Arn --output text 2> /dev/null)
  case "$quem" in
    *":user/"*)
      cria_conta=0
      case "${SO_DOMINIO:-}" in *04-contas*) cria_conta=1 ;; esac
      [ "$ACAO" = "apply" ] && { [ "$SO_PASSO" = "2" ] || [ -z "$SO_PASSO$SO_DOMINIO" ]; } && cria_conta=1
      if [ "$cria_conta" = 1 ] && [ "$ACAO" = "apply" ]; then
        echo "a credencial é um usuário do IAM ($quem), e esta fila cria conta."
        echo "Conta criada assim nasce sem o baseline do Control Tower: ele dá"
        echo "acesso no Identity Center a quem iniciou, e usuário do IAM não"
        echo "existe lá. Entre pelo Identity Center e rode de novo:"
        echo "    aws sso login"
        echo "Se a conta já nasceu assim, o conserto é reinscrever a OU dela:"
        echo "    aws controltower reset-enabled-baseline --enabled-baseline-identifier <arn-da-OU>"
        exit 1
      fi ;;
  esac
fi
# Trocar de perfil troca o backend: o local grava no emulador e o resto grava no
# S3 da conta. O `.terraform` de cada célula guarda o backend da execução
# anterior, e o Terraform recusa a mudança com "Backend initialization
# required", numa mensagem que não diz que a causa foi trocar de perfil.
# Guardamos qual foi o último e limpamos quando ele muda.
MARCA="$BC/execucao/ultimo-perfil"
mkdir -p "$BC/execucao"
if [ "$(cat "$MARCA" 2> /dev/null)" != "$PERFIL" ]; then
  if [ -s "$MARCA" ]; then
    echo "perfil mudou de $(cat "$MARCA") para $PERFIL: limpando o backend anterior"
    find "$INFRA" -name ".terraform" -type d -prune -exec rm -rf {} + 2> /dev/null || true
  fi
  printf '%s' "$PERFIL" > "$MARCA"
fi

export TG_NON_INTERACTIVE=true

# Cada verificador sai 0 (passou), 1 (reprovou) ou 2 (sem insumo para decidir).
# Sem insumo NÃO é reprovação: cobertura confronta a árvore com as tabelas dos
# blocos de arquitetura, e quem recebe só a árvore não tem os blocos. Ler o
# código 2 como falha barrava o time do cliente na primeira execução, dizendo
# "reprovou" para uma conferência que nem chegou a acontecer.
confere() { # nome caminho-do-verificador motivo-da-reprova [argumento ...]
  # Os argumentos depois do terceiro vão para o verificador. Sem eles, um
  # verificador que precisa saber ONDE olhar cai no próprio default — e foi
  # exatamente assim que o portão de preenchimento passou a conferir zero
  # células: a chamada perdeu o "$INFRA" numa conversão para este helper, o
  # script caiu no default `live/`, que não existe neste repositório, e passou a
  # anunciar "tudo respondido" tendo lido nada.
  local nome="$1" script="$2" motivo="$3"; shift 3
  local saida rc
  saida=$(python3 "$script" "$@" 2>&1) && return 0
  rc=$?
  if [ "$rc" = 2 ]; then
    echo "pulado · $nome: $(echo "$saida" | tail -1)"
    return 0
  fi
  echo "$motivo"
  echo "$saida" | tail -8
  exit 1
}

# Este vem antes dos outros: ele confere quem confere. Os quatro defeitos mais
# caros desta árvore foram nas próprias ferramentas — HCL com `local` órfão,
# função de Bash usada antes de existir, verificador chamado sem o caminho da
# árvore, e portão devolvendo "passou" sobre zero células lidas. Nenhum dos nove
# olhava para cá.
confere ferramentas "$BC/ferramentas/verificar_ferramentas.py" \
  "verificador de ferramentas reprovou; conserte o script antes de rodar a árvore" \
  "$BC"

confere cobertura "$BC/ferramentas/verificar_cobertura.py" \
  "verificador de cobertura reprovou; corrija antes de provisionar"
confere durabilidade "$BC/ferramentas/verificar_durabilidade.py" \
  "verificador de durabilidade reprovou (classificação da célula contra a trava dos átomos)"
# Os mapas de donos e de ligações se regeram aqui, e não à mão. Mapa que
# depende de alguém lembrar de preencher está errado na primeira semana, e mapa
# errado sobre quem chamar às três da manhã é pior que mapa nenhum. Se a saída
# mudar, o `git diff` mostra: é a árvore que mudou.
python3 "$BC/ferramentas/gerar_mapas.py" > /dev/null || true

confere conformidade "$BC/ferramentas/verificar_conformidade.py" \
  "verificador de conformidade reprovou (valor que esta instituição declarou obrigatório foi trocado)"

confere mocks "$BC/ferramentas/verificar_mocks.py" \
  "mock que não acompanha a receita reprova validate e plan, apontando a célula em vez do mock"
confere caminhos "$BC/ferramentas/verificar_caminhos.py" \
  "dependência apontando para célula que não existe: o mock responde no plano e o apply quebra com detected no outputs"
confere cardinalidade "$BC/ferramentas/verificar_cardinalidade.py" \
  "verificador de cardinalidade reprovou (o contrato da ligação diverge do variables.tf)"
confere preenchimento "$BC/ferramentas/verificar_preenchimento.py" \
  "verificador de preenchimento reprovou; há célula com ficha por preencher" \
  "$INFRA"

# Acesso humano por conta: o gate lê a árvore e cobra que conta com carga tenha
# célula de acesso, ou declaração de por que não tem. Entra como AVISO, e não
# como trava, porque quem decide quem entra em qual conta é a instituição, e um
# gate que trava antes dessa decisão pararia todo apply para cobrar uma resposta
# que não é de quem está aplicando. Vira trava no dia em que a instância
# declarar a política: a declaração é a resposta, e a partir dela regressão é
# defeito. Sai no pré-voo de todo comando, para não virar dívida esquecida.
python3 "$BC/ferramentas/verificar_acessos.py" "$INFRA" \
  || echo "aviso: conta com carga sem acesso declarado (acima); isto ainda não bloqueia."

# Prosa é higiene de documentação e NÃO segura produção: decisão do dono,
# 2026-08-12. O achado sai como aviso no pré-voo, e o código de saída fica de
# fora do gate; quem quiser cobrá-lo, cobra em esteira de documentação.
python3 "$BC/ferramentas/verificar_prosa.py" "$BC" \
  || echo "aviso: prosa fora do contrato de estilo (acima); isto não bloqueia nada."

# A ficha por preencher grita PREENCHER e o verificador acima a pega. A queda de
# get_env escrita na célula não grita: resolve sozinha, o plano sai bonito e o
# apply cria recurso com valor de exemplo. Este verificador cobra que o valor
# venha da instância, e o relatório inteiro vai para a tela porque ele é a lista
# do que preencher. Em local e ensaio a queda é o caminho documentado
# (infra/instancia.md) e sai aviso; em sandbox a conta é do cliente, e o apply
# para. Destroy não passa o --apply: apagar com número de conta de exemplo não
# cria nada.
flag_ilustrativo=()
[ "$ACAO" = "apply" ] && flag_ilustrativo=(--apply)
set +e
# O escopo é o domínio do comando. Sem ele, os dois verificadores varrem a
# árvore inteira e cobram defeito de domínio que ninguém pediu para aplicar: a
# fundação
# ficava barrada por travessia de conta em plataforma, e por variável de domínio
# que só existe depois que a fundação roda. Ler continua sendo a árvore toda;
# só a cobrança é que respeita o escopo.
# O escopo diz o que ESTE comando aplica. Com `--area` é um caminho; com
# `--passo` são os domínios daquele passo, e sem nenhum dos dois é a árvore
# inteira. Sem o caso do meio, `--passo 1 --apply` era barrado por variável que
# só roda no passo 5, e nenhuma ordem de execução satisfazia.
escopo_flag=()
if [ -n "${SO_DOMINIO:-}" ]; then
  escopo_flag=(--escopo "$SO_DOMINIO")
elif [ -n "${SO_PASSO:-}" ]; then
  while IFS= read -r c; do
    [ -n "$c" ] && escopo_flag+=(--escopo "$c")
  done < <(celulas_do_passo "$SO_PASSO")
fi
python3 "$BC/ferramentas/verificar_ilustrativo.py" "$PERFIL" "$INFRA" \
  ${flag_ilustrativo[@]+"${flag_ilustrativo[@]}"} ${escopo_flag[@]+"${escopo_flag[@]}"}
rc_ilustrativo=$?
python3 "$BC/ferramentas/verificar_alcance.py" "$BC" \
  ${flag_ilustrativo[@]+"${flag_ilustrativo[@]}"} \
  ${SO_DOMINIO:+--escopo "$INFRA/$SO_DOMINIO"}
rc_alcance=$?
set -e
if [ "$rc_ilustrativo" = 2 ]; then
  echo "verificador de valor ilustrativo sem insumo para decidir"; exit 2
elif [ "$rc_ilustrativo" != 0 ]; then
  echo "valor ilustrativo barra qualquer comando contra a AWS; declare em infra/instancia.env.local"; exit 1
fi
if [ "$rc_alcance" = 1 ]; then
  echo "verificador de alcance reprovou: célula que usa chave de outra conta sem nada conceder o uso"
  exit 1
fi
# Procedência roda em TODO perfil, o local incluído: um valor de reserva capaz de
# passar por valor declarado é defeito da árvore, e não do ambiente onde ela roda.
if ! python3 "$BC/ferramentas/verificar_procedencia.py" "$BC"; then
  echo "verificador de procedência reprovou (há valor de reserva capaz de passar por valor declarado)"
  exit 1
fi
# Procedência examina a queda do get_env; parametrização examina o valor escrito
# direto, sem get_env nenhum, onde não há queda para examinar. Foi por aí que
# entraram a conta 555555555555 num ARN de tópico do MSK e a 444444444444 num
# endereço de ECR.
if ! python3 "$BC/ferramentas/verificar_parametrizacao.py" "$INFRA"; then
  echo "verificador de parametrização reprovou (há valor da instalação escrito na célula)"
  exit 1
fi

# A fila declarada e a árvore não divergem: toda área do roteiro existe, e toda
# célula da árvore cai em algum passo. O segundo é o que este portão procura:
# célula que nenhum passo alcança nunca é aplicada, e o comando termina dizendo
# que deu certo.
# Variável pendente que a árvore produziria, com a célula que falta. Não
# reprova: fazer o fio é trabalho, e o comando diz onde ele falta.
python3 "$BC/ferramentas/fio.py" || true

# Mock que alimenta `data` vira chamada à nuvem com valor inventado, no plano.
# Armado em 2026-08-15, depois de a correção entrar com plano lido: as seis
# células que ele acusava passaram a receber o valor pela dependência.
if ! python3 "$BC/ferramentas/verificar_mock.py" "$INFRA" "$INFRA/catalogo"; then
  echo "mock alcançando data source barra o comando; o valor entra pela dependência"
  exit 1
fi

if ! python3 "$BC/ferramentas/fila.py" conferir --ate "$ATE"; then
  echo "a fila declarada não cobre a árvore; corrija contrato/fila.json ou a árvore"
  exit 1
fi
fi # fim do pré-voo (pulado por --listar-fila)
echo "pré-voo ok"

# ── exclusões da fila ────────────────────────────────────────────────────
# prod nunca entra; homolog só com --ate homolog; o perfil pula o que a ficha
# manda (local: fora / plan-apenas no apply; ensaio: custo alto).
excludes_de() { # caminho-area
  local area="$1"
  # Quais células ficam fora deste `--ate`. O vocabulário de ambiente é da
  # instituição, e quem o lê é `recorte.py`: estava aqui, em `case` de shell,
  # com `dev`, `hml`, `prd` e `nprd` escritos dentro do orquestrador. Uma
  # instituição que chamasse o ambiente dela de outro nome montava a fila certa
  # e depois excluía as células erradas, sem erro na tela.
  python3 "$BC/ferramentas/recorte.py" "$area" --ate "$ATE"

  # Recorte declarado pela instituição: quais células ficam fora porque a conta
  # delas não existe nesta rodada. Uma linha por célula, relativa a infra/; o
  # que vier depois de dois espaços é comentário e não entra.
  if [ -n "$EXCLUIR_DE" ]; then
    while IFS= read -r linha; do
      case "$linha" in ''|'#'*) continue ;; esac
      local alvo="$INFRA/${linha%% *}"
      case "$alvo/" in "$area"/*) echo "$alvo" ;; esac
    done < "$EXCLUIR_DE"
  fi
  local flag_apply=""
  [ "$ACAO" = "apply" ] && flag_apply="--apply"
  python3 "$BC/ferramentas/excluir_por_perfil.py" "$PERFIL" "$area" $flag_apply \
    | while IFS=$'\t' read -r rel nome motivo; do
        [ "${SEM_JOURNAL:-0}" = 1 ] || registra "$FASE" "$area/$rel" pulo "$motivo"
        echo "$area/$rel"
      done
}

# ── quem pode cair ───────────────────────────────────────────────────────
# A regra do tecido, aplicada antes de qualquer destruição. Permanente não cai
# nunca por este caminho: corrigir é para a frente, e restaurar cópia é outro
# procedimento. Estável cai com janela declarada. Efêmera cai por rotina.
excludes_por_durabilidade() { # caminho-area
  python3 - "$1" "$JANELA" << 'FIM'
import io, json, os, re, sys
area, janela = sys.argv[1], sys.argv[2] == "1"
raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__ if "__file__" in dir() else area)))
bc = os.environ.get("BC")
for base, _d, arqs in os.walk(area):
    if "terragrunt.hcl" not in arqs or ".terragrunt-cache" in base:
        continue
    txt = io.open(os.path.join(base, "terragrunt.hcl"), encoding="utf-8").read()
    m = re.search(r'source\s*=\s*"[^"]*catalogo//?((?:organismos|ligacoes)/[a-z0-9\-/]+)"', txt)
    if not m:
        continue
    c = os.path.join(bc, "infra", "catalogo", m.group(1), "contrato.json")
    if not os.path.exists(c):
        continue
    dur = json.load(io.open(c, encoding="utf-8")).get("durabilidade")
    if dur == "permanente":
        print("%s\tpermanente: nao cai por rotina" % base)
    elif dur == "estavel" and not janela:
        print("%s\testavel: exige --com-janela" % base)
FIM
}

roda_dominio() { # caminho-area [célula-a-pular ...]
  # Os argumentos depois do primeiro saem desta chamada. Serve para a área que
  # roda inteiro num passo mas tem uma célula que já rodou em outro: a VPC de
  # `dados` e a de `barramento` entram no passo 4, porque as ligações de TGW
  # dependem delas, e o passo 5 roda o resto do domínio sem repeti-las.
  local area="$1"; shift
  local pular=("$@")
  # Área que não existe é erro, e não "nada a fazer". Enquanto isto devolvia 0,
  # um nome errado no roteiro dos passos pulava o domínio inteiro em silêncio: um
  # domínio deixava de ser aplicado e o comando terminava dizendo que deu certo.
  if [ ! -d "$area" ]; then
    registra "$FASE" "$area" "$ACAO" "inexistente"
    echo "domínio declarado no roteiro e ausente na árvore: $area"
    echo "corrija o nome, ou tire o domínio do roteiro."
    exit 1
  fi
  if ja_feito "$FASE" "$area"; then echo "  (journal) $area ok"; return 0; fi
  local ex_flags=()
  local excluidas=()
  while IFS= read -r d; do
    [ -n "$d" ] || continue
    ex_flags+=(--queue-exclude-dir "$d"); excluidas+=("$d")
  done < <(excludes_de "$area")
  local p
  for p in ${pular[@]+"${pular[@]}"}; do
    [ -d "$p" ] || continue
    ex_flags+=(--queue-exclude-dir "$p"); excluidas+=("$p")
  done

  # A fila conferida antes de existir: quais células deste caminho o terragrunt
  # receberia. Sem isso o recorte só se descobre no apply, célula por célula.
  if [ "$LISTAR" = 1 ]; then
    echo "-- ${area#"$INFRA"/}"
    local hcl d
    while IFS= read -r hcl; do
      d=$(dirname "$hcl")
      local fora=0 e
      for e in ${excluidas[@]+"${excluidas[@]}"}; do [ "$e" = "$d" ] && fora=1; done
      [ "$fora" = 1 ] || echo "   ${d#"$INFRA"/}"
    done < <(find "$area" -name terragrunt.hcl 2> /dev/null | grep -v ".terragrunt-cache" | sort)
    return 0
  fi
  if [ "$ACAO" = "destroy" ]; then
    while IFS=$'\t' read -r d motivo; do
      [ -n "$d" ] || continue
      registra "$FASE" "$d" recusa "$motivo"
      echo "  recusado: $(basename "$d") · $motivo"
      ex_flags+=(--queue-exclude-dir "$d")
    done < <(BC="$BC" excludes_por_durabilidade "$area")
  fi
  echo "-- $ACAO em $area"
  # bootstrap do backend só com AWS real (no local os buckets nascem no pré-voo)
  local bootstrap=""
  [ "$TG_MODO" = "aws" ] && bootstrap="--backend-bootstrap"
  # O cache de providers (TF_PLUGIN_CACHE_DIR, que é o que impede a árvore de
  # virar 21 GB) não é seguro em paralelo: duas unidades desempacotando o mesmo
  # provider ao mesmo tempo corrompem o pacote, e o erro que sai é
  # "Unrecognized remote plugin message", que não fala em cache nem em corrida.
  # O init sozinho, em fila de um, semeia o cache e o resto roda em paralelo.
  local log_init="$BC/execucao/init-$(echo "${area#$INFRA/}" | tr '/' '-').log"
  # `-reconfigure` porque o nome do balde muda quando a conta passa a ser
  # declarada, e o Terraform recusa a mudança de backend. O estado que vale mora
  # no S3; o que se descarta aqui é só o que a máquina lembrava do backend velho.
  # As dependências que moram FORA desta área não recebem o init abaixo, porque
  # ele percorre só o `--working-dir`. Quem roda a árvore inteira nunca vê isso:
  # a fila aquece uma célula depois da outra, na ordem. Quem roda um domínio só
  # — o uso do dia a dia — bate na primeira dependência de outra conta com
  # "Backend initialization required, Reason: Initial configuration of the
  # requested backend s3", que fala de backend e não diz qual célula faltou.
  #
  # A lista sai em ordem topológica, então aquecer uma nunca precisa da
  # seguinte. Falha aqui não é fatal: init não muda estado, e a ação seguinte
  # mostra o erro de verdade, com contexto.
  local externas
  externas=$(python3 "$BC/ferramentas/dependencias_externas.py" "${area#$INFRA/}" 2>/dev/null || true)
  if [ -n "$externas" ]; then
    echo "  aquecendo $(printf '%s\n' "$externas" | grep -c .) dependência(s) fora de ${area#$INFRA/}"
    while IFS= read -r dep; do
      [ -n "$dep" ] || continue
      terragrunt init --non-interactive $bootstrap \
        --working-dir "$INFRA/$dep" -- -reconfigure >> "$log_init" 2>&1 || true
    done <<< "$externas"
  fi

  if ! terragrunt run --all init --non-interactive --parallelism 1 $bootstrap \
    --working-dir "$area" ${ex_flags[@]+"${ex_flags[@]}"} -- -reconfigure > "$log_init" 2>&1; then
    # Não é fatal: a ação seguinte mostra o erro de verdade, com contexto. Mas
    # engolir isto em silêncio é o que faz o erro seguinte parecer sem causa.
    echo "  aviso: o init em fila falhou; o log está em $log_init"
    # A variável de conta sem valor chega aqui antes de qualquer outra coisa: o
    # nome do balde de estado sai com `DECLARE_...` e o S3 recusa com
    # InvalidBucketName, que fala de nome de balde e não de variável faltando.
    # O nome está no erro, e quem lê não tem por que saber de onde ele sai.
    local faltando
    faltando=$(grep -o 'DECLARE_TG_[A-Z_0-9]*' "$log_init" 2>/dev/null | sort -u | tr '\n' ' ' || true)
    if [ -n "$faltando" ]; then
      echo "  a causa é variável sem valor desta instalação: $faltando"
      echo "  Número de conta não se digita: ele sai da Organization."
      echo "      python3 ferramentas/contas_da_organizacao.py >> infra/instancia.env.local"
      echo "  O que não for conta sai de ./bioma.sh --instalar."
    fi
    # Assunção negada tem uma causa estrutural conhecida: o papel da esteira só
    # confia no OIDC da esteira, e máquina de gente não o assume. O resgate é o
    # papel de organização, documentado no seletor de papel acima.
    if grep -q "not authorized to perform: sts:AssumeRole" "$log_init" 2>/dev/null; then
      echo "  a causa é assunção negada: o papel $TG_PAPEL_ESTEIRA só confia no OIDC da esteira,"
      echo "  e credencial de máquina local não o assume. Para operar de laptop, declare em"
      echo "  infra/instancia.env.local:"
      echo "      TG_PAPEL_ESTEIRA=OrganizationAccountAccessRole"
      echo "  e rode de novo: o init com -reconfigure conserta os caches que ficaram para trás."
    fi
  fi

  # paralelismo limitado: cada unit sobe o provider AWS inteiro (memória)
  if terragrunt run --all "$ACAO" --non-interactive --parallelism 4 $bootstrap --working-dir "$area" ${ex_flags[@]+"${ex_flags[@]}"}; then
    registra "$FASE" "$area" "$ACAO" ok
  else
    registra "$FASE" "$area" "$ACAO" falhou
    echo "FALHOU em $area; corrija e retome com --retomar"; exit 1
  fi
}

gate_baseline() {
  # Listar a fila não fala com a AWS. Sem esta linha o gate chamava
  # `controltower list-enabled-baselines` só para desenhar a fila.
  [ "$LISTAR" = 1 ] && return 0
  if [ "$PERFIL" = "local" ] || [ "$ACAO" = "plan" ]; then
    registra "$FASE" gate-baseline gate "pulado ($PERFIL/$ACAO)"; return 0
  fi
  echo "-- gate: baselines do Control Tower"
  local token="" linha total=0 ok=0
  while :; do
    local args=(controltower list-enabled-baselines --include-children --output json)
    [ -n "$token" ] && args+=(--next-token "$token")
    linha=$(aws "${args[@]}")
    total=$((total + $(echo "$linha" | jq '.enabledBaselines | length')))
    ok=$((ok + $(echo "$linha" | jq '[.enabledBaselines[] | select(.statusSummary.status=="SUCCEEDED")] | length')))
    token=$(echo "$linha" | jq -r '.nextToken // empty'); [ -n "$token" ] || break
  done
  registra "$FASE" gate-baseline gate "baselines $ok/$total SUCCEEDED"
  [ "$total" -gt 0 ] && [ "$ok" = "$total" ] \
    || { echo "gate reprovou: $ok/$total baselines SUCCEEDED"; exit 1; }
}

gate_durabilidade() { # caminho-area (células */dados/*)
  [ "$LISTAR" = 1 ] && return 0
  [ "$ACAO" = "plan" ] || return 0

  # O gate roda nas células de dados de NÃO-produção. O filtro dizia `/prod/` e
  # `-prod/`, nomes que deixaram de existir quando o vocabulário virou
  # dev/hml/prd/nprd: sem casar, ele passou a submeter célula de produção a um
  # gate que não é dela.
  #
  # E o `find` daqui é próprio, então não conhece `--excluir-de`: uma célula fora
  # do recorte entrava no gate mesmo sem entrar na fila. `excludes_de` responde
  # por essa lista, e é a mesma que monta os `--queue-exclude-dir`.
  # `excludes_de` registra cada pulo no journal, e este gate a chamava de novo
  # depois de `roda_dominio` já ter registrado: o mesmo pulo saía duas vezes. Aqui
  # só a lista interessa, então o journal fica de fora.
  local falhas=0 hcl fora_do_recorte=""
  fora_do_recorte=$(SEM_JOURNAL=1 excludes_de "$1" | tr '\n' '|' | sed 's/|$//')

  while IFS= read -r hcl; do
    [ -n "$hcl" ] || continue
    if "$BC/politicas/checar_plano.sh" "$(dirname "$hcl")"; then
      registra "$FASE" "$(dirname "$hcl")" gate-durabilidade ok
    else
      registra "$FASE" "$(dirname "$hcl")" gate-durabilidade reprovado
      falhas=1
    fi
  done < <(find "$1" -path "*/dados/*" -name terragrunt.hcl 2> /dev/null \
    | grep -v ".terragrunt-cache" | grep -v -e "/prd/" -e "-prd/" \
    | { if [ -n "$fora_do_recorte" ]; then grep -vE "^(${fora_do_recorte})/"; else cat; fi; })

  [ "$falhas" = 0 ] || { echo "gate de durabilidade reprovou; veja o journal"; exit 1; }
}

passo_roda() { [ -z "$SO_PASSO" ] || [ "$SO_PASSO" = "$1" ]; }

# ── uma parte só ─────────────────────────────────────────────────────────
if [ -n "$SO_DOMINIO" ]; then
  # Aplicar uma área solta é aplicar um pedaço da fila, e o papel dela é o do
  # passo que a contém. Sem isto, `--area` era o único caminho sem posição
  # declarada, e herdava o papel que o pré-voo tinha exportado.
  passo_da_area=$(python3 "$BC/ferramentas/fila.py" passo-do "$SO_DOMINIO" --ate "$ATE" 2>/dev/null || echo "")
  if [ -n "$passo_da_area" ]; then
    FASE="$passo_da_area"
    papel_deste_passo "$passo_da_area"
    echo "== $ACAO em $SO_DOMINIO (passo $passo_da_area, papel $TG_PAPEL_ESTEIRA) =="
  else
    FASE="area"
    echo "== $ACAO em $SO_DOMINIO =="
  fi
  roda_dominio "$INFRA/$SO_DOMINIO"
  # O portão de durabilidade morava só na fila, e `--dominio` não passa pela
  # fila: um plan de célula de dados por este caminho saía sem a decisão do
  # OPA, que é exatamente o plano que alguém roda antes de mexer em dado.
  gate_durabilidade "$INFRA/$SO_DOMINIO"
  echo "== fim ($ACAO, perfil $PERFIL) · journal: $JOURNAL =="
  exit 0
fi

# A ordem mora em `contrato/fila.json` e este laço a percorre. Ela era uma
# sequência de blocos `if` com o caminho de cada área escrito dentro: funcionava
# e não se lia. Não dava para listar sem executar, nem conferir se o que rodou
# foi o que estava declarado, e um nome de domínio errado dentro de um `for`
# pulava a área inteira em silêncio, com o comando terminando em sucesso.
#
# Os passos são o que quem opera roda, olha e só então continua. O corte entre
# eles é a dependência, e não a preferência: cada um termina num estado que dá
# para conferir na AWS antes do próximo começar.
while IFS=$'\t' read -r numero titulo; do
  passo_roda "$numero" || continue
  FASE="$numero"
  papel_deste_passo "$numero"
  echo "== passo $numero · $titulo (papel $TG_PAPEL_ESTEIRA) =="
  while IFS=$'\t' read -r tipo alvo resto; do
    case "$tipo" in
      dominio)
        # O resto da linha são as células que saem desta chamada: domínio que
        # roda inteiro num passo mas tem célula que já rodou em outro.
        pulos=()
        for p in $resto; do pulos+=("$INFRA/$p"); done
        roda_dominio "$INFRA/$alvo" ${pulos[@]+"${pulos[@]}"}
        ;;
      gate)
        case "$alvo" in
          baseline)     gate_baseline ;;
          durabilidade) gate_durabilidade "$INFRA/$resto" ;;
          *) echo "portão desconhecido na fila: $alvo"; exit 1 ;;
        esac
        ;;
      nota) registra "$numero" "$alvo" nota "$resto" ;;
      "") ;;
      *) echo "ação desconhecida na fila: $tipo"; exit 1 ;;
    esac
  done < <(python3 "$BC/ferramentas/fila.py" acoes "$numero" --ate "$ATE")
done < <(python3 "$BC/ferramentas/fila.py" passos)

# O que ficou fora aparece no fim, com o que a segurava. Adiada que some do
# relatório vira adiada esquecida: a de backup passou três semanas assim,
# porque a razão morava num arquivo de exclusão que ninguém abre.
python3 "$BC/ferramentas/adiadas.py" listar || true

echo "== fim ($ACAO, perfil $PERFIL, até $ATE) · journal: $JOURNAL =="
