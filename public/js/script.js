(function () {
    var socket = io();
    const notificationPermission = Notification.requestPermission();
    const usernameContainer = document.getElementById("username");
    socket.emit("new user connected", `${usernameContainer.textContent}`);
    const userMessages = new Map();

    const messages = document.getElementById("messages");
    const sendButton = document.getElementById("sendButton");
    const input = document.getElementById("inputField");

    let activeUser = document.querySelector(".active");

    sendButton.addEventListener("click", function (event) {
        sendMessage();
        event.preventDefault();
    });

    input.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            sendMessage();
            event.preventDefault();
        }
    });

    function sendMessage() {
        if (input.value && activeUser) {
            const newMessage = {
                to: activeUser.children[0].textContent,
                from: usernameContainer.textContent,
                text: input.value,
            };
            socket.emit("chat message", newMessage);

            const item = document.createElement("div");
            item.classList.add("message-to");
            item.innerHTML = `<span class="message-text__container">${newMessage.text}</span>`;
            messages.appendChild(item);

            const messageStorage = userMessages.get(newMessage.to) || [];
            messageStorage.push(newMessage);
            userMessages.set(newMessage.to, messageStorage);
            input.value = "";
        }
    }

    socket.on(document.getElementById("username").textContent, function (message) {
        console.log(message);
        const messageStorage = userMessages.get(message.to) || [];
        messageStorage.push(message);
        userMessages.set(message.to, messageStorage);
        if (activeUser) {
            const item = document.createElement("div");
            item.classList.add("message-from");
            item.innerHTML = `<span class="message-text__container">${message.text}</span>`;
            messages.appendChild(item);
        }
    });

    socket.on("new user connection", function (msg) {
        let html = "";
        JSON.parse(msg).forEach((element) => {
            const user = JSON.parse(element);
            html += `
                <div class="user__container">
                    <span class="username__container">${user.username}</span>
                    <span class="notifications"></span>
                </div>
            `;
        });
        document.getElementById("userContainer").innerHTML = html;
        activeUser && activeUser.classList.add("active");
        for (let user of document.getElementById("userContainer").children) {
            user.addEventListener("click", function () {
                if (user != activeUser) {
                    user.classList.add("active");
                    activeUser && activeUser.classList.remove("active");
                    activeUser = user;
                    getAndShowMessages(activeUser.children[0].textContent);
                }
            });
        }
    });
    function getAndShowMessages(username) {
        const currentMessages = userMessages.get(username) || [];
        messages.innerHTML = "";
        for (const message of currentMessages) {
            const item = document.createElement("div");
            usernameContainer.textContent === message.from
                ? item.classList.add("message-to")
                : item.classList.add("message-from");
            item.innerHTML = `<span class="message-text__container">${message.text}</span>`;
            messages.appendChild(item);
        }
    }

    socket.on(`notifications ${usernameContainer.textContent}`, function (message) {
        notificationPermission.then(() => {
            document.hidden &&
                new Notification(`You have new message from ${message.from}!`, {
                    body: message.text,
                });
        });
    });
})();
