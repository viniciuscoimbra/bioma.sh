# Organismo trilha-de-dados: quem tocou no objeto, e não só quem mexeu na conta.
#
# A trilha do Control Tower registra AÇÃO DE GESTÃO: criar balde, mudar política,
# apagar chave. Ela não registra LEITURA DE OBJETO, e é por isso que os controles
# de registro de objeto reprovam mesmo numa organização com trilha organizacional
# de pé — são duas perguntas diferentes, e a segunda custa dinheiro.
#
# Esta trilha responde a segunda, e só onde a resposta vale o preço. Ela é
# organizacional: nasce na conta de gestão e alcança toda conta-membro, incluindo
# as que ainda não têm carga.
resource "aws_cloudtrail" "esta" {
  name           = var.nome
  s3_bucket_name = var.balde_destino
  kms_key_id     = var.kms_key_arn

  is_organization_trail         = true
  is_multi_region_trail         = true
  include_global_service_events = true
  enable_log_file_validation    = true

  # O seletor avançado é o que torna a escolha possível: sem ele, registrar
  # objeto é tudo ou nada. Com ele, a lista de baldes vigiados vira condição, e
  # o que fica de fora não gera evento nem cobrança.
  advanced_event_selector {
    name = "leitura e escrita de objeto nos baldes declarados"

    field_selector {
      field  = "eventCategory"
      equals = ["Data"]
    }

    field_selector {
      field  = "resources.type"
      equals = ["AWS::S3::Object"]
    }

    field_selector {
      field       = "resources.ARN"
      starts_with = [for b in var.baldes_vigiados : "arn:aws:s3:::${b}"]
    }
  }

  tags = { Name = var.nome }
}
