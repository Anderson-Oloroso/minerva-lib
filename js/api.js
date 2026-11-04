/**
 * Minerva Lib - Cliente de Conexión a la API del Backend
 * Conecta con los endpoints de minerva-backend (Express / JWT / MySQL)
 */

'use strict';

const API_CONFIG = {
    // URL base por defecto del backend Express (puerto 5000 según .env)
    DEFAULT_BASE_URL: 'http://localhost:5000/api/v1',
    STORAGE_KEY: 'minerva-api-url',

    getBaseUrl() {
        return localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_BASE_URL;
    },

    setBaseUrl(url) {
        if (!url) {
            localStorage.removeItem(this.STORAGE_KEY);
        } else {
            // Remover barra final si existe
            const cleanUrl = url.replace(/\/+$/, '');
            localStorage.setItem(this.STORAGE_KEY, cleanUrl);
        }
    }
};

class ApiClient {
    constructor() {
        this.config = API_CONFIG;
    }

    /**
     * Obtiene los encabezados HTTP comunes incluyendo el Token JWT Bearer
     */
    getHeaders(customHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...customHeaders
        };

        const token = localStorage.getItem('minerva-token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Método central de peticiones fetch
     */
    async request(endpoint, options = {}) {
        const baseUrl = this.config.getBaseUrl();
        const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

        const config = {
            method: options.method || 'GET',
            headers: this.getHeaders(options.headers),
            ...options
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json().catch(() => null);

            // Manejo de respuestas no exitosas (4xx, 5xx)
            if (!response.ok) {
                // Token expirado o no autorizado
                if (response.status === 401) {
                    // Si estamos en dashboard o páginas protegidas y el token venció
                    if (window.location.pathname.includes('/pages/dashboard.html')) {
                        localStorage.removeItem('minerva-token');
                        localStorage.removeItem('minerva-user');
                        window.location.href = 'auth.html?session=expired';
                    }
                }

                const errorMessage = this.extractErrorMessage(data, response.status);
                const error = new Error(errorMessage);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (err) {
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                const networkError = new Error(
                    `No se pudo conectar con el backend en ${baseUrl}. Asegúrate de que el servidor esté encendido (npm run dev / npm start).`
                );
                networkError.isNetworkError = true;
                throw networkError;
            }
            throw err;
        }
    }

    /**
     * Extrae un mensaje de error legible a partir de las respuestas del backend
     */
    extractErrorMessage(data, status) {
        if (!data) return `Error en la solicitud (Código ${status})`;

        // Formato express-validator o error middleware de minerva-backend
        if (data.mensaje) {
            if (Array.isArray(data.errores) && data.errores.length > 0) {
                const details = data.errores.map(e => e.msg || e.message).join('. ');
                return `${data.mensaje}: ${details}`;
            }
            return data.mensaje;
        }

        if (data.message) return data.message;
        if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);

        return `Error en el servidor (${status})`;
    }

    /* ======================================================================
       1. HEALTH CHECK
       ====================================================================== */
    async health() {
        const rootUrl = this.config.getBaseUrl().replace(/\/api\/v[0-9]+$/, '');
        const res = await fetch(`${rootUrl}/api/v1/health`, {
            headers: { 'Accept': 'application/json' }
        });
        return res.json();
    }

    /* ======================================================================
       2. AUTENTICACIÓN (/auth)
       ====================================================================== */
    auth = {
        /**
         * Iniciar sesión con email y contraseña
         */
        login: async (email, password) => {
            return this.request('/auth/login', {
                method: 'POST',
                body: { email, password }
            });
        },

        /**
         * Registrar nuevo usuario
         * Payload esperado por backend: { dpi, name, last_name, phone, email, password }
         */
        register: async (userData) => {
            return this.request('/auth/register', {
                method: 'POST',
                body: {
                    dpi: userData.dpi,
                    name: userData.nombre || userData.name || userData.name_user,
                    last_name: userData.apellido || userData.last_name,
                    phone: userData.telefono || userData.phone,
                    email: userData.email,
                    password: userData.password
                }
            });
        },

        /**
         * Cerrar sesión en servidor
         */
        logout: async () => {
            try {
                return await this.request('/auth/logout', { method: 'POST' });
            } catch {
                return { status: 'Success' };
            }
        }
    };

    /* ======================================================================
       3. LIBROS (/books)
       ====================================================================== */
    books = {
        getAll: () => this.request('/books'),
        create: (bookData) => this.request('/books', {
            method: 'POST',
            body: {
                title: bookData.title,
                isbn: bookData.isbn,
                image_url: bookData.image_url || null,
                year_publication: Number(bookData.year_publication),
                no_pages: Number(bookData.no_pages),
                wrote_language: bookData.wrote_language,
                price: Number(bookData.price),
                stock: Number(bookData.stock),
                id_genre: Number(bookData.id_genre),
                id_author: bookData.id_author ? Number(bookData.id_author) : null,
                id_publisher: bookData.id_publisher ? Number(bookData.id_publisher) : null
            }
        }),
        update: (id, bookData) => this.request(`/books/${id}`, {
            method: 'PUT',
            body: {
                ...bookData,
                image_url: bookData.image_url ?? null
            }
        }),
        delete: (id) => this.request(`/books/${id}`, {
            method: 'DELETE'
        })
    };

    /* ======================================================================
       4. AUTORES (/authors)
       ====================================================================== */
    authors = {
        getAll: () => this.request('/authors'),
        create: (name) => this.request('/authors', {
            method: 'POST',
            body: { name }
        }),
        update: (id, name) => this.request(`/authors/${id}`, {
            method: 'PUT',
            body: { name }
        }),
        delete: (id) => this.request(`/authors/${id}`, {
            method: 'DELETE'
        })
    };

    /* ======================================================================
       5. GÉNEROS (/genres)
       ====================================================================== */
    genres = {
        getAll: () => this.request('/genres'),
        create: (genreName) => this.request('/genres', {
            method: 'POST',
            body: { genre: genreName }
        }),
        update: (id, genreName) => this.request(`/genres/${id}`, {
            method: 'PUT',
            body: { genre: genreName }
        }),
        delete: (id) => this.request(`/genres/${id}`, {
            method: 'DELETE'
        })
    };

    /* ======================================================================
       6. EDITORIALES (/publishers)
       ====================================================================== */
    publishers = {
        getAll: () => this.request('/publishers'),
        create: (publisherName) => this.request('/publishers', {
            method: 'POST',
            body: { publisher: publisherName }
        }),
        update: (id, publisherName) => this.request(`/publishers/${id}`, {
            method: 'PUT',
            body: { publisher: publisherName }
        }),
        delete: (id) => this.request(`/publishers/${id}`, {
            method: 'DELETE'
        })
    };

    /* ======================================================================
       7. PRÉSTAMOS (/loans)
       ====================================================================== */
    loans = {
        getAll: () => this.request('/loans', { cache: 'no-store' }),
        getMine: () => this.request('/loans/me', { cache: 'no-store' }),

        /**
         * Crear nuevo préstamo
         * @param {Object} loanData
         * @param {string} loanData.expected_return_date - Fecha ISO (debe ser futura)
         * @param {Array<{id_book: number, state_book_out: 'Excelente'|'Regular'|'Maltratado'}>} loanData.details
         */
        create: (loanData) => this.request('/loans', {
            method: 'POST',
            body: {
                expected_return_date: loanData.expected_return_date,
                details: loanData.details
            }
        }),

        approve: (loanId, details) => this.request(`/loans/${loanId}/approve`, {
            method: 'PUT',
            body: { details }
        }),

        reject: (loanId) => this.request(`/loans/${loanId}/reject`, {
            method: 'PUT'
        }),

        requestReturn: (loanId) => this.request(`/loans/${loanId}/return-request`, {
            method: 'PUT'
        }),

        /**
         * Devolver préstamo
         * @param {number} loanId
         * @param {Array<{id_loan_detail: number, state_book_in: 'Excelente'|'Regular'|'Maltratado'}>} details
         */
        returnLoan: (loanId, details) => this.request(`/loans/${loanId}/return`, {
            method: 'PUT',
            body: { details }
        })
    };

    /* ======================================================================
       8. VENTAS (/sales)
       ====================================================================== */
    sales = {
        getAll: () => this.request('/sales', { cache: 'no-store' }),
        getMine: () => this.request('/sales/me', { cache: 'no-store' }),

        /**
         * Registrar nueva venta
         * @param {Array<{id_book: number, amount: number}>} details
         */
        create: (details) => this.request('/sales', {
            method: 'POST',
            body: { details }
        }),
        confirm: (saleId) => this.request(`/sales/${saleId}/confirm`, {
            method: 'PUT'
        }),
        reject: (saleId) => this.request(`/sales/${saleId}/reject`, {
            method: 'PUT'
        })
    };

    /* ======================================================================
       9. USUARIOS (/users)
       ====================================================================== */
    users = {
        // Gestión del usuario autenticado (/me)
        getMe: () => this.request('/users/me'),
        updateMe: (userData) => this.request('/users/me', {
            method: 'PUT',
            body: userData
        }),
        deactivateMe: () => this.request('/users/me', {
            method: 'DELETE'
        }),

        // Gestión administrativa (/users)
        getAll: () => this.request('/users'),
        create: (userData) => this.request('/users', {
            method: 'POST',
            body: {
                dpi: userData.dpi,
                name_user: userData.name_user || userData.nombre,
                last_name: userData.last_name || userData.apellido,
                phone: userData.phone || userData.telefono,
                email: userData.email,
                password: userData.password,
                role: userData.role || 'user'
            }
        }),
        updateById: (id, userData) => this.request(`/users/${id}`, {
            method: 'PUT',
            body: userData
        }),
        deactivateById: (id) => this.request(`/users/${id}`, {
            method: 'DELETE'
        })
    };
}

// Instancia global
window.api = new ApiClient();
