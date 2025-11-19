document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("novels.json");
        const novels = await response.json();
        const container = document.getElementById("card-carousel");

        novels.forEach(novel => {
            const card = document.createElement("div");
            card.className = "card";
            card.style.minWidth = "200px";
            card.style.width = "200px";
            card.style.height = "290px";
            card.style.objectFit = "cover";
            card.style.cursor = "pointer";

            card.onclick = () => {
                localStorage.setItem("lastOpenNovelId", novel.id);
                window.location.href = "reader.html";
            };

            card.innerHTML = `
        <img class="card-img" src="${novel.image}" alt="${novel.title}"/>
        <div class="card-info">
          <span class="card-title js-card-title" style="font-family: 'Ink'; font-size: 23px; margin:-10px;">${novel.arTitle}</span>
        </div>
      `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Failed to load novels:", error);
    }
});
