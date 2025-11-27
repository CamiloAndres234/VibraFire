// src/main.js
import { supabase } from './supabase.js';
import { initTuMusicaUI } from './uiEvents.js'; 
import { mostrarLogin, mostrarMenuMas } from './login.js'; 
import { inicializarActividades } from './mvp.js'; // Función clave
import { mostrarUser } from './user.js';
import { cargarDatosAdmin } from './admin.js'; 

// ----------------------------------------------------------------------
// 1. Funciones de Orquestación y Navegación
// ----------------------------------------------------------------------

/**
 * Muestra una pantalla específica y ejecuta su lógica de inicialización.
 */
export function navigateToAppScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    const navItems = document.querySelectorAll('.nav-item');
    const targetScreenEl = document.getElementById(`${screenId}-screen`);

    screens.forEach(s => s.style.display = 'none');
    navItems.forEach(n => n.classList.remove('active'));

    if (targetScreenEl) {
        targetScreenEl.style.display = 'block';
        
        const targetNavItem = document.querySelector(`.nav-item[data-screen="${screenId}"]`);
        if (targetNavItem) targetNavItem.classList.add('active');

        // Ejecutar lógica específica de la pantalla
        switch (screenId) {
            case 'home':
                break;
            case 'activities':
                // ¡IMPORTANTE! Se llama aquí para que se ejecute solo cuando se navega a esta pantalla.
                inicializarActividades(); 
                break;
            case 'profile':
                mostrarUser();
                break;
            case 'admin':
                // La lógica de admin se maneja en handleAdminNav
                break;
        }
    }
}

/**
 * Manejador especial para el ítem de navegación "Más" (data-screen="admin").
 */
function handleAdminNav(e, userRol) {
    e.preventDefault();
    const screenId = e.currentTarget.dataset.screen;
    
    if (userRol === 'admin') {
        navigateToAppScreen(screenId);
        cargarDatosAdmin(); 
    } else {
        mostrarMenuMas(); 
    }
}

/**
 * Función central que verifica el rol, maneja la UI principal y configura el nav "Más".
 */
async function handleUserAuthenticated(user) {
    const authScreen = document.getElementById('auth-screen');
    const appContainer = document.getElementById('app-container');
    const userId = user.id;

    authScreen.classList.add('hidden');
    appContainer.classList.remove('hidden');

    const { data: userData, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', userId)
        .single();

    let rol = 'user'; 
    if (!error && userData && userData.rol) {
        rol = userData.rol;
    }
    
    // Configurar el listener del botón "Más" basado en el rol
    const adminNavItem = document.querySelector('.nav-item[data-screen="admin"]');
    
    // Limpiar listeners previos
    const newAdminNavItem = adminNavItem.cloneNode(true);
    adminNavItem.parentNode.replaceChild(newAdminNavItem, adminNavItem);
    
    // Configurar nuevo listener
    newAdminNavItem.addEventListener('click', (e) => handleAdminNav(e, rol));
    
    // Redirección inicial
    if (rol === 'admin') {
        navigateToAppScreen('admin'); 
    } else {
        navigateToAppScreen('home'); 
    }
}

// ----------------------------------------------------------------------
// 2. Inicialización
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    const appContainer = document.getElementById('app-container');
    const authScreen = document.getElementById('auth-screen');

    // 1. Inyectar HTML de la UI (¡DEBE SER PRIMERO!)
    initTuMusicaUI(); 
    
    // 2. ESTADO INICIAL
    appContainer.classList.add('hidden');
    authScreen.classList.remove('hidden');
    
    // 3. Listener para clicks en el menú de navegación inferior (excepto "Más")
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.screen !== 'admin') { 
             item.addEventListener('click', (e) => {
                e.preventDefault();
                const screenId = item.dataset.screen;
                navigateToAppScreen(screenId);
            });
        }
    });

    // 4. LISTENER AUTOMÁTICO DE AUTENTICACIÓN
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            handleUserAuthenticated(session.user);
        } else if (event === 'SIGNED_OUT') {
            appContainer.classList.add('hidden');
            authScreen.classList.remove('hidden');
            mostrarLogin();
        }
    });

    // 5. Verificar sesión inicial
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        handleUserAuthenticated(session.user);
    } else {
        mostrarLogin();
    }
});