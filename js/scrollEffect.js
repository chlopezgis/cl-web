document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".hidden-section");

    // Asegurar que las secciones no sean visibles al inicio
    sections.forEach(section => {
        section.style.visibility = "hidden";
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.visibility = "visible";
                entry.target.classList.add("show");
            } else {
                // 🔹 Si la sección deja de estar en pantalla, se vuelve a ocultar
                entry.target.style.visibility = "hidden";
                entry.target.classList.remove("show");
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => observer.observe(section));
});
