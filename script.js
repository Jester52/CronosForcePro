// --- CARGA INICIAL Y VARIABLES ---
let startTime, elapsedTime = 0, timerInterval;
let isRunning = false;
let isForced = false;
let forcedList = []; 
let currentForceIndex = 0; 
let displayTapCount = 0; 
let lapCount = 0;
let homeHold; 
let lastCenterTap = 0;

const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const lapsList = document.getElementById('lapsList');
const forceInput = document.getElementById('forceValue');
const settingsMenu = document.getElementById('settings');
const statusIndicator = document.getElementById('statusIndicator');
const homeTrigger = document.getElementById('homeTrigger'); 
const trickTrigger = document.querySelector('.controls'); 

window.addEventListener('load', () => {
    const savedForce = localStorage.getItem('activeGroup');
    if (savedForce) {
        forcedList = savedForce.split(',').map(n => n.trim().padStart(2, '0'));
    }
    updateButtonsUI();
});

// --- LÓGICA DE FORZAJE ---
function getNextForcedValue(realCents) {
    if (isForced && forcedList.length > 0 && currentForceIndex < forcedList.length) {
        let val = forcedList[currentForceIndex];
        currentForceIndex++;
        if (navigator.vibrate) navigator.vibrate(40);
        return val;
    }
    return realCents; 
}

function updateSecretUI() {
    if (statusIndicator) {
        isForced ? statusIndicator.classList.remove('hidden') : statusIndicator.classList.add('hidden');
    }
}

// --- TRANSFORMACIÓN VISUAL ---
function updateButtonsUI() {
    if (isRunning) {
        startBtn.innerText = "Detener";
        startBtn.className = "btn stop"; 
        lapBtn.innerText = "Vuelta";
    } else {
        startBtn.innerText = "Iniciar";
        startBtn.className = "btn start";
        lapBtn.innerText = (elapsedTime > 0) ? "Reiniciar" : "Vuelta";
    }
}

// --- EL DISPARADOR DEL TRUCO (DOBLE TOQUE AL CENTRO) ---
trickTrigger.addEventListener('click', (e) => {
    // Si el clic NO fue en el botón de Iniciar y NO fue en el de Vuelta
    // entonces fue en el espacio intermedio (el área mágica)
    if (e.target !== startBtn && e.target !== lapBtn) {
        let now = Date.now();
        let timesince = now - lastCenterTap;

        if (timesince < 400 && timesince > 0) { // Subimos a 400ms para que sea más fácil
            isForced = !isForced;
            updateSecretUI(); 
            
            if (navigator.vibrate) navigator.vibrate(60); 
            console.log("Magia activada:", isForced);
            
            lastCenterTap = 0;
        } else {
            lastCenterTap = now;
        }
    }
});

// --- BOTÓN DERECHO: INICIAR / DETENER ---
startBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    if (!isRunning) {
        // INICIAR
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(updateTime, 10);
        isRunning = true;
    } else {
        // DETENER
        clearInterval(timerInterval);
        isRunning = false;
        
        // --- LÓGICA MÁGICA CON SEGURIDAD DE 3 SEGUNDOS ---
        // Solo fuerza si: el modo está activo Y han pasado más de 3000ms (3s)
        if (isForced && elapsedTime > 3000) {
            let parts = display.innerText.split('.'); 
            let forcedCents = getNextForcedValue(parts[1]);
            display.innerHTML = `${parts[0]}.<span class="ms">${forcedCents}</span>`;
            
            // Si se agotan los números de la lista, desactivar modo
            if (currentForceIndex >= forcedList.length) {
                isForced = false;
                updateSecretUI();
            }
        } else {
            // Si se detiene antes de los 3s, el número permanece real
            console.log("Detenido antes de 3s: Forzaje ignorado por seguridad.");
        }
    }
    updateButtonsUI(); 
});

// --- BOTÓN IZQUIERDO: VUELTA / REINICIAR ---
lapBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isRunning) {
        // MODO VUELTA CON FORZAJE
        lapCount++;
        let parts = display.innerText.split('.');
        let finalCents = getNextForcedValue(parts[1]);
        
        const li = document.createElement('li');
        li.className = 'lap-item';
        li.innerHTML = `<span>Vuelta ${lapCount}</span> <span>${parts[0]}.${finalCents}</span>`;
        lapsList.prepend(li);
    } else {
        // MODO REINICIAR
        if (elapsedTime > 0) {
            resetTimer();
            updateButtonsUI();
        }
    }
});

// --- FUNCIONES CORE ---
function resetTimer() {
    elapsedTime = 0;
    lapCount = 0;
    currentForceIndex = 0;
    isForced = false;
    display.innerHTML = `00:00.<span class="ms">00</span>`;
    if (lapsList) lapsList.innerHTML = "";
    updateSecretUI();
}

function updateTime() {
    elapsedTime = Date.now() - startTime;
    let date = new Date(elapsedTime);
    let m = String(date.getUTCMinutes()).padStart(2, '0');
    let s = String(date.getUTCSeconds()).padStart(2, '0');
    let ms = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
    display.innerHTML = `${m}:${s}.<span class="ms">${ms}</span>`;
}

// --- NAVEGACIÓN SECRETA REFORZADA ---
const homeTriggerArea = document.getElementById('homeTrigger') || document.getElementById('statusIndicator');

if (homeTriggerArea) {
    const startHolding = () => {
        homeHold = setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500); // 1.5 segundos para salir
    };

    const stopHolding = () => clearTimeout(homeHold);

    // Eventos para Móvil
    homeTriggerArea.addEventListener('touchstart', (e) => {
        if (e.cancelable) e.preventDefault(); // Evita zoom o scroll
        startHolding();
    }, { passive: false });
    
    homeTriggerArea.addEventListener('touchend', stopHolding);

    // Eventos para PC (por si pruebas en el navegador)
    homeTriggerArea.addEventListener('mousedown', startHolding);
    homeTriggerArea.addEventListener('mouseup', stopHolding);
    homeTriggerArea.addEventListener('mouseleave', stopHolding);
}

display.addEventListener('click', () => {
    displayTapCount++;
    if (displayTapCount === 3) {
        settingsMenu.classList.toggle('hidden');
        displayTapCount = 0;
    }
    setTimeout(() => displayTapCount = 0, 500);
});

function toggleSettings() {
    if (forceInput.value !== "") {
        forcedList = forceInput.value.split(',').map(n => n.trim().padStart(2, '0'));
        currentForceIndex = 0;
    }
    settingsMenu.classList.add('hidden');
}