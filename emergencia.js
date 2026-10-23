
document.addEventListener("DOMContentLoaded", () => {
  // Evita criar o botão duas vezes na mesma página
  if (document.getElementById("botao-emergencia")) return;

  const emergencia = document.createElement("div");
  emergencia.id = "componente-emergencia";

  emergencia.innerHTML = `
    <button
      id="botao-emergencia"
      type="button"
      aria-haspopup="dialog"
      aria-controls="painel-emergencia"
      aria-expanded="false"
    >
      <span aria-hidden="true">♥</span>
      <span>Preciso de ajuda</span>
    </button>

    <section
      id="painel-emergencia"
      class="painel-emergencia"
      role="dialog"
      aria-modal="false"
      aria-labelledby="titulo-emergencia"
      hidden
    >
      <button
        type="button"
        id="fechar-emergencia"
        class="fechar-emergencia"
        aria-label="Fechar janela"
      >×</button>

      <h2 id="titulo-emergencia">Você não precisa passar por isso só</h2>
      <p>Escolha o tipo de ajuda de que precisa:</p>

      <a class="opcao-emergencia" href="tel:192">
        <strong>SAMU — 192</strong>
        <span>Emergência médica ou risco imediato à saúde.</span>
      </a>

      <a class="opcao-emergencia" href="tel:188">
        <strong>CVV — 188</strong>
        <span>Apoio emocional gratuito, 24 horas.</span>
      </a>

      <a
        class="opcao-emergencia"
        href="https://cvv.org.br/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <strong>Conversar online com o CVV</strong>
        <span>Acesse os canais de atendimento pela internet.</span>
      </a>

      <p class="aviso-emergencia">
        Se houver perigo imediato, procure um serviço de emergência
        ou peça ajuda a alguém de confiança que esteja por perto.
      </p>
    </section>
  `;

  document.body.appendChild(emergencia);

  const botao = document.getElementById("botao-emergencia");
  const painel = document.getElementById("painel-emergencia");
  const fechar = document.getElementById("fechar-emergencia");

  function fecharPainel() {
    painel.hidden = true;
    botao.setAttribute("aria-expanded", "false");
    botao.focus();
  }

  botao.addEventListener("click", () => {
    const vaiAbrir = painel.hidden;
    painel.hidden = !vaiAbrir;
    botao.setAttribute("aria-expanded", String(vaiAbrir));

    if (vaiAbrir) fechar.focus();
  });

  fechar.addEventListener("click", fecharPainel);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !painel.hidden) {
      fecharPainel();
    }
  });
});
