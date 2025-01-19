const levels = ["Bronce", "Plata", "Oro", "Diamante", "Maestro"];
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = null;

function login() {
    const username = document.getElementById("username").value.trim();
    if (!username) {
        document.getElementById("login-feedback").textContent = "Por favor, ingresa un nombre de usuario.";
        return;
    }

    if (!users[username]) {
        users[username] = { levelIndex: 0, progress: [], attempts: Array(levels.length).fill(0) };
    }

    currentUser = username;

    if (users[currentUser].levelIndex === levels.length - 1) {
        switchToCongratulations();
    } else {
        document.getElementById("player-name").textContent = currentUser;
        updateGameView();
        switchView("game-container");
    }
}

function updateGameView() {
    const levelIndex = users[currentUser].levelIndex;
    document.getElementById("current-level").textContent = levels[levelIndex];
    generateEquation(levelIndex);
}

function generateEquation(levelIndex) {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 20) - 10;
    const x = Math.floor(Math.random() * 10);
    const c = a * x + b;

    const formattedB = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    document.getElementById("equation").textContent = `${a}x ${formattedB} = ${c}`;
    document.getElementById("equation").dataset.answer = x;
}

function checkAnswer() {
    const answer = parseInt(document.getElementById("answer").value);
    const correctAnswer = parseInt(document.getElementById("equation").dataset.answer);
    const levelIndex = users[currentUser].levelIndex;

    users[currentUser].attempts[levelIndex]++;
    localStorage.setItem("users", JSON.stringify(users));

    if (answer === correctAnswer) {
        advanceLevel();
    } else {
        document.getElementById("game-feedback").textContent = "Respuesta incorrecta. Intenta de nuevo.";
    }
}

function advanceLevel() {
    const levelIndex = users[currentUser].levelIndex;
    if (levelIndex < levels.length - 1) {
        users[currentUser].levelIndex++;
        users[currentUser].progress[levelIndex] = new Date().toLocaleString();
        localStorage.setItem("users", JSON.stringify(users));
        updateGameView();
        document.getElementById("game-feedback").textContent = "¡Nivel completado! Avanzas al siguiente.";
    } else {
        users[currentUser].progress[levelIndex] = new Date().toLocaleString();
        localStorage.setItem("users", JSON.stringify(users));
        switchToCongratulations();
    }
}

function switchToCongratulations() {
    document.getElementById("winner-name").textContent = currentUser;
    switchView("congratulations-container");
}

function logout() {
    currentUser = null;
    switchView("login-container");
}

function requestAdminAccess() {
    const password = prompt("Introduce la contraseña de administrador:");
    if (password === "admin123") {
        switchView("admin-container");
        loadAdminView();
    } else {
        alert("Contraseña incorrecta.");
    }
}

function loadAdminView() {
    const records = document.getElementById("user-records");
    records.innerHTML = "";

    for (const [username, data] of Object.entries(users)) {
        const row = document.createElement("tr");

        const usernameCell = document.createElement("td");
        usernameCell.textContent = username;
        row.appendChild(usernameCell);

        levels.forEach((_, i) => {
            const levelCell = document.createElement("td");
            levelCell.innerHTML = `${data.progress[i] || "-"}<br><small>Intentos: ${data.attempts[i]}</small>`;
            row.appendChild(levelCell);
        });

        const actionsCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Eliminar";
        deleteButton.onclick = () => deleteUser(username);
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);

        records.appendChild(row);
    }
}

function deleteUser(username) {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${username}?`)) {
        delete users[username];
        localStorage.setItem("users", JSON.stringify(users));
        loadAdminView();
    }
}

function downloadRecords() {
    const rows = ["Username,Bronce,Plata,Oro,Diamante,Maestro"];
    for (const [username, data] of Object.entries(users)) {
        const row = [username];
        levels.forEach((_, i) => {
            row.push(data.progress[i] || "-");
        });
        rows.push(row.join(","));
    }

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "registro_usuarios.csv";
    a.click();

    URL.revokeObjectURL(url);
}

function logoutAdmin() {
    switchView("login-container");
}

function switchView(containerId) {
    document.querySelectorAll(".container").forEach((container) => {
        container.classList.add("hidden");
    });
    document.getElementById(containerId).classList.remove("hidden");
}
