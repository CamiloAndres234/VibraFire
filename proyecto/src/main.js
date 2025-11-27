// ===========================
//      IMPORTS
// ===========================
import { supabase } from "./supabase.js";
import { mostrarLogin } from "./login.js";
import { mostrarRegistro } from "./register.js";
import { mostrarAdmin } from "./admin.js";
import { mostrarUser } from "./user.js";
import { inicializarActividades } from "./mvp.js";  // CORREGIDO: import de MVP


// ===========================
//      NAVEGACIÓN GENERAL
// ===========================
function ocultarTodasLasPantallas() {
    document.querySelectorAll(".screen").forEach(s => s.style.display = "none");

    const auth = document.getElementById("auth-screen");
    if (auth) auth.style.display = "none";
}


// ===========================
//      MOSTRAR POR ROL
// ===========================
async function cargarSegunRol() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
        ocultarTodasLasPantallas();
        mostrarLogin();
        return;
    }

    const { data: registro } = await supabase
        .from("usuarios")
        .select("*")
        .eq("correo", user.email)
        .single();

    if (!registro) {
        ocultarTodasLasPantallas();
        mostrarLogin();
        return;
    }

    ocultarTodasLasPantallas();

    if (registro.rol?.toLowerCase() === "admin") {
        mostrarAdmin();
    } else {
        mostrarUser();
    }
}


// ===========================
//      LISTENER DEL MENU
// ===========================
function configurarMenuInferior() {
    document.querySelectorAll(".nav-item").forEach(btn => {
        btn.addEventListener("click", () => {
            const destino = btn.dataset.screen;

            ocultarTodasLasPantallas();

            switch (destino) {
                case "home":
                    inicializarActividades();  // CORREGIDO: llamar a la función correcta
                    break;
                case "perfil":
                    mostrarUser();
                    break;
                case "admin":
                    mostrarAdmin();
                    break;
                case "login":
                    mostrarLogin();
                    break;
                case "registro":
                    mostrarRegistro();
                    break;
            }
        });
    });
}


// ===========================
//      INICIO DEL SISTEMA
// ===========================
window.addEventListener("DOMContentLoaded", async () => {
    console.log("🔥 App iniciando…");

    configurarMenuInferior();  // habilita navegación
    await cargarSegunRol();    // decide qué mostrar
});
