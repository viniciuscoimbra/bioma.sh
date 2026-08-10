## ADDED Requirements

### Requirement: Peça de fundação sai do catálogo, e não de átomo escrito na hora
Peça cujo termo consta na tabela de fundação SHALL virar célula que aponta para o
organismo do catálogo nomeado por ela. O gerador SHALL NOT escrever recurso
dentro de `catalogo/organismos/fundacao/` na árvore de saída, porque o interior
já existe, foi validado e é a fonte.

#### Scenario: Organization desenhada
- **WHEN** o desenho tem uma peça `AWS Organizations`
- **THEN** a célula aponta para o organismo `fundacao/organizacao` do catálogo, e o `main.tf` que chega na árvore é o do catálogo, com `feature_set = "ALL"`, os tipos de política habilitados e `prevent_destroy`

#### Scenario: Conta desenhada
- **WHEN** o desenho tem uma peça `AWS Organizations Account` com nome, email e OU
- **THEN** a célula aponta para `fundacao/conta-governada`, e os inputs pedem nome, email e OU, cada um com a pergunta em português

#### Scenario: OU desenhada
- **WHEN** o desenho tem uma peça `AWS Organizations OU`
- **THEN** a célula aponta para `fundacao/arvore-ous`, e nenhuma `aws_organizations_organization` é escrita junto

### Requirement: Termo de fundação que a tabela não conhece sai pendente
Termo que parece de fundação e não consta na tabela SHALL sair como pendente, com
a razão escrita em português ao lado. A ferramenta SHALL NOT escolher recurso por
semelhança de nome, porque recurso plausível passa no lint e falha no apply.

#### Scenario: Serviço de fundação fora da tabela
- **WHEN** o desenho tem uma peça cujo termo a tabela de fundação não conhece
- **THEN** a peça sai pendente, dizendo qual termo não foi reconhecido e que a tabela precisa da entrada, e nenhum `.tf` é escrito para ela

#### Scenario: Termo ambíguo
- **WHEN** o desenho usa `organizations` sem qualificador
- **THEN** o termo resolve para a Organization, e a mesma resolução vale na tela e nas ferramentas

### Requirement: A árvore recusa a segunda Organization
Desenho com mais de uma peça que resolve para Organization SHALL fazer a
tradução recusar, nomeando as peças que colidem. A ferramenta SHALL NOT escrever
as duas, e SHALL NOT escolher uma em silêncio.

#### Scenario: Duas Organizations no mesmo desenho
- **WHEN** o desenho tem duas peças que resolvem para `fundacao/organizacao`
- **THEN** a tradução recusa com os dois nomes na mensagem e código de saída diferente de zero, e nenhum arquivo é escrito

### Requirement: A árvore diz que a landing zone está vazia
Enquanto o organismo `landing-zone` estiver `planejada`, a árvore gerada SHALL
dizer isso por escrito, nomeando que a fase 2 para na segunda unidade. A
ferramenta SHALL NOT preencher o interior dela, porque a escolha do módulo é
decisão humana.

#### Scenario: Fundação gerada com landing zone por construir
- **WHEN** alguém gera a árvore de uma fundação
- **THEN** a saída traz as unidades de organização, OUs, SCPs e contas, e um aviso escrito de que `01-landing-zone` está por construir e interrompe a fase 2

### Requirement: O caminho da fundação é coberto pelos portões
`exemplos/` SHALL ter uma entrada que descreve Organization, OU, SCP e conta, e
`testes/arvore-esperada` SHALL ter as células que essa entrada produz. Os
portões SHALL comparar as duas.

#### Scenario: Portão sobre a fundação
- **WHEN** `bash testes/portoes.sh` roda
- **THEN** a árvore de fundação gerada a partir do exemplo bate arquivo a arquivo com a de referência, e diferença reprova o portão
