document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll(".nav-links li a");
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    // Activar la clase 'selected' cuando se hace clic en un enlace
    links.forEach(link => {
        link.addEventListener("click", function () {
            links.forEach(item => item.classList.remove("selected"));
            this.classList.add("selected");

            // Cerrar el menú en móviles tras seleccionar un enlace
            if (window.innerWidth <= 768) {
                navLinks.classList.remove("show");
            }
        });
    });

    // Toggle del menú hamburguesa en móviles
    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("show");
    });
});
