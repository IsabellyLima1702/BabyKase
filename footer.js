// footer.js

const footer = document.createElement("footer");

footer.className = "menu-inferior";

footer.innerHTML = `
    <nav class="navegacao">

        <a href="consultas.html" class="item-menu">
            <i data-lucide="stethoscope"></i>
            <span>Consultas</span>
        </a>

        <a href="vacinas.html" class="item-menu">
            <i data-lucide="syringe"></i>
            <span>Vacinas</span>
        </a>

        <a href="frutas.html" class="item-menu item-central">
            <div class="icone-central">
                <i data-lucide="baby"></i>
            </div>
            <span>Bebê</span>
        </a>

        <a href="artigo.html" class="item-menu">
            <i data-lucide="book-open"></i>
            <span>Conteúdos</span>
        </a>

         <a href="hospitais.html" class="item-menu">
            <i data-lucide="map-pinned"></i>
            <span>Hospitais</span>
        </a>

        <a href="painel.html" class="item-menu">
            <i data-lucide="user-round"></i>
            <span>Perfil</span>
        </a>

    </nav>
`;

document.body.appendChild(footer);

lucide.createIcons();