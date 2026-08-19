output "connector_arn" { value = aws_mskconnect_connector.sink.arn }
output "connector_nome" { value = aws_mskconnect_connector.sink.name }
# o grupo de consumo que o MSK Connect fixa; as políticas de acesso o nomeiam
output "grupo_consumo" { value = "connect-${local.nome}" }
output "tabelas" { value = local.tabela_de }
