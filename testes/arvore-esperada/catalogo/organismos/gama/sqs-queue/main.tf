# Organismo sqs-queue: fila de eventos
# Zona declarada no bloco: Gama · uma por plano (nao-prod, prod)
# Tecido: estavel (pode ser recriado do zero: o que ele guarda volta igual pela receita. Ainda assim só cai com janela declarada)
# TODO(receita): o mapa de recursos não conhece "sqs queue".
# Consulte o registro do provider e declare aqui os recursos que este serviço
# exige. Nada é gerado às cegas: recurso inventado passa no lint e falha no
# apply, que é o pior momento para descobrir.
