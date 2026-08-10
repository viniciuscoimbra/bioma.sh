---
status: em construção, escrito seção a seção com o Vinícius
tipo: material didático
publico: estudantes de tecnologia em início de formação
---
# Infraestrutura como biologia: como entender Terraform e Terragrunt na prática

Infraestrutura na nuvem tem centenas de partes, e a dificuldade nunca é a parte isolada. É entender o que se combina com o quê, o que nasce e morre junto, quem manda em cada pedaço. A biologia resolveu esse problema de organização séculos atrás, e os níveis que ela usa para descrever a vida descrevem com precisão um ambiente de nuvem bem construído. Este artigo percorre esses níveis com um exemplo único do começo ao fim: o núcleo de um banco.

## As duas ferramentas

[Terraform](https://developer.hashicorp.com/terraform/intro) lê arquivos de texto que descrevem infraestrutura e cria essa infraestrutura de verdade na nuvem. Descreve-se o resultado desejado, não os passos: o Terraform compara o que existe com o que foi descrito e executa a diferença.

[Terragrunt](https://docs.terragrunt.com/) trabalha em cima do Terraform e resolve o que ele não resolve sozinho: qual pedaço de infraestrutura vai em qual conta, com quais valores, em que ordem, e como um pedaço descobre informação do outro.

## Dois termos que aparecem o tempo todo

**Provider** é o plugin que sabe conversar com um serviço: existe provider da AWS, do GitHub, do Datadog, do PostgreSQL. Sem provider, o Terraform não sabe criar nada. Documentação: [Providers](https://developer.hashicorp.com/terraform/language/providers).

**Registry** é o catálogo público onde todo provider documenta seus recursos, um a um: [registry.terraform.io](https://registry.terraform.io/). Ninguém decora nome de recurso; consulta-se o registry.

## A hierarquia e as relações

A biologia organiza a vida em níveis onde cada um é feito do anterior: átomos formam moléculas, moléculas formam células, células formam tecidos, e assim até o organismo. Nenhum nível substitui o outro; cada um existe porque o anterior, sozinho, não cumpre a função seguinte. A infraestrutura como código tem exatamente essa propriedade, e cada nível dela tem nome oficial na documentação das ferramentas. Este artigo é uma seção por nível:

| #   | biologia                | infraestrutura                                                                                                                                                                                               |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | átomo                   | um recurso declarado ([resource](https://developer.hashicorp.com/terraform/language/resources))                                                                                                              |
| 2   | molécula                | recursos que só funcionam juntos ([module](https://developer.hashicorp.com/terraform/language/modules))                                                                                                      |
| 3   | célula                  | um pedaço de infraestrutura com fronteira, interior e registro próprio ([unit](https://docs.terragrunt.com/getting-started/terminology/), [state](https://developer.hashicorp.com/terraform/language/state)) |
| 4   | trocas entre as células | como uma unit passa informação a outra ([inputs, outputs e dependency](https://docs.terragrunt.com/reference/hcl/blocks/#dependency))                                                                        |
| 5   | DNA e indivíduos        | código versionado e os ambientes que nascem dele ([module sources](https://developer.hashicorp.com/terraform/language/modules/sources))                                                                      |
| 6   | corpo e comportamento   | o que a receita cria e o conteúdo que chega por outra esteira (programa, dado, senha)                                                                                                                        |
| 7   | tecidos                 | o que se refaz toda hora e o que nunca volta ([lifecycle](https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle))                                                                      |
| 8   | órgão                   | units que juntas cumprem uma função de negócio ([stack](https://docs.terragrunt.com/features/stacks))                                                                                                        |
| 9   | sistema                 | órgãos de times diferentes ligados por função ([run queue](https://docs.terragrunt.com/features/stacks/run-queue/))                                                                                          |
| 10  | organismo               | um ambiente completo, atravessando as contas de todos os times                                                                                                                                               |
| 11  | ecossistema             | a Organization que governa tudo: territórios, regras herdadas e os seres que não são nós ([AWS Organizations](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html))            |
| 12  | biosfera                | todos os ecossistemas somados: várias Organizations e várias nuvens                                                                                                                                          |

Cada seção segue a mesma ordem: o conceito na biologia, o equivalente técnico com a documentação, a anatomia em pseudocódigo e depois o caso real, exemplos dentro e fora da AWS, as perguntas que costumam surgir, e a ponte para a seção seguinte. Referência cruzada no texto usa o nome do conceito, nunca o número. No fim, o caso completo: o núcleo bancário montado com tudo isso, só estrutura e relações.

> **Leia isto antes de continuar.**
>
> **A hierarquia é o mapa deste catálogo, não uma exigência das ferramentas.** Terraform e Terragrunt não obrigam ninguém a organizar infraestrutura em átomos, moléculas, células e tecidos. Uma unit pode executar arquivos `.tf` ao lado dela, sem módulo nenhum; um módulo pode agrupar o que o autor quiser; uma stack pode ser implícita ou declarada. O que este artigo ensina é o desenho adotado aqui, e os nomes servem para tornar as regras dele memorizáveis. Confundir as duas coisas leva a cinco erros comuns: 
> - criar um módulo para cada recurso
> - criar um state por pasta sem olhar dono e ciclo de vida
> - achar que um domínio precisa caber numa stack só
> - tratar diretório como fronteira de segurança,
> - supor que infraestrutura em duas regiões é a mesma coisa copiada.
>
> **O que este artigo entrega.** Preparo para ler e instanciar o catálogo: entender o que é cada peça, quem manda nela, o que nasce junto e o que morre junto. Ele não é suficiente para operar uma aplicação complexa, como um núcleo bancário: testes, esteira, desvio de configuração, adoção de recursos existentes, migração de estado, custo e recuperação de desastre têm tratamento próprio, e a última seção diz onde cada um está.
>
> **Os trechos de código são recortes**, não arquivos completos, com exceção do exemplo principal da molécula, que é válido de ponta a ponta. Recorte serve para mostrar a parte que está sendo explicada.
>
> **O que convém já saber:** que uma conta é o espaço isolado onde os recursos existem e a fatura é cobrada; que região é onde os equipamentos ficam; que toda ação na nuvem exige uma permissão; e que todo recurso tem um identificador único e global, chamado ARN na AWS.

---

## 1. Átomo

### O que é na biologia

A menor unidade de um elemento químico. Um átomo de oxigênio tem propriedades próprias (peso, capacidade de se ligar), e sozinho não forma ar nem água. Matéria-prima ganha função ao se combinar. E átomos se conectam por ligações: a água existe porque dois átomos de hidrogênio se ligaram a um de oxigênio.

### O equivalente no Terraform

O bloco [`resource`](https://developer.hashicorp.com/terraform/language/resources): a menor declaração de gestão que o Terraform sabe endereçar. O tamanho do objeto não importa: um cluster de banco e um alarme são o mesmo nível, uma declaração cada, do mesmo jeito que urânio e hidrogênio são átomos.

Duas ressalvas que evitam confusão adiante. Uma declaração pode representar nenhum, um ou vários objetos, quando ela é escrita para repetir. E declarar não significa sempre criar: um recurso também pode [adotar](https://developer.hashicorp.com/terraform/language/import) algo que já existe na nuvem, passando a cuidar dele sem tê-lo criado.

### A anatomia

```hcl
resource "<elemento>" "<apelido>" {
  <propriedade> = <valor>
  <propriedade> = <elemento>.<apelido>.<atributo>   # ligação: o valor vem de outro átomo
}
```

Na hierarquia, cada parte é:

- **`<elemento>`**: a espécie do átomo, como a casa dele na tabela periódica. Vem do provider e está no registry. Exemplo: `aws_lambda_function`.
- **`<apelido>`**: o nome local que damos a este átomo para citá-lo em outros pontos do código. Não existe na nuvem; existe no nosso texto.
- **`<propriedade> = <valor>`**: as características deste átomo. O que no oxigênio seria o peso e a valência, aqui é o nome público, a versão da linguagem, a memória.
- **`<propriedade> = <elemento>.<apelido>.<atributo>`**: uma **ligação**. Ligação é qualquer propriedade cujo valor, em vez de escrito à mão, vem de um atributo de outro átomo. Os dois ficam amarrados: um precisa do outro para funcionar.

### O caso real

```hcl
resource "aws_lambda_function" "consumidor_comandos" {
  function_name = "consumidor-comandos"     # valor escrito à mão: o nome público na nuvem
  runtime       = "python3.13"              # valor escrito à mão: a linguagem que executa
  handler       = "app.principal"           # valor escrito à mão: onde o código começa
  role          = "???"                     # deveria vir de OUTRO átomo: aqui nasce a ligação
}
```

As quatro linhas são propriedades deste átomo. O que muda entre elas é a origem do valor: as três primeiras trazem valor escrito à mão, e a quarta deveria trazer o valor de outro átomo. É essa origem que cria a ligação, e é ela que está quebrada aqui: `role` precisa do atributo de um átomo do elemento `aws_iam_role`, a permissão que diz o que esta função pode acessar. Completa, a linha se escreveria assim:

```hcl
  role = aws_iam_role.permissao_consumidor.arn
```

Lê-se: a propriedade `role` recebe o atributo `arn` do átomo `aws_iam_role` apelidado `permissao_consumidor`. Esse átomo ainda não foi declarado por ninguém, e um átomo com ligação pendente não funciona.

### Exemplos de átomos

Na AWS: [`aws_lambda_function`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function) (função que executa código), [`aws_db_instance`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/db_instance) (banco relacional gerenciado), `aws_iam_role` (permissão), `aws_sqs_queue` (fila), `aws_cloudwatch_log_group` (destino de log).

Fora da AWS, porque átomo é conceito de provider: [`github_repository`](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/repository) (repositório no GitHub), [`datadog_monitor`](https://registry.terraform.io/providers/DataDog/datadog/latest/docs/resources/monitor) (alarme no Datadog), [`postgresql_schema`](https://registry.terraform.io/providers/cyrilgdn/postgresql/latest/docs/resources/postgresql_schema) (schema dentro de um PostgreSQL, rode ele onde rodar).

### Perguntas que podem surgir

#### Criei um schema dentro do RDS. O que é o quê?

São dois átomos, um dentro do outro no mundo físico e lado a lado no código:

```hcl
resource "aws_db_instance" "banco_ledger" {      # átomo do provider da AWS
  engine         = "postgres"
  instance_class = "db.r6g.large"
}

resource "postgresql_schema" "ledger" {          # átomo do provider do PostgreSQL
  name = "ledger"
}
```

O RDS é um átomo que o provider da AWS cria: uma máquina rodando PostgreSQL. O schema é um átomo que o provider do PostgreSQL cria, conectando **no endereço daquela máquina** (`aws_db_instance.banco_ledger.address`): essa é a ligação entre os dois. O físico diz "um mora dentro do outro"; o código diz "duas declarações, ligadas". Nesta hierarquia vale o código. E se a máquina fosse de um fornecedor, fora do nosso controle, o primeiro átomo simplesmente não existiria no nosso código; o schema continuaria sendo nosso, ligado a um endereço que recebemos de fora.

#### Por que a função sozinha não serve?

Na nuvem, nada tem permissão por padrão. Sem o átomo de permissão ligado a ela, a função sobe e não consegue ler nada. Sem o destino de log, falha sem deixar rastro.

#### Uma função e um banco de dados são o mesmo nível?

São: uma declaração cada. A diferença real entre eles é outra: o banco guarda dado que não volta se for perdido, e a função é descartável. Essa diferença muda o **tecido** onde cada um vive, não o nível.

#### Preciso decorar os elementos?

Não; são milhares. Consulta-se o registry. O que se aprende é o padrão de leitura: elemento, apelido, propriedades, ligações.

#### Isso é Terraform ou Terragrunt?

Tudo até aqui é Terraform. O Terragrunt aparece quando a pergunta mudar de "o que criar" para "em qual conta e com quais valores": isso acontece na **célula (unit)**.

### Antes de seguir

A ligação `role` aponta para um átomo de permissão que não foi declarado. Declarar só ele não resolve: a função também precisa de um destino de log e de um alarme, e os quatro átomos se ligam entre si. Um grupo de átomos ligados, tratado como uma coisa só, é o próximo nível: a molécula.

---

## 2. Molécula

### O que é na biologia

Átomos unidos por ligações, formando uma substância com propriedade que nenhum deles tinha sozinho. Água é dois átomos de hidrogênio ligados a um de oxigênio: separados, são gases; juntos, molham. E não existe meia molécula de água: tirando o oxigênio, o que sobra deixou de ser água.

Guarde também o **sítio de ligação**, que aparece o tempo todo daqui para a frente. Sítio de ligação é o pontinho da superfície de uma molécula onde outra molécula encaixa. Numa molécula grande, quase todos os átomos ficam no meio, escondidos, e nunca encostam em nada; só alguns pontos da superfície participam de ligação. A enzima é o exemplo clássico: ela é enorme e trabalha num pontinho só, que tem o formato exato da molécula parceira. Se o formato não bater, não encaixa. Duas ideias para levar: **a ligação acontece em pontos específicos**, e **o encaixe depende do formato**.

### O equivalente no Terraform

O [`module`](https://developer.hashicorp.com/terraform/language/modules): uma pasta de arquivos `.tf` que agrupa átomos, com as ligações entre eles já resolvidas por dentro.

Aqui convém separar o que a ferramenta permite do que este catálogo exige. O Terraform aceita qualquer agrupamento; o catálogo só aceita módulo cujos átomos tenham o mesmo dono, o mesmo ciclo de vida e a mesma política de mudança. É essa regra local, e não a ferramenta, que produz a indivisibilidade da molécula.

Essa molécula tem duas características que o átomo sozinho não tinha.

A primeira: ela é uma base que aceita troca de peça. O açúcar e o sal têm fórmula fixa, sempre a mesma. O álcool não: existe o álcool de limpeza, o álcool das bebidas e o álcool do combustível, todos com a mesma base, mudando uma peça só. A nossa molécula funciona assim. A base é sempre função com permissão, registro e alarme, e a cada uso trocamos as **peças que se trocam**, que aqui são o nome e o tamanho da memória.

A segunda: ela tem sítios de ligação. Quem usa a molécula alcança os pontos que ela deixa na superfície, e não os átomos do interior.

E vale a mesma advertência do átomo: módulo é descrição. Enquanto ninguém usa a molécula, nada existe na nuvem.

### A anatomia

```
<pasta da molécula>/
├── main.tf         os átomos e as ligações entre eles
├── variables.tf    as peças que se trocam
└── outputs.tf      os sítios de ligação
```

```hcl
# main.tf: os átomos, com as peças trocáveis no lugar de valores fixos
resource "<elemento>" "<apelido>" {
  <propriedade> = var.<peça que se troca>             # a peça, encaixada
  <propriedade> = <elemento>.<apelido>.<atributo>     # ligação interna, já resolvida
}

# variables.tf: declara uma peça que se troca
variable "<peça que se troca>" {
  type = <formato do valor>
}

# outputs.tf: expõe um sítio de ligação
output "<nome do sítio>" {
  value = <elemento>.<apelido>.<atributo>
}
```

Na hierarquia, cada parte é:

- **a pasta**: a molécula inteira. O nome dela nomeia a substância (`funcao-processadora`), como "água" nomeia H₂O.
- **os átomos e as ligações internas** (`main.tf`): as mesmas ligações da seção do átomo, com uma diferença: aqui todas apontam para átomos que existem dentro da própria pasta, então nenhuma fica pendente.
- **`var.<peça que se troca>`** (`variables.tf`): o ponto onde a molécula aceita variação, como a peça que separa um álcool do outro. O `type` é o formato aceito: texto, número, lista.
- **`output`** (`outputs.tf`): um sítio de ligação, o ponto da superfície onde outra molécula encaixa. O interior continua interior: de fora ninguém alcança os átomos de dentro.

### O caso real

A molécula `funcao-processadora` fecha a ligação que ficou quebrada na seção do átomo:

Este é o único trecho completo do artigo: ele roda como está.

```hcl
# moleculas/funcao-processadora/main.tf

resource "aws_iam_role" "permissao" {
  name = "${var.nome}-permissao"

  assume_role_policy = jsonencode({           # quem tem o direito de vestir este crachá
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_cloudwatch_log_group" "registro" {
  name              = "/aws/lambda/${var.nome}"
  retention_in_days = 30
}

resource "aws_lambda_function" "funcao" {
  function_name    = var.nome
  runtime          = "python3.13"
  handler          = "app.principal"
  memory_size      = var.memoria_mb
  role             = aws_iam_role.permissao.arn   # a ligação, fechada
  filename         = var.pacote_inicial           # o programa que a função nasce executando
  source_code_hash = filebase64sha256(var.pacote_inicial)
}

resource "aws_cloudwatch_metric_alarm" "alarme" {
  alarm_name          = "${var.nome}-erros"
  namespace           = "AWS/Lambda"              # de qual serviço é a métrica
  metric_name         = "Errors"
  statistic           = "Sum"
  comparison_operator = "GreaterThanThreshold"
  threshold           = 0
  evaluation_periods  = 1
  period              = 300
  dimensions          = { FunctionName = aws_lambda_function.funcao.function_name }
}
```

Repare no alarme: o nome da métrica sozinho não identifica nada. É a dupla `namespace` mais `metric_name` que diz qual medida observar, e sem os limites (`threshold`, quantas vezes seguidas, em que intervalo) não existe alarme, existe só um nome.

```hcl
# moleculas/funcao-processadora/variables.tf
variable "nome"           { type = string }
variable "memoria_mb"     { type = number }
variable "pacote_inicial" { type = string }   # caminho do zip que a função executa ao nascer

# moleculas/funcao-processadora/outputs.tf
output "nome_da_funcao" { value = aws_lambda_function.funcao.function_name }
output "permissao_arn"  { value = aws_iam_role.permissao.arn }
```

Quatro átomos, três ligações internas, três peças que se trocam, dois sítios de ligação. A propriedade nova que nenhum átomo tinha: isto processa, com permissão, deixando rastro e avisando quando falha.

### Exemplos de moléculas

Na AWS: função + permissão + destino de log + alarme (a de cima); bucket S3 + bloqueio de acesso público + regra de expiração dos objetos; fila + a fila de mensagens mortas para onde vão as falhas + a política de quem pode escrever.

Fora da AWS: repositório GitHub + proteção da branch principal + webhook de integração; monitor Datadog + a janela de silêncio para manutenção.

### Perguntas que podem surgir

#### O que entra na molécula e o que fica fora?

O teste tem uma frase: **se dá para precisar de um átomo sem o outro, eles são de moléculas diferentes.** A permissão desta função entra, porque não serve para mais ninguém. A fila de onde vêm os comandos fica fora: outras funções leem a mesma fila, e ela continua existindo se esta função for apagada. O cofre de senha fica fora: a senha troca num ritmo próprio, que ignora a função. Dono diferente ou ritmo de vida diferente empurram o átomo para fora.

#### A molécula já cria algo na nuvem?

Não. Molécula é receita escrita, e receita não cozinha sozinha. Ela cria átomos de verdade quando alguém a usa em algum lugar, encaixando as peças que se trocam. Esse "algum lugar" tem fronteira, valores e registro próprios: a célula, na próxima seção.

#### Como alguém usa a molécula?

Com um bloco `module`, que aponta para a pasta dela e encaixa as peças:

```hcl
module "consumidor" {
  source     = "../moleculas/funcao-processadora"
  nome       = "consumidor-comandos"
  memoria_mb = 512
}
```

Cada uso desses cria um conjunto novo e independente de átomos. Usar a mesma molécula três vezes gera três funções, três permissões, três alarmes, sem nenhuma relação entre si: instanciação de um padrão.

#### Por onde uma molécula se liga na outra?

Pelo sítio de ligação, que é o único lugar acessível de fora. A molécula da fila expõe num sítio o endereço da fila que ela criou. A molécula da função tem uma peça que aceita justamente esse formato. Ligar as duas é encaixar uma coisa na outra:

```hcl
module "fila_comandos" {
  source = "../moleculas/fila-com-descarte"
  nome   = "comandos"
}

module "consumidor" {
  source = "../moleculas/funcao-processadora"
  nome   = "consumidor-comandos"
  fila   = module.fila_comandos.endereco_da_fila   # aqui as duas se ligam
}
```

A última linha é a ligação. `module.fila_comandos.endereco_da_fila` lê-se: da molécula apelidada `fila_comandos`, o sítio de ligação chamado `endereco_da_fila`. Repare que a função não recebe a fila inteira: recebe o endereço dela, que é o que estava exposto no sítio.

E a ligação faz mais do que passar um valor: ela cria ordem. O Terraform percebe que o consumidor depende da fila e cria a fila primeiro, sem que ninguém precise mandar. Ordem por dependência, não por instrução.

#### Ouvi falar em root module e child module. O que são?

Papéis, e o mesmo módulo pode ocupar os dois. Quando um módulo é chamado por outro (como no bloco `module` acima), ele é child. O ponto de partida da execução, a pasta onde o Terraform foi invocado, é o root. Nenhuma estrutura interna muda com o papel. Documentação: [Modules overview](https://developer.hashicorp.com/terraform/language/modules).

#### Por que não colocar tudo numa molécula gigante?

Porque o teste da primeira pergunta reprova na hora: a molécula gigante junta átomos que vivem em ritmos diferentes (o banco que guarda o razão do banco e a função descartável de processar). O custo real de misturar aparece na célula, onde cada conjunto ganha registro e ciclo de vida próprios.

### Antes de seguir

A molécula fechou as ligações e continua sendo papel. Três perguntas seguem sem resposta: em qual conta esses átomos vão nascer, com quais valores nas peças que se trocam, e onde fica anotado o que já foi criado de verdade na nuvem, para o Terraform saber a diferença entre criar e atualizar. Quem responde as três tem fronteira, interior e um registro próprio: a célula.

---
## 3. Célula

### O que é na biologia

A menor coisa viva. Uma bactéria é uma célula só e já está viva: come, cresce, se defende, se reproduz. Um átomo não faz nada disso, e uma molécula também não. Três características fazem a célula ser célula:

**Ela tem membrana.** A membrana é a fronteira que separa o de dentro do de fora. Ela não é uma parede fechada: deixa entrar o que a célula precisa e deixar sair o que ela produz, e barra o resto. Quem está fora nunca mexe direto no interior da célula; fala com ela pela membrana.

**Ela tem interior.** Dentro da membrana existe um monte de molécula trabalhando, e nada disso está exposto. A célula vizinha não sabe nem precisa saber o que tem lá dentro.

**Ela vive por conta própria.** Nasce, funciona e morre no ritmo dela, sem depender do ritmo da vizinha.

### O equivalente no Terragrunt

A [unit](https://docs.terragrunt.com/getting-started/terminology/): uma pasta com um arquivo `terragrunt.hcl` dentro. A documentação oficial define assim: uma instância de infraestrutura gerenciada pelo Terragrunt, **com state próprio**. Aqui o Terragrunt entra pela primeira vez, porque é ele que responde as três perguntas que sobraram da molécula.

A unit tem as mesmas três características da célula:

**Membrana**: os valores que ela recebe (`inputs`) e o que ela publica sobre si (os outputs do módulo que ela usa). Quem está fora encosta nisso, e em mais nada.

**Interior**: as moléculas e os átomos que ela cria. Ninguém de fora alcança.

**Vida própria**: ela é criada, alterada e destruída sozinha, sem arrastar as vizinhas junto. Isso existe por causa do [state](https://developer.hashicorp.com/terraform/language/state), o registro de qual objeto real na nuvem corresponde a cada nome escrito no código. Cada unit tem o seu, e é ele que permite mexer numa sem tocar na outra.

O state fica guardado fora, num arquivo, e ainda assim a célula não funciona sem ele: a definição oficial diz que toda unit tem o seu. Ele é a **ficha de identificação** da célula: para cada nome escrito no código, registra qual objeto de verdade na nuvem corresponde, com os atributos e as dependências daquela aplicação. Sem ficha, a célula continua viva e ninguém consegue provar que é ela: as moléculas estão lá, mas a identificação delas se perdeu.

### A anatomia

```
<pasta da unit>/
└── terragrunt.hcl      qual molécula usar, com quais valores, em qual conta
```

```hcl
terraform {
  source = "<endereço da molécula>"      # qual molécula esta célula é
}

inputs = {
  <peça que se troca> = <valor>          # as peças, encaixadas com valor de verdade
}
```

Na hierarquia, cada parte é:

- **a pasta**: a célula. O caminho dela diz onde ela vive (`core-banking/desenvolvimento/consumidor-comandos`).
- **`terraform { source = ... }`**: qual molécula esta célula usa. A mesma molécula, usada em pastas diferentes, produz células diferentes e independentes.
- **`inputs`**: as peças que se trocam, agora com valor concreto. É aqui que a mesma molécula vira uma célula pequena em desenvolvimento e uma grande em produção.
- **o state**: não aparece no arquivo. O Terragrunt cuida dele, e cada pasta ganha o seu automaticamente.

### Onde a célula vive

Nenhuma célula existe no vácuo. Toda célula nasce com endereço, e o endereço tem duas partes: a **conta** (o espaço isolado da nuvem que define quem manda nela, com permissões e fatura próprias) e a **região** (o lugar do mundo onde os equipamentos estão: São Paulo, Virgínia). As duas são escritas uma vez, na configuração do ambiente, e todas as células daquela pasta herdam:

```hcl
# gerado para cada célula a partir da configuração do ambiente,
# por um bloco generate escrito uma vez no topo do live
provider "aws" {
  region = "sa-east-1"                     # São Paulo

  assume_role {                            # é isto que leva a execução para a conta certa
    role_arn = "arn:aws:iam::111111111111:role/esteira-deploy"
  }

  allowed_account_ids = ["111111111111"]   # trava: recusa rodar se a conta não for esta
}
```

Duas linhas fazem coisas diferentes, e confundi-las é perigoso. `assume_role` é o que **leva** a execução para dentro da conta: sem ela, o comando roda com a credencial que estiver carregada na máquina, seja ela qual for. `allowed_account_ids` não leva a lugar nenhum: ela **recusa** continuar se a conta em uso não for a esperada. Uma é o caminho, a outra é a tranca.

Célula nenhuma escolhe endereço sozinha; ela herda o do ambiente onde está. E endereço não é enfeite: onde o dado pode ficar é decisão de residência aprovada pela instituição, sob a política do regulador, e não preferência técnica. A conta volta na seção do organismo, quando a pergunta for como os corpos se separam.

### O caso real

```hcl
# core-banking/desenvolvimento/consumidor-comandos/terragrunt.hcl

terraform {
  source = "../../../moleculas/funcao-processadora"
}

inputs = {
  nome       = "consumidor-comandos"
  memoria_mb = 512
}
```

Rodando `terragrunt apply` dentro dessa pasta, os quatro átomos da molécula nascem de verdade na conta de desenvolvimento, e o state daquela pasta passa a registrar quais objetos reais correspondem a eles.

A célula equivalente em produção é a mesma coisa com outro valor:

```hcl
# core-banking/producao/consumidor-comandos/terragrunt.hcl

terraform {
  source = "../../../moleculas/funcao-processadora"
}

inputs = {
  nome       = "consumidor-comandos"
  memoria_mb = 2048
}
```

Mesma molécula, duas células, dois states, duas contas. Mexer na de desenvolvimento não encosta na de produção.

### Exemplos de células

No núcleo bancário: a célula do consumidor de comandos (a de cima), a célula do livro-razão (o banco de dados que guarda cada lançamento), a célula da rede do domínio, a célula da fila de comandos.

Fora da nuvem: uma célula que cuida só dos repositórios de um time no GitHub, com o state dela. Célula é conceito de organização, não de fornecedor.

### Perguntas que podem surgir

#### Qual a diferença entre molécula e célula, na prática?

Molécula é a receita, escrita uma vez e usada muitas. Célula é um uso concreto dessa receita, num lugar concreto, com valores concretos e ficha de identificação própria. A receita de bolo está no livro; o bolo está no forno da sua casa.

#### Por que cada célula tem ficha de identificação separada?

Por três motivos. Segurança: um erro numa célula não pode apagar o que está em outra. Independência: dá para atualizar o consumidor sem tocar no livro-razão. Velocidade: o Terraform só compara o que está naquela ficha, e não a nuvem inteira.

#### O que acontece se eu perder a ficha de identificação?

A infraestrutura continua lá funcionando, e o Terraform passa a não reconhecer nada daquilo como seu. A tentativa de criar tudo de novo costuma nem chegar ao fim: nome que já existe provoca erro, e o que não exige nome único vira duplicata. A recuperação normal é voltar uma versão anterior da ficha, ou adotar de volta cada objeto pelo identificador dele. Por isso a ficha fica num lugar seguro, com versões preservadas e travada enquanto alguém mexe. É o Terragrunt que configura isso para cada célula.

#### O state não seria o DNA da célula?

Não. DNA é receita, e é a mesma em toda célula do organismo; a ficha é única de cada célula e muda toda vez que a infraestrutura muda, mesmo sem o código mudar em nada. O DNA aparece mais adiante neste artigo, e ele é o código versionado.

#### Uma célula pode mexer no interior da outra?

Não. A célula vizinha alcança a membrana e nada além dela: recebe valores publicados e pronto. Como um valor sai de uma célula e chega na outra é o assunto da próxima seção.

#### Uma cópia da mesma célula pode viver em outra região?

Pode: é outra célula, com ficha própria, nascida da mesma receita, com a região trocada na configuração do ambiente dela. Nada de nível novo, muda o endereço.

E aqui vem o aviso mais importante desta seção, porque a confusão é comum e cara: **duplicar células em outra região não é um plano de recuperação de desastre.** Célula copiada nasce vazia, e o que sustenta o negócio é o conteúdo. Um plano de verdade responde quanto tempo se pode ficar fora do ar e quanto dado se pode perder, e a partir dessas duas respostas escolhe entre três desenhos diferentes: guardar cópias de segurança em outra região e reconstruir quando precisar; manter uma versão reduzida ligada, com o dado sendo replicado o tempo todo; ou manter as duas regiões ativas ao mesmo tempo. Cada desenho tem custo, replicação de dado, redirecionamento de tráfego, chave de criptografia no destino e ensaio de retorno próprios. O endereço da célula é o começo do assunto, e não o assunto.

#### Onde termina o Terraform e começa o Terragrunt?

O Terraform constrói o interior de cada célula: cria átomos e agrupa moléculas. O Terragrunt cuida do que está fora dela: em qual conta a célula vive, quais valores ela recebe, onde fica a ficha de identificação e em que ordem as células nascem.

### Antes de seguir

A célula do consumidor precisa saber o endereço da fila de comandos, que nasce em outra célula, com outra ficha de identificação. Dentro de uma molécula isso era fácil, porque tudo estava na mesma pasta. Entre células é outra história: uma não enxerga o interior da outra. Como a informação atravessa a membrana é o próximo nível: as trocas entre as células.

---

## 4. Trocas entre as células

### O que é na biologia

Célula não vive sozinha. O corpo funciona porque uma célula avisa a outra o que está acontecendo, e existem duas formas de fazer isso.

**A primeira é falar com a vizinha, encostada.** Célula ao lado de célula, o recado passa direto de uma para a outra, sem espalhar. As células do intestino fazem isso o tempo todo: cada uma sabe o que a colega ao lado está fazendo.

**A segunda é o hormônio.** O pâncreas produz insulina e joga na corrente sanguínea. A insulina viaja o corpo inteiro e passa por todas as células, mas só age nas que têm o receptor certo para ela. As outras nem percebem. Esse é o jeito de avisar muita gente de longe: quem produz não precisa saber quem vai usar, e quem usa não precisa saber quem produziu.

Nos dois casos, o que atravessa é **informação**, nunca a peça inteira. O pâncreas não manda um pedaço de pâncreas para o músculo; manda um aviso químico.

### O equivalente no Terragrunt

As duas formas existem, e escolher entre elas é decisão de arquitetura.

**Vizinha encostada** é o bloco [`dependency`](https://docs.terragrunt.com/reference/hcl/blocks/#dependency): uma célula aponta para a pasta da outra e lê os valores que ela publicou. Funciona quando as duas pastas estão na mesma árvore de diretórios e são cuidadas pelo mesmo time. Quando as duas entram na mesma fila de execução, o Terragrunt ainda ordena o trabalho: primeiro a que publica, depois a que consome.

**Hormônio na corrente sanguínea** é o [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html): a célula que produz a informação grava num lugar comum; qualquer célula com permissão lê de lá. Serve quando as células estão em repositórios diferentes, em contas diferentes ou sob times diferentes, e é o caminho quando quem produz não pode conhecer quem consome. Ele é o padrão deste desenho para identificador estável (um endereço, um número de identificação), e não a única opção existente: nome de serviço costuma viajar por DNS, e segredo tem cofre próprio.

Nos dois casos, o que atravessa a membrana é informação: um identificador, um endereço, um nome. Nunca o objeto de infraestrutura.

### A anatomia

Vizinha encostada:

```hcl
# na célula que consome
dependency "<apelido da vizinha>" {
  config_path = "<caminho da pasta dela>"
}

inputs = {
  <peça que se troca> = dependency.<apelido da vizinha>.outputs.<sítio de ligação>
}
```

Hormônio:

```hcl
# na célula que produz: grava a informação no lugar comum
resource "aws_ssm_parameter" "<apelido>" {
  name  = "<caminho no lugar comum>"
  tier  = "Advanced"                    # exigido para compartilhar com outras contas
  value = <elemento>.<apelido>.<atributo>
}

# na célula que consome, em outra conta: lê pelo endereço completo
data "aws_ssm_parameter" "<apelido>" {
  name = "arn:aws:ssm:<região>:<conta de quem publicou>:parameter<caminho>"
}
```

Na hierarquia, cada parte é:

- **`dependency`**: o aviso de que existe uma vizinha, e onde ela está. Cria a ordem de nascimento.
- **`dependency.<apelido>.outputs.<sítio>`**: a leitura do sítio de ligação da vizinha, que é a única parte dela acessível de fora.
- **`aws_ssm_parameter`** (o `resource`): a célula despejando o hormônio na corrente. O `name` é o endereço onde ele fica.
- **`data`**: um bloco novo, e a diferença com `resource` é o coração desta seção. `resource` cria e passa a ser dono; [`data`](https://developer.hashicorp.com/terraform/language/data-sources) só lê o que já existe e não é dono de nada. Célula que lê hormônio usa `data`, porque ela consome a informação sem passar a mandar em quem produziu.

### O caso real

A fila de comandos nasce numa célula e o consumidor precisa do endereço dela.

Se as duas moram na mesma árvore, cuidadas pelo mesmo time, vizinha encostada resolve:

```hcl
# core-banking/desenvolvimento/consumidor-comandos/terragrunt.hcl

dependency "fila" {
  config_path = "../fila-comandos"
}

terraform {
  source = "../../../moleculas/funcao-processadora"
}

inputs = {
  nome       = "consumidor-comandos"
  memoria_mb = 512
  fila       = dependency.fila.outputs.endereco_da_fila
}
```

Agora o outro caso. A rede onde tudo isso vive é cuidada por outro time, em outra conta, em outro repositório. A célula da rede publica o hormônio:

```hcl
# na célula da rede, cuidada pelo time de rede
resource "aws_ssm_parameter" "id_da_rede" {
  name  = "/rede/core-banking/desenvolvimento/id"
  tier  = "Advanced"
  value = aws_vpc.dominio.id
}
```

O time de rede compartilha esse parâmetro com as contas que precisam lê-lo, e o consumidor usa a própria identidade, com permissão de leitura, citando o **endereço completo**, e não o caminho: dentro da conta de quem publicou, o caminho basta; vindo de fora, é preciso dizer de qual conta e de qual região aquele parâmetro é.

```hcl
# na nossa célula, em outra conta
data "aws_ssm_parameter" "id_da_rede" {
  name = "arn:aws:ssm:sa-east-1:222222222222:parameter/rede/core-banking/desenvolvimento/id"
}
```

O time de rede não sabe quem consome o parâmetro dele, e não precisa saber. Quem consome não alcança nada além daquele valor.

### Exemplos de troca

Vizinha encostada: a fila e o consumidor dela; a rede e o banco de dados que vive dentro dela, quando as duas pastas são do mesmo time.

Hormônio: o identificador da rede central, publicado pelo time de rede e lido por todos os domínios; o endereço do barramento de eventos; o nome do cofre de senhas compartilhado.

### Perguntas que podem surgir

#### Qual dos dois eu uso?

Se as duas células estão na mesma árvore de pastas e têm o mesmo dono, vizinha encostada, porque ela também organiza a ordem de criação. Se cruza repositório, conta ou time, hormônio. A regra por trás: quanto mais longe estiver o dono, menos as duas devem se conhecer diretamente.

#### Por que não deixar uma célula ler a ficha de identificação da outra?

Porque a ficha registra o interior inteiro, e o interior é privado. Quem lê ficha alheia passa a depender de detalhes que a vizinha nunca prometeu manter, e qualquer reorganização interna dela quebra quem estava espiando. A membrana existe para que a vizinha prometa poucos sítios de ligação e mude o resto quando quiser.

#### O que acontece se a vizinha ainda não existir?

A célula que consome não nasce, e o motivo muda conforme o caminho. Com hormônio, a leitura falha e o processo para, que é melhor do que criar algo apontando para o vazio. Com vizinha encostada, é preciso entender uma coisa que confunde muita gente: declarar a dependência **não cria** a vizinha. Quando as duas entram na mesma fila de execução, a fila respeita a ordem e aplica a produtora antes. Rodando o comando só na consumidora, a produtora precisa já existir, com a ficha e os valores publicados.

#### `data` e `resource` são a mesma coisa?

Não. `resource` cria e assume a posse: apagar a declaração normalmente destrói o objeto, salvo quando se pede explicitamente para apenas largar a gestão. `data` apenas consulta: apagar a declaração não destrói nada, porque o objeto nunca foi seu. E consultar é uma das formas de trazer informação de fora: valores também chegam pelas peças que se trocam e pela leitura da vizinha.

#### Isso não deixa tudo lento, uma célula esperando a outra?

Ordem só existe onde há dependência de verdade. Células que não dependem uma da outra nascem ao mesmo tempo. O Terragrunt monta a fila de execução a partir das dependências declaradas: [Run Queue](https://docs.terragrunt.com/features/stacks/run-queue/).

#### E quando o que eu preciso criar mora dentro da casa de outro time?

Acontece o tempo todo: o assunto do meu domínio dentro do serviço de mensagens que a plataforma mantém, a minha tabela dentro do catálogo central de dados, o meu espaço dentro de um banco compartilhado. A regra tem duas partes.

A casa é de quem a construiu, e continua de quem a construiu. O que nasce dentro dela é criado por **quem é dono do conteúdo**, usando um provider próprio para aquele serviço, com uma permissão que o dono da casa concedeu. E o endereço da casa chega por hormônio, como qualquer outra informação que atravessa fronteira.

Foi o caso que apareceu lá no átomo, com o espaço criado dentro de um banco de dados do fornecedor: duas declarações, dois providers, uma ligação entre elas. Aqui é o mesmo padrão, com a diferença de que a casa é de um time vizinho, e não de um estranho.

#### Existe contrato que o Terraform não confere?

Existe, e é bom saber que são dois tipos diferentes. O sítio de ligação é conferido **na hora de construir**: se a peça não encaixa no formato, o processo para antes de criar qualquer coisa.

O outro tipo é conferido **quando a mensagem passa**, por um guardião que fica no meio do caminho. É o caso do contrato de evento: quem publica um evento com formato incompatível é recusado ali, em pleno funcionamento, muito depois de a infraestrutura ter sido criada. A receita cria o guardião e as regras que ele aplica; quem escreve as versões do contrato é a esteira de quem produz o evento, pelo caminho do corpo e comportamento.

### Antes de seguir

As células já sabem conversar. Falta explicar de onde elas vêm: a mesma descrição gerou uma célula pequena em desenvolvimento e uma grande em produção, e ninguém disse ainda como se garante que as duas nasceram da mesma receita, nem o que acontece quando a receita muda. Isso é DNA, e é o próximo nível.

---

## 5. DNA e indivíduos

### O que é na biologia

DNA é a receita de construção de um ser vivo, escrita numa sequência que a célula sabe ler. Três propriedades dele interessam aqui.

**A receita é a mesma em todo o corpo.** A célula do seu fígado e a da sua pele carregam o mesmo DNA. O que muda entre elas é qual parte da receita cada uma usa.

**A mesma receita produz indivíduos diferentes.** Dois cachorros da mesma raça têm praticamente o mesmo DNA e não são idênticos: um é maior, outro menor, um come mais. A receita define a estrutura; o tamanho e as condições variam com o ambiente onde o indivíduo cresceu.

**Mudança na receita e mudança no indivíduo são coisas distintas.** Se a receita mudar, todo indivíduo novo nasce diferente. Já uma **mutação**, é uma mudança que apareceu num indivíduo e não está na receita: ninguém escreveu aquilo, e ela não passa para os próximos.

### O equivalente no Terraform

O DNA é o **código versionado**: as moléculas guardadas num repositório, com um número de versão fixado a cada mudança aprovada. A célula não copia o código para dentro dela; ela **aponta** para uma versão específica dele, e essa é a única forma de garantir que duas células nasceram da mesma receita. Documentação: [Module Sources](https://developer.hashicorp.com/terraform/language/modules/sources).

Nas seções anteriores, as células apontavam para uma pasta ao lado (`source = "../../../moleculas/funcao-processadora"`), que é o suficiente para aprender. Em uso real isso não serve: se alguém edita a pasta, toda célula que aponta para ela muda de receita sem aviso. Por isso o endereço passa a incluir **de onde** e **qual versão**.

Os três ambientes (desenvolvimento, homologação, produção) são **três indivíduos da mesma espécie**: apontam a mesma versão de receita e crescem diferentes. Cada indivíduo aparece no repositório como uma pasta (`core-banking/desenvolvimento/`, `core-banking/producao/`), e essa pasta é o que este artigo chama de **ambiente** daqui em diante: tudo que estiver dentro dela pertence àquele indivíduo. O caminho das células, que aparece desde a seção da célula, já carregava isso no meio: `core-banking/desenvolvimento/consumidor-comandos`. Adiante, na seção do organismo, o indivíduo vai se revelar maior do que essa pasta; por enquanto, o pedaço que este repositório enxerga basta.

A diferença entre dois indivíduos tem dois tamanhos, e confundir os dois custa caro. **Diferença de valor** é a comum: mesma célula nos dois, com memória, quantidade de máquinas ou teto de gasto diferentes. **Diferença de estrutura** é quando um indivíduo tem uma célula que o outro não tem. Isso também acontece, e tem raiz na biologia: a célula do fígado e a da pele carregam o mesmo DNA e usam partes diferentes dele. O ambiente onde o indivíduo cresce decide qual parte entra em uso. Em desenvolvimento pode existir uma célula de mascaramento de dado pessoal que produção não tem, porque em desenvolvimento o dado é cópia e a lei exige mascarar; produção trabalha com o dado íntegro e nunca precisou dessa célula.

A regra que separa o legítimo do defeito é a razão declarada. Célula que existe num indivíduo e falta no outro **por decisão escrita** é o desenho funcionando. Célula que falta porque alguém esqueceu de criar é deriva, e aparece como diferença que ninguém sabe explicar.

E quando alguém mexe na infraestrutura pelo console da nuvem, à mão, aparece a **mutação**: a nuvem passou a ter uma característica que a receita não descreve.

### A segunda linha hereditária

Existe uma segunda coisa que se herda, e ela não sai da mesma linha da receita.

Na biologia, o hormônio da seção das trocas entre as células só funciona se a fechadura da célula que recebe reconhecer o formato dele. Esse formato tem herança própria: o corpo pode crescer sem que o hormônio mude de forma, e o formato do hormônio pode mudar sem que o corpo mude de tamanho. São duas heranças, com relógios separados.

Na infraestrutura, a receita descreve a **forma** da célula (quanta memória, qual banco, qual rede). O **contrato** descreve o que trafega entre as células: o formato do evento que um domínio publica, as colunas do dado que ele expõe. Cada um tem a própria linha de versões e o próprio dono. O contrato muda quando o negócio ganha um campo novo, o que acontece toda semana. A receita muda quando a forma da célula muda, o que acontece raramente.

A prova de que são duas linhas está no movimento independente. Uma proposta de quebrar o contrato (trocar o tipo de um campo, exigir um campo que antes não existia) é barrada pelo verificador de compatibilidade sem que nenhuma versão de receita mude. E a receita avança de uma versão para outra sem emitir nenhuma versão de contrato. Se fossem a mesma linha, um não conseguiria se mover sozinho.

Confundir as duas amarra o rápido ao lento: um campo novo no evento passaria a esperar a fila de aprovação da infraestrutura.

### A anatomia

```hcl
terraform {
  source = "<onde a receita mora>//<caminho da molécula>?ref=<versão>"
}
```

Cada parte:

- **`<onde a receita mora>`**: o repositório do código, o lugar de onde a receita é lida.
- **`<caminho da molécula>`**: qual molécula, dentro daquele repositório.
- **`?ref=<versão>`**: a versão exata. Sem isso, a célula lê o que estiver escrito naquele momento, e a receita dela muda sem ninguém decidir.

### O caso real

A mesma molécula, dois indivíduos:

```hcl
# core-banking/desenvolvimento/consumidor-comandos/terragrunt.hcl
terraform {
  source = "git::git@github.com:exemplo-org/catalogo.git//moleculas/funcao-processadora?ref=v1.4.0"
}
inputs = {
  nome       = "consumidor-comandos"
  memoria_mb = 512
}
```

```hcl
# core-banking/producao/consumidor-comandos/terragrunt.hcl
terraform {
  source = "git::git@github.com:exemplo-org/catalogo.git//moleculas/funcao-processadora?ref=v1.4.0"
}
inputs = {
  nome       = "consumidor-comandos"
  memoria_mb = 2048
}
```

Mesma receita (`v1.4.0`), tamanhos diferentes.

E aqui cabe uma precisão que evita falsa confiança: o que se promove é **a mesma receita, na mesma versão**. A configuração efetiva de produção tem outros valores, outra conta, outras cotas e outra vizinhança, e só é exercida quando a mudança é aplicada em produção. Por isso existem o portão de aprovação antes e a verificação depois do deploy: a versão promovida garante que ninguém trocou a receita no caminho, e não que produção já foi ensaiada.

Mudar a receita é um movimento explícito. Alguém altera a molécula, publica a versão `v1.5.0`, e cada indivíduo passa a apontar para ela quando for a vez dele: primeiro desenvolvimento, depois homologação, depois produção. Uma linha muda em cada célula:

```hcl
  source = "...//moleculas/funcao-processadora?ref=v1.5.0"
```

### Exemplos

Três indivíduos da mesma espécie: as células do consumidor de comandos em desenvolvimento, homologação e produção.

Espécies diferentes com receitas independentes: a molécula da função processadora e a molécula do banco de dados, cada uma com sua própria linha de versões.

Mutação: alguém abre o painel da AWS e aumenta a memória de uma função à mão. A nuvem tem 1024, a receita diz 512.

### Perguntas que podem surgir

#### Por que não apontar sempre para a versão mais nova?

Porque então uma correção publicada de manhã entra em produção de tarde sem ninguém decidir. Apontar para uma versão fixa transforma a atualização numa escolha: alguém muda a linha, vê o que vai acontecer e aprova.

#### E se eu quiser que dev e produção sejam diferentes de propósito?

É o esperado, e tem dois lugares. Diferença de tamanho mora nas peças que se trocam: memória, quantidade de máquinas e limites de gasto mudam entre indivíduos, com a mesma receita apontada. Diferença de estrutura mora na pasta do indivíduo: uma célula que só existe em desenvolvimento fica só lá, e a razão dela fica escrita ao lado. O que não se faz é obter diferença editando a receita de um indivíduo só, porque aí a receita deixa de ser a mesma e os dois param de ser comparáveis.

#### Como eu sei se uma célula que falta num indivíduo é de propósito ou esquecimento?

Pela razão escrita. Célula de propósito tem uma linha que diz por que ela existe num indivíduo e não no outro, e essa linha é revisada como qualquer mudança. Célula esquecida não tem essa linha, e é assim que se descobre: alguém compara os indivíduos, acha a diferença e não encontra ninguém que saiba explicar. Comparar os indivíduos de tempos em tempos é trabalho de rotina, do mesmo jeito que procurar mutação.

#### O que acontece com uma mutação?

O Terraform compara a receita com a ficha de identificação e mostra a diferença: a nuvem tem 1024, o código pede 512. A partir daí, a diferença é resolvida na receita (se a mudança era desejada, ela entra no código e vira uma versão nova) ou na nuvem (o valor volta para o que o código diz). O que não se faz é deixar a diferença viva: a receita deixa de descrever o que existe, e ninguém mais consegue reproduzir aquele indivíduo.

#### O contrato do evento é uma versão da receita?

Não. São duas linhas de versão que convivem, com donos e ritmos próprios. A receita é aprovada por quem cuida da infraestrutura e muda por trimestre; o contrato é aprovado por quem produz o dado e muda por semana. A célula aponta uma versão de receita e publica uma versão de contrato, e as duas caminham sem depender uma da outra.

#### A ficha de identificação não era o DNA?

Não. Receita e cadastro são coisas diferentes: o DNA é igual nos três indivíduos e mora no repositório; a ficha é única de cada célula, mora fora do código e muda toda vez que a infraestrutura muda.

#### Se a receita está fora, quem garante que ela não muda no meio do caminho?

Nenhuma, se ninguém tomar providência: o nome de uma versão pode ser movido para outro conteúdo, e um nome de ramo muda sozinho a cada mudança. Duas práticas resolvem: publicar versões que não podem ser alteradas depois de criadas, com o nome protegido contra remoção e troca, e apontar pelo identificador exato do conteúdo quando a garantia precisar ser absoluta. Some-se a isso o arquivo de trava dos plugins, versionado junto do código: a versão da receita não fixa a versão dos plugins que criam os recursos.

### Antes de seguir

A receita versionada constrói o corpo. Falta dizer o que ela **não** constrói, e isso pega quase todo mundo de surpresa na primeira vez: a função nasce sem o programa que ela executa, o cofre nasce sem a senha, o banco nasce sem uma linha de dado. O que preenche tudo isso vem por outro caminho, e é o próximo assunto.

---

## 6. Corpo e comportamento

### O que é na biologia

O DNA constrói o corpo: o neurônio nasce com a forma dele, o estômago com as paredes dele. E o que o ser vivo **sabe** não vem do DNA. A memória de um caminho, o gosto por um alimento, a habilidade de caçar: tudo isso chega pela experiência, depois que o corpo já existe. Um bebê nasce com o cérebro pronto e sem nenhuma lembrança dentro.

Daí sai a consequência que interessa: **corpo e comportamento têm origens diferentes**. E se um corpo se refizesse do zero, o comportamento aprendido não viria junto: ele precisaria ser aprendido outra vez.

### O equivalente na infraestrutura

A receita de infraestrutura constrói a célula vazia. O que vai dentro dela chega por **outra esteira**, com outro ritmo e outro dono:

| a receita de infraestrutura cria | o conteúdo que chega por outro caminho |
|---|---|
| a função que executa código | o programa que ela executa |
| o cofre de senhas | a senha guardada nele |
| o banco de dados | as tabelas e as linhas |
| o registro de contratos de evento | as versões de contrato publicadas |
| o depósito de arquivos | os arquivos |
| o registro de imagens | as imagens de contêiner |

Quem coloca o conteúdo é a esteira da aplicação (a cada versão do programa), a esteira de dados (a cada carga), ou uma pessoa autorizada, uma vez (a senha do fornecedor). Nenhum desses caminhos passa pela receita de infraestrutura, **e isso é proposital**: o programa muda várias vezes por dia, e a função onde ele roda muda uma vez por trimestre. Ritmos diferentes pedem esteiras diferentes.

### A anatomia

Repare no que a receita da função declara, e no que ela deixa em aberto:

```hcl
resource "aws_lambda_function" "funcao" {
  function_name = var.nome
  runtime       = "python3.13"
  handler       = "app.principal"       # onde o programa começa
  filename      = var.pacote_inicial    # o programa do primeiro dia
  # as versões seguintes NÃO passam por aqui
}
```

A função nasce executando um pacote inicial, porque uma função sem programa nenhum não existe. O que chega por outro caminho são as **versões seguintes**: a esteira da aplicação publica código novo na mesma função, todo dia, e a célula continua a mesma no registro, com outro comportamento por dentro.

Quando dois processos passam a cuidar do mesmo objeto, isso precisa estar declarado, e o preço precisa ser conhecido:

> **Dividir a gestão com a esteira.** A receita pode declarar que ignora mudanças em atributos específicos (o pacote e o hash do código), deixando a esteira governá-los. O preço: aqueles atributos deixam de ser comparados, então uma alteração feita por fora deixa de aparecer. Isso se declara atributo por atributo, nunca em bloco, e vale saber que o hash calculado pela receita descreve o pacote que ela conhece, e não o que está rodando agora.

O mesmo padrão vale para o cofre, com uma diferença:

```hcl
resource "aws_secretsmanager_secret" "credencial_do_core" {
  name = "credencial-do-core"
  # o valor da senha entra por outro caminho
}
```

A ferramenta até sabe gravar o valor, inclusive de forma que ele não fique registrado na ficha da célula. A regra deste desenho é outra, e é de ownership: o valor não nasce da receita. O motivo é simples: senha escrita no código vira senha publicada no repositório, visível para quem lê e gravada no histórico para sempre.

### O caso real

O núcleo bancário mostra os dois lados na mesma tela. A infraestrutura cria: o banco do livro-razão, a fila de comandos, a função consumidora, o cofre da credencial do fornecedor e o registro de contratos. E chega por fora: o programa da função (a cada entrega), a estrutura das tabelas do livro-razão (pela esteira de migração, com trava para duas não rodarem juntas), a credencial do fornecedor (uma vez, por uma pessoa autorizada), e cada versão de contrato de evento (pela esteira de quem produz o evento).

### Perguntas que podem surgir

#### Se eu destruir a célula e criar de novo, o conteúdo volta?

Não. Volta o corpo vazio. O programa precisa ser publicado outra vez, o dado precisa ser restaurado ou carregado outra vez, a senha precisa ser colocada outra vez. É por isso que a próxima seção existe: separar o que pode ser recriado à vontade do que nunca deveria ser destruído.

#### Por que não colocar tudo na mesma receita e resolver de uma vez?

Porque os ritmos são incompatíveis. O programa muda todo dia; a infraestrutura muda raramente. Juntar os dois faria cada entrega de software mexer no banco de dados de produção, o que é exatamente o risco que se quer eliminar.

#### E a estrutura das tabelas, é infraestrutura ou não?

Não é. Criar a coluna nova é mudança de conteúdo, feita pela esteira de migração, com trava para duas execuções não colidirem e com o cuidado de nunca apagar o que já está lá. A receita de infraestrutura cria o banco; ela não decide o formato das tabelas.

#### Como eu sei o que a receita não criou?

Pelo contrato dela, que declara o que ela cria e o que ela deixa em aberto. Célula que nasce esperando conteúdo diz isso no próprio contrato, para ninguém descobrir na hora do incidente.

### Antes de seguir

Corpo vazio recriado é banal quando o conteúdo volta sozinho pela esteira, e é uma catástrofe quando o conteúdo é o livro-razão de um banco. As células se separam exatamente por isso, e essa separação é o próximo nível: os tecidos.

---

## 7. Tecido

### O que é na biologia

Tecido é um grupo de células do mesmo tipo, trabalhando juntas na mesma tarefa. E o que separa um tipo de célula do outro, para o que interessa aqui, é a capacidade de se refazer. Existem três comportamentos:

**Célula que se refaz sem parar.** A pele troca sozinha o tempo todo: a camada de cima descama e outra nasce embaixo. Perder um pedaço de pele não é perder nada de definitivo, porque a próxima nasce igual.

**Célula que se refaz quando precisa.** O fígado fica quieto e, quando sofre uma lesão, volta a se dividir e recompõe o que faltou. Ele se recupera, com tempo e cuidado.

**Célula que não se refaz.** Neurônio não se divide. O que morre não volta, e o que ele guardava se perde com ele.

Um órgão de verdade tem tecidos dos três tipos convivendo. O intestino tem revestimento que troca em dias e tecido nervoso que dura a vida inteira. Ninguém trata os dois da mesma maneira.

### O equivalente no Terraform

As células de infraestrutura se separam pela mesma pergunta que separa os tecidos: o que acontece se esta célula for destruída e criada de novo? A resposta define as regras de cada uma: quem pode destruí-la, quando, e por qual caminho.

**Pode ser destruída e recriada a qualquer momento, sem perda**: as células de processamento. Função, contêiner, orquestrador. Nada do que importa mora dentro delas. Cuidado com uma confusão comum: isso não quer dizer que elas sejam recriadas a cada entrega de software. A entrega troca o programa que roda dentro da mesma célula, e a célula continua a mesma no registro; o que a define como renovável é poder ser refeita do zero sem consequência.

**Pode ser refeita com planejamento**: a rede, o cluster de mensageria, o balanceador. Não se destroem por rotina; refazer é possível, com janela e cuidado.

**Não deve ser destruída nunca**: o livro-razão do banco, as chaves de criptografia, os registros de auditoria. Se um desses desaparece, não existe versão de receita que traga o conteúdo de volta.

E aqui vem a armadilha que engana até quem já entendeu os três casos: **reconstruir e reproduzir são coisas diferentes.** Uma célula que guarda a cópia bruta de um sistema externo parece renovável, porque existe um programa que refaz a carga do zero. Só que o sistema de origem continuou vivo no meio do caminho: linhas foram alteradas, algumas apagadas e outras criadas. Rodar a mesma carga de novo produz uma cópia com a mesma quantidade de linhas e conteúdo diferente, e as linhas que a origem apagou não existem em lugar nenhum além daquela cópia. Ela se reconstrói e não se reproduz, e isso a coloca no terceiro caso, junto do livro-razão.

A pergunta que separa é sobre a origem: **o que essa célula guarda vem de algum lugar que não muda?** Se a origem é imutável (um arquivo publicado uma vez, um pacote de programa com versão fixa), refazer traz o mesmo. Se a origem é um sistema vivo, refazer traz outra coisa.

A ferramenta tem um bloco para declarar isso: [`lifecycle`](https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle), com `prevent_destroy`, que reprova qualquer plano que contenha a destruição daquele átomo. E a organização das pastas separa o que se refaz do que não se refaz, para que o comando de rotina de um ambiente de teste nem descubra o que é definitivo.

Uma advertência sobre essa última frase, porque ela engana: **pasta limita o que o comando enxerga, e não o que a credencial pode fazer.** Quem tem permissão de destruir continua tendo, esteja onde estiver. A proteção de verdade tem três camadas, e a pasta é a mais fraca das três: a trava no átomo, a proteção do próprio serviço, e a política automática que reprova qualquer plano com destruição ou substituição de classe permanente antes de ele ser aplicado.

E uma segunda advertência, que só aparece quando alguém tenta destruir de verdade: **as três camadas só alcançam o que a ferramenta reconhece como átomo.** A trava se declara dentro de um átomo, e a política lê o plano, que é uma lista de átomos. Objeto criado por um comando avulso pendurado na receita não entra nessa lista: ele não aparece no plano, a política não o vê, e o comando de remoção dele roda antes de a execução parar. O resultado é o pior possível: a célula estava classificada como permanente, a trava barrou o que era átomo, e o que estava fora da contagem morreu.

Daí sai uma regra prática: **classificar é por célula, proteger é por átomo, e alguém precisa conferir que as duas coisas combinam.** Célula declarada permanente cujos átomos não carregam trava é declaração sem efeito. Célula declarada renovável que guarda um átomo com trava é sinal de que a classificação está errada. Essa conferência é automática e barata, e vale rodá-la junto dos outros exames antes de qualquer aplicação.

### A anatomia

Dentro da molécula, o átomo que não se refaz declara a proteção:

```hcl
resource "<elemento>" "<apelido>" {
  <propriedade> = <valor>

  lifecycle {
    prevent_destroy = true    # tentar destruir isto faz o processo parar com erro
  }
}
```

E as células ficam separadas por comportamento:

```
core-banking/<ambiente>/
├── permanente/       células que não se refazem: nunca são destruídas pela rotina
│   └── <célula>/
└── renovavel/        células que se refazem: nascem e morrem com a entrega
    └── <célula>/
```

O `<ambiente>` é a pasta do indivíduo, apresentada na seção do DNA: `desenvolvimento`, `homologacao` ou `producao`.

Cada parte:

- **`lifecycle { prevent_destroy = true }`**: a trava no átomo. Uma ordem de destruição para com erro em vez de executar.
- **a pasta `permanente/`**: o tecido que não se refaz. Nenhum comando de rotina roda destruição aqui.
- **a pasta `renovavel/`**: o tecido que se refaz. Destruir e recriar aqui é operação normal.

### O caso real

No núcleo bancário, a separação fica assim:

```
core-banking/desenvolvimento/
├── permanente/
│   ├── livro-razao/      cada lançamento financeiro registrado
│   ├── chaves/           as chaves que cifram os dados
│   └── topicos/          os tópicos de eventos, com o histórico deles
└── renovavel/
    ├── consumidor-comandos/    a função que processa
    ├── saga/                   o orquestrador da transferência
    └── borda/                  a porta de entrada das chamadas
```

E o átomo do livro-razão carrega a trava:

```hcl
resource "aws_rds_cluster" "livro_razao" {
  engine             = "aurora-postgresql"
  deletion_protection = true

  lifecycle {
    prevent_destroy = true
  }
}
```

Essa separação é o que torna possível o ambiente de teste descartável: sobe o tecido renovável, testa, derruba o tecido renovável, e o permanente nunca é tocado. A pele descama; o neurônio fica.

### Exemplos

Tecido que se refaz sem parar: funções, contêineres, orquestradores, as entradas de DNS de um ambiente temporário.

Tecido que se refaz quando precisa: rede, cluster de mensageria, balanceador de carga.

Tecido que não se refaz: livro-razão, chaves de criptografia, registros de auditoria, o depósito de arquivos com evidência regulatória.

### Perguntas que podem surgir

#### Como eu descubro em qual tecido uma célula nova entra?

Uma pergunta resolve, e ela tem uma palavra que costuma cair fora: se esta célula for apagada e criada de novo pela receita, o que existia dentro dela volta **igual**? Se volta igual, ela se refaz. Se volta diferente, ou não volta, é tecido permanente. Repare que a pergunta é sobre o conteúdo, não sobre o serviço: um banco de dados usado só como rascunho de teste se refaz; o mesmo tipo de banco guardando lançamentos financeiros não.

A palavra "igual" é o que impede o erro mais caro dessa classificação. Sem ela, a cópia bruta de um sistema que continua sendo usado responde "volta" e é classificada como renovável, com toda a formalidade cumprida e o resultado errado. Conferir a quantidade de linhas depois de refazer não resolve: a quantidade bate e o conteúdo já é outro.

#### Um banco de dados vazio, que ainda não tem nada dentro, é permanente?

É, e o motivo é importante: o que define o tecido é a **função declarada** da célula, não o quanto ela está ocupada agora. O livro-razão nasce vazio e nasce permanente, porque foi criado para guardar o que não pode se perder. Esperar a primeira gravação para classificar significaria mudar as regras de proteção com a infraestrutura já rodando.

#### `prevent_destroy` resolve tudo?

Não, por dois motivos. Ele protege enquanto a declaração do átomo continuar no código: se alguém apagar o bloco inteiro, a trava vai embora junto. E ele só protege átomo: o que a receita cria por um comando avulso fica fora do alcance dele e some sem aviso. Por isso a proteção de verdade tem três camadas (a trava no átomo, a proteção do próprio serviço com `deletion_protection`, e a separação de pastas) mais a conferência automática de que todo átomo da célula permanente carrega trava.

#### Se o tecido permanente nunca é destruído, como se corrige um erro nele?

Corrigindo à frente, nunca apagando. Se o formato de uma tabela está errado, aplica-se uma alteração que ajusta o formato preservando o conteúdo. Restaurar uma cópia de segurança é o caminho quando o conteúdo se corrompeu. Destruir e recriar não é opção quando o conteúdo é o valor.

#### O tecido é a mesma coisa que a pasta?

A pasta é como o tecido aparece organizado no repositório. O tecido é o conceito: o grupo de células com o mesmo comportamento de renovação. Organizar em pastas é o que permite dar tratamento diferente a cada grupo, inclusive nas permissões de quem pode mexer.

#### Permanente quer dizer para sempre?

Não, e a diferença importa num banco. Permanente significa que nada disso é destruído pela rotina, e que o conteúdo não volta se sumir. Quanto tempo o conteúdo fica guardado é outra decisão, que vem da lei e do tipo de informação: o registro operacional do dia a dia se guarda por semanas, a evidência que o regulador pode pedir se guarda por anos, e alguns registros têm prazo para serem apagados. Cada célula do tecido permanente declara o prazo dela, e o prazo é parte da receita, tanto quanto a trava contra destruição.

### Antes de seguir

O núcleo bancário agora tem seus dois tecidos, um que se refaz e um que não. Só que os dois trabalham na mesma tarefa: receber um comando de transferência, registrar o lançamento e avisar o resto do banco. Tecidos diferentes cumprindo juntos uma função inteira formam o próximo nível: o órgão.

---

## 8. Órgão

### O que é na biologia

Tecidos diferentes trabalhando juntos numa função que nenhum deles cumpre sozinho. O estômago é o exemplo da escola: tecido muscular que amassa, tecido que produz o ácido, tecido nervoso que comanda o ritmo. Nenhum desses tecidos "digere"; o estômago digere. A função pertence ao conjunto.

E o órgão se opera como conjunto. Quando um médico examina o estômago, ele examina o estômago: ninguém agenda um exame por tecido.

### O equivalente no Terragrunt

A [stack](https://docs.terragrunt.com/features/stacks): um diretório que reúne células, tratadas como um conjunto. A documentação define assim: uma coleção de units gerenciadas juntas. As células continuam independentes, cada uma com sua ficha de identificação; o que a stack acrescenta é poder operar todas de uma vez, na ordem certa.

O órgão do nosso exemplo é o núcleo bancário completo: os dois tecidos da seção anterior, com as células deles, cumprindo a função "registrar dinheiro entrando e saindo". Nenhuma célula sozinha faz isso. A função pertence ao conjunto.

E o órgão tem dono e endereço. O diretório `core-banking/` é um repositório próprio do time daquele domínio (o desenho da arquitetura chama de repo live do domínio), e cada pasta de ambiente dele nasce numa **conta** própria da nuvem: um espaço isolado, com identidade, permissões e fatura só dele. Órgão é o domínio numa conta. A conta volta com força na seção do organismo; por enquanto, basta guardar que a rede e o barramento, que aparecem adiante, têm outros donos, outros repositórios e outras contas.

E o conjunto se opera como conjunto: um comando na pasta do órgão alcança todas as células dele de uma vez, respeitando as dependências entre elas.

### A anatomia

Neste repositório a stack é implícita: ela existe quando as células estão organizadas debaixo de um mesmo diretório, sem arquivo novo. O Terragrunt também aceita stack declarada num arquivo próprio, que descreve quais units a compõem; aqui a árvore de pastas basta.

A organização fica assim:

```
core-banking/<ambiente>/          ← isto é uma stack: o órgão inteiro
├── permanente/
│   ├── livro-razao/              ← célula
│   ├── chaves/                   ← célula
│   └── topicos/                  ← célula
└── renovavel/
    ├── consumidor-comandos/      ← célula
    ├── saga/                     ← célula
    └── borda/                    ← célula
```

E o comando que opera o conjunto:

```
terragrunt run --all plan      # mostra o que mudaria em TODAS as células do diretório
terragrunt run --all apply     # aplica todas, na ordem das dependências
```

Três avisos antes de usar isso, e o terceiro é o mais importante:

- **A fila inclui tudo que estiver abaixo da pasta**, sem perguntar. Existe forma de inspecionar a fila e de filtrar quais células entram; olhar antes de aplicar é hábito de quem não se assusta depois.
- **O primeiro plano de um ambiente novo pode falhar**, porque as células que consomem ainda não têm de quem ler. Isso é esperado, e some quando as produtoras nascem.
- **Em produção, ninguém roda isso da própria máquina.** O caminho é a esteira: o plano é gerado e revisado, alguém aprova, e a aplicação usa a identidade daquele ambiente, com uma política automática que reprova qualquer plano contendo destruição ou substituição de célula permanente. O comando com `--all` aplica sem parar para perguntar, e essa é exatamente a razão de ele viver dentro de um processo com aprovação, e não num terminal.

Cada parte:

- **o diretório**: o órgão. O nome dele nomeia a função (`core-banking`), e tudo debaixo dele pertence ao conjunto.
- **`run --all`**: o exame do órgão inteiro. O Terragrunt percorre as células do diretório, monta a ordem a partir das dependências declaradas e executa uma a uma.
- **a ordem**: ninguém a escreve. Ela nasce das trocas entre as células (os `dependency` da seção de trocas): quem publica nasce antes de quem consome.

### O caso real

O primeiro nascimento do órgão em desenvolvimento, com um comando na pasta dele:

```
cd core-banking/desenvolvimento
terragrunt run --all apply
```

O Terragrunt olha as seis células, encontra as dependências (o consumidor depende da fila de tópicos, a saga depende do consumidor) e executa na ordem: primeiro as células que não dependem de ninguém (livro-razão, chaves, tópicos), depois as que consomem o que elas publicam. Células sem relação entre si nascem ao mesmo tempo.

No dia a dia, o comando de rotina roda só no tecido renovável:

```
cd core-banking/desenvolvimento/renovavel
terragrunt run --all apply
```

A pasta limita o alcance: o que está em `permanente/` nem entra na fila de execução. A separação de tecidos da seção anterior vira, aqui, o controle de o que um comando consegue tocar.

### Exemplos de órgãos

No banco: o núcleo bancário (registrar dinheiro), a esteira de crédito (avaliar e conceder), o barramento de eventos (transportar avisos entre os órgãos), a rede (dar endereço e caminho a tudo).

Fora do banco: numa loja virtual, o órgão de pagamentos, o de catálogo de produtos, o de entregas.

### Perguntas que podem surgir

#### Qual a diferença entre órgão e molécula gigante?

A molécula era uma receita só, com um dono só e, quando usada, uma ficha de identificação só: mexeu em qualquer parte, carregou o todo. O órgão preserva a independência das células: seis fichas, seis ciclos de vida, e um erro numa célula para naquela célula. O conjunto existe na operação, sem existir na posse.

#### Quem decide o que entra num órgão?

A função de negócio. A pergunta na hora de posicionar uma célula nova: ela trabalha para "registrar dinheiro entrando e saindo"? Se sim, mora no núcleo bancário. Se ela serve a vários órgãos (como a rede), ela tem órgão próprio, e os outros a consomem por troca de informação.

#### Uma célula pode estar em dois órgãos?

Não. Cada célula vive num diretório só, com um dono só. O que dois órgãos compartilham é informação (pelo hormônio das trocas entre células), nunca a célula em si. O barramento tem as células dele; o núcleo bancário lê os endereços que o barramento publica.

#### `run --all` na pasta errada destrói tudo?

O `run --all` respeita o alcance da pasta onde roda e o que as travas permitem. Rodar destruição na pasta do tecido renovável derruba só o renovável. E dentro do permanente, as travas de `prevent_destroy` param o processo com erro. As camadas de proteção da seção dos tecidos existem para esse dedo errado.

#### Stack tem ficha de identificação própria?

Não. Quem tem ficha são as células, uma cada. A stack agrupa e ordena; nada além disso.

### Antes de seguir

O órgão funciona, e não funciona sozinho: o núcleo bancário precisa que a rede exista antes dele, e o barramento de eventos precisa estar de pé para os avisos circularem. Órgãos que dependem uns dos outros, em ordem de nascimento e de funcionamento, formam o próximo nível: o sistema.

---

## 9. Sistema

### O que é na biologia

Órgãos diferentes ligados numa mesma finalidade. O sistema digestivo é boca, estômago, intestino e fígado: órgãos em lugares diferentes do corpo, ligados pela função e pelo caminho que o alimento percorre. Repare numa coisa que passa despercebida na escola: **o sistema não é uma caixa com os órgãos dentro**. Não existe um saco chamado "sistema digestivo" no corpo; existe a relação entre órgãos espalhados.

Duas propriedades interessam aqui. **A ordem importa**: o intestino trabalha em cima do que o estômago entregou, e não o contrário. E **um sistema serve aos outros**: o circulatório entrega oxigênio para todos os órgãos do corpo, sem pertencer a nenhum deles.

### O equivalente na infraestrutura

Na infraestrutura o sistema também dispensa pasta: ele é a **relação entre órgãos de times diferentes**, cada um no seu repositório e nas suas contas: o sistema transacional em desenvolvimento é o núcleo bancário (repositório e conta do domínio), mais o barramento de eventos (repositório e conta do time de plataforma), mais a rede (idem). Ninguém contém ninguém; o que existe é quem lê o hormônio de quem.

E aqui se explica por que a troca por hormônio existe: vizinha encostada exige as duas células na mesma árvore de pastas, e órgãos de times diferentes nem repositório compartilham. Entre órgãos, a informação atravessa pelo lugar comum, sempre.

A ordem dentro de um repositório o Terragrunt monta sozinho ([Run Queue](https://docs.terragrunt.com/features/stacks/run-queue/)). Entre repositórios não existe uma fila única, porque cada um tem dono, credencial e aprovação próprios. Essa ordem também não pode ficar na memória de ninguém: ela é escrita numa esteira que assume cada identidade na sequência certa e espera cada etapa terminar. A plataforma nasce antes dos domínios, porque publica o que eles leem.

### A anatomia

Não existe arquivo do sistema. O que existe é o mapa de quem publica e quem lê:

```
repositório do time de rede            → publica   /rede/<ambiente>/...
repositório do time de plataforma      → publica   /barramento/<ambiente>/...
repositório do domínio (core-banking)  → lê        /rede/... e /barramento/...
```

E, dentro do repositório do domínio, a leitura é o `data` que já apareceu na seção de trocas:

```hcl
data "aws_ssm_parameter" "id_da_rede" {
  name = "/rede/core-banking/desenvolvimento/id"
}
```

Cada parte:

- **cada repositório**: um órgão, com dono, aprovação e credencial próprios.
- **os hormônios publicados**: o contrato entre os órgãos. A lista de nomes publicados é o desenho do sistema.
- **a leitura**: a declaração de que um órgão depende do outro.

### Quem pode consumir o que outro órgão produz

Um órgão publica o endereço da coisa, e isso não é a mesma pergunta que **quem tem direito de usá-la**. Um domínio que expõe um produto de dado precisa dizer quais outros times podem lê-lo, e esse "quais" muda toda semana, porque time novo consome dado antigo o tempo todo.

Existem dois lugares para escrever essa permissão, e a escolha decide o ritmo do time. Escrevê-la na receita de infraestrutura coloca cada consumidor novo na fila de aprovação da infraestrutura, que roda por trimestre, com quem aprova sendo quem cuida da nuvem e não quem responde pelo dado. Escrevê-la no contrato do produto, ao lado do formato que ele publica, coloca a decisão em quem é dono do dado e no ritmo em que a decisão acontece.

O segundo lugar tem um efeito que o primeiro não tem: a lista de contratos publicados vira o mapa de quem consome o quê, mantido sozinho. No primeiro, esse mapa precisa ser mantido à mão em algum inventário, e inventário mantido à mão envelhece.

A regra que sobra: **endereço é hormônio, permissão de uso é contrato.** Quem publica o dado declara quem pode lê-lo, com a mesma cadência em que o negócio muda de ideia.

### O caso real

O nascimento de um ambiente novo atravessa três times, nesta ordem:

```
time de rede         roda run --all no repositório dele   → publica os hormônios da rede
time de plataforma   roda run --all no dele               → lê a rede, publica o barramento
time do domínio      roda run --all no core-banking       → lê os dois, nasce por último
```

Cada time roda o comando no próprio repositório, com a própria credencial. Um comando único que atravessasse os três não existe, e não deve existir: a credencial do domínio não alcança a conta da rede, de propósito.

No dia a dia essa ordem é invisível: rede e barramento estão de pé há meses, e o domínio trabalha sozinho no órgão dele.

### Exemplos de sistemas

No banco: o sistema transacional (rede, barramento, núcleo bancário) e o sistema de crédito (rede, barramento, esteira de crédito, motor de decisão).

Repare que a rede aparece nos dois. Como o circulatório, ela serve a todos, com dono próprio, repositório próprio e conta própria.

### Perguntas que podem surgir

#### Se o sistema não tem pasta nem comando, ele existe onde?

Nas leituras declaradas. Cada `data` que lê um hormônio é um fio do sistema, e o conjunto dos fios é o sistema inteiro. Dá para desenhá-lo num mapa (quem publica o quê, quem lê o quê), e esse mapa é um dos documentos mais úteis da arquitetura.

#### Se a rede está nos dois sistemas, ela é criada duas vezes?

Não. As células da rede existem uma vez só, no órgão delas, criadas por quem é dono. Os dois sistemas leem o que ela publica.

#### Por que não colocar tudo num repositório só?

Porque repositório é fronteira de dono: o time de rede aprova mudança de rede, o do domínio aprova mudança do domínio, e nenhum espera o outro para trabalhar. Num repositório único, ou um time aprovaria tudo, ou todos poderiam mexer em tudo.

#### Como se garante a ordem, se ninguém orquestra os três times?

Pela falha segura da seção de trocas: se o domínio tentar nascer antes da rede, a leitura do hormônio falha e o processo para com erro, sem criar nada apontando para o vazio. A dependência exige a própria ordem, e no cotidiano ela já foi cumprida há muito tempo.

#### E se dois órgãos dependerem um do outro?

Isso trava dos dois lados, e a trava é um sinal de erro de desenho. Se A precisa de B para nascer e B precisa de A, nenhum dos dois nasce. A saída é quebrar o ciclo: normalmente um dos lados não precisava daquela informação no nascimento, e sim depois, em funcionamento.

### Antes de seguir

Sistemas ligados, cada órgão na sua conta, cada time no seu repositório. Falta a pergunta que fecha a composição: o que é, afinal, "desenvolvimento" por inteiro? Todos os órgãos de todos os times, no mesmo plano, vivos ao mesmo tempo: o organismo.

---

## 10. Organismo

### O que é na biologia

O ser completo: todos os sistemas funcionando ao mesmo tempo, num corpo com fronteira. E a fronteira de um corpo é composta: a pele cobre o lado de fora, as mucosas guardam as entradas, o sistema imune patrulha por dentro. Nenhuma barreira sozinha define o indivíduo; o conjunto define.

**Dois organismos não dividem o corpo.** Cada indivíduo tem o próprio sangue, os próprios órgãos, as próprias defesas. O que circula num não circula no outro.

### O equivalente na infraestrutura

Antes da definição, a imagem que evita a confusão mais comum deste artigo. Existem duas dimensões, e elas se cruzam numa matriz:

```
                     dev               homolog            prod
core banking      conta dev         conta homolog      conta prod      ← repositório do time do domínio
mesa de crédito   conta dev         conta homolog      conta prod      ← repositório daquele time
rede              não-produção      não-produção       produção        ← repositório do time de rede
barramento        não-produção      não-produção       produção        ← repositório da plataforma
                  └─ organismo ─┘   └─ organismo ─┘    └─ organismo ─┘
```

Cada casa da matriz é um órgão. Cada **coluna** inteira é um organismo. Cada **linha** é o repositório de um time.

Daí sai a resposta para a pergunta que costuma travar: "core banking" sozinho não é nível nenhum desta escada. Ele é o **tipo** de órgão, como "fígado". Não existe *o* fígado solto no mundo; existe o fígado do João e o fígado da Maria. Do mesmo jeito, não existe *o* core banking: existe o core banking do indivíduo de desenvolvimento e o do indivíduo de produção, dois órgãos, em dois corpos, que nunca se tocam.

E fica explícita a tensão que confunde: **o repositório agrupa por linha, porque o dono é o time; a vida acontece por coluna, porque o corpo é o ambiente.**

O organismo é, então, o **ambiente inteiro, atravessando as contas de todos os times**: desenvolvimento é a conta dev do núcleo bancário, mais a conta dev de cada outro domínio, mais as instâncias de não-produção da rede, do barramento e da observabilidade, tudo vivo e conversando. Produção é outro organismo, com outro conjunto de contas.

A pele também é composta, de três camadas:

- **cada conta** é uma fronteira, como já apareceu no órgão: identidade, permissões e fatura próprias, onde por padrão nada entra;
- **as regras herdadas de cima**, que valem para todas as contas de um plano (a seção do ecossistema mostra de onde elas descem);
- **a regra de circulação**: produção só fala com produção, e não-produção só fala com não-produção. O sangue de um organismo não circula no outro.

E aqui os níveis que se confundem com facilidade ficam separados de vez: a pasta `desenvolvimento/` do repositório do domínio é a fatia de **um** órgão dentro do organismo; o organismo é todas as fatias, de todos os times, no mesmo plano.

### A anatomia

O organismo não cabe num repositório. Ele emerge de cada repositório apontar a pasta de ambiente para uma conta do mesmo plano:

```
ORGANISMO "desenvolvimento"
├── conta dev do core banking         ← pasta desenvolvimento/ do repositório do domínio
├── conta dev da mesa de crédito      ← pasta desenvolvimento/ do repositório daquele domínio
├── rede · instância não-produção     ← repositório do time de rede
├── barramento · não-produção         ← repositório do time de plataforma
└── observabilidade · não-produção    ← repositório do time de plataforma
```

```hcl
# core-banking/desenvolvimento/env.hcl: a identidade desta fatia
locals {
  conta    = "111111111111"   # a conta dev DESTE domínio
  regiao   = "sa-east-1"      # o endereço da seção da célula
  ambiente = "desenvolvimento"
}
```

Cada parte:

- **`env.hcl`**: escrito uma vez por pasta de ambiente, herdado por todas as células dela. É o mesmo arquivo que dá o endereço da seção da célula: conta e região, juntas, porque são a mesma decisão. Nenhuma célula declara endereço por conta própria.
- **a conta por fatia**: cada time aponta a própria conta. O organismo existe quando todas as fatias apontam para o mesmo plano.
- **o plano**: o lado a que a fatia pertence, produção ou não-produção. É sobre ele que a regra de circulação trabalha.

### O caso real

Um erro humano, para ver as camadas da pele trabalharem. Alguém roda destruição na pasta errada do repositório do domínio, em desenvolvimento: o tecido renovável daquela conta cai; as travas seguram o permanente; a rede e o barramento nem sentem, porque são outras contas com outras credenciais; e produção segue intocada em outro organismo, sem tomar conhecimento. Um erro alcança, no máximo, uma fatia de um organismo.

E o contrário, o nascimento: subir homologação do zero é cada time rodando o `run --all` das suas pastas de homologação, plataforma antes dos domínios, como na seção do sistema. O organismo nasce fatia por fatia, e ninguém executa o todo com um comando.

### Exemplos de organismos

Os três do banco: desenvolvimento (onde se experimenta), homologação (onde se ensaia), produção (onde o dinheiro é real).

E um quarto espaço do desenho: o sandbox, para experimento e prova de conceito, fora das regras dos outros e **sem rota para o resto**. Um aquário separado, de propósito.

### Perguntas que podem surgir

#### Por que produção não pode ser só um apelido dentro das mesmas contas?

Porque separação de verdade vem de fronteira, e apelido não é fronteira. Em contas separadas, a credencial que opera desenvolvimento esbarra na pele de produção: o erro não atravessa nem por engano.

#### Os organismos são idênticos?

Na estrutura, sim: mesma espécie, mesmo DNA apontado. No tamanho, não: produção tem mais memória, mais réplicas, mais capacidade, pelas peças que se trocam da seção do DNA.

#### Quanto custa manter três organismos vivos?

Bem menos que três vezes o custo de produção, e o motivo é o tamanho: desenvolvimento roda com o mínimo de cada peça, e o tecido renovável pode dormir fora do horário de trabalho, porque nada permanente vive nele. Número exato só sai de estimativa por bloco, com inventário, volume e retenção; este repositório mantém essas contas em documento próprio.

#### Quem pode entrar em cada organismo?

Cada conta tem as próprias permissões, e elas seguem o risco: em desenvolvimento o time trabalha à vontade; em produção, pessoas não fazem mudança direta, quem aplica é o processo automatizado, com uma credencial que só ele assume. A pele de produção é a mais grossa.

#### E quando os organismos divergem?

É a mutação da seção do DNA em escala de corpo. Homologação numa versão de receita e produção na anterior é o esperado: a mudança caminha de indivíduo em indivíduo. Mudança feita à mão que nunca virou receita é mutação, e se resolve como lá: ou vira código, ou volta atrás.

### Antes de seguir

Ficaram três pontas soltas de propósito: de onde descem as regras herdadas da pele, quem cria as contas, e onde vivem os seres que não são nós, o software do fornecedor rodando dentro da nossa infraestrutura e os serviços de terceiros do lado de fora. O território que contém e governa todos os organismos é o próximo nível: o ecossistema.

---

## 11. Ecossistema

### O que é na biologia

Todos os seres vivos de um lugar, mais o ambiente onde eles convivem, mais as regras que valem ali. Um lago é um ecossistema: os peixes, as plantas, as bactérias, a água, a temperatura, e as leis físicas que ninguém negocia. Três coisas caracterizam um ecossistema:

**Territórios.** O lago tem margem, meio e profundidade, e cada faixa tem condições diferentes: quem vive na parte escura de baixo não é quem vive na superfície.

**Regras que descem sobre todos.** A temperatura da água vale para todo mundo que está ali. Nenhum peixe negocia com ela.

**Seres de espécies diferentes convivendo.** Não existe ecossistema com uma espécie só. E há convívio de todo tipo, inclusive quem vive dentro de outro.

### O equivalente na infraestrutura

Uma [Organization](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html): o conjunto de todas as contas do grupo, os territórios em que elas estão agrupadas, as regras que descem sobre todas e os seres que não são nós vivendo lá dentro.

**Os territórios são as unidades organizacionais**, que agrupam contas por tipo de time: uma para cada domínio de negócio (com as três contas de ambiente dentro), uma para a plataforma (rede, dados, esteira, observabilidade), uma para segurança e uma para experimentação. Território não é enfeite de organograma: as regras descem por ele.

**As regras que descem são as políticas herdadas**, chamadas na AWS de políticas de controle de serviço (SCPs), e elas funcionam como um teto: **limitam, e nunca concedem**. Uma conta só faz o que a permissão dela concede e o teto do território não proíbe. Elas negam região fora da residência, impedem desligar os serviços de segurança, proíbem sair da organização. E têm limites declarados, que todo mundo precisa conhecer: não valem para a conta de gerenciamento da organização (a management account), nem para as funções que os próprios serviços da nuvem criam para operar sozinhos (as funções vinculadas a serviço, ou service-linked roles). Assim se explica a pele composta da seção anterior: uma camada dela é esse teto que desce do território.

**A vigilância e o registro fóssil** também são do ecossistema, porque enxergam todas as contas ao mesmo tempo. A vigilância tem duas peças com mecanismos diferentes: um serviço que grava o inventário de recursos em cada conta e região e o agrega num ponto central, e um painel de postura de segurança que se administra por uma conta delegada e distribui a mesma configuração para todas as outras. A imagem da célula de defesa vale para as duas: produzidas em outro lugar, presentes no seu território, sem você mandar nelas.

O registro fóssil é a trilha de auditoria de toda a organização, entregue numa conta separada que só recebe. Duas ressalvas de precisão: nenhuma conta-membro altera essa trilha, e a governança da organização ainda pode; e imutabilidade não vem de graça, ela é o resultado de três coisas somadas, a trava de retenção no depósito de arquivos, a conferência de integridade que denuncia adulteração, e o alarme para quando a entrega falha.

**Os seres que não são nós** ganham lugar aqui, e são de dois tipos. O software do fornecedor que roda **dentro** da nossa infraestrutura, num compartimento isolado, é a mitocôndria: mora dentro de nós, sem ela nada funciona, e tem DNA próprio, escrito pelo fornecedor, que nós não editamos. Nosso é o compartimento, o caminho até ele e o cofre com a credencial; dele é o interior. Os serviços de terceiros que rodam **fora** são outras espécies em outro lugar do mundo: nada deles entra no nosso código, e o que existe é a nossa ponta da conversa.

### A anatomia

```
ECOSSISTEMA (uma Organization)
├── conta de governança         cria as contas, guarda as leis
├── território dos domínios
│   ├── core banking            conta dev · conta homolog · conta prod
│   └── mesa de crédito         conta dev · conta homolog · conta prod
├── território da plataforma    rede · dados · esteira · observabilidade
├── território de segurança     vigilância · registro fóssil imutável
└── território de experimento   sem caminho para o resto
```

Cada parte:

- **a conta de governança**: onde as contas nascem e as leis são escritas. Nenhum trabalho de negócio roda nela.
- **cada território**: um agrupamento de contas que recebe o mesmo conjunto de leis.
- **as leis**: escritas como células comuns, na conta de governança, e herdadas por todas as contas do território.
- **o registro fóssil**: uma conta separada, que só recebe. Nem quem administra as outras contas consegue apagar o que está nela.

### O caso real

O ecossistema também nasce de células. As leis, os territórios e as próprias contas dos domínios são criados com as mesmas ferramentas do resto do artigo, num repositório da plataforma:

```
fundacao/                          repositório da plataforma
├── organizacao/                   célula: cria a organização
├── territorios/                   células: os agrupamentos e o registro deles
├── leis/                          células: as políticas herdadas
├── contas/                        uma célula por conta de domínio
└── seguranca/                     células: vigilância e registro fóssil
```

E aí aparece a recursão que todo leitor atento percebe: se tudo nasce de célula, quem criou a primeira? A resposta é a mesma da biologia, onde alguma coisa precisou existir antes da primeira célula. No começo alguém cria uma conta à mão, no navegador, com uma credencial temporária. A partir do primeiro recurso que tem interface de programação, tudo o mais nasce de código, incluindo as contas de todos os domínios.

Isso não quer dizer que sobre um único momento manual. Continuam humanos os pontos sem interface de programação e os que exigem decisão aprovada: a escolha da região onde tudo vai viver, o pedido de aumento de limites antes de criar dezenas de contas, a troca de informações com o serviço de identidade da empresa, e as conferências que ninguém automatiza sem responder por elas. O guia de fundação deste repositório lista a sequência completa, passo a passo, marcando o que é manual e por quê.

### Perguntas que podem surgir

#### A chave que cifra os dados de um domínio, onde ela entra?

Ela é uma célula do tecido permanente, porque perder a chave é perder o acesso a tudo que ela cifrou, e nenhuma receita traz isso de volta. Quem usa a chave nunca a contém: aponta para ela, com a autorização concedida pelo dono da chave, que é a ligação de dois lados da seção de trocas. E quem está em outra conta descobre o endereço dela pelo hormônio.

E um detalhe fecha o assunto da região, com uma correção que costuma pegar gente experiente: **a chave não viaja com a cópia**. No serviço gerenciado de cópias de segurança, o material copiado para outra região é cifrado de novo com a chave do cofre de destino, que é uma chave daquela região. Isso tem um motivo de sobrevivência: manter o único meio de decifrar na região que o plano de desastre supõe indisponível seria um plano que não funciona no dia em que for preciso. Quando o desenho exige o mesmo material de chave nos dois lados, existe um tipo de chave feita para isso, com uma cópia em cada região, e mesmo assim cada cópia é uma chave regional, com endereço e permissões próprios.

#### Podem existir vários ecossistemas?

Podem. É o caso deste programa de migração: o ecossistema atual, administrado por um parceiro, e o novo, sob gestão própria, convivem enquanto a mudança acontece. São dois ecossistemas, cada um com suas leis. O que atravessa a fronteira entre eles é acordo explícito, nunca acesso direto, exatamente como entre duas contas.

#### As leis herdadas não travam o trabalho do time?

Elas travam o que ninguém deveria fazer. Um time não precisa criar recurso em outro país nem desligar a auditoria da própria conta; se precisar de algo que a lei impede, o caminho é discutir a lei, no repositório onde ela está escrita, com quem é dono dela.

#### Do lado de dentro, o time vê uma célula que ele não criou. O que é aquilo?

É uma **célula de defesa**, produzida em outro lugar e distribuída por todos os tecidos, como as que circulam pelo corpo inteiro sem pertencer a nenhum órgão. Na conta de cada domínio vivem células assim: o coletor que envia a telemetria, o agente que inventaria o que existe, as regras de segurança que descem do território.

Três propriedades definem essa célula, e as três valem tanto na biologia quanto aqui: ela é produzida por outro dono (o time de plataforma ou o de segurança), ela vive dentro do território de quem hospeda, e o hospedeiro não pode desligá-la. O domínio enxerga a célula, usa o que ela oferece, e não manda nela.

#### O registro fóssil serve para quê no dia a dia?

Para responder "quem fez isso, quando, e com qual credencial" sem depender da memória de ninguém. Num banco, essa resposta é obrigação legal, e por isso ele mora numa conta que só recebe e não deixa apagar.

### Antes de seguir

Um ecossistema descreve o que existe em uma nuvem. Só que a organização pode ter mais de um, e pode ter em nuvens diferentes, e a pergunta que aparece é sempre a mesma: o que se repete e o que muda quando a mesma coisa precisa existir em dois lugares? O conjunto de todos os ecossistemas é o último nível: a biosfera.

---

## 12. Biosfera

### O que é na biologia

Todos os ecossistemas do planeta somados: o lago, a floresta, o deserto, o oceano. E a biosfera traz um fenômeno que os níveis de baixo não mostram: **a mesma função aparece em lugares diferentes, com corpos diferentes**.

O exemplo de escola é a asa. A asa do morcego e a asa do inseto cumprem a mesma função e são feitas de material completamente diferente: uma tem osso, a outra não. Elas não vieram uma da outra; cada uma evoluiu no seu canto, resolvendo o mesmo problema. A isso a biologia chama de **convergência evolutiva**: mesma função, anatomia diferente.

### O equivalente na infraestrutura

Todos os ecossistemas do grupo, em todas as nuvens. É onde a palavra multicloud mora, e ela mora no topo de propósito, porque é o nível que ninguém controla por dentro: o que existe entre ecossistemas é acordo, nunca acesso.

E aqui a convergência evolutiva ensina a lição prática mais cara de aprender por tentativa: em nuvens diferentes, o mesmo órgão tem a mesma função e é feito de átomos de tabelas diferentes. A função "processar comandos" existe nas duas, e os átomos que a realizam não se parecem: um provider tem `aws_lambda_function`, o outro tem o equivalente dele, com outro nome, outras propriedades e outro comportamento.

Daí sai a regra: **entre nuvens se preserva a função e o contrato, nunca os átomos.** Um órgão que fosse metade morcego e metade inseto não voa. O que se repete entre ecossistemas é a organização (a hierarquia, os nomes, as peças que se trocam, os sítios de ligação), e o que se refaz é o interior das células.

### A anatomia

```
BIOSFERA
├── ecossistema A (nuvem 1)      organização, territórios, leis, contas
│   └── organismos: desenvolvimento · homologação · produção
└── ecossistema B (nuvem 2)      outra organização, outras leis, outras contas
    └── organismos: (os mesmos nomes, corpos de outro material)
```

E o contrato que atravessa a fronteira, quando o mesmo órgão existe nos dois:

```hcl
# a molécula da nuvem 1 e a da nuvem 2 têm o MESMO contrato
variable "nome"       { type = string }    # mesmas peças que se trocam
variable "memoria_mb" { type = number }
output "nome_do_processador" { ... }       # mesmos sítios de ligação
# o main.tf de cada uma usa átomos de providers diferentes
```

Cada parte:

- **cada ecossistema**: uma nuvem, com governo próprio.
- **o contrato repetido**: as mesmas peças que se trocam e os mesmos sítios de ligação nas duas receitas.
- **os interiores diferentes**: átomos de providers diferentes, sem tentativa de unificação.

### O caso real

Dois cenários que costumam ser confundidos e que são bem diferentes de tamanho:

**A mesma coisa em duas regiões da mesma nuvem** é barato: mesmo ecossistema, mesmas leis, mesma receita, endereço trocado na configuração do ambiente. É a cópia de segurança em outra região do poster da fundação, e é assunto da seção da célula.

**A mesma coisa em duas nuvens** custa numa ordem de grandeza diferente, e não pelo motivo que parece. Escrever a segunda receita é a parte pequena. O peso está em manter duas anatomias vivas, com dois times treinados, dois conjuntos de leis e o dobro de operação, para uma função só. Quem paga esse preço faz por um motivo declarado (exigência de contrato, redução de dependência de um fornecedor), nunca por elegância.

### Perguntas que podem surgir

#### Dá para escrever uma receita que funcione nas duas nuvens?

Não, e insistir nisso produz o pior dos dois mundos: uma receita cheia de condições, que ninguém entende e que não usa bem nenhuma das duas nuvens. O que se compartilha é o contrato; o interior se escreve duas vezes.

#### Então tudo é jogado fora quando se muda de nuvem?

O interior das células, sim. E o que custou mais caro para construir permanece: a organização em territórios, a separação por dono, a divisão entre o que se refaz e o que não se refaz, os contratos entre órgãos, a disciplina de tudo nascer de código. Esse é o valor do desenho, e ele é o mesmo em qualquer nuvem.

#### Multicloud é meta?

É consequência de uma necessidade, quando existe. O que a arquitetura deste artigo garante é que a mudança seja possível sem refazer o pensamento: com domínios separados por conta, contratos declarados e nada preso na cabeça de ninguém, mover um órgão de nuvem vira um projeto com escopo, e não uma reconstrução do zero.

### Antes de seguir

A escada está completa, do átomo à biosfera. Falta o que dá sentido a ela: ver tudo isso montado de uma vez, num caso de verdade. É o que vem agora, com o núcleo bancário do começo ao fim.

---

## O que este artigo não cobre

Ler e instanciar o catálogo é o que a escada entrega. Operar um núcleo bancário exige mais nove assuntos, cada um com tratamento próprio, e o lugar deles já existe:

| assunto | por que ele não cabe aqui | onde continuar |
|---|---|---|
| Testes da receita | tem regime por custo: verificação estática em tudo, exemplo aplicado e destruído no que é barato, ensaio agendado no que é caro | os regimes de teste do documento de catálogo |
| Esteira de entrega | plano revisado, aprovação por ambiente, identidade por conta, aplicação do que foi aprovado | o bloco de plataforma de engenharia e a esteira de ambientes |
| Desvio de configuração | detectar, classificar, reconciliar com prazo, e a exceção de incidente com trilha | a política de mudança do documento de catálogo |
| Adoção do que já existe | inventário, adoção um a um, e o plano que precisa terminar sem nenhuma mudança pendente | o procedimento de migração do documento de catálogo |
| Mudança de endereço de célula | mover registro sem destruir recurso, com plano de reversão ensaiado antes | idem |
| Segredos | rotação, quem pode ler, o que fica registrado e o que não fica | o bloco de segurança e identidade |
| Trava de versões | fixar as versões dos plugins junto do código, para a mesma receita produzir o mesmo resultado | o documento de catálogo |
| Custo | estimativa por bloco, com inventário, volume e retenção | as calculadoras por bloco |
| Recuperação de desastre | tempo tolerável fora do ar, dado tolerável perdido, e o desenho que decorre disso | o bloco de fundação |

E o laboratório executável, que este artigo deliberadamente não traz, para não envelhecer dentro de um texto de conceitos, fica como próximo artefato do repositório, com dono.

---
