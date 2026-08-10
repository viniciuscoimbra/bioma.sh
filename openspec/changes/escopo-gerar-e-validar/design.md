# Design — onde termina o bioma

## O problema que originou a ferramenta

Um parque inicial complexo, com as arquiteturas de referência desenhadas e
documentadas, e nenhum caminho entre o desenho e o Terraform. Escrever à mão
cada pasta, cada `.tf`, cada `terragrunt.hcl` e cada trava de ciclo de vida é
trabalho de meses, e o erro só aparece no apply.

Daí o que a ferramenta tem que resolver, na ordem:

1. transformar a arquitetura desenhada em Terraform e Terragrunt;
2. deixar entender o que foi gerado, sem precisar ler tudo;
3. deixar acompanhar o que mudou entre uma versão do desenho e a seguinte;
4. entregar a estrutura na máquina de quem desenhou, para ele subir onde
   quiser: local ou na AWS de verdade.

## Onde o projeto aberto termina

No item 4: a estrutura validada, baixada. Quem baixou sobe onde quiser, com o
terraform dele, na conta dele.

Sincronizar direto no GitHub de quem usa é o passo seguinte, e é do site, não
deste repositório. Executar por conta de alguém exige guardar credencial de
terceiro, e isso é outro produto com outras obrigações.

Tudo aqui é livre e aberto. Não há camada paga.

## A decisão

**A. Continuar executando.** O comando sobe emulador em contêiner, cria bucket
de estado, roda `terragrunt run --all apply` e governa destruição em tempo de
execução. Para instalar, seis ferramentas: terragrunt, terraform, jq, opa, aws
cli e docker, mais o provider da AWS com 875 MB. Quem clona do GitHub precisa
de um manual de instalação antes de ver a ferramenta funcionar, e cada uma
dessas seis peças passa a ser mantida aqui para sempre.

**B. Gerar, validar e entregar.** O comando para na estrutura provada. Criar,
atualizar e destruir viram receita escrita, que o time roda no pipeline dele.
Para gerar, Python e um navegador. Para provar que o código compila, terraform.
Para o parecer de especialista, uma chave de modelo.

**Decidido: B**, em 2026-08-07, pelo dono. A razão: o objetivo é o download da
estrutura validada, e executar não faz parte dele. Manter a camada de execução
cobra manutenção permanente e transforma a instalação num obstáculo antes da
primeira tela.

## A garantia sem executar

A trava do que não pode cair já é gerada, e não executada: `prevent_destroy`
está no `.tf` da célula permanente e recusa qualquer `terraform destroy`, venha
o comando de onde vier. A política de durabilidade é um `.rego` versionado
junto da árvore, pronta para o pipeline de quem usa.

## O que muda em cada peça

| Peça | Hoje | Depois |
|---|---|---|
| `bioma.sh` | aplica, destrói, sobe emulador | gera, valida e imprime a receita |
| tela, botão Aplicar | roda `terragrunt apply` | mostra o comando exato, copiável |
| tela, botão Destruir | roda com janela declarada | mostra o comando e o que a trava recusa |
| tela, botão Simular | roda `plan` | continua: plan não muda nada |
| janela de mudança | campo do comando executado | campo da receita e do registro |
| degrau local | caminho obrigatório | exemplo em `testes/` |
| `opa`, `aws`, `docker` | pré-requisito | opcional |

## As camadas da instalação

O README declara três, e diz o que cada uma acrescenta:

- **Python e navegador**: gerar a estrutura, ler o que foi gerado e baixar.
- **terraform**: a validação por compilação, dentro da revisão.
- **chave de modelo**: ler imagem de arquitetura e o parecer de especialista.

Camada ausente se anuncia na tela, dizendo o que ela conferiria e como
habilitá-la.

## O que ainda falta para o item 3

Acompanhar o que mudou entre versões do desenho não existe hoje. O `.bio`
guarda o estado atual, e a árvore é regerada inteira. Duas peças resolvem:

- **diferença entre gerações**: guardar a árvore anterior e mostrar o que
  nasceu, mudou e sumiu, do jeito que `testes/arvore_referencia.py` já faz para
  o portão;
- **a estrutura como repositório**: a árvore materializada sai com `git init` e
  um primeiro commit, para que a geração seguinte apareça como diff no editor
  de quem usa.

Isso vira change próprio, depois deste.
