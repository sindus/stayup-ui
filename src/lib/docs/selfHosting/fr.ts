import type { DocContent } from './en'

export const fr: DocContent = {
  meta: {
    title: 'StayUp — Auto-hébergement et création de providers',
    description:
      'Faire tourner sa propre instance stayup-api, et écrire un provider qui se branche sur StayUp sans toucher au code des apps.',
  },
  nav: {
    onThisPage: 'Sur cette page',
    backToSite: 'Retour au site',
  },
  eyebrow: 'Documentation',
  title: 'Auto-héberger StayUp et créer ses providers',
  lede: 'Deux publics, une page : faire tourner sa propre instance stayup-api sur ses propres données, et écrire un provider qui se branche sur StayUp sans toucher une ligne des quatre apps.',

  overview: {
    heading: 'Comment les pièces s’assemblent',
    points: [
      'stayup-api est une fine couche HTTP sans état au-dessus d’une seule base PostgreSQL. Elle ne code aucun nom de provider en dur. À chaque requête, elle demande à Postgres quelles tables connector_* existent à cet instant et quel nom affiché chacune a déclaré — cette réponse est la liste des providers.',
      'Un provider est un script indépendant (Python aujourd’hui, n’importe quoi demain) qui possède exactement une table et y écrit des lignes à intervalle régulier. Il ne parle jamais à stayup-api : il parle à la même base Postgres.',
      'Les trois apps clientes ne codent pas non plus d’URL d’API en dur. Chacune embarque une valeur par défaut, et chaque utilisateur peut la faire pointer vers n’importe quelle autre instance stayup-api depuis son profil — autre base, autres providers, autres données.',
    ],
    note: 'Les instances ne se coordonnent pas. En auto-hébergement, tu démarres avec une base vide et zéro provider, jusqu’à ce qu’au moins un collecteur tourne dessus. Rien n’est partagé avec l’instance de référence.',
    diagram: {
      title: 'Architecture générale',
      providers: 'Providers — scripts indépendants, un par type de source',
      yourProvider: 'ton nouveau provider…',
      writesCron: 'écrit, à intervalle régulier',
      database: 'PostgreSQL',
      dbShared: 'partagée',
      dbPerProvider: 'une par provider',
      readsWrites: 'lit et écrit, en SQL',
      api: 'stayup-api',
      apiSubtitle: 'sans état — découvre les providers dans Postgres au moment de la requête',
      http: 'HTTP, sur une URL configurable',
      clients: 'Apps clientes',
      endUser: 'utilisateur final',
      note: 'N’importe quel client peut pointer vers n’importe quelle instance, donc vers n’importe quelle base. Il existe une instance de référence ; l’auto-hébergement est une pile parallèle de même forme, déconnectée d’elle.',
    },
  },

  part1: {
    eyebrow: 'Partie 1',
    heading: 'Auto-héberger stayup-api',
    requirements: {
      heading: 'Prérequis',
      items: [
        'Une base PostgreSQL (14 ou plus) joignable depuis l’endroit où tourne l’API.',
        'Node.js 22 ou plus, si tu n’utilises pas Docker.',
        'Éventuellement un compte Cloudflare, si tu veux déployer sur Workers comme l’instance de référence.',
      ],
    },
    env: {
      heading: 'Variables d’environnement',
      columnVariable: 'Variable',
      columnRequired: 'Requise',
      columnDescription: 'Description',
      yes: 'oui',
      no: 'non',
      descriptions: [
        'postgres://user:pass@host:port/dbname. Les builds Node et Docker acceptent aussi DB_HOST, DB_PORT, DB_NAME, DB_USER et DB_PASSWORD séparément.',
        'Secret aléatoire qui signe les tokens d’authentification. À générer avec openssl rand -hex 32.',
        'L’unique compte de service admin. Il n’existe aucune ligne admin en base : celui qui se connecte avec ces identifiants obtient le rôle admin. Les utilisateurs normaux s’inscrivent depuis les apps.',
        'URL publique de ton déploiement stayup-ui. Sert de cible de redirection OAuth.',
        'Active « Se connecter avec Google ». Laisser vide pour désactiver.',
        'Active « Se connecter avec GitHub ». Laisser vide pour désactiver.',
      ],
      note: 'La connexion par e-mail et mot de passe fonctionne toujours, quoi que tu fasses des variables OAuth.',
    },
    deploy: {
      heading: 'Options de déploiement',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Node.js simple'],
      dockerIntro: 'Le chemin le plus court : cloner, remplir .env, lancer.',
      dockerNote:
        'docker-compose.yml monte le schéma dans le répertoire d’initialisation de Postgres : les tables de base sont donc créées à la première initialisation du volume. L’API écoute ensuite sur le port 3000.',
      workersIntro: 'Correspond au déploiement de référence.',
      workersNote:
        'Ta base Postgres doit être joignable depuis le réseau de Cloudflare — un hébergeur managé avec une chaîne de connexion publique et poolée est la réponse habituelle. Workers ne peut pas atteindre une base sur ton réseau local.',
      nodeIntro: 'Aucune orchestration, juste le serveur compilé.',
      nodeNote:
        'Ou construis toi-même le Dockerfile fourni, si tu préfères un conteneur sans Compose.',
    },
    schema: {
      heading: 'Appliquer le schéma, et créer son premier utilisateur',
      applyIntro:
        'Si tu ne comptes pas sur l’auto-initialisation de Compose, applique-le une fois :',
      applyNote:
        'Il est purement additif — uniquement des CREATE TABLE IF NOT EXISTS — donc rejouable à tout moment, y compris sur une base qui contient déjà des données.',
      userIntro:
        'L’accès admin, ce sont les API_USERNAME et API_PASSWORD ci-dessus : il n’y a rien à créer. Pour un compte normal, sans passer par un formulaire d’inscription :',
      verifyIntro: 'Vérifie ensuite que tout répond :',
      verifyNote:
        'Une liste de providers vide est la réponse attendue à ce stade : aucun provider n’a encore tourné sur cette base. C’est l’objet de la partie 2.',
    },
    pointing: {
      heading: 'Faire pointer une app vers ton instance',
      items: [
        'stayup-ui : définis STAYUP_API_URL sur ton déploiement — ou n’y touche pas et laisse chaque visiteur la remplacer depuis son profil, où elle est stockée par navigateur.',
        'stayup-desktop et stayup-mobile : Profil, puis « URL de l’API », colle l’URL de ton instance, enregistre. « Réinitialiser par défaut » revient à l’URL intégrée à tout moment.',
      ],
      diagram: {
        title: 'Changer d’instance',
        instanceA: 'stayup-api — instance de référence',
        instanceB: 'stayup-api — ton instance',
        providersA: 'providers : changelog, youtube, rss, scrap',
        providersB: 'providers : podcast, hackernews',
        client: 'Même app, un seul réglage',
        connected: 'connecté actuellement',
        switch: 'basculer vers celle-ci',
        note: 'Zéro changement de code. La liste des providers, les données et le rendu suivent tous l’instance configurée — y compris le rendu générique pour les providers que l’app ne connaît pas par leur nom.',
      },
    },
  },

  part2: {
    eyebrow: 'Partie 2',
    heading: 'Créer un nouveau provider',
    intro:
      'Un provider est n’importe quel script qui écrit périodiquement, dans sa propre table Postgres, des lignes décrivant du contenu nouveau. stayup-api et les trois apps le prennent en compte tout seuls — aucun changement de code ailleurs — tant qu’il respecte le contrat ci-dessous. Les quatre collecteurs existants sont des implémentations de référence complètes ; celui du RSS est le plus court, lis-le en parallèle de cette page.',
    contract: {
      heading: 'Le contrat de provider',
      diagramTitle: 'Ce que ton script a le droit de toucher',
      yourScript: 'Ton script de provider',
      readOnly: 'lecture seule',
      readWrite: 'lecture et écriture — propriété complète',
      upsertOne: 'upsert d’exactement une ligne : la tienne',
      writeOnError: 'écriture en cas d’erreur',
      repositoryDesc: 'partagée — les sources à suivre',
      connectorDesc: 'la tienne — créée et possédée entièrement par toi',
      registryDesc: 'partagée — ton nom affiché',
      logDesc: 'partagée, facultative — écris dedans plutôt que de planter',
      warning:
        'N’écris jamais dans la table d’un autre provider, ni dans user, session, account ou user_repository : elles appartiennent à stayup-api et stayup-ui.',
    },
    naming: {
      heading: 'Convention de nommage',
      intro:
        'Choisis un nom court en minuscules, utilisable tel quel comme identifiant snake_case — podcast, hackernews, reddit_thread. Cette seule chaîne est reprise mot pour mot à trois endroits :',
      columnWhere: 'Où',
      columnExample: 'Exemple, pour « podcast »',
      rows: [
        'Ta table de données',
        'repository.type — quelles sources sont les tiennes',
        'Ton nom affiché',
      ],
      note: 'Il n’existe aucun registre de noms à réserver à l’avance : le nom, c’est simplement celui sous lequel tu crées la table. Deux providers ne peuvent entrer en collision qu’en choisissant le même nom de table.',
    },
    tables: {
      heading: 'Les quatre tables concernées',
      intro:
        'Ton étape d’initialisation, exécutée au début de chaque run, doit garantir leur existence. Chaque instruction est idempotente — rejouable à chaque fois sans risque, y compris si un autre provider a créé les tables partagées avant toi.',
      repositoryTitle: 'repository — partagée, tu la lis surtout',
      repositoryDesc:
        'Une ligne, c’est une chose à suivre : un flux de podcast, un subreddit, ce que ton provider appelle une source. type doit valoir ton nom de provider. config est du JSON libre que ton script est seul à définir et à interpréter.',
      connectorTitle: 'connector_<name> — la tienne, entièrement',
      connectorDesc: 'Colonnes facultatives, utilisées si présentes mais jamais exigées :',
      optionalDescriptions: [
        'l’horodatage propre au contenu, préféré à executed_at pour trier par nouveauté.',
        'une étiquette courte affichée à côté des rendus riches — un tag de release, un identifiant de vidéo, etc.',
      ],
      registryTitle: 'provider_registry — partagée, une ligne pour toi',
      registryDesc:
        'sort_order n’influence que l’ordre d’affichage des providers dans les apps ; n’importe quel entier convient (les quatre existants utilisent 10, 20, 30, 40). Ignore cette table et ton provider fonctionne quand même : l’API retombe sur ton nom avec une majuscule.',
      logTitle: 'log — partagée, facultative mais recommandée',
      logDesc: 'Écris ici au lieu de planter quand une source échoue, et poursuis avec les autres.',
    },
    eachRun: {
      heading: 'Ce que fait ton script à chaque exécution',
      steps: [
        'Se connecter, et exécuter l’étape de schéma idempotente ci-dessus.',
        'Lire la liste de tes sources dans repository, filtrée sur ton nom de provider.',
        'Pour chaque source : interroger le service externe, comparer avec ce qui est déjà stocké — en général la dernière ligne réussie pour cette source — et n’insérer que ce qui est nouveau.',
        'Purger les vieilles lignes selon config.retention_days, ou les clés de config que tu définis.',
        'En cas d’échec sur une source, écrire dans log et passer à la suivante plutôt que d’interrompre tout le run.',
      ],
      addFlag:
        'Prévois un drapeau --add <url> qui fait l’upsert d’une ligne repository puis rend la main : c’est ainsi qu’on amorce des sources directement en base. L’autre voie — celle que les utilisateurs empruntent réellement — passe par l’API, où provider doit valoir le suffixe de ta table.',
    },
    conventions: {
      heading: 'Conventions de contenu, et la réserve sur le rendu générique',
      body: 'content peut être du texte brut ou une chaîne JSON, comme tu préfères. Les providers existants utilisent de petits objets JSON pour YouTube et RSS, afin que les apps puissent afficher un titre et une vignette. Un provider tout neuf n’a pas de rendu dédié à sa forme : les trois apps l’affichent donc en carte générique — les premiers caractères de content, la date, ton nom affiché. C’est parfaitement fonctionnel, seulement plus sobre. Un rendu riche est une suite facultative et séparée : quelqu’un ajoute dans chaque app un composant associé à ton nom de provider. Rien dans le contrat côté serveur ne l’exige.',
    },
    schedule: {
      heading: 'Le faire tourner à intervalle régulier',
      body: 'Reprends le motif de n’importe quel collecteur existant : un Dockerfile, et un workflow quotidien qui lance le script avec l’URL de la base en secret, pointée vers le même Postgres que ton API. Rien ici n’exige GitHub Actions en particulier — un timer systemd, un cron classique ou une autre CI font exactement la même chose.',
    },
    checklist: {
      heading: 'Avant de considérer que c’est fini',
      items: [
        'créée avec au minimum id, repository_id, content, executed_at et success.',
        'ligne upsertée à chaque exécution.',
        'sources lues avec ton nom de provider.',
        'anciennes entrées purgées — ou absence de rétention documentée.',
        'erreurs par source écrites ici plutôt que de faire planter le run.',
        'liste bien ton provider après un run.',
        'renvoie bien tes données.',
      ],
    },
  },
}
