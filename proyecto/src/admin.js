// src/admin.js
import { supabase } from "./supabase.js";
import { mostrarLogin } from "./login.js";

export async function mostrarAdmin(){

    const app = document.getElementById("app");
    app.style.display = "block";

    app.innerHTML =`
        <section class="p-6">
            <h2 class="text-3xl font-bold mb-6 text-center text-[var(--color-bright-orange)]">
                Panel Administrativo ⚙️
            </h2>
            <!-- Botón regresar -->
            <div class="flex justify-end mb-6">
                <button id="volver-login" 
                    class="custom-btn pressable text-sm px-4 py-2">
                    ⬅ Cerrar sesión
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Usuarios -->
                <div class="admin-item shadow-md p-4">
                    <h3 class="text-xl font-bold mb-3 text-[var(--color-soft-orange)]">👤 Usuarios</h3>
                    <div id="usuarios" class="text-sm"></div>
                </div>

                <!-- Playlists -->
                <div class="admin-item shadow-md p-4">
                    <h3 class="text-xl font-bold mb-3 text-[var(--color-soft-orange)]">🎵 Playlists</h3>
                    <div id="playlists" class="text-sm"></div>
                </div>

                <!-- Actividades Musicales -->
                <div class="admin-item shadow-md p-4 col-span-1 md:col-span-3">
                    <h3 class="text-xl font-bold mb-3 text-[var(--color-soft-orange)]">📀 Actividades Musicales</h3>
                    <div id="actividades" class="text-sm"></div>
                </div>

            </div>

            <p id="mensaje" class="mt-4 text-center"></p>

        </section>
    `;

    const mensaje = document.getElementById("mensaje");

    //Secion
    const { data: { user },error:authError }=await supabase.auth.getUser();

    if (authError||!user){
        app.innerHTML = `<p class="warning-text text-center">⚠️ Debes iniciar sesión.</p>`;
        return;
    }

    // Validar rol
    const { data: usuarioActual,error:errorUsuario } =await supabase
        .from("usuarios")
        .select("*")
        .eq("correo", user.email)
        .single();

    if (errorUsuario||!usuarioActual||usuarioActual.rol?.toLowerCase()!=="admin"){
        app.innerHTML = `<p class="warning-text text-center">⚠️ No tienes permisos de administrador.</p>`;
        return;
    }

    //Usuarios
    const usuariosDiv = document.getElementById("usuarios");

    const { data:usuarios,error:errorUsuarios}=await supabase
        .from("usuarios")
        .select("id, nombre, correo, telefono")
        .order("nombre", { ascending: true });

    if (errorUsuarios){
        usuariosDiv.innerHTML = `<p class="warning-text">Error cargando usuarios.</p>`;
    } else if (!usuarios.length) {
        usuariosDiv.innerHTML = `<p>No hay usuarios registrados.</p>`;
    } else {
        usuariosDiv.innerHTML = `
            <ul class="space-y-2">
                ${usuarios.map(u => `
                    <li class="p-3 bg-[var(--color-graphite)] rounded flex justify-between items-center">
                        <div>
                            <strong>${u.nombre}</strong><br>
                            <small>${u.correo}</small><br>
                            <small>${u.telefono || "Sin teléfono"}</small>
                        </div>
                        <button 
                            class="custom-btn pressable borrar-usuario text-xs px-3 py-1" 
                            data-id="${u.id}">
                            🗑
                        </button>
                    </li>
                `).join("")}
            </ul>
        `;
    }

    //Playlist
    const playlistsDiv = document.getElementById("playlists");

    const { data: playlists, error: errorPL } = await supabase
        .from("playlists")
        .select("*")
        .order("fecha_creacion", { ascending: false });
    if (errorPL){
        playlistsDiv.innerHTML = `<p class="warning-text">Error cargando playlists.</p>`;
    } else if (!playlists.length) {
        playlistsDiv.innerHTML=`<p>No hay playlists creadas.</p>`;
    } else {
        playlistsDiv.innerHTML=`
            <ul class="space-y-3">
                ${playlists.map(pl => `
                    <li class="p-3 bg-[var(--color-graphite)] rounded">
                        <strong>${pl.nombre}</strong><br>
                        <small>${pl.descripcion || "Sin descripción"}</small><br>
                        <small>Creada: ${pl.fecha_creacion}</small>
                    </li>
                `).join("")}
            </ul>
        `;
    }

    //Actividades
const actividadesDiv=document.getElementById("actividades");

const {data:actividades, error: errorAct } = await supabase
    .from("actividades_musicales")
    .select("*")   // ← CONSULTA SIMPLE SIN RELACIONES
    .order("creado_en", { ascending: false });

if (errorAct){
    actividadesDiv.innerHTML=`<p class="warning-text">Error cargando actividades.</p>`;
} else if (!actividades.length){
    actividadesDiv.innerHTML=`<p>No hay actividades registradas.</p>`;
} else {
    actividadesDiv.innerHTML=`
        <ul class="space-y-4">
            ${actividades.map(act =>`
                <li class="p-4 bg-[var(--color-graphite)] rounded shadow-md">
                    <strong class="text-lg">${act.titulo}</strong>
                    <span class="text-[var(--color-soft-orange)]">(${act.tipo})</span>
                    <p class="mt-1">${act.descripcion || ""}</p>
                    <small class="block mt-1">
                        📌 ID Actividad: ${act.id}
                    </small>

                    <small class="block">
                        🎵 Playlist ID: ${act.playlist_id || "N/A"}
                    </small>

                    <small class="block">
                        👤 Usuario ID: ${act.usuario_id || "N/A"}
                    </small>
                    ${act.imagen ? `
                        <img src="${act.imagen}" class="mt-3 rounded w-40 shadow-lg">
                    ` : ""}

                    <!-- Botón borrar -->
                    <button 
                        class="custom-btn pressable borrar-actividad mt-3 px-3 py-1 text-xs"
                        data-id="${act.id}">
                        🗑 Eliminar
                    </button>
                </li>
            `).join("")}
        </ul>
    `;
}

//Borrar actividad
document.querySelectorAll(".borrar-actividad").forEach(btn =>{
    btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm("¿Eliminar esta actividad?")) return;
        const { error } = await supabase
            .from("actividades_musicales")
            .delete()
            .eq("id", id);
        mensaje.textContent = error
            ? "❌ Error eliminando actividad."
            : "✅ Actividad eliminada.";
        if (!error) setTimeout(() => mostrarAdmin(), 700);
    });
});


    // Borrar Usuariio
    document.querySelectorAll(".borrar-usuario").forEach(btn =>{
        btn.addEventListener("click", async()=>{
            const id = btn.dataset.id;

            if (!confirm("¿Eliminar este usuario?")) return;
            const { error } = await supabase
                .from("usuarios")
                .delete()
                .eq("id", id);

            mensaje.textContent=error
                ? "❌ Error eliminando usuario."
                : "✅ Usuario eliminado.";

            if (!error) setTimeout(() => mostrarAdmin(), 700);
        });
    });

    //Guardar tipos
    document.getElementById("guardar-tipos")?.addEventListener("click", async () => {
        let errores = 0;

        const selects = document.querySelectorAll(".tipo-input");

        for (const s of selects) {
            const { error } = await supabase
                .from("actividades_musicales")
                .update({ tipo: s.value })
                .eq("id", s.dataset.id);

            if (error) errores++;
        }

        mensaje.textContent = errores
            ? "⚠️ Algunos cambios no se guardaron."
            : "✅ Cambios guardados correctamente.";
    });

    // Cerrar seccion :>
    document.getElementById("volver-login").addEventListener("click",async()=>{
        await supabase.auth.signOut();
        app.style.display = "none";
        mostrarLogin();
    });

}