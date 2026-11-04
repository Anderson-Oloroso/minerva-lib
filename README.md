# Minerva Lib - Frontend & Conexión al Backend

Sistema web frontend completo para **Minerva Lib**, una plataforma moderna de gestión bibliotecaria y catálogo literario público, conectada en tiempo real con el servidor REST **`minerva-backend`** (Node.js, Express 5, JWT, MySQL).

---

## 🎨 Identidad Visual & Manual de Marca

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

## 🏛️ Estructura del Proyecto

```text
minerva-lib/
│
├── index.html                 # Landing page y catálogo público (consulta sin registro)
├── README.md                  # Documentación integral de arquitectura y estructuras de datos
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

## 📊 Estructuras de Datos (DTOs & Modelos)

La aplicación maneja las siguientes estructuras de datos en sus peticiones y respuestas:

### 1. Libros (`Book`)
```json
{
  "id": 1,
  "title": "Cien Años de Soledad",
  "isbn": "9780307474728",
  "year_publication": 1967,
  "no_pages": 417,
  "wrote_language": "Español",
  "price": 125.50,
  "stock": 10,
  "image_url": "https://covers.openlibrary.org/.../example.jpg",
  "id_author": 1,
  "name_author": "Gabriel García Márquez",
  "id_publisher": 1,
  "name_publisher": "Editorial Sudamericana",
  "id_genre": 1,
  "name_genre": "Realismo Mágico"
}
```

### 2. Autores (`Author`)
```json
{
  "id": 1,
  "name": "Gabriel García Márquez"
}
```

### 3. Géneros Literarios (`Genre`)
```json
{
  "id": 1,
  "genre": "Realismo Mágico"
}
```

### 4. Casas Editoriales (`Publisher`)
```json
{
  "id": 1,
  "publisher": "Editorial Sudamericana"
}
```

### 5. Clientes / Usuarios (`User` / `Client`)
```json
{
  "id": 1,
  "dpi": "3012345670101",
  "name": "Admin Sistema",
  "name_client": "Admin",
  "last_name": "Sistema",
  "phone": "55000000",
  "email": "admin@minerva.com",
  "role": "admin"
}
```

### 6. Préstamos (`Loan`)
```json
{
  "id_loan": 1,
  "id_client": 2,
  "name_client": "Juan Carlos Pérez",
  "date_loan": "2026-11-01T10:00:00.000Z",
  "expected_return_date": "2026-11-15T23:59:59.000Z",
  "return_date": null,
  "state_loan": "activo",
  "details": [
    {
      "id_loan_detail": 1,
      "id_book": 1,
      "title": "Cien Años de Soledad",
      "state_book_out": "Excelente",
      "state_book_in": null
    }
  ]
}
```

### 7. Ventas (`Sale`)
```json
{
  "id_sale": 1,
  "id_client": 2,
  "name_client": "Juan Carlos Pérez",
  "date_sale": "2026-11-01T11:30:00.000Z",
  "total": 110.00,
  "details": [
    {
      "id_sale_details": 1,
      "id_book": 2,
      "title": "La Casa de los Espíritus",
      "amount": 1,
      "unit_price": 110.00
    }
  ]
}
```

---

## 🔌 Conexión con los Endpoints de `minerva-backend`

El cliente `js/api.js` centraliza las peticiones con token JWT Bearer (`http://localhost:5000/api/v1`):

| Módulo | Método | Endpoint | Acceso Requerido | Descripción | Ubicación en Frontend |
|---|---|---|---|---|---|
| **Health** | `GET` | `/health` | Público | Comprueba estado del servidor | Badge indicador de estado |
| **Auth** | `POST` | `/auth/login` | Público | Inicio de sesión, devuelve Bearer token | `pages/auth.html` |
| **Auth** | `POST` | `/auth/register` | Público | Registro de clientes con DPI de 13 dígitos | `pages/auth.html` |
| **Auth** | `POST` | `/auth/logout` | Autenticado | Invalida sesión | Barra superior |
| **Libros** | `GET` | `/books` | Público | Catálogo completo de libros | `index.html` & `dashboard.html` |
| **Libros** | `GET` | `/books/:id` | Público | Detalle de libro por identificador | Modales de vista y edición |
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

## 🔒 Control de Acceso por Roles (RBAC)

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

## 🚀 Puesta en Marcha y Ejecución

### 1. Iniciar el Servidor Backend (`minerva-backend`)
En una terminal en la carpeta hermana `minerva-backend`:
```powershell
cd c:\Users\Henrik\Music\Projects\minerva-backend
npm install
npm run dev
```
El servidor backend iniciará en `http://localhost:5000/api/v1`.

### 2. Abrir el Frontend (`minerva-lib`)
Abre [index.html](file:///c:/Users/Henrik/Music/Projects/minerva-lib/index.html) en tu navegador web preferido (o usando un servidor de desarrollo estático como Live Server / `npx serve`).

- Al iniciar, el frontend verificará automáticamente la conexión mostrando el indicador `🟢 API Conectada`.
- Si el backend no estuviese activo, el indicador mostrará `🔴 Desconectado` y te permitirá configurar o cambiar la URL del servidor directamente haciendo clic en el badge.
- Si intentas realizar una acción que requiera autenticación desde la landing, una ventana modal te guiará al formulario de inicio de sesión o registro.

---

## 📝 Convenciones de Código y Estado
- **Cero código demo:** No existen usuarios simulados, contraseñas quemadas ni arreglos ficticios en memoria; todas las operaciones interactúan directamente con la base de datos MySQL vía la API REST.
- **Validación robusta:** Las validaciones de cliente coinciden con las restricciones de la base de datos (DPI de 13 dígitos, teléfono de 8 dígitos, contraseñas con longitud mínima de 8 caracteres y números).
- **Manejo de errores amigable:** Los errores de base de datos o de validación emitidos por el servidor son extraídos y presentados claramente en banners y notificaciones Toast.
