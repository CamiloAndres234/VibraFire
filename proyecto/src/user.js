// src/user.js

import { supabase } from "./supabase.js";

const TABLE_NAME = "usuarios";

export async function mostrarUser() {
    const nombreInput = document.getElementById("input-nombre");
    const emailInput = document.getElementById("input-email");
    const telefonoInput = document.getElementById("input-telefono");
    const form = document.getElementById("profile-form");
    const statusMsg = document.getElementById("profile-status");

    form.style.pointerEvents = 'none';
    statusMsg.textContent = "Cargando datos...";

    // Obtener usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        statusMsg.textContent = "⚠️ Debes iniciar sesión.";
        form.style.pointerEvents = 'auto';
        return;
    }

    // 1️⃣ Buscar por ID
    let { data, error } = await supabase
        .from(TABLE_NAME)
        .select("id, nombre, correo, telefono")
        .eq("id", user.id)
        .maybeSingle();

    // 2️⃣ Si No existe por ID, buscar por correo (para evitar duplicados)
    if (!data) {
        const { data: correoData } = await supabase
            .from(TABLE_NAME)
            .select("id, nombre, correo, telefono")
            .eq("correo", user.email)
            .maybeSingle();

        if (correoData) {
            data = correoData; // usar el registro existente
        }
    }

    // 3️⃣ Si NO existe por ID NI por correo → crear registro nuevo
    if (!data) {
        const { error: insertError } = await supabase
            .from(TABLE_NAME)
            .insert({
                id: user.id,
                nombre: "",
                correo: user.email,
                telefono: ""
            });

        if (insertError) {
            console.error("Error creando perfil:", insertError);
            statusMsg.textContent = "❌ Error creando perfil.";
            return;
        }

        // obtener después de insertar
        const { data: newData } = await supabase
            .from(TABLE_NAME)
            .select("id, nombre, correo, telefono")
            .eq("id", user.id)
            .single();

        data = newData;
    }

    // 4️⃣ Mostrar datos
    nombreInput.value = data.nombre || "";
    telefonoInput.value = data.telefono || "";
    emailInput.value = user.email;
    emailInput.disabled = true;

    statusMsg.textContent = "";
    form.style.pointerEvents = 'auto';

    // Actualizar
    if (!form.hasAttribute("data-listener-added")) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            handleProfileUpdate(user.id, nombreInput, telefonoInput, statusMsg);
        });
        form.setAttribute("data-listener-added", "true");
    }
}

// Actualizar perfil
async function handleProfileUpdate(userId, nombreInput, telefonoInput, mensajeElement) {
    const nombre = nombreInput.value.trim();
    const telefono = telefonoInput.value.trim();

    mensajeElement.textContent = "Guardando cambios...";

    const { error } = await supabase
        .from("usuarios")
        .update({ nombre, telefono })
        .eq("id", userId);

    if (error) {
        mensajeElement.textContent = "❌ Error al actualizar: " + error.message;
    } else {
        mensajeElement.textContent = "✅ Datos actualizados correctamente";
        setTimeout(() => mensajeElement.textContent = "", 3000);
    }
}
