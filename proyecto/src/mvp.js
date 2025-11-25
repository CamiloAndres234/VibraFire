// src/mvp.js
import { supabase } from "./supabase.js";

const TABLE_NAME = "actividades_musicales";

export function inicializarActividades() {
    console.log("Inicializando pantalla de Actividades...");

    const form = document.querySelector("#activities-screen form");
    const activitiesList = document.querySelector("#lista-actividades-contenedor");
    const saveButton = document.querySelector("#activities-screen .custom-btn");
    const selectPlaylist = document.querySelector("#select-playlist");

    if (!form || !saveButton || !selectPlaylist) {
        console.error("ERROR: faltan elementos del formulario");
        return;
    }

    if (!saveButton.dataset.listenerAdded) {
        saveButton.addEventListener("click", (e) => handleNewActivity(e, form, activitiesList));
        saveButton.dataset.listenerAdded = "true";
    }

    handleRatingClicks(form);
    cargarPlaylists(selectPlaylist);
    cargarActividades(activitiesList);
}

/* --------------------------- ESTRELLAS --------------------------- */
function handleRatingClicks(form) {
    const stars = form.querySelectorAll(".fa-star");

    stars.forEach((star, index) => {
        if (!star.dataset.listenerAdded) {
            star.addEventListener("click", () => {
                stars.forEach((s, i) => {
                    s.classList.toggle("text-bright-orange", i <= index);
                    s.classList.toggle("text-fog-gray", i > index);
                });
            });
            star.dataset.listenerAdded = "true";
        }
    });
}

/* --------------------------- PLAYLISTS --------------------------- */
async function cargarPlaylists(selectPlaylist) {
    selectPlaylist.innerHTML = `<option value="">Cargando playlists...</option>`;

    const { data, error } = await supabase
        .from("playlists")
        .select("id, nombre")
        .order("nombre");

    if (error) {
        console.error(error);
        selectPlaylist.innerHTML = `<option value="">Error al cargar playlists</option>`;
        return;
    }

    selectPlaylist.innerHTML = `<option value="">Seleccionar playlist</option>`;

    data.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.nombre;
        selectPlaylist.appendChild(opt);
    });
}

/* --------------------------- NUEVO REGISTRO --------------------------- */
async function handleNewActivity(e, form, activitiesList) {
    e.preventDefault();

    const inputTitle = form.querySelector('input[placeholder="¿Qué escuchaste?"]');
    const inputArtist = form.querySelector('input[placeholder="Nombre del artista"]');
    const inputImagen = form.querySelector('input[placeholder="URL de la carátula (Opcional)"]');
    const rating = form.querySelectorAll(".text-bright-orange").length;
    const selectPlaylist = form.querySelector("#select-playlist");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    const nuevaActividad = {
        titulo: inputTitle.value.trim(),
        descripcion: `Artista: ${inputArtist.value || "Desconocido"}. Calificación: ${rating}/5`,
        tipo: "agregar_cancion",
        imagen: inputImagen.value || "https://cdn.pixabay.com/photo/2016/11/22/19/15/hand-1850120_1280.jpg",
        usuario_id: user.id,
        playlist_id: selectPlaylist.value,
    };

    await supabase.from(TABLE_NAME).insert([nuevaActividad]);

    form.reset();
    cargarActividades(activitiesList);
}

/* --------------------------- CARGAR LISTA --------------------------- */
async function cargarActividades(activitiesList) {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("id, titulo, descripcion, imagen, creado_en")
        .eq("usuario_id", user.id)
        .order("creado_en", { ascending: false });

    if (error) {
        console.error(error);
        activitiesList.innerHTML = `<p>Error al cargar</p>`;
        return;
    }

    if (!data.length) {
        activitiesList.innerHTML = `<p class="text-fog-gray text-center mt-4">No hay actividades aún.</p>`;
        return;
    }

    activitiesList.innerHTML = "";

    data.forEach(act => {
        const artist = act.descripcion.match(/Artista: (.*?)\./)?.[1] || "Desconocido";
        const date = new Date(act.creado_en).toLocaleDateString("es-ES");

        activitiesList.innerHTML += `
        <div class="activity-card flex justify-between items-center p-3 border-b border-deep-gray">

            <div class="flex">
                <img src="${act.imagen}" class="w-16 h-16 rounded object-cover mr-4">
                <div>
                    <h3 class="font-medium">${act.titulo}</h3>
                    <p class="text-sm text-fog-gray">${artist}</p>
                    <span class="text-xs text-fog-gray">${date}</span>
                </div>
            </div>

            <div class="flex space-x-3">
                <button class="text-bright-orange edit-btn" data-id="${act.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-500 delete-btn" data-id="${act.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>

        </div>`;
    });

    activarBotonesEdicion(activitiesList);
}

/* --------------------------- ELIMINAR --------------------------- */
function activarBotonesEdicion(activitiesList) {
    const deleteButtons = activitiesList.querySelectorAll(".delete-btn");
    const editButtons = activitiesList.querySelectorAll(".edit-btn");

    deleteButtons.forEach(btn => {
        btn.onclick = async () => {
            if (!confirm("¿Eliminar actividad?")) return;

            const id = btn.dataset.id;
            await supabase.from(TABLE_NAME).delete().eq("id", id);

            cargarActividades(activitiesList);
        };
    });

    editButtons.forEach(btn => {
        btn.onclick = () => abrirEditor(btn.dataset.id, activitiesList);
    });
}

/* --------------------------- EDITAR --------------------------- */
async function abrirEditor(id, activitiesList) {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .eq("id", id)
        .single();

    if (error) return alert("Error cargando registro");

    const nuevoTitulo = prompt("Editar título:", data.titulo);
    if (!nuevoTitulo) return;

    const nuevaDesc = prompt("Editar descripción:", data.descripcion);
    if (!nuevaDesc) return;

    await supabase
        .from(TABLE_NAME)
        .update({
            titulo: nuevoTitulo,
            descripcion: nuevaDesc
        })
        .eq("id", id);

    cargarActividades(activitiesList);
}
