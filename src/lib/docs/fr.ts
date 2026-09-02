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
        'Ce qu’est StayUp, comment les pièces s’emboîtent, et où aller ensuite : monter son instance, l’exploiter, ou écrire un connecteur.',
    },
    eyebrow: 'Documentation',
    title: 'Comment fonctionne StayUp',
    lede: 'StayUp transforme des sources externes de toute nature — notes de version, vidéos, flux, pages scrapées, tout ce qu’un programme sait lire — en un fil par personne. Cette page pose le modèle mental et le vocabulaire ; ensuite, choisis le parcours qu’il te faut.',

    concept: {
      heading: 'L’idée, en quatre phrases',
      points: [
        'StayUp t’affiche le contenu nouveau des sources que tu suis. Ce qui compte comme source n’est pas figé : c’est ce qu’un provider sait aller chercher.',
        'Un provider est un petit programme qui va chercher un type de source et écrit ce qu’il trouve dans la base de l’instance. Couvrir un nouveau type de source, c’est écrire un provider ; rien d’autre ne change dans StayUp.',
        'L’API StayUp lit cette base et la sert aux applications. Elle ne code aucun type de source en dur : à chaque requête, elle demande à la base quels providers existent, et renvoie leur manifeste d’affichage tel quel.',
        'Les applications — web, desktop, mobile — lisent l’API. Chacune peut pointer vers n’importe quelle instance, donc vers n’importe quelle base, et chacune sait afficher un provider dont elle n’a jamais entendu parler.',
      ],
      note: 'L’ensemble des sources est ouvert par construction. Une instance affiche exactement les providers qui tournent sur sa base — aucune liste intégrée, rien à déclarer auprès d’une autorité centrale.',
      diagram: {
        title: 'D’une source jusqu’à ton écran',
        sources: 'Sources externes',
        sourcesItems:
          'un flux de podcast · un fil de forum · une page de statut · tout ce qu’un programme sait lire',
        providers: 'Providers',
        providersSub: 'un petit programme par type de source, sur planification',
        database: 'La base de données',
        databaseSub:
          'PostgreSQL, MySQL, SQLite ou MongoDB — tout ce qui a été collecté, au même endroit',
        api: 'API StayUp',
        apiSub: 'lit la base, sert les applications, ne code rien en dur',
        apps: 'Web · Desktop · Mobile · Admin',
        appsSub: 'chacune configurable vers une autre instance',
      },
    },

    vocabulary: {
      heading: 'Les mots, fixés une bonne fois',
      intro:
        'Ces termes reviennent partout et sont faciles à confondre. Voici ce que chacun veut dire dans StayUp.',
      columnTerm: 'Terme',
      columnMeaning: 'Ce que ça veut dire',
      terms: [
        {
          term: 'Instance',
          meaning:
            'Une base de données + une API devant elle + les providers qui l’alimentent. L’instance publique en est une ; la tienne en serait une autre. Les instances ne se parlent jamais.',
        },
        {
          term: 'Provider (alias connecteur)',
          meaning:
            'Un programme autonome qui va chercher un type de source et écrit des lignes dans la base. « Connecteur » et « provider », c’est la même chose ; les dépôts s’appellent stayup-cmd-*.',
        },
        {
          term: 'Source (alias flux) — une ligne repository',
          meaning:
            'Une chose suivie : une URL de flux précise, une chaîne, une page. Stockée comme une ligne de la table partagée repository, avec type égal au nom du provider.',
        },
        {
          term: 'Abonnement',
          meaning:
            'Un lien entre un utilisateur et une source : « cette personne suit ce flux ». Ajouter un flux dans une app crée un abonnement (et la source elle-même, si elle n’existait pas).',
        },
        {
          term: 'Template d’affichage',
          meaning:
            'Un manifeste JSON optionnel que le provider stocke dans provider_registry.template. Il dit aux apps comment rendre ses lignes. Pas de template → une simple carte générique.',
        },
        {
          term: 'Admin',
          meaning:
            'Un exploitant d’une instance. Le premier (un super admin) est créé en ligne de commande ; les autres se gèrent depuis le web d’admin. Distinct des comptes utilisateurs.',
        },
      ],
    },

    paths: {
      heading: 'De quel parcours as-tu besoin ?',
      installTitle: 'Monter ta propre instance',
      installBody:
        'Ton API et ta base à toi, pour que tes données te restent et que tu choisisses ce qui tourne dessus. Avec une marche à suivre locale complète.',
      installCta: 'Guide d’installation',
      generateTitle: 'Générer un script d’installation',
      generateBody:
        'Le parcours guidé : choisis une base et les connecteurs voulus, et obtiens un script bash unique qui monte toute la stack.',
      generateCta: 'Générateur d’installation',
      adminTitle: 'Exploiter ton instance',
      adminBody:
        'Le web d’admin : gérer les admins, décider quels providers acceptent librement de nouveaux flux, traiter la file d’approbation, curer les utilisateurs et les flux.',
      adminCta: 'Guide d’administration',
      providersTitle: 'Brancher une nouvelle source',
      providersBody:
        'Écrire un provider — un programme qui va chercher une source que StayUp ne couvre pas encore, et stocke ce qu’il trouve. Avec les templates d’affichage.',
      providersCta: 'Guide des providers',
      relation:
        'Exploiter une instance et écrire un provider sont liés mais distincts. Un provider ne parle jamais à l’API, seulement à la base — tu peux donc en écrire un sans lire le guide d’installation. Le faire tourner est une autre affaire : il lui faut un accès en écriture à la base qu’il alimente, et sur l’instance publique tu ne l’as pas. En pratique, ton provider va de pair avec ta propre instance.',
    },
  },

  install: {
    meta: {
      title: 'StayUp — Installation',
      description:
        'Monter ta propre instance StayUp : les pièces, une marche à suivre locale complète, les quatre bases de données, la configuration, et comment y faire pointer les apps.',
    },
    eyebrow: 'Installation',
    title: 'Monter ta propre instance',
    lede: 'Une instance, c’est une base de données, l’API devant elle, les providers que tu choisis pour l’alimenter, et — si tu veux l’exploiter depuis un navigateur — le web d’admin. Cette page déroule le tout, en local, de bout en bout.',

    why: {
      heading: 'Pourquoi s’embêter',
      intro:
        'L’instance publique a ses propres providers et ses propres données. Faire tourner la tienne te permet de :',
      items: [
        'tout garder dans une base que tu contrôles ;',
        'choisir quels providers tournent, et à quelle fréquence ;',
        'suivre des sources que l’instance publique ne couvre pas ;',
        'décider qui peut ajouter quoi, via l’approbation par provider ;',
        'y faire pointer les applications web, desktop et mobile — un réglage, aucun changement de code.',
      ],
      note: 'Les instances ne se parlent pas. Tu démarres avec une base vide et aucun provider, jusqu’à ce que tu en fasses tourner un dessus.',
    },

    pieces: {
      heading: 'Les quatre pièces',
      database: 'Une base de données',
      databaseBody:
        'Contient tout : les sources suivies, le contenu collecté, les comptes, les admins. PostgreSQL, MySQL/MariaDB, SQLite ou MongoDB — l’API s’adapte à celle que tu lui indiques.',
      api: 'API StayUp',
      apiBody:
        'Une fine couche sans état au-dessus de cette base. Elle ne code aucun nom de provider en dur — à chaque requête, elle demande à la base ce qui s’y trouve. Tourne sur Node, en Docker, ou sur Cloudflare Workers.',
      providers: 'Providers',
      providersBody:
        'Les programmes qui remplissent réellement la base. Des dépôts autonomes, lancés sur planification, qui ne parlent qu’à la base. Sans au moins un, ton instance fonctionne mais n’affiche rien.',
      adminUi: 'Le web d’admin (optionnel)',
      adminUiBody:
        'Un déploiement de l’app web ouvert sur /admin. Permet de gérer les admins, régler le mode d’approbation de chaque provider, traiter la file des demandes de flux, et curer utilisateurs et flux. Sans lui, l’API fonctionne quand même — tu perds juste la console navigateur.',
    },

    fastPath: {
      heading: 'Le chemin rapide',
      body: 'Si tu veux juste que ça tourne, le générateur d’installation pose quelques questions et te rend un seul stayup-setup.sh qui fait tout ce qui suit à ta place — clone, compose, schéma, super admin, premier run des connecteurs, planificateur.',
      cta: 'Ouvrir le générateur d’installation',
    },

    walkthrough: {
      heading: 'Marche à suivre locale complète',
      intro:
        'À la main, pour voir chaque rouage. PostgreSQL et Docker ici ; les mêmes étapes marchent avec n’importe quel moteur pris en charge.',
      steps: [
        'Cloner l’API : git clone https://github.com/stayup-app/stayup-api.git && cd stayup-api',
        'Copier .env.example en .env et renseigner DATABASE_URL et JWT_SECRET (openssl rand -hex 32). Il n’y a aucun identifiant ni mot de passe admin à définir — les admins vivent en base.',
        'Démarrer la base et l’API : docker compose up -d db api. Le fichier compose sème le schéma dans Postgres à la première init ; l’API écoute sur le port 3000.',
        'Si tu n’as pas compté sur cette auto-init, applique le schéma une fois : psql "$DATABASE_URL" -f src/db/schema.sql. Il ne fait qu’ajouter, donc c’est rejouable sans risque.',
        'Créer le premier super admin : npm run create-admin -- root@example.com "Root" \'un-mot-de-passe-solide\'. C’est le compte qui gère le web d’admin.',
        'Ajouter un provider. En cloner un — git clone https://github.com/stayup-app/stayup-cmd-rss.git — pointer son DATABASE_URL sur la même base, installer ses dépendances, puis : python fetch_rss.py --add https://blog.example.com/feed.xml et python fetch_rss.py. Le premier vrai run crée ses tables et l’enregistre.',
        'Vérifier que l’API le voit : curl localhost:3000/connectors/providers doit maintenant lister rss avec son manifeste d’affichage.',
        'Ouvrir l’app desktop, aller dans Profil → URL de l’API, coller http://localhost:3000, enregistrer. Créer un compte, puis ajouter un flux — l’entrée rss apparaît une fois le connecteur exécuté.',
        'Planifier le connecteur pour qu’il continue de tourner : une ligne de cron, un timer systemd, une planification GitHub Actions, ou le conteneur Ofelia que met en place le générateur.',
      ],
      note: 'L’API ne lance jamais les connecteurs. Ce sont des programmes distincts, sur leur propre planning ; la seule chose qu’ils partagent avec l’API est la base de données.',
    },

    requirements: {
      heading: 'Ce qu’il te faut',
      items: [
        'Une base de données parmi celles listées plus bas, joignable depuis l’endroit où tourne l’API.',
        'Docker, ou Node.js 22 ou plus si tu tournes sans conteneurs.',
        'Éventuellement un compte Cloudflare, pour déployer sur Workers comme l’instance de référence.',
      ],
    },

    databases: {
      heading: 'Quelle base de données',
      intro:
        'L’API ne parle pas SQL directement. Elle appelle un contrat de stockage qu’un adaptateur par moteur remplit, et c’est le schéma de ta DATABASE_URL qui choisit l’adaptateur. Quatre moteurs sont livrés avec :',
      columnEngine: 'Moteur',
      columnScheme: 'Schéma d’URL',
      columnDriver: 'Pilote à installer',
      note: 'Chaque moteur passe la même suite de conformité — les mêmes comportements, vérifiés en intégration continue sur un vrai PostgreSQL, un vrai MySQL, un vrai SQLite et un vrai MongoDB. C’est ce qui rend le choix réversible : les tables, les collections et les colonnes portent partout les mêmes noms, si bien qu’un provider se décrit une fois et que seul son dialecte change.',
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
        'Secret aléatoire qui signe les tokens d’authentification. À générer avec openssl rand -hex 32. Il doit rester le même pendant toute la vie de l’instance — le changer invalide tous les tokens existants.',
        'URL publique de ton déploiement web. Sert uniquement de cible de redirection OAuth ; laisse-la de côté si tu n’actives ni Google ni GitHub.',
        'Active « Se connecter avec Google ». Laisser vide pour désactiver.',
        'Active « Se connecter avec GitHub ». Laisser vide pour désactiver.',
      ],
      note: 'Il n’y a aucune variable d’identifiant ni de mot de passe admin. L’ancienne paire API_USERNAME / API_PASSWORD a disparu : les admins sont des lignes en base, et le premier se crée avec npm run create-admin. La connexion e-mail + mot de passe des utilisateurs marche toujours, quoi que tu fasses des variables OAuth.',
    },

    deploy: {
      heading: 'Déployer l’API',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Node.js nu'],
      dockerIntro: 'Le plus court : cloner, remplir .env, lancer.',
      dockerNote:
        'Le fichier compose monte le schéma dans le répertoire d’init de Postgres, si bien que les tables du cœur sont créées à la première initialisation du volume. L’API écoute ensuite sur le port 3000. Amorce le super admin juste après — voir plus bas.',
      workersIntro: 'Ce que fait tourner l’instance de référence.',
      workersNote:
        'Ta base doit être joignable depuis le réseau de Cloudflare — un fournisseur managé avec une chaîne de connexion publique poolée est la réponse habituelle. Workers ne peut pas joindre une base sur ton réseau domestique, ni exécuter le script create-admin : amorce le super admin contre la base depuis ta propre machine.',
      nodeIntro: 'Aucune orchestration, juste le serveur compilé.',
      nodeNote:
        'Ou construis toi-même le Dockerfile fourni, si tu préfères lancer un conteneur sans Compose. L’image compilée embarque aussi le script create-admin.',
    },

    schema: {
      heading: 'Créer les tables, et le premier admin',
      applyIntro:
        'Si tu ne comptes pas sur l’auto-init de Compose, applique le schéma une fois toi-même. Un fichier par moteur, mêmes noms de tables et de colonnes partout :',
      applyNote:
        'Les fichiers SQL ne font qu’ajouter — CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS — donc rejouables à tout moment, y compris contre une base qui contient déjà des données.',
      engineNotes: [
        'Le schéma de référence. Version 14 ou plus.',
        'MySQL 8 ou MariaDB 10.2 et plus : l’API classe le contenu avec une fonction fenêtre.',
        'Rien à héberger — un fichier à côté de l’API. Bien pour une instance perso, pas pour une que les apps sollicitent depuis plusieurs endroits à la fois.',
        'Aucun schéma à appliquer : MongoDB crée une collection à la première écriture. Seuls les index comptent, et l’API les crée elle-même à la connexion — la commande ci-dessus le fait juste à l’avance.',
      ],
      adminIntro:
        'Les admins sont des lignes de la table admin ; il n’y a aucun compte par défaut. Crée le premier — toujours un super admin — en ligne de commande. Il applique d’abord le schéma, puis insère la ligne :',
      userIntro:
        'Les comptes utilisateurs ordinaires se créent depuis le formulaire d’inscription des apps. Pour en fabriquer un sans formulaire, pour tester :',
      verifyIntro: 'Puis vérifie que l’API répond :',
      verifyNote:
        'Une liste de providers vide est la réponse attendue ici : rien n’a encore collecté quoi que ce soit. C’est l’objet du guide des providers.',
    },

    auth: {
      heading: 'Utilisateurs et authentification',
      intro:
        'Comment les gens obtiennent un compte sur ton instance, et comment activer la connexion avec Google ou GitHub.',
      registration: {
        heading: 'Modes d’inscription',
        body: 'REGISTRATION_MODE décide de ce que fait une inscription publique. open (par défaut) : le compte est créé et la personne est connectée aussitôt — c’est le comportement actuel. approval : l’inscription est mise en attente. POST /auth/register répond 202 sans token, une inscription OAuth revient avec ?error=pending_approval, et une tentative de connexion pour un e-mail en attente répond 403. Un admin traite ensuite la file dans /admin/users → « Comptes en attente ». Les comptes créés par un admin sont toujours actifs, quel que soit le mode ; de même pour une inscription OAuth dont l’e-mail vérifié correspond déjà à un compte actif.',
      },
      pointing: {
        heading: 'Où les apps se connectent',
        body: 'Les apps desktop et mobile, ainsi que les pages web de connexion et d’inscription, portent toutes une ligne « Serveur » sur l’écran de connexion. Elle affiche l’hôte de l’API et se déplie en un champ pour la changer ou la réinitialiser — avant qu’aucun compte n’existe, donc personne n’a à se connecter à l’API par défaut d’abord. Chaque écran lit GET /auth/config de l’instance visée et n’affiche que les méthodes de connexion qu’elle propose. L’app web hébergée refuse toujours un hôte privé (localhost, 10.x, 192.168.x…) par mesure anti-SSRF : pour pointer une UI web sur une API locale, fais tourner ta propre copie de stayup-ui avec STAYUP_API_URL fixé au déploiement.',
      },
      oauth: {
        heading: 'Connexion Google et GitHub',
        intro:
          'Optionnel. Chaque fournisseur demande une app OAuth qui t’appartient et quatre variables d’environnement sur l’API :',
        steps: [
          'Créer une app OAuth — Google sur console.cloud.google.com/apis/credentials, GitHub sur github.com/settings/developers.',
          'Régler son URL de callback (ou de redirection) sur https://<origine-de-ton-api>/auth/oauth/<provider>/callback. Les deux fournisseurs acceptent http://localhost pour le développement.',
          'Mettre le client ID et le secret dans GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (ou la paire GITHUB_) sur l’API.',
          'Fixer UI_URL sur l’origine de ton déploiement web — après un OAuth navigateur, l’API redirige vers UI_URL/api/auth/callback. L’app desktop intercepte ce chemin elle-même, donc n’importe quel UI_URL non vide lui suffit ; l’app mobile utilise son propre lien profond stayup://, déjà en liste blanche.',
        ],
        note: 'Une app OAuth GitHub n’accepte qu’une seule URL de callback : il te faut donc une app GitHub par origine d’API. Le générateur de script demande ces identifiants à l’exécution et les écrit directement dans docker-compose.yml, jamais dans le script.',
      },
    },

    pointing: {
      heading: 'Faire pointer une app sur ton instance',
      items: [
        'Web : règle STAYUP_API_URL sur ton déploiement — ou laisse-la et laisse chaque visiteur la surcharger depuis son profil, où elle est stockée par navigateur.',
        'Les trois apps : la ligne « Serveur » sur l’écran de connexion, ou Profil → « Serveurs » une fois connecté, où tu règles, renommes et réinitialises chacun.',
        'Le web d’admin, c’est la même app web : pointe son STAYUP_API_URL sur ton API et ouvre /admin.',
        'Une app, plusieurs instances : depuis Profil → « Serveurs » tu peux ajouter des instances d’API secondaires ; le feed combine alors toutes les instances, chaque ligne portant un badge du serveur d’origine. L’ajout ou la suppression d’un flux est routé vers le serveur choisi. À l’ajout d’un serveur tu peux t’y connecter ou y créer un compte directement ; sur l’app web c’est par e-mail et mot de passe uniquement, tandis que les apps desktop et mobile acceptent aussi l’OAuth pour les serveurs secondaires. Si l’instance tourne avec REGISTRATION_MODE=approval, un nouveau compte attend la validation d’un admin avant de pouvoir servir.',
      ],
      note: 'Rien d’autre ne change. La liste des providers, les données et le rendu suivent tous l’instance configurée — y compris le repli générique pour les providers que l’app ne connaît pas par leur nom.',
    },

    troubleshooting: {
      heading: 'Quand quelque chose cloche',
      items: [
        {
          symptom: 'La liste des providers revient vide.',
          cause:
            'Attendu sur une base neuve : aucun provider n’a encore tourné dessus. Lances-en un et revérifie.',
        },
        {
          symptom: 'Les apps n’affichent aucun contenu, mais la liste des providers est remplie.',
          cause:
            'Les providers tournent mais personne ne suit encore rien, ou les sources qu’ils suivent ne portent aucun contenu nouveau. Ajoute une source depuis l’app.',
        },
        {
          symptom: 'Un provider apparaît en carte texte, parfois en JSON brut.',
          cause:
            'Aucun template d’affichage exploitable. Le provider n’a pas écrit provider_registry.template, ou sa colonne content est une chaîne JSON sans template pour l’interpréter. Voir le guide des providers.',
        },
        {
          symptom: 'Ajouter un flux affiche « demande envoyée » au lieu d’abonner.',
          cause:
            'Ce provider est en mode d’approbation manuelle. Un admin l’accepte ou le refuse depuis /admin/flux-requests. Change le mode sur /admin/providers si ce n’est pas ce que tu veux.',
        },
        {
          symptom: 'create-admin dit que l’e-mail est déjà pris.',
          cause:
            'Un super admin existe déjà. Les admins suivants se créent depuis le web d’admin, pas en ligne de commande.',
        },
        {
          symptom: 'La connexion marche mais tous les autres appels sont rejetés.',
          cause:
            'Le secret de signature diffère entre l’instance qui a émis ton token et celle qui répond. Les tokens ne se transfèrent pas d’une instance à l’autre.',
        },
      ],
    },
  },

  admin: {
    meta: {
      title: 'StayUp — Administration',
      description:
        'Exploiter une instance StayUp depuis le navigateur : les admins, l’approbation de flux par provider, la file de demandes, les utilisateurs et les flux.',
    },
    eyebrow: 'Administration',
    title: 'Exploiter ton instance',
    lede: 'Une fois l’API en route, le web d’admin est l’endroit d’où tu exploites l’instance depuis un navigateur : qui peut ajouter quoi, quelles demandes sont en attente, quels utilisateurs suivent quels flux.',

    webUi: {
      heading: 'Le web d’admin',
      body: 'C’est la même app web que le site public, ouverte sur /admin, pointée sur ton API. Il est optionnel — tout ce qu’il fait a une route d’API derrière — mais c’est la façon pratique d’exploiter une instance. Déploie-le comme n’importe quelle autre copie de l’app web, règle STAYUP_API_URL sur ton API, et connecte-toi sur /admin/login.',
      note: 'La session admin est un cookie distinct de la session utilisateur. Le même navigateur peut tenir les deux en même temps sans que l’une déconnecte l’autre.',
    },

    roles: {
      heading: 'Super admin et admin',
      intro:
        'Deux niveaux. Le premier admin est toujours un super admin, créé en ligne de commande (npm run create-admin). Tous les suivants se créent depuis l’UI et sont des admins ordinaires.',
      columnRole: 'Rôle',
      columnCan: 'Peut faire',
      rows: [
        {
          role: 'Super admin',
          can: 'Tout ce qu’un admin ordinaire peut, plus : créer, modifier et supprimer d’autres admins. Ne peut pas être supprimé depuis l’UI, ni se supprimer lui-même.',
        },
        {
          role: 'Admin',
          can: 'Le travail opérationnel : utilisateurs, flux, modes d’approbation des providers, la file de demandes. Ne voit ni ne touche la liste des admins. Peut changer son propre mot de passe.',
        },
      ],
      note: 'Les admins ne sont pas des comptes utilisateurs. Ils ont leur propre table, leur propre connexion, et pas de fil à eux.',
    },

    managingAdmins: {
      heading: 'Gérer les admins',
      body: 'Super admin uniquement, sur /admin/admins :',
      steps: [
        'Créer un admin avec un e-mail, un nom et un mot de passe. C’est un admin ordinaire — il ne peut pas gérer d’autres admins.',
        'Modifier le nom, l’e-mail ou le mot de passe d’un admin.',
        'Supprimer un admin. Les lignes super admin et ta propre ligne sont verrouillées.',
      ],
      note: 'Un admin ordinaire qui doit changer son propre mot de passe le fait depuis /admin/settings, avec son mot de passe actuel.',
    },

    fluxApproval: {
      heading: 'Approbation de flux par provider',
      intro:
        'Quand un utilisateur ajoute un flux qui n’existe pas encore, ce qui se passe dépend du mode d’approbation du provider. Règle-le par provider sur /admin/providers.',
      autoBody:
        'auto — le défaut. La source est créée et l’utilisateur abonné immédiatement. Bien pour les providers où n’importe quelle URL convient (RSS, un changelog).',
      manualBody:
        'manual — ajouter un flux inconnu crée une demande à la place (l’app affiche « demande envoyée »). Rien n’est créé tant qu’un admin n’a pas approuvé. Bien pour les providers où faire tourner une source coûte quelque chose, comme le scraping.',
      note: 'S’abonner à un flux qui existe déjà n’est jamais soumis à approbation — l’approbation ne concerne que l’entrée d’une source toute neuve dans l’instance.',
    },

    usersAndFluxes: {
      heading: 'Utilisateurs et flux',
      body: 'Le reste de la console, c’est du parcours et de la curation :',
      items: [
        '/admin/users — chaque compte, avec les flux qu’il suit. Ajoute ou retire un abonnement pour le compte de quelqu’un.',
        '/admin/repositories — chaque source, tous providers confondus, avec sa config. En créer une directement (utile pour amorcer un provider manuel), ou en retirer une.',
        '/admin/flux-requests — la file d’attente. Accepter crée ou réutilise la source et abonne le demandeur ; refuser la marque refusée. Les deux sont définitifs.',
      ],
    },

    dataSources: {
      heading: 'Bases de données secondaires',
      intro:
        'La base principale porte l’instance elle-même — admins, utilisateurs, abonnements, registre des providers. À côté, tu peux brancher l’instance sur des bases secondaires en lecture seule qui ne portent que des données de connecteurs, et laisser les utilisateurs suivre les flux qui y vivent. Elles se gèrent sur /admin/data-sources.',
      steps: [
        'La base principale est affichée en haut de la page, pour information seulement : son moteur et son hôte, rien à modifier.',
        'Ajouter une secondaire avec un nom et une chaîne de connexion. Les quatre mêmes moteurs sont pris en charge que pour la principale.',
        'Tester la connexion. L’instance vérifie qu’elle peut se connecter et qu’au moins une table de connecteur est présente, et liste les providers trouvés.',
        'Confirmer. La chaîne de connexion est stockée chiffrée au repos et la source rejoint la liste. Retire-la quand tu veux — les abonnements qui pointaient dessus partent avec elle.',
      ],
      note: 'Les providers de même nom sont fusionnés dans les apps : l’utilisateur voit une seule tuile « RSS » dont la liste de flux rassemble les flux de toutes les bases, et une ligne venue d’une secondaire porte un petit badge avec le nom de la base. Rien n’est jamais réécrit vers une secondaire — c’est une source de données, pas une seconde maison.',
    },

    addingFlux: {
      heading: 'Comment un utilisateur ajoute un flux, depuis n’importe quelle app',
      intro:
        'Le même flux pour tous les providers — il n’y a plus de cas particulier par provider dans les apps :',
      steps: [
        'Choisir un provider.',
        'L’app montre les flux que ce provider suit déjà et que tu ne suis pas encore. Un tap abonne — jamais d’approbation.',
        'Ou basculer sur « ajouter un nouveau ». Le champ est piloté par le descripteur form du provider : son libellé, son indication, et la forme qu’il attend.',
        'Valider. Si le provider est auto, tu es abonné. S’il est manual, l’app affiche « demande envoyée » et un admin prend le relais.',
      ],
      note: 'C’est pour ça qu’un provider devrait fournir un descripteur form dans son template — c’est ce qui transforme un champ de texte nu en « colle un identifiant YouTube » ou « colle une URL de flux ».',
    },
  },

  generate: {
    meta: {
      title: 'StayUp — Générer une installation self-hosted',
      description:
        'Choisis une base et les connecteurs voulus, et télécharge un script bash unique qui monte ta propre instance StayUp.',
    },
    eyebrow: 'Installation',
    title: 'Génère ton script d’installation',
    lede: 'Choisis une base et les connecteurs voulus. Tu obtiens un seul script bash qui clone les repos, écrit la configuration Docker, crée ton super admin et démarre tout.',

    how: {
      heading: 'Ce que fait le script',
      items: [
        'Clone l’API, les connecteurs choisis et — si tu le gardes — le web d’admin.',
        'Écrit un docker-compose.yml avec PostgreSQL, l’API, un conteneur par connecteur et un planificateur Ofelia.',
        'Te demande le compte super admin et la fréquence de chaque connecteur.',
        'Applique le schéma, crée le super admin et lance chaque connecteur une fois pour qu’il s’enregistre.',
        'Démarre l’API, le web d’admin et le planificateur.',
      ],
      note: 'Tout tourne sur ta machine dans Docker. Rien n’est envoyé nulle part — la page construit le script dans ton navigateur.',
    },

    requirements: {
      heading: 'Avant de le lancer',
      items: [
        'Docker et Docker Compose v2 (`docker compose`).',
        'git.',
        'Linux ou macOS. Sous Windows, lance le script dans WSL.',
      ],
    },

    form: {
      database: 'Base de données',
      comingSoon: 'bientôt',
      connectors: 'Connecteurs officiels',
      customConnectors: 'Tes connecteurs',
      customHint:
        'N’importe quel dépôt git avec un Dockerfile à la racine dont l’ENTRYPOINT lance le collecteur une fois, lit DATABASE_URL et s’enregistre dans provider_registry. Voir le guide des providers.',
      customConnectorAdd: 'Ajouter un connecteur',
      customUrlPlaceholder: 'https://github.com/toi/ton-connecteur.git',
      customNamePlaceholder: 'nom (optionnel)',
      remove: 'Retirer',
      adminUi: 'Inclure le web d’admin',
      adminUiHint: 'Gérer les providers, approuver les demandes de flux, ajouter des admins.',
      registration: 'Inscription',
      registrationOpen: 'Ouverte',
      registrationOpenHint:
        'N’importe qui pouvant joindre l’API peut créer un compte tout de suite.',
      registrationApproval: 'Sur validation',
      registrationApprovalHint: 'Les nouveaux comptes attendent qu’un admin les active.',
      signInMethods: 'Méthodes de connexion',
      emailPassword: 'E-mail + mot de passe',
      oauthHint:
        'Le script demandera le client ID et le secret OAuth à l’exécution — ils ne sont jamais écrits dans le script.',
      advanced: 'Avancé',
      projectDir: 'Dossier du projet',
      apiPort: 'Port API',
      uiPort: 'Port UI',
      dbPort: 'Port base',
      preview: 'stayup-setup.sh',
      download: 'Télécharger',
      copy: 'Copier',
      copied: 'Copié',
      invalid: 'Génération impossible',
    },

    run: {
      heading: 'Lance-le',
      intro: 'Enregistre le fichier, puis :',
      note: 'Le premier lancement construit toutes les images et peut prendre quelques minutes.',
    },

    after: {
      heading: 'Après l’installation',
      items: [
        'Doc API : http://localhost:3000/docs — Web d’admin : http://localhost:3001/admin.',
        'Dans l’app desktop ou mobile, règle l’URL de l’API sur http://localhost:3000, puis crée un compte.',
        'Ajoute tes flux depuis l’app — chaque provider propose une liste de flux existants et un formulaire d’ajout.',
        'Tout retirer : docker compose --profile connectors down -v (supprime la base).',
      ],
      note: 'Le planificateur monte le socket Docker pour lancer les connecteurs — équivalent root sur l’hôte, acceptable pour une instance de dev locale.',
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
    lede: 'Un provider est un programme qui va chercher un type de source et stocke ce qu’il trouve. C’est la seule chose que tu écris pour étendre StayUp — l’API et les trois apps le récupèrent tout seuls.',

    what: {
      heading: 'Ce qu’est réellement un provider',
      body: 'Pas un plugin, pas un module à déclarer : un programme ordinaire, dans n’importe quel langage, lancé sur planification. Il lit la liste des sources qui lui sont destinées, va chercher chacune, garde ce qui est nouveau, et l’écrit en base. L’API le récupère tout seul, et les trois apps l’affichent — sans qu’une ligne de code change nulle part.',
      note: 'Un provider n’appelle jamais l’API StayUp. Il parle à la base, et seulement à la base.',
      diagram: {
        title: 'Un provider, étape par étape',
        sources: 'Ses sources, lues depuis la base',
        sourcesItems: 'les flux de podcast que ce provider a reçu l’ordre de suivre',
        fetch: 'Aller chercher chaque flux',
        compare: 'Ne garder que ce qui n’était pas là avant',
        store: 'Écrire en base',
        exposed: 'L’API l’expose, les apps l’affichent',
      },
      steps: {
        heading: 'À chaque exécution',
        items: [
          'Lire les sources qui te sont destinées.',
          'Aller chercher chacune dans le monde extérieur.',
          'Comparer à ce que tu avais stocké la dernière fois, et ne garder que le nouveau.',
          'Écrire les nouveaux éléments en base.',
          'Retirer ce qui a trop vieilli, et journaliser un échec au lieu de planter dessus.',
          'Redéclarer ton nom affiché et ton template, pour qu’une base neuve te découvre au premier run.',
        ],
      },
    },

    access: {
      heading: 'Avant de commencer : où va-t-il écrire ?',
      body: 'Un provider a besoin d’un accès en écriture à la base de l’instance qu’il alimente. Sur l’instance publique tu ne l’as pas, donc en pratique un provider à toi va de pair avec une instance à toi. Écrire un provider ne demande rien du guide d’installation ; en faire tourner un demande une base sur laquelle tu peux écrire.',
      cta: 'Guide d’installation',
    },

    existing: {
      heading: 'Des exemples concrets à lire',
      body: 'Pars de stayup-cmd-template : un squelette nu fait pour être copié, avec les trois endroits à modifier balisés. Lis ensuite les vrais — changelog, youtube, rss, scrap, github-trending — qui sont ce que fait tourner l’instance de référence, pas une définition de ce que StayUp couvre. Le rss est le plus court exemple concret du contrat plus bas ; github-trending est la référence pour un template d’affichage riche. Pointe n’importe lequel sur ta propre base s’il te convient.',
      cta: 'Ouvrir stayup-cmd-template',
    },

    creating: {
      heading: 'Écrire le tien',
      naming: {
        heading: 'Choisir un nom',
        intro:
          'Quelque chose de court et en minuscules, utilisable comme identifiant — podcast, hackernews, reddit_thread. Cette chaîne unique sert telle quelle à plusieurs endroits :',
        columnWhere: 'Où',
        columnExample: 'Pour « podcast »',
        rows: [
          'Ta table de données',
          'Les sources qui t’appartiennent',
          'Ta ligne dans le registre',
          'Le champ provider que les apps envoient à l’ajout d’un flux',
        ],
        note: 'Rien à réserver à l’avance : le nom, c’est simplement celui sous lequel tu crées la table. Deux providers n’entrent en collision qu’en choisissant le même.',
      },
      shape: {
        heading: 'Ce que tu stockes',
        body: 'Une ligne par élément trouvé. Le contenu lui-même peut être du texte ou du JSON — à toi de voir. Sans template d’affichage, les apps montrent une carte simple : le début du contenu, la date, ton nom affiché. Ça marche, c’est juste visuellement sobre, et ça montre du JSON brut si c’est ce que contient ta colonne content. Un template corrige ça, et c’est la section suivante.',
      },
      schedule: {
        heading: 'Le faire tourner sur planification',
        body: 'Copie n’importe quel collecteur existant : un Dockerfile à la racine dont l’ENTRYPOINT lance le script une fois, et un job qui l’exécute avec l’URL de la base dans l’environnement. Rien n’impose une CI particulière — un timer systemd, un cron nu, ou le conteneur Ofelia du générateur font tous la même chose.',
      },
    },

    templates: {
      heading: 'Templates d’affichage',
      body: 'Un template est un manifeste JSON que ton provider stocke dans provider_registry.template, dans le même upsert que son nom affiché. L’API le relaie tel quel via GET /connectors/providers ; chaque app a un moteur qui le lit et rend tes lignes — une disposition en liste, et un volet de lecture dans l’un de sept modes : texte, html, média, audio, galerie, tableau, liste de liens. Aucun code des apps ne connaît le nom de ton provider.',
      fallbackNote:
        'Un provider sans template (colonne NULL, JSON illisible, ou version non reconnue) fonctionne quand même — les apps retombent sur la carte simple. Un template est fortement recommandé dès que ton contenu est autre chose qu’une courte ligne de texte.',
      cta: 'Référence complète des templates',
    },

    form: {
      heading: 'Le descripteur form',
      body: 'Dans le template, un petit bloc form dit aux apps à quoi doit ressembler le champ « ajouter un nouveau flux » pour ton provider. Sans lui, l’utilisateur a un champ de texte nu ; avec lui, un champ étiqueté qui valide et construit l’URL de la source à sa place.',
      fields: [
        {
          field: 'label · placeholder',
          meaning: 'ce que dit le champ et ce qu’il montre en indication.',
        },
        {
          field: 'urlTemplate',
          meaning:
            'ex. https://www.youtube.com/@{value} — {value} est ce que l’utilisateur a saisi. Ignoré si la valeur est déjà une URL http(s).',
        },
        {
          field: 'pattern',
          meaning:
            'une regex que la saisie transformée doit respecter, vérifiée côté client avant l’envoi.',
        },
        {
          field: 'transform',
          meaning:
            'trim, retrait d’un préfixe/suffixe connu, ou extraction d’un groupe capturé — pour qu’une URL complète collée et un identifiant nu finissent pareil.',
        },
      ],
      note: 'Les apps stockent l’URL construite comme source ; ton collecteur la relit depuis la ligne repository comme n’importe quelle autre.',
    },

    fluxApproval: {
      heading: 'Mode d’approbation',
      body: 'Chaque provider a une colonne flux_approval dans le registre : auto (défaut) ou manual. auto abonne l’utilisateur immédiatement quand il ajoute un nouveau flux ; manual en fait une demande qu’un admin doit approuver. Un provider peut semer son propre défaut dans l’upsert ; un admin le surcharge par instance depuis /admin/providers. Le scraping est livré en manual pour une raison — faire tourner une source y coûte quelque chose.',
      note: 'Ça ne concerne que l’entrée d’une source toute neuve. S’abonner à une source qui existe déjà n’est jamais soumis à approbation.',
    },

    contract: {
      heading: 'Contrat technique',
      lede: 'Matériel de référence. Tu en as besoin pour écrire un provider, pas pour comprendre StayUp.',
      diagramTitle: 'Ce que ton script a le droit de toucher',
      yourScript: 'Ton provider',
      readOnly: 'lecture seule',
      readWrite: 'lecture et écriture — entièrement à toi',
      upsertOne: 'une ligne : la tienne',
      writeOnError: 'écriture sur erreur',
      repositoryDesc: 'les sources à suivre',
      connectorDesc: 'le contenu que tu collectes',
      registryDesc: 'ton nom affiché + template',
      logDesc: 'les échecs, au lieu de planter',
      warning:
        'N’écris jamais dans la table d’un autre provider, ni dans les tables user, session, account, admin, subscription ou flux_request : elles appartiennent à l’API et à l’app web.',
      tablesHeading: 'Les quatre tables',
      tablesIntro:
        'Ton étape d’init, lancée au début de chaque exécution, doit s’assurer que celles-ci existent. Chaque instruction est idempotente — rejouable à chaque fois, et sûre si un autre provider ou l’API a créé les partagées en premier.',
      engineIntro:
        'Choisis le moteur que fait tourner ton instance. Les noms ne changent jamais d’un onglet à l’autre — seuls le dialecte et les types changent, et c’est pourquoi un provider écrit pour un moteur se lit pareil pour un autre.',
      engineNotes: [
        'Le dialecte de référence, et ce que fait tourner l’instance publique.',
        'Mêmes tables, types MySQL. Une URL doit tenir dans un VARCHAR indexable, d’où la longueur explicite.',
        'Aucun serveur : ton provider et l’API ouvrent le même fichier. Dates et JSON stockés en texte, que l’API reparse à la lecture.',
        'Une collection au lieu d’une table, et aucun schéma à déclarer — mais deux règles. Un document repository porte un _id numérique, tiré de la collection counters, parce que le contrat désigne une source par un nombre. Et rien ne cascade : ce que tu écris, tu le nettoies.',
      ],
      repositoryTitle: 'repository — partagée, tu la lis surtout',
      repositoryBody:
        'Une ligne, c’est une chose à suivre : un flux de podcast, un subreddit, ce que ton provider appelle une source. La colonne type doit être égale au nom de ton provider. La colonne config est du JSON libre que seul ton script définit et interprète.',
      connectorTitle: 'connector_<name> — la tienne, entièrement',
      connectorBody: 'Colonnes optionnelles, utilisées si présentes mais jamais requises :',
      optionalDescriptions: [
        'l’horodatage propre au contenu, préféré à l’heure d’exécution pour trier par « le plus récent ».',
        'un libellé court montré à côté des rendus riches — un tag de version, un id de vidéo, etc.',
      ],
      registryTitle: 'provider_registry — partagée, une ligne pour toi',
      registryBody:
        'Le sort order n’affecte que l’ordre d’apparition des providers dans les apps ; n’importe quel entier fait l’affaire. La colonne template, c’est ton manifeste d’affichage (sections précédentes) ; laisse-la NULL et ton provider marche quand même, juste avec la carte simple. flux_approval est un réglage d’exploitant — ne te bats pas contre un admin dessus, mais tu peux semer un défaut sensé. Sans la ligne du tout, l’API retombe sur une version capitalisée de ton nom.',
      logTitle: 'log — partagée, optionnelle mais recommandée',
      logBody: 'Écris ici au lieu de planter quand une source échoue, et continue avec les autres.',
      addingSources: {
        heading: 'Faire entrer des sources',
        body: 'Deux façons. Supporte un flag --add qui insère une ligne et sort — pratique pour amorcer directement contre la base. L’autre façon, celle que prennent réellement les utilisateurs, est d’ajouter une source depuis une app, ce qui poste sur POST /providers/<name>/fluxes ; le champ provider doit être égal au suffixe de ta table.',
      },
      checklist: {
        heading: 'Avant de considérer que c’est fini',
        items: [
          'créée avec au moins un id, une référence de source, le contenu, un horodatage et un drapeau de succès.',
          'ligne upsertée à chaque run, avec ton nom affiché et (recommandé) ton template.',
          'sources lues avec le nom de ton provider.',
          'anciennes entrées élaguées — ou l’absence de rétention documentée.',
          'échecs par source écrits ici au lieu de faire planter le run.',
          'liste ton provider après un run.',
          'renvoie tes données.',
        ],
      },
    },
  },
}
