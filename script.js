const canvas = document.getElementById("canvas");
const eraserButton = document.getElementById("eraser-button");
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");

const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");
const chatMessages = document.getElementById("chat-messages");

const promptUserModal = document.querySelector(".prompt-user");

let isUserFirstConnectiion = false;

let isEraser = false;
const ctx = canvas.getContext("2d");
const ws = new WebSocket("ws://localhost:8080");

sendButton.addEventListener("click", () => {
  sendMessage();
});

chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

window.addEventListener('DOMContentLoaded', () => {

  const storage = localStorage.getItem('username');

  if (!storage) {
    isUserFirstConnectiion = true ;
    promptUserModal.classList.add('display');
    return; 
  }
  isUserFirstConnectiion = false ; 

})

function sendMessage() {
  const message = chatInput.value;
  const nameUser = JSON.parse(localStorage.getItem("username"));

  console.log(nameUser);

  if (message) {
    const data = {
      action: "chat", 
      data: { message, nameUser },
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
    chatInput.value = "";
  }
}

function displayMessage(message, username) {
  const content = document.createElement("div");
  content.setAttribute("class", "message");

  // possible xss injection but that was the only way i could do it using plain js
  content.innerHTML = `
    <p class="userName">by ${username}</p>
        <p class="content">${message}</p>
    `;

  chatMessages.appendChild(content);
}

loginForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Empêchez la soumission du formulaire par défaut

  const username = usernameInput.value;

  if (username) {
    // Stockez le pseudonyme dans le localStorage ou dans une variable de jeu
    localStorage.setItem("username", JSON.stringify(username));

    window.location.href = "index.html";
  }
});

eraserButton.addEventListener("click", () => {
  isEraser = !isEraser; // Basculez l'état de la gomme
});

canvas.addEventListener("click", (event) => {
  let data = {}; // Déclarez data en tant que variable let

  if (isEraser) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.x;
    const y = event.clientY - rect.y;
    const id = `$(x),$(y)`;
    data = {
      action: "remove",
      data: { id, x, y, color: "#444448"  }, // Utilisez "#ffffff" pour le blanc
    };
    console.log("DATA");
  } else {
    // Ajoutez un random pour mettre des couleurs aléatoires
    var randomColor = Math.floor(Math.random() * 16777215).toString(16);
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = `$(x),$(y)`;
    data = {
      action: "draw",
      data: { id, x, y, color: "#" + randomColor },
    };
  }

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
});

ws.onmessage = (event) => {
  const { action, data } = JSON.parse(event.data);
  if (action == "draw") {
    ctx.fillStyle = data.color;
    ctx.fillRect(data.x, data.y, 15, 15);
  } else if (action == "remove") {
    ctx.fillStyle = data.color;
    ctx.fillRect(data.x, data.y, 50, 50);
  } else if (action == "chat") {
    const { message, nameUser } = data;
    displayMessage(message, nameUser);
  }
};
