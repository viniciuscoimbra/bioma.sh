output "attachment_ids" {
  value = { for k, v in aws_vpn_connection.esta : k => v.transit_gateway_attachment_id }
}

# O que a instituição entrega a quem configura o equipamento do outro lado.
# São dois túneis por borda, cada um com endereço e segredo próprios.
output "tuneis" {
  value = { for k, v in aws_vpn_connection.esta : k => {
    tunel1_endereco = v.tunnel1_address
    tunel2_endereco = v.tunnel2_address
  } }
}
