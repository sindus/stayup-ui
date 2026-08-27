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
        'Como o StayUp funciona, como rodar sua própria instância e como conectar uma nova fonte a ela.',
    },
    eyebrow: 'Documentação',
    title: 'Como o StayUp funciona',
    lede: 'Comece por aqui. Dois minutos de conceitos e depois escolha o caminho de que realmente precisa.',

    concept: {
      heading: 'A ideia, em quatro frases',
      points: [
        'O StayUp mostra o conteúdo novo das fontes que você acompanha. O que conta como fonte não é fixo: é o que algum provedor souber buscar.',
        'Um provedor é um pequeno programa que busca um tipo de fonte e escreve o que encontra no banco da instância. Cobrir um novo tipo de fonte é escrever um provedor; nada mais muda no StayUp.',
        'A API do StayUp lê esse banco e o serve aos aplicativos. Ela não fixa nenhum tipo de fonte no código: a cada requisição pergunta ao banco quais provedores existem naquele momento.',
        'Os aplicativos leem a API. Cada um pode apontar para qualquer instância e, portanto, para qualquer banco — e cada um sabe exibir um provedor de que nunca ouviu falar.',
      ],
      note: 'O conjunto de fontes é aberto por construção. Uma instância mostra exatamente os provedores que rodam contra o seu banco: nenhuma lista embutida, nada a registrar.',
      diagram: {
        title: 'De uma fonte até a sua tela',
        sources: 'Fontes externas',
        sourcesItems:
          'um feed de podcast · um tópico de fórum · uma página de status · qualquer coisa que um programa consiga ler',
        providers: 'Provedores',
        providersSub: 'um programa pequeno por tipo de fonte',
        database: 'O banco de dados',
        databaseSub: 'PostgreSQL, MySQL, SQLite ou MongoDB — tudo o que foi coletado, num só lugar',
        api: 'API do StayUp',
        apiSub: 'lê o banco, serve os aplicativos',
        apps: 'Web · Desktop · Celular',
        appsSub: 'cada um configurável para outra instância',
      },
    },

    paths: {
      heading: 'De que caminho você precisa?',
      selfHostingTitle: 'Rodar sua própria instância',
      selfHostingBody:
        'Sua própria API e seu próprio banco, para que seus dados continuem seus e você escolha o que roda sobre eles.',
      selfHostingCta: 'Guia de auto-hospedagem',
      providersTitle: 'Conectar uma nova fonte',
      providersBody:
        'Escreva um provedor: um programa que busca uma fonte que o StayUp ainda não cobre e guarda o que encontra.',
      providersCta: 'Guia de provedores',
      relation:
        'Os dois estão ligados, mas são coisas distintas. Um provedor nunca fala com a API, só com o banco — então você pode escrever um sem ler uma linha do guia de auto-hospedagem. Rodá-lo é outra história: ele precisa de acesso de escrita ao banco que alimenta, e na instância pública você não tem isso. Na prática, um provedor seu vem junto com uma instância sua.',
    },
  },

  selfHosting: {
    meta: {
      title: 'StayUp — Auto-hospedagem',
      description:
        'Rode sua própria API do StayUp e seu próprio banco, e aponte os aplicativos para eles.',
    },
    eyebrow: 'Auto-hospedagem',
    title: 'Rodar sua própria instância',
    lede: 'Uma instância são três peças: um banco de dados, a API à frente dele e os provedores que você escolher para alimentá-lo.',

    why: {
      heading: 'Por que se dar ao trabalho',
      intro:
        'A instância pública tem seus próprios provedores e seus próprios dados. Rodar a sua permite:',
      items: [
        'guardar tudo em um banco que você controla;',
        'escolher quais provedores rodam, e com que frequência;',
        'acompanhar fontes que a instância pública não cobre;',
        'apontar os aplicativos web, desktop e de celular para ela: um ajuste, nenhuma mudança de código.',
      ],
      note: 'As instâncias não conversam entre si. Você começa com um banco vazio e sem provedores, até rodar um contra ele.',
    },

    pieces: {
      heading: 'As três peças',
      database: 'Um banco de dados',
      databaseBody:
        'Guarda tudo: as fontes acompanhadas, o conteúdo coletado, as contas. PostgreSQL, MySQL/MariaDB, SQLite ou MongoDB — a API se adapta ao que você apontar.',
      api: 'API do StayUp',
      apiBody:
        'Uma camada fina e sem estado sobre esse banco. Não fixa nome de provedor no código: a cada requisição pergunta ao banco o que existe.',
      providers: 'Provedores',
      providersBody:
        'Os programas que de fato preenchem o banco. Sem pelo menos um, sua instância funciona mas não mostra nada.',
    },

    requirements: {
      heading: 'O que você precisa',
      items: [
        'Um banco de dados da lista abaixo, acessível de onde a API roda.',
        'Node.js 22 ou superior, se você não usar Docker.',
        'Opcionalmente uma conta na Cloudflare, para fazer deploy em Workers como a instância de referência.',
      ],
    },

    databases: {
      heading: 'Qual banco de dados',
      intro:
        'A API não fala SQL diretamente. Ela chama um contrato de armazenamento que um adaptador por motor cumpre, e o esquema da sua DATABASE_URL escolhe o adaptador. Quatro motores vêm junto:',
      columnEngine: 'Motor',
      columnScheme: 'Esquema de URL',
      columnDriver: 'Driver a instalar',
      note: 'Todos os motores passam na mesma suíte de conformidade: os mesmos vinte e quatro comportamentos, verificados na CI contra um PostgreSQL, um MySQL, um SQLite e um MongoDB reais. É isso que torna a escolha reversível: tabelas, coleções e colunas têm os mesmos nomes em toda parte, de modo que um provedor se descreve uma vez e só muda o dialeto.',
      workersNote:
        'Uma exceção, e não é obra nossa: o Cloudflare Workers só abre o tipo de conexão que o PostgreSQL usa. Os drivers de MySQL, SQLite e MongoDB precisam do Node — Docker ou Node.js puro, não Workers.',
    },

    env: {
      heading: 'Configuração',
      columnVariable: 'Variável',
      columnRequired: 'Obrigatória',
      columnDescription: 'Descrição',
      yes: 'sim',
      no: 'não',
      descriptions: [
        'O esquema escolhe o motor: postgres://, mysql://, sqlite:// ou mongodb://. Os builds Node e Docker também aceitam DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASSWORD separadamente, para PostgreSQL.',
        'Segredo aleatório que assina os tokens de autenticação. Gere um com openssl rand -hex 32.',
        'A única conta de serviço de administração. Não existe linha de admin no banco: quem entrar com essas credenciais recebe o papel de administrador. Usuários comuns se cadastram pelos aplicativos.',
        'URL pública do seu deploy web. Usada como destino do redirecionamento OAuth.',
        'Ativa “Entrar com o Google”. Deixe vazio para desativar.',
        'Ativa “Entrar com o GitHub”. Deixe vazio para desativar.',
      ],
      note: 'O acesso por e-mail e senha sempre funciona, independentemente do que você fizer com as variáveis de OAuth.',
    },

    deploy: {
      heading: 'Fazer o deploy da API',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Node.js puro'],
      dockerIntro: 'O caminho mais curto: clonar, preencher o .env, subir.',
      dockerNote:
        'O arquivo compose monta o esquema no diretório de inicialização do Postgres, então as tabelas base são criadas na primeira inicialização do volume. A API passa a escutar na porta 3000.',
      workersIntro: 'O que a instância de referência roda.',
      workersNote:
        'Seu banco precisa ser alcançável a partir da rede da Cloudflare — um provedor gerenciado com string de conexão pública e com pool é a resposta usual. O Workers não alcança um banco na sua rede doméstica.',
      nodeIntro: 'Sem orquestração, apenas o servidor compilado.',
      nodeNote:
        'Ou construa você mesmo o Dockerfile fornecido, se preferir um contêiner sem o Compose.',
    },

    schema: {
      heading: 'Criar as tabelas e sua primeira conta',
      applyIntro:
        'Se você não depende da auto-inicialização do Compose, aplique o esquema uma vez à mão. Um arquivo por motor, com os mesmos nomes de tabelas e colunas em todos:',
      applyNote:
        'Os arquivos SQL só adicionam — CREATE TABLE IF NOT EXISTS —, então dá para reexecutá-los a qualquer momento, inclusive num banco que já tem dados.',
      engineNotes: [
        'O esquema de referência. Versão 14 ou superior.',
        'MySQL 8 ou MariaDB 10.2 em diante: a API ordena o conteúdo com uma função de janela.',
        'Nada para hospedar: um arquivo ao lado da API. Serve para uma instância pessoal, menos para uma que os apps acessam de vários lugares ao mesmo tempo.',
        'Não há esquema a aplicar: o MongoDB cria a coleção na primeira escrita. Só os índices importam, e a API os cria sozinha ao conectar — o comando acima apenas se antecipa.',
      ],
      userIntro:
        'O acesso administrativo é o par de usuário e senha acima: não há nada a criar. Para uma conta comum, sem passar por um formulário de cadastro:',
      verifyIntro: 'Depois confira se responde:',
      verifyNote:
        'Uma lista de provedores vazia é a resposta esperada aqui: nada coletou nada ainda. É disso que trata o guia de provedores.',
    },

    pointing: {
      heading: 'Apontar um aplicativo para a sua instância',
      items: [
        'Web: defina a URL da API no seu deploy — ou deixe como está e permita que cada visitante a substitua pelo perfil, onde fica guardada por navegador.',
        'Desktop e celular: Perfil, depois “URL da API”, cole a sua e salve. “Restaurar padrão” volta à embutida a qualquer momento.',
      ],
      note: 'Nada mais muda. A lista de provedores, os dados e a renderização seguem a instância configurada — inclusive a exibição sóbria para provedores que o aplicativo não conhece pelo nome.',
    },

    troubleshooting: {
      heading: 'Quando algo não vai bem',
      items: [
        {
          symptom: 'A lista de provedores volta vazia.',
          cause:
            'Esperado em um banco novo: nenhum provedor rodou contra ele ainda. Rode um e confira de novo.',
        },
        {
          symptom: 'Os aplicativos não mostram nada, mas a lista de provedores está preenchida.',
          cause:
            'Os provedores estão rodando, mas ninguém acompanha nada ainda, ou as fontes acompanhadas não têm novidades. Adicione uma fonte pelo aplicativo.',
        },
        {
          symptom: 'Tudo responde 500 logo depois de adicionar um provedor.',
          cause:
            'Geralmente o banco: verifique se a API ainda o alcança e se o coletor não falhou no meio da criação das suas tabelas.',
        },
        {
          symptom: 'O login funciona mas todas as outras chamadas são recusadas.',
          cause:
            'O segredo de assinatura difere entre a instância que emitiu seu token e a que responde. Tokens não valem de uma instância para outra.',
        },
      ],
    },
  },

  providers: {
    meta: {
      title: 'StayUp — Provedores',
      description:
        'Escreva um programa que transforme qualquer fonte externa em conteúdo do StayUp.',
    },
    eyebrow: 'Provedores',
    title: 'Conectar uma nova fonte',
    lede: 'Um provedor é um programa que busca um tipo de fonte e guarda o que encontra. É a única coisa que você escreve para estender o StayUp: a API e os três aplicativos o reconhecem sozinhos.',

    what: {
      heading: 'O que um provedor realmente é',
      body: 'Não é um plugin nem um módulo a registrar: um programa comum, na linguagem que você quiser, executado de forma agendada. Ele lê a lista de fontes destinadas a ele, busca cada uma, guarda o que é novo e escreve no banco. A API o reconhece sozinha e os três aplicativos o exibem, sem que uma linha de código mude em lugar nenhum.',
      note: 'Um provedor nunca chama a API do StayUp. Ele fala com o banco de dados, e só com ele.',
      diagram: {
        title: 'Um provedor, passo a passo',
        sources: 'Suas fontes, lidas do banco',
        sourcesItems: 'os feeds de podcast que este provedor foi incumbido de acompanhar',
        fetch: 'Buscar cada feed',
        compare: 'Guardar só o que não estava lá',
        store: 'Escrever no banco de dados',
        exposed: 'A API expõe, os aplicativos exibem',
      },
      steps: {
        heading: 'A cada rodada',
        items: [
          'Ler as fontes destinadas a você.',
          'Buscar cada uma lá fora.',
          'Comparar com o que você guardou da última vez e ficar só com o novo.',
          'Escrever os itens novos no banco.',
          'Limpar o que envelheceu, e registrar uma falha em vez de quebrar por causa dela.',
        ],
      },
    },

    access: {
      heading: 'Antes de começar: onde ele vai escrever?',
      body: 'Um provedor precisa de acesso de escrita ao banco da instância que alimenta. Na instância pública você não tem isso, então, na prática, um provedor seu vem junto com uma instância sua. Escrever um não exige nada do guia de auto-hospedagem; rodá-lo exige um banco onde você possa escrever.',
      cta: 'Guia de auto-hospedagem',
    },

    existing: {
      heading: 'Exemplos para ler',
      body: 'Já existem alguns provedores como repositórios independentes. São os que a instância de referência por acaso roda, não uma definição do que o StayUp cobre. Leia um como exemplo funcionando do contrato abaixo, e aponte-o para o seu próprio banco se ele lhe servir. O de RSS é o mais curto.',
    },

    creating: {
      heading: 'Escrever o seu',
      naming: {
        heading: 'Escolher um nome',
        intro:
          'Algo curto e em minúsculas, válido como identificador: podcast, hackernews, reddit_thread. Essa única string é usada literalmente em três lugares:',
        columnWhere: 'Onde',
        columnExample: 'Para “podcast”',
        rows: ['Sua tabela de dados', 'As fontes que pertencem a você', 'Seu nome de exibição'],
        note: 'Não há nada a reservar de antemão: o nome é simplesmente aquele com que você cria a tabela. Dois provedores só colidem se escolherem o mesmo.',
      },
      shape: {
        heading: 'O que você guarda',
        body: 'Uma linha por item encontrado. O conteúdo em si pode ser texto puro ou JSON, você decide. Os aplicativos não têm uma renderização dedicada para um provedor recém-criado, então o exibem como cartão sóbrio: o começo do conteúdo, a data e o seu nome de exibição. Funciona, só é visualmente simples. Uma renderização mais rica é opcional, separada, e nada no contrato exige.',
      },
      schedule: {
        heading: 'Rodar de forma agendada',
        body: 'Copie qualquer coletor existente: um Dockerfile e um trabalho diário que executa o script com a URL do banco como segredo. Nada exige uma CI específica: um timer do systemd ou um cron comum fazem o mesmo.',
      },
    },

    contract: {
      heading: 'Contrato técnico',
      lede: 'Material de referência. Você precisa dele para escrever um provedor, não para entender o StayUp.',
      diagramTitle: 'O que seu script pode tocar',
      yourScript: 'Seu provedor',
      readOnly: 'somente leitura',
      readWrite: 'leitura e escrita — inteiramente sua',
      upsertOne: 'uma linha: a sua',
      writeOnError: 'escrever em caso de erro',
      repositoryDesc: 'as fontes a acompanhar',
      connectorDesc: 'o conteúdo que você coleta',
      registryDesc: 'seu nome de exibição',
      logDesc: 'as falhas, em vez de quebrar',
      warning:
        'Nunca escreva na tabela de outro provedor, nem nas tabelas de usuários, sessões, contas ou assinaturas: elas pertencem à API e ao aplicativo web.',
      tablesHeading: 'As quatro tabelas',
      tablesIntro:
        'Seu passo de inicialização, executado no início de cada rodada, precisa garantir que elas existam. Toda instrução é idempotente: repetível sempre sem risco, mesmo que outro provedor tenha criado as compartilhadas antes.',
      engineIntro:
        'Escolha o motor da sua instância. Os nomes não mudam de uma aba para outra: mudam só o dialeto e os tipos, e é por isso que um provedor escrito contra um motor se lê igual contra outro.',
      engineNotes: [
        'O dialeto de referência, e o que a instância pública roda.',
        'As mesmas tabelas, com tipos do MySQL. Uma URL precisa caber num VARCHAR indexável, daí o comprimento explícito.',
        'Sem servidor: seu provedor e a API abrem o mesmo arquivo. Datas e JSON ficam como texto, que a API converte de volta na leitura.',
        'Uma coleção em vez de uma tabela, e nenhum esquema a declarar — mas duas regras. Um documento repository carrega um _id numérico, tirado da coleção counters, porque o contrato designa uma fonte por um número. E nada cai em cascata: o que você escreve, você limpa.',
      ],
      repositoryTitle: 'repository — compartilhada, você sobretudo lê dela',
      repositoryBody:
        'Uma linha é uma coisa a acompanhar: um feed de podcast, um subreddit, o que o seu provedor chamar de fonte. A coluna type precisa ser igual ao nome do seu provedor. A coluna config é JSON livre que só o seu script define e interpreta.',
      connectorTitle: 'connector_<name> — sua, por inteiro',
      connectorBody: 'Colunas opcionais, usadas quando presentes mas nunca exigidas:',
      optionalDescriptions: [
        'o carimbo de tempo do próprio conteúdo, preferido ao horário de execução ao ordenar pelo mais recente.',
        'um rótulo curto exibido junto às renderizações ricas: uma tag de release, um id de vídeo e assim por diante.',
      ],
      registryTitle: 'provider_registry — compartilhada, uma linha para você',
      registryBody:
        'A ordem só afeta como os provedores aparecem nos aplicativos; qualquer inteiro serve. Pule essa tabela e seu provedor continua funcionando: a API recorre ao seu nome com a inicial maiúscula.',
      logTitle: 'log — compartilhada, opcional mas recomendada',
      logBody: 'Escreva aqui em vez de quebrar quando uma fonte falhar, e siga com as outras.',
      addingSources: {
        heading: 'Colocar fontes lá dentro',
        body: 'Duas formas. Ofereça uma flag --add que insere uma linha e encerra: útil para semear direto no banco. A outra via, a que os usuários realmente tomam, é adicionar uma fonte pelo aplicativo, onde o campo de provedor precisa ser igual ao sufixo da sua tabela.',
      },
      checklist: {
        heading: 'Antes de considerar pronto',
        items: [
          'criada com pelo menos um identificador, uma referência de fonte, o conteúdo, um carimbo de tempo e um indicador de sucesso.',
          'linha inserida ou atualizada a cada rodada.',
          'fontes lidas com o nome do seu provedor.',
          'entradas antigas limpas — ou a ausência de retenção documentada.',
          'falhas por fonte registradas aqui em vez de derrubar a rodada.',
          'lista o seu provedor depois de uma rodada.',
          'devolve os seus dados.',
        ],
      },
    },
  },
}
