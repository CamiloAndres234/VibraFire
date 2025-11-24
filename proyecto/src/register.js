import { supabase } from './supabase.js';
import { mostrarLogin } from './login.js';

export function mostrarRegistro() {
    const app = document.getElementById('auth-screen');
    app.style.display = "block";

    // UI DEL FORMULARIO
    app.innerHTML = `
        <section class="p-6">
            <h2 class="text-2xl font-bold mb-4">Registro de Estudiante</h2>

            <form id="registro-form" class="space-y-4 mb-4">
                <input type="text" name="nombre" placeholder="Nombre" class="form-input w-full"/>
                <input type="email" name="correo" placeholder="Correo" class="form-input w-full"/>
                <input type="password" name="password" placeholder="Contraseña" class="form-input w-full"/>
                <input type="text" name="telefono" placeholder="Teléfono" class="form-input w-full"/>

                <button type="submit" class="custom-btn w-full">Registrarse</button>
            </form>

            <button id="volver-login" class="text-sm text-center w-full py-2 text-gray-600 hover:text-blue-500 transition duration-150">
                ¿Ya tienes cuenta? Volver a Iniciar Sesión
            </button>

            <p id="error" class="warning-text mt-2"></p>
        </section>
    `;

    const form = document.getElementById('registro-form');
    const errorMsg = document.getElementById('error');
    const loginBtn = document.getElementById('volver-login');

    // EVENTO DEL REGISTRO
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

        // Crear cuenta en supabase auth
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

        // Insertar datos en la tabla correcta: "usuarios"
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

    // BOTÓN VOLVER A LOGIN
    loginBtn.addEventListener('click', () => {
        mostrarLogin();
    });
}
