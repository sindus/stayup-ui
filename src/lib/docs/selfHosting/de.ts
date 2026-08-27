import type { DocContent } from './en'

export const de: DocContent = {
  meta: {
    title: 'StayUp — Selbst hosten & Provider bauen',
    description:
      'Eine eigene stayup-api-Instanz betreiben und einen Provider schreiben, der sich in StayUp einklinkt, ohne App-Code anzufassen.',
  },
  nav: {
    onThisPage: 'Auf dieser Seite',
    backToSite: 'Zurück zur Website',
  },
  eyebrow: 'Dokumentation',
  title: 'StayUp selbst hosten & eigene Provider bauen',
  lede: 'Zwei Zielgruppen, eine Seite: eine eigene stayup-api-Instanz auf eigenen Daten betreiben, und einen neuen Provider schreiben, der sich einklinkt, ohne eine Zeile der vier Apps zu berühren.',

  overview: {
    heading: 'Wie die Teile zusammenpassen',
    points: [
      'stayup-api ist eine dünne, zustandslose HTTP-Schicht über einer einzigen PostgreSQL-Datenbank. Kein Provider-Name steht fest im Code. Bei jeder Anfrage fragt sie Postgres, welche connector_*-Tabellen es gerade gibt und welchen Anzeigenamen jede angemeldet hat — diese Antwort ist die Provider-Liste.',
      'Ein Provider ist ein eigenständiges Skript (heute Python, morgen beliebig), das genau eine Tabelle besitzt und regelmäßig Zeilen hineinschreibt. Es spricht nie mit stayup-api, sondern mit derselben Postgres-Datenbank.',
      'Auch die drei Client-Apps verdrahten keine API-URL fest. Jede bringt eine Standardadresse mit, und jede Person kann sie im Profil auf eine beliebige andere stayup-api-Instanz umstellen — andere Datenbank, andere Provider, andere Daten.',
    ],
    note: 'Instanzen stimmen sich nicht ab. Wer selbst hostet, startet mit einer leeren Datenbank und null Providern, bis mindestens ein Collector dagegen läuft. Mit der Referenzinstanz wird nichts geteilt.',
    diagram: {
      title: 'Gesamtarchitektur',
      providers: 'Provider — eigenständige Skripte, eines je Quellentyp',
      yourProvider: 'dein neuer Provider…',
      writesCron: 'schreibt, nach Zeitplan',
      database: 'PostgreSQL',
      dbShared: 'gemeinsam',
      dbPerProvider: 'eine je Provider',
      readsWrites: 'liest und schreibt, über SQL',
      api: 'stayup-api',
      apiSubtitle: 'zustandslos — findet Provider zur Anfragezeit in Postgres',
      http: 'HTTP, auf konfigurierbarer URL',
      clients: 'Client-Apps',
      endUser: 'Endnutzer',
      note: 'Jeder Client kann auf jede Instanz zeigen, also auf jede Datenbank. Es gibt eine Referenzinstanz; Selbsthosting ist ein paralleler Stapel gleicher Form, davon getrennt.',
    },
  },

  part1: {
    eyebrow: 'Teil 1',
    heading: 'stayup-api selbst hosten',
    requirements: {
      heading: 'Voraussetzungen',
      items: [
        'Eine PostgreSQL-Datenbank (14 oder neuer), erreichbar von dort, wo die API läuft.',
        'Node.js 22 oder neuer, falls du kein Docker verwendest.',
        'Optional ein Cloudflare-Konto, falls du wie die Referenzinstanz auf Workers deployen willst.',
      ],
    },
    env: {
      heading: 'Umgebungsvariablen',
      columnVariable: 'Variable',
      columnRequired: 'Pflicht',
      columnDescription: 'Beschreibung',
      yes: 'ja',
      no: 'nein',
      descriptions: [
        'postgres://user:pass@host:port/dbname. Node- und Docker-Builds akzeptieren auch DB_HOST, DB_PORT, DB_NAME, DB_USER und DB_PASSWORD einzeln.',
        'Zufälliges Secret zum Signieren der Auth-Tokens. Erzeuge eines mit openssl rand -hex 32.',
        'Das einzige Admin-Dienstkonto. Es gibt keine Admin-Zeile in der Datenbank: wer sich mit diesen Zugangsdaten anmeldet, bekommt die Admin-Rolle. Normale Nutzer registrieren sich über die Apps.',
        'Öffentliche URL deines stayup-ui-Deployments. Dient als OAuth-Redirect-Ziel.',
        'Aktiviert „Mit Google anmelden“. Leer lassen, um es zu deaktivieren.',
        'Aktiviert „Mit GitHub anmelden“. Leer lassen, um es zu deaktivieren.',
      ],
      note: 'Die Anmeldung per E-Mail und Passwort funktioniert immer, unabhängig von den OAuth-Variablen.',
    },
    deploy: {
      heading: 'Deployment-Varianten',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Reines Node.js'],
      dockerIntro: 'Der kürzeste Weg: klonen, .env ausfüllen, starten.',
      dockerNote:
        'docker-compose.yml hängt das Schema in das Init-Verzeichnis von Postgres ein, die Kerntabellen entstehen also beim ersten Initialisieren des Volumes. Die API lauscht danach auf Port 3000.',
      workersIntro: 'Entspricht dem Referenz-Deployment.',
      workersNote:
        'Dein Postgres muss aus dem Netz von Cloudflare erreichbar sein — ein Managed-Anbieter mit gepoolter öffentlicher Verbindungszeichenfolge ist hier die übliche Wahl. Workers erreicht keine Datenbank in deinem Heimnetz.',
      nodeIntro: 'Keine Orchestrierung, nur der gebaute Server.',
      nodeNote:
        'Oder baue das mitgelieferte Dockerfile selbst, wenn du lieber einen Container ohne Compose betreibst.',
    },
    schema: {
      heading: 'Schema anwenden und den ersten Nutzer anlegen',
      applyIntro:
        'Wenn du dich nicht auf die Auto-Initialisierung von Compose verlässt, wende es einmal selbst an:',
      applyNote:
        'Es ist rein additiv — ausschließlich CREATE TABLE IF NOT EXISTS — und damit jederzeit wiederholbar, auch gegen eine Datenbank, die bereits Daten enthält.',
      userIntro:
        'Der Admin-Zugang sind die obigen API_USERNAME und API_PASSWORD: da ist nichts anzulegen. Für ein normales Konto, ohne Registrierungsformular:',
      verifyIntro: 'Dann prüfen, ob alles antwortet:',
      verifyNote:
        'Eine leere Provider-Liste ist an dieser Stelle die erwartete Antwort: gegen diese Datenbank lief noch kein Provider. Darum geht es in Teil 2.',
    },
    pointing: {
      heading: 'Eine App auf deine Instanz richten',
      items: [
        'stayup-ui: setze STAYUP_API_URL in deinem Deployment — oder lass sie unangetastet und überlass es jedem Besucher, sie im Profil zu überschreiben, wo sie pro Browser gespeichert wird.',
        'stayup-desktop und stayup-mobile: Profil, dann „API-URL“, die URL deiner Instanz einfügen, speichern. „Auf Standard zurücksetzen“ führt jederzeit zur eingebauten Adresse zurück.',
      ],
      diagram: {
        title: 'Instanz wechseln',
        instanceA: 'stayup-api — Referenzinstanz',
        instanceB: 'stayup-api — deine Instanz',
        providersA: 'Provider: changelog, youtube, rss, scrap',
        providersB: 'Provider: podcast, hackernews',
        client: 'Dieselbe App, eine Einstellung',
        connected: 'aktuell verbunden',
        switch: 'stattdessen hierhin wechseln',
        note: 'Keine Codeänderung. Provider-Liste, Daten und Darstellung folgen alle der konfigurierten Instanz — inklusive der generischen Darstellung für Provider, die die App nicht namentlich kennt.',
      },
    },
  },

  part2: {
    eyebrow: 'Teil 2',
    heading: 'Einen neuen Provider bauen',
    intro:
      'Ein Provider ist jedes Skript, das regelmäßig Zeilen über neue Inhalte in seine eigene Postgres-Tabelle schreibt. stayup-api und die drei Apps greifen ihn von selbst auf — nirgends sonst ist eine Codeänderung nötig — solange er den folgenden Vertrag einhält. Die vier bestehenden Collectors sind vollständige Referenzimplementierungen; der für RSS ist der kürzeste, lies ihn parallel zu dieser Seite.',
    contract: {
      heading: 'Der Provider-Vertrag',
      diagramTitle: 'Was dein Skript anfassen darf',
      yourScript: 'Dein Provider-Skript',
      readOnly: 'nur lesen',
      readWrite: 'lesen und schreiben — vollständiges Eigentum',
      upsertOne: 'genau eine Zeile upserten: deine',
      writeOnError: 'im Fehlerfall schreiben',
      repositoryDesc: 'gemeinsam — die zu verfolgenden Quellen',
      connectorDesc: 'deine — vollständig von dir erzeugt und besessen',
      registryDesc: 'gemeinsam — dein Anzeigename',
      logDesc: 'gemeinsam, optional — schreib hier hinein, statt abzustürzen',
      warning:
        'Schreibe nie in die Tabelle eines anderen Providers und nie in user, session, account oder user_repository: die gehören stayup-api und stayup-ui.',
    },
    naming: {
      heading: 'Namenskonvention',
      intro:
        'Wähle einen kurzen Kleinbuchstaben-Namen, der als snake_case-Bezeichner taugt — podcast, hackernews, reddit_thread. Diese eine Zeichenkette taucht wortwörtlich an drei Stellen auf:',
      columnWhere: 'Wo',
      columnExample: 'Beispiel für „podcast“',
      rows: [
        'Deine Datentabelle',
        'repository.type — welche Quellen dir gehören',
        'Dein Anzeigename',
      ],
      note: 'Es gibt kein Namensregister, in dem man vorab reserviert: der Name ist schlicht der, unter dem du die Tabelle anlegst. Zwei Provider kollidieren nur, wenn sie denselben Tabellennamen wählen.',
    },
    tables: {
      heading: 'Die vier beteiligten Tabellen',
      intro:
        'Dein Init-Schritt, zu Beginn jedes Laufs ausgeführt, muss sicherstellen, dass es sie gibt. Jede Anweisung ist idempotent — jedes Mal gefahrlos wiederholbar, auch wenn ein anderer Provider die gemeinsamen zuerst angelegt hat.',
      repositoryTitle: 'repository — gemeinsam, du liest überwiegend daraus',
      repositoryDesc:
        'Eine Zeile ist eine zu verfolgende Sache: ein Podcast-Feed, ein Subreddit, was auch immer dein Provider eine Quelle nennt. type muss deinem Provider-Namen entsprechen. config ist freies JSON, das allein dein Skript definiert und auswertet.',
      connectorTitle: 'connector_<name> — deine, vollständig',
      connectorDesc: 'Optionale Spalten, genutzt wenn vorhanden, aber nie verlangt:',
      optionalDescriptions: [
        'der eigene Zeitstempel des Inhalts, beim Sortieren nach Aktualität gegenüber executed_at bevorzugt.',
        'ein kurzes Label neben reichen Darstellungen — ein Release-Tag, eine Video-ID und so weiter.',
      ],
      registryTitle: 'provider_registry — gemeinsam, eine Zeile für dich',
      registryDesc:
        'sort_order beeinflusst nur die Reihenfolge der Provider in den Apps; jede ganze Zahl geht (die vier bestehenden nutzen 10, 20, 30, 40). Lässt du diese Tabelle ganz weg, funktioniert dein Provider trotzdem: die API fällt auf deinen großgeschriebenen Namen zurück.',
      logTitle: 'log — gemeinsam, optional aber empfohlen',
      logDesc:
        'Schreibe hier hinein, statt abzustürzen, wenn eine Quelle fehlschlägt, und mach mit den übrigen weiter.',
    },
    eachRun: {
      heading: 'Was dein Skript bei jedem Lauf tut',
      steps: [
        'Verbinden und den idempotenten Schema-Schritt von oben ausführen.',
        'Deine Quellenliste aus repository lesen, gefiltert auf deinen Provider-Namen.',
        'Je Quelle: den externen Dienst abfragen, mit dem Gespeicherten vergleichen — üblicherweise der jüngsten erfolgreichen Zeile dieser Quelle — und nur Neues einfügen.',
        'Alte Zeilen gemäß config.retention_days aufräumen, oder gemäß den Config-Schlüsseln, die du definierst.',
        'Bei einem Fehler je Quelle in log schreiben und zur nächsten übergehen, statt den ganzen Lauf abzubrechen.',
      ],
      addFlag:
        'Sieh ein --add <url>-Flag vor, das eine repository-Zeile upsertet und sich beendet: so werden Quellen direkt in der Datenbank angelegt. Der andere Weg — den Endnutzer tatsächlich gehen — führt über die API, wo provider dem Suffix deiner Tabelle entsprechen muss.',
    },
    conventions: {
      heading: 'Inhaltskonventionen und der Vorbehalt zur generischen Darstellung',
      body: 'content darf reiner Text oder ein JSON-String sein, ganz wie du magst. Die bestehenden Provider nutzen kleine JSON-Objekte für YouTube und RSS, damit die Apps Titel und Vorschaubild zeigen können. Ein brandneuer Provider hat für seine Form keine eigene Darstellung: die drei Apps zeigen ihn deshalb als generische Karte — die ersten Zeichen von content, das Datum, dein Anzeigename. Das ist voll funktionsfähig, nur schlichter. Eine reiche Darstellung ist ein getrennter, optionaler Nachgang: jemand fügt in jeder App eine Komponente hinzu, die an deinem Provider-Namen hängt. Der Vertrag auf Serverseite verlangt das nicht.',
    },
    schedule: {
      heading: 'Nach Zeitplan laufen lassen',
      body: 'Übernimm das Muster eines beliebigen bestehenden Collectors: ein Dockerfile und ein täglicher Workflow, der das Skript mit der Datenbank-URL als Secret startet, gerichtet auf dasselbe Postgres wie deine API. Nichts davon verlangt speziell GitHub Actions — ein systemd-Timer, ein schlichter Cron oder eine andere CI tun genau dasselbe.',
    },
    checklist: {
      heading: 'Bevor du es für fertig hältst',
      items: [
        'angelegt mit mindestens id, repository_id, content, executed_at und success.',
        'Zeile bei jedem Lauf upsertet.',
        'Quellen mit deinem Provider-Namen gelesen.',
        'alte Einträge aufgeräumt — oder das Fehlen einer Aufbewahrungsregel dokumentiert.',
        'Fehler je Quelle hier festgehalten, statt den Lauf abstürzen zu lassen.',
        'listet deinen Provider nach einem Lauf auf.',
        'liefert deine Daten zurück.',
      ],
    },
  },
}
