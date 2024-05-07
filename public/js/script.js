(function () {
    var socket = io();
    const { RTCPeerConnection, RTCSessionDescription } = window;
    const notificationPermission = Notification.requestPermission();

    var messages = document.getElementById("messages");
    var form = document.getElementById("form");
    var input = document.getElementById("input");

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (input.value) {
            socket.emit("chat message", input.value);
            input.value = "";
        }
    });

    socket.on("chat message", function (msg) {
        var item = document.createElement("li");
        item.textContent = msg;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on("notifications", function (msg) {
        notificationPermission.then(() => {
            document.hidden && new Notification("You have new message!", { body: msg });
        });
    });

    socket.on("answer-made", async (data) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));

        if (!isAlreadyCalling) {
            callUser(data.socket);
            isAlreadyCalling = true;
        }
    });

    socket.on("call-made", async (data) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

        socket.emit("make-answer", {
            answer,
            to: data.socket,
        });
    });
    
    navigator.getUserMedia(
        { video: true, audio: true },
        (stream) => {
            const localVideo = document.getElementById("local-video");
            if (localVideo) {
                localVideo.srcObject = stream;
            }

            stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
        },
        (error) => {
            console.warn(error.message);
        }
    );
})();
