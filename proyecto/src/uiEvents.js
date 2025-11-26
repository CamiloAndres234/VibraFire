export function initUIEvents(options = {}) {
  const cfg = {
    handleNav: options.handleNav ?? true,
    navSelector: options.navSelector ?? '.nav-item',
    screensSelector: options.screensSelector ?? '.screen',
    adminOverlayId: options.adminOverlayId ?? 'admin-overlay',
    mobileMenuId: options.mobileMenuId ?? 'mobile-menu',
    mobileMenuContentId: options.mobileMenuContentId ?? 'mobile-menu-content',
    mobileSheetCloseSelector: options.mobileSheetCloseSelector ?? '.mobile-sheet-close',
    localStoragePrefix: options.localStoragePrefix ?? 'app',
    mobileBreakpoint: options.mobileBreakpoint ?? 640
  };

  const getNavItems = () => document.querySelectorAll(cfg.navSelector);
  const getScreens = () => document.querySelectorAll(cfg.screensSelector);
  const adminOverlay = document.getElementById(cfg.adminOverlayId);
  const mobileMenu = document.getElementById(cfg.mobileMenuId);
  const mobileMenuContent = document.getElementById(cfg.mobileMenuContentId);
  const q = (sel) => document.querySelector(sel);

  // -----------------------------
  // Navigation handling
  // -----------------------------
  if (cfg.handleNav) {
    const navItems = getNavItems();
    const screens = getScreens();

    navItems.forEach(item => {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        const targetScreen = this.dataset.screen;
        if (!targetScreen) return;

        if (targetScreen === 'admin') {
          if (adminOverlay) {
            adminOverlay.style.display = 'block';
            setTimeout(() => adminOverlay.style.transform = 'translateY(0)', 10);
          }
          return;
        }

        navItems.forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        screens.forEach(s => s.style.display = 'none');
        const targetEl = document.getElementById(`${targetScreen}-screen`);
        if (targetEl) targetEl.style.display = 'block';
      });
    });
  }

  // -----------------------------
  // Admin overlay close
  // -----------------------------
  const closeAdminBtn = q('#close-admin');
  if (closeAdminBtn && adminOverlay) {
    closeAdminBtn.addEventListener('click', () => {
      adminOverlay.style.transform = 'translateY(100%)';
      setTimeout(() => { adminOverlay.style.display = 'none'; }, 300);
    });
  }

  // -----------------------------
  // Local Storage init
  // -----------------------------
  try {
    const activitiesKey = `${cfg.localStoragePrefix}Activities`;
    const profileKey = `${cfg.localStoragePrefix}Profile`;

    if (!localStorage.getItem(activitiesKey)) localStorage.setItem(activitiesKey, JSON.stringify([]));
    if (!localStorage.getItem(profileKey)) {
      localStorage.setItem(profileKey, JSON.stringify({ name: 'Usuario', email: 'usuario@example.com', favoriteGenre: 'Rock' }));
    }
  } catch(e) { console.warn('localStorage init skipped:', e?.message); }

  // -----------------------------
  // Contextual Menu
  // -----------------------------
  const mobileView = window.innerWidth < cfg.mobileBreakpoint;
  let activeMenu = null;

  function closeActiveMenu(ignoreClickTarget) {
    if (!activeMenu) return;

    // Si se pasa ignoreClickTarget, no cerramos si se hizo click dentro
    if (ignoreClickTarget && activeMenu.contains(ignoreClickTarget)) return;

    activeMenu.classList.remove('show');
    if (activeMenu === mobileMenu) activeMenu.classList.remove('show');
    activeMenu = null;
  }

  function positionMenu(menu, trigger) {
    if (!menu) return;
    if (mobileView && mobileMenu && mobileMenuContent) {
      mobileMenuContent.innerHTML = menu.innerHTML;
      mobileMenu.classList.add('show');
      activeMenu = mobileMenu;
    } else {
      const rect = trigger.getBoundingClientRect();
      menu.style.top = (rect.bottom + window.scrollY) + 'px';
      menu.style.left = (rect.left - 150 + rect.width / 2 + window.scrollX) + 'px';
      menu.classList.add('show');
      activeMenu = menu;
    }
  }

  [
    { triggerSel: '.recommendation-menu-trigger', menuId: 'recommendation-menu' },
    { triggerSel: '.playlist-menu-trigger', menuId: 'playlist-menu' },
    { triggerSel: '.activity-menu-trigger', menuId: 'activity-menu' },
    { triggerSel: '.nowplaying-menu-trigger', menuId: 'nowplaying-menu' },
    { triggerSel: '.track-menu-trigger', menuId: 'track-menu' }
  ].forEach(map => {
    document.querySelectorAll(map.triggerSel).forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        closeActiveMenu();
        const menu = document.getElementById(map.menuId);
        positionMenu(menu, trigger);
      });
    });
  });

  // Close menu solo si clic no es dentro de un menú
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.contextual-menu') && !e.target.closest('.mobile-sheet')) {
      closeActiveMenu(e.target);
    }
  });

  // Close mobile sheet cancel button
  const mobileClose = document.querySelector(cfg.mobileSheetCloseSelector);
  if (mobileClose) mobileClose.addEventListener('click', () => closeActiveMenu());

  // -----------------------------
  // Admin submenu toggles
  // -----------------------------
  document.querySelectorAll('.submenu-toggle').forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      this.classList.toggle('fa-chevron-down');
      this.classList.toggle('fa-chevron-up');
      const parentItem = this.closest('.admin-item');
      if (!parentItem) return;
      const submenu = parentItem.querySelector('.submenu');
      if (submenu) submenu.classList.toggle('expanded');
    });
  });

  document.querySelectorAll('.admin-item').forEach(item => {
    item.addEventListener('click', function () {
      const toggle = this.querySelector('.submenu-toggle');
      if (toggle) toggle.click();
    });
  });

  // -----------------------------
  // Play buttons
  // -----------------------------
  document.querySelectorAll('.play-button').forEach(button => {
    button.addEventListener('click', function (e) {
      e.stopPropagation();
      getNavItems().forEach(n => n.classList.remove('active'));
      const nowplayingNav = document.querySelector('[data-screen="nowplaying"]');
      if (nowplayingNav) nowplayingNav.classList.add('active');
      getScreens().forEach(s => s.style.display = 'none');
      const np = document.getElementById('nowplaying-screen');
      if (np) np.style.display = 'block';
    });
  });

  // -----------------------------
  // Playlist cards
  // -----------------------------
  document.querySelectorAll('.card').forEach(card => {
    const h3 = card.querySelector('h3');
    if (!h3 || !h3.textContent.trim()) return;
    card.addEventListener('click', function () {
      const title = this.querySelector('h3').textContent;
      const count = this.querySelector('p')?.textContent || '';
      const cover = this.querySelector('img')?.src || '';
      const titleEl = document.getElementById('playlist-detail-title');
      const countEl = document.getElementById('playlist-detail-count');
      const coverEl = document.getElementById('playlist-detail-cover');
      if (titleEl) titleEl.textContent = title;
      if (countEl) countEl.textContent = count;
      if (coverEl && cover) coverEl.src = cover;
      getScreens().forEach(s => s.style.display = 'none');
      const detail = document.getElementById('playlist-detail-screen');
      if (detail) detail.style.display = 'block';
      getNavItems().forEach(n => n.classList.remove('active'));
    });
  });

  return { closeActiveMenu, positionMenu };
}
