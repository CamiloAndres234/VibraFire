import { supabase } from "./supabase.js";

const TABLE_NAME = "actividades_musicales";

export function inicializarActividades() {
    console.log("Inicializando pantalla de Actividades...");

    const screen = document.getElementById("activities-screen");
    if (!screen) return;

    const form = screen.querySelector("form");
    const activitiesList = document.getElementById("lista-actividades-contenedor");
    const saveButton = screen.querySelector(".custom-btn");
    const selectPlaylist = document.getElementById("select-playlist");

    if (!form || !saveButton || !selectPlaylist) {
        console.error("Faltan elementos del formulario");
        return;
    }

    // Guardar actividad
    saveButton.addEventListener("click", (e) => handleNewActivity(e, form, activitiesList));

    // Manejo de estrellas
    const starContainer = form.querySelector("div.flex.space-x-2");
    const stars = Array.from(starContainer.querySelectorAll("i.fa-star"));

    stars.forEach((star, index) => {
        star.addEventListener("click", () => {
            // Guardar calificación en el form
            form.dataset.rating = index + 1;

            // Colorear estrellas
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.add("text-orange-400"); // naranja
                    s.classList.remove("text-gray-400"); // gris
                } else {
                    s.classList.remove("text-orange-400");
                    s.classList.add("text-gray-400");
                }
            });
        });
    });

    // Carga playlists y actividades
    cargarPlaylists(selectPlaylist);
    cargarActividades(activitiesList);
}

// Cargar playlists
async function cargarPlaylists(selectPlaylist) {
    selectPlaylist.innerHTML = `<option value="">Cargando playlists...</option>`;
    const { data, error } = await supabase.from("playlists").select("id,nombre").order("nombre");
    if (error) {
        selectPlaylist.innerHTML = `<option value="">Error cargando playlists</option>`;
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

// Guardar nueva actividad
async function handleNewActivity(e, form, activitiesList) {
    e.preventDefault();

    const title = form.querySelector('input[placeholder="¿Qué escuchaste?"]').value.trim();
    const artist = form.querySelector('input[placeholder="Nombre del artista"]').value.trim();
    const img = form.querySelector('input[placeholder="URL de la carátula (Opcional)"]').value.trim() || "https://cdn.pixabay.com/photo/2016/11/22/19/15/hand-1850120_1280.jpg";
    const playlistId = form.querySelector("#select-playlist").value || null;
    const rating = form.dataset.rating || 0;

    if (!title) { 
        alert("Debes ingresar un título."); 
        return; 
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    const nuevaActividad = {
        titulo: title,
        descripcion: `Artista: ${artist || "Desconocido"}. Calificación: ${rating}/5`,
        tipo: "agregar_cancion",
        imagen: img,
        usuario_id: user.id,
        playlist_id: playlistId
    };

    const { error } = await supabase.from(TABLE_NAME).insert([nuevaActividad]);
    if (error) { 
        alert("Error al guardar."); 
        console.error(error); 
        return; 
    }

    alert("Actividad guardada!");
    form.reset();
    delete form.dataset.rating;

    // Reset estrellas
    const starElements = form.querySelectorAll("div.flex.space-x-2 i.fa-star");
    starElements.forEach(s => {
        s.classList.remove("text-orange-400");
        s.classList.add("text-gray-400");
    });

    cargarActividades(document.getElementById("lista-actividades-contenedor"));
}

// Cargar actividades
export async function cargarActividades(activitiesList) {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    const { data, error } = await supabase.from(TABLE_NAME)
        .select("id,titulo,descripcion,imagen,creado_en")
        .eq("usuario_id", user.id)
        .order("creado_en", { ascending: false });

    if (error) { 
        activitiesList.innerHTML = `<p>Error al cargar actividades</p>`; 
        return; 
    }
    if (!data.length) { 
        activitiesList.innerHTML = `<p class="text-gray-400 text-center mt-4">No hay actividades aún.</p>`; 
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
                    <p class="text-sm text-gray-400">${artist}</p>
                    <span class="text-xs text-gray-400">${date}</span>
                </div>
            </div>
            <div class="flex space-x-3">
                <button class="text-orange-400 edit-btn" data-id="${act.id}"><i class="fas fa-edit"></i></button>
                <button class="text-red-500 delete-btn" data-id="${act.id}"><i class="fas fa-trash"></i></button>
            </div>
        </div>`;
    });

    // Botones de edición/eliminar
    activitiesList.querySelectorAll(".delete-btn").forEach(btn => btn.onclick = async () => {
        if (!confirm("¿Eliminar actividad?")) return;
        const id = btn.dataset.id;
        const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
        if (!error) cargarActividades(activitiesList);
    });
    activitiesList.querySelectorAll(".edit-btn").forEach(btn => btn.onclick = () => abrirEditor(btn.dataset.id, activitiesList));
}

async function abrirEditor(id, activitiesList) {
    const { data, error } = await supabase.from(TABLE_NAME).select("*").eq("id", id).single();
    if (error) return alert("Error cargando registro");

    const nuevoTitulo = prompt("Editar título:", data.titulo);
    if (!nuevoTitulo) return;
    const nuevaDesc = prompt("Editar descripción:", data.descripcion);
    if (!nuevaDesc) return;

    const { error: updateError } = await supabase.from(TABLE_NAME)
        .update({ titulo: nuevoTitulo, descripcion: nuevaDesc })
        .eq("id", id);

    if (!updateError) cargarActividades(document.getElementById("lista-actividades-contenedor"));
}