# Minerva Lib - Frontend & Conexión al Backend

Sistema web frontend completo para **Minerva Lib**, una plataforma moderna de gestión bibliotecaria y catálogo literario público, conectada en tiempo real con el servidor REST **`minerva-backend`** (Node.js, Express 5, JWT, MySQL).

## Aplicación desplegada y backend

- **Aplicación en Netlify:** [Abrir Minerva Lib](https://minerva-lib.netlify.app/)
- **Backend:** [Repositorio minerva-backend](https://github.com/Anderson-Oloroso/minerva-backend)

---

## Identidad Visual & Manual de Marca

- **Tipografía Oficial:** [Montserrat](https://fonts.google.com/specimen/Montserrat) (Regular 400, Medium 500, SemiBold 600, Bold 700 y ExtraBold 800).
- **Paleta Cromática Oficial:**
  - **Azul Noche:** `#0B2D62` (Color primario, liderazgo y sobriedad)
  - **Dorado Sabiduría:** `#F4B942` (Acentos dorados, insignia y distinción)
  - **Crema Páginas:** `#FAF3E0` (Fondos cálidos y superficies suaves)
  - **Negro Carbón:** `#1A1A1A` (Textos de alto contraste y legibilidad)
- **Modo Día / Noche:** Sistema de theming automático basado en CSS Custom Properties con detección de preferencia del sistema y persistencia en `localStorage`.

### Activos Gráficos en `assets/`:
- `assets/img/logo.png`: Logo oficial a color para tema claro.
- `assets/img/logo-dark.png`: Logo oficial para tema oscuro.
- `assets/img/isotipo.png`: Isotipo representativo (libro abierto y estrella Minerva).
- `assets/icons/app-icon.png`: Ícono oficial de la aplicación.
- `assets/icons/favicon.png`: Favicon web.

---

## Estructura del Proyecto

```text
minerva-lib/
│
├── index.html                 # Landing page y catálogo público (consulta sin registro)
├── README.md                  # Documentación del proyecto
├── LICENSE                    # Licencia del proyecto
│
├── css/
│   └── styles.css             # Sistema de diseño, tokens CSS, componentes y theming
│
├── js/
│   ├── api.js                 # Cliente API centralizado (JWT Bearer, fetch wrapper, manejo de errores)
│   ├── theme.js               # Gestor del modo claro/oscuro (localStorage + matchMedia)
│   ├── utils.js               # Notificaciones Toast, Modales dinámicos, navegación SPA y formateadores
│   ├── landing.js             # Controlador del catálogo público (GET /books, GET /genres)
│   ├── auth.js                # Controlador de autenticación (POST /auth/login, POST /auth/register)
│   └── app.js                 # Controlador SPA del Dashboard administrativo y de lector
│
├── pages/
│   ├── auth.html              # Pantalla dedicada de Iniciar Sesión y Registro con DPI
│   └── dashboard.html         # Panel principal de gestión bibliotecaria (SPA modular)
│
└── assets/
    ├── img/                   # Logos e isotipos oficiales
    └── icons/                 # Favicons e ícono de la aplicación
```

---

## Funcionamiento e integración con el backend

El frontend se comunica con `minerva-backend` mediante una API REST. `js/api.js` centraliza las solicitudes HTTP, agrega el prefijo `/api/v1`, convierte los cuerpos JSON y presenta los errores que devuelve el servidor. Las páginas de catálogo consultan los recursos públicos; el dashboard carga los datos de sus módulos desde la API según el usuario autenticado.

El flujo de autenticación funciona así:
1. El usuario inicia sesión o se registra desde `pages/auth.html`; el frontend envía los datos al endpoint correspondiente.
2. Al iniciar sesión correctamente, el backend devuelve un token de acceso y los datos del usuario. El navegador conserva el token para las solicitudes autenticadas.
3. `js/api.js` envía el token en el encabezado `Authorization` en las solicitudes protegidas. El backend valida la identidad y los permisos antes de responder.
4. El frontend muestra u oculta controles según el rol para adaptar la interfaz. La autorización real debe aplicarse siempre en el backend.
5. Si el servidor devuelve un error HTTP, el cliente muestra el mensaje correspondiente; si la sesión ya no es válida, el usuario debe autenticarse de nuevo.

La aplicación no necesita credenciales de base de datos ni credenciales administrativas incrustadas en el frontend. Las credenciales y secretos del backend deben configurarse únicamente en el entorno privado del servidor; cualquier valor incluido en archivos estáticos del frontend es visible para sus usuarios.

La URL base de la API se puede configurar desde el indicador de estado de conexión. El valor se guarda en `localStorage` del navegador y se usa en las solicitudes posteriores. En desarrollo, la URL predeterminada es `http://localhost:5000/api/v1`; en producción, configura la URL pública HTTPS de la API desplegada, terminada en `/api/v1`.

| Módulo | Método | Endpoint | Acceso Requerido | Descripción | Ubicación en Frontend |
|---|---|---|---|---|---|
| **Health** | `GET` | `/health` | Público | Comprueba estado del servidor | Badge indicador de estado |
| **Auth** | `POST` | `/auth/login` | Público | Inicio de sesión; devuelve token de acceso y datos del usuario | `pages/auth.html` |
| **Auth** | `POST` | `/auth/register` | Público | Registro de clientes con DPI de 13 dígitos | `pages/auth.html` |
| **Auth** | `POST` | `/auth/logout` | Autenticado | Invalida sesión | Barra superior |
| **Libros** | `GET` | `/books` | Público | Catálogo completo de libros | `index.html` & `dashboard.html` |
| **Libros** | `POST` | `/books` | Admin | Registrar nuevo título en inventario | Modal "Nuevo Libro" |
| **Libros** | `PUT` | `/books/:id` | Admin | Actualizar datos de libro | Modal "Editar Libro" |
| **Libros** | `DELETE` | `/books/:id` | Admin | Eliminar libro del catálogo | Modal de confirmación |
| **Autores** | `GET` | `/authors` | Público | Listado de autores registrados | Tablas y selectores |
| **Autores** | `POST` | `/authors` | Admin | Crear autor | Modal "Nuevo Autor" |
| **Autores** | `PUT` | `/authors/:id` | Admin | Modificar nombre del autor | Modal "Editar Autor" |
| **Autores** | `DELETE` | `/authors/:id` | Admin | Eliminar autor | Modal de confirmación |
| **Géneros** | `GET` | `/genres` | Público | Listar géneros literarios | Chips y selectores |
| **Géneros** | `POST` | `/genres` | Admin | Crear género | Modal "Nuevo Género" |
| **Géneros** | `PUT` | `/genres/:id` | Admin | Editar género | Modal "Editar Género" |
| **Géneros** | `DELETE` | `/genres/:id` | Admin | Eliminar género | Modal de confirmación |
| **Editoriales** | `GET` | `/publishers` | Público | Listar casas editoriales | Tablas y selectores |
| **Editoriales** | `POST` | `/publishers` | Admin | Crear editorial | Modal "Nueva Editorial" |
| **Editoriales** | `PUT` | `/publishers/:id` | Admin | Editar editorial | Modal "Editar Editorial" |
| **Editoriales** | `DELETE` | `/publishers/:id` | Admin | Eliminar editorial | Modal de confirmación |
| **Préstamos** | `GET` | `/loans` | Admin | Listado general de préstamos | Tabla de Préstamos (Admin) |
| **Préstamos** | `GET` | `/loans/me` | Lector | Préstamos del usuario autenticado | Tabla de Mis Préstamos |
| **Préstamos** | `POST` | `/loans` | Autenticado | Solicitar nuevo préstamo con fecha esperada | Modal "Nuevo Préstamo" |
| **Préstamos** | `PUT` | `/loans/:id/return` | Admin | Devolver libro inspeccionando su estado físico | Modal "Devolver Libro" |
| **Ventas** | `GET` | `/sales` | Admin | Historial consolidado de ventas | Tabla de Ventas (Admin) |
| **Ventas** | `GET` | `/sales/me` | Lector | Compras realizadas por el usuario | Tabla de Mis Compras |
| **Ventas** | `POST` | `/sales` | Autenticado | Generar orden de compra de libros | Modal "Nueva Venta" |
| **Usuarios** | `GET` | `/users/me` | Autenticado | Obtener perfil del usuario actual | Pestaña "Mi Perfil" |
| **Usuarios** | `PUT` | `/users/me` | Autenticado | Actualizar datos personales y contraseña | Formulario de perfil |
| **Usuarios** | `GET` | `/users` | Admin | Gestión administrativa de usuarios | Tabla de Usuarios (Admin) |

---

## Control de Acceso por Roles (RBAC)

El frontend adapta la interfaz en tiempo real según el rol (`admin` o `client`):
- **Lectores (`client`):**
  - Consulta pública de libros, autores, géneros y editoriales.
  - Creación de préstamos a su nombre y órdenes de compra.
  - Visualización exclusiva de sus propios préstamos (`/loans/me`) y compras (`/sales/me`).
  - Las acciones de modificación o eliminación en catálogo se ocultan mediante clases `.admin-only`.
- **Administradores (`admin`):**
  - CRUD total de catálogo (libros, autores, géneros, editoriales).
  - Consulta global de todos los préstamos y ventas del sistema.
  - Recepción de devoluciones de préstamos (`/loans/:id/return`) con control del estado físico del ejemplar (`Excelente`, `Regular`, `Maltratado`).
  - Administración de usuarios y roles.

---

## Puesta en Marcha y Ejecución

### 1. Iniciar el servidor backend (`minerva-backend`)
En una terminal, desde la carpeta del backend:
```powershell
npm install
npm run dev
```
El servidor debe exponer la API en su URL local, por ejemplo `http://localhost:5000/api/v1`. La configuración de conexión a la base de datos y otros secretos pertenece al entorno privado del backend, no a este frontend ni a este README.

### 2. Abrir el Frontend (`minerva-lib`)
Sirve la carpeta del frontend con un servidor estático local (por ejemplo, Live Server o `npx serve`) y abre la dirección que indique el servidor. En producción, despliega los archivos estáticos y configura la URL de la API desplegada mediante el indicador de conexión.

- Al iniciar, el frontend verificará automáticamente la conexión mostrando el indicador `API Conectada`.
- Si el backend no estuviese activo, el indicador mostrará `Desconectado` y te permitirá configurar o cambiar la URL base de la API directamente haciendo clic en el indicador.
- Si intentas realizar una acción que requiera autenticación desde la landing, una ventana modal te guiará al formulario de inicio de sesión o registro.

---

## Convenciones de Código y Estado
- **Cero código demo:** No existen usuarios simulados, contraseñas quemadas ni arreglos ficticios en memoria; todas las operaciones interactúan directamente con la base de datos MySQL vía la API REST.
- **Validación robusta:** Las validaciones de cliente coinciden con las restricciones de la base de datos (DPI de 13 dígitos, teléfono de 8 dígitos, contraseñas con longitud mínima de 8 caracteres y números).
- **Manejo de errores amigable:** Los errores de base de datos o de validación emitidos por el servidor son extraídos y presentados claramente en banners y notificaciones Toast.
