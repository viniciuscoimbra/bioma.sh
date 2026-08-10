# bioma.sh

O bioma.sh transforma desenho de infraestrutura em árvore Terraform e Terragrunt, com pastas, `.tf`, `.hcl`, contratos e dependências entre as peças.

A pessoa desenha a infraestrutura sem saber Terraform. A ferramenta mostra o código nascendo enquanto ela monta, explica cada decisão que tomou e entrega a árvore pronta para baixar. Aplicar é do usuário, onde ele quiser. O bioma.sh nunca aplica em nuvem nenhuma.

## Para quem

Para arquitetos e engenheiros que precisam sair de um desenho para uma base de infraestrutura legível.

- Quem desenha escolhe recursos, contas, ambientes e ligações.
- Quem revisa lê a árvore, os arquivos e as razões da classificação.
- Quem opera aplica no próprio pipeline, com a própria credencial.

## O problema que resolve

Desenho de arquitetura costuma parar em imagem. O trabalho pesado vem depois: escolher o recurso certo do provider, separar state por dono e ciclo de vida, escrever `terragrunt.hcl`, ligar dependências e perguntar os valores que só a instância sabe.

O bioma.sh faz essa tradução e deixa o resultado em arquivo. Onde ele não sabe decidir, ele pergunta. Onde o catálogo não conhece o serviço, ele escreve isso no arquivo em vez de inventar recurso.

## Caminho do zero

As imagens abaixo ainda serão produzidas em `docs/imagens/`. Os nomes já estão reservados para o GIF ou sequência de telas do caminho do zero.

![Canvas vazio](docs/imagens/caminho-zero-01-canvas-vazio.png)
![Busca por S3 e Lambda](docs/imagens/caminho-zero-02-busca-s3-lambda.png)
![Ligação desenhada](docs/imagens/caminho-zero-03-ligacao-desenhada.png)
![Árvore e código](docs/imagens/caminho-zero-04-arvore-e-codigo.png)
![Zip baixado](docs/imagens/caminho-zero-05-zip-baixado.png)

## Instalação

Versões exigidas:

| Ferramenta | Versão |
|---|---:|
| Python | 3.9 ou maior |
| Node | 20 ou maior para construir a tela |
| Terraform | 1.11 ou maior para validar e planejar |
| Terragrunt | 0.80 ou maior para planejar a árvore |

Dependências de sistema:

| Ferramenta | Uso |
|---|---|
| `jq` | journal e JSON do comando |
| `aws` | plano e state local em emulador |
| `docker` | degrau local |
| `opa` | gate de durabilidade |
| Playwright Chromium | prova da tela |

Confira a máquina:

```bash
./bioma.sh --diagnostico
```

Instalação detalhada: [docs/instalacao.md](docs/instalacao.md).

## Primeiro uso

Menos de dez comandos, do clone até a árvore gerada:

```bash
git clone <repositorio> bioma.sh
cd bioma.sh
./bioma.sh --diagnostico
./ferramentas/baixar_esquema.sh
python3 ferramentas/traduzir_bloco.py exemplos/observabilidade.md --saida /tmp/bioma-proposta
python3 ferramentas/gerar_iac.py /tmp/bioma-proposta/proposta.json --destino /tmp/bioma-arvore --conferir
python3 tela/servidor.py
```

Abra `http://localhost:8000`. A árvore gerada fica em `/tmp/bioma-arvore`.

Para construir a tela:

```bash
cd tela/app
npm ci
npm run build
```

## Uso direto

```bash
python3 ferramentas/traduzir_bloco.py <especificacao>.md --saida <pasta>
python3 ferramentas/gerar_iac.py <pasta>/proposta.json --destino <arvore> --conferir
```

O comando `bioma.sh` imprime a receita de operação ou roda plano, conforme a ação:

```bash
./bioma.sh --perfil local --area <caminho>
./bioma.sh --perfil local --area <caminho> --destruir
./bioma.sh --perfil local --area <caminho> --plan
```

Criar e destruir infraestrutura fica no pipeline do usuário.

## Como funciona

O modelo usa vocabulário biológico para organizar infraestrutura:

- átomo: recurso do provider
- molécula: módulo Terraform
- célula: unit Terragrunt com state próprio
- ligação: dependência, grant, policy ou associação
- fronteira: sistema que o nosso Terraform não governa
- tecido: classe de durabilidade
- organismo: capacidade implantável
- hormônio: valor publicado por uma célula e lido por outra

Resumo curto: [docs/como-funciona.md](docs/como-funciona.md). Modelo completo: [modelo/infraestrutura-como-biologia.md](modelo/infraestrutura-como-biologia.md).

## O que tem aqui

```text
bioma.sh          comando local: receita, plano e diagnóstico
catalogo/         receitas genéricas: moléculas, organismos, ligações e artefatos
ferramentas/      tradutor, gerador, importador, diagnóstico e verificadores
tela/             servidor local e app React
politicas/        gate de durabilidade sobre plano Terraform
testes/           portões locais e árvore de referência
docs/             instalação, funcionamento e decisões públicas
modelo/           explicação longa do modelo
openspec/         mudanças combinadas, tarefas e specs
exemplos/         entrada de exemplo
```

## O que a ferramenta não faz

- Não decide arquitetura por você.
- Não aplica em nuvem.
- Não guarda credencial de nuvem.
- Não opera produção.
- Não substitui revisão de Terraform.
- Não promete que toda seta carrega valor por `dependency.outputs`; quando a regra não prova o encaixe, o valor fica na ficha.
- Não empacota todos os artefatos de esteira ainda; há tasks abertas em `openspec/changes/artefato-no-desenho/tasks.md`.

## Prova

Antes de propor mudança:

```bash
bash testes/portoes.sh
```

Cada task só fecha com o comando executado e o resultado observável anotado. A regra está em [CONTRIBUTING.md](CONTRIBUTING.md) e [AGENTS.md](AGENTS.md).

## Segurança

Falha de segurança segue [SECURITY.md](SECURITY.md). Não abra issue pública para segredo, credencial ou caminho que exponha instância de usuário.

## Licença

PolyForm Shield License 1.0.0, com titularidade de Skopia. Veja [LICENSE](LICENSE) e a decisão em [docs/decisoes/2026-08-10-licenca.md](docs/decisoes/2026-08-10-licenca.md).

O `@refy/ui` em `tela/refy-ui` tem licença própria Apache-2.0 e origem declarada em [tela/refy-ui/ORIGEM.md](tela/refy-ui/ORIGEM.md).
