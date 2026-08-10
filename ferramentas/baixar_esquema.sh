#!/usr/bin/env bash
# O esquema do provider tem 18 MB e muda a cada versão dele, então não é
# versionado: nasce aqui, na máquina de quem usa. Sem ele o gerador escreve o
# esqueleto sem argumento, e o validate reprova por argumento faltando.
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
T=$(mktemp -d)
cat > "$T/versions.tf" << 'FIM'
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = ">= 6.40.0, < 7.0.0" }
  }
}
FIM
cd "$T"
terraform init -backend=false -input=false > /dev/null
terraform providers schema -json > "$AQUI/esquema-aws.json"
rm -rf "$T"
echo "esquema em $AQUI/esquema-aws.json ($(du -h "$AQUI/esquema-aws.json" | cut -f1))"
