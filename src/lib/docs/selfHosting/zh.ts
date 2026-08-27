import type { DocContent } from './en'

export const zh: DocContent = {
  meta: {
    title: 'StayUp — 自托管与编写提供方',
    description:
      '运行你自己的 stayup-api 实例，并编写一个无需改动任何应用代码即可接入 StayUp 的提供方。',
  },
  nav: {
    onThisPage: '本页内容',
    backToSite: '返回网站',
  },
  eyebrow: '文档',
  title: '自托管 StayUp 与编写提供方',
  lede: '两类读者，一个页面：用自己的数据运行 stayup-api 实例，以及编写一个无需改动四个应用中任何一行代码就能接入的新提供方。',

  overview: {
    heading: '各部分如何拼合',
    points: [
      'stayup-api 是架在单个 PostgreSQL 数据库之上的一层轻薄、无状态的 HTTP。它从不把提供方名字写死在代码里。每次请求它都会问 Postgres：此刻存在哪些 connector_* 表，各自登记了什么显示名——这个答案就是提供方列表。',
      '提供方是一个独立脚本（今天是 Python，将来可以是任何东西），它恰好拥有一张表，并按计划往里写入数据行。它从不与 stayup-api 通信，而是直接连同一个 Postgres 数据库。',
      '三个客户端应用同样不写死 API 地址。每个都自带一个默认值，而任何用户都能在个人资料里把它指向另一个 stayup-api 实例——另一个数据库、另一批提供方、另一份数据。',
    ],
    note: '各实例之间并不互通。自托管时你从一个空数据库和零个提供方开始，直到至少有一个采集器针对它运行过为止。与参考实例之间不共享任何东西。',
    diagram: {
      title: '整体架构',
      providers: '提供方 —— 各自独立的脚本，每种来源一个',
      yourProvider: '你的新提供方…',
      writesCron: '按计划写入',
      database: 'PostgreSQL',
      dbShared: '共享',
      dbPerProvider: '每个提供方一张',
      readsWrites: '通过 SQL 读写',
      api: 'stayup-api',
      apiSubtitle: '无状态 —— 在请求时从 Postgres 发现提供方',
      http: 'HTTP，地址可配置',
      clients: '客户端应用',
      endUser: '最终用户',
      note: '任何客户端都能指向任何实例，也就是任何数据库。参考实例只有一个；自托管是一套形态相同、彼此独立的并行系统。',
    },
  },

  part1: {
    eyebrow: '第一部分',
    heading: '自托管 stayup-api',
    requirements: {
      heading: '前置条件',
      items: [
        '一个 PostgreSQL 数据库（14 及以上），API 运行的地方能访问到它。',
        '如果不用 Docker，则需要 Node.js 22 及以上。',
        '可选：一个 Cloudflare 账号，如果你想像参考实例那样部署到 Workers。',
      ],
    },
    env: {
      heading: '环境变量',
      columnVariable: '变量',
      columnRequired: '必填',
      columnDescription: '说明',
      yes: '是',
      no: '否',
      descriptions: [
        'postgres://user:pass@host:port/dbname。Node 和 Docker 构建也接受分开设置的 DB_HOST、DB_PORT、DB_NAME、DB_USER 和 DB_PASSWORD。',
        '用于签发认证令牌的随机密钥。可用 openssl rand -hex 32 生成。',
        '唯一的管理服务账号。数据库里并没有管理员这一行：谁用这组凭据登录，谁就获得管理员角色。普通用户则通过应用注册。',
        '你部署的 stayup-ui 的公开地址，用作 OAuth 回跳目标。',
        '启用“使用 Google 登录”。留空即为关闭。',
        '启用“使用 GitHub 登录”。留空即为关闭。',
      ],
      note: '无论 OAuth 变量如何设置，邮箱加密码的登录方式始终可用。',
    },
    deploy: {
      heading: '部署方式',
      tabs: ['Docker Compose', 'Cloudflare Workers', '纯 Node.js'],
      dockerIntro: '最快的路径：克隆、填好 .env、启动。',
      dockerNote:
        'docker-compose.yml 会把表结构挂载到 Postgres 的初始化目录，因此卷第一次初始化时就会建好核心表。之后 API 在 3000 端口监听。',
      workersIntro: '与参考部署保持一致。',
      workersNote:
        '你的 Postgres 必须能从 Cloudflare 的网络访问到——通常的做法是使用带公网连接串、支持连接池的托管服务。Workers 无法访问你家庭网络里的数据库。',
      nodeIntro: '没有编排，只有编译好的服务端。',
      nodeNote: '或者你也可以自己构建随附的 Dockerfile，如果你更想在没有 Compose 的情况下跑容器。',
    },
    schema: {
      heading: '应用表结构，创建第一个用户',
      applyIntro: '如果你不依赖 Compose 的自动初始化，就自己执行一次：',
      applyNote:
        '它是纯增量的——只有 CREATE TABLE IF NOT EXISTS——因此任何时候重复执行都安全，哪怕数据库里已经有数据。',
      userIntro:
        '管理员入口就是上面的 API_USERNAME 和 API_PASSWORD，没有什么需要创建。若要创建普通账号而不走注册表单：',
      verifyIntro: '然后确认它有响应：',
      verifyNote:
        '此时返回空的提供方列表是预期结果：还没有任何提供方针对这个数据库运行过。这正是第二部分的内容。',
    },
    pointing: {
      heading: '把应用指向你的实例',
      items: [
        'stayup-ui：在你的部署上设置 STAYUP_API_URL；或者不动它，让每位访客在个人资料里自行覆盖，该设置按浏览器保存。',
        'stayup-desktop 与 stayup-mobile：个人资料 →“API 地址”→ 粘贴你实例的地址 → 保存。“恢复默认”随时可以回到内置地址。',
      ],
      diagram: {
        title: '切换实例',
        instanceA: 'stayup-api —— 参考实例',
        instanceB: 'stayup-api —— 你的实例',
        providersA: '提供方：changelog、youtube、rss、scrap',
        providersB: '提供方：podcast、hackernews',
        client: '同一个应用，一个设置',
        connected: '当前已连接',
        switch: '改为切换到这个',
        note: '零代码改动。提供方列表、数据和渲染都跟随所配置的实例——包括为应用不认识的提供方准备的通用渲染。',
      },
    },
  },

  part2: {
    eyebrow: '第二部分',
    heading: '编写一个新的提供方',
    intro:
      '提供方就是任何一个定期把描述新内容的数据行写入自己那张 Postgres 表的脚本。只要遵守下面的约定，stayup-api 和三个应用会自动接住它——其他任何地方都无需改代码。现有的四个采集器都是完整的参考实现；RSS 那个最短，建议与本页对照阅读。',
    contract: {
      heading: '提供方约定',
      diagramTitle: '你的脚本可以碰什么',
      yourScript: '你的提供方脚本',
      readOnly: '只读',
      readWrite: '读写 —— 完全归你所有',
      upsertOne: '恰好写入一行：你自己的那行',
      writeOnError: '出错时写入',
      repositoryDesc: '共享 —— 要跟踪的来源',
      connectorDesc: '你的 —— 完全由你创建并拥有',
      registryDesc: '共享 —— 你的显示名',
      logDesc: '共享、可选 —— 与其崩溃，不如写在这里',
      warning:
        '永远不要写入其他提供方的表，也不要写入 user、session、account 或 user_repository：它们属于 stayup-api 和 stayup-ui。',
    },
    naming: {
      heading: '命名约定',
      intro:
        '取一个简短的小写名字，能直接当作 snake_case 标识符——podcast、hackernews、reddit_thread。这一个字符串会原样用在三个地方：',
      columnWhere: '位置',
      columnExample: '以“podcast”为例',
      rows: ['你的数据表', 'repository.type —— 哪些来源是你的', '你的显示名'],
      note: '不存在需要提前预留名字的登记处：名字就是你建表时用的那个。两个提供方只有在选了同一个表名时才会冲突。',
    },
    tables: {
      heading: '涉及的四张表',
      intro:
        '你的初始化步骤会在每次执行开始时运行，它必须确保这些表存在。所有语句都是幂等的——每次都执行也安全，即使共享表已被别的提供方先建好也没问题。',
      repositoryTitle: 'repository —— 共享，你主要是读它',
      repositoryDesc:
        '一行代表一个要跟踪的东西：一个播客订阅源、一个 subreddit，或者你的提供方所定义的任何“来源”。type 必须等于你的提供方名字。config 是自由格式的 JSON，只由你的脚本定义和解释。',
      connectorTitle: 'connector_<name> —— 完全属于你',
      connectorDesc: '可选列，存在时会被使用，但从不强制：',
      optionalDescriptions: [
        '内容自身的时间戳；按“最新”排序时优先于 executed_at。',
        '显示在富渲染旁的简短标签——版本标签、视频 ID 等等。',
      ],
      registryTitle: 'provider_registry —— 共享，你写一行',
      registryDesc:
        'sort_order 只影响提供方在各应用中的排列顺序，任意整数皆可（现有的四个用的是 10、20、30、40）。完全跳过这张表，你的提供方照样能工作：API 会退回到把你的名字首字母大写。',
      logTitle: 'log —— 共享，可选但推荐',
      logDesc: '某个来源失败时写在这里而不是崩溃，然后继续处理其余的来源。',
    },
    eachRun: {
      heading: '每次运行时你的脚本做什么',
      steps: [
        '连接，并执行上面那段幂等的建表步骤。',
        '从 repository 读取你的来源列表，按你的提供方名字过滤。',
        '对每个来源：请求外部服务，与已存内容比对——通常是该来源最近一条成功的记录——只插入新的部分。',
        '按 config.retention_days，或你自己定义的配置键，清理旧数据行。',
        '单个来源失败时写入 log 并继续下一个，而不是中止整次运行。',
      ],
      addFlag:
        '提供一个 --add <url> 参数，写入（upsert）一行 repository 后退出：这是直接在数据库里种下来源的方式。另一条路——用户真正走的那条——是通过 API 添加来源，其中 provider 必须等于你表名的后缀。',
    },
    conventions: {
      heading: '内容约定，以及关于通用渲染的说明',
      body: 'content 可以是纯文本，也可以是 JSON 字符串，由你决定。现有提供方在 YouTube 和 RSS 上使用了小型 JSON，好让应用能显示标题和缩略图。全新的提供方没有针对自身格式的渲染组件，因此三个应用会把它显示为通用卡片：content 的开头若干字符、日期，以及你的显示名。功能完全可用，只是外观朴素。富渲染是另一件独立且可选的后续工作：由某人在每个应用里，按你的提供方名字添加一个组件。后端约定并不要求这一步。',
    },
    schedule: {
      heading: '按计划运行',
      body: '照搬任意一个现有采集器的做法：一个 Dockerfile，加上一个每日工作流，把数据库地址作为密钥传给脚本，指向你的 API 所用的同一个 Postgres。这里没有任何东西非 GitHub Actions 不可——systemd 定时器、普通 cron 或别的 CI 效果完全一样。',
    },
    checklist: {
      heading: '在你认为完成之前',
      items: [
        '已创建，且至少包含 id、repository_id、content、executed_at 和 success。',
        '每次运行都写入（upsert）该行。',
        '用你的提供方名字读取来源。',
        '按保留策略清理旧记录——若不支持保留，则已在文档中说明。',
        '单个来源的错误记录在这里，而不是让整次运行崩掉。',
        '运行一次之后，能列出你的提供方。',
        '能返回你的数据。',
      ],
    },
  },
}
