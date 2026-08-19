# Organismo kafka-cluster: distribui evento entre contas
# Zona declarada no bloco: Alfa · Folha Um · VPC privada · uma por ambiente (nprd, prd)
# Tecido: permanente (guarda dado que só existe aqui. Se cair, não tem de onde trazer de volta)
# TODO(receita): o mapa de recursos não conhece "kafka cluster".
# Consulte o registro do provider e declare aqui os recursos que este serviço
# exige. Nada é gerado às cegas: recurso inventado passa no lint e falha no
# apply, que é o pior momento para descobrir.
