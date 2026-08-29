import type { DocContent } from './en'

export const de: DocContent = {
  common: {
    onThisPage: 'Auf dieser Seite',
    backToDocs: 'Zurück zur Dokumentation',
    docsHome: 'Dokumentation',
  },
  home: {
    meta: {
      title: 'StayUp — Dokumentation',
      description:
        'Was StayUp ist, wie die Teile zusammenpassen, und wohin als Nächstes: eigene Instanz betreiben, betreiben, oder einen Provider schreiben.',
    },
    eyebrow: 'Dokumentation',
    title: 'Wie StayUp funktioniert',
    lede: 'StayUp macht aus vielen Arten externer Quellen — Release-Notes, Videos, Feeds, gescrapte Seiten, alles was ein Programm lesen kann — einen Feed pro Person. Diese Seite ist das Denkmodell und das Vokabular; danach wähle den Pfad, den du brauchst.',
    concept: {
      heading: 'Die Idee, in vier Sätzen',
      points: [
        'StayUp zeigt dir neue Inhalte aus den Quellen, denen du folgst. Was als Quelle zählt, ist nicht festgelegt — es ist alles, was irgendein Provider abrufen kann.',
        'Ein Provider ist ein kleines Programm, das eine Art Quelle abruft und das Gefundene in die Datenbank der Instanz schreibt. Eine neue Art Quelle abzudecken heißt, einen Provider zu schreiben; sonst ändert sich in StayUp nichts.',
        'Die StayUp-API liest diese Datenbank und liefert sie an die Apps. Sie kennt keine Quellenart fest: bei jeder Anfrage fragt sie die Datenbank, welche Provider es gerade gibt, und reicht deren Anzeige-Manifest unverändert weiter.',
        'Die Apps — Web, Desktop, Mobil — lesen die API. Jede lässt sich auf jede Instanz richten, also auf jede Datenbank, und jede kann einen Provider anzeigen, von dem sie nie gehört hat.',
      ],
      note: 'Die Menge der Quellen ist von Natur aus offen. Eine Instanz zeigt genau die Provider, die gegen ihre Datenbank laufen — keine eingebaute Liste, nichts bei einer zentralen Stelle zu registrieren.',
      diagram: {
        title: 'Von einer Quelle auf deinen Bildschirm',
        sources: 'Externe Quellen',
        sourcesItems:
          'ein Podcast-Feed · ein Forenthread · eine Statusseite · alles was ein Programm lesen kann',
        providers: 'Provider',
        providersSub: 'ein kleines Programm pro Quellenart, nach Zeitplan',
        database: 'Die Datenbank',
        databaseSub: 'PostgreSQL, MySQL, SQLite oder MongoDB — alles Gesammelte, an einem Ort',
        api: 'StayUp-API',
        apiSub: 'liest die Datenbank, bedient die Apps, kennt nichts fest',
        apps: 'Web · Desktop · Mobil · Admin',
        appsSub: 'jede auf eine andere Instanz einstellbar',
      },
    },
    vocabulary: {
      heading: 'Die Begriffe, festgezurrt',
      intro:
        'Diese Begriffe tauchen überall auf und werden leicht verwechselt. Das bedeuten sie in StayUp.',
      columnTerm: 'Begriff',
      columnMeaning: 'Bedeutung',
      terms: [
        {
          term: 'Instanz',
          meaning:
            'Eine Datenbank + eine API davor + die Provider, die sie füttern. Die öffentliche Instanz ist eine; deine wäre eine andere. Instanzen reden nie miteinander.',
        },
        {
          term: 'Provider (auch: Konnektor)',
          meaning:
            'Ein eigenständiges Programm, das eine Art Quelle abruft und Zeilen in die Datenbank schreibt. „Konnektor“ und „Provider“ sind dasselbe; die Repos heißen stayup-cmd-*.',
        },
        {
          term: 'Quelle (auch: Flux) — eine repository-Zeile',
          meaning:
            'Eine verfolgte Sache: eine bestimmte Feed-URL, ein Kanal, eine Seite. Gespeichert als Zeile der gemeinsamen Tabelle repository, mit type gleich dem Provider-Namen.',
        },
        {
          term: 'Abonnement',
          meaning:
            'Eine Verbindung zwischen Nutzer und Quelle: „diese Person folgt diesem Flux“. Ein Flux in einer App hinzuzufügen legt ein Abonnement an (und die Quelle selbst, falls es sie nicht gab).',
        },
        {
          term: 'Anzeige-Template',
          meaning:
            'Ein optionales JSON-Manifest, das ein Provider in provider_registry.template speichert. Es sagt den Apps, wie sie seine Zeilen darstellen. Kein Template → eine schlichte generische Karte.',
        },
        {
          term: 'Admin',
          meaning:
            'Ein Betreiber einer Instanz. Der erste (ein Super-Admin) wird per Kommandozeile angelegt; der Rest über die Admin-Weboberfläche. Getrennt von Nutzerkonten.',
        },
      ],
    },
    paths: {
      heading: 'Welchen Pfad brauchst du?',
      installTitle: 'Eigene Instanz betreiben',
      installBody:
        'Deine eigene API und deine eigene Datenbank, damit deine Daten deine bleiben und du bestimmst, was dagegen läuft. Mit vollständiger lokaler Anleitung.',
      installCta: 'Installationsanleitung',
      generateTitle: 'Ein Setup-Skript erzeugen',
      generateBody:
        'Der geführte Pfad: wähle eine Datenbank und die gewünschten Konnektoren, und erhalte ein einziges Bash-Skript, das den ganzen Stack aufsetzt.',
      generateCta: 'Setup-Generator',
      adminTitle: 'Deine Instanz betreiben',
      adminBody:
        'Die Admin-Weboberfläche: Admins verwalten, entscheiden welche Provider neue Flux frei annehmen, die Freigabe-Warteschlange abarbeiten, Nutzer und Flux pflegen.',
      adminCta: 'Administrationsanleitung',
      providersTitle: 'Eine neue Quelle anschließen',
      providersBody:
        'Einen Provider schreiben — ein Programm, das eine noch nicht abgedeckte Quelle abruft und das Gefundene speichert. Mit Anzeige-Templates.',
      providersCta: 'Provider-Leitfaden',
      relation:
        'Eine Instanz zu betreiben und einen Provider zu schreiben hängen zusammen, sind aber getrennt. Ein Provider redet nie mit der API, nur mit der Datenbank — du kannst also einen schreiben, ohne die Installationsanleitung zu lesen. Ihn zu betreiben ist eine andere Sache: er braucht Schreibzugriff auf die Datenbank, die er füttert, und auf der öffentlichen Instanz hast du den nicht. In der Praxis gehört dein eigener Provider zu deiner eigenen Instanz.',
    },
  },
  install: {
    meta: {
      title: 'StayUp — Installation',
      description:
        'Deine eigene StayUp-Instanz aufsetzen: die Teile, eine vollständige lokale Anleitung, die vier Datenbanken, die Konfiguration, und wie du die Apps darauf richtest.',
    },
    eyebrow: 'Installation',
    title: 'Eigene Instanz betreiben',
    lede: 'Eine Instanz ist eine Datenbank, die API davor, die Provider, die du zur Fütterung wählst, und — wenn du sie aus dem Browser betreiben willst — die Admin-Weboberfläche. Diese Seite geht das Ganze durch, lokal, von Anfang bis Ende.',
    why: {
      heading: 'Wozu der Aufwand',
      intro:
        'Die öffentliche Instanz hat eigene Provider und eigene Daten. Eine eigene zu betreiben erlaubt dir:',
      items: [
        'alles in einer Datenbank zu halten, die du kontrollierst;',
        'zu wählen, welche Provider laufen und wie oft;',
        'Quellen zu folgen, die die öffentliche Instanz nicht abdeckt;',
        'per Provider-Freigabe zu bestimmen, wer was hinzufügen darf;',
        'Web-, Desktop- und Mobil-App darauf zu richten — eine Einstellung, keine Code-Änderung.',
      ],
      note: 'Instanzen reden nicht miteinander. Du startest mit einer leeren Datenbank und ohne Provider, bis du einen dagegen laufen lässt.',
    },
    pieces: {
      heading: 'Die vier Teile',
      database: 'Eine Datenbank',
      databaseBody:
        'Hält alles: die verfolgten Quellen, die gesammelten Inhalte, die Konten, die Admins. PostgreSQL, MySQL/MariaDB, SQLite oder MongoDB — die API passt sich an, worauf du sie richtest.',
      api: 'StayUp-API',
      apiBody:
        'Eine dünne, zustandslose Schicht über dieser Datenbank. Sie kennt keinen Provider-Namen fest — bei jeder Anfrage fragt sie die Datenbank, was da ist. Läuft auf Node, in Docker oder auf Cloudflare Workers.',
      providers: 'Provider',
      providersBody:
        'Die Programme, die die Datenbank tatsächlich füllen. Eigenständige Repos, nach Zeitplan gestartet, die nur mit der Datenbank reden. Ohne mindestens einen funktioniert deine Instanz, zeigt aber nichts.',
      adminUi: 'Die Admin-Weboberfläche (optional)',
      adminUiBody:
        'Eine Bereitstellung der Web-App, geöffnet unter /admin. Damit verwaltest du Admins, stellst den Freigabemodus jedes Providers ein, arbeitest die Flux-Anfrage-Warteschlange ab und pflegst Nutzer und Flux. Lass sie weg und die API funktioniert weiter — dir fehlt nur die Browser-Konsole.',
    },
    fastPath: {
      heading: 'Der schnelle Weg',
      body: 'Wenn es einfach nur laufen soll: der Setup-Generator stellt ein paar Fragen und gibt dir eine einzige stayup-setup.sh, die alles Folgende für dich erledigt — klonen, compose, Schema, Super-Admin, erster Konnektor-Lauf, Scheduler.',
      cta: 'Setup-Generator öffnen',
    },
    walkthrough: {
      heading: 'Vollständige lokale Anleitung',
      intro:
        'Von Hand, damit du jedes bewegliche Teil siehst. Hier PostgreSQL und Docker; dieselben Schritte gehen mit jeder unterstützten Engine.',
      steps: [
        'Die API klonen: git clone https://github.com/stayup-app/stayup-api.git && cd stayup-api',
        '.env.example nach .env kopieren und DATABASE_URL und JWT_SECRET setzen (openssl rand -hex 32). Es gibt keinen Admin-Benutzernamen und kein -Passwort zu setzen — Admins leben in der Datenbank.',
        'Datenbank und API starten: docker compose up -d db api. Die compose-Datei sät das Schema beim ersten Init in Postgres; die API lauscht auf Port 3000.',
        'Wenn du dich nicht darauf verlassen hast, das Schema einmal selbst anwenden: psql "$DATABASE_URL" -f src/db/schema.sql. Es fügt nur hinzu, also gefahrlos wiederholbar.',
        'Den ersten Super-Admin anlegen: npm run create-admin -- root@example.com "Root" \'ein-starkes-passwort\'. Das ist das Konto, das die Admin-Weboberfläche verwaltet.',
        'Einen Provider hinzufügen. Einen klonen — git clone https://github.com/stayup-app/stayup-cmd-rss.git — seine DATABASE_URL auf dieselbe Datenbank richten, Abhängigkeiten installieren, dann: python fetch_rss.py --add https://blog.example.com/feed.xml und python fetch_rss.py. Der erste echte Lauf legt seine Tabellen an und registriert ihn.',
        'Prüfen, dass die API ihn sieht: curl localhost:3000/connectors/providers sollte nun rss mit seinem Anzeige-Manifest listen.',
        'Die Desktop-App öffnen, zu Profil → API-URL, http://localhost:3000 einfügen, speichern. Ein Konto anlegen, dann einen Flux hinzufügen — der rss-Eintrag erscheint, sobald der Konnektor gelaufen ist.',
        'Den Konnektor planen, damit er weiterläuft: ein Cron-Eintrag, ein systemd-Timer, ein GitHub-Actions-Zeitplan, oder der Ofelia-Container, den der Generator aufsetzt.',
      ],
      note: 'Die API startet die Konnektoren nie. Es sind eigene Programme mit eigenem Zeitplan; das Einzige, was sie mit der API teilen, ist die Datenbank.',
    },
    requirements: {
      heading: 'Was du brauchst',
      items: [
        'Eine Datenbank aus der Liste unten, erreichbar von dort, wo die API läuft.',
        'Docker, oder Node.js 22 oder neuer, wenn du ohne Container fährst.',
        'Optional ein Cloudflare-Konto, um wie die Referenzinstanz auf Workers zu deployen.',
      ],
    },
    databases: {
      heading: 'Welche Datenbank',
      intro:
        'Die API spricht nicht direkt SQL. Sie ruft einen Speichervertrag auf, den je ein Adapter pro Engine erfüllt, und das Schema deiner DATABASE_URL wählt den Adapter. Vier Engines sind dabei:',
      columnEngine: 'Engine',
      columnScheme: 'URL-Schema',
      columnDriver: 'Zu installierender Treiber',
      note: 'Jede Engine besteht dieselbe Konformitätssuite — dieselben Verhaltensweisen, in CI gegen ein echtes PostgreSQL, MySQL, SQLite und MongoDB geprüft. Das macht die Wahl umkehrbar: Tabellen, Collections und Spalten heißen überall gleich, sodass ein Provider einmal beschrieben wird und nur sein Dialekt wechselt.',
      workersNote:
        'Eine Ausnahme, und sie ist nicht unsere: Cloudflare Workers öffnet nur die Art Verbindung, die PostgreSQL nutzt. Die Treiber für MySQL, SQLite und MongoDB brauchen Node — Docker oder pures Node.js, nicht Workers.',
    },
    env: {
      heading: 'Konfiguration',
      columnVariable: 'Variable',
      columnRequired: 'Pflicht',
      columnDescription: 'Beschreibung',
      yes: 'ja',
      no: 'nein',
      descriptions: [
        'Das Schema wählt die Engine: postgres://, mysql://, sqlite:// oder mongodb://. Node- und Docker-Builds akzeptieren auch DB_HOST, DB_PORT, DB_NAME, DB_USER und DB_PASSWORD einzeln, für PostgreSQL.',
        'Zufälliges Geheimnis zum Signieren der Auth-Tokens. Mit openssl rand -hex 32 erzeugen. Es muss über die Lebensdauer der Instanz gleich bleiben — ändere es und jeder bestehende Token wird ungültig.',
        'Öffentliche URL deiner Web-Bereitstellung. Nur als OAuth-Redirect-Ziel genutzt; lass sie weg, wenn du Google- oder GitHub-Login nicht aktivierst.',
        'Aktiviert „Mit Google anmelden“. Leer lassen zum Deaktivieren.',
        'Aktiviert „Mit GitHub anmelden“. Leer lassen zum Deaktivieren.',
      ],
      note: 'Es gibt keine Variable für Admin-Benutzername oder -Passwort. Das alte Paar API_USERNAME / API_PASSWORD ist weg: Admins sind Zeilen in der Datenbank, und der erste wird mit npm run create-admin angelegt. E-Mail- und Passwort-Login für normale Nutzer funktioniert immer, egal was du mit den OAuth-Variablen machst.',
    },
    deploy: {
      heading: 'Die API deployen',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Pures Node.js'],
      dockerIntro: 'Der kürzeste Weg: klonen, .env füllen, starten.',
      dockerNote:
        'Die compose-Datei mountet das Schema in Postgres’ Init-Verzeichnis, sodass die Kern-Tabellen beim ersten Initialisieren des Volumes angelegt werden. Die API lauscht dann auf Port 3000. Als Nächstes den Super-Admin anlegen — siehe unten.',
      workersIntro: 'Was die Referenzinstanz betreibt.',
      workersNote:
        'Deine Datenbank muss aus dem Netz von Cloudflare erreichbar sein — ein Managed-Anbieter mit gepoolter öffentlicher Verbindungszeichenfolge ist die übliche Antwort. Workers erreicht keine Datenbank in deinem Heimnetz und kann das create-admin-Skript nicht ausführen: lege den Super-Admin von deinem eigenen Rechner aus gegen die Datenbank an.',
      nodeIntro: 'Keine Orchestrierung, nur der gebaute Server.',
      nodeNote:
        'Oder baue das mitgelieferte Dockerfile selbst, wenn du lieber einen Container ohne Compose fährst. Das gebaute Image bringt auch das create-admin-Skript mit.',
    },
    schema: {
      heading: 'Die Tabellen anlegen, und den ersten Admin',
      applyIntro:
        'Wenn du dich nicht auf Composes Auto-Init verlässt, wende das Schema einmal selbst an. Eine Datei pro Engine, überall dieselben Tabellen- und Spaltennamen:',
      applyNote:
        'Die SQL-Dateien fügen nur hinzu — CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS — also jederzeit wiederholbar, auch gegen eine Datenbank, die schon Daten hält.',
      engineNotes: [
        'Das Referenzschema. Version 14 oder neuer.',
        'MySQL 8 oder MariaDB 10.2 und neuer: die API sortiert Inhalte mit einer Fensterfunktion.',
        'Nichts zu hosten — eine Datei neben der API. Gut für eine persönliche Instanz, nicht für eine, die die Apps von mehreren Stellen gleichzeitig treffen.',
        'Kein Schema anzuwenden: MongoDB legt eine Collection beim ersten Schreiben an. Nur die Indizes zählen, und die API legt sie selbst an, wenn sie sich verbindet — der Befehl oben macht es nur vorab.',
      ],
      adminIntro:
        'Admins sind Zeilen der admin-Tabelle; es gibt kein Standardkonto. Lege den ersten — immer ein Super-Admin — per Kommandozeile an. Er wendet zuerst das Schema an, dann fügt er die Zeile ein:',
      userIntro:
        'Normale Nutzerkonten werden über das Anmeldeformular der Apps angelegt. Um eines ohne Formular zu erstellen, zum Testen:',
      verifyIntro: 'Dann prüfen, dass die API antwortet:',
      verifyNote:
        'Eine leere Provider-Liste ist hier die erwartete Antwort: noch hat nichts etwas gesammelt. Das ist der Provider-Leitfaden.',
    },
    pointing: {
      heading: 'Eine App auf deine Instanz richten',
      items: [
        'Web: setze STAYUP_API_URL in deiner Bereitstellung — oder lass sie und jeden Besucher sie im Profil überschreiben, wo sie pro Browser gespeichert wird.',
        'Desktop und Mobil: Profil, dann „API-URL“, deine einfügen, speichern. „Zurücksetzen“ geht jederzeit zur eingebauten zurück.',
        'Die Admin-Weboberfläche ist dieselbe Web-App: richte ihre STAYUP_API_URL auf deine API und öffne /admin.',
      ],
      note: 'Sonst ändert sich nichts. Provider-Liste, Daten und Darstellung folgen alle der konfigurierten Instanz — einschließlich des schlichten Rückfalls für Provider, die die App nicht namentlich kennt.',
    },
    troubleshooting: {
      heading: 'Wenn etwas nicht stimmt',
      items: [
        {
          symptom: 'Die Provider-Liste kommt leer zurück.',
          cause:
            'Erwartet bei einer frischen Datenbank: noch ist kein Provider dagegen gelaufen. Einen laufen lassen und erneut prüfen.',
        },
        {
          symptom: 'Die Apps zeigen keinen Inhalt, aber die Provider-Liste ist gefüllt.',
          cause:
            'Die Provider laufen, aber noch folgt niemand etwas, oder die verfolgten Quellen haben keinen neuen Inhalt. Füge eine Quelle aus der App hinzu.',
        },
        {
          symptom: 'Ein Provider erscheint als schlichte Text-Karte, manchmal als rohes JSON.',
          cause:
            'Kein brauchbares Anzeige-Template. Der Provider hat provider_registry.template nicht geschrieben, oder seine content-Spalte ist ein JSON-String ohne Template zur Deutung. Siehe Provider-Leitfaden.',
        },
        {
          symptom: 'Einen Flux hinzuzufügen zeigt „Anfrage gesendet“ statt zu abonnieren.',
          cause:
            'Dieser Provider ist im manuellen Freigabemodus. Ein Admin gibt ihn frei oder lehnt ab unter /admin/flux-requests. Ändere den Modus unter /admin/providers, wenn das nicht gewollt ist.',
        },
        {
          symptom: 'create-admin sagt, die E-Mail sei schon vergeben.',
          cause:
            'Ein Super-Admin existiert bereits. Weitere Admins werden über die Admin-Weboberfläche angelegt, nicht per Kommandozeile.',
        },
        {
          symptom: 'Login klappt, aber jeder andere Aufruf wird abgewiesen.',
          cause:
            'Das Signaturgeheimnis unterscheidet sich zwischen der Instanz, die deinen Token ausstellte, und der antwortenden. Tokens tragen nicht über Instanzen hinweg.',
        },
      ],
    },
  },
  admin: {
    meta: {
      title: 'StayUp — Administration',
      description:
        'Eine StayUp-Instanz aus dem Browser betreiben: Admins, Flux-Freigabe pro Provider, die Anfrage-Warteschlange, Nutzer und Flux.',
    },
    eyebrow: 'Administration',
    title: 'Deine Instanz betreiben',
    lede: 'Sobald die API läuft, ist die Admin-Weboberfläche der Ort, von dem aus du die Instanz im Browser betreibst: wer was hinzufügen darf, welche Anfragen offen sind, welche Nutzer welchen Flux folgen.',
    webUi: {
      heading: 'Die Admin-Weboberfläche',
      body: 'Es ist dieselbe Web-App wie die öffentliche Seite, geöffnet unter /admin, auf deine API gerichtet. Sie ist optional — alles, was sie tut, hat eine API-Route dahinter — aber der praktische Weg, eine Instanz zu betreiben. Deploye sie wie jede andere Kopie der Web-App, setze STAYUP_API_URL auf deine API und melde dich unter /admin/login an.',
      note: 'Die Admin-Sitzung ist ein eigener Cookie, getrennt von einer Nutzer-Sitzung. Derselbe Browser kann beide gleichzeitig halten, ohne dass eine die andere abmeldet.',
    },
    roles: {
      heading: 'Super-Admin und Admin',
      intro:
        'Zwei Stufen. Der erste Admin ist immer ein Super-Admin, per Kommandozeile angelegt (npm run create-admin). Jeder Admin danach wird über die UI angelegt und ist ein normaler Admin.',
      columnRole: 'Rolle',
      columnCan: 'Kann',
      rows: [
        {
          role: 'Super-Admin',
          can: 'Alles, was ein normaler Admin kann, plus: andere Admins anlegen, bearbeiten und löschen. Kann nicht über die UI gelöscht werden und sich nicht selbst löschen.',
        },
        {
          role: 'Admin',
          can: 'Operative Arbeit: Nutzer, Flux, Provider-Freigabemodi, die Anfrage-Warteschlange. Sieht die Admin-Liste nicht und rührt sie nicht an. Kann sein eigenes Passwort ändern.',
        },
      ],
      note: 'Admins sind keine Nutzerkonten. Sie haben eine eigene Tabelle, einen eigenen Login und keinen eigenen Feed.',
    },
    managingAdmins: {
      heading: 'Admins verwalten',
      body: 'Nur Super-Admin, unter /admin/admins:',
      steps: [
        'Einen Admin mit E-Mail, Name und Passwort anlegen. Es ist ein normaler Admin — er kann keine anderen Admins verwalten.',
        'Name, E-Mail oder Passwort eines Admins bearbeiten.',
        'Einen Admin löschen. Die Super-Admin-Zeilen und deine eigene Zeile sind gesperrt.',
      ],
      note: 'Ein normaler Admin, der sein eigenes Passwort ändern muss, tut das unter /admin/settings, mit seinem aktuellen Passwort.',
    },
    fluxApproval: {
      heading: 'Flux-Freigabe pro Provider',
      intro:
        'Wenn ein Nutzer einen noch nicht existierenden Flux hinzufügt, hängt das Weitere vom Freigabemodus des Providers ab. Stelle ihn pro Provider unter /admin/providers ein.',
      autoBody:
        'auto — der Standard. Die Quelle wird angelegt und der Nutzer sofort abonniert. Gut für Provider, bei denen jede URL passt (RSS, ein Changelog).',
      manualBody:
        'manual — einen unbekannten Flux hinzuzufügen erzeugt stattdessen eine Anfrage (die App zeigt „Anfrage gesendet“). Nichts wird angelegt, bis ein Admin freigibt. Gut für Provider, bei denen eine Quelle etwas kostet, wie Scraping.',
      note: 'Ein bereits existierendes Flux zu abonnieren wird nie freigabepflichtig — die Freigabe betrifft nur das Hereinbringen einer brandneuen Quelle.',
    },
    usersAndFluxes: {
      heading: 'Nutzer und Flux',
      body: 'Der Rest der Konsole ist Durchsehen und Pflege:',
      items: [
        '/admin/users — jedes Konto, mit den Flux, denen es folgt. Ein Abonnement für jemanden hinzufügen oder entfernen.',
        '/admin/repositories — jede Quelle über alle Provider hinweg, mit ihrer config. Eine direkt anlegen (nützlich, um einen manuellen Provider zu befüllen), oder eine stilllegen.',
        '/admin/flux-requests — die offene Warteschlange. Freigeben legt die Quelle an oder wiederverwendet sie und abonniert den Anfragenden; Ablehnen markiert sie abgelehnt. Beides ist endgültig.',
      ],
    },
    addingFlux: {
      heading: 'Wie ein Nutzer einen Flux hinzufügt, aus jeder App',
      intro:
        'Derselbe Ablauf für jeden Provider — es gibt in den Apps keinen Provider-Sonderfall mehr:',
      steps: [
        'Einen Provider wählen.',
        'Die App zeigt die Flux, die dieser Provider schon verfolgt und denen du noch nicht folgst. Ein Tippen abonniert — nie eine Freigabe.',
        'Oder auf „neuen hinzufügen“ wechseln. Das Eingabefeld wird vom form-Deskriptor des Providers gesteuert: sein Label, sein Platzhalter und die erwartete Form.',
        'Absenden. Ist der Provider auto, bist du abonniert. Ist er manual, zeigt die App „Anfrage gesendet“ und ein Admin übernimmt.',
      ],
      note: 'Deshalb sollte ein Provider einen form-Deskriptor in seinem Template mitliefern — er macht aus einem nackten Textfeld ein „füge ein YouTube-Handle ein“ oder „füge eine Feed-URL ein“.',
    },
  },
  generate: {
    meta: {
      title: 'StayUp — Ein Self-Hosting-Setup erzeugen',
      description:
        'Wähle eine Datenbank und die gewünschten Konnektoren und lade ein einziges Bash-Skript herunter, das deine eigene StayUp-Instanz aufsetzt.',
    },
    eyebrow: 'Installation',
    title: 'Erzeuge dein Setup-Skript',
    lede: 'Wähle eine Datenbank und die gewünschten Konnektoren. Du erhältst ein einziges Bash-Skript, das die Repos klont, das Docker-Setup schreibt, deinen Super-Admin anlegt und alles startet.',
    how: {
      heading: 'Was das Skript tut',
      items: [
        'Klont die API, die gewählten Konnektoren und — wenn du sie behältst — die Admin-Weboberfläche.',
        'Schreibt eine docker-compose.yml mit PostgreSQL, der API, einem Container pro Konnektor und einem Ofelia-Scheduler.',
        'Fragt nach dem Super-Admin-Konto und nach dem Zeitplan jedes Konnektors.',
        'Wendet das Datenbankschema an, legt den Super-Admin an und führt jeden Konnektor einmal aus, damit er sich registriert.',
        'Startet die API, die Oberfläche und den Scheduler.',
      ],
      note: 'Alles läuft in Docker auf deinem Rechner. Nichts wird irgendwohin gesendet — die Seite baut das Skript in deinem Browser.',
    },
    requirements: {
      heading: 'Bevor du es ausführst',
      items: [
        'Docker und Docker Compose v2 (`docker compose`).',
        'git.',
        'Linux oder macOS. Unter Windows das Skript in WSL ausführen.',
      ],
    },
    form: {
      database: 'Datenbank',
      comingSoon: 'bald',
      connectors: 'Offizielle Konnektoren',
      customConnectors: 'Eigene Konnektoren',
      customHint:
        'Ein beliebiges Git-Repo mit einem Dockerfile im Stamm, dessen ENTRYPOINT den Collector einmal ausführt, DATABASE_URL liest und sich in provider_registry registriert. Siehe Provider-Leitfaden.',
      customConnectorAdd: 'Konnektor hinzufügen',
      customUrlPlaceholder: 'https://github.com/du/dein-konnektor.git',
      customNamePlaceholder: 'Name (optional)',
      remove: 'Entfernen',
      adminUi: 'Admin-Weboberfläche einschließen',
      adminUiHint: 'Provider verwalten, Flux-Anfragen freigeben, Admins hinzufügen.',
      advanced: 'Erweitert',
      projectDir: 'Projektordner',
      apiPort: 'API-Port',
      uiPort: 'UI-Port',
      dbPort: 'Datenbank-Port',
      preview: 'stayup-setup.sh',
      download: 'Herunterladen',
      copy: 'Kopieren',
      copied: 'Kopiert',
      invalid: 'Erzeugung nicht möglich',
    },
    run: {
      heading: 'Ausführen',
      intro: 'Datei speichern, dann:',
      note: 'Der erste Lauf baut jedes Image und kann einige Minuten dauern.',
    },
    after: {
      heading: 'Nach dem Setup',
      items: [
        'API-Doku: http://localhost:3000/docs — Admin-Oberfläche: http://localhost:3001/admin.',
        'Setze in der Desktop- oder Mobile-App die API-URL auf http://localhost:3000 und lege ein Konto an.',
        'Feeds fügst du in der App hinzu — jeder Provider bietet eine Liste vorhandener Flux und ein Formular für neue.',
        'Alles entfernen: docker compose --profile connectors down -v (löscht die Datenbank).',
      ],
      note: 'Der Scheduler bindet den Docker-Socket ein, um Konnektoren planmäßig zu starten — root-äquivalent auf dem Host, für eine lokale Dev-Instanz in Ordnung.',
    },
  },
  providers: {
    meta: {
      title: 'StayUp — Provider',
      description: 'Ein Programm schreiben, das jede externe Quelle in StayUp-Inhalt verwandelt.',
    },
    eyebrow: 'Provider',
    title: 'Eine neue Quelle anschließen',
    lede: 'Ein Provider ist ein Programm, das eine Art Quelle abruft und das Gefundene speichert. Es ist das Einzige, was du zum Erweitern von StayUp schreibst — die API und die drei Apps nehmen ihn von selbst auf.',
    what: {
      heading: 'Was ein Provider wirklich ist',
      body: 'Kein Plugin, kein Modul zum Registrieren: ein gewöhnliches Programm, in jeder Sprache, nach Zeitplan gestartet. Es liest die Liste der für ihn bestimmten Quellen, ruft jede ab, behält das Neue und schreibt es in die Datenbank. Die API nimmt ihn von selbst auf, und die drei Apps zeigen ihn — ohne dass sich irgendwo eine Codezeile ändert.',
      note: 'Ein Provider ruft nie die StayUp-API auf. Er redet mit der Datenbank, und nur mit der Datenbank.',
      diagram: {
        title: 'Ein Provider, Schritt für Schritt',
        sources: 'Seine Quellen, aus der Datenbank gelesen',
        sourcesItems: 'die Podcast-Feeds, die dieser Provider verfolgen soll',
        fetch: 'Jeden Feed abrufen',
        compare: 'Nur behalten, was vorher nicht da war',
        store: 'In die Datenbank schreiben',
        exposed: 'Die API stellt ihn bereit, die Apps zeigen ihn',
      },
      steps: {
        heading: 'Bei jedem Lauf',
        items: [
          'Die für dich bestimmten Quellen lesen.',
          'Jede aus der Außenwelt abrufen.',
          'Mit dem letzten Stand vergleichen und nur das Neue behalten.',
          'Die neuen Einträge in die Datenbank schreiben.',
          'Verfallenes entfernen und einen Fehler protokollieren, statt daran abzustürzen.',
          'Deinen Anzeigenamen und dein Template neu deklarieren, damit eine frische Datenbank dich beim ersten Lauf kennenlernt.',
        ],
      },
    },
    access: {
      heading: 'Vorab: wohin schreibt er?',
      body: 'Ein Provider braucht Schreibzugriff auf die Datenbank der Instanz, die er füttert. Auf der öffentlichen Instanz hast du den nicht, also gehört in der Praxis ein eigener Provider zu einer eigenen Instanz. Einen zu schreiben verlangt nichts aus der Installationsanleitung; einen zu betreiben verlangt eine Datenbank, in die du schreiben kannst.',
      cta: 'Installationsanleitung',
    },
    existing: {
      heading: 'Beispiele zum Nachlesen',
      body: 'Fünf Provider existieren schon als eigenständige Repos — changelog, youtube, rss, scrap, github-trending. Es ist, was die Referenzinstanz zufällig betreibt, keine Definition dessen, was StayUp abdeckt. Lies einen als funktionierendes Beispiel des Vertrags unten und richte ihn auf deine eigene Datenbank, wenn er passt. Der RSS-Provider ist der kürzeste; github-trending ist die Referenz für ein reiches Anzeige-Template.',
    },
    creating: {
      heading: 'Deinen eigenen schreiben',
      naming: {
        heading: 'Einen Namen wählen',
        intro:
          'Etwas Kurzes, Kleingeschriebenes, als Bezeichner nutzbar — podcast, hackernews, reddit_thread. Diese eine Zeichenkette wird wörtlich an mehreren Stellen genutzt:',
        columnWhere: 'Wo',
        columnExample: 'Für „podcast“',
        rows: [
          'Deine Datentabelle',
          'Die Quellen, die dir gehören',
          'Deine Zeile im Registry',
          'Das provider-Feld, das die Apps beim Hinzufügen eines Flux senden',
        ],
        note: 'Nichts im Voraus zu reservieren: der Name ist einfach der, unter dem du die Tabelle anlegst. Zwei Provider kollidieren nur, wenn sie denselben wählen.',
      },
      shape: {
        heading: 'Was du speicherst',
        body: 'Eine Zeile pro gefundenem Eintrag. Der Inhalt selbst kann Klartext oder JSON sein — deine Wahl. Ohne Anzeige-Template zeigen die Apps eine schlichte Karte: den Anfang des Inhalts, das Datum, deinen Anzeigenamen. Das funktioniert, ist nur visuell nüchtern, und zeigt rohes JSON, wenn deine content-Spalte das enthält. Ein Template behebt das, und das ist der nächste Abschnitt.',
      },
      schedule: {
        heading: 'Nach Zeitplan laufen lassen',
        body: 'Kopiere irgendeinen bestehenden Collector: ein Dockerfile im Stamm, dessen ENTRYPOINT das Skript einmal ausführt, und ein Job, der es mit der Datenbank-URL in der Umgebung startet. Nichts verlangt eine bestimmte CI — ein systemd-Timer, pures Cron oder der Ofelia-Container des Generators tun dasselbe.',
      },
    },
    templates: {
      heading: 'Anzeige-Templates',
      body: 'Ein Template ist ein JSON-Manifest, das dein Provider in provider_registry.template speichert, im selben Upsert wie seinen Anzeigenamen. Die API reicht es unverändert über GET /connectors/providers weiter; jede App hat eine Engine, die es liest und deine Zeilen darstellt — ein Listen-Layout und ein Lesebereich in einem von sieben Modi: Text, HTML, Medien, Audio, Galerie, Tabelle, Link-Liste. Kein Code in den Apps kennt den Namen deines Providers.',
      fallbackNote:
        'Ein Provider ohne Template (Spalte NULL, unlesbares JSON oder eine unbekannte version) funktioniert trotzdem — die Apps fallen auf die schlichte Karte zurück. Ein Template ist dringend empfohlen, sobald dein Inhalt mehr als eine kurze Textzeile ist.',
      cta: 'Vollständige Template-Referenz',
    },
    form: {
      heading: 'Der form-Deskriptor',
      body: 'Im Template sagt ein kleiner form-Block den Apps, wie das Eingabefeld „neuen Flux hinzufügen“ für deinen Provider aussehen soll. Ohne ihn bekommt der Nutzer ein nacktes Textfeld; mit ihm ein beschriftetes Feld, das validiert und die Quell-URL für ihn baut.',
      fields: [
        {
          field: 'label · placeholder',
          meaning: 'was das Feld sagt und als Hinweis anzeigt.',
        },
        {
          field: 'urlTemplate',
          meaning:
            'z. B. https://www.youtube.com/@{value} — {value} ist die Eingabe des Nutzers. Übersprungen, wenn der Wert schon eine http(s)-URL ist.',
        },
        {
          field: 'pattern',
          meaning:
            'ein Regex, den die transformierte Eingabe erfüllen muss, clientseitig vor dem Absenden geprüft.',
        },
        {
          field: 'transform',
          meaning:
            'trim, ein bekanntes Präfix/Suffix entfernen oder eine Fanggruppe extrahieren — damit eine eingefügte volle URL und ein nacktes Handle gleich enden.',
        },
      ],
      note: 'Die Apps speichern die gebaute URL als Quelle; dein Collector liest sie aus der repository-Zeile wie jede andere zurück.',
    },
    fluxApproval: {
      heading: 'Freigabemodus',
      body: 'Jeder Provider hat eine flux_approval-Spalte im Registry: auto (Standard) oder manual. auto abonniert den Nutzer sofort, wenn er einen neuen Flux hinzufügt; manual macht daraus eine Anfrage, die ein Admin freigeben muss. Ein Provider kann seinen eigenen Standard im Upsert setzen; ein Admin überschreibt ihn pro Instanz unter /admin/providers. Scraping wird aus gutem Grund als manual ausgeliefert — eine Quelle zu betreiben kostet dort etwas.',
      note: 'Das betrifft nur das Hereinbringen einer brandneuen Quelle. Eine bereits existierende Quelle zu abonnieren wird nie freigabepflichtig.',
    },
    contract: {
      heading: 'Technischer Vertrag',
      lede: 'Referenzmaterial. Du brauchst das, um einen Provider zu schreiben, nicht um StayUp zu verstehen.',
      diagramTitle: 'Was dein Skript berühren darf',
      yourScript: 'Dein Provider',
      readOnly: 'nur lesen',
      readWrite: 'lesen und schreiben — ganz deins',
      upsertOne: 'eine Zeile: deine',
      writeOnError: 'bei Fehler schreiben',
      repositoryDesc: 'die zu verfolgenden Quellen',
      connectorDesc: 'der Inhalt, den du sammelst',
      registryDesc: 'dein Anzeigename + Template',
      logDesc: 'Fehler, statt abzustürzen',
      warning:
        'Schreibe nie in die Tabelle eines anderen Providers, noch in die Tabellen user, session, account, admin, subscription oder flux_request: die gehören der API und der Web-App.',
      tablesHeading: 'Die vier Tabellen',
      tablesIntro:
        'Dein Init-Schritt, zu Beginn jeder Ausführung gestartet, muss sicherstellen, dass diese existieren. Jede Anweisung ist idempotent — jederzeit sicher wiederholbar, und sicher, wenn ein anderer Provider oder die API die geteilten zuerst angelegt hat.',
      engineIntro:
        'Wähle die Engine, die deine Instanz betreibt. Die Namen ändern sich nie von einem Tab zum nächsten — nur Dialekt und Typen, weshalb ein für eine Engine geschriebener Provider gegen eine andere gleich liest.',
      engineNotes: [
        'Der Referenzdialekt, und was die öffentliche Instanz betreibt.',
        'Gleiche Tabellen, MySQL-Typen. Eine URL muss in ein indexierbares VARCHAR passen, daher die explizite Länge.',
        'Kein Server: dein Provider und die API öffnen dieselbe Datei. Datumsangaben und JSON als Text gespeichert, die die API beim Lesen zurückparst.',
        'Eine Collection statt einer Tabelle, und kein Schema zu deklarieren — aber zwei Regeln. Ein repository-Dokument trägt eine numerische _id aus der counters-Collection, weil der Vertrag eine Quelle über eine Zahl bezeichnet. Und nichts kaskadiert: was du schreibst, räumst du auf.',
      ],
      repositoryTitle: 'repository — geteilt, du liest meist daraus',
      repositoryBody:
        'Eine Zeile ist eine zu verfolgende Sache: ein Podcast-Feed, ein Subreddit, was dein Provider eine Quelle nennt. Die type-Spalte muss dem Provider-Namen entsprechen. Die config-Spalte ist freies JSON, das nur dein Skript definiert und deutet.',
      connectorTitle: 'connector_<name> — ganz deins',
      connectorBody: 'Optionale Spalten, genutzt wenn vorhanden, aber nie verlangt:',
      optionalDescriptions: [
        'der eigene Zeitstempel des Inhalts, der Ausführungszeit vorgezogen beim Sortieren nach „neuestes“.',
        'ein kurzes Label neben reichen Darstellungen — ein Release-Tag, eine Video-ID usw.',
      ],
      registryTitle: 'provider_registry — geteilt, eine Zeile für dich',
      registryBody:
        'Die sort order beeinflusst nur die Reihenfolge, in der Provider in den Apps erscheinen; jede ganze Zahl geht. Die template-Spalte ist dein Anzeige-Manifest (vorige Abschnitte); lass sie NULL und dein Provider läuft trotzdem, nur mit der schlichten Karte. flux_approval ist eine Betreiber-Einstellung — kämpfe nicht mit einem Admin darum, aber du darfst einen sinnvollen Standard setzen. Lass die Zeile ganz weg und die API fällt auf eine großgeschriebene Version deines Namens zurück.',
      logTitle: 'log — geteilt, optional aber empfohlen',
      logBody:
        'Schreibe hier, statt abzustürzen, wenn eine Quelle fehlschlägt, und mach mit den anderen weiter.',
      addingSources: {
        heading: 'Quellen hereinbekommen',
        body: 'Zwei Wege. Unterstütze ein --add-Flag, das eine Zeile einfügt und beendet — praktisch, um direkt gegen die Datenbank zu befüllen. Der andere Weg, den Endnutzer tatsächlich gehen, ist eine Quelle aus einer App hinzuzufügen, was an POST /providers/<name>/fluxes postet; das provider-Feld muss deinem Tabellen-Suffix entsprechen.',
      },
      checklist: {
        heading: 'Bevor du es fertig nennst',
        items: [
          'angelegt mit mindestens einer id, einer Quellreferenz, dem Inhalt, einem Zeitstempel und einem Erfolgs-Flag.',
          'Zeile bei jedem Lauf upgesertet, mit deinem Anzeigenamen und (empfohlen) deinem Template.',
          'Quellen mit deinem Provider-Namen gelesen.',
          'alte Einträge gekürzt — oder das Fehlen einer Aufbewahrung dokumentiert.',
          'Fehler pro Quelle hier geschrieben, statt den Lauf abstürzen zu lassen.',
          'listet deinen Provider nach einem Lauf.',
          'gibt deine Daten zurück.',
        ],
      },
    },
  },
}
