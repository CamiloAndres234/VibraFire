// src/user.js
import { supabase } from "./supabase.js";

const TABLE_NAME = "usuarios";

export async function mostrarUser() {
    // Obtener elementos del DOM
    const nombreInput = document.getElementById("input-nombre");
    const emailInput = document.getElementById("input-email");
    const telefonoInput = document.getElementById("input-telefono");
    const form = document.getElementById("profile-form");
    const statusMsg = document.getElementById("profile-status");

    if (!form || !nombreInput || !emailInput || !telefonoInput) {
        console.error("Error: faltan IDs del formulario.");
        return;
    }

    form.style.pointerEvents = "none";
    statusMsg.textContent = "Cargando datos...";

    // Obtener usuario logueado
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        statusMsg.textContent = "⚠️ Debes iniciar sesión.";
        form.style.pointerEvents = "auto";
        return;
    }

    // Consultar su perfil en la tabla usuarios
    const { data: perfilArray, error } = await supabase
        .from(TABLE_NAME)
        .select("nombre, correo, telefono, creado_en")
        .eq("id", user.id)
        .limit(1);

    const perfil = perfilArray?.[0] || null;

    if (error || !perfil) {
        statusMsg.textContent = "⚠️ No se pudo cargar tu información.";
        console.error(error);
        form.style.pointerEvents = "auto";
        return;
    }

    // Cargar datos en pantalla
    nombreInput.value = perfil.nombre || "";
    telefonoInput.value = perfil.telefono || "";
    emailInput.value = perfil.correo || user.email || "";
    emailInput.disabled = true; // correo no se debe editar

    statusMsg.textContent = "";
    form.style.pointerEvents = "auto";

    // Listener del botón Guardar (solo una vez)
    if (!form.dataset.listenerAdded) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            actualizarPerfil(user.id, nombreInput.value, telefonoInput.value, statusMsg);
        });

        form.dataset.listenerAdded = "true";
    }
}

// -------- ACTUALIZAR DATOS -------- //
async function actualizarPerfil(uid, nombre, telefono, statusMsg) {
    statusMsg.textContent = "Guardando cambios...";

    const { error } = await supabase
        .from(TABLE_NAME)
        .update({
            nombre,
            telefono,
        })
        .eq("id", uid);

    if (error) {
        statusMsg.textContent = "❌ Error al actualizar: " + error.message;
        return;
    }

    statusMsg.textContent = "✅ Datos actualizados correctamente";
    setTimeout(() => (statusMsg.textContent = ""), 3000);
}
