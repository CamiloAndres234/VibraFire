// src/login.js
import { supabase } from './supabase.js';
import { mostrarRegistro } from './register.js';
import { mostrarAdmin } from './admin.js';
import { mostrarUser } from './user.js';

export function mostrarLogin() {
    const authScreen = document.getElementById('auth-screen');
    authScreen.style.display = "block";

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
                    <input type="password" name="password" id="password-login-input"
                           placeholder="Contraseña" required class="form-input w-full pr-12" />

                    <button type="button" id="toggle-login-pass"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition">
                        <svg id="login-eye-closed" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zm11 5a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/>
                        </svg>
                        <svg id="login-eye-open" xmlns="http://www.w3.org/2000/svg" width="22" height="22" class="hidden">
                            <path d="M12 5C5 5 1 12 1 12s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
                        </svg>
                    </button>
                </div>

                <button type="submit" class="custom-btn w-full">Ingresar</button>
            </form>

            <p id="error" class="warning-text mt-2"></p>

            <button id="ir-registro" class="text-sm text-gray-400 hover:text-[var(--color-bright-orange)] transition mt-4">
                ¿No tienes cuenta? Crear cuenta
            </button>
        </section>
    `;

    // ===================================================
    //     TOGGLE DE CONTRASEÑA
    // ===================================================
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

    // ===================================================
    //     IR A REGISTRO
    // ===================================================
    document.getElementById('ir-registro').addEventListener('click', () => {
        mostrarRegistro();
    });

    // ===================================================
    //     LOGIN REAL COMPLETO
    // ===================================================
    const form = document.getElementById('login-form');
    const errorMsg = document.getElementById('error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.textContent = '';

        const correo = form.correo.value.trim();
        const password = form.password.value.trim();

        // === LOGIN EN SUPABASE ===
        const { error } = await supabase.auth.signInWithPassword({
            email: correo,
            password
        });

        if (error) {
            errorMsg.textContent = 'Error al iniciar sesión: ' + error.message;
            return;
        }

        // === OBTENER USUARIO AUTENTICADO ===
        const { data: userData } = await supabase.auth.getUser();
        const usuario = userData.user;

        // === BUSCAR ROL EN TABLA `usuarios` ===
        const { data: usuarioActual, error: rolError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('correo', usuario.email)
            .single();

        if (rolError || !usuarioActual) {
            errorMsg.textContent = 'No se pudo obtener el rol del usuario.';
            return;
        }

        // === OCULTAR LOGIN ===
        authScreen.style.display = 'none';

        // === REDIRECCIÓN POR ROL ===
        if (usuarioActual.rol?.toLowerCase() === 'admin') {
            mostrarAdmin();
        } else {
            mostrarUser();
        }
    });
}
