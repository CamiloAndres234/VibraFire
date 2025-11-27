// src/admin.js
import { supabase } from './supabase.js';

// ======================================================================
// CONFIGURACIÓN Y ESTADO
// ======================================================================

const ADMIN_EMAIL = 'camiloalarcon.4114@gmail.com'; 
let currentTable = 'usuarios'; 

// ----------------------------------------------------------------------
// 1. Lógica Principal de Carga (Exportada)
// ----------------------------------------------------------------------

export async function cargarDatosAdmin() {
    const adminContent = document.getElementById('admin-screen-content');
    if (!adminContent) return;

    // 1. Obtener usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Validación de seguridad
    if (!user || user.email !== ADMIN_EMAIL) {
        adminContent.innerHTML = `
            <div class="h-screen flex flex-col items-center justify-center p-6 bg-graphite">
                <i class="fas fa-lock text-crimson text-5xl mb-4"></i>
                <h2 class="text-2xl font-bold text-white mb-2">Acceso Restringido</h2>
                <p class="text-fog-gray text-center mb-6">Esta zona es solo para administradores.</p>
                <button onclick="document.querySelector('.nav-item[data-screen=\\'home\\']').click()" 
                    class="custom-btn px-6">Volver al Inicio</button>
            </div>
        `;
        return;
    }

    // 3. Renderizar Estructura del Panel si es la primera vez
    if (!document.getElementById('admin-header-title')) {
        renderAdminStructure(adminContent, user);
        loadTableData(currentTable);
    }
}

// ----------------------------------------------------------------------
// 2. Estructura e Interfaz (Incluye el MODAL)
// ----------------------------------------------------------------------

function renderAdminStructure(container, user) {
    container.innerHTML = `
        <div class="gradient-header p-6 pb-8">
            <div class="flex justify-between items-start">
                <div>
                    <h1 id="admin-header-title" class="text-3xl font-bold mb-1">Panel Admin</h1>
                    <p class="text-white opacity-80 text-sm">Logueado como: ${user.email}</p>
                </div>
                <button id="admin-logout-btn" class="bg-black bg-opacity-30 p-2 rounded-full hover:bg-opacity-50 transition">
                   <i class="fas fa-sign-out-alt text-white"></i>
                </button>
            </div>
        </div>

        <div class="px-4 -mt-6">
            <div class="bg-graphite rounded-xl shadow-lg p-2 flex justify-between space-x-2 overflow-x-auto hide-scrollbar border border-gray-700">
                <button onclick="window.switchAdminTab('usuarios')" 
                    class="tab-btn flex-1 py-2 px-4 rounded-lg text-sm font-medium transition text-center whitespace-nowrap ${currentTable === 'usuarios' ? 'bg-bright-orange text-white shadow-md' : 'text-fog-gray hover:text-white'}">
                    Usuarios
                </button>
                <button onclick="window.switchAdminTab('playlists')" 
                    class="tab-btn flex-1 py-2 px-4 rounded-lg text-sm font-medium transition text-center whitespace-nowrap ${currentTable === 'playlists' ? 'bg-bright-orange text-white shadow-md' : 'text-fog-gray hover:text-white'}">
                    Playlists
                </button>
                <button onclick="window.switchAdminTab('actividades_musicales')" 
                    class="tab-btn flex-1 py-2 px-4 rounded-lg text-sm font-medium transition text-center whitespace-nowrap ${currentTable === 'actividades_musicales' ? 'bg-bright-orange text-white shadow-md' : 'text-fog-gray hover:text-white'}">
                    Actividad
                </button>
            </div>
        </div>

        <div id="admin-data-container" class="p-4 pb-24 space-y-4 min-h-[300px]">
            <div class="text-center py-10"><i class="fas fa-circle-notch fa-spin text-bright-orange"></i></div>
        </div>

        <div id="user-edit-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm hidden p-4">
            <div class="bg-graphite w-full max-w-md rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
                <div class="gradient-header p-4">
                    <h3 class="text-xl font-bold text-white">Editar Usuario</h3>
                </div>
                <div class="p-6 space-y-4">
                    <input type="hidden" id="edit-user-id">
                    
                    <div>
                        <label class="block text-xs text-fog-gray mb-1">Nombre Completo</label>
                        <input type="text" id="edit-user-nombre" class="form-input w-full bg-gray-800 border-gray-600 text-white focus:border-bright-orange">
                    </div>

                    <div>
                        <label class="block text-xs text-fog-gray mb-1">Correo Electrónico</label>
                        <input type="text" id="edit-user-correo" class="form-input w-full bg-gray-800 border-gray-600 text-white focus:border-bright-orange">
                    </div>

                    <div>
                        <label class="block text-xs text-fog-gray mb-1">Teléfono</label>
                        <input type="text" id="edit-user-telefono" class="form-input w-full bg-gray-800 border-gray-600 text-white focus:border-bright-orange">
                    </div>

                    <div>
                        <label class="block text-xs text-fog-gray mb-1">Rol</label>
                        <select id="edit-user-rol" class="form-input w-full bg-gray-800 border-gray-600 text-white focus:border-bright-orange">
                            <option value="user">User (Usuario Normal)</option>
                            <option value="admin">Admin (Administrador)</option>
                        </select>
                    </div>

                    <div class="flex space-x-3 pt-2">
                        <button onclick="document.getElementById('user-edit-modal').classList.add('hidden')" 
                            class="flex-1 py-2 rounded text-white bg-gray-600 hover:bg-gray-500 font-medium transition">Cancelar</button>
                        <button onclick="window.saveUserChanges()" 
                            class="flex-1 py-2 rounded text-white bg-bright-orange hover:bg-orange-600 font-medium transition shadow-lg">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Listener para Logout
    document.getElementById('admin-logout-btn').addEventListener('click', async () => {
        if(confirm('¿Cerrar sesión de administrador?')) {
            await supabase.auth.signOut();
        }
    });
}

// ----------------------------------------------------------------------
// 3. Lógica de Datos (Cargar Tablas)
// ----------------------------------------------------------------------

window.switchAdminTab = (tableName) => {
    currentTable = tableName;
    // Actualizar estilos de los botones (tabs)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const text = btn.innerText.toLowerCase();
        const keyword = tableName.split('_')[0]; 
        if (text.includes(keyword) || (tableName === 'actividades_musicales' && text.includes('actividad'))) {
            btn.className = 'tab-btn flex-1 py-2 px-4 rounded-lg text-sm font-medium transition text-center whitespace-nowrap bg-bright-orange text-white shadow-md';
        } else {
            btn.className = 'tab-btn flex-1 py-2 px-4 rounded-lg text-sm font-medium transition text-center whitespace-nowrap text-fog-gray hover:text-white';
        }
    });
    loadTableData(tableName);
};

async function loadTableData(tableName) {
    const container = document.getElementById('admin-data-container');
    container.innerHTML = '<div class="text-center py-10 text-fog-gray"><i class="fas fa-sync fa-spin mr-2"></i> Cargando datos...</div>';

    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('creado_en', { ascending: false });

    if (error) {
        container.innerHTML = `<div class="p-4 bg-crimson bg-opacity-20 border border-crimson rounded text-white text-center">Error: ${error.message}</div>`;
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="text-center py-10 text-fog-gray">No hay registros encontrados.</div>';
        return;
    }

    if (tableName === 'usuarios') renderUsuarios(data, container);
    else if (tableName === 'playlists') renderPlaylists(data, container);
    else if (tableName === 'actividades_musicales') renderActividades(data, container);
}

// ----------------------------------------------------------------------
// 4. Renderizadores
// ----------------------------------------------------------------------

function renderUsuarios(users, container) {
    container.innerHTML = users.map(u => {
        // Preparamos los datos seguros para pasar a la función onclick
        // Usamos replace para evitar romper el string si hay comillas simples
        const safeName = (u.nombre || '').replace(/'/g, "\\'");
        const safeEmail = (u.correo || '').replace(/'/g, "\\'");
        const safePhone = (u.telefono || '').replace(/'/g, "\\'");
        const safeRol = (u.rol || 'user');

        return `
        <div class="card bg-graphite p-4 rounded-lg border border-gray-700 flex flex-col gap-3 animate-fade-in">
            <div class="flex items-start justify-between">
                <div class="flex items-center space-x-3 overflow-hidden">
                    <div class="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 border-2 border-gray-500">
                        ${(u.nombre || '?').charAt(0).toUpperCase()}
                    </div>
                    <div class="min-w-0">
                        <h3 class="font-bold text-white text-lg truncate">${u.nombre || 'Sin nombre'}</h3>
                        <span class="text-xs uppercase tracking-wider ${u.rol === 'admin' ? 'bg-crimson text-white' : 'bg-gray-800 text-bright-orange'} px-2 py-0.5 rounded border border-gray-600 inline-block mb-1">
                            ${u.rol || 'user'}
                        </span>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="window.openEditUserModal('${u.id}', '${safeName}', '${safeEmail}', '${safePhone}', '${safeRol}')" 
                        class="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition">
                        <i class="fas fa-pen text-xs"></i>
                    </button>
                    <button onclick="window.deleteItem('usuarios', '${u.id}')" 
                        class="w-8 h-8 rounded-full bg-crimson hover:bg-red-500 flex items-center justify-center text-white transition">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
            
            <div class="bg-black bg-opacity-20 p-3 rounded text-sm space-y-1 border border-gray-800">
                <div class="flex justify-between">
                    <span class="text-fog-gray"><i class="fas fa-envelope mr-2"></i>Correo:</span>
                    <span class="text-white text-right truncate max-w-[150px]">${u.correo || '-'}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-fog-gray"><i class="fas fa-phone mr-2"></i>Teléfono:</span>
                    <span class="text-white text-right">${u.telefono || '-'}</span>
                </div>
                <div class="flex justify-between border-t border-gray-700 pt-1 mt-1">
                    <span class="text-fog-gray text-xs">ID:</span>
                    <span class="text-gray-500 text-xs font-mono">${u.id.substring(0,8)}...</span>
                </div>
            </div>
        </div>
    `}).join('');
}

function renderPlaylists(playlists, container) {
    // Mantengo la edición simple (prompt) para playlists ya que no pediste cambios aquí
    container.innerHTML = playlists.map(pl => `
        <div class="card bg-graphite p-0 rounded-lg border border-gray-700 overflow-hidden animate-fade-in flex">
            <div class="w-24 bg-gray-800 relative flex-shrink-0">
                 <img src="${pl.imagen_url || 'https://via.placeholder.com/150'}" class="w-full h-full object-cover opacity-70">
                 <div class="absolute inset-0 flex items-center justify-center"><i class="fas fa-music text-white opacity-50"></i></div>
            </div>
            <div class="p-3 flex-1 flex flex-col justify-between">
                <div>
                    <h3 class="font-bold text-white leading-tight">${pl.nombre}</h3>
                    <p class="text-xs text-fog-gray mt-1 line-clamp-2">${pl.descripcion || 'Sin descripción'}</p>
                </div>
                <div class="flex justify-end space-x-2 mt-2">
                     <button onclick="window.editGenericItem('playlists', '${pl.id}', 'nombre', '${pl.nombre}')" class="text-xs text-blue-400 px-2 py-1 border border-blue-400 rounded hover:bg-blue-400 hover:text-white transition">Editar</button>
                     <button onclick="window.deleteItem('playlists', '${pl.id}')" class="text-xs text-crimson px-2 py-1 border border-crimson rounded hover:bg-crimson hover:text-white transition">Borrar</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderActividades(activities, container) {
    container.innerHTML = activities.map(act => `
        <div class="card bg-graphite p-3 rounded-lg border border-gray-700 flex items-center space-x-3 animate-fade-in">
             <div class="bg-soft-orange bg-opacity-20 w-10 h-10 flex items-center justify-center rounded-full text-bright-orange flex-shrink-0">
                <i class="fas fa-history"></i>
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="text-white font-medium text-sm truncate">${act.titulo || 'Actividad'}</h4>
                <p class="text-xs text-fog-gray truncate">${act.artista || 'Desconocido'}</p>
            </div>
            <button onclick="window.deleteItem('actividades_musicales', '${act.id}')" class="text-gray-500 hover:text-crimson transition p-2">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// ----------------------------------------------------------------------
// 5. Funciones del MODAL y CRUD (Globales)
// ----------------------------------------------------------------------

// A. Abrir Modal con datos cargados
window.openEditUserModal = (id, nombre, correo, telefono, rol) => {
    // 1. Rellenar los campos del modal
    document.getElementById('edit-user-id').value = id;
    document.getElementById('edit-user-nombre').value = nombre;
    document.getElementById('edit-user-correo').value = correo;
    document.getElementById('edit-user-telefono').value = telefono;
    document.getElementById('edit-user-rol').value = rol;

    // 2. Mostrar el modal
    document.getElementById('user-edit-modal').classList.remove('hidden');
};

// B. Guardar cambios desde el Modal
window.saveUserChanges = async () => {
    const id = document.getElementById('edit-user-id').value;
    const nombre = document.getElementById('edit-user-nombre').value;
    const correo = document.getElementById('edit-user-correo').value;
    const telefono = document.getElementById('edit-user-telefono').value;
    const rol = document.getElementById('edit-user-rol').value;

    // Indicador de carga visual en el botón
    const btn = document.querySelector('#user-edit-modal button[onclick="window.saveUserChanges()"]');
    const originalText = btn.innerText;
    btn.innerText = 'Guardando...';
    btn.disabled = true;

    // Actualizar en Supabase
    const { error } = await supabase
        .from('usuarios')
        .update({ 
            nombre: nombre,
            correo: correo,
            telefono: telefono,
            rol: rol
        })
        .eq('id', id);

    if (error) {
        alert('Error al actualizar: ' + error.message);
    } else {
        // Cerrar modal y recargar
        document.getElementById('user-edit-modal').classList.add('hidden');
        loadTableData('usuarios');
    }

    // Restaurar botón
    btn.innerText = originalText;
    btn.disabled = false;
};

// C. Función genérica de eliminar (Para todas las tablas)
window.deleteItem = async (table, id) => {
    if(!confirm('¿Estás seguro de eliminar este registro?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if(error) alert('Error: ' + error.message);
    else loadTableData(table); 
};

// D. Edición simple (Solo para Playlists u otros si se necesita)
window.editGenericItem = async (table, id, field, currentValue) => {
    const newValue = prompt(`Editar ${field}:`, currentValue);
    if(newValue === null || newValue === currentValue) return;

    const updateObj = {};
    updateObj[field] = newValue;

    const { error } = await supabase.from(table).update(updateObj).eq('id', id);
    if(error) alert('Error: ' + error.message);
    else loadTableData(table);
};