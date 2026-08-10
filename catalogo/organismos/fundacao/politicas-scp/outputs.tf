output "policy_ids" { value = { for k, m in module.politica : k => m.policy_id } }
