variable "nome" { type = string }

variable "host" {
  type        = string
  description = "onde o serviço atende, visto de dentro da VPC"
}

variable "porta" { type = number }

variable "etiqueta" {
  type        = string
  description = "a etiqueta que marca a máquina saltadora"
}

variable "valores_da_etiqueta" { type = list(string) }

variable "nome_politica" {
  type        = string
  default     = "abrir-tunel"
  description = "nome-contrato que o conjunto referencia; igual em toda conta"
}

# A chave que cifra a sessão do túnel. Ela não aparece no documento acima, e
# essa é a armadilha: o documento do túnel não declara `kmsKeyId`, então quem
# lê só o documento conclui que a sessão é clara e que a política não precisa
# de KMS. Ela é cifrada assim mesmo — a sessão herda a chave das PREFERÊNCIAS
# DA CONTA, que moram dentro do documento `SSM-SessionManagerRunShell` e valem
# para toda sessão daquela conta, de qualquer documento.
#
# Sem a permissão nesta chave, o `StartSession` é aceito e a sessão morre no
# aperto de mão com AccessDenied em `kms:GenerateDataKey`. A mensagem fala da
# chave e não da política, e o erro não aparece para quem tem
# AdministratorAccess — o que faz o defeito parecer ser da pessoa.
#
# Achado em 2026-08-21 lendo o log do agente na máquina de salto, onde a
# configuração da sessão sai com `KmsKeyId` preenchido mesmo com o documento
# do túnel sem declarar nenhuma. É o mesmo ARN que `organismos/seguranca/
# acesso-auditado` recebe em `kms_key_arn` na mesma conta.
variable "kms_sessao_arn" {
  type        = string
  description = "a chave das preferências de sessão da conta; o documento do túnel não a declara, mas a sessão a usa"
}
