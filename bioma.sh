#!/usr/bin/env bash
# bioma.sh · o botão. Provisiona a estrutura inteira na ordem do DAG, por perfil, com
# journal e retomada. Produção fica FORA por construção: promoção é
# acionamento do dono da entrega, e nenhum caminho prod/ entra
# na fila deste script.
#
# Uso:
#   ./bioma.sh --perfil local|ensaio|sandbox [--ate dev|homolog]
#                    [--plan] [--retomar] [--fase N]
#
#   --perfil   local: Floci em contêiner (testes/); ensaio: a
#              Organization de ensaio; sandbox: a conta do cliente com teto.
#   --ate      dev (padrão) para no ambiente de desenvolvimento; homolog
#              inclui homologação. prod não é opção.
#   --plan     só planeja (e roda o gate de durabilidade nas células de dados).
#   --destruir destrói o que a ficha permite destruir. Permanente nunca cai.
#              Estável exige --com-janela, que é a declaração de que a janela
#              foi combinada. Efêmera cai por rotina.
#   --com-janela  autoriza destruir tecido estável nesta execução.
#   --retomar  pula o que o journal já registrou como ok.
#   --fase     roda uma fase só (2 a 6).
#   --area     roda uma parte só, pelo caminho dentro de infra/ (o uso do dia
#              a dia: mexer num pedaço sem acordar o resto).
#
# Premissa de versão: Terragrunt >= 0.80 (run --all, --queue-exclude-dir) e
# Terraform >= 1.11 (lockfile nativo no S3).
set -euo pipefail

BC="$(cd "$(dirname "$0")" && pwd)"
# a árvore que este comando opera. Padrão: infra/ deste repositório. A tela
# gera a árvore numa pasta própria e aponta BIOMA_INFRA para ela, porque o
# desenho de quem está montando ainda não mora em repositório nenhum.
INFRA="${BIOMA_INFRA:-$BC/infra}"

# Uma lista declarada pela instância, uma por linha. O caminho da árvore NÃO
# cruza para dentro do Python: a ferramenta acha a própria raiz pelo `__file__`.
# Caminho que entra por argv o Git Bash converte antes de chamar um executável
# que não é dele; caminho colado dentro do fonte chega cru, e o Python nativo do
# Windows lê `/c/Users/...` relativo ao drive corrente. Era assim que estas três
# leituras saíam vazias no Windows, sem erro, e a árvore anunciava "sem
# declaração" com a declaração escrita ao lado.
declaracao() { # chave[.subchave]
  python3 "$BC/ferramentas/convencoes.py" "$1"
}

# O comando de instalar, no sistema de quem está lendo. "instale o terraform" não
# ajuda quem abriu o Git Bash no Windows para seguir um documento escrito no Mac,
# e `uname -s` ali devolve MINGW64_NT-..., que não casa com Darwin nem com Linux
# e caía no conselho vago.
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
  confere_bin opa opa opcional "necessário para o gate de durabilidade"

  if python3 -c "import playwright" > /dev/null 2>&1; then
    echo "ok   playwright   pacote Python instalado"
  else
    echo "aviso playwright   falta a prova de navegador"
    echo "     instale: python3 -m pip install playwright && python3 -m playwright install chromium"
    avisos=$((avisos + 1))
  fi

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

# A ação padrão é a receita: o bioma escreve o comando que cria e atualiza, e
# quem opera roda no pipeline dele. Só o plano roda aqui, porque planejar não
# muda estado e é a prova mais barata de que a tradução está certa.
PERFIL="" ; ATE="dev" ; ACAO="receita" ; RETOMAR=0 ; SO_FASE="" ; JANELA=0 ; SO_AREA="" ; DIAGNOSTICO=0
while [ $# -gt 0 ]; do
  case "$1" in
    --diagnostico) DIAGNOSTICO=1; shift ;;
    --perfil)  PERFIL="$2"; shift 2 ;;
    --ate)     ATE="$2"; shift 2 ;;
    --plan)    ACAO="plan"; shift ;;
    --destruir)   ACAO="receita-destruir"; shift ;;
    --com-janela) JANELA=1; shift ;;
    --retomar) RETOMAR=1; shift ;;
    --fase)    SO_FASE="$2"; shift 2 ;;
    --area)    SO_AREA="$2"; shift 2 ;;
    *) echo "flag desconhecida: $1"; exit 2 ;;
  esac
done
if [ "$DIAGNOSTICO" = 1 ]; then
  diagnostico_ambiente
  exit $?
fi
case "$PERFIL" in local|ensaio|sandbox) ;; *) echo "obrigatório: --perfil local|ensaio|sandbox"; exit 2 ;; esac
case "$ATE" in dev|homolog) ;; *) echo "--ate aceita dev ou homolog; produção fica fora deste script"; exit 2 ;; esac

JOURNAL="$BC/execucao/journal-$PERFIL.jsonl"
mkdir -p "$BC/execucao"

registra() { # fase caminho acao resultado
  jq -cn --arg f "$1" --arg c "$2" --arg a "$3" --arg r "$4" \
    --arg t "$(date -u +%FT%TZ)" \
    '{momento:$t, fase:$f, caminho:$c, acao:$a, resultado:$r}' >> "$JOURNAL"
}

ja_feito() { # fase caminho
  [ "$RETOMAR" = 1 ] || return 1
  [ -f "$JOURNAL" ] || return 1
  jq -e --arg f "$1" --arg c "$2" \
    'select(.fase==$f and .caminho==$c and .resultado=="ok")' "$JOURNAL" > /dev/null 2>&1
}

# ── pré-voo ──────────────────────────────────────────────────────────────
echo "== verificações (perfil $PERFIL, até $ATE, ação $ACAO) =="
# Gerar não exige nada além do Python. Planejar exige o terragrunt e o
# terraform; o resto se cobra na camada que usa.
for b in python3 jq; do
  command -v "$b" > /dev/null || { echo "falta $b no PATH"; exit 1; }
done
if [ "$ACAO" = "plan" ]; then
  for b in terragrunt terraform; do
    command -v "$b" > /dev/null \
      || { echo "falta $b no PATH: o plano precisa dele. Sem plano, o bioma"
           echo "  gera a estrutura e escreve a receita normalmente."; exit 1; }
  done
fi

# O provider da AWS é baixado para a arquitetura do binário do terraform, não
# a da máquina. Um terraform x86 sob Rosetta num Mac Apple Silicon baixa o
# provider x86 e o plugin não sobe: o erro aparece minutos depois, no meio de
# um plan, dizendo "timeout while waiting for plugin to start". Conferir aqui
# custa um `file` e evita a caçada.
if [ "$ACAO" = "plan" ] && [ "$(uname -s)" = "Darwin" ] && [ "$(sysctl -n hw.optional.arm64 2> /dev/null)" = "1" ]; then
  arq_tf="$(file -b "$(command -v terraform)" 2> /dev/null || true)"
  case "$arq_tf" in
    *arm64* | *universal*) : ;;
    *)
      echo "o terraform em $(command -v terraform) é x86 e esta máquina é arm64 (Apple Silicon)."
      echo "  o provider da AWS baixa para a arquitetura errada e não sobe."
      echo "  conserto: arch -arm64 brew install terraform"
      echo "            file \$(which terraform)   # tem que dizer arm64"
      echo "            rm -rf ~/.bioma/validador"
      exit 1
      ;;
  esac
fi
if [ "$ACAO" = "plan" ] && ! command -v opa > /dev/null; then
  echo "opa não está no PATH: o gate de durabilidade fica de fora deste plano."
  echo "  Para ligá-lo: brew install opa"
fi
if [ "$PERFIL" = "local" ] && [ "$ACAO" = "plan" ]; then
  export TG_MODO=local
  command -v aws > /dev/null || { echo "falta aws cli (cria os buckets de state locais)"; exit 1; }
  # nenhuma credencial real alcança o modo local: sobrescreve o ambiente
  export AWS_ACCESS_KEY_ID=teste AWS_SECRET_ACCESS_KEY=teste
  # A região não é do framework: no emulador ela não decide nada, e escrever
  # a de um cliente aqui é o cliente vazando para dentro da ferramenta.
  export AWS_DEFAULT_REGION="${TG_REGIAO:-${AWS_DEFAULT_REGION:-us-east-1}}"
  unset AWS_PROFILE AWS_SESSION_TOKEN 2> /dev/null || true
  curl -sf http://localhost:4566/_floci/health > /dev/null \
    || { echo "Floci fora do ar; suba com: docker compose -f testes/docker-compose.yml up -d"; exit 1; }
  # Os baldes de state nascem aqui: o bootstrap do terragrunt exige STS real, e
  # o emulador não responde STS. Quais baldes é o mapa de contas da instância
  # que diz, pela mesma regra do `root.hcl` (`tfstate-<apelido>-<conta>`). Já foi
  # lista escrita aqui, com nome de domínio de um cliente dentro do framework, e
  # ela envelheceu em silêncio.
  for b in $(python3 "$BC/ferramentas/baldes_de_estado.py" 2> /dev/null); do
    aws --endpoint-url http://localhost:4566 s3api create-bucket \
      --bucket "$b" --create-bucket-configuration LocationConstraint="$AWS_DEFAULT_REGION" \
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
  # A semente entra pelo nome e pelo ARN completo de CADA conta do mapa: quem
  # lê entre contas usa o ARN, e escrever aqui a lista de contas de um cliente
  # é o cliente vazando para dentro do framework.
  semear() { # nome valor
    local arns=("$1")
    while IFS= read -r b; do
      [ -n "$b" ] || continue
      arns+=("arn:aws:ssm:$AWS_DEFAULT_REGION:${b##*-}:parameter$1")
    done < <(python3 "$BC/ferramentas/baldes_de_estado.py" 2> /dev/null)
    for n in "${arns[@]}"; do
      aws --endpoint-url http://localhost:4566 ssm put-parameter \
        --name "$n" --type String --value "$2" --tier Advanced --overwrite > /dev/null 2>&1 || true
    done
  }
  semear /fundacao/rede/tgw-id "tgw-0f00000000semente0"
  # Quais pares recebem semente de attachment é da instância, que conhece os
  # próprios domínios. Sem declaração, só a semente de rede entra.
  SEMENTES="$(declaracao sementes_de_attachment)"
  while IFS= read -r par; do
    [ -n "$par" ] && semear "/dominios/$par/attachment-id" "tgw-attach-0semente0000000000"
  done <<< "$SEMENTES"
else
  export TG_MODO=aws
  command -v aws > /dev/null || { echo "falta aws cli"; exit 1; }
  aws sts get-caller-identity > /dev/null || { echo "credencial AWS ausente"; exit 1; }
fi
export TG_NON_INTERACTIVE=true

# cada verificador sai 0 (passou), 1 (reprovou) ou 2 (sem insumo para decidir).
# Sem insumo não é aprovação: o motivo vai para a tela inteira, com o nome do
# verificador, para ninguém confundir gate pulado com gate cumprido.
confere() { # nome caminho-do-verificador motivo-da-reprova
  local saida rc
  saida=$(python3 "$2" 2>&1) && return 0
  rc=$?
  if [ "$rc" = 2 ]; then
    echo "PULADO · $1 não se aplica a esta árvore: $(echo "$saida" | tail -1)"
    return 0
  fi
  echo "$3"
  echo "$saida" | tail -8
  exit 1
}
# cobertura contra o inventário do desenho é conferência da instância, não do
# framework: quem sabe o que precisa estar coberto é o repositório que desenhou.
# O verificador mora em implementacao/bioma/ferramentas/ de lá.
confere durabilidade "$BC/ferramentas/verificar_durabilidade.py" \
  "verificador de durabilidade reprovou (classificação da célula contra a trava dos átomos)"
confere cardinalidade "$BC/ferramentas/verificar_cardinalidade.py" \
  "verificador de cardinalidade reprovou (o contrato da ligação diverge do variables.tf)"
confere conformidade "$BC/ferramentas/verificar_conformidade.py" \
  "verificador de conformidade reprovou (valor que esta instância declarou obrigatório foi trocado)"
confere preenchimento "$BC/ferramentas/verificar_preenchimento.py" \
  "verificador de preenchimento reprovou (há célula com ficha por preencher)"
confere procedencia "$BC/ferramentas/verificar_procedencia.py" \
  "verificador de procedência reprovou (há valor de reserva capaz de passar por valor declarado)"
# Ilustrativo é o único que precisa saber o perfil e onde está a árvore: ele
# olha o ambiente, e não o código. Por isso não passa pelo `confere`.
# Documentado em docs/portoes.md.
echo "verificações ok"

# ── exclusões da fila ────────────────────────────────────────────────────
# prod nunca entra; homolog só com --ate homolog; o perfil pula o que a ficha
# manda (local: fora / plan-apenas no apply; ensaio: custo alto).
excludes_de() { # caminho-area
  local area="$1"
  # excluir por UNIT (o diretório da célula), não pelo ancestral: o glob do
  # terragrunt não desce sozinho. prod e contas de produção ficam fora sempre;
  # nao-prod não casa com o padrão.
  find "$area" -name terragrunt.hcl | grep -v ".terragrunt-cache" | while read -r hcl; do
    local d rel
    d=$(dirname "$hcl"); rel="${d#"$area"/}"
    case "/$rel/" in
      */prod/*) echo "$d" ;;
      *-prod/*) case "/$rel/" in */nao-prod/*) ;; *) echo "$d" ;; esac ;;
      */homolog/*|*-homolog/*) [ "$ATE" = "dev" ] && echo "$d" ;;
    esac
  done
  local flag_apply=""
  [ "$ACAO" = "apply" ] && flag_apply="--apply"
  python3 "$BC/ferramentas/excluir_por_perfil.py" "$PERFIL" "$area" $flag_apply \
    | while IFS=$'\t' read -r rel nome motivo; do
        registra "$FASE" "$area/$rel" pulo "$motivo"
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

roda_area() { # caminho-area
  local area="$1"
  # Área que não existe é erro, e não "nada a fazer". Enquanto isto devolvia 0,
  # um nome errado no roteiro das fases pulava a área inteira em silêncio: um
  # domínio deixava de ser aplicado e o comando terminava dizendo que deu certo.
  if [ ! -d "$area" ]; then
    registra "$FASE" "$area" "$ACAO" "inexistente"
    echo "área declarada no roteiro e ausente na árvore: $area"
    echo "corrija o nome, ou tire a área do roteiro."
    exit 1
  fi
  if ja_feito "$FASE" "$area"; then echo "  (journal) $area ok"; return 0; fi
  local ex_flags=()
  while IFS= read -r d; do [ -n "$d" ] && ex_flags+=(--queue-exclude-dir "$d"); done < <(excludes_de "$area")
  if [ "$ACAO" = "destroy" ]; then
    while IFS=$'\t' read -r d motivo; do
      [ -n "$d" ] || continue
      registra "$FASE" "$d" recusa "$motivo"
      echo "  recusado: $(basename "$d") · $motivo"
      ex_flags+=(--queue-exclude-dir "$d")
    done < <(BC="$BC" excludes_por_durabilidade "$area")
  fi
  # bootstrap do backend só com AWS real (no local os buckets nascem no pré-voo)
  local bootstrap=""
  [ "$TG_MODO" = "aws" ] && bootstrap="--backend-bootstrap"

  # A receita: o bioma escreve o comando e para. Criar, atualizar e destruir
  # infraestrutura é do time que opera, no pipeline dele, com a credencial
  # dele. O que garante o ciclo de vida está no código gerado (prevent_destroy
  # na célula permanente) e na política versionada, e vale em qualquer lugar.
  if [ "$ACAO" != "plan" ]; then
    local alvo="apply"
    [ "$ACAO" = "receita-destruir" ] && alvo="destroy"
    echo "-- receita para $alvo em $area"
    printf '   cd %s\n' "$area"
    printf '   terragrunt run --all %s --non-interactive --parallelism 4%s' \
      "$alvo" "${bootstrap:+ $bootstrap}"
    for ((i = 0; i < ${#ex_flags[@]}; i += 2)); do
      printf ' \\\n     %s %s' "${ex_flags[i]}" "${ex_flags[i + 1]}"
    done
    printf '\n'
    registra "$FASE" "$area" "$ACAO" receita
    return 0
  fi

  echo "-- $ACAO em $area"
  # paralelismo limitado: cada unit sobe o provider AWS inteiro (memória)
  if terragrunt run --all "$ACAO" --non-interactive --parallelism 4 $bootstrap --working-dir "$area" ${ex_flags[@]+"${ex_flags[@]}"}; then
    registra "$FASE" "$area" "$ACAO" ok
  else
    registra "$FASE" "$area" "$ACAO" falhou
    echo "FALHOU em $area; corrija e retome com --retomar"; exit 1
  fi
}

gate_baseline() {
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
  [ "$ACAO" = "plan" ] || return 0
  local falhas=0 hcl
  while IFS= read -r hcl; do
    if "$BC/politicas/checar_plano.sh" "$(dirname "$hcl")"; then
      registra "$FASE" "$(dirname "$hcl")" gate-durabilidade ok
    else
      registra "$FASE" "$(dirname "$hcl")" gate-durabilidade reprovado
      falhas=1
    fi
  done < <(find "$1" -path "*/dados/*" -name terragrunt.hcl 2> /dev/null \
    | grep -v ".terragrunt-cache" | grep -v -e "/prod/" -e "-prod/")
  [ "$falhas" = 0 ] || { echo "gate de durabilidade reprovou; veja o journal"; exit 1; }
}

fase_roda() { [ -z "$SO_FASE" ] || [ "$SO_FASE" = "$1" ]; }

# ── uma parte só ─────────────────────────────────────────────────────────
if [ -n "$SO_AREA" ]; then
  FASE="area"
  echo "== $ACAO em $SO_AREA =="
  roda_area "$INFRA/$SO_AREA"
  echo "== fim ($ACAO, perfil $PERFIL) · journal: $JOURNAL =="
  exit 0
fi

# ── fase 2 · fundação (sequencial, com gate) ─────────────────────────────
if fase_roda 2; then
  FASE=2
  echo "== fase 2 · fundação =="
  for unit in 00-organizacao 01-landing-zone 02-ous 03-scp 04-contas \
              05-delegated-admins 06-baseline-seguranca 07-identity-center 08-backup; do
    roda_area "$INFRA/fundacao/$unit"
    case "$unit" in 01-landing-zone|04-contas) gate_baseline ;; esac
  done
fi

# ── fase 3 · núcleo de rede ──────────────────────────────────────────────
if fase_roda 3; then
  FASE=3
  echo "== fase 3 · núcleo de rede =="
  roda_area "$INFRA/plataforma/rede/org"
fi

# Quais domínios existem, e quais ambientes cada um tem, é da instância: o
# framework não pode carregar o nome do cliente. Sem declaração, as fases de
# domínio não rodam nada, e dizem isso.
DOMINIOS=()
AMB_WORKLOAD=()
LISTA_DOMINIOS="$(declaracao dominios)"
LISTA_AMB_WORKLOAD="$(declaracao ambientes_por_natureza.workload)"
while IFS= read -r x; do [ -n "$x" ] && DOMINIOS+=("$x"); done <<< "$LISTA_DOMINIOS"
while IFS= read -r x; do [ -n "$x" ] && AMB_WORKLOAD+=("$x"); done <<< "$LISTA_AMB_WORKLOAD"

# ── fase 4 · VPCs e ligações de rede ─────────────────────────────────────
if fase_roda 4; then
  FASE=4
  echo "== fase 4 · VPCs e ligações =="
  # As VPCs de domínio vêm ANTES da rede: uma VPN que leia o CIDR alocado pelo
  # IPAM depende delas, e mock não vale no apply.
  for dom in ${DOMINIOS[@]+"${DOMINIOS[@]}"}; do
    roda_area "$INFRA/$dom/${AMB_WORKLOAD[0]:-dev}/base"
    [ "$ATE" = "homolog" ] && [ -n "${AMB_WORKLOAD[1]:-}" ] \
      && roda_area "$INFRA/$dom/${AMB_WORKLOAD[1]}/base"
  done
  roda_area "$INFRA/plataforma/rede/nao-prod"
  roda_area "$INFRA/plataforma/rede/ligacoes"
fi

# ── fase 5 · plataforma ──────────────────────────────────────────────────
if fase_roda 5; then
  FASE=5
  echo "== fase 5 · plataforma =="
  for area in seguranca esteira barramento dados observabilidade; do
    roda_area "$INFRA/plataforma/$area"
  done
  gate_durabilidade "$INFRA/plataforma/dados"
fi

# ── fase 6 · domínios e consumidores ─────────────────────────────────────
if fase_roda 6; then
  FASE=6
  echo "== fase 6 · domínios e consumidores =="
  for dom in ${DOMINIOS[@]+"${DOMINIOS[@]}"}; do
    for amb in ${AMB_WORKLOAD[@]+"${AMB_WORKLOAD[@]}"}; do
      [ "$amb" != "${AMB_WORKLOAD[0]:-dev}" ] && [ "$ATE" = "dev" ] && continue
      roda_area "$INFRA/$dom/$amb/dados"
      gate_durabilidade "$INFRA/$dom/$amb"
      roda_area "$INFRA/$dom/$amb/ligacoes"
    done
  done
  roda_area "$INFRA/consumidores"
fi

# ── fase 7 · aplicação: fora, por construção ─────────────────────────────
FASE=7
registra 7 aplicacao nota "fora do orquestrador: preview por PR e homologação por candidato são da esteira"

echo "== fim ($ACAO, perfil $PERFIL, até $ATE) · journal: $JOURNAL =="
