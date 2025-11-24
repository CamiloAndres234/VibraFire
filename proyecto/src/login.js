// src/login.js
import { supabase } from './supabase.js';
import { mostrarRegistro } from './register.js'; 
// Asegúrate de que 'mostrarRegistro' esté disponible si se usa en el mismo archivo.

export function mostrarLogin() {

    const app = document.getElementById('auth-screen');
    app.style.display = "block"; // Asegura que la pantalla de autenticación esté visible

    // ******* UI: Renderizado del formulario (Usando tus clases de estilo) *******
    app.innerHTML = `
        <section class="p-6">
            <h2 class="text-2xl font-bold mb-4">Iniciar Sesión</h2>
            
            <form id="login-form" class="space-y-4">
                <input 
                    type="email" 
                    name="correo" 
                    placeholder="Correo" 
                    required 
                    class="form-input w-full"
                />
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Contraseña" 
                    required 
                    class="form-input w-full"
                />
                <button type="submit" class="custom-btn w-full">Ingresar</button>
            </form>
            
            <p id="error" class="warning-text mt-2"></p> 
            
            <button id="ir-registro" class="text-sm text-center w-full py-2 text-gray-600 hover:text-blue-500 transition duration-150 mt-4">
                ¿No tienes cuenta? Crear cuenta
            </button>
        </section>
    `;

    const form = document.getElementById('login-form');
    const errorMsg = document.getElementById('error');
    const irRegistro = document.getElementById('ir-registro');

    // Manejo del evento: Ir al registro
    irRegistro.addEventListener('click', () => {
        // Llama a la función para cambiar la vista de la app a Registro
        mostrarRegistro();
    });

    // ******* Lógica: Manejo del Evento de Login (Supabase) *******
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.textContent = '';

        const correo = form.correo.value.trim();
        const password = form.password.value.trim();

        if (!correo || !password) {
            errorMsg.textContent = 'Por favor completa todos los campos.';
            return;
        }

        // 🔐 Iniciar sesión (Lógica de Auth de Supabase)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: correo,
            password: password,
        });

        if (error) {
            // Se usa la clase 'warning-text' para el mensaje de error
            errorMsg.textContent = 'Error al iniciar sesión: ' + error.message;
            return;
        }

        // ✅ Usuario autenticado correctamente
        console.log("Usuario logueado:", data.user);

        // Recarga la app para que la lógica principal (ej. main.js) detecte
        // la sesión activa y muestre el contenido del usuario.
        location.reload(); 
    });
}