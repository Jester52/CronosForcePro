// --- CARGA INICIAL DE CONFIGURACIÓN ---
window.addEventListener('load', () => {
    const savedForce = localStorage.getItem('activeGroup');
    if (savedForce) {
        forcedList = savedForce.split(',').map(n => n.trim().padStart(2, '0'));
        if (forceInput) forceInput.value = savedForce; 
        console.log("Forzaje cargado:", forcedList);
    }
});

let startTime, elapsedTime = 0, timerInterval;
let isRunning = false;
let isForced = false;
let forcedList = []; 
let currentForceIndex = 0; 
let displayTapCount = 0; 
let resetBtnTapCount = 0; 
let lapCount = 0;
let homeHold; // Variable para el temporizador del Home

const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsList = document.getElementById('lapsList');
const forceInput = document.getElementById('forceValue');
const settingsMenu = document.getElementById('settings');
const statusIndicator = document.getElementById('statusIndicator');
const homeTrigger = document.getElementById('homeTrigger'); // El nuevo área invisible

// Actualiza el indicador visual para el mago (línea gris)
function updateSecretUI() {
    if (isForced) {
        statusIndicator.classList.remove('hidden');
    } else {
        statusIndicator.classList.add('hidden');
    }
}

// --- LÓGICA DE FORZAJE CON AGOTAMIENTO ---
function getNextForcedValue(realCents) {
    if (isForced && forcedList.length > 0 && currentForceIndex < forcedList.length) {
        let val = forcedList[currentForceIndex];
        currentForceIndex++;
        if (navigator.vibrate) navigator.vibrate(40);
        return val;
    }
    return realCents; 
}

// --- REGRESO SECRETO AL HOME (Toque Largo 2s en zona invisible) ---
const goHome = () => {
    window.location.href = 'home.html';
};

// Eventos para el área invisible superior
homeTrigger.addEventListener('mousedown', () => homeHold = setTimeout(goHome, 2000));
homeTrigger.addEventListener('mouseup', () => clearTimeout(homeHold));
homeTrigger.addEventListener('mouseleave', () => clearTimeout(homeHold));
homeTrigger.addEventListener('touchstart', (e) => {
    // No usamos preventDefault aquí para no bloquear otros gestos del sistema si fueran necesarios
    homeHold = setTimeout(goHome, 2000);
});
homeTrigger.addEventListener('touchend', () => clearTimeout(homeHold));

// --- TRIPLE TOQUE EN EL TIEMPO PARA CONFIGURACIÓN RÁPIDA ---
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

// --- BOTÓN INICIAR / DETENER ---
startBtn.addEventListener('click', () => {
    if (!isRunning) {
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(updateTime, 10);
        isRunning = true;
        startBtn.innerText = "Detener";
        startBtn.className = "btn stop";
    } else {
        clearInterval(timerInterval);
        isRunning = false;
        
        if (isForced && elapsedTime > 1000) {
            let currentTimeStr = display.innerText.split('.'); 
            let forcedCents = getNextForcedValue(currentTimeStr[1]);
            display.innerHTML = `${currentTimeStr[0]}.<span class="ms">${forcedCents}</span>`;
            
            if (currentForceIndex >= forcedList.length) {
                isForced = false;
                updateSecretUI();
            }
        }
        startBtn.innerText = "Iniciar";
        startBtn.className = "btn start";
    }
});

// --- BOTÓN VUELTA ---
lapBtn.addEventListener('click', () => {
    if (isRunning) {
        lapCount++;
        let currentTime = display.innerText; 
        let parts = currentTime.split('.');
        
        let finalCents = getNextForcedValue(parts[1]);
        let timeToShow = `${parts[0]}.${finalCents}`;

        const li = document.createElement('li');
        li.className = 'lap-item';
        li.innerHTML = `<span class="lap-number">Vuelta ${lapCount}</span> <span class="lap-time">${timeToShow}</span>`;
        lapsList.prepend(li);
    }
});

// --- BOTÓN REINICIAR (Un toque: Reset / Doble toque: Activar Truco) ---
resetBtn.addEventListener('click', () => {
    resetBtnTapCount++;
    if (resetBtnTapCount === 1) {
        setTimeout(() => {
            if (resetBtnTapCount === 1) {
                if (!isRunning) resetTimer();
            } else if (resetBtnTapCount === 2) {
                isForced = !isForced;
                updateSecretUI();
                if (navigator.vibrate) navigator.vibrate(60); 
            }
            resetBtnTapCount = 0; 
        }, 300); 
    }
});

function resetTimer() {
    elapsedTime = 0;
    lapCount = 0;
    currentForceIndex = 0;
    display.innerHTML = `00:00.<span class="ms">00</span>`;
    lapsList.innerHTML = "";
    isForced = false; 
    updateSecretUI();
}

function updateTime() {
    elapsedTime = Date.now() - startTime;
    display.innerHTML = formatTime(elapsedTime);
}

function formatTime(time) {
    let date = new Date(time);
    let m = String(date.getUTCMinutes()).padStart(2, '0');
    let s = String(date.getUTCSeconds()).padStart(2, '0');
    let ms = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
    return `${m}:${s}.<span class="ms">${ms}</span>`;
}