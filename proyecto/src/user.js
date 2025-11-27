// src/user.js

import { supabase } from "./supabase.js";
// Asumo que mostrarPantalla existe en main.js o que la navegación ya está hecha
// Si mostrarUser() se llama desde el menú, la pantalla ya debería estar visible.

const TABLE_NAME = "usuarios";
const SCREEN_ID = "profile-screen"; // ID del contenedor de la pantalla de perfil

export async function mostrarUser() {
    
    // 1. Obtener la pantalla y sus elementos
    const profileScreen = document.getElementById(SCREEN_ID);
    if (!profileScreen) {
        console.error(`Contenedor #${SCREEN_ID} no encontrado.`);
        return;
    }
    
    // Asumimos que estos IDs existen dentro del HTML de #profile-screen 
    // (inyectado previamente por tuMusicaUI.js)
    const nombreInput = document.getElementById("input-nombre");
    const emailInput = document.getElementById("input-email");
    const telefonoInput = document.getElementById("input-telefono");
    const form = document.getElementById("profile-form");
    const statusMsg = document.getElementById("profile-status");
    
    if (!form || !statusMsg) {
        console.error("Elementos clave del formulario de perfil no encontrados.");
        return;
    }

    // Mostrar el contenedor de perfil (si no lo está ya)
    // Nota: Esto ya debería ser manejado por main.js/tuMusicaUI.js si se llama desde el menú.
    // profileScreen.style.display = 'block'; 

    form.style.pointerEvents = 'none';
    statusMsg.textContent = "Cargando datos...";

    // Obtener usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        statusMsg.textContent = "⚠️ Debes iniciar sesión.";
        form.style.pointerEvents = 'auto';
        return;
    }
    
    // --- Lógica de Carga y Creación de Perfil ---
    
    // 1️⃣ Buscar por ID
    let { data, error } = await supabase
        .from(TABLE_NAME)
        .select("id, nombre, correo, telefono")
        .eq("id", user.id)
        .maybeSingle();

    // 2️⃣ Si NO existe por ID, buscar por correo 
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
                nombre: "", // Lo dejamos vacío para que el usuario lo llene
                correo: user.email,
                telefono: "",
                rol: "user" // Aseguramos que tenga un rol por defecto
            });

        if (insertError) {
            console.error("Error creando perfil:", insertError);
            statusMsg.textContent = "❌ Error creando perfil. Intenta de nuevo.";
            return;
        }

        // Obtener después de insertar para llenar los inputs
        const { data: newData } = await supabase
            .from(TABLE_NAME)
            .select("id, nombre, correo, telefono")
            .eq("id", user.id)
            .single();

        data = newData;
    }

    // 4️⃣ Mostrar datos en los inputs
    nombreInput.value = data.nombre || "";
    telefonoInput.value = data.telefono || "";
    emailInput.value = user.email;
    emailInput.disabled = true; // El email de Auth no se puede cambiar aquí.

    statusMsg.textContent = "";
    form.style.pointerEvents = 'auto';

    // --- Lógica de Actualización (Listener) ---
    // Usamos el flag data-listener-added para evitar duplicar el evento en cada llamada
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
        // Recargar datos para reflejar posibles cambios (aunque no es estrictamente necesario aquí)
        // Opcional: mostrarUser(); 
        setTimeout(() => mensajeElement.textContent = "", 3000);
    }
}