/* =========================================
   1. GESTIÓN DE RUTINAS DINÁMICAS
   ========================================= */
let groupCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Buscar rutinas guardadas previamente en el localStorage
    let found = false;
    for (let i = 1; i <= 50; i++) { // Escaneamos hasta 50 slots posibles
        if (localStorage.getItem('group' + i) !== null) {
            createGroupUI(i);
            groupCount = i;
            found = true;
        }
    }
    
    // Si la app está limpia, creamos la primera rutina automáticamente
    if (!found) {
        addNewGroup();
    }
});

// Función para añadir un nuevo bloque de rutina a la lista
function addNewGroup() {
    groupCount++;
    createGroupUI(groupCount);
}

// Crea el HTML de cada tarjeta de rutina
function createGroupUI(id) {
    const container = document.getElementById('groupsContainer');
    const savedName = localStorage.getItem('nameGroup' + id) || '';
    const savedValue = localStorage.getItem('group' + id) || '';

    const groupHTML = `
        <div class="group-box" id="row${id}">
            <input type="text" id="n${id}" class="name-input" placeholder="Nombre de Rutina ${id}" value="${savedName}">
            <input type="text" id="g${id}" placeholder="Decimales (ej: 12, 45, 89)" value="${savedValue}">
            <div class="button-row">
                <button class="save-btn btn-secondary" onclick="saveOnly(${id})">GUARDAR</button>
                <button class="save-btn" onclick="activateGroup(${id})">USAR AHORA</button>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', groupHTML);
}

/* =========================================
   2. ACCIONES DE GUARDADO Y ACTIVACIÓN
   ========================================= */

// Solo guarda los datos sin activarlos en el cronómetro
function saveOnly(id) {
    const name = document.getElementById('n' + id).value;
    const value = document.getElementById('g' + id).value;
    
    localStorage.setItem('nameGroup' + id, name);
    localStorage.setItem('group' + id, value);
    
    showToast('✓ ' + (name || 'Rutina ' + id) + ' guardada');
}

// Guarda y activa la rutina para que el cronómetro la use de inmediato
function activateGroup(id) {
    const name = document.getElementById('n' + id).value;
    const value = document.getElementById('g' + id).value;
    
    if (value.trim() === "") {
        showToast("⚠️ Ingresa números primero");
        return;
    }

    // Guardamos permanentemente
    localStorage.setItem('nameGroup' + id, name);
    localStorage.setItem('group' + id, value);
    
    // Activamos para el motor del cronómetro (script.js leerá esta clave)
    localStorage.setItem('activeGroup', value);
    
    showToast('🚀 CARGADA: ' + (name || 'Rutina ' + id));
}

/* =========================================
   3. SISTEMA DE NOTIFICACIÓN TOAST (FLOTANTE)
   ========================================= */
function showToast(mensaje) {
    // Buscar si ya existe el elemento, si no, crearlo
    let toast = document.querySelector('.toast-msg');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-msg';
        document.body.appendChild(toast);
    }
    
    toast.innerText = mensaje;
    
    // Pequeña pausa para asegurar que el navegador procese la clase
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Vibración de confirmación (táctica para el mago)
    if (navigator.vibrate) {
        navigator.vibrate(40); 
    }

    // Ocultar después de 2.5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}