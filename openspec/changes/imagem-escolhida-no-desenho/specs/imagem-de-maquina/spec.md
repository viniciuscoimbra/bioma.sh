## ADDED Requirements

### Requirement: A imagem é escolhida por nome e registrada por identificador
O desenho SHALL declarar a imagem por nome de catálogo (distribuição e versão),
e a ferramenta SHALL resolvê-lo para um identificador no momento do desenho,
registrando região e data da escolha. A receita gerada SHALL usar o
identificador registrado.

#### Scenario: Escolha no desenho
- **WHEN** quem desenha escolhe uma distribuição e uma versão
- **THEN** o projeto guarda o identificador resolvido, com a região e a data

#### Scenario: Nome sem imagem correspondente
- **WHEN** o nome escolhido não tem imagem na região do projeto
- **THEN** a ferramenta diz isso na hora da escolha, e não no apply

### Requirement: A receita não resolve imagem em tempo de apply
Receita de máquina SHALL NOT usar consulta à nuvem para escolher imagem. O
identificador SHALL chegar por variável.

#### Scenario: Receita com filtro de imagem
- **WHEN** uma receita traz consulta que resolve imagem por família ou padrão de nome
- **THEN** o portão reprova, porque a máquina renasceria diferente sem decisão

### Requirement: A escolha envelhece à vista
A ferramenta SHALL comparar o identificador registrado com a imagem mais
recente do mesmo nome de catálogo, e SHALL dizer quando há uma mais nova, com a
data das duas.

#### Scenario: Imagem registrada há meses
- **WHEN** existe imagem mais recente para o nome escolhido
- **THEN** a tela mostra a escolha atual, a candidata e a diferença de data, sem trocar nada sozinha
