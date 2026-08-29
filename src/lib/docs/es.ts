import type { DocContent } from './en'

export const es: DocContent = {
  common: {
    onThisPage: 'En esta página',
    backToDocs: 'Volver a la documentación',
    docsHome: 'Documentación',
  },

  home: {
    meta: {
      title: 'StayUp — Documentación',
      description:
        'Cómo funciona StayUp, cómo ejecutar tu propia instancia y cómo conectarle una nueva fuente.',
    },
    eyebrow: 'Documentación',
    title: 'Cómo funciona StayUp',
    lede: 'Empieza aquí. Dos minutos de conceptos y luego eliges el camino que realmente necesitas.',

    concept: {
      heading: 'La idea, en cuatro frases',
      points: [
        'StayUp te muestra el contenido nuevo de las fuentes que sigues. Lo que cuenta como fuente no está fijado: es lo que algún proveedor sepa ir a buscar.',
        'Un proveedor es un pequeño programa que busca un tipo de fuente y escribe lo que encuentra en la base de datos de la instancia. Cubrir un tipo nuevo de fuente es escribir un proveedor; nada más cambia en StayUp.',
        'La API de StayUp lee esa base y se la sirve a las aplicaciones. No fija ningún tipo de fuente en el código: en cada petición pregunta a la base qué proveedores existen en ese momento.',
        'Las aplicaciones leen la API. Cada una puede apuntar a cualquier instancia y, por tanto, a cualquier base — y cada una sabe mostrar un proveedor del que nunca ha oído hablar.',
      ],
      note: 'El conjunto de fuentes es abierto por construcción. Una instancia muestra exactamente los proveedores que se ejecutan contra su base: ninguna lista integrada, nada que registrar.',
      diagram: {
        title: 'De una fuente hasta tu pantalla',
        sources: 'Fuentes externas',
        sourcesItems:
          'un feed de podcast · un hilo de foro · una página de estado · cualquier cosa que un programa pueda leer',
        providers: 'Proveedores',
        providersSub: 'un programa pequeño por tipo de fuente',
        database: 'La base de datos',
        databaseSub: 'PostgreSQL, MySQL, SQLite o MongoDB: todo lo recogido, en un mismo sitio',
        api: 'API de StayUp',
        apiSub: 'lee la base, sirve a las aplicaciones',
        apps: 'Web · Escritorio · Móvil',
        appsSub: 'cada una configurable hacia otra instancia',
      },
    },

    paths: {
      heading: '¿Qué camino necesitas?',
      selfHostingTitle: 'Ejecutar tu propia instancia',
      selfHostingBody:
        'Tu API y tu base de datos, para que tus datos sigan siendo tuyos y elijas qué se ejecuta sobre ellos.',
      selfHostingCta: 'Guía de autoalojamiento',
      generateTitle: 'Generar un script de instalación',
      generateBody:
        'Elige una base de datos y los conectores que quieras y obtén un único script bash que levanta toda la pila.',
      generateCta: 'Generador de instalación',
      providersTitle: 'Conectar una nueva fuente',
      providersBody:
        'Escribe un proveedor: un programa que busca una fuente que StayUp aún no cubre y guarda lo que encuentra.',
      providersCta: 'Guía de proveedores',
      relation:
        'Van juntos pero son cosas distintas. Un proveedor nunca habla con la API, solo con la base de datos, así que puedes escribir uno sin leer una línea de la guía de autoalojamiento. Ejecutarlo ya es otra cosa: necesita acceso de escritura a la base que alimenta, y en la instancia pública no lo tienes. En la práctica, un proveedor propio va con una instancia propia.',
    },
  },

  selfHosting: {
    meta: {
      title: 'StayUp — Autoalojamiento',
      description:
        'Ejecuta tu propia API de StayUp y tu propia base de datos, y apunta las aplicaciones a ellas.',
    },
    eyebrow: 'Autoalojamiento',
    title: 'Ejecutar tu propia instancia',
    lede: 'Una instancia son tres piezas: una base de datos, la API delante de ella y los proveedores que elijas para alimentarla.',

    why: {
      heading: 'Por qué molestarse',
      intro:
        'La instancia pública tiene sus propios proveedores y sus propios datos. Ejecutar la tuya te permite:',
      items: [
        'guardarlo todo en una base de datos que controlas;',
        'elegir qué proveedores se ejecutan, y con qué frecuencia;',
        'seguir fuentes que la instancia pública no cubre;',
        'apuntar las aplicaciones web, de escritorio y móvil hacia ella: un ajuste, sin cambiar código.',
      ],
      note: 'Las instancias no se hablan entre sí. Empiezas con una base vacía y sin proveedores, hasta que ejecutas uno contra ella.',
    },

    pieces: {
      heading: 'Las tres piezas',
      database: 'Una base de datos',
      databaseBody:
        'Guarda todo: las fuentes seguidas, el contenido recogido, las cuentas. PostgreSQL, MySQL/MariaDB, SQLite o MongoDB: la API se adapta a la que le indiques.',
      api: 'API de StayUp',
      apiBody:
        'Una capa fina y sin estado sobre esa base. No fija ningún nombre de proveedor en el código: en cada petición pregunta a la base qué hay.',
      providers: 'Proveedores',
      providersBody:
        'Los programas que realmente llenan la base. Sin al menos uno, tu instancia funciona pero no muestra nada.',
    },

    requirements: {
      heading: 'Lo que necesitas',
      items: [
        'Una base de datos de la lista de abajo, accesible desde donde se ejecute la API.',
        'Node.js 22 o superior, si no usas Docker.',
        'Opcionalmente una cuenta de Cloudflare, para desplegar en Workers como la instancia de referencia.',
      ],
    },

    databases: {
      heading: 'Qué base de datos',
      intro:
        'La API no habla SQL directamente. Llama a un contrato de almacenamiento que cumple un adaptador por motor, y el esquema de tu DATABASE_URL elige el adaptador. Vienen cuatro motores:',
      columnEngine: 'Motor',
      columnScheme: 'Esquema de URL',
      columnDriver: 'Controlador a instalar',
      note: 'Todos los motores pasan la misma suite de conformidad: los mismos veinticuatro comportamientos, verificados en CI contra un PostgreSQL, un MySQL, un SQLite y un MongoDB reales. Eso hace reversible la elección: las tablas, las colecciones y las columnas llevan los mismos nombres en todas partes, así que un proveedor se describe una vez y solo cambia su dialecto.',
      workersNote:
        'Una excepción, y no es cosa nuestra: Cloudflare Workers solo abre el tipo de conexión que usa PostgreSQL. Los controladores de MySQL, SQLite y MongoDB necesitan Node: Docker o Node.js a secas, no Workers.',
    },

    env: {
      heading: 'Configuración',
      columnVariable: 'Variable',
      columnRequired: 'Obligatoria',
      columnDescription: 'Descripción',
      yes: 'sí',
      no: 'no',
      descriptions: [
        'El esquema elige el motor: postgres://, mysql://, sqlite:// o mongodb://. Las builds de Node y Docker también aceptan DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD por separado, para PostgreSQL.',
        'Secreto aleatorio que firma los tokens de autenticación. Genera uno con openssl rand -hex 32.',
        'La única cuenta de servicio de administración. No hay ninguna fila de admin en la base: quien entre con estas credenciales obtiene el rol de administrador. Los usuarios normales se registran desde las aplicaciones.',
        'URL pública de tu despliegue web. Se usa como destino de redirección OAuth.',
        'Activa «Iniciar sesión con Google». Déjala vacía para desactivarlo.',
        'Activa «Iniciar sesión con GitHub». Déjala vacía para desactivarlo.',
      ],
      note: 'El acceso con correo y contraseña siempre funciona, hagas lo que hagas con las variables de OAuth.',
    },

    deploy: {
      heading: 'Desplegar la API',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Node.js a secas'],
      dockerIntro: 'El camino más corto: clonar, rellenar .env, arrancar.',
      dockerNote:
        'El fichero compose monta el esquema en el directorio de inicialización de Postgres, así que las tablas base se crean la primera vez que se inicializa el volumen. La API queda escuchando en el puerto 3000.',
      workersIntro: 'Lo que ejecuta la instancia de referencia.',
      workersNote:
        'Tu base tiene que ser accesible desde la red de Cloudflare: un proveedor gestionado con una cadena de conexión pública y agrupada es la respuesta habitual. Workers no puede llegar a una base de tu red doméstica.',
      nodeIntro: 'Sin orquestación, solo el servidor compilado.',
      nodeNote:
        'O construye tú mismo el Dockerfile incluido, si prefieres un contenedor sin Compose.',
    },

    schema: {
      heading: 'Crear las tablas y tu primera cuenta',
      applyIntro:
        'Si no te apoyas en la auto-inicialización de Compose, aplica el esquema una vez a mano. Un fichero por motor, con los mismos nombres de tablas y columnas en todos:',
      applyNote:
        'Los ficheros SQL solo añaden — CREATE TABLE IF NOT EXISTS —, así que puedes volver a ejecutarlos cuando quieras, incluso contra una base que ya tiene datos.',
      engineNotes: [
        'El esquema de referencia. Versión 14 o superior.',
        'MySQL 8 o MariaDB 10.2 en adelante: la API ordena el contenido con una función de ventana.',
        'Nada que alojar: un fichero junto a la API. Va bien para una instancia personal, menos para una a la que las apps acceden desde varios sitios a la vez.',
        'No hay esquema que aplicar: MongoDB crea la colección en la primera escritura. Solo importan los índices, y la API los crea sola al conectarse; el comando de arriba se limita a adelantarlo.',
      ],
      userIntro:
        'El acceso de administración es el par de usuario y contraseña de arriba: no hay nada que crear. Para una cuenta normal, sin pasar por un formulario de registro:',
      verifyIntro: 'Después comprueba que responde:',
      verifyNote:
        'Una lista de proveedores vacía es la respuesta esperada aquí: todavía nada ha recogido nada. De eso trata la guía de proveedores.',
    },

    pointing: {
      heading: 'Apuntar una aplicación a tu instancia',
      items: [
        'Web: define la URL de la API en tu despliegue, o déjala y permite que cada visitante la sustituya desde su perfil, donde se guarda por navegador.',
        'Escritorio y móvil: Perfil, luego «URL de la API», pega la tuya y guarda. «Restablecer por defecto» vuelve a la integrada en cualquier momento.',
      ],
      note: 'No cambia nada más. La lista de proveedores, los datos y la representación siguen a la instancia configurada, incluido el modo sobrio para los proveedores que la aplicación no conoce por su nombre.',
    },

    troubleshooting: {
      heading: 'Cuando algo falla',
      items: [
        {
          symptom: 'La lista de proveedores vuelve vacía.',
          cause:
            'Es lo esperado en una base nueva: aún no se ha ejecutado ningún proveedor contra ella. Ejecuta uno y vuelve a comprobar.',
        },
        {
          symptom: 'Las aplicaciones no muestran nada, pero la lista de proveedores está llena.',
          cause:
            'Los proveedores se ejecutan, pero nadie sigue nada todavía, o las fuentes que siguen no tienen novedades. Añade una fuente desde la aplicación.',
        },
        {
          symptom: 'Todo responde 500 poco después de añadir un proveedor.',
          cause:
            'Normalmente la base de datos: comprueba que la API sigue llegando a ella y que el recolector no falló a mitad de crear sus tablas.',
        },
        {
          symptom: 'El inicio de sesión funciona pero el resto de llamadas se rechaza.',
          cause:
            'El secreto de firma difiere entre la instancia que emitió tu token y la que responde. Los tokens no valen de una instancia a otra.',
        },
      ],
    },
  },

  generate: {
    meta: {
      title: 'StayUp — Generar una instalación self-hosted',
      description:
        'Elige una base de datos y los conectores que quieras, y descarga un único script bash que levanta tu propia instancia de StayUp.',
    },
    eyebrow: 'Self-hosting',
    title: 'Genera tu script de instalación',
    lede: 'Elige una base de datos y los conectores que quieras. Obtienes un único script bash que clona los repos, escribe la configuración de Docker, crea tu superadministrador y arranca todo.',

    how: {
      heading: 'Qué hace el script',
      items: [
        'Clona la API, los conectores elegidos y — si lo mantienes — la interfaz web de administración.',
        'Escribe un docker-compose.yml con PostgreSQL, la API, un contenedor por conector y un planificador Ofelia.',
        'Te pide la cuenta de superadministrador y la frecuencia de cada conector.',
        'Aplica el esquema, crea el superadministrador y ejecuta cada conector una vez para que se registre.',
        'Arranca la API, la interfaz y el planificador.',
      ],
      note: 'Todo se ejecuta en tu máquina con Docker. No se envía nada a ningún sitio: la página construye el script en tu navegador.',
    },

    requirements: {
      heading: 'Antes de ejecutarlo',
      items: [
        'Docker y Docker Compose v2 (`docker compose`).',
        'git.',
        'Linux o macOS. En Windows, ejecuta el script dentro de WSL.',
      ],
    },

    form: {
      database: 'Base de datos',
      comingSoon: 'pronto',
      connectors: 'Conectores oficiales',
      customConnectors: 'Tus conectores',
      customHint:
        'Cualquier repo git con un Dockerfile en la raíz cuyo ENTRYPOINT ejecute el colector una vez, lea DATABASE_URL y se registre en provider_registry. Consulta la guía de proveedores.',
      customConnectorAdd: 'Añadir un conector',
      customUrlPlaceholder: 'https://github.com/tu/tu-conector.git',
      customNamePlaceholder: 'nombre (opcional)',
      remove: 'Quitar',
      adminUi: 'Incluir la interfaz web de administración',
      adminUiHint: 'Gestionar proveedores, aprobar solicitudes de flux, añadir administradores.',
      advanced: 'Avanzado',
      projectDir: 'Carpeta del proyecto',
      apiPort: 'Puerto API',
      uiPort: 'Puerto UI',
      dbPort: 'Puerto base de datos',
      preview: 'stayup-setup.sh',
      download: 'Descargar',
      copy: 'Copiar',
      copied: 'Copiado',
      invalid: 'No se puede generar',
    },

    run: {
      heading: 'Ejecútalo',
      intro: 'Guarda el archivo y luego:',
      note: 'La primera ejecución construye cada imagen y puede tardar unos minutos.',
    },

    after: {
      heading: 'Después de la instalación',
      items: [
        'Docs de la API: http://localhost:3000/docs — Interfaz de administración: http://localhost:3001/admin.',
        'En la app de escritorio o móvil, pon la URL de la API en http://localhost:3000 y crea una cuenta.',
        'Añade feeds desde la app: cada proveedor ofrece una lista de flux existentes y un formulario para uno nuevo.',
        'Quita todo con: docker compose --profile connectors down -v (borra la base de datos).',
      ],
      note: 'El planificador monta el socket de Docker para lanzar los conectores según su horario — equivalente a root en el host, aceptable para una instancia local de desarrollo.',
    },
  },

  providers: {
    meta: {
      title: 'StayUp — Proveedores',
      description:
        'Escribe un programa que convierta cualquier fuente externa en contenido de StayUp.',
    },
    eyebrow: 'Proveedores',
    title: 'Conectar una nueva fuente',
    lede: 'Un proveedor es un programa que busca un tipo de fuente y guarda lo que encuentra. Es lo único que escribes para extender StayUp: la API y las tres aplicaciones lo recogen solas.',

    what: {
      heading: 'Qué es realmente un proveedor',
      body: 'Ni un plugin ni un módulo que registrar: un programa corriente, en el lenguaje que quieras, ejecutado de forma programada. Lee la lista de fuentes que le corresponden, consulta cada una, se queda con lo nuevo y lo escribe en la base de datos. La API lo recoge sola y las tres aplicaciones lo muestran, sin que cambie una línea de código en ningún sitio.',
      note: 'Un proveedor nunca llama a la API de StayUp. Habla con la base de datos, y solo con ella.',
      diagram: {
        title: 'Un proveedor, paso a paso',
        sources: 'Sus fuentes, leídas de la base',
        sourcesItems: 'los feeds de podcast que este proveedor tiene encargado seguir',
        fetch: 'Consultar cada feed',
        compare: 'Quedarse solo con lo que no estaba',
        store: 'Escribir en la base de datos',
        exposed: 'La API lo expone, las aplicaciones lo muestran',
      },
      steps: {
        heading: 'En cada pasada',
        items: [
          'Leer las fuentes que te corresponden.',
          'Consultar cada una en el exterior.',
          'Comparar con lo que guardaste la vez anterior y quedarte solo con lo nuevo.',
          'Escribir los elementos nuevos en la base.',
          'Purgar lo que ha envejecido y registrar un fallo en vez de reventar por él.',
        ],
      },
    },

    access: {
      heading: 'Antes de empezar: ¿dónde va a escribir?',
      body: 'Un proveedor necesita acceso de escritura a la base de datos de la instancia que alimenta. En la instancia pública no lo tienes, así que en la práctica un proveedor tuyo va con una instancia tuya. Escribir uno no exige nada de la guía de autoalojamiento; ejecutarlo exige una base en la que puedas escribir.',
      cta: 'Guía de autoalojamiento',
    },

    existing: {
      heading: 'Ejemplos que puedes leer',
      body: 'Ya existen unos cuantos proveedores como repositorios independientes. Son los que la instancia de referencia ejecuta, no una definición de lo que StayUp cubre. Lee uno como ejemplo funcionando del contrato de abajo, y apúntalo a tu propia base si te encaja. El de RSS es el más corto.',
    },

    creating: {
      heading: 'Escribir el tuyo',
      naming: {
        heading: 'Elegir un nombre',
        intro:
          'Algo corto y en minúsculas, válido como identificador: podcast, hackernews, reddit_thread. Esa única cadena se usa literalmente en tres sitios:',
        columnWhere: 'Dónde',
        columnExample: 'Para «podcast»',
        rows: ['Tu tabla de datos', 'Las fuentes que te pertenecen', 'Tu nombre visible'],
        note: 'No hay nada que reservar por adelantado: el nombre es sencillamente aquel con el que creas la tabla. Dos proveedores solo chocan si eligen el mismo.',
      },
      shape: {
        heading: 'Qué guardas',
        body: 'Una fila por elemento encontrado. El contenido en sí puede ser texto plano o JSON, tú decides. Las aplicaciones no tienen una representación dedicada para un proveedor recién creado, así que lo muestran como tarjeta sobria: el principio del contenido, la fecha y tu nombre visible. Funciona, solo que es visualmente austero. Una representación más rica es opcional, aparte, y nada del contrato la exige.',
      },
      schedule: {
        heading: 'Ejecutarlo de forma programada',
        body: 'Copia cualquier recolector existente: un Dockerfile y un trabajo diario que ejecute el script con la URL de la base como secreto. Nada exige una CI concreta: un temporizador de systemd o un cron normal hacen lo mismo.',
      },
    },

    contract: {
      heading: 'Contrato técnico',
      lede: 'Material de referencia. Lo necesitas para escribir un proveedor, no para entender StayUp.',
      diagramTitle: 'Lo que tu script puede tocar',
      yourScript: 'Tu proveedor',
      readOnly: 'solo lectura',
      readWrite: 'lectura y escritura — enteramente tuya',
      upsertOne: 'una fila: la tuya',
      writeOnError: 'escribir cuando haya error',
      repositoryDesc: 'las fuentes a seguir',
      connectorDesc: 'el contenido que recoges',
      registryDesc: 'tu nombre visible',
      logDesc: 'los fallos, en vez de reventar',
      warning:
        'Nunca escribas en la tabla de otro proveedor, ni en las tablas de usuarios, sesiones, cuentas o suscripciones: pertenecen a la API y a la aplicación web.',
      tablesHeading: 'Las cuatro tablas',
      tablesIntro:
        'Tu paso de inicialización, ejecutado al principio de cada pasada, debe garantizar que existan. Toda instrucción es idempotente: se puede repetir cada vez sin riesgo, incluso si otro proveedor creó antes las compartidas.',
      engineIntro:
        'Elige el motor de tu instancia. Los nombres no cambian de una pestaña a otra: solo cambian el dialecto y los tipos, y por eso un proveedor escrito contra un motor se lee igual contra otro.',
      engineNotes: [
        'El dialecto de referencia, y lo que corre la instancia pública.',
        'Las mismas tablas, con tipos de MySQL. Una URL tiene que caber en un VARCHAR indexable, de ahí la longitud explícita.',
        'Sin servidor: tu proveedor y la API abren el mismo fichero. Las fechas y el JSON se guardan como texto, que la API vuelve a interpretar al leer.',
        'Una colección en lugar de una tabla, y ningún esquema que declarar, pero dos reglas. Un documento repository lleva un _id numérico, sacado de la colección counters, porque el contrato designa una fuente con un número. Y nada se propaga en cascada: lo que escribes, lo limpias tú.',
      ],
      repositoryTitle: 'repository — compartida, tú sobre todo la lees',
      repositoryBody:
        'Una fila es una cosa que seguir: un feed de podcast, un subreddit, lo que tu proveedor llame una fuente. La columna type debe coincidir con el nombre de tu proveedor. La columna config es JSON libre que solo tu script define e interpreta.',
      connectorTitle: 'connector_<name> — tuya, por completo',
      connectorBody: 'Columnas opcionales, usadas si están pero nunca exigidas:',
      optionalDescriptions: [
        'la marca de tiempo propia del contenido, preferida a la hora de ejecución al ordenar por novedad.',
        'una etiqueta corta que se muestra junto a las representaciones ricas: una etiqueta de versión, un id de vídeo, etc.',
      ],
      registryTitle: 'provider_registry — compartida, una fila para ti',
      registryBody:
        'El orden solo afecta a cómo aparecen los proveedores en las aplicaciones; vale cualquier entero. Si te saltas esta tabla, tu proveedor sigue funcionando: la API recurre a tu nombre con la inicial en mayúscula.',
      logTitle: 'log — compartida, opcional pero recomendable',
      logBody: 'Escribe aquí en lugar de reventar cuando una fuente falle, y sigue con las demás.',
      addingSources: {
        heading: 'Meter fuentes',
        body: 'Dos formas. Añade un flag --add que inserte una fila y termine: útil para sembrar directamente contra la base. La otra vía, la que siguen de verdad los usuarios, es añadir una fuente desde la aplicación, donde el campo de proveedor debe coincidir con el sufijo de tu tabla.',
      },
      checklist: {
        heading: 'Antes de darlo por terminado',
        items: [
          'creada con al menos un identificador, una referencia de fuente, el contenido, una marca de tiempo y un indicador de éxito.',
          'fila insertada o actualizada en cada pasada.',
          'fuentes leídas con el nombre de tu proveedor.',
          'entradas antiguas purgadas, o la ausencia de retención documentada.',
          'fallos por fuente escritos aquí en vez de tumbar la pasada.',
          'lista tu proveedor después de una pasada.',
          'devuelve tus datos.',
        ],
      },
    },
  },
}
