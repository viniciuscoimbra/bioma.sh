variable "root_id" { type = string }

# A ÁRVORE INTEIRA NUMA DECLARAÇÃO, e não uma lista por nível.
#
# Quem declara diz `pai`, e a profundidade sai daí. Antes eram três variáveis
# (`ous_nivel_1`, `ous_nivel_2`, `ous_nivel_3`) e a receita dizia por escrito
# que um quarto nível exigiria bloco novo: o nível estava chumbado na FICHA,
# que é o lugar errado. A árvore de OUs é definição de negócio, feita uma vez
# na criação e quase nunca mexida depois, porque mexer nela reorganiza a
# infraestrutura inteira, de recurso a rateio de custo. Ela tem a forma que o
# negócio tem, e não a que a receita comporta.
#
# `pai` nulo é filha da raiz.
#
# `registrar` liga o baseline do Control Tower naquela OU. A Security OU do
# Control Tower não recebe o baseline geral, e OU agrupadora que não hospeda
# conta também não precisa: quem registra é onde a conta mora.
variable "ous" {
  type = map(object({
    pai       = optional(string)
    registrar = bool
  }))
  description = "nome da OU -> { pai (nulo = filha da raiz), registrar }"

  validation {
    # Pai declarado que não existe vira OU órfã: o Terraform falha lá na
    # frente, num `parent_id` nulo, sem dizer de quem.
    condition = alltrue([
      for nome, ou in var.ous :
      ou.pai == null || contains(keys(var.ous), ou.pai)
    ])
    error_message = "Alguma OU aponta um `pai` que não está declarado nesta mesma árvore."
  }

  validation {
    # A AWS Organizations aninha OU em CINCO níveis abaixo da raiz. O limite é
    # do serviço, e não desta receita: declarar um sexto não é caso de a
    # receita crescer, é caso de a AWS recusar.
    condition = alltrue([
      for nome, ou in var.ous :
      ou.pai == null
      || try(var.ous[ou.pai].pai, null) == null
      || try(var.ous[var.ous[ou.pai].pai].pai, null) == null
      || try(var.ous[var.ous[var.ous[ou.pai].pai].pai].pai, null) == null
      || try(var.ous[var.ous[var.ous[var.ous[ou.pai].pai].pai].pai].pai, null) == null
    ])
    error_message = "Árvore mais funda que os cinco níveis que a AWS Organizations aninha."
  }
}

variable "baseline_identifier" {
  type    = string
  default = null
}
variable "identity_center_baseline_arn" {
  type    = string
  default = null
}
