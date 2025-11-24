import { supabase } from './supabase.js';

export function mostrarMVP() {

  const app = document.getElementById('app');

  app.innerHTML = `
    <section>
      <h2>Registrar Actividad Musical</h2>

      <form id="actividad-form">

        <input type="text" name="titulo" placeholder="Título de la actividad" required />

        <textarea name="descripcion" placeholder="Descripción (opcional)"></textarea>

        <select name="tipo" required>
          <option value="nueva">Nueva canción</option>
          <option value="sesion">Sesión</option>
          <option value="album">Nuevo álbum</option>
          <option value="descubrimiento">Descubrimiento</option>
          <option value="otro">Otro</option>
        </select>

        <select name="playlist_id" id="select-playlist" required>
          <option value="">Cargando playlists...</option>
        </select>

        <input type="text" name="imagen" placeholder="URL de la imagen (opcional)" />

        <button type="submit">Guardar Actividad</button>
      </form>

      <p id="mensaje" style="text-align:center; margin-top:10px;"></p>

      <h3 style="margin-top:20px;">Mis Actividades Musicales</h3>
      <div id="lista-actividades"></div>

    </section>
  `;

  const form = document.getElementById('actividad-form');
  const mensaje = document.getElementById('mensaje');
  const lista = document.getElementById('lista-actividades');
  const selectPlaylist = document.getElementById('select-playlist');

  // -------------------------------
  // 🔹 Cargar playlists
  // -------------------------------
  async function cargarPlaylists() {

    const { data, error } = await supabase
      .from('playlists')
      .select('id, nombre')
      .order('nombre', { ascending: true });

    if (error) {
      selectPlaylist.innerHTML = `<option>Error al cargar playlists</option>`;
      return;
    }

    selectPlaylist.innerHTML = `<option value="">Selecciona una playlist</option>`;

    data.forEach(playlist => {
      const opt = document.createElement('option');
      opt.value = playlist.id;
      opt.textContent = playlist.nombre;
      selectPlaylist.appendChild(opt);
    });

  }

  // -------------------------------
  // 🔹 Cargar actividades del usuario
  // -------------------------------
  async function cargarActividades() {

    lista.innerHTML = 'Cargando actividades...';

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      mensaje.textContent = '⚠️ Debes iniciar sesión para ver tus actividades.';
      return;
    }

    const { data, error } = await supabase
      .from('actividades_musicales')
      .select('id, titulo, descripcion, tipo, imagen')
      .eq('usuario_id', user.id)
      .order('creado_en', { ascending: false });

    if (error) {
      lista.innerHTML = 'Error al cargar actividades.';
      return;
    }

    if (!data.length) {
      lista.innerHTML = '<p>No has registrado actividades aún.</p>';
      return;
    }

    lista.innerHTML = '';

    data.forEach(act => {
      const div = document.createElement('div');

      div.innerHTML = `
        <hr>
        <h4>${act.titulo}</h4>
        <p>${act.descripcion || ''}</p>
        <p><b>Tipo:</b> ${act.tipo}</p>
        ${act.imagen ? `<img src="${act.imagen}" width="200" />` : ''}
      `;

      lista.appendChild(div);
    });

  }

  // -------------------------------
  // 🔹 Subir nueva actividad
  // -------------------------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    mensaje.textContent = '';

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      mensaje.textContent = '⚠️ Debes iniciar sesión.';
      return;
    }

    const nuevaActividad = {
      titulo: form.titulo.value.trim(),
      descripcion: form.descripcion.value.trim(),
      tipo: form.tipo.value,
      playlist_id: form.playlist_id.value,
      imagen: form.imagen.value.trim() || null,
      usuario_id: user.id
    };

    const { error } = await supabase
      .from('actividades_musicales')
      .insert([nuevaActividad]);

    if (error) {
      mensaje.textContent = '❌ Error: ' + error.message;
      return;
    }

    mensaje.textContent = '✅ Actividad registrada correctamente';
    form.reset();
    cargarActividades();
  });

  // Inicialización
  cargarPlaylists();
  cargarActividades();
}
