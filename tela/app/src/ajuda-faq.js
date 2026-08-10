/* O FAQ da ajuda: categorias, e dentro delas perguntas com resposta curta.

   Cada pergunta pode apontar um verbete (o "saiba mais" do assunto) e uma
   ação concreta que resolve o problema ali mesmo. As ações usam os mesmos ids
   dos verbetes: abrirPaleta, abrirDesenho, abrirConfig, verCodigo,
   verPendencias, verDecisoes, verLigacoes, simular, copiarComando, abrirExemplo. */

export const FAQ = [
  {
    chave: 'comecar',
    en: 'Getting started',
    pt: 'Começar',
    perguntas: [
      {
        chave: 'importar',
        en: {
          q: 'How do I import an architecture I already have?',
          a: 'Open a drawing from the start screen or drag the file onto the canvas. A block spec (.md) reads best; an HTML poster reads natively; a PNG goes through a vision model and asks you to confirm what it found.',
        },
        pt: {
          q: 'Como importo uma arquitetura que eu já tenho?',
          a: 'Abra um desenho pela tela inicial ou arraste o arquivo para o canvas. Especificação de bloco (.md) é a leitura mais fiel; poster HTML lê nativo; PNG passa por um modelo de visão e pede a sua conferência do que achou.',
        },
        acao: 'abrirDesenho',
      },
      {
        chave: 'zero',
        en: {
          q: 'How do I start from zero?',
          a: 'Open the palette (cmd+K), type the AWS resource name and press Enter. The element is born on the canvas with name, account and region already filled from the project settings.',
        },
        pt: {
          q: 'Como começo do zero?',
          a: 'Abra a paleta (cmd+K), digite o nome do recurso AWS e aperte Enter. A peça nasce no canvas com nome, conta e região preenchidos pela configuração do projeto.',
        },
        acao: 'abrirPaleta',
      },
      {
        chave: 'exemplo',
        en: {
          q: 'What is the example for?',
          a: 'It is a working drawing with six elements, three accounts and settings filled in. Use it to see the whole path (drawing, decisions, files, command) before starting yours.',
        },
        pt: {
          q: 'Para que serve o exemplo?',
          a: 'É um desenho funcionando, com seis peças, três contas e configuração preenchida. Use para ver o caminho inteiro (desenho, decisões, arquivos, comando) antes de começar o seu.',
        },
        acao: 'abrirExemplo',
      },
    ],
  },
  {
    chave: 'desenho',
    en: 'Drawing',
    pt: 'Desenho',
    perguntas: [
      {
        chave: 'ligar',
        en: {
          q: 'How do I connect two elements?',
          a: 'Drag from a pin on the edge of one element to the other, or click the pin and then the target. The bioma classifies the arrow by reading both ends; the legend on the canvas explains each drawing.',
        },
        pt: {
          q: 'Como ligo duas peças?',
          a: 'Arraste de um pino na borda de uma peça até a outra, ou clique no pino e depois no destino. O bioma classifica a seta lendo as duas pontas; a legenda no canvas explica cada desenho.',
        },
        verbete: 'ligacao',
      },
      {
        chave: 'conta',
        en: {
          q: 'Which account does a new element get?',
          a: 'Always the default account of its domain, the same one every time. Register accounts in Settings › Accounts and mark one as default; the canvas box shows alias and number.',
        },
        pt: {
          q: 'Que conta uma peça nova recebe?',
          a: 'Sempre a conta padrão do domínio dela, a mesma toda vez. Cadastre contas em Configurações › Contas e marque uma como padrão; a caixa no canvas mostra apelido e número.',
        },
        acao: 'abrirConfig',
      },
      {
        chave: 'dominio',
        en: {
          q: 'How do domains work?',
          a: 'A domain becomes an account and a folder. Children nest under the parent (Platform > Network becomes platform/network/). An arrow between different domains becomes a cross-account connection with permission on both sides.',
        },
        pt: {
          q: 'Como funcionam os domínios?',
          a: 'Domínio vira conta e pasta. Filho aninha sob o pai (Plataforma > Rede vira plataforma/rede/). Seta entre domínios diferentes vira ligação entre contas, com permissão dos dois lados.',
        },
        verbete: 'area',
      },
      {
        chave: 'excluir',
        en: {
          q: 'How do I remove an element?',
          a: 'Select it and click the red trash icon in the toolbar above the canvas. It asks before removing; the element’s arrows leave with it.',
        },
        pt: {
          q: 'Como removo uma peça?',
          a: 'Selecione a peça e clique na lixeira vermelha na ferramenta acima do canvas. Ele pergunta antes de remover; as setas da peça saem junto.',
        },
      },
    ],
  },
  {
    chave: 'codigo',
    en: 'Code and running',
    pt: 'Código e execução',
    perguntas: [
      {
        chave: 'preencher',
        en: {
          q: 'What does PREENCHER mean and how do I answer it?',
          a: 'PREENCHER marks a value only you can decide (a name, an account, a region). Open Questions: each one shows what is accepted, a valid example and a field to answer right there. You never need to edit the file.',
        },
        pt: {
          q: 'O que é PREENCHER e como respondo?',
          a: 'PREENCHER marca um valor que só você pode decidir (um nome, uma conta, uma região). Abra as Pendências: cada uma mostra o que se aceita, um exemplo válido e o campo de responder ali mesmo. Você nunca precisa editar o arquivo.',
        },
        acao: 'verPendencias',
      },
      {
        chave: 'comando',
        en: {
          q: 'What does the command at the bottom do?',
          a: 'It is the exact line the buttons run: profile says where, area says which part of the tree, flags say the action. Copy it to run in a terminal, or use Simulate and Apply on the bar.',
        },
        pt: {
          q: 'O que faz o comando da barra de baixo?',
          a: 'É a linha exata que os botões rodam: o perfil diz onde, a área diz que parte da árvore, as bandeiras dizem a ação. Copie para rodar no terminal, ou use Simular e Aplicar na barra.',
        },
        verbete: 'comando',
      },
      {
        chave: 'simular',
        en: {
          q: 'Does Simulate change anything?',
          a: 'No. It is Terraform’s plan: it lists what would be created, changed and destroyed, element by element, and stops there. On the local profile it runs without cloud credentials.',
        },
        pt: {
          q: 'Simular muda alguma coisa?',
          a: 'Não. É o plan do Terraform: lista o que nasceria, mudaria e cairia, peça por peça, e para aí. No perfil local roda sem credencial de nuvem.',
        },
        acao: 'simular',
        verbete: 'simular',
      },
      {
        chave: 'destruir',
        en: {
          q: 'Why is Destroy locked?',
          a: 'Destroy asks for a declared change window first, and permanent fabric never falls this way. This is by design: nothing is destroyed by accident.',
        },
        pt: {
          q: 'Por que o Destruir está travado?',
          a: 'Destruir pede a janela de mudança declarada antes, e tecido permanente não cai por esse caminho. É de propósito: nada é destruído por descuido.',
        },
        verbete: 'tecido',
      },
      {
        chave: 'materializar',
        en: {
          q: 'How do I take the files to my machine?',
          a: 'The “Take to my machine” button offers a zip or writes the tree to an empty folder you choose. Saving the project as .bio keeps the drawing itself.',
        },
        pt: {
          q: 'Como levo os arquivos para a minha máquina?',
          a: 'O botão “Levar para a máquina” oferece o zip ou grava a árvore numa pasta vazia que você escolher. Salvar o projeto como .bio guarda o desenho em si.',
        },
        acao: 'verCodigo',
      },
    ],
  },
  {
    chave: 'projeto',
    en: 'Project',
    pt: 'Projeto',
    perguntas: [
      {
        chave: 'salvar',
        en: {
          q: 'How do I save and reopen a project?',
          a: 'Save .bio writes a readable JSON file (drawing, settings, accounts) in the working folder. The start screen lists the last five; opening one restores everything.',
        },
        pt: {
          q: 'Como salvo e reabro um projeto?',
          a: 'Salvar .bio grava um arquivo JSON legível (desenho, configuração, contas) na pasta de trabalho. A tela inicial lista os últimos cinco; abrir um restaura tudo.',
        },
      },
      {
        chave: 'idioma',
        en: {
          q: 'How do I change the language?',
          a: 'Use the EN / PT switch at the top right. The choice is saved and survives reloading.',
        },
        pt: {
          q: 'Como troco o idioma?',
          a: 'Use o seletor EN / PT no canto direito do topo. A escolha fica guardada e sobrevive ao recarregamento.',
        },
      },
    ],
  },
]
