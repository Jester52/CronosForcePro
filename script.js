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
let homeHold; 

const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsList = document.getElementById('lapsList');
const forceInput = document.getElementById('forceValue');
const settingsMenu = document.getElementById('settings');
const statusIndicator = document.getElementById('statusIndicator');
const homeTrigger = document.getElementById('homeTrigger'); 

// Actualiza el indicador visual para el mago (línea gris)
function updateSecretUI() {
    if (statusIndicator) {
        if (isForced) {
            statusIndicator.classList.remove('hidden');
        } else {
            statusIndicator.classList.add('hidden');
        }
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

// --- NAVEGACIÓN SECRETA (Toque Largo 2s para ir a INDEX.HTML) ---
const goToIndex = () => {
    // Corregido: Ahora apunta a index.html
    window.location.href = 'index.html';
};

if (homeTrigger) {
    homeTrigger.addEventListener('mousedown', () => homeHold = setTimeout(goToIndex, 2000));
    homeTrigger.addEventListener('mouseup', () => clearTimeout(homeHold));
    homeTrigger.addEventListener('mouseleave', () => clearTimeout(homeHold));
    homeTrigger.addEventListener('touchstart', (e) => {
        homeHold = setTimeout(goToIndex, 2000);
    });
    homeTrigger.addEventListener('touchend', () => clearTimeout(homeHold));
}

// --- TRIPLE TOQUE EN EL TIEMPO PARA CONFIGURACIÓN RÁPIDA ---
display.addEventListener('click', () => {
    displayTapCount++;
    if (displayTapCount === 3) {
        if (settingsMenu) settingsMenu.classList.toggle('hidden');
        displayTapCount = 0;
    }
    setTimeout(() => displayTapCount = 0, 500);
});

function toggleSettings() {
    if (forceInput && forceInput.value !== "") {
        forcedList = forceInput.value.split(',').map(n => n.trim().padStart(2, '0'));
        currentForceIndex = 0;
    }
    if (settingsMenu) settingsMenu.classList.add('hidden');
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

        if (lapsList) {
            const li = document.createElement('li');
            li.className = 'lap-item';
            li.innerHTML = `<span class="lap-number">Vuelta ${lapCount}</span> <span class="lap-time">${timeToShow}</span>`;
            lapsList.prepend(li);
        }
    }
});

// --- BOTÓN REINICIAR ---
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
    if (lapsList) lapsList.innerHTML = "";
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

// --- REGISTRO DEL SERVICE WORKER (Para Android) ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('CronosForcePro: Service Worker registrado'))
            .catch(err => console.log('Error al registrar SW:', err));
    });
}