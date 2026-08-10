# Exercitar a árvore no emulador

O bioma gera e valida; aplicar é do time que opera. Este documento é para
quem quer ver a árvore gerada subir de verdade, sem tocar numa conta AWS.

O emulador é o Floci, num contêiner. Ele responde pela API da AWS em
`localhost:4566`, e sobe Redpanda e Postgres irmãos para MSK e RDS, que não são
mock.

```bash
# 1. o emulador
docker compose -f testes/docker-compose.yml up -d
curl -sf http://localhost:4566/_floci/health && echo " no ar"

# 2. os buckets de estado que o terragrunt exige
export TG_MODO=local
export AWS_ACCESS_KEY_ID=teste AWS_SECRET_ACCESS_KEY=teste
export AWS_DEFAULT_REGION=sa-east-1
for b in fundacao-111111111111 rede-222222222222 seguranca-333333333333; do
  aws --endpoint-url http://localhost:4566 s3 mb "s3://$b" 2> /dev/null || true
done

# 3. a receita, executada por você
cd <sua-arvore>/live/<area>
terragrunt run --all apply --non-interactive --parallelism 4

# 4. o smoke: hormônio, tópico, banco e a política recusando um destroy de dados
bash testes/fumaca.sh
```

Para gerar a receita com as exclusões de produção já dentro:

```bash
./bioma.sh --perfil local --area live/<area>
```

Quando terminar:

```bash
docker compose -f testes/docker-compose.yml down -v
```
