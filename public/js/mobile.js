(() => {
    const button = document.getElementById("openMenuButton");
    const menu = document.getElementById("userContainer");
    button &&
        button.addEventListener("click", (event) => {
            menu && (menu.style.left = "0px");
        });
})();
