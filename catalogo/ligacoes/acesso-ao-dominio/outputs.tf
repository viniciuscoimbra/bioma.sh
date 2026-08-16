output "permission_set_arns" {
  value = { for k, ps in aws_ssoadmin_permission_set.conjunto : k => ps.arn }
}

output "grupos" {
  value = { for k, g in aws_identitystore_group.proprio : k => g.group_id }
}
