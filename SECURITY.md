# Segurança

## Reporte

Falha de segurança não vai para issue pública. Use GitHub Security Advisory do repositório ou escreva ao mantenedor pelo contato público do perfil.

Inclua:

- versão ou commit;
- passos de reprodução;
- impacto observado;
- arquivo, rota ou comando envolvido;
- dado sensível exposto, se houver.

## Escopo

Entram no escopo:

- vazamento de credencial, token, chave ou conta real;
- caminho que permita ler arquivo fora da pasta permitida pela tela;
- execução de comando não pedido;
- escrita em nuvem quando a ação prometida era só gerar, revisar ou planejar;
- pacote gerado com dado de outro usuário.

Fica fora do escopo:

- falha causada por fork modificado sem reprodução na árvore principal;
- recurso AWS gerado que falha no apply por serviço ainda não mapeado, quando o arquivo já declara a limitação;
- custo de nuvem causado por apply feito fora do bioma.sh.

## O que a ferramenta toca

- Credencial AWS: só o ambiente do usuário. No perfil `local`, o comando sobrescreve por credencial falsa e aponta para o emulador.
- Chave de modelo: `OPENAI_API_KEY` ou `~/.bioma/openai.key`, usada só para leitura de imagem quando a pessoa aciona esse caminho.
- Contas cadastradas: `tela/contas.json`, ignorado pelo Git.
- Projetos recentes: `tela/recentes.json`, ignorado pelo Git.
- Tela: servidor local em `localhost`.

## O que nunca entra no repositório

`.env`, `*.key`, `tela/contas.json`, `tela/projeto.json`, `tela/recentes.json`, estado Terraform, cache Terragrunt, `node_modules`, `__pycache__` e `.DS_Store`.
