# Organismo openmetadata (04): o catálogo de negócio, auto-hospedado em ECS
# Fargate. A imagem vem do ECR da esteira (artefato); banco e índice são
# dependências passadas por input (a molécula banco-aurora serve o metastore).

resource "aws_ecs_cluster" "este" {
  name = "openmetadata-${var.plano}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_task_definition" "servidor" {
  family                   = "openmetadata"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memoria
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([{
    name         = "openmetadata"
    image        = var.imagem
    essential    = true
    portMappings = [{ containerPort = 8585 }]
    environment  = [for k, v in var.ambiente : { name = k, value = v }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = var.log_group
        "awslogs-region"        = var.regiao
        "awslogs-stream-prefix" = "openmetadata"
      }
    }
  }])
}

resource "aws_ecs_service" "servidor" {
  name            = "openmetadata"
  cluster         = aws_ecs_cluster.este.id
  task_definition = aws_ecs_task_definition.servidor.arn
  desired_count   = var.replicas
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.subnet_ids
    security_groups = var.security_group_ids
  }
}
