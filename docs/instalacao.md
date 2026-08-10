# Instalação

## Versões

| Ferramenta | Versão | Bloqueia |
|---|---:|---|
| Python | 3.9 ou maior | servidor, tradutor, gerador e testes |
| Node | 20 ou maior | build da tela |
| npm | vem com Node | instalação da tela |
| Terraform | 1.11 ou maior | validação e plano |
| Terragrunt | 0.80 ou maior | plano da árvore gerada |

## Dependências de sistema

| Ferramenta | Uso | Obrigatória quando |
|---|---|---|
| `jq` | journal e leitura de JSON no comando | roda `bioma.sh` |
| `aws` | state local em emulador e plano em AWS | roda `--plan` |
| `docker` | degrau local em contêiner | quer plano local |
| `opa` | gate de durabilidade | quer reprovar delete e replace antes do apply |
| Playwright Chromium | prova da tela | roda `testes/portoes.sh` completo |

## macOS com Homebrew

```bash
brew install python node jq awscli terragrunt opa
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
python3 -m pip install playwright
python3 -m playwright install chromium
```

Docker vem do Docker Desktop.

## Linux com apt

```bash
sudo apt-get update
sudo apt-get install -y python3 python3-pip nodejs npm jq unzip curl docker.io
python3 -m pip install playwright
python3 -m playwright install chromium
```

Terraform, Terragrunt, AWS CLI e OPA seguem os instaladores oficiais de cada projeto.

## Diagnóstico

```bash
./bioma.sh --diagnostico
```

O diagnóstico só lê a máquina. Ele confere comandos, versões e itens opcionais, e imprime o comando de instalação quando algo falta.

## Primeiro uso

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
