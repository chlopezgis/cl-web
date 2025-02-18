document.addEventListener("DOMContentLoaded", function () {
    var lon = -77.05871611946696;
    var lat = -11.931357083256126;
    var map = L.map('map', {
                    scrollWheelZoom: false, // Deshabilita el zoom para que no mezcle con el scroll
                    dragging: false // Desactiva el paneo
                }).setView([lat, lon], 15);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    var circle = L.circle([lat, lon], {
        color: 'Green',
        fillColor: '#63ac90',
        fillOpacity: 0.2,
        radius: 600
    }).addTo(map);

    // Habilitas el zoom cuando el usuario hace clic en el mapa
    map.on('click', function() {
        map.scrollWheelZoom.enable(); // Habilita el zoom
        map.dragging.enable(); // Habilita el paneo
    });
});
