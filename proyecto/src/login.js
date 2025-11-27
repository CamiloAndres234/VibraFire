// src/login.js
import { supabase } from './supabase.js';
import { mostrarRegistro } from './register.js'; // Asumo que tienes este archivo
import { navigateToAppScreen } from "./main.js"; // Necesario solo para el menú de cierre de sesión

// ----------------------------------------------------------------------
// 1. Lógica de Login (Mostrar Formulario y Manejar Submit)
// ----------------------------------------------------------------------

export function mostrarLogin() {
    const authScreen = document.getElementById('auth-screen');
    const appContainer = document.getElementById('app-container'); 
    
    // Asegurar visualización correcta (Login visible, App oculta)
    if (appContainer) appContainer.classList.add('hidden');
    authScreen.classList.remove('hidden'); 

    authScreen.innerHTML = `
        <section class="p-6 flex flex-col items-center text-center">
            <img src="https://i.pinimg.com/736x/b9/23/c7/b923c758828638ecdc73722bc2818d89.jpg"
                class="w-36 h-36 rounded-full shadow-xl border-4 border-[var(--color-bright-orange)] mb-4"/>
            <h2 class="text-3xl font-bold mb-4">Bienvenido de nuevo 🎧</h2>
            <p class="text-[var(--color-soft-orange)] mb-6">
                Conecta con tu música, conecta contigo.
            </p>
            <form id="login-form" class="space-y-4 w-full max-w-sm">
                <input type="email" name="correo" placeholder="Correo electrónico" required class="form-input w-full" />
                <div class="relative">
                    <input type="password" name="password" id="password-login-input" placeholder="Contraseña" required class="form-input w-full pr-12" />
                    <button type="button" id="toggle-login-pass" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition">
                        <svg id="login-eye-closed" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zm11 5a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/>
                        </svg>
                        <svg id="login-eye-open" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="hidden">
                            <path d="M12 5C5 5 1 12 1 12s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
                        </svg>
                    </button>
                </div>
                <button type="submit" class="custom-btn w-full">Ingresar</button>
            </form>
            <p id="error" class="warning-text mt-2"></p>
            <button id="ir-registro" class="text-sm text-gray-400 hover:text-[var(--color-bright-orange)] transition duration-150 mt-4">
                ¿No tienes cuenta? Crear cuenta
            </button>
        </section>
    `;

    // Toggle contraseña
    const passInput = document.getElementById("password-login-input");
    const togglePass = document.getElementById("toggle-login-pass");
    const eyeClosed = document.getElementById("login-eye-closed");
    const eyeOpen = document.getElementById("login-eye-open");
    
    togglePass.addEventListener("click", () => {
        const showing = passInput.type === "text";
        passInput.type = showing ? "password" : "text";
        eyeClosed.classList.toggle("hidden", !showing);
        eyeOpen.classList.toggle("hidden", showing);
    });

    // Ir a registro
    document.getElementById('ir-registro')?.addEventListener('click', () => {
        mostrarRegistro();
    });

    // Lógica de login
    const form = document.getElementById('login-form');
    const errorMsg = document.getElementById('error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.textContent = 'Iniciando sesión...';

        const correo = form.correo.value.trim();
        const password = form.password.value.trim();

        if (!correo || !password) {
            errorMsg.textContent = 'Por favor completa todos los campos.';
            return;
        }

        // Solo autenticamos. main.js hará el resto (redirección)
        const { error } = await supabase.auth.signInWithPassword({ email: correo, password });
        
        if (error) {
            errorMsg.textContent = 'Error: ' + error.message;
        } else {
            errorMsg.textContent = '';
        }
    });
}

// ----------------------------------------------------------------------
// 2. Funciones de Cierre de Sesión (para usuarios regulares)
// ----------------------------------------------------------------------

/**
 * Muestra un menú de opciones simple (Cerrar Sesión) en el espacio de "Más".
 * Se asume que existe un contenedor HTML con id="mobile-menu" y id="mobile-menu-content".
 */
export function mostrarMenuMas() {
    const menuContent = document.getElementById('mobile-menu-content');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!menuContent || !mobileMenu) return;
    
    // Ocultar cualquier otra pantalla de la app
    navigateToAppScreen('home'); 

    // Contenido para el usuario normal
    menuContent.innerHTML = `
        <div class="p-6">
            <h3 class="text-xl font-bold mb-4 text-bright-orange">Opciones</h3>
            <button id="logout-user-btn" 
                    class="w-full text-center py-3 px-4 text-lg text-crimson font-semibold rounded hover:bg-graphite transition">
                <i class="fas fa-sign-out-alt mr-2"></i> Cerrar Sesión
            </button>
        </div>
    `;

    // Mostrar el menú (Sheet/Modal)
    mobileMenu.classList.remove('hidden'); 
    mobileMenu.classList.add('show');
    
    document.getElementById('logout-user-btn')?.addEventListener('click', async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error al cerrar sesión:', error.message);
        }
        // main.js se encargará de la redirección
        mobileMenu.classList.add('hidden');
    });

    // Cerrar el menú al hacer clic en el botón de cierre (asumiendo que tiene la clase .mobile-sheet-close)
    document.querySelector('.mobile-sheet-close')?.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
}