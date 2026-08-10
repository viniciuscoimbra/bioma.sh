# Design — convenções vêm da instância

## A régua

Uma constante fica na ferramenta quando ela responde por como a ferramenta
funciona, e vai para a instância quando responde por como aquela organização
opera. A pergunta que decide, aplicada ao que existe hoje:

| constante | fica ou sai | por quê |
|---|---|---|
| `TOPO_NATUREZA` | fica | Security, Infrastructure, Platform, Workloads e Sandbox são o conjunto que a AWS recomenda, e a ferramenta lê especificação escrita nesse vocabulário |
| `TOPO_COM_OU_FILHA` | fica | é consequência do anterior: quem hospeda OU filha e quem hospeda conta |
| `AMBIENTES_POR_NATUREZA` | fica como padrão, sobrescrevível | a ferramenta precisa de um número para funcionar sem arquivo; qual número é decisão de quem opera |
| `ZONA_TRILHO` | sai | os nomes são da árvore de uma instância |
| `AGRUPADORAS` | já saiu | a regra intrínseca é "topo que não nomeia OU folha é agrupador"; a lista de nomes era da instância |
| `apelidos_de_trilho` | sai | o catálogo chama de `esteira` o que a instância chama de `devsecops` |
| `GUARDA_CONTEUDO` | fica | é sobre serviço da AWS guardar conteúdo, e não sobre organização nenhuma |

## Por que não um terceiro mecanismo

A instância já fala com a ferramenta por dois caminhos: `contas.hcl`, que
`contas-vindas-do-live` passou a ler, e `tela/projeto.json`, que guarda região,
prefixo e áreas. O arquivo de convenções é o terceiro, e isso pede justificativa.

**Escolhido: arquivo próprio, `convencoes.json`.** `contas.hcl` é HCL do live e
descreve conta, não convenção de desenho; ler convenção dali obrigaria o
tradutor a interpretar HCL para uma coisa que não é conta. `projeto.json` é
estado local da tela, fora do versionamento, e convenção de instância precisa
ser versionada com a instância, porque muda o que a árvore gerada tem dentro.

**Recusado: variáveis de ambiente para cada convenção.** Convenção some do
registro, e ninguém revisa export em PR.

## O que acontece quando falta

Sem arquivo, a ferramenta usa o padrão e **diz que usou**: cada peça carrega de
onde a lista de ambientes veio. Assumir em silêncio é o que faz alguém descobrir
no apply que a árvore tinha um ambiente a menos.

Zona que nenhum mapa conhece continua virando trilho pelo nome, que é o
comportamento de hoje, e passa a dizer que foi por falta de convenção.

## As duas ferramentas que não rodam

`gerar_estrutura.py` e `verificar_cobertura.py` leem `inventario.json` da raiz
do framework, e ele mora na instância desde o split. Uma quebra com traceback, a
outra devolve zero dizendo que não tem insumo.

**Escolhido: mover as duas para a instância.** Elas são úteis, e o lugar delas é
onde o inventário está. A alternativa, aceitar caminho por argumento, mantém no
framework genérico um mapa de serviço para unidade que é da arquitetura de
referência de um cliente.

Consequência que precisa ser dita: o pré-voo do `bioma.sh` perde `confere
cobertura`. Ele já não fazia nada aqui, e um portão que pula é pior que um
portão ausente, porque parece que alguém conferiu.
