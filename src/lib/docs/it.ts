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
        'Come funziona StayUp, come gestire una propria istanza e come collegarvi una nuova fonte.',
    },
    eyebrow: 'Documentazione',
    title: 'Come funziona StayUp',
    lede: 'Parti da qui. Due minuti di concetti, poi scegli il percorso che ti serve davvero.',

    concept: {
      heading: 'L’idea, in quattro frasi',
      points: [
        'StayUp ti mostra i contenuti nuovi delle fonti che segui. Cosa conti come fonte non è fissato: è ciò che un provider sa andare a prendere.',
        'Un provider è un piccolo programma che va a prendere un tipo di fonte e scrive ciò che trova in un database PostgreSQL. Coprire un nuovo tipo di fonte significa scrivere un provider; nient’altro cambia in StayUp.',
        'L’API di StayUp legge quel database e lo serve alle app. Non fissa alcun tipo di fonte nel codice: a ogni richiesta chiede al database quali provider esistono in quel momento.',
        'Le app leggono l’API. Ognuna può puntare a qualsiasi istanza, quindi a qualsiasi database — e ognuna sa mostrare un provider di cui non ha mai sentito parlare.',
      ],
      note: 'L’insieme delle fonti è aperto per costruzione. Un’istanza mostra esattamente i provider che girano sul suo database: nessun elenco integrato, nulla da registrare.',
      diagram: {
        title: 'Da una fonte fino al tuo schermo',
        sources: 'Fonti esterne',
        sourcesItems:
          'un feed di podcast · una discussione di forum · una pagina di stato · qualsiasi cosa un programma sappia leggere',
        providers: 'Provider',
        providersSub: 'un piccolo programma per tipo di fonte',
        database: 'PostgreSQL',
        databaseSub: 'tutto ciò che è stato raccolto, in un unico posto',
        api: 'API di StayUp',
        apiSub: 'legge il database, serve le app',
        apps: 'Web · Desktop · Mobile',
        appsSub: 'ognuna configurabile verso un’altra istanza',
      },
    },

    paths: {
      heading: 'Di quale percorso hai bisogno?',
      selfHostingTitle: 'Gestire una propria istanza',
      selfHostingBody:
        'La tua API e il tuo database, così i tuoi dati restano tuoi e scegli tu cosa ci gira sopra.',
      selfHostingCta: 'Guida al self-hosting',
      providersTitle: 'Collegare una nuova fonte',
      providersBody:
        'Scrivi un provider: un programma che va a prendere una fonte che StayUp non copre ancora e salva ciò che trova.',
      providersCta: 'Guida ai provider',
      relation:
        'Le due cose sono legate ma distinte. Un provider non parla mai con l’API, solo con il database: puoi quindi scriverne uno senza leggere una riga della guida al self-hosting. Farlo girare è un altro discorso: gli serve accesso in scrittura al database che alimenta, e sull’istanza pubblica non ce l’hai. In pratica, un provider tuo va insieme a un’istanza tua.',
    },
  },

  selfHosting: {
    meta: {
      title: 'StayUp — Self-hosting',
      description: 'Gestisci la tua API di StayUp e il tuo database, e punta le app su di essi.',
    },
    eyebrow: 'Self-hosting',
    title: 'Gestire una propria istanza',
    lede: 'Un’istanza è fatta di tre pezzi: un database, l’API davanti a esso, e i provider che scegli per alimentarlo.',

    why: {
      heading: 'Perché prendersi il disturbo',
      intro: 'L’istanza pubblica ha i suoi provider e i suoi dati. Gestire la tua ti permette di:',
      items: [
        'tenere tutto in un database che controlli;',
        'scegliere quali provider girano, e con che frequenza;',
        'seguire fonti che l’istanza pubblica non copre;',
        'puntarci le app web, desktop e mobile: un’impostazione, nessuna modifica al codice.',
      ],
      note: 'Le istanze non si parlano tra loro. Parti da un database vuoto e senza provider, finché non ne fai girare uno.',
    },

    pieces: {
      heading: 'I tre pezzi',
      database: 'PostgreSQL',
      databaseBody:
        'Contiene tutto: le fonti seguite, i contenuti raccolti, gli account. Versione 14 o successiva, raggiungibile da dove gira l’API.',
      api: 'API di StayUp',
      apiBody:
        'Un sottile strato senza stato sopra quel database. Non fissa alcun nome di provider nel codice: a ogni richiesta chiede a Postgres cosa c’è.',
      providers: 'Provider',
      providersBody:
        'I programmi che riempiono davvero il database. Senza almeno uno, la tua istanza funziona ma non mostra nulla.',
    },

    requirements: {
      heading: 'Cosa ti serve',
      items: [
        'Un database PostgreSQL, versione 14 o successiva, raggiungibile da dove gira l’API.',
        'Node.js 22 o successivo, se non usi Docker.',
        'Facoltativamente un account Cloudflare, per il deploy su Workers come l’istanza di riferimento.',
      ],
    },

    env: {
      heading: 'Configurazione',
      columnVariable: 'Variabile',
      columnRequired: 'Obbligatoria',
      columnDescription: 'Descrizione',
      yes: 'sì',
      no: 'no',
      descriptions: [
        'postgres://user:pass@host:port/dbname. Le build Node e Docker accettano anche DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASSWORD separatamente.',
        'Segreto casuale che firma i token di autenticazione. Generane uno con openssl rand -hex 32.',
        'L’unico account di servizio amministrativo. Non esiste alcuna riga admin nel database: chi accede con queste credenziali ottiene il ruolo di amministratore. Gli utenti normali si registrano dalle app.',
        'URL pubblico del tuo deploy web. Usato come destinazione del redirect OAuth.',
        'Abilita «Accedi con Google». Lasciala vuota per disattivarlo.',
        'Abilita «Accedi con GitHub». Lasciala vuota per disattivarlo.',
      ],
      note: 'L’accesso con e-mail e password funziona sempre, qualunque cosa tu faccia con le variabili OAuth.',
    },

    deploy: {
      heading: 'Fare il deploy dell’API',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Node.js puro'],
      dockerIntro: 'La via più breve: clonare, compilare .env, avviare.',
      dockerNote:
        'Il file compose monta lo schema nella cartella di inizializzazione di Postgres, quindi le tabelle di base nascono alla prima inizializzazione del volume. L’API resta poi in ascolto sulla porta 3000.',
      workersIntro: 'Ciò che gira sull’istanza di riferimento.',
      workersNote:
        'Il tuo database deve essere raggiungibile dalla rete di Cloudflare: un provider gestito con una stringa di connessione pubblica e in pool è la scelta abituale. Workers non arriva a un database sulla tua rete domestica.',
      nodeIntro: 'Nessuna orchestrazione, solo il server compilato.',
      nodeNote:
        'Oppure costruisci tu stesso il Dockerfile fornito, se preferisci un container senza Compose.',
    },

    schema: {
      heading: 'Creare le tabelle, e il tuo primo account',
      applyIntro:
        'Se non ti affidi all’auto-inizializzazione di Compose, applica lo schema una volta:',
      applyNote:
        'Si limita ad aggiungere — CREATE TABLE IF NOT EXISTS — quindi si può rieseguire in qualsiasi momento, anche su un database che contiene già dati.',
      userIntro:
        'L’accesso amministrativo è la coppia utente e password qui sopra: non c’è nulla da creare. Per un account normale, senza passare da un modulo di registrazione:',
      verifyIntro: 'Poi verifica che risponda:',
      verifyNote:
        'Un elenco di provider vuoto è la risposta attesa qui: nulla ha ancora raccolto niente. È l’argomento della guida ai provider.',
    },

    pointing: {
      heading: 'Puntare un’app alla tua istanza',
      items: [
        'Web: imposta l’URL dell’API sul tuo deploy, oppure lascialo e permetti a ogni visitatore di sostituirlo dal proprio profilo, dove viene salvato per browser.',
        'Desktop e mobile: Profilo, poi «URL dell’API», incolla il tuo e salva. «Ripristina predefinito» torna in qualsiasi momento a quello integrato.',
      ],
      note: 'Nient’altro cambia. L’elenco dei provider, i dati e la resa seguono tutti l’istanza configurata, compresa la visualizzazione sobria per i provider che l’app non conosce per nome.',
    },

    troubleshooting: {
      heading: 'Quando qualcosa non va',
      items: [
        {
          symptom: 'L’elenco dei provider torna vuoto.',
          cause:
            'Atteso su un database nuovo: nessun provider ci ha ancora girato contro. Fanne girare uno e ricontrolla.',
        },
        {
          symptom: 'Le app non mostrano nulla, ma l’elenco dei provider è popolato.',
          cause:
            'I provider girano, ma nessuno segue ancora niente, oppure le fonti seguite non hanno novità. Aggiungi una fonte dall’app.',
        },
        {
          symptom: 'Tutto risponde 500 poco dopo aver aggiunto un provider.',
          cause:
            'Di solito il database: verifica che l’API lo raggiunga ancora e che il collector non si sia fermato a metà della creazione delle sue tabelle.',
        },
        {
          symptom: 'L’accesso funziona ma tutte le altre chiamate vengono rifiutate.',
          cause:
            'Il segreto di firma differisce tra l’istanza che ha emesso il token e quella che risponde. I token non valgono da un’istanza all’altra.',
        },
      ],
    },
  },

  providers: {
    meta: {
      title: 'StayUp — Provider',
      description: 'Scrivi un programma che trasformi qualsiasi fonte esterna in contenuto StayUp.',
    },
    eyebrow: 'Provider',
    title: 'Collegare una nuova fonte',
    lede: 'Un provider è un programma che va a prendere un tipo di fonte e salva ciò che trova. È l’unica cosa che scrivi per estendere StayUp: l’API e le tre app lo raccolgono da sole.',

    what: {
      heading: 'Cos’è davvero un provider',
      body: 'Non un plugin, non un modulo da registrare: un programma qualunque, nel linguaggio che vuoi, avviato a intervalli regolari. Legge l’elenco delle fonti a lui destinate, recupera ciascuna, tiene ciò che è nuovo e lo scrive nel database. L’API lo raccoglie da sola e le tre app lo mostrano, senza che cambi una riga di codice da nessuna parte.',
      note: 'Un provider non chiama mai l’API di StayUp. Parla con PostgreSQL, e solo con PostgreSQL.',
      diagram: {
        title: 'Un provider, passo per passo',
        sources: 'Le sue fonti, lette dal database',
        sourcesItems: 'i feed di podcast che questo provider ha il compito di seguire',
        fetch: 'Recuperare ogni feed',
        compare: 'Tenere solo ciò che non c’era',
        store: 'Scrivere in PostgreSQL',
        exposed: 'L’API lo espone, le app lo mostrano',
      },
      steps: {
        heading: 'A ogni esecuzione',
        items: [
          'Leggere le fonti a te destinate.',
          'Recuperare ciascuna dall’esterno.',
          'Confrontare con quanto salvato la volta prima, e tenere solo il nuovo.',
          'Scrivere gli elementi nuovi nel database.',
          'Ripulire ciò che è troppo vecchio, e registrare un errore invece di andare in crash.',
        ],
      },
    },

    access: {
      heading: 'Prima di iniziare: dove scriverà?',
      body: 'Un provider ha bisogno di accesso in scrittura al database dell’istanza che alimenta. Sull’istanza pubblica non ce l’hai, quindi in pratica un provider tuo va insieme a un’istanza tua. Scriverne uno non richiede nulla dalla guida al self-hosting; farlo girare richiede un database su cui puoi scrivere.',
      cta: 'Guida al self-hosting',
    },

    existing: {
      heading: 'Esempi da leggere',
      body: 'Esistono già alcuni provider come repository autonomi. Sono quelli che l’istanza di riferimento si trova a far girare, non una definizione di ciò che StayUp copre. Leggine uno come esempio funzionante del contratto qui sotto, e puntalo al tuo database se ti torna utile. Quello RSS è il più breve.',
    },

    creating: {
      heading: 'Scrivere il proprio',
      naming: {
        heading: 'Scegliere un nome',
        intro:
          'Qualcosa di breve e in minuscolo, valido come identificatore: podcast, hackernews, reddit_thread. Quella singola stringa viene usata alla lettera in tre punti:',
        columnWhere: 'Dove',
        columnExample: 'Per «podcast»',
        rows: ['La tua tabella dati', 'Le fonti che ti appartengono', 'Il tuo nome visualizzato'],
        note: 'Non c’è nulla da prenotare in anticipo: il nome è semplicemente quello con cui crei la tabella. Due provider si scontrano solo se scelgono lo stesso.',
      },
      shape: {
        heading: 'Cosa memorizzi',
        body: 'Una riga per ogni elemento trovato. Il contenuto stesso può essere testo semplice o JSON, decidi tu. Le app non hanno una resa dedicata per un provider appena nato, quindi lo mostrano come scheda sobria: l’inizio del contenuto, la data, il tuo nome visualizzato. Funziona, è solo visivamente essenziale. Una resa più ricca è facoltativa, separata, e nulla nel contratto la richiede.',
      },
      schedule: {
        heading: 'Eseguirlo a intervalli regolari',
        body: 'Copia un collector esistente qualsiasi: un Dockerfile e un job giornaliero che lancia lo script con l’URL del database come segreto. Nulla richiede una CI in particolare: un timer systemd o un cron classico fanno lo stesso.',
      },
    },

    contract: {
      heading: 'Contratto tecnico',
      lede: 'Materiale di riferimento. Ti serve per scrivere un provider, non per capire StayUp.',
      diagramTitle: 'Cosa può toccare il tuo script',
      yourScript: 'Il tuo provider',
      readOnly: 'sola lettura',
      readWrite: 'lettura e scrittura — interamente tua',
      upsertOne: 'una riga: la tua',
      writeOnError: 'scrivi in caso di errore',
      repositoryDesc: 'le fonti da seguire',
      connectorDesc: 'i contenuti che raccogli',
      registryDesc: 'il tuo nome visualizzato',
      logDesc: 'gli errori, invece del crash',
      warning:
        'Non scrivere mai nella tabella di un altro provider, né nelle tabelle di utenti, sessioni, account o iscrizioni: appartengono all’API e all’app web.',
      tablesHeading: 'Le quattro tabelle',
      tablesIntro:
        'Il tuo passo di inizializzazione, eseguito all’inizio di ogni esecuzione, deve garantirne l’esistenza. Ogni istruzione è idempotente: ripetibile ogni volta senza rischi, anche se un altro provider ha creato prima quelle condivise.',
      repositoryTitle: 'repository — condivisa, tu perlopiù la leggi',
      repositoryBody:
        'Una riga è una cosa da seguire: un feed di podcast, un subreddit, ciò che il tuo provider chiama fonte. La colonna type deve corrispondere al nome del tuo provider. La colonna config è JSON libero che solo il tuo script definisce e interpreta.',
      connectorTitle: 'connector_<name> — tua, per intero',
      connectorBody: 'Colonne facoltative, usate se presenti ma mai richieste:',
      optionalDescriptions: [
        'la marca temporale propria del contenuto, preferita all’orario di esecuzione quando si ordina per novità.',
        'un’etichetta breve mostrata accanto alle rese ricche: un tag di release, un id video e così via.',
      ],
      registryTitle: 'provider_registry — condivisa, una riga per te',
      registryBody:
        'L’ordinamento incide solo sull’ordine con cui i provider compaiono nelle app; va bene qualsiasi intero. Salta questa tabella e il tuo provider funziona lo stesso: l’API ripiega sul tuo nome con l’iniziale maiuscola.',
      logTitle: 'log — condivisa, facoltativa ma consigliata',
      logBody:
        'Scrivi qui invece di andare in crash quando una fonte fallisce, e prosegui con le altre.',
      addingSources: {
        heading: 'Far entrare le fonti',
        body: 'Due modi. Prevedi un flag --add che inserisce una riga ed esce: comodo per popolare direttamente il database. L’altra via, quella che gli utenti percorrono davvero, è aggiungere una fonte dall’app, dove il campo provider deve corrispondere al suffisso della tua tabella.',
      },
      checklist: {
        heading: 'Prima di considerarlo finito',
        items: [
          'creata con almeno un identificatore, un riferimento alla fonte, il contenuto, una marca temporale e un indicatore di riuscita.',
          'riga aggiornata o inserita a ogni esecuzione.',
          'fonti lette con il nome del tuo provider.',
          'voci vecchie ripulite, o assenza di retention documentata.',
          'errori per fonte scritti qui invece di far cadere l’esecuzione.',
          'elenca il tuo provider dopo un’esecuzione.',
          'restituisce i tuoi dati.',
        ],
      },
    },
  },
}
