#!/usr/bin/env bash
# Checa o plano de UMA célula contra a política de durabilidade.
# Uso: checar_plano.sh <dir-da-celula>
# Lê a durabilidade do contrato.json da receita que a célula usa; roda
# terragrunt plan + show -json + opa eval. Sai 1 se a política reprovar.
set -euo pipefail
CELULA="$1"
AQUI="$(cd "$(dirname "$0")" && pwd)"
BC="$(dirname "$AQUI")"

SRC=$(grep -o 'catalogo//*[a-z0-9/-]*' "$CELULA/terragrunt.hcl" | head -1 | sed 's#//#/#')
CONTRATO="$BC/infra/$SRC/contrato.json"
DUR=$(python3 -c "import json;print(json.load(open('$CONTRATO')).get('durabilidade','efemera'))")

cd "$CELULA"
terragrunt plan -out=plano.bin -input=false > /dev/null
terragrunt show -json plano.bin > plano.json

echo "{\"durabilidade\": \"$DUR\"}" > durabilidade.json
VEREDITO=$(opa eval --format raw \
  --input plano.json --data durabilidade.json --data "$AQUI/durabilidade.rego" \
  'count(data.politica.deny)')
if [ "$VEREDITO" != "0" ]; then
  echo "REPROVADO ($CELULA, durabilidade $DUR):"
  opa eval --format pretty --input plano.json --data durabilidade.json \
    --data "$AQUI/durabilidade.rego" 'data.politica.deny'
  exit 1
fi
echo "ok ($CELULA, durabilidade $DUR)"
