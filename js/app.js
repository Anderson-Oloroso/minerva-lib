/**
 * Minerva Lib - Controlador del Dashboard y Módulos
 * Conectado en tiempo real con todos los endpoints de minerva-backend:
 * /books, /authors, /genres, /publishers, /loans, /sales, /users, /auth
 */

'use strict';

// Caché en memoria para optimizar modales y selectores
const appState = {
    books: [],
    authors: [],
    genres: [],
    publishers: [],
    loans: [],
    sales: [],
    users: [],
    currentUser: null,
    backendOnline: false
};

/* ==========================================================================
   1. INICIALIZACIÓN
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    if (!Session.requireAuth()) return;

    // Inicializar utilidades
    Modal.init();
    Toast.init();
    Navigation.init();

    // Obtener datos del usuario logueado
    await syncCurrentUser();
    Session.applyRoleVisibility();

    // Comprobar estado del backend
    await checkBackendHealth();

    // Configurar escuchadores y botones
    setupEventHandlers();

    // Cargar todos los módulos desde la base de datos
    await reloadAllData();

    // Atender acciones provenientes de la URL (ej: ?action=loan&bookId=1)
    handleUrlActions();
});

/* ==========================================================================
   2. SINCRONIZACIÓN DE USUARIO Y SALUD DEL BACKEND
   ========================================================================== */
async function syncCurrentUser() {
    try {
        const response = await window.api.users.getMe();
        if (response && response.data) {
            appState.currentUser = response.data;
            localStorage.setItem('minerva-user', JSON.stringify(response.data));
        }
    } catch {
        appState.currentUser = Session.getUser();
    }
    renderUserUI();
}

function renderUserUI() {
    const user = appState.currentUser || Session.getUser();
    if (!user) return;

    const fullName = `${user.name_user || user.name || ''} ${user.last_name || ''}`.trim() || 'Lector';
    const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ML';

    const welcomeEl = document.getElementById('user-name-display');
    if (welcomeEl) welcomeEl.textContent = fullName;

    const headerName = document.getElementById('header-user-name');
    if (headerName) headerName.textContent = fullName;

    const headerAvatar = document.getElementById('header-user-avatar');
    if (headerAvatar) headerAvatar.textContent = initials;

    // Perfil
    const profileName = document.getElementById('profile-display-name') || document.querySelector('.profile-name');
    if (profileName) profileName.textContent = fullName;

    const profileEmail = document.getElementById('profile-display-email') || document.querySelector('.profile-email');
    if (profileEmail) profileEmail.textContent = user.email || '';

    const profileRole = document.getElementById('profile-display-role');
    if (profileRole) profileRole.innerHTML = Format.roleBadge(user.role);

    const profileAvatar = document.querySelector('.profile-avatar-large');
    if (profileAvatar) profileAvatar.textContent = initials;

    // Llenar inputs de perfil
    const fName = document.getElementById('profile-first-name') || document.getElementById('profile-name');
    if (fName) fName.value = user.name_user || user.name || '';

    const lName = document.getElementById('profile-last-name') || document.getElementById('profile-lastname');
    if (lName) lName.value = user.last_name || '';

    const phoneEl = document.getElementById('profile-phone');
    if (phoneEl) phoneEl.value = user.phone || '';

    const emailEl = document.getElementById('profile-email-input') || document.getElementById('profile-email');
    if (emailEl) emailEl.value = user.email || '';

    const roleBadgeEl = document.getElementById('profile-role') || document.getElementById('profile-display-role');
    if (roleBadgeEl) roleBadgeEl.innerHTML = Format.roleBadge(user.role);
}

async function checkBackendHealth() {
    try {
        await window.api.health();
        appState.backendOnline = true;
        renderBackendStatus(true);
    } catch {
        appState.backendOnline = false;
        renderBackendStatus(false);
    }
}

function renderBackendStatus(isOnline) {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    let badge = document.getElementById('backend-status-badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'backend-status-badge';
        badge.style.cursor = 'pointer';
        headerActions.insertBefore(badge, headerActions.firstChild);
        badge.addEventListener('click', () => openApiConfigModal());
    }

    if (isOnline) {
        badge.className = 'badge badge-success';
        badge.innerHTML = `🟢 API Conectada`;
        badge.title = `Clic para ver/cambiar URL (${window.api.config.getBaseUrl()})`;
    } else {
        badge.className = 'badge badge-danger';
        badge.innerHTML = `🔴 Desconectado`;
        badge.title = `Sin conexión con el backend. Clic para configurar URL`;
    }
}

window.openApiConfigModal = function() {
    const currentUrl = window.api.config.getBaseUrl();
    Modal.open({
        title: 'Configuración de Conexión al Backend',
        body: `
            <div style="padding:0.5rem 0;">
                <p style="color:var(--text-secondary); margin-bottom:1rem; font-size:0.92rem;">
                    Configura la URL base de tu servidor Express <code>minerva-backend</code>. Por defecto según el archivo <code>.env</code> está en el puerto 5000.
                </p>
                <div class="form-group">
                    <label class="form-label" for="cfg-api-url">URL de la API</label>
                    <input type="text" id="cfg-api-url" class="form-control" value="${currentUrl}" placeholder="http://localhost:5000/api/v1" required>
                    <span style="font-size:0.8rem; color:var(--text-muted); margin-top:0.25rem;">Ruta completa incluyendo el prefijo <code>/api/v1</code>.</span>
                </div>
                <div style="margin-top:1rem; display:flex; gap:0.5rem;">
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-test-connection">
                        Probar Conexión Ahora
                    </button>
                    <button type="button" class="btn btn-ghost btn-sm" id="btn-reset-default-url">
                        Restablecer Predeterminado
                    </button>
                </div>
                <div id="cfg-connection-result" style="margin-top:0.75rem; font-size:0.88rem; font-weight:600;"></div>
            </div>
        `,
        confirmText: 'Guardar y Recargar',
        onConfirm: async () => {
            const inputVal = document.getElementById('cfg-api-url')?.value.trim();
            if (inputVal) {
                window.api.config.setBaseUrl(inputVal);
                Toast.success('URL del backend actualizada');
                Modal.close();
                await checkBackendHealth();
                await reloadAllData();
            }
        }
    });

    setTimeout(() => {
        const testBtn = document.getElementById('btn-test-connection');
        const resetBtn = document.getElementById('btn-reset-default-url');
        const inputEl = document.getElementById('cfg-api-url');
        const resultEl = document.getElementById('cfg-connection-result');

        if (testBtn) {
            testBtn.addEventListener('click', async () => {
                if (resultEl) resultEl.innerHTML = '<span style="color:var(--info);">Probando conexión...</span>';
                const url = inputEl?.value.trim() || currentUrl;
                try {
                    const healthUrl = url.replace(/\/api\/v[0-9]+$/, '') + '/api/v1/health';
                    const res = await fetch(healthUrl);
                    if (res.ok) {
                        const json = await res.json();
                        if (resultEl) resultEl.innerHTML = `<span style="color:var(--success);">✓ Conexión exitosa: ${json.message || 'Servidor activo'}</span>`;
                    } else {
                        if (resultEl) resultEl.innerHTML = `<span style="color:var(--danger);">Servidor respondió con código ${res.status}</span>`;
                    }
                } catch {
                    if (resultEl) resultEl.innerHTML = `<span style="color:var(--danger);">✗ No se pudo conectar a ${url}. Asegúrate de ejecutar <code>npm run dev</code> en minerva-backend.</span>`;
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (inputEl) inputEl.value = window.api.config.DEFAULT_BASE_URL;
            });
        }
    }, 150);
};

/* ==========================================================================
   3. RECARGA Y SINCRONIZACIÓN DE DATOS (READ ALL)
   ========================================================================== */
async function reloadAllData() {
    try {
        const [booksRes, authorsRes, genresRes, pubsRes] = await Promise.all([
            window.api.books.getAll().catch(() => ({ data: [] })),
            window.api.authors.getAll().catch(() => ({ data: [] })),
            window.api.genres.getAll().catch(() => ({ data: [] })),
            window.api.publishers.getAll().catch(() => ({ data: [] }))
        ]);

        appState.books = booksRes?.data || [];
        appState.authors = authorsRes?.data || [];
        appState.genres = genresRes?.data || [];
        appState.publishers = pubsRes?.data || [];

        const loanHistoryRequest = Session.isAdmin()
            ? window.api.loans.getAll()
            : window.api.loans.getMine();
        const salesHistoryRequest = Session.isAdmin()
            ? window.api.sales.getAll()
            : window.api.sales.getMine();
        const [loansResult, salesResult] = await Promise.all([
            loanHistoryRequest
                .then(response => ({ data: response?.data || [] }))
                .catch(error => ({ error })),
            salesHistoryRequest
                .then(response => ({ data: response?.data || [] }))
                .catch(error => ({ error }))
        ]);

        appState.loans = loansResult.data || [];
        appState.sales = salesResult.data || [];
        if (loansResult.error) {
            console.error('Error cargando los préstamos del usuario:', loansResult.error);
            Toast.error('No se pudieron cargar tus préstamos. Intenta actualizar la página.');
        }
        if (salesResult.error) {
            console.error('Error cargando las ventas del usuario:', salesResult.error);
            Toast.error('No se pudieron cargar tus ventas. Intenta actualizar la página.');
        }

        // Si el usuario es admin, cargar también usuarios
        if (Session.isAdmin()) {
            try {
                const usersRes = await window.api.users.getAll();
                appState.users = usersRes?.data || [];
            } catch {
                appState.users = [];
            }
        }

        // Renderizar todas las vistas
        renderStats();
        renderBooks();
        renderAuthors();
        renderGenres();
        renderPublishers();
        renderLoans();
        renderSales();
        renderUsers();
    } catch (err) {
        console.error('Error cargando datos:', err);
    }
}

function renderStats() {
    animateStat('stat-total-books', appState.books.length);
    animateStat('stat-total-authors', appState.authors.length);
    animateStat('stat-total-genres', appState.genres.length);
    animateStat('stat-total-publishers', appState.publishers.length);
}

function animateStat(id, target) {
    const el = document.getElementById(id) || document.getElementById(id.replace('total-', ''));
    if (el) el.textContent = target;
}

/* ==========================================================================
   4. MÓDULO: LIBROS (/books)
   ========================================================================== */
function renderBooks() {
    const grid = document.getElementById('books-grid') || document.querySelector('.cards-grid');
    if (!grid) return;

    if (appState.books.length === 0) {
        Loading.showEmpty(grid.id, 'No hay libros en la base de datos. Haz clic en "Nuevo Libro" para registrar el primero.');
        return;
    }

    grid.innerHTML = appState.books.map(b => `
        <article class="book-card" data-id="${b.id}">
            <div class="book-cover">
                <div class="book-cover-pattern"></div>
                <img src="../assets/img/isotipo.png" alt="Minerva Lib" style="width: 44px; height: 44px; margin-bottom: 0.5rem; opacity: 0.85;">
                <h3 class="book-cover-title">${b.title}</h3>
                ${BookCover.render(b.image_url, b.title)}
            </div>
            <div class="book-card-body">
                <div>
                    <span class="badge badge-primary">${b.name_genre || 'General'}</span>
                </div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-top: 0.25rem;">${b.title}</h3>
                <span class="book-author">${b.name_author || 'Autor desconocido'}</span>

                <div class="book-meta">
                    <span>📅 ${b.year_publication || '—'}</span>
                    <span>📖 ${b.no_pages || '—'} págs</span>
                    <span>🌐 ${b.wrote_language || 'Español'}</span>
                </div>

                <div class="book-price-stock">
                    <span class="book-price">${Format.currency(b.price)}</span>
                    <span class="badge ${b.stock > 10 ? 'badge-success' : 'badge-warning'}">
                        Stock: ${b.stock}
                    </span>
                </div>

                <div class="book-actions" style="margin-top: 0.5rem;">
                    <button class="btn btn-primary btn-sm" onclick="quickLoan(${b.id})" style="flex:1;">
                        Prestar
                    </button>
                    <button class="btn btn-secondary btn-sm admin-only" onclick="editBook(${b.id})" title="Editar Libro">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                    </button>
                    <button class="btn btn-ghost btn-sm admin-only" onclick="deleteBook(${b.id})" title="Eliminar Libro" style="color:var(--danger);">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
        </article>
    `).join('');

    BookCover.bind(grid);
    Session.applyRoleVisibility();
}

function openBookModal(book = null) {
    const isEdit = book !== null;

    // Generar opciones de géneros
    const genreOptions = appState.genres.map(g => {
        const id = g.id || g.id_genre;
        const name = g.genre || g.name_genre;
        const selected = (isEdit && (book.id_genre == id || book.name_genre == name)) ? 'selected' : '';
        return `<option value="${id}" ${selected}>${name}</option>`;
    }).join('');

    // Generar opciones de autores
    const authorOptions = appState.authors.map(a => {
        const id = a.id || a.id_author;
        const name = a.name || a.name_author;
        const selected = (isEdit && (book.id_author == id || book.name_author == name)) ? 'selected' : '';
        return `<option value="${id}" ${selected}>${name}</option>`;
    }).join('');

    // Generar opciones de editoriales
    const pubOptions = appState.publishers.map(p => {
        const id = p.id || p.id_publisher;
        const name = p.publisher || p.name_publisher;
        const selected = (isEdit && (book.id_publisher == id || book.name_publisher == name)) ? 'selected' : '';
        return `<option value="${id}" ${selected}>${name}</option>`;
    }).join('');

    const bodyHtml = `
        <form id="modal-book-form">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="mb-title">Título del Libro *</label>
                    <input type="text" id="mb-title" class="form-control" value="${isEdit ? book.title : ''}" maxlength="50" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="mb-isbn">ISBN *</label>
                    <input type="text" id="mb-isbn" class="form-control" value="${isEdit ? book.isbn : ''}" placeholder="978-0-123456-47-2" required>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="mb-image-url">URL de la portada</label>
                <input type="url" id="mb-image-url" class="form-control" value="${isEdit ? BookCover.escapeAttribute(book.image_url) : ''}" maxlength="2048" placeholder="https://ejemplo.com/portada.jpg">
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="mb-year">Año de Publicación *</label>
                    <input type="number" id="mb-year" class="form-control" value="${isEdit ? book.year_publication : new Date().getFullYear()}" min="1800" max="${new Date().getFullYear()}" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="mb-pages">Número de Páginas *</label>
                    <input type="number" id="mb-pages" class="form-control" value="${isEdit ? book.no_pages : 100}" min="1" required>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="mb-lang">Idioma *</label>
                    <input type="text" id="mb-lang" class="form-control" value="${isEdit ? book.wrote_language : 'Español'}" maxlength="50" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="mb-price">Precio (Q) *</label>
                    <input type="number" id="mb-price" class="form-control" step="0.01" min="0" max="9999.99" value="${isEdit ? book.price : '100.00'}" required>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="mb-stock">Stock Disponible *</label>
                    <input type="number" id="mb-stock" class="form-control" min="0" value="${isEdit ? book.stock : 10}" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="mb-genre">Género *</label>
                    <select id="mb-genre" class="form-control" required>
                        <option value="">Selecciona un género...</option>
                        ${genreOptions}
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="mb-author">Autor</label>
                    <select id="mb-author" class="form-control">
                        <option value="">(Opcional) Selecciona autor...</option>
                        ${authorOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="mb-publisher">Editorial</label>
                    <select id="mb-publisher" class="form-control">
                        <option value="">(Opcional) Selecciona editorial...</option>
                        ${pubOptions}
                    </select>
                </div>
            </div>
        </form>
    `;

    Modal.open({
        title: isEdit ? 'Editar Libro' : 'Nuevo Libro',
        body: bodyHtml,
        confirmText: isEdit ? 'Actualizar Libro' : 'Guardar Libro',
        onConfirm: async () => {
            const title = document.getElementById('mb-title').value.trim();
            const isbn = document.getElementById('mb-isbn').value.trim();
            const imageUrl = document.getElementById('mb-image-url').value.trim();
            const year = document.getElementById('mb-year').value;
            const pages = document.getElementById('mb-pages').value;
            const lang = document.getElementById('mb-lang').value.trim();
            const price = document.getElementById('mb-price').value;
            const stock = document.getElementById('mb-stock').value;
            const idGenre = document.getElementById('mb-genre').value;
            const idAuthor = document.getElementById('mb-author').value || null;
            const idPub = document.getElementById('mb-publisher').value || null;

            if (!title || !isbn || !idGenre) {
                Toast.error('Por favor completa todos los campos obligatorios (*)');
                return;
            }

            const payload = {
                title,
                isbn,
                image_url: imageUrl,
                year_publication: Number(year),
                no_pages: Number(pages),
                wrote_language: lang,
                price: Number(price),
                stock: Number(stock),
                id_genre: Number(idGenre),
                id_author: idAuthor ? Number(idAuthor) : null,
                id_publisher: idPub ? Number(idPub) : null
            };

            try {
                if (isEdit) {
                    await window.api.books.update(book.id, payload);
                    Toast.success('¡Libro actualizado en base de datos!');
                } else {
                    await window.api.books.create(payload);
                    Toast.success('¡Libro creado exitosamente en base de datos!');
                }
                Modal.close();
                await reloadAllData();
            } catch (err) {
                Toast.error(err.message || 'Error al guardar el libro');
            }
        }
    });
}

window.editBook = function(id) {
    const book = appState.books.find(b => b.id == id);
    if (book) openBookModal(book);
};

window.deleteBook = function(id) {
    const book = appState.books.find(b => b.id == id);
    const title = book ? book.title : 'este libro';

    Modal.open({
        title: 'Eliminar Libro',
        body: `
            <div style="text-align: center; padding: 1rem 0;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" style="margin-bottom:1rem;">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <p>¿Estás seguro de que deseas eliminar permanentemente <strong>"${title}"</strong>?</p>
                <p style="color:var(--text-secondary); font-size:0.88rem; margin-top:0.5rem;">Esta acción eliminará el registro de la base de datos.</p>
            </div>
        `,
        confirmText: 'Eliminar Libro',
        confirmClass: 'btn-danger',
        onConfirm: async () => {
            try {
                await window.api.books.delete(id);
                Toast.success('Libro eliminado correctamente');
                Modal.close();
                await reloadAllData();
            } catch (err) {
                Toast.error(err.message || 'Error al eliminar libro');
            }
        }
    });
};

/* ==========================================================================
   5. MÓDULO: AUTORES (/authors)
   ========================================================================== */
function renderAuthors() {
    const tbody = document.getElementById('authors-table-body');
    if (!tbody) return;

    if (appState.authors.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4" style="color:var(--text-muted);">No hay autores registrados. Haz clic en "Nuevo Autor".</td></tr>`;
        return;
    }

    tbody.innerHTML = appState.authors.map(a => `
        <tr>
            <td><strong>#${a.id}</strong></td>
            <td><strong>${a.name}</strong></td>
            <td class="admin-only">
                <div class="table-actions">
                    <button class="action-btn" onclick="editAuthor(${a.id}, '${escapeString(a.name)}')" title="Editar Autor">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                    </button>
                    <button class="action-btn action-btn--delete" onclick="deleteAuthor(${a.id}, '${escapeString(a.name)}')" title="Eliminar Autor">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    Session.applyRoleVisibility();
}

function openAuthorModal(id = null, currentName = '') {
    const isEdit = id !== null;

    Modal.open({
        title: isEdit ? 'Editar Autor' : 'Nuevo Autor',
        body: `
            <div class="form-group">
                <label class="form-label" for="ma-name">Nombre Completo del Autor *</label>
                <input type="text" id="ma-name" class="form-control" value="${currentName}" placeholder="Gabriel García Márquez" minlength="4" maxlength="50" required>
                <span style="font-size:0.8rem; color:var(--text-muted); margin-top:0.25rem;">Debe tener entre 4 y 50 caracteres según el validador del backend.</span>
            </div>
        `,
        confirmText: isEdit ? 'Actualizar' : 'Guardar',
        onConfirm: async () => {
            const name = document.getElementById('ma-name').value.trim();
            if (!name || name.length < 4) {
                Toast.error('El nombre del autor debe tener al menos 4 caracteres');
                return;
            }

            try {
                if (isEdit) {
                    await window.api.authors.update(id, name);
                    Toast.success('Autor actualizado con éxito');
                } else {
                    await window.api.authors.create(name);
                    Toast.success('Autor registrado con éxito en base de datos');
                }
                Modal.close();
                await reloadAllData();
            } catch (err) {
                Toast.error(err.message || 'Error al guardar autor');
            }
        }
    });
}

window.editAuthor = (id, name) => openAuthorModal(id, name);

window.deleteAuthor = (id, name) => {
    Modal.open({
        title: 'Eliminar Autor',
        body: `<p>¿Deseas eliminar al autor <strong>${name}</strong>?</p>`,
        confirmText: 'Eliminar',
        confirmClass: 'btn-danger',
        onConfirm: async () => {
            try {
                await window.api.authors.delete(id);
                Toast.success('Autor eliminado');
                Modal.close();
                await reloadAllData();
            } catch (err) {
                Toast.error(err.message || 'Error al eliminar');
            }
        }
    });
};

/* ==========================================================================
   6. MÓDULO: GÉNEROS (/genres)
   ========================================================================== */
function renderGenres() {
    const tbody = document.getElementById('genres-table-body');
    if (!tbody) return;

    if (appState.genres.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4" style="color:var(--text-muted);">No hay géneros registrados. Haz clic en "Nuevo Género".</td></tr>`;
        return;
    }

    tbody.innerHTML = appState.genres.map(g => {
        const name = g.genre || g.name_genre;
        return `
            <tr>
                <td><strong>#${g.id}</strong></td>
                <td><span class="badge badge-primary">${name}</span></td>
                <td class="admin-only">
                    <div class="table-actions">
                        <button class="action-btn" onclick="editGenre(${g.id}, '${escapeString(name)}')" title="Editar Género">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                        <button class="action-btn action-btn--delete" onclick="deleteGenre(${g.id}, '${escapeString(name)}')" title="Eliminar Género">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    Session.applyRoleVisibility();
}

function openGenreModal(id = null, currentName = '') {
    const isEdit = id !== null;

    Modal.open({
        title: isEdit ? 'Editar Género' : 'Nuevo Género',
        body: `
            <div class="form-group">
                <label class="form-label" for="mg-name">Nombre del Género *</label>
                <input type="text" id="mg-name" class="form-control" value="${currentName}" placeholder="Ciencia Ficción" minlength="4" maxlength="50" required>
                <span style="font-size:0.8rem; color:var(--text-muted); margin-top:0.25rem;">Debe tener entre 4 y 50 caracteres según el validador del backend.</span>
            </div>
        `,
        confirmText: isEdit ? 'Actualizar' : 'Guardar',
        onConfirm: async () => {
            const name = document.getElementById('mg-name').value.trim();
            if (!name || name.length < 4) {
                Toast.error('El nombre del género debe tener al menos 4 caracteres');
                return;
            }

            try {
                if (isEdit) {
                    await window.api.genres.update(id, name);
                    Toast.success('Género actualizado correctamente');
                } else {
                    await window.api.genres.create(name);
                    Toast.success('Género creado con éxito en base de datos');
                }
                Modal.close();
                await reloadAllData();
            } catch (err) {
                Toast.error(err.message || 'Error al guardar género');
            }
        }
    });
}

window.editGenre = (id, name) => openGenreModal(id, name);

window.deleteGenre = (id, name) => {
    Modal.open({
        title: 'Eliminar Género',
        body: `<p>¿Deseas eliminar el género <strong>${name}</strong>?</p>`,
        confirmText: 'Eliminar',
        confirmClass: 'btn-danger',
        onConfirm: async () => {
            try {
                await window.api.genres.delete(id);
                Toast.success('Género eliminado');
                Modal.close();
                await reloadAllData();
            } catch (err) {
                Toast.error(err.message || 'Error al eliminar');
            }
        }
    });
};

/* ==========================================================================
   7. MÓDULO: EDITORIALES (/publishers)
   ========================================================================== */
function renderPublishers() {
    const tbody = document.getElementById('publishers-table-body');
    if (!tbody) return;

    if (appState.publishers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4" style="color:var(--text-muted);">No hay editoriales registradas. Haz clic en "Nueva Editorial".</td></tr>`;
        return;
    }

    tbody.innerHTML = appState.publishers.map(p => {
        const name = p.publisher || p.name_publisher;
        return `
            <tr>
                <td><strong>#${p.id}</strong></td>
                <td>${name}</td>
                <td class="admin-only">
                    <div class="table-actions">
                        <button class="action-btn" onclick="editPublisher(${p.id}, '${escapeString(name)}')" title="Editar Editorial">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                        <button class="action-btn action-btn--delete" onclick="deletePublisher(${p.id}, '${escapeString(name)}')" title="Eliminar Editorial">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    Session.applyRoleVisibility();
}

function openPublisherModal(id = null, currentName = '') {
    const isEdit = id !== null;

    Modal.open({
        title: isEdit ? 'Editar Editorial' : 'Nueva Editorial',
        body: `
            <div class="form-group">
                <label class="form-label" for="mp-name">Nombre de la Editorial *</label>
                <input type="text" id="mp-name" class="form-control" value="${currentName}" placeholder="Editorial Sudamericana" minlength="4" maxlength="50" required>
                <span style="font-size:0.8rem; color:var(--text-muted); margin-top:0.25rem;">Debe tener entre 4 y 50 caracteres según el validador del backend.</span>
            </div>
        `,
        confirmText: isEdit ? 'Actualizar' : 'Guardar',
        onConfirm: async () => {
            const name = document.getElementById('mp-name').value.trim();
            if (!name || name.length < 4) {
                Toast.error('El nombre de la editorial debe tener al menos 4 caracteres');
                return;
            }

            try {
                if (isEdit) {
                    await window.api.publishers.update(id, name);
                    Toast.success('Editorial actualizada con éxito');
                } else {
                    await window.api.publishers.create(name);
                    Toast.success('Editorial registrada con éxito');
                }
                Modal.close();
                await reloadAllData();
            } catch (err) {
                Toast.error(err.message || 'Error al guardar editorial');
            }
        }
    });
}

window.editPublisher = (id, name) => openPublisherModal(id, name);

window.deletePublisher = (id, name) => {
    Modal.open({
        title: 'Eliminar Editorial',
        body: `<p>¿Deseas eliminar la editorial <strong>${name}</strong>?</p>`,
        confirmText: 'Eliminar',
        confirmClass: 'btn-danger',
        onConfirm: async () => {
            try {
                await window.api.publishers.delete(id);
                Toast.success('Editorial eliminada');
                Modal.close();
                await reloadAllData();
            } catch (err) {
                Toast.error(err.message || 'Error al eliminar');
            }
        }
    });
};

/* ==========================================================================
   8. MÓDULO: PRÉSTAMOS (/loans)
   ========================================================================== */
function openLoanModal(preselectedBookId = null) {
    if (appState.books.length === 0) {
        Toast.warning('Debes registrar libros antes de crear préstamos.');
        return;
    }

    // Fecha mínima: mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    const defaultDateStr = tomorrow.toISOString().split('T')[0];

    const bookOptions = appState.books.map(b => `
        <option value="${b.id}" ${b.id == preselectedBookId ? 'selected' : ''}>
            ${b.title} (Stock: ${b.stock})
        </option>
    `).join('');

    Modal.open({
        title: 'Registrar Nuevo Préstamo de Libros',
        body: `
            <form id="modal-loan-form">
                <div class="form-group">
                    <label class="form-label" for="ml-return-date">Fecha Esperada de Devolución *</label>
                    <input type="date" id="ml-return-date" class="form-control" value="${defaultDateStr}" required>
                    <span style="font-size:0.8rem; color:var(--text-muted); margin-top:0.25rem;">Debe ser una fecha futura.</span>
                </div>

                <div class="form-subtitle">Libro Solicitado</div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Libro a Prestar *</label>
                        <select id="ml-book" class="form-control" required>
                            <option value="">Selecciona un libro...</option>
                            ${bookOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Estado Físico de Salida *</label>
                        <select id="ml-state" class="form-control" required>
                            <option value="Excelente" selected>Excelente</option>
                            <option value="Regular">Regular</option>
                            <option value="Maltratado">Maltratado</option>
                        </select>
                    </div>
                </div>
            </form>
        `,
        confirmText: 'Confirmar Préstamo',
        onConfirm: async () => {
            const dateVal = document.getElementById('ml-return-date').value;
            const bookId = document.getElementById('ml-book').value;
            const stateOut = document.getElementById('ml-state').value;

            if (!dateVal || !bookId) {
                Toast.error('Por favor selecciona la fecha y el libro');
                return;
            }

            // Convertir a ISO 8601 con hora futura
            const isoDate = new Date(`${dateVal}T18:00:00Z`).toISOString();

            try {
                const payload = {
                    expected_return_date: isoDate,
                    details: [
                        {
                            id_book: Number(bookId),
                            state_book_out: stateOut
                        }
                    ]
                };

                const res = await window.api.loans.create(payload);
                Toast.success(`¡Préstamo #${res.data.id_loan} creado con éxito!`);
                Modal.close();
                await reloadAllData();
            } catch (err) {
                Toast.error(err.message || 'Error al procesar el préstamo');
            }
        }
    });
}

window.quickLoan = (bookId) => openLoanModal(bookId);

window.openReturnLoanModal = function(loanId, detailId = 1) {
    Modal.open({
        title: `Devolución de Préstamo #${loanId}`,
        body: `
            <form id="modal-return-loan-form">
                <p style="margin-bottom:1rem; color:var(--text-secondary); font-size:0.92rem;">
                    Indica el estado físico en que el usuario está entregando el libro para procesar la devolución en el sistema (sp_return_loan).
                </p>
                <div class="form-group">
                    <label class="form-label" for="mr-state">Estado Físico de Entrada *</label>
                    <select id="mr-state" class="form-control" required>
                        <option value="Excelente" selected>Excelente</option>
                        <option value="Regular">Regular</option>
                        <option value="Maltratado">Maltratado</option>
                    </select>
                </div>
            </form>
        `,
        confirmText: 'Registrar Devolución',
        onConfirm: async () => {
            const stateIn = document.getElementById('mr-state').value;
            try {
                const details = [
                    {
                        id_loan_detail: Number(detailId),
                        state_book_in: stateIn
                    }
                ];
                await window.api.loans.returnLoan(loanId, details);

                Toast.success(`¡Préstamo #${loanId} devuelto y registrado exitosamente!`);
                Modal.close();
                await reloadAllData();
            } catch (err) {
                Toast.error(err.message || 'Error al procesar la devolución');
            }
        }
    });
};

/* ==========================================================================
   9. MÓDULO: VENTAS (/sales)
   ========================================================================== */
function openSaleModal() {
    if (appState.books.length === 0) {
        Toast.warning('Debes registrar libros antes de realizar una venta.');
        return;
    }

    const bookOptions = appState.books.map(b => `
        <option value="${b.id}" data-price="${b.price}" data-stock="${b.stock}">
            ${b.title} — Q${Number(b.price).toFixed(2)} (Stock: ${b.stock})
        </option>
    `).join('');

    Modal.open({
        title: 'Registrar Nueva Venta',
        body: `
            <form id="modal-sale-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="ms-book">Selecciona el Libro *</label>
                        <select id="ms-book" class="form-control" required>
                            <option value="">Seleccionar libro...</option>
                            ${bookOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="ms-amount">Cantidad de Ejemplares *</label>
                        <input type="number" id="ms-amount" class="form-control" min="1" value="1" required>
                    </div>
                </div>

                <div style="background-color:var(--bg-muted); padding:1rem; border-radius:var(--radius-md); margin-top:1rem; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:700;">Total de la Venta:</span>
                    <span id="ms-total" style="font-size:1.5rem; font-weight:800; color:var(--brand-blue);">Q0.00</span>
                </div>
            </form>
        `,
        confirmText: 'Completar Venta',
        onConfirm: async () => {
            const bookId = document.getElementById('ms-book').value;
            const amount = document.getElementById('ms-amount').value;

            if (!bookId || !amount) {
                Toast.error('Por favor selecciona un libro y la cantidad');
                return;
            }

            try {
                const details = [
                    {
                        id_book: Number(bookId),
                        amount: Number(amount)
                    }
                ];

                const res = await window.api.sales.create(details);
                Toast.success(`¡Venta #${res.data.id_sale} registrada! Total: ${Format.currency(res.data.total)}`);
                Modal.close();
                await reloadAllData();
            } catch (err) {
                Toast.error(err.message || 'Error al registrar la venta');
            }
        }
    });

    // Actualización reactiva del total en el modal
    setTimeout(() => {
        const selectEl = document.getElementById('ms-book');
        const amountEl = document.getElementById('ms-amount');
        const totalEl = document.getElementById('ms-total');

        const calculateTotal = () => {
            const selectedOpt = selectEl?.selectedOptions[0];
            const price = Number(selectedOpt?.getAttribute('data-price') || 0);
            const qty = Number(amountEl?.value || 0);
            if (totalEl) totalEl.textContent = `Q${(price * qty).toFixed(2)}`;
        };

        if (selectEl) selectEl.addEventListener('change', calculateTotal);
        if (amountEl) amountEl.addEventListener('input', calculateTotal);
    }, 150);
}

function renderLoans() {
    const tbody = document.getElementById('loans-table-body');
    if (!tbody) return;

    const loans = appState.loans;
    if (loans.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4" style="color:var(--text-muted);">Aún no tienes préstamos registrados. Haz clic en "Nuevo Préstamo".</td></tr>`;
        return;
    }

    tbody.innerHTML = loans.map(l => {
        const detailId = l.details?.[0]?.id_loan_detail || 1;
        const isCurrentUsersLoan = Number(l.id_user) === Number(appState.currentUser?.id_user);
        const isReturned = l.state_loan === 'devuelto' || Boolean(l.return_date);

        return `
            <tr>
                <td><strong>#${l.id_loan}</strong></td>
                <td>${BookCover.escapeAttribute(l.user_name || (isCurrentUsersLoan ? 'Mi cuenta' : `Usuario #${l.id_user}`))}</td>
                <td>${Format.date(l.date_loan)}</td>
                <td>${Format.date(l.expected_return_date)}</td>
                <td>${Format.date(l.return_date)}</td>
                <td>${Format.loanStateBadge(l.state_loan || (l.return_date ? 'devuelto' : 'activo'))}</td>
                <td>
                    ${isCurrentUsersLoan && !isReturned ? `
                        <button class="btn btn-primary btn-sm" onclick="openReturnLoanModal(${l.id_loan}, ${detailId})">
                            Devolver Libro
                        </button>
                    ` : isReturned ? '<span style="color:var(--success); font-weight:700;">✓ Completado</span>' : '—'}
                </td>
            </tr>
        `;
    }).join('');
}

function renderSales() {
    const tbody = document.getElementById('sales-table-body');
    if (!tbody) return;

    const sales = appState.sales;
    if (sales.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4" style="color:var(--text-muted);">Aún no tienes ventas registradas. Haz clic en "Nueva Venta".</td></tr>`;
        return;
    }

    tbody.innerHTML = sales.map(s => {
        return `
            <tr>
                <td><strong>#${s.id_sale}</strong></td>
                <td>${BookCover.escapeAttribute(s.user_name || (Number(s.id_user) === Number(appState.currentUser?.id_user) ? 'Mi cuenta' : `Usuario #${s.id_user}`))}</td>
                <td>${Format.date(s.date_sale)}</td>
                <td><strong style="color:var(--brand-blue); font-size:1.05rem;">${Format.currency(s.total)}</strong></td>
                <td>
                    <button class="btn btn-ghost btn-sm" onclick="Toast.info('Venta #${s.id_sale} verificada en base de datos.')">
                        Ver Detalle
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/* ==========================================================================
   10. MÓDULO: USUARIOS (/users - ADMIN)
   ========================================================================== */
function renderUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    if (appState.users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4" style="color:var(--text-muted);">Sin usuarios cargados. Haz clic en "Nuevo Usuario".</td></tr>`;
        return;
    }

    tbody.innerHTML = appState.users.map(u => `
        <tr>
            <td><strong>#${u.id_user}</strong></td>
            <td><code>${u.dpi}</code></td>
            <td>${u.name_user || ''}</td>
            <td>${u.last_name || ''}</td>
            <td>${u.email}</td>
            <td>${Format.roleBadge(u.role)}</td>
            <td>${Format.activeBadge(u.is_active)}</td>
            <td class="admin-only">
                <div class="table-actions">
                    ${u.is_active
        ? `<button class="action-btn action-btn--delete" onclick="deactivateUser(${u.id_user})" title="Desactivar usuario">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    </button>
        `
        : `<button class="action-btn" onclick="activateUser(${u.id_user})" title="Activar usuario" style="color:var(--success);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
                    </button>`
        }
                </div>
            </td>
        </tr>
    `).join('');

    Session.applyRoleVisibility();
}

function openUserModal() {
    Modal.open({
        title: 'Registrar Nuevo Usuario',
        body: `
            <form id="modal-user-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="mu-dpi">DPI (13 dígitos) *</label>
                        <input type="text" id="mu-dpi" class="form-control" maxlength="13" placeholder="2987123450101" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="mu-role">Rol *</label>
                        <select id="mu-role" class="form-control" required>
                            <option value="user" selected>Usuario (Lector)</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="mu-name">Nombre *</label>
                        <input type="text" id="mu-name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="mu-lastname">Apellido *</label>
                        <input type="text" id="mu-lastname" class="form-control" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="mu-phone">Teléfono (8 dígitos) *</label>
                        <input type="text" id="mu-phone" class="form-control" maxlength="8" placeholder="55551234" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="mu-email">Correo Electrónico *</label>
                        <input type="email" id="mu-email" class="form-control" placeholder="correo@ejemplo.com" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="mu-pass">Contraseña Inicial *</label>
                    <input type="password" id="mu-pass" class="form-control" placeholder="Mínimo 8 caracteres con número" required>
                </div>
            </form>
        `,
        confirmText: 'Registrar Usuario',
        onConfirm: async () => {
            const dpi = document.getElementById('mu-dpi').value.trim();
            const role = document.getElementById('mu-role').value;
            const name = document.getElementById('mu-name').value.trim();
            const lastName = document.getElementById('mu-lastname').value.trim();
            const phone = document.getElementById('mu-phone').value.trim();
            const email = document.getElementById('mu-email').value.trim();
            const password = document.getElementById('mu-pass').value;

            if (!dpi || !name || !email || !password) {
                Toast.error('Por favor completa todos los campos requeridos');
                return;
            }

            try {
                await window.api.users.create({
                    dpi,
                    role,
                    name_user: name,
                    last_name: lastName,
                    phone,
                    email,
                    password
                });
                Toast.success('¡Usuario creado en el sistema!');
                Modal.close();
                await reloadAllData();
            } catch (err) {
                Toast.error(err.message || 'Error al crear usuario');
            }
        }
    });
}

window.deactivateUser = id => {
    const user = appState.users.find(item => Number(item.id_user) === Number(id));
    const name = BookCover.escapeAttribute(user?.name_user || `usuario #${id}`);
    Modal.open({
        title: 'Desactivar Usuario',
        body: `<p>¿Deseas desactivar la cuenta del usuario <strong>${name} (#${id})</strong>?</p>`,
        confirmText: 'Desactivar',
        confirmClass: 'btn-danger',
        onConfirm: async () => {
            try {
                await window.api.users.deactivateById(id);
                Toast.warning('Usuario desactivado');
                Modal.close();
                await reloadAllData();
            } catch (err) {
                Toast.error(err.message || 'Error al desactivar');
            }
        }
    });
};

window.activateUser = id => {
    const user = appState.users.find(item => Number(item.id_user) === Number(id));
    const name = BookCover.escapeAttribute(user?.name_user || `usuario #${id}`);
    Modal.open({
        title: 'Activar Usuario',
        body: `<p>¿Deseas volver a activar la cuenta de <strong>${name} (#${id})</strong>?</p>`,
        confirmText: 'Activar',
        confirmClass: 'btn-primary',
        onConfirm: async () => {
            try {
                await window.api.users.updateById(id, { is_active: true });
                Toast.success('Usuario activado');
                Modal.close();
                await reloadAllData();
            } catch (err) {
                Toast.error(err.message || 'Error al activar');
            }
        }
    });
};

/* ==========================================================================
   11. MÓDULO: MI PERFIL (/users/me)
   ========================================================================== */
function setupProfileForm() {
    const profileForm = document.getElementById('profile-form') || document.getElementById('profile-edit-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = (document.getElementById('profile-first-name') || document.getElementById('profile-name'))?.value.trim();
            const lastName = (document.getElementById('profile-last-name') || document.getElementById('profile-lastname'))?.value.trim();
            const phone = document.getElementById('profile-phone')?.value.trim();
            const email = (document.getElementById('profile-email-input') || document.getElementById('profile-email'))?.value.trim();

            try {
                const payload = {};
                if (name) payload.name_user = name;
                if (lastName) payload.last_name = lastName;
                if (phone) payload.phone = phone;
                if (email) payload.email = email;

                await window.api.users.updateMe(payload);
                Toast.success('¡Perfil actualizado con éxito en el servidor!');
                await syncCurrentUser();
            } catch (err) {
                Toast.error(err.message || 'Error al actualizar perfil');
            }
        });
    }

    // Cambio de contraseña
    const passwordForm = document.getElementById('password-form') || document.querySelector('.form-card form:not(#profile-form):not(#profile-edit-form)');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPass = document.getElementById('new-password')?.value;
            const confirmPass = document.getElementById('confirm-password')?.value;

            if (!newPass || newPass.length < 8) {
                Toast.error('La contraseña debe tener al menos 8 caracteres');
                return;
            }
            if (newPass !== confirmPass) {
                Toast.error('Las contraseñas no coinciden');
                return;
            }

            try {
                await window.api.users.updateMe({ password: newPass });
                Toast.success('¡Contraseña cambiada exitosamente!');
                passwordForm.reset();
            } catch (err) {
                Toast.error(err.message || 'Error al cambiar contraseña');
            }
        });
    }

    // Desactivar mi cuenta
    const deactivateBtn = document.getElementById('btn-deactivate-account');
    if (deactivateBtn) {
        deactivateBtn.addEventListener('click', () => {
            Modal.open({
                title: 'Desactivar mi Cuenta',
                body: `<p>¿Estás seguro de que deseas desactivar tu cuenta de lector? Esta acción cerrará tu sesión.</p>`,
                confirmText: 'Sí, Desactivar',
                confirmClass: 'btn-danger',
                onConfirm: async () => {
                    try {
                        await window.api.users.deactivateMe();
                        Modal.close();
                        Toast.warning('Cuenta desactivada');
                        setTimeout(() => Session.logout(), 1000);
                    } catch (err) {
                        Toast.error(err.message || 'Error al desactivar cuenta');
                    }
                }
            });
        });
    }
}

/* ==========================================================================
   12. BOTONES Y ACCIONES DEL HEADER
   ========================================================================== */
function setupEventHandlers() {
    // Botones de creación rápida
    const newBookBtn = document.getElementById('btn-new-book');
    if (newBookBtn) newBookBtn.addEventListener('click', () => openBookModal());

    const newAuthorBtn = document.getElementById('btn-new-author');
    if (newAuthorBtn) newAuthorBtn.addEventListener('click', () => openAuthorModal());

    const newGenreBtn = document.getElementById('btn-new-genre');
    if (newGenreBtn) newGenreBtn.addEventListener('click', () => openGenreModal());

    const newPubBtn = document.getElementById('btn-new-publisher');
    if (newPubBtn) newPubBtn.addEventListener('click', () => openPublisherModal());

    const newLoanBtn = document.getElementById('btn-new-loan');
    if (newLoanBtn) newLoanBtn.addEventListener('click', () => openLoanModal());

    const newSaleBtn = document.getElementById('btn-new-sale');
    if (newSaleBtn) newSaleBtn.addEventListener('click', () => openSaleModal());

    const newUserBtn = document.getElementById('btn-new-user');
    if (newUserBtn) newUserBtn.addEventListener('click', () => openUserModal());

    // Perfil
    setupProfileForm();

    // Búsqueda
    setupSearch();

    // Logout
    setupLogout();
}

function setupSearch() {
    const searchInput = document.getElementById('global-search') || document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.toLowerCase().trim();
            filterActiveSection(query);
        }, 200));
    }
}

function filterActiveSection(query) {
    const current = Navigation.currentSection;
    if (current === 'books') {
        const cards = document.querySelectorAll('.cards-grid .book-card, #books-grid .book-card');
        cards.forEach(card => {
            const match = card.textContent.toLowerCase().includes(query);
            card.style.display = match ? '' : 'none';
        });
    } else {
        const targetContainer = document.getElementById(`section-${current}`);
        if (!targetContainer) return;
        const rows = targetContainer.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const match = row.textContent.toLowerCase().includes(query);
            row.style.display = match ? '' : 'none';
        });
    }
}

function setupLogout() {
    const logoutBtns = document.querySelectorAll('#btn-logout, .btn-logout');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            Modal.open({
                title: 'Cerrar Sesión',
                body: '<p>¿Deseas cerrar tu sesión de Minerva Lib?</p>',
                confirmText: 'Cerrar Sesión',
                confirmClass: 'btn-danger',
                onConfirm: async () => {
                    try {
                        await window.api.auth.logout();
                    } catch {}
                    Modal.close();
                    Toast.info('Sesión cerrada');
                    setTimeout(() => Session.logout(), 300);
                }
            });
        });
    });
}

function handleUrlActions() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const bookId = params.get('bookId');

    if (action === 'loan' && bookId) {
        Navigation.goTo('loans');
        setTimeout(() => openLoanModal(bookId), 300);
    }
}

function escapeString(str) {
    return (str || '').replace(/'/g, "\\'");
}
