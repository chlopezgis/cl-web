/*----------------------------------------------------------------------------------------
    I. CREAR OBJETO MAPA (map)
----------------------------------------------------------------------------------------*/
// Objeto "map" centrado en Comas City
const map = L.map('map',{
    center:[-11.93095156127133,-77.05990109412085],
    zoom:16,
});

/*----------------------------------------------------------------------------------------
    2. AÑADIR CONTROLES
----------------------------------------------------------------------------------------*/
// Añadir controles para mapas base de OSM y CARTODB
const osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',{
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19,
    minZoom: 0
}).addTo(map); //Agregar el tile al objeto "map"

const cartoDB = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    minZoom: 0
}).addTo(map); //Agregar el tile al objeto "map"

let layerControl = L.control.layers({'CARTO':cartoDB,'OSM':osm}).addTo(map);

/*------------------------------------------------*/
//Añadir una capa GeoJSON como control y con Popup
/*------------------------------------------------*/
//Function para añadir un Popup
function popUp(feature, capa){
    capa.bindPopup(feature.properties.name + '<br/>Condominio ' + feature.properties.condominio);
};

//Simbologia para el geoJSON clasificado por un campo
function getColor(p){
    return  p=='Jacaranda' ? 'rgba(0, 230, 172, 0.8)':
            p=='Los Molles' ? 'rgba(255, 153, 102, 0.8)':
            p=='Las Magnolias' ? 'rgba(230, 153, 255, 0.8)':
            p=='Los Cerezos' ? 'rgba(0, 153, 153, 0.8)':
            p=='Los Laureles Etapa 4' ? 'rgba(153, 153, 255, 0.8)':
            p=='Los Laureles Etapa 3' ? 'rgba(255, 187, 51, 0.8)':
            p=='Los Laureles Etapa 2' ? 'rgba(163, 163, 194, 0.8)':
            p=='Los Laureles Etapa 1' ? 'rgba(255, 77, 77, 0.8)':
            'rgba(230, 230, 230, 0.8)'
};

function stylePolygon(feature){
    return {
        weight:0.8,                                         //Grosor de la línea
        color:'white',                                      //Color de la linea
        opacity: 1.0,                                       //Opacidad de la linea
        fillColor:getColor(feature.properties.condominio),  //Color de relleno clasificado por campo condominio
        fillOpacity:1.0                                     //Opacidad de releno
    };
};

//Cargar "geojson" con fetch API
rutaGjson='https://cors-anywhere.herokuapp.com/https://github.com/chlopezgis/cl-web/blob/main/maps/history/_datos/bloques.geojson'
fetch(rutaGjson,{})
    .then((response) => response.json())
    .then((json) => {
        //Añadir al control con popUp
        let layerGeoJSON = L.geoJSON(json,                //Variable con la capa GeoJSON
                                {onEachFeature:popUp,     //Con "onEachFeature" se añade el popUp
                                 style:stylePolygon       //Añadir estilo
                                }   
                            );    
        layerControl.addOverlay(layerGeoJSON,"Bloques");  //Añadir la capa al control con .addOverlay
        layerGeoJSON.addTo(map)                           //Añadir la capa al mapa
    })
    .catch((error) => {
        console.error("Ha ocurrido un error en la petición del servicio", error);
    });
