---
status: canônico
tipo: bloco-template-generico
---

# 14 · Observabilidade e AIOps

A observabilidade e AIOps é o ponto único de instrumentação e o destino da telemetria: logs, métricas, tracing e SLO por jornada de negócio. Ela existe porque numa fintech a telemetria é evidência regulatória além de sinal de operação, e porque instrumentar uma vez e trocar o backend depois é o que mantém o vendor de APM substituível. Resolve com OpenTelemetry como ponto de coleta que faz fan-out para o APM ao vivo, para métrica e log nativos, e para a camada raw do lake como dado governado (`04-plataforma-dados`). O SLO se define por jornada (abrir conta, autorizar transação), não por recurso. A trilha imutável de auditoria fica na fundação (`00-fundacao`), não aqui. A mecânica da telemetria e da trilha de auditoria está em 14.1-telemetria-auditoria.

## Decisões de arquitetura

### Decisão 1 · OpenTelemetry como ponto único

Instrumenta uma vez, troca o backend sem reinstrumentar. Fan-out a partir do OTel: APM ao vivo no backend escolhido, métrica e log nativos, e sink da telemetria para a camada raw.

Rodar SDK de vendor em paralelo com o nativo joga o desacoplamento fora. Um ponto de instrumentação mantém o vendor de APM trocável.

Rejeitado: instrumentar direto no SDK de um vendor de APM (lock e reinstrumentação na troca).

### Decisão 2 · Telemetria como dado governado

Log de auditoria e telemetria aterrissam na camada raw do lake, para retenção e auditoria regulatória, sob as mesmas regras de enforcement de `04-plataforma-dados`. A trilha imutável fica na fundação (object lock).

Telemetria de fintech é evidência regulatória. Tratada como dado governado, herda retenção e controle de acesso em vez de virar silo à parte.

### Decisão 3 · SLO por jornada de negócio

O SLO se define por jornada (abrir conta, autorizar transação), não por recurso individual.

O que o negócio percebe é a jornada. SLO por recurso não diz se o cliente conseguiu a operação.

### Decisão 4 · Observabilidade atravessa contas por OAM

CloudWatch cross-account observability (OAM): as contas de domínio são source, a conta de observabilidade é sink de visão, por região. A telemetria fica nas contas de origem; o sink a enxerga, consulta e alarma sobre ela (métricas, log groups e traces do X-Ray; nada de EventBridge ou execuções), sem cópia física. Alarme composto por jornada agrega os sinais dos serviços da jornada; severidade tipada (página, ticket, registro) roteia pelo dono do domínio; alarme dependente é suprimido quando o raiz dispara.

Com conta por domínio, telemetria sem OAM vira silo por conta e o plantão navega dez consoles. Referência: [monitoramento centralizado com OAM](../../referencias/patterns/aws-prescriptive/docs/pattern-centralize-monitoring-by-using-amazon-cloudwatch-observability-access-manager.md).

### Decisão 5 · Anomalia gerenciada e resposta com alçada

CloudWatch Anomaly Detection nas métricas de jornada (banda aprendida, não limiar fixo) e Amazon DevOps Guru habilitado nas contas dos recursos, com a conta de observabilidade como delegated administrator (o OAM não o alimenta); insight vira caso com trilha via EventBridge, nunca página sem correlação. A resposta automatizada é runbook SSM Automation disparado por EventBridge a partir do alarme, com classe de ação declarada (reiniciar consumer, redrive de DLT, escalar, isolar) e alçada: acima dela, aprovação humana. Toda execução com trilha.

Limiar fixo em métrica sazonal alarma errado nos dois sentidos; remediação manual repetitiva é o desperdício que o runbook fecha, e alçada é o que impede o auto-healing de virar autodestruição. Referências: [telemetria com ML para resiliência](../../referencias/patterns/aws-architecture-blog/artigos/boosting-resiliency-with-an-ml-based-telemetry-analytics-architecture.md) e [remediação event-driven (caso ERGO)](../../referencias/patterns/aws-architecture-blog/artigos/how-ergo-implemented-an-event-driven-security-remediation-architecture-on-aws.md).

### Decisão 6 · Resiliência verificada contínua

AWS Resilience Hub avalia RTO e RPO como gate no pipeline (`15-devsecops-plataforma`); game days com Fault Injection Service por jornada, agendados, com resultado alimentando a revisão FSI. Fecha as pendências FSIREL02-BP01 e FSIREL07-BP01 abertas desde revisao-fsi-2026-07-03.

Desenho de DR sem teste é hipótese; a régua regulatória cobra prova. Referência: [Resilience Hub com CodePipeline (aws-brasil)](../../referencias/patterns/aws-brasil/artigos/avaliacao-continua-da-resiliencia-de-aplicacoes-utilizando-aws-resilience-hub-e-.md).

## Conformidade Well-Architected

O que o bloco garante em cada pilar, com a best practice do [Financial Services Industry Lens](https://docs.aws.amazon.com/wellarchitected/latest/financial-services-industry-lens/) correspondente.

| Pilar | O que o bloco garante | Best practice (FSI Lens) |
|---|---|---|
| Excelência operacional | OTel como ponto único, fan-out para APM, nativo e lake; SLO por jornada de negócio | [FSIOPS05-BP01](https://docs.aws.amazon.com/wellarchitected/latest/financial-services-industry-lens/fsiops5.html) (enhanced monitoring); [FSIOPS05-BP02](https://docs.aws.amazon.com/wellarchitected/latest/financial-services-industry-lens/fsiops5.html) (monitorar eventos do provedor) |
| Confiabilidade | Single pane of glass; alerta acionável na fonte do evento; runbook por alerta | [FSIREL08-BP01](https://docs.aws.amazon.com/wellarchitected/latest/financial-services-industry-lens/fsirel08.html) (single pane of glass); [FSIREL06-BP01](https://docs.aws.amazon.com/wellarchitected/latest/financial-services-industry-lens/fsirel06.html) (indicador de degradação, via SLO por jornada) |
| Segurança | Telemetria e trilha como dado governado, sob o enforcement de `04-plataforma-dados` | [FSISEC10-BP01](https://docs.aws.amazon.com/wellarchitected/latest/financial-services-industry-lens/fsisec10.html) (telemetria imutável) |
| Eficiência de performance | APM ao vivo no backend escolhido | [FSIPERF06-BP01](https://docs.aws.amazon.com/wellarchitected/latest/financial-services-industry-lens/fsiperf06.html) (APM) |
| Otimização de custo | Amostragem de trace, retenção de log por classe | — |

## Serviços e colocação

Os nós do diagrama e onde cada um mora. Onde a instância troca um serviço, isso vai nos Pontos de customização. Multiplicidade e colocação leem-se dentro de um ambiente: toda a topologia do bloco existe por ambiente (desenvolvimento, homologação, produção), cada instância no plano de rota correspondente (02.2-rede-ambientes); compartilhado significa compartilhado dentro do ambiente.

| serviço | papel | zona (conta · rede) | multiplicidade | realiza |
|---|---|---|---|---|
| AWS Distro for OpenTelemetry (ADOT) | instrumentação única, fan-out | Platform | compartilhado | Decisão 1 · OpenTelemetry como ponto único |
| Amazon CloudWatch | métrica e log nativos; traces no X-Ray | Platform | compartilhado | Decisão 1 · OpenTelemetry como ponto único |
| Datadog (APM, via exporter) | APM ao vivo | Platform (SaaS) | compartilhado | Decisão 1 · OpenTelemetry como ponto único |
| Amazon S3 (camada raw) | telemetria e trilha como dado governado | Platform (dados) | compartilhado | Decisão 2 · Telemetria como dado governado |
| Amazon DevOps Guru | anomalia gerenciada, habilitado por conta (delegated admin na observabilidade) | Platform · ×conta | compartilhado | Decisão 5 · Anomalia gerenciada e resposta com alçada |
| AWS Systems Manager (Automation) | runbooks de remediação com alçada | Platform · ×conta | compartilhado | Decisão 5 · Anomalia gerenciada e resposta com alçada |
| AWS Resilience Hub + FIS | RTO/RPO como gate e game days | Platform (devsecops) | compartilhado | Decisão 6 · Resiliência verificada contínua |

## Arestas (fluxo do diagrama)

As ligações entre os nós, na ordem do fluxo. A coluna de fronteira marca o que cruza um limite de confiança.

| # | origem | destino | o que flui | canal | cruza fronteira |
|---|---|---|---|---|---|
| 1 | blocos de domínio | AWS Distro for OpenTelemetry (ADOT) | logs, métricas e traces instrumentados | OTel | não |
| 2 | AWS Distro for OpenTelemetry (ADOT) | Amazon CloudWatch | métrica e log nativos | fan-out | não |
| 3 | AWS Distro for OpenTelemetry (ADOT) | Datadog (APM, via exporter) | traces e métricas ao vivo | fan-out | sim, plataforma → SaaS |
| 4 | Amazon CloudWatch | Amazon S3 (camada raw) | logs e spans para evidência | subscription → Firehose | não |
| 5 | Amazon S3 (camada raw) | `04-plataforma-dados` | telemetria sob enforcement do lake | dado governado | não |
| 6 | Amazon CloudWatch | AWS Systems Manager (Automation) | alarme dispara runbook, com alçada | remediação | não |
| 7 | Amazon CloudWatch | Amazon DevOps Guru | métricas e eventos da própria conta para correlação | análise por conta habilitada | não |
| 8 | AWS Resilience Hub + FIS | `15-devsecops-plataforma` | avaliação de RTO/RPO como gate | pipeline | não |

## Ferramentas

- [AWS Distro for OpenTelemetry (ADOT)](https://aws.amazon.com/otel/) · [OpenTelemetry](https://opentelemetry.io/)
- [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/)
- [Datadog](https://www.datadoghq.com/)
- [Amazon S3](https://aws.amazon.com/s3/)

## Referências AWS

- [Observability with Logs, Traces, and Metrics](https://d1.awsstatic.com/architecture-diagrams/ArchitectureDiagrams/observability-with-logs-traces-metrics-ra.pdf) · AWS Reference Architecture Diagrams · lido em 2026-07-03
- [Analytics Observability on AWS](https://docs.aws.amazon.com/solutions/analytics-observability-on-aws/) · AWS Solutions Library · lido em 2026-07-03
- [Financial Services Industry Lens · Reliability](https://docs.aws.amazon.com/wellarchitected/latest/financial-services-industry-lens/reliability.html) · AWS Well-Architected · lido em 2026-07-03

## Pontos de customização por instância

- Backend de APM: Datadog (default) ou equivalente, atrás do OTel sem reinstrumentar (Decisão 1 · OpenTelemetry como ponto único).
- Jornadas críticas de negócio, que definem quantos SLO existem (Decisão 3 · SLO por jornada de negócio).
- Retenção e amostragem de trace por classe, conforme a exigência regulatória.

## Dimensões transversais que tocam este bloco

- **Governança.** Governança de TI vive como capítulo aqui.
- **Enablement.** Política de uso, capacitação, adoção e operating model como seção aqui.

## Questionário de negócio

Observabilidade é consumo derivado do volume de evento e de invocação, sem pergunta de negócio própria. Volume de trace e log deriva de invocações por mês, que derivam das transações dos domínios. Número de jornadas críticas define quantos SLO existem, e isso vem do desenho de produto de cada domínio. As fórmulas de consumo que esses volumes dirigem estão em 14.2-calculadora.

## Fora de escopo

A trilha imutável de auditoria, que é da fundação (`00-fundacao`). A instrumentação específica de cada domínio, que vive em cada domínio.
