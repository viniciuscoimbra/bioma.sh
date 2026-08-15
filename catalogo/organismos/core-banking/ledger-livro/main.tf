# Organismo ledger-livro (05): o livro-razão em Aurora, composto da molécula
# banco-aurora. Schema e migração são da esteira; aqui a instância durável,
# com a chave do domínio e pg_audit ligado. Durabilidade permanente.

module "livro" {
  source = "../../../moleculas/banco-aurora"

  nome               = "ledger-${var.ambiente}"
  nome_banco         = "ledger"
  subnet_ids         = var.subnet_ids
  security_group_ids = var.security_group_ids
  kms_key_arn        = var.kms_key_arn
  instancias         = var.instancias
  classe             = var.classe
}
