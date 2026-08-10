/* O vocabulário compartilhado da tela. Nada de componente aqui: só o que a
   composição e as partes precisam concordar para falar a mesma língua. */

/* As áreas do projeto. A pessoa declara em qual delas a peça mora, e o
   tradutor deriva daí o trilho, a conta e o tecido. Vocabulário fechado:
   área que o tradutor não conhece não vira trilho nenhum. */
export const ZONAS = [
  { valor: 'Platform', rotulo: 'plataforma' },
  { valor: 'Platform (dados)', rotulo: 'dados' },
  { valor: 'Platform (devsecops)', rotulo: 'esteira' },
  { valor: 'Security', rotulo: 'segurança' },
  { valor: 'Network', rotulo: 'rede' },
  { valor: 'Platform (SaaS)', rotulo: 'fora (SaaS)' },
]

export const ROTULO_ZONA = Object.fromEntries(ZONAS.map(z => [z.valor, z.rotulo]))

export const ACENTO = { permanente: 'permanente', estavel: 'estável', efemera: 'efêmera' }

/* Sugestões para quem abre a busca sem saber o que procurar. Lista curta e
   pensada, porque despejar 1687 recursos em ordem alfabética não ajuda. A
   categoria vem escrita porque a busca vazia não passa pelo servidor. */
export const SUGESTOES = [
  { tipo: 'aws_s3_bucket', categoria: 'armazenamento' },
  { tipo: 'aws_dynamodb_table', categoria: 'banco' },
  { tipo: 'aws_rds_cluster', categoria: 'banco' },
  { tipo: 'aws_lambda_function', categoria: 'computação' },
  { tipo: 'aws_ecs_service', categoria: 'computação' },
  { tipo: 'aws_sqs_queue', categoria: 'mensageria' },
  { tipo: 'aws_msk_cluster', categoria: 'mensageria' },
  { tipo: 'aws_sfn_state_machine', categoria: 'mensageria' },
  { tipo: 'aws_vpc', categoria: 'rede' },
  { tipo: 'aws_api_gateway_rest_api', categoria: 'rede' },
  { tipo: 'aws_kms_key', categoria: 'segurança' },
  { tipo: 'aws_secretsmanager_secret', categoria: 'segurança' },
  { tipo: 'aws_cloudwatch_log_group', categoria: 'observabilidade' },
]

/* minúsculo, sem acento e sem separador: casa 's3 bucket' com 's3-bucket' */
export function chave(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

/* O tipo do provider vira o nome do serviço que o tradutor lê na tabela. */
export function servicoDoTipo(tipo) {
  return String(tipo || '').replace(/^aws_/, '').replace(/_/g, ' ')
}

/* Os três campos que toda célula tem, na mesma forma das perguntas que o
   gerador escreve. Uma função porque os textos vêm do dicionário: quem chama
   passa o t() do idioma vivo. Exemplo e formato são dado, não microcopy. */
export function camposBase(t) {
  return [
    {
      nome: 'nome',
      pergunta: t('ficha.nome.pergunta'),
      exemplo: 'eventos-cobranca-dev',
      formato: '^[a-z0-9][a-z0-9._-]{2,62}$',
      explica: t('ficha.nome.explica'),
      erra: t('ficha.nome.erra'),
    },
    {
      nome: 'conta',
      pergunta: t('ficha.conta.pergunta'),
      exemplo: '111111111111',
      formato: '^[0-9]{12}$',
      explica: t('ficha.conta.explica'),
      erra: t('ficha.conta.erra'),
    },
    {
      nome: 'regiao',
      pergunta: t('ficha.regiao.pergunta'),
      exemplo: 'sa-east-1',
      formato: '^[a-z]{2}-[a-z]+-[0-9]$',
      explica: t('ficha.regiao.explica'),
      erra: t('ficha.regiao.erra'),
    },
  ]
}
