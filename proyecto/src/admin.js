// admin.js
import { supabase } from "./supabase.js";

/**
 * Panel Administrativo adaptado para tu proyecto musical
 * Tablas:
 * - usuarios
 * - playlists
 * - actividades_musicales
 */

export async function mostrarAdmin() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <h2>Panel Administrativo</h2>

        <section id="panel">
            <div id="usuarios"></div>
            <div id="playlists"></div>
            <div id="actividades"></div>
            <p id="mensaje"></p>
        </section>
    `;

    const mensaje = document.getElementById("mensaje");
    const usuariosDiv = document.getElementById("usuarios");
    const playlistsDiv = document.getElementById("playlists");
    const actividadesDiv = document.getElementById("actividades");

    // -----------------------------
    // ✔ Obtener usuario actual
    // -----------------------------
    const { data: { user } } = await supabase.auth.getUser();

    // -----------------------------
    // ✔ Validación de administrador
    // -----------------------------
    if (!user || user.email !== "camilo.alarconm@uniagustiniana.edu.co") {   // VALIDACIÓN AÑADIDA AQUÍ PARA EL ADMINISTRADOOOR
        app.innerHTML = `<p>⚠️ No tienes permisos de administrador.</p>`;
        return;
    }

    // -----------------------------
    // ✔ Cargar usuarios
    // -----------------------------
    const { data: usuarios, error: errorUsuarios } = await supabase
        .from("usuarios")
        .select("id, nombre, correo, telefono")
        .order("nombre", { ascending: true });

    if (errorUsuarios) {
        usuariosDiv.innerHTML = `<p>Error cargando usuarios: ${errorUsuarios.message}</p>`;
    } else {
        usuariosDiv.innerHTML = `
            <h3>👤 Lista de Usuarios</h3>
            ${
                usuarios.length === 0
                ? "<p>No hay usuarios registrados.</p>"
                : `<ul>
                ${usuarios.map(u => `
                    <li>
                        <strong>${u.nombre}</strong> (${u.correo}) — ${u.telefono || "Sin teléfono"}
                        <button class="borrar-usuario" data-id="${u.id}">🗑 Eliminar</button>
                    </li>
                `).join("")}
            </ul>`
            }
        `;
    }

    // -----------------------------
    // ✔ Cargar playlists
    // -----------------------------
    const { data: playlists, error: errorPL } = await supabase
        .from("playlists")
        .select("id, nombre, descripcion, fecha_creacion")
        .order("fecha_creacion", { ascending: false });

    playlistsDiv.innerHTML = `
        <h3>🎵 Playlists</h3>
        ${
            errorPL
            ? `<p>Error: ${errorPL.message}</p>`
            : playlists.length === 0
                ? "<p>No hay playlists creadas.</p>"
                : `<ul>
                    ${playlists.map(pl => `
                        <li>
                            <strong>${pl.nombre}</strong> — ${pl.descripcion || "Sin descripción"}
                            <br><small>Creada: ${pl.fecha_creacion}</small>
                        </li>
                    `).join("")}
                </ul>`
        }
    `;

    // -----------------------------
    // ✔ Cargar actividades musicales
    // -----------------------------
    const { data: actividades, error: errorAct } = await supabase
        .from("actividades_musicales")
        .select(`
            id,
            titulo,
            descripcion,
            tipo,
            imagen,
            creado_en,
            usuarios (id, nombre, correo),
            playlists (id, nombre)
        `)
        .order("creado_en", { ascending: false });

    if (errorAct) {
        actividadesDiv.innerHTML = `<p>Error cargando actividades: ${errorAct.message}</p>`;
        return;
    }

    actividadesDiv.innerHTML = `
        <h3>🎼 Actividades Musicales</h3>

        ${
            actividades.length === 0
            ? "<p>No hay actividades registradas.</p>"
            : `<ul>
                ${actividades.map(act => `
                    <li style="margin-bottom:14px; border-bottom: 1px solid #ccc; padding-bottom:10px;">
                        <strong>${act.titulo}</strong> (${act.tipo})
                        <br>
                        <small>Usuario: ${act.usuarios?.nombre || "Desconocido"}</small>
                        <br>
                        <small>Playlist: ${act.playlists?.nombre || "Sin playlist"}</small>
                        <p>${act.descripcion || ""}</p>

                        ${act.imagen ? `
                            <img src="${act.imagen}" style="width:150px; margin-top:6px; border-radius:6px;">
                        ` : ""}
                        
                        <div style="margin-top:6px;">
                            Tipo:
                            <select class="tipo-input" data-id="${act.id}">
                                <option value="tarea" ${act.tipo === "tarea" ? "selected" : ""}>Tarea</option>
                                <option value="proyecto" ${act.tipo === "proyecto" ? "selected" : ""}>Proyecto</option>
                                <option value="album" ${act.tipo === "album" ? "selected" : ""}>Álbum</option>
                                <option value="single" ${act.tipo === "single" ? "selected" : ""}>Single</option>
                            </select>
                        </div>
                    </li>
                `).join("")}
            </ul>
            <button id="guardar-tipos" style="margin-top:10px;">💾 Guardar cambios</button>`
        }
    `;

    // -----------------------------
    // 🗑 Eliminar usuario
    // -----------------------------
    document.querySelectorAll(".borrar-usuario").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;

            if (!confirm("¿Eliminar este usuario? Se eliminarán playlists y actividades si están en CASCADE.")) return;

            const { error } = await supabase.from("usuarios").delete().eq("id", id);

            if (error) {
                mensaje.textContent = "❌ Error eliminando usuario: " + error.message;
            } else {
                mensaje.textContent = "✅ Usuario eliminado.";
                setTimeout(() => mostrarAdmin(), 800);
            }
        });
    });

    // -----------------------------
    // 💾 Guardar cambios de tipo
    // -----------------------------
    document.getElementById("guardar-tipos")?.addEventListener("click", async () => {

        const selects = document.querySelectorAll(".tipo-input");
        let errores = 0;

        for (const s of selects) {
            const id = s.dataset.id;
            const tipo = s.value;

            const { error } = await supabase
                .from("actividades_musicales")
                .update({ tipo })
                .eq("id", id);

            if (error) errores++;
        }

        mensaje.textContent = errores
            ? "⚠️ Algunos cambios no se guardaron."
            : "✅ Cambios guardados correctamente.";
    });
}
