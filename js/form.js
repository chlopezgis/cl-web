document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("contactForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Evita la recarga de la página

        var formData = new FormData(this);

        fetch("https://formspree.io/f/mvgzvdpn", { 
            method: "POST",
            body: formData,
            headers: { "Accept": "application/json" }
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("respuesta").innerText = "¡Mensaje enviado con éxito!";
            document.getElementById("contactForm").reset(); // Limpia el formulario
        })
        .catch(error => {
            document.getElementById("respuesta").innerText = "Error al enviar el mensaje.";
        });
    });
});
