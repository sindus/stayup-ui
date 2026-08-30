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
        'Qué es StayUp, cómo encajan las piezas, y adónde ir después: ejecutar tu instancia, operarla, o escribir un proveedor.',
    },
    eyebrow: 'Documentación',
    title: 'Cómo funciona StayUp',
    lede: 'StayUp convierte muchos tipos de fuente externa — notas de versión, vídeos, feeds, páginas scrapeadas, lo que un programa sepa leer — en un feed por persona. Esta página es el modelo mental y el vocabulario; luego elige el camino que necesites.',
    concept: {
      heading: 'La idea, en cuatro frases',
      points: [
        'StayUp te muestra contenido nuevo de las fuentes que sigues. Lo que cuenta como fuente no está fijado: es lo que algún proveedor sepa ir a buscar.',
        'Un proveedor es un pequeño programa que va a buscar un tipo de fuente y escribe lo que encuentra en la base de datos de la instancia. Cubrir un tipo de fuente nuevo es escribir un proveedor; nada más cambia en StayUp.',
        'La API de StayUp lee esa base de datos y la sirve a las apps. No codifica ningún tipo de fuente: en cada petición pregunta a la base qué proveedores existen ahora, y devuelve su manifiesto de visualización tal cual.',
        'Las apps — web, escritorio, móvil — leen la API. Cada una se puede apuntar a cualquier instancia, o sea a cualquier base de datos, y cada una sabe mostrar un proveedor del que nunca ha oído hablar.',
      ],
      note: 'El conjunto de fuentes es abierto por construcción. Una instancia muestra exactamente los proveedores que corren contra su base — sin lista incorporada, nada que registrar ante una autoridad central.',
      diagram: {
        title: 'De una fuente a tu pantalla',
        sources: 'Fuentes externas',
        sourcesItems:
          'un feed de podcast · un hilo de foro · una página de estado · lo que un programa sepa leer',
        providers: 'Proveedores',
        providersSub: 'un pequeño programa por tipo de fuente, con planificación',
        database: 'La base de datos',
        databaseSub: 'PostgreSQL, MySQL, SQLite o MongoDB — todo lo recopilado, en un solo sitio',
        api: 'API de StayUp',
        apiSub: 'lee la base, sirve las apps, no codifica nada',
        apps: 'Web · Escritorio · Móvil · Admin',
        appsSub: 'cada una configurable hacia otra instancia',
      },
    },
    vocabulary: {
      heading: 'Las palabras, fijadas de una vez',
      intro:
        'Estos términos aparecen por todas partes y se confunden con facilidad. Esto significa cada uno en StayUp.',
      columnTerm: 'Término',
      columnMeaning: 'Qué significa',
      terms: [
        {
          term: 'Instancia',
          meaning:
            'Una base de datos + una API delante + los proveedores que la alimentan. La instancia pública es una; la tuya sería otra. Las instancias nunca se hablan.',
        },
        {
          term: 'Proveedor (alias conector)',
          meaning:
            'Un programa autónomo que va a buscar un tipo de fuente y escribe filas en la base. «Conector» y «proveedor» son lo mismo; los repos se llaman stayup-cmd-*.',
        },
        {
          term: 'Fuente (alias flux) — una fila repository',
          meaning:
            'Una cosa que se sigue: una URL de feed concreta, un canal, una página. Guardada como fila de la tabla compartida repository, con type igual al nombre del proveedor.',
        },
        {
          term: 'Suscripción',
          meaning:
            'Un vínculo entre un usuario y una fuente: «esta persona sigue este flux». Añadir un flux en una app crea una suscripción (y la fuente misma, si no existía).',
        },
        {
          term: 'Plantilla de visualización',
          meaning:
            'Un manifiesto JSON opcional que el proveedor guarda en provider_registry.template. Dice a las apps cómo renderizar sus filas. Sin plantilla → una tarjeta genérica simple.',
        },
        {
          term: 'Admin',
          meaning:
            'Un operador de una instancia. El primero (un super admin) se crea por línea de comandos; el resto se gestiona desde la interfaz web de administración. Separado de las cuentas de usuario.',
        },
      ],
    },
    paths: {
      heading: '¿Qué camino necesitas?',
      installTitle: 'Ejecutar tu propia instancia',
      installBody:
        'Tu propia API y tu propia base de datos, para que tus datos sigan siendo tuyos y elijas qué corre contra ellos. Incluye un recorrido local completo.',
      installCta: 'Guía de instalación',
      generateTitle: 'Generar un script de instalación',
      generateBody:
        'El camino guiado: elige una base de datos y los conectores que quieras, y obtén un único script bash que levanta toda la pila.',
      generateCta: 'Generador de instalación',
      adminTitle: 'Operar tu instancia',
      adminBody:
        'La interfaz web de administración: gestionar administradores, decidir qué proveedores aceptan flux nuevos libremente, trabajar la cola de aprobación, curar usuarios y flux.',
      adminCta: 'Guía de administración',
      providersTitle: 'Conectar una fuente nueva',
      providersBody:
        'Escribir un proveedor — un programa que va a buscar una fuente que StayUp aún no cubre y guarda lo que encuentra. Incluye las plantillas de visualización.',
      providersCta: 'Guía de proveedores',
      relation:
        'Operar una instancia y escribir un proveedor están relacionados pero son cosas distintas. Un proveedor nunca habla con la API, solo con la base — así que puedes escribir uno sin leer la guía de instalación. Ejecutarlo es otra cosa: necesita acceso de escritura a la base que alimenta, y en la instancia pública no lo tienes. En la práctica, tu propio proveedor va con tu propia instancia.',
    },
  },
  install: {
    meta: {
      title: 'StayUp — Instalación',
      description:
        'Levantar tu propia instancia de StayUp: las piezas, un recorrido local completo, las cuatro bases de datos, la configuración, y cómo apuntar las apps a ella.',
    },
    eyebrow: 'Instalación',
    title: 'Ejecutar tu propia instancia',
    lede: 'Una instancia es una base de datos, la API delante, los proveedores que elijas para alimentarla y — si quieres operarla desde un navegador — la interfaz web de administración. Esta página lo recorre todo, en local, de principio a fin.',
    why: {
      heading: 'Por qué molestarse',
      intro:
        'La instancia pública tiene sus propios proveedores y sus propios datos. Ejecutar la tuya te permite:',
      items: [
        'guardarlo todo en una base que controlas;',
        'elegir qué proveedores corren, y con qué frecuencia;',
        'seguir fuentes que la instancia pública no cubre;',
        'decidir quién puede añadir qué, mediante la aprobación por proveedor;',
        'apuntar las apps web, de escritorio y móvil a ella — un ajuste, sin cambio de código.',
      ],
      note: 'Las instancias no se hablan. Empiezas con una base vacía y sin proveedores, hasta que ejecutas uno contra ella.',
    },
    pieces: {
      heading: 'Las cuatro piezas',
      database: 'Una base de datos',
      databaseBody:
        'Contiene todo: las fuentes seguidas, el contenido recopilado, las cuentas, los administradores. PostgreSQL, MySQL/MariaDB, SQLite o MongoDB — la API se adapta a la que le indiques.',
      api: 'API de StayUp',
      apiBody:
        'Una capa fina y sin estado sobre esa base. No codifica ningún nombre de proveedor — en cada petición pregunta a la base qué hay. Corre en Node, en Docker, o en Cloudflare Workers.',
      providers: 'Proveedores',
      providersBody:
        'Los programas que realmente llenan la base. Repos autónomos, lanzados con planificación, que solo hablan con la base. Sin al menos uno, tu instancia funciona pero no muestra nada.',
      adminUi: 'La interfaz web de administración (opcional)',
      adminUiBody:
        'Un despliegue de la app web abierto en /admin. Permite gestionar administradores, fijar el modo de aprobación de cada proveedor, trabajar la cola de solicitudes de flux, y curar usuarios y flux. Prescinde de ella y la API sigue funcionando — solo pierdes la consola de navegador.',
    },
    fastPath: {
      heading: 'El camino rápido',
      body: 'Si solo quieres que funcione, el generador de instalación hace unas preguntas y te entrega un único stayup-setup.sh que hace todo lo de abajo por ti — clonar, compose, esquema, super admin, primera ejecución de conectores, planificador.',
      cta: 'Abrir el generador de instalación',
    },
    walkthrough: {
      heading: 'Recorrido local completo',
      intro:
        'A mano, para que veas cada pieza móvil. Aquí PostgreSQL y Docker; los mismos pasos funcionan con cualquier motor soportado.',
      steps: [
        'Clonar la API: git clone https://github.com/stayup-app/stayup-api.git && cd stayup-api',
        'Copiar .env.example a .env y fijar DATABASE_URL y JWT_SECRET (openssl rand -hex 32). No hay usuario ni contraseña de admin que fijar — los administradores viven en la base.',
        'Arrancar la base y la API: docker compose up -d db api. El fichero compose siembra el esquema en Postgres en la primera init; la API escucha en el puerto 3000.',
        'Si no contaste con esa auto-init, aplica el esquema una vez: psql "$DATABASE_URL" -f src/db/schema.sql. Solo añade, así que se puede repetir sin riesgo.',
        'Crear el primer super admin: npm run create-admin -- root@example.com "Root" \'una-contraseña-fuerte\'. Es la cuenta que gestiona la interfaz web de administración.',
        'Añadir un proveedor. Clonar uno — git clone https://github.com/stayup-app/stayup-cmd-rss.git — apuntar su DATABASE_URL a la misma base, instalar sus dependencias, y luego: python fetch_rss.py --add https://blog.example.com/feed.xml y python fetch_rss.py. La primera ejecución real crea sus tablas y lo registra.',
        'Comprobar que la API lo ve: curl localhost:3000/connectors/providers debería listar ahora rss con su manifiesto de visualización.',
        'Abrir la app de escritorio, ir a Perfil → URL de la API, pegar http://localhost:3000, guardar. Crear una cuenta, y luego añadir un flux — la entrada rss aparece una vez que el conector se ha ejecutado.',
        'Planificar el conector para que siga corriendo: una entrada de cron, un timer de systemd, una planificación de GitHub Actions, o el contenedor Ofelia que monta el generador.',
      ],
      note: 'La API nunca lanza los conectores. Son programas aparte, con su propia planificación; lo único que comparten con la API es la base de datos.',
    },
    requirements: {
      heading: 'Qué necesitas',
      items: [
        'Una base de datos de la lista de abajo, alcanzable desde donde corra la API.',
        'Docker, o Node.js 22 o posterior si vas sin contenedores.',
        'Opcionalmente una cuenta de Cloudflare, para desplegar en Workers como la instancia de referencia.',
      ],
    },
    databases: {
      heading: 'Qué base de datos',
      intro:
        'La API no habla SQL directamente. Llama a un contrato de almacenamiento que cumple un adaptador por motor, y el esquema de tu DATABASE_URL elige el adaptador. Vienen cuatro motores:',
      columnEngine: 'Motor',
      columnScheme: 'Esquema de URL',
      columnDriver: 'Driver a instalar',
      note: 'Cada motor pasa la misma suite de conformidad — los mismos comportamientos, verificados en CI contra un PostgreSQL, un MySQL, un SQLite y un MongoDB reales. Eso hace la elección reversible: las tablas, las colecciones y las columnas llevan los mismos nombres en todas partes, así que un proveedor se describe una vez y solo cambia su dialecto.',
      workersNote:
        'Una excepción, y no es cosa nuestra: Cloudflare Workers solo abre el tipo de conexión que usa PostgreSQL. Los drivers de MySQL, SQLite y MongoDB necesitan Node — Docker o Node.js a secas, no Workers.',
    },
    env: {
      heading: 'Configuración',
      columnVariable: 'Variable',
      columnRequired: 'Obligatoria',
      columnDescription: 'Descripción',
      yes: 'sí',
      no: 'no',
      descriptions: [
        'El esquema elige el motor: postgres://, mysql://, sqlite:// o mongodb://. Los builds de Node y Docker también aceptan DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD por separado, para PostgreSQL.',
        'Secreto aleatorio que firma los tokens de autenticación. Genera uno con openssl rand -hex 32. Debe seguir siendo el mismo durante toda la vida de la instancia — cámbialo y todos los tokens existentes dejan de funcionar.',
        'URL pública de tu despliegue web. Solo se usa como destino de redirección OAuth; déjala fuera si no activas el inicio de sesión con Google o GitHub.',
        'Activa «Iniciar sesión con Google». Déjalo vacío para desactivarlo.',
        'Activa «Iniciar sesión con GitHub». Déjalo vacío para desactivarlo.',
      ],
      note: 'No hay variable de usuario ni contraseña de admin. El antiguo par API_USERNAME / API_PASSWORD ya no existe: los administradores son filas en la base de datos, y el primero se crea con npm run create-admin. El inicio de sesión con e-mail y contraseña para usuarios normales siempre funciona, hagas lo que hagas con las variables de OAuth.',
    },
    deploy: {
      heading: 'Desplegar la API',
      tabs: ['Docker Compose', 'Cloudflare Workers', 'Node.js a secas'],
      dockerIntro: 'El camino más corto: clonar, rellenar .env, ejecutar.',
      dockerNote:
        'El fichero compose monta el esquema en el directorio de init de Postgres, así que las tablas del núcleo se crean la primera vez que se inicializa el volumen. La API escucha entonces en el puerto 3000. A continuación, crea el super admin — más abajo.',
      workersIntro: 'Lo que ejecuta la instancia de referencia.',
      workersNote:
        'Tu base de datos tiene que ser alcanzable desde la red de Cloudflare — un proveedor gestionado con una cadena de conexión pública con pool es la respuesta habitual. Workers no puede alcanzar una base en tu red doméstica, ni ejecutar el script create-admin: crea el super admin contra la base desde tu propia máquina.',
      nodeIntro: 'Sin orquestación, solo el servidor compilado.',
      nodeNote:
        'O construye tú mismo el Dockerfile provisto, si prefieres correr un contenedor sin Compose. La imagen compilada trae también el script create-admin.',
    },
    schema: {
      heading: 'Crear las tablas, y el primer admin',
      applyIntro:
        'Si no cuentas con la auto-init de Compose, aplica el esquema una vez tú mismo. Un fichero por motor, los mismos nombres de tablas y columnas en todos:',
      applyNote:
        'Los ficheros SQL solo añaden — CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS — así que se pueden repetir en cualquier momento, incluso contra una base que ya tiene datos.',
      engineNotes: [
        'El esquema de referencia. Versión 14 o posterior.',
        'MySQL 8 o MariaDB 10.2 y posteriores: la API ordena el contenido con una función de ventana.',
        'Nada que hospedar — un fichero junto a la API. Bueno para una instancia personal, no para una que las apps golpean desde varios sitios a la vez.',
        'Sin esquema que aplicar: MongoDB crea una colección en la primera escritura. Solo importan los índices, y la API los crea sola al conectarse — el comando de arriba solo lo hace por adelantado.',
      ],
      adminIntro:
        'Los administradores son filas de la tabla admin; no hay cuenta por defecto. Crea el primero — siempre un super admin — por línea de comandos. Aplica primero el esquema, luego inserta la fila:',
      userIntro:
        'Las cuentas de usuario normales se crean desde el formulario de registro de las apps. Para hacer una sin formulario, para pruebas:',
      verifyIntro: 'Luego comprueba que la API responde:',
      verifyNote:
        'Una lista de proveedores vacía es la respuesta esperada aquí: nada ha recopilado nada todavía. Eso es la guía de proveedores.',
    },
    auth: {
      heading: 'Usuarios y autenticación',
      intro:
        'Cómo obtiene la gente una cuenta en tu instancia, y cómo activar el inicio de sesión con Google o GitHub.',
      registration: {
        heading: 'Modos de registro',
        body: 'REGISTRATION_MODE decide qué hace un registro público. open (por defecto): la cuenta se crea y la persona inicia sesión de inmediato — el comportamiento actual. approval: el registro queda en espera. POST /auth/register responde 202 sin token, un registro por OAuth vuelve con ?error=pending_approval, y un intento de inicio de sesión para un correo en espera responde 403. Un administrador trabaja luego la cola en /admin/users → «Comptes en attente». Las cuentas que crea un administrador siempre están activas, sea cual sea el modo; también un registro por OAuth cuyo correo verificado ya coincide con una cuenta activa.',
      },
      pointing: {
        heading: 'Dónde inician sesión las apps',
        body: 'Las apps de escritorio y móvil, y las páginas web de inicio de sesión y registro, llevan todas una línea «Servidor» en la pantalla de acceso. Muestra el host de la API y se despliega en un campo para cambiarlo o restablecerlo — antes de que exista ninguna cuenta, así nadie tiene que iniciar sesión primero en la API por defecto. Cada pantalla lee GET /auth/config de la instancia configurada y muestra solo los métodos de acceso que ofrece. La app web alojada sigue rechazando un host privado (localhost, 10.x, 192.168.x…) como medida anti-SSRF: para apuntar una UI web a una API local, ejecuta tu propia copia de stayup-ui con STAYUP_API_URL fijado en el despliegue.',
      },
      oauth: {
        heading: 'Inicio de sesión con Google y GitHub',
        intro:
          'Opcional. Cada proveedor necesita una app OAuth tuya y cuatro variables de entorno en la API:',
        steps: [
          'Crea una app OAuth — Google en console.cloud.google.com/apis/credentials, GitHub en github.com/settings/developers.',
          'Pon su URL de callback (o de redirección) en https://<origen-de-tu-api>/auth/oauth/<provider>/callback. Ambos proveedores permiten http://localhost para desarrollo.',
          'Pon el client ID y el secreto en GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (o el par GITHUB_) en la API.',
          'Pon UI_URL en el origen de tu despliegue web — tras un OAuth de navegador la API redirige a UI_URL/api/auth/callback. La app de escritorio intercepta esa ruta ella misma, así que le vale cualquier UI_URL no vacío; la app móvil usa su propio enlace profundo stayup://, ya en la lista de permitidos.',
        ],
        note: 'Una app OAuth de GitHub admite exactamente una URL de callback, así que necesitas una app de GitHub por origen de API. El generador de scripts pide estas credenciales al ejecutarse y las escribe directamente en docker-compose.yml, nunca en el script.',
      },
    },

    pointing: {
      heading: 'Apuntar una app a tu instancia',
      items: [
        'Web: fija STAYUP_API_URL en tu despliegue — o déjala y deja que cada visitante la sobrescriba desde su perfil, donde se guarda por navegador.',
        'Escritorio y móvil: la línea «Servidor» en la pantalla de acceso, o Perfil → «URL de la API» una vez dentro. «Restablecer» vuelve a la integrada en cualquier momento.',
        'La interfaz web de administración es la misma app web: apunta su STAYUP_API_URL a tu API y abre /admin.',
      ],
      note: 'Nada más cambia. La lista de proveedores, los datos y el renderizado siguen todos a la instancia configurada — incluido el respaldo simple para proveedores que la app no conoce por su nombre.',
    },
    troubleshooting: {
      heading: 'Cuando algo va mal',
      items: [
        {
          symptom: 'La lista de proveedores vuelve vacía.',
          cause:
            'Esperado en una base recién hecha: ningún proveedor ha corrido contra ella todavía. Ejecuta uno y vuelve a comprobar.',
        },
        {
          symptom: 'Las apps no muestran contenido, pero la lista de proveedores está poblada.',
          cause:
            'Los proveedores corren pero nadie sigue nada todavía, o las fuentes que siguen no traen contenido nuevo. Añade una fuente desde la app.',
        },
        {
          symptom: 'Un proveedor aparece como tarjeta de texto, a veces JSON en crudo.',
          cause:
            'Sin plantilla de visualización utilizable. El proveedor no ha escrito provider_registry.template, o su columna content es una cadena JSON sin plantilla para interpretarla. Ver la guía de proveedores.',
        },
        {
          symptom: 'Añadir un flux dice «solicitud enviada» en vez de suscribir.',
          cause:
            'Ese proveedor está en modo de aprobación manual. Un admin lo aprueba o rechaza desde /admin/flux-requests. Cambia el modo en /admin/providers si no es lo que quieres.',
        },
        {
          symptom: 'create-admin dice que el e-mail ya está en uso.',
          cause:
            'Ya existe un super admin. Los administradores siguientes se crean desde la interfaz web de administración, no por línea de comandos.',
        },
        {
          symptom: 'El inicio de sesión funciona pero cualquier otra llamada se rechaza.',
          cause:
            'El secreto de firma difiere entre la instancia que emitió tu token y la que responde. Los tokens no cruzan de una instancia a otra.',
        },
      ],
    },
  },
  admin: {
    meta: {
      title: 'StayUp — Administración',
      description:
        'Operar una instancia de StayUp desde el navegador: administradores, aprobación de flux por proveedor, la cola de solicitudes, usuarios y flux.',
    },
    eyebrow: 'Administración',
    title: 'Operar tu instancia',
    lede: 'Una vez la API en marcha, la interfaz web de administración es desde donde operas la instancia en un navegador: quién puede añadir qué, qué solicitudes están pendientes, qué usuarios siguen qué flux.',
    webUi: {
      heading: 'La interfaz web de administración',
      body: 'Es la misma app web que el sitio público, abierta en /admin, apuntada a tu API. Es opcional — todo lo que hace tiene una ruta de API detrás — pero es la forma práctica de operar una instancia. Despliégala como cualquier otra copia de la app web, fija STAYUP_API_URL a tu API, e inicia sesión en /admin/login.',
      note: 'La sesión de admin es una cookie aparte de una sesión de usuario. El mismo navegador puede tener ambas a la vez sin que una cierre la sesión de la otra.',
    },
    roles: {
      heading: 'Super admin y admin',
      intro:
        'Dos niveles. El primer admin es siempre un super admin, creado por línea de comandos (npm run create-admin). Todos los admin posteriores se crean desde la UI y son admin normales.',
      columnRole: 'Rol',
      columnCan: 'Puede',
      rows: [
        {
          role: 'Super admin',
          can: 'Todo lo que puede un admin normal, más: crear, editar y borrar otros admins. No se puede borrar desde la UI, ni borrarse a sí mismo.',
        },
        {
          role: 'Admin',
          can: 'Trabajo operativo: usuarios, flux, modos de aprobación de proveedores, la cola de solicitudes. No ve ni toca la lista de admins. Puede cambiar su propia contraseña.',
        },
      ],
      note: 'Los administradores no son cuentas de usuario. Tienen su propia tabla, su propio inicio de sesión, y ningún feed propio.',
    },
    managingAdmins: {
      heading: 'Gestionar administradores',
      body: 'Solo super admin, en /admin/admins:',
      steps: [
        'Crear un admin con un e-mail, un nombre y una contraseña. Es un admin normal — no puede gestionar otros admins.',
        'Editar el nombre, el e-mail o la contraseña de un admin.',
        'Borrar un admin. Las filas de super admin y tu propia fila están bloqueadas.',
      ],
      note: 'Un admin normal que necesita cambiar su propia contraseña lo hace desde /admin/settings, con su contraseña actual.',
    },
    fluxApproval: {
      heading: 'Aprobación de flux por proveedor',
      intro:
        'Cuando un usuario añade un flux que aún no existe, lo que ocurre depende del modo de aprobación del proveedor. Fíjalo por proveedor en /admin/providers.',
      autoBody:
        'auto — el valor por defecto. La fuente se crea y el usuario se suscribe de inmediato. Bueno para proveedores donde cualquier URL vale (RSS, un changelog).',
      manualBody:
        'manual — añadir un flux desconocido crea una solicitud en su lugar (la app muestra «solicitud enviada»). No se crea nada hasta que un admin lo aprueba. Bueno para proveedores donde ejecutar una fuente cuesta algo, como el scraping.',
      note: 'Suscribirse a un flux que ya existe nunca pasa por aprobación — la aprobación solo concierne a traer una fuente nueva a la instancia.',
    },
    usersAndFluxes: {
      heading: 'Usuarios y flux',
      body: 'El resto de la consola es navegar y curar:',
      items: [
        '/admin/users — cada cuenta, con los flux que sigue. Añade o quita una suscripción en nombre de alguien.',
        '/admin/repositories — cada fuente de todos los proveedores, con su config. Crea una directamente (útil para sembrar un proveedor manual), o retira una.',
        '/admin/flux-requests — la cola pendiente. Aprobar crea o reutiliza la fuente y suscribe al solicitante; rechazar la marca rechazada. Ambos son definitivos.',
      ],
    },
    dataSources: {
      heading: 'Bases de datos secundarias',
      intro:
        'La base de datos principal sostiene la instancia en sí — admins, usuarios, suscripciones, el registro de proveedores. Además, puedes apuntar la instancia a bases de datos secundarias de solo lectura que solo llevan datos de conectores, y dejar que los usuarios sigan los flux que viven allí. Se gestionan en /admin/data-sources.',
      steps: [
        'La base de datos principal aparece arriba de la página, solo a título informativo: su motor y su host, nada que cambiar.',
        'Añadir una secundaria con un nombre y una cadena de conexión. Se admiten los mismos cuatro motores que para la principal.',
        'Probar la conexión. La instancia comprueba que puede conectarse y que hay al menos una tabla de conector presente, y lista los proveedores que encontró.',
        'Confirmar. La cadena de conexión se guarda cifrada en reposo y la fuente entra en la lista. Retírala cuando quieras — las suscripciones que apuntaban a ella se van con ella.',
      ],
      note: 'Los proveedores con el mismo nombre se fusionan en las apps: un usuario ve una sola pastilla «RSS» cuya lista de flux reúne los flux de todas las bases de datos, y una fila que vino de una secundaria lleva una pequeña insignia con el nombre de la base de datos. Nunca se escribe de vuelta en una secundaria — es una fuente de datos, no una segunda casa.',
    },

    addingFlux: {
      heading: 'Cómo un usuario añade un flux, desde cualquier app',
      intro:
        'El mismo flujo para cada proveedor — ya no hay caso especial por proveedor en las apps:',
      steps: [
        'Elegir un proveedor.',
        'La app muestra los flux que ese proveedor ya sigue y que tú aún no sigues. Un toque suscribe — nunca aprobación.',
        'O cambiar a «añadir uno nuevo». El campo lo gobierna el descriptor form del proveedor: su etiqueta, su marcador y la forma que espera.',
        'Enviar. Si el proveedor es auto, quedas suscrito. Si es manual, la app muestra «solicitud enviada» y un admin toma el relevo.',
      ],
      note: 'Por eso un proveedor debería traer un descriptor form en su plantilla — es lo que convierte un campo de texto vacío en «pega un handle de YouTube» o «pega una URL de feed».',
    },
  },
  generate: {
    meta: {
      title: 'StayUp — Generar una instalación self-hosted',
      description:
        'Elige una base de datos y los conectores que quieras, y descarga un único script bash que levanta tu propia instancia de StayUp.',
    },
    eyebrow: 'Instalación',
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
      registration: 'Registro',
      registrationOpen: 'Abierto',
      registrationOpenHint: 'Cualquiera que alcance la API puede crear una cuenta de inmediato.',
      registrationApproval: 'Con aprobación',
      registrationApprovalHint:
        'Las cuentas nuevas esperan en una cola hasta que un administrador las activa.',
      signInMethods: 'Métodos de acceso',
      emailPassword: 'Correo + contraseña',
      oauthHint:
        'El script pedirá el client ID y el secreto de OAuth al ejecutarlo — nunca quedan en el script.',
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
        'Escribir un programa que convierte cualquier fuente externa en contenido de StayUp.',
    },
    eyebrow: 'Proveedores',
    title: 'Conectar una fuente nueva',
    lede: 'Un proveedor es un programa que va a buscar un tipo de fuente y guarda lo que encuentra. Es lo único que escribes para extender StayUp — la API y las tres apps lo recogen solas.',
    what: {
      heading: 'Qué es realmente un proveedor',
      body: 'No un plugin, no un módulo que registrar: un programa ordinario, en cualquier lenguaje, lanzado con planificación. Lee la lista de fuentes que le corresponden, va a buscar cada una, guarda lo nuevo, y lo escribe en la base. La API lo recoge sola, y las tres apps lo muestran — sin que cambie una línea de código en ningún sitio.',
      note: 'Un proveedor nunca llama a la API de StayUp. Habla con la base, y solo con la base.',
      diagram: {
        title: 'Un proveedor, paso a paso',
        sources: 'Sus fuentes, leídas de la base',
        sourcesItems: 'los feeds de podcast que este proveedor recibió la orden de seguir',
        fetch: 'Ir a buscar cada feed',
        compare: 'Quedarse solo con lo que no estaba antes',
        store: 'Escribir en la base',
        exposed: 'La API lo expone, las apps lo muestran',
      },
      steps: {
        heading: 'En cada ejecución',
        items: [
          'Leer las fuentes que te corresponden.',
          'Ir a buscar cada una en el mundo exterior.',
          'Comparar con lo que guardaste la última vez, y quedarte solo con lo nuevo.',
          'Escribir los elementos nuevos en la base.',
          'Retirar lo que ha caducado, y registrar un fallo en vez de estrellarte con él.',
          'Volver a declarar tu nombre visible y tu plantilla, para que una base recién hecha te conozca en la primera ejecución.',
        ],
      },
    },
    access: {
      heading: 'Antes de empezar: ¿dónde va a escribir?',
      body: 'Un proveedor necesita acceso de escritura a la base de la instancia que alimenta. En la instancia pública no lo tienes, así que en la práctica un proveedor tuyo va con una instancia tuya. Escribir uno no requiere nada de la guía de instalación; ejecutar uno requiere una base en la que puedas escribir.',
      cta: 'Guía de instalación',
    },
    existing: {
      heading: 'Ejemplos concretos para leer',
      body: 'Empieza por stayup-cmd-template: un esqueleto desnudo hecho para copiar, con los tres puntos que cambias señalados. Luego lee los reales — changelog, youtube, rss, scrap, github-trending — que es lo que la instancia de referencia resulta ejecutar, no una definición de lo que StayUp cubre. El rss es el ejemplo real más corto del contrato de abajo; github-trending es la referencia para una plantilla de visualización rica. Apunta cualquiera a tu propia base si te conviene.',
      cta: 'Abrir stayup-cmd-template',
    },
    creating: {
      heading: 'Escribir el tuyo',
      naming: {
        heading: 'Elegir un nombre',
        intro:
          'Algo corto y en minúsculas, usable como identificador — podcast, hackernews, reddit_thread. Esa única cadena se usa tal cual en varios sitios:',
        columnWhere: 'Dónde',
        columnExample: 'Para «podcast»',
        rows: [
          'Tu tabla de datos',
          'Las fuentes que te pertenecen',
          'Tu fila en el registro',
          'El campo provider que las apps envían al añadir un flux',
        ],
        note: 'Nada que reservar por adelantado: el nombre es simplemente aquel con el que creas la tabla. Dos proveedores solo colisionan si eligen el mismo.',
      },
      shape: {
        heading: 'Qué guardas',
        body: 'Una fila por elemento encontrado. El contenido en sí puede ser texto plano o JSON — tú decides. Sin plantilla de visualización las apps muestran una tarjeta simple: el principio del contenido, la fecha, tu nombre visible. Funciona, solo que es visualmente sobrio, y muestra JSON en crudo si eso es lo que contiene tu columna content. Una plantilla lo arregla, y es la sección siguiente.',
      },
      schedule: {
        heading: 'Ejecutarlo con planificación',
        body: 'Copia cualquier colector existente: un Dockerfile en la raíz cuyo ENTRYPOINT ejecuta el script una vez, y un job que lo lanza con la URL de la base en el entorno. Nada impone una CI concreta — un timer de systemd, un cron a secas, o el contenedor Ofelia del generador hacen lo mismo.',
      },
    },
    templates: {
      heading: 'Plantillas de visualización',
      body: 'Una plantilla es un manifiesto JSON que tu proveedor guarda en provider_registry.template, en el mismo upsert que su nombre visible. La API lo transmite tal cual por GET /connectors/providers; cada app tiene un motor que lo lee y renderiza tus filas — una disposición en lista, y un panel de lectura en uno de siete modos: texto, html, medio, audio, galería, tabla, lista de enlaces. Ningún código de las apps conoce el nombre de tu proveedor.',
      fallbackNote:
        'Un proveedor sin plantilla (columna NULL, JSON ilegible, o una version no reconocida) funciona igualmente — las apps recurren a la tarjeta simple. Una plantilla es muy recomendable en cuanto tu contenido es algo más que una línea corta de texto.',
      cta: 'Referencia completa de plantillas',
    },
    form: {
      heading: 'El descriptor form',
      body: 'Dentro de la plantilla, un pequeño bloque form dice a las apps cómo debe verse el campo «añadir un flux nuevo» para tu proveedor. Sin él, el usuario tiene un campo de texto vacío; con él, un campo etiquetado que valida y construye la URL de la fuente por él.',
      fields: [
        {
          field: 'label · placeholder',
          meaning: 'lo que dice el campo y lo que muestra como pista.',
        },
        {
          field: 'urlTemplate',
          meaning:
            'p. ej. https://www.youtube.com/@{value} — {value} es lo que el usuario tecleó. Se omite si el valor ya es una URL http(s).',
        },
        {
          field: 'pattern',
          meaning:
            'una regex que la entrada transformada debe cumplir, comprobada en el cliente antes de enviar.',
        },
        {
          field: 'transform',
          meaning:
            'trim, quitar un prefijo/sufijo conocido, o extraer un grupo de captura — para que una URL completa pegada y un handle a secas acaben igual.',
        },
      ],
      note: 'Las apps guardan la URL construida como fuente; tu colector la vuelve a leer de la fila repository como cualquier otra.',
    },
    fluxApproval: {
      heading: 'Modo de aprobación',
      body: 'Cada proveedor tiene una columna flux_approval en el registro: auto (por defecto) o manual. auto suscribe al usuario de inmediato cuando añade un flux nuevo; manual lo convierte en una solicitud que un admin debe aprobar. Un proveedor puede sembrar su propio valor por defecto en el upsert; un admin lo sobrescribe por instancia desde /admin/providers. El scraping se entrega en manual por una razón — ejecutar una fuente cuesta algo allí.',
      note: 'Esto solo controla traer una fuente nueva. Suscribirse a una fuente que ya existe nunca pasa por aprobación.',
    },
    contract: {
      heading: 'Contrato técnico',
      lede: 'Material de referencia. Lo necesitas para escribir un proveedor, no para entender StayUp.',
      diagramTitle: 'Lo que tu script puede tocar',
      yourScript: 'Tu proveedor',
      readOnly: 'solo lectura',
      readWrite: 'lectura y escritura — enteramente tuya',
      upsertOne: 'una fila: la tuya',
      writeOnError: 'escritura en error',
      repositoryDesc: 'las fuentes a seguir',
      connectorDesc: 'el contenido que recopilas',
      registryDesc: 'tu nombre visible + plantilla',
      logDesc: 'fallos, en vez de estrellarse',
      warning:
        'Nunca escribas en la tabla de otro proveedor, ni en las tablas user, session, account, admin, subscription o flux_request: pertenecen a la API y a la app web.',
      tablesHeading: 'Las cuatro tablas',
      tablesIntro:
        'Tu paso de init, lanzado al principio de cada ejecución, debe asegurarse de que estas existen. Cada sentencia es idempotente — segura de repetir siempre, y segura si otro proveedor o la API creó las compartidas primero.',
      engineIntro:
        'Elige el motor que ejecuta tu instancia. Los nombres nunca cambian de una pestaña a otra — solo el dialecto y los tipos, y por eso un proveedor escrito para un motor se lee igual contra otro.',
      engineNotes: [
        'El dialecto de referencia, y lo que ejecuta la instancia pública.',
        'Mismas tablas, tipos MySQL. Una URL tiene que caber en un VARCHAR indexable, de ahí la longitud explícita.',
        'Sin servidor: tu proveedor y la API abren el mismo fichero. Fechas y JSON guardados como texto, que la API reparsea al leer.',
        'Una colección en vez de una tabla, y ningún esquema que declarar — pero dos reglas. Un documento repository lleva un _id numérico, sacado de la colección counters, porque el contrato designa una fuente por un número. Y nada cascadea: lo que escribes, lo limpias.',
      ],
      repositoryTitle: 'repository — compartida, tú sobre todo lees de ella',
      repositoryBody:
        'Una fila es una cosa a seguir: un feed de podcast, un subreddit, lo que tu proveedor llame una fuente. La columna type debe ser igual al nombre de tu proveedor. La columna config es JSON libre que solo tu script define e interpreta.',
      connectorTitle: 'connector_<name> — tuya, enteramente',
      connectorBody: 'Columnas opcionales, usadas si están presentes pero nunca obligatorias:',
      optionalDescriptions: [
        'la marca de tiempo propia del contenido, preferida a la hora de ejecución al ordenar por «lo más reciente».',
        'una etiqueta corta mostrada junto a los renders ricos — un tag de versión, un id de vídeo, etc.',
      ],
      registryTitle: 'provider_registry — compartida, una fila para ti',
      registryBody:
        'El sort order solo afecta al orden en que aparecen los proveedores en las apps; cualquier entero sirve. La columna template es tu manifiesto de visualización (secciones anteriores); déjala NULL y tu proveedor funciona igual, solo con la tarjeta simple. flux_approval es un ajuste de operador — no pelees con un admin por él, pero puedes sembrar un valor por defecto sensato. Omite la fila del todo y la API recurre a una versión capitalizada de tu nombre.',
      logTitle: 'log — compartida, opcional pero recomendada',
      logBody: 'Escribe aquí en vez de estrellarte cuando una fuente falla, y sigue con las demás.',
      addingSources: {
        heading: 'Meter fuentes',
        body: 'Dos maneras. Soporta un flag --add que inserta una fila y sale — cómodo para sembrar directamente contra la base. La otra manera, la que los usuarios finales toman de verdad, es añadir una fuente desde una app, que hace POST a /providers/<name>/fluxes; el campo provider debe ser igual al sufijo de tu tabla.',
      },
      checklist: {
        heading: 'Antes de darlo por hecho',
        items: [
          'creada con al menos un id, una referencia de fuente, el contenido, una marca de tiempo y un flag de éxito.',
          'fila upserteada en cada ejecución, con tu nombre visible y (recomendado) tu plantilla.',
          'fuentes leídas con el nombre de tu proveedor.',
          'entradas antiguas podadas — o la ausencia de retención documentada.',
          'fallos por fuente escritos aquí en vez de hacer caer la ejecución.',
          'lista tu proveedor tras una ejecución.',
          'devuelve tus datos.',
        ],
      },
    },
  },
}
