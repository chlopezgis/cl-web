// Función para filtrar por categoría
function showCategory(category) {
    let projects = document.querySelectorAll('.project');
    let buttons = document.querySelectorAll('.tab-button');

    // Ocultar todos los proyectos
    projects.forEach(project => {
        project.classList.remove('show');
        if (project.classList.contains(category)) {
            project.classList.add('show'); // Solo muestra los de la categoría seleccionada
        }
    });

    // Marcar el botón activo
    buttons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`button[onclick="showCategory('${category}')"]`).classList.add('active');
}

// Mostrar la categoría "qgis" por defecto
document.addEventListener("DOMContentLoaded", () => {
    showCategory('qgis');
});