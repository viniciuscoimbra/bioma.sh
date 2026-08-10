# Política de durabilidade sobre o plano (catálogo: a proteção vem do campo
# durabilidade do contrato, avaliada por política, não da pasta).
#
# Entrada: terraform show -json do plano da célula.
# Dados:   {"durabilidade": "permanente" | "estavel" | "efemera"} do contrato.
#
# permanente: nenhum delete e nenhum replace passa.
# estavel:    delete não passa (replace exige janela, decidida fora do plano).
# efemera:    tudo passa.

package politica

import rego.v1

acoes_destrutivas contains rc if {
	some rc in input.resource_changes
	"delete" in rc.change.actions
}

deny contains msg if {
	data.durabilidade == "permanente"
	some rc in acoes_destrutivas
	msg := sprintf("permanente: %s seria destruído (%v)", [rc.address, rc.change.actions])
}

deny contains msg if {
	data.durabilidade == "estavel"
	some rc in acoes_destrutivas
	not "create" in rc.change.actions
	msg := sprintf("estavel: %s seria destruído sem recriação (%v)", [rc.address, rc.change.actions])
}
