import type { DocContent } from './en'

export const fr: DocContent = {
  common: {
    onThisPage: 'Sur cette page',
    backToDocs: 'Retour à la documentation',
    docsHome: 'Documentation',
  },

  home: {
    meta: {
      title: 'StayUp — Documentation',
      description:
        'Comment StayUp fonctionne, comment faire tourner sa propre instance, et comment y brancher une nouvelle source.',
    },
    eyebrow: 'Documentation',
    title: 'Comment fonctionne StayUp',
    lede: 'Commence ici. Deux minutes de concepts, puis choisis le parcours dont tu as réellement besoin.',

    concept: {
      heading: 'L’idée, en quatre phrases',
      points: [
        'StayUp t’affiche le contenu nouveau des sources que tu suis. Ce qui compte comme source n’est pas figé : c’est ce qu’un provider sait aller chercher.',
        'Un provider est un petit programme qui va chercher un type de source et écrit ce qu’il trouve dans la base de l’instance. Couvrir un nouveau type de source, c’est écrire un provider ; rien d’autre ne change dans StayUp.',
        'L’API StayUp lit cette base et la sert aux applications. Elle ne code aucun type de source en dur : à chaque requête, elle demande à la base quels providers existent à cet instant.',
        'Les applications lisent l’API. Chacune peut pointer vers n’importe quelle instance, donc vers n’importe quelle base — et chacune sait afficher un provider dont elle n’a jamais entendu parler.',
      ],
      note: 'L’ensemble des sources est ouvert par construction. Une instance affiche exactement les providers qui tournent sur sa base — aucune liste intégrée, rien à déclarer.',
      diagram: {
        title: 'D’une source jusqu’à ton écran',
        sources: 'Sources externes',
        sourcesItems:
          'un flux de podcast · un fil de forum · une page de statut · tout ce qu’un programme sait lire',
        providers: 'Providers',
        providersSub: 'un petit programme par type de source',
        database: 'La base de données',
        databaseSub:
          'PostgreSQL, MySQL, SQLite ou MongoDB — tout ce qui a été collecté, au même endroit',
        api: 'API StayUp',
        apiSub: 'lit la base, sert les applications',
        apps: 'Web · Desktop · Mobile',
        appsSub: 'chacune configurable vers une autre instance',
      },
    },

    paths: {
      heading: 'De quel parcours as-tu besoin ?',
      selfHostingTitle: 'Faire tourner ta propre instance',
      selfHostingBody:
        'Ton API et ta base à toi, pour que tes données te restent et que tu choisisses ce qui tourne dessus.',
      selfHostingCta: 'Guide d’auto-hébergement',
      providersTitle: 'Brancher une nouvelle source',
      providersBody:
        'Écrire un provider — un programme qui va chercher une source que StayUp ne couvre pas encore, et stocke ce qu’il trouve.',
      providersCta: 'Guide des providers',
      relation:
        'Les deux sont liés mais distincts. Un provider ne parle jamais à l’API, seulement à la base — tu peux donc en écrire un sans lire une ligne du guide d’auto-hébergement. Le faire tourner est une autre affaire : il lui faut un accès en écriture à la base qu’il alimente, et sur l’instance publique tu ne l’as pas. En pratique, ton provider va de pair avec ta propre instance.',
    },
  },

  selfHosting: {
    meta: {
      title: 'StayUp — Auto-hébergement',
      description:
        'Faire tourner ta propre API StayUp et ta propre base, et y faire pointer les applications.',
    },
    eyebrow: 'Auto-hébergement',
    title: 'Faire tourner ta propre instance',
    lede: 'Une instance, c’est trois pièces : une base de données, l’API devant elle, et les providers que tu choisis pour l’alimenter.',

    why: {
      heading: 'Pourquoi s’embêter',
      intro:
        'L’instance publique a ses propres providers et ses propres données. Faire tourner la tienne te permet de :',
      items: [
        'tout garder dans une base que tu contrôles ;',
        'choisir quels providers tournent, et à quelle fréquence ;',
        'suivre des sources que l’instance publique ne couvre pas ;',
        'y faire pointer les applications web, desktop et mobile — un réglage, aucun changement de code.',
      ],
      note: 'Les instances ne se parlent pas. Tu démarres avec une base vide et aucun provider, jusqu’à ce que tu en fasses tourner un dessus.',
    },

    pieces: {
      heading: 'Les trois pièces',
      database: 'Une base de données',
      databaseBody:
        'Contient tout : les sources suivies, le contenu collecté, les comptes. PostgreSQL, MySQL/MariaDB, SQLite ou MongoDB — l’API s’adapte à celle que vous lui indiquez.',
      api: 'API StayUp',
      apiBody:
        'Une fine couche sans état au-dessus de cette base. Elle ne code aucun nom de provider en dur — à chaque requête, elle demande à la base ce qui s’y trouve.',
      providers: 'Providers',
      providersBody:
        'Les programmes qui remplissent réellement la base. Sans au moins un, ton instance fonctionne mais n’affiche rien.',
    },

    requirements: {
      heading: 'Ce qu’il te faut',
      items: [
        'Une base de données parmi celles listées plus bas, joignable depuis l’endroit où tourne l’API.',
        'Node.js 22 ou plus, si tu n’utilises pas Docker.',
        'Éventuellement un compte Cloudflare, pour déployer sur Workers comme l’instance de référence.',
      ],
    },

    databases: {
      heading: 'Quelle base de données',
      intro:
        'L’API ne parle pas SQL directement. Elle appelle un contrat de stockage qu’un adaptateur par moteur remplit, et c’est le schéma de votre DATABASE_URL qui choisit l’adaptateur. Quatre moteurs sont livrés avec :',
      columnEngine: 'Moteur',
      columnScheme: 'Schéma d’URL',
      columnDriver: 'Pilote à installer',
      note: 'Chaque moteur passe la même suite de conformité — les mêmes vingt-quatre comportements, vérifiés en intégration continue sur un vrai PostgreSQL, un vrai MySQL, un vrai SQLite et un vrai MongoDB. C’est ce qui rend le choix réversible : les tables, les collections et les colonnes portent partout les mêmes noms, si bien qu’un provider se décrit une fois et que seul son dialecte change.',
      workersNote:
        'Une exception, et elle n’est pas de notre fait : Cloudflare Workers n’ouvre que le type de connexion qu’utilise PostgreSQL. Les pilotes MySQL, SQLite et MongoDB ont besoin de Node — Docker ou Node.js nu, pas Workers.',
    },

    env: {
      heading: 'Configuration',
      columnVariable: 'Variable',
      columnRequired: 'Requise',
      columnDescription: 'Description',
      yes: 'oui',
      no: 'non',
      descriptions: [
        'Le schéma choisit le moteur : postgres://, mysql://, sqlite:// ou mongodb://. Les builds Node et Docker acceptent aussi DB_HOST, DB_PORT, DB_NAME, DB_USER et DB_PASSWORD séparément, pour PostgreSQL.',
        'Secret aléatoire qui signe les tokens d’authentification. À générer avec openssl rand -hex 32.',
        'L’unique compte de service admin. Il n’existe aucune ligne admin en base : celui qui se connecte avec ces identifiants obtient le rôle admin. Les utilisateurs normaux s’inscrivent depuis les applications.',
        'URL publique de ton déploiement web. Sert de cible de redirection OAuth.',
        'Active « Se connecter avec Google ». Laisser vide pour désactiver.',
        'Active « Se connecter avec GitHub ». Laisser vide pour désactiver.',
      ],
      note: 'La connexion par e-mail et mot de passe fonctionne toujours, quoi que tu fasses des variables OAuth.',
    },

    deploy: {
      heading: 'Déployer l’API',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Node.js simple'],
      dockerIntro: 'Le chemin le plus court : cloner, remplir .env, lancer.',
      dockerNote:
        'Le fichier compose monte le schéma dans le répertoire d’initialisation de Postgres : les tables de base sont donc créées à la première initialisation du volume. L’API écoute ensuite sur le port 3000.',
      workersIntro: 'Ce que fait tourner l’instance de référence.',
      workersNote:
        'Ta base doit être joignable depuis le réseau de Cloudflare — un hébergeur managé avec une chaîne de connexion publique et poolée est la réponse habituelle. Workers ne peut pas atteindre une base sur ton réseau local.',
      nodeIntro: 'Aucune orchestration, juste le serveur compilé.',
      nodeNote:
        'Ou construis toi-même le Dockerfile fourni, si tu préfères un conteneur sans Compose.',
    },

    schema: {
      heading: 'Créer les tables, et ton premier compte',
      applyIntro:
        'Si vous ne comptez pas sur l’auto-initialisation de Compose, appliquez le schéma une fois vous-même. Un fichier par moteur, les mêmes noms de tables et de colonnes dans tous :',
      applyNote:
        'Les fichiers SQL ne font qu’ajouter — CREATE TABLE IF NOT EXISTS — donc on peut les rejouer à tout moment, y compris sur une base qui contient déjà des données.',
      engineNotes: [
        'Le schéma de référence. Version 14 ou plus.',
        'MySQL 8 ou MariaDB 10.2 et plus : l’API classe le contenu avec une fonction de fenêtrage.',
        'Rien à héberger — un fichier à côté de l’API. Bien pour une instance personnelle, moins pour une instance que les apps sollicitent depuis plusieurs endroits à la fois.',
        'Aucun schéma à appliquer : MongoDB crée une collection à la première écriture. Seuls les index comptent, et l’API les pose elle-même en se connectant — la commande ci-dessus ne fait que prendre les devants.',
      ],
      userIntro:
        'L’accès admin, c’est le couple identifiant / mot de passe ci-dessus : il n’y a rien à créer. Pour un compte normal, sans passer par un formulaire d’inscription :',
      verifyIntro: 'Vérifie ensuite que ça répond :',
      verifyNote:
        'Une liste de providers vide est la réponse attendue ici : rien n’a encore rien collecté. C’est l’objet du guide des providers.',
    },

    pointing: {
      heading: 'Faire pointer une application vers ton instance',
      items: [
        'Web : définis l’URL de l’API sur ton déploiement — ou laisse-la et laisse chaque visiteur la remplacer depuis son profil, où elle est stockée par navigateur.',
        'Desktop et mobile : Profil, puis « URL de l’API », colle la tienne, enregistre. « Réinitialiser par défaut » revient à celle intégrée à tout moment.',
      ],
      note: 'Rien d’autre ne change. La liste des providers, les données et le rendu suivent tous l’instance configurée — y compris l’affichage sobre pour les providers que l’application ne connaît pas par leur nom.',
    },

    troubleshooting: {
      heading: 'Quand quelque chose cloche',
      items: [
        {
          symptom: 'La liste des providers revient vide.',
          cause:
            'Attendu sur une base neuve : aucun provider n’a encore tourné dessus. Fais-en tourner un et revérifie.',
        },
        {
          symptom: 'Les applications n’affichent rien, mais la liste des providers est remplie.',
          cause:
            'Les providers tournent, mais personne ne suit encore quoi que ce soit, ou les sources suivies n’ont rien de nouveau. Ajoute une source depuis l’application.',
        },
        {
          symptom: 'Tout répond 500 peu après l’ajout d’un provider.',
          cause:
            'En général la base : vérifie que l’API l’atteint toujours, et que le collecteur n’a pas échoué au milieu de la création de ses tables.',
        },
        {
          symptom: 'La connexion marche mais tous les autres appels sont refusés.',
          cause:
            'Le secret de signature diffère entre l’instance qui a émis ton token et celle qui répond. Les tokens ne se transportent pas d’une instance à l’autre.',
        },
      ],
    },
  },

  providers: {
    meta: {
      title: 'StayUp — Providers',
      description:
        'Écrire un programme qui transforme n’importe quelle source externe en contenu StayUp.',
    },
    eyebrow: 'Providers',
    title: 'Brancher une nouvelle source',
    lede: 'Un provider est un programme qui va chercher un type de source et stocke ce qu’il trouve. C’est la seule chose que tu écris pour étendre StayUp — l’API et les trois applications le récupèrent toutes seules.',

    what: {
      heading: 'Ce qu’est vraiment un provider',
      body: 'Ni un plugin, ni un module à enregistrer : un programme ordinaire, dans le langage que tu veux, lancé à intervalle régulier. Il lit la liste des sources qui lui sont destinées, va chercher chacune d’elles, garde ce qui est nouveau, et l’écrit dans la base. L’API le récupère toute seule, et les trois applications l’affichent — sans qu’une ligne de code change nulle part.',
      note: 'Un provider n’appelle jamais l’API StayUp. Il parle à la base de données, et à elle seule.',
      diagram: {
        title: 'Un provider, étape par étape',
        sources: 'Ses sources, lues dans la base',
        sourcesItems: 'les flux de podcast que ce provider a pour mission de suivre',
        fetch: 'Récupérer chaque flux',
        compare: 'Ne garder que ce qui n’y était pas',
        store: 'Écrire dans la base',
        exposed: 'L’API l’expose, les applications l’affichent',
      },
      steps: {
        heading: 'À chaque exécution',
        items: [
          'Lire les sources qui te sont destinées.',
          'Aller chercher chacune d’elles à l’extérieur.',
          'Comparer avec ce que tu avais stocké la fois d’avant, et ne garder que le nouveau.',
          'Écrire les nouveaux éléments dans la base.',
          'Purger ce qui a trop vieilli, et consigner un échec au lieu de planter dessus.',
        ],
      },
    },

    access: {
      heading: 'Avant de commencer : où va-t-il écrire ?',
      body: 'Un provider a besoin d’un accès en écriture à la base de l’instance qu’il alimente. Sur l’instance publique tu ne l’as pas : en pratique, un provider à toi va de pair avec une instance à toi. En écrire un ne demande rien au guide d’auto-hébergement ; en faire tourner un demande une base où tu peux écrire.',
      cta: 'Guide d’auto-hébergement',
    },

    existing: {
      heading: 'Des exemples à lire',
      body: 'Quelques providers existent déjà sous forme de dépôts autonomes. Ce sont ceux que l’instance de référence fait tourner — pas une définition de ce que StayUp couvre. Lis-en un comme exemple concret du contrat ci-dessous, et fais-le pointer vers ta propre base s’il te convient. Celui du RSS est le plus court.',
    },

    creating: {
      heading: 'Écrire le sien',
      naming: {
        heading: 'Choisir un nom',
        intro:
          'Quelque chose de court et en minuscules, utilisable comme identifiant — podcast, hackernews, reddit_thread. Cette seule chaîne est reprise mot pour mot à trois endroits :',
        columnWhere: 'Où',
        columnExample: 'Pour « podcast »',
        rows: ['Ta table de données', 'Les sources qui t’appartiennent', 'Ton nom affiché'],
        note: 'Il n’y a rien à réserver à l’avance : le nom, c’est simplement celui sous lequel tu crées la table. Deux providers n’entrent en collision qu’en choisissant le même.',
      },
      shape: {
        heading: 'Ce que tu stockes',
        body: 'Une ligne par élément trouvé. Le contenu lui-même peut être du texte brut ou du JSON — comme tu veux. Les applications n’ont pas de rendu dédié pour un provider tout neuf : elles l’affichent en carte sobre — le début du contenu, la date, ton nom affiché. Ça marche, c’est juste visuellement sobre. Un rendu plus riche est facultatif, séparé, et rien dans le contrat ne l’exige.',
      },
      schedule: {
        heading: 'Le faire tourner à intervalle régulier',
        body: 'Reprends n’importe quel collecteur existant : un Dockerfile et un job quotidien qui lance le script avec l’URL de la base en secret. Rien n’exige une CI en particulier — un timer systemd ou un cron classique font la même chose.',
      },
    },

    contract: {
      heading: 'Contrat technique',
      lede: 'Matériel de référence. Tu en as besoin pour écrire un provider, pas pour comprendre StayUp.',
      diagramTitle: 'Ce que ton script a le droit de toucher',
      yourScript: 'Ton provider',
      readOnly: 'lecture seule',
      readWrite: 'lecture et écriture — entièrement à toi',
      upsertOne: 'une ligne : la tienne',
      writeOnError: 'écriture en cas d’erreur',
      repositoryDesc: 'les sources à suivre',
      connectorDesc: 'le contenu que tu collectes',
      registryDesc: 'ton nom affiché',
      logDesc: 'les échecs, au lieu de planter',
      warning:
        'N’écris jamais dans la table d’un autre provider, ni dans les tables d’utilisateurs, de sessions, de comptes ou d’abonnements : elles appartiennent à l’API et à l’application web.',
      tablesHeading: 'Les quatre tables',
      tablesIntro:
        'Ton étape d’initialisation, exécutée au début de chaque run, doit garantir leur existence. Chaque instruction est idempotente — rejouable à chaque fois sans risque, et sans risque non plus si un autre provider a créé les tables partagées avant toi.',
      engineIntro:
        'Choisissez le moteur de votre instance. Les noms ne changent pas d’un onglet à l’autre — seuls le dialecte et les types changent, et c’est pourquoi un provider écrit pour un moteur se relit à l’identique sur un autre.',
      engineNotes: [
        'Le dialecte de référence, celui que fait tourner l’instance publique.',
        'Mêmes tables, types MySQL. Une URL doit tenir dans un VARCHAR indexable, d’où la longueur explicite.',
        'Pas de serveur : votre provider et l’API ouvrent le même fichier. Les dates et le JSON sont stockés en texte, que l’API redésérialise à la lecture.',
        'Une collection au lieu d’une table, et aucun schéma à déclarer — mais deux règles. Un document repository porte un _id numérique, tiré de la collection counters, parce que le contrat désigne une source par un nombre. Et rien ne cascade : ce que vous écrivez, c’est à vous de le nettoyer.',
      ],
      repositoryTitle: 'repository — partagée, tu la lis surtout',
      repositoryBody:
        'Une ligne, c’est une chose à suivre : un flux de podcast, un subreddit, ce que ton provider appelle une source. La colonne type doit valoir ton nom de provider. La colonne config est du JSON libre que ton script est seul à définir et à interpréter.',
      connectorTitle: 'connector_<name> — la tienne, entièrement',
      connectorBody: 'Colonnes facultatives, utilisées si présentes mais jamais exigées :',
      optionalDescriptions: [
        'l’horodatage propre au contenu, préféré à l’heure d’exécution pour trier par nouveauté.',
        'une étiquette courte affichée à côté des rendus riches — un tag de release, un identifiant de vidéo, etc.',
      ],
      registryTitle: 'provider_registry — partagée, une ligne pour toi',
      registryBody:
        'L’ordre de tri n’influence que l’ordre d’affichage des providers dans les applications ; n’importe quel entier convient. Ignore cette table et ton provider fonctionne quand même : l’API retombe sur ton nom avec une majuscule.',
      logTitle: 'log — partagée, facultative mais recommandée',
      logBody: 'Écris ici au lieu de planter quand une source échoue, et poursuis avec les autres.',
      addingSources: {
        heading: 'Faire entrer des sources',
        body: 'Deux façons. Prévoir un drapeau --add qui insère une ligne puis rend la main — pratique pour amorcer directement en base. L’autre voie, celle que les utilisateurs empruntent réellement, passe par l’ajout d’une source depuis l’application, où le champ provider doit valoir le suffixe de ta table.',
      },
      checklist: {
        heading: 'Avant de considérer que c’est fini',
        items: [
          'créée avec au minimum un identifiant, une référence de source, le contenu, un horodatage et un indicateur de réussite.',
          'ligne upsertée à chaque exécution.',
          'sources lues avec ton nom de provider.',
          'anciennes entrées purgées — ou absence de rétention documentée.',
          'échecs par source écrits ici plutôt que de faire planter le run.',
          'liste bien ton provider après un run.',
          'renvoie bien tes données.',
        ],
      },
    },
  },
}
