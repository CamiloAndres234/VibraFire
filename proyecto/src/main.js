// =======================================
// main.js FINAL — CORREGIDO Y ESTABLE
// =======================================

import { supabase } from "./supabase.js";
import { mostrarRegistro } from "./register.js";
import { mostrarLogin } from "./login.js";
import { mostrarUser } from "./user.js";
import { mostrarAdmin } from "./admin.js";

import { inicializarActividades } from "./mvp.js";
import { initUIEvents } from "./uiEvents.js";

// ----------------------------------------
// Estado inicial de pantallas
// ----------------------------------------
const screenInitStatus = {
  profile: false,
  activities: false,
};

// ----------------------------------------
// Referencias DOM
// ----------------------------------------
const authScreen = document.getElementById("auth-screen");
const screens = document.querySelectorAll(".screen");
const navItems = document.querySelectorAll(".bottom-nav .nav-item");
const adminOverlay = document.getElementById("admin-overlay");
const closeAdminBtn = document.getElementById("close-admin");

// ----------------------------------------
// Mostrar / Ocultar App
// ----------------------------------------
function ocultarApp() {
  screens.forEach(s => (s.style.display = "none"));
  document.querySelector(".bottom-nav")?.style.setProperty("display", "none");
  document.querySelector(".mini-player")?.style.setProperty("display", "none");
}

function mostrarApp() {
  document.getElementById("home-screen")?.style.setProperty("display", "block");
  document.querySelector(".bottom-nav")?.style.setProperty("display", "flex");
  document.querySelector(".mini-player")?.style.setProperty("display", "flex");
}

// ----------------------------------------
// Pantallas AUTH
// ----------------------------------------
function cargarPantallaAuth(html = "") {
  authScreen.innerHTML = html;
  authScreen.style.display = "block";
  ocultarApp();
}

function cerrarPantallaAuth() {
  authScreen.style.display = "none";
  authScreen.innerHTML = "";
}

// ----------------------------------------
// Abrir LOGIN / REGISTRO
// ----------------------------------------
export function abrirLogin() {
  cargarPantallaAuth();
  mostrarLogin();
}

export function abrirRegistro() {
  cargarPantallaAuth();
  mostrarRegistro();
}

// ----------------------------------------
// Logout
// ----------------------------------------
export async function cerrarSesion() {
  if (!confirm("¿Seguro que deseas cerrar la sesión?")) return;

  hideAdminOverlay();

  const { error } = await supabase.auth.signOut();
  if (error) {
    alert("Error al cerrar sesión.");
    return;
  }

  screenInitStatus.profile = false;
  screenInitStatus.activities = false;

  ocultarApp();
  abrirLogin();
}

// ----------------------------------------
// Navegación entre pantallas
// ----------------------------------------
function showScreen(targetScreenId) {
  screens.forEach(s => {
    s.style.display = "none";
    s.classList.remove("active");
  });

  navItems.forEach(item => item.classList.remove("active"));

  // ADMIN OVERLAY
  if (targetScreenId === "admin") {
    adminOverlay.style.display = "block";
    setTimeout(() => {
      adminOverlay.style.transform = "translateY(0)";
    }, 10);
    return;
  }

  hideAdminOverlay();

  const target = document.getElementById(`${targetScreenId}-screen`);
  if (target) {
    target.style.display = "block";
    target.classList.add("active");
  }

  // Inicializaciones por primera vez
  if (targetScreenId === "profile" && !screenInitStatus.profile) {
    mostrarUser();
    screenInitStatus.profile = true;
  }

  if (targetScreenId === "activities" && !screenInitStatus.activities) {
    inicializarActividades();
    screenInitStatus.activities = true;
  }

  const navActive = document.querySelector(
    `.bottom-nav .nav-item[data-screen="${targetScreenId}"]`
  );
  if (navActive) navActive.classList.add("active");
}

// ----------------------------------------
// Admin Overlay
// ----------------------------------------
function hideAdminOverlay() {
  adminOverlay.style.transform = "translateY(100%)";
  setTimeout(() => {
    adminOverlay.style.display = "none";
  }, 250);
}

// ----------------------------------------
// Inicialización UI
// ----------------------------------------
let listenersInitialized = false;

function initializeUI() {
  if (listenersInitialized) return;

  // Nav inferior
  navItems.forEach(item => {
    item.addEventListener("click", e => {
      e.preventDefault();
      showScreen(item.dataset.screen);
    });
  });

  // Botón cerrar admin
  closeAdminBtn?.addEventListener("click", hideAdminOverlay);

  // Logout desde admin
  const logoutBtn = adminOverlay.querySelector(".admin-item .warning-text");
  logoutBtn?.addEventListener("click", cerrarSesion);

  // Submenús admin
  document.querySelectorAll(".submenu-toggle").forEach(t => {
    t.addEventListener("click", function () {
      const submenu = this.closest(".admin-item").querySelector(".submenu");
      this.classList.toggle("active");
      submenu.style.maxHeight = submenu.style.maxHeight ? null : submenu.scrollHeight + "px";
    });
  });

  // UI EVENTS
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

// ----------------------------------------
// Manejo del estado de sesión Supabase
// ----------------------------------------
supabase.auth.onAuthStateChange(async (_, session) => {
  if (!session) {
    ocultarApp();
    abrirLogin();
    return;
  }

  // Usuario autenticado
  cerrarPantallaAuth();

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", session.user.id)
    .single();

  initializeUI();

  if (usuario?.rol?.toLowerCase() === "admin") {
    mostrarAdmin();
    return;
  }

  mostrarApp();
  showScreen("home");
});

// ----------------------------------------
// Carga inicial al abrir la app
// ----------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    abrirLogin();
    return;
  }

  cerrarPantallaAuth();
  mostrarApp();
  initializeUI();
  showScreen("home");
});
