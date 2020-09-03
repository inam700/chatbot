const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
//Get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const socket = io();

//Join chatRoom
socket.emit("joinRoom", { username, room });
socket.on("roomUsers", ({ room, users }) => {
  outputRoomUsers(room);
  outputUsers(users);
});
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//new message

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;

  //Emit chat message to the server
  socket.emit("chatMessage", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//Output Message function

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = ` <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
     ${message.text}
    </p>`;

  document.querySelector(".chat-messages").appendChild(div);
}

function outputRoomUsers(room) {
  roomName.innerText = room;
}

function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}`;
}
