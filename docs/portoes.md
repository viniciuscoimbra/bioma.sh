# Os portões

Sete verificadores rodam antes de qualquer comando tocar a nuvem. Cada um
confere uma propriedade da árvore, e o nome do arquivo é o nome da propriedade:
`verificar_<propriedade>.py`.

Todos falham com código 1 e dizem arquivo e linha. Código 2 significa "sem
insumo para decidir" e não reprova: uma árvore que ainda não tem o que o portão
lê não está errada, está incompleta.

| portão | confere | quando reprova |
|---|---|---|
| `preenchimento` | nenhuma célula vai para a nuvem com ficha por preencher | sempre |
| `durabilidade` | a classificação da célula combina com a trava dos átomos que ela cria | sempre |
| `cardinalidade` | o contrato da ligação combina com o `variables.tf` da receita | sempre |
| `procedencia` | nenhum valor de reserva consegue passar por valor declarado | sempre |
| `ilustrativo` | quais variáveis estão caindo na reserva do template **neste ambiente** | apply em nuvem real |
| `conformidade` | a árvore usa os valores que a instância declarou obrigatórios | sempre |
| `alcance` | ninguém aplica célula que usa recurso de outra conta sem concessão | apply em nuvem real |
| `mocks` | a saída que a célula lê da vizinha existe na receita e no mock | sempre |

## Procedência e ilustrativo não são o mesmo portão

Parecem, e a diferença é o que separa um defeito de código de um estado do
ambiente.

**Procedência olha o código.** Ele pergunta se a reserva escrita na árvore é
*capaz* de passar despercebida. Reserva que funciona é o defeito: ela não
levanta erro, e o comando segue produzindo a coisa errada com a cara da coisa
certa. Três formas, e as três já quebraram numa árvore real:

- `get_env("TG_CONTA_X", "111111111111")` devolve um número válido, que forma um
  nome de balde de estado válido. O estado da instituição vai para um balde
  batizado com um número inventado, dentro da conta real dela. A reserva tem que
  ser incapaz de funcionar: `DECLARE_<VARIÁVEL>` não é nome que o S3 aceite nem
  valor que `allowed_account_ids` aceite, e o erro sai com o nome da variável
  dentro dele. Vale para a conta escondida num ARN
  (`arn:aws:acm:<região>:222222222222:certificate/...`), que é a mesma conta
  inventada com um ARN em volta.
- `dependency` sem `mock_outputs_allowed_terraform_commands`. O mock existe para
  o plano de quem depende de algo que ainda não aplicou; sem essa linha o
  Terragrunt o entrega também no apply, e o recurso nasce apontando para um ARN
  inventado enquanto o comando escreve `Apply complete`.
- saída de plano versionada. `plano.json` tem número de conta e id de recurso,
  envelhece no commit seguinte e se lê como registro de um plano real.

Por olhar o código, ele reprova em todo perfil, o local incluído: reserva que
funciona é defeito da árvore, não do ambiente onde ela roda.

**Ilustrativo olha o ambiente.** Ele pergunta o que está caindo na reserva
*agora*, com as variáveis que existem nesta máquina. Isso muda de execução para
execução, e é informação, não defeito: planejar antes de a instituição existir é
o caminho normal.

Por isso o apply reprova em qualquer queda, e o plano avisa. Não por tolerância:
para a queda que de fato machuca, a conta, quem reprova é a própria nuvem, na
célula certa, porque o portão de procedência já garantiu que a reserva não
funciona. Uma varredura da árvore inteira cobraria as contas que só nascem em
fases posteriores para deixar planejar as primeiras.

## Botão do framework, obrigação da instância

O catálogo é genérico de propósito: a postura padrão de um firewall, a retenção
de um log, o algoritmo de uma chave. Nem toda instituição que usa este catálogo
responde ao mesmo regulador, então nenhuma dessas escolhas pode nascer chumbada
na receita.

Isso cria o problema oposto: um botão que qualquer um gira faz a conformidade
depender de quem rodou o comando naquele dia. A resposta é a instância declarar
onde o botão deixa de ser botão, em `convencoes.json`:

```json
"politicas_obrigatorias": {
  "<caminho/da/receita>": {
    "<nome_do_input>": { "valor": "<exigido>", "por_que": "<a norma que obriga>" }
  }
}
```

O portão de conformidade cobra o valor **efetivo**: o que a célula passa, ou o
default da receita quando ela não passa nada. Uma obrigação que o default já
satisfaz continua declarada, porque default muda e obrigação não.

A régua: a receita oferece o botão e nunca a garantia; a instância declara a
garantia e nunca reescreve a receita.

## Escopo: ler a árvore toda, cobrar só a área

`ilustrativo` e `alcance` leem a árvore inteira, porque não dá para saber quem
publica um recurso de travessia olhando só uma pasta. Mas eles **cobram** só o
que cai dentro da área do comando, que o `bioma.sh` passa em `--escopo`.

Sem essa separação, aplicar uma área era barrado por defeito de outra. Numa
árvore real isso produziu um nó cego: a fase que **cria** as contas era barrada
por exigir os números dessas contas. Nenhuma ordem de execução satisfazia, e a
mensagem não dizia que a causa era o escopo.

Queda em arquivo compartilhado não conta para o escopo, e não por tolerância:
ela tem guarda melhor. O portão de procedência garante que a reserva de lá é
incapaz de funcionar, então a nuvem recusa na célula exata, com o nome da
variável no erro.

## A régua de "conta inventada"

Variação dos dígitos, e não uma lista de números proibidos, que envelheceria a
cada número novo. Conta emitida é sorteada e forma cerca de onze blocos de
dígitos repetidos; as escritas à mão formam poucos. Quatro blocos é o corte, com
uma segunda regra para a sequência corrida (`123456789012`) que a documentação
da AWS usa.

## O que é do framework e o que é da instância

Portão que confere uma propriedade da árvore é do framework: ele vale para
qualquer instituição. Portão que precisa saber **o que esta instituição
decidiu** é da instância, e mora no repositório dela.

O caso que existe hoje: cobertura, que confronta a tabela de Serviços de cada
documento de arquitetura com o inventário da árvore. Quem sabe o que precisa
estar coberto é o repositório que desenhou, e generalizar isso exigiria inventar
uma configuração que ninguém pediu.

Antes de mover um verificador para cá, a pergunta é uma só: ele nomeia alguma
decisão de uma instituição (cliente, domínio, região, regulador)? Se nomeia, é
da instância.
