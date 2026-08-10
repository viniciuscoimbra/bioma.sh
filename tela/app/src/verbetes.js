/* Glossário do bioma, a fonte única do que a tela explica.

   Cada verbete carrega as duas línguas, a categoria que o agrupa na gaveta e
   uma ação concreta: o pequeno artigo termina num botão que resolve o assunto
   ali mesmo, em vez de terminar em texto.

   Sem JSX aqui de propósito: outras partes da tela puxam a frase sem arrastar
   componente junto. */

export const CATEGORIAS = [
  { chave: 'desenho', en: 'Drawing', pt: 'Desenho' },
  { chave: 'execucao', en: 'Running', pt: 'Execução' },
  { chave: 'arquivos', en: 'Files', pt: 'Arquivos' },
]

export const VERBETES = [
  {
    chave: 'comando',
    categoria: 'execucao',
    acao: { id: 'copiarComando', en: 'Copy the current command', pt: 'Copiar o comando atual' },
    pt: {
      titulo: 'o comando',
      frase: 'A linha que executa o que a tela mostra.',
      paragrafos: [
        'A tela não aplica nada sozinha: quem cria, atualiza e destrói é o comando bioma.sh, e a barra mostra a linha exata que vai rodar. Os botões da barra executam essa mesma linha; o copiar serve para rodar no terminal e ver a saída completa.',
        'Ler o comando antes de rodar diz o que vai acontecer: o perfil diz onde (local roda no emulador da sua máquina), a área diz em que parte da estrutura, e as bandeiras dizem a ação.',
      ],
      exemplo: {
        texto: 'Simular a área de dados no perfil local, sem tocar nada:',
        codigo: './bioma.sh --perfil local --area dados --plan',
      },
    },
    en: {
      titulo: 'the command',
      frase: 'The line that executes what the screen shows.',
      paragrafos: [
        'The screen applies nothing by itself: what creates, updates and destroys is the bioma.sh command, and the bar shows the exact line that will run. The bar buttons execute that same line; Copy exists to run it in a terminal and read the full output.',
        'Reading the command before running tells you what will happen: the profile says where (local runs on the emulator on your machine), the area says which part of the structure, and the flags say the action.',
      ],
      exemplo: {
        texto: 'Simulate the data area on the local profile, touching nothing:',
        codigo: './bioma.sh --perfil local --area dados --plan',
      },
    },
  },
  {
    chave: 'decisao',
    categoria: 'desenho',
    acao: { id: 'verDecisoes', en: 'Open the Decisions tab', pt: 'Abrir a aba Decisões' },
    pt: {
      titulo: 'decisão',
      frase: 'O que o bioma resolve sozinho a partir do seu desenho.',
      paragrafos: [
        'Cada decisão vira pasta, arquivo ou trava. Discordar aqui é mais barato que corrigir depois.',
        'O tradutor lê o desenho e classifica cada peça antes de escrever a primeira linha de código. A razão de cada classificação fica ao lado dela, na aba Decisões do inspetor. Ninguém precisa abrir o arquivo gerado para saber por que a peça caiu naquela pasta.',
      ],
      exemplo: {
        texto: 'Duas peças na mesma conta e com o mesmo ciclo de vida viram uma célula só. A aba Decisões diz o que decidiu e por quê.',
        codigo: 'célula contas · duas peças, mesma conta, nascem e caem juntas',
      },
    },
    en: {
      titulo: 'decision',
      frase: 'What the bioma resolves on its own from your drawing.',
      paragrafos: [
        'Each decision becomes a folder, a file or a lock. Disagreeing here is cheaper than fixing later.',
        'The translator reads the drawing and classifies each element before writing the first line of code. The reason for each classification sits next to it, in the Decisions tab of the inspector. Nobody needs to open a generated file to know why the element fell into that folder.',
      ],
      exemplo: {
        texto: 'Two elements in the same account with the same lifecycle become a single cell. The Decisions tab says what was decided and why.',
        codigo: 'cell accounts · two elements, same account, born and destroyed together',
      },
    },
  },
  {
    chave: 'tecido',
    categoria: 'desenho',
    acao: { id: 'verDecisoes', en: 'See each element’s fabric', pt: 'Ver o tecido de cada peça' },
    pt: {
      titulo: 'tecido',
      frase: 'O que acontece se a peça for destruída e recriada.',
      paragrafos: [
        'Três valores: efêmera (volta igual), estável (refaz com janela), permanente (não volta). Decide o que o comando de destruir aceita derrubar.',
        'O valor sai da natureza do recurso, e não do gosto de quem desenha. Recurso que guarda estado tende a permanente. Recurso que só processa e pode ser refeito do zero tende a efêmero. A cor do tecido acompanha a peça no canvas e na árvore de arquivos, sempre a mesma.',
      ],
      exemplo: {
        texto: 'Um bucket com dado de cliente nasce permanente. A ordem de destruir para antes de tocar a nuvem e diz qual peça travou.',
        codigo: 'bioma.sh --destruir  →  recusado: contas-arquivo é tecido permanente',
      },
    },
    en: {
      titulo: 'fabric',
      frase: 'What happens if the element is destroyed and recreated.',
      paragrafos: [
        'Three values: ephemeral (comes back identical), stable (rebuilt within a window), permanent (does not come back). It decides what the destroy command accepts to take down.',
        'The value comes from the nature of the resource, not from taste. A resource that holds state tends to permanent. A resource that only processes and can be rebuilt from scratch tends to ephemeral. The fabric color follows the element on the canvas and in the file tree, always the same.',
      ],
      exemplo: {
        texto: 'A bucket holding customer data is born permanent. The destroy order stops before touching the cloud and says which element blocked it.',
        codigo: 'bioma.sh --destruir  →  refused: account-archive is permanent fabric',
      },
    },
  },
  {
    chave: 'artefato',
    categoria: 'arquivos',
    acao: { id: 'verCodigo', en: 'See what goes to the pipeline', pt: 'Ver o que vai para a esteira' },
    pt: {
      titulo: 'artefato',
      frase: 'Arquivo que a ferramenta escreve e entrega, e o comando nunca aplica.',
      paragrafos: [
        'Um workflow de CI, um template de repositório, um manifesto: existe no pacote que você baixa e não vira recurso de nuvem. Por isso não tem conta nem tecido.',
        'Ele sai numa pasta própria, fora do live, com um leia-me que diz o dono e o que fazer com cada arquivo. Quem aplica é a esteira, ou você, no repositório certo.',
      ],
      exemplo: {
        texto: 'A esteira de CI/CD entrega seis workflows do GitHub Actions. O comando não os aplica: eles vão para o repositório.',
        codigo: 'artefatos/esteira-workflows/workflows/plan.yml',
      },
    },
    en: {
      titulo: 'artifact',
      frase: 'A file the tool writes and hands over, and the command never applies.',
      paragrafos: [
        'A CI workflow, a repository template, a manifest: it exists in the package you download and never becomes a cloud resource. That is why it has no account and no fabric.',
        'It comes out in its own folder, outside the live tree, with a readme naming the owner and what to do with each file. The pipeline applies it, or you do, in the right repository.',
      ],
      exemplo: {
        texto: 'The CI/CD pipeline area hands over six GitHub Actions workflows. The command does not apply them: they go to the repository.',
        codigo: 'artifacts/pipeline-workflows/workflows/plan.yml',
      },
    },
  },
  {
    chave: 'ligacao',
    categoria: 'desenho',
    acao: { id: 'verLigacoes', en: 'Open the Connections tab', pt: 'Abrir a aba Ligações' },
    pt: {
      titulo: 'ligação',
      frase: 'Seta que atravessa conta.',
      paragrafos: [
        'Vira peça própria, com permissão declarada dos dois lados, porque nenhuma conta manda na outra por padrão.',
        'Seta entre duas peças da mesma conta continua sendo dependência simples, resolvida dentro da célula. Quando as pontas moram em contas diferentes, a permissão precisa existir na origem e no destino, e o bioma escreve as duas.',
      ],
      exemplo: {
        texto: 'Uma função na conta de aplicação lendo uma fila na conta de dados vira ligação. Saem duas políticas, uma em cada lado.',
        codigo: 'ligacao/app-le-fila-dados.tf  ·  política na fila + papel na função',
      },
    },
    en: {
      titulo: 'connection',
      frase: 'An arrow that crosses accounts.',
      paragrafos: [
        'It becomes its own element, with permission declared on both sides, because no account rules another by default.',
        'An arrow between two elements in the same account stays a simple dependency, resolved inside the cell. When the ends live in different accounts, the permission must exist at the source and at the target, and the bioma writes both.',
      ],
      exemplo: {
        texto: 'A function in the application account reading a queue in the data account becomes a connection. Two policies come out, one on each side.',
        codigo: 'ligacao/app-reads-data-queue.tf  ·  policy on the queue + role on the function',
      },
    },
  },
  {
    chave: 'celula',
    categoria: 'arquivos',
    acao: { id: 'verCodigo', en: 'Open the generated tree', pt: 'Abrir a árvore gerada' },
    pt: {
      titulo: 'célula',
      frase: 'Uma pasta com estado próprio.',
      paragrafos: [
        'É a menor coisa que nasce e morre junta.',
        'Cada célula tem o próprio arquivo de estado. Aplicar uma não mexe na vizinha, e destruir uma não arrasta a vizinha junto. O tamanho da célula decide o tamanho do estrago possível em um comando só.',
      ],
      exemplo: {
        texto: 'A rede de produção do core banking é uma célula: VPC, sub-redes e tabelas de rota sobem e caem juntas, com estado separado do banco que roda dentro dela.',
        codigo: 'aplicacao/prod/vpc/',
      },
    },
    en: {
      titulo: 'cell',
      frase: 'A folder with its own state.',
      paragrafos: [
        'It is the smallest thing that is born and dies together.',
        'Each cell has its own state file. Applying one does not touch its neighbor, and destroying one does not drag the neighbor along. The size of the cell decides the size of the possible damage in a single command.',
      ],
      exemplo: {
        texto: 'The core banking production network is one cell: VPC, subnets and route tables go up and down together, with state separate from the database running inside it.',
        codigo: 'aplicacao/prod/vpc/',
      },
    },
  },
  {
    chave: 'area',
    categoria: 'desenho',
    acao: { id: 'abrirConfig', en: 'Open Settings › Domains', pt: 'Abrir Configurações › Domínios' },
    pt: {
      titulo: 'domínio',
      frase: 'Onde a peça mora. Aninha: Plataforma > Redes.',
      paragrafos: [
        'Decide a conta, a pasta onde a peça cai e quais setas viram ligação.',
        'Domínio é escolha de quem desenha, e é a única informação de lugar que a peça pede. Filho aninha sob o pai e vira subpasta na estrutura, espelhando a organização real das contas.',
      ],
      exemplo: {
        texto: 'Mudar o domínio de uma fila move a pasta e transforma a seta que chegava nela em ligação, com permissão dos dois lados.',
        codigo: 'aplicacao/fila-pedidos  →  plataforma/dados/fila-pedidos',
      },
    },
    en: {
      titulo: 'domain',
      frase: 'Where the element lives. It nests: Platform > Network.',
      paragrafos: [
        'It decides the account, the folder the element falls into, and which arrows become connections.',
        'The domain is the designer’s choice, and it is the only placement information the element asks for. A child nests under its parent and becomes a subfolder in the structure, mirroring how the accounts are really organized.',
      ],
      exemplo: {
        texto: 'Changing a queue’s domain moves its folder and turns the arrow that reached it into a connection, with permission on both sides.',
        codigo: 'application/orders-queue  →  platform/data/orders-queue',
      },
    },
  },
  {
    chave: 'verificacoes',
    categoria: 'execucao',
    acao: { id: 'verPendencias', en: 'Open the questions', pt: 'Abrir as pendências' },
    pt: {
      titulo: 'verificações',
      frase: 'Os quatro verificadores, rodados antes de tocar a nuvem: preenchimento, cobertura, durabilidade e plano.',
      paragrafos: [
        'Bloqueiam o comando antes de qualquer estrago.',
        'As verificações rodam dentro dos botões de simular e aplicar, sem aba para visitar. Quando um verificador recusa o que leu, a gaveta de pendências abre com a célula, o campo, o valor aceito e um exemplo certo.',
      ],
      exemplo: {
        texto: 'Região vazia numa peça segura a simulação. A pendência mostra o formato aceito e o lugar de responder.',
        codigo: 'preenchimento: bloqueado · fila-pedidos.regiao aceita us-east-1',
      },
    },
    en: {
      titulo: 'checks',
      frase: 'The four verifiers, run before touching the cloud: fill, coverage, durability and plan.',
      paragrafos: [
        'They block the command before any damage.',
        'The checks run inside the Simulate and Apply buttons, with no tab to visit. When a verifier refuses what it read, the questions drawer opens with the cell, the field, the accepted value and a valid example.',
      ],
      exemplo: {
        texto: 'An empty region on an element holds the simulation. The question shows the accepted format and the place to answer.',
        codigo: 'fill: blocked · orders-queue.region accepts us-east-1',
      },
    },
  },
  {
    chave: 'simular',
    categoria: 'execucao',
    acao: { id: 'simular', en: 'Simulate now — nothing changes', pt: 'Simular agora — nada muda' },
    pt: {
      titulo: 'simular',
      frase: 'Mostra o que aconteceria, sem mudar nada.',
      paragrafos: [
        'É o `plan` do Terraform, e nada é criado nem destruído.',
        'A saída lista o que nasce, o que muda e o que cai, peça por peça. Ler a simulação é o jeito de conferir a tradução antes de pagar por ela.',
      ],
      exemplo: {
        texto: 'No perfil local a simulação roda inteira, sem credencial de nuvem e sem cobrança.',
        codigo: 'bioma.sh --perfil local --plan',
      },
    },
    en: {
      titulo: 'simulate',
      frase: 'Shows what would happen, changing nothing.',
      paragrafos: [
        'It is Terraform’s `plan`, and nothing is created or destroyed.',
        'The output lists what is born, what changes and what falls, element by element. Reading the simulation is how you check the translation before paying for it.',
      ],
      exemplo: {
        texto: 'On the local profile the simulation runs whole, with no cloud credential and no billing.',
        codigo: 'bioma.sh --perfil local --plan',
      },
    },
  },
  {
    chave: 'gerado',
    categoria: 'arquivos',
    acao: { id: 'verCodigo', en: 'Open the code drawer', pt: 'Abrir a gaveta do código' },
    pt: {
      titulo: 'gerado',
      frase: 'Arquivo escrito pelo bioma.',
      paragrafos: [
        'Ninguém edita à mão: o desenho e a ficha são a fonte, e a próxima geração sobrescreve.',
        'A gaveta de código abre o arquivo para leitura e conferência, com número de linha. Mudança entra pelo desenho ou pela ficha da peça e volta como arquivo novo.',
      ],
      exemplo: {
        texto: 'Conta, região e tecido da ficha viram os blocos do arquivo da célula. Editar o arquivo direto se perde na geração seguinte.',
        codigo: 'aplicacao/prod/vpc/terragrunt.hcl',
      },
    },
    en: {
      titulo: 'generated',
      frase: 'A file written by the bioma.',
      paragrafos: [
        'Nobody edits it by hand: the drawing and the form are the source, and the next generation overwrites.',
        'The code drawer opens the file for reading and checking, with line numbers. A change enters through the drawing or the element form and comes back as a fresh file.',
      ],
      exemplo: {
        texto: 'Account, region and fabric from the form become the blocks of the cell file. Editing the file directly is lost on the next generation.',
        codigo: 'aplicacao/prod/vpc/terragrunt.hcl',
      },
    },
  },
]

/** O verbete resolvido para uma língua: { chave, categoria, acao, titulo, frase, … }. */
export function verbete(chave, lingua = 'en') {
  const v = VERBETES.find((x) => x.chave === chave)
  if (!v) return null
  const texto = v[lingua] || v.en
  return { chave: v.chave, categoria: v.categoria, acao: v.acao, ...texto }
}

/** Todos os verbetes resolvidos para uma língua, na ordem do arquivo. */
export function todos(lingua = 'en') {
  return VERBETES.map((v) => verbete(v.chave, lingua))
}

/** A frase de definição, para quem só precisa de uma linha. */
export function frase(chave, lingua = 'en') {
  return verbete(chave, lingua)?.frase || ''
}
