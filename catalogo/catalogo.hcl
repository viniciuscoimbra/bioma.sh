# Versão do catálogo consumida por TODOS os templates deste live.
# Ponto único: mudar aqui é decisão explícita; divergência entre ambientes
# fica impossível por construção (catálogo §5).
locals {
  catalogo_versao = "v0.2.0-interiores" # 72 receitas com interior validado
  catalogo_source = "git::ssh://git@github.com/ORGANIZACAO/bioma.sh.git//catalogo"
}
