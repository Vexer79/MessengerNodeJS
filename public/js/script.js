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
    const parentMessageContainer = document.querySelector(".message-place__container");

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
                to: activeUser.children[1].textContent,
                from: usernameContainer.textContent,
                text: input.value,
            };
            socket.emit("chat message", newMessage);

            messageContainer.appendChild(createMessage(newMessage.text));
            saveMessage(newMessage, newMessage.to);
            input.value = "";
        }
        parentMessageContainer.scroll(0, parentMessageContainer.scrollHeight);
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
        if (activeUser?.children[1].textContent === message.from) {
            messageContainer.appendChild(createMessage(message.text, "from"));
            parentMessageContainer.scroll(0, parentMessageContainer.scrollHeight);
        }
    });

    socket.on("new user connection", function (msg) {
        let html = "";
        JSON.parse(msg).forEach((userJSON) => {
            const user = JSON.parse(userJSON);
            html +=
                user.username === activeUser?.children[1].textContent
                    ? ""
                    : createUserContainer(user.username);
        });
        userContainer.innerHTML = html;
        if (activeUser) {
            userContainer.appendChild(activeUser);
            activeUser.classList.add("active");
        }
        for (let user of userContainer.children) {
            user.addEventListener("click", function () {
                if (user != activeUser) {
                    user.classList.add("active");
                    activeUser && activeUser.classList.remove("active");
                    activeUser = user;
                    getAndShowMessages(activeUser.children[1].textContent);
                    parentMessageContainer.scroll(0, parentMessageContainer.scrollHeight);
                }
            });
        }
    });

    function createUserContainer(username) {
        return `
                <div class="user__container">
                    <span class="avatar__container"></span>
                    <span class="username__container">${username}</span>
                    <span class="notifications"></span>
                </div>
            `;
    }

    function getAndShowMessages(username) {
        const currentMessages = userMessages.get(username) || [];
        messageContainer.innerHTML = "";
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
