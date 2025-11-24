// src/user.js 

import { supabase } from "./supabase.js";

// La tabla de perfiles en Supabase se llama 'usuarios'.
const TABLE_NAME = "usuarios"; 

export async function mostrarUser() {
    // 1. Obtener referencias del DOM
    const nombreInput = document.getElementById("input-nombre");
    const emailInput = document.getElementById("input-email");
    const telefonoInput = document.getElementById("input-telefono"); 
    const generoSelect = document.getElementById("input-genero");
    const form = document.getElementById("profile-form");
    const statusMsg = document.getElementById("profile-status");

    // Verificar que los elementos esenciales existen
    if (!form || !nombreInput || !emailInput || !telefonoInput) {
        console.error("Error: Algunos IDs del formulario de perfil están faltando. Revisa tu HTML.");
        return;
    }

    form.style.pointerEvents = 'none';
    statusMsg.textContent = "Cargando datos...";

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        statusMsg.textContent = "⚠️ Debes iniciar sesión para ver tu perfil.";
        form.style.pointerEvents = 'auto';
        return;
    }

    // ----------------------------------------------
    // 🔹 Buscar solo las columnas que SÍ existen: 'nombre' y 'telefono'.
    // ----------------------------------------------
    const { data: profileDataArray, error } = await supabase
    .from(TABLE_NAME)
    .select("nombre, telefono") 
    .eq("id", user.id)
    .limit(1); // Limita a 1, devuelve un array

const profileData = profileDataArray && profileDataArray.length > 0 ? profileDataArray[0] : null;
    // ----------------------------------------------
    // 🔹 Rellenar campos
    // ----------------------------------------------
    
    // Rellena Nombre
    nombreInput.value = profileData?.nombre || "";

    // Rellena Teléfono
    telefonoInput.value = profileData?.telefono || ""; 
    
    // Rellena Email (desde Supabase Auth, no se edita)
    emailInput.value = user.email || "N/A";
    emailInput.disabled = true; 
    
    // NOTA: Género musical no se rellena desde Supabase porque esa columna no existe.
    // Se mantiene en el valor por defecto del HTML.

    statusMsg.textContent = ""; 
    form.style.pointerEvents = 'auto'; 

    // ----------------------------------------------
    // 🔹 Conectar el listener de Actualizar datos
    // ----------------------------------------------
    if (!form.hasAttribute('data-listener-added')) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            // Llamamos a la función de actualización. 
            // Pasamos generoSelect para que la función sepa que existe, pero su valor no se usa en el UPDATE.
            handleProfileUpdate(user, nombreInput, telefonoInput, statusMsg); 
        });
        form.setAttribute('data-listener-added', 'true');
    }
}

// Función auxiliar para manejar la actualización
async function handleProfileUpdate(user, nombreInput, telefonoInput, mensajeElement) {
    const nombre = nombreInput.value.trim();
    const telefono = telefonoInput.value.trim();
    // const genero = generoSelect.value; // Ya no se lee para evitar errores

    mensajeElement.textContent = "Guardando cambios...";

    // Solo incluimos campos que SÍ existen en tu tabla de Supabase: 'nombre' y 'telefono'.
    const updatedFields = { 
        nombre: nombre, 
        telefono: telefono
    };

    const { error: updateError } = await supabase
        .from(TABLE_NAME)
        .update(updatedFields)
        .eq("id", user.id);

    if (updateError) {
        mensajeElement.textContent = "❌ Error al actualizar: " + updateError.message;
    } else {
        mensajeElement.textContent = "✅ Datos actualizados correctamente";
        setTimeout(() => { mensajeElement.textContent = ""; }, 3000);
    }
}