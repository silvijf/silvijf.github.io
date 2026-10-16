const title = document.getElementsByTagName("title")[0];
const timeContainer = document.getElementById("time-container");
const digital = document.getElementById("digital");
const dateEl = document.getElementById("date");
const header = document.getElementById("header");
const darkModeButton = document.getElementById("dark-mode");
const settingsButton = document.getElementById("settings");
const fullscreenButton = document.getElementById("fullscreen");
const settingsMenu = document.getElementById("settings-menu");
const closes = document.getElementsByClassName("close");
const showDate = document.getElementById("show-date");
const buttons = document.getElementsByTagName("button");

let darkModeOS = window.matchMedia("(prefers-color-scheme: dark)").matches;
let settings = {
    darkMode: true,
    showDate: false
}

function save() {
    localStorage.setItem("clockSettings", JSON.stringify(settings));
}

function load() {
    settings = JSON.parse(localStorage.getItem("clockSettings"));
    if (!settings.darkMode) changeDarkMode();
    dateEl.style.display = settings.showDate ? "block" : "none";
    showDate.checked = settings.showDate;
}

function changeTime() {
    const date = new Date();
    const string = `
        ${String(date.getHours()).padStart(2, '0')
        }:${String(date.getMinutes()).padStart(2, '0')
        }:${String(date.getSeconds()).padStart(2, '0')}`;
    digital.innerHTML = string;
    title.innerText = `${string} | Clock`;
    dateEl.innerHTML =  `
        ${String(date.getDay()).padStart(2, '0')
        }-${String(date.getMonth() + 1).padStart(2, '0')}`;
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

settingsButton.addEventListener("click", () => {
    settingsMenu.style.right = "0px";
    timeContainer.classList.add("darkened");
    header.style.right = "-200px";
})

for (close of closes) {
    close.addEventListener("click", (e) => {
        e.target.parentElement.style.right = "-550px";
        timeContainer.classList.remove("darkened");
        header.style.right = "0px";
    })
}

showDate.addEventListener("change", () => {
    dateEl.style.display = showDate.checked ? "block" : "none";
    settings.showDate = showDate.checked;
    save();
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
