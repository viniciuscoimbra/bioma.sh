# esteira-workflows · o interior

Os workflows que um serviço recebe ao entrar no paved road. Artefato, não célula:
ele não vive no live, é copiado para `.github/workflows/` do repositório do
serviço e parametrizado pelas variáveis do repositório.

## O que cada arquivo faz

| arquivo | gatilho | o que faz | o que ele libera |
|---|---|---|---|
| `build.yml` | PR e push na main | unidade, integração com Testcontainers, análise estática, IaC, dependência, segredo; constrói a imagem e publica por digest | o merge do PR |
| `preview-pr.yml` | PR aberto, sincronizado, fechado | sobe a camada de aplicação num efêmero com URL própria na zona wildcard de dev; destrói no fechamento e por TTL | a revisão humana |
| `deploy-dev.yml` | push na main | leva o mesmo digest à conta dev e roda integração e ponta a ponta | a subida do candidato |
| `candidato-hml.yml` | manual, com o digest | homologação efêmera serializada, migração como tarefa efêmera, aceitação, desempenho, resiliência e DAST; no aceite, grava a tag na main | a promoção |
| `promocao-prd.yml` | tag `v*` na main | leva o digest da tag à conta de produção e observa o sintético na janela de bake | nada: é o fim da esteira |
| `infra.yml` | PR e push que tocam `infra/` | plan por célula, gate de durabilidade sobre o plano, apply na main | a mudança de infraestrutura |
| `plugin-conector.yml` | push na main que toca `conectores/`, ou manual | baixa o Iceberg Kafka Connect e o converter do Glue Schema Registry em versão fixada, confere o checksum, empacota e publica no balde de artefatos por versão e na chave estável que a célula `iceberg-sink` lê | o primeiro evento no bronze |

## As regras que os arquivos obedecem

**O artefato é construído uma vez.** Só o `build.yml` chama `docker build`. Todos
os outros recebem `image_digest` e usam `@sha256:...`. Rebuild entre estágios
reprova, porque o que sobe em produção deixaria de ser o que foi homologado
(15·D6).

**Nenhuma credencial estática.** Todo acesso à nuvem entra por OIDC, com role
por conta e por trilho (15·D2). O repositório não guarda chave, e o runner não
recebe segredo de longa duração.

**A conta é a fronteira do portão.** A role de produção só existe na conta de
produção, e só o dono dela pode conceder. Uma esteira que não tem essa role não
promove, e isso não depende de acordo escrito: depende de IAM.

**Ambiente efêmero é a aplicação, não a base.** Rede, barramento e banco de
não-produção ficam de pé; o efêmero sobe em minutos porque é só a camada de
aplicação (15·D7).

**Migração é tarefa efêmera, não passo do runner.** O CI dispara; quem executa é
uma tarefa na VPC do ambiente, com imagem por digest, credencial no Secrets
Manager, sem override de comando ou de role. A esteira espera o término e lê o
código de saída (15.2 §3).

## O que preencher

A ficha está em `PREENCHER.md`. Nenhum valor de instância entra aqui: nome de
conta, região, zona DNS e handle do repositório são variáveis do repositório do
serviço.
