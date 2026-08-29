import type { DocContent } from './en'

export const pt: DocContent = {
  common: {
    onThisPage: 'Nesta página',
    backToDocs: 'Voltar à documentação',
    docsHome: 'Documentação',
  },
  home: {
    meta: {
      title: 'StayUp — Documentação',
      description:
        'O que é o StayUp, como as peças se encaixam, e para onde ir depois: rodar sua instância, operá-la, ou escrever um provedor.',
    },
    eyebrow: 'Documentação',
    title: 'Como o StayUp funciona',
    lede: 'O StayUp transforma vários tipos de fonte externa — notas de versão, vídeos, feeds, páginas raspadas, tudo o que um programa saiba ler — em um feed por pessoa. Esta página é o modelo mental e o vocabulário; depois escolha o caminho de que precisa.',
    concept: {
      heading: 'A ideia, em quatro frases',
      points: [
        'O StayUp mostra conteúdo novo das fontes que você segue. O que conta como fonte não é fixo: é o que algum provedor souber ir buscar.',
        'Um provedor é um pequeno programa que vai buscar um tipo de fonte e escreve o que encontra no banco de dados da instância. Cobrir um novo tipo de fonte é escrever um provedor; nada mais muda no StayUp.',
        'A API do StayUp lê esse banco e o serve às apps. Ela não fixa nenhum tipo de fonte: a cada requisição pergunta ao banco quais provedores existem agora, e devolve o manifesto de exibição deles como está.',
        'As apps — web, desktop, mobile — leem a API. Cada uma pode apontar para qualquer instância, ou seja, para qualquer banco, e cada uma sabe exibir um provedor de que nunca ouviu falar.',
      ],
      note: 'O conjunto de fontes é aberto por construção. Uma instância mostra exatamente os provedores que rodam contra o seu banco — sem lista embutida, nada a registrar junto a uma autoridade central.',
      diagram: {
        title: 'De uma fonte até a sua tela',
        sources: 'Fontes externas',
        sourcesItems:
          'um feed de podcast · um tópico de fórum · uma página de status · tudo o que um programa saiba ler',
        providers: 'Provedores',
        providersSub: 'um pequeno programa por tipo de fonte, com agendamento',
        database: 'O banco de dados',
        databaseSub: 'PostgreSQL, MySQL, SQLite ou MongoDB — tudo o que foi coletado, num só lugar',
        api: 'API do StayUp',
        apiSub: 'lê o banco, serve as apps, não fixa nada',
        apps: 'Web · Desktop · Mobile · Admin',
        appsSub: 'cada uma configurável para outra instância',
      },
    },
    vocabulary: {
      heading: 'As palavras, definidas de uma vez',
      intro:
        'Estes termos aparecem em toda parte e se confundem com facilidade. Eis o que cada um significa no StayUp.',
      columnTerm: 'Termo',
      columnMeaning: 'O que significa',
      terms: [
        {
          term: 'Instância',
          meaning:
            'Um banco de dados + uma API à frente + os provedores que a alimentam. A instância pública é uma; a sua seria outra. Instâncias nunca conversam entre si.',
        },
        {
          term: 'Provedor (também: conector)',
          meaning:
            'Um programa autônomo que vai buscar um tipo de fonte e escreve linhas no banco. «Conector» e «provedor» são a mesma coisa; os repositórios se chamam stayup-cmd-*.',
        },
        {
          term: 'Fonte (também: flux) — uma linha repository',
          meaning:
            'Uma coisa acompanhada: uma URL de feed específica, um canal, uma página. Guardada como linha da tabela compartilhada repository, com type igual ao nome do provedor.',
        },
        {
          term: 'Assinatura',
          meaning:
            'Um vínculo entre um usuário e uma fonte: «esta pessoa segue este flux». Adicionar um flux numa app cria uma assinatura (e a própria fonte, se não existia).',
        },
        {
          term: 'Template de exibição',
          meaning:
            'Um manifesto JSON opcional que o provedor guarda em provider_registry.template. Diz às apps como renderizar as linhas dele. Sem template → um cartão genérico simples.',
        },
        {
          term: 'Admin',
          meaning:
            'Um operador de uma instância. O primeiro (um super admin) é criado por linha de comando; o restante é gerido pela interface web de administração. Separado das contas de usuário.',
        },
      ],
    },
    paths: {
      heading: 'De que caminho você precisa?',
      installTitle: 'Rodar sua própria instância',
      installBody:
        'Sua própria API e seu próprio banco, para que seus dados continuem seus e você escolha o que roda contra eles. Inclui um passo a passo local completo.',
      installCta: 'Guia de instalação',
      generateTitle: 'Gerar um script de instalação',
      generateBody:
        'O caminho guiado: escolha um banco e os conectores que quiser, e obtenha um único script bash que sobe toda a stack.',
      generateCta: 'Gerador de instalação',
      adminTitle: 'Operar sua instância',
      adminBody:
        'A interface web de administração: gerenciar admins, decidir quais provedores aceitam novos flux livremente, trabalhar a fila de aprovação, curar usuários e flux.',
      adminCta: 'Guia de administração',
      providersTitle: 'Conectar uma fonte nova',
      providersBody:
        'Escrever um provedor — um programa que vai buscar uma fonte que o StayUp ainda não cobre e guarda o que encontra. Inclui os templates de exibição.',
      providersCta: 'Guia de provedores',
      relation:
        'Operar uma instância e escrever um provedor são coisas relacionadas, mas distintas. Um provedor nunca fala com a API, só com o banco — então você pode escrever um sem ler o guia de instalação. Rodá-lo é outra história: ele precisa de acesso de escrita ao banco que alimenta, e na instância pública você não tem isso. Na prática, o seu provedor anda junto com a sua própria instância.',
    },
  },
  install: {
    meta: {
      title: 'StayUp — Instalação',
      description:
        'Subir a sua própria instância do StayUp: as peças, um passo a passo local completo, os quatro bancos de dados, a configuração, e como apontar as apps para ela.',
    },
    eyebrow: 'Instalação',
    title: 'Rodar sua própria instância',
    lede: 'Uma instância é um banco de dados, a API à frente, os provedores que você escolhe para alimentá-la e — se quiser operá-la de um navegador — a interface web de administração. Esta página percorre tudo, localmente, de ponta a ponta.',
    why: {
      heading: 'Por que se dar ao trabalho',
      intro:
        'A instância pública tem seus próprios provedores e seus próprios dados. Rodar a sua permite:',
      items: [
        'manter tudo num banco que você controla;',
        'escolher quais provedores rodam, e com que frequência;',
        'seguir fontes que a instância pública não cobre;',
        'decidir quem pode adicionar o quê, via aprovação por provedor;',
        'apontar as apps web, desktop e mobile para ela — um ajuste, sem mudança de código.',
      ],
      note: 'Instâncias não conversam entre si. Você começa com um banco vazio e nenhum provedor, até rodar um contra ele.',
    },
    pieces: {
      heading: 'As quatro peças',
      database: 'Um banco de dados',
      databaseBody:
        'Contém tudo: as fontes acompanhadas, o conteúdo coletado, as contas, os admins. PostgreSQL, MySQL/MariaDB, SQLite ou MongoDB — a API se adapta ao que você indicar.',
      api: 'API do StayUp',
      apiBody:
        'Uma camada fina e sem estado sobre esse banco. Ela não fixa nenhum nome de provedor — a cada requisição pergunta ao banco o que há. Roda em Node, em Docker, ou em Cloudflare Workers.',
      providers: 'Provedores',
      providersBody:
        'Os programas que realmente enchem o banco. Repositórios autônomos, iniciados por agendamento, que só falam com o banco. Sem pelo menos um, a sua instância funciona mas não mostra nada.',
      adminUi: 'A interface web de administração (opcional)',
      adminUiBody:
        'Uma implantação da app web aberta em /admin. Permite gerenciar admins, definir o modo de aprovação de cada provedor, trabalhar a fila de pedidos de flux, e curar usuários e flux. Dispense-a e a API continua funcionando — você só perde o console do navegador.',
    },
    fastPath: {
      heading: 'O caminho rápido',
      body: 'Se você só quer que rode, o gerador de instalação faz algumas perguntas e entrega um único stayup-setup.sh que faz tudo abaixo por você — clonar, compose, esquema, super admin, primeira execução dos conectores, agendador.',
      cta: 'Abrir o gerador de instalação',
    },
    walkthrough: {
      heading: 'Passo a passo local completo',
      intro:
        'À mão, para você ver cada engrenagem. Aqui PostgreSQL e Docker; os mesmos passos funcionam com qualquer motor suportado.',
      steps: [
        'Clonar a API: git clone https://github.com/stayup-app/stayup-api.git && cd stayup-api',
        'Copiar .env.example para .env e definir DATABASE_URL e JWT_SECRET (openssl rand -hex 32). Não há usuário nem senha de admin a definir — os admins vivem no banco.',
        'Subir o banco e a API: docker compose up -d db api. O arquivo compose semeia o esquema no Postgres na primeira init; a API escuta na porta 3000.',
        'Se você não contou com essa auto-init, aplique o esquema uma vez: psql "$DATABASE_URL" -f src/db/schema.sql. Ele só adiciona, então dá para reexecutar sem risco.',
        'Criar o primeiro super admin: npm run create-admin -- root@example.com "Root" \'uma-senha-forte\'. É a conta que gerencia a interface web de administração.',
        'Adicionar um provedor. Clonar um — git clone https://github.com/stayup-app/stayup-cmd-rss.git — apontar o DATABASE_URL dele para o mesmo banco, instalar as dependências, e então: python fetch_rss.py --add https://blog.example.com/feed.xml e python fetch_rss.py. A primeira execução de verdade cria as tabelas dele e o registra.',
        'Verificar que a API o vê: curl localhost:3000/connectors/providers deve agora listar rss com o manifesto de exibição dele.',
        'Abrir a app desktop, ir em Perfil → URL da API, colar http://localhost:3000, salvar. Criar uma conta, e então adicionar um flux — a entrada rss aparece assim que o conector rodar.',
        'Agendar o conector para que continue rodando: uma entrada de cron, um timer do systemd, um agendamento do GitHub Actions, ou o contêiner Ofelia que o gerador monta.',
      ],
      note: 'A API nunca inicia os conectores. São programas à parte, com o próprio agendamento; a única coisa que compartilham com a API é o banco de dados.',
    },
    requirements: {
      heading: 'Do que você precisa',
      items: [
        'Um banco de dados da lista abaixo, alcançável de onde a API roda.',
        'Docker, ou Node.js 22 ou mais recente se for sem contêineres.',
        'Opcionalmente uma conta Cloudflare, para implantar em Workers como a instância de referência.',
      ],
    },
    databases: {
      heading: 'Qual banco de dados',
      intro:
        'A API não fala SQL diretamente. Ela chama um contrato de armazenamento que um adaptador por motor cumpre, e o esquema da sua DATABASE_URL escolhe o adaptador. Quatro motores vêm junto:',
      columnEngine: 'Motor',
      columnScheme: 'Esquema de URL',
      columnDriver: 'Driver a instalar',
      note: 'Cada motor passa na mesma suíte de conformidade — os mesmos comportamentos, verificados em CI contra um PostgreSQL, um MySQL, um SQLite e um MongoDB reais. É isso que torna a escolha reversível: as tabelas, as coleções e as colunas têm os mesmos nomes em toda parte, então um provedor se descreve uma vez e só o dialeto muda.',
      workersNote:
        'Uma exceção, e não é coisa nossa: o Cloudflare Workers só abre o tipo de conexão que o PostgreSQL usa. Os drivers de MySQL, SQLite e MongoDB precisam de Node — Docker ou Node.js puro, não Workers.',
    },
    env: {
      heading: 'Configuração',
      columnVariable: 'Variável',
      columnRequired: 'Obrigatória',
      columnDescription: 'Descrição',
      yes: 'sim',
      no: 'não',
      descriptions: [
        'O esquema escolhe o motor: postgres://, mysql://, sqlite:// ou mongodb://. Os builds de Node e Docker também aceitam DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASSWORD separadamente, para PostgreSQL.',
        'Segredo aleatório que assina os tokens de autenticação. Gere um com openssl rand -hex 32. Deve continuar o mesmo durante toda a vida da instância — troque-o e todos os tokens existentes param de funcionar.',
        'URL pública da sua implantação web. Usada apenas como destino de redirecionamento OAuth; deixe de fora se não ativar login com Google ou GitHub.',
        'Ativa «Entrar com o Google». Deixe vazio para desativar.',
        'Ativa «Entrar com o GitHub». Deixe vazio para desativar.',
      ],
      note: 'Não há variável de usuário nem senha de admin. O antigo par API_USERNAME / API_PASSWORD acabou: os admins são linhas no banco, e o primeiro é criado com npm run create-admin. O login com e-mail e senha para usuários normais sempre funciona, faça o que fizer com as variáveis OAuth.',
    },
    deploy: {
      heading: 'Implantar a API',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Node.js puro'],
      dockerIntro: 'O caminho mais curto: clonar, preencher .env, rodar.',
      dockerNote:
        'O arquivo compose monta o esquema no diretório de init do Postgres, então as tabelas do núcleo são criadas na primeira vez que o volume é inicializado. A API então escuta na porta 3000. Em seguida crie o super admin — veja abaixo.',
      workersIntro: 'O que a instância de referência roda.',
      workersNote:
        'O seu banco precisa ser alcançável a partir da rede da Cloudflare — um provedor gerenciado com uma string de conexão pública com pool é a resposta habitual. O Workers não consegue alcançar um banco na sua rede doméstica, nem executar o script create-admin: crie o super admin contra o banco a partir da sua máquina.',
      nodeIntro: 'Sem orquestração, só o servidor compilado.',
      nodeNote:
        'Ou construa você mesmo o Dockerfile fornecido, se preferir rodar um contêiner sem Compose. A imagem compilada traz também o script create-admin.',
    },
    schema: {
      heading: 'Criar as tabelas, e o primeiro admin',
      applyIntro:
        'Se você não conta com a auto-init do Compose, aplique o esquema uma vez você mesmo. Um arquivo por motor, os mesmos nomes de tabelas e colunas em todos:',
      applyNote:
        'Os arquivos SQL só adicionam — CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS — então dá para reexecutar a qualquer momento, inclusive contra um banco que já tem dados.',
      engineNotes: [
        'O esquema de referência. Versão 14 ou mais recente.',
        'MySQL 8 ou MariaDB 10.2 e mais recentes: a API ordena o conteúdo com uma função de janela.',
        'Nada a hospedar — um arquivo ao lado da API. Bom para uma instância pessoal, não para uma que as apps acessam de vários lugares ao mesmo tempo.',
        'Nenhum esquema a aplicar: o MongoDB cria uma coleção na primeira escrita. Só os índices importam, e a API os cria sozinha ao conectar — o comando acima só faz isso antecipadamente.',
      ],
      adminIntro:
        'Os admins são linhas da tabela admin; não há conta padrão. Crie o primeiro — sempre um super admin — por linha de comando. Ele aplica o esquema primeiro, depois insere a linha:',
      userIntro:
        'As contas de usuário normais são criadas pelo formulário de cadastro das apps. Para fazer uma sem formulário, para testes:',
      verifyIntro: 'Depois verifique que a API responde:',
      verifyNote:
        'Uma lista de provedores vazia é a resposta esperada aqui: nada coletou nada ainda. Isso é o guia de provedores.',
    },
    pointing: {
      heading: 'Apontar uma app para a sua instância',
      items: [
        'Web: defina STAYUP_API_URL na sua implantação — ou deixe-a e deixe cada visitante sobrescrevê-la no perfil, onde é guardada por navegador.',
        'Desktop e mobile: Perfil, depois «URL da API», cole a sua, salve. «Restaurar» volta para a embutida a qualquer momento.',
        'A interface web de administração é a mesma app web: aponte o STAYUP_API_URL dela para a sua API e abra /admin.',
      ],
      note: 'Nada mais muda. A lista de provedores, os dados e a renderização seguem todos a instância configurada — inclusive o recurso simples para provedores que a app não conhece pelo nome.',
    },
    troubleshooting: {
      heading: 'Quando algo está errado',
      items: [
        {
          symptom: 'A lista de provedores volta vazia.',
          cause:
            'Esperado num banco recém-criado: nenhum provedor rodou contra ele ainda. Rode um e verifique de novo.',
        },
        {
          symptom: 'As apps não mostram conteúdo, mas a lista de provedores está populada.',
          cause:
            'Os provedores rodam mas ninguém segue nada ainda, ou as fontes que eles acompanham não trazem conteúdo novo. Adicione uma fonte pela app.',
        },
        {
          symptom: 'Um provedor aparece como cartão de texto, às vezes JSON cru.',
          cause:
            'Nenhum template de exibição utilizável. O provedor não escreveu provider_registry.template, ou a coluna content dele é uma string JSON sem template para interpretá-la. Veja o guia de provedores.',
        },
        {
          symptom: 'Adicionar um flux diz «pedido enviado» em vez de assinar.',
          cause:
            'Esse provedor está em modo de aprovação manual. Um admin aprova ou rejeita em /admin/flux-requests. Mude o modo em /admin/providers se não for o que você quer.',
        },
        {
          symptom: 'create-admin diz que o e-mail já está em uso.',
          cause:
            'Já existe um super admin. Os admins seguintes são criados pela interface web de administração, não por linha de comando.',
        },
        {
          symptom: 'O login funciona mas toda outra chamada é rejeitada.',
          cause:
            'O segredo de assinatura difere entre a instância que emitiu o seu token e a que responde. Tokens não passam de uma instância para outra.',
        },
      ],
    },
  },
  admin: {
    meta: {
      title: 'StayUp — Administração',
      description:
        'Operar uma instância do StayUp pelo navegador: admins, aprovação de flux por provedor, a fila de pedidos, usuários e flux.',
    },
    eyebrow: 'Administração',
    title: 'Operar sua instância',
    lede: 'Com a API no ar, a interface web de administração é de onde você opera a instância num navegador: quem pode adicionar o quê, quais pedidos estão pendentes, quais usuários seguem quais flux.',
    webUi: {
      heading: 'A interface web de administração',
      body: 'É a mesma app web do site público, aberta em /admin, apontada para a sua API. É opcional — tudo o que ela faz tem uma rota de API por trás — mas é o jeito prático de operar uma instância. Implante-a como qualquer outra cópia da app web, defina STAYUP_API_URL para a sua API, e entre em /admin/login.',
      note: 'A sessão de admin é um cookie separado de uma sessão de usuário. O mesmo navegador pode ter as duas ao mesmo tempo sem uma deslogar a outra.',
    },
    roles: {
      heading: 'Super admin e admin',
      intro:
        'Dois níveis. O primeiro admin é sempre um super admin, criado por linha de comando (npm run create-admin). Todo admin depois disso é criado pela UI e é um admin comum.',
      columnRole: 'Papel',
      columnCan: 'Pode fazer',
      rows: [
        {
          role: 'Super admin',
          can: 'Tudo o que um admin comum pode, mais: criar, editar e apagar outros admins. Não pode ser apagado pela UI, nem apagar a si mesmo.',
        },
        {
          role: 'Admin',
          can: 'Trabalho operacional: usuários, flux, modos de aprovação dos provedores, a fila de pedidos. Não vê nem toca na lista de admins. Pode trocar a própria senha.',
        },
      ],
      note: 'Admins não são contas de usuário. Têm a própria tabela, o próprio login, e nenhum feed próprio.',
    },
    managingAdmins: {
      heading: 'Gerenciar admins',
      body: 'Só super admin, em /admin/admins:',
      steps: [
        'Criar um admin com um e-mail, um nome e uma senha. É um admin comum — não pode gerenciar outros admins.',
        'Editar o nome, o e-mail ou a senha de um admin.',
        'Apagar um admin. As linhas de super admin e a sua própria linha ficam travadas.',
      ],
      note: 'Um admin comum que precisa trocar a própria senha faz isso em /admin/settings, com a senha atual.',
    },
    fluxApproval: {
      heading: 'Aprovação de flux por provedor',
      intro:
        'Quando um usuário adiciona um flux que ainda não existe, o que acontece depende do modo de aprovação do provedor. Defina-o por provedor em /admin/providers.',
      autoBody:
        'auto — o padrão. A fonte é criada e o usuário assina na hora. Bom para provedores onde qualquer URL serve (RSS, um changelog).',
      manualBody:
        'manual — adicionar um flux desconhecido cria um pedido em vez disso (a app mostra «pedido enviado»). Nada é criado até um admin aprovar. Bom para provedores onde rodar uma fonte custa algo, como o scraping.',
      note: 'Assinar um flux que já existe nunca passa por aprovação — a aprovação só diz respeito a trazer uma fonte nova para a instância.',
    },
    usersAndFluxes: {
      heading: 'Usuários e flux',
      body: 'O resto do console é navegar e curar:',
      items: [
        '/admin/users — cada conta, com os flux que segue. Adicione ou remova uma assinatura em nome de alguém.',
        '/admin/repositories — cada fonte de todos os provedores, com a config dela. Crie uma diretamente (útil para semear um provedor manual), ou aposente uma.',
        '/admin/flux-requests — a fila pendente. Aprovar cria ou reutiliza a fonte e assina o solicitante; rejeitar a marca rejeitada. Ambos são definitivos.',
      ],
    },
    addingFlux: {
      heading: 'Como um usuário adiciona um flux, de qualquer app',
      intro: 'O mesmo fluxo para todo provedor — não há mais caso especial por provedor nas apps:',
      steps: [
        'Escolher um provedor.',
        'A app mostra os flux que esse provedor já acompanha e que você ainda não segue. Um toque assina — nunca aprovação.',
        'Ou mudar para «adicionar um novo». O campo é guiado pelo descritor form do provedor: o rótulo, o placeholder e o formato que ele espera.',
        'Enviar. Se o provedor é auto, você fica assinado. Se é manual, a app mostra «pedido enviado» e um admin assume.',
      ],
      note: 'Por isso um provedor deveria trazer um descritor form no template dele — é o que transforma uma caixa de texto vazia em «cole um handle do YouTube» ou «cole uma URL de feed».',
    },
  },
  generate: {
    meta: {
      title: 'StayUp — Gerar uma instalação self-hosted',
      description:
        'Escolha um banco de dados e os conectores que quiser e baixe um único script bash que sobe a sua instância do StayUp.',
    },
    eyebrow: 'Instalação',
    title: 'Gere o seu script de instalação',
    lede: 'Escolha um banco de dados e os conectores que quiser. Você recebe um único script bash que clona os repositórios, escreve a configuração do Docker, cria o seu superadministrador e inicia tudo.',
    how: {
      heading: 'O que o script faz',
      items: [
        'Clona a API, os conectores escolhidos e — se você mantiver — a interface web de administração.',
        'Escreve um docker-compose.yml com PostgreSQL, a API, um contêiner por conector e um agendador Ofelia.',
        'Pergunta a conta de superadministrador e a frequência de cada conector.',
        'Aplica o esquema, cria o superadministrador e executa cada conector uma vez para que ele se registre.',
        'Inicia a API, a interface e o agendador.',
      ],
      note: 'Tudo roda na sua máquina no Docker. Nada é enviado a lugar nenhum — a página monta o script no seu navegador.',
    },
    requirements: {
      heading: 'Antes de executar',
      items: [
        'Docker e Docker Compose v2 (`docker compose`).',
        'git.',
        'Linux ou macOS. No Windows, execute o script dentro do WSL.',
      ],
    },
    form: {
      database: 'Banco de dados',
      comingSoon: 'em breve',
      connectors: 'Conectores oficiais',
      customConnectors: 'Seus conectores',
      customHint:
        'Qualquer repositório git com um Dockerfile na raiz cujo ENTRYPOINT executa o coletor uma vez, lê DATABASE_URL e se registra em provider_registry. Veja o guia de provedores.',
      customConnectorAdd: 'Adicionar um conector',
      customUrlPlaceholder: 'https://github.com/voce/seu-conector.git',
      customNamePlaceholder: 'nome (opcional)',
      remove: 'Remover',
      adminUi: 'Incluir a interface web de administração',
      adminUiHint: 'Gerenciar provedores, aprovar pedidos de flux, adicionar administradores.',
      advanced: 'Avançado',
      projectDir: 'Pasta do projeto',
      apiPort: 'Porta da API',
      uiPort: 'Porta da UI',
      dbPort: 'Porta do banco',
      preview: 'stayup-setup.sh',
      download: 'Baixar',
      copy: 'Copiar',
      copied: 'Copiado',
      invalid: 'Não é possível gerar',
    },
    run: {
      heading: 'Execute',
      intro: 'Salve o arquivo e então:',
      note: 'A primeira execução constrói cada imagem e pode levar alguns minutos.',
    },
    after: {
      heading: 'Depois da instalação',
      items: [
        'Docs da API: http://localhost:3000/docs — Interface de administração: http://localhost:3001/admin.',
        'No app desktop ou mobile, defina a URL da API como http://localhost:3000 e crie uma conta.',
        'Adicione feeds pelo app — cada provedor oferece uma lista de flux existentes e um formulário para um novo.',
        'Remova tudo com: docker compose --profile connectors down -v (apaga o banco de dados).',
      ],
      note: 'O agendador monta o socket do Docker para iniciar os conectores no horário — equivalente a root no host, aceitável para uma instância local de desenvolvimento.',
    },
  },
  providers: {
    meta: {
      title: 'StayUp — Provedores',
      description:
        'Escrever um programa que transforma qualquer fonte externa em conteúdo do StayUp.',
    },
    eyebrow: 'Provedores',
    title: 'Conectar uma fonte nova',
    lede: 'Um provedor é um programa que vai buscar um tipo de fonte e guarda o que encontra. É a única coisa que você escreve para estender o StayUp — a API e as três apps o pegam sozinhas.',
    what: {
      heading: 'O que um provedor realmente é',
      body: 'Não um plugin, não um módulo a registrar: um programa comum, em qualquer linguagem, iniciado por agendamento. Ele lê a lista de fontes destinadas a ele, vai buscar cada uma, guarda o que é novo, e escreve no banco. A API o pega sozinha, e as três apps o exibem — sem uma linha de código mudar em lugar nenhum.',
      note: 'Um provedor nunca chama a API do StayUp. Ele fala com o banco, e só com o banco.',
      diagram: {
        title: 'Um provedor, passo a passo',
        sources: 'As fontes dele, lidas do banco',
        sourcesItems: 'os feeds de podcast que este provedor recebeu ordem de acompanhar',
        fetch: 'Ir buscar cada feed',
        compare: 'Guardar só o que não estava antes',
        store: 'Escrever no banco',
        exposed: 'A API o expõe, as apps o exibem',
      },
      steps: {
        heading: 'A cada execução',
        items: [
          'Ler as fontes destinadas a você.',
          'Ir buscar cada uma no mundo externo.',
          'Comparar com o que você guardou da última vez, e guardar só o novo.',
          'Escrever os itens novos no banco.',
          'Remover o que envelheceu, e registrar uma falha em vez de quebrar nela.',
          'Redeclarar seu nome de exibição e seu template, para um banco recém-criado te conhecer na primeira execução.',
        ],
      },
    },
    access: {
      heading: 'Antes de começar: onde ele vai escrever?',
      body: 'Um provedor precisa de acesso de escrita ao banco da instância que alimenta. Na instância pública você não tem isso, então na prática um provedor seu anda junto com uma instância sua. Escrever um não exige nada do guia de instalação; rodar um exige um banco no qual você possa escrever.',
      cta: 'Guia de instalação',
    },
    existing: {
      heading: 'Exemplos concretos para ler',
      body: 'Comece pelo stayup-cmd-template: um esqueleto nu feito para ser copiado, com os três pontos que você muda marcados. Depois leia os reais — changelog, youtube, rss, scrap, github-trending — que é o que a instância de referência por acaso roda, não uma definição do que o StayUp cobre. O rss é o exemplo real mais curto do contrato abaixo; github-trending é a referência para um template de exibição rico. Aponte qualquer um para o seu banco se servir.',
      cta: 'Abrir stayup-cmd-template',
    },
    creating: {
      heading: 'Escrever o seu',
      naming: {
        heading: 'Escolher um nome',
        intro:
          'Algo curto e minúsculo, usável como identificador — podcast, hackernews, reddit_thread. Essa única string é usada como está em vários lugares:',
        columnWhere: 'Onde',
        columnExample: 'Para «podcast»',
        rows: [
          'Sua tabela de dados',
          'As fontes que são suas',
          'Sua linha no registro',
          'O campo provider que as apps enviam ao adicionar um flux',
        ],
        note: 'Nada a reservar de antemão: o nome é simplesmente aquele com que você cria a tabela. Dois provedores só colidem escolhendo o mesmo.',
      },
      shape: {
        heading: 'O que você guarda',
        body: 'Uma linha por item encontrado. O conteúdo em si pode ser texto puro ou JSON — você decide. Sem template de exibição as apps mostram um cartão simples: o começo do conteúdo, a data, seu nome de exibição. Funciona, só é visualmente sóbrio, e mostra JSON cru se for isso que a sua coluna content contém. Um template resolve isso, e é a próxima seção.',
      },
      schedule: {
        heading: 'Rodá-lo por agendamento',
        body: 'Copie qualquer coletor existente: um Dockerfile na raiz cujo ENTRYPOINT executa o script uma vez, e um job que o inicia com a URL do banco no ambiente. Nada impõe uma CI específica — um timer do systemd, um cron puro, ou o contêiner Ofelia do gerador fazem o mesmo.',
      },
    },
    templates: {
      heading: 'Templates de exibição',
      body: 'Um template é um manifesto JSON que o seu provedor guarda em provider_registry.template, no mesmo upsert do nome de exibição dele. A API o repassa como está via GET /connectors/providers; cada app tem um motor que o lê e renderiza as suas linhas — um layout em lista, e um painel de leitura em um de sete modos: texto, html, mídia, áudio, galeria, tabela, lista de links. Nenhum código das apps conhece o nome do seu provedor.',
      fallbackNote:
        'Um provedor sem template (coluna NULL, JSON ilegível, ou uma version não reconhecida) funciona mesmo assim — as apps recorrem ao cartão simples. Um template é muito recomendável assim que o seu conteúdo é algo além de uma linha curta de texto.',
      cta: 'Referência completa de templates',
    },
    form: {
      heading: 'O descritor form',
      body: 'Dentro do template, um pequeno bloco form diz às apps como o campo «adicionar um novo flux» deve parecer para o seu provedor. Sem ele, o usuário tem uma caixa de texto vazia; com ele, um campo rotulado que valida e constrói a URL da fonte por ele.',
      fields: [
        {
          field: 'label · placeholder',
          meaning: 'o que o campo diz e o que mostra como dica.',
        },
        {
          field: 'urlTemplate',
          meaning:
            'ex.: https://www.youtube.com/@{value} — {value} é o que o usuário digitou. Ignorado se o valor já for uma URL http(s).',
        },
        {
          field: 'pattern',
          meaning:
            'uma regex que a entrada transformada deve satisfazer, verificada no cliente antes de enviar.',
        },
        {
          field: 'transform',
          meaning:
            'trim, remover um prefixo/sufixo conhecido, ou extrair um grupo de captura — para que uma URL completa colada e um handle puro terminem iguais.',
        },
      ],
      note: 'As apps guardam a URL construída como fonte; o seu coletor a lê de volta da linha repository como qualquer outra.',
    },
    fluxApproval: {
      heading: 'Modo de aprovação',
      body: 'Todo provedor tem uma coluna flux_approval no registro: auto (padrão) ou manual. auto assina o usuário na hora quando ele adiciona um flux novo; manual transforma isso num pedido que um admin deve aprovar. Um provedor pode semear o próprio padrão no upsert; um admin o sobrescreve por instância em /admin/providers. O scraping é entregue em manual por um motivo — rodar uma fonte ali custa algo.',
      note: 'Isso só controla trazer uma fonte nova. Assinar uma fonte que já existe nunca passa por aprovação.',
    },
    contract: {
      heading: 'Contrato técnico',
      lede: 'Material de referência. Você precisa disto para escrever um provedor, não para entender o StayUp.',
      diagramTitle: 'O que o seu script pode tocar',
      yourScript: 'Seu provedor',
      readOnly: 'somente leitura',
      readWrite: 'leitura e escrita — inteiramente sua',
      upsertOne: 'uma linha: a sua',
      writeOnError: 'escrita em erro',
      repositoryDesc: 'as fontes a acompanhar',
      connectorDesc: 'o conteúdo que você coleta',
      registryDesc: 'seu nome de exibição + template',
      logDesc: 'falhas, em vez de quebrar',
      warning:
        'Nunca escreva na tabela de outro provedor, nem nas tabelas user, session, account, admin, subscription ou flux_request: elas pertencem à API e à app web.',
      tablesHeading: 'As quatro tabelas',
      tablesIntro:
        'Seu passo de init, executado no começo de cada execução, deve garantir que estas existam. Toda instrução é idempotente — segura de reexecutar sempre, e segura se outro provedor ou a API criou as compartilhadas primeiro.',
      engineIntro:
        'Escolha o motor que a sua instância roda. Os nomes nunca mudam de uma aba para a outra — só o dialeto e os tipos, e é por isso que um provedor escrito para um motor se lê igual contra outro.',
      engineNotes: [
        'O dialeto de referência, e o que a instância pública roda.',
        'Mesmas tabelas, tipos MySQL. Uma URL tem de caber num VARCHAR indexável, daí o comprimento explícito.',
        'Sem servidor: o seu provedor e a API abrem o mesmo arquivo. Datas e JSON guardados como texto, que a API reanalisa na leitura.',
        'Uma coleção em vez de uma tabela, e nenhum esquema a declarar — mas duas regras. Um documento repository carrega um _id numérico, tirado da coleção counters, porque o contrato designa uma fonte por um número. E nada faz cascata: o que você escreve, você limpa.',
      ],
      repositoryTitle: 'repository — compartilhada, você mais lê dela',
      repositoryBody:
        'Uma linha é uma coisa a acompanhar: um feed de podcast, um subreddit, o que o seu provedor chama de fonte. A coluna type deve ser igual ao nome do seu provedor. A coluna config é JSON livre que só o seu script define e interpreta.',
      connectorTitle: 'connector_<name> — sua, inteiramente',
      connectorBody: 'Colunas opcionais, usadas quando presentes mas nunca obrigatórias:',
      optionalDescriptions: [
        'o timestamp próprio do conteúdo, preferido ao horário de execução ao ordenar por «o mais recente».',
        'um rótulo curto mostrado ao lado dos renders ricos — uma tag de versão, um id de vídeo, etc.',
      ],
      registryTitle: 'provider_registry — compartilhada, uma linha para você',
      registryBody:
        'O sort order só afeta a ordem em que os provedores aparecem nas apps; qualquer inteiro serve. A coluna template é o seu manifesto de exibição (seções anteriores); deixe-a NULL e o seu provedor funciona mesmo assim, só com o cartão simples. flux_approval é um ajuste de operador — não brigue com um admin por causa dele, mas você pode semear um padrão sensato. Omita a linha por completo e a API recorre a uma versão com a inicial maiúscula do seu nome.',
      logTitle: 'log — compartilhada, opcional mas recomendada',
      logBody: 'Escreva aqui em vez de quebrar quando uma fonte falha, e siga com as outras.',
      addingSources: {
        heading: 'Trazer fontes',
        body: 'Duas maneiras. Suporte uma flag --add que insere uma linha e sai — prática para semear direto contra o banco. A outra maneira, a que os usuários finais realmente tomam, é adicionar uma fonte por uma app, que faz POST em /providers/<name>/fluxes; o campo provider deve ser igual ao sufixo da sua tabela.',
      },
      checklist: {
        heading: 'Antes de dar por pronto',
        items: [
          'criada com ao menos um id, uma referência de fonte, o conteúdo, um timestamp e um flag de sucesso.',
          'linha upsertada a cada execução, com o seu nome de exibição e (recomendado) o seu template.',
          'fontes lidas com o nome do seu provedor.',
          'entradas antigas podadas — ou a ausência de retenção documentada.',
          'falhas por fonte escritas aqui em vez de derrubar a execução.',
          'lista o seu provedor após uma execução.',
          'devolve os seus dados.',
        ],
      },
    },
  },
}
