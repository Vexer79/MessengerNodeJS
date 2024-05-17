(() => {
    const button = document.getElementById("openMenuButton");
    const menu = document.getElementById("userContainer");
    button &&
        button.addEventListener("click", (event) => {
            menu && menu.classList.toggle("_active");
        });

    const input = document.getElementById("inputField");

    let touchstartX = 0;
    let touchendX = 0;
    let touchstartY = 0;
    let touchendY = 0;

    function checkDirection() {
        const deltaX = touchendX - touchstartX;
        const deltaY = touchendY - touchstartY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                menu.style.left = "0px";
            } else {
                menu.style.left = "-650px";
            }
        }
    }

    document.addEventListener("touchstart", (e) => {
        touchstartX = e.changedTouches[0].screenX;
        touchstartY = e.changedTouches[0].screenY;
    });

    document.addEventListener("touchend", (e) => {
        touchendX = e.changedTouches[0].screenX;
        touchendY = e.changedTouches[0].screenY;
        checkDirection();
    });

})();
