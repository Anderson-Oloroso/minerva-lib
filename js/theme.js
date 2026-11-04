/**
 * Minerva Lib - Theme Manager
 * Gestión del modo claro/oscuro con persistencia en localStorage
 */

(function() {
    'use strict';

    const THEME_KEY = 'minerva-theme';
    const DARK = 'dark';
    const LIGHT = 'light';

    /**
     * Obtiene el tema guardado o detecta la preferencia del sistema
     */
    function getSavedTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === DARK || saved === LIGHT) return saved;

        // Detectar preferencia del sistema operativo
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return DARK;
        }
        return LIGHT;
    }

    /**
     * Aplica el tema al documento
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        updateToggleIcons(theme);
    }

    /**
     * Actualiza los iconos del toggle (sol/luna)
     */
    function updateToggleIcons(theme) {
        const sunIcons = document.querySelectorAll('.icon-sun, .theme-icon-sun');
        const moonIcons = document.querySelectorAll('.icon-moon, .theme-icon-moon');

        sunIcons.forEach(icon => {
            icon.style.display = theme === DARK ? 'block' : 'none';
        });
        moonIcons.forEach(icon => {
            icon.style.display = theme === DARK ? 'none' : 'block';
        });
    }

    /**
     * Alterna entre modo claro y oscuro
     */
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === DARK ? LIGHT : DARK;
        applyTheme(next);
    }

    // Aplicar tema inmediatamente (antes del render)
    applyTheme(getSavedTheme());

    // Cuando el DOM esté listo, vincular botones
    document.addEventListener('DOMContentLoaded', () => {
        const toggleButtons = document.querySelectorAll('.theme-toggle, .theme-toggle-btn, #themeToggle, #desktop-theme-toggle, #mobile-theme-toggle');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleTheme();
            });
        });

        updateToggleIcons(getSavedTheme());

        // Escuchar cambios en la preferencia del sistema
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(THEME_KEY)) {
                    applyTheme(e.matches ? DARK : LIGHT);
                }
            });
        }
    });

    // Exponer API global
    window.MinervaTheme = {
        toggle: toggleTheme,
        set: applyTheme,
        get: () => document.documentElement.getAttribute('data-theme')
    };
})();
