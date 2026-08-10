# Decisão: build da tela e histórico

Data: 2026-08-10

## `tela/estatico` fica versionado

Quem quer só usar o bioma.sh roda `python3 tela/servidor.py` e abre o navegador. Esse caminho não exige Node, npm nem build local. Por isso o build da tela fica no repositório.

A alternativa recusada foi remover `tela/estatico` e exigir `npm ci && npm run build` antes de abrir a tela. Isso deixaria o clone mais puro, mas pioraria o primeiro uso.

## O histórico do Git não será reescrito agora

Remover arquivos gerados do índice não apaga o peso do histórico. Reescrever histórico com `git filter-repo` deixaria o clone menor, mas quebraria clones existentes e exige coordenação humana.

A decisão para publicação é não reescrever histórico. Se o dono decidir fazer isso, a janela certa é antes do primeiro push público.

## `@refy/ui` continua como cópia licenciada

`tela/refy-ui` segue versionado com `tela/refy-ui/LICENSE` e origem em `tela/refy-ui/ORIGEM.md`. Trocar por pacote publicado continua aberto no OpenSpec, porque depende de publicação fora desta máquina.
