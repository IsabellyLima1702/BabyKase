const footer = document.createElement("footer");
footer.className = "menu-inferior";

footer.innerHTML = `
  <nav class="navegacao">
    <a href="medicoes.html" class="item-menu">
    <i data-lucide="chart-no-axes-combined"></i>
    <span>Medições</span>
    </a>

    <a href="vacinas.html#saude" class="item-menu">
      <i data-lucide="syringe"></i>
      <span>Saúde</span>
    </a>

    <a href="calendario.html" class="item-menu">
      <i data-lucide="calendar-days"></i>
      <span>Calendário</span>
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

    <a href="perfil.html" class="item-menu">
      <i data-lucide="user-round"></i>
      <span>Perfil</span>
    </a>
  </nav>
`;

document.body.appendChild(footer);

if (window.lucide) {
  window.lucide.createIcons();
} else {
  console.error("Biblioteca Lucide não foi carregada.");
}