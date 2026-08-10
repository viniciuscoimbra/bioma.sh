## Why

Um time abre uma PR e quer a infraestrutura daquela mudança de pé numa conta que já tem infraestrutura permanente: `mesa-credito-dev`, dentro da OU do domínio. Quando a PR fecha, aquilo precisa sumir sem tocar no que já estava lá.

O risco não é hipotético: se o pipeline da PR aplicar contra o mesmo estado da infra permanente, o apply vira incremento e o destroy vira roleta. O mercado resolve isso com quatro isolamentos (estado, escopo de execução, leitura da base, permissão), e nenhum deles é feature de uma ferramenta só.

O bioma hoje entrega dois desses quatro, e por acidente: o estado é isolado por caminho porque o Terragrunt funciona assim, e o escopo existe porque a receita sai por área. Falta o que torna a stack efêmera de fato: prefixo de PR no estado, tag em todo recurso, base entrando por leitura, e o workflow que cria na abertura e destrói no fechamento.

O conceito já está declarado na arquitetura de referência do cliente: `catalogo/artefatos/ambiente-efemero`, dono `plataforma/esteira`, com o contexto "stack por PR e por candidato; aplicada pela esteira, nunca pelo live", e status "planejada (contrato definido; interior por construir)". Este change constrói o interior.

## What Changes

- Multiplicidade `×pr` no desenho: peça marcada assim nasce em `live/<domínio>/efemero/` e só existe enquanto a PR existir.
- O `root.hcl` gerado passa a aceitar backend S3 com a chave do estado prefixada pela PR, e mantém o backend local como padrão de quem só está desenhando.
- Todo recurso da árvore sai com tag de rastreio (`Ephemeral`, `PRNumber`, `CriadoEm`, `TTL` quando efêmero; `Dominio` e `Ambiente` sempre), porque sem tag não existe faxina nem permissão condicional.
- Peça efêmera que aponta para peça permanente é resolvida por leitura (`terraform_remote_state`), e nunca por `dependency`, para que o plano da PR não consiga alterar a base.
- O bioma gera o workflow de PR: abre, aplica no escopo da PR; fecha, destrói o mesmo escopo; agendado, varre o que passou do TTL.
- A receita da tela e do comando ganha a variante efêmera, com o número da PR à vista.

## Capabilities

### New Capabilities

- `ambiente-efemero`: o que a ferramenta garante quando a stack é de uma PR.

## Impact

- Quem já gera árvore hoje não vê diferença: sem `×pr` no desenho, nada muda.
- O backend S3 exige que o balde de estado exista antes, e isso passa a estar escrito na receita.
- A tag em todo recurso muda a árvore gerada de quem já usa, e a árvore de referência dos portões precisa ser atualizada no mesmo commit.
