document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".hidden-section");

    // Asegura que las secciones tengan su espacio al inicio
    sections.forEach(section => {
        section.style.visibility = "hidden";
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.visibility = "visible"; // 🔹 Se muestra pero mantiene la animación
                entry.target.classList.add("show");
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => observer.observe(section));
});
