variable "dominios" {
  type        = map(list(string))
  description = "domínio -> contas que pertencem a ele; a atribuição que não depende de etiqueta"
}

variable "naturezas" {
  type        = map(list(string))
  description = "direto | medido | condominial -> contas de cada natureza"
}

variable "dominios_de_negocio" {
  type        = list(string)
  description = "quem RECEBE rateio: os domínios que existem para o negócio, e não as plataformas"

  # A lista é menor que a de `dominios` por definição: plataforma não recebe
  # quota de plataforma, e sandbox não é domínio de negócio.
}

variable "rateia_para_dominios" {
  type        = list(string)
  description = "valores de Dominio cujo custo é distribuído aos domínios de negócio"

  # O limite da AWS é de dez regras de rateio por categoria, e uma regra é uma
  # origem. Passar de dez exige agrupar plataformas na origem, o que a
  # categoria consegue fazer sem perder a leitura por conta.
}

variable "metodo_de_rateio" {
  type        = string
  default     = "PROPORTIONAL"
  description = "PROPORTIONAL (fração ideal, recomendado) | EVEN (partes iguais) | FIXED"

  validation {
    condition     = contains(["PROPORTIONAL", "EVEN", "FIXED"], var.metodo_de_rateio)
    error_message = "método de rateio precisa ser PROPORTIONAL, EVEN ou FIXED."
  }
}

variable "valor_padrao" {
  type        = string
  default     = "fora-do-mapa"
  description = "onde cai a conta que nenhuma regra alcança"

  # `fora-do-mapa` e não vazio: conta nova que ninguém classificou precisa
  # aparecer com nome que denuncia a falta, e não sumir no agregado.
}

variable "ambientes" {
  type        = map(list(string))
  description = "dev | hml | nprd | prd | unico -> contas de cada ambiente"

  # `unico` cobre quem não tem ambiente (rede, governança). Sem ele a soma dos
  # ambientes não fecharia com a fatura, e eixo que não fecha não serve de eixo.
}

variable "nome_da_politica_de_paineis" {
  type        = string
  default     = "finops-ver-paineis"
  description = "nome da politica que concede leitura dos paineis de billing"

  # O NOME importa mais que o conteúdo: o Identity Center anexa política da
  # conta por nome, não por ARN, e o conjunto de permissões que a referencia
  # precisa dizer exatamente este.
}

variable "habilitar_agente_finops" {
  type        = bool
  default     = false
  description = "cria a politica que permite ligar e operar o AWS FinOps Agent"

  # Falso por padrão porque o serviço está em PREVIEW: sem SLA, com limite
  # mensal que a AWS não publica, e com preço desconhecido depois do preview.
  # Quem liga assume isso, e a decisão fica no diff da célula.
}

variable "nome_da_politica_do_agente" {
  type        = string
  default     = "finops-operar-agente"
  description = "nome da politica de operacao do agente de FinOps"
}
