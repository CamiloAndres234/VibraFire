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

    <div class="content-area px-4 py-6 pb-24">
      
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Para ti</h2>
          <a href="javascript:void(0)" class="text-sm text-bright-orange">Ver todo</a>
        </div>

        <div class="overflow-x-auto pb-4 hide-scrollbar">
          <div class="flex space-x-4" style="min-width: max-content;">
            
            <div class="card w-48">
              <div class="relative">
                <img src="https://cdn.pixabay.com/photo/2018/06/30/09/29/monkey-3507317_1280.jpg" alt="Album Cover" class="w-full h-40 object-cover rounded-md">
                <div class="absolute bottom-2 right-2">
                  <div class="play-button"><i class="fas fa-play text-white"></i></div>
                </div>
                <div class="menu-trigger recommendation-menu-trigger"><i class="fas fa-ellipsis-v"></i></div>
              </div>
              <div class="p-3">
                <h3 class="font-medium truncate">Nuevo Lanzamiento</h3>
                <p class="text-sm text-gray-400 truncate">Gorillaz & Co.</p>
              </div>
            </div>
            
            <div class="card w-48">
              <div class="relative">
                <img src="https://cdn.pixabay.com/photo/2016/11/22/19/15/woman-1850120_1280.jpg" alt="Album Cover" class="w-full h-40 object-cover rounded-md">
                <div class="absolute bottom-2 right-2"><div class="play-button"><i class="fas fa-play text-white"></i></div></div>
              </div>
              <div class="p-3">
                <h3 class="font-medium truncate">Vibra Urbana</h3>
                <p class="text-sm text-gray-400 truncate">Éxitos de Hoy</p>
              </div>
            </div>

            <div class="card w-48">
              <div class="relative">
                <img src="https://cdn.pixabay.com/photo/2015/05/07/11/02/guitar-756326_1280.jpg" alt="Album Cover" class="w-full h-40 object-cover rounded-md">
                <div class="absolute bottom-2 right-2"><div class="play-button"><i class="fas fa-play text-white"></i></div></div>
              </div>
              <div class="p-3">
                <h3 class="font-medium truncate">Acústicos</h3>
                <p class="text-sm text-gray-400 truncate">Relax & Chill</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Tendencias Globales</h2>
        <div class="overflow-x-auto pb-4 hide-scrollbar">
           <div class="flex space-x-4" style="min-width: max-content;">
              
              <div class="card w-32 flex flex-col items-center">
                 <img src="https://cdn.pixabay.com/photo/2016/11/29/09/32/concept-1868728_1280.jpg" class="w-32 h-32 rounded-full object-cover mb-2 shadow-lg">
                 <p class="font-medium text-sm text-center">Top 50 Global</p>
              </div>

              <div class="card w-32 flex flex-col items-center">
                 <img src="https://i.ytimg.com/vi/Dh9CHEE4sEY/maxresdefault.jpg" class="w-32 h-32 rounded-full object-cover mb-2 shadow-lg">
                 <p class="font-medium text-sm text-center">Fiesta Latina</p>
              </div>

              <div class="card w-32 flex flex-col items-center">
                 <img src="https://cdn.pixabay.com/photo/2015/01/20/12/51/mobile-605422_1280.jpg" class="w-32 h-32 rounded-full object-cover mb-2 shadow-lg">
                 <p class="font-medium text-sm text-center">Viral TikTok</p>
              </div>

           </div>
        </div>
      </div>

      <div>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Tus listas</h2>
          <a href="javascript:void(0)" class="text-sm text-bright-orange">Editar</a>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="card bg-graphite p-0 rounded-lg overflow-hidden shadow-md">
            <div class="relative">
              <img src="https://cdn.pixabay.com/photo/2017/11/11/18/31/music-2939936_1280.jpg" alt="Playlist Cover" class="w-full h-32 object-cover">
              <div class="menu-trigger playlist-menu-trigger absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 px-2 text-white"><i class="fas fa-ellipsis-v text-xs"></i></div>
            </div>
            <div class="p-3">
              <h3 class="font-medium text-sm">Favoritas</h3>
              <p class="text-xs text-gray-400">32 canciones</p>
            </div>
          </div>

          <div class="card bg-graphite p-0 rounded-lg overflow-hidden shadow-md flex items-center justify-center border-2 border-dashed border-gray-700 h-full min-h-[180px]">
             <div class="text-center text-gray-500">
                <i class="fas fa-plus text-2xl mb-2"></i>
                <p class="text-xs">Crear Playlist</p>
             </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <div id="activities-screen" class="screen" style="display:none;">
    <div class="p-6 pb-24">
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
    <div class="p-6 pb-24 flex flex-col items-center">
      <div class="avatar-container mb-6 ring-4 ring-bright-orange ring-opacity-50">
        <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="Profile Avatar" class="w-full h-full object-cover">
      </div>

      <h1 class="text-2xl font-bold mb-6">Tu Perfil</h1>

      <form id="profile-form" class="w-full max-w-md space-y-4">
        <div>
          <label class="block text-sm mb-1 text-fog-gray ml-1">Nombre</label>
          <input type="text" id="input-nombre" class="form-input w-full" placeholder="Tu nombre">
        </div>

        <div>
          <label class="block text-sm mb-1 text-fog-gray ml-1">Usuario</label>
          <input type="text" id="input-username" class="form-input w-full" placeholder="Usuario">
        </div>

        <div>
          <label class="block text-sm mb-1 text-fog-gray ml-1">Email</label>
          <input type="email" id="input-email" class="form-input w-full bg-gray-900 text-gray-500 border-gray-800" placeholder="tu@email.com" disabled>
        </div>

        <div>
          <label class="block text-sm mb-1 text-fog-gray ml-1">Teléfono</label>
          <input type="text" id="input-telefono" class="form-input w-full" placeholder="Tu número de teléfono">
        </div>

        <div>
          <label class="block text-sm mb-1 text-fog-gray ml-1">Género musical</label>
          <select id="input-gender" class="form-input w-full">
            <option value="Rock">Rock</option>
            <option value="Pop">Pop</option>
            <option value="Jazz">Jazz</option>
            <option value="Electrónica">Electrónica</option>
            <option value="Hip Hop">Hip Hop</option>
            <option value="Clásica">Clásica</option>
            <option value="Urbano">Urbano</option>
          </select>
        </div>

        <p id="profile-status" class="warning-text mt-2 text-center"></p>
        <button type="submit" id="save-profile-btn" class="custom-btn w-full mt-6 shadow-lg">Guardar cambios</button>
      </form>
    </div>
  </div>

  <div id="admin-screen" class="screen" style="display:none;">
    <div id="admin-screen-content"></div>
  </div>

  <div id="nowplaying-screen" class="screen" style="display:none;">
    <div class="background-blur"></div>
    <div class="relative flex flex-col items-center p-6 h-full justify-center">
      <div class="menu-trigger nowplaying-menu-trigger pressable absolute top-6 right-6 text-2xl text-white/80 hover:text-white transition">
        <i class="fas fa-ellipsis-v"></i>
      </div>
      <div class="w-full max-w-md mb-10 mt-10">
        <img src="https://cdn.pixabay.com/photo/2018/10/26/19/08/piano-3775191_1280.jpg" class="w-full aspect-square object-cover rounded-3xl shadow-2xl" />
      </div>
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-2" style="color: var(--color-crimson)">Título de Canción</h2>
        <p class="text-lg text-fog-gray">Nombre de Artista</p>
      </div>
      <div class="w-full max-w-md mb-8">
        <div class="relative h-1.5 rounded-full bg-soft-orange bg-opacity-30">
          <div class="progress-fill h-full rounded-full bg-bright-orange shadow-[0_0_10px_rgba(255,87,34,0.7)]" style="width:35%"></div>
        </div>
        <div class="flex justify-between text-xs text-gray-400 mt-2">
           <span>1:20</span>
           <span>3:45</span>
        </div>
      </div>
      <div class="flex items-center justify-between w-full max-w-xs mb-6">
         <button class="pressable text-4xl text-gray-300 hover:text-white"><i class="fas fa-step-backward"></i></button>
         <button id="nowplay-play" class="pressable text-7xl text-white hover:scale-105 transition"><i class="fas fa-play-circle"></i></button>
         <button class="pressable text-4xl text-gray-300 hover:text-white"><i class="fas fa-step-forward"></i></button>
      </div>
    </div>
  </div>

  <div id="playlist-detail-screen" class="screen" style="display:none;">
    <div class="playlist-detail-header gradient-header p-6 flex items-end h-64">
      <div class="flex items-center">
        <img id="playlist-detail-cover" src="https://cdn.pixabay.com/photo/2017/11/11/18/31/music-2939936_1280.jpg" alt="Playlist Cover" class="w-32 h-32 object-cover rounded-lg mr-5 shadow-2xl">
        <div>
          <h1 id="playlist-detail-title" class="text-3xl font-bold mb-1">Favoritas</h1>
          <p id="playlist-detail-count" class="text-white opacity-80">32 canciones</p>
        </div>
      </div>
    </div>
    <div class="action-bar bg-graphite p-4 flex space-x-4 border-b border-gray-800">
      <button class="custom-btn flex items-center px-6"><i class="fas fa-play mr-2"></i> Reproducir</button>
      <button class="ml-auto text-fog-gray hover:text-white p-2"><i class="fas fa-plus-circle text-3xl"></i></button>
    </div>
    <div class="playlist-tracks p-4 pb-24 overflow-y-auto" style="height: calc(100vh - 300px);">
      <div class="track-row flex items-center p-3 hover:bg-soft-orange hover:bg-opacity-10 rounded-lg relative transition">
        <button class="track-back-home absolute left-2 top-2 bg-soft-orange text-white px-2 py-1 rounded text-xs shadow-md z-10">Home</button>
        <img src="https://cdn.pixabay.com/photo/2019/04/13/22/50/concert-4125832_1280.jpg" class="w-12 h-12 object-cover rounded mr-3">
        <div class="flex-1">
          <h3 class="font-medium text-white">Título de Canción</h3>
          <p class="text-sm text-fog-gray">Nombre de Artista</p>
        </div>
        <div class="menu-trigger track-menu-trigger p-2 text-gray-400 hover:text-white"><i class="fas fa-ellipsis-v"></i></div>
      </div>
    </div>
  </div>

  <div id="logout-confirm-screen" class="screen" style="display:none;">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4">
        <div class="relative bg-graphite p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center border border-gray-700">
            <div class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-sign-out-alt text-4xl text-bright-orange ml-1"></i>
            </div>
            <h3 class="text-2xl font-bold mb-3 text-white">¿Cerrar sesión?</h3>
            <p class="text-fog-gray mb-8 text-sm px-4">Tendrás que ingresar tus datos nuevamente para entrar a TuMusica.</p>
            <div class="flex flex-col space-y-3 justify-center">
                <button id="ui-confirm-logout" class="w-full py-3 rounded-lg text-white bg-crimson hover:bg-opacity-90 font-bold transition">Sí, Salir</button>
                <button id="ui-cancel-logout" class="w-full py-3 rounded-lg text-fog-gray hover:text-white hover:bg-gray-800 font-medium transition">Cancelar</button>
            </div>
        </div>
    </div>
  </div>

  <div class="mini-player fixed bottom-16 left-0 right-0 h-16 bg-graphite border-t border-gray-800 px-4 flex items-center z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]" style="display:flex;">
    <div class="flex-1 flex items-center">
      <img src="https://cdn.pixabay.com/photo/2018/10/26/19/08/piano-3775191_1280.jpg" class="w-10 h-10 rounded object-cover mr-3 animate-spin-slow">
      <div class="overflow-hidden">
        <h4 class="font-medium text-sm truncate text-white">Título de Canción</h4>
        <p class="text-xs text-fog-gray truncate">Artista</p>
      </div>
    </div>
    <div class="flex space-x-5 items-center pr-2">
      <button class="text-gray-400 hover:text-white"><i class="fas fa-heart"></i></button>
      <button id="mini-play-btn" class="text-white bg-bright-orange w-8 h-8 rounded-full flex items-center justify-center shadow-lg"><i class="fas fa-play text-xs ml-0.5"></i></button>
    </div>
  </div>

  <nav class="bottom-nav fixed bottom-0 left-0 right-0 h-16 bg-black flex justify-around items-center z-30 border-t border-gray-900 pb-safe">
    <a href="javascript:void(0)" class="nav-item active flex flex-col items-center w-full py-1 text-gray-500 hover:text-white transition" data-screen="home">
      <i class="fas fa-home text-lg mb-1"></i><span class="text-[10px]">Inicio</span>
    </a>
    <a href="javascript:void(0)" class="nav-item flex flex-col items-center w-full py-1 text-gray-500 hover:text-white transition" data-screen="activities">
      <i class="fas fa-history text-lg mb-1"></i><span class="text-[10px]">Actividad</span>
    </a>
    <a href="javascript:void(0)" class="nav-item flex flex-col items-center w-full py-1 text-gray-500 hover:text-white transition" data-screen="profile">
      <i class="fas fa-user text-lg mb-1"></i><span class="text-[10px]">Perfil</span>
    </a>
    <a href="javascript:void(0)" class="nav-item flex flex-col items-center w-full py-1 text-gray-500 hover:text-white transition" data-screen="nowplaying">
      <i class="fas fa-music text-lg mb-1"></i><span class="text-[10px]">Player</span>
    </a>

    <a href="javascript:void(0)" class="nav-item flex flex-col items-center w-full py-1 text-bright-orange hover:text-orange-400 transition" data-screen="admin" style="display:none;">
      <i class="fas fa-shield-alt text-lg mb-1"></i><span class="text-[10px]">Admin</span>
    </a>

    <a href="javascript:void(0)" class="nav-item flex flex-col items-center w-full py-1 text-crimson hover:text-red-400 transition" data-screen="logout-confirm">
      <i class="fas fa-sign-out-alt text-lg mb-1"></i><span class="text-[10px]">Salir</span>
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

  if (cfg.handleNav) {
    const navItems = getNavItems();
    const screens = getScreens();

    navItems.forEach(item => {
      item.addEventListener('click', async function (e) { 
        const targetScreen = this.dataset.screen;
        if (!targetScreen) return;
        
        if (targetScreen !== 'logout-confirm') {
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            navItems.forEach(n => {
                if(n.dataset.screen === 'admin') n.classList.remove('text-white'); 
            });

            screens.forEach(s => s.style.display = 'none');
            const screenToShow = document.getElementById(`${targetScreen}-screen`);
            if (screenToShow) screenToShow.style.display = 'block';
        }

        if (targetScreen === 'admin') {
            try {
                const adminContent = document.getElementById('admin-screen-content');
                if(!adminContent.innerHTML) {
                    adminContent.innerHTML = '<div class="h-screen flex items-center justify-center"><i class="fas fa-circle-notch fa-spin text-bright-orange text-3xl"></i></div>';
                }
                const { cargarDatosAdmin } = await import('./admin.js');
                await cargarDatosAdmin(); 
            } catch (error) {
                console.error('Error Admin:', error);
                document.getElementById('admin-screen-content').innerHTML = '<p class="text-crimson p-4">Error cargando el panel.</p>';
            }
        }

        if (targetScreen !== 'admin' && targetScreen !== 'logout-confirm') {
            localStorage.setItem('tm_last_screen', targetScreen);
        }

        if (targetScreen === 'logout-confirm') {
           // No cambiamos la clase active para no perder el estado visual de donde estabamos
        }
      });
    });
  }

  supabase.auth.onAuthStateChange((event, session) => {
    const ADMIN_EMAIL = 'camiloalarcon.4114@gmail.com';

    if (event === 'SIGNED_IN' && session?.user) {
        if (session.user.email === ADMIN_EMAIL) {
            console.log('Admin detectado.');
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

  const btnCancelLogout = document.getElementById('ui-cancel-logout');
  const btnConfirmLogout = document.getElementById('ui-confirm-logout');

  btnCancelLogout?.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('.nav-item[data-screen="home"]')?.click();
  });

  btnConfirmLogout?.addEventListener('click', async (e) => {
      e.preventDefault();
      btnConfirmLogout.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saliendo...'; 
      await supabase.auth.signOut();
  });

  // UI Helpers (Menus, etc)
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
    card.addEventListener('click', (e) => {
       // Evitar que clicks en botones internos disparen esto
       if(e.target.closest('button') || e.target.closest('.menu-trigger')) return;
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