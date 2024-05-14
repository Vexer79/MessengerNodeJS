(function () {
    var socket = io();
    const notificationPermission = Notification.requestPermission();
    socket.emit("new user connected", `${document.getElementById("username").textContent}`);

    var messages = document.getElementById("messages");
    var sendButton = document.getElementById("sendButton");
    var input = document.getElementById("inputField");

    sendButton.addEventListener("click", function (e) {
        e.preventDefault();
        if (input.value) {
            socket.emit(
                "chat message",
                `(${document.getElementById("username").textContent}) ${input.value}`
            );
            input.value = "";
        }
    });

    socket.on("chat message", function (msg) {
        var item = document.createElement("li");
        item.textContent = msg;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
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
    });

    socket.on("notifications", function (msg) {
        notificationPermission.then(() => {
            document.hidden && new Notification("You have new message!", { body: msg });
        });
    });
})();
