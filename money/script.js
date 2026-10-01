
const machineContainer = document.getElementById("machine-container");
const machineEls = document.getElementsByClassName("machine");
const compartments = document.getElementsByClassName("compartment");
const circles = document.getElementsByClassName("circle");
const detergentTopContainer = document.getElementById("detergent-container");
const detergentContainer = document.getElementById("detergent");
const detergents = document.getElementsByClassName("detergent-image");
const detergentCountEls = document.getElementsByClassName("detergent-count");
const sells = document.getElementsByClassName("sell");
const moneyContainer = document.getElementById("money-container");
const moneyEl = document.getElementById("money");
const tabButtons = document.getElementById("tab-btns");
const buys = document.getElementsByClassName("buy");
const tutorialContainer = document.getElementById("tutorial-container");
const cursor = document.getElementById("cursor");
const tutorialText = document.getElementById("tutorial-text");

const machineTypes = {
    normal: {
        code: `
                <div class="machine">
                    <div class="compartment"></div>
                    <div class="circle"></div>
                    <button class="sell">Sell</button>
                </div>
                `,
        cost: 40,
        profit: 1.2,
        time: 5,
        max: 20
    },
    pink: {
        code: `
                <div class="machine pink">
                    <div class="compartment"></div>
                    <div class="circle pink"></div>
                    <button class="sell">Sell</button>
                </div>
                `,
        cost: 60,
        profit: 1.4,
        time: 20,
        max: 30
    },
    yellow: {
        code: `
                <div class="machine yellow">
                    <div class="compartment"></div>
                    <div class="circle yellow"></div>
                    <button class="sell">Sell</button>
                </div>
                `,
        cost: 90,
        profit: 1.5,
        time: 30,
        max: 50
    },
    blue: {
        code: `
                <div class="machine blue">
                    <div class="compartment"></div>
                    <div class="circle blue"></div>
                    <button class="sell">Sell</button>
                </div>
                `,
        cost: 150,
        profit: 1.5,
        time: 60,
        max: 100
    },
    purple: {
        code: `
                <div class="machine purple">
                    <div class="compartment"></div>
                    <div class="circle purple"></div>
                    <button class="sell">Sell</button>
                </div>
                `,
        cost: 170,
        profit: 1.8,
        time: 5,
        max: 20
    },
    animals: {
        code: `
                <div class="machine animals">
                    <div class="compartment"></div>
                    <div class="circle"></div>
                    <button class="sell">Sell</button>
                </div>
                `,
        cost: 500,
        profit: "pet",
        time: 3600,
        min: 500,
        max: 1000
    }
};

const detergentTypes = {
    yellow: {
        cost: 5,
        uses: 6,
        src: "../Content/Money_Laundry_Simulator/detergent.png"
    },
    pink: {
        cost: 20,
        uses: 25,
        src: "../Content/Money_Laundry_Simulator/detergent-pink.png"
    }
}

const petTypes = {
    spider: {
        src: "../Content/Money_Laundry_Simulator/spider.png",
        max: 10
    }
}

var money = 10;
var machines = [{ type: "normal", state: "idle", timer: null, money: null, deterged: false }];
var pets = {};
var displayedPetMenu = null;
var clickingPet = false;
var detergentCount = { yellow: 6, pink: 0 };
var grabbingDetergent = null;
var lastDetergentPos;
var grabbingMoney = false;
var lastMoneyPos;
var grabbingPet = false;
var lastPetPos;
var grabbingPetEl;
var moneyWidth = moneyEl.getBoundingClientRect().width;

var compartmentTimeout;
var laundryIntervals = {};

function continueGame() {
    tutorialContainer.style.display = "none";
    money = Number(localStorage.getItem("laundryMoney"));
    moneyEl.innerText = `$${money}`;
    moneyWidth = moneyEl.getBoundingClientRect().width;
    machines = JSON.parse(localStorage.getItem("laundryMachines"));
    detergentCount = JSON.parse(localStorage.getItem("laundryDetergent"));
    pets = JSON.parse(localStorage.getItem("laundryPets"));
    const lastTime = Number(localStorage.getItem("laundryTime"));
    const nowTime = new Date().getTime();
    if (pets == null) pets = {};
    for (let i = 0; i < machines.length; i++) {
        if (i > 0) {
            machineContainer.insertAdjacentHTML("beforeend", machineTypes[machines[i].type].code);
        }
        const machine = machineEls[i];
        const compartment = machine.children[0];
        if (machines[i].state == "running") {
            startLaundry(machine.children[1], machine, i, compartment,
                machines[i].timer, machines[i].money);
        }
        if (machines[i].deterged == true) {
            compartment.classList.add("deterged");
        }
        if (machines[i].type == "animals") {
            machines[i].timer -= Math.round((nowTime - lastTime) / 1000);
        }
    }
    if (typeof detergentCount != "object" || detergentCount == null) detergentCount = { yellow: 6, pink: 0 };
    for (let i = 0; i < Object.values(detergentCount).length; i++) {
        const detergentType = Object.keys(detergentCount)[i];
        const type = detergentTypes[detergentType];
        if (detergentType == "yellow") {
            const img = document.querySelector(".detergent-image[data-detergenttype=yellow]");
            img.addEventListener("mousedown", (e) => { grabDetergentStart(e, "mouse") });
            img.addEventListener("touchstart", (e) => { grabDetergentStart(e, "touch") });
            const detergentCountEl = document.querySelector(".detergent-count[data-detergenttype=yellow]");
            detergentCountEl.innerText = detergentCount.yellow;
        } else if (Object.values(detergentCount)[i] > 0) {
            const img = document.createElement("img");
            img.src = type.src;
            img.classList.add("detergent-image");
            img.draggable = false;
            img.oncontextmenu = "return false";
            img.dataset.detergenttype = detergentType;
            const detergentCountEl = document.createElement("p");
            detergentCountEl.classList.add("detergent-count");
            detergentCountEl.dataset.detergenttype = detergentType;
            detergentCountEl.innerText = detergentCount[detergentType];
            detergentContainer.appendChild(img);
            detergentContainer.appendChild(detergentCountEl);
            img.addEventListener("mousedown", (e) => { grabDetergentStart(e, "mouse") });
            img.addEventListener("touchstart", (e) => { grabDetergentStart(e, "touch") });
        }

        const detergentCountLength = Object.values(detergentCount).filter(d => d > 0).length;
        if (detergentCount.yellow == 0 && detergentCountLength > 0 &&
            document.querySelector(".detergent-image[data-detergenttype=yellow]")) {
            detergentContainer.children[0].remove();
            document.querySelector(".detergent-count[data-detergenttype=yellow]").remove();
        }

        const len = `${25 + (detergentContainer.children.length / 2) * 40}px`;
        detergentContainer.style.setProperty("--len", len);
    }

    for (let pet = 0; pet < Object.values(pets).length; pet++) {
        addPet(pets[pet].type, false);
    }
}

function continueTutorial() {
    setTimeout(() => {
        if (compartments[0].classList.contains("deterged")) {
            document.removeEventListener("mouseup", continueTutorial);
            document.removeEventListener("touchend", continueTutorial);
            const moneyRect = moneyEl.getBoundingClientRect();
            const moneyPos = [
                moneyRect.left - 75,
                moneyRect.top + window.scrollY - 75
            ]
            cursor.style.left = `${moneyPos[0]}px`;
            cursor.style.top = `${moneyPos[1]}px`;
            cursor.style.transform = "rotateZ(150deg)";
            tutorialText.innerHTML = "Step 3. Drag the money to the circle inside the machine.";
            if (moneyPos[0] - 350 > 0) tutorialText.style.left = `${moneyPos[0] - 350}px`;
            else tutorialText.style.left = "5px";
            tutorialText.style.top = `${moneyPos[1] - 30}px`;
            document.addEventListener("mouseup", continueTutorial2, { once: true });
            document.addEventListener("touchend", continueTutorial2, { once: true });
        }
    }, 100)
}

function continueTutorial2() {
    setTimeout(() => {
        if (circles[0].classList.contains("inserting")) {
            document.removeEventListener("mouseup", continueTutorial2);
            document.removeEventListener("touchend", continueTutorial2);
            const insertButton = document.querySelector(".circle > button");
            const buttonRect = insertButton.getBoundingClientRect();
            const buttonMiddle = [
                buttonRect.left + (buttonRect.right - buttonRect.left) / 2 - 50,
                buttonRect.top + (buttonRect.top - buttonRect.bottom) / 2 + window.scrollY + 20
            ]
            cursor.style.left = `${buttonMiddle[0]}px`;
            cursor.style.top = `${buttonMiddle[1]}px`;
            cursor.style.transform = "rotateZ(0deg)";
            tutorialText.innerHTML = "Step 4. Insert some money after typing an amount.";
            if (buttonMiddle[0] - 30 > 0) tutorialText.style.left = `${buttonMiddle[0] - 30}px`;
            else tutorialText.style.left = "5px";
            tutorialText.style.top = `${buttonMiddle[1] + 100}px`;
            insertButton.addEventListener("click", () => {
                setTimeout(() => {
                    if (circles[0].classList.contains("washing")) {
                        cursor.style.top = "-100px";
                        cursor.style.transform = "rotateZ(-1000deg)";
                        tutorialText.innerText = "If your detergent runs out, \n buy some new detergent in the shop. Good luck!"
                        setTimeout(() => {
                            tutorialContainer.style.display = "none";
                        }, 4000)
                    }
                }, 100)
            })
        }
    }, 100)
}

function startGame() {
    save();

    const img = document.querySelector(".detergent-image[data-detergenttype=yellow]");
    img.addEventListener("mousedown", (e) => { grabDetergentStart(e, "mouse") });
    img.addEventListener("touchstart", (e) => { grabDetergentStart(e, "touch") });

    const compartmentRect = compartments[0].getBoundingClientRect();
    const compartmentMiddle = [
        compartmentRect.left + (compartmentRect.right - compartmentRect.left) / 2 - 50,
        compartmentRect.top + (compartmentRect.top - compartmentRect.bottom) / 2 + window.scrollY
    ]
    cursor.style.left = `${compartmentMiddle[0]}px`;
    cursor.style.top = `${compartmentMiddle[1]}px`;
    cursor.style.transform = "rotateZ(0deg)";
    tutorialText.style.left = `${compartmentMiddle[0]}px`;
    tutorialText.style.top = `${compartmentMiddle[1] + 100}px`;

    compartments[0].addEventListener("click", () => {
        const detergentRect = detergents[0].getBoundingClientRect();
        const detergentMiddle = [
            detergentRect.left + (detergentRect.right - detergentRect.left) / 2 - 75,
            detergentRect.top + (detergentRect.top - detergentRect.bottom) / 2 + window.scrollY + 50
        ]
        cursor.style.left = `${detergentMiddle[0]}px`;
        cursor.style.top = `${detergentMiddle[1]}px`;
        cursor.style.transform = "rotateZ(45deg)";
        tutorialText.innerHTML = "Step 2. Drag this detergent to the compartment.";
        if (detergentMiddle[0] - 300 > 0) tutorialText.style.left = `${detergentMiddle[0] - 300}px`;
        else tutorialText.style.left = "5px";
        tutorialText.style.top = `${detergentMiddle[1]}px`;

        document.addEventListener("mouseup", continueTutorial, { once: true });
        document.addEventListener("touchend", continueTutorial, { once: true });
    }, { once: true })
}

function save() {
    localStorage.setItem("laundryMoney", money);
    localStorage.setItem("laundryMachines", JSON.stringify(machines));
    localStorage.setItem("laundryDetergent", JSON.stringify(detergentCount));
    localStorage.setItem("laundryPets", JSON.stringify(pets));
    const time = new Date().getTime();
    localStorage.setItem("laundryTime", time);
}

function changeMoney(count) {
    money += count;
    moneyEl.innerText = `$${money}`;
    moneyWidth = moneyEl.getBoundingClientRect().width;
    const inputs = document.querySelectorAll(".circle input");
    inputs.forEach((el) => {
        const machine = el.parentElement.parentElement;
        const machineIndex = [].slice.call(machineEls).indexOf(machine);
        const type = machines[machineIndex].type;
        const max = machineTypes[type].max;
        const min = machineTypes[type].min;
        if (max > money) {
            el.max = money;
            el.placeholder = money;
        } else {
            el.max = max;
            el.placeholder = max;
        }
        if (!isNaN(min)) {
            el.min = min;
            el.placeholder = min;
        }
    })
    save();
}

function timer(machine, machineIndex, timerEl) {
    machines[machineIndex].timer -= 1;
    timerEl.innerText = machines[machineIndex].timer;
    if (machines[machineIndex].timer <= 0) finishLaundry(machine, machineIndex);
    save();
}

function startLaundry(circle, machine, machineIndex, compartment, secs, moneyInserted) {
    const bill = document.createElement("img");
    bill.src = "../Content/Money_Laundry_Simulator/bill.webp";
    bill.draggable = false;
    const timerEl = document.createElement("p");
    timerEl.classList.add("timer");
    machines[machineIndex].timer = secs;
    timerEl.innerText = machines[machineIndex].timer;
    laundryIntervals[machineIndex] = setInterval(() => { timer(machine, machineIndex, timerEl) }, 1000);
    circle.replaceChildren(bill);
    machine.appendChild(timerEl);
    circle.classList.remove("inserting");
    circle.classList.add("washing");
    compartment.classList.remove("open");
    save();
}

function checkStartLaundry(el, handleType) {
    const machine = el.parentElement;
    const machineIndex = [].slice.call(machineEls).indexOf(machine);
    const type = machines[machineIndex].type;
    const min = machineTypes[type].min;
    const hasMin = !isNaN(min);
    const max = machineTypes[type].max;
    const compartment = machine.children[0];
    let moneyInserted = el.children[0].value;
    if (compartment.classList.contains("deterged")) {
        if (moneyInserted == '') {
            if (!hasMin) moneyInserted = (money > max) ? max : money;
            else if (handleType == "pet") return false;
            else el.children[1].innerText = "Type an amount!";
        }
        if (moneyInserted == 0) return false;
        if (moneyInserted <= money) {
            if (moneyInserted <= max && (!hasMin || moneyInserted >= min)) {
                const secs = machineTypes[machines[machineIndex].type].time;
                machines[machineIndex].state = "running";
                changeMoney(-moneyInserted);
                machines[machineIndex].money = moneyInserted;
                startLaundry(el, machine, machineIndex, compartment, secs, moneyInserted);
            } else {
                if (handleType == "pet") return false;
                el.children[1].innerText = hasMin ? "Not within range! Try this" : "Over max! Try this";
                el.children[0].value = hasMin ? min : max;
            }
        } else return false;
    } else {
        compartment.classList.add("drag-over");
        try {
            clearTimeout(compartmentTimeout);
        } catch { }
        compartmentTimeout = setTimeout(() => {
            compartment.classList.remove("drag-over");
        }, 500)
    }
}

function finishLaundry(machine, machineIndex) {
    clearInterval(laundryIntervals[machineIndex]);
    delete laundryIntervals[machineIndex];
    machines[machineIndex].state = "idle";
    machines[machineIndex].deterged = false;
    const compartment = machine.children[0];
    const circle = machine.children[1];
    let timerEl;
    if (machine.children[2].classList.contains("sell")) {
        timerEl = machine.children[3];
    } else {
        timerEl = machine.children[2];
    }
    compartment.classList.remove("deterged");
    circle.classList.remove("washing");
    circle.replaceChildren();
    timerEl.remove();
    const type = machineTypes[machines[machineIndex].type];
    if (!isNaN(type.profit)) {
        let moneyGot = Math.floor(machines[machineIndex].money * type.profit);
        moneyGot += (moneyGot == machines[machineIndex].money) ? 1 : 0;
        changeMoney(moneyGot);
    } else {
        addPet("spider", true);
    }
    save();
}

function addPet(pet, isNew) {
    if (isNew) {
        pets[Object.keys(pets).length] = {
            type: pet,
            money: null,
            machine: null,
            detergent: "yellow",
            state: "idle",
            walkTimeLeft: 100
        };
    }
    const petEl = document.createElement("img");
    petEl.src = petTypes[pet].src;
    petEl.classList.add("pet");
    petEl.dataset.pettype = pet;
    petEl.draggable = false;
    petEl.style.left = `${Math.random() * (document.body.getBoundingClientRect().width - 100)}px`
    petEl.style.top = `${Math.random() * (document.body.getBoundingClientRect().height - 100)}px`
    petEl.addEventListener("mousedown", (e) => { grabPetStart(e, "mouse") });
    petEl.addEventListener("touchstart", (e) => { grabPetStart(e, "touch") }, { passive: false });
    document.body.appendChild(petEl);
}

function petClick(petEl) {
    if (!document.querySelector(".pet-menu")) {
        const petEls = document.querySelectorAll(".pet");
        const petIndex = [].slice.call(petEls).indexOf(petEl);
        displayedPetMenu = petIndex;
        const menu = document.createElement("div");
        menu.classList.add("pet-menu");
        const left = petEl.style.left;
        const top = petEl.style.top;
        let menuLeft = Number(left.substring(0, left.length - 2)) + 50
        let menuTop = Number(top.substring(0, top.length - 2)) + 50
        if (menuLeft > document.body.getBoundingClientRect().width - 305) {
            menuLeft = document.body.getBoundingClientRect().width - 305;
        }
        if (menuLeft > document.body.getBoundingClientRect().height - 130) {
            menuLeft = document.body.getBoundingClientRect().width - 130;
        }
        menu.style.left = `${menuLeft}px`;
        menu.style.top = `${menuTop}px`;
        const infoText = document.createElement("p");
        infoText.innerHTML = "Drag pet to assign machine!<br>If the pet doesn't work,<br>troubleshoot yourself!";
        infoText.title = "Example: You're out of detergent";
        menu.appendChild(infoText);
        menu.insertAdjacentHTML("beforeend", `
                    <select id="pet-detergent">
                        <option value="yellow">Yellow detergent</option>
                        <option value="pink">Pink detergent</option>
                    </select>
                `);
        const petMoney = document.createElement("div");
        petMoney.classList.add("pet-money");
        const input = document.createElement("input");
        input.type = "number";
        input.placeholder = `$1-${petTypes[pets[petIndex].type].max}`
        if (pets[petIndex].money) input.value = pets[petIndex].money;
        input.addEventListener("keydown", (e) => { if (e.key == "Enter") setPetMoney() });
        petMoney.appendChild(input);
        const applyMoney = document.createElement("button");
        applyMoney.innerText = "Tell pet to wash this amount";
        applyMoney.addEventListener("click", setPetMoney);
        petMoney.appendChild(applyMoney);
        menu.appendChild(petMoney);
        const resetButton = document.createElement("button");
        resetButton.innerText = "Reset pet";
        resetButton.addEventListener("click", resetPet);
        menu.appendChild(resetButton);
        document.body.appendChild(menu);
        const petDetergent = document.getElementById("pet-detergent");
        petDetergent.value = pets[petIndex].detergent;
        petDetergent.addEventListener("change", (e) => {
            pets[displayedPetMenu].detergent = e.target.value;
        });
    }
}

function setPetMoney() {
    const input = document.querySelector(".pet-money input");
    if (input.value && input.value <= 10 && input.value >= 1) {
        pets[displayedPetMenu].money = Number(document.querySelector(".pet-money input").value);
        document.querySelector(".pet-menu").remove();
        if (pets[displayedPetMenu].machine != undefined) pets[displayedPetMenu].state = "gettingDetergent";
        try {
            Object.entries(document.getElementsByClassName("money-pet-clone"))
                .find(([key, value]) => Number(value.dataset.pet) == displayedPetMenu)[1]
                .remove();
        } catch { }
        try {
            Object.entries(document.getElementsByClassName("detergent-pet-clone"))
                .find(([key, value]) => Number(value.dataset.pet) == displayedPetMenu)[1]
                .remove();
        } catch { }
        displayedPetMenu = null;
        save();
    }
}

function checkDeleteMenu(e) {
    try {
        if (((e.target == document.body || e.target == document.documentElement) ||
            (!e.target.classList.contains("pet-menu") &&
                !e.target.parentElement.classList.contains("pet-menu") &&
                !e.target.parentElement.parentElement.classList.contains("pet-menu") &&
                !e.target.classList.contains("pet"))) && document.querySelector(".pet-menu")) {
            document.querySelector(".pet-menu").remove();
            displayedPetMenu = null;
        }
    } catch { }
}

function updatePets() {
    for (let i = 0; i < Object.keys(pets).length; i++) {
        const petEls = document.querySelectorAll(".pet");
        const left = Number(petEls[i].style.left.split("px")[0]);
        const top = Number(petEls[i].style.top.split("px")[0]);
        if (pets[i].state == "gettingDetergent") {
            if (machineEls[pets[i].machine].children[0].classList.contains("deterged")) {
                pets[i].state = "gettingMoney";
                continue;
            }
            if (detergentCount[pets[i].detergent] == 0) {
                pets[i].state = "idle";
                continue;
            }
            const selectedDetergent = Object.keys(detergents).find((key) => detergents[key].dataset.detergenttype == pets[i].detergent);
            const rect = detergents[selectedDetergent].getBoundingClientRect();
            const bodyRect = document.body.getBoundingClientRect();
            const newTop = top + ((rect.top - bodyRect.top - top) / pets[i].walkTimeLeft)
            const newLeft = left + ((rect.left - bodyRect.left - left) / pets[i].walkTimeLeft)
            if (petEls[i] != grabbingPetEl) {
                petEls[i].style.top = `${newTop}px`;
                petEls[i].style.left = `${newLeft}px`;
                petEls[i].style.transform = `rotate(${Math.atan2(newTop - top, newLeft - left) + 0.5 * Math.PI}rad)`;
            }

            pets[i].walkTimeLeft--;
            if (pets[i].walkTimeLeft <= 0) {
                const clone = detergents[selectedDetergent].cloneNode(true);
                clone.classList.add("detergent-pet-clone");
                clone.dataset.pet = i;
                clone.style.top = petEls[i].style.top;
                clone.style.left = petEls[i].style.left;
                document.body.appendChild(clone);
                pets[i].state = "puttingDetergent";
                pets[i].walkTimeLeft = 100;
                save();
            }
        } else if (pets[i].state == "puttingDetergent") {
            const selectedMachine = machineEls[pets[i].machine];
            const rect = selectedMachine.children[0].getBoundingClientRect();
            const bodyRect = document.body.getBoundingClientRect();
            let detergentPetClone;
            try {
                detergentPetClone = Object.entries(document.getElementsByClassName("detergent-pet-clone"))
                    .find(([key, value]) => Number(value.dataset.pet) == i)[1];
            } catch {
                const selectedDetergent = Object.keys(detergents).find((key) => detergents[key].dataset.detergenttype == pets[i].detergent);
                detergentPetClone = detergents[selectedDetergent].cloneNode(true);
                detergentPetClone.classList.add("detergent-pet-clone");
                detergentPetClone.dataset.pet = i;
                document.body.appendChild(detergentPetClone);
            }
            const newTop = top + ((rect.top - bodyRect.top - top) / pets[i].walkTimeLeft);
            const newLeft = left + ((rect.left - bodyRect.left - left) / pets[i].walkTimeLeft);
            if (petEls[i] != grabbingPetEl) {
                petEls[i].style.top = `${newTop}px`;
                petEls[i].style.left = `${newLeft}px`;
                petEls[i].style.transform = `rotate(${Math.atan2(newTop - top, newLeft - left) + 0.5 * Math.PI}rad)`;
            }
            detergentPetClone.style.top = petEls[i].style.top;
            detergentPetClone.style.left = petEls[i].style.left;
            pets[i].walkTimeLeft--;
            if (pets[i].walkTimeLeft <= 0) {
                pets[i].state = "animation";
                const selectedMachine = machineEls[pets[i].machine];
                selectedMachine.children[0].classList.add("open");
                setTimeout(() => {
                    if (!selectedMachine.children[1].classList.contains("washing")) {
                        if (detergentCount[pets[i].detergent] > 0) {
                            detergentPetClone.remove();
                            if (!selectedMachine.children[0].classList.contains("deterged")) {
                                detergentCount[pets[i].detergent] -= 1;
                            }
                            selectedMachine.children[0].classList.add("deterged");
                            machines[pets[i].machine].deterged = true;
                            const detergentCountLength = Object.values(detergentCount).filter(d => d > 0).length;
                            if (detergentCount[pets[i].detergent] == 0 && detergentCountLength > 0) {
                                document.querySelector(`.detergent-image[data-detergenttype=${pets[i].detergent}]`).remove();
                                document.querySelector(`.detergent-count[data-detergenttype=${pets[i].detergent}]`).remove();
                                const len = `${25 + (detergentContainer.children.length / 2) * 40}px`;
                                detergentContainer.style.setProperty("--len", len);
                            } else {
                                document.querySelector(`.detergent-count[data-detergenttype=${pets[i].detergent}]`).innerText = detergentCount[pets[i].detergent];
                            }
                            setTimeout(() => {
                                selectedMachine.children[0].classList.remove("open");
                                pets[i].state = "gettingMoney";
                                pets[i].walkTimeLeft = 100;
                            }, 1000)
                        } else {
                            resetPet(i);
                        }
                    }
                }, 1000);
                save();
            }
        } else if (pets[i].state == "gettingMoney") {
            const rect = moneyEl.getBoundingClientRect();
            const bodyRect = document.body.getBoundingClientRect();
            const newTop = top + ((rect.top - bodyRect.top - top) / pets[i].walkTimeLeft);
            const newLeft = left + ((rect.left - bodyRect.left - left) / pets[i].walkTimeLeft);
            if (petEls[i] != grabbingPetEl) {
                petEls[i].style.top = `${newTop}px`;
                petEls[i].style.left = `${newLeft}px`;
                petEls[i].style.transform = `rotate(${Math.atan2(newTop - top, newLeft - left) + 0.5 * Math.PI}rad)`;
            }
            pets[i].walkTimeLeft--;
            if (pets[i].walkTimeLeft <= 0) {
                const clone = moneyEl.cloneNode(true);
                clone.classList.add("money-pet-clone");
                clone.dataset.pet = i;
                clone.style.top = petEls[i].style.top;
                clone.style.left = petEls[i].style.left;
                document.body.appendChild(clone);
                pets[i].state = "puttingMoney";
                pets[i].walkTimeLeft = 100;
                save();
            }
        } else if (pets[i].state == "puttingMoney") {
            const selectedMachine = machineEls[pets[i].machine];
            const rect = selectedMachine.children[1].getBoundingClientRect();
            const bodyRect = document.body.getBoundingClientRect();
            let moneyPetClone;
            try {
                moneyPetClone = Object.entries(document.getElementsByClassName("money-pet-clone"))
                    .find(([key, value]) => Number(value.dataset.pet) == i)[1];
            } catch {
                moneyPetClone = moneyEl.cloneNode(true);
                moneyPetClone.classList.add("money-pet-clone");
                moneyPetClone.dataset.pet = i;
                document.body.appendChild(moneyPetClone);
            }
            const newTop = top + ((rect.top - bodyRect.top - top) / pets[i].walkTimeLeft);
            const newLeft = left + ((rect.left - bodyRect.left - left) / pets[i].walkTimeLeft);
            if (petEls[i] != grabbingPetEl) {
                petEls[i].style.top = `${newTop}px`;
                petEls[i].style.left = `${newLeft}px`;
                petEls[i].style.transform = `rotate(${Math.atan2(newTop - top, newLeft - left) + 0.5 * Math.PI}rad)`;
            }
            moneyPetClone.style.top = petEls[i].style.top;
            moneyPetClone.style.left = petEls[i].style.left;
            pets[i].walkTimeLeft--;

            if (pets[i].walkTimeLeft <= 0) {
                moneyPetClone.remove();
                const selectedMachine = machineEls[pets[i].machine];
                const input = document.createElement("input");
                input.value = pets[i].money;
                selectedMachine.children[1].appendChild(input);
                if (!checkStartLaundry(selectedMachine.children[1], "pet")) {
                    input.remove();
                }
                selectedMachine.children[0].classList.remove("open");
                pets[i].state = "gettingDetergent";
                pets[i].walkTimeLeft = 100;
                save();
            }
        }
    }
}

function resetPet(index) {
    if (typeof index != "number") index = displayedPetMenu;
    pets[index] = {
        type: pets[index].type,
        money: null,
        machine: null,
        detergent: "yellow",
        state: "idle",
        walkTimeLeft: 100
    };
    if (displayedPetMenu != null) {
        document.querySelector(".pet-menu").remove();
        displayedPetMenu = null;
    }
    try {
        Object.entries(document.getElementsByClassName("money-pet-clone"))
            .find(([key, value]) => Number(value.dataset.pet) == index)[1]
            .remove();
    } catch { }
    try {
        Object.entries(document.getElementsByClassName("detergent-pet-clone"))
            .find(([key, value]) => Number(value.dataset.pet) == index)[1]
            .remove();
    } catch { }
    save();
}

setInterval(updatePets, 100);

document.addEventListener("scroll", () => {
    const viewport = window.visualViewport;
    moneyContainer.style.bottom = `${-window.scrollY - (viewport.height * (1 / viewport.scale) - viewport.height)}px`;
    detergentTopContainer.style.top = `${window.scrollY}px`;
})


document.addEventListener("click", (e) => checkDeleteMenu(e));


if (localStorage.getItem("laundryMoney") && localStorage.getItem("laundryMachines")) continueGame();
else startGame();

tabButtons.addEventListener("click", (e) => {
    const clicked = e.target.closest(".tab-btn")
    if (!clicked) return;
    document.querySelector(".tab-btn.active").classList.remove("active");
    clicked.classList.add("active");
    const tabId = clicked.dataset.tab;
    document.querySelector(".tab.active").classList.remove("active");
    document.getElementById(tabId).classList.add("active");
})

function updateRotations() {
    if (grabbingDetergent) {
        const detergentClone = document.getElementById("detergent-clone")
        const detergentPos = detergentClone.style.left.split("px")[0];
        detergentClone.style.transform = `rotate(${(detergentPos - lastDetergentPos) * 0.5}deg)`;
        lastDetergentPos = detergentPos;
    } else if (grabbingMoney) {
        const moneyClone = document.getElementById("money-clone")
        const moneyPos = moneyClone.style.left.split("px")[0];
        moneyClone.style.transform = `rotate(${(moneyPos - lastMoneyPos) * 0.2}deg)`;
        lastMoneyPos = moneyPos;
    } else if (grabbingPet) {
        const petPos = grabbingPetEl.style.left.split("px")[0];
        grabbingPetEl.style.transform = `rotate(${(petPos - lastPetPos) * 0.5}deg)`;
        lastPetPos = petPos;
    }
}

function grabDetergentStart(e, type) {
    let touch = (type == "mouse") ? e : e.touches[0];
    const detergentType = e.target.dataset.detergenttype;
    if (detergentType == "yellow" && detergentCount.yellow > 0) {
        e.preventDefault();
        if (document.getElementById("detergent-clone")) document.getElementById("detergent-clone").remove()
        grabbingDetergent = "yellow";
        const clone = document.querySelector(".detergent-image[data-detergenttype=yellow]").cloneNode(true);
        clone.id = "detergent-clone";
        clone.style.left = `${touch.clientX - 15}px`;
        clone.style.top = `${touch.clientY + window.scrollY - 5}px`;
        lastDetergentPos = touch.clientX - 15;
        document.body.appendChild(clone);
    } else if (detergentType == "pink" && detergentCount.pink > 0) {
        e.preventDefault();
        if (document.getElementById("detergent-clone")) document.getElementById("detergent-clone").remove()
        grabbingDetergent = "pink";
        const clone = document.querySelector(".detergent-image[data-detergenttype=pink]").cloneNode(true);
        clone.id = "detergent-clone";
        clone.style.left = `${touch.clientX - 15}px`;
        clone.style.top = `${touch.clientY + window.scrollY - 5}px`;
        lastDetergentPos = touch.clientX - 15;
        document.body.appendChild(clone);
    }
}

function grabMoneyStart(e, type) {
    e.preventDefault();
    if (document.getElementById("money-clone")) document.getElementById("money-clone").remove();
    grabbingMoney = true;
    const clone = moneyEl.cloneNode(true);
    clone.id = "money-clone";
    let touch = (type == "mouse") ? e : e.touches[0];
    clone.style.left = `${touch.clientX - moneyWidth / 2}px`;
    clone.style.top = `${touch.clientY + window.scrollY - 5}px`;
    document.body.appendChild(clone);
}

function grabPetStart(e, type) {
    e.preventDefault();
    clickingPet = true;
    grabbingPet = true;
    grabbingPetEl = e.target;
    grabbingPetEl.classList.add("grabbing");
    let touch = (type == "mouse") ? e : e.touches[0];
    e.target.style.left = `${touch.clientX - 35}px`;
    e.target.style.top = `${touch.clientY + window.scrollY - 10}px`;
}

function move(e, type) {
    let touch = (type == "mouse") ? e : e.touches[0];
    if (grabbingDetergent) {
        e.preventDefault();
        const detergentClone = document.getElementById("detergent-clone");
        detergentClone.style.left = `${touch.clientX - 15}px`;
        detergentClone.style.top = `${touch.clientY + window.scrollY - 5}px`;
    } else if (grabbingMoney) {
        e.preventDefault();
        const moneyClone = document.getElementById("money-clone");
        moneyClone.style.left = `${touch.clientX - moneyWidth / 2}px`;
        moneyClone.style.top = `${touch.clientY + window.scrollY - 5}px`;
    } else if (grabbingPet) {
        e.preventDefault();
        clickingPet = false;
        grabbingPetEl.style.left = `${touch.clientX - 35}px`;
        grabbingPetEl.style.top = `${touch.clientY + window.scrollY - 10}px`;
    }
}

function drop(e, type) {
    let touch = (type == "mouse") ? e : e.changedTouches[0];
    if (grabbingDetergent) {
        const detergentClone = document.getElementById("detergent-clone");
        const detergentType = detergentClone.dataset.detergenttype;
        detergentClone.remove();
        grabbingDetergent = null;
        for (let i = 0; i < compartments.length; i++) {
            const rect = compartments[i].getBoundingClientRect();
            if (rect.left - 10 < touch.clientX && rect.top - 10 < touch.clientY &&
                rect.right + 10 > touch.clientX && rect.bottom + 10 > touch.clientY
                && compartments[i].classList.contains("open") &&
                !compartments[i].classList.contains("deterged") &&
                detergentCount[detergentType] > 0
            ) {
                compartments[i].classList.add("deterged");
                const machine = compartments[i].parentElement;
                const machineIndex = [].slice.call(machineEls).indexOf(machine);
                machines[machineIndex].deterged = true;
                detergentCount[detergentType] -= 1;
                const detergentCountLength = Object.values(detergentCount).filter(d => d > 0).length;
                if (detergentCount[detergentType] == 0 && detergentCountLength > 0) {
                    document.querySelector(`.detergent-image[data-detergenttype=${detergentType}]`).remove();
                    document.querySelector(`.detergent-count[data-detergenttype=${detergentType}]`).remove();
                    const len = `${25 + (detergentContainer.children.length / 2) * 40}px`;
                    detergentContainer.style.setProperty("--len", len);
                } else document.querySelector(`.detergent-count[data-detergenttype=${detergentType}]`).innerText = detergentCount[detergentType];
                save();
            }
        }
    } else if (grabbingMoney) {
        const moneyClone = document.getElementById("money-clone");
        moneyClone.remove();
        grabbingMoney = false;
        for (let i = 0; i < circles.length; i++) {
            const rect = circles[i].getBoundingClientRect();
            if (rect.left < touch.clientX && rect.top < touch.clientY &&
                rect.right > touch.clientX && rect.bottom > touch.clientY &&
                !circles[i].classList.contains("inserting") && !circles[i].classList.contains("washing")) {
                const machine = circles[i].parentElement;
                const machineIndex = [].slice.call(machineEls).indexOf(machine);
                const type = machines[machineIndex].type;
                const min = machineTypes[type].min;
                const hasMin = !isNaN(min);
                const max = machineTypes[type].max;
                circles[i].classList.add("inserting");
                const input = document.createElement("input");
                input.type = "number";
                input.min = 0;
                if (max > money) {
                    input.max = money;
                    input.placeholder = money;
                } else {
                    input.max = max;
                    input.placeholder = max;
                }
                if (hasMin) input.placeholder = min;
                const button = document.createElement("button");
                button.innerText = "Insert money";
                button.addEventListener("click", (e) => { checkStartLaundry(e.target.parentElement) })
                input.addEventListener("keydown", (e) => {
                    if (e.key == "Enter") checkStartLaundry(e.target.parentElement);
                })
                circles[i].appendChild(input);
                circles[i].appendChild(button);
            }
        }
    } else if (grabbingPet) {
        grabbingPet = false;
        grabbingPetEl.classList.remove("grabbing");
        if (clickingPet) petClick(grabbingPetEl);
        else {
            for (let i = 0; i < machineEls.length; i++) {
                const rect = machineEls[i].getBoundingClientRect();
                if (rect.left < touch.clientX && rect.top < touch.clientY &&
                    rect.right > touch.clientX && rect.bottom > touch.clientY) {
                    const petEls = document.querySelectorAll(".pet");
                    const petIndex = [].slice.call(petEls).indexOf(grabbingPetEl);
                    const machineIndex = [].slice.call(machineEls).indexOf(machineEls[i]);
                    pets[petIndex].machine = machineIndex;
                    const machineEl = machineEls[machineIndex];
                    if (pets[petIndex].state == "idle" && pets[petIndex].money) {
                        pets[petIndex].state = "gettingDetergent";
                    }
                    machineEl.style.border = "5px solid #a8f0ba";
                    setTimeout(() => { machineEl.style.border = "2px solid var(--border)"; }, 200);
                    save();
                }
            }
        }
        grabbingPetEl = null;
    }
}

moneyEl.addEventListener("mousedown", (e) => { grabMoneyStart(e, "mouse") });
moneyEl.addEventListener("touchstart", (e) => { grabMoneyStart(e, "touch") }, { passive: false });

document.addEventListener("mousemove", (e) => { move(e, "mouse") })
document.addEventListener("touchmove", (e) => { move(e, "touch") }, { passive: false })

document.addEventListener("mouseup", (e) => { drop(e, "mouse") })
document.addEventListener("touchend", (e) => { drop(e, "touch") })

setInterval(updateRotations, 50);

for (let i = 0; i < compartments.length; i++) {
    compartments[i].addEventListener("click", (e) => {
        const circle = e.target.parentElement.children[1];
        if (e.target.classList.contains("open")) {
            e.target.classList.remove("open");
        } else if (!circle.classList.contains("washing")) {
            e.target.classList.add("open");
        }
    })
}

for (let i = 0; i < sells.length; i++) {
    sells[i].addEventListener("click", (e) => {
        const machine = e.target.parentElement;
        if (!machine.children[1].classList.contains("washing")) {
            const machineIndex = [].slice.call(machineEls).indexOf(machine);
            machine.remove();
            const cost = machineTypes[machines[machineIndex].type].cost;
            changeMoney(Math.floor(cost * 3 / 4));
            for (pet = 0; pet < Object.values(pets).length; pet++) {
                if (pets[pet].machine == machineIndex) resetPet(pet);
            }
            machines.splice(machineIndex, 1);
            save();
        }
    })
}

for (let i = 0; i < buys.length; i++) {
    buys[i].addEventListener("click", (e) => {
        const buytype = e.target.dataset.type;
        if (buytype == "machine") {
            const type = machineTypes[e.target.dataset.machinetype];
            if (money >= type.cost) {
                changeMoney(-type.cost);
                machineContainer.insertAdjacentHTML("beforeend", type.code);

                machines.push({ type: e.target.dataset.machinetype, state: "idle", timer: null, money: null });

                const machine = machineEls[machineEls.length - 1];
                const compartment = machine.children[0];
                const circle = machine.children[1];
                const sell = machine.children[2];

                compartment.addEventListener("click", (e) => {
                    const circle = e.target.parentElement.children[1];
                    if (e.target.classList.contains("open")) {
                        e.target.classList.remove("open");
                    } else if (!circle.classList.contains("washing")) {
                        e.target.classList.add("open");
                    }
                })

                compartment.addEventListener("drop", (e) => {
                    if (e.target.classList.contains("open")) {
                        e.preventDefault();
                        const data = e.dataTransfer.getData("text");
                        if (data.endsWith("detergent.png")) {
                            e.target.classList.add("deterged");
                        }
                    }
                })

                circle.addEventListener("dragover", (e) => {
                    e.preventDefault();
                })

                circle.addEventListener("drop", (e) => {
                    e.preventDefault();
                    const data = e.dataTransfer.getData("text");
                    if (data == "money" && !e.target.classList.contains("inserting")) {
                        e.target.classList.add("inserting");
                        const input = document.createElement("input");
                        input.type = "number";
                        input.placeholder = money;
                        const button = document.createElement("button");
                        button.innerText = "Insert money";
                        button.addEventListener("click", () => { checkStartLaundry(e.target) })
                        e.target.appendChild(input);
                        e.target.appendChild(button);
                    }
                })

                sell.addEventListener("click", (e) => {
                    if (!machine.children[1].classList.contains("washing")) {
                        const machine = e.target.parentElement;
                        const machineIndex = [].slice.call(machineEls).indexOf(machine);
                        machine.remove();
                        const cost = machineTypes[machines[machineIndex].type].cost;
                        changeMoney(Math.floor(cost * 2 / 3));
                        for (pet = 0; pet < Object.values(pets).length; pet++) {
                            if (pets[pet].machine == machineIndex) resetPet(pet);
                        }
                        machines.splice(machineIndex, 1);
                        save();
                    }
                })
                save();
            }
        } else if (buytype == "detergent") {
            const detergentType = e.target.dataset.detergenttype;
            const type = detergentTypes[detergentType];
            if (money == type.cost && machines.length == 1) {
                e.target.innerText = "You'd be bankrupt if you bought this!";
                setTimeout(() => {
                    e.target.innerText = "Buy";
                }, 3000)
            } else if (money >= type.cost) {
                if (!document.querySelector(`.detergent-image[data-detergenttype=${detergentType}]`)) {
                    const img = document.createElement("img");
                    img.src = type.src;
                    img.classList.add("detergent-image");
                    img.draggable = false;
                    img.oncontextmenu = "return false";
                    img.dataset.detergenttype = detergentType;
                    const detergentCountEl = document.createElement("p");
                    detergentCountEl.classList.add("detergent-count");
                    detergentCountEl.dataset.detergenttype = detergentType;
                    detergentCountEl.innerText = detergentCount[detergentType];
                    detergentContainer.appendChild(img);
                    detergentContainer.appendChild(detergentCountEl);
                    img.addEventListener("mousedown", (e) => { grabDetergentStart(e, "mouse") })
                    img.addEventListener("touchstart", (e) => { grabDetergentStart(e, "touch") })
                }
                detergentCount[detergentType] += type.uses;
                document.querySelector(`.detergent-count[data-detergenttype=${detergentType}]`).innerText = detergentCount[detergentType];
                changeMoney(-type.cost);
                for (let i = 0; i < Object.values(detergentCount).length; i++) {
                    if (Object.values(detergentCount)[i] == 0) {
                        const detergentType = Object.keys(detergentCount)[i];
                        const detergentImage = document.querySelector(`.detergent-image[data-detergenttype=${detergentType}]`);
                        if (detergentImage) {
                            detergentImage.remove();
                            document.querySelector(`.detergent-count[data-detergenttype=${detergentType}]`).remove();
                        }
                    }
                }

                const len = `${25 + (detergentContainer.children.length / 2) * 40}px`;
                detergentContainer.style.setProperty("--len", len);
                save();
            }
        }
    })
}