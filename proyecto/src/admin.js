// src/admin.js
import { supabase } from './supabase.js';

const ADMIN_EMAIL = 'camiloalarcon.4114@gmail.com'; 
let currentTable = 'usuarios'; 

export async function cargarDatosAdmin() {
    const adminContent = document.getElementById('admin-screen-content');
    if (!adminContent) return;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
        adminContent.innerHTML = `
            <div class="h-screen flex flex-col items-center justify-center p-6 bg-graphite pb-24">
                <i class="fas fa-lock text-crimson text-5xl mb-4"></i>
                <h2 class="text-2xl font-bold text-white mb-2">Acceso Restringido</h2>
                <p class="text-fog-gray text-center mb-6">Esta zona es solo para administradores.</p>
                <button onclick="document.querySelector('.nav-item[data-screen=\\'home\\']').click()" 
                    class="custom-btn px-6">Volver al Inicio</button>
            </div>
        `;
        return;
    }

    if (!document.getElementById('admin-header-title')) {
        renderAdminStructure(adminContent, user);
        loadTableData(currentTable);
    }
}

function renderAdminStructure(container, user) {
    container.innerHTML = `
        <div class="gradient-header p-6 pb-10 shadow-lg">
            <div class="flex justify-between items-start pt-4">
                <div>
                    <h1 id="admin-header-title" class="text-3xl font-bold mb-1 text-white">Panel Admin</h1>
                    <p class="text-white opacity-90 text-sm flex items-center">
                        <i class="fas fa-user-shield mr-2"></i> ${user.email}
                    </p>
                </div>
                <button id="admin-logout-btn" class="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-40 transition backdrop-blur-sm">
                   <i class="fas fa-sign-out-alt text-white"></i>
                </button>
            </div>
        </div>

        <div class="px-4 -mt-6 mb-6">
            <div class="bg-graphite rounded-xl shadow-2xl p-2 flex justify-between space-x-3 overflow-x-auto hide-scrollbar border border-gray-700">
                <button onclick="window.switchAdminTab('usuarios')" 
                    class="tab-btn flex-1 py-3 px-2 rounded-lg text-sm font-bold transition text-center whitespace-nowrap tracking-wide ${currentTable === 'usuarios' ? 'bg-bright-orange text-white shadow-md' : 'text-fog-gray hover:text-white hover:bg-gray-800'}">
                    <i class="fas fa-users mr-1"></i> Usuarios
                </button>
                <button onclick="window.switchAdminTab('playlists')" 
                    class="tab-btn flex-1 py-3 px-2 rounded-lg text-sm font-bold transition text-center whitespace-nowrap tracking-wide ${currentTable === 'playlists' ? 'bg-bright-orange text-white shadow-md' : 'text-fog-gray hover:text-white hover:bg-gray-800'}">
                    <i class="fas fa-music mr-1"></i> Playlists
                </button>
                <button onclick="window.switchAdminTab('actividades_musicales')" 
                    class="tab-btn flex-1 py-3 px-2 rounded-lg text-sm font-bold transition text-center whitespace-nowrap tracking-wide ${currentTable === 'actividades_musicales' ? 'bg-bright-orange text-white shadow-md' : 'text-fog-gray hover:text-white hover:bg-gray-800'}">
                    <i class="fas fa-chart-line mr-1"></i> Actividad
                </button>
            </div>
        </div>

        <div id="admin-data-container" class="px-4 pb-32 space-y-4 min-h-[300px]">
            <div class="text-center py-20 opacity-50"><i class="fas fa-circle-notch fa-spin text-4xl text-bright-orange"></i></div>
        </div>

        <div id="user-edit-modal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm hidden p-4">
            <div class="bg-graphite w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden transform transition-all scale-100">
                <div class="gradient-header p-5 flex justify-between items-center">
                    <h3 class="text-xl font-bold text-white">Editar Usuario</h3>
                    <button onclick="document.getElementById('user-edit-modal').classList.add('hidden')" class="text-white hover:text-gray-200"><i class="fas fa-times"></i></button>
                </div>
                <div class="p-6 space-y-5">
                    <input type="hidden" id="edit-user-id">
                    
                    <div>
                        <label class="block text-xs font-bold text-bright-orange uppercase mb-1 ml-1">Nombre Completo</label>
                        <input type="text" id="edit-user-nombre" class="form-input w-full bg-gray-800 border-gray-700 text-white focus:border-bright-orange rounded-lg p-3">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-bright-orange uppercase mb-1 ml-1">Correo Electrónico</label>
                        <input type="text" id="edit-user-correo" class="form-input w-full bg-gray-800 border-gray-700 text-white focus:border-bright-orange rounded-lg p-3">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-bright-orange uppercase mb-1 ml-1">Teléfono</label>
                        <input type="text" id="edit-user-telefono" class="form-input w-full bg-gray-800 border-gray-700 text-white focus:border-bright-orange rounded-lg p-3">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-bright-orange uppercase mb-1 ml-1">Rol de Acceso</label>
                        <div class="relative">
                            <select id="edit-user-rol" class="form-input w-full bg-gray-800 border-gray-700 text-white focus:border-bright-orange rounded-lg p-3 appearance-none">
                                <option value="user">User (Estándar)</option>
                                <option value="admin">Admin (Total)</option>
                            </select>
                            <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                                <i class="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>

                    <div class="flex space-x-3 pt-4">
                        <button onclick="document.getElementById('user-edit-modal').classList.add('hidden')" 
                            class="flex-1 py-3 rounded-lg text-white bg-gray-700 hover:bg-gray-600 font-bold transition">Cancelar</button>
                        <button onclick="window.saveUserChanges()" 
                            class="flex-1 py-3 rounded-lg text-white bg-bright-orange hover:bg-orange-600 font-bold transition shadow-lg shadow-orange-900/50">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('admin-logout-btn').addEventListener('click', async () => {
        if(confirm('¿Cerrar sesión de administrador?')) {
            await supabase.auth.signOut();
        }
    });
}

window.switchAdminTab = (tableName) => {
    currentTable = tableName;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const text = btn.innerText.toLowerCase();
        const keyword = tableName.split('_')[0]; 
        if (text.includes(keyword) || (tableName === 'actividades_musicales' && text.includes('actividad'))) {
            btn.className = 'tab-btn flex-1 py-3 px-2 rounded-lg text-sm font-bold transition text-center whitespace-nowrap tracking-wide bg-bright-orange text-white shadow-md transform scale-105';
        } else {
            btn.className = 'tab-btn flex-1 py-3 px-2 rounded-lg text-sm font-bold transition text-center whitespace-nowrap tracking-wide text-fog-gray hover:text-white hover:bg-gray-800';
        }
    });
    loadTableData(tableName);
};

async function loadTableData(tableName) {
    const container = document.getElementById('admin-data-container');
    container.innerHTML = '<div class="text-center py-20 text-fog-gray"><i class="fas fa-circle-notch fa-spin mr-2 text-bright-orange"></i> Actualizando...</div>';

    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('creado_en', { ascending: false });

    if (error) {
        container.innerHTML = `<div class="p-6 bg-crimson bg-opacity-20 border border-crimson rounded-xl text-white text-center flex flex-col items-center"><i class="fas fa-exclamation-circle text-3xl mb-2"></i> ${error.message}</div>`;
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="text-center py-20 text-fog-gray flex flex-col items-center"><i class="far fa-folder-open text-4xl mb-3 opacity-50"></i>No hay registros encontrados.</div>';
        return;
    }

    if (tableName === 'usuarios') renderUsuarios(data, container);
    else if (tableName === 'playlists') renderPlaylists(data, container);
    else if (tableName === 'actividades_musicales') renderActividades(data, container);
}

function renderUsuarios(users, container) {
    container.innerHTML = users.map(u => {
        const safeName = (u.nombre || '').replace(/'/g, "\\'");
        const safeEmail = (u.correo || '').replace(/'/g, "\\'");
        const safePhone = (u.telefono || '').replace(/'/g, "\\'");
        const safeRol = (u.rol || 'user');

        return `
        <div class="card bg-graphite p-5 rounded-2xl border border-gray-800 flex flex-col gap-4 shadow-lg hover:border-gray-600 transition animate-fade-in relative group">
            <div class="flex items-start justify-between">
                <div class="flex items-center space-x-4 overflow-hidden">
                    <div class="w-14 h-14 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 border border-gray-600 shadow-inner">
                        ${(u.nombre || '?').charAt(0).toUpperCase()}
                    </div>
                    <div class="min-w-0">
                        <h3 class="font-bold text-white text-lg truncate">${u.nombre || 'Sin nombre'}</h3>
                        <div class="flex items-center mt-1">
                             <span class="text-[10px] font-bold uppercase tracking-wider ${u.rol === 'admin' ? 'bg-crimson text-white border-crimson' : 'bg-gray-800 text-bright-orange border-gray-600'} px-2 py-0.5 rounded border inline-block">
                                ${u.rol || 'user'}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="window.openEditUserModal('${u.id}', '${safeName}', '${safeEmail}', '${safePhone}', '${safeRol}')" 
                        class="w-10 h-10 rounded-full bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white flex items-center justify-center transition border border-blue-600/30">
                        <i class="fas fa-pen text-sm"></i>
                    </button>
                    <button onclick="window.deleteItem('usuarios', '${u.id}')" 
                        class="w-10 h-10 rounded-full bg-crimson/20 hover:bg-crimson text-crimson hover:text-white flex items-center justify-center transition border border-crimson/30">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
            
            <div class="bg-black bg-opacity-40 p-4 rounded-xl text-sm space-y-2 border border-gray-800/50">
                <div class="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span class="text-fog-gray flex items-center"><i class="fas fa-envelope mr-2 text-xs opacity-70"></i>Correo</span>
                    <span class="text-white text-right truncate ml-4 font-mono text-xs">${u.correo || '-'}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-fog-gray flex items-center"><i class="fas fa-phone mr-2 text-xs opacity-70"></i>Teléfono</span>
                    <span class="text-white text-right font-mono text-xs">${u.telefono || '-'}</span>
                </div>
            </div>
            <div class="text-[10px] text-gray-600 text-right font-mono">ID: ${u.id.substring(0,8)}...</div>
        </div>
    `}).join('');
}

function renderPlaylists(playlists, container) {
    container.innerHTML = playlists.map(pl => `
        <div class="card bg-graphite p-0 rounded-2xl border border-gray-800 overflow-hidden shadow-lg animate-fade-in flex h-28 group hover:border-gray-600 transition">
            <div class="w-28 bg-gray-800 relative flex-shrink-0">
                 <img src="${pl.imagen_url || 'https://via.placeholder.com/150'}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition">
                 <div class="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
                 <div class="absolute bottom-2 left-2"><i class="fas fa-music text-white text-lg drop-shadow-md"></i></div>
            </div>
            <div class="p-4 flex-1 flex flex-col justify-between relative">
                <div>
                    <h3 class="font-bold text-white leading-tight mb-1 line-clamp-1">${pl.nombre}</h3>
                    <p class="text-xs text-fog-gray line-clamp-2">${pl.descripcion || 'Sin descripción'}</p>
                </div>
                <div class="flex justify-end space-x-3 mt-2">
                     <button onclick="window.editGenericItem('playlists', '${pl.id}', 'nombre', '${pl.nombre}')" class="text-xs text-blue-400 hover:text-white transition font-medium"><i class="fas fa-pen mr-1"></i>Editar</button>
                     <button onclick="window.deleteItem('playlists', '${pl.id}')" class="text-xs text-crimson hover:text-white transition font-medium"><i class="fas fa-trash mr-1"></i>Borrar</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderActividades(activities, container) {
    container.innerHTML = activities.map(act => `
        <div class="card bg-graphite p-4 rounded-xl border border-gray-800 flex items-center space-x-4 animate-fade-in hover:bg-gray-800 transition">
             <div class="bg-gradient-to-br from-soft-orange to-bright-orange w-12 h-12 flex items-center justify-center rounded-xl text-white shadow-lg flex-shrink-0">
                <i class="fas fa-headphones-alt text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="text-white font-bold text-sm truncate">${act.titulo || 'Actividad desconocida'}</h4>
                <p class="text-xs text-fog-gray truncate mb-1"><i class="fas fa-microphone-alt mr-1 text-[10px]"></i> ${act.artista || 'Artista desconocido'}</p>
                <div class="flex text-yellow-500 text-[10px] space-x-0.5">
                    ${Array(5).fill(0).map((_, i) => `<i class="${i < (act.calificacion || 0) ? 'fas' : 'far'} fa-star"></i>`).join('')}
                </div>
            </div>
            <button onclick="window.deleteItem('actividades_musicales', '${act.id}')" class="w-8 h-8 rounded-full hover:bg-crimson/20 text-gray-500 hover:text-crimson transition flex items-center justify-center">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

window.openEditUserModal = (id, nombre, correo, telefono, rol) => {
    document.getElementById('edit-user-id').value = id;
    document.getElementById('edit-user-nombre').value = nombre;
    document.getElementById('edit-user-correo').value = correo;
    document.getElementById('edit-user-telefono').value = telefono;
    document.getElementById('edit-user-rol').value = rol;
    document.getElementById('user-edit-modal').classList.remove('hidden');
};

window.saveUserChanges = async () => {
    const id = document.getElementById('edit-user-id').value;
    const nombre = document.getElementById('edit-user-nombre').value;
    const correo = document.getElementById('edit-user-correo').value;
    const telefono = document.getElementById('edit-user-telefono').value;
    const rol = document.getElementById('edit-user-rol').value;

    const btn = document.querySelector('#user-edit-modal button[onclick="window.saveUserChanges()"]');
    const originalText = btn.innerText;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    btn.disabled = true;

    const { error } = await supabase
        .from('usuarios')
        .update({ nombre, correo, telefono, rol })
        .eq('id', id);

    if (error) {
        alert('Error: ' + error.message);
    } else {
        document.getElementById('user-edit-modal').classList.add('hidden');
        loadTableData('usuarios');
    }
    btn.innerText = originalText;
    btn.disabled = false;
};

window.deleteItem = async (table, id) => {
    if(!confirm('¿Estás seguro de eliminar este registro permanentemente?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if(error) alert('Error: ' + error.message);
    else loadTableData(table); 
};

window.editGenericItem = async (table, id, field, currentValue) => {
    const newValue = prompt(`Editar ${field}:`, currentValue);
    if(newValue === null || newValue === currentValue) return;

    const { error } = await supabase.from(table).update({ [field]: newValue }).eq('id', id);
    if(error) alert('Error: ' + error.message);
    else loadTableData(table);
};