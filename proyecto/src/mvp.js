import { supabase } from './supabase.js';

const TABLE_NAME = 'actividades_musicales'; 
const PLAYLISTS_TABLE = 'playlists';
let currentEditingId = null;

// ----------------------------------------------------------------------
// 1. Estilos CSS dinámicos
// ----------------------------------------------------------------------
const style = document.createElement('style');
style.innerHTML = `
    .fade-in { animation: fadeIn 0.5s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .action-btn { transition: all 0.2s; }
    .action-btn:hover { transform: scale(1.1); }
`;
document.head.appendChild(style);

// ----------------------------------------------------------------------
// 2. Funciones de Renderizado
// ----------------------------------------------------------------------

function generarEstrellas(calificacion) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        const colorClass = i <= calificacion ? 'text-bright-orange' : 'text-fog-gray';
        const iconType = i <= calificacion ? 'fas' : 'far';
        html += `<i class="${iconType} fa-star ${colorClass}"></i>`;
    }
    return html;
}

function renderizarActividades(actividades) {
    const listaContenedor = document.getElementById('lista-actividades-contenedor');
    
    if (!listaContenedor) return;

    if (actividades.length === 0) {
        listaContenedor.innerHTML = '<p class="text-center text-fog-gray mt-4 fade-in">No tienes actividades registradas en esta playlist.</p>';
        return;
    }

    listaContenedor.innerHTML = actividades.map(actividad => {
        // Serializamos el objeto para pasarlo al botón de editar
        const dataJson = JSON.stringify(actividad).replace(/"/g, '&quot;');
        
        // Intentamos obtener el nombre de la playlist si viene en la respuesta (depende de tu consulta)
        // Si no viene unido, mostramos un texto genérico o el tipo
        const etiqueta = actividad.playlists ? actividad.playlists.nombre : (actividad.tipo || 'General');

        return `
        <li class="p-4 bg-graphite rounded-lg shadow-md flex gap-4 transition hover:bg-graphite/80 fade-in relative group">
            
            <div class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-fog-gray/20">
                <img src="${actividad.imagen || 'https://via.placeholder.com/150'}" 
                     alt="${actividad.titulo}" 
                     class="w-full h-full object-cover"
                     onerror="this.src='https://via.placeholder.com/150'"/>
            </div>

            <div class="flex-grow flex flex-col justify-center">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-xs uppercase tracking-wide text-soft-orange font-semibold">
                            <i class="fas fa-list-ul"></i> ${etiqueta}
                        </span>
                        <h3 class="text-xl font-bold text-white leading-tight">${actividad.titulo}</h3>
                    </div>
                </div>
                
                <p class="text-sm text-fog-gray mt-1 line-clamp-2">${actividad.descripcion || ''}</p>
                
                <div class="text-sm mt-2 flex items-center gap-2">
                    <span class="flex text-yellow-500">${generarEstrellas(actividad.calificacion || 0)}</span>
                </div>
            </div>

            <div class="flex flex-col gap-2 justify-center ml-2 border-l border-fog-gray/20 pl-3">
                <button class="action-btn text-blue-400 hover:text-blue-300 btn-editar" data-actividad="${dataJson}">
                    <i class="fas fa-edit fa-lg"></i>
                </button>
                <button class="action-btn text-red-400 hover:text-red-300 btn-eliminar" data-id="${actividad.id}">
                    <i class="fas fa-trash-alt fa-lg"></i>
                </button>
            </div>
        </li>
    `}).join('');
}

// ----------------------------------------------------------------------
// 3. Lógica de Datos (CRUD)
// ----------------------------------------------------------------------

// NUEVA FUNCIÓN: Cargar Playlists para el Select
async function cargarPlaylistsEnSelect() {
    const select = document.querySelector('select[name="playlist_id"]');
    if (!select) return;

    const { data: playlists, error } = await supabase
        .from(PLAYLISTS_TABLE)
        .select('id, nombre')
        .order('nombre', { ascending: true });

    if (error) {
        console.error("Error cargando playlists:", error);
        select.innerHTML = '<option value="" disabled>Error cargando playlists</option>';
        return;
    }

    let opciones = '<option value="" disabled selected>Selecciona una Playlist...</option>';
    playlists.forEach(p => {
        opciones += `<option value="${p.id}">${p.nombre}</option>`;
    });
    select.innerHTML = opciones;
}

async function cargarActividades() {
    const listaContenedor = document.getElementById('lista-actividades-contenedor');
    if (listaContenedor) listaContenedor.innerHTML = '<div class="text-center text-fog-gray mt-4"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
         if (listaContenedor) listaContenedor.innerHTML = '<p class="text-center text-red-400 mt-4">Usuario no autenticado.</p>';
         return;
    }

    // Hacemos un JOIN con la tabla playlists para sacar el nombre de la playlist
    const { data, error } = await supabase
        .from(TABLE_NAME) 
        .select(`
            id, 
            titulo, 
            descripcion, 
            tipo, 
            imagen, 
            calificacion, 
            creado_en, 
            playlist_id,
            playlists ( nombre ) 
        `) 
        .eq('usuario_id', user.id) 
        .order('creado_en', { ascending: false }); 

    if (error) {
        console.error('Error:', error);
        if (listaContenedor) listaContenedor.innerHTML = `<p class="text-red-400">Error: ${error.message}</p>`;
        return;
    }

    renderizarActividades(data);
}

async function eliminarActividad(id) {
    if(!confirm("¿Estás seguro de que deseas eliminar esta actividad?")) return;

    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

    if (error) {
        alert("Error al eliminar: " + error.message);
    } else {
        cargarActividades(); 
    }
}

function cargarFormularioParaEditar(actividad) {
    const form = document.getElementById('activity-form');
    if (!form) return;

    form.titulo.value = actividad.titulo;
    form.imagen.value = actividad.imagen || '';
    form.descripcion.value = actividad.descripcion || '';
    
    // Asignar la playlist seleccionada
    if (actividad.playlist_id) {
        form.playlist_id.value = actividad.playlist_id;
    }

    // Establecer estrellas
    const starContainer = document.getElementById('rating-stars');
    starContainer.dataset.rating = actividad.calificacion || 0;
    actualizarVisualEstrellas(actividad.calificacion || 0);

    currentEditingId = actividad.id;
    const btnSubmit = form.querySelector('button[type="submit"]');
    btnSubmit.textContent = "Actualizar Actividad";
    btnSubmit.classList.remove('custom-btn'); 
    btnSubmit.classList.add('bg-blue-600', 'hover:bg-blue-500', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded');
    
    form.scrollIntoView({ behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// 4. Manejadores de Eventos
// ----------------------------------------------------------------------

function actualizarVisualEstrellas(rating) {
    const starContainer = document.getElementById('rating-stars');
    const icons = starContainer.querySelectorAll('i');
    icons.forEach(icon => {
        const val = parseInt(icon.dataset.value);
        if (val <= rating) {
            icon.classList.remove('far', 'text-fog-gray');
            icon.classList.add('fas', 'text-bright-orange');
        } else {
            icon.classList.remove('fas', 'text-bright-orange');
            icon.classList.add('far', 'text-fog-gray');
        }
    });
}

function handleStarRating(e) {
    const starContainer = document.getElementById('rating-stars');
    const selectedRating = parseInt(e.currentTarget.dataset.value);
    starContainer.dataset.rating = selectedRating; 
    actualizarVisualEstrellas(selectedRating);
}

async function handleGuardarActividad(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validar playlist
    const playlistId = form.playlist_id.value;
    if(!playlistId || playlistId === "") {
        alert("Por favor selecciona una Playlist.");
        return;
    }

    // --- CORRECCIÓN REALIZADA AQUÍ ---
    // Hemos puesto "Canción" exactamente como lo espera tu base de datos
    const TIPO_POR_DEFECTO = 'Canción'; 

    const datos = {
        titulo: form.titulo.value.trim(),
        descripcion: form.descripcion.value.trim(),
        tipo: TIPO_POR_DEFECTO, 
        playlist_id: playlistId,
        imagen: form.imagen.value.trim(),
        calificacion: parseInt(document.getElementById('rating-stars').dataset.rating || '0')
    };
    
    if (!datos.titulo) {
        alert("El título es obligatorio.");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = currentEditingId ? "Actualizando..." : "Guardando...";

    const { data: { user } } = await supabase.auth.getUser();

    let error;

    if (currentEditingId) {
        // UPDATE
        const { error: updateError } = await supabase
            .from(TABLE_NAME)
            .update(datos)
            .eq('id', currentEditingId);
        error = updateError;
    } else {
        // INSERT
        datos.usuario_id = user.id;
        const { error: insertError } = await supabase
            .from(TABLE_NAME)
            .insert(datos);
        error = insertError;
    }

    submitBtn.disabled = false;

    if (error) {
        console.error(error);
        if(error.message.includes('check constraint')) {
            // Mensaje de ayuda actualizado
            alert(`Error: La base de datos rechazó el tipo '${TIPO_POR_DEFECTO}'. \n\nAsegúrate de que tu tabla acepte la palabra "Canción" (con tilde y mayúscula).`);
        } else {
            alert('Error al guardar: ' + error.message);
        }
        submitBtn.textContent = currentEditingId ? "Actualizar Actividad" : "Guardar Actividad";
    } else {
        form.reset();
        currentEditingId = null;
        document.getElementById('rating-stars').dataset.rating = '0';
        actualizarVisualEstrellas(0);
        submitBtn.textContent = "Guardar Actividad";
        submitBtn.className = "custom-btn w-full py-3 text-lg font-bold shadow-lg transform active:scale-95 transition"; 
        
        cargarActividades();
    }
}

// ----------------------------------------------------------------------
// 5. Inicialización
// ----------------------------------------------------------------------

export function inicializarActividades() {
    const activityScreen = document.getElementById('activities-screen');
    if (!activityScreen) return;

    // AQUI CAMBIAMOS EL INPUT TIPO POR EL SELECT DE PLAYLIST_ID
    activityScreen.innerHTML = `
        <div class="p-6 max-w-4xl mx-auto fade-in">
            <h1 class="text-3xl font-bold mb-6 text-bright-orange flex items-center gap-2">
                <i class="fas fa-music"></i> Mi Biblioteca Musical
            </h1>
            
            <form id="activity-form" class="bg-graphite p-6 rounded-xl shadow-lg mb-8 space-y-4 border border-fog-gray/10">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <input type="text" name="titulo" placeholder="Título (ej. Bohemian Rhapsody)" required class="form-input w-full bg-black/20 border-fog-gray/30 text-white p-3 rounded focus:border-bright-orange focus:ring-1 focus:ring-bright-orange outline-none transition" />
                    
                    <select name="playlist_id" required class="form-input w-full bg-black/20 border-fog-gray/30 text-white p-3 rounded focus:border-bright-orange focus:ring-1 focus:ring-bright-orange outline-none transition appearance-none">
                        <option value="" disabled selected>Cargando playlists...</option>
                    </select>

                </div>
                
                <input type="url" name="imagen" placeholder="URL de la portada (opcional)" class="form-input w-full bg-black/20 border-fog-gray/30 text-white p-3 rounded focus:border-bright-orange outline-none transition" />
                
                <textarea name="descripcion" placeholder="¿Qué te pareció? (Notas personales)" class="form-input w-full bg-black/20 border-fog-gray/30 text-white p-3 rounded focus:border-bright-orange outline-none transition" rows="3"></textarea>
                
                <div class="flex items-center justify-between bg-black/20 p-3 rounded">
                    <span class="text-fog-gray font-medium">Tu Calificación:</span>
                    <div id="rating-stars" data-rating="0" class="flex text-2xl cursor-pointer space-x-2">
                        <i class="far fa-star text-fog-gray hover:text-bright-orange transition duration-200" data-value="1"></i>
                        <i class="far fa-star text-fog-gray hover:text-bright-orange transition duration-200" data-value="2"></i>
                        <i class="far fa-star text-fog-gray hover:text-bright-orange transition duration-200" data-value="3"></i>
                        <i class="far fa-star text-fog-gray hover:text-bright-orange transition duration-200" data-value="4"></i>
                        <i class="far fa-star text-fog-gray hover:text-bright-orange transition duration-200" data-value="5"></i>
                    </div>
                </div>

                <button type="submit" class="custom-btn w-full py-3 text-lg font-bold shadow-lg transform active:scale-95 transition">
                    Guardar Actividad
                </button>
            </form>

            <div class="flex items-center gap-2 mb-4 border-b border-fog-gray/30 pb-2">
                <i class="fas fa-list text-fog-gray"></i>
                <h2 class="text-xl font-bold text-white">Tus Registros</h2>
            </div>
            
            <ul id="lista-actividades-contenedor" class="space-y-4 pb-10">
            </ul>
        </div>
    `;

    // Inicializar listeners
    const activityForm = document.getElementById('activity-form');
    document.getElementById('rating-stars').querySelectorAll('i').forEach(icon => {
        icon.addEventListener('click', handleStarRating);
    });
    activityForm.addEventListener('submit', handleGuardarActividad);

    const lista = document.getElementById('lista-actividades-contenedor');
    lista.addEventListener('click', (e) => {
        const btnEliminar = e.target.closest('.btn-eliminar');
        if (btnEliminar) {
            eliminarActividad(btnEliminar.dataset.id);
            return;
        }
        const btnEditar = e.target.closest('.btn-editar');
        if (btnEditar) {
            const actividad = JSON.parse(btnEditar.dataset.actividad);
            cargarFormularioParaEditar(actividad);
            return;
        }
    });

    // Carga de datos
    cargarPlaylistsEnSelect(); // <-- Cargamos las playlists en el select
    cargarActividades();
}