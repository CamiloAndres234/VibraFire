import { supabase } from './supabase.js';
import { mostrarLogin } from './login.js';

export function mostrarRegistro() {
    const app = document.getElementById('auth-screen');
    app.style.display = "block";

    //UI DEL REGISTRO (mejorada)
    app.innerHTML = `
        <section class="p-6 flex flex-col items-center text-center">

            <!-- Imagen superior -->
            <img 
                src="https://i.pinimg.com/736x/b9/23/c7/b923c758828638ecdc73722bc2818d89.jpg"
                class="w-40 h-40 rounded-full shadow-xl border-4 border-[var(--color-bright-orange)] mb-4"
            />

            <!-- Frase motivacional -->
            <p class="text-lg text-[var(--color-soft-orange)] font-semibold mb-6">
                La música te acompaña, ahora tu historia comienza aquí 🎵
            </p>

            <!-- Título -->
            <h2 class="text-3xl font-bold mb-4">Registro de Cuenta</h2>

            <!-- FORMULARIO -->
            <form id="registro-form" class="space-y-4 w-full max-w-sm mb-4">

                <input type="text" name="nombre" placeholder="Nombre completo" class="form-input w-full"/>

                <input type="email" name="correo" placeholder="Correo electrónico" class="form-input w-full"/>

                <!-- Campo contraseña con botón ver/ocultar -->
                <div class="relative">
                    <input 
                        type="password" 
                        name="password" 
                        id="password-input"
                        placeholder="Contraseña" 
                        class="form-input w-full pr-12"
                    />

                    <!-- ICONO (ojo) -->
                    <button 
                        type="button" 
                        id="toggle-pass"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition"
                    >
                        <!-- ojo cerrado (default) -->
                        <svg id="icon-eye-closed" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="">
                            <path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12zm11 5a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/>
                        </svg>

                        <!-- ojo abierto (oculto) -->
                        <svg id="icon-eye-open" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="hidden">
                            <path d="M12 5C5 5 1 12 1 12s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
                        </svg>
                    </button>
                </div>

                <input type="text" name="telefono" placeholder="Teléfono" class="form-input w-full"/>

                <button type="submit" class="custom-btn w-full">Registrarse</button>
            </form>

            <!-- Botón volver -->
            <button id="volver-login" class="text-sm text-center w-full py-2 text-gray-400 hover:text-[var(--color-bright-orange)] transition duration-150">
                ¿Ya tienes cuenta? Iniciar sesión
            </button>

            <!-- Error -->
            <p id="error" class="warning-text mt-2 text-sm"></p>

        </section>
    `;

    // SISTEMA DE VER/OCULTAR CONTRASEÑA
    const passInput = document.getElementById("password-input");
    const togglePass = document.getElementById("toggle-pass");

    const iconClosed = document.getElementById("icon-eye-closed");
    const iconOpen = document.getElementById("icon-eye-open");

    togglePass.addEventListener("click", () => {
        const showing = passInput.type === "text";

        // Cambiar tipo
        passInput.type = showing ? "password" : "text";

        // Cambiar iconos
        iconClosed.classList.toggle("hidden", !showing);
        iconOpen.classList.toggle("hidden", showing);
    });

    //LÓGICA DEL FORMULARIO
    const form = document.getElementById('registro-form');
    const errorMsg = document.getElementById('error');
    const loginBtn = document.getElementById('volver-login');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.textContent = '';

        const nombre = form.nombre.value.trim();
        const correo = form.correo.value.trim();
        const password = form.password.value.trim();
        const telefono = form.telefono.value.trim();

        if (!nombre || !correo || !password) {
            errorMsg.textContent = 'Por favor completa todos los campos obligatorios.';
            return;
        }    
// Crear usuario en Auth
        const { data: dataAuth, error: errorAuth } = await supabase.auth.signUp({
            email: correo,
            password: password,
        });

        if (errorAuth) {
            errorMsg.textContent = `Error en autenticación: ${errorAuth.message}`;
            return;
        }

        const uid = dataAuth.user?.id;
        if (!uid) {
            errorMsg.textContent = 'No se pudo obtener el ID del usuario.';
            return;
        }

        // Guardar datos en la tabla usuarios
        const { error: errorInsert } = await supabase.from('usuarios').insert([
            { id: uid, nombre, correo, telefono }
        ]);

        if (errorInsert) {
            errorMsg.textContent = 'Error guardando datos: ' + errorInsert.message;
            return;
        }

        alert('Registro exitoso. Revisa tu correo para verificar la cuenta.');
        mostrarLogin();
    });

    loginBtn.addEventListener('click', () => {
        mostrarLogin();
    });
}