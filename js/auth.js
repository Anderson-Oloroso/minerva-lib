/**
 * Minerva Lib - Controlador de la Página de Autenticación
 * Conectado en tiempo real con la API del Backend (POST /auth/login, POST /auth/register)
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Si ya existe sesión activa válida, redirigir al dashboard
    const token = localStorage.getItem('minerva-token');
    if (token) {
        const dest = window.location.pathname.includes('/pages/') ? 'dashboard.html' : 'pages/dashboard.html';
        window.location.href = dest;
        return;
    }

    // --- Cambio de Pestañas (Tabs) ---
    const tabLogin = document.getElementById('tabLogin') || document.getElementById('tab-login');
    const tabRegister = document.getElementById('tabRegister') || document.getElementById('tab-register');
    const panelLogin = document.getElementById('panelLogin') || document.getElementById('form-login');
    const panelRegister = document.getElementById('panelRegister') || document.getElementById('form-register');

    function switchTab(target) {
        if (target === 'login') {
            tabLogin.classList.add('active');
            tabLogin.setAttribute('aria-selected', 'true');
            tabRegister.classList.remove('active');
            tabRegister.setAttribute('aria-selected', 'false');

            panelLogin.classList.add('active');
            panelLogin.classList.remove('hidden');
            panelRegister.classList.remove('active');
            panelRegister.classList.add('hidden');
        } else {
            tabRegister.classList.add('active');
            tabRegister.setAttribute('aria-selected', 'true');
            tabLogin.classList.remove('active');
            tabLogin.setAttribute('aria-selected', 'false');

            panelRegister.classList.add('active');
            panelRegister.classList.remove('hidden');
            panelLogin.classList.remove('active');
            panelLogin.classList.add('hidden');
        }
        clearAllErrors();
    }

    if (tabLogin && tabRegister) {
        tabLogin.addEventListener('click', () => switchTab('login'));
        tabRegister.addEventListener('click', () => switchTab('register'));
    }

    // --- Alternar visibilidad de contraseña (Password Toggles) ---
    const toggleButtons = document.querySelectorAll('.password-toggle, .btn-toggle-password');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = targetId ? document.getElementById(targetId) : btn.previousElementSibling;
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            const iconEye = btn.querySelector('.icon-eye');
            const iconEyeOff = btn.querySelector('.icon-eye-off');
            if (iconEye && iconEyeOff) {
                iconEye.style.display = isPassword ? 'none' : 'block';
                iconEyeOff.style.display = isPassword ? 'block' : 'none';
            }
        });
    });

    // --- Formulario de Inicio de Sesión (Login) ---
    const loginForm = document.getElementById('loginForm') || document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAllErrors();

            const emailInput = document.getElementById('loginEmail') || document.getElementById('login-email');
            const passwordInput = document.getElementById('loginPassword') || document.getElementById('login-password');
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            let hasError = false;

            if (!email) {
                setFieldError('loginEmail', 'loginEmailError', 'El correo electrónico es requerido');
                hasError = true;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setFieldError('loginEmail', 'loginEmailError', 'Ingresa un correo electrónico válido');
                hasError = true;
            }

            if (!password) {
                setFieldError('loginPassword', 'loginPasswordError', 'La contraseña es requerida');
                hasError = true;
            }

            if (hasError) return;

            const submitBtn = loginForm.querySelector('button[type="submit"]');
            setLoading(submitBtn, true, 'Conectando con el servidor...');

            try {
                // Llamada a la API real del backend
                const result = await window.api.auth.login(email, password);

                if (result && result.accessToken) {
                    localStorage.setItem('minerva-token', result.accessToken);
                    if (result.data) {
                        localStorage.setItem('minerva-user', JSON.stringify(result.data));
                    }

                    showBanner('success', `¡Bienvenido/a ${result.data?.name_user || 'Lector'}! Ingresando al panel...`, panelLogin);
                    setTimeout(() => {
                        const dest = window.location.pathname.includes('/pages/') ? 'dashboard.html' : 'pages/dashboard.html';
                        window.location.href = dest;
                    }, 800);
                } else {
                    throw new Error(result.message || 'No se recibió token de acceso');
                }
            } catch (err) {
                setLoading(submitBtn, false, 'Iniciar Sesión');
                showBanner('error', err.message || 'Error al iniciar sesión', panelLogin);
            }
        });
    }

    // --- Formulario de Registro (Register) ---
    const registerForm = document.getElementById('registerForm') || document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAllErrors();

            const dpi = (document.getElementById('registerDpi') || {}).value?.trim() || '';
            const nombre = (document.getElementById('registerNombre') || document.getElementById('register-name') || {}).value?.trim() || '';
            const apellido = (document.getElementById('registerApellido') || document.getElementById('register-lastname') || {}).value?.trim() || '';
            const telefono = (document.getElementById('registerTelefono') || document.getElementById('register-phone') || {}).value?.trim() || '';
            const email = (document.getElementById('registerEmail') || document.getElementById('register-email') || {}).value?.trim() || '';
            const password = (document.getElementById('registerPassword') || document.getElementById('register-password') || {}).value || '';
            const confirmPassword = (document.getElementById('registerConfirmPassword') || document.getElementById('register-confirm-password') || {}).value || '';

            let hasError = false;

            if (!dpi || !/^\d{13}$/.test(dpi)) {
                setFieldError('registerDpi', 'registerDpiError', 'El DPI debe tener exactamente 13 caracteres numéricos');
                hasError = true;
            }

            if (!nombre || nombre.length < 2 || nombre.length > 50) {
                setFieldError('registerNombre', 'registerNombreError', 'El nombre debe tener entre 2 y 50 caracteres');
                hasError = true;
            }

            if (!apellido || apellido.length < 2 || apellido.length > 50) {
                setFieldError('registerApellido', 'registerApellidoError', 'El apellido debe tener entre 2 y 50 caracteres');
                hasError = true;
            }

            if (!telefono || !/^\d{8}$/.test(telefono)) {
                setFieldError('registerTelefono', 'registerTelefonoError', 'El teléfono debe tener 8 dígitos');
                hasError = true;
            }

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setFieldError('registerEmail', 'registerEmailError', 'Ingresa un correo electrónico válido');
                hasError = true;
            }

            if (!password || password.length < 8 || !/\d/.test(password)) {
                setFieldError('registerPassword', 'registerPasswordError', 'La contraseña debe tener al menos 8 caracteres y contener un número');
                hasError = true;
            }

            if (password !== confirmPassword) {
                setFieldError('registerConfirmPassword', 'registerConfirmPasswordError', 'Las contraseñas no coinciden');
                hasError = true;
            }

            if (hasError) return;

            const submitBtn = registerForm.querySelector('button[type="submit"]');
            setLoading(submitBtn, true, 'Registrando en base de datos...');

            try {
                // Envío directo al endpoint POST /auth/register
                const result = await window.api.auth.register({
                    dpi,
                    nombre,
                    apellido,
                    telefono,
                    email,
                    password
                });

                setLoading(submitBtn, false, 'Crear Cuenta');
                showBanner('success', '¡Cuenta registrada con éxito en Minerva Lib! Ahora puedes iniciar sesión.', panelRegister);

                setTimeout(() => {
                    switchTab('login');
                    const loginEmailInput = document.getElementById('loginEmail') || document.getElementById('login-email');
                    if (loginEmailInput) loginEmailInput.value = email;
                    const loginPassInput = document.getElementById('loginPassword') || document.getElementById('login-password');
                    if (loginPassInput) loginPassInput.value = password;
                }, 1200);
            } catch (err) {
                setLoading(submitBtn, false, 'Crear Cuenta');
                showBanner('error', err.message || 'Error al registrar usuario', panelRegister);
            }
        });
    }

    // --- Helpers de Validación y UI ---
    function setFieldError(inputId, errorSpanId, message) {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(errorSpanId);

        if (input) input.classList.add('input-error');
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.remove('hidden');
        }
    }

    function clearAllErrors() {
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        document.querySelectorAll('.form-error, .field-error').forEach(el => {
            el.textContent = '';
            el.classList.add('hidden');
        });
        document.querySelectorAll('.auth-message').forEach(el => el.remove());
    }

    function setLoading(btn, isLoading, text) {
        if (!btn) return;
        btn.disabled = isLoading;
        if (isLoading) {
            btn.innerHTML = `<span class="btn-spinner"></span> ${text}`;
        } else {
            btn.innerHTML = text;
        }
    }

    function showBanner(type, message, container) {
        if (!container) return;
        const existing = container.querySelector('.auth-message');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.className = `auth-message auth-message-${type}`;
        banner.textContent = message;
        container.insertBefore(banner, container.firstChild);
    }


});
