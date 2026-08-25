output "funcao_arn" { value = module.adapter.funcao_arn }
output "segredo_arn" { value = module.credencial.arn }
output "api_id" { value = module.porta.api_id }
output "execution_arn" { value = module.porta.execution_arn }
output "stage_name" { value = aws_api_gateway_stage.este.stage_name }
