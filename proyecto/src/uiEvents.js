// =======================================
// uiEvents.js COMPATIBLE CON main.js
// =======================================

export function initUIEvents(config = {}) {
    console.log("UI Events cargado con configuración:", config);

    // -------------------------------------
    // FORMULARIO DE PERFIL
    // -------------------------------------
    const saveProfileBtn = document.getElementById("save-profile-btn");
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener("click", () => {
            const name = document.getElementById("profile-name")?.value.trim();
            const username = document.getElementById("profile-username")?.value.trim();
            const gender = document.getElementById("profile-gender")?.value;
            const phone = document.getElementById("profile-phone")?.value.trim();

            if (!name || !username) {
                alert("Por favor completa Nombre y Usuario.");
                return;
            }

            alert("Perfil guardado correctamente ✔");
            console.log("Perfil guardado:", { name, username, gender, phone });
        });
    }

    // -------------------------------------
    // FORMULARIO DE ACTIVIDADES
    // -------------------------------------
    const activityForm = document.getElementById("add-activity-form");
    if (activityForm) {
        activityForm.addEventListener("submit", e => {
            e.preventDefault();

            const activityName = document.getElementById("activity-name")?.value.trim();
            const playlist = document.getElementById("playlist-select")?.value;

            if (!activityName || !playlist) {
                alert("Completa todos los campos.");
                return;
            }

            alert("Actividad agregada ✔");
            console.log("Actividad registrada:", { activityName, playlist });
            activityForm.reset();
        });
    }

    // -------------------------------------
    // MINI REPRODUCTOR
    // -------------------------------------
    const playBtn = document.getElementById("mini-play-btn");
    const pauseBtn = document.getElementById("mini-pause-btn");

    if (playBtn && pauseBtn) {
        playBtn.addEventListener("click", () => {
            playBtn.style.display = "none";
            pauseBtn.style.display = "inline-block";
        });

        pauseBtn.addEventListener("click", () => {
            pauseBtn.style.display = "none";
            playBtn.style.display = "inline-block";
        });
    }

    // -------------------------------------
    // BOTONES "Home" DENTRO DE CADA TRACK
    // -------------------------------------
    document.querySelectorAll(".track-back-home").forEach(btn => {
        btn.addEventListener("click", () => {
            // Usamos la navegación controlada por main.js
            document.querySelector('.bottom-nav .nav-item[data-screen="home"]')?.click();
        });
    });

    // -------------------------------------
    // CARGA DE PLAYLISTS DE PRUEBA
    // -------------------------------------
    const playlistSelect = document.getElementById("playlist-select");
    if (playlistSelect) {
        const playlists = ["Workout 🔥", "Relax 😌", "Focus 🎧", "Party 🎉"];

        if (playlistSelect.children.length <= 1) {
            playlists.forEach(pl => {
                const opt = document.createElement("option");
                opt.value = pl;
                opt.textContent = pl;
                playlistSelect.appendChild(opt);
            });
        }
    }

    // -------------------------------------
    // MOBILE SHEET (si existe)
    // -------------------------------------
    if (config.mobileMenuId && config.mobileMenuContentId) {
        const mobileMenu = document.getElementById(config.mobileMenuId);
        const closures = document.querySelectorAll(config.mobileSheetCloseSelector);

        closures.forEach(btn => {
            btn.addEventListener("click", () => {
                if (mobileMenu) {
                    mobileMenu.classList.remove("active");
                }
            });
        });

        if (mobileMenu) {
            mobileMenu.addEventListener("click", e => {
                if (e.target.id === config.mobileMenuId) {
                    mobileMenu.classList.remove("active");
                }
            });
        }
    }

    console.log("UI Events inicializados correctamente.");
}
