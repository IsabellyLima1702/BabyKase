/* Interações exclusivas da página Desenvolvimento */

(() => {
  const toast = document.getElementById("toast");

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

  // Botão Voltar
  const backBtn = document.getElementById("backBtn");

  backBtn?.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "vacinas.html";
    }
  });

  // Botão de notificações
  document.getElementById("notificationBtn")?.addEventListener("click", () => {
    showToast("Confira os lembretes e as informações de saúde da criança.");
  });

  // Navegação do rodapé compartilhado.
  // Permite que o footer.js insira os botões dinamicamente.
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".nav-item[data-target]");

    if (!button) return;

    const target = (button.dataset.target || "").toLowerCase();
    const label = (button.textContent || "").toLowerCase();

    // Abrir a página Desenvolvimento
    if (
      ["meu-bebe", "desenvolvimento", "bebe", "baby"].includes(target) ||
      label.includes("desenvolvimento")
    ) {
      event.preventDefault();
      window.location.href = "desenvolvimento.html";
      return;
    }

    // Abrir a página Vacinas
    if (
      ["vacinas", "vaccines"].includes(target) ||
      label.includes("vacina")
    ) {
      event.preventDefault();
      window.location.href = "vacinas.html";
    }
  });
})();