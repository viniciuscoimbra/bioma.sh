# Organismo borda-publica (03·D4): WAF diante do que fica exposto. Shield
# Advanced é assinatura por conta (decisão de custo à parte); a proteção por
# recurso entra quando a assinatura existir.

resource "aws_wafv2_web_acl" "esta" {
  name  = "borda-${var.plano}"
  scope = var.escopo # REGIONAL | CLOUDFRONT

  default_action {
    allow {}
  }

  dynamic "rule" {
    for_each = { for i, r in var.regras_gerenciadas : r => i }
    content {
      name     = rule.key
      priority = rule.value

      override_action {
        none {}
      }

      statement {
        managed_rule_group_statement {
          name        = rule.key
          vendor_name = "AWS"
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = rule.key
        sampled_requests_enabled   = true
      }
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "borda-${var.plano}"
    sampled_requests_enabled   = true
  }
}

resource "aws_wafv2_web_acl_association" "recursos" {
  for_each = toset(var.recursos_alvo)

  resource_arn = each.value
  web_acl_arn  = aws_wafv2_web_acl.esta.arn
}
