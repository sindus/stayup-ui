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
        'Wie StayUp funktioniert, wie du eine eigene Instanz betreibst und wie du eine neue Quelle anschließt.',
    },
    eyebrow: 'Dokumentation',
    title: 'Wie StayUp funktioniert',
    lede: 'Fang hier an. Zwei Minuten Konzept, dann such dir den Weg aus, den du wirklich brauchst.',

    concept: {
      heading: 'Die Idee in vier Sätzen',
      points: [
        'StayUp zeigt dir Neues aus den Quellen, denen du folgst — die Releases eines GitHub-Projekts, einen YouTube-Kanal, einen RSS-Feed, eine Webseite.',
        'Ein Provider ist ein kleines Programm, das eine Art von Quelle abholt und das Gefundene in eine PostgreSQL-Datenbank schreibt.',
        'Die StayUp-API liest diese Datenbank und liefert sie an die Apps. Sie kennt weder YouTube noch RSS: sie berichtet schlicht, was in der Datenbank steht.',
        'Die Apps — Web, Desktop, Mobil — lesen die API. Jede lässt sich auf eine beliebige Instanz richten, also auf eine beliebige Datenbank.',
      ],
      note: 'Das ist der ganze Entwurf. Alles Weitere ist Detail.',
      diagram: {
        title: 'Von einer Quelle bis auf deinen Bildschirm',
        sources: 'Externe Quellen',
        sourcesItems: 'ein GitHub-Repo · ein YouTube-Kanal · ein RSS-Feed · eine Webseite',
        providers: 'Provider',
        providersSub: 'ein kleines Programm je Quellenart',
        database: 'PostgreSQL',
        databaseSub: 'alles Gesammelte an einem Ort',
        api: 'StayUp-API',
        apiSub: 'liest die Datenbank, bedient die Apps',
        apps: 'Web · Desktop · Mobil',
        appsSub: 'jede auf eine andere Instanz umstellbar',
      },
    },

    paths: {
      heading: 'Welchen Weg brauchst du?',
      selfHostingTitle: 'Eine eigene Instanz betreiben',
      selfHostingBody:
        'Deine eigene API und deine eigene Datenbank — deine Daten bleiben deine, und du entscheidest, was darauf läuft.',
      selfHostingCta: 'Anleitung zum Selbsthosten',
      providersTitle: 'Eine neue Quelle anschließen',
      providersBody:
        'Schreib einen Provider — ein Programm, das eine von StayUp noch nicht abgedeckte Quelle abholt und das Gefundene speichert.',
      providersCta: 'Provider-Anleitung',
      relation:
        'Beides hängt zusammen, ist aber getrennt. Ein Provider spricht nie mit der API, nur mit der Datenbank — du kannst also einen schreiben, ohne eine Zeile der Selbsthosting-Anleitung zu lesen. Ihn laufen zu lassen ist etwas anderes: er braucht Schreibzugriff auf die Datenbank, die er füttert, und auf der öffentlichen Instanz hast du den nicht. In der Praxis gehört zu einem eigenen Provider eine eigene Instanz.',
    },
  },

  selfHosting: {
    meta: {
      title: 'StayUp — Selbst hosten',
      description:
        'Betreibe deine eigene StayUp-API und Datenbank, und richte die Apps darauf aus.',
    },
    eyebrow: 'Selbst hosten',
    title: 'Eine eigene Instanz betreiben',
    lede: 'Eine Instanz besteht aus drei Teilen: einer Datenbank, der API davor, und den Providern, die du zum Füttern auswählst.',

    why: {
      heading: 'Wozu der Aufwand',
      intro:
        'Die öffentliche Instanz hat ihre eigenen Provider und ihre eigenen Daten. Eine eigene zu betreiben erlaubt dir:',
      items: [
        'alles in einer Datenbank zu halten, die du kontrollierst;',
        'auszuwählen, welche Provider laufen und wie oft;',
        'Quellen zu verfolgen, die die öffentliche Instanz nicht abdeckt;',
        'Web, Desktop und Mobil darauf zu richten — eine Einstellung, keine Codeänderung.',
      ],
      note: 'Instanzen sprechen nicht miteinander. Du startest mit einer leeren Datenbank und ohne Provider, bis du einen dagegen laufen lässt.',
    },

    pieces: {
      heading: 'Die drei Teile',
      database: 'PostgreSQL',
      databaseBody:
        'Enthält alles: die verfolgten Quellen, die gesammelten Inhalte, die Konten. Version 14 oder neuer, erreichbar von dort, wo die API läuft.',
      api: 'StayUp-API',
      apiBody:
        'Eine dünne, zustandslose Schicht über dieser Datenbank. Kein Provider-Name steht fest im Code — bei jeder Anfrage fragt sie Postgres, was da ist.',
      providers: 'Provider',
      providersBody:
        'Die Programme, die die Datenbank tatsächlich füllen. Ohne mindestens eines läuft deine Instanz, zeigt aber nichts.',
    },

    requirements: {
      heading: 'Was du brauchst',
      items: [
        'Eine PostgreSQL-Datenbank, Version 14 oder neuer, erreichbar von dort, wo die API läuft.',
        'Node.js 22 oder neuer, falls du kein Docker verwendest.',
        'Optional ein Cloudflare-Konto, um wie die Referenzinstanz auf Workers zu deployen.',
      ],
    },

    env: {
      heading: 'Konfiguration',
      columnVariable: 'Variable',
      columnRequired: 'Pflicht',
      columnDescription: 'Beschreibung',
      yes: 'ja',
      no: 'nein',
      descriptions: [
        'postgres://user:pass@host:port/dbname. Node- und Docker-Builds akzeptieren auch DB_HOST, DB_PORT, DB_NAME, DB_USER und DB_PASSWORD einzeln.',
        'Zufälliges Secret zum Signieren der Auth-Tokens. Erzeuge eines mit openssl rand -hex 32.',
        'Das einzige Admin-Dienstkonto. Es gibt keine Admin-Zeile in der Datenbank: wer sich mit diesen Zugangsdaten anmeldet, bekommt die Admin-Rolle. Normale Nutzer registrieren sich über die Apps.',
        'Öffentliche URL deines Web-Deployments. Dient als OAuth-Redirect-Ziel.',
        'Aktiviert „Mit Google anmelden“. Leer lassen, um es zu deaktivieren.',
        'Aktiviert „Mit GitHub anmelden“. Leer lassen, um es zu deaktivieren.',
      ],
      note: 'Die Anmeldung per E-Mail und Passwort funktioniert immer, unabhängig von den OAuth-Variablen.',
    },

    deploy: {
      heading: 'Die API deployen',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Reines Node.js'],
      dockerIntro: 'Der kürzeste Weg: klonen, .env ausfüllen, starten.',
      dockerNote:
        'Die Compose-Datei hängt das Schema in das Init-Verzeichnis von Postgres, die Kerntabellen entstehen also beim ersten Initialisieren des Volumes. Die API lauscht danach auf Port 3000.',
      workersIntro: 'Was die Referenzinstanz betreibt.',
      workersNote:
        'Deine Datenbank muss aus dem Netz von Cloudflare erreichbar sein — ein Managed-Anbieter mit gepoolter öffentlicher Verbindungszeichenfolge ist die übliche Wahl. Workers erreicht keine Datenbank in deinem Heimnetz.',
      nodeIntro: 'Keine Orchestrierung, nur der gebaute Server.',
      nodeNote:
        'Oder baue das mitgelieferte Dockerfile selbst, wenn du lieber einen Container ohne Compose betreibst.',
    },

    schema: {
      heading: 'Tabellen anlegen, und dein erstes Konto',
      applyIntro:
        'Wenn du dich nicht auf die Auto-Initialisierung von Compose verlässt, wende das Schema einmal selbst an:',
      applyNote:
        'Es fügt ausschließlich hinzu — CREATE TABLE IF NOT EXISTS — und ist damit jederzeit wiederholbar, auch gegen eine Datenbank, die bereits Daten enthält.',
      userIntro:
        'Der Admin-Zugang ist das obige Paar aus Benutzername und Passwort: da ist nichts anzulegen. Für ein normales Konto, ohne Registrierungsformular:',
      verifyIntro: 'Dann prüfen, ob es antwortet:',
      verifyNote:
        'Eine leere Provider-Liste ist hier die erwartete Antwort: es hat noch nichts gesammelt. Darum geht es in der Provider-Anleitung.',
    },

    pointing: {
      heading: 'Eine App auf deine Instanz richten',
      items: [
        'Web: setze die API-URL in deinem Deployment — oder lass sie stehen und überlass es jedem Besucher, sie im Profil zu überschreiben, wo sie pro Browser gespeichert wird.',
        'Desktop und Mobil: Profil, dann „API-URL“, deine einfügen, speichern. „Auf Standard zurücksetzen“ führt jederzeit zur eingebauten zurück.',
      ],
      note: 'Sonst ändert sich nichts. Provider-Liste, Daten und Darstellung folgen alle der konfigurierten Instanz — inklusive der schlichten Darstellung für Provider, die die App nicht namentlich kennt.',
    },

    troubleshooting: {
      heading: 'Wenn etwas nicht stimmt',
      items: [
        {
          symptom: 'Die Provider-Liste kommt leer zurück.',
          cause:
            'Bei einer frischen Datenbank erwartet: es lief noch kein Provider dagegen. Lass einen laufen und prüfe erneut.',
        },
        {
          symptom: 'Die Apps zeigen nichts, obwohl die Provider-Liste gefüllt ist.',
          cause:
            'Die Provider laufen, aber niemand folgt bisher etwas, oder die verfolgten Quellen haben nichts Neues. Füge in der App eine Quelle hinzu.',
        },
        {
          symptom: 'Kurz nach dem Hinzufügen eines Providers antwortet alles mit 500.',
          cause:
            'Meist die Datenbank: prüfe, ob die API sie noch erreicht, und ob der Collector nicht mitten beim Anlegen seiner Tabellen abgebrochen ist.',
        },
        {
          symptom: 'Die Anmeldung klappt, aber jeder weitere Aufruf wird abgewiesen.',
          cause:
            'Das Signatur-Secret unterscheidet sich zwischen der Instanz, die dein Token ausgestellt hat, und der antwortenden. Tokens gelten nicht über Instanzen hinweg.',
        },
      ],
    },
  },

  providers: {
    meta: {
      title: 'StayUp — Provider',
      description:
        'Schreibe ein Programm, das eine beliebige externe Quelle in StayUp-Inhalte verwandelt.',
    },
    eyebrow: 'Provider',
    title: 'Eine neue Quelle anschließen',
    lede: 'Ein Provider ist ein Programm, das eine Art von Quelle abholt und das Gefundene speichert. Sonst muss sich in StayUp nichts ändern, damit er auftaucht.',

    what: {
      heading: 'Was ein Provider wirklich ist',
      body: 'Kein Plugin, kein zu registrierendes Modul: ein gewöhnliches Programm, in beliebiger Sprache, nach Zeitplan gestartet. Es liest die Liste der für es bestimmten Quellen, holt jede davon, behält das Neue und schreibt es in die Datenbank. Die API greift es von selbst auf, und die drei Apps zeigen es an — ohne dass irgendwo eine Zeile Code sich ändert.',
      note: 'Ein Provider ruft nie die StayUp-API auf. Er spricht mit PostgreSQL, und nur mit PostgreSQL.',
      diagram: {
        title: 'Ein RSS-Provider, Schritt für Schritt',
        sources: 'Seine Quellen, aus der Datenbank gelesen',
        sourcesItems: 'example.com/feed.xml · another.com/rss · news.com/feed',
        fetch: 'Jeden Feed abholen',
        compare: 'Nur behalten, was vorher nicht da war',
        store: 'In PostgreSQL schreiben',
        exposed: 'Die API stellt es bereit, die Apps zeigen es',
      },
      steps: {
        heading: 'Bei jedem Lauf',
        items: [
          'Die für dich bestimmten Quellen lesen.',
          'Jede davon von außen abholen.',
          'Mit dem vergleichen, was du zuletzt gespeichert hast, und nur Neues behalten.',
          'Die neuen Einträge in die Datenbank schreiben.',
          'Zu Altes aufräumen, und einen Fehler protokollieren statt daran abzustürzen.',
        ],
      },
    },

    access: {
      heading: 'Vorab: wohin schreibt er?',
      body: 'Ein Provider braucht Schreibzugriff auf die Datenbank der Instanz, die er füttert. Auf der öffentlichen Instanz hast du den nicht, also gehört in der Praxis zu einem eigenen Provider eine eigene Instanz. Einen zu schreiben verlangt nichts aus der Selbsthosting-Anleitung; einen laufen zu lassen verlangt eine Datenbank, in die du schreiben darfst.',
      cta: 'Anleitung zum Selbsthosten',
    },

    existing: {
      heading: 'Erst einen wiederverwenden',
      body: 'Vier Provider gibt es bereits — GitHub-Releases, YouTube, RSS und das Auslesen einer schlichten Webseite. Jeder ist ein kleines eigenständiges Repository, das du auf deine eigene Datenbank richten kannst, und jeder ist ein funktionierendes Beispiel. Der für RSS ist der kürzeste; lies ihn parallel zu dieser Seite.',
    },

    creating: {
      heading: 'Einen eigenen schreiben',
      naming: {
        heading: 'Einen Namen wählen',
        intro:
          'Etwas Kurzes in Kleinbuchstaben, als Bezeichner brauchbar — podcast, hackernews, reddit_thread. Diese eine Zeichenkette taucht wortwörtlich an drei Stellen auf:',
        columnWhere: 'Wo',
        columnExample: 'Für „podcast“',
        rows: ['Deine Datentabelle', 'Die Quellen, die dir gehören', 'Dein Anzeigename'],
        note: 'Es gibt nichts vorab zu reservieren: der Name ist schlicht der, unter dem du die Tabelle anlegst. Zwei Provider kollidieren nur, wenn sie denselben wählen.',
      },
      shape: {
        heading: 'Was du speicherst',
        body: 'Eine Zeile je gefundenem Eintrag. Der Inhalt selbst darf reiner Text oder JSON sein — deine Wahl. Für einen brandneuen Provider haben die Apps keine eigene Darstellung, also zeigen sie ihn als schlichte Karte: den Anfang des Inhalts, das Datum, deinen Anzeigenamen. Das funktioniert, es sieht nur nüchtern aus. Eine reichere Darstellung ist optional, getrennt, und nichts im Vertrag verlangt sie.',
      },
      schedule: {
        heading: 'Nach Zeitplan laufen lassen',
        body: 'Übernimm einen beliebigen bestehenden Collector: ein Dockerfile und einen täglichen Job, der das Skript mit der Datenbank-URL als Secret startet. Nichts verlangt eine bestimmte CI — ein systemd-Timer oder schlichter Cron tun dasselbe.',
      },
    },

    contract: {
      heading: 'Technischer Vertrag',
      lede: 'Referenzmaterial. Du brauchst es, um einen Provider zu schreiben, nicht um StayUp zu verstehen.',
      diagramTitle: 'Was dein Skript anfassen darf',
      yourScript: 'Dein Provider',
      readOnly: 'nur lesen',
      readWrite: 'lesen und schreiben — ganz deins',
      upsertOne: 'eine Zeile: deine',
      writeOnError: 'im Fehlerfall schreiben',
      repositoryDesc: 'die zu verfolgenden Quellen',
      connectorDesc: 'die Inhalte, die du sammelst',
      registryDesc: 'dein Anzeigename',
      logDesc: 'Fehler, statt abzustürzen',
      warning:
        'Schreibe nie in die Tabelle eines anderen Providers und nie in die Tabellen für Nutzer, Sitzungen, Konten oder Abonnements: die gehören der API und der Web-App.',
      tablesHeading: 'Die vier Tabellen',
      tablesIntro:
        'Dein Init-Schritt, zu Beginn jedes Laufs ausgeführt, muss sicherstellen, dass es sie gibt. Jede Anweisung ist idempotent — jedes Mal gefahrlos wiederholbar, auch wenn ein anderer Provider die gemeinsamen zuerst angelegt hat.',
      repositoryTitle: 'repository — gemeinsam, du liest überwiegend daraus',
      repositoryBody:
        'Eine Zeile ist eine zu verfolgende Sache: ein Podcast-Feed, ein Subreddit, was auch immer dein Provider eine Quelle nennt. Die Spalte type muss deinem Provider-Namen entsprechen. Die Spalte config ist freies JSON, das allein dein Skript definiert und auswertet.',
      connectorTitle: 'connector_<name> — deine, vollständig',
      connectorBody: 'Optionale Spalten, genutzt wenn vorhanden, aber nie verlangt:',
      optionalDescriptions: [
        'der eigene Zeitstempel des Inhalts, beim Sortieren nach Aktualität der Ausführungszeit vorgezogen.',
        'ein kurzes Label neben reichen Darstellungen — ein Release-Tag, eine Video-ID und so weiter.',
      ],
      registryTitle: 'provider_registry — gemeinsam, eine Zeile für dich',
      registryBody:
        'Die Sortierreihenfolge beeinflusst nur, in welcher Reihenfolge Provider in den Apps erscheinen; jede ganze Zahl geht. Lässt du diese Tabelle weg, funktioniert dein Provider trotzdem: die API fällt auf deinen großgeschriebenen Namen zurück.',
      logTitle: 'log — gemeinsam, optional aber empfohlen',
      logBody:
        'Schreibe hier hinein, statt abzustürzen, wenn eine Quelle fehlschlägt, und mach mit den übrigen weiter.',
      addingSources: {
        heading: 'Quellen hineinbekommen',
        body: 'Zwei Wege. Sieh ein --add-Flag vor, das eine Zeile einfügt und sich beendet — praktisch, um direkt gegen die Datenbank vorzubelegen. Der andere Weg, den Endnutzer tatsächlich gehen, ist das Hinzufügen einer Quelle in der App, wobei das Provider-Feld dem Suffix deiner Tabelle entsprechen muss.',
      },
      checklist: {
        heading: 'Bevor du es für fertig hältst',
        items: [
          'angelegt mit mindestens einer Id, einem Quellenbezug, dem Inhalt, einem Zeitstempel und einem Erfolgskennzeichen.',
          'Zeile bei jedem Lauf upsertet.',
          'Quellen mit deinem Provider-Namen gelesen.',
          'alte Einträge aufgeräumt — oder das Fehlen einer Aufbewahrungsregel dokumentiert.',
          'Fehler je Quelle hier festgehalten, statt den Lauf abstürzen zu lassen.',
          'listet deinen Provider nach einem Lauf auf.',
          'liefert deine Daten zurück.',
        ],
      },
    },
  },
}
