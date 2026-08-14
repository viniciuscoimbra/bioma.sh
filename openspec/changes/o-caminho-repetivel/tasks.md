# Tasks

Ordem de execução: 4, depois 1 e 3, depois 2, depois 5. A quatro vem primeiro
porque é a que tem defeito em produção hoje, e porque as outras quatro escrevem
dentro da estrutura que ela cria.

Evidência esperada em cada item. Sem ela a task fica `[ ]` e o que falta é
anotado.

## 4 · A fila vira migração

- [ ] `contrato/fila.json` no framework: passo com número, título, áreas,
      exige, libera e papel de execução. **Evidência:** o arquivo, e a fila
      lida dele batendo com a sequência que o `bioma.sh` executa hoje, passo a
      passo, sem diferença.
- [ ] `bioma.sh` percorre o dado em vez dos blocos `if`. **Evidência:**
      `--listar-fila` antes e depois, saída idêntica.
- [ ] O papel de execução sai do passo. `esteira_pronta()` sai.
      **Evidência:** um passo que alcança conta sem o papel da esteira para
      antes de executar, nomeando a conta e o passo que a prepararia.
- [ ] Retomar continua da célula, e não do passo. **Evidência:** falha
      forçada na quinta de doze células; a retomada começa na quinta.
- [ ] Portão: a sequência declarada e a executada não divergem.
      **Evidência:** a execução do verificador com uma divergência plantada.

## 1 · Pré-requisito declarado

- [ ] Tabela de pré-requisitos no framework, com dono e o que cada um trava.
      **Evidência:** o arquivo, e a saída do pré-voo listando os três da
      fundação.
- [ ] O apply de perfil real para sem a declaração; o plano avisa.
      **Evidência:** as duas execuções, com o código de saída.
- [ ] A instalação pergunta cada um. **Evidência:** a sessão de instalação,
      com a pergunta e o registro da pendência.
- [ ] Leitura automática confirma a quota e avisa divergência.
      **Evidência:** a execução com declaração e quota real diferentes.

## 3 · Fio em vez de variável

- [ ] O pré-voo aponta variável pendente cuja produtora existe na árvore.
      **Evidência:** a saída nomeando `TG_KMS_BACKUP_ARN` e a célula que o
      produziria.
- [ ] Célula do organismo de chave no trilho de segurança da management, e a
      célula de backup passa a receber os dois ARNs por `dependency`.
      **Evidência:** o plano da célula de backup, sem as variáveis.
- [ ] Célula de chave na conta de DevSecOps, e o scan de ECR recebe o ARN por
      `dependency`. **Evidência:** o plano do scan, sem a variável.
- [ ] `TG_ROLE_BACKUP_ARN` não tem produtora no catálogo: ou nasce um
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

- [ ] Campo declarado na célula: `adiada` com razão e o que trava, `cedeu` com
      o caminho de quem assumiu. **Evidência:** as duas células da fundação
      declaradas, e a fila nua sem elas.
- [ ] A lista de exclusão passa a ser gerada da árvore.
      **Evidência:** o arquivo gerado igual ao escrito à mão, e depois o
      escrito à mão apagado.
- [ ] Ao fim da execução, as adiadas são listadas e as prontas são oferecidas.
      **Evidência:** a execução com uma adiada cujo valor chegou, e a resposta
      registrada no diário.
