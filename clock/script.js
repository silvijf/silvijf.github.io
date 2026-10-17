const title = document.getElementsByTagName("title")[0];
const timeContainer = document.getElementById("time-container");
const digital = document.getElementById("digital");
const analog = document.getElementById("analog");
const dateEl = document.getElementById("date");
const header = document.getElementById("header");
const darkModeButton = document.getElementById("dark-mode");
const themeButton = document.getElementById("theme");
const settingsButton = document.getElementById("settings");
const fullscreenButton = document.getElementById("fullscreen");
const settingsMenu = document.getElementById("settings-menu");
const themeMenu = document.getElementById("theme-menu");
const themeContent = document.getElementById("theme-content");
const closes = document.getElementsByClassName("close");
const showDate = document.getElementById("show-date");
const clockType = document.getElementById("clock-type");
const buttons = document.getElementsByTagName("button");

const hourHand = document.getElementById("hour-hand");
const minuteHand = document.getElementById("minute-hand");
const secondHand = document.getElementById("second-hand");

let darkModeOS = window.matchMedia("(prefers-color-scheme: dark)").matches;
let settings = {
    theme: "dark",
    showDate: false,
    url: null,
    clockType: "digital"
}

function save() {
    localStorage.setItem("clockSettings", JSON.stringify(settings));
}

function load() {
    settings = JSON.parse(localStorage.getItem("clockSettings"));
    if (settings.theme == "light") changeDarkMode();
    if (settings.url) timeContainer.style.backgroundImage = `url(${settings.url})`;
    dateEl.style.display = settings.showDate ? "block" : "none";
    if (settings.clockType == "digital") {
        digital.style.display = "block";
        analog.style.display = "none";
    } else if (settings.clockType == "both") {
        digital.style.display = "block";
        analog.style.display = "block";
    } else if (settings.clockType == "analog"){
        digital.style.display = "none";
        analog.style.display = "block";
    }
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
    dateEl.innerHTML = `
        ${String(date.getDay()).padStart(2, '0')
        }-${String(date.getMonth() + 1).padStart(2, '0')}`;

    hourHand.style.transform = `rotate(${date.getHours() * 30 + date.getMinutes() * 0.5}deg)`;
    minuteHand.style.transform = `rotate(${date.getMinutes() * 6 + date.getSeconds() * 0.1}deg)`;
    secondHand.style.transform = `rotate(${date.getSeconds() * 6}deg)`;

    checkFullscreen();
}

function changeDarkMode() {
    document.body.classList.toggle("dark-mode");
    darkModeButton.innerText = settings.theme == "dark" ? "dark_mode" : "light_mode";
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
    settings.theme = settings.theme == "dark" ? "light" : "dark";
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

themeButton.addEventListener("click", () => {
    themeMenu.style.right = "0px";
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

document.addEventListener("click", (e) => {
    if (e.target.closest(".menu") &&
        !e.target.closest(".theme-example")) return;
    if (e.target.parentElement.id != "header") {
        themeMenu.style.right = "-550px";
        settingsMenu.style.right = "-550px";
        timeContainer.classList.remove("darkened");
        header.style.right = "0px";
    }
})

showDate.addEventListener("change", () => {
    dateEl.style.display = showDate.checked ? "block" : "none";
    settings.showDate = showDate.checked;
    save();
})

clockType.addEventListener("click", (e) => {
    if (e.target.closest(".clock-type-example")) {
        const type = e.target.closest(".clock-type-example").dataset.type;
        if (type == "digital") {
            digital.style.display = "block";
            analog.style.display = "none";
        } else if (type == "both") {
            digital.style.display = "block";
            analog.style.display = "block";
        } else {
            digital.style.display = "none";
            analog.style.display = "block";
        }
        settings.clockType = type;
    }
    save();
})

themeContent.addEventListener("click", (e) => {
    let target = e.target.closest(".theme-example");
    if (target.dataset.theme == "dark") document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
    if (target.dataset.url) {
        timeContainer.style.backgroundImage = `url(${target.dataset.url})`;
        settings.url = target.dataset.url;
    } else {
        timeContainer.style.backgroundImage = "";
        settings.url = null;
    }
    settings.theme = target.dataset.theme;
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

for (i = 0; i < 60; i++) {
    const dialline = document.createElement("div");
    dialline.classList.add("dialline");
    dialline.style.transform = `rotate(${i * 6 - 6}deg)`;
    analog.appendChild(dialline);
}

changeTime();
setInterval(changeTime, 1000);
