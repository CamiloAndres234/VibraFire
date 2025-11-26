// src/main.js
import { supabase } from "./supabase.js";
import { mostrarRegistro } from "./register.js";
import { mostrarLogin } from "./login.js";
import { mostrarUser } from "./user.js";
import { mostrarAdmin } from "./admin.js";

import { inicializarActividades } from "./mvp.js";
import { initUIEvents } from "./uiEvents.js";

//eSRTADO DE CARGA DE PANALLA
const screenInitStatus = {
  profile: false,
  activities: false,
};

//rEFERENCIAS dom
const authScreen = document.getElementById("auth-screen");
const screens = document.querySelectorAll(".screen");
const navItems = document.querySelectorAll(".bottom-nav .nav-item");
const adminOverlay = document.getElementById("admin-overlay");
const closeAdminBtn = document.getElementById("close-admin");

//Mostrar Ocultar APP
function ocultarApp() {
  screens.forEach(s => (s.style.display = "none"));
  const bottomNav = document.querySelector(".bottom-nav");
  if (bottomNav) bottomNav.style.display = "none";
  const miniPlayer = document.querySelector(".mini-player");
  if (miniPlayer) miniPlayer.style.display = "none";
}

function mostrarApp() {
  const home = document.getElementById("home-screen");
  if (home) home.style.display = "block";
  const bottomNav = document.querySelector(".bottom-nav");
  if (bottomNav) bottomNav.style.display = "flex";
  const miniPlayer = document.querySelector(".mini-player");
  if (miniPlayer) miniPlayer.style.display = "flex";
}

function cargarPantallaAuth(html = "") {
  authScreen.innerHTML = html;
  authScreen.classList.remove("hidden");
  authScreen.style.display = "block";
  ocultarApp();
}

function cerrarPantallaAuth() {
  authScreen.classList.add("hidden");
  authScreen.style.display = "none";
}

//Login Registro y Loout
export async function abrirLogin() {
  cargarPantallaAuth();
  mostrarLogin();
}

export async function abrirRegistro() {
  cargarPantallaAuth();
  mostrarRegistro();
}

export async function cerrarSesion() {
  if (!confirm("¿Estás seguro de que quieres cerrar la sesión?")) return;

  hideAdminOverlay();

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error al cerrar sesión:", error.message);
    alert("Ocurrió un error al intentar cerrar sesión. Inténtalo de nuevo.");
    return;
  }

  screenInitStatus.profile = false;
  screenInitStatus.activities = false;

  ocultarApp();
  abrirLogin();
}

//Navegascion y pantallas
function showScreen(targetScreenId) {
  screens.forEach(screen => {
    screen.style.display = "none";
    screen.classList.remove("active");
  });
  navItems.forEach(item => item.classList.remove("active"));

  // Admin overlay
  if (targetScreenId === "admin") {
    if (adminOverlay) {
      adminOverlay.style.display = "block";
      setTimeout(() => (adminOverlay.style.transform = "translateY(0)"), 10);
    }
    return;
  }

  hideAdminOverlay();

  const targetScreen = document.getElementById(`${targetScreenId}-screen`);
  if (targetScreen) {
    targetScreen.style.display = "block";
    targetScreen.classList.add("active");

    // Carga condicional
    if (targetScreenId === "profile" && !screenInitStatus.profile) {
      mostrarUser();
      screenInitStatus.profile = true;
    }
    if (targetScreenId === "activities" && !screenInitStatus.activities) {
      inicializarActividades();
      screenInitStatus.activities = true;
    }
  }

  // Activar nav
  const activeNavItem = document.querySelector(`.bottom-nav .nav-item[data-screen="${targetScreenId}"]`);
  if (activeNavItem) activeNavItem.classList.add("active");
}

function hideAdminOverlay() {
  if (!adminOverlay) return;
  adminOverlay.style.transform = "translateY(100%)";
  setTimeout(() => (adminOverlay.style.display = "none"), 300);
}

//Inicuallixacio principal
let listenersInitialized = false;

function initializeUI() {
  if (listenersInitialized) return;

  // Navegación inferior
  navItems.forEach(item => {
    item.addEventListener("click", e => {
      e.preventDefault();
      const screenId = item.getAttribute("data-screen");
      if (!screenId) return;
      showScreen(screenId);
    });
  });

  // Botón cerrar overlay admin
  if (closeAdminBtn) closeAdminBtn.addEventListener("click", hideAdminOverlay);

  // Botón cerrar sesión en overlay admin
  if (adminOverlay) {
    const logoutBtn = adminOverlay.querySelector(".admin-item .warning-text");
    if (logoutBtn) logoutBtn.addEventListener("click", cerrarSesion);
  }

  // Submenus
  document.querySelectorAll(".submenu-toggle").forEach(toggle => {
    toggle.addEventListener("click", function () {
      const submenu = this.closest(".admin-item").querySelector(".submenu");
      this.classList.toggle("active");
      if (submenu.style.maxHeight) submenu.style.maxHeight = null;
      else submenu.style.maxHeight = submenu.scrollHeight + "px";
    });
  });

  // Inicializar uiEvents (sin duplicar nav)
  initUIEvents({
    handleNav: false,
    navSelector: ".bottom-nav .nav-item",
    screensSelector: ".screen",
    adminOverlayId: "admin-overlay",
    mobileMenuId: "mobile-menu",
    mobileMenuContentId: "mobile-menu-content",
    mobileSheetCloseSelector: ".mobile-sheet-close",
    localStoragePrefix: "musicApp",
    mobileBreakpoint: 640,
  });

  listenersInitialized = true;
}

//Creae estado inicuial
export async function cargarMenu() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    ocultarApp();
    abrirLogin();
    return;
  }

  cerrarPantallaAuth();
  mostrarApp();

  // Mostrar home por defecto
  showScreen("home");

  // Inicializar UI
  initializeUI();
}

//Auto iniciar
document.addEventListener("DOMContentLoaded", cargarMenu);
