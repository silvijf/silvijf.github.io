const title = document.getElementsByTagName("title")[0];
const digital = document.getElementById("digital");
const darkModeButton = document.getElementById("dark-mode");
const fullscreenButton = document.getElementById("fullscreen");
const buttons = document.getElementsByTagName("button");

let darkModeOS = window.matchMedia("(prefers-color-scheme: dark)").matches;
let settings = {
    darkMode: true
}

function save() {
    localStorage.setItem("clockSettings", JSON.stringify(settings));
}

function load() {
    settings = JSON.parse(localStorage.getItem("clockSettings"));
    if (!settings.darkMode) changeDarkMode();
}

function changeTime() {
    const date = new Date();
    const string = `
        ${String(date.getHours()).padStart(2, '0')
        }:${String(date.getMinutes()).padStart(2, '0')
        }:${String(date.getSeconds()).padStart(2, '0')}`;
    digital.innerHTML = string;
    title.innerText = `${string} | Clock`;
    checkFullscreen();
}

function changeDarkMode() {
    document.body.classList.toggle("dark-mode");
    darkModeButton.innerText = settings.darkMode ? "dark_mode" : "light_mode";
    save();
}

function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().then(checkFullscreen);
    else {
        document.documentElement.requestFullscreen().then(checkFullscreen);
    }
}

function checkFullscreen() {
    fullscreenButton.innerText = document.fullscreenElement ? "fullscreen_exit" : "fullscreen";
}

darkModeButton.addEventListener("click", () => {
    settings.darkMode = !settings.darkMode;
    changeDarkMode();
});

fullscreenButton.addEventListener("click", toggleFullscreen);
document.addEventListener("keydown", (e) => {
    if (e.key == "F11") {
        e.preventDefault();
        toggleFullscreen();
    }
})

if (localStorage.getItem("clockSettings")) load();
else if (!darkModeOS) changeDarkMode();

setTimeout(() => {
    document.body.style.transition = "color 500ms, background-color 500ms, border 500ms, scale 100ms";
    for (let button of buttons) {
        button.style.transition = "color 500ms, background-color 500ms, border 500ms, scale 100ms";
    }
}, 100)


changeTime();
setInterval(changeTime, 1000);
