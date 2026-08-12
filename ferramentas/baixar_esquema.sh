#!/usr/bin/env bash
# O esquema do provider tem 18 MB e muda a cada versão dele, então não é
# versionado: nasce aqui, na máquina de quem usa. Sem ele o gerador escreve o
# esqueleto sem argumento, e o validate reprova por argumento faltando.
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"

# O mesmo binário que o resto da árvore usa. No Mac com chip Apple, o terraform
# do PATH costuma ser x86 sob Rosetta, e ele não sobe o provider da AWS dentro
# do tempo do plugin: o comando saía sem erro e escrevia um arquivo vazio.
TF="${BIOMA_TERRAFORM:-${TERRAGRUNT_TFPATH:-terraform}}"
command -v "$TF" > /dev/null || { echo "não achei o terraform em '$TF'"; exit 1; }

T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT
cat > "$T/versions.tf" << 'FIM'
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = ">= 6.40.0, < 7.0.0" }
  }
}
FIM
cd "$T"
"$TF" init -backend=false -input=false > /dev/null

# Para a saída num arquivo temporário antes de trocar o definitivo: redirecionar
# direto já truncava o bom quando o comando falhava no meio.
"$TF" providers schema -json > "$T/esquema.json"

tamanho=$(wc -c < "$T/esquema.json" | tr -d ' ')
if [ "$tamanho" -lt 1000000 ]; then
  echo "o esquema saiu com $tamanho bytes, e o real passa de 15 MB."
  echo "Quase sempre é o terraform errado: no Mac com chip Apple, use o binário"
  echo "darwin_arm64 e aponte BIOMA_TERRAFORM ou TERRAGRUNT_TFPATH para ele."
  exit 1
fi

mv "$T/esquema.json" "$AQUI/esquema-aws.json"
echo "esquema em $AQUI/esquema-aws.json ($(du -h "$AQUI/esquema-aws.json" | cut -f1))"
