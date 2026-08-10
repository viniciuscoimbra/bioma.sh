#!/usr/bin/env bash
# Os portões que reprovam uma mudança antes do merge.
#
# Cada um roda sozinho e diz o que quer dizer. Rode antes de abrir o pull
# request; o CI roda os mesmos, na mesma ordem.
#
#   bash testes/portoes.sh            todos
#   bash testes/portoes.sh compila    um só
set -uo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(dirname "$AQUI")"
cd "$RAIZ"

VERDE=$'\033[32m'; VERMELHO=$'\033[31m'; APAGA=$'\033[0m'
falhou=0
so="${1:-todos}"

porta() { # nome, comando…
  local nome="$1"; shift
  [ "$so" = "todos" ] || [ "$so" = "$nome" ] || return 0
  printf '%-12s ' "$nome"
  local saida
  if saida="$("$@" 2>&1)"; then
    printf '%sok%s\n' "$VERDE" "$APAGA"
  else
    printf '%sreprovado%s\n' "$VERMELHO" "$APAGA"
    printf '%s\n' "$saida" | tail -20 | sed 's/^/  /'
    falhou=1
  fi
}

# 1. o Python compila. Sem dependência externa: é a stdlib olhando a stdlib.
compila() { python3 -m compileall -q ferramentas tela/servidor.py; }

# 2. a tela constrói, e o build bate com o que está versionado. Divergência
#    aqui quer dizer que alguém mudou o app e esqueceu de construir.
constroi() {
  [ -d tela/app/node_modules ] || (cd tela/app && npm ci --silent)
  (cd tela/app && npm run build > /dev/null)
  git diff --quiet -- tela/estatico || {
    echo "o build difere do versionado em tela/estatico:"
    git diff --stat -- tela/estatico
    return 1
  }
}

# 3. as regras da receita, sem nuvem e sem provider. `terraform validate` prova
#    sintaxe; estas provam que a receita fecha: dependência apontando célula que
#    existe, mock declarando só o que a origem publica, nada se auto-referenciando.
unidade() { python3 testes/unidade.py; }

# 4. as camadas do diagnóstico, com desenho sintético: a regra tem o caso que
#    ela pega e o contra-caso que ela não pode pegar. Teste que só roda no
#    desenho de um cliente prova aquele desenho.
camadas() { python3 testes/camadas.py; }

# 4. a árvore gerada não mudou sozinha. Mudança no gerador que altera a saída
#    obriga a atualizar a referência no mesmo commit, à vista do revisor.
arvore() { python3 testes/arvore_referencia.py --conferir; }

# 4. a tela responde: sobe o servidor numa porta própria, abre o exemplo,
#    clica, confere e derruba o servidor mesmo se a prova quebrar no meio.
tela() {
  python3 -c "import playwright" 2> /dev/null || {
    echo "playwright não instalado. Instale com:"
    echo "  pip install playwright && playwright install chromium"
    return 1
  }
  local porta=8731 pid=
  PORTA="$porta" python3 tela/servidor.py > /tmp/bioma-portao-tela.log 2>&1 &
  pid=$!
  trap 'kill "$pid" 2> /dev/null' RETURN
  for _ in $(seq 1 40); do
    curl -sf "http://localhost:$porta/" > /dev/null && break
    sleep 0.25
  done
  PORTA="$porta" python3 testes/prova-tela.py
}

comeco=$(date +%s)
porta compila  compila
porta constroi constroi
porta unidade  unidade
porta camadas  camadas
porta arvore   arvore
porta tela     tela
printf '\n%ss\n' "$(( $(date +%s) - comeco ))"
exit "$falhou"
