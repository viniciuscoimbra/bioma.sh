# Tasks — camadas de diagnóstico

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.

## 1. As camadas

- [x] **1.1 Quatro camadas com nível.** `ferramentas/diagnostico.py`. _Evidência: no barramento, `0 erro(s), 9 aviso(s) · pode ser salvo`, com os avisos nomeando os argumentos sem resposta peça a peça._
- [x] **1.2 Erro impede a entrega.** _Evidência: `resumo()` devolve `pode_sair: False` com um erro e `True` com um aviso, conferido no teste._

## 2. Os testes, genéricos

- [x] **2.1 Caso e contra-caso por regra, em desenho sintético.** _Evidência: `testes/camadas.py`, 19 verificações, todas passando; nenhuma depende de bloco de cliente._
- [x] **2.2 A suíte reprova código quebrado.** _Evidência: desligando a detecção de peça solta, sai `FALHA peça solta que não guarda nada é erro` e código 1._
- [x] **2.3 O portão entra em `testes/portoes.sh`.** _Evidência: seis portões verdes em 40s._

## 3. O que os testes sintéticos acharam

- [x] **3.1 Defeito que os blocos reais não exercitam.** _Evidência: `dependencias_de` quebrava com `KeyError: 'trilho'` quando a peça vinha sem área declarada, que é o caso de quem desenha na tela sem preencher. Corrigido com queda para `plataforma`._

## 4. O que falta

- [x] **4.1 A tela mostra os achados por camada, e o erro barra a entrega.** _Evidência: foto olhada com a gaveta trazendo `peça solta · layer 2 · the drawing · ligue a peça a outra, ou tire do desenho` e `valor que só a pessoa sabe · layer 3`; achado do diagnóstico sai sem campo de resposta e a pergunta da ficha continua com o dela (0, 0 e 1 input). Pela rota, `materializar` de um desenho com peça solta responde `o desenho tem 1 erro(s); corrija antes de gravar` e a pasta fica vazia._
- [x] **4.2 Camadas 3 e 4 com contra-caso por regra.** _Evidência: 30 verificações; a camada 4 ganhou árvore escrita à mão, com caso e contra-caso para ARN literal, auto-referência, receita vazia, mock inventado e input puxando saída inexistente._
- [x] **4.3 Regra vacuosa removida.** _Evidência: "dependência sem valor" era inalcançável, porque quase todo recurso publica `id`. No lugar entrou "seta que não virou dependência", que é o caso real: a pessoa ligou duas peças e a estrutura saiu sem ordem entre elas._

## 5. O que os testes acharam nesta rodada

- [x] **5.1 A gaveta descartava campo desconhecido.** _Evidência: `normalizar()` em `gaveta-pendencias.jsx` reconstrói o objeto com uma lista fixa de campos, então `somenteLeitura` morria ali e o achado aparecia com campo de resposta. A foto mostrou; o código não._
