/**
 * Minerva Lib - Controlador de la Landing Page
 * Conectado en tiempo real a los endpoints públicos del backend:
 * - GET /books
 * - GET /genres
 */

'use strict';

let publicBooksCollection = [];
let availableGenres = [];
let activeGenreFilter = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializar componentes
    Modal.init();
    Toast.init();

    // 2. Verificar sesión de usuario en el navbar
    checkUserSession();

    // 3. Cargar datos desde el Backend
    await loadBackendCatalog();

    // 4. Configurar eventos de filtrado y búsqueda
    setupCatalogFilters();
});

/* ==========================================================================
   1. CONTROL DE SESIÓN EN NAVBAR
   ========================================================================== */
function checkUserSession() {
    const user = Session.getUser();
    const navAuthContainer = document.getElementById('nav-auth-buttons');
    if (!navAuthContainer) return;

    if (Session.isLoggedIn() && user) {
        const shortName = user.name_user || 'Lector';
        navAuthContainer.innerHTML = `
            <a href="pages/dashboard.html" class="btn btn-primary btn-sm" style="display:flex; align-items:center; gap:0.5rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Mi Panel (${shortName})
            </a>
            <button class="btn btn-ghost btn-sm" id="landing-btn-logout" title="Cerrar Sesión">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
            </button>
        `;

        const logoutBtn = document.getElementById('landing-btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await window.api.auth.logout();
                } catch {}
                Session.logout();
            });
        }
    }
}

/* ==========================================================================
   2. CARGA DE LIBROS Y GÉNEROS DESDE EL BACKEND
   ========================================================================== */
async function loadBackendCatalog() {
    const grid = document.getElementById('landing-books-grid');
    if (grid) Loading.showSkeletons('landing-books-grid', 6);

    try {
        const [booksResponse, genresResponse] = await Promise.all([
            window.api.books.getAll(),
            window.api.genres.getAll().catch(() => ({ data: [] }))
        ]);

        const booksData = Array.isArray(booksResponse?.data) ? booksResponse.data : [];
        const genresData = Array.isArray(genresResponse?.data) ? genresResponse.data : [];

        publicBooksCollection = booksData.map(b => ({
            id: b.id,
            title: b.title,
            image_url: b.image_url,
            author: b.name_author || 'Autor no especificado',
            genre: b.name_genre || 'General',
            publisher: b.name_publisher || 'Editorial no especificada',
            year: b.year_publication || '—',
            pages: b.no_pages || '—',
            lang: b.wrote_language || 'Español',
            price: Number(b.price || 0),
            stock: Number(b.stock || 0),
            isbn: b.isbn || ''
        }));

        // Actualizar contadores del banner
        updateBannerStats(publicBooksCollection.length, genresData.length);

        // Poblar chips de géneros dinámicos desde la base de datos
        if (genresData.length > 0) {
            renderGenreChips(genresData);
        }

        renderPublicCatalog();
    } catch (err) {
        console.error('Error al cargar catálogo del backend:', err);
        publicBooksCollection = [];
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <h3>Catálogo no disponible</h3>
                        <p class="empty-state-text">No se pudo establecer conexión con el backend de Minerva Lib. Verifica que el servidor esté activo.</p>
                    </div>
                </div>
            `;
        }
    }
}

function updateBannerStats(booksCount, genresCount) {
    const statBooks = document.getElementById('stat-banner-books');
    const statGenres = document.getElementById('stat-banner-genres');
    if (statBooks) statBooks.textContent = booksCount > 0 ? `+${booksCount}` : '0';
    if (statGenres) statGenres.textContent = genresCount > 0 ? `${genresCount}` : '0';
}

function renderGenreChips(genres) {
    const container = document.getElementById('genre-filter-chips');
    if (!container) return;

    let html = `<button class="filter-chip active" data-genre="all">Todos los géneros</button>`;
    genres.forEach(g => {
        const name = g.genre || g.name_genre || g.name;
        if (name) {
            html += `<button class="filter-chip" data-genre="${name}">${name}</button>`;
        }
    });

    container.innerHTML = html;
    setupChipListeners();
}

/* ==========================================================================
   3. RENDERIZADO DEL CATÁLOGO
   ========================================================================== */
function renderPublicCatalog() {
    const grid = document.getElementById('landing-books-grid');
    if (!grid) return;

    const filtered = publicBooksCollection.filter(book => {
        const matchesGenre = activeGenreFilter === 'all' || 
            book.genre.toLowerCase() === activeGenreFilter.toLowerCase();

        const matchesSearch = !searchQuery || 
            book.title.toLowerCase().includes(searchQuery) || 
            book.author.toLowerCase().includes(searchQuery) ||
            book.publisher.toLowerCase().includes(searchQuery);

        return matchesGenre && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <h3>No se encontraron libros</h3>
                    <p class="empty-state-text">Intenta con otro término de búsqueda o selecciona otro género literario.</p>
                </div>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(b => `
        <article class="book-card" data-id="${b.id}">
            <div class="book-cover">
                <div class="book-cover-pattern"></div>
                <img src="assets/img/isotipo.png" alt="Minerva Lib" style="width: 44px; height: 44px; margin-bottom: 0.5rem; opacity: 0.9;">
                <h3 class="book-cover-title">${b.title}</h3>
                ${BookCover.render(b.image_url, b.title)}
            </div>
            <div class="book-card-body">
                <div>
                    <span class="badge badge-primary">${b.genre}</span>
                </div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-top: 0.35rem;">${b.title}</h3>
                <span class="book-author">Por ${b.author}</span>

                <div class="book-meta">
                    <span>📅 ${b.year}</span>
                    <span>📖 ${b.pages} págs</span>
                    <span>🌐 ${b.lang}</span>
                </div>

                <div class="book-price-stock">
                    <span class="book-price">${Format.currency(b.price)}</span>
                    <span class="badge ${b.stock > 10 ? 'badge-success' : 'badge-warning'}">
                        ${b.stock > 0 ? `Stock: ${b.stock}` : 'Agotado'}
                    </span>
                </div>

                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                    <button class="btn btn-primary btn-sm book-cta-btn" onclick="handleBookAction('loan', ${b.id}, '${escapeQuote(b.title)}')">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <path d="M3 9h18"/>
                        </svg>
                        Pedir Préstamo
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="handleBookAction('buy', ${b.id}, '${escapeQuote(b.title)}')" title="Comprar libro">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </button>
                </div>
            </div>
        </article>
    `).join('');

    BookCover.bind(grid);
}

function escapeQuote(str) {
    return (str || '').replace(/'/g, "\\'");
}

/* ==========================================================================
   4. FILTRADO Y BÚSQUEDA
   ========================================================================== */
function setupCatalogFilters() {
    const searchInput = document.getElementById('landing-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderPublicCatalog();
        }, 200));
    }

    setupChipListeners();
}

function setupChipListeners() {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeGenreFilter = chip.getAttribute('data-genre') || 'all';
            renderPublicCatalog();
        });
    });
}

/* ==========================================================================
   5. CONTROL DE ACCIONES (PRÉSTAMOS / VENTAS)
   ========================================================================== */
window.handleBookAction = function(actionType, bookId, bookTitle) {
    const isLoggedIn = Session.isLoggedIn();

    if (isLoggedIn) {
        // Redirigir al dashboard llevando el ID del libro
        Toast.success(`Abriendo gestión para: ${bookTitle}`);
        setTimeout(() => {
            window.location.href = `pages/dashboard.html?action=${actionType}&bookId=${bookId}`;
        }, 500);
    } else {
        const actionText = actionType === 'loan' ? 'solicitar el préstamo de' : 'adquirir';

        Modal.open({
            title: 'Acceso de Lector Requerido',
            body: `
                <div style="text-align: center; padding: 1rem 0;">
                    <img src="assets/icons/app-icon.png" alt="Minerva Lib" style="width: 72px; height: 72px; margin: 0 auto 1.25rem auto; border-radius: 16px; box-shadow: var(--shadow-md);">
                    <h4 style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.65rem;">
                        ¿Deseas ${actionText} "${bookTitle}"?
                    </h4>
                    <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.25rem;">
                        Para procesar préstamos con fecha esperada de retorno o generar órdenes de compra, es necesario contar con tu cuenta de lector.
                    </p>
                    <div style="background-color: var(--bg-muted); padding: 0.85rem; border-radius: var(--radius-md); font-size: 0.88rem; color: var(--text-secondary); text-align: left;">
                        💡 <strong>¿Aún no tienes cuenta?</strong> Puedes registrarte en menos de 1 minuto con tu DPI de 13 dígitos y teléfono.
                    </div>
                </div>
            `,
            confirmText: 'Iniciar Sesión / Registrarse',
            confirmClass: 'btn-primary',
            onConfirm: () => {
                window.location.href = 'pages/auth.html';
            }
        });
    }
};
