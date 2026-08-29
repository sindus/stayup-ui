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
      description:
        'StayUp 是什么、各部分如何拼合，以及接下来去哪：运行自己的实例、运维它，或编写一个 provider。',
    },
    eyebrow: '文档',
    title: 'StayUp 的工作方式',
    lede: 'StayUp 把多种外部来源 — 发布说明、视频、订阅源、抓取的页面，凡是程序能读的东西 — 变成每个人的一份 feed。本页是心智模型和词汇；然后选择你需要的路径。',
    concept: {
      heading: '四句话讲清楚',
      points: [
        'StayUp 向你展示你所关注来源的新内容。什么算作来源并不固定：它是某个 provider 会去获取的东西。',
        '一个 provider 是一个小程序，去获取某一类来源，并把找到的东西写入实例的数据库。覆盖一类新来源就是写一个 provider；StayUp 其他部分什么都不变。',
        'StayUp API 读取该数据库并提供给各应用。它不硬编码任何来源类型：每次请求都问数据库现在有哪些 provider，并原样返回它们的展示清单。',
        '各应用 — Web、桌面、移动 — 读取 API。每个都可指向任意实例，也就是任意数据库，而且每个都能展示一个它从未听说过的 provider。',
      ],
      note: '来源的集合在设计上是开放的。一个实例恰好展示对其数据库运行的那些 provider — 没有内置清单，无需向中央机构注册。',
      diagram: {
        title: '从一个来源到你的屏幕',
        sources: '外部来源',
        sourcesItems: '一个播客订阅源 · 一个论坛帖子 · 一个状态页 · 凡是程序能读的东西',
        providers: 'Providers',
        providersSub: '每类来源一个小程序，按计划运行',
        database: '数据库',
        databaseSub: 'PostgreSQL、MySQL、SQLite 或 MongoDB — 所有收集到的东西，都在一处',
        api: 'StayUp API',
        apiSub: '读数据库、供应用、什么都不硬编码',
        apps: 'Web · 桌面 · 移动 · 管理',
        appsSub: '每个都可配置指向另一个实例',
      },
    },
    vocabulary: {
      heading: '把这些词一次性钉死',
      intro: '这些术语到处都是，很容易混。以下是它们在 StayUp 里的意思。',
      columnTerm: '术语',
      columnMeaning: '含义',
      terms: [
        {
          term: '实例（Instance）',
          meaning:
            '一个数据库 + 前面一个 API + 供应它的那些 provider。公共实例是一个；你的会是另一个。实例之间从不通信。',
        },
        {
          term: 'Provider（又称连接器）',
          meaning:
            '一个独立程序，去获取某一类来源，并向数据库写入行。“连接器”和“provider”是一回事；仓库名为 stayup-cmd-*。',
        },
        {
          term: '来源（又称 flux）— 一行 repository',
          meaning:
            '被追踪的一样东西：一个具体的订阅源 URL、一个频道、一个页面。作为共享表 repository 的一行存储，type 等于 provider 的名字。',
        },
        {
          term: '订阅',
          meaning:
            '用户与来源之间的关联：“这个人关注这个 flux”。在应用中添加一个 flux 会创建一个订阅（如果来源不存在，也会创建来源本身）。',
        },
        {
          term: '展示模板',
          meaning:
            'provider 存放在 provider_registry.template 中的可选 JSON 清单。它告诉各应用如何渲染该 provider 的行。没有模板 → 一张朴素的通用卡片。',
        },
        {
          term: '管理员（Admin）',
          meaning:
            '一个实例的运维者。第一个（超级管理员）由命令行创建；其余在管理后台 Web 界面里管理。与用户账户相互独立。',
        },
      ],
    },
    paths: {
      heading: '你需要哪条路径？',
      installTitle: '运行你自己的实例',
      installBody:
        '你自己的 API 和你自己的数据库，让你的数据仍属于你，也由你选择对它运行什么。附完整的本地演练。',
      installCta: '安装指南',
      generateTitle: '生成安装脚本',
      generateBody: '引导式路径：选择数据库和你想要的连接器，得到一个搭建整个技术栈的 bash 脚本。',
      generateCta: '安装生成器',
      adminTitle: '运维你的实例',
      adminBody:
        '管理后台 Web 界面：管理管理员，决定哪些 provider 自由接受新 flux，处理审批队列，整理用户和 flux。',
      adminCta: '管理指南',
      providersTitle: '接入一个新来源',
      providersBody:
        '编写一个 provider — 一个去获取 StayUp 尚未覆盖的来源并保存所得的程序。含展示模板。',
      providersCta: 'provider 指南',
      relation:
        '运维一个实例与编写一个 provider 相关但不同。provider 从不与 API 通信，只与数据库 — 所以你可以不读安装指南就写一个。运行它是另一回事：它需要对所供应数据库的写权限，而在公共实例上你没有。实际上，你自己的 provider 与你自己的实例配套。',
    },
  },
  install: {
    meta: {
      title: 'StayUp — 安装',
      description:
        '搭建你自己的 StayUp 实例：各部分、一份完整的本地演练、四种数据库、配置，以及如何把各应用指向它。',
    },
    eyebrow: '安装',
    title: '运行你自己的实例',
    lede: '一个实例是一个数据库、前面的 API、你选来供应它的那些 provider，以及 — 如果你想从浏览器运维 — 管理后台 Web 界面。本页把整套东西在本地从头到尾走一遍。',
    why: {
      heading: '为什么要费这个事',
      intro: '公共实例有它自己的 provider 和它自己的数据。运行你自己的可以让你：',
      items: [
        '把一切放在你控制的数据库里；',
        '选择哪些 provider 运行、多久一次；',
        '关注公共实例不覆盖的来源；',
        '通过按 provider 的审批，决定谁能添加什么；',
        '把 Web、桌面和移动应用指向它 — 一个设置，无需改代码。',
      ],
      note: '实例之间不通信。你从一个空数据库、没有 provider 开始，直到你对它运行一个。',
    },
    pieces: {
      heading: '四个部分',
      database: '一个数据库',
      databaseBody:
        '保存一切：被追踪的来源、收集的内容、账户、管理员。PostgreSQL、MySQL/MariaDB、SQLite 或 MongoDB — API 会适配你指向的那个。',
      api: 'StayUp API',
      apiBody:
        '该数据库之上一层薄的、无状态的层。它不硬编码任何 provider 名 — 每次请求都问数据库里有什么。可在 Node、Docker 或 Cloudflare Workers 上运行。',
      providers: 'Providers',
      providersBody:
        '真正往数据库里填东西的程序。独立仓库，按计划启动，只与数据库通信。没有至少一个，你的实例能运行但什么都不显示。',
      adminUi: '管理后台 Web 界面（可选）',
      adminUiBody:
        'Web 应用的一份部署，在 /admin 打开。可用来管理管理员、设置每个 provider 的审批模式、处理 flux 请求队列，以及整理用户和 flux。不要它 API 也照常工作 — 你只是失去了浏览器控制台。',
    },
    fastPath: {
      heading: '快捷路径',
      body: '如果你只想让它跑起来，安装生成器问几个问题，交给你一个 stayup-setup.sh，替你做完下面所有事 — 克隆、compose、结构、超级管理员、连接器首次运行、调度器。',
      cta: '打开安装生成器',
    },
    walkthrough: {
      heading: '完整的本地演练',
      intro:
        '手动来做，好让你看到每一个活动部件。这里用 PostgreSQL 和 Docker；同样的步骤适用于任何受支持的引擎。',
      steps: [
        '克隆 API：git clone https://github.com/stayup-app/stayup-api.git && cd stayup-api',
        '把 .env.example 复制为 .env，设置 DATABASE_URL 和 JWT_SECRET（openssl rand -hex 32）。没有要设的管理员用户名或密码 — 管理员存在于数据库中。',
        '启动数据库和 API：docker compose up -d db api。compose 文件会在首次 init 时把结构灌入 Postgres；API 在端口 3000 监听。',
        '如果你没依赖那个自动 init，就手动应用一次结构：psql "$DATABASE_URL" -f src/db/schema.sql。它只做新增，所以可以放心重复执行。',
        '创建第一个超级管理员：npm run create-admin -- root@example.com "Root" \'一个强密码\'。这是管理管理后台 Web 界面的账户。',
        '添加一个 provider。克隆一个 — git clone https://github.com/stayup-app/stayup-cmd-rss.git — 把它的 DATABASE_URL 指向同一个数据库，安装依赖，然后：python fetch_rss.py --add https://blog.example.com/feed.xml 和 python fetch_rss.py。首次真正运行会创建它的表并注册自身。',
        '检查 API 是否看到它：curl localhost:3000/connectors/providers 现在应列出 rss 及其展示清单。',
        '打开桌面应用，进入「个人资料」→「API 地址」，粘贴 http://localhost:3000，保存。创建一个账户，然后添加一个 flux — 连接器运行过后 rss 条目就会出现。',
        '为连接器排期让它持续运行：一条 cron、一个 systemd timer、一个 GitHub Actions 计划，或者生成器搭起来的 Ofelia 容器。',
      ],
      note: 'API 从不启动连接器。它们是各自按计划运行的独立程序；与 API 唯一共享的是数据库。',
    },
    requirements: {
      heading: '你需要什么',
      items: [
        '下方列表中的一种数据库，从 API 运行处可以访问到。',
        'Docker，或者不用容器的话 Node.js 22 或更高。',
        '可选一个 Cloudflare 账户，用于像参考实例那样部署到 Workers。',
      ],
    },
    databases: {
      heading: '选哪种数据库',
      intro:
        'API 并不直接说 SQL。它调用一份存储契约，每种引擎由一个适配器来实现，而 DATABASE_URL 的协议头决定用哪个适配器。开箱即用的引擎有四种：',
      columnEngine: '引擎',
      columnScheme: 'URL 协议头',
      columnDriver: '要安装的驱动',
      note: '每种引擎都通过同一套一致性测试 — 同样的行为，在 CI 中针对真实的 PostgreSQL、MySQL、SQLite 和 MongoDB 验证。这使选择可逆：表、集合和列在各处名字都一样，于是一个 provider 只描述一次，只有方言在变。',
      workersNote:
        '有一个例外，而且不怪我们：Cloudflare Workers 只打开 PostgreSQL 所用的那种连接。MySQL、SQLite 和 MongoDB 的驱动需要 Node — Docker 或纯 Node.js，不是 Workers。',
    },
    env: {
      heading: '配置',
      columnVariable: '变量',
      columnRequired: '必填',
      columnDescription: '说明',
      yes: '是',
      no: '否',
      descriptions: [
        '协议头决定引擎：postgres://、mysql://、sqlite:// 或 mongodb://。Node 和 Docker 构建也接受单独的 DB_HOST、DB_PORT、DB_NAME、DB_USER 和 DB_PASSWORD，用于 PostgreSQL。',
        '用于签名鉴权 token 的随机密钥。用 openssl rand -hex 32 生成。在实例的整个生命周期内必须保持不变 — 改了它，所有现有 token 都会失效。',
        '你的 Web 部署的公开 URL。仅用作 OAuth 回跳目标；若不启用 Google 或 GitHub 登录，可以省略。',
        '启用「用 Google 登录」。留空则禁用。',
        '启用「用 GitHub 登录」。留空则禁用。',
      ],
      note: '没有管理员用户名或密码变量。旧的 API_USERNAME / API_PASSWORD 组合已不存在：管理员是数据库里的行，第一个用 npm run create-admin 创建。普通用户的邮箱＋密码登录始终可用，无论你如何设置 OAuth 变量。',
    },
    deploy: {
      heading: '部署 API',
      tabs: ['Docker Compose', 'Cloudflare Workers', '纯 Node.js'],
      dockerIntro: '最短路径：克隆、填 .env、运行。',
      dockerNote:
        'compose 文件把结构挂进 Postgres 的 init 目录，因此在卷首次初始化时创建核心表。API 随后在端口 3000 监听。接着创建超级管理员 — 见下文。',
      workersIntro: '参考实例所运行的。',
      workersNote:
        '你的数据库必须能从 Cloudflare 的网络访问到 — 带池化公网连接串的托管服务商是常见答案。Workers 无法访问你家庭网络里的数据库，也无法运行 create-admin 脚本：请从你自己的机器上对着数据库创建超级管理员。',
      nodeIntro: '没有编排，只有构建好的服务器。',
      nodeNote:
        '或者你自己构建随附的 Dockerfile，如果你更想不用 Compose 跑一个容器。构建好的镜像也带 create-admin 脚本。',
    },
    schema: {
      heading: '创建表，以及第一个管理员',
      applyIntro:
        '如果你不依赖 Compose 的自动 init，就自己手动应用一次结构。每种引擎一个文件，各文件的表名和列名都一样：',
      applyNote:
        'SQL 文件只做新增 — CREATE TABLE IF NOT EXISTS、ADD COLUMN IF NOT EXISTS — 所以任何时候都可重复执行，包括对着已有数据的数据库。',
      engineNotes: [
        '参考结构。版本 14 或更高。',
        'MySQL 8 或 MariaDB 10.2 及以上：API 用窗口函数对内容排序。',
        '无需托管 — API 旁边的一个文件。适合个人实例，不适合被多处应用同时访问的实例。',
        '没有要应用的结构：MongoDB 在首次写入时创建集合。只有索引重要，API 连接时会自己创建 — 上面的命令只是提前做而已。',
      ],
      adminIntro:
        '管理员是 admin 表里的行；没有默认账户。用命令行创建第一个 — 始终是超级管理员。它先应用结构，再插入这一行：',
      userIntro: '普通用户账户从各应用的注册表单创建。要不用表单造一个用于测试：',
      verifyIntro: '然后检查 API 是否响应：',
      verifyNote:
        '这里 provider 列表为空是预期的回应：还没有任何东西收集过。那是 provider 指南的事。',
    },
    auth: {
      heading: '用户与认证',
      intro: '人们如何在你的实例上获得账户，以及如何开启用 Google 或 GitHub 登录。',
      registration: {
        heading: '注册模式',
        body: 'REGISTRATION_MODE 决定公开注册的行为。open（默认）：账户被创建，本人当即登录 —— 就是当前行为。approval：注册被搁置。POST /auth/register 返回 202 且没有 token，OAuth 注册带 ?error=pending_approval 返回，等待中的邮箱尝试登录返回 403。管理员随后在 /admin/users →「Comptes en attente」处理队列。管理员创建的账户始终是激活的，无论哪种模式；已验证邮箱已匹配到某个激活账户的 OAuth 注册也一样。',
      },
      pointing: {
        heading: '应用在哪里登录',
        body: '桌面和移动：登录界面的「服务器」行，或登录后进入个人资料 →「API 地址」。「恢复默认」随时回到内置那个。',
      },
      oauth: {
        heading: '用 Google 和 GitHub 登录',
        intro: '可选。每个提供方都需要一个你自己的 OAuth 应用，以及 API 上的四个环境变量：',
        steps: [
          '创建一个 OAuth 应用 —— Google 在 console.cloud.google.com/apis/credentials，GitHub 在 github.com/settings/developers。',
          '把它的回调（或重定向）URL 设为 https://<你的 API 源>/auth/oauth/<provider>/callback。两个提供方都允许 http://localhost 用于开发。',
          '把 client ID 和 secret 放进 API 上的 GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET（或 GITHUB_ 那一对）。',
          '把 UI_URL 设为你的 Web 部署源 —— 浏览器 OAuth 之后，API 会重定向到 UI_URL/api/auth/callback。桌面应用会自己拦截这个路径，所以任何非空的 UI_URL 对它都行；移动应用用自己的 stayup:// 深链，已在允许名单里。',
        ],
        note: '一个 GitHub OAuth 应用只允许恰好一个回调 URL，所以每个 API 源都需要单独的 GitHub 应用。脚本生成器在运行时询问这些凭据，并直接写进 docker-compose.yml，绝不写进脚本。',
      },
    },

    pointing: {
      heading: '把一个应用指向你的实例',
      items: [
        'Web：在你的部署上设置 STAYUP_API_URL — 或者不设，让每位访客从个人资料里覆盖它，按浏览器保存。',
        '桌面和移动：个人资料，然后「API 地址」，粘贴你的，保存。「恢复默认」随时回到内置那个。',
        '管理后台 Web 界面就是同一个 Web 应用：把它的 STAYUP_API_URL 指向你的 API，打开 /admin。',
      ],
      note: '其他一切都不变。provider 列表、数据和渲染都跟随所配置的实例 — 包括对应用不认识其名字的 provider 的朴素回退。',
    },
    troubleshooting: {
      heading: '当有什么不对劲',
      items: [
        {
          symptom: 'provider 列表返回为空。',
          cause: '在全新数据库上是预期的：还没有 provider 对它运行过。运行一个再看。',
        },
        {
          symptom: '应用不显示内容，但 provider 列表已填充。',
          cause:
            'provider 在运行，但还没人关注任何东西，或它们追踪的来源没有新内容。从应用里添加一个来源。',
        },
        {
          symptom: '某个 provider 显示为朴素文本卡片，有时是原始 JSON。',
          cause:
            '没有可用的展示模板。provider 没有写 provider_registry.template，或它的 content 列是 JSON 字符串却没有模板来解释。见 provider 指南。',
        },
        {
          symptom: '添加一个 flux 时提示「请求已发送」而不是订阅。',
          cause:
            '那个 provider 处于手动审批模式。管理员在 /admin/flux-requests 批准或拒绝。如果这不是你想要的，在 /admin/providers 切换模式。',
        },
        {
          symptom: 'create-admin 说该邮箱已被占用。',
          cause: '超级管理员已经存在。后续管理员从管理后台 Web 界面创建，而不是命令行。',
        },
        {
          symptom: '登录能用，但其他每个调用都被拒。',
          cause: '签发你 token 的实例与响应的实例签名密钥不同。token 不能跨实例。',
        },
      ],
    },
  },
  admin: {
    meta: {
      title: 'StayUp — 管理',
      description:
        '从浏览器运维一个 StayUp 实例：管理员、按 provider 的 flux 审批、请求队列、用户和 flux。',
    },
    eyebrow: '管理',
    title: '运维你的实例',
    lede: 'API 一旦跑起来，管理后台 Web 界面就是你在浏览器里运维实例的地方：谁能添加什么、哪些请求待处理、哪些用户关注哪些 flux。',
    webUi: {
      heading: '管理后台 Web 界面',
      body: '它就是与公共站点相同的 Web 应用，在 /admin 打开，指向你的 API。它是可选的 — 它做的每件事背后都有一条 API 路由 — 但它是运维实例的实用方式。像 Web 应用的任何其他副本一样部署它，把 STAYUP_API_URL 设为你的 API，在 /admin/login 登录。',
      note: '管理会话是与用户会话相互独立的 cookie。同一浏览器可同时持有两者，互不注销。',
    },
    roles: {
      heading: '超级管理员与管理员',
      intro:
        '两个级别。第一个管理员始终是超级管理员，由命令行创建（npm run create-admin）。之后的每个管理员都从 UI 创建，是普通管理员。',
      columnRole: '角色',
      columnCan: '可以做',
      rows: [
        {
          role: '超级管理员',
          can: '普通管理员能做的一切，外加：创建、编辑和删除其他管理员。不能从 UI 删除，也不能删除自己。',
        },
        {
          role: '管理员',
          can: '运维工作：用户、flux、provider 审批模式、请求队列。看不到也碰不到管理员列表。可以改自己的密码。',
        },
      ],
      note: '管理员不是用户账户。他们有自己的表、自己的登录，没有自己的 feed。',
    },
    managingAdmins: {
      heading: '管理管理员',
      body: '仅超级管理员，在 /admin/admins：',
      steps: [
        '用邮箱、名字和密码创建一个管理员。它是普通管理员 — 不能管理其他管理员。',
        '编辑一个管理员的名字、邮箱或密码。',
        '删除一个管理员。超级管理员的行和你自己的行是锁定的。',
      ],
      note: '需要改自己密码的普通管理员在 /admin/settings 里用当前密码来改。',
    },
    fluxApproval: {
      heading: '按 provider 的 flux 审批',
      intro:
        '当用户添加一个尚不存在的 flux，会发生什么取决于该 provider 的审批模式。在 /admin/providers 按 provider 设置。',
      autoBody:
        'auto — 默认。来源被创建，用户立即订阅。适合任何 URL 都行的 provider（RSS、changelog）。',
      manualBody:
        'manual — 添加一个未知 flux 会改为创建一个请求（应用显示「请求已发送」）。在管理员批准前什么都不创建。适合运行一个来源有成本的 provider，比如抓取。',
      note: '订阅一个已存在的 flux 从不需要审批 — 审批只关乎把一个全新来源引入实例。',
    },
    usersAndFluxes: {
      heading: '用户和 flux',
      body: '控制台的其余部分是浏览和整理：',
      items: [
        '/admin/users — 每个账户，以及它关注的 flux。代表某人添加或移除一个订阅。',
        '/admin/repositories — 所有 provider 的每个来源，以及它的 config。直接创建一个（对给手动 provider 铺垫很有用），或退役一个。',
        '/admin/flux-requests — 待处理队列。批准会创建或复用来源并让请求者订阅；拒绝把它标记为已拒绝。两者都是最终的。',
      ],
    },
    addingFlux: {
      heading: '用户如何从任意应用添加一个 flux',
      intro: '每个 provider 都是同一套流程 — 应用里不再有按 provider 的特殊处理：',
      steps: [
        '选择一个 provider。',
        '应用展示该 provider 已经追踪、而你还没关注的那些 flux。轻点一下即订阅 — 从不需审批。',
        '或者切换到「新增一个」。输入框由该 provider 的 form 描述符驱动：它的标签、占位符，以及它期望的形态。',
        '提交。如果 provider 是 auto，你就被订阅了。如果是 manual，应用显示「请求已发送」，由管理员接手。',
      ],
      note: '所以一个 provider 应当在其模板里带上一个 form 描述符 — 它把一个光秃秃的文本框变成「粘贴一个 YouTube handle」或「粘贴一个订阅源 URL」。',
    },
  },
  generate: {
    meta: {
      title: 'StayUp — 生成自托管配置',
      description: '选择数据库和所需的连接器，下载一个 bash 脚本来搭建你自己的 StayUp 实例。',
    },
    eyebrow: '安装',
    title: '生成你的安装脚本',
    lede: '选择数据库和所需的连接器。你会得到一个 bash 脚本，它会克隆仓库、写入 Docker 配置、创建超级管理员并启动一切。',
    how: {
      heading: '脚本做什么',
      items: [
        '克隆 API、所选连接器，以及（如果保留）管理后台 Web 界面。',
        '写出一个包含 PostgreSQL、API、每个连接器一个容器以及 Ofelia 调度器的 docker-compose.yml。',
        '询问超级管理员账户以及每个连接器的运行频率。',
        '应用数据库结构、创建超级管理员，并让每个连接器先运行一次以完成注册。',
        '启动 API、界面和调度器。',
      ],
      note: '一切都在你的机器上通过 Docker 运行。不会发送到任何地方——页面在你的浏览器中构建脚本。',
    },
    requirements: {
      heading: '运行之前',
      items: [
        'Docker 和 Docker Compose v2（`docker compose`）。',
        'git。',
        'Linux 或 macOS。在 Windows 上请在 WSL 中运行脚本。',
      ],
    },
    form: {
      database: '数据库',
      comingSoon: '即将',
      connectors: '官方连接器',
      customConnectors: '你的连接器',
      customHint:
        '任意包含根 Dockerfile 的 git 仓库，其 ENTRYPOINT 运行采集器一次、读取 DATABASE_URL 并在 provider_registry 中注册自身。参见 provider 指南。',
      customConnectorAdd: '添加连接器',
      customUrlPlaceholder: 'https://github.com/you/your-connector.git',
      customNamePlaceholder: '名称（可选）',
      remove: '移除',
      adminUi: '包含管理后台 Web 界面',
      adminUiHint: '管理 provider、审批 flux 请求、添加管理员。',
      registration: '注册',
      registrationOpen: '开放',
      registrationOpenHint: '任何能访问 API 的人都可以立即创建账户。',
      registrationApproval: '需审批',
      registrationApprovalHint: '新账户会排队等待，直到管理员激活。',
      signInMethods: '登录方式',
      emailPassword: '邮箱 + 密码',
      oauthHint: '脚本会在运行时询问 OAuth 的 client ID 和 secret —— 它们不会写入脚本。',
      advanced: '高级',
      projectDir: '项目目录',
      apiPort: 'API 端口',
      uiPort: 'UI 端口',
      dbPort: '数据库端口',
      preview: 'stayup-setup.sh',
      download: '下载',
      copy: '复制',
      copied: '已复制',
      invalid: '无法生成',
    },
    run: {
      heading: '运行',
      intro: '保存文件，然后：',
      note: '首次运行会构建每个镜像，可能需要几分钟。',
    },
    after: {
      heading: '安装之后',
      items: [
        'API 文档：http://localhost:3000/docs —— 管理界面：http://localhost:3001/admin。',
        '在桌面或移动应用中，将 API 地址设为 http://localhost:3000，然后创建账户。',
        '在应用中添加订阅源——每个 provider 都提供已有 flux 列表和新增表单。',
        '全部移除：docker compose --profile connectors down -v（会删除数据库）。',
      ],
      note: '调度器挂载 Docker socket 以按计划启动连接器——在宿主机上等同于 root，对本地开发实例可以接受。',
    },
  },
  providers: {
    meta: {
      title: 'StayUp — Providers',
      description: '编写一个把任意外部来源变成 StayUp 内容的程序。',
    },
    eyebrow: 'Providers',
    title: '接入一个新来源',
    lede: '一个 provider 是一个去获取某一类来源并保存所得的程序。它是你为扩展 StayUp 而编写的唯一东西 — API 和三个应用会自己接手。',
    what: {
      heading: 'provider 究竟是什么',
      body: '不是插件，不是要注册的模块：一个普通程序，任何语言，按计划运行。它读取分配给它的来源清单，逐个获取，保留新的，写进数据库。API 会自己接手，三个应用会展示它 — 任何地方都不改一行代码。',
      note: 'provider 从不调用 StayUp API。它与数据库通信，且只与数据库。',
      diagram: {
        title: 'provider，一步一步',
        sources: '它的来源，从数据库读取',
        sourcesItems: '这个 provider 被要求追踪的播客订阅源',
        fetch: '获取每个订阅源',
        compare: '只保留之前没有的',
        store: '写进数据库',
        exposed: 'API 暴露它，应用展示它',
      },
      steps: {
        heading: '每次运行时',
        items: [
          '读取分配给你的来源。',
          '从外部世界逐个获取。',
          '与上次保存的比较，只保留新的。',
          '把新条目写进数据库。',
          '移除已过期的，遇到失败时记录而不是崩在上面。',
          '重新声明你的展示名和模板，好让一个全新数据库在首次运行时认识你。',
        ],
      },
    },
    access: {
      heading: '开始之前：它往哪写？',
      body: 'provider 需要对其所供应实例的数据库有写权限。公共实例上你没有，所以实际上你自己的 provider 与你自己的实例配套。写一个不需要安装指南里的任何东西；运行一个需要一个你能写入的数据库。',
      cta: '安装指南',
    },
    existing: {
      heading: '可读的实例',
      body: '先从 stayup-cmd-template 开始：一个供复制的裸骨架，标出了你要改动的三处地方。然后读那些真实的 — changelog、youtube、rss、scrap、github-trending — 这是参考实例恰好在运行的，并非 StayUp 所覆盖内容的定义。rss 是下面契约最短的真实示例；github-trending 是丰富展示模板的参考。如果合适，把其中任何一个指向你自己的数据库。',
      cta: '打开 stayup-cmd-template',
    },
    creating: {
      heading: '写你自己的',
      naming: {
        heading: '取个名字',
        intro:
          '短小、小写、可作标识符 — podcast、hackernews、reddit_thread。这一个字符串会原样用在多个地方：',
        columnWhere: '在哪',
        columnExample: '对于「podcast」',
        rows: [
          '你的数据表',
          '属于你的来源',
          '注册表里你的那一行',
          '添加 flux 时应用发送的 provider 字段',
        ],
        note: '无需事先预留：名字就是你建表时用的那个。两个 provider 只有选了同一个才会冲突。',
      },
      shape: {
        heading: '你存什么',
        body: '每个找到的条目一行。内容本身可以是纯文本或 JSON — 你定。没有展示模板时应用显示一张朴素卡片：内容开头、日期、你的展示名。能用，只是视觉朴素，而且如果你的 content 列是 JSON，就会显示原始 JSON。模板能修好这一点，就是下一节。',
      },
      schedule: {
        heading: '按计划运行它',
        body: '照抄任意现有采集器：一个根目录 Dockerfile，其 ENTRYPOINT 运行脚本一次，再加一个把数据库 URL 放进环境来启动它的 job。不强求某种 CI — 一个 systemd timer、纯 cron，或生成器的 Ofelia 容器都一样。',
      },
    },
    templates: {
      heading: '展示模板',
      body: '模板是你的 provider 存放在 provider_registry.template 里的 JSON 清单，与它的展示名在同一次 upsert 里。API 通过 GET /connectors/providers 原样中转；每个应用都有一个引擎读取它并渲染你的行 — 一种列表布局，以及七种模式（文本、html、媒体、音频、画廊、表格、链接列表）之一的阅读面板。应用里没有任何代码知道你的 provider 名。',
      fallbackNote:
        '没有模板的 provider（列为 NULL、JSON 不可读、或 version 无法识别）照样能用 — 应用回退到朴素卡片。一旦你的内容不只是一行短文本，就强烈建议用模板。',
      cta: '模板完整参考',
    },
    form: {
      heading: 'form 描述符',
      body: '在模板里，一个小小的 form 块告诉各应用，你的 provider 的「添加一个新 flux」输入框应该长什么样。没有它，用户得到一个光秃秃的文本框；有它，得到一个会校验并替他构造来源 URL 的带标签字段。',
      fields: [
        {
          field: 'label · placeholder',
          meaning: '字段说什么，以及作为提示显示什么。',
        },
        {
          field: 'urlTemplate',
          meaning:
            '如 https://www.youtube.com/@{value} — {value} 是用户输入的内容。若值已是 http(s) URL 则跳过。',
        },
        {
          field: 'pattern',
          meaning: '变换后的输入必须匹配的正则，提交前在客户端校验。',
        },
        {
          field: 'transform',
          meaning:
            'trim、去掉已知前缀/后缀，或提取一个捕获组 — 好让粘贴的完整 URL 和光秃秃的 handle 最终一致。',
        },
      ],
      note: '应用把构造好的 URL 作为来源保存；你的采集器像读任何其他来源一样，从 repository 行里把它读回来。',
    },
    fluxApproval: {
      heading: '审批模式',
      body: '每个 provider 在注册表里都有一列 flux_approval：auto（默认）或 manual。auto 在用户添加新 flux 时立即订阅；manual 把它变成一个管理员必须批准的请求。provider 可以在 upsert 里播下自己的默认值；管理员在 /admin/providers 按实例覆盖它。抓取以 manual 出厂是有原因的 — 在那里运行一个来源有成本。',
      note: '这只管把一个全新来源引进来。订阅一个已存在的来源从不需审批。',
    },
    contract: {
      heading: '技术契约',
      lede: '参考资料。你写 provider 时需要它，理解 StayUp 时不需要。',
      diagramTitle: '你的脚本可以碰什么',
      yourScript: '你的 provider',
      readOnly: '只读',
      readWrite: '读写 — 完全是你的',
      upsertOne: '一行：你的',
      writeOnError: '出错时写',
      repositoryDesc: '要追踪的来源',
      connectorDesc: '你收集的内容',
      registryDesc: '你的展示名 + 模板',
      logDesc: '失败，而不是崩溃',
      warning:
        '绝不要写进另一个 provider 的表，也不要写进 user、session、account、admin、subscription 或 flux_request 表：它们属于 API 和 Web 应用。',
      tablesHeading: '这四张表',
      tablesIntro:
        '你在每次执行开头运行的 init 步骤，必须确保这些存在。每条语句都是幂等的 — 每次都可安全运行，即使另一个 provider 或 API 先创建了共享的那些也安全。',
      engineIntro:
        '选择你的实例所运行的引擎。名字在各标签页之间从不变 — 只有方言和类型变，这就是为什么为一种引擎写的 provider 对另一种读起来一样。',
      engineNotes: [
        '参考方言，以及公共实例所运行的。',
        '相同的表，MySQL 的类型。URL 必须放进可索引的 VARCHAR，因此长度写明。',
        '没有服务器：你的 provider 和 API 打开同一个文件。日期和 JSON 以文本存储，API 读取时再解析回来。',
        '用集合而非表，且没有结构要声明 — 但有两条规则。一个 repository 文档带一个数值 _id，取自 counters 集合，因为契约用一个数字来指代一个来源。而且什么都不级联：你写的，由你清理。',
      ],
      repositoryTitle: 'repository — 共享，你多半只读它',
      repositoryBody:
        '一行就是一样要追踪的东西：一个播客订阅源、一个 subreddit、你的 provider 所称的来源。type 列必须等于你的 provider 名。config 列是只有你的脚本定义和解释的自由 JSON。',
      connectorTitle: 'connector_<name> — 完全是你的',
      connectorBody: '可选列，存在时使用，但从不必需：',
      optionalDescriptions: [
        '内容自身的时间戳，按「最新」排序时优先于执行时间。',
        '在丰富渲染旁显示的一个短标签 — 一个版本标签、一个视频 id，等等。',
      ],
      registryTitle: 'provider_registry — 共享，为你的一行',
      registryBody:
        'sort order 只影响 provider 在各应用里出现的顺序；任何整数都行。template 列是你的展示清单（前几节）；留空 NULL 你的 provider 照样能用，只是朴素卡片。flux_approval 是运维者的设置 — 别为它跟管理员争，但你可以播下一个合理的默认值。整行都省掉，API 会回退到你名字首字母大写的版本。',
      logTitle: 'log — 共享，可选但建议',
      logBody: '当一个来源失败时写这里而不是崩溃，然后继续其他的。',
      addingSources: {
        heading: '把来源弄进来',
        body: '两种方式。支持一个 --add 标志，插入一行然后退出 — 便于直接对着数据库铺垫。另一种，也是最终用户真正走的，是从一个应用里添加一个来源，它会 POST 到 /providers/<name>/fluxes；provider 字段必须等于你的表后缀。',
      },
      checklist: {
        heading: '在你说完成之前',
        items: [
          '至少带一个 id、一个来源引用、内容、一个时间戳和一个成功标志来创建。',
          '每次运行都 upsert 该行，带上你的展示名和（建议）你的模板。',
          '用你的 provider 名读取来源。',
          '修剪旧条目 — 或把不做保留这件事写明。',
          '按来源的失败写在这里，而不是让本次运行崩掉。',
          '运行一次后列出你的 provider。',
          '返回你的数据。',
        ],
      },
    },
  },
}
