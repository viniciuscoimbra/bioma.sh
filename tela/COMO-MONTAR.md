# Como montar uma arquitetura na tela

```bash
python3 tela/servidor.py     # http://localhost:8000
```

Para ver funcionando antes de montar o seu: <http://localhost:8000/?exemplo=1>

## O caminho, com um exemplo de verdade

Vamos montar telemetria: o log da plataforma vira evidência guardada na conta de dados, e a anomalia é analisada em cada conta.

**1. A primeira peça.** Busque `cloudwatch_log_group` e clique. Ela nasce no canvas e o painel da esquerda passa a perguntar onde ela mora.

**2. Onde ela mora.** Escolha `plataforma`. A peça entra na região da plataforma, que aparece desenhada no canvas.

**3. Quantas existem.** Deixe `uma compartilhada`. Isso decide quantas pastas nascem: uma por plano, ou seja duas (nao-prod e prod).

**4. A segunda peça.** Busque `s3_bucket`, escolha `dados` como conta. Repare que ela nasceu como **tecido permanente**, em vermelho, e que a razão aparece à direita: guarda evidência que não volta igual se for refeita.

**5. Ligue as duas.** Com a primeira escolhida, clique em `ligar em outra` e depois clique na segunda. A linha nasce verde com o rótulo **ligação**, e a razão aparece à direita: origem e destino em contas diferentes pedem permissão dos dois lados.

**6. Leia a estrutura.** À direita, a árvore com os arquivos. O que estiver marcado em vermelho como `falta responder` é ficha de preenchimento pendente. Clique em qualquer arquivo para ler o conteúdo.

**7. Rode.** O comando da base é o que você executa. Enquanto houver pendência, ele mostra o verificador de preenchimento; quando não houver, mostra o comando de criar.

## O que cada cor quer dizer

| cor | onde | o que quer dizer |
|---|---|---|
| vermelho | tecido da peça | permanente: não cai por rotina |
| âmbar | tecido da peça | estável: cai com janela declarada |
| verde-limão | tecido da peça | efêmero: cai |
| verde da marca | linha entre peças | ligação: atravessa conta e pede permissão dos dois lados |
| cinza | linha entre peças | aresta interna: mesma conta, mesmo alcance |
| vermelho | árvore de arquivos | ficha por responder |

## O que a tela não faz

Ela não aplica nada na nuvem. Ela escreve a especificação, a estrutura e os arquivos, e mostra o comando. Rodar o comando é decisão sua, no terminal.
