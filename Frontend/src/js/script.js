document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav-links a").forEach(anchor => {
        anchor.addEventListener("click", function (event) {
            event.preventDefault();
            document.querySelector(this.getAttribute("href")).scrollIntoView({
                behavior: "smooth"
            });
        });
    });

    const navbar_burger = document.querySelector(".nav-bar-burger");
    const navbar_menu = document.querySelector(".nav-bar-menu");

    navbar_burger.addEventListener("click", () => {
        navbar_burger.classList.toggle("is-active");
        navbar_menu.classList.toggle("is-active");
    });
});