# Ficha de preenchimento · esteira-workflows

Uma pergunta por valor. Todas viram variáveis do repositório do serviço
(Settings → Secrets and variables → Actions → Variables). Nenhuma vira segredo:
não há credencial de nuvem aqui, o acesso é por OIDC.

## Onde a esteira roda

| variável | pergunta |
|---|---|
| `REGIAO` | Em que região da AWS este serviço roda? |
| `REPOSITORIO_IMAGEM` | Qual o nome do repositório da imagem no ECR? |
| `SERVICO` | Qual o nome do serviço no ECS? |
| `CLUSTER_DEV` | Qual o nome do cluster ECS da conta de desenvolvimento? |
| `ZONA_DEV` | Qual a zona DNS privada onde o preview publica a URL? |
| `DOMINIO_EMAIL` | Qual o domínio de e-mail que assina a tag da esteira? |

## Quem a esteira assume em cada conta

Uma role por conta e por trilho. A de produção só existe na conta de produção,
e quem não a tem não promove.

| variável | pergunta |
|---|---|
| `ROLE_ESTEIRA_REGISTRO` | Qual a role que publica a imagem no registro? |
| `ROLE_ESTEIRA_DEV` | Qual a role da esteira na conta de desenvolvimento? |
| `ROLE_ESTEIRA_HML` | Qual a role da esteira na conta de homologação? |
| `ROLE_ESTEIRA_PRD` | Qual a role da esteira na conta de produção? |
| `ROLE_ESTEIRA_INFRA` | Qual a role que aplica a infraestrutura deste trilho? |

## O que o projeto sabe fazer

| variável | pergunta |
|---|---|
| `COMANDO_DEPENDENCIAS` | Como o projeto instala as dependências? |
| `COMANDO_TESTE_UNIDADE` | Como o projeto roda os testes de unidade? |
| `COMANDO_TESTE_INTEGRACAO` | Como o projeto roda a integração com Testcontainers? |
| `COMANDO_TESTE_E2E` | Como o projeto roda o ponta a ponta em desenvolvimento? |
| `COMANDO_TESTE_ACEITACAO` | Como o projeto roda a aceitação em homologação? |
| `COMANDO_TESTE_DESEMPENHO` | Como o projeto roda o teste de desempenho? |
| `COMANDO_SEED_SINTETICO` | Como o projeto popula massa sintética no preview? |
| `COMANDO_MASSA_HML` | Como a massa de homologação é carregada e mascarada? |

## Os gates de segurança

| variável | pergunta |
|---|---|
| `COMANDO_SAST` | Qual analisador estático de código o time usa? |
| `COMANDO_IAC_SCAN` | Qual analisador de IaC o time usa? |
| `COMANDO_SCA` | Qual verificador de dependência vulnerável o time usa? |
| `COMANDO_SEGREDOS` | Qual varredura de segredo no repositório o time usa? |
| `COMANDO_DAST` | Qual análise dinâmica roda contra a homologação? |
| `TEM_EVENTO` | Este serviço publica evento? (`true` ou `false`) |
| `COMANDO_CONTRATO_EVENTO` | Como a compatibilidade de schema é verificada no registry? |

## Produção e ambientes efêmeros

| variável | pergunta |
|---|---|
| `CAMINHO_EFEMERO` | Qual o caminho da camada de aplicação efêmera no live? |
| `TETO_PREVIEWS` | Quantos previews simultâneos o plano de não-produção aguenta? |
| `APP_ARN_RESILIENCE_HUB` | Qual o ARN da aplicação no Resilience Hub? |
| `CODEDEPLOY_APP` | Qual a aplicação do CodeDeploy em produção? |
| `CODEDEPLOY_GRUPO` | Qual o deployment group do canário? |
| `ALARME_SINTETICO` | Qual alarme do sintético decide o rollback? |
| `BAKE_SEGUNDOS` | Quantos segundos dura a janela de bake? |
| `CELULAS` | Quais células de infraestrutura este repositório aplica? (lista JSON) |

## Environments do GitHub que precisam existir

`dev` sem revisor, `homologacao` com quem dá o aceite, `producao` com quem
detém o portão, `infra` com quem revisa mudança de infraestrutura. O aceite e o
portão são pessoas, e é a aprovação delas no environment que a esteira registra
como evidência.
