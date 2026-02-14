// --- VARIABLES DEL CRONÓMETRO ---
let startTime, elapsedTime = 0, timerInterval;
let isRunning = false;
let laps = [];

// --- VARIABLES DE FORZAJE (CRONOS FORCE) ---
let forceMode = false;
let forceList = [];
let forceIndex = 0;

// --- ELEMENTOS DEL DOM ---
const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsList = document.getElementById('lapsList');
const statusIndicator = document.getElementById('statusIndicator');

// --- CARGAR CONFIGURACIÓN ACTIVA ---
const loadActiveGroup = () => {
    const savedGroup = localStorage.getItem('activeGroup');
    if (savedGroup) {
        forceList = savedGroup.split(',').map(n => n.trim());
    }
};
loadActiveGroup();

// --- LÓGICA DEL CRONÓMETRO ---
const formatTime = (time) => {
    let date = new Date(time);
    let minutes = String(date.getUTCMinutes()).padStart(2, '0');
    let seconds = String(date.getUTCSeconds()).padStart(2, '0');
    let milliseconds = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
    return `${minutes}:${seconds}.${milliseconds}`;
};

const updateDisplay = () => {
    display.innerText = formatTime(elapsedTime);
};

const startTimer = () => {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            updateDisplay();
        }, 10);
        startBtn.innerText = 'Detener';
        startBtn.style.color = '#ff453a';
        lapBtn.innerText = 'Vuelta';
    } else {
        stopTimer();
    }
};

const stopTimer = () => {
    isRunning = false;
    clearInterval(timerInterval);
    startBtn.innerText = 'Iniciar';
    startBtn.style.color = '#30d158';
    lapBtn.innerText = 'Modificar';
    
    if (forceMode) handleForce();
};

const handleForce = () => {
    if (forceIndex < forceList.length) {
        let forcedValue = forceList[forceIndex];
        let currentTime = display.innerText.split('.');
        let newDisplay = `${currentTime[0]}.${forcedValue}`;
        display.innerText = newDisplay;
        
        // Efecto visual sutil de confirmación
        display.style.color = '#30d158';
        setTimeout(() => { display.style.color = 'white'; }, 300);
        
        forceIndex++;
    } else {
        // Desactivar modo truco si se agota la lista
        forceMode = false;
        statusIndicator.style.opacity = '0';
    }
};

const resetTimer = () => {
    stopTimer();
    elapsedTime = 0;
    forceIndex = 0;
    laps = [];
    updateDisplay();
    lapsList.innerHTML = '';
};

// --- GESTOS SECRETOS ---

// 1. Doble toque en Reiniciar para Activar Modo Truco
let lastResetClick = 0;
resetBtn.addEventListener('click', () => {
    let now = Date.now();
    if (now - lastResetClick < 300) {
        forceMode = !forceMode;
        statusIndicator.style.opacity = forceMode ? '1' : '0';
        if (window.navigator.vibrate) window.navigator.vibrate(50);
        console.log("Modo Forzaje:", forceMode);
    }
    lastResetClick = now;
    resetTimer();
});

// 2. Navegación Secreta al Menú (Toque largo 2 segundos arriba)
const homeTrigger = document.getElementById('indexTrigger');
let homeHold;

const goMenu = () => {
    window.location.href = 'cronometro.html'; 
};

homeTrigger.addEventListener('touchstart', (e) => {
    homeHold = setTimeout(goMenu, 2000);
});
indexTrigger.addEventListener('touchend', () => clearTimeout(homeHold));
indexTrigger.addEventListener('mousedown', () => homeHold = setTimeout(goMenu, 2000));
indexTrigger.addEventListener('mouseup', () => clearTimeout(homeHold));

// 3. Menú de Emergencia (Triple toque en los números)
let displayClicks = 0;
display.addEventListener('click', () => {
    displayClicks++;
    if (displayClicks === 3) {
        let manual = prompt("Insertar decimales manualmente (ej: 42):");
        if (manual) {
            let currentTime = display.innerText.split('.');
            display.innerText = `${currentTime[0]}.${manual.padStart(2, '0')}`;
        }
        displayClicks = 0;
    }
    setTimeout(() => { displayClicks = 0; }, 500);
});

// --- EVENTOS DE BOTONES ---
startBtn.addEventListener('click', startTimer);
lapBtn.addEventListener('click', () => {
    if (isRunning && forceMode) {
        handleForce();
    } else if (!isRunning && !forceMode) {
        // Lógica de vueltas normal si no hay truco
        let li = document.createElement('li');
        li.innerText = `Vuelta ${laps.length + 1}: ${display.innerText}`;
        lapsList.prepend(li);
        laps.push(display.innerText);
    }
});

// --- REGISTRO DE SERVICE WORKER PARA INSTALACIÓN ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('CronosForcePro: PWA lista'))
            .catch(err => console.log('Error de registro SW', err));
    });
}
