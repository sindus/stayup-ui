import type { DocContent } from './en'

export const ja: DocContent = {
  meta: {
    title: 'StayUp — セルフホスティングとプロバイダー開発',
    description:
      '自分の stayup-api インスタンスを動かし、アプリのコードに触れずに StayUp へ差し込めるプロバイダーを書く。',
  },
  nav: {
    onThisPage: 'このページの内容',
    backToSite: 'サイトに戻る',
  },
  eyebrow: 'ドキュメント',
  title: 'StayUp のセルフホスティングとプロバイダー開発',
  lede: '対象は2つ、ページは1つ。自分のデータで stayup-api インスタンスを動かすこと、そして4つのアプリを1行も触らずに差し込める新しいプロバイダーを書くことです。',

  overview: {
    heading: '全体の組み合わせ方',
    points: [
      'stayup-api は、単一の PostgreSQL データベースの上に載る薄いステートレスな HTTP レイヤーです。プロバイダー名をコードに埋め込むことは一切ありません。リクエストのたびに Postgres へ「いまどの connector_* テーブルがあり、それぞれどんな表示名を登録したか」を尋ね、その答えがそのままプロバイダー一覧になります。',
      'プロバイダーは独立したスクリプト（今日は Python、明日は何でも）で、テーブルをちょうど1つ所有し、定期的に行を書き込みます。stayup-api とは決して通信せず、同じ Postgres データベースと直接やり取りします。',
      '3つのクライアントアプリも API の URL を埋め込みません。それぞれ既定値を持ちますが、利用者はプロフィール画面から任意の別の stayup-api インスタンスへ向け直せます。別のデータベース、別のプロバイダー、別のデータです。',
    ],
    note: 'インスタンス同士は連携しません。セルフホストすると、少なくとも1つのコレクターを走らせるまでは、空のデータベースとゼロ個のプロバイダーから始まります。リファレンスのインスタンスとは何も共有されません。',
    diagram: {
      title: '全体アーキテクチャ',
      providers: 'プロバイダー — ソース種別ごとに1つの独立したスクリプト',
      yourProvider: 'あなたの新しいプロバイダー…',
      writesCron: 'スケジュールに従って書き込む',
      database: 'PostgreSQL',
      dbShared: '共有',
      dbPerProvider: 'プロバイダーごとに1つ',
      readsWrites: 'SQL で読み書き',
      api: 'stayup-api',
      apiSubtitle: 'ステートレス — リクエスト時に Postgres からプロバイダーを検出',
      http: 'HTTP、URL は設定可能',
      clients: 'クライアントアプリ',
      endUser: 'エンドユーザー',
      note: 'どのクライアントもどのインスタンスへ、つまりどのデータベースへでも向けられます。リファレンスのインスタンスは1つありますが、セルフホスティングはそれとは切り離された、同じ形の並行スタックです。',
    },
  },

  part1: {
    eyebrow: 'パート1',
    heading: 'stayup-api をセルフホストする',
    requirements: {
      heading: '必要なもの',
      items: [
        'API を動かす場所から到達できる PostgreSQL（14 以降）。',
        'Docker を使わない場合は Node.js 22 以降。',
        'リファレンスのインスタンスと同じく Workers へデプロイしたい場合は Cloudflare アカウント（任意）。',
      ],
    },
    env: {
      heading: '環境変数',
      columnVariable: '変数',
      columnRequired: '必須',
      columnDescription: '説明',
      yes: 'はい',
      no: 'いいえ',
      descriptions: [
        'postgres://user:pass@host:port/dbname。Node と Docker のビルドは DB_HOST、DB_PORT、DB_NAME、DB_USER、DB_PASSWORD を個別に指定する形も受け付けます。',
        '認証トークンの署名に使うランダムなシークレット。openssl rand -hex 32 で生成できます。',
        '唯一の管理用サービスアカウント。データベースに管理者の行は存在せず、この資格情報でサインインした人が管理者ロールを得ます。一般ユーザーはアプリから登録します。',
        'stayup-ui デプロイの公開 URL。OAuth のリダイレクト先として使われます。',
        '「Google でサインイン」を有効にします。無効にするには空のままにしてください。',
        '「GitHub でサインイン」を有効にします。無効にするには空のままにしてください。',
      ],
      note: 'メールアドレスとパスワードでのサインインは、OAuth 変数をどう設定しても常に使えます。',
    },
    deploy: {
      heading: 'デプロイ方法',
      tabs: ['Docker Compose', 'Cloudflare Workers', '素の Node.js'],
      dockerIntro: '最短経路。クローンして .env を埋め、起動するだけです。',
      dockerNote:
        'docker-compose.yml がスキーマを Postgres の初期化ディレクトリにマウントするため、ボリュームの初回初期化時にコアとなるテーブルが作成されます。その後 API はポート 3000 で待ち受けます。',
      workersIntro: 'リファレンスのデプロイと同じ構成です。',
      workersNote:
        'Postgres は Cloudflare のネットワークから到達できる必要があります。プール済みの公開接続文字列を提供するマネージドサービスが一般的な答えです。Workers から自宅ネットワーク内のデータベースには届きません。',
      nodeIntro: 'オーケストレーションなし、ビルド済みサーバーだけです。',
      nodeNote:
        'Compose なしでコンテナを動かしたい場合は、同梱の Dockerfile を自分でビルドしてください。',
    },
    schema: {
      heading: 'スキーマの適用と最初のユーザー',
      applyIntro: 'Compose の自動初期化に頼らない場合は、一度自分で適用します。',
      applyNote:
        '追加のみの内容（CREATE TABLE IF NOT EXISTS だけ）なので、いつでも安全に再実行できます。すでにデータが入っているデータベースに対しても同様です。',
      userIntro:
        '管理者アクセスは上記の API_USERNAME と API_PASSWORD そのもので、作成すべきものはありません。登録フォームを経ずに一般アカウントを作るには次のようにします。',
      verifyIntro: '次に、応答するか確認します。',
      verifyNote:
        'この時点でプロバイダー一覧が空なのは想定どおりです。このデータベースに対してまだどのプロバイダーも実行されていません。それがパート2の話題です。',
    },
    pointing: {
      heading: 'アプリを自分のインスタンスに向ける',
      items: [
        'stayup-ui：デプロイ側で STAYUP_API_URL を設定します。あるいはそのままにして、各訪問者にプロフィール画面から上書きしてもらいます（ブラウザごとに保存されます）。',
        'stayup-desktop と stayup-mobile：プロフィール →「API の URL」→ 自分のインスタンスの URL を貼り付けて保存。「既定値に戻す」でいつでも組み込みの URL に戻せます。',
      ],
      diagram: {
        title: 'インスタンスを切り替える',
        instanceA: 'stayup-api — リファレンスのインスタンス',
        instanceB: 'stayup-api — あなたのインスタンス',
        providersA: 'プロバイダー：changelog、youtube、rss、scrap',
        providersB: 'プロバイダー：podcast、hackernews',
        client: '同じアプリ、設定はひとつ',
        connected: '現在接続中',
        switch: 'こちらに切り替える',
        note: 'コード変更はゼロです。プロバイダー一覧もデータも表示も、設定されたインスタンスに従います。アプリが名前を知らないプロバイダー向けの汎用表示も含めてです。',
      },
    },
  },

  part2: {
    eyebrow: 'パート2',
    heading: '新しいプロバイダーを作る',
    intro:
      'プロバイダーとは、新しいコンテンツを表す行を自分専用の Postgres テーブルへ定期的に書き込むスクリプトのことです。下の契約さえ守っていれば、stayup-api と3つのアプリが自動的に取り込みます。ほかのどこにもコード変更は要りません。既存の4つのコレクターは完全な参考実装です。RSS のものが最も短いので、このページと並べて読んでください。',
    contract: {
      heading: 'プロバイダー契約',
      diagramTitle: 'スクリプトが触ってよいもの',
      yourScript: 'あなたのプロバイダースクリプト',
      readOnly: '読み取りのみ',
      readWrite: '読み書き — 完全な所有権',
      upsertOne: 'ちょうど1行を upsert：あなた自身の行',
      writeOnError: 'エラー時に書き込む',
      repositoryDesc: '共有 — 追跡対象のソース',
      connectorDesc: 'あなたのもの — 完全にあなたが作成し所有する',
      registryDesc: '共有 — あなたの表示名',
      logDesc: '共有・任意 — クラッシュさせる代わりにここへ書く',
      warning:
        '他のプロバイダーのテーブルや、user、session、account、user_repository には決して書き込まないでください。これらは stayup-api と stayup-ui のものです。',
    },
    naming: {
      heading: '命名規則',
      intro:
        'snake_case の識別子として使える、短い小文字の名前を選びます（podcast、hackernews、reddit_thread など）。この1つの文字列が、そのまま3か所で使われます。',
      columnWhere: '場所',
      columnExample: '「podcast」の場合の例',
      rows: ['データテーブル', 'repository.type — どのソースがあなたのものか', '表示名'],
      note: '事前に名前を予約する登録簿はありません。名前とは、単にテーブルを作るときに付けた名前のことです。2つのプロバイダーが衝突するのは、同じテーブル名を選んだときだけです。',
    },
    tables: {
      heading: '関係する4つのテーブル',
      intro:
        '毎回の実行の冒頭で走る初期化処理で、これらの存在を保証してください。すべての文は冪等なので、毎回実行しても安全ですし、共有テーブルを他のプロバイダーが先に作っていても問題ありません。',
      repositoryTitle: 'repository — 共有、あなたは主に読むだけ',
      repositoryDesc:
        '1行が追跡対象の1つを表します。ポッドキャストのフィード、subreddit、あなたのプロバイダーが「ソース」と呼ぶもの何でも構いません。type はプロバイダー名と一致させます。config は自由な JSON で、あなたのスクリプトだけが定義し解釈します。',
      connectorTitle: 'connector_<name> — 完全にあなたのもの',
      connectorDesc: '任意の列。あれば使われますが、必須ではありません。',
      optionalDescriptions: [
        'コンテンツ自身のタイムスタンプ。新しさで並べる際、executed_at より優先されます。',
        'リッチ表示の横に出る短いラベル。リリースタグや動画 ID などです。',
      ],
      registryTitle: 'provider_registry — 共有、あなたの行は1つ',
      registryDesc:
        'sort_order はアプリ内でのプロバイダーの並び順にのみ影響します。任意の整数で構いません（既存の4つは 10、20、30、40 を使っています）。このテーブルを丸ごと省いてもプロバイダーは動きます。API が名前の先頭を大文字にしたものにフォールバックします。',
      logTitle: 'log — 共有、任意だが推奨',
      logDesc: '1つのソースが失敗したときはクラッシュせずここに書き、残りの処理を続けてください。',
    },
    eachRun: {
      heading: '実行ごとにスクリプトがすること',
      steps: [
        '接続し、上記の冪等なスキーマ処理を実行する。',
        'repository から、自分のプロバイダー名で絞り込んだソース一覧を読む。',
        'ソースごとに外部サービスへ問い合わせ、保存済みの内容（通常はそのソースの直近の成功行）と比べ、新しいものだけを挿入する。',
        'config.retention_days、あるいは自分で定義した設定キーに従って古い行を削除する。',
        'ソース単位の失敗では log に書いて次へ進み、実行全体を中断しない。',
      ],
      addFlag:
        'repository の行を upsert して終了する --add <url> フラグを用意してください。データベースに直接ソースを登録する手段になります。もう一方の道 — 実際に利用者が使う道 — は API 経由で、provider はテーブルの接尾辞と一致させる必要があります。',
    },
    conventions: {
      heading: 'コンテンツの慣習と、汎用表示についての但し書き',
      body: 'content は素のテキストでも JSON 文字列でも構いません。既存のプロバイダーは YouTube と RSS で小さな JSON を使い、アプリがタイトルやサムネイルを表示できるようにしています。新しいプロバイダーには自分の形に合った表示がないため、3つのアプリは汎用カードとして表示します。content の先頭部分、日付、あなたの表示名です。機能としては十分で、見た目が素朴なだけです。リッチ表示は別の任意の後続作業で、各アプリにあなたのプロバイダー名に紐づくコンポーネントを誰かが追加します。サーバー側の契約はそれを要求しません。',
    },
    schedule: {
      heading: 'スケジュール実行する',
      body: '既存のコレクターの型をそのまま真似てください。Dockerfile と、データベース URL をシークレットとして渡してスクリプトを実行する日次ワークフローです。向き先は API と同じ Postgres にします。GitHub Actions である必然性はありません。systemd タイマー、素の cron、別の CI でもまったく同じことができます。',
    },
    checklist: {
      heading: '完了とみなす前に',
      items: [
        '少なくとも id、repository_id、content、executed_at、success を持って作成されている。',
        '毎回の実行で行が upsert されている。',
        '自分のプロバイダー名でソースを読んでいる。',
        '古いエントリを削除している（保持機能がないなら、その旨を明記している）。',
        'ソース単位のエラーを、実行を落とす代わりにここへ記録している。',
        '1回実行したあと、自分のプロバイダーが一覧に出る。',
        '自分のデータが返ってくる。',
      ],
    },
  },
}
