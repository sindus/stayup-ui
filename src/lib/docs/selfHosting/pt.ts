import type { DocContent } from './en'

export const pt: DocContent = {
  meta: {
    title: 'StayUp — Auto-hospedagem e criação de provedores',
    description:
      'Rode sua própria instância do stayup-api e escreva um provedor que se conecta ao StayUp sem tocar no código dos apps.',
  },
  nav: {
    onThisPage: 'Nesta página',
    backToSite: 'Voltar ao site',
  },
  eyebrow: 'Documentação',
  title: 'Auto-hospedar o StayUp e criar provedores',
  lede: 'Dois públicos, uma página: rodar sua própria instância do stayup-api sobre seus próprios dados, e escrever um provedor que se conecta sem tocar em uma linha dos quatro apps.',

  overview: {
    heading: 'Como as peças se encaixam',
    points: [
      'O stayup-api é uma camada HTTP fina e sem estado sobre um único banco PostgreSQL. Ele nunca fixa um nome de provedor no código. A cada requisição pergunta ao Postgres quais tabelas connector_* existem naquele momento e qual nome de exibição cada uma registrou — essa resposta é a lista de provedores.',
      'Um provedor é um script independente (hoje Python, amanhã qualquer coisa) que possui exatamente uma tabela e escreve linhas nela periodicamente. Ele nunca fala com o stayup-api: fala com o mesmo banco Postgres.',
      'Os três apps clientes também não fixam uma URL de API. Cada um traz um valor padrão, e qualquer pessoa pode apontá-lo para outra instância do stayup-api pelo perfil — outro banco, outros provedores, outros dados.',
    ],
    note: 'As instâncias não se coordenam. Ao auto-hospedar, você começa com um banco vazio e zero provedores, até que ao menos um coletor rode contra ele. Nada é compartilhado com a instância de referência.',
    diagram: {
      title: 'Arquitetura geral',
      providers: 'Provedores — scripts independentes, um por tipo de fonte',
      yourProvider: 'seu novo provedor…',
      writesCron: 'escreve, de forma agendada',
      database: 'PostgreSQL',
      dbShared: 'compartilhada',
      dbPerProvider: 'uma por provedor',
      readsWrites: 'lê e escreve, via SQL',
      api: 'stayup-api',
      apiSubtitle: 'sem estado — descobre os provedores no Postgres no momento da requisição',
      http: 'HTTP, em uma URL configurável',
      clients: 'Apps clientes',
      endUser: 'usuário final',
      note: 'Qualquer cliente pode apontar para qualquer instância e, portanto, para qualquer banco. Existe uma instância de referência; a auto-hospedagem é uma pilha paralela de mesma forma, desconectada dela.',
    },
  },

  part1: {
    eyebrow: 'Parte 1',
    heading: 'Auto-hospedar o stayup-api',
    requirements: {
      heading: 'Pré-requisitos',
      items: [
        'Um banco PostgreSQL (14 ou superior) acessível de onde a API roda.',
        'Node.js 22 ou superior, se você não usar Docker.',
        'Opcionalmente uma conta na Cloudflare, se quiser fazer deploy em Workers como a instância de referência.',
      ],
    },
    env: {
      heading: 'Variáveis de ambiente',
      columnVariable: 'Variável',
      columnRequired: 'Obrigatória',
      columnDescription: 'Descrição',
      yes: 'sim',
      no: 'não',
      descriptions: [
        'postgres://user:pass@host:port/dbname. Os builds Node e Docker também aceitam DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASSWORD separadamente.',
        'Segredo aleatório que assina os tokens de autenticação. Gere um com openssl rand -hex 32.',
        'A única conta de serviço de administração. Não existe linha de admin no banco: quem entrar com essas credenciais recebe o papel de administrador. Usuários comuns se cadastram pelos apps.',
        'URL pública do seu deploy do stayup-ui. Usada como destino do redirecionamento OAuth.',
        'Ativa “Entrar com o Google”. Deixe vazio para desativar.',
        'Ativa “Entrar com o GitHub”. Deixe vazio para desativar.',
      ],
      note: 'O acesso por e-mail e senha sempre funciona, independentemente do que você fizer com as variáveis de OAuth.',
    },
    deploy: {
      heading: 'Opções de deploy',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Node.js puro'],
      dockerIntro: 'O caminho mais curto: clonar, preencher o .env, subir.',
      dockerNote:
        'O docker-compose.yml monta o esquema no diretório de inicialização do Postgres, então as tabelas base são criadas na primeira inicialização do volume. A API passa a escutar na porta 3000.',
      workersIntro: 'Corresponde ao deploy de referência.',
      workersNote:
        'Seu Postgres precisa ser alcançável a partir da rede da Cloudflare — um provedor gerenciado com string de conexão pública e com pool é a resposta usual. O Workers não alcança um banco na sua rede doméstica.',
      nodeIntro: 'Sem orquestração, apenas o servidor compilado.',
      nodeNote:
        'Ou construa você mesmo o Dockerfile fornecido, se preferir um contêiner sem o Compose.',
    },
    schema: {
      heading: 'Aplicar o esquema e criar o primeiro usuário',
      applyIntro: 'Se você não conta com a inicialização automática do Compose, aplique-o uma vez:',
      applyNote:
        'Ele é puramente aditivo — só CREATE TABLE IF NOT EXISTS — então pode ser reexecutado a qualquer momento, inclusive contra um banco que já tem dados.',
      userIntro:
        'O acesso administrativo são o API_USERNAME e o API_PASSWORD acima: não há nada a criar. Para uma conta comum, sem passar por um formulário de cadastro:',
      verifyIntro: 'Depois confira se responde:',
      verifyNote:
        'Uma lista de provedores vazia é a resposta esperada neste ponto: nenhum provedor rodou ainda contra este banco. É disso que trata a parte 2.',
    },
    pointing: {
      heading: 'Apontar um app para a sua instância',
      items: [
        'stayup-ui: defina STAYUP_API_URL no seu deploy — ou não mexa nela e deixe cada visitante substituí-la pelo perfil, onde fica guardada por navegador.',
        'stayup-desktop e stayup-mobile: Perfil, depois “URL da API”, cole a URL da sua instância e salve. “Restaurar padrão” volta à URL embutida a qualquer momento.',
      ],
      diagram: {
        title: 'Trocar de instância',
        instanceA: 'stayup-api — instância de referência',
        instanceB: 'stayup-api — sua instância',
        providersA: 'provedores: changelog, youtube, rss, scrap',
        providersB: 'provedores: podcast, hackernews',
        client: 'Mesmo app, um único ajuste',
        connected: 'conectado agora',
        switch: 'mudar para esta',
        note: 'Zero mudança de código. A lista de provedores, os dados e a renderização seguem a instância configurada — inclusive o modo genérico para provedores que o app não conhece pelo nome.',
      },
    },
  },

  part2: {
    eyebrow: 'Parte 2',
    heading: 'Criar um novo provedor',
    intro:
      'Um provedor é qualquer script que escreva periodicamente, na sua própria tabela do Postgres, linhas descrevendo conteúdo novo. O stayup-api e os três apps o reconhecem sozinhos — sem mudança de código em nenhum outro lugar — desde que ele siga o contrato abaixo. Os quatro coletores existentes são implementações de referência completas; o de RSS é o mais curto, leia-o junto com esta página.',
    contract: {
      heading: 'O contrato do provedor',
      diagramTitle: 'O que seu script pode tocar',
      yourScript: 'Seu script de provedor',
      readOnly: 'somente leitura',
      readWrite: 'leitura e escrita — propriedade completa',
      upsertOne: 'upsert de exatamente uma linha: a sua',
      writeOnError: 'escrever em caso de erro',
      repositoryDesc: 'compartilhada — as fontes a acompanhar',
      connectorDesc: 'sua — criada e possuída inteiramente por você',
      registryDesc: 'compartilhada — seu nome de exibição',
      logDesc: 'compartilhada, opcional — escreva aqui em vez de quebrar',
      warning:
        'Nunca escreva na tabela de outro provedor, nem em user, session, account ou user_repository: elas pertencem ao stayup-api e ao stayup-ui.',
    },
    naming: {
      heading: 'Convenção de nomes',
      intro:
        'Escolha um nome curto em minúsculas, válido como identificador snake_case: podcast, hackernews, reddit_thread. Essa única string é usada literalmente em três lugares:',
      columnWhere: 'Onde',
      columnExample: 'Exemplo, para “podcast”',
      rows: [
        'Sua tabela de dados',
        'repository.type — quais fontes são suas',
        'Seu nome de exibição',
      ],
      note: 'Não existe registro de nomes a reservar de antemão: o nome é simplesmente aquele com que você cria a tabela. Dois provedores só colidem se escolherem o mesmo nome de tabela.',
    },
    tables: {
      heading: 'As quatro tabelas envolvidas',
      intro:
        'Seu passo de inicialização, executado no início de cada rodada, precisa garantir que elas existam. Toda instrução é idempotente: repetível sempre sem risco, mesmo que outro provedor tenha criado as compartilhadas antes.',
      repositoryTitle: 'repository — compartilhada, você sobretudo lê dela',
      repositoryDesc:
        'Uma linha é uma coisa a acompanhar: um feed de podcast, um subreddit, o que o seu provedor chamar de fonte. type precisa ser igual ao nome do seu provedor. config é JSON livre que só o seu script define e interpreta.',
      connectorTitle: 'connector_<name> — sua, por inteiro',
      connectorDesc: 'Colunas opcionais, usadas quando presentes mas nunca exigidas:',
      optionalDescriptions: [
        'o carimbo de tempo do próprio conteúdo, preferido a executed_at ao ordenar pelo mais recente.',
        'um rótulo curto exibido junto às renderizações ricas: uma tag de release, um id de vídeo e assim por diante.',
      ],
      registryTitle: 'provider_registry — compartilhada, uma linha para você',
      registryDesc:
        'sort_order só afeta a ordem em que os provedores aparecem nos apps; qualquer inteiro serve (os quatro existentes usam 10, 20, 30, 40). Pule essa tabela por completo e seu provedor continua funcionando: a API recorre ao seu nome com a inicial maiúscula.',
      logTitle: 'log — compartilhada, opcional mas recomendada',
      logDesc: 'Escreva aqui em vez de quebrar quando uma fonte falhar, e siga com as outras.',
    },
    eachRun: {
      heading: 'O que seu script faz a cada rodada',
      steps: [
        'Conectar e executar o passo de esquema idempotente acima.',
        'Ler sua lista de fontes em repository, filtrada pelo nome do seu provedor.',
        'Para cada fonte: consultar o serviço externo, comparar com o que já está guardado — normalmente a última linha bem-sucedida daquela fonte — e inserir só o que for novo.',
        'Limpar linhas antigas conforme config.retention_days, ou as chaves de configuração que você definir.',
        'Diante de uma falha em uma fonte, escrever em log e passar à seguinte em vez de abortar a rodada inteira.',
      ],
      addFlag:
        'Ofereça uma flag --add <url> que faça upsert de uma linha em repository e encerre: é assim que fontes são semeadas direto no banco. O outro caminho — o que os usuários realmente tomam — passa pela API, onde provider precisa ser igual ao sufixo da sua tabela.',
    },
    conventions: {
      heading: 'Convenções de conteúdo e a ressalva da renderização genérica',
      body: 'content pode ser texto puro ou uma string JSON, como preferir. Os provedores existentes usam objetos JSON pequenos para YouTube e RSS, para que os apps consigam mostrar título e miniatura. Um provedor recém-criado não tem renderização própria para o seu formato, então os três apps o exibem como cartão genérico: os primeiros caracteres de content, a data e o seu nome de exibição. É plenamente funcional, só mais sóbrio. Uma renderização rica é um passo posterior e opcional: alguém adiciona em cada app um componente ligado ao nome do seu provedor. Nada no contrato do servidor exige isso.',
    },
    schedule: {
      heading: 'Rodar de forma agendada',
      body: 'Copie o padrão de qualquer coletor existente: um Dockerfile e um fluxo diário que executa o script com a URL do banco como segredo, apontada para o mesmo Postgres que sua API usa. Nada disso exige o GitHub Actions em particular: um timer do systemd, um cron comum ou outra CI fazem exatamente o mesmo.',
    },
    checklist: {
      heading: 'Antes de considerar pronto',
      items: [
        'criada com pelo menos id, repository_id, content, executed_at e success.',
        'linha inserida ou atualizada a cada rodada.',
        'fontes lidas com o nome do seu provedor.',
        'entradas antigas limpas — ou a ausência de retenção documentada.',
        'erros por fonte registrados aqui em vez de derrubar a rodada.',
        'lista o seu provedor depois de uma rodada.',
        'devolve os seus dados.',
      ],
    },
  },
}
