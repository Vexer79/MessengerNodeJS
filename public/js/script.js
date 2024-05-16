(function () {
    const socket = io();
    const notificationPermission = Notification.requestPermission();
    const userMessages = new Map();

    const usernameContainer = document.getElementById("username");
    const messageContainer = document.getElementById("messages");
    const userContainer = document.getElementById("userContainer");
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
            
            messageContainer.appendChild(createMessage(newMessage.text));
            saveMessage(newMessage, newMessage.to);
            input.value = "";
        }
    }

    function createMessage(text, sender = "to") {
        const item = document.createElement("div");
        item.classList.add(`message-${sender}`);
        item.innerHTML = `<span class="message-text__container">${text}</span>`;
        return item;
    }

    function saveMessage(message, sender) {
        const messageStorage = userMessages.get(sender) || [];
        messageStorage.push(message);
        userMessages.set(sender, messageStorage);
    }

    socket.on("connect", () => {
        socket.emit("new user connected", `${usernameContainer.textContent}`);
    });

    socket.on(usernameContainer.textContent, function (message) {
        saveMessage(message, message.from);
        if (activeUser.children[0].textContent === message.from) {
            messageContainer.appendChild(createMessage(message.text, "from"));
        }
    });

    socket.on("new user connection", function (msg) {
        let html = "";
        JSON.parse(msg).forEach((userJSON) => {
            const user = JSON.parse(userJSON);
            html += createUserContainer(user.username);
        });
        userContainer.innerHTML = html;
        activeUser && activeUser.classList.add("active");
        for (let user of userContainer.children) {
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

    function createUserContainer(username) {
        return `
                <div class="user__container">
                    <span class="username__container">${username}</span>
                    <span class="notifications"></span>
                </div>
            `;
    }

    function getAndShowMessages(username) {
        const currentMessages = userMessages.get(username) || [];
        messageContainer.innerHTML = "";
        for (const message of currentMessages) {
            messageContainer.appendChild(
                createMessage(
                    message.text,
                    usernameContainer.textContent === message.from ? "to" : "from"
                )
            );
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
