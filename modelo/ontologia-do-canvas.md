# A ontologia do canvas: o que é cada coisa, e como ela se organiza na tela

Este documento existe porque a IDE ficou difícil de usar por falta dele. As
palavras se atropelavam — `trilho` nomeava três coisas, `fase` guardava duas —,
e o canvas desenhava tudo no mesmo degrau porque nada dizia que havia degraus.

Cada afirmação aqui foi medida numa árvore de 416 células em produção.

---

## 1. As quatro perguntas que não são a mesma

O erro de fundo foi tratar como uma coisa só o que são quatro eixos
independentes. Um elemento responde às quatro ao mesmo tempo.

| eixo | a pergunta | exemplo | na tela |
|---|---|---|---|
| **nível** | do que isto é feito? | célula → molécula → serviço → átomo | o `+` desce |
| **dimensão** | onde isto vive? | conta · região · ambiente | o seletor troca |
| **multiplicidade** | de quantos se precisa? | compartilhado · por conta · por instância | colapsa ou alinha |
| **estado** | isto existe de verdade? | no ar · escrito sem célula · sem receita | a cor diz |

Confundir nível com dimensão foi o que desenhou o AWS Organizations no mesmo
degrau de uma conta. **Conta e região não são degraus: são eixos que cortam
todos os degraus.**

---

## 2. Os níveis

Do modelo de doze níveis (`infraestrutura-como-biologia.md`), estes são os que
o canvas desenha:

    átomo      um `resource` do provider
    molécula   um `module`: recursos que só funcionam juntos
    serviço    o agrupamento que o desenho de arquitetura mostra como um ícone
    célula     uma unit terragrunt, com fronteira e estado próprios
    órgão      células que juntas cumprem uma função (o alcance)
    sistema    o domínio de negócio
    organismo  um ambiente inteiro, atravessando contas
    ecossistema a Organization: territórios, regras herdadas, e quem não é nós

**O nível não sai do caminho da célula.** Medido: nas 416, quatro segmentos
significam coisas diferentes por posição. Ele sai do que a receita CRIA, contra
a tabela escrita em `ferramentas/niveis_aws.json`: dos 204 tipos de recurso do
catálogo, 28 falam com a Organization e o resto mora numa conta.

**`serviço` é o degrau que faltava.** Uma célula de inspeção de egress abre em
22 átomos, e o desenho de arquitetura mostra dois ícones. `mapa_recursos.json`
agrupa os 22 em vpc · network firewall · nat gateway — que são exatamente os
ícones. Sem esse degrau, o `+` desce fundo demais.

---

## 3. As dimensões

    conta        fronteira de isolamento e de fatura
    região       onde o equipamento está; zona local é dimensão dela
    ambiente     produção, homologação, desenvolvimento

Dimensão **não vira aba**. Ela vira seletor, porque multiplica o mesmo desenho
em vez de dividi-lo. Cinquenta contas em cinquenta abas não se leem; cinquenta
contas num seletor, sim.

---

## 4. A multiplicidade, e a regra de colapsar

Ela é MEDIDA do que varia entre as células da mesma receita, não declarada — a
árvore é a verdade, e peça declarada compartilhada e instanciada por conta
mentiria na ficha sem ninguém perceber.

    compartilhado               uma célula só
    compartilhado por ambiente  uma por ambiente, e a conta é do ambiente
    por conta                   a conta varia DENTRO do mesmo ambiente
    por instância               o nome varia na mesma conta

E ela governa a decisão de desenho:

- **colapsa** o que é idêntico e não difere em nada que importe — dez
  associações iguais viram uma seta rotulada;
- **alinha** o que é paralelo — três contas de um domínio ficam lado a lado,
  com a diferença anotada, porque a diferença é o que o desenho existe para
  mostrar.

---

## 5. O estado

O que a conferência procura, e o que a cor tem que dizer:

    no ar                  tem célula e apply registrado
    célula sem apply       tem célula e nunca rodou
    escrito sem célula     a receita existe no catálogo e nenhum elemento aponta
    fronteira              não é nosso; não se aplica, se declara
    mora noutro bloco      a ligação atravessa para outra página

Os cinco saem do `.bio` desde que ele carregue o catálogo INTEIRO, e não só o
que subiu. Medido: 240 das 416 células têm apply registrado; 14 receitas estão
escritas e sem célula; 8 fronteiras não têm célula por construção.

---

## 6. As superfícies da tela

    catálogo     as peças escolhidas para este projeto
    recursos     tudo que se poderia usar (os tipos do provider)
    canvas       onde os elementos e as relações vivem
    página       uma vista sobre os mesmos elementos; é a aba
    Todas as Páginas  a visão geral, que garante que ninguém ficou órfão
    inspetor     a ficha do elemento escolhido
    tabela       os componentes da página: nome · por que existe · zona · multiplicidade

A **página não é o bloco**. Um bloco da arquitetura de referência tem várias
vistas: medido, o bloco de rede tem sete desenhos, e quatro deles têm célula por
trás. A página é a vista, e ela declara o modo.

---

## 7. Os modos de disposição

O que ordena os elementos na página. O modo não é gosto: ele sai do que o bloco
é.

| modo | quando | como se organiza |
|---|---|---|
| **hierarquia** | há árvore declarada (`pai`) | contêineres aninhados |
| **topologia** | um compartilhado com pontas | quem consome → o compartilhado → o que está fora |
| **planos** | um compartilhado com faixas internas | faixas dentro do contêiner |
| **repetição** | N instâncias paralelas | N colunas idênticas, a diferença anotada embaixo |
| **sequência** | um caminho, não uma estrutura | cadeia de saltos, sem contêiner |

---

## 8. O elemento que abre

Um elemento pode conter um mundo. O `+` desce um nível — página → domínio →
órgão → célula → molécula → serviço → átomo — e a escada sai do código.

Quando o de dentro tem explicação própria (passos, decisões), o `+` não expande:
ele leva a uma **página ancorada**, e o elemento vira uma chamada com ícone.
Isso deixou de ser conveniência: medido, cinco dos nove componentes do desenho
de barramento moram em outro bloco.

"Classe" não é um elemento à parte: é uma chamada colapsada.

---

## 9. O teste de usabilidade

A IDE está usável quando estas seis perguntas se respondem sem sair do canvas:

    o que existe aqui?          os elementos da página
    isto subiu?                 o estado, na cor
    de quantos eu preciso?      a multiplicidade
    o que tem dentro?           o `+`
    quem fala com quem?         as ligações, classificadas
    por que isto existe?        a ficha, no inspetor e na tabela

Hoje: a primeira e a quarta respondem. A segunda tem o dado e não tem a cor. A
terceira está no `.bio` desde 2026-09-08. A quinta não responde — as 600 setas
dizem todas "dependência". A sexta tem o texto e não tem onde aparecer.
