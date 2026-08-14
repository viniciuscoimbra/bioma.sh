# Tasks

Ordem de execução: 4, depois 1 e 3, depois 2, depois 5. A quatro vem primeiro
porque é a que tem defeito em produção hoje, e porque as outras quatro escrevem
dentro da estrutura que ela cria.

Evidência esperada em cada item. Sem ela a task fica `[ ]` e o que falta é
anotado.

## 4 · A fila vira migração

- [x] `contrato/fila.json` na instância, com o leitor `ferramentas/fila.py` no
      framework. O dado é da instância porque os caminhos das áreas são dela; o
      formato e quem o lê são do framework, como já vale para `convencoes.json`.
      **Evidência:** `--listar-fila` antes e depois, 112 células idênticas e as
      mesmas áreas.
- [x] `bioma.sh` percorre o dado em vez dos blocos `if`. **Evidência:**
      `--listar-fila` antes e depois, saída idêntica.
- [x] O papel de execução sai do passo. `esteira_pronta()` sai.
      **Evidência:** passos 1 a 5 com `OrganizationAccountAccessRole`, 6 e 7
      com `esteira-apply`, e `--area consumidores` herdando o do passo 6.
- [ ] Parar antes de executar quando o passo alcança conta sem o papel,
      nomeando a conta. Depende de mapa célula para conta, que não existe.
- [ ] Retomar continua da célula, e não do passo. **Evidência:** falha
      forçada na quinta de doze células; a retomada começa na quinta.
      **Parcial:** o registro deixou de valer quando a área muda depois do
      apply, e era assim que a retomada pulava a área inteira sem fazer nada. A
      granularidade de célula depende de o comando saber o resultado por
      célula, e hoje `terragrunt run --all` responde pela área.
- [x] Portão: a fila declarada cobre a árvore, no pré-voo e no pipeline.
      **Evidência:** 32 áreas, 112 células, 0 problemas; com uma área
      inexistente e uma célula solta plantadas, os dois achados.

## 1 · Pré-requisito declarado

- [x] Tabela de pré-requisitos no framework, com dono e o que cada um trava.
      **Evidência:** o arquivo, e a saída do pré-voo listando os três da
      fundação.
- [x] O apply de perfil real para sem a declaração; o plano avisa.
      **Evidência:** as duas execuções, com o código de saída.
- [x] A instalação pergunta cada um. **Evidência:** a sessão de instalação,
      com a pergunta e o registro da pendência.
- [x] Leitura automática confirma a quota e avisa divergência.
      **Evidência:** a execução com declaração e quota real diferentes.

## 3 · Fio em vez de variável

- [x] O pré-voo aponta variável pendente cuja produtora existe na árvore.
      **Evidência:** `fio · 3 variável(is) com produtora declarada`, com a
      célula que falta a cada uma.
- [ ] Célula do organismo de chave no trilho de segurança da management, e a
      célula de backup passa a receber os dois ARNs por `dependency`.
      **Evidência:** o plano da célula de backup, sem as variáveis.
- [ ] Célula de chave na conta de DevSecOps, e o scan de ECR recebe o ARN por
      `dependency`. **Evidência:** o plano do scan, sem a variável.
- [x] `TG_ROLE_BACKUP_ARN` não tem produtora no catálogo: ou nasce um
      organismo, ou ela fica declarada como parâmetro com o dono.
      **Evidência:** a decisão escrita, e o pré-voo dizendo qual das duas.

## 2 · Passo à mão vira parâmetro

- [ ] A tabela de parâmetros passa a ser do framework, e a instância herda.
      **Evidência:** o manifesto de origem com o arquivo, e uma instalação
      nova recebendo a lista sem redigitar.
- [ ] Os quatro passos medidos entram: estado da landing zone, colheita dos
      números das contas, remoção das VPCs default, certificado da VPN.
      **Evidência:** para cada um, ou a execução automática com registro no
      diário, ou a pergunta na instalação.
- [ ] O estado da landing zone é lido, e não perguntado.
      **Evidência:** o organismo lendo o estado e a flag saindo da célula.

## 5 · Célula adiada

- [x] Campo declarado na célula: `adiada` com razão e o que trava, `cedeu` com
      o caminho de quem assumiu. **Evidência:** as duas células da fundação
      declaradas, e a fila nua sem elas.
- [x] A lista de exclusão passa a ser gerada da árvore.
      **Evidência:** o arquivo gerado igual ao escrito à mão, e depois o
      escrito à mão apagado.
- [x] Ao fim da execução, as adiadas são listadas, com o que falta a cada uma.
      **Evidência:** `fora da fila · 1 adiada(s) · 1 que cederam`, e a adiada
      com as três variáveis que ainda faltam.
- [ ] Perguntar, ao fim, se a adiada que ficou PRONTA roda agora, e registrar a
      resposta no diário. Hoje ela só é anunciada.
