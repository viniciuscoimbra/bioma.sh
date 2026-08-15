## Decisões

### O corte de fase é declarado, e o cálculo só aplica a declaração

A ordem topológica sai do grafo, mas ONDE cortar em fases é semântica: "conta
não se desfaz", "enrollment é assíncrono", "daqui em diante a credencial é
outra". Nada disso se infere do Terraform — e adivinhar seria o mesmo erro do
recurso por semelhança de nome que o AGENTS.md proíbe.

Os limites vêm de onde já vivem:

| limite | fonte que já existe |
|---|---|
| irreversível (fase própria + canário) | `contrato.json`: `durabilidade`, e a molécula `conta` |
| gate assíncrono | declaração nova no contrato: `gate: <nome>` (hoje o enrollment está escrito no orquestrador) |
| troca de credencial | a fronteira `fundacao/` × resto, que os dois `root.hcl` já marcam |
| espera humana (e-mail, aprovação) | declaração nova: `espera: humana`, com o motivo |

O que não tiver declaração vira corte proposto, nunca corte silencioso: o
gerador lista "cortei aqui porque X" para cada fase, e o dono confirma na
exportação.

### O plano é dado versionado, com as duas assinaturas

`entrega.json` guarda o hash da árvore de que foi calculado e o ajuste manual,
se houve. Árvore mudou, plano estale: o executor recusa executar plano de árvore
que não é mais a atual, com a mesma lógica do `origem.json` das ferramentas.

### Alternativas recusadas

- **Inferir fases só do grafo, sem metadado.** Produz ondas corretas e paradas
  erradas: nada no grafo diz que criar conta queima e-mail. Recusada.
- **Manter o roteiro à mão e só validar contra o grafo.** O portão de coerência
  pega a ligação fora de ordem, mas o roteiro continua nomeando pastas
  (`faturamento` provou o custo). Meio conserto. Recusada como fim; aceita
  como primeiro degrau, porque o portão nasce antes do gerador.

## O degrau de viabilidade

1. **Portão de coerência** (dias): célula que depende de fase posterior
   reprova. O código é o `dependencias.py` da instância, generalizado. Valor
   imediato mesmo sem o resto.
2. **Cálculo** (semana): `plano_de_entrega.py` emite `entrega.json` da árvore
   do a-instancia e o resultado se confronta com as seis fases derivadas
   à mão na instalação real. Divergência é achado: ou o cálculo erra, ou o
   roteiro errava.
3. **Execução** (dias): o orquestrador da instância troca o roteiro por
   `entrega.json`. Nenhuma mudança de comportamento esperada; o diff da fila é
   a prova.
4. **Tela** (maior, sem prazo): ver e ajustar o plano na exportação. Última,
   porque 1-3 entregam valor sem ela.
