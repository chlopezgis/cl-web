document.addEventListener("DOMContentLoaded", function () {
    const skills = [
        { name: "QGIS", image: "img/logos/qgis-logo.png" },
        { name: "ArcGis Pro", image: "img/logos/ArcGIS-Pro-logo.png" },
        { name: "GDAL", image: "img/logos/gdal-logo.svg" },
        { name: "PostgreSQL", image: "img/logos/postgres-logo.png" },
        { name: "PostGIS", image: "img/logos/postgis-logo.png" },
        { name: "Python", image: "img/logos/python-logo.png"},
        { name: "Geosever", image: "img/logos/geoserver-logo.png" },
        { name: "HTML", image: "img/logos/html-logo.png" },
        { name: "CSS", image: "img/logos/CSS3-logo.png" },
        { name: "Javascript", image: "img/logos/javascript-logo.png" },
        { name: "Git", image: "img/logos/git-logo.png" },
        { name: "GitHub", image: "img/logos/github-logo.png" },
    ];

    const container = document.querySelector(".skills-container");

    skills.forEach(skill => {
        const skillCard = document.createElement("div");
        skillCard.classList.add("skill-card");
        skillCard.innerHTML = `
            <img src="${skill.image}" alt="${skill.name}">
            <div class="skill-name">${skill.name}</div>
        `;
        container.appendChild(skillCard);
    });
});