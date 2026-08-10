#!/usr/bin/env bash
# Smoke test do degrau local, depois do bioma.sh --perfil local:
# 1. hormônio publicado e lido (SSM no Floci);
# 2. tópico criado no broker que o MSK do Floci levanta;
# 3. banco respondendo no endpoint que o RDS do Floci publica;
# 4. a política de durabilidade bloqueando um destroy de dados/ de propósito.
#
# MSK e RDS não são mock: o emulador sobe Redpanda e Postgres em contêiner
# irmão. O teste fala com eles pelo endereço que a própria API da AWS devolve,
# de dentro da rede do compose (o host não alcança essas portas).
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
BC="$(dirname "$AQUI")"
COMPOSE="$AQUI/docker-compose.yml"
AWSL="aws --endpoint-url http://localhost:4566 --region sa-east-1"
export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-teste}
export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-teste}
FALHAS=0

REDE=$(docker inspect "$(docker compose -f "$COMPOSE" ps -q floci)" \
  --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}')

echo "== 1. hormônio (SSM) =="
$AWSL ssm put-parameter --name /fumaca/teste --type String --value ok --tier Advanced --overwrite > /dev/null
LIDO=$($AWSL ssm get-parameter --name /fumaca/teste --query Parameter.Value --output text)
[ "$LIDO" = "ok" ] && echo "ok: parâmetro publicado e lido" || { echo "FALHOU: SSM"; FALHAS=1; }

echo "== 2. tópico (MSK) =="
ARN=$($AWSL kafka list-clusters --cluster-name-filter fumaca \
  --query 'ClusterInfoList[0].ClusterArn' --output text 2> /dev/null || echo None)
if [ "$ARN" = "None" ] || [ -z "$ARN" ]; then
  ARN=$($AWSL kafka create-cluster --cluster-name fumaca --kafka-version 3.6.0 \
    --number-of-broker-nodes 1 \
    --broker-node-group-info '{"InstanceType":"kafka.t3.small","ClientSubnets":["subnet-fumaca"]}' \
    --query ClusterArn --output text)
fi
ESTADO=""
for _ in $(seq 60); do
  ESTADO=$($AWSL kafka describe-cluster --cluster-arn "$ARN" --query ClusterInfo.State --output text)
  [ "$ESTADO" = ACTIVE ] && break
  sleep 3
done
if [ "$ESTADO" = ACTIVE ]; then
  BROKER=$($AWSL kafka get-bootstrap-brokers --cluster-arn "$ARN" \
    --query BootstrapBrokerString --output text)
  docker run --rm --network "$REDE" --entrypoint rpk redpandadata/redpanda:latest \
    topic create fumaca-teste --brokers "$BROKER" > /dev/null 2>&1 || true
  docker run --rm --network "$REDE" --entrypoint rpk redpandadata/redpanda:latest \
    topic list --brokers "$BROKER" 2> /dev/null | grep -q fumaca-teste \
    && echo "ok: cluster ACTIVE e tópico criado e listado" || { echo "FALHOU: MSK"; FALHAS=1; }
else
  echo "FALHOU: MSK (cluster em $ESTADO)"; FALHAS=1
fi

echo "== 3. banco (RDS) =="
SENHA=fumaca-local-123
situacao_rds() {
  $AWSL rds describe-db-clusters --db-cluster-identifier fumaca-ledger \
    --query 'DBClusters[0].Status' --output text 2> /dev/null || echo ausente
}
case "$(situacao_rds)" in
  available|creating) ;;
  *) $AWSL rds create-db-cluster --db-cluster-identifier fumaca-ledger \
       --engine aurora-postgresql --database-name ledger \
       --master-username administrador --master-user-password "$SENHA" > /dev/null ;;
esac
SITUACAO=""
for _ in $(seq 60); do
  SITUACAO=$(situacao_rds)
  [ "$SITUACAO" = available ] && break
  sleep 3
done
if [ "$SITUACAO" = available ]; then
  read -r HOSPEDE PORTA BANCO USUARIO <<< "$($AWSL rds describe-db-clusters \
    --db-cluster-identifier fumaca-ledger \
    --query 'DBClusters[0].[Endpoint,Port,DatabaseName,MasterUsername]' --output text)"
  docker run --rm --network "$REDE" -e PGPASSWORD="$SENHA" postgres:16.3-alpine \
    psql -h "$HOSPEDE" -p "$PORTA" -U "$USUARIO" -d "$BANCO" -tAc "select 1" 2> /dev/null \
    | grep -q 1 && echo "ok: banco responde no endpoint do cluster" \
    || { echo "FALHOU: RDS (endpoint $HOSPEDE:$PORTA)"; FALHAS=1; }
else
  echo "FALHOU: RDS (cluster em $SITUACAO)"; FALHAS=1
fi

echo "== 4. durabilidade bloqueando destroy =="
# plano sintético com um delete + contrato permanente: o deny tem de acender
TMP=$(mktemp -d)
cat > "$TMP/plano.json" << 'JSON'
{"resource_changes": [{"address": "aws_s3_bucket.camada[\"bronze\"]", "change": {"actions": ["delete"]}}]}
JSON
echo '{"durabilidade": "permanente"}' > "$TMP/durabilidade.json"
NEGADAS=$(opa eval --format raw --input "$TMP/plano.json" \
  --data "$TMP/durabilidade.json" --data "$BC/politicas/durabilidade.rego" \
  'count(data.politica.deny)')
[ "$NEGADAS" != "0" ] && echo "ok: destroy de permanente reprovado" \
  || { echo "FALHOU: política deixou passar"; FALHAS=1; }
rm -rf "$TMP"

[ "$FALHAS" = 0 ] && echo "== fumaça: tudo ok ==" || { echo "== fumaça: com falhas =="; exit 1; }
