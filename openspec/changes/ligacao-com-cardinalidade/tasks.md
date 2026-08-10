# Tasks — ligação com cardinalidade

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.

## 1. O contrato diz a verdade

- [x] **1.1 Cardinalidade no contrato das nove ligações.** _Evidência: `acesso-lake` e `boundary-ram` N:N; `associacao-tgw`, `politica-msk-cluster`, `politica-msk-consumidor` e `subscricao-logs` 1:N; `grant-kms`, `msk-conexao-privada` e `oam-link` 1:1._
- [x] **1.2 Verificador.** `ferramentas/verificar_cardinalidade.py` reprova divergência, e entrou no pré-voo do `bioma.sh`. _Evidência: no catálogo, `cardinalidade coerente em 9 ligações`, código 0. Ele passou a distinguir 1:N de N:N pela forma da variável (`map(object(` é coleção de pares): com `acesso-lake` adulterada para `1:N`, sai `acesso-lake: diz 1:N e recebe coleção de pares em grants, que é N:N`, código 1; restaurada, volta a zero._
- [x] **1.3 Os três contratos errados corrigidos.** _Evidência: `acesso-lake` dizia tabela/consumidor/recorte e implementa `grants` como mapa, agora N:N; `boundary-ram` dizia `principal_ou` e recebe duas listas, agora N:N; `politica-msk-cluster` agora declara `cardinalidade: 1:N`, `recebe: [cluster_arn, contas_consumidoras (lista)]` e `n_em: [contas_consumidoras]`, com o plural também no campo `recebe`._

## 2. A relação carrega

- [x] **2.1 Campo na relação.** O tradutor grava `cardinalidade` e a razão; a forma fica no contrato da ligação, que é quem decide. _Evidência: na proposta do bloco 00, `AWS Config -> todas as contas` sai 1:N e `AWS KMS -> AWS Backup` sai 1:1._
- [x] **2.2 Ponta plural vira 1:N.** _Evidência: nos seis projetos, 11 arestas 1:N e 51 1:1; em `fundacao.bio` são `blocos de domínio e plataforma` e `todas as contas`._
- [x] **2.3 Relação sem o campo vale 1:1.** _Evidência: `grafo_da_proposta()` cai em `1:1` quando a relação não traz o campo, que é o que toda relação era antes desta change._

## 3. Nada quebrou

- [x] **3.1 Portões.** _Evidência: compila ok, constroi ok, arvore ok, tela ok, em 32s._
- [x] **3.2 A árvore gerada não mudou.** _Evidência: portão `arvore` ok; o gerador não lê cardinalidade, e multiplicar célula por N é a change seguinte._
