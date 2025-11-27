// src/tuMusicaUI.js
import { supabase } from './supabase.js';

// ----------------------------------------------------------------------
// 1. HTML de la Aplicación (body)
// ----------------------------------------------------------------------

const appHTML = `
  <div id="home-screen" class="screen active" style="display:block;">
    <div class="gradient-header p-6 flex flex-col justify-end">
      <h1 class="text-3xl font-bold mb-2">TuMusica</h1>
      <p class="text-white opacity-80">Bienvenido de nuevo</p>
    </div>

    <div class="content-area px-4 py-6">
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Para ti</h2>
          <a href="javascript:void(0)" class="text-sm text-bright-orange">Ver todo</a>
        </div>

        <div class="overflow-x-auto pb-4 hide-scrollbar">
          <div class="flex space-x-4" style="min-width: max-content;">
            <div class="card w-48">
              <div class="relative">
                <img src="https://cdn.pixabay.com/photo/2018/06/30/09/29/monkey-3507317_1280.jpg" alt="Album Cover" class="w-full h-40 object-cover">
                <div class="absolute bottom-2 right-2">
                  <div class="play-button"><i class="fas fa-play text-white"></i></div>
                </div>
                <div class="menu-trigger recommendation-menu-trigger"><i class="fas fa-ellipsis-v"></i></div>
              </div>
              <div class="p-3">
                <h3 class="font-medium">Nuevo Lanzamiento</h3>
                <p class="text-sm text-gray-400">Artista Popular</p>
              </div>
            </div>
            
            <div class="card w-48">
              <div class="relative">
                <img src="https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083377_1280.jpg" alt="Album Cover" class="w-full h-40 object-cover">
                <div class="absolute bottom-2 right-2"><div class="play-button"><i class="fas fa-play text-white"></i></div></div>
              </div>
              <div class="p-3">
                <h3 class="font-medium">Mix del Día</h3>
                <p class="text-sm text-gray-400">Varios Artistas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Tus listas</h2>
          <a href="javascript:void(0)" class="text-sm text-bright-orange">Editar</a>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div class="card">
            <div class="relative">
              <img src="https://cdn.pixabay.com/photo/2017/11/11/18/31/music-2939936_1280.jpg" alt="Playlist Cover" class="w-full h-36 object-cover">
              <div class="menu-trigger playlist-menu-trigger"><i class="fas fa-ellipsis-v"></i></div>
            </div>
            <div class="p-3">
              <h3 class="font-medium">Favoritas</h3>
              <p class="text-sm text-gray-400">32 canciones</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="activities-screen" class="screen" style="display:none;">
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Registrar Actividad Musical</h1>
      <form id="activity-form" class="space-y-4">
        <input type="text" name="title" placeholder="¿Qué escuchaste?" class="form-input w-full">
        <input type="text" name="artist" placeholder="Nombre del artista" class="form-input w-full">
        <input type="text" name="image-url" placeholder="URL de la carátula (Opcional)" class="form-input w-full">
        <select id="select-playlist" class="form-input w-full">
          <option value="">Seleccionar playlist...</option>
        </select>
        <div id="star-rating-container" class="flex space-x-2">
          <i class="fas fa-star text-gray-400 cursor-pointer"></i>
          <i class="fas fa-star text-gray-400 cursor-pointer"></i>
          <i class="fas fa-star text-gray-400 cursor-pointer"></i>
          <i class="fas fa-star text-gray-400 cursor-pointer"></i>
          <i class="fas fa-star text-gray-400 cursor-pointer"></i>
        </div>
        <button type="submit" id="save-activity-btn" class="custom-btn w-full">Guardar Actividad</button>
      </form>
      <h2 class="text-xl font-bold mt-6 mb-2">Tus actividades</h2>
      <div id="lista-actividades-contenedor" class="mt-4"></div>
    </div>
  </div>

  <div id="profile-screen" class="screen" style="display:none;">
    <div class="p-6 flex flex-col items-center">
      <div class="avatar-container mb-6">
        <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="Profile Avatar" class="w-full h-full object-cover">
      </div>

      <h1 class="text-2xl font-bold mb-6">Tu Perfil</h1>

      <form id="profile-form" class="w-full max-w-md">
        <div class="mb-4">
          <label class="block text-sm mb-2 text-fog-gray">Nombre</label>
          <input type="text" id="input-nombre" class="form-input w-full" placeholder="Tu nombre">
        </div>

        <div class="mb-4">
          <label class="block text-sm mb-2 text-fog-gray">Usuario (username)</label>
          <input type="text" id="input-username" class="form-input w-full" placeholder="Usuario">
        </div>

        <div class="mb-4">
          <label class="block text-sm mb-2 text-fog-gray">Email</label>
          <input type="email" id="input-email" class="form-input w-full" placeholder="tu@email.com" disabled>
        </div>

        <div class="mb-4">
          <label class="block text-sm mb-2 text-fog-gray">Teléfono</label>
          <input type="text" id="input-telefono" class="form-input w-full" placeholder="Tu número de teléfono">
        </div>

        <div class="mb-4">
          <label class="block text-sm mb-2 text-fog-gray">Género musical favorito</label>
          <select id="input-gender" class="form-input w-full">
            <option value="Rock">Rock</option>
            <option value="Pop">Pop</option>
            <option value="Jazz">Jazz</option>
            <option value="Electrónica">Electrónica</option>
            <option value="Hip Hop">Hip Hop</option>
            <option value="Clásica">Clásica</option>
          </select>
        </div>

        <p id="profile-status" class="warning-text mt-2 text-center"></p>
        <button type="submit" id="save-profile-btn" class="custom-btn w-full mt-4">Guardar cambios</button>
      </form>
    </div>
  </div>

  <div id="admin-screen" class="screen" style="display:none;">
    <div id="admin-screen-content"></div>
  </div>

  <div id="nowplaying-screen" class="screen" style="display:none;">
    <div class="background-blur"></div>
    <div class="relative flex flex-col items-center p-6">
      <div class="menu-trigger nowplaying-menu-trigger pressable absolute top-6 right-6 text-2xl text-white/80 hover:text-white transition">
        <i class="fas fa-ellipsis-v"></i>
      </div>
      <div class="w-full max-w-md mb-8">
        <img src="https://cdn.pixabay.com/photo/2018/10/26/19/08/piano-3775191_1280.jpg" class="w-full rounded-3xl shadow-xl" />
      </div>
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold mb-1" style="color: var(--color-crimson)">Título de Canción</h2>
        <p class="text-lg text-fog-gray">Nombre de Artista</p>
      </div>
      <div class="w-full max-w-md mb-6">
        <div class="relative h-1 rounded-full bg-soft-orange">
          <div class="progress-fill h-full rounded-full bg-bright-orange" style="width:35%"></div>
        </div>
      </div>
      <div class="flex items-center justify-between w-full max-w-md mb-6">
         <button class="pressable text-3xl text-gray-300"><i class="fas fa-step-backward"></i></button>
         <button id="nowplay-play" class="pressable text-6xl text-white"><i class="fas fa-play-circle"></i></button>
         <button class="pressable text-3xl text-gray-300"><i class="fas fa-step-forward"></i></button>
      </div>
    </div>
  </div>

  <div id="playlist-detail-screen" class="screen" style="display:none;">
    <div class="playlist-detail-header gradient-header p-6 flex items-end">
      <div class="flex items-center">
        <img id="playlist-detail-cover" src="https://cdn.pixabay.com/photo/2017/11/11/18/31/music-2939936_1280.jpg" alt="Playlist Cover" class="w-24 h-24 object-cover rounded-lg mr-4">
        <div>
          <h1 id="playlist-detail-title" class="text-2xl font-bold">Favoritas</h1>
          <p id="playlist-detail-count" class="text-white opacity-80">32 canciones</p>
        </div>
      </div>
    </div>
    <div class="action-bar bg-graphite p-4 flex space-x-4">
      <button class="custom-btn flex items-center"><i class="fas fa-play mr-2"></i> Reproducir</button>
      <button class="ml-auto text-fog-gray hover:text-white"><i class="fas fa-plus-circle text-2xl"></i></button>
    </div>
    <div class="playlist-tracks p-4 overflow-y-auto" style="max-height: calc(100vh - 220px);">
      <div class="track-row flex items-center p-3 hover:bg-soft-orange hover:bg-opacity-10 rounded-lg relative">
        <button class="track-back-home absolute left-2 top-2 bg-soft-orange text-white px-2 py-1 rounded text-xs shadow-md">Home</button>
        <img src="https://cdn.pixabay.com/photo/2019/04/13/22/50/concert-4125832_1280.jpg" class="w-12 h-12 object-cover rounded mr-3">
        <div class="flex-1">
          <h3 class="font-medium">Título de Canción</h3>
          <p class="text-sm text-fog-gray">Nombre de Artista</p>
        </div>
        <div class="menu-trigger track-menu-trigger"><i class="fas fa-ellipsis-v"></i></div>
      </div>
    </div>
  </div>

  <div id="logout-confirm-screen" class="screen" style="display:none;">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4">
        <div class="relative bg-graphite p-6 rounded-lg shadow-xl w-full max-w-sm text-center border border-gray-700">
            <i class="fas fa-sign-out-alt text-4xl text-bright-orange mb-4"></i>
            <h3 class="text-xl font-bold mb-2 text-white">¿Cerrar sesión?</h3>
            <p class="text-fog-gray mb-6 text-sm">Tendrás que ingresar tus datos nuevamente para entrar.</p>
            <div class="flex space-x-3 justify-center">
                <button id="ui-cancel-logout" class="px-5 py-2 rounded text-white bg-gray-600 hover:bg-gray-500 font-medium transition">Cancelar</button>
                <button id="ui-confirm-logout" class="px-5 py-2 rounded text-white bg-crimson hover:bg-opacity-90 font-medium transition">Sí, Salir</button>
            </div>
        </div>
    </div>
  </div>

  <div class="mini-player fixed bottom-16 left-0 right-0 h-16 px-4 flex items-center z-20" style="display:flex;">
    <div class="flex-1 flex items-center">
      <img src="https://cdn.pixabay.com/photo/2018/10/26/19/08/piano-3775191_1280.jpg" class="w-12 h-12 rounded object-cover mr-3">
      <div>
        <h4 class="font-medium text-sm">Título</h4>
        <p class="text-xs text-fog-gray">Artista</p>
      </div>
    </div>
    <div class="flex space-x-4">
      <button id="mini-play-btn" class="text-white"><i class="fas fa-play"></i></button>
    </div>
  </div>

  <nav class="bottom-nav fixed bottom-0 left-0 right-0 h-16 flex justify-around items-center z-30">
    <a href="javascript:void(0)" class="nav-item active flex flex-col items-center" data-screen="home">
      <i class="fas fa-home text-xl"></i><span class="text-xs mt-1">Inicio</span>
    </a>
    <a href="javascript:void(0)" class="nav-item flex flex-col items-center" data-screen="activities">
      <i class="fas fa-history text-xl"></i><span class="text-xs mt-1">Actividades</span>
    </a>
    <a href="javascript:void(0)" class="nav-item flex flex-col items-center" data-screen="profile">
      <i class="fas fa-user text-xl"></i><span class="text-xs mt-1">Perfil</span>
    </a>
    <a href="javascript:void(0)" class="nav-item flex flex-col items-center" data-screen="nowplaying">
      <i class="fas fa-music text-xl"></i><span class="text-xs mt-1">Reprod.</span>
    </a>

    <a href="javascript:void(0)" class="nav-item flex flex-col items-center" data-screen="admin" style="display:none;">
      <i class="fas fa-ellipsis-h text-xl"></i><span class="text-xs mt-1">Más</span>
    </a>

    <a href="javascript:void(0)" class="nav-item flex flex-col items-center text-crimson" data-screen="logout-confirm">
      <i class="fas fa-sign-out-alt text-xl"></i><span class="text-xs mt-1">Salir</span>
    </a>
  </nav>

  <div id="recommendation-menu" class="contextual-menu hidden"></div>
  <div id="playlist-menu" class="contextual-menu hidden"></div>
  <div id="activity-menu" class="contextual-menu hidden"></div>
  <div id="nowplaying-menu" class="contextual-menu hidden"></div>
  <div id="track-menu" class="contextual-menu hidden"></div>

  <div id="mobile-menu" class="contextual-menu mobile-sheet hidden">
    <div class="mobile-sheet-header">Opciones</div>
    <div id="mobile-menu-content"></div>
    <div class="mobile-sheet-close">Cancelar</div>
  </div>
`;

// ----------------------------------------------------------------------
// 2. Lógica de UI
// ----------------------------------------------------------------------

export function initTuMusicaUI(options = {}) {
  // 1. Inyectar HTML
  const appContainer = document.getElementById('app-container');
  if (appContainer) {
    appContainer.innerHTML = appHTML;
  } else {
    console.error('Error: #app-container no encontrado.');
    return;
  }

  const cfg = {
    handleNav: options.handleNav ?? true,
    navSelector: '.nav-item',
    screensSelector: '.screen',
    mobileBreakpoint: 640
  };

  const getNavItems = () => document.querySelectorAll(cfg.navSelector);
  const getScreens = () => document.querySelectorAll(cfg.screensSelector);

  // -----------------------------
  // Manejo de Navegación y Admin
  // -----------------------------
  if (cfg.handleNav) {
    const navItems = getNavItems();
    const screens = getScreens();

    navItems.forEach(item => {
      item.addEventListener('click', async function (e) { 
        
        const targetScreen = this.dataset.screen;
        if (!targetScreen) return;
        
        // 1. GESTIÓN VISUAL (Cambio de pestañas)
        if (targetScreen !== 'logout-confirm') {
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');

            screens.forEach(s => s.style.display = 'none');
            const screenToShow = document.getElementById(`${targetScreen}-screen`);
            if (screenToShow) screenToShow.style.display = 'block';
        }

        // 2. >>> LÓGICA DE CARGA DINÁMICA DE ADMIN <<<
        if (targetScreen === 'admin') {
            try {
                const adminContent = document.getElementById('admin-screen-content');
                // Indicador visual de carga
                if(!adminContent.innerHTML) {
                    adminContent.innerHTML = '<div class="p-8 text-center"><i class="fas fa-circle-notch fa-spin text-bright-orange text-2xl"></i></div>';
                }
                
                // Importamos admin.js dinámicamente
                const { cargarDatosAdmin } = await import('./admin.js');
                await cargarDatosAdmin(); 
            } catch (error) {
                console.error('Error al cargar el módulo de admin:', error);
                document.getElementById('admin-screen-content').innerHTML = 
                    '<p class="text-crimson p-4">Error cargando el panel.</p>';
            }
        }

        // 3. Persistencia
        if (targetScreen !== 'admin' && targetScreen !== 'logout-confirm') {
            localStorage.setItem('tm_last_screen', targetScreen);
        }

        if (targetScreen === 'logout-confirm') {
           navItems.forEach(n => n.classList.remove('active'));
           this.classList.add('active');
        }
      });
    });
  }

  // -----------------------------
  // Lógica de Sesión y Detección de Admin
  // -----------------------------
  supabase.auth.onAuthStateChange((event, session) => {
    // Definimos el correo del Admin aquí para comparar
    const ADMIN_EMAIL = 'camiloalarcon.4114@gmail.com';

    if (event === 'SIGNED_IN' && session?.user) {
        // Mostrar botón Admin si corresponde
        if (session.user.email === ADMIN_EMAIL) {
            console.log('Admin detectado. Activando menú.');
            const adminNavBtn = document.querySelector('.nav-item[data-screen="admin"]');
            if (adminNavBtn) adminNavBtn.style.display = 'flex';
        }

        const lastScreen = localStorage.getItem('tm_last_screen');
        if (lastScreen && lastScreen !== 'home') {
            setTimeout(() => {
                const navItemToClick = document.querySelector(`.nav-item[data-screen="${lastScreen}"]`);
                if (navItemToClick) navItemToClick.click();
            }, 300);
        }
    }

    if (event === 'SIGNED_OUT') {
        localStorage.removeItem('tm_last_screen');
        const adminNavBtn = document.querySelector('.nav-item[data-screen="admin"]');
        if (adminNavBtn) adminNavBtn.style.display = 'none';
    }
  });

  // -----------------------------
  // Lógica del Modal de Salir
  // -----------------------------
  const btnCancelLogout = document.getElementById('ui-cancel-logout');
  const btnConfirmLogout = document.getElementById('ui-confirm-logout');

  btnCancelLogout?.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('.nav-item[data-screen="home"]')?.click();
  });

  btnConfirmLogout?.addEventListener('click', async (e) => {
      e.preventDefault();
      btnConfirmLogout.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; 
      await supabase.auth.signOut();
  });


  // -----------------------------
  // UI Genérica (Menús, Botones)
  // -----------------------------
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuContent = document.getElementById('mobile-menu-content');
  let activeMenu = null;

  function closeActiveMenu() {
    if (!activeMenu) return;
    activeMenu.classList.remove('show');
    if (activeMenu === mobileMenu) activeMenu.classList.add('hidden');
    activeMenu = null;
  }

  function positionMenu(menu, trigger) {
    const mobileView = window.innerWidth < cfg.mobileBreakpoint;
    if (mobileView && mobileMenu) {
      mobileMenuContent.innerHTML = menu.innerHTML;
      mobileMenu.classList.remove('hidden');
      mobileMenu.classList.add('show');
      activeMenu = mobileMenu;
    } else {
      const rect = trigger.getBoundingClientRect();
      menu.style.top = (rect.bottom + window.scrollY) + 'px';
      menu.style.left = (rect.left - 100 + window.scrollX) + 'px';
      menu.classList.remove('hidden');
      menu.classList.add('show');
      activeMenu = menu;
    }
  }

  const triggers = [
    { sel: '.recommendation-menu-trigger', id: 'recommendation-menu' },
    { sel: '.playlist-menu-trigger', id: 'playlist-menu' },
    { sel: '.track-menu-trigger', id: 'track-menu' },
    { sel: '.nowplaying-menu-trigger', id: 'nowplaying-menu' }
  ];

  triggers.forEach(t => {
    document.querySelectorAll(t.sel).forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        closeActiveMenu();
        const menu = document.getElementById(t.id);
        if (menu) positionMenu(menu, el);
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.contextual-menu')) closeActiveMenu();
  });
  
  document.querySelector('.mobile-sheet-close')?.addEventListener('click', closeActiveMenu);

  document.querySelectorAll('.play-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelector('[data-screen="nowplaying"]')?.click();
    });
  });

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
       getScreens().forEach(s => s.style.display = 'none');
       document.getElementById('playlist-detail-screen').style.display = 'block';
    });
  });
  
  document.querySelectorAll('.track-back-home').forEach(btn => {
      btn.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelector('[data-screen="home"]')?.click();
      });
  });

  return { closeActiveMenu };
}