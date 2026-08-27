import type { DocContent } from './en'

export const it: DocContent = {
  meta: {
    title: 'StayUp — Self-hosting e creazione di provider',
    description:
      'Gestisci la tua istanza di stayup-api e scrivi un provider che si innesta su StayUp senza toccare il codice delle app.',
  },
  nav: {
    onThisPage: 'In questa pagina',
    backToSite: 'Torna al sito',
  },
  eyebrow: 'Documentazione',
  title: 'Self-hosting di StayUp e creazione di provider',
  lede: 'Due pubblici, una pagina: gestire la propria istanza di stayup-api sui propri dati, e scrivere un provider che si innesta senza toccare una riga delle quattro app.',

  overview: {
    heading: 'Come si incastrano i pezzi',
    points: [
      'stayup-api è un sottile strato HTTP senza stato sopra un unico database PostgreSQL. Non fissa mai un nome di provider nel codice. A ogni richiesta chiede a Postgres quali tabelle connector_* esistono in quel momento e quale nome visualizzato ciascuna ha registrato: quella risposta è l’elenco dei provider.',
      'Un provider è uno script indipendente (oggi Python, domani qualsiasi cosa) che possiede esattamente una tabella e vi scrive righe a intervalli regolari. Non parla mai con stayup-api: parla con lo stesso database Postgres.',
      'Nemmeno le tre app client fissano un URL dell’API. Ognuna porta un valore predefinito, e chiunque può puntarlo a un’altra istanza di stayup-api dal proprio profilo: altro database, altri provider, altri dati.',
    ],
    note: 'Le istanze non si coordinano. Facendo self-hosting parti da un database vuoto e zero provider, finché almeno un collector non gira su di esso. Nulla viene condiviso con l’istanza di riferimento.',
    diagram: {
      title: 'Architettura complessiva',
      providers: 'Provider — script indipendenti, uno per tipo di fonte',
      yourProvider: 'il tuo nuovo provider…',
      writesCron: 'scrive, a intervalli regolari',
      database: 'PostgreSQL',
      dbShared: 'condivisa',
      dbPerProvider: 'una per provider',
      readsWrites: 'legge e scrive, via SQL',
      api: 'stayup-api',
      apiSubtitle: 'senza stato — scopre i provider in Postgres al momento della richiesta',
      http: 'HTTP, su un URL configurabile',
      clients: 'App client',
      endUser: 'utente finale',
      note: 'Qualsiasi client può puntare a qualsiasi istanza, e quindi a qualsiasi database. Esiste un’istanza di riferimento; il self-hosting è uno stack parallelo della stessa forma, scollegato da essa.',
    },
  },

  part1: {
    eyebrow: 'Parte 1',
    heading: 'Self-hosting di stayup-api',
    requirements: {
      heading: 'Requisiti',
      items: [
        'Un database PostgreSQL (14 o successivo) raggiungibile da dove gira l’API.',
        'Node.js 22 o successivo, se non usi Docker.',
        'Facoltativamente un account Cloudflare, se vuoi fare il deploy su Workers come l’istanza di riferimento.',
      ],
    },
    env: {
      heading: 'Variabili d’ambiente',
      columnVariable: 'Variabile',
      columnRequired: 'Obbligatoria',
      columnDescription: 'Descrizione',
      yes: 'sì',
      no: 'no',
      descriptions: [
        'postgres://user:pass@host:port/dbname. Le build Node e Docker accettano anche DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASSWORD separatamente.',
        'Segreto casuale che firma i token di autenticazione. Generane uno con openssl rand -hex 32.',
        'L’unico account di servizio amministrativo. Non esiste alcuna riga admin nel database: chi accede con queste credenziali ottiene il ruolo di amministratore. Gli utenti normali si registrano dalle app.',
        'URL pubblico del tuo deploy di stayup-ui. Usato come destinazione del redirect OAuth.',
        'Abilita «Accedi con Google». Lasciala vuota per disattivarlo.',
        'Abilita «Accedi con GitHub». Lasciala vuota per disattivarlo.',
      ],
      note: 'L’accesso con e-mail e password funziona sempre, qualunque cosa tu faccia con le variabili OAuth.',
    },
    deploy: {
      heading: 'Opzioni di deploy',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Node.js puro'],
      dockerIntro: 'La via più breve: clonare, compilare .env, avviare.',
      dockerNote:
        'docker-compose.yml monta lo schema nella cartella di inizializzazione di Postgres, quindi le tabelle di base nascono alla prima inizializzazione del volume. L’API resta poi in ascolto sulla porta 3000.',
      workersIntro: 'Corrisponde al deploy di riferimento.',
      workersNote:
        'Il tuo Postgres deve essere raggiungibile dalla rete di Cloudflare: un provider gestito con una stringa di connessione pubblica e in pool è la scelta abituale. Workers non arriva a un database sulla tua rete domestica.',
      nodeIntro: 'Nessuna orchestrazione, solo il server compilato.',
      nodeNote:
        'Oppure costruisci tu stesso il Dockerfile fornito, se preferisci un container senza Compose.',
    },
    schema: {
      heading: 'Applicare lo schema e creare il primo utente',
      applyIntro: 'Se non ti affidi all’auto-inizializzazione di Compose, applicalo una volta:',
      applyNote:
        'È puramente additivo — solo CREATE TABLE IF NOT EXISTS — quindi si può rieseguire in qualsiasi momento, anche su un database che contiene già dati.',
      userIntro:
        'L’accesso amministrativo sono API_USERNAME e API_PASSWORD qui sopra: non c’è nulla da creare. Per un account normale, senza passare da un modulo di registrazione:',
      verifyIntro: 'Poi verifica che risponda:',
      verifyNote:
        'Un elenco di provider vuoto è la risposta attesa a questo punto: nessun provider ha ancora girato su questo database. È l’argomento della parte 2.',
    },
    pointing: {
      heading: 'Puntare un’app alla tua istanza',
      items: [
        'stayup-ui: imposta STAYUP_API_URL sul tuo deploy, oppure non toccarla e lascia che ogni visitatore la sostituisca dal proprio profilo, dove viene salvata per browser.',
        'stayup-desktop e stayup-mobile: Profilo, poi «URL dell’API», incolla l’URL della tua istanza e salva. «Ripristina predefinito» torna in qualsiasi momento a quello integrato.',
      ],
      diagram: {
        title: 'Cambiare istanza',
        instanceA: 'stayup-api — istanza di riferimento',
        instanceB: 'stayup-api — la tua istanza',
        providersA: 'provider: changelog, youtube, rss, scrap',
        providersB: 'provider: podcast, hackernews',
        client: 'Stessa app, una sola impostazione',
        connected: 'attualmente connesso',
        switch: 'passa invece a questa',
        note: 'Nessuna modifica al codice. L’elenco dei provider, i dati e la resa seguono tutti l’istanza configurata, compreso il rendering generico per i provider che l’app non conosce per nome.',
      },
    },
  },

  part2: {
    eyebrow: 'Parte 2',
    heading: 'Costruire un nuovo provider',
    intro:
      'Un provider è qualunque script che scriva periodicamente, nella propria tabella Postgres, righe che descrivono contenuti nuovi. stayup-api e le tre app lo raccolgono da sole — nessuna modifica al codice altrove — purché rispetti il contratto qui sotto. I quattro collector esistenti sono implementazioni di riferimento complete; quello RSS è il più breve, leggilo insieme a questa pagina.',
    contract: {
      heading: 'Il contratto del provider',
      diagramTitle: 'Cosa può toccare il tuo script',
      yourScript: 'Il tuo script di provider',
      readOnly: 'sola lettura',
      readWrite: 'lettura e scrittura — proprietà completa',
      upsertOne: 'upsert di esattamente una riga: la tua',
      writeOnError: 'scrivi in caso di errore',
      repositoryDesc: 'condivisa — le fonti da seguire',
      connectorDesc: 'tua — creata e posseduta interamente da te',
      registryDesc: 'condivisa — il tuo nome visualizzato',
      logDesc: 'condivisa, facoltativa — scrivi qui invece di andare in crash',
      warning:
        'Non scrivere mai nella tabella di un altro provider, né in user, session, account o user_repository: appartengono a stayup-api e stayup-ui.',
    },
    naming: {
      heading: 'Convenzione di denominazione',
      intro:
        'Scegli un nome breve in minuscolo, valido come identificatore snake_case: podcast, hackernews, reddit_thread. Quella singola stringa viene usata alla lettera in tre punti:',
      columnWhere: 'Dove',
      columnExample: 'Esempio, per «podcast»',
      rows: [
        'La tua tabella dati',
        'repository.type — quali fonti sono tue',
        'Il tuo nome visualizzato',
      ],
      note: 'Non esiste alcun registro di nomi da prenotare in anticipo: il nome è semplicemente quello con cui crei la tabella. Due provider possono scontrarsi solo scegliendo lo stesso nome di tabella.',
    },
    tables: {
      heading: 'Le quattro tabelle coinvolte',
      intro:
        'Il tuo passo di inizializzazione, eseguito all’inizio di ogni esecuzione, deve garantirne l’esistenza. Ogni istruzione è idempotente: ripetibile ogni volta senza rischi, anche se un altro provider ha creato prima quelle condivise.',
      repositoryTitle: 'repository — condivisa, tu perlopiù la leggi',
      repositoryDesc:
        'Una riga è una cosa da seguire: un feed di podcast, un subreddit, ciò che il tuo provider chiama fonte. type deve corrispondere al nome del tuo provider. config è JSON libero che solo il tuo script definisce e interpreta.',
      connectorTitle: 'connector_<name> — tua, per intero',
      connectorDesc: 'Colonne facoltative, usate se presenti ma mai richieste:',
      optionalDescriptions: [
        'la marca temporale propria del contenuto, preferita a executed_at quando si ordina per novità.',
        'un’etichetta breve mostrata accanto alle rese ricche: un tag di release, un id video e così via.',
      ],
      registryTitle: 'provider_registry — condivisa, una riga per te',
      registryDesc:
        'sort_order incide solo sull’ordine con cui i provider compaiono nelle app; va bene qualsiasi intero (i quattro esistenti usano 10, 20, 30, 40). Salta del tutto questa tabella e il tuo provider funziona lo stesso: l’API ripiega sul tuo nome con l’iniziale maiuscola.',
      logTitle: 'log — condivisa, facoltativa ma consigliata',
      logDesc:
        'Scrivi qui invece di andare in crash quando una fonte fallisce, e prosegui con le altre.',
    },
    eachRun: {
      heading: 'Cosa fa il tuo script a ogni esecuzione',
      steps: [
        'Connettersi ed eseguire il passo di schema idempotente qui sopra.',
        'Leggere l’elenco delle tue fonti da repository, filtrato sul nome del tuo provider.',
        'Per ogni fonte: interrogare il servizio esterno, confrontare con quanto già salvato — di norma l’ultima riga riuscita per quella fonte — e inserire solo ciò che è nuovo.',
        'Ripulire le righe vecchie secondo config.retention_days, o le chiavi di configurazione che definisci.',
        'In caso di errore su una fonte, scrivere in log e passare alla successiva invece di interrompere l’intera esecuzione.',
      ],
      addFlag:
        'Prevedi un flag --add <url> che faccia l’upsert di una riga in repository ed esca: è così che le fonti vengono seminate direttamente nel database. L’altra via — quella che gli utenti percorrono davvero — passa dall’API, dove provider deve corrispondere al suffisso della tua tabella.',
    },
    conventions: {
      heading: 'Convenzioni sul contenuto e la riserva sulla resa generica',
      body: 'content può essere testo semplice o una stringa JSON, come preferisci. I provider esistenti usano piccoli oggetti JSON per YouTube e RSS, così le app possono mostrare un titolo e una miniatura. Un provider appena nato non ha una resa dedicata alla sua forma: le tre app lo mostrano quindi come scheda generica — i primi caratteri di content, la data, il tuo nome visualizzato. È pienamente funzionante, solo più sobrio. Una resa ricca è un seguito separato e facoltativo: qualcuno aggiunge in ogni app un componente legato al nome del tuo provider. Nulla nel contratto lato server lo pretende.',
    },
    schedule: {
      heading: 'Eseguirlo a intervalli regolari',
      body: 'Riprendi lo schema di un collector esistente: un Dockerfile e un workflow giornaliero che lancia lo script con l’URL del database come segreto, puntato allo stesso Postgres usato dalla tua API. Nulla qui richiede GitHub Actions in particolare: un timer systemd, un cron classico o un’altra CI fanno esattamente la stessa cosa.',
    },
    checklist: {
      heading: 'Prima di considerarlo finito',
      items: [
        'creata con almeno id, repository_id, content, executed_at e success.',
        'riga aggiornata o inserita a ogni esecuzione.',
        'fonti lette con il nome del tuo provider.',
        'voci vecchie ripulite, o assenza di retention documentata.',
        'errori per fonte scritti qui invece di far cadere l’esecuzione.',
        'elenca il tuo provider dopo una esecuzione.',
        'restituisce i tuoi dati.',
      ],
    },
  },
}
