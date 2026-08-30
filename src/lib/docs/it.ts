import type { DocContent } from './en'

export const it: DocContent = {
  common: {
    onThisPage: 'In questa pagina',
    backToDocs: 'Torna alla documentazione',
    docsHome: 'Documentazione',
  },
  home: {
    meta: {
      title: 'StayUp — Documentazione',
      description:
        'Cos’è StayUp, come si incastrano i pezzi, e dove andare dopo: gestire la propria istanza, gestirla, o scrivere un provider.',
    },
    eyebrow: 'Documentazione',
    title: 'Come funziona StayUp',
    lede: 'StayUp trasforma molti tipi di sorgente esterna — note di rilascio, video, feed, pagine scrapate, tutto ciò che un programma sa leggere — in un feed per persona. Questa pagina è il modello mentale e il vocabolario; poi scegli il percorso che ti serve.',
    concept: {
      heading: 'L’idea, in quattro frasi',
      points: [
        'StayUp ti mostra contenuto nuovo dalle sorgenti che segui. Cosa conta come sorgente non è fissato: è ciò che un provider sa andare a prendere.',
        'Un provider è un piccolo programma che va a prendere un tipo di sorgente e scrive ciò che trova nel database dell’istanza. Coprire un nuovo tipo di sorgente significa scrivere un provider; nient’altro cambia in StayUp.',
        'L’API di StayUp legge quel database e lo serve alle app. Non fissa alcun tipo di sorgente: a ogni richiesta chiede al database quali provider esistono ora, e restituisce il loro manifesto di visualizzazione così com’è.',
        'Le app — web, desktop, mobile — leggono l’API. Ognuna si può puntare su qualsiasi istanza, quindi su qualsiasi database, e ognuna sa mostrare un provider di cui non ha mai sentito parlare.',
      ],
      note: 'L’insieme delle sorgenti è aperto per costruzione. Un’istanza mostra esattamente i provider che girano contro il suo database — nessun elenco integrato, niente da registrare presso un’autorità centrale.',
      diagram: {
        title: 'Da una sorgente al tuo schermo',
        sources: 'Sorgenti esterne',
        sourcesItems:
          'un feed di podcast · un thread di forum · una pagina di stato · tutto ciò che un programma sa leggere',
        providers: 'Provider',
        providersSub: 'un piccolo programma per tipo di sorgente, su pianificazione',
        database: 'Il database',
        databaseSub:
          'PostgreSQL, MySQL, SQLite o MongoDB — tutto ciò che è stato raccolto, in un solo posto',
        api: 'API di StayUp',
        apiSub: 'legge il database, serve le app, non fissa nulla',
        apps: 'Web · Desktop · Mobile · Admin',
        appsSub: 'ognuna configurabile verso un’altra istanza',
      },
    },
    vocabulary: {
      heading: 'Le parole, fissate una volta per tutte',
      intro:
        'Questi termini spuntano ovunque e si confondono facilmente. Ecco cosa significa ciascuno in StayUp.',
      columnTerm: 'Termine',
      columnMeaning: 'Cosa significa',
      terms: [
        {
          term: 'Istanza',
          meaning:
            'Un database + un’API davanti + i provider che la alimentano. L’istanza pubblica è una; la tua sarebbe un’altra. Le istanze non si parlano mai.',
        },
        {
          term: 'Provider (alias connettore)',
          meaning:
            'Un programma autonomo che va a prendere un tipo di sorgente e scrive righe nel database. «Connettore» e «provider» sono la stessa cosa; i repo si chiamano stayup-cmd-*.',
        },
        {
          term: 'Sorgente (alias flux) — una riga repository',
          meaning:
            'Una cosa seguita: un URL di feed preciso, un canale, una pagina. Salvata come riga della tabella condivisa repository, con type uguale al nome del provider.',
        },
        {
          term: 'Iscrizione',
          meaning:
            'Un legame tra un utente e una sorgente: «questa persona segue questo flux». Aggiungere un flux in un’app crea un’iscrizione (e la sorgente stessa, se non esisteva).',
        },
        {
          term: 'Template di visualizzazione',
          meaning:
            'Un manifesto JSON opzionale che il provider salva in provider_registry.template. Dice alle app come rendere le sue righe. Nessun template → una semplice scheda generica.',
        },
        {
          term: 'Admin',
          meaning:
            'Un operatore di un’istanza. Il primo (un super admin) si crea da riga di comando; il resto si gestisce dall’interfaccia web di amministrazione. Separato dagli account utente.',
        },
      ],
    },
    paths: {
      heading: 'Di quale percorso hai bisogno?',
      installTitle: 'Gestire la propria istanza',
      installBody:
        'La tua API e il tuo database, così i tuoi dati restano tuoi e scegli cosa gira contro di essi. Include una guida locale completa.',
      installCta: 'Guida all’installazione',
      generateTitle: 'Generare uno script di installazione',
      generateBody:
        'Il percorso guidato: scegli un database e i connettori che vuoi, e ottieni un unico script bash che avvia l’intero stack.',
      generateCta: 'Generatore di installazione',
      adminTitle: 'Gestire la tua istanza',
      adminBody:
        'L’interfaccia web di amministrazione: gestire gli admin, decidere quali provider accettano liberamente nuovi flux, lavorare la coda di approvazione, curare utenti e flux.',
      adminCta: 'Guida all’amministrazione',
      providersTitle: 'Collegare una nuova sorgente',
      providersBody:
        'Scrivere un provider — un programma che va a prendere una sorgente che StayUp non copre ancora e salva ciò che trova. Include i template di visualizzazione.',
      providersCta: 'Guida ai provider',
      relation:
        'Gestire un’istanza e scrivere un provider sono cose collegate ma distinte. Un provider non parla mai con l’API, solo con il database — quindi puoi scriverne uno senza leggere la guida all’installazione. Farlo girare è un’altra faccenda: gli serve accesso in scrittura al database che alimenta, e sull’istanza pubblica non ce l’hai. In pratica, il tuo provider va di pari passo con la tua istanza.',
    },
  },
  install: {
    meta: {
      title: 'StayUp — Installazione',
      description:
        'Avviare la propria istanza di StayUp: i pezzi, una guida locale completa, i quattro database, la configurazione, e come puntare le app su di essa.',
    },
    eyebrow: 'Installazione',
    title: 'Gestire la propria istanza',
    lede: 'Un’istanza è un database, l’API davanti, i provider che scegli per alimentarla e — se vuoi gestirla da un browser — l’interfaccia web di amministrazione. Questa pagina percorre tutto, in locale, dall’inizio alla fine.',
    why: {
      heading: 'Perché prendersi il disturbo',
      intro: 'L’istanza pubblica ha i suoi provider e i suoi dati. Gestire la tua ti permette di:',
      items: [
        'tenere tutto in un database che controlli;',
        'scegliere quali provider girano, e con che frequenza;',
        'seguire sorgenti che l’istanza pubblica non copre;',
        'decidere chi può aggiungere cosa, tramite l’approvazione per provider;',
        'puntare le app web, desktop e mobile su di essa — un’impostazione, nessuna modifica di codice.',
      ],
      note: 'Le istanze non si parlano. Parti con un database vuoto e nessun provider, finché non ne fai girare uno contro di esso.',
    },
    pieces: {
      heading: 'I quattro pezzi',
      database: 'Un database',
      databaseBody:
        'Contiene tutto: le sorgenti seguite, il contenuto raccolto, gli account, gli admin. PostgreSQL, MySQL/MariaDB, SQLite o MongoDB — l’API si adatta a quello che le indichi.',
      api: 'API di StayUp',
      apiBody:
        'Uno strato sottile e senza stato sopra quel database. Non fissa alcun nome di provider — a ogni richiesta chiede al database cosa c’è. Gira su Node, in Docker, o su Cloudflare Workers.',
      providers: 'Provider',
      providersBody:
        'I programmi che riempiono davvero il database. Repo autonomi, avviati su pianificazione, che parlano solo con il database. Senza almeno uno, la tua istanza funziona ma non mostra nulla.',
      adminUi: 'L’interfaccia web di amministrazione (opzionale)',
      adminUiBody:
        'Un deploy dell’app web aperto su /admin. Permette di gestire gli admin, impostare il modo di approvazione di ogni provider, lavorare la coda delle richieste di flux, e curare utenti e flux. Rinunciaci e l’API funziona comunque — perdi solo la console del browser.',
    },
    fastPath: {
      heading: 'La via rapida',
      body: 'Se vuoi solo che giri, il generatore di installazione fa qualche domanda e ti consegna un unico stayup-setup.sh che fa tutto quello che segue al posto tuo — clone, compose, schema, super admin, prima esecuzione dei connettori, scheduler.',
      cta: 'Apri il generatore di installazione',
    },
    walkthrough: {
      heading: 'Guida locale completa',
      intro:
        'A mano, per vedere ogni ingranaggio. Qui PostgreSQL e Docker; gli stessi passi funzionano con qualsiasi motore supportato.',
      steps: [
        'Clonare l’API: git clone https://github.com/stayup-app/stayup-api.git && cd stayup-api',
        'Copiare .env.example in .env e impostare DATABASE_URL e JWT_SECRET (openssl rand -hex 32). Non c’è nessun nome utente né password admin da impostare — gli admin vivono nel database.',
        'Avviare il database e l’API: docker compose up -d db api. Il file compose semina lo schema in Postgres alla prima init; l’API ascolta sulla porta 3000.',
        'Se non hai contato su quell’auto-init, applica lo schema una volta: psql "$DATABASE_URL" -f src/db/schema.sql. Aggiunge soltanto, quindi è rieseguibile senza rischi.',
        'Creare il primo super admin: npm run create-admin -- root@example.com "Root" \'una-password-robusta\'. È l’account che gestisce l’interfaccia web di amministrazione.',
        'Aggiungere un provider. Clonarne uno — git clone https://github.com/stayup-app/stayup-cmd-rss.git — puntare il suo DATABASE_URL sullo stesso database, installare le dipendenze, poi: python fetch_rss.py --add https://blog.example.com/feed.xml e python fetch_rss.py. La prima esecuzione vera crea le sue tabelle e lo registra.',
        'Verificare che l’API lo veda: curl localhost:3000/connectors/providers ora dovrebbe elencare rss con il suo manifesto di visualizzazione.',
        'Aprire l’app desktop, andare in Profilo → URL dell’API, incollare http://localhost:3000, salvare. Creare un account, poi aggiungere un flux — la voce rss appare una volta eseguito il connettore.',
        'Pianificare il connettore perché continui a girare: una voce di cron, un timer systemd, una pianificazione GitHub Actions, o il container Ofelia che il generatore predispone.',
      ],
      note: 'L’API non avvia mai i connettori. Sono programmi separati, con la loro pianificazione; l’unica cosa che condividono con l’API è il database.',
    },
    requirements: {
      heading: 'Cosa ti serve',
      items: [
        'Un database dell’elenco qui sotto, raggiungibile da dove gira l’API.',
        'Docker, o Node.js 22 o successivo se vai senza container.',
        'Facoltativamente un account Cloudflare, per fare deploy su Workers come l’istanza di riferimento.',
      ],
    },
    databases: {
      heading: 'Quale database',
      intro:
        'L’API non parla SQL direttamente. Chiama un contratto di archiviazione che un adattatore per motore soddisfa, e lo schema della tua DATABASE_URL sceglie l’adattatore. Sono inclusi quattro motori:',
      columnEngine: 'Motore',
      columnScheme: 'Schema URL',
      columnDriver: 'Driver da installare',
      note: 'Ogni motore supera la stessa suite di conformità — gli stessi comportamenti, verificati in CI contro un PostgreSQL, un MySQL, un SQLite e un MongoDB reali. È questo che rende la scelta reversibile: le tabelle, le collection e le colonne portano gli stessi nomi ovunque, così un provider si descrive una volta e cambia solo il suo dialetto.',
      workersNote:
        'Un’eccezione, e non è colpa nostra: Cloudflare Workers apre solo il tipo di connessione che usa PostgreSQL. I driver di MySQL, SQLite e MongoDB hanno bisogno di Node — Docker o Node.js nudo, non Workers.',
    },
    env: {
      heading: 'Configurazione',
      columnVariable: 'Variabile',
      columnRequired: 'Obbligatoria',
      columnDescription: 'Descrizione',
      yes: 'sì',
      no: 'no',
      descriptions: [
        'Lo schema sceglie il motore: postgres://, mysql://, sqlite:// o mongodb://. I build Node e Docker accettano anche DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASSWORD separatamente, per PostgreSQL.',
        'Segreto casuale che firma i token di autenticazione. Generane uno con openssl rand -hex 32. Deve restare lo stesso per tutta la vita dell’istanza — cambialo e ogni token esistente smette di funzionare.',
        'URL pubblico del tuo deploy web. Usato solo come destinazione di redirect OAuth; lascialo perdere se non abiliti il login con Google o GitHub.',
        'Abilita «Accedi con Google». Lascia vuoto per disabilitarlo.',
        'Abilita «Accedi con GitHub». Lascia vuoto per disabilitarlo.',
      ],
      note: 'Non c’è nessuna variabile per nome utente o password admin. La vecchia coppia API_USERNAME / API_PASSWORD non esiste più: gli admin sono righe nel database, e il primo si crea con npm run create-admin. Il login con e-mail e password per gli utenti normali funziona sempre, qualsiasi cosa tu faccia con le variabili OAuth.',
    },
    deploy: {
      heading: 'Fare il deploy dell’API',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Node.js nudo'],
      dockerIntro: 'La via più breve: clonare, riempire .env, avviare.',
      dockerNote:
        'Il file compose monta lo schema nella directory di init di Postgres, così le tabelle del nucleo sono create la prima volta che il volume viene inizializzato. L’API ascolta poi sulla porta 3000. Poi crea il super admin — vedi sotto.',
      workersIntro: 'Ciò che gira l’istanza di riferimento.',
      workersNote:
        'Il tuo database deve essere raggiungibile dalla rete di Cloudflare — un provider gestito con una stringa di connessione pubblica in pool è la risposta abituale. Workers non può raggiungere un database sulla tua rete domestica, né eseguire lo script create-admin: crea il super admin contro il database dalla tua macchina.',
      nodeIntro: 'Nessuna orchestrazione, solo il server compilato.',
      nodeNote:
        'Oppure costruisci tu stesso il Dockerfile fornito, se preferisci far girare un container senza Compose. L’immagine compilata porta anche lo script create-admin.',
    },
    schema: {
      heading: 'Creare le tabelle, e il primo admin',
      applyIntro:
        'Se non conti sull’auto-init di Compose, applica lo schema una volta tu stesso. Un file per motore, stessi nomi di tabelle e colonne in tutti:',
      applyNote:
        'I file SQL aggiungono soltanto — CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS — quindi rieseguibili in qualsiasi momento, anche contro un database che contiene già dati.',
      engineNotes: [
        'Lo schema di riferimento. Versione 14 o successiva.',
        'MySQL 8 o MariaDB 10.2 e successivi: l’API ordina il contenuto con una funzione finestra.',
        'Niente da ospitare — un file accanto all’API. Va bene per un’istanza personale, non per una che le app colpiscono da più punti contemporaneamente.',
        'Nessuno schema da applicare: MongoDB crea una collection alla prima scrittura. Contano solo gli indici, e l’API li crea da sola quando si connette — il comando qui sopra lo fa solo in anticipo.',
      ],
      adminIntro:
        'Gli admin sono righe della tabella admin; non c’è nessun account predefinito. Crea il primo — sempre un super admin — da riga di comando. Applica prima lo schema, poi inserisce la riga:',
      userIntro:
        'Gli account utente normali si creano dal modulo di registrazione delle app. Per farne uno senza modulo, per test:',
      verifyIntro: 'Poi verifica che l’API risponda:',
      verifyNote:
        'Un elenco di provider vuoto è la risposta attesa qui: niente ha ancora raccolto nulla. È la guida ai provider.',
    },
    auth: {
      heading: 'Utenti e autenticazione',
      intro:
        'Come le persone ottengono un account sulla tua istanza, e come attivare l’accesso con Google o GitHub.',
      registration: {
        heading: 'Modalità di registrazione',
        body: 'REGISTRATION_MODE decide cosa fa una registrazione pubblica. open (predefinito): l’account viene creato e la persona accede subito — il comportamento attuale. approval: la registrazione viene messa in attesa. POST /auth/register risponde 202 senza token, una registrazione OAuth torna con ?error=pending_approval, e un tentativo di accesso per un’e-mail in attesa risponde 403. Un admin lavora poi la coda in /admin/users → «Comptes en attente». Gli account creati da un admin sono sempre attivi, qualunque sia la modalità; così pure una registrazione OAuth la cui e-mail verificata corrisponde già a un account attivo.',
      },
      pointing: {
        heading: 'Dove le app accedono',
        body: 'Le app desktop e mobile, e le pagine web di accesso e registrazione, portano tutte una riga «Server» sulla schermata di accesso. Mostra l’host dell’API e si espande in un campo per cambiarlo o ripristinarlo — prima che esista un account, così nessuno deve accedere prima all’API predefinita. Ogni schermata legge GET /auth/config dell’istanza impostata e mostra solo i metodi di accesso che offre. L’app web ospitata rifiuta ancora un host privato (localhost, 10.x, 192.168.x…) come misura anti-SSRF: per puntare una UI web su un’API locale, esegui la tua copia di stayup-ui con STAYUP_API_URL impostato al deploy.',
      },
      oauth: {
        heading: 'Accesso con Google e GitHub',
        intro:
          'Facoltativo. Ogni provider richiede un’app OAuth di tua proprietà e quattro variabili d’ambiente sull’API:',
        steps: [
          'Crea un’app OAuth — Google su console.cloud.google.com/apis/credentials, GitHub su github.com/settings/developers.',
          'Imposta la sua URL di callback (o di redirect) su https://<origine-della-tua-api>/auth/oauth/<provider>/callback. Entrambi i provider consentono http://localhost per lo sviluppo.',
          'Metti il client ID e il secret in GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (o la coppia GITHUB_) sull’API.',
          'Imposta UI_URL sull’origine del tuo deploy web — dopo un OAuth da browser l’API reindirizza a UI_URL/api/auth/callback. L’app desktop intercetta quel percorso da sé, quindi le basta qualsiasi UI_URL non vuoto; l’app mobile usa il proprio deep link stayup://, già in allow-list.',
        ],
        note: 'Un’app OAuth GitHub ammette esattamente una URL di callback, quindi serve un’app GitHub per ogni origine di API. Il generatore di script chiede queste credenziali all’esecuzione e le scrive direttamente in docker-compose.yml, mai nello script.',
      },
    },

    pointing: {
      heading: 'Puntare un’app sulla tua istanza',
      items: [
        'Web: imposta STAYUP_API_URL sul tuo deploy — oppure lasciala e lascia che ogni visitatore la sovrascriva dal proprio profilo, dove è salvata per browser.',
        'Tutte e tre le app: la riga «Server» sulla schermata di accesso, o Profilo → «Server» una volta dentro, dove imposti, rinomini e ripristini ciascuno.',
        'L’interfaccia web di amministrazione è la stessa app web: punta il suo STAYUP_API_URL sulla tua API e apri /admin.',
        'Un’app, più istanze: da Profilo → «Server» puoi aggiungere istanze API secondarie; il feed unisce allora tutte le istanze, con ogni riga contrassegnata dal server di origine. Aggiungere o rimuovere un flusso viene instradato al server scelto. Nell’app web un server secondario si aggiunge con email e password; le app desktop e mobile accettano anche l’OAuth per i server secondari.',
      ],
      note: 'Nient’altro cambia. L’elenco dei provider, i dati e il rendering seguono tutti l’istanza configurata — incluso il ripiego semplice per i provider che l’app non conosce per nome.',
    },
    troubleshooting: {
      heading: 'Quando qualcosa non va',
      items: [
        {
          symptom: 'L’elenco dei provider torna vuoto.',
          cause:
            'Atteso su un database appena creato: nessun provider ci ha ancora girato contro. Fanne girare uno e ricontrolla.',
        },
        {
          symptom: 'Le app non mostrano contenuto, ma l’elenco dei provider è popolato.',
          cause:
            'I provider girano ma nessuno segue ancora nulla, o le sorgenti che seguono non portano contenuto nuovo. Aggiungi una sorgente dall’app.',
        },
        {
          symptom: 'Un provider appare come scheda di testo, a volte JSON grezzo.',
          cause:
            'Nessun template di visualizzazione utilizzabile. Il provider non ha scritto provider_registry.template, o la sua colonna content è una stringa JSON senza template per interpretarla. Vedi la guida ai provider.',
        },
        {
          symptom: 'Aggiungere un flux dice «richiesta inviata» invece di iscrivere.',
          cause:
            'Quel provider è in modo di approvazione manuale. Un admin lo approva o lo rifiuta da /admin/flux-requests. Cambia il modo su /admin/providers se non è ciò che vuoi.',
        },
        {
          symptom: 'create-admin dice che l’e-mail è già in uso.',
          cause:
            'Un super admin esiste già. Gli admin successivi si creano dall’interfaccia web di amministrazione, non da riga di comando.',
        },
        {
          symptom: 'Il login funziona ma ogni altra chiamata è rifiutata.',
          cause:
            'Il segreto di firma differisce tra l’istanza che ha emesso il tuo token e quella che risponde. I token non passano da un’istanza all’altra.',
        },
      ],
    },
  },
  admin: {
    meta: {
      title: 'StayUp — Amministrazione',
      description:
        'Gestire un’istanza di StayUp dal browser: admin, approvazione di flux per provider, la coda delle richieste, utenti e flux.',
    },
    eyebrow: 'Amministrazione',
    title: 'Gestire la tua istanza',
    lede: 'Una volta l’API avviata, l’interfaccia web di amministrazione è il posto da cui gestisci l’istanza in un browser: chi può aggiungere cosa, quali richieste sono in attesa, quali utenti seguono quali flux.',
    webUi: {
      heading: 'L’interfaccia web di amministrazione',
      body: 'È la stessa app web del sito pubblico, aperta su /admin, puntata sulla tua API. È opzionale — tutto ciò che fa ha una rotta API dietro — ma è il modo pratico di gestire un’istanza. Fanne il deploy come qualsiasi altra copia dell’app web, imposta STAYUP_API_URL sulla tua API, e accedi su /admin/login.',
      note: 'La sessione admin è un cookie separato da una sessione utente. Lo stesso browser può tenerle entrambe insieme senza che una disconnetta l’altra.',
    },
    roles: {
      heading: 'Super admin e admin',
      intro:
        'Due livelli. Il primo admin è sempre un super admin, creato da riga di comando (npm run create-admin). Ogni admin successivo si crea dalla UI ed è un admin normale.',
      columnRole: 'Ruolo',
      columnCan: 'Può fare',
      rows: [
        {
          role: 'Super admin',
          can: 'Tutto ciò che può un admin normale, più: creare, modificare ed eliminare altri admin. Non può essere eliminato dalla UI, né eliminare sé stesso.',
        },
        {
          role: 'Admin',
          can: 'Lavoro operativo: utenti, flux, modi di approvazione dei provider, la coda delle richieste. Non vede né tocca l’elenco degli admin. Può cambiare la propria password.',
        },
      ],
      note: 'Gli admin non sono account utente. Hanno la loro tabella, il loro login, e nessun feed proprio.',
    },
    managingAdmins: {
      heading: 'Gestire gli admin',
      body: 'Solo super admin, su /admin/admins:',
      steps: [
        'Creare un admin con un’e-mail, un nome e una password. È un admin normale — non può gestire altri admin.',
        'Modificare il nome, l’e-mail o la password di un admin.',
        'Eliminare un admin. Le righe super admin e la tua riga sono bloccate.',
      ],
      note: 'Un admin normale che deve cambiare la propria password lo fa da /admin/settings, con la sua password attuale.',
    },
    fluxApproval: {
      heading: 'Approvazione di flux per provider',
      intro:
        'Quando un utente aggiunge un flux che non esiste ancora, ciò che accade dipende dal modo di approvazione del provider. Impostalo per provider su /admin/providers.',
      autoBody:
        'auto — il predefinito. La sorgente è creata e l’utente iscritto subito. Buono per i provider dove qualsiasi URL va bene (RSS, un changelog).',
      manualBody:
        'manual — aggiungere un flux sconosciuto crea invece una richiesta (l’app mostra «richiesta inviata»). Non si crea nulla finché un admin non approva. Buono per i provider dove far girare una sorgente costa qualcosa, come lo scraping.',
      note: 'Iscriversi a un flux che esiste già non passa mai per l’approvazione — l’approvazione riguarda solo il portare una sorgente nuova nell’istanza.',
    },
    usersAndFluxes: {
      heading: 'Utenti e flux',
      body: 'Il resto della console è sfogliare e curare:',
      items: [
        '/admin/users — ogni account, con i flux che segue. Aggiungi o togli un’iscrizione per conto di qualcuno.',
        '/admin/repositories — ogni sorgente di tutti i provider, con la sua config. Creane una direttamente (utile per seminare un provider manuale), o ritirane una.',
        '/admin/flux-requests — la coda in attesa. Approva crea o riusa la sorgente e iscrive il richiedente; rifiuta la segna rifiutata. Entrambe sono definitive.',
      ],
    },
    dataSources: {
      heading: 'Database secondari',
      intro:
        'Il database principale regge l’istanza stessa — admin, utenti, iscrizioni, il registro dei provider. Oltre a questo, puoi puntare l’istanza su database secondari in sola lettura che portano solo dati dei connettori, e lasciare che gli utenti seguano i flux che vivono lì. Si gestiscono su /admin/data-sources.',
      steps: [
        'Il database principale sta in cima alla pagina, solo a titolo informativo: il suo motore e il suo host, niente da modificare.',
        'Aggiungere un secondario con un nome e una stringa di connessione. Sono supportati gli stessi quattro motori del principale.',
        'Testare la connessione. L’istanza verifica di potersi connettere e che sia presente almeno una tabella di connettore, ed elenca i provider trovati.',
        'Confermare. La stringa di connessione è memorizzata cifrata a riposo e la fonte entra nell’elenco. Rimuovila quando vuoi — le iscrizioni che puntavano ad essa se ne vanno con lei.',
      ],
      note: 'I provider con lo stesso nome sono uniti nelle app: un utente vede una sola scheda «RSS» la cui lista di flux raccoglie i flux di ogni database, e una riga arrivata da un secondario porta un piccolo badge con il nome del database. Non si scrive mai verso un secondario — è un’alimentazione di dati, non una seconda casa.',
    },

    addingFlux: {
      heading: 'Come un utente aggiunge un flux, da qualsiasi app',
      intro:
        'Lo stesso flusso per ogni provider — nelle app non c’è più alcun caso speciale per provider:',
      steps: [
        'Scegliere un provider.',
        'L’app mostra i flux che quel provider segue già e che tu non segui ancora. Un tocco iscrive — mai un’approvazione.',
        'Oppure passare a «aggiungine uno nuovo». Il campo è guidato dal descrittore form del provider: la sua etichetta, il suo segnaposto e la forma che si aspetta.',
        'Invia. Se il provider è auto, sei iscritto. Se è manual, l’app mostra «richiesta inviata» e un admin prende il testimone.',
      ],
      note: 'Per questo un provider dovrebbe portare un descrittore form nel suo template — è ciò che trasforma un campo di testo nudo in «incolla un handle YouTube» o «incolla un URL di feed».',
    },
  },
  generate: {
    meta: {
      title: 'StayUp — Genera un’installazione self-hosted',
      description:
        'Scegli un database e i connettori che vuoi e scarica un unico script bash che avvia la tua istanza di StayUp.',
    },
    eyebrow: 'Installazione',
    title: 'Genera il tuo script di installazione',
    lede: 'Scegli un database e i connettori che vuoi. Ottieni un unico script bash che clona i repo, scrive la configurazione Docker, crea il tuo super amministratore e avvia tutto.',
    how: {
      heading: 'Cosa fa lo script',
      items: [
        'Clona l’API, i connettori scelti e — se lo tieni — l’interfaccia web di amministrazione.',
        'Scrive un docker-compose.yml con PostgreSQL, l’API, un container per connettore e uno scheduler Ofelia.',
        'Ti chiede l’account super amministratore e la frequenza di ogni connettore.',
        'Applica lo schema, crea il super amministratore ed esegue ogni connettore una volta perché si registri.',
        'Avvia l’API, l’interfaccia e lo scheduler.',
      ],
      note: 'Tutto gira sulla tua macchina in Docker. Non viene inviato nulla da nessuna parte — la pagina costruisce lo script nel tuo browser.',
    },
    requirements: {
      heading: 'Prima di eseguirlo',
      items: [
        'Docker e Docker Compose v2 (`docker compose`).',
        'git.',
        'Linux o macOS. Su Windows, esegui lo script dentro WSL.',
      ],
    },
    form: {
      database: 'Database',
      comingSoon: 'presto',
      connectors: 'Connettori ufficiali',
      customConnectors: 'I tuoi connettori',
      customHint:
        'Qualsiasi repo git con un Dockerfile nella radice il cui ENTRYPOINT esegue il collettore una volta, legge DATABASE_URL e si registra in provider_registry. Vedi la guida ai provider.',
      customConnectorAdd: 'Aggiungi un connettore',
      customUrlPlaceholder: 'https://github.com/tu/tuo-connettore.git',
      customNamePlaceholder: 'nome (opzionale)',
      remove: 'Rimuovi',
      adminUi: 'Includi l’interfaccia web di amministrazione',
      adminUiHint: 'Gestire i provider, approvare le richieste di flux, aggiungere amministratori.',
      registration: 'Registrazione',
      registrationOpen: 'Aperta',
      registrationOpenHint: 'Chiunque raggiunga l’API può creare subito un account.',
      registrationApproval: 'Su approvazione',
      registrationApprovalHint: 'I nuovi account restano in coda finché un admin non li attiva.',
      signInMethods: 'Metodi di accesso',
      emailPassword: 'E-mail + password',
      oauthHint:
        'Lo script chiederà client ID e secret OAuth all’esecuzione — non finiscono mai nello script.',
      advanced: 'Avanzate',
      projectDir: 'Cartella del progetto',
      apiPort: 'Porta API',
      uiPort: 'Porta UI',
      dbPort: 'Porta database',
      preview: 'stayup-setup.sh',
      download: 'Scarica',
      copy: 'Copia',
      copied: 'Copiato',
      invalid: 'Impossibile generare',
    },
    run: {
      heading: 'Eseguilo',
      intro: 'Salva il file, poi:',
      note: 'La prima esecuzione costruisce ogni immagine e può richiedere qualche minuto.',
    },
    after: {
      heading: 'Dopo l’installazione',
      items: [
        'Doc API: http://localhost:3000/docs — Interfaccia di amministrazione: http://localhost:3001/admin.',
        'Nell’app desktop o mobile, imposta l’URL dell’API su http://localhost:3000 e crea un account.',
        'Aggiungi i feed dall’app — ogni provider offre un elenco di flux esistenti e un modulo per uno nuovo.',
        'Rimuovi tutto con: docker compose --profile connectors down -v (elimina il database).',
      ],
      note: 'Lo scheduler monta il socket Docker per avviare i connettori secondo il calendario — equivalente a root sull’host, va bene per un’istanza di sviluppo locale.',
    },
  },
  providers: {
    meta: {
      title: 'StayUp — Provider',
      description:
        'Scrivere un programma che trasforma qualsiasi sorgente esterna in contenuto StayUp.',
    },
    eyebrow: 'Provider',
    title: 'Collegare una nuova sorgente',
    lede: 'Un provider è un programma che va a prendere un tipo di sorgente e salva ciò che trova. È l’unica cosa che scrivi per estendere StayUp — l’API e le tre app lo raccolgono da sole.',
    what: {
      heading: 'Cos’è davvero un provider',
      body: 'Non un plugin, non un modulo da registrare: un programma ordinario, in qualsiasi linguaggio, avviato su pianificazione. Legge l’elenco delle sorgenti a lui destinate, va a prendere ciascuna, tiene ciò che è nuovo, e lo scrive nel database. L’API lo raccoglie da sola, e le tre app lo mostrano — senza che una riga di codice cambi da nessuna parte.',
      note: 'Un provider non chiama mai l’API di StayUp. Parla con il database, e solo con il database.',
      diagram: {
        title: 'Un provider, passo per passo',
        sources: 'Le sue sorgenti, lette dal database',
        sourcesItems: 'i feed di podcast che questo provider ha ricevuto l’ordine di seguire',
        fetch: 'Andare a prendere ogni feed',
        compare: 'Tenere solo ciò che non c’era prima',
        store: 'Scrivere nel database',
        exposed: 'L’API lo espone, le app lo mostrano',
      },
      steps: {
        heading: 'A ogni esecuzione',
        items: [
          'Leggere le sorgenti a te destinate.',
          'Andare a prendere ciascuna nel mondo esterno.',
          'Confrontare con ciò che avevi salvato l’ultima volta, e tenere solo il nuovo.',
          'Scrivere i nuovi elementi nel database.',
          'Togliere ciò che è troppo vecchio, e registrare un errore invece di schiantarti su di esso.',
          'Ridichiarare il tuo nome visualizzato e il tuo template, perché un database appena creato ti scopra alla prima esecuzione.',
        ],
      },
    },
    access: {
      heading: 'Prima di iniziare: dove scriverà?',
      body: 'Un provider ha bisogno di accesso in scrittura al database dell’istanza che alimenta. Sull’istanza pubblica non ce l’hai, quindi in pratica un provider tuo va di pari passo con un’istanza tua. Scriverne uno non richiede nulla dalla guida all’installazione; farne girare uno richiede un database su cui puoi scrivere.',
      cta: 'Guida all’installazione',
    },
    existing: {
      heading: 'Esempi concreti da leggere',
      body: 'Parti da stayup-cmd-template: uno scheletro nudo fatto per essere copiato, con i tre punti da modificare segnati. Poi leggi quelli veri — changelog, youtube, rss, scrap, github-trending — che è ciò che l’istanza di riferimento si trova a far girare, non una definizione di ciò che StayUp copre. Il rss è l’esempio reale più corto del contratto qui sotto; github-trending è il riferimento per un template di visualizzazione ricco. Punta uno qualsiasi sul tuo database se ti va bene.',
      cta: 'Apri stayup-cmd-template',
    },
    creating: {
      heading: 'Scrivere il tuo',
      naming: {
        heading: 'Scegliere un nome',
        intro:
          'Qualcosa di corto e minuscolo, usabile come identificatore — podcast, hackernews, reddit_thread. Quell’unica stringa è usata così com’è in più punti:',
        columnWhere: 'Dove',
        columnExample: 'Per «podcast»',
        rows: [
          'La tua tabella dati',
          'Le sorgenti che ti appartengono',
          'La tua riga nel registro',
          'Il campo provider che le app inviano all’aggiunta di un flux',
        ],
        note: 'Niente da riservare in anticipo: il nome è semplicemente quello con cui crei la tabella. Due provider collidono solo scegliendo lo stesso.',
      },
      shape: {
        heading: 'Cosa salvi',
        body: 'Una riga per elemento trovato. Il contenuto stesso può essere testo semplice o JSON — decidi tu. Senza template di visualizzazione le app mostrano una scheda semplice: l’inizio del contenuto, la data, il tuo nome visualizzato. Funziona, è solo visivamente sobrio, e mostra JSON grezzo se è ciò che contiene la tua colonna content. Un template lo sistema, ed è la sezione successiva.',
      },
      schedule: {
        heading: 'Farlo girare su pianificazione',
        body: 'Copia un qualsiasi collettore esistente: un Dockerfile alla radice il cui ENTRYPOINT esegue lo script una volta, e un job che lo lancia con l’URL del database nell’ambiente. Nulla impone una CI particolare — un timer systemd, un cron nudo, o il container Ofelia del generatore fanno lo stesso.',
      },
    },
    templates: {
      heading: 'Template di visualizzazione',
      body: 'Un template è un manifesto JSON che il tuo provider salva in provider_registry.template, nello stesso upsert del suo nome visualizzato. L’API lo trasmette così com’è tramite GET /connectors/providers; ogni app ha un motore che lo legge e rende le tue righe — una disposizione a elenco, e un riquadro di lettura in uno di sette modi: testo, html, media, audio, galleria, tabella, elenco di link. Nessun codice delle app conosce il nome del tuo provider.',
      fallbackNote:
        'Un provider senza template (colonna NULL, JSON illeggibile, o una version non riconosciuta) funziona lo stesso — le app ripiegano sulla scheda semplice. Un template è vivamente consigliato non appena il tuo contenuto è qualcosa di più di una breve riga di testo.',
      cta: 'Riferimento completo dei template',
    },
    form: {
      heading: 'Il descrittore form',
      body: 'Nel template, un piccolo blocco form dice alle app che aspetto deve avere il campo «aggiungi un nuovo flux» per il tuo provider. Senza di esso, l’utente ha un campo di testo nudo; con esso, un campo etichettato che convalida e costruisce l’URL della sorgente al posto suo.',
      fields: [
        {
          field: 'label · placeholder',
          meaning: 'cosa dice il campo e cosa mostra come suggerimento.',
        },
        {
          field: 'urlTemplate',
          meaning:
            'es. https://www.youtube.com/@{value} — {value} è ciò che l’utente ha digitato. Ignorato se il valore è già un URL http(s).',
        },
        {
          field: 'pattern',
          meaning:
            'una regex che l’input trasformato deve soddisfare, verificata lato client prima dell’invio.',
        },
        {
          field: 'transform',
          meaning:
            'trim, rimuovere un prefisso/suffisso noto, o estrarre un gruppo di cattura — perché un URL completo incollato e un handle nudo finiscano uguali.',
        },
      ],
      note: 'Le app salvano l’URL costruito come sorgente; il tuo collettore lo rilegge dalla riga repository come qualsiasi altro.',
    },
    fluxApproval: {
      heading: 'Modo di approvazione',
      body: 'Ogni provider ha una colonna flux_approval nel registro: auto (predefinito) o manual. auto iscrive l’utente subito quando aggiunge un nuovo flux; manual ne fa una richiesta che un admin deve approvare. Un provider può seminare il proprio predefinito nell’upsert; un admin lo sovrascrive per istanza da /admin/providers. Lo scraping è consegnato in manual per un motivo — far girare una sorgente lì costa qualcosa.',
      note: 'Questo riguarda solo il portare una sorgente nuova. Iscriversi a una sorgente che esiste già non passa mai per l’approvazione.',
    },
    contract: {
      heading: 'Contratto tecnico',
      lede: 'Materiale di riferimento. Ti serve per scrivere un provider, non per capire StayUp.',
      diagramTitle: 'Cosa il tuo script può toccare',
      yourScript: 'Il tuo provider',
      readOnly: 'sola lettura',
      readWrite: 'lettura e scrittura — interamente tua',
      upsertOne: 'una riga: la tua',
      writeOnError: 'scrittura su errore',
      repositoryDesc: 'le sorgenti da seguire',
      connectorDesc: 'il contenuto che raccogli',
      registryDesc: 'il tuo nome visualizzato + template',
      logDesc: 'errori, invece di schiantarsi',
      warning:
        'Non scrivere mai nella tabella di un altro provider, né nelle tabelle user, session, account, admin, subscription o flux_request: appartengono all’API e all’app web.',
      tablesHeading: 'Le quattro tabelle',
      tablesIntro:
        'Il tuo passo di init, lanciato all’inizio di ogni esecuzione, deve assicurarsi che queste esistano. Ogni istruzione è idempotente — sicura da rieseguire ogni volta, e sicura se un altro provider o l’API ha creato quelle condivise per prime.',
      engineIntro:
        'Scegli il motore che gira la tua istanza. I nomi non cambiano mai da una scheda all’altra — solo il dialetto e i tipi, ed è per questo che un provider scritto per un motore si legge uguale contro un altro.',
      engineNotes: [
        'Il dialetto di riferimento, e ciò che gira l’istanza pubblica.',
        'Stesse tabelle, tipi MySQL. Un URL deve stare in un VARCHAR indicizzabile, da cui la lunghezza esplicita.',
        'Nessun server: il tuo provider e l’API aprono lo stesso file. Date e JSON salvati come testo, che l’API riparsa alla lettura.',
        'Una collection invece di una tabella, e nessuno schema da dichiarare — ma due regole. Un documento repository porta un _id numerico, preso dalla collection counters, perché il contratto designa una sorgente con un numero. E niente va in cascata: ciò che scrivi, lo pulisci.',
      ],
      repositoryTitle: 'repository — condivisa, per lo più la leggi',
      repositoryBody:
        'Una riga è una cosa da seguire: un feed di podcast, un subreddit, ciò che il tuo provider chiama una sorgente. La colonna type deve essere uguale al nome del tuo provider. La colonna config è JSON libero che solo il tuo script definisce e interpreta.',
      connectorTitle: 'connector_<name> — tua, interamente',
      connectorBody: 'Colonne opzionali, usate se presenti ma mai obbligatorie:',
      optionalDescriptions: [
        'il timestamp proprio del contenuto, preferito all’ora di esecuzione quando si ordina per «il più recente».',
        'un’etichetta breve mostrata accanto ai render ricchi — un tag di versione, un id di video, ecc.',
      ],
      registryTitle: 'provider_registry — condivisa, una riga per te',
      registryBody:
        'Il sort order incide solo sull’ordine in cui i provider appaiono nelle app; va bene qualsiasi intero. La colonna template è il tuo manifesto di visualizzazione (sezioni precedenti); lasciala NULL e il tuo provider funziona lo stesso, solo con la scheda semplice. flux_approval è un’impostazione dell’operatore — non litigare con un admin, ma puoi seminare un predefinito sensato. Ometti la riga del tutto e l’API ripiega su una versione con l’iniziale maiuscola del tuo nome.',
      logTitle: 'log — condivisa, opzionale ma consigliata',
      logBody:
        'Scrivi qui invece di schiantarti quando una sorgente fallisce, e prosegui con le altre.',
      addingSources: {
        heading: 'Far entrare le sorgenti',
        body: 'Due modi. Supporta un flag --add che inserisce una riga ed esce — comodo per seminare direttamente contro il database. L’altro modo, quello che gli utenti finali prendono davvero, è aggiungere una sorgente da un’app, che fa POST a /providers/<name>/fluxes; il campo provider deve essere uguale al suffisso della tua tabella.',
      },
      checklist: {
        heading: 'Prima di dirlo finito',
        items: [
          'creata con almeno un id, un riferimento di sorgente, il contenuto, un timestamp e un flag di successo.',
          'riga upsertata a ogni esecuzione, con il tuo nome visualizzato e (consigliato) il tuo template.',
          'sorgenti lette con il nome del tuo provider.',
          'voci vecchie potate — o l’assenza di retention documentata.',
          'errori per sorgente scritti qui invece di far cadere l’esecuzione.',
          'elenca il tuo provider dopo un’esecuzione.',
          'restituisce i tuoi dati.',
        ],
      },
    },
  },
}
