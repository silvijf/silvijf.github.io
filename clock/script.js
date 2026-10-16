const digital = document.getElementById("digital");
const darkModeButton = document.getElementById("dark-mode");
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
    digital.innerHTML = `
        ${String(date.getHours()).padStart(2, '0')
        }:${String(date.getMinutes()).padStart(2, '0')
        }:${String(date.getSeconds()).padStart(2, '0')}`;
}

function changeDarkMode() {
    document.body.classList.toggle("dark-mode");
    darkModeButton.innerText = settings.darkMode ? "dark_mode" : "light_mode";
    save();
}

darkModeButton.addEventListener("click", () => {
    settings.darkMode = !settings.darkMode;
    changeDarkMode();
});

if (localStorage.getItem("clockSettings")) load();
else if (!darkModeOS) changeDarkMode();

document.body.style.transition = "color 500ms, background-color 500ms, border 500ms, scale 100ms";
for (let button of buttons) {
    button.style.transition = "color 500ms, background-color 500ms, border 500ms, scale 100ms";
}

changeTime();
setInterval(changeTime, 1000);
