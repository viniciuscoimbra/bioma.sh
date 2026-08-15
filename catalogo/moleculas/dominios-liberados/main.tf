# Molécula dominios-liberados: a allowlist de domínios da saída inspecionada,
# num grupo de regras que a política de `organismos/rede/inspecao-egress`
# referencia.
#
# Domínio, e não 5-tupla. Liberar a porta 443 para destino qualquer abre a
# internet inteira e continua com cara de allowlist; o controle de acesso
# demonstrável que esta instituição declarou em `convencoes.json` é sobre para
# onde se sai. O desenho é o do salto 4 do packet walk de rede: o firewall
# consulta a allowlist de domínios, e o NAT vem depois.
#
# STRICT_ORDER não é preferência: a política do organismo sobe em ordem estrita
# quando a postura é `drop`, e a AWS recusa grupo em ordem default referenciado
# por política estrita. O grupo cai no apply e a política fica sem a regra que
# ela achava que tinha.
#
# Só ALLOWLIST. Quem bloqueia é o `aws:drop_strict` da política. Regra de DROP
# aqui dentro casaria com todo o resto, e os grupos de prioridade seguinte
# nunca seriam avaliados: a lista de ARNs que a política recebe pararia de
# compor.

resource "aws_networkfirewall_rule_group" "este" {
  name = "${var.nome}-${var.plano}"
  type = "STATEFUL"

  # Capacidade é imutável: mudar exige grupo novo, ARN novo e troca da
  # referência na política. Sobra de propósito, e a validação impede que ela
  # nasça menor que a lista.
  capacity = var.capacidade

  rule_group {
    stateful_rule_options {
      rule_order = "STRICT_ORDER"
    }

    # HOME_NET não é detalhe. Por padrão a inspeção de domínio só olha o
    # tráfego que nasce dentro da VPC onde o firewall mora, e nesta topologia
    # nada nasce lá: tudo chega pelo Transit Gateway, vindo das VPCs dos
    # domínios. Sem declarar as supernets aqui, a allowlist não avalia o
    # tráfego que ela existe para avaliar, e o default da política derruba
    # tudo, sem erro nenhum.
    rule_variables {
      ip_sets {
        key = "HOME_NET"
        ip_set {
          definition = setunion(var.redes_inspecionadas, [var.cidr_inspecao])
        }
      }
    }

    rules_source {
      rules_source_list {
        generated_rules_type = "ALLOWLIST"
        target_types         = var.tipos_de_alvo
        targets              = var.dominios
      }
    }
  }

  tags = { Name = "${var.nome}-${var.plano}", plano = var.plano }
}
