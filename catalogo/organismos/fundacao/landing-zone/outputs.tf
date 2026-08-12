# O que a landing zone publica para o resto da fundação. `drift_status` sai de
# propósito: a sequência seguinte lê antes de mexer, e divergência na fundação
# é motivo para parar, não para seguir aplicando por cima.
output "landing_zone_arn" { value = aws_controltower_landing_zone.esta.arn }
output "landing_zone_id" { value = aws_controltower_landing_zone.esta.id }
output "drift_status" { value = aws_controltower_landing_zone.esta.drift_status }
output "versao_disponivel" { value = aws_controltower_landing_zone.esta.latest_available_version }
output "conta_audit" { value = aws_organizations_account.audit.id }
output "conta_log_archive" { value = aws_organizations_account.log_archive.id }

# a Security OU sai para quem precisa nascer dentro dela. Na versão 4.0 o
# Control Tower não cria mais a Security OU, e a OU onde moram as contas de
# integração é que passa a ser a designada.
#
# Nome de OU é único sob o mesmo pai: declarar outra "Security" na raiz faz a
# Organizations recusar com DuplicateOrganizationalUnitException. A célula 02 já
# declarou, e a fase 2 parava aí. Quem mora sob esta OU pendura na 02b, e as
# contas de segurança leem este id direto.
output "ou_seguranca_id" { value = aws_organizations_organizational_unit.seguranca.id }
