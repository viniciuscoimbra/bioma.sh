# Contrato de receita

O que uma receita precisa declarar para o bioma aceitá-la. Os verificadores cobram cada item, e receita que não cumpre não entra na fila do comando.

## Os campos

| campo | o que responde | quem cobra |
|---|---|---|
| `papel` | o que esta receita faz, numa frase | leitura humana |
| `cria` | os recursos que nascem com ela | `verificar_cobertura` |
| `nao_cria` | o que alguém poderia esperar dela e não vem | leitura humana |
| `recebe` | o que precisa chegar de fora para ela nascer | `gerar_iac` monta a ficha |
| `publica` | o que ela expõe a outros donos | leitura humana |
| `durabilidade` | `permanente`, `estavel` ou `efemera` | `verificar_durabilidade` e o comando de destruir |
| `local` | `suportado`, `substituto: <qual>`, `plan-apenas` ou `fora` | o perfil local |
| `custo` | `baixo`, `medio` ou `alto` | o perfil de ensaio |
| `premissas` | o que precisa ser verdade para ela funcionar | leitura humana |

## As regras que os verificadores aplicam

**Classificar é por célula, proteger é por átomo.** Receita declarada permanente precisa ter trava (`prevent_destroy`) em todo átomo que guarda conteúdo. Receita declarada efêmera não pode ter átomo travado. Divergência entre as duas coisas reprova.

**Molécula nunca é raiz.** Molécula existe composta dentro de organismo. Célula do live apontando molécula reprova.

**Ligação declara permissão dos dois lados.** Ligação sem dono ou sem a permissão que ela exige reprova.

**Fronteira não tem receita.** O que não é nosso entra só como contrato, com a nossa ponta descrita.

**Artefato não vive no live.** O que é da esteira fica fora da árvore de instâncias.

## O que o tecido significa na prática

A pergunta que classifica: se esta célula for apagada e criada de novo pela receita, o que existia dentro dela volta **igual**?

Volta igual, é renovável. Volta diferente, ou não volta, é permanente. A palavra "igual" é o que impede o erro mais caro: cópia bruta de sistema que continua vivo se reconstrói e não se reproduz, então é permanente mesmo parecendo descartável.
