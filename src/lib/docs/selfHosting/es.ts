import type { DocContent } from './en'

export const es: DocContent = {
  meta: {
    title: 'StayUp — Autoalojamiento y creación de proveedores',
    description:
      'Ejecuta tu propia instancia de stayup-api y escribe un proveedor que se conecte a StayUp sin tocar el código de las apps.',
  },
  nav: {
    onThisPage: 'En esta página',
    backToSite: 'Volver al sitio',
  },
  eyebrow: 'Documentación',
  title: 'Autoalojar StayUp y crear proveedores',
  lede: 'Dos públicos, una página: ejecutar tu propia instancia de stayup-api sobre tus propios datos, y escribir un proveedor que se conecte sin tocar una línea de las cuatro apps.',

  overview: {
    heading: 'Cómo encajan las piezas',
    points: [
      'stayup-api es una capa HTTP fina y sin estado sobre una única base de datos PostgreSQL. Nunca fija un nombre de proveedor en el código. En cada petición pregunta a Postgres qué tablas connector_* existen en ese momento y qué nombre visible ha registrado cada una: esa respuesta es la lista de proveedores.',
      'Un proveedor es un script independiente (hoy Python, mañana cualquier cosa) que posee exactamente una tabla y escribe filas en ella de forma periódica. Nunca habla con stayup-api: habla con la misma base Postgres.',
      'Las tres apps cliente tampoco fijan una URL de API. Cada una trae un valor por defecto, y cualquier usuario puede apuntarla a otra instancia de stayup-api desde su perfil: otra base de datos, otros proveedores, otros datos.',
    ],
    note: 'Las instancias no se coordinan. Si te autoalojas, empiezas con una base vacía y cero proveedores, hasta que al menos un recolector se ejecute contra ella. No se comparte nada con la instancia de referencia.',
    diagram: {
      title: 'Arquitectura general',
      providers: 'Proveedores — scripts independientes, uno por tipo de fuente',
      yourProvider: 'tu nuevo proveedor…',
      writesCron: 'escribe, de forma programada',
      database: 'PostgreSQL',
      dbShared: 'compartida',
      dbPerProvider: 'una por proveedor',
      readsWrites: 'lee y escribe, por SQL',
      api: 'stayup-api',
      apiSubtitle: 'sin estado — descubre los proveedores en Postgres al recibir la petición',
      http: 'HTTP, en una URL configurable',
      clients: 'Apps cliente',
      endUser: 'usuario final',
      note: 'Cualquier cliente puede apuntar a cualquier instancia y, por tanto, a cualquier base de datos. Existe una instancia de referencia; el autoalojamiento es una pila paralela de la misma forma, desconectada de ella.',
    },
  },

  part1: {
    eyebrow: 'Parte 1',
    heading: 'Autoalojar stayup-api',
    requirements: {
      heading: 'Requisitos',
      items: [
        'Una base de datos PostgreSQL (14 o superior) accesible desde donde se ejecute la API.',
        'Node.js 22 o superior, si no usas Docker.',
        'Opcionalmente una cuenta de Cloudflare, si quieres desplegar en Workers como la instancia de referencia.',
      ],
    },
    env: {
      heading: 'Variables de entorno',
      columnVariable: 'Variable',
      columnRequired: 'Obligatoria',
      columnDescription: 'Descripción',
      yes: 'sí',
      no: 'no',
      descriptions: [
        'postgres://user:pass@host:port/dbname. Las builds de Node y Docker también aceptan DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD por separado.',
        'Secreto aleatorio que firma los tokens de autenticación. Genera uno con openssl rand -hex 32.',
        'La única cuenta de servicio de administración. No hay ninguna fila de admin en la base de datos: quien entre con estas credenciales obtiene el rol de administrador. Los usuarios normales se registran desde las apps.',
        'URL pública de tu despliegue de stayup-ui. Se usa como destino de redirección OAuth.',
        'Activa «Iniciar sesión con Google». Déjala vacía para desactivarlo.',
        'Activa «Iniciar sesión con GitHub». Déjala vacía para desactivarlo.',
      ],
      note: 'El acceso con correo y contraseña siempre funciona, hagas lo que hagas con las variables de OAuth.',
    },
    deploy: {
      heading: 'Opciones de despliegue',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Node.js a secas'],
      dockerIntro: 'El camino más corto: clonar, rellenar .env, arrancar.',
      dockerNote:
        'docker-compose.yml monta el esquema en el directorio de inicialización de Postgres, así que las tablas base se crean la primera vez que se inicializa el volumen. La API queda escuchando en el puerto 3000.',
      workersIntro: 'Coincide con el despliegue de referencia.',
      workersNote:
        'Tu Postgres tiene que ser accesible desde la red de Cloudflare: un proveedor gestionado con una cadena de conexión pública y agrupada es la respuesta habitual. Workers no puede llegar a una base de datos de tu red doméstica.',
      nodeIntro: 'Sin orquestación, solo el servidor compilado.',
      nodeNote:
        'O construye tú mismo el Dockerfile incluido, si prefieres un contenedor sin Compose.',
    },
    schema: {
      heading: 'Aplicar el esquema y crear tu primer usuario',
      applyIntro: 'Si no te apoyas en la inicialización automática de Compose, aplícalo una vez:',
      applyNote:
        'Es puramente aditivo — solo CREATE TABLE IF NOT EXISTS — así que puede reejecutarse en cualquier momento, incluso contra una base que ya tiene datos.',
      userIntro:
        'El acceso de administración son API_USERNAME y API_PASSWORD de arriba: no hay nada que crear. Para una cuenta normal, sin pasar por un formulario de registro:',
      verifyIntro: 'Después comprueba que responde:',
      verifyNote:
        'Una lista de proveedores vacía es la respuesta esperada en este punto: todavía no se ha ejecutado ningún proveedor contra esta base. De eso trata la parte 2.',
    },
    pointing: {
      heading: 'Apuntar una app a tu instancia',
      items: [
        'stayup-ui: define STAYUP_API_URL en tu despliegue, o no la toques y deja que cada visitante la sustituya desde su perfil, donde se guarda por navegador.',
        'stayup-desktop y stayup-mobile: Perfil, luego «URL de la API», pega la URL de tu instancia y guarda. «Restablecer por defecto» vuelve a la integrada en cualquier momento.',
      ],
      diagram: {
        title: 'Cambiar de instancia',
        instanceA: 'stayup-api — instancia de referencia',
        instanceB: 'stayup-api — tu instancia',
        providersA: 'proveedores: changelog, youtube, rss, scrap',
        providersB: 'proveedores: podcast, hackernews',
        client: 'La misma app, un solo ajuste',
        connected: 'conectado ahora mismo',
        switch: 'cambiar a esta otra',
        note: 'Cero cambios de código. La lista de proveedores, los datos y la representación siguen a la instancia configurada, incluido el modo genérico para los proveedores que la app no conoce por su nombre.',
      },
    },
  },

  part2: {
    eyebrow: 'Parte 2',
    heading: 'Crear un proveedor nuevo',
    intro:
      'Un proveedor es cualquier script que escriba periódicamente, en su propia tabla de Postgres, filas que describan contenido nuevo. stayup-api y las tres apps lo recogen solas — sin cambiar código en ningún otro sitio — siempre que respete el contrato de abajo. Los cuatro recolectores existentes son implementaciones de referencia completas; el de RSS es el más corto, léelo junto a esta página.',
    contract: {
      heading: 'El contrato de proveedor',
      diagramTitle: 'Lo que tu script puede tocar',
      yourScript: 'Tu script de proveedor',
      readOnly: 'solo lectura',
      readWrite: 'lectura y escritura — propiedad completa',
      upsertOne: 'upsert de exactamente una fila: la tuya',
      writeOnError: 'escribir cuando haya error',
      repositoryDesc: 'compartida — las fuentes a seguir',
      connectorDesc: 'tuya — creada y poseída enteramente por ti',
      registryDesc: 'compartida — tu nombre visible',
      logDesc: 'compartida, opcional — escribe aquí en vez de reventar',
      warning:
        'Nunca escribas en la tabla de otro proveedor, ni en user, session, account o user_repository: pertenecen a stayup-api y stayup-ui.',
    },
    naming: {
      heading: 'Convención de nombres',
      intro:
        'Elige un nombre corto en minúsculas, válido como identificador snake_case: podcast, hackernews, reddit_thread. Esa única cadena se usa literalmente en tres sitios:',
      columnWhere: 'Dónde',
      columnExample: 'Ejemplo, para «podcast»',
      rows: ['Tu tabla de datos', 'repository.type — qué fuentes son tuyas', 'Tu nombre visible'],
      note: 'No hay ningún registro de nombres que reservar por adelantado: el nombre es sencillamente aquel con el que creas la tabla. Dos proveedores solo chocan si eligen el mismo nombre de tabla.',
    },
    tables: {
      heading: 'Las cuatro tablas implicadas',
      intro:
        'Tu paso de inicialización, ejecutado al principio de cada pasada, debe garantizar que existan. Toda instrucción es idempotente: se puede repetir cada vez sin riesgo, incluso si otro proveedor creó antes las compartidas.',
      repositoryTitle: 'repository — compartida, tú sobre todo la lees',
      repositoryDesc:
        'Una fila es una cosa que seguir: un feed de podcast, un subreddit, lo que tu proveedor llame una fuente. type debe coincidir con el nombre de tu proveedor. config es JSON libre que solo tu script define e interpreta.',
      connectorTitle: 'connector_<name> — tuya, por completo',
      connectorDesc: 'Columnas opcionales, usadas si están pero nunca exigidas:',
      optionalDescriptions: [
        'la marca de tiempo propia del contenido, preferida a executed_at al ordenar por novedad.',
        'una etiqueta corta que se muestra junto a las representaciones ricas: una etiqueta de versión, un id de vídeo, etc.',
      ],
      registryTitle: 'provider_registry — compartida, una fila para ti',
      registryDesc:
        'sort_order solo afecta al orden en que aparecen los proveedores en las apps; vale cualquier entero (los cuatro existentes usan 10, 20, 30, 40). Si te saltas esta tabla, tu proveedor sigue funcionando: la API recurre a tu nombre con la inicial en mayúscula.',
      logTitle: 'log — compartida, opcional pero recomendable',
      logDesc: 'Escribe aquí en lugar de reventar cuando una fuente falle, y sigue con las demás.',
    },
    eachRun: {
      heading: 'Lo que hace tu script en cada pasada',
      steps: [
        'Conectarse y ejecutar el paso de esquema idempotente de arriba.',
        'Leer tu lista de fuentes en repository, filtrada por el nombre de tu proveedor.',
        'Por cada fuente: consultar el servicio externo, comparar con lo ya guardado — normalmente la última fila correcta de esa fuente — e insertar solo lo nuevo.',
        'Purgar filas antiguas según config.retention_days, o las claves de configuración que definas.',
        'Ante un fallo en una fuente, escribir en log y pasar a la siguiente en vez de abortar toda la pasada.',
      ],
      addFlag:
        'Añade un flag --add <url> que haga upsert de una fila de repository y termine: así se siembran fuentes directamente en la base de datos. La otra vía — la que siguen de verdad los usuarios — es añadir una fuente por la API, donde provider debe coincidir con el sufijo de tu tabla.',
    },
    conventions: {
      heading: 'Convenciones de contenido y la salvedad del render genérico',
      body: 'content puede ser texto plano o una cadena JSON, como prefieras. Los proveedores existentes usan objetos JSON pequeños para YouTube y RSS, para que las apps puedan mostrar un título y una miniatura. Un proveedor recién creado no tiene render propio para su forma, así que las tres apps lo muestran como tarjeta genérica: los primeros caracteres de content, la fecha y tu nombre visible. Es plenamente funcional, solo más sobrio. Un render rico es un añadido posterior y opcional: alguien agrega en cada app un componente asociado al nombre de tu proveedor. Nada del contrato del servidor lo exige.',
    },
    schedule: {
      heading: 'Ejecutarlo de forma programada',
      body: 'Copia el patrón de cualquier recolector existente: un Dockerfile y un flujo diario que ejecute el script con la URL de la base de datos como secreto, apuntando al mismo Postgres que usa tu API. Nada de esto exige GitHub Actions en particular: un temporizador de systemd, un cron normal u otra CI hacen exactamente lo mismo.',
    },
    checklist: {
      heading: 'Antes de darlo por terminado',
      items: [
        'creada con al menos id, repository_id, content, executed_at y success.',
        'fila insertada o actualizada en cada pasada.',
        'fuentes leídas con el nombre de tu proveedor.',
        'entradas antiguas purgadas, o la ausencia de retención documentada.',
        'errores por fuente escritos aquí en vez de tumbar la pasada.',
        'lista tu proveedor después de una pasada.',
        'devuelve tus datos.',
      ],
    },
  },
}
