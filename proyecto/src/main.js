// src/main.js
import { supabase } from "./supabase.js";
import { mostrarRegistro } from "./register.js";
import { mostrarLogin } from "./login.js";
import { mostrarUser } from "./user.js";
import { mostrarAdmin } from "./admin.js";

import { inicializarActividades } from "./mvp.js";

// 💡 Mapa para controlar si el contenido de una pantalla ya fue cargado con data de Supabase
const screenInitStatus = {
    'profile': false,
    'activities': false, // Nuevo: Estado para la pantalla de Actividades
};

// Elementos de la UI
const authScreen = document.getElementById("auth-screen");
const screens = document.querySelectorAll('.screen');
const navItems = document.querySelectorAll('.bottom-nav .nav-item');
const adminOverlay = document.getElementById('admin-overlay');
const closeAdminBtn = document.getElementById('close-admin');

// -----------------------------
// 🔥 Mostrar y ocultar la app principal
// -----------------------------
function ocultarAppBonita() {
    document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
    // Oculta navegación y reproductor
    document.querySelector(".bottom-nav").style.display = "none";
    document.querySelector(".mini-player").style.display = "none";
}

function mostrarAppBonita() {
    // Solo mostramos el 'home-screen' inicialmente
    document.getElementById("home-screen").style.display = "block";
    // Muestra navegación y reproductor
    document.querySelector(".bottom-nav").style.display = "flex";
    document.querySelector(".mini-player").style.display = "flex";
}

// -----------------------------
// 🔥 Pantalla de Autenticación
// -----------------------------

// Cargar contenido dentro del overlay
function cargarPantallaAuth(html) {
    authScreen.innerHTML = html;
    authScreen.classList.remove("hidden");
    // Usamos el display block/none para el overlay de auth-screen
    authScreen.style.display = "block"; 
    ocultarAppBonita();
}

function cerrarPantallaAuth() {
    authScreen.classList.add("hidden");
    authScreen.style.display = "none"; 
}

// -----------------------------
// 🔐 LOGIN, REGISTRO, LOGOUT
// -----------------------------
export async function abrirLogin() {
    cargarPantallaAuth("");
    mostrarLogin(); // esta función modifica el div #auth-screen
}

export async function abrirRegistro() {
    cargarPantallaAuth("");
    mostrarRegistro(); // esta función modifica el div #auth-screen
}

export async function CerrarSesion() {
    if (!confirm('¿Estás seguro de que quieres cerrar la sesión?')) {
        return; 
    }
    
    hideAdminOverlay(); 

    const { error } = await supabase.auth.signOut();
    
    if (error) {
        console.error('Error al cerrar sesión:', error.message);
        alert('Ocurrió un error al intentar cerrar sesión. Inténtalo de nuevo.');
        return;
    }
    
    // 💡 REINICIAR ESTADOS AL CERRAR SESIÓN
    screenInitStatus.profile = false;
    screenInitStatus.activities = false; 

    ocultarAppBonita();
    abrirLogin();
}

// -------------------------------------------------------------------
// 🔥 LÓGICA DE NAVEGACIÓN DE LA APP (Modificada)
// -------------------------------------------------------------------

/**
 * Muestra la pantalla de la aplicación basada en el atributo data-screen.
 * @param {string} targetScreenId - ID base de la pantalla (ej: 'home', 'activities').
 */
function showScreen(targetScreenId) {
    // 1. Oculta todas las pantallas y desactiva todos los botones de navegación
    screens.forEach(screen => {
        screen.style.display = 'none';
        screen.classList.remove('active');
    });
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // 2. Manejo especial para el overlay "Más Opciones"
    if (targetScreenId === 'admin') {
        adminOverlay.style.display = 'block';
        setTimeout(() => {
            adminOverlay.style.transform = 'translateY(0)';
        }, 10);
        return;
    }
    
    hideAdminOverlay(); 

    // 3. Muestra la pantalla normal
    const targetScreen = document.getElementById(targetScreenId + '-screen');
    if (targetScreen) {
        targetScreen.style.display = 'block';
        targetScreen.classList.add('active');
        
        // **🚨 LÓGICA DE CARGA DE DATOS CONDICIONAL**
        
        // Carga de datos de Perfil
        if (targetScreenId === 'profile' && !screenInitStatus.profile) {
            mostrarUser(); // Llama a la función para cargar datos de Supabase
            screenInitStatus.profile = true;
        }
        
        // 💡 Carga de datos de Actividades (Historia de escucha)
        if (targetScreenId === 'activities' && !screenInitStatus.activities) {
            inicializarActividades(); // Llama a la nueva función para cargar datos
            screenInitStatus.activities = true;
        }
    }

    // 4. Activa el botón de navegación correspondiente
    const activeNavItem = document.querySelector(`.bottom-nav .nav-item[data-screen="${targetScreenId}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
}
/**
 * Oculta el overlay de Más Opciones.
 */
function hideAdminOverlay() {
    // Animación de deslizamiento hacia abajo
    adminOverlay.style.transform = 'translateY(100%)';
    setTimeout(() => {
        adminOverlay.style.display = 'none';
    }, 300); // Duración debe coincidir con la transición CSS
}

// -----------------------------
// 🧭 Cargar estado inicial
// -----------------------------
export async function cargarMenu() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        ocultarAppBonita();
        abrirLogin();
        return;
    }

    // Usuario logueado → mostrar app
    cerrarPantallaAuth();
    mostrarAppBonita(); // Muestra el home-screen y las barras

    // Activar el home por defecto y asegurarse de que se muestre
    showScreen('home'); // Usamos la nueva función de navegación para inicializar

    // Agregar los event listeners de navegación si aún no se han agregado
    initializeNavigationListeners(); 
}

// -----------------------------
// 🎧 Inicializar Eventos
// -----------------------------

let listenersInitialized = false;

function initializeNavigationListeners() {
    if (listenersInitialized) return;

    // A. Navegación (Botones inferiores)
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetScreen = item.getAttribute('data-screen');
            showScreen(targetScreen);
        });
    });

    // B. Cerrar el Overlay de "Más"
    closeAdminBtn.addEventListener('click', hideAdminOverlay);

    // C. Conectar el botón "Cerrar sesión" en el overlay de "Más"
    const logoutBtn = adminOverlay.querySelector('.admin-item .warning-text');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', CerrarSesion);
    }
    
    // D. Implementar la funcionalidad de submenús (opcional)
    document.querySelectorAll('.submenu-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const submenu = this.closest('.admin-item').querySelector('.submenu');
            this.classList.toggle('active');
            if (submenu.style.maxHeight) {
                submenu.style.maxHeight = null;
            } else {
                submenu.style.maxHeight = submenu.scrollHeight + "px";
            }
        });
    });

    listenersInitialized = true;
}


// -----------------------------
// 🚀 Inicializar al cargar
// -----------------------------
document.addEventListener("DOMContentLoaded", cargarMenu);