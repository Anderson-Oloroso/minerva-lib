/**
 * Minerva Lib - Utilidades compartidas
 * Componentes de interfaz: Notificaciones Toast, Modales, Navegación y Formatos
 */

'use strict';

/* ==========================================================================
   1. TOAST NOTIFICATIONS (NOTIFICACIONES EN PANTALLA)
   ========================================================================== */
const Toast = {
    container: null,

    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'info', duration = 3500) {
        if (!this.container) this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${this.getIcon(type)}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" type="button" aria-label="Cerrar">&times;</button>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('toast-show');
            toast.classList.add('toast-hide');
            setTimeout(() => toast.remove(), 250);
        });

        this.container.appendChild(toast);

        // Disparar animación de entrada
        requestAnimationFrame(() => toast.classList.add('toast-show'));

        // Auto eliminación
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('toast-show');
                toast.classList.add('toast-hide');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    },

    getIcon(type) {
        const icons = {
            success: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
            error: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
            warning: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
            info: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
        };
        return icons[type] || icons.info;
    },

    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    warning(msg) { this.show(msg, 'warning'); },
    info(msg) { this.show(msg, 'info'); }
};

/* ==========================================================================
   2. MODAL MANAGER (VENTANAS MODALES DINÁMICAS)
   ========================================================================== */
const Modal = {
    overlay: null,
    titleEl: null,
    bodyEl: null,
    footerEl: null,
    confirmBtn: null,
    cancelBtn: null,
    closeBtn: null,
    onConfirm: null,

    init() {
        this.overlay = document.getElementById('modal-overlay');
        this.titleEl = document.getElementById('modal-title');
        this.bodyEl = document.getElementById('modal-body');
        this.footerEl = document.getElementById('modal-footer');
        this.confirmBtn = document.getElementById('modal-confirm');
        this.cancelBtn = document.getElementById('modal-cancel');
        this.closeBtn = document.getElementById('modal-close');

        if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
        if (this.cancelBtn) this.cancelBtn.addEventListener('click', () => this.close());
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) this.close();
            });
        }

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay && !this.overlay.classList.contains('hidden')) {
                this.close();
            }
        });
    },

    open({ title, body, confirmText = 'Confirmar', confirmClass = 'btn-primary', onConfirm, showFooter = true }) {
        if (!this.overlay) this.init();

        if (this.titleEl) this.titleEl.textContent = title;
        if (this.bodyEl) this.bodyEl.innerHTML = body;
        this.onConfirm = onConfirm;

        if (this.footerEl) {
            if (showFooter) {
                this.footerEl.classList.remove('hidden');
                if (this.confirmBtn) {
                    this.confirmBtn.textContent = confirmText;
                    this.confirmBtn.className = `btn ${confirmClass}`;

                    const newBtn = this.confirmBtn.cloneNode(true);
                    this.confirmBtn.parentNode.replaceChild(newBtn, this.confirmBtn);
                    this.confirmBtn = newBtn;

                    if (onConfirm) {
                        this.confirmBtn.addEventListener('click', () => onConfirm());
                    }
                }
            } else {
                this.footerEl.classList.add('hidden');
            }
        }

        if (this.overlay) {
            this.overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            const firstInput = this.bodyEl.querySelector('input, select, textarea');
            if (firstInput) setTimeout(() => firstInput.focus(), 100);
        }
    },

    close() {
        if (this.overlay) {
            this.overlay.classList.add('hidden');
            document.body.style.overflow = '';
            this.onConfirm = null;
        }
    }
};

/* ==========================================================================
   3. NAVIGATION MANAGER (CONTROL DE SECCIONES SPA)
   ========================================================================== */
const Navigation = {
    currentSection: 'dashboard',
    sections: [],
    navItems: [],

    init() {
        this.sections = document.querySelectorAll('.content-section');
        this.navItems = document.querySelectorAll('[data-section]');

        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const rawSection = item.getAttribute('data-section');
                if (rawSection) this.goTo(rawSection);

                // Cerrar drawer lateral en pantallas móviles
                this.closeMobileSidebar();
            });
        });

        // Menú Hamburguesa Móvil
        const hamburger = document.getElementById('hamburger-btn');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');

        if (hamburger) {
            hamburger.addEventListener('click', () => this.toggleMobileSidebar());
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => this.closeMobileSidebar());
        }
    },

    toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.toggle('sidebar-open');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('hidden');
    },

    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('sidebar-open');
        if (sidebarOverlay) sidebarOverlay.classList.add('hidden');
    },

    goTo(sectionIdentifier) {
        // Normalizar id (soporta 'books' o 'section-books')
        const rawId = sectionIdentifier.startsWith('section-') 
            ? sectionIdentifier.replace('section-', '') 
            : sectionIdentifier;

        this.currentSection = rawId;
        const targetId = `section-${rawId}`;

        // Ocultar todas las secciones
        this.sections.forEach(s => {
            s.classList.add('hidden');
            s.classList.remove('active');
        });

        // Mostrar sección activa
        const target = document.getElementById(targetId);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }

        // Actualizar links activos en sidebar
        this.navItems.forEach(item => {
            const itemSection = item.getAttribute('data-section');
            const normalized = itemSection.startsWith('section-') ? itemSection.replace('section-', '') : itemSection;

            if (normalized === rawId) {
                item.classList.add('active', 'nav-active');
            } else {
                item.classList.remove('active', 'nav-active');
            }
        });

    }
};

/* ==========================================================================
   4. FORMAT HELPERS (FORMATEO DE DATOS)
   ========================================================================== */
const BookCover = {
    render(imageUrl, title) {
        if (typeof imageUrl !== 'string' || !imageUrl.trim()) return '';

        let url;
        try {
            url = new URL(imageUrl);
        } catch {
            return '';
        }

        if (!['http:', 'https:'].includes(url.protocol)) return '';

        return `<img class="book-cover-image" src="${this.escapeAttribute(url.href)}" alt="Portada de ${this.escapeAttribute(title)}" loading="lazy">`;
    },

    bind(container) {
        container.querySelectorAll('.book-cover-image').forEach(image => {
            image.addEventListener('error', () => image.remove(), { once: true });
        });
    },

    escapeAttribute(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
    }
};

const Format = {
    currency(amount) {
        return `Q${Number(amount || 0).toFixed(2)}`;
    },

    date(isoString) {
        if (!isoString) return '—';
        const d = new Date(isoString);
        return d.toLocaleDateString('es-GT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    dateTime(isoString) {
        if (!isoString) return '—';
        const d = new Date(isoString);
        return d.toLocaleDateString('es-GT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    truncate(text, maxLength = 30) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },

    loanStateBadge(state) {
        const classes = {
            activo: 'badge badge-warning',
            devuelto: 'badge badge-success'
        };
        return `<span class="${classes[state] || 'badge'}">${state}</span>`;
    },

    roleBadge(role) {
        const classes = {
            admin: 'badge badge-primary',
            user: 'badge badge-secondary'
        };
        const labels = {
            admin: 'Administrador',
            user: 'Lector'
        };
        return `<span class="${classes[role] || 'badge'}">${labels[role] || role}</span>`;
    },

    activeBadge(isActive) {
        return isActive
            ? '<span class="badge badge-success">Activo</span>'
            : '<span class="badge badge-danger">Inactivo</span>';
    },

    bookConditionBadge(condition) {
        const classes = {
            Excelente: 'badge badge-success',
            Regular: 'badge badge-warning',
            Maltratado: 'badge badge-danger'
        };
        return `<span class="${classes[condition] || 'badge'}">${condition || '—'}</span>`;
    }
};

/* ==========================================================================
   5. LOADING & EMPTY STATES
   ========================================================================== */
const Loading = {
    show(elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            el.innerHTML = `
                <div class="loading-container">
                    <div class="spinner"></div>
                    <p class="loading-text">Cargando...</p>
                </div>
            `;
        }
    },

    showSkeletons(elementId, count = 6) {
        const el = document.getElementById(elementId);
        if (el) {
            el.innerHTML = Array(count).fill(`
                <div class="skeleton-card">
                    <div class="skeleton skeleton-img"></div>
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text short"></div>
                </div>
            `).join('');
        }
    },

    showTableSkeleton(tbodyId, cols = 4, rows = 5) {
        const tbody = document.getElementById(tbodyId);
        if (tbody) {
            tbody.innerHTML = Array(rows).fill(
                `<tr>${Array(cols).fill('<td><div class="skeleton skeleton-text"></div></td>').join('')}</tr>`
            ).join('');
        }
    },

    showEmpty(elementId, message = 'No hay registros en esta sección') {
        const el = document.getElementById(elementId);
        if (el) {
            el.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    <h3>Sección Vacía</h3>
                    <p class="empty-state-text">${message}</p>
                </div>
            `;
        }
    }
};

/* ==========================================================================
   6. SESSION MANAGER
   ========================================================================== */
const Session = {
    TOKEN_KEY: 'minerva-token',
    USER_KEY: 'minerva-user',

    saveLogin(data) {
        if (data.accessToken) {
            localStorage.setItem(this.TOKEN_KEY, data.accessToken);
        }
        if (data.data) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(data.data));
        }
    },

    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    getUser() {
        try {
            const raw = localStorage.getItem(this.USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    },

    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        const target = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
        window.location.href = target;
    },

    requireAuth() {
        if (!this.isLoggedIn()) {
            const target = window.location.pathname.includes('/pages/') ? 'auth.html' : 'pages/auth.html';
            window.location.href = target;
            return false;
        }
        return true;
    },

    applyRoleVisibility() {
        const isAdmin = this.isAdmin();
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = isAdmin ? '' : 'none';
        });
    }
};

/* ==========================================================================
   7. DEBOUNCE UTILITY
   ========================================================================== */
function debounce(func, wait = 250) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
