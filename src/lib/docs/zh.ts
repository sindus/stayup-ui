import type { DocContent } from './en'

export const zh: DocContent = {
  common: {
    onThisPage: '本页内容',
    backToDocs: '返回文档',
    docsHome: '文档',
  },

  home: {
    meta: {
      title: 'StayUp — 文档',
      description: 'StayUp 如何运作、如何运行自己的实例，以及如何接入一个新的来源。',
    },
    eyebrow: '文档',
    title: 'StayUp 如何运作',
    lede: '从这里开始。两分钟看懂概念，然后挑一条你真正需要的路。',

    concept: {
      heading: '四句话讲清楚',
      points: [
        'StayUp 会把你关注的来源的新内容展示给你。什么算作来源并不固定——某个提供方能去抓取的东西，就是来源。',
        '提供方是一个小程序，它去抓取某一类来源，并把抓到的内容写进该实例的数据库。要覆盖一类新的来源，就写一个提供方；StayUp 的其他部分不用变。',
        'StayUp API 读取这个数据库，再交给各个应用。它不把任何来源类型写死在代码里：每次请求都会问数据库此刻有哪些提供方。',
        '各个应用读取 API。每一个都能指向任意实例，也就是任意数据库——而且都能显示一个它从未听说过的提供方。',
      ],
      note: '来源的集合在结构上就是开放的。一个实例展示的，恰好是针对它的数据库在运行的那些提供方——没有内置清单，也不需要登记。',
      diagram: {
        title: '从一个来源到你的屏幕',
        sources: '外部来源',
        sourcesItems: '一个播客订阅源 · 一个论坛帖子 · 一个状态页 · 任何程序读得懂的东西',
        providers: '提供方',
        providersSub: '每种来源一个小程序',
        database: '数据库',
        databaseSub: 'PostgreSQL、MySQL、SQLite 或 MongoDB——收集到的一切都在这里',
        api: 'StayUp API',
        apiSub: '读取数据库，服务各个应用',
        apps: '网页 · 桌面 · 移动',
        appsSub: '每一个都可切换到另一个实例',
      },
    },

    paths: {
      heading: '你需要哪条路？',
      selfHostingTitle: '运行自己的实例',
      selfHostingBody: '你自己的 API 和数据库，数据始终归你，跑什么也由你决定。',
      selfHostingCta: '自托管指南',
      providersTitle: '接入一个新来源',
      providersBody: '写一个提供方——一个去抓取 StayUp 尚未覆盖的来源、并保存所得内容的程序。',
      providersCta: '提供方指南',
      relation:
        '两者相关但各自独立。提供方从不与 API 通信，只与数据库通信——所以你可以完全不看自托管指南就写出一个。运行它则是另一回事：它需要对所供给数据库的写入权限，而在公共实例上你没有这个权限。实际上，自己的提供方总是配着自己的实例。',
    },
  },

  selfHosting: {
    meta: {
      title: 'StayUp — 自托管',
      description: '运行你自己的 StayUp API 和数据库，并把各个应用指向它们。',
    },
    eyebrow: '自托管',
    title: '运行自己的实例',
    lede: '一个实例由三部分组成：一个数据库、挡在它前面的 API，以及你选来充实它的那些提供方。',

    why: {
      heading: '为什么要折腾',
      intro: '公共实例有它自己的提供方和数据。运行你自己的，可以让你：',
      items: [
        '把一切放在你掌控的数据库里；',
        '决定哪些提供方运行，以及多久运行一次；',
        '跟踪公共实例没有覆盖的来源；',
        '把网页、桌面和移动应用都指向它——一项设置，无需改动代码。',
      ],
      note: '各实例之间互不通信。你会从一个空数据库和零个提供方开始，直到你针对它运行了一个。',
    },

    pieces: {
      heading: '三个部分',
      database: '一个数据库',
      databaseBody:
        '存放一切：正在跟踪的来源、收集到的内容、账号。PostgreSQL、MySQL/MariaDB、SQLite 或 MongoDB——你指向哪个，API 就适配哪个。',
      api: 'StayUp API',
      apiBody:
        '架在该数据库之上的一层轻薄、无状态的东西。它不把任何提供方名字写死在代码里——每次请求都会问数据库里面有什么。',
      providers: '提供方',
      providersBody: '真正填充数据库的程序。一个都没有的话，你的实例能跑，但什么都不会显示。',
    },

    requirements: {
      heading: '你需要什么',
      items: [
        '下面列表中的一种数据库，API 运行的地方能访问到它。',
        '如果不用 Docker，则需要 Node.js 22 及以上。',
        '可选：一个 Cloudflare 账号，用于像参考实例那样部署到 Workers。',
      ],
    },

    databases: {
      heading: '选哪种数据库',
      intro:
        'API 并不直接说 SQL。它调用一份存储契约，每种引擎由一个适配器来实现，而 DATABASE_URL 的协议头决定用哪个适配器。开箱即用的引擎有四种：',
      columnEngine: '引擎',
      columnScheme: 'URL 协议',
      columnDriver: '需安装的驱动',
      note: '每种引擎都要通过同一套一致性测试——同样的二十四条行为，在 CI 中跑在真实的 PostgreSQL、MySQL、SQLite 和 MongoDB 上。这让选择可以反悔：表、集合和字段在各处都用同样的名字，所以提供方只需描述一次，变的只是方言。',
      workersNote:
        '有一个例外，而且不是我们造成的：Cloudflare Workers 只能建立 PostgreSQL 所用的那类连接。MySQL、SQLite 和 MongoDB 的驱动需要 Node——Docker 或纯 Node.js，Workers 不行。',
    },

    env: {
      heading: '配置',
      columnVariable: '变量',
      columnRequired: '必填',
      columnDescription: '说明',
      yes: '是',
      no: '否',
      descriptions: [
        '协议头决定引擎：postgres://、mysql://、sqlite:// 或 mongodb://。Node 与 Docker 构建也接受单独的 DB_HOST、DB_PORT、DB_NAME、DB_USER、DB_PASSWORD（仅限 PostgreSQL）。',
        '用于签发认证令牌的随机密钥。可用 openssl rand -hex 32 生成。',
        '唯一的管理服务账号。数据库里并没有管理员这一行：谁用这组凭据登录，谁就获得管理员角色。普通用户则通过应用注册。',
        '你部署的网页端的公开地址，用作 OAuth 回跳目标。',
        '启用“使用 Google 登录”。留空即为关闭。',
        '启用“使用 GitHub 登录”。留空即为关闭。',
      ],
      note: '无论 OAuth 变量如何设置，邮箱加密码的登录方式始终可用。',
    },

    deploy: {
      heading: '部署 API',
      tabs: ['Docker Compose', 'Cloudflare Workers', '纯 Node.js'],
      dockerIntro: '最快的路径：克隆、填好 .env、启动。',
      dockerNote:
        'compose 文件会把表结构挂载到 Postgres 的初始化目录，因此卷第一次初始化时就会建好核心表。之后 API 在 3000 端口监听。',
      workersIntro: '参考实例采用的方式。',
      workersNote:
        '你的数据库必须能从 Cloudflare 的网络访问到——通常的做法是使用带公网连接串、支持连接池的托管服务。Workers 无法访问你家庭网络里的数据库。',
      nodeIntro: '没有编排，只有编译好的服务端。',
      nodeNote: '或者你也可以自己构建随附的 Dockerfile，如果你更想在没有 Compose 的情况下跑容器。',
    },

    schema: {
      heading: '建表，以及你的第一个账户',
      applyIntro:
        '如果不依赖 Compose 的自动初始化，就自己执行一次建表。每种引擎一个文件，表名和字段名完全一致：',
      applyNote:
        'SQL 文件只做新增——CREATE TABLE IF NOT EXISTS——所以随时重跑都安全，哪怕库里已经有数据。',
      engineNotes: [
        '基准表结构。版本 14 及以上。',
        'MySQL 8 或 MariaDB 10.2 及以上：API 用窗口函数给内容排序。',
        '无需部署——就是 API 旁边的一个文件。适合个人实例，不适合多处同时访问的实例。',
        '没有表结构要建：MongoDB 在第一次写入时创建集合。真正重要的只有索引，而 API 连接时会自己建好——上面的命令只是提前做了一遍。',
      ],
      userIntro:
        '管理员入口就是上面那对用户名和密码，没有什么需要创建。若要创建普通账号而不走注册表单：',
      verifyIntro: '然后确认它有响应：',
      verifyNote:
        '此时返回空的提供方列表是预期结果：还没有任何东西收集过内容。那正是提供方指南的主题。',
    },

    pointing: {
      heading: '把应用指向你的实例',
      items: [
        '网页端：在你的部署上设置 API 地址；或者不动它，让每位访客在个人资料里自行覆盖，该设置按浏览器保存。',
        '桌面与移动端：个人资料 →“API 地址”→ 粘贴你的地址 → 保存。“恢复默认”随时可以回到内置地址。',
      ],
      note: '其他什么都不变。提供方列表、数据和渲染都跟随所配置的实例——包括为应用不认识的提供方准备的朴素显示。',
    },

    troubleshooting: {
      heading: '出问题时',
      items: [
        {
          symptom: '提供方列表返回为空。',
          cause: '在新数据库上这是预期的：还没有提供方针对它运行过。运行一个再看看。',
        },
        {
          symptom: '提供方列表有内容，但应用里什么都不显示。',
          cause:
            '提供方在运行，但还没有人关注任何东西，或者被跟踪的来源没有新内容。在应用里添加一个来源。',
        },
        {
          symptom: '刚添加一个提供方之后，所有请求都返回 500。',
          cause: '通常是数据库：检查 API 是否仍能访问它，以及采集器是否在建表中途失败了。',
        },
        {
          symptom: '能登录，但其他所有调用都被拒绝。',
          cause: '签发你令牌的实例和正在响应的实例使用了不同的签名密钥。令牌不能跨实例通用。',
        },
      ],
    },
  },

  providers: {
    meta: {
      title: 'StayUp — 提供方',
      description: '编写一个把任意外部来源变成 StayUp 内容的程序。',
    },
    eyebrow: '提供方',
    title: '接入一个新来源',
    lede: '提供方就是一个去抓取某类来源、并保存所得内容的程序。它是你为扩展 StayUp 而要写的唯一东西——API 和三个应用会自行接住它。',

    what: {
      heading: '提供方到底是什么',
      body: '既不是插件，也不是需要注册的模块：就是一个普通程序，用什么语言都行，按计划运行。它读取分配给自己的来源列表，逐个抓取，留下新的内容，写入数据库。API 会自行接住，三个应用会显示出来——任何地方都不用改一行代码。',
      note: '提供方从不调用 StayUp API。它只和数据库打交道。',
      diagram: {
        title: '一个提供方，逐步来看',
        sources: '从数据库读到的、由它负责的来源',
        sourcesItems: '这个提供方被指定跟踪的播客订阅源',
        fetch: '抓取每个订阅源',
        compare: '只留下此前没有的',
        store: '写入数据库',
        exposed: 'API 对外提供，应用负责显示',
      },
      steps: {
        heading: '每次运行时',
        items: [
          '读取分配给你的来源。',
          '逐个从外部抓取。',
          '与上次保存的内容比对，只留下新的。',
          '把新条目写入数据库。',
          '清理过旧的内容，遇到失败就记录下来而不是崩掉。',
        ],
      },
    },

    access: {
      heading: '开始之前：它往哪里写？',
      body: '提供方需要对所供给实例的数据库拥有写入权限。在公共实例上你没有这个权限，所以实际上自己的提供方总是配着自己的实例。写一个提供方不需要用到自托管指南；跑起来则需要一个你能写入的数据库。',
      cta: '自托管指南',
    },

    existing: {
      heading: '可以读的实例',
      body: '已经有若干提供方以独立仓库的形式存在。它们是参考实例恰好在运行的东西，而不是 StayUp 覆盖范围的定义。把其中一个当作下面这份约定的可运行示例来读；如果正好合用，也可以让它指向你自己的数据库。RSS 那个最短。',
    },

    creating: {
      heading: '写自己的',
      naming: {
        heading: '取个名字',
        intro:
          '取一个简短的小写名字，能直接当标识符用——podcast、hackernews、reddit_thread。这一个字符串会原样用在三个地方：',
        columnWhere: '位置',
        columnExample: '以“podcast”为例',
        rows: ['你的数据表', '属于你的那些来源', '你的显示名'],
        note: '没有什么需要提前预留：名字就是你建表时用的那个。两个提供方只有选了同一个名字才会冲突。',
      },
      shape: {
        heading: '你要存什么',
        body: '找到一条就存一行。内容本身可以是纯文本，也可以是 JSON，由你决定。对于全新的提供方，应用没有专门的渲染组件，因此会显示成朴素卡片：内容的开头、日期，以及你的显示名。功能完全可用，只是外观简单。更丰富的渲染是可选的、另做的，约定里没有任何地方要求它。',
      },
      schedule: {
        heading: '按计划运行',
        body: '照搬任意一个现有采集器：一个 Dockerfile，加上一个每日任务，把数据库地址作为密钥传给脚本。没有任何东西非某种 CI 不可——systemd 定时器或普通 cron 效果一样。',
      },
    },

    contract: {
      heading: '技术约定',
      lede: '参考资料。写提供方时你需要它，理解 StayUp 则不需要。',
      diagramTitle: '你的脚本可以碰什么',
      yourScript: '你的提供方',
      readOnly: '只读',
      readWrite: '读写 —— 完全归你',
      upsertOne: '一行：你自己的那行',
      writeOnError: '出错时写入',
      repositoryDesc: '要跟踪的来源',
      connectorDesc: '你收集到的内容',
      registryDesc: '你的显示名',
      logDesc: '失败记录，而不是崩溃',
      warning:
        '永远不要写入其他提供方的表，也不要写入用户、会话、账户或订阅相关的表：它们属于 API 和网页应用。',
      tablesHeading: '四张表',
      tablesIntro:
        '你的初始化步骤会在每次执行开始时运行，它必须确保这些表存在。所有语句都是幂等的——每次都执行也安全，即使共享表已被别的提供方先建好也没问题。',
      engineIntro:
        '选中你这套实例所用的引擎。切换标签时名字不会变——变的只有方言和类型，正因为如此，针对一种引擎写的提供方，换一种引擎读起来是一样的。',
      engineNotes: [
        '基准方言，也是公开实例正在跑的那一种。',
        '同样的表，MySQL 的类型。URL 必须放得进可建索引的 VARCHAR，所以这里写明了长度。',
        '没有服务端：你的提供方和 API 打开的是同一个文件。日期和 JSON 都存成文本，API 读取时再还原。',
        '用集合而不是表，也没有表结构要声明——但有两条规矩。repository 文档带一个数字型 _id，取自 counters 集合，因为契约是用数字来指代一个来源的。另外没有任何级联：你写进去的，得你自己清理。',
      ],
      repositoryTitle: 'repository —— 共享，你主要是读它',
      repositoryBody:
        '一行代表一个要跟踪的东西：一个播客订阅源、一个 subreddit，或者你的提供方所定义的任何“来源”。type 列必须等于你的提供方名字。config 列是自由格式的 JSON，只由你的脚本定义和解释。',
      connectorTitle: 'connector_<name> —— 完全属于你',
      connectorBody: '可选列，存在时会被使用，但从不强制：',
      optionalDescriptions: [
        '内容自身的时间戳；按“最新”排序时优先于执行时间。',
        '显示在富渲染旁的简短标签——版本标签、视频 ID 等等。',
      ],
      registryTitle: 'provider_registry —— 共享，你写一行',
      registryBody:
        '排序只影响提供方在各应用中出现的先后，任意整数皆可。跳过这张表，你的提供方照样能工作：API 会退回到把你的名字首字母大写。',
      logTitle: 'log —— 共享，可选但推荐',
      logBody: '某个来源失败时写在这里而不是崩溃，然后继续处理其余的来源。',
      addingSources: {
        heading: '把来源放进去',
        body: '有两种方式。提供一个 --add 参数，插入一行后退出——便于直接在数据库里预置。另一种，也是用户真正走的那种，是从应用里添加来源，其中提供方字段必须等于你表名的后缀。',
      },
      checklist: {
        heading: '在你认为完成之前',
        items: [
          '已创建，且至少包含标识符、来源引用、内容、时间戳和成功标志。',
          '每次运行都写入（upsert）该行。',
          '用你的提供方名字读取来源。',
          '清理旧记录——若不支持保留策略，则已在文档中说明。',
          '单个来源的错误记录在这里，而不是让整次运行崩掉。',
          '运行一次之后，能列出你的提供方。',
          '能返回你的数据。',
        ],
      },
    },
  },
}
