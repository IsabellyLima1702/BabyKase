
const footer = document.createElement("footer");
footer.className = "menu-inferior";

footer.innerHTML = `
  <!-- Menu de opções do bebê -->
  <div class="menu-bebe" id="menuBebe">

    <a href="frutas.html" class="opcao-bebe">
      <i data-lucide="ruler"></i>
      <span>Tamanho do bebê</span>
      <i data-lucide="chevron-right" class="seta-menu"></i>
    </a>

    <a href="desen2.html" class="opcao-bebe">
      <i data-lucide="baby"></i>
      <span>Marco de desenvolvimento</span>
      <i data-lucide="chevron-right" class="seta-menu"></i>
    </a>

  </div>

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

    <!-- Botão central Bebê -->
    <button type="button" class="item-menu item-central" id="botaoBebe">

      <div class="icone-central">
        <i data-lucide="baby"></i>
      </div>

      <span>Bebê</span>

    </button>

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

// Elementos do menu
const botaoBebe = document.getElementById("botaoBebe");
const menuBebe = document.getElementById("menuBebe");

// Abrir e fechar o menu ao clicar no botão
botaoBebe.addEventListener("click", function (event) {
  event.stopPropagation();

  menuBebe.classList.toggle("ativo");
});

// Impedir que o clique dentro do menu feche ele
menuBebe.addEventListener("click", function (event) {
  event.stopPropagation();
});

// Fechar ao clicar fora do menu
document.addEventListener("click", function () {
  menuBebe.classList.remove("ativo");
});

// Fechar ao pressionar ESC
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    menuBebe.classList.remove("ativo");
  }
});

// Inicializar ícones Lucide
if (window.lucide) {
  window.lucide.createIcons();
} else {
  console.error("Biblioteca Lucide não foi carregada.");
}
