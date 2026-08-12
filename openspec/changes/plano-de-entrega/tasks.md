## 1 · Portão de coerência de fases

- [ ] 1.1 `verificar_entrega.py`: dado um plano (roteiro atual ou
      `entrega.json`), célula que depende de célula de fase posterior reprova
      com as duas fases nomeadas. Evidência: as duas ligações de TGW do
      gf-infrastructure em 86cc178~1 reprovam; em 86cc178, passam.

## 2 · Cálculo do plano

- [ ] 2.1 `plano_de_entrega.py` lê `config_path`, contratos e
      `convencoes.json`, e emite `entrega.json` com ondas topológicas e cortes
      declarados. Evidência: rodado no gf-infrastructure, reproduz as seis
      fases ou aponta a divergência com a razão.
- [ ] 2.2 `gate:` e `espera:` entram no contrato das receitas que precisam
      (conta-governada, landing-zone). Evidência: o enrollment e a confirmação
      de e-mail saem do orquestrador e aparecem no plano calculado.
- [ ] 2.3 O plano carrega o hash da árvore; executor recusa plano estale.
      Evidência: mudar uma célula e executar sem recalcular reprova.

## 3 · Execução

- [ ] 3.1 O orquestrador da instância lê `entrega.json` no lugar do roteiro.
      Evidência: `--listar-fila` idêntico antes e depois, e os defeitos de
      roteiro (nome de pasta errado) deixam de ser possíveis.

## 4 · Tela

- [ ] 4.1 A exportação mostra o plano e aceita ajuste de corte, registrado como
      decisão. Evidência: navegador, o clique dado e a foto olhada.
