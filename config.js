document.addEventListener('DOMContentLoaded', () => {
    // Cargar nombres y valores guardados
    for (let i = 1; i <= 3; i++) {
        document.getElementById('n' + i).value = localStorage.getItem('nameGroup' + i) || '';
        document.getElementById('g' + i).value = localStorage.getItem('group' + i) || '';
    }
});

// Solo guarda los cambios en la memoria
function saveOnly(id) {
    const name = document.getElementById('n' + id).value;
    const value = document.getElementById('g' + id).value;
    
    localStorage.setItem('nameGroup' + id, name);
    localStorage.setItem('group' + id, value);
    
    alert('Rutina "' + (name || 'Grupo ' + id) + '" guardada.');
}

// Guarda y activa para el cronómetro inmediatamente
function activateGroup(id) {
    const name = document.getElementById('n' + id).value;
    const value = document.getElementById('g' + id).value;
    
    if (value === "") {
        alert("No hay valores para forzar en este grupo.");
        return;
    }

    // Guardamos estado actual
    localStorage.setItem('nameGroup' + id, name);
    localStorage.setItem('group' + id, value);
    
    // Activamos para el index.html
    localStorage.setItem('activeGroup', value);
    
    alert('¡Cargado!: ' + (name || 'Grupo ' + id));
}